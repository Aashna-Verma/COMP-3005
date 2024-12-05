import React, { useEffect, useState } from 'react';
import MultipleSelector, { Option } from './ui/multiple-selector';
import { getAllIngredients, addIngredient } from '../api/recipe.api'; // Import API functions

interface MultipleIngredientsProps {
  selectedIngredients: Option[];
  setSelectedIngredients: React.Dispatch<React.SetStateAction<Option[]>>;
}

const MultipleIngredients: React.FC<MultipleIngredientsProps> = ({
  selectedIngredients,
  setSelectedIngredients,
}) => {
  const [options, setOptions] = useState<Option[]>([]); // State to manage ingredient options
  const [loading, setLoading] = useState<boolean>(true); // State for loading indicator

  // Fetch all ingredients from the API
  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const ingredients = await getAllIngredients(); // Fetch ingredients from the backend
      const formattedOptions = ingredients.map((ingredient: string) => ({
        label: ingredient,
        value: ingredient.toLowerCase(),
      }));
      setOptions(formattedOptions);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIngredient = async (newIngredient: string) => {
    try {
      // Add new ingredient to the database via API
      await addIngredient(newIngredient);

      // Optimistically update the options with the new ingredient
      const newOption = { label: newIngredient, value: newIngredient.toLowerCase() };
      setOptions((prevOptions) => [...prevOptions, newOption]);
      setSelectedIngredients((prevIngredients) => [...prevIngredients, newOption]); // Update selected ingredients
    } catch (error) {
      console.error('Error adding new ingredient:', error);
    }
  };

  const handleIngredientChange = (updatedIngredients: Option[]) => {
    setSelectedIngredients(updatedIngredients); // Update selected ingredients in the parent component
  };

  return (
    <div className="w-full">
      {loading ? (
        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
          Loading ingredients...
        </p>
      ) : (
        <MultipleSelector
          value={selectedIngredients} // Pass selected ingredients as value
          defaultOptions={options} // Pass dynamic options
          placeholder="Enter ingredients"
          creatable
          onCreate={handleCreateIngredient} // Handle new ingredient creation
          onChange={handleIngredientChange} // Handle ingredient selection changes
          emptyIndicator={
            <p className="text-center text-gray-600 dark:text-gray-400">
              No results found.
            </p>
          }
        />
      )}
    </div>
  );
};

export default MultipleIngredients;