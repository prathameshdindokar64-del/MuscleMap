"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRisk = calculateRisk;
const riskRules_1 = require("../constants/riskRules");
function calculateRisk(input) {
    // Rule 1: Red flag — check first, highest priority
    if (riskRules_1.RED_FLAG_PAIN_TYPES.includes(input.painType) ||
        input.intensity >= riskRules_1.RED_FLAG_INTENSITY ||
        (riskRules_1.RED_FLAG_SHARP_REGIONS.includes(input.region) && input.painType === 'sharp') ||
        (riskRules_1.PROLONGED_DURATIONS.includes(input.duration) && input.intensity >= riskRules_1.SEVERE_INTENSITY)) {
        return 'red_flag';
    }
    // Rule 2: Severe
    if (input.intensity >= riskRules_1.SEVERE_INTENSITY ||
        riskRules_1.PROLONGED_DURATIONS.includes(input.duration) ||
        (input.painType === 'sharp' && input.intensity >= riskRules_1.SHARP_PAIN_SEVERE_THRESHOLD)) {
        return 'severe';
    }
    // Rule 3: Moderate
    if (input.intensity >= riskRules_1.MODERATE_INTENSITY ||
        input.duration === '4_7_days' ||
        input.duration === '1_3_weeks' ||
        input.painType === 'burning') {
        return 'moderate';
    }
    // Rule 4: Mild — default
    return 'mild';
}
//# sourceMappingURL=riskCalculator.js.map