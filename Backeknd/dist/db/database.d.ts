/**
 * SQLite database connection singleton.
 * Provides a single database instance shared across the application.
 * EXTENSIBILITY: Replace with PostgreSQL connection pool when scaling beyond SQLite.
 */
import Database from 'better-sqlite3';
/**
 * Initializes and returns the SQLite database connection.
 * Creates the database file if it doesn't exist.
 * Uses WAL mode for better concurrent read performance.
 * @returns {Database.Database} The SQLite database instance
 */
export declare function initializeDatabase(): Database.Database;
/**
 * Returns the current database instance.
 * Throws if the database hasn't been initialized yet.
 * @returns {Database.Database} The SQLite database instance
 */
export declare function getDatabase(): Database.Database;
/**
 * Closes the database connection gracefully.
 * Should be called during server shutdown.
 */
export declare function closeDatabase(): void;
//# sourceMappingURL=database.d.ts.map