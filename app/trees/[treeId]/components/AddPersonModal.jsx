import React, { useContext, useState } from "react";
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
import AddPersonButton from "./AddPersonButton";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { DatePickerDemo } from "./DatePicker";
import { ArrowRightCircle } from "@geist-ui/icons";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserPlus from "@geist-ui/icons/userPlus";
import toast from "react-hot-toast";
import { AddPersonModalContext } from "../page";
import { Spinner } from "@nextui-org/spinner";
import { ChevronLeft } from "lucide-react";

const AddPersonModal = ({ trigger }) => {
  const [addPersonModal, setAddPersonModal] = useContext(AddPersonModalContext); // Manage open state
  const [progress, setProgress] = useState({ progressBar: 0, page: 1 });
  const [newPerson, setNewPerson] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    dob: "",
    dod: "",
    img: "",
    relation: "",
    relationType: "",
  });

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setProgress({ ...progress, progressBar: 100 });
    try {
      await fetch(`/api/`);
    } catch (error) {
      toast.error("Error: Person was not created");
    }

    // Close the modal
    setAddPersonModal(false);
    setProgress({ progressBar: 0, page: 1 });
    toast.success(`${newPerson?.firstname} has been added`);
    // clear all the data in the state
  };

  return (
    <div className="absolute bottom-16 right-16 z-50">
      <AlertDialog open={addPersonModal} onOpenChange={setAddPersonModal}>
        <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
        <AlertDialogContent className="w-[430px] h-[430px]">
          <AlertDialogHeader className="flex h-full flex-row justify-between items-start">
            <AlertDialogTitle className="">Add a Person</AlertDialogTitle>
            <Progress className="h-2 w-[50%]" value={progress.progressBar} />
          </AlertDialogHeader>
          <form
            onSubmit={handleSubmitForm}
            className="w-full h-full flex justify-center items-center"
          >
            <div
              className={`duration-500 h-[327px] w-full flex flex-col justify-between gap-4 ${
                progress.page === 1
                  ? "translate-x-0"
                  : "translate-x-[150%] opacity-0 hidden"
              }`}
            >
              <div className={`flex gap-4 `}>
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
              <div className="flex gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="dob" className="text-sm font-medium">
                    Date of Birth *
                  </Label>
                  <DatePickerDemo
                    placeholder={"Pick a date"}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, dob: e.target.value })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <div>
                    <Label htmlFor="dob" className="text-sm font-medium">
                      Date of Death
                    </Label>
                  </div>
                  <DatePickerDemo
                    placeholder={"Leave empty if alive"}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, dod: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="w-full flex justify-between items-center pt-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  type="button"
                  className="flex"
                  onClick={() => {
                    setProgress({ ...progress, progressBar: 50, page: 2 });
                  }}
                >
                  Next
                  <ArrowRightCircle className="" size={24} />
                </Button>
              </div>
            </div>

            {/* SECOND PAGE */}
            <div
              className={`duration-200 h-[327px] w-full flex flex-col justify-between gap-4 ${
                progress.page === 2
                  ? "translate-x-0"
                  : "translate-x-[-150%] opacity-0 hidden"
              }`}
            >
              <div className={`flex gap-4`}>
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
              </div>
              <div className="flex flex-row justify-center gap-4 items-center">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="dob" className="text-sm font-medium">
                    Initial Relation
                  </Label>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Santarossa Family</SelectLabel>
                        <SelectItem value="apple">Julie Santarossa</SelectItem>
                        <SelectItem value="banana">
                          Flavio Santarossa
                        </SelectItem>
                        <SelectItem value="blueberry">
                          Corey Santarossa
                        </SelectItem>
                        <SelectItem value="grapes">
                          Jarrod Santarossa
                        </SelectItem>
                        <SelectItem value="pineapple">
                          Scott Santarossa
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="dob" className="text-sm font-medium">
                    Type
                  </Label>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {/* <SelectLabel>Type of relationship</SelectLabel> */}
                        <SelectItem value="apple">Parent</SelectItem>
                        <SelectItem value="banana">Child</SelectItem>
                        <SelectItem value="blueberry">Sibling</SelectItem>
                        <SelectItem value="grapes">Spouse</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className={`flex gap-4`}>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Yet to decide
                  </Label>
                  <Input id="picture" type="text" />
                </div>
              </div>
              <div className="w-full flex justify-between items-center pt-3">
                <Button
                  type="button"
                  onClick={() =>
                    setProgress({ ...progress, progressBar: 0, page: 1 })
                  }
                  variant="outline"
                >
                  <ChevronLeft size={18} />
                  Back
                </Button>
                <AlertDialogAction
                  type="submit"
                  className="flex"
                  onClick={handleSubmitForm}
                >
                  Add
                  <UserPlus className="" size={24} />
                </AlertDialogAction>
              </div>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddPersonModal;
