/**
 * Zod validation middleware factory.
 * Creates Express middleware that validates req.body or req.query against a Zod schema.
 * EXTENSIBILITY: auth.ts will go here for JWT middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Creates middleware that validates request body against a Zod schema.
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const issues = (err as any).issues || (err as any).errors || [];
        const details = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({ error: 'Validation failed', details });
        return;
      }
      next(err);
    }
  };
}

/**
 * Creates middleware that validates request query against a Zod schema.
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query) as Record<string, string>;
      for (const key in req.query) delete req.query[key];
      Object.assign(req.query, parsed);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const issues = (err as any).issues || (err as any).errors || [];
        const details = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({ error: 'Validation failed', details });
        return;
      }
      next(err);
    }
  };
}
