import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Opret database forbindelse
const db = new sqlite3.Database(join(__dirname, 'users.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

// Initialiser database schema
function initDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            role TEXT NOT NULL,
            first_login INTEGER DEFAULT 1,
            reset_token TEXT,
            reset_token_expires DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table ready');
            runMigrations();
        }
    });
}

// Run database migrations with proper checks
function runMigrations() {
    // Check existing columns
    db.all("PRAGMA table_info(users)", (err, columns) => {
        if (err) {
            console.error('Error checking table schema:', err);
            return;
        }

        const columnNames = columns.map(col => col.name);

        // Add missing columns if they don't exist
        if (!columnNames.includes('email')) {
            console.log('Adding email column...');
            db.run(`ALTER TABLE users ADD COLUMN email TEXT`, (err) => {
                if (err) console.error('Error adding email column:', err);
            });
        }

        if (!columnNames.includes('first_login')) {
            console.log('Adding first_login column...');
            db.run(`ALTER TABLE users ADD COLUMN first_login INTEGER DEFAULT 1`, (err) => {
                if (err) console.error('Error adding first_login column:', err);
            });
        }

        if (!columnNames.includes('reset_token')) {
            console.log('Adding reset_token column...');
            db.run(`ALTER TABLE users ADD COLUMN reset_token TEXT`, (err) => {
                if (err) console.error('Error adding reset_token column:', err);
            });
        }

        if (!columnNames.includes('reset_token_expires')) {
            console.log('Adding reset_token_expires column...');
            db.run(`ALTER TABLE users ADD COLUMN reset_token_expires DATETIME`, (err) => {
                if (err) console.error('Error adding reset_token_expires column:', err);
            });
        }

        console.log('Database migrations completed');
    });
}

export default db;
