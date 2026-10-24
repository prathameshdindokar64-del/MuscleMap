/**
 * riskRules.ts
 * Risk level thresholds, red-flag triggers, and moderate-risk boosters.
 * Defines the constants used by the risk calculator to determine severity.
 * EXTENSIBILITY: These thresholds can be loaded from DB or config when AI tuning is added.
 */

/** Intensity threshold for red flag classification */
export const RED_FLAG_INTENSITY = 9;

/** Intensity threshold for severe classification */
export const SEVERE_INTENSITY = 7;

/** Intensity threshold for moderate classification */
export const MODERATE_INTENSITY = 4;

/** Intensity threshold for sharp pain escalation to severe */
export const SHARP_PAIN_SEVERE_THRESHOLD = 5;

/** Duration values considered prolonged */
export const PROLONGED_DURATIONS = ['over_3_weeks'] as const;

/** Duration values considered moderate */
export const MODERATE_DURATIONS = ['4_7_days', '1_3_weeks'] as const;

/** Pain types that are immediate red flags */
export const RED_FLAG_PAIN_TYPES = ['numbness'] as const;

/** Regions where sharp pain is a red flag */
export const RED_FLAG_SHARP_REGIONS = ['chest'] as const;

// ─── v2 Red-Flag Triggers ───────────────────────────────────────────

/** Night pain above this intensity triggers a red flag */
export const NIGHT_PAIN_RED_FLAG_INTENSITY = 6;

/** Regions where fever combined with pain triggers a red flag */
export const FEVER_RED_FLAG_REGIONS = [
  'neck', 'lower_back', 'upper_back',
] as const;

// ─── v2 Moderate-Risk Boosters ──────────────────────────────────────

/** Daily sitting hours above this threshold boost risk for back/neck/hip */
export const HIGH_SITTING_HOURS_THRESHOLD = 8;

/** Regions where prolonged sitting boosts risk */
export const SITTING_RISK_REGIONS = [
  'neck', 'lower_back', 'upper_back',
  'left_hip', 'right_hip',
] as const;
