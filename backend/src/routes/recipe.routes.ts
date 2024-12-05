import { Router } from 'express';
import {
    getAllTags,
    getFullRecipeInfo,
    addRecipe,
    addTag,
    getAllIngredients,
    addIngredient,
    searchRecipes,
} from '../controllers/recipe.controller';

const router = Router();

// Define routes
router.get('/tags', getAllTags);
router.get('/recipes/:author/:title', getFullRecipeInfo);
router.post('/recipes', addRecipe);
router.post('/tags', addTag);
router.post('/ingredients', addIngredient);
router.get('/ingredients', getAllIngredients);
router.get('/recipes/search', searchRecipes);

export default router;
