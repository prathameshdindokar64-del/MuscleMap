"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePain = analyzePain;
const regions_1 = require("../constants/regions");
const riskCalculator_1 = require("./riskCalculator");
const exerciseSelector_1 = require("./exerciseSelector");
const messages_1 = require("../constants/messages");
function analyzePain(input, db) {
    const regionName = regions_1.REGION_NAMES[input.region] || input.region;
    const muscles = regions_1.REGION_MUSCLES[input.region] ?? ['See a professional for assessment'];
    const riskLevel = (0, riskCalculator_1.calculateRisk)(input);
    const exercises = (0, exerciseSelector_1.selectExercises)(input.region, input.painType, db);
    const warningText = messages_1.WARNING_TEXT[riskLevel];
    const disclaimerText = messages_1.DISCLAIMER_TEXT;
    return {
        regionName,
        muscles,
        exercises,
        riskLevel,
        warningText,
        disclaimerText
    };
}
//# sourceMappingURL=painAnalyzer.js.map