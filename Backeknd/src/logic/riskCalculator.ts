/**
 * riskCalculator.ts
 * Calculates risk level and red-flag reasons from pain inputs.
 * Uses a structured rule map — no long if/else chains.
 * Returns both the risk level and human-readable reasons for any red flags.
 * EXTENSIBILITY: Replace this function with an AI API call when ready.
 */
import { RiskInput, RiskLevel } from '../types';
import {
  RED_FLAG_INTENSITY,
  SEVERE_INTENSITY,
  MODERATE_INTENSITY,
  SHARP_PAIN_SEVERE_THRESHOLD,
  PROLONGED_DURATIONS,
  RED_FLAG_PAIN_TYPES,
  RED_FLAG_SHARP_REGIONS,
  NIGHT_PAIN_RED_FLAG_INTENSITY,
  FEVER_RED_FLAG_REGIONS,
  HIGH_SITTING_HOURS_THRESHOLD,
  SITTING_RISK_REGIONS,
} from '../constants/riskRules';

/** Ordered risk levels from lowest to highest severity */
const RISK_ORDER: RiskLevel[] = ['mild', 'moderate', 'severe', 'red_flag'];

/** Returns the higher of two risk levels */
function raiseRisk(current: RiskLevel, candidate: RiskLevel): RiskLevel {
  const currentIdx = RISK_ORDER.indexOf(current);
  const candidateIdx = RISK_ORDER.indexOf(candidate);
  return candidateIdx > currentIdx ? candidate : current;
}

export interface RiskResult {
  riskLevel: RiskLevel;
  redFlagReasons: string[];
}

/**
 * Structured red-flag rule map.
 * Each entry checks a condition and returns a human-readable reason.
 */
type RedFlagRule = {
  check: (input: RiskInput) => boolean;
  reason: string;
};

const RED_FLAG_RULES: RedFlagRule[] = [
  {
    check: (i) => i.bladderBowelChanges === true,
    reason: 'Bladder or bowel changes reported — seek immediate medical attention.',
  },
  {
    check: (i) => i.numbnessOrWeakness === true,
    reason: 'Numbness or weakness reported — this may indicate nerve involvement.',
  },
  {
    check: (i) =>
      i.fever === true &&
      FEVER_RED_FLAG_REGIONS.includes(i.region as any),
    reason: 'Fever combined with back or neck pain — infection must be ruled out.',
  },
  {
    check: (i) =>
      i.nightPain === true &&
      i.intensity >= NIGHT_PAIN_RED_FLAG_INTENSITY,
    reason: 'Significant night pain (waking from sleep) at high intensity.',
  },
  {
    check: (i) => RED_FLAG_PAIN_TYPES.includes(i.painType as any),
    reason: 'Pain type (numbness) is a red-flag indicator.',
  },
  {
    check: (i) => i.intensity >= RED_FLAG_INTENSITY,
    reason: `Pain intensity of ${RED_FLAG_INTENSITY}+ out of 10 is a red-flag level.`,
  },
  {
    check: (i) =>
      RED_FLAG_SHARP_REGIONS.includes(i.region as any) &&
      i.painType === 'sharp',
    reason: 'Sharp pain in the chest region — cardiac causes should be excluded.',
  },
  {
    check: (i) =>
      PROLONGED_DURATIONS.includes(i.duration as any) &&
      i.intensity >= SEVERE_INTENSITY,
    reason: 'Prolonged duration (over 3 weeks) combined with high intensity.',
  },
];

export function calculateRisk(input: RiskInput): RiskResult {
  const redFlagReasons: string[] = [];
  let riskLevel: RiskLevel = 'mild';

  // ── Phase 1: Check red-flag rules ─────────────────────────────────
  for (const rule of RED_FLAG_RULES) {
    if (rule.check(input)) {
      redFlagReasons.push(rule.reason);
    }
  }

  if (redFlagReasons.length > 0) {
    riskLevel = 'red_flag';
    return { riskLevel, redFlagReasons };
  }

  // ── Phase 2: Severe ───────────────────────────────────────────────
  if (
    input.intensity >= SEVERE_INTENSITY ||
    PROLONGED_DURATIONS.includes(input.duration as any) ||
    (input.painType === 'sharp' && input.intensity >= SHARP_PAIN_SEVERE_THRESHOLD)
  ) {
    riskLevel = 'severe';
  }

  // ── Phase 3: Moderate ─────────────────────────────────────────────
  if (riskLevel === 'mild') {
    if (
      input.intensity >= MODERATE_INTENSITY ||
      input.duration === '4_7_days' ||
      input.duration === '1_3_weeks' ||
      input.painType === 'burning'
    ) {
      riskLevel = 'moderate';
    }
  }

  // ── Phase 4: v2 moderate-risk boosters ────────────────────────────
  // Radiating pain boosts toward moderate
  if (input.radiating === true) {
    riskLevel = raiseRisk(riskLevel, 'moderate');
  }

  // Recurring episodes boost toward moderate
  if (input.previousEpisodes === 'recurring') {
    riskLevel = raiseRisk(riskLevel, 'moderate');
  }

  // Prolonged sitting with vulnerable regions boosts toward moderate
  if (
    input.dailySittingHours !== undefined &&
    input.dailySittingHours >= HIGH_SITTING_HOURS_THRESHOLD &&
    SITTING_RISK_REGIONS.includes(input.region as any)
  ) {
    riskLevel = raiseRisk(riskLevel, 'moderate');
  }

  return { riskLevel, redFlagReasons };
}
