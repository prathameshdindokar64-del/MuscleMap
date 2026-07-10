/**
 * Request logging middleware using Morgan.
 * Uses 'dev' format in development and 'combined' in production.
 */
/** Morgan request logger configured per environment */
export declare const requestLogger: (req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse<import("node:http").IncomingMessage>, callback: (err?: Error) => void) => void;
//# sourceMappingURL=requestLogger.d.ts.map