/**
 * schema.ts
 * Database schema definitions and safe migrations.
 * Creates all tables with CREATE TABLE IF NOT EXISTS so it's safe to run on every server start.
 * Uses ALTER TABLE guarded by try/catch for safe column additions (no data loss).
 * EXTENSIBILITY: Add new tables here as features are added.
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

// ─── v2: Acupressure Points Table ───────────────────────────────────
const CREATE_ACUPRESSURE_POINTS_TABLE = `
  CREATE TABLE IF NOT EXISTS acupressure_points (
    id        TEXT PRIMARY KEY,
    region_id TEXT NOT NULL,
    name      TEXT NOT NULL,
    location  TEXT NOT NULL,
    how_to    TEXT NOT NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id)
  );
`;

// ─── v2: Video Cache Table ──────────────────────────────────────────
const CREATE_VIDEO_CACHE_TABLE = `
  CREATE TABLE IF NOT EXISTS video_cache (
    exercise_id TEXT PRIMARY KEY,
    video_id    TEXT,
    video_title TEXT,
    channel     TEXT,
    fetched_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

// ─── Indexes ────────────────────────────────────────────────────────
const CREATE_DEVICE_INDEX = `CREATE INDEX IF NOT EXISTS idx_pain_entries_device_id ON pain_entries(device_id);`;
const CREATE_EXERCISE_REGION_INDEX = `CREATE INDEX IF NOT EXISTS idx_exercises_region_id ON exercises(region_id);`;
const CREATE_ACUPRESSURE_REGION_INDEX = `CREATE INDEX IF NOT EXISTS idx_acupressure_region_id ON acupressure_points(region_id);`;

/**
 * v2 migration columns for pain_entries.
 * Each entry is [column_name, column_definition].
 * Uses try/catch so existing columns are silently skipped.
 */
const PAIN_ENTRIES_MIGRATIONS: [string, string][] = [
  ['user_id', 'TEXT REFERENCES users(id)'],
  ['onset', 'TEXT'],
  ['radiating', 'INTEGER'],               // SQLite boolean (0/1)
  ['numbness_or_weakness', 'INTEGER'],
  ['night_pain', 'INTEGER'],
  ['fever', 'INTEGER'],
  ['bladder_bowel_changes', 'INTEGER'],
  ['previous_episodes', 'TEXT'],
  ['aggravated_by', 'TEXT'],              // JSON string
  ['daily_sitting_hours', 'INTEGER'],
  ['sleep_quality', 'TEXT'],
  ['red_flag_reasons', 'TEXT'],           // JSON string
  ['risk_source', 'TEXT'],
  ['ml_confidence', 'REAL'],
  ['ai_insight', 'TEXT'],
  ['recovery_tips', 'TEXT'],              // JSON string
  ['acupressure_points', 'TEXT'],         // JSON string
  ['result_hindi', 'TEXT'],               // JSON string of localized Hindi AnalyzeOutput
];

/** Exercises table: add guided_mode_available column */
const EXERCISES_MIGRATIONS: [string, string][] = [
  ['guided_mode_available', 'INTEGER DEFAULT 1'],
];

/**
 * Safely adds a column to a table. Fails silently if column already exists.
 */
function safeAddColumn(db: Database.Database, table: string, column: string, definition: string): void {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  } catch {
    // Column already exists — ignore
  }
}

/**
 * Runs all CREATE TABLE statements and migrations on the database.
 * @param {Database.Database} db - The SQLite database instance
 */
export function runSchema(db: Database.Database): void {
  // Create base tables
  db.exec(CREATE_REGIONS_TABLE);
  db.exec(CREATE_EXERCISES_TABLE);
  db.exec(CREATE_PAIN_ENTRIES_TABLE);
  db.exec(CREATE_FEEDBACK_TABLE);
  db.exec(CREATE_USERS_TABLE);

  // v2 tables
  db.exec(CREATE_ACUPRESSURE_POINTS_TABLE);
  db.exec(CREATE_VIDEO_CACHE_TABLE);

  // Indexes
  db.exec(CREATE_DEVICE_INDEX);
  db.exec(CREATE_EXERCISE_REGION_INDEX);
  db.exec(CREATE_ACUPRESSURE_REGION_INDEX);

  // Safe migrations for pain_entries
  for (const [col, def] of PAIN_ENTRIES_MIGRATIONS) {
    safeAddColumn(db, 'pain_entries', col, def);
  }

  // Safe migrations for exercises
  for (const [col, def] of EXERCISES_MIGRATIONS) {
    safeAddColumn(db, 'exercises', col, def);
  }

  console.log('Database schema initialized (v2 migrations applied).');
}
