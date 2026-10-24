/**
 * painAnalyzer.ts
 * Legacy rule-based analysis orchestrator (kept for reference/direct import).
 * The active code path now uses geminiAnalyzer.ts.
 * EXTENSIBILITY: This is the single entry point — swap internals without changing the API contract.
 */
import Database from 'better-sqlite3';
import { AnalyzeInput, AnalyzeOutput, AcupressureResponse } from '../types';
import { REGION_MUSCLES, REGION_NAMES } from '../constants/regions';
import { calculateRisk } from './riskCalculator';
import { selectExercises } from './exerciseSelector';
import { WARNING_TEXT, DISCLAIMER_TEXT } from '../constants/messages';
import { ACUPRESSURE_POINTS } from '../constants/acupressure';

export function analyzePain(input: AnalyzeInput, db: Database.Database): AnalyzeOutput {
  const regionName = REGION_NAMES[input.region] || input.region;
  const muscles = REGION_MUSCLES[input.region] ?? ['See a professional for assessment'];

  const riskResult = calculateRisk(input);
  const exercises = selectExercises(input.region, input.painType, db);

  let acupressurePoints: AcupressureResponse[] = [];
  try {
    const rows = db.prepare(
      'SELECT name, location, how_to FROM acupressure_points WHERE region_id = ?'
    ).all(input.region) as { name: string; location: string; how_to: string }[];
    if (rows && rows.length > 0) {
      acupressurePoints = rows.map((r) => ({
        name: r.name,
        location: r.location,
        howTo: r.how_to,
      }));
    }
  } catch {
    // fallback if table not yet migrated
  }

  if (acupressurePoints.length === 0) {
    acupressurePoints = (ACUPRESSURE_POINTS[input.region] ?? []).map((p) => ({
      name: p.name,
      location: p.description,
      howTo: p.technique,
    }));
  }

  const warningText = WARNING_TEXT[riskResult.riskLevel];
  const disclaimerText = DISCLAIMER_TEXT;

  return {
    sessionId: '',
    createdAt: new Date().toISOString(),
    regionName,
    muscles,
    exercises,
    aiInsight: `Based on your ${input.painType} pain in the ${regionName} region lasting ${input.duration.replace(/_/g, ' ')}, we recommend the following self-care exercises.`,
    recoveryTips: [
      'Apply ice for 15 minutes if the area feels inflamed',
      'Avoid movements that worsen the pain',
      'Rest the affected area between exercise sessions',
    ],
    riskLevel: riskResult.riskLevel,
    redFlagReasons: riskResult.redFlagReasons,
    riskSource: 'rules',
    mlConfidence: 0,
    warningText,
    disclaimerText,
    acupressurePoints,
    generatedBy: 'rule-based-fallback',
  };
}
