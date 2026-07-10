/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a consistent JSON response.
 * EXTENSIBILITY: Add error reporting service integration (e.g., Sentry) here.
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Express error-handling middleware.
 * @param err - The error object
 * @param _req - Express request (unused)
 * @param res - Express response
 * @param _next - Express next function (unused but required for signature)
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log full error in development
  if (config.isDev) {
    console.error('Unhandled error:', err);
  } else {
    console.error('Unhandled error:', err.message);
  }

  res.status(500).json({
    error: 'Internal server error',
    message: config.isDev ? err.message : 'An unexpected error occurred.',
  });
}
