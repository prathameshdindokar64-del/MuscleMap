import { z } from 'zod';
export declare const painSchema: z.ZodObject<{
    deviceId: z.ZodString;
    region: z.ZodString;
    painType: z.ZodEnum<{
        dull: "dull";
        sharp: "sharp";
        stiffness: "stiffness";
        burning: "burning";
        numbness: "numbness";
    }>;
    duration: z.ZodEnum<{
        under_24h: "under_24h";
        "1_3_days": "1_3_days";
        "4_7_days": "4_7_days";
        "1_3_weeks": "1_3_weeks";
        over_3_weeks: "over_3_weeks";
    }>;
    intensity: z.ZodNumber;
    stressLevel: z.ZodOptional<z.ZodEnum<{
        moderate: "moderate";
        low: "low";
        high: "high";
    }>>;
    trigger: z.ZodOptional<z.ZodEnum<{
        gym: "gym";
        long_sitting: "long_sitting";
        injury: "injury";
        unknown: "unknown";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=painSchema.d.ts.map