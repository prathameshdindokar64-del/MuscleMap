/**
 * painController.ts
 * Handles POST /api/analyze-pain.
 * v2: Returns sessionId, createdAt, redFlagReasons, riskSource, mlConfidence,
 *     enriched exercises, and DB-sourced acupressure points.
 */

import { Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { analyzeWithGemini } from '../logic/geminiAnalyzer';
import { REGION_NAMES } from '../constants/regions';
import { v4 as uuidv4 } from 'uuid';
import type { AuthRequest } from '../middleware/auth';
import type { AcupressureRow, AcupressureResponse, RiskSource } from '../types';
import { callMLService } from '../logic/mlClient';
import { translateAssessmentToHindi } from '../logic/hindiTranslator';

/** Risk severity ordering for the ML-can-only-raise-risk safety rule */
const RISK_ORDER = ['mild', 'moderate', 'severe', 'red_flag'] as const;

function riskIndex(level: string): number {
  return RISK_ORDER.indexOf(level as any);
}

export const analyzePainHandler = async (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const input = req.body;

  // Check if region exists
  const regionRow = db.prepare('SELECT id FROM regions WHERE id = ? OR name = ?').get(input.region, input.region) as { id: string } | undefined;
  if (!regionRow) {
    return res.status(404).json({ error: 'Region not found' });
  }
  input.region = regionRow.id; // Normalize to ID

  const regionName = REGION_NAMES[input.region] || input.region;

  // Analyze with Gemini (falls back to rule-based if unavailable)
  const output = await analyzeWithGemini(input, regionName, db);

  // ── v2: ML integration (can only raise risk, never lower) ─────────
  let riskSource: RiskSource = 'rules';
  let mlConfidence = 0.0;
  let finalRiskLevel = output.riskLevel;

  try {
    const mlResult = await callMLService(input);
    if (mlResult) {
      mlConfidence = mlResult.confidence;
      const mlRiskIdx = riskIndex(mlResult.riskLevel);
      const rulesRiskIdx = riskIndex(output.riskLevel);

      if (mlRiskIdx > rulesRiskIdx) {
        // ML raises the risk
        finalRiskLevel = mlResult.riskLevel as any;
        riskSource = 'ml';
      } else if (mlRiskIdx < rulesRiskIdx) {
        // ML suggested lower — rules win (safety rule)
        riskSource = 'rules_override';
      } else {
        // Both ML and Rules agree (ML validates rules with confidence score)
        riskSource = 'ml';
      }
    }
  } catch {
    // ML service unavailable — silently fall back to rules only
  }

  output.riskLevel = finalRiskLevel;
  output.riskSource = riskSource;
  output.mlConfidence = mlConfidence;

  // ── v2: Fetch acupressure points from DB ──────────────────────────
  const acuRows = db.prepare(
    'SELECT name, location, how_to FROM acupressure_points WHERE region_id = ?'
  ).all(input.region) as AcupressureRow[];

  const acupressurePoints: AcupressureResponse[] = acuRows.map((row) => ({
    name: row.name,
    location: row.location,
    howTo: row.how_to,
  }));

  output.acupressurePoints = acupressurePoints;

  // ── Session ID & CreatedAt ────────────────────────────────────────
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  output.sessionId = id;
  output.createdAt = createdAt;

  // ── Generate localized Hindi result (Bilingual Support) ───────────
  let hindiOutput: any = null;
  try {
    hindiOutput = await translateAssessmentToHindi(output);
  } catch (err) {
    console.warn('[Hindi Translator] Fallback translation error:', err);
  }
  output.resultHindi = hindiOutput || undefined;

  // ── Save to DB with v2 & bilingual fields ─────────────────────────
  const insertQuery = `
    INSERT INTO pain_entries (
      id, device_id, region, region_name, pain_type, duration, intensity,
      stress_level, trigger_type, muscles, exercises, risk_level,
      warning_text, disclaimer, user_id,
      onset, radiating, numbness_or_weakness, night_pain, fever,
      bladder_bowel_changes, previous_episodes, aggravated_by,
      daily_sitting_hours, sleep_quality,
      red_flag_reasons, risk_source, ml_confidence,
      ai_insight, recovery_tips, acupressure_points, result_hindi, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.prepare(insertQuery).run(
    id,
    input.deviceId,
    input.region,
    output.regionName,
    input.painType,
    input.duration,
    input.intensity,
    input.stressLevel || null,
    input.trigger || null,
    JSON.stringify(output.muscles),
    JSON.stringify(output.exercises),
    output.riskLevel,
    output.warningText,
    output.disclaimerText,
    req.userId || null,
    // v2 input fields
    input.onset || null,
    input.radiating != null ? (input.radiating ? 1 : 0) : null,
    input.numbnessOrWeakness != null ? (input.numbnessOrWeakness ? 1 : 0) : null,
    input.nightPain != null ? (input.nightPain ? 1 : 0) : null,
    input.fever != null ? (input.fever ? 1 : 0) : null,
    input.bladderBowelChanges != null ? (input.bladderBowelChanges ? 1 : 0) : null,
    input.previousEpisodes || null,
    input.aggravatedBy ? JSON.stringify(input.aggravatedBy) : null,
    input.dailySittingHours ?? null,
    input.sleepQuality || null,
    // v2 result fields
    JSON.stringify(output.redFlagReasons),
    output.riskSource,
    output.mlConfidence,
    output.aiInsight || null,
    JSON.stringify(output.recoveryTips),
    JSON.stringify(acupressurePoints),
    hindiOutput ? JSON.stringify(hindiOutput) : null,
    createdAt,
  );

  return res.json(output);
};
