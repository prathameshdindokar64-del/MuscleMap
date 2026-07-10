/**
 * SQLite database connection singleton.
 * Provides a single database instance shared across the application.
 * EXTENSIBILITY: Replace with PostgreSQL connection pool when scaling beyond SQLite.
 */

import Database from 'better-sqlite3';
import { config } from '../config';

let db: Database.Database | null = null;

/**
 * Initializes and returns the SQLite database connection.
 * Creates the database file if it doesn't exist.
 * Uses WAL mode for better concurrent read performance.
 * @returns {Database.Database} The SQLite database instance
 */
export function initializeDatabase(): Database.Database {
  if (db) return db;

  db = new Database(config.dbPath, {
    // Enable verbose logging in development for SQL debugging
    verbose: config.isDev ? console.log : undefined,
  });

  // Enable WAL mode for better performance with concurrent reads
  db.pragma('journal_mode = WAL');

  // Enable foreign keys enforcement
  db.pragma('foreign_keys = ON');

  console.log(`Database connected at ${config.dbPath}`);
  return db;
}

/**
 * Returns the current database instance.
 * Throws if the database hasn't been initialized yet.
 * @returns {Database.Database} The SQLite database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Closes the database connection gracefully.
 * Should be called during server shutdown.
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed.');
  }
}
