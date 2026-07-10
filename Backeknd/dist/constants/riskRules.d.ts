/**
 * Risk level thresholds and rules.
 * Defines the constants used by the risk calculator to determine severity.
 * EXTENSIBILITY: These thresholds can be loaded from DB or config when AI tuning is added.
 */
/** Intensity threshold for red flag classification */
export declare const RED_FLAG_INTENSITY = 9;
/** Intensity threshold for severe classification */
export declare const SEVERE_INTENSITY = 7;
/** Intensity threshold for moderate classification */
export declare const MODERATE_INTENSITY = 4;
/** Intensity threshold for sharp pain escalation to severe */
export declare const SHARP_PAIN_SEVERE_THRESHOLD = 5;
/** Duration values considered prolonged */
export declare const PROLONGED_DURATIONS: readonly ["over_3_weeks"];
/** Duration values considered moderate */
export declare const MODERATE_DURATIONS: readonly ["4_7_days", "1_3_weeks"];
/** Pain types that are immediate red flags */
export declare const RED_FLAG_PAIN_TYPES: readonly ["numbness"];
/** Regions where sharp pain is a red flag */
export declare const RED_FLAG_SHARP_REGIONS: readonly ["chest"];
//# sourceMappingURL=riskRules.d.ts.map