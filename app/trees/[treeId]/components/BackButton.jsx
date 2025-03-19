import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const BackButton = () => {
  return (
    <Link href={"/trees"}>
      <div className="absolute top-5 left-12 z-50 bg-white p-3 rounded-lg shadow-md ">
        <ChevronLeft size={18} />
      </div>
    </Link>
  );
};

export default BackButton;
