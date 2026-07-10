/**
 * Zod validation middleware factory.
 * Creates Express middleware that validates req.body or req.query against a Zod schema.
 * EXTENSIBILITY: auth.ts will go here for JWT middleware
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Creates middleware that validates request body against a Zod schema.
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export declare function validateBody(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Creates middleware that validates request query against a Zod schema.
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export declare function validateQuery(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validateRequest.d.ts.map