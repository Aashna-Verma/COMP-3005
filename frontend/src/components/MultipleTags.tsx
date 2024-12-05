import React, { useEffect, useState } from 'react';
import MultipleSelector, { Option } from './ui/multiple-selector';
import { getAllTags, addTag } from '../api/recipe.api'; // Import API functions

interface MultipleTagsProps {
  selectedTags: Option[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Option[]>>;
}

const MultipleTags: React.FC<MultipleTagsProps> = ({ selectedTags, setSelectedTags }) => {
  const [options, setOptions] = useState<Option[]>([]); // State to manage tag options
  const [loading, setLoading] = useState<boolean>(true); // State for loading indicator

  // Fetch all tags from the API
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const tags = await getAllTags(); // Fetch tags from the backend
      const formattedOptions = tags.map((tag: string) => ({
        label: tag,
        value: tag.toLowerCase(),
      }));
      setOptions(formattedOptions);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (newTag: string) => {
    try {
      // Add new tag to the database via API
      await addTag(newTag);

      // Optimistically update the options with the new tag
      const newOption = { label: newTag, value: newTag.toLowerCase() };
      setOptions((prevOptions) => [...prevOptions, newOption]);
      setSelectedTags((prevTags) => [...prevTags, newOption]); // Update selected tags
    } catch (error) {
      console.error('Error adding new tag:', error);
    }
  };

  const handleTagChange = (updatedTags: Option[]) => {
    setSelectedTags(updatedTags); // Update selected tags in the parent component
  };

  return (
    <div className="w-full">
      {loading ? (
        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
          Loading tags...
        </p>
      ) : (
        <MultipleSelector
          value={selectedTags} // Pass selected tags as value
          defaultOptions={options} // Pass dynamic options
          placeholder="Enter tags"
          creatable
          onCreate={handleCreateTag} // Handle new tag creation
          onChange={handleTagChange} // Handle tag selection changes
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

export default MultipleTags;