"use client";
import React, { useEffect, useState } from "react";
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
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { format } from "date-fns";
import DatePickerInput from "./DatePickerInput";
import toast from "react-hot-toast";
import BackButton from "./BackButton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GetStartedModal = ({ treeId }) => {
  const [dobDate, setDobDate] = useState(null);
  const [dodDate, setDodDate] = useState(null);
  const [formOpen, setFormOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [startMethod, setStartMethod] = useState("");

  const [newPerson, setNewPerson] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    gender: null,
    dob: null,
    dod: null,
    img: null,
  });

  useEffect(() => {
    setNewPerson((prev) => ({
      ...prev,
      dob: dobDate ? format(dobDate, "yyyy-MM-dd") : null,
      dod: dodDate ? format(dodDate, "yyyy-MM-dd") : null,
    }));
  }, [dobDate, dodDate]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    toast.loading("Creating person");
    try {
      setLoading(true);

      let uploadedImageUrl = null;
      if (file) {
        const compressedFile = await imageCompression(file, {
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

      // 📨 Send new person data
      const response = await fetch(`/api/trees/${treeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newPerson,
          img: uploadedImageUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to add person");

      const data = await response.json();
      console.log("Success:", data);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setFormOpen(false);
      toast.dismiss();
      setLoading(false);
      window.location.reload();
    }
  };

  return (
    <div>
      {startMethod === "" && (
        <AlertDialog open={formOpen} onOpenChange={setFormOpen}>
          <AlertDialogContent className="w-[500px] h-fit">
            <AlertDialogHeader className="flex h-full flex-col justify-between items-start">
              <AlertDialogTitle className="">
                Welcome to your new tree! 🎉
              </AlertDialogTitle>
              <AlertDialogDescription>
                How would you like to begin?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-between items-center">
              <div
                onClick={() => {
                  setStartMethod("blank");
                }}
                className="h-32 w-48 shadow-md rounded-xl flex flex-col justify-center items-center border p-4 hover:shadow-xl duration-200 cursor-pointer"
              >
                <h1 className="text-center font-medium">Start from scratch</h1>
              </div>
              <p>or</p>
              <div
                onClick={() => setStartMethod("gedcom")}
                className="h-32 w-48 shadow-md rounded-xl flex flex-col justify-center items-center border p-4 hover:shadow-xl duration-200 cursor-pointer"
              >
                <h1 className="text-center font-medium">Import GEDCOM file</h1>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {startMethod === "blank" ? (
        <AlertDialog open={formOpen} onOpenChange={setFormOpen}>
          <AlertDialogContent className="w-[430px] h-fit">
            <AlertDialogHeader className="flex h-full flex-col justify-between items-start">
              <AlertDialogTitle className="flex justify-between items-center w-full">
                Welcome to your new tree! 🎉
                <Button variant="secondary" onClick={() => setStartMethod("")}>
                  <ChevronLeft />
                </Button>
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
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </Label>
                <Select
                  onValueChange={(value) =>
                    setNewPerson({ ...newPerson, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
                <Label className="text-sm font-medium">Profile Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="text-sm"
                />
              </div>

              <AlertDialogAction type="submit" className="flex w-full">
                {loading ? (
                  <div className="loader"></div>
                ) : (
                  <>
                    Add your first person!
                    <UserPlus className="" size={24} />
                  </>
                )}
              </AlertDialogAction>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        // Viveks gedcom file upload feature
        ""
      )}
    </div>
  );
};

export default GetStartedModal;
