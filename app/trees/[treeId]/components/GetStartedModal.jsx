import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight, UserPlus } from "lucide-react";
import { format } from "date-fns";
import DatePickerInput from "./DatePickerInput";

const GetStartedModal = ({ treeId }) => {
  const [dobDate, setDobDate] = useState(null);
  const [dodDate, setDodDate] = useState(null);
  const [formOpen, setFormOpen] = useState(true);
  const [newPerson, setNewPerson] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    dob: null,
    dod: null,
    img: null,
  });

  // ✅ Sync formatted date when dobDate or dodDate updates
  useEffect(() => {
    setNewPerson((prev) => ({
      ...prev,
      dob: dobDate ? format(dobDate, "yyyy-MM-dd") : null,
      dod: dodDate ? format(dodDate, "yyyy-MM-dd") : null,
    }));
  }, [dobDate, dodDate]);

  const handleSubmitForm = async () => {
    try {
      const response = await fetch(`/api/trees/${treeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPerson),
      });

      if (!response.ok) {
        throw new Error("Failed to add person");
      }

      const data = await response.json();
      console.log("Success:", data);
      handleSubmitForm();
      setFormOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div>
      <AlertDialog open={formOpen} onOpenChange={setFormOpen}>
        <AlertDialogContent className="w-[430px] h-fit">
          <AlertDialogHeader className="flex h-full flex-col justify-between items-start">
            <AlertDialogTitle className="">
              Welcome to your new tree! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription>
              Let&apos;s Get Started
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form
            onSubmit={handleSubmitForm}
            className="w-full h-full flex flex-col justify-center items-center gap-3"
          >
            <div className={`flex gap-4 w-full`}>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Firstname *
                </Label>
                <Input
                  type="text"
                  id="firstname"
                  placeholder="Firstname"
                  onChange={(e) =>
                    setNewPerson({ ...newPerson, firstname: e.target.value })
                  }
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Middlename
                </Label>
                <Input
                  type="text"
                  id="middlename"
                  placeholder="Middlename"
                  onChange={(e) =>
                    setNewPerson({ ...newPerson, middlename: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Lastname *
              </Label>
              <Input
                type="text"
                id="lastname"
                placeholder="Lastname"
                onChange={(e) =>
                  setNewPerson({ ...newPerson, lastname: e.target.value })
                }
              />
            </div>
            <div className="flex gap-4 w-full">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="dob" className="text-sm font-medium">
                  Date of Birth *
                </Label>

                <DatePickerInput date={dobDate} setDate={setDobDate} />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <div>
                  <Label htmlFor="dod" className="text-sm font-medium">
                    Date of Death
                  </Label>
                </div>
                <DatePickerInput setDate={setDodDate} />
              </div>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Profile Image
              </Label>
              <Input
                id="picture"
                type="file"
                onChange={(e) =>
                  setNewPerson({ ...newPerson, img: e.target.value })
                }
              />
            </div>

            <AlertDialogAction type="submit" className="flex w-full">
              Add your first person!
              <UserPlus className="" size={24} />
            </AlertDialogAction>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GetStartedModal;
