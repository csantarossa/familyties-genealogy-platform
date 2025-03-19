import React from "react";
import { Plus } from "@geist-ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AddPersonButton = () => {
  return (
    <div className="flex justify-center items-center p-3 px-4 rounded-md text-white gap-1 bg-[#252525] shadow-sm text-sm font-medium">
      Add Person
      <Plus size={18} className="stroke-[2px]" />
    </div>
  );
};

export default AddPersonButton;
