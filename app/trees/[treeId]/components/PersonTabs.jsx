import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidePanelContext } from "../page";
import PopUp from "./PopUp";
import { Camera, Plus } from "@geist-ui/icons";
import UploadImage from "./UploadImage";
import Image from "next/image";
import {
  AxeIcon,
  BabyIcon,
  Edit,
  Edit2,
  EditIcon,
  Heart,
  HeartIcon,
  SunIcon,
  UserIcon,
  Users,
  UsersIcon,
} from "lucide-react";
import {
  getImmediateFamily,
  getSiblingsBySharedParents,
  getSpouses,
} from "@/app/actions";
import toast from "react-hot-toast";
import DatePickerInput from "./DatePickerInput";
import { format } from "date-fns";
//
const PersonTabs = () => {
  const [sidePanelContent, setSidePanelContent] = useContext(SidePanelContext);
  const [relationships, setRelationships] = useState([]);
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [isEditingCareer, setIsEditingCareer] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [editedGender, setEditedGender] = useState(sidePanelContent.gender);
  const [editedDob, setEditedDob] = useState(sidePanelContent.dob);
  const [editedDod, setEditedDod] = useState(sidePanelContent.dod);
  const [editedCareer, setEditedCareer] = useState(
    sidePanelContent.additionalInfo?.career || []
  );
  const [editedEducation, setEditedEducation] = useState(
    sidePanelContent.additionalInfo?.education || []
  );
  const [siblings, setSiblings] = useState([]);

  useEffect(() => {
    handleGetRelationships();
  }, []);

  const handleGetRelationships = async () => {
    toast.loading("Loading sidepanel");
    const data = await getImmediateFamily(sidePanelContent.id);
    const siblingData = await getSiblingsBySharedParents(sidePanelContent.id);
    setSiblings(siblingData);
    setRelationships(data);
    toast.dismiss();
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        personId: sidePanelContent.id,
        gender: editedGender,
        dob: editedDob,
        dod: editedDod,
        birthTown: sidePanelContent.birthTown,
        birthCity: sidePanelContent.birthCity,
        birthState: sidePanelContent.birthState,
        birthCountry: sidePanelContent.birthCountry,
        additionalInfo: {
          ...sidePanelContent.additionalInfo,
          career: editedCareer,
          education: editedEducation,
        },
        gallery: sidePanelContent.gallery,
      };

      const res = await fetch(`/api/trees/${sidePanelContent.treeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to update");
        return;
      }

      toast.success("Updated successfully!");
      setSidePanelContent((prev) => ({
        ...prev,
        gender: editedGender,
        dob: editedDob,
        additionalInfo: {
          ...prev.additionalInfo,
          career: editedCareer,
          education: editedEducation,
        },
      }));
      setIsEditingGeneral(false);
      setIsEditingCareer(false);
      setIsEditingEducation(false);
    } catch (err) {
      console.error(err);
      toast.error("Error updating person");
    }
  };

  const birthLocation = [
    sidePanelContent.birthTown,
    sidePanelContent.birthCity,
    sidePanelContent.birthState,
    sidePanelContent.birthCountry,
  ];

  return (
    <div className="max-h-full overflow-hidden">
      <Tabs defaultValue="account" className="w-[400px] h-full">
        <TabsList className="grid w-full grid-cols-4 ">
          <TabsTrigger className="hover:bg-gray-200" value="info">
            Info
          </TabsTrigger>
          <TabsTrigger className="hover:bg-gray-200" value="gallery">
            Gallery
          </TabsTrigger>
          <TabsTrigger
            className="hover:bg-gray-200"
            disabled={true}
            value="audio"
          >
            Audio
          </TabsTrigger>
          <TabsTrigger
            className="hover:bg-gray-200"
            disabled={true}
            value="other"
          >
            Other
          </TabsTrigger>
        </TabsList>

        {/* Info tab */}
        <TabsContent value="info" className="h-full overflow-auto ">
          <Card className="border-none shadow-none h-full">
            {/* General Info Section */}
            <CardHeader className="flex flex-row justify-between">
              <CardTitle className="text-lg">General Information</CardTitle>
              <div className="flex gap-4 h-full justify-between items-center">
                <Edit2
                  size={16}
                  className="cursor-pointer"
                  onClick={() => setIsEditingGeneral(!isEditingGeneral)}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {/* Gender */}
              <div className="space-y-0">
                <Label htmlFor="gender" className="font-semibold text-sm">
                  Gender
                </Label>
                {isEditingGeneral ? (
                  <Input
                    value={editedGender}
                    onChange={(e) => setEditedGender(e.target.value)}
                    className="text-sm"
                  />
                ) : (
                  <p className="border-none p-0 h-fit rounded-sm py-1 capitalize text-sm">
                    {sidePanelContent.gender}
                  </p>
                )}
              </div>
              <hr />
              {/* Birth */}
              <div className="space-y-0">
                <Label htmlFor="born" className="font-semibold text-sm">
                  Birth
                </Label>
                {isEditingGeneral ? (
                  <DatePickerInput date={editedDob} setDate={setEditedDob} />
                ) : (
                  <p className="border-none py-1 h-fit text-sm">{`${sidePanelContent.dob}`}</p>
                )}
                {!isEditingGeneral && (
                  <a
                    className="flex flex-wrap underline underline-offset-2 text-sm"
                    target="_blank"
                    href={`https://www.google.com/search?q=${birthLocation.join(
                      " "
                    )}`}
                  >
                    {birthLocation.map(
                      (item, index) =>
                        item && (
                          <p key={index}>
                            {item}
                            {index < birthLocation.length - 1 ? ", " : ""}
                          </p>
                        )
                    )}
                  </a>
                )}
              </div>
              <hr />
              {/* Death */}
              <div className="space-y-0">
                <Label htmlFor="death" className="font-semibold text-sm">
                  Death
                </Label>
                {isEditingGeneral ? (
                  <DatePickerInput date={editedDod} setDate={setEditedDod} />
                ) : (
                  <p className="text-sm">{sidePanelContent.dod}</p>
                )}
              </div>
              {/* Save/Cancel Buttons */}
              {isEditingGeneral && (
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSave}>Save</Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditedGender(sidePanelContent.gender);
                      setEditedDob(sidePanelContent.dob || "");
                      setIsEditingGeneral(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
            <hr />

            {/* Relationships */}
            <CardHeader className="flex flex-row justify-between">
              <CardTitle className="text-lg">Relationships</CardTitle>
              <div className="flex gap-4 h-full justify-between items-center">
                <Edit2 size={16} className="cursor-pointer" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 justify-start">
              <div>
                <h1 className="text-xs font-medium pb-1">Parents</h1>
                {relationships.map((item) =>
                  item.direction === "parent" ? (
                    <Label
                      key={item.relationship_id}
                      className="font-semibold text-sm flex items-center justify-start gap-2 pl-2"
                    >
                      {item.other_person_firstname} {item.other_person_lastname}
                    </Label>
                  ) : null
                )}
              </div>
              <hr />

              <div>
                <h1 className="text-xs font-medium pb-1">Children</h1>
                {relationships.map((item) =>
                  item.direction === "child" ? (
                    <Label
                      key={item.relationship_id}
                      className="font-semibold text-sm flex items-center justify-start gap-2 pl-2"
                    >
                      {item.other_person_firstname} {item.other_person_lastname}
                    </Label>
                  ) : null
                )}
              </div>
              <hr />
              <div>
                <h1 className="text-xs font-medium pb-1">Spouse</h1>
                {relationships.map((item) => (
                  <div
                    key={item.relationship_id}
                    className="flex justify-start items-center"
                  >
                    {item.type_name === "spouse" && (
                      <Label className="font-semibold text-sm flex items-center justify-start gap-2 pl-2">
                        {item.other_person_firstname}{" "}
                        {item.other_person_lastname}
                      </Label>
                    )}
                  </div>
                ))}
              </div>
              <hr />

              <div>
                <h1 className="text-xs font-medium pb-1">Siblings</h1>
                {siblings.length > 0 &&
                  siblings.map((sibling) => (
                    <Label
                      key={sibling.person_id}
                      className="font-semibold text-sm flex items-center justify-start gap-2 pl-2"
                    >
                      {sibling.person_firstname} {sibling.person_lastname}
                    </Label>
                  ))}
              </div>
            </CardContent>
            <hr />

            <hr />

            {/* This part is still experimental */}

            {/* Career */}
            <CardHeader className="flex flex-row justify-between">
              <CardTitle className="text-lg">Career</CardTitle>
              <div className="flex gap-4 h-full justify-between items-center">
                <Plus size={20} />
                <Edit2
                  size={16}
                  className="cursor-pointer"
                  onClick={() => setIsEditingCareer(!isEditingCareer)}
                />
              </div>
            </CardHeader>

            {editedCareer.map((job, index) => (
              <CardContent key={index} className="flex flex-col gap-3">
                {isEditingCareer ? (
                  <div className="space-y-2">
                    <Input
                      value={job.title}
                      placeholder="Job Title"
                      onChange={(e) => {
                        const newCareer = [...editedCareer];
                        newCareer[index].title = e.target.value;
                        setEditedCareer(newCareer);
                      }}
                    />
                    <Input
                      value={job.institution}
                      placeholder="Company"
                      onChange={(e) => {
                        const newCareer = [...editedCareer];
                        newCareer[index].institution = e.target.value;
                        setEditedCareer(newCareer);
                      }}
                    />
                    <Input
                      value={job.institution_location}
                      placeholder="Location"
                      onChange={(e) => {
                        const newCareer = [...editedCareer];
                        newCareer[index].institution_location = e.target.value;
                        setEditedCareer(newCareer);
                      }}
                    />
                    <Input
                      value={job.start_date}
                      placeholder="Start Date"
                      onChange={(e) => {
                        const newCareer = [...editedCareer];
                        newCareer[index].start_date = e.target.value;
                        setEditedCareer(newCareer);
                      }}
                    />
                    <Input
                      value={job.end_date}
                      placeholder="End Date (or leave blank)"
                      onChange={(e) => {
                        const newCareer = [...editedCareer];
                        newCareer[index].end_date = e.target.value;
                        setEditedCareer(newCareer);
                      }}
                    />
                    <Input
                      value={job.description}
                      placeholder="Job Description"
                      onChange={(e) => {
                        const newCareer = [...editedCareer];
                        newCareer[index].description = e.target.value;
                        setEditedCareer(newCareer);
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <Label className="font-semibold text-sm">{job.title}</Label>
                    <p className="text-sm font-medium">{job.institution}</p>
                    <p className="text-sm">{job.institution_location}</p>
                    <CardDescription>{job.description}</CardDescription>
                    <p className="text-sm">
                      {job.start_date} - {job.end_date || "Present"}
                    </p>
                  </div>
                )}
              </CardContent>
            ))}

            {/* Education */}
            <CardHeader className="flex flex-row justify-between">
              <CardTitle className="text-lg">Education</CardTitle>
              <div className="flex gap-4 h-full justify-between items-center">
                <Plus size={20} />
                <Edit2 size={16} />
              </div>
            </CardHeader>
            {sidePanelContent.additionalInfo.education.map((job, index) => (
              <CardContent className="gap-6 flex flex-col" key={index}>
                <div className="flex justify-start items-center">
                  <div className="w-full flex flex-col gap-1">
                    <div className="flex items-start justify-start gap-3">
                      {/* IMAGE HERE */}
                      <Image
                        src={job.institution_logo}
                        height={40}
                        width={40}
                        className="rounded-sm mt-1"
                        alt="Institution Logo"
                      />
                      <div>
                        <Label
                          htmlFor="spouse"
                          className="font-semibold text-base"
                        >
                          {job.title}
                        </Label>
                      </div>
                    </div>
                    <div className="flex justify-between items-center ">
                      <p className="text-sm font-medium text-start w-[50%]">
                        {job.institution}
                      </p>

                      <p className="text-sm text-end">
                        {job.institution_location}
                      </p>
                    </div>
                    <CardDescription className="text-sm">
                      {job.description}
                    </CardDescription>
                    <div className="flex items-center gap-3">
                      <p className="border-none p-0 h-fit rounded-sm py-1 capitalize text-sm">
                        {job.start_date}
                      </p>
                      <p>-</p>
                      <p className="border-none p-0 h-fit rounded-sm py-1 capitalize text-sm">
                        {job.end_date || "Present"}
                      </p>
                    </div>
                  </div>
                </div>
                <hr />
              </CardContent>
            ))}
          </Card>
        </TabsContent>

        {/* Gallery */}
        <TabsContent value="gallery">
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle>Gallery</CardTitle>

              {/* <CardDescription>
                Change your password here. After sl be logged out.
              </CardDescription> */}
            </CardHeader>
            {sidePanelContent.gallery ? (
              <CardContent className="grid grid-cols-3 justify-center w-full items-center p-0 m-0 gap-3">
                <label htmlFor="uploadFile">
                  <UploadImage />
                </label>
                <input type="file" id="uploadFile" className="hidden" />
                {Array.isArray(sidePanelContent.gallery) &&
                  sidePanelContent?.gallery.map((img, index) => (
                    <div key={index} className="w-28 h-28 relative">
                      <PopUp img={img} index={index} />
                    </div>
                  ))}
              </CardContent>
            ) : (
              // Upload file replacing ugly input for image
              <CardContent className="grid grid-cols-3 justify-center w-full items-center p-0 m-0 gap-3 ">
                <label htmlFor="uploadFile">
                  <UploadImage />
                </label>
                <input type="file" id="uploadFile" className="hidden" />
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonTabs;
