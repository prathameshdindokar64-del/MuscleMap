"use strict";
/**
 * Zod validation middleware factory.
 * Creates Express middleware that validates req.body or req.query against a Zod schema.
 * EXTENSIBILITY: auth.ts will go here for JWT middleware
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
const zod_1 = require("zod");
/**
 * Creates middleware that validates request body against a Zod schema.
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const details = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
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
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const details = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
                res.status(400).json({ error: 'Validation failed', details });
                return;
            }
            next(err);
        }
    };
}
//# sourceMappingURL=validateRequest.js.map