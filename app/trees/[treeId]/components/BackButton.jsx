import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const BackButton = () => {
  return (
    <Link href={"/trees"}>
      <div className="absolute top-5 left-12 z-50 p-3 rounded-lg bg-white dark:bg-zinc-800 dark:text-white transition-colors duration-200">
        <ChevronLeft size={18} />
      </div>
    </Link>
  );
};

export default BackButton;