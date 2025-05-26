import React from "react";
import { SkeletonCard } from "./[treeId]/components/LoadingCard";

const Loading = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-white dark:bg-zinc-900 transition-colors duration-300">
      <div className="flex flex-row gap-10">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};

export default Loading;