/**
 * painSchema.ts
 * Zod validation schema for POST /api/analyze-pain.
 * All new fields are optional so existing clients remain backward-compatible.
 */
import { z } from 'zod';

export const painSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  region: z.string().min(1, 'Region is required'),
  painType: z.enum(['dull', 'sharp', 'stiffness', 'burning', 'numbness']),
  duration: z.enum(['under_24h', '1_3_days', '4_7_days', '1_3_weeks', 'over_3_weeks']),
  intensity: z.number().int().min(0).max(10),
  stressLevel: z.enum(['low', 'moderate', 'high']).optional(),
  trigger: z.enum(['gym', 'long_sitting', 'injury', 'unknown']).optional(),

  // ── v2 extended questionnaire fields (all optional) ───────────────
  onset: z.enum(['sudden', 'gradual']).optional(),
  radiating: z.boolean().optional(),
  numbnessOrWeakness: z.boolean().optional(),
  nightPain: z.boolean().optional(),
  fever: z.boolean().optional(),
  bladderBowelChanges: z.boolean().optional(),
  previousEpisodes: z.enum(['none', 'once', 'recurring']).optional(),
  aggravatedBy: z.array(
    z.enum(['bending', 'twisting', 'walking', 'lifting', 'sitting', 'lying_down'])
  ).optional(),
  dailySittingHours: z.number().int().min(0).max(16).optional(),
  sleepQuality: z.enum(['good', 'fair', 'poor']).optional(),
});
