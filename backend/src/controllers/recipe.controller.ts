import { Request, Response } from "express";
import db from "../database/db";

// Add a new recipe
const addRecipe = async (req: Request, res: Response): Promise<void> => {
	try {
			const { title, author, cooktime, instructions, tags, ingredients } = req.body;
			console.log("Adding recipe:", { title, author, cooktime, instructions, tags, ingredients });


			// Validate required fields
			if (!title || !author || !cooktime || !instructions) {
				console.log("one");
					res.status(400).json({ error: "Missing required fields" });
					return;
			}
			if (tags && !Array.isArray(tags)) {
					console.log("two");
					res.status(400).json({ error: "Tags must be an array" });
					return;
			}
			if (ingredients && !Array.isArray(ingredients)) {
					console.log("three");
					res.status(400).json({ error: "Ingredients must be an array" });
					return;
			}

			db.serialize(() => {
					const insertRecipeSQL = `
							INSERT INTO recipes (author, title, cooktime, instructions)
							VALUES (?, ?, ?, ?)
					`;

					db.run(
							insertRecipeSQL,
							[author, title, cooktime, instructions],
							function (err) {
									if (err) {
											console.error("Error adding recipe:", err.message);
											res.status(500).json({ error: "Failed to add recipe" });
											return;
									}

									const recipeId = this.lastID;

									// Insert tags
									if (tags && tags.length > 0) {
											tags.forEach((tag: string) => {
													db.run(`INSERT OR IGNORE INTO tags (tag) VALUES (?)`, [tag]);
													db.run(
															`INSERT INTO recipe_tags (author, title, tag) VALUES (?, ?, ?)`,
															[author, title, tag]
													);
											});
									}

									// Insert ingredients
									if (ingredients && ingredients.length > 0) {
											ingredients.forEach(
													({ ingredient, quantity }: { ingredient: string; quantity: string }) => {
															db.run(
																	`INSERT OR IGNORE INTO ingredients (ingredient) VALUES (?)`,
																	[ingredient]
															);
															db.run(
																	`INSERT INTO recipe_ingredients (author, title, ingredient, quantity) VALUES (?, ?, ?, ?)`,
																	[author, title, ingredient, quantity]
															);
													}
											);
									}

									res.status(201).json({ message: "Recipe added successfully", recipeId });
							}
					);
			});
	} catch (error) {
			console.error("Error fetching recipes:", error);
			res.status(500).json({ error: "An unexpected error occurred" });
	}
};

// Get all tags
const getAllTags = (req: Request, res: Response) => {
	const sql = `
        SELECT DISTINCT tag FROM tags
    `;
	db.all(sql, [], (err, rows: { tag: string }[]) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows.map((row) => row.tag));
		}
	});
};

// Add a tag
const addTag = (req: Request, res: Response) => {
	const { tag } = req.body;
	const sql = `
        INSERT INTO tags (tag) VALUES (?)
    `;
	db.run(sql, [tag], function (err) {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.status(201).json({ message: "Tag added successfully", tag });
		}
	});
};

// Get all ingredients
const getAllIngredients = (req: Request, res: Response) => {
	const sql = `
        SELECT DISTINCT ingredient FROM ingredients
    `;
	db.all(sql, [], (err, rows: { ingredient: string }[]) => {
		if (err) {
			console.error("Error fetching ingredients:", err.message);
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows.map((row) => row.ingredient));
		}
	});
};

// Add an ingredient
const addIngredient = (req: Request, res: Response) => {
	const { name } = req.body;
	const sql = `
        INSERT INTO ingredients (ingredient) VALUES (?)
    `;
	db.run(sql, [name], function (err) {
		if (err) {
			console.error("Error fetching ingredients:", err.message);
			res.status(500).json({ error: err.message });
		} else {
			res.status(201).json({ message: "Ingredient added successfully", name });
		}
	});
};

// See full recipe info (including tags and ingredients)
const getFullRecipeInfo = (req: Request, res: Response) => {
	const { author, title } = req.params;
	const recipeSQL = `
        SELECT * FROM recipes WHERE author = ? AND title = ?
    `;
	const tagsSQL = `
        SELECT tag FROM recipe_tags WHERE author = ? AND title = ?
    `;
	const ingredientsSQL = `
        SELECT ingredient, quantity FROM recipe_ingredients WHERE author = ? AND title = ?
    `;

	db.serialize(() => {
		db.get(recipeSQL, [author, title], (err, recipe) => {
			if (err) {
				return res.status(500).json({ error: err.message });
			}
			if (!recipe) {
				return res.status(404).json({ error: "Recipe not found" });
			}

			db.all(tagsSQL, [author, title], (err, tags: { tag: string }[]) => {
				if (err) {
					return res.status(500).json({ error: err.message });
				}

				db.all(
					ingredientsSQL,
					[author, title],
					(err, ingredients: { ingredient: string; quantity: string }[]) => {
						if (err) {
							return res.status(500).json({ error: err.message });
						}

						res.json({
							...recipe,
							tags: tags.map((tag) => tag.tag),
							ingredients: ingredients.map((ing) => ({
								ingredient: ing.ingredient,
								quantity: ing.quantity,
							})),
						});
					}
				);
			});
		});
	});
};

const searchRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract and validate query parameters
    const { query, tags, ingredients, minCookTime, maxCookTime } = req.query;

    // Base SQL query
    let sql = `
      SELECT DISTINCT r.*
      FROM recipes r
      LEFT JOIN recipe_tags rt ON r.author = rt.author AND r.title = rt.title
      LEFT JOIN recipe_ingredients ri ON r.author = ri.author AND r.title = ri.title
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // Search by query (title or author)
    if (query && typeof query === 'string') {
      sql += ` AND (r.title LIKE ? OR r.author LIKE ?)`;
      params.push(`%${query.trim()}%`, `%${query.trim()}%`);
    }

    // Filter by tags
    if (tags && typeof tags === 'string') {
      const tagList = tags.split(',').map((tag) => tag.trim());
      if (tagList.length > 0) {
        sql += ` AND rt.tag IN (${tagList.map(() => '?').join(', ')})`;
        params.push(...tagList);
      }
    }

    // Filter by ingredients
    if (ingredients && typeof ingredients === 'string') {
      const ingredientList = ingredients.split(',').map((ingredient) => ingredient.trim());
      if (ingredientList.length > 0) {
        sql += ` AND ri.ingredient IN (${ingredientList.map(() => '?').join(', ')})`;
        params.push(...ingredientList);
      }
    }

    // Filter by cook time range
    if (minCookTime && !isNaN(Number(minCookTime))) {
      sql += ` AND r.cooktime >= ?`;
      params.push(Number(minCookTime));
    }
    if (maxCookTime && !isNaN(Number(maxCookTime))) {
      sql += ` AND r.cooktime <= ?`;
      params.push(Number(maxCookTime));
    }

    // Execute SQL query
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }
      // Return rows (recipes)
      res.json(rows);
    });
  } catch (error) {
    console.error('Error in searchRecipes:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export {
	getAllTags,
	getFullRecipeInfo,
	addRecipe,
	addTag,
	getAllIngredients,
	addIngredient,
	searchRecipes,
};


