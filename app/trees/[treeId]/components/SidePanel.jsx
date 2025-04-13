import React, { useContext } from "react";
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

const SidePanel = () => {
  const [sidePanelContent, setSidePanelContent] = useContext(SidePanelContext);
  const { treeId } = useParams();

  const handleDeleteNode = async (id) => {
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
        className="min-w-[520px] max-h-screen py-16 flex justify-center items-start "
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
                <Select>
                  <SelectTrigger className="w-36 h-fit py-1" tabIndex={-1}>
                    <SelectValue placeholder={sidePanelContent.confidence} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="verified"
                      className="text-green-600 font-medium hover:text-green-600"
                    >
                      Verified
                    </SelectItem>
                    <SelectItem
                      value="unverified"
                      className="text-red-600 font-medium hover:text-red-600"
                    >
                      Unverified
                    </SelectItem>
                    <SelectItem
                      value="focus"
                      className="text-blue-600 font-medium hover:text-blue-600"
                    >
                      Focus
                    </SelectItem>
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
