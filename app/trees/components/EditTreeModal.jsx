"use client";
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
  EditIcon,
  Sprout,
  WaypointsIcon,
} from "lucide-react";
import { useUser } from "@/app/contexts/UserContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const EditTreeModal = ({
  editedTitle,
  editedDesc,
  setEditedDesc,
  setEditedTitle,
}) => {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  return (
    <AlertDialog open={openModal}>
      <AlertDialogTrigger
        className="z-50"
        onClick={(e) => {
          e.preventDefault();
          //   e.stopPropagation();
          setOpenModal(true);
        }}
      >
        <EditIcon className="z-50" size={17} />
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[360px] h-fit">
        <AlertDialogHeader className="flex h-full flex-row justify-start items-start">
          <AlertDialogTitle className="">Edit Tree</AlertDialogTitle>
        </AlertDialogHeader>
        <form
          onSubmit={() => console.log("Submitted")}
          className="w-full h-full flex justify-center items-center flex-col gap-4"
        >
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              type="text"
              id="treeTitle"
              placeholder="Edit Title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Description
            </Label>
            <Input
              type="text"
              id="treeDesc"
              value={editedDesc}
              placeholder="Edit Description"
              onChange={(e) => setEditedDesc(e.target.value)}
            />
          </div>

          <div className="w-full flex justify-between items-center pt-3">
            <AlertDialogCancel
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenModal(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenModal(false);
              }}
              className="flex justify-center items-center gap-1"
            >
              Update
              <ChevronRight className="w-fit" size={20} />
            </AlertDialogAction>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditTreeModal;
