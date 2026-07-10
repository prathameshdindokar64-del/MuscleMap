"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.painSchema = void 0;
const zod_1 = require("zod");
exports.painSchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(1, 'Device ID is required'),
    region: zod_1.z.string().min(1, 'Region is required'),
    painType: zod_1.z.enum(['dull', 'sharp', 'stiffness', 'burning', 'numbness']),
    duration: zod_1.z.enum(['under_24h', '1_3_days', '4_7_days', '1_3_weeks', 'over_3_weeks']),
    intensity: zod_1.z.number().int().min(0).max(10),
    stressLevel: zod_1.z.enum(['low', 'moderate', 'high']).optional(),
    trigger: zod_1.z.enum(['gym', 'long_sitting', 'injury', 'unknown']).optional()
});
//# sourceMappingURL=painSchema.js.map