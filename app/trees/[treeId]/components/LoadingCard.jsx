import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm dark:shadow-none">
      <Skeleton className="h-40 w-40 rounded-xl dark:bg-zinc-700" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full dark:bg-zinc-700" />
        <Skeleton className="h-4 w-full dark:bg-zinc-700" />
      </div>
    </div>
  );
}