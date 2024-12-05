import sqlite3 from 'sqlite3';
import path from 'path';

//import './clear'; // Comment this line when not resetting the database


const dbPath = path.resolve(__dirname, './mydatabase.sqlite3');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// SQL to create tables
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS recipes (
    author TEXT NOT NULL,
    title TEXT NOT NULL,
    cooktime INTEGER NOT NULL,
    instructions TEXT NOT NULL,
    image TEXT,
    PRIMARY KEY (author, title)
);

CREATE TABLE IF NOT EXISTS tags (
    tag TEXT PRIMARY KEY UNIQUE
);

CREATE TABLE IF NOT EXISTS recipe_tags (
    author TEXT NOT NULL,
    title TEXT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (author, title) REFERENCES recipe(author, title),
    FOREIGN KEY (tag) REFERENCES tag(tag)
);

CREATE TABLE IF NOT EXISTS ingredients (
    ingredient TEXT PRIMARY KEY UNIQUE
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    author TEXT NOT NULL,
    title TEXT NOT NULL,
    ingredient TEXT NOT NULL,
    quantity TEXT NOT NULL,
    FOREIGN KEY (author, title) REFERENCES recipe(author, title),
    FOREIGN KEY (ingredient) REFERENCES ingredient(ingredient)
);
`;

// Create tables
db.exec(createTablesSQL, (err) => {
    if (err) {
        console.error('Error creating tables:', err.message);
    } else {
        console.log('Tables created successfully or already exist.');
    }
    db.close();
});

import './seedDatabase'; // Comment this line when not resetting the database
