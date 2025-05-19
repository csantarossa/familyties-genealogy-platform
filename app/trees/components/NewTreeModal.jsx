import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRightCircle,
  ChevronRight,
  Sprout,
  WaypointsIcon,
} from "lucide-react";
import { useUser } from "@/app/contexts/UserContext";
import { useRouter } from "next/navigation";

import { useSafeToast } from "../../lib/toast";

const NewTreeModal = ({ onTreeCreated }) => {
  const toast = useSafeToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [newTree, setNewTree] = useState({
    title: "",
    desc: "",
  });

  const handleCreateTree = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/trees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          title: newTree.title,
          desc: newTree.desc,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Tree created successfully!");
        setNewTree({ title: "", desc: "" });

        // Call the parent function to refetch trees
        onTreeCreated?.();
      } else {
        toast.error(data.message || "Failed to create tree");
      }
    } catch (error) {
      console.error("Error creating tree:", error);
      toast.error("An error occurred while creating the tree.");
    }
    setLoading(false);
  };

  return (
    <div className="z-50 w-48 h-40 flex flex-col justify-start border-4 border-slate-100 dark:border-zinc-700 rounded-lg">
      <AlertDialog>
        <AlertDialogTrigger className="w-full h-full flex gap-2 text-lg justify-center items-center font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 duration-150 dark:text-white">
          {loading ? (
            <span className="loader"></span>
          ) : (
            <>
              <Sprout size={24} strokeWidth={1.5} /> New Tree
            </>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[360px] h-fit dark:bg-zinc-900 dark:text-white">
          <AlertDialogHeader className="flex h-full flex-row justify-start items-start">
            <AlertDialogTitle className="">Create a Tree</AlertDialogTitle>
          </AlertDialogHeader>
          <form
            onSubmit={handleCreateTree}
            className="w-full h-full flex justify-center items-center flex-col gap-4"
          >
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium dark:text-gray-200">
                Title *
              </Label>
              <Input
                type="text"
                id="treeTitle"
                placeholder="Tree Title"
                onChange={(e) =>
                  setNewTree({ ...newTree, title: e.target.value })
                }
                className="dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium dark:text-gray-200">
                Description
              </Label>
              <Input
                type="text"
                id="treeDesc"
                placeholder="Describe your Tree"
                onChange={(e) =>
                  setNewTree({ ...newTree, desc: e.target.value })
                }
                className="dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
              />
            </div>

            <div className="w-full flex justify-between items-center pt-3">
              <AlertDialogCancel className="dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                className="flex justify-center items-center gap-1 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500"
              >
                Create
                <ChevronRight className="w-fit" size={20} />
              </AlertDialogAction>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NewTreeModal;