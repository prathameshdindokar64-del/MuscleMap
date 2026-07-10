import { Response } from 'express';
import { getDatabase } from '../db/database';
import { PainEntry, HistoryItem } from '../types';
import type { AuthRequest } from '../middleware/auth';

export const getHistoryHandler = (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const deviceId = req.query.deviceId as string;

  // If user is authenticated, return their history by userId
  // Otherwise fall back to deviceId
  const entries = req.userId
    ? (db.prepare(`SELECT * FROM pain_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`).all(req.userId) as PainEntry[])
    : (db.prepare(`SELECT * FROM pain_entries WHERE device_id = ? ORDER BY created_at DESC LIMIT 10`).all(deviceId) as PainEntry[]);

  const historyItems: HistoryItem[] = entries.map(entry => ({
    id: entry.id,
    timestamp: entry.created_at,
    region: entry.region,
    regionName: entry.region_name,
    intensity: entry.intensity,
    riskLevel: entry.risk_level as any,
    result: {
      regionName: entry.region_name,
      muscles: JSON.parse(entry.muscles),
      exercises: JSON.parse(entry.exercises),
      aiInsight: '',
      recoveryTips: [],
      riskLevel: entry.risk_level as any,
      warningText: entry.warning_text,
      disclaimerText: entry.disclaimer,
      acupressurePoints: [],
      generatedBy: 'rule-based-fallback',
    },
  }));

  return res.json(historyItems);
};
