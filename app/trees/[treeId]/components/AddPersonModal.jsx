import React, { useContext, useEffect, useState } from "react";
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
import { ArrowRightCircle } from "@geist-ui/icons";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserPlus from "@geist-ui/icons/userPlus";
import toast from "react-hot-toast";
import { AddPersonModalContext } from "../page";
import { ChevronLeft, InfoIcon } from "lucide-react";
import DatePickerInput from "./DatePickerInput";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { getPeople, getRelationshipTypes } from "@/app/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AddPersonModal = ({ trigger }) => {
  const params = useParams();
  const treeId = params?.treeId;
  const [addPersonModal, setAddPersonModal] = useContext(AddPersonModalContext);
  const [progress, setProgress] = useState({ progressBar: 0, page: 1 });
  const [dobDate, setDobDate] = useState(null);
  const [dodDate, setDodDate] = useState(null);
  const [relation, setRelation] = useState({
    relationId: null,
    relationType: null,
  });
  const [nodes, setNodes] = useState([]);
  const [relTypes, setRelTypes] = useState([]);
  const [newPerson, setNewPerson] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    gender: "",
    dob: null,
    dod: null,
    img: null,
    relation: null,
    relationType: null,
  });

  useEffect(() => {
    setNewPerson((prev) => ({
      ...prev,
      dob: dobDate ? format(dobDate, "yyyy-MM-dd") : null,
      dod: dodDate ? format(dodDate, "yyyy-MM-dd") : null,
    }));
  }, [dobDate, dodDate]);

  const getNodes = async () => {
    toast.loading("Finding potential relations");
    const people = await getPeople(treeId);
    setNodes(people);
    toast.dismiss();
  };

  const loadRelationshipTypes = async () => {
    toast.loading("Finding relationship types");
    const types = await getRelationshipTypes(treeId);
    setRelTypes(types);
    toast.dismiss();
  };

  const handleSubmitForm = async (e) => {
    const newPersonLoading = toast.loading("Creating new person");
    e.preventDefault();
    setProgress({ ...progress, progressBar: 100 });

    const personToSubmit = {
      ...newPerson,
      relation: relation.relationId,
      relationType: relation.relationType,
      gender: newPerson.gender,
    };

    try {
      const res = await fetch(`/api/trees/${treeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personToSubmit),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Unknown error");

      toast.success(`${personToSubmit?.firstname} has been added`);
      setAddPersonModal(false);
      setProgress({ progressBar: 0, page: 1 });
      setNewPerson({
        firstname: "",
        middlename: "",
        lastname: "",
        gender: "",
        dob: null,
        dod: null,
        img: null,
        relation: "",
        relationType: "",
      });
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Error: Person was not created");
    }
    toast.dismiss(newPersonLoading);
  };

  return (
    <div className="absolute bottom-16 right-16 z-50">
      <AlertDialog open={addPersonModal} onOpenChange={setAddPersonModal}>
        <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
        <AlertDialogContent className="w-[430px] h-[500px]">
          <AlertDialogHeader className="flex h-fit flex-row justify-between items-start">
            <AlertDialogTitle>Add a Person</AlertDialogTitle>
            <Progress className="h-2 w-[50%]" value={progress.progressBar} />
          </AlertDialogHeader>
          <form
            onSubmit={handleSubmitForm}
            className="w-full h-full flex justify-center items-start"
          >
            {/* PAGE 1 */}
            <div
              className={`duration-500 w-full flex flex-col ${
                progress.page === 1
                  ? "translate-x-0"
                  : "translate-x-[150%] opacity-0 hidden"
              }`}
            >
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
                {/* Firstname and Middlename */}
                <div className="flex gap-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label className="text-sm font-medium">Firstname *</Label>
                    <Input
                      type="text"
                      placeholder="Firstname"
                      onChange={(e) =>
                        setNewPerson({ ...newPerson, firstname: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label className="text-sm font-medium">Middlename</Label>
                    <Input
                      type="text"
                      placeholder="Middlename"
                      onChange={(e) =>
                        setNewPerson({ ...newPerson, middlename: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Lastname */}
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-sm font-medium">Lastname *</Label>
                  <Input
                    type="text"
                    placeholder="Lastname"
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, lastname: e.target.value })
                    }
                  />
                </div>

                {/* Gender */}
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-sm font-medium">Gender *</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewPerson({ ...newPerson, gender: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* DOB and DOD */}
                <div className="flex gap-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label className="text-sm font-medium">Date of Birth *</Label>
                    <DatePickerInput setDate={setDobDate} />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label className="text-sm font-medium">Date of Death</Label>
                    <DatePickerInput setDate={setDodDate} />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="w-full flex justify-between items-center pt-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  type="button"
                  onClick={() => {
                    setProgress({ ...progress, progressBar: 50, page: 2 });
                  }}
                  className="flex"
                >
                  Next <ArrowRightCircle size={24} />
                </Button>
              </div>
            </div>

            {/* PAGE 2 */}
            <div
              className={`duration-200 h-[327px] w-full flex flex-col justify-between gap-4 ${
                progress.page === 2
                  ? "translate-x-0"
                  : "translate-x-[-150%] opacity-0 hidden"
              }`}
            >
              {/* Profile Image */}
              <div className="flex gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-sm font-medium">Profile Image</Label>
                  <Input
                    id="picture"
                    type="file"
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, img: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Relationship + Type */}
              <div className="flex flex-row justify-center gap-4 items-center">
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-sm font-medium">Initial Relation</Label>
                  <Select
                    value={relation.relationId}
                    onValueChange={(value) => {
                      setRelation({ ...relation, relationId: value });
                    }}
                  >
                    <SelectTrigger className="w-[180px]" onClick={getNodes}>
                      <SelectValue placeholder="Select a person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="flex flex-col gap-1">
                        {nodes.map((node) => (
                          <SelectItem
                            key={node.person_id}
                            value={node.person_id.toString()}
                            className="cursor-pointer hover:bg-slate-50 capitalize"
                          >
                            {node.person_firstname} {node.person_lastname}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-sm font-medium flex gap-2 items-center">
                    Type
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon size={17} className="opacity-80" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-52 text-center">
                            How is the <strong>selected person</strong> related?
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Select
                    value={relation.relationType}
                    onValueChange={(value) =>
                      setRelation({ ...relation, relationType: value })
                    }
                  >
                    <SelectTrigger className="w-[180px]" onClick={loadRelationshipTypes}>
                      <SelectValue placeholder="Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="flex flex-col gap-1">
                        {relTypes.map((type) => (
                          <SelectItem
                            key={type.type_id}
                            value={type.type_id.toString()}
                            className="cursor-pointer hover:bg-slate-50 capitalize"
                          >
                            {type.type_name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="flex gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-sm font-medium">Notes</Label>
                  <Input id="notes" type="text" />
                </div>
              </div>

              {/* Footer */}
              <div className="w-full flex justify-between items-center pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProgress({ ...progress, progressBar: 0, page: 1 })}
                >
                  <ChevronLeft size={18} /> Back
                </Button>
                <AlertDialogAction type="submit" className="flex" onClick={handleSubmitForm}>
                  Add <UserPlus size={24} />
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