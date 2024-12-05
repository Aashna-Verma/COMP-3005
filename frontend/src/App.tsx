import { useEffect, useState } from 'react';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import AddRecipe from './components/AddRecipe';
import { searchRecipes, getFullRecipeInfo, SearchFilters } from './api/recipe.api';
import { DualRangeSlider } from './components/ui/range-slider';
import MultipleTags from './components/MultipleTags';
import MultipleIngredients from './components/MultipleIngredients';
import { Option } from './components/ui/multiple-selector';

interface Recipe {
  title: string;
  author: string;
  cooktime: number;
  description: string;
}

interface RecipeDetails {
  ingredients: { ingredient: string; quantity: string }[];
  instructions: string[]; // Stored as JSON string in the database
  title: string;
  author: string;
  cooktime: number;
}

function App() {
  const [searchQuery, setSearchQuery] = useState<string>(''); // Manage search input
  const [selectedTags, setSelectedTags] = useState<Option[]>([]); // Manage selected tags
  const [selectedIngredients, setSelectedIngredients] = useState<Option[]>([]); // Manage selected ingredients
  const [recipes, setRecipes] = useState<Recipe[]>([]); // Store search results
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [values, setValues] = useState([0, 300]); // Cooktime range
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetails | null>(null); // Selected recipe details
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state

  // Handle search with filters
  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: SearchFilters = {
        query: searchQuery,
        tags: selectedTags.map((tag) => tag.label),
        ingredients: selectedIngredients.map((ingredient) => ingredient.label),
        minCookTime: values[0],
        maxCookTime: values[1],
      };

      const results = await searchRecipes(filters);
      setRecipes(results);
    } catch (err) {
      console.error('Error searching recipes:', err);
      setError('Failed to fetch recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipe details when a recipe card is clicked
  const handleRecipeClick = async (title: string, author: string) => {
    try {
      const details = await getFullRecipeInfo(author, title);
      const parsedInstructions = JSON.parse(details.instructions || '[]'); // Parse JSON instructions
      setSelectedRecipe({ ...details, instructions: parsedInstructions });
      console.log('Recipe details:', details);
      setIsDialogOpen(true); // Open the dialog
    } catch (err) {
      console.error('Error fetching recipe details:', err);
      setError('Failed to fetch recipe details. Please try again.');
    }
  };

  // Fetch all recipes on initial load
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="App">
      {/* Search Bar */}
      <div className='flex justify-end px-10 py-6'>
        <div className="flex w-full items-center space-x-2">
          <Input
            className='rounded-full bg-card w-full'
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="button" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <div className='flex flex-col sm:flex-row mt-6 sm:mt-0 px-10 gap-6'>
        <div className="w-full flex">
          <DualRangeSlider
            label={(value) => <span className='flex'>{value + ' mins'}</span>}
            value={values}
            onValueChange={setValues}
            min={0}
            max={300}
            step={5}
          />
        </div>

        <MultipleTags selectedTags={selectedTags} setSelectedTags={setSelectedTags} />

        <MultipleIngredients
          selectedIngredients={selectedIngredients}
          setSelectedIngredients={setSelectedIngredients}
        />
      </div>

      {/* Display Results */}
      <div className="flex flex-wrap gap-4 p-10">
        {loading && <p>Loading recipes...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {recipes.map((recipe, index) => (
          <Card
            key={index}
            className="min-w-[200px] flex-1 cursor-pointer"
            onClick={() => handleRecipeClick(recipe.title, recipe.author)}
          >
            <CardHeader>
              <div className='w-24 h-24 rounded-sm bg-stone-600' />
            </CardHeader>
            <CardContent>
              <CardTitle>{recipe.title}</CardTitle>
              <CardDescription>
                {recipe.description || `Cook time: ${recipe.cooktime} mins`}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
        {!loading && !recipes.length && !error && (
          <p className="text-gray-500">No recipes found. Try a different search.</p>
        )}
      </div>

      {/* Recipe Details Dialog */}
      {selectedRecipe && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedRecipe.title}</DialogTitle>
              <DialogDescription>
                Created by {selectedRecipe.author}. Cook time: {selectedRecipe.cooktime} mins
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Ingredients</h3>
              <ul className="list-disc list-inside">
                {selectedRecipe?.ingredients?.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <input type="checkbox" />
                    {ingredient.quantity} {ingredient.ingredient}
                  </li>
                ))}
              </ul>
              <h3 className="text-lg font-semibold mt-4">Steps</h3>
              <ol className="list-decimal list-inside">
                {selectedRecipe?.instructions?.map((instruction: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <input type="checkbox" />
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
            <Button onClick={() => setIsDialogOpen(false)} className="mt-4">
              Close
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Recipe Button */}
      <AddRecipe />
    </div>
  );
}

export default App;