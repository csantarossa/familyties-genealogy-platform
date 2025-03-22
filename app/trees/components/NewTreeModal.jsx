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
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const NewTreeModal = ({ onTreeCreated }) => {
  const { user } = useUser();
  const [newTree, setNewTree] = useState({
    title: "",
    desc: "",
  });

  const handleCreateTree = async (e) => {
    e.preventDefault();

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

        // ✅ Call the parent function to refetch trees
        onTreeCreated?.();
      } else {
        toast.error(data.message || "Failed to create tree");
      }
    } catch (error) {
      console.error("Error creating tree:", error);
      toast.error("An error occurred while creating the tree.");
    }
  };

  return (
    <div className="z-50 w-48 h-40 flex flex-col justify-start border-4 border-slate-100 rounded-lg">
      <AlertDialog>
        <AlertDialogTrigger className="w-full h-full flex gap-2 text-lg justify-center items-center font-medium hover:bg-gray-50 duration-150">
          <Sprout size={24} strokeWidth={1.5} /> New Tree
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[360px] h-fit">
          <AlertDialogHeader className="flex h-full flex-row justify-start items-start">
            <AlertDialogTitle className="">Create a Tree</AlertDialogTitle>
          </AlertDialogHeader>
          <form
            onSubmit={handleCreateTree}
            className="w-full h-full flex justify-center items-center flex-col gap-4"
          >
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                type="text"
                id="firstname"
                placeholder="Firstname"
                onChange={(e) =>
                  setNewTree({ ...newTree, title: e.target.value })
                }
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Description
              </Label>
              <Input
                type="text"
                id="lastname"
                placeholder="Lastname"
                onChange={(e) =>
                  setNewTree({ ...newTree, desc: e.target.value })
                }
              />
            </div>

            <div className="w-full flex justify-between items-center pt-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                className="flex justify-center items-center gap-1"
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
