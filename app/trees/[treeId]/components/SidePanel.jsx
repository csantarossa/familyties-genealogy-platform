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

const SidePanel = () => {
  const [sidePanelContent, setSidePanelContent] = useContext(SidePanelContext);
  const { treeId } = useParams();

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
        className="w-[520px] max-h-screen md:max-w-full py-16 flex justify-center items-start "
      >
        <div className="flex flex-col gap-6 h-full">
          <SheetHeader className="flex-row justify-start items-start gap-10 relative">
            <div className="relative w-32 h-32">
              <Image
                alt="Person's main image"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
                src={sidePanelContent.img}
              />
            </div>

            <div className="flex flex-col justify-start gap-4 h-fit">
              <div>
                <h3 className="capitalize font-medium text-xl">
                  {sidePanelContent.firstname} {sidePanelContent.middlename}
                </h3>
                <SheetTitle className="uppercase text-3xl">
                  {sidePanelContent.lastname}
                </SheetTitle>
              </div>

              {/* CONFIDENCE SCORE DROPDOWN */}
              <Select>
                <SelectTrigger className="w-full h-fit py-1" tabIndex={-1}>
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
