/**
 * historySchema.ts
 * Validation schema for history and session queries.
 */
import { z } from 'zod';

export const historySchema = z.object({
  deviceId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const sessionParamSchema = z.object({
  id: z.string().min(1),
});

export const sessionQuerySchema = z.object({
  deviceId: z.string().optional(),
});
