import React from "react";
import { SkeletonCard } from "./[treeId]/components/LoadingCard";

const Loading = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-row gap-10">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};

export default Loading;
