import axios from "axios";

const API_BASE_URL = "http://localhost:3001/all";

export interface SearchFilters {
	query?: string;
	tags?: string[];
	ingredients?: string[];
	minCookTime?: number;
	maxCookTime?: number;
}

export interface Recipe {
	title: string;
	author: string;
	cooktime: number;
	description: string;
}

// Add a new recipe
export const addRecipe = async (recipe: {
	title: string;
	author: string;
	cooktime: number;
	instructions: string;
	tags?: string[];
	ingredients?: { ingredient: string; quantity: string }[];
}) => {
	const response = await axios.post(`${API_BASE_URL}/recipes`, recipe);
	return response.data; // Return the added recipe details
};

// Get all tags
export const getAllTags = async () => {
	const response = await axios.get(`${API_BASE_URL}/tags`);
	return response.data;
};

// Add a tag
export const addTag = async (tag: string) => {
	const response = await axios.post(`${API_BASE_URL}/tags`, { tag });
	return response.data; // Return the added tag details
};

// Get all ingredients
export const getAllIngredients = async () => {
	const response = await axios.get(`${API_BASE_URL}/ingredients`);
	return response.data;
};

// Add an ingredient
export const addIngredient = async (name: string) => {
	const response = await axios.post(`${API_BASE_URL}/ingredients`, { name });
	return response.data; // Return the added ingredient details
};

// Get full recipe info by author and title
export const getFullRecipeInfo = async (author: string, title: string) => {
	const response = await axios.get(`${API_BASE_URL}/recipes/${author}/${title}`);
	return response.data; // Return the recipe details with tags and ingredients
};

// Search recipes with filters
export const searchRecipes = async (filters: SearchFilters): Promise<Recipe[]> => {

	// Build query parameters
	const params = new URLSearchParams();

	if (filters.query) params.append("query", filters.query);
	if (filters.tags) params.append("tags", filters.tags.join(","));
	if (filters.ingredients) params.append("ingredients", filters.ingredients.join(","));
	if (filters.minCookTime) params.append("minCookTime", String(filters.minCookTime));
	if (filters.maxCookTime) params.append("maxCookTime", String(filters.maxCookTime));

	const response = await axios.get<Recipe[]>(`${API_BASE_URL}/recipes/search?${params.toString()}`);
	return response.data;
};
