import React, { useContext, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidePanelContext } from "../page";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import PersonTabs from "./PersonTabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "@geist-ui/icons";
import { useParams } from "next/navigation";
import ConfirmModal from "./ConfirmModal";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect } from "react";


const SidePanel = () => {
  const [sidePanelContent, setSidePanelContent] = useContext(SidePanelContext);
  const { treeId } = useParams();

  // State for confidence verification
  const [editedConfidence, setEditedConfidence] = useState(sidePanelContent.confidence || "");

  useEffect(() => {
    if (sidePanelContent.trigger && sidePanelContent.id) {
      fetch(`/api/trees/${sidePanelContent.treeId}/nodes/${sidePanelContent.id}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch person data");
          const text = await res.text();
          const data = text ? JSON.parse(text) : null;
  
          if (!data || !data.person) throw new Error("No person found");
  
          setSidePanelContent((prev) => ({
            ...prev,
            ...data.person,
          }));
        })
        .catch((err) => {
          console.error("❌ Failed to fetch person:", err);
        });
    }
  }, [sidePanelContent.trigger]);
  
  

  const handleDeleteNode = async (id) => {
    toast.loading(`Deleting ${sidePanelContent.firstname}`);
    try {
      const res = await fetch(`/api/trees/${treeId}/nodes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete node");
      console.log("Node deleted successfully");

      // Close side panel
      setSidePanelContent({
        ...sidePanelContent,
        trigger: false,
      });

      // Optional: trigger refresh or notify parent to update UI
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
        setSidePanelContent({
          ...sidePanelContent,
          trigger: false,
        })
      }
    >
      <SheetContent
        side="left"
        className="min-w-[520px] py-16 flex justify-center items-start "
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
                  src={sidePanelContent.img}
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

              {/* CONFIDENCE SCORE DROPDOWN */}
              <div className="flex justify-between items-center w-full">
              <Select
                value={editedConfidence}

                onValueChange={async (value) => {
                  setEditedConfidence(value);
                
                  try {
                    toast.loading("Updating confidence...");
                
                    const res = await fetch(`/api/trees/${sidePanelContent.treeId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        personId: sidePanelContent.id,
                        confidence: value,
                        person_tags: sidePanelContent.person_tags || [], // ✅ preserve tags
                        gender: sidePanelContent.gender,
                        dob: sidePanelContent.dob,
                        dod: sidePanelContent.dod,
                        birthTown: sidePanelContent.birthTown,
                        birthCity: sidePanelContent.birthCity,
                        birthState: sidePanelContent.birthState,
                        birthCountry: sidePanelContent.birthCountry,
                        gallery: sidePanelContent.gallery,
                        additionalInfo: sidePanelContent.additionalInfo,
                      }),
                    });
                
                    const text = await res.text();
                    const result = text ? JSON.parse(text) : {};
                
                    toast.dismiss();
                
                    if (!res.ok || !result.success) {
                      toast.error("Failed to update confidence");
                      return;
                    }
                
                    toast.success("Confidence updated!");
                
                    // ✅ Update state to re-render component properly
                    setSidePanelContent((prev) => ({
                      ...prev,
                      confidence: value,
                      tags: prev.person_tags || [],
                    }));
                  } catch (err) {
                    toast.dismiss();
                    console.error("Error updating confidence:", err);
                    toast.error("Something went wrong");
                  }
                }}
                

              >
                <SelectTrigger className="w-36 h-fit py-1" tabIndex={-1}>
                  <SelectValue placeholder={editedConfidence || "Confidence"} />
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
                  onConfirm={() => handleDeleteNode(sidePanelContent.id)}
                  className=""
                />
              </div>
            </div>
          </SheetHeader>

          <PersonTabs />
        </div>

        <div>{sidePanelContent.other}</div>
      </SheetContent>
    </Sheet>
  );
};

export default SidePanel;
