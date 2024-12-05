import { useState } from "react";
import { Label } from "./ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Plus } from "lucide-react";
import MultipleTags from "./MultipleTags";
import { Separator } from "./ui/separator";
import IngredientAdder from "./IngredientAdder";
import StepAdder from "./StepAdder";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { addRecipe } from "../api/recipe.api"; // Import API function

const AddRecipe = () => {
  // State for the form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [cooktime, setCooktime] = useState<number | "">("");
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
  const [ingredients, setIngredients] = useState<
    { ingredient: string; quantity: string }[]
  >([]);
  const [steps, setSteps] = useState<string[]>([]);

  // Function to handle saving the recipe
  const handleSaveRecipe = async () => {
    try {
      // Prepare the recipe data
      const recipe = {
        title,
        author,
        cooktime: Number(cooktime), // Convert cooktime to a number
        instructions: JSON.stringify(steps), // Combine steps into a single string
        tags: tags.map((tag) => tag.label), // Extract labels from tags
        ingredients,
      };

      // Call the API to save the recipe
      await addRecipe(recipe);
      alert("Recipe saved successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save the recipe. Please try again.");
    }
  };

  return (
    <Sheet>
      <SheetTrigger className="fixed bottom-6 right-6" asChild>
        <Button size="lg" className="rounded-full font-bold">
          <Plus />
          New Recipe
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a new Recipe</SheetTitle>
          <SheetDescription>
            Add your Recipe so that others can enjoy your food! Click save when
            you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-4 grid-cols-2 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="username"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <MultipleTags
                selectedTags={tags}
                setSelectedTags={setTags} // Update tags state
              />
            </div>

            <div>
              <Label htmlFor="cooktime">Cooktime</Label>
              <Input
                id="cooktime"
                placeholder="mins"
                type="number"
                value={cooktime}
                onChange={(e) => setCooktime(Number(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          <IngredientAdder
            ingredients={ingredients}
            setIngredients={setIngredients} // Update ingredients state
          />

          <Separator />

          <StepAdder steps={steps} setSteps={setSteps} /> {/* Update steps state */}

          <Separator />
        </div>
        <SheetFooter>
          <Button className="w-full" type="button" onClick={handleSaveRecipe}>
            Save Recipe
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddRecipe;