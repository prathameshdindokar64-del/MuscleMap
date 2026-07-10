"use strict";
/**
 * Risk level thresholds and rules.
 * Defines the constants used by the risk calculator to determine severity.
 * EXTENSIBILITY: These thresholds can be loaded from DB or config when AI tuning is added.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RED_FLAG_SHARP_REGIONS = exports.RED_FLAG_PAIN_TYPES = exports.MODERATE_DURATIONS = exports.PROLONGED_DURATIONS = exports.SHARP_PAIN_SEVERE_THRESHOLD = exports.MODERATE_INTENSITY = exports.SEVERE_INTENSITY = exports.RED_FLAG_INTENSITY = void 0;
/** Intensity threshold for red flag classification */
exports.RED_FLAG_INTENSITY = 9;
/** Intensity threshold for severe classification */
exports.SEVERE_INTENSITY = 7;
/** Intensity threshold for moderate classification */
exports.MODERATE_INTENSITY = 4;
/** Intensity threshold for sharp pain escalation to severe */
exports.SHARP_PAIN_SEVERE_THRESHOLD = 5;
/** Duration values considered prolonged */
exports.PROLONGED_DURATIONS = ['over_3_weeks'];
/** Duration values considered moderate */
exports.MODERATE_DURATIONS = ['4_7_days', '1_3_weeks'];
/** Pain types that are immediate red flags */
exports.RED_FLAG_PAIN_TYPES = ['numbness'];
/** Regions where sharp pain is a red flag */
exports.RED_FLAG_SHARP_REGIONS = ['chest'];
//# sourceMappingURL=riskRules.js.map