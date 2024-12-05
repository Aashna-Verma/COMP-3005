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

// SQL to clear all tables
const clearTablesSQL = `
DELETE FROM recipe_tags;
DELETE FROM recipe_ingredients;
DELETE FROM recipes;
DELETE FROM tags;
DELETE FROM ingredients;
`;

// SQL to create seed data
const seedDataSQL = `
INSERT INTO tags (tag) VALUES ('Vegan'), ('Quick'), ('High Protein'), ('Low Carb');
INSERT INTO ingredients (ingredient) VALUES ('Tomato'), ('Onion'), ('Chicken'), ('Garlic');

INSERT INTO recipes (author, title, cooktime, instructions, image) VALUES
('John Doe', 'Vegan Pasta', 30, '["Boil pasta", "Add sauce", "Mix vegetables"]', NULL),
('Jane Smith', 'Chicken Curry', 45, '["Cook chicken", "Add spices", "Add coconut milk"]', NULL);

INSERT INTO recipe_tags (author, title, tag) VALUES
('John Doe', 'Vegan Pasta', 'Vegan'),
('Jane Smith', 'Chicken Curry', 'High Protein');

INSERT INTO recipe_ingredients (author, title, ingredient, quantity) VALUES
('John Doe', 'Vegan Pasta', 'Tomato', '2 cups'),
('John Doe', 'Vegan Pasta', 'Onion', '1 cup'),
('Jane Smith', 'Chicken Curry', 'Chicken', '500g'),
('Jane Smith', 'Chicken Curry', 'Garlic', '2 cloves');
`;

// Clear and seed data
db.serialize(() => {
    db.exec(clearTablesSQL, (err) => {
        if (err) {
            console.error('Error clearing tables:', err.message);
        } else {
            console.log('Tables cleared successfully.');
        }
    });

    db.exec(seedDataSQL, (err) => {
        if (err) {
            console.error('Error seeding data:', err.message);
        } else {
            console.log('Data seeded successfully.');
        }
        db.close();
    });
});