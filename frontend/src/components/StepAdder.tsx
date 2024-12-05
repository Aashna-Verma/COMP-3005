import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface StepAdderProps {
  steps: string[];
  setSteps: React.Dispatch<React.SetStateAction<string[]>>;
}

const StepAdder: React.FC<StepAdderProps> = ({ steps, setSteps }) => {
  // Add a new step
  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  // Update step description
  const handleStepChange = (index: number, value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = value;
    setSteps(updatedSteps);
  };

  // Remove a step
  const handleRemoveStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  return (
    <div>
      <Label>Steps</Label>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-4">
            {/* Step Number */}
            <span className="w-8 text-center">{index + 1}.</span>

            {/* Step Description Input */}
            <Input
              className="flex-1"
              placeholder="Enter step description..."
              value={step}
              onChange={(e) => handleStepChange(index, e.target.value)}
            />

            {/* Remove Step Button */}
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleRemoveStep(index)}
              className="w-8 h-8 flex items-center justify-center"
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      {/* Add Step Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddStep}
          className="mt-4"
        >
          + Add Step
        </Button>
      </div>
    </div>
  );
};

export default StepAdder;