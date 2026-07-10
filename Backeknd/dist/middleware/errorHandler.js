"use strict";
/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a consistent JSON response.
 * EXTENSIBILITY: Add error reporting service integration (e.g., Sentry) here.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const config_1 = require("../config");
/**
 * Express error-handling middleware.
 * @param err - The error object
 * @param _req - Express request (unused)
 * @param res - Express response
 * @param _next - Express next function (unused but required for signature)
 */
function errorHandler(err, _req, res, _next) {
    // Log full error in development
    if (config_1.config.isDev) {
        console.error('Unhandled error:', err);
    }
    else {
        console.error('Unhandled error:', err.message);
    }
    res.status(500).json({
        error: 'Internal server error',
        message: config_1.config.isDev ? err.message : 'An unexpected error occurred.',
    });
}
//# sourceMappingURL=errorHandler.js.map