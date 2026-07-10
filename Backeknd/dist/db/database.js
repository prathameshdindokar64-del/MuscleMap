"use strict";
/**
 * SQLite database connection singleton.
 * Provides a single database instance shared across the application.
 * EXTENSIBILITY: Replace with PostgreSQL connection pool when scaling beyond SQLite.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const config_1 = require("../config");
let db = null;
/**
 * Initializes and returns the SQLite database connection.
 * Creates the database file if it doesn't exist.
 * Uses WAL mode for better concurrent read performance.
 * @returns {Database.Database} The SQLite database instance
 */
function initializeDatabase() {
    if (db)
        return db;
    db = new better_sqlite3_1.default(config_1.config.dbPath, {
        // Enable verbose logging in development for SQL debugging
        verbose: config_1.config.isDev ? console.log : undefined,
    });
    // Enable WAL mode for better performance with concurrent reads
    db.pragma('journal_mode = WAL');
    // Enable foreign keys enforcement
    db.pragma('foreign_keys = ON');
    console.log(`Database connected at ${config_1.config.dbPath}`);
    return db;
}
/**
 * Returns the current database instance.
 * Throws if the database hasn't been initialized yet.
 * @returns {Database.Database} The SQLite database instance
 */
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}
/**
 * Closes the database connection gracefully.
 * Should be called during server shutdown.
 */
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
        console.log('Database connection closed.');
    }
}
//# sourceMappingURL=database.js.map