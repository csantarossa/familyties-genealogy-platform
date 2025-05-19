"use client";
import React, { useContext, useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useParams } from "next/navigation";
import ConfirmModal from "./ConfirmModal";
import { CircleCheck, CircleMinus, Trash, Edit2 } from "lucide-react";
import { useSafeToast } from "@/app/lib/toast";
import PersonTabs from "./PersonTabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatForBackend, parseDate } from "@/app/utils/parseDate";
import { PersonContext } from "@/app/contexts/PersonContext";
import PopUp from "./PopUp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const SidePanel = () => {
  const { selected, setSelected, setPeople, clearSelection } =
    useContext(PersonContext);

  const { treeId } = useParams();
  const [trigger, setTrigger] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const toast = useSafeToast();

  const [editedFirstname, setEditedFirstname] = useState("");
  const [editedMiddlename, setEditedMiddlename] = useState("");
  const [editedLastname, setEditedLastname] = useState("");

  useEffect(() => {
    if (selected?.id) {
      setTrigger(true);
      setEditedFirstname(selected.firstname || "");
      setEditedMiddlename(selected.middlename || "");
      setEditedLastname(selected.lastname || "");
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

  const handleSaveName = async () => {
    toast.loading("Saving name...");
    try {
      const res = await fetch(`/api/trees/${treeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId: selected.id,
          firstname: editedFirstname,
          middlename: editedMiddlename,
          lastname: editedLastname,
          gender: selected.gender,
          dob: formatForBackend(parseDate(selected.dob)),
          dod: formatForBackend(parseDate(selected.dod)),
          confidence: selected.confidence,
          birthTown: selected.birthTown,
          birthCity: selected.birthCity,
          birthState: selected.birthState,
          birthCountry: selected.birthCountry,
          deathTown: selected.deathTown,
          deathCity: selected.deathCity,
          deathState: selected.deathState,
          deathCountry: selected.deathCountry,
          person_tags: selected.person_tags || [],
          notes: selected.notes || "",
        }),
      });

      const result = await res.json();
      toast.dismiss();

      if (!res.ok || !result.success) {
        toast.error("Failed to save name");
        return;
      }

      toast.success("Name updated!");
      setIsEditingName(false);
      setSelected((prev) => ({
        ...prev,
        firstname: editedFirstname,
        middlename: editedMiddlename,
        lastname: editedLastname,
      }));
      setPeople((prev) =>
        prev.map((p) =>
          p.id === selected.id
            ? {
              ...p,
              firstname: editedFirstname,
              middlename: editedMiddlename,
              lastname: editedLastname,
            }
            : p
        )
      );
    } catch (err) {
      toast.dismiss();
      console.error("Error saving name:", err);
      toast.error("Something went wrong");
    }
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
        className="min-w-[520px] py-16 flex justify-center items-start bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
      >
        <div className="flex flex-col gap-6 h-full">
          <SheetHeader className="flex-row justify-start items-center gap-10 relative">
            <PopUp img={selected.profileImage || "/person_placeholder.png"} />

            <div className="flex flex-col justify-start gap-4 h-fit w-full">
              <div>
                {isEditingName ? (
                  <div className="flex flex-col gap-2 w-72">
                    <div className="flex gap-2 flex-col w-full">
                      <div className="w-full flex gap-2">
                        <div className="flex flex-col gap-1">
                          <Label className="font-medium text-sm">
                            Firstname
                          </Label>
                          <Input
                            value={editedFirstname}
                            onChange={(e) => setEditedFirstname(e.target.value)}
                            placeholder="First"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="font-medium text-sm">
                            Middlename
                          </Label>
                          <Input
                            value={editedMiddlename}
                            onChange={(e) =>
                              setEditedMiddlename(e.target.value)
                            }
                            placeholder="Middle"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="font-medium text-sm">Lastname</Label>
                        <Input
                          value={editedLastname}
                          onChange={(e) => setEditedLastname(e.target.value)}
                          placeholder="Last"
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button className="w-full" onClick={handleSaveName}>
                        Save
                      </Button>
                      <Button
                        className="w-full"
                        variant="ghost"
                        onClick={() => setIsEditingName(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-full">
                      <h3 className="capitalize font-medium text-xl w-64 truncate text-gray-900 dark:text-white">
                        {selected.firstname} {selected.middlename}
                      </h3>
                      <SheetTitle className="uppercase text-3xl w-64 truncate text-gray-800 dark:text-white">
                        {selected.lastname}
                      </SheetTitle>
                    </div>
                    <Edit2
                      size={16}
                      className="cursor-pointer text-gray-600 hover:text-black"
                      onClick={() => setIsEditingName(true)}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center w-full gap-4">
                <Select
                  value={selected.confidence || ""}
                  onValueChange={async (value) => {
                    toast.loading("Saving confidence...");
                    try {
                      const res = await fetch(`/api/trees/${treeId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          personId: selected.id,
                          firstname: selected.firstname,
                          middlename: selected.middlename,
                          lastname: selected.lastname,
                          confidence: value,
                          gender: selected.gender,
                          dob: formatForBackend(parseDate(selected.dob)),
                          dod: formatForBackend(parseDate(selected.dod)),
                          person_tags: selected.person_tags || [],
                          birthTown: selected.birthTown,
                          birthCity: selected.birthCity,
                          birthState: selected.birthState,
                          birthCountry: selected.birthCountry,
                          deathTown: selected.deathTown,
                          deathCity: selected.deathCity,
                          deathState: selected.deathState,
                          deathCountry: selected.deathCountry,
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
                      setSelected((prev) => ({ ...prev, confidence: value }));
                      setPeople((prev) =>
                        prev.map((p) =>
                          p.id === selected.id ? { ...p, confidence: value } : p
                        )
                      );
                    } catch (err) {
                      toast.dismiss();
                      console.error("Error updating confidence:", err);
                      toast.error("Something went wrong");
                    }
                  }}
                >
                  <SelectTrigger className="w-36 h-fit py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" tabIndex={-1}>
                    <SelectValue>
                      <div className="flex flex-row gap-2 items-center">
                        {selected.confidence === "Verified" ? (
                          <CircleCheck color="green" size={16} />
                        ) : (
                          <CircleMinus color="orange" size={16} />
                        )}
                        {selected.confidence}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <SelectItem value="Verified">
                      <div className="flex flex-row gap-2 items-center">
                        <CircleCheck color="green" size={16} />
                        Verified
                      </div>
                    </SelectItem>
                    <SelectItem value="Unverified">
                      <div className="flex flex-row gap-2 items-center">
                        <CircleMinus color="orange" size={16} />
                        Unverified
                      </div>
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