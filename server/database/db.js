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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table ready');

            // Tilføj email og first_login kolonner hvis de ikke findes (migration)
            db.run(`ALTER TABLE users ADD COLUMN email TEXT`, () => {});
            db.run(`ALTER TABLE users ADD COLUMN first_login INTEGER DEFAULT 1`, () => {});
            db.run(`ALTER TABLE users ADD COLUMN reset_token TEXT`, () => {});
            db.run(`ALTER TABLE users ADD COLUMN reset_token_expires DATETIME`, () => {});
        }
    });
}

export default db;
