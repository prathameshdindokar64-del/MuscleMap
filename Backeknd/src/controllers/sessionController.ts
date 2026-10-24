/**
 * sessionController.ts
 * Handles GET /api/sessions/:id and DELETE /api/sessions/:id.
 * Validates ownership by deviceId or userId to prevent session leakage.
 */

import { Response } from 'express';
import { getDatabase } from '../db/database';
import { PainEntry, SessionResponse, RiskLevel, AnalyzeOutput } from '../types';
import type { AuthRequest } from '../middleware/auth';
import { translateAssessmentToHindi } from '../logic/hindiTranslator';

/**
 * GET /api/sessions/:id?deviceId=
 * Fetches complete details of a specific assessment session.
 */
export const getSessionById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deviceId = req.query.deviceId as string | undefined;
  const userId = req.userId;
  const db = getDatabase();

  const entry = db.prepare('SELECT * FROM pain_entries WHERE id = ?').get(id) as PainEntry | undefined;

  if (!entry) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Security check: must belong to the requesting user or device
  const isOwner = (userId && entry.user_id === userId) || (deviceId && entry.device_id === deviceId);
  if (!isOwner) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const enResult: AnalyzeOutput = {
    sessionId: entry.id,
    createdAt: entry.created_at,
    regionName: entry.region_name,
    muscles: JSON.parse(entry.muscles || '[]'),
    exercises: JSON.parse(entry.exercises || '[]'),
    aiInsight: entry.ai_insight || '',
    recoveryTips: entry.recovery_tips ? JSON.parse(entry.recovery_tips) : [],
    riskLevel: entry.risk_level as RiskLevel,
    redFlagReasons: entry.red_flag_reasons ? JSON.parse(entry.red_flag_reasons) : [],
    riskSource: (entry.risk_source as any) || 'rules',
    mlConfidence: entry.ml_confidence || 0,
    warningText: entry.warning_text,
    disclaimerText: entry.disclaimer,
    acupressurePoints: entry.acupressure_points ? JSON.parse(entry.acupressure_points) : [],
    generatedBy: 'history',
  };

  let hiResult: AnalyzeOutput | undefined;
  if (entry.result_hindi) {
    try {
      hiResult = JSON.parse(entry.result_hindi);
    } catch {
      // ignore
    }
  }
  if (!hiResult) {
    try {
      hiResult = await translateAssessmentToHindi(enResult);
    } catch {
      // fallback
    }
  }

  enResult.resultHindi = hiResult;

  const session: SessionResponse = {
    id: entry.id,
    timestamp: entry.created_at,
    region: entry.region,
    regionName: entry.region_name,
    inputs: {
      deviceId: entry.device_id,
      region: entry.region,
      painType: entry.pain_type as any,
      duration: entry.duration as any,
      intensity: entry.intensity,
      stressLevel: (entry.stress_level as any) || undefined,
      trigger: (entry.trigger_type as any) || undefined,
      onset: (entry.onset as any) || undefined,
      radiating: entry.radiating != null ? Boolean(entry.radiating) : undefined,
      numbnessOrWeakness: entry.numbness_or_weakness != null ? Boolean(entry.numbness_or_weakness) : undefined,
      nightPain: entry.night_pain != null ? Boolean(entry.night_pain) : undefined,
      fever: entry.fever != null ? Boolean(entry.fever) : undefined,
      bladderBowelChanges: entry.bladder_bowel_changes != null ? Boolean(entry.bladder_bowel_changes) : undefined,
      previousEpisodes: (entry.previous_episodes as any) || undefined,
      aggravatedBy: entry.aggravated_by ? JSON.parse(entry.aggravated_by) : undefined,
      dailySittingHours: entry.daily_sitting_hours != null ? entry.daily_sitting_hours : undefined,
      sleepQuality: (entry.sleep_quality as any) || undefined,
    },
    result: enResult,
    resultHindi: hiResult,
  };

  return res.json(session);
};

/**
 * DELETE /api/sessions/:id?deviceId=
 * Deletes a session if owned by deviceId or userId.
 */
export const deleteSessionById = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deviceId = req.query.deviceId as string | undefined;
  const userId = req.userId;
  const db = getDatabase();

  const entry = db.prepare('SELECT * FROM pain_entries WHERE id = ?').get(id) as PainEntry | undefined;

  if (!entry) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const isOwner = (userId && entry.user_id === userId) || (deviceId && entry.device_id === deviceId);
  if (!isOwner) {
    return res.status(404).json({ error: 'Session not found' });
  }

  db.prepare('DELETE FROM pain_entries WHERE id = ?').run(id);

  return res.json({ success: true, message: 'Session deleted successfully' });
};
