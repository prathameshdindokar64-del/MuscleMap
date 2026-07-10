"use strict";
/**
 * Centralized configuration module.
 * All environment variables are accessed ONLY through this file.
 * No other file should reference process.env directly.
 * EXTENSIBILITY: Add new env vars here as features are added (e.g., JWT_SECRET, OPENAI_API_KEY).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    /** Server port number */
    port: parseInt(process.env.PORT || '4000', 10),
    /** Path to the SQLite database file */
    dbPath: process.env.DB_PATH || './musclemap.sqlite',
    /** Allowed CORS origin for the frontend */
    allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    /** Current environment (development / production / test) */
    nodeEnv: process.env.NODE_ENV || 'development',
    /** Whether the app is running in development mode */
    isDev: (process.env.NODE_ENV || 'development') === 'development',
    // EXTENSIBILITY: JWT_SECRET will be added here when auth is implemented
    // EXTENSIBILITY: OPENAI_API_KEY will be added here when AI analysis is implemented
    // EXTENSIBILITY: DATABASE_URL will be added here when migrating to PostgreSQL
};
//# sourceMappingURL=config.js.map