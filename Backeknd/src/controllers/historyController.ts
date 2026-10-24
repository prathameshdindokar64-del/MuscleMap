import { Response } from 'express';
import { getDatabase } from '../db/database';
import { PainEntry, HistoryItem, RiskLevel, AnalyzeOutput } from '../types';
import type { AuthRequest } from '../middleware/auth';
import { translateAssessmentToHindi } from '../logic/hindiTranslator';

export const getHistoryHandler = async (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const deviceId = req.query.deviceId as string | undefined;
  const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 20, 1), 100);
  const offset = Math.max(parseInt(req.query.offset as string, 10) || 0, 0);

  let entries: PainEntry[] = [];
  let total = 0;

  if (req.userId) {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM pain_entries WHERE user_id = ?').get(req.userId) as { count: number };
    total = countRow ? countRow.count : 0;
    entries = db.prepare('SELECT * FROM pain_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(req.userId, limit, offset) as PainEntry[];
  } else if (deviceId) {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM pain_entries WHERE device_id = ?').get(deviceId) as { count: number };
    total = countRow ? countRow.count : 0;
    entries = db.prepare('SELECT * FROM pain_entries WHERE device_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(deviceId, limit, offset) as PainEntry[];
  }

  res.setHeader('X-Total-Count', total.toString());

  const historyItems: HistoryItem[] = await Promise.all(
    entries.map(async (entry) => {
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
          // ignore error
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

      return {
        id: entry.id,
        timestamp: entry.created_at,
        region: entry.region,
        regionName: entry.region_name,
        intensity: entry.intensity,
        riskLevel: entry.risk_level as RiskLevel,
        result: enResult,
        resultHindi: hiResult,
      };
    })
  );

  return res.json(historyItems);
};
