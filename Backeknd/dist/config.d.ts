/**
 * Centralized configuration module.
 * All environment variables are accessed ONLY through this file.
 * No other file should reference process.env directly.
 * EXTENSIBILITY: Add new env vars here as features are added (e.g., JWT_SECRET, OPENAI_API_KEY).
 */
export declare const config: {
    /** Server port number */
    readonly port: number;
    /** Path to the SQLite database file */
    readonly dbPath: string;
    /** Allowed CORS origin for the frontend */
    readonly allowedOrigin: string;
    /** Current environment (development / production / test) */
    readonly nodeEnv: string;
    /** Whether the app is running in development mode */
    readonly isDev: boolean;
};
//# sourceMappingURL=config.d.ts.map