"use client";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, EditIcon } from "lucide-react";

import { useSafeToast } from "../../lib/toast";

const EditTreeModal = ({
  editedTitle,
  editedDesc,
  id,
  onUpdate,
}) => {
  const toast = useSafeToast();
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [localTitle, setLocalTitle] = useState(editedTitle);
  const [localDesc, setLocalDesc] = useState(editedDesc);

  const handleOpen = () => {
    setLocalTitle(editedTitle);
    setLocalDesc(editedDesc);
    setOpenModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      const response = await fetch("/api/trees", {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ tree_id: id, editedTitle: localTitle, editedDesc: localDesc }),
      });

      const json = await response.json();
      if (json.success) {
        toast.success("Tree updated!");
        onUpdate();
      } else {
        toast.error("Failed to update tree");
      }
    } catch (error) {
      toast.error("Error updating tree");
    } finally {
      setLoading(false);
      setOpenModal(false);
    }
  };

  const handleOpenChange = (open) => {
    if (open) {
      setLocalTitle(editedTitle);
      setLocalDesc(editedDesc);
    }
    setOpenModal(open);
  };

  return (
    <AlertDialog open={openModal}>
      <AlertDialogTrigger
        className="z-50"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOpen();
        }}
      >
        <EditIcon className="cursor-pointer" size={17} />
      </AlertDialogTrigger>

      <AlertDialogContent className="w-[360px] h-fit dark:bg-zinc-900 dark:text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Tree</AlertDialogTitle>
        </AlertDialogHeader>

        <form
          onSubmit={handleUpdate}
          className="w-full flex flex-col gap-4 pt-2"
        >
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="treeTitle" className="text-sm font-medium dark:text-gray-200"> Title *</Label>
            <Input
              id="treeTitle"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Edit Title"
              className="dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="treeDesc" className="text-sm font-medium dark:text-gray-200">Description</Label>
            <Input
              id="treeDesc"
              value={localDesc}
              onChange={(e) => setLocalDesc(e.target.value)}
              placeholder="Edit Description"
              className="dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
            />
          </div>

          <div className="w-full flex justify-between items-center pt-3">
            <AlertDialogCancel
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenModal(false);
              }}
              className="dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={loading}
              className="flex justify-center items-center gap-1 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500"
            >
              {loading ? "Updating..." : "Update"}
              <ChevronRight size={20} />
            </AlertDialogAction>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditTreeModal;