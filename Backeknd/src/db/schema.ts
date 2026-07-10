/**
 * Database schema definitions.
 * Creates all tables with CREATE TABLE IF NOT EXISTS so it's safe to run on every server start.
 * EXTENSIBILITY: Add new tables here as features are added (e.g., users, sessions, uploads).
 */

import Database from 'better-sqlite3';

const CREATE_REGIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS regions (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

const CREATE_EXERCISES_TABLE = `
  CREATE TABLE IF NOT EXISTS exercises (
    id           TEXT PRIMARY KEY,
    region_id    TEXT NOT NULL,
    title        TEXT NOT NULL,
    instructions TEXT NOT NULL,
    tags         TEXT NOT NULL DEFAULT '[]',
    pain_types   TEXT NOT NULL DEFAULT '[]',
    difficulty   TEXT NOT NULL DEFAULT 'beginner',
    duration_min INTEGER,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (region_id) REFERENCES regions(id)
  );
`;

const CREATE_PAIN_ENTRIES_TABLE = `
  CREATE TABLE IF NOT EXISTS pain_entries (
    id           TEXT PRIMARY KEY,
    device_id    TEXT NOT NULL,
    region       TEXT NOT NULL,
    region_name  TEXT NOT NULL,
    pain_type    TEXT NOT NULL,
    duration     TEXT NOT NULL,
    intensity    INTEGER NOT NULL,
    stress_level TEXT,
    trigger_type TEXT,
    muscles      TEXT NOT NULL DEFAULT '[]',
    exercises    TEXT NOT NULL DEFAULT '[]',
    risk_level   TEXT NOT NULL,
    warning_text TEXT NOT NULL,
    disclaimer   TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

const CREATE_FEEDBACK_TABLE = `
  CREATE TABLE IF NOT EXISTS feedback (
    id           TEXT PRIMARY KEY,
    entry_id     TEXT NOT NULL,
    rating       INTEGER,
    comment      TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (entry_id) REFERENCES pain_entries(id)
  );
`;

const CREATE_DEVICE_INDEX = `CREATE INDEX IF NOT EXISTS idx_pain_entries_device_id ON pain_entries(device_id);`;
const CREATE_EXERCISE_REGION_INDEX = `CREATE INDEX IF NOT EXISTS idx_exercises_region_id ON exercises(region_id);`;

const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    email        TEXT UNIQUE NOT NULL,
    password     TEXT NOT NULL,
    name         TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    last_login   TEXT
  );
`;

/**
 * Runs all CREATE TABLE statements on the database.
 * @param {Database.Database} db - The SQLite database instance
 */
export function runSchema(db: Database.Database): void {
  db.exec(CREATE_REGIONS_TABLE);
  db.exec(CREATE_EXERCISES_TABLE);
  db.exec(CREATE_PAIN_ENTRIES_TABLE);
  db.exec(CREATE_FEEDBACK_TABLE);
  db.exec(CREATE_USERS_TABLE);
  db.exec(CREATE_DEVICE_INDEX);
  db.exec(CREATE_EXERCISE_REGION_INDEX);

  // Migration: add user_id to pain_entries (safe — fails silently if column already exists)
  try {
    db.exec(`ALTER TABLE pain_entries ADD COLUMN user_id TEXT REFERENCES users(id);`);
  } catch {
    // Column already exists — ignore
  }

  console.log('Database schema initialized.');
}
