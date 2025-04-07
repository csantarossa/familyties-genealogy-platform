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
import { Edit, Edit2 } from "lucide-react";
import { getSpouses } from "@/app/actions";
import toast from "react-hot-toast";

const PersonTabs = () => {
  const [sidePanelContent, setSidePanelContent] = useContext(SidePanelContext);
  const [relationships, setRelationships] = useState([]);
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [isEditingCareer, setIsEditingCareer] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [editedGender, setEditedGender] = useState(sidePanelContent.gender);
  const [editedDob, setEditedDob] = useState(sidePanelContent.dob?.date || "");
  const [editedCareer, setEditedCareer] = useState(
    sidePanelContent.additionalInfo?.career || []
  );
  const [editedEducation, setEditedEducation] = useState(
    sidePanelContent.additionalInfo?.education || []
  );

  //Fetch relationship on component mount
  useEffect(() => {
    handleGetRelationships();
  }, []);

  console.log(sidePanelContent);
  const handleGetRelationships = async () => {
    const data = await getSpouses(sidePanelContent.id);
    setRelationships(data);
  };
  //=====================================
  // Format DOB into YYYY-MM-DD if needed
  //=====================================
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return null;
  };
  //====================================
  // Save edited general info to backend
  //=====================================
  const handleSave = async () => {
    const formattedDob = formatDate(editedDob);

    const updatedData = {
      personId: sidePanelContent.id,
      gender: editedGender,
      dob: {
        ...sidePanelContent.dob,
        date: formattedDob,
      },
      dod:
        sidePanelContent.dod?.date &&
        sidePanelContent.dod?.date.toLowerCase() !== "alive"
          ? { date: formatDate(sidePanelContent.dod?.date) }
          : { date: null },
      birthTown: sidePanelContent.dob?.birthTown,
      birthCity: sidePanelContent.dob?.birthCity,
      birthState: sidePanelContent.dob?.birthState,
      birthCountry: sidePanelContent.dob?.birthCountry,
      additionalInfo: {
        ...sidePanelContent.additionalInfo,
        career: editedCareer,
        education: editedEducation,
      },
      gallery: sidePanelContent.gallery,
    };

    try {
      const res = await fetch(`/api/trees/${sidePanelContent.tree_id}`, {
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
        dob: { ...prev.dob, date: formattedDob },
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
    sidePanelContent.dob.birthTown,
    sidePanelContent.dob.birthCity,
    sidePanelContent.dob.birthState,
    sidePanelContent.dob.birthCountry,
  ];

  return (
    <div className="max-h-full overflow-y-auto">
      <Tabs defaultValue="account" className="w-[400px] h-full flex flex-col">
        <div className="sticky top-0 z-10 bg-white">
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-4 ">
          <TabsTrigger className="hover:bg-gray-200" value="info">Info</TabsTrigger>
          <TabsTrigger className="hover:bg-gray-200" value="gallery">Gallery</TabsTrigger>
          <TabsTrigger className="hover:bg-gray-200" disabled={true} value="audio">Audio</TabsTrigger>
          <TabsTrigger className="hover:bg-gray-200" disabled={true} value="other">Other</TabsTrigger>
        </TabsList>
        </div>

        {/* Info tab */}
        <TabsContent value="info" className="flex-1 overflow-y-auto">
          <Card className="border-none shadow-none">
            {/* General Info Section */}
            <CardHeader className="flex flex-row justify-between">
              <CardTitle className="text-lg">General Information</CardTitle>
              <div className="flex gap-4 h-full justify-between items-center">
                <Plus size={20} />
                <Edit2 size={16} className="cursor-pointer" onClick={() => setIsEditingGeneral(!isEditingGeneral)}/>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {/* Gender */}
              <div className="space-y-0">
                <Label htmlFor="gender" className="font-semibold text-sm">Gender</Label>
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
              </div><hr />

              {/* Birth */}
              <div className="space-y-0">
                <Label htmlFor="born" className="font-semibold text-sm">Birth</Label>
                {isEditingGeneral ? (
                  <Input
                    value={editedDob}
                    onChange={(e) => setEditedDob(e.target.value)}
                    className="text-sm"
                  />
                ) : (
                  <p className="border-none py-1 h-fit text-sm">{`${sidePanelContent.dob.date}`}</p>
                )}
                {!isEditingGeneral && (
                  <a
                    className="flex flex-wrap underline underline-offset-2 text-sm"
                    target="_blank"
                    href={`https://www.google.com/search?q=${birthLocation.join(" ")}`}
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
              </div> <hr />

              {/* Death */}
              <div className="space-y-0">
                <Label htmlFor="death" className="font-semibold text-sm">Death</Label>
                {isEditingGeneral ? (
                  <Input
                    value={sidePanelContent.dod?.date?.toLowerCase() === "alive" ? "" : sidePanelContent.dod?.date || ""}
                    placeholder="e.g. 1995-03-21 or leave blank if alive"
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setSidePanelContent((prev) => ({
                        ...prev,
                        dod: {
                          ...prev.dod,
                          date: newDate || "Alive",
                        },
                      }));
                    }}
                  />
                ) : (
                  <p className="text-sm">
                    {sidePanelContent.dod?.date || "Present"}
                  </p>
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
                      setEditedDob(sidePanelContent.dob?.date || "");
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
            <CardHeader>
              <CardTitle className="text-lg">Relationships</CardTitle>
            </CardHeader>
            {relationships.map((item) => (
              <CardContent key={item.relationship_id}>
                <div className="space-y-0 flex justify-start items-center gap-3">
                  {/* IMAGE HERE */}
                  <div>
                    <Label
                      htmlFor="spouse"
                      className="font-semibold text-sm flex"
                    >
                      {item.other_person_firstname} {item.other_person_lastname}
                    </Label>
                  </div>
                </div>
              </CardContent>
            ))}
            <hr />
          
            {/* This part is still experimental */}

            {/* Career */}
            <CardHeader className="flex flex-row justify-between">
              <CardTitle className="text-lg">Career</CardTitle>
              <div className="flex gap-4 h-full justify-between items-center">
                <Plus size={20} />
                <Edit2 size={16} className="cursor-pointer" onClick={() => setIsEditingCareer(!isEditingCareer)}/>
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
                  <p className="text-sm">{job.start_date} - {job.end_date || "Present"}</p>
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

            {editedEducation.map((edu, index) => (
              <CardContent key={index} className="flex flex-col gap-3">
                {isEditingEducation ? (
                  <div className="space-y-2">
                    <Input
                      value={edu.title}
                      placeholder="Degree / Qualification"
                      onChange={(e) => {
                        const newEdu = [...editedEducation];
                        newEdu[index].title = e.target.value;
                        setEditedEducation(newEdu);
                      }}
                    />
                    <Input
                      value={edu.institution}
                      placeholder="Institution"
                      onChange={(e) => {
                        const newEdu = [...editedEducation];
                        newEdu[index].institution = e.target.value;
                        setEditedEducation(newEdu);
                      }}
                    />
                    <Input
                      value={edu.institution_location}
                      placeholder="Location"
                      onChange={(e) => {
                        const newEdu = [...editedEducation];
                        newEdu[index].institution_location = e.target.value;
                        setEditedEducation(newEdu);
                      }}
                    />
                    <Input
                      value={edu.start_date}
                      placeholder="Start Date"
                      onChange={(e) => {
                        const newEdu = [...editedEducation];
                        newEdu[index].start_date = e.target.value;
                        setEditedEducation(newEdu);
                      }}
                    />
                    <Input
                      value={edu.end_date}
                      placeholder="End Date"
                      onChange={(e) => {
                        const newEdu = [...editedEducation];
                        newEdu[index].end_date = e.target.value;
                        setEditedEducation(newEdu);
                      }}
                    />
                    <Input
                      value={edu.description}
                      placeholder="Description"
                      onChange={(e) => {
                        const newEdu = [...editedEducation];
                        newEdu[index].description = e.target.value;
                        setEditedEducation(newEdu);
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <Label className="font-semibold text-sm">{edu.title}</Label>
                    <p className="text-sm font-medium">{edu.institution}</p>
                    <p className="text-sm">{edu.institution_location}</p>
                    <CardDescription>{edu.description}</CardDescription>
                    <p className="text-sm">
                      {edu.start_date} - {edu.end_date || "Present"}
                    </p>
                  </div>
                )}
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
                sidePanelContent.gallery.map((img, index) => (
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