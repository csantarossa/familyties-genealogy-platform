import React, { useContext, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";

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
  const [imageFile, setImageFile] = useState(null);
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
    e.preventDefault();
    const newPersonLoading = toast.loading("Creating new person");
    setProgress({ ...progress, progressBar: 100 });

    try {
      let uploadedImageUrl = null;

      // ✅ Upload the image first if one was selected
      if (imageFile) {
        const compressedFile = await imageCompression(imageFile, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        const formData = new FormData();
        formData.append("file", compressedFile);

        const uploadRes = await fetch(`/api/trees/${treeId}/s3-upload`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;
      }

      // ✅ Construct full person object
      const personToSubmit = {
        ...newPerson,
        img: uploadedImageUrl,
        relation: relation.relationId,
        relationType: relation.relationType,
      };

      const res = await fetch(`/api/trees/${treeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personToSubmit),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Unknown error");
      }

      toast.success(`${personToSubmit?.firstname} has been added`);
      setAddPersonModal(false);
      setProgress({ progressBar: 0, page: 1 });
      setNewPerson({
        firstname: "",
        middlename: "",
        lastname: "",
        dob: null,
        dod: null,
        img: null,
        relation: "",
        relationType: "",
      });
      setImageFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Error: Person was not created");
    } finally {
      toast.dismiss(newPersonLoading);
      window.location.reload();
    }
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
                  <DatePickerInput setDate={setDobDate} />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <div>
                    <Label htmlFor="dob" className="text-sm font-medium">
                      Date of Death
                    </Label>
                  </div>
                  <DatePickerInput setDate={setDodDate} />
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
                    onChange={(e) => {
                      setImageFile(e.target.files[0]);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-row justify-center gap-4 items-center">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="dob" className="text-sm font-medium">
                    Initial Relation
                  </Label>
                  <Select
                    value={relation.relationId}
                    onValueChange={(value) => {
                      setRelation({ ...relation, relationId: value });
                    }}
                  >
                    <SelectTrigger
                      className="w-[180px]"
                      onClick={() => getNodes()}
                    >
                      <SelectValue placeholder="Select a person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="flex flex-col gap-1">
                        {nodes.map((node) => (
                          <SelectItem
                            className="cursor-pointer hover:bg-slate-50 capitalize"
                            key={node.person_id}
                            value={node.person_id.toString()}
                          >
                            {node.person_firstname} {node.person_lastname}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label
                    htmlFor="dob"
                    className="text-sm font-medium flex gap-2 justify-start items-center"
                  >
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
                    <SelectTrigger
                      className="w-[180px]"
                      onClick={() => loadRelationshipTypes()}
                    >
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
              <div className={`flex gap-4`}>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Notes
                  </Label>
                  <Input id="notes" type="text" />
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
