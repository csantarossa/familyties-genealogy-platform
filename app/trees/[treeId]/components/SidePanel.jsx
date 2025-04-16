import React, { useContext, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidePanelContext } from "../page";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import PersonTabs from "./PersonTabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const SidePanel = () => {
  const [sidePanelContent, setSidePanelContent] = useContext(SidePanelContext);
  const { treeId } = useParams();

  useEffect(() => {
    if (sidePanelContent.trigger && sidePanelContent.id) {
      fetch(`/api/trees/${treeId}/nodes/${sidePanelContent.id}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch person data");
          const text = await res.text();
          const data = text ? JSON.parse(text) : null;

          if (!data || !data.person) throw new Error("No person found");

          setSidePanelContent((prev) => ({
            ...prev,
            ...data.person,
            trigger: prev.trigger,
            id: prev.id,
            treeId: prev.treeId,
          }));
        })
        .catch((err) => {
          console.error("❌ Failed to fetch person:", err);
        });
    }
  }, [sidePanelContent.trigger, sidePanelContent.id]);

  const handleDeleteNode = async (id) => {
    toast.loading(`Deleting ${sidePanelContent.firstname}`);
    try {
      const res = await fetch(`/api/trees/${treeId}/nodes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete node");

      setSidePanelContent({
        ...sidePanelContent,
        trigger: false,
      });

      if (sidePanelContent.onDelete) {
        sidePanelContent.onDelete(id);
      }
    } catch (err) {
      console.error("Error deleting node:", err);
    }
    toast.dismiss();
  };

  return (
    <Sheet
      open={sidePanelContent.trigger}
      onOpenChange={() =>
        setSidePanelContent({ ...sidePanelContent, trigger: false })
      }
    >
      <SheetContent
        side="left"
        className="min-w-[520px] py-16 flex justify-center items-start"
      >
        <div className="flex flex-col gap-6 h-full">
          <SheetHeader className="flex-row justify-start items-start gap-10 relative">
            <div>
              <div className="relative w-32 h-32">
                <Image
                  alt="Person's main image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                  src={sidePanelContent.img || "/placeholder.jpg"}
                />
              </div>
            </div>

            <div className="flex flex-col justify-start gap-4 h-fit w-full">
              <div>
                <h3 className="capitalize font-medium text-xl w-64 truncate">
                  {sidePanelContent.firstname} {sidePanelContent.middlename}
                </h3>
                <SheetTitle className="uppercase text-3xl w-64 truncate">
                  {sidePanelContent.lastname}
                </SheetTitle>
              </div>

              <div className="flex justify-between items-center w-full gap-4">
              
              {/* Confidence Dropdown */}
              <Select
                value={sidePanelContent.confidence || ""}
                onValueChange={async (value) => {
                  toast.loading("Saving confidence...");
                  const formatDateSafe = (d) => {
                    if (!d) return null;
                    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
                    try {
                      const parsed = new Date(d);
                      return isNaN(parsed) ? null : format(parsed, "yyyy-MM-dd");
                    } catch {
                      return null;
                    }
                  };
                  
                  try {
                    const res = await fetch(`/api/trees/${treeId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        personId: sidePanelContent.id,
                        confidence: value,
                        person_tags: sidePanelContent.person_tags || [],
                        gender: sidePanelContent.gender,
                        dob: formatDateSafe(sidePanelContent.dob), // ✅ always string
                        dod: formatDateSafe(sidePanelContent.dod),
                        birthTown: sidePanelContent.birthTown,
                        birthCity: sidePanelContent.birthCity,
                        birthState: sidePanelContent.birthState,
                        birthCountry: sidePanelContent.birthCountry,
                        notes: sidePanelContent.notes || "",
                      }),
                    });

                    const result = await res.json();
                    toast.dismiss();

                    if (!res.ok || !result.success) {
                      toast.error("Failed to update confidence");
                      return;
                    }

                    toast.success("Confidence updated!");

                    setSidePanelContent((prev) => ({
                      ...prev,
                      confidence: value,
                    }));
                  } catch (err) {
                    toast.dismiss();
                    console.error("Error updating confidence:", err);
                    toast.error("Something went wrong");
                  }
                }}
              >
              <SelectTrigger className="w-36 h-fit py-1" tabIndex={-1}>
                <SelectValue>{sidePanelContent.confidence || "Confidence"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Unverified">Unverified</SelectItem>
                <SelectItem value="Focus">Focus</SelectItem>
              </SelectContent>
            </Select>

            {/* Delete Button */}
            <ConfirmModal
              title="Are you sure you want to delete?"
              trigger={
                <Trash
                  size={18}
                  className="opacity-40 hover:opacity-100 duration-150"
                />
              }
              description="You cannot reverse this action. Deleting a person means they are removed forever."
              onConfirm={() => handleDeleteNode(sidePanelContent.id)}
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
