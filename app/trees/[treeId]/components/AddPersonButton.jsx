import React from "react";
import { Plus } from "@geist-ui/icons";

const AddPersonButton = () => {
  return (
    <div className="flex justify-center items-center p-3 px-4 rounded-md text-white gap-1 bg-[#252525] hover:bg-[#1f1f1f] dark:bg-zinc-800 dark:hover:bg-zinc-700 shadow-sm text-sm font-medium cursor-pointer transition-colors duration-200">
      Add Person
      <Plus size={18} className="stroke-[2px]" />
    </div>
  );
};

export default AddPersonButton;