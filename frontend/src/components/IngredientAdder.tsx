import React, { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Command, CommandEmpty, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { getAllIngredients, addIngredient } from "../api/recipe.api";

interface Ingredient {
  ingredient: string;
  quantity: string;
}

interface IngredientAdderProps {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
}

const IngredientAdder: React.FC<IngredientAdderProps> = ({
  ingredients,
  setIngredients,
}) => {
  const [ingredientOptions, setIngredientOptions] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState<string>("");

  // Fetch ingredient options from the API
  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const ingredients = await getAllIngredients();
      setIngredientOptions(ingredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  // Add a new ingredient to the options list and update the API
  const handleAddNewIngredient = async () => {
    const trimmedIngredient = newIngredient.trim();
    if (trimmedIngredient && !ingredientOptions.includes(trimmedIngredient)) {
      try {
        await addIngredient(trimmedIngredient); // POST to API
        setIngredientOptions([...ingredientOptions, trimmedIngredient]);
        setNewIngredient("");
        fetchIngredients(); // Refetch ingredients
      } catch (error) {
        console.error("Error adding ingredient:", error);
      }
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ingredient: "", quantity: "" }]);
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    setIngredients(updatedIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label>Ingredients</Label>
      <div className="space-y-4">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex space-x-2">
            <Input
              className="max-w-36"
              placeholder="Quantity"
              value={ingredient.quantity}
              onChange={(e) =>
                handleIngredientChange(index, "quantity", e.target.value)
              }
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded="false"
                  className="w-full justify-between"
                >
                  {ingredient.ingredient || "Select ingredient..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      className="border-none focus-visible:ring-0 flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none"
                      placeholder="Search ingredient..."
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                    />
                  </div>
                  <CommandList>
                    {ingredientOptions
                      .filter((option) =>
                        option
                          .toLowerCase()
                          .includes(newIngredient.toLowerCase())
                      )
                      .map((option) => (
                        <CommandItem
                          key={option}
                          onSelect={() =>
                            handleIngredientChange(index, "ingredient", option)
                          }
                        >
                          {option}
                        </CommandItem>
                      ))}
                    {newIngredient.trim() &&
                      !ingredientOptions.includes(newIngredient.trim()) && (
                        <CommandItem
                          onSelect={() => {
                            handleAddNewIngredient();
                            handleIngredientChange(
                              index,
                              "ingredient",
                              newIngredient.trim()
                            );
                          }}
                        >
                          <span>+ Add "{newIngredient.trim()}"</span>
                        </CommandItem>
                      )}
                    <CommandEmpty>No ingredient found.</CommandEmpty>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleRemoveIngredient(index)}
              className="w-8 h-8 flex items-center justify-center"
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddIngredient}
          className="mt-4"
        >
          + Add Ingredient
        </Button>
      </div>
    </div>
  );
};

export default IngredientAdder;
