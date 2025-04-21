"use client";
import React, { useContext, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useParams } from "next/navigation";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import PersonTabs from "./PersonTabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { PersonContext } from "@/app/contexts/PersonContext";

const SidePanel = () => {
  const { selected, selectPerson, clearSelection } = useContext(PersonContext);
  const [trigger, setTrigger] = useState(false);
  const { treeId } = useParams();

  // Open panel when selected changes
  React.useEffect(() => {
    if (selected?.id) {
      setTrigger(true);
    }
  }, [selected?.id]);

  const handleDeleteNode = async (id) => {
    toast.loading(`Deleting ${selected.firstname}`);
    try {
      const res = await fetch(`/api/trees/${treeId}/nodes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete node");

      setTrigger(false);
      clearSelection();
      selected.onDelete?.(id);
    } catch (err) {
      console.error("Error deleting node:", err);
    }
    toast.dismiss();
  };

  if (!selected) return null;

  return (
    <Sheet
      open={trigger}
      onOpenChange={(isOpen) => {
        setTrigger(isOpen);
        if (!isOpen) clearSelection();
      }}
    >
      <SheetContent
        side="left"
        className="min-w-[520px] py-16 flex justify-center items-start"
      >
        <div className="flex flex-col gap-6 h-full">
          <SheetHeader className="flex-row justify-start items-start gap-10 relative">
            <div className="relative w-32 h-32">
              <Image
                alt="Person's main image"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
                src={selected.img || "/placeholder.jpg"}
              />
            </div>

            <div className="flex flex-col justify-start gap-4 h-fit w-full">
              <div>
                <h3 className="capitalize font-medium text-xl w-64 truncate">
                  {selected.firstname} {selected.middlename}
                </h3>
                <SheetTitle className="uppercase text-3xl w-64 truncate">
                  {selected.lastname}
                </SheetTitle>
              </div>

              <div className="flex justify-between items-center w-full gap-4">
                <Select
                  value={selected.confidence || ""}
                  onValueChange={async (value) => {
                    toast.loading("Saving confidence...");
                    const formatDateSafe = (d) => {
                      if (!d) return null;
                      if (
                        typeof d === "string" &&
                        /^\d{4}-\d{2}-\d{2}$/.test(d)
                      )
                        return d;
                      try {
                        const parsed = new Date(d);
                        return isNaN(parsed)
                          ? null
                          : format(parsed, "yyyy-MM-dd");
                      } catch {
                        return null;
                      }
                    };

                    try {
                      const res = await fetch(`/api/trees/${treeId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          personId: selected.id,
                          confidence: value,
                          person_tags: selected.person_tags || [],
                          gender: selected.gender,
                          dob: formatDateSafe(selected.dob),
                          dod: formatDateSafe(selected.dod),
                          birthTown: selected.birthTown,
                          birthCity: selected.birthCity,
                          birthState: selected.birthState,
                          birthCountry: selected.birthCountry,
                          notes: selected.notes || "",
                        }),
                      });

                      const result = await res.json();
                      toast.dismiss();

                      if (!res.ok || !result.success) {
                        toast.error("Failed to update confidence");
                        return;
                      }

                      toast.success("Confidence updated!");
                      selectPerson({ ...selected, confidence: value });
                    } catch (err) {
                      toast.dismiss();
                      console.error("Error updating confidence:", err);
                      toast.error("Something went wrong");
                    }
                  }}
                >
                  <SelectTrigger className="w-36 h-fit py-1" tabIndex={-1}>
                    <SelectValue>
                      {selected.confidence || "Confidence"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Unverified">Unverified</SelectItem>
                    <SelectItem value="Focus">Focus</SelectItem>
                  </SelectContent>
                </Select>

                <ConfirmModal
                  title="Are you sure you want to delete?"
                  trigger={
                    <Trash
                      size={18}
                      className="opacity-40 hover:opacity-100 duration-150"
                    />
                  }
                  description="You cannot reverse this action. Deleting a person means they are removed forever."
                  onConfirm={() => handleDeleteNode(selected.id)}
                />
              </div>
            </div>
          </SheetHeader>

          <PersonTabs />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidePanel;
