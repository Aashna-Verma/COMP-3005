import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, './mydatabase.sqlite3');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// SQL to drop all tables
const clearDatabaseSQL = `
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS recipe_tags;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS ingredients;

PRAGMA foreign_keys = ON;
`;

db.serialize(() => {
    db.exec(clearDatabaseSQL, (err) => {
        if (err) {
            console.error('Error clearing database:', err.message);
        } else {
            console.log('All tables dropped successfully.');
        }
        db.close();
    });
});
