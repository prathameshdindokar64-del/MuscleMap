/**
 * Risk level thresholds and rules.
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
