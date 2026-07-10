/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a consistent JSON response.
 * EXTENSIBILITY: Add error reporting service integration (e.g., Sentry) here.
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Express error-handling middleware.
 * @param err - The error object
 * @param _req - Express request (unused)
 * @param res - Express response
 * @param _next - Express next function (unused but required for signature)
 */
export declare function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=errorHandler.d.ts.map