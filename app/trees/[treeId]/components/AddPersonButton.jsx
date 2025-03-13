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
    <div className="flex justify-center items-center p-3 rounded-md gap-1 bg-[#FFF] shadow-sm font-medium">
      Add Person
      <Plus size={20} className="stroke-[2px]" />
    </div>
  );
};

export default AddPersonButton;
