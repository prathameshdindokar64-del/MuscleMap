import { z } from 'zod';

export const painSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  region: z.string().min(1, 'Region is required'),
  painType: z.enum(['dull', 'sharp', 'stiffness', 'burning', 'numbness']),
  duration: z.enum(['under_24h', '1_3_days', '4_7_days', '1_3_weeks', 'over_3_weeks']),
  intensity: z.number().int().min(0).max(10),
  stressLevel: z.enum(['low', 'moderate', 'high']).optional(),
  trigger: z.enum(['gym', 'long_sitting', 'injury', 'unknown']).optional()
});
