/**
 * Database schema definitions.
 * Creates all tables with CREATE TABLE IF NOT EXISTS so it's safe to run on every server start.
 * EXTENSIBILITY: Add new tables here as features are added (e.g., users, sessions, uploads).
 */
import Database from 'better-sqlite3';
/**
 * Runs all CREATE TABLE statements on the database.
 * @param {Database.Database} db - The SQLite database instance
 */
export declare function runSchema(db: Database.Database): void;
//# sourceMappingURL=schema.d.ts.map