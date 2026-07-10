/**
 * Centralized configuration module.
 * All environment variables are accessed ONLY through this file.
 * No other file should reference process.env directly.
 * EXTENSIBILITY: Add new env vars here as features are added (e.g., JWT_SECRET, OPENAI_API_KEY).
 */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
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

  // EXTENSIBILITY: DATABASE_URL will be added here when migrating to PostgreSQL
} as const;

// ── AI / Auth flat exports (used by middleware and logic files) ──────
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
