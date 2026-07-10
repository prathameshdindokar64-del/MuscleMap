import { Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { analyzeWithGemini } from '../logic/geminiAnalyzer';
import { REGION_NAMES } from '../constants/regions';
import { v4 as uuidv4 } from 'uuid';
import type { AuthRequest } from '../middleware/auth';

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

  // Save to db
  const id = uuidv4();
  const insertQuery = `
    INSERT INTO pain_entries (
      id, device_id, region, region_name, pain_type, duration, intensity,
      stress_level, trigger_type, muscles, exercises, risk_level,
      warning_text, disclaimer, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  );

  return res.json(output);
};
