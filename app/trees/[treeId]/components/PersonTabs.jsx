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
  getEducation,
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
    toast.loading("Loading sidepanel");

    handleGetRelationships();
    toast.dismiss();
  }, []);

  const handleGetRelationships = async () => {
    const data = await getImmediateFamily(sidePanelContent.id);
    const siblingData = await getSiblingsBySharedParents(sidePanelContent.id);
    setSiblings(siblingData);
    setRelationships(data);
  };

  const handleSave = async () => {
    toast.loading("Saving changes");
    try {
      const personId = sidePanelContent.id;

      // Update general person info
      const res = await fetch(`/api/trees/${sidePanelContent.treeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId,
          gender: editedGender,
          dob: editedDob,
          dod: editedDod,
          birthTown: sidePanelContent.birthTown,
          birthCity: sidePanelContent.birthCity,
          birthState: sidePanelContent.birthState,
          birthCountry: sidePanelContent.birthCountry,
        }),
      });

      const generalResult = await res.json();
      if (!res.ok || !generalResult.success) {
        toast.error("Failed to update general info");
        return;
      }

      const resCareer = await fetch(`/api/trees/${personId}/career`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, career: editedCareer }), // <-- FIXED
      });

      // Update education
      const resEducation = await fetch(`/api/trees/${personId}/education`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, education: editedEducation }), // <-- FIXED
      });

      if (!resCareer.ok || !resEducation.ok) {
        toast.error("Failed to update career/education");
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
    toast.dismiss();
  };

  const birthLocation = [
    sidePanelContent.birthTown,
    sidePanelContent.birthCity,
    sidePanelContent.birthState,
    sidePanelContent.birthCountry,
  ];

  return (
    <div className="max-h-full overflow-hidden">
      <Tabs defaultValue="info" className="w-[450px] h-full">
        <TabsList className="grid w-full grid-cols-4">
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
        <TabsContent value="info" className="h-full">
          <Card className="border-none shadow-none h-full">
            <div className="h-full pb-10 overflow-y-auto px-4">
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
                        {item.other_person_firstname}{" "}
                        {item.other_person_lastname}
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
                        {item.other_person_firstname}{" "}
                        {item.other_person_lastname}
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

              <CardHeader className="flex flex-row justify-between">
                <CardTitle className="text-lg">Career</CardTitle>
                <div className="flex gap-4 h-full justify-between items-center">
                  {isEditingCareer && (
                    <Plus
                      size={20}
                      className="cursor-pointer"
                      onClick={() =>
                        setEditedCareer((prev) => [
                          ...prev,
                          {
                            job_title: "",
                            institution: "",
                            location: "",
                            start_date: "",
                            end_date: "",
                            description: "",
                          },
                        ])
                      }
                    />
                  )}
                  <Edit2
                    size={16}
                    className="cursor-pointer"
                    onClick={() => setIsEditingCareer(!isEditingCareer)}
                  />
                </div>
              </CardHeader>

              <CardContent className="gap-6 flex flex-col">
                {editedCareer.map((job, index) => (
                  <div key={index}>
                    {isEditingCareer ? (
                      <>
                        <div className="space-y-2">
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              Job Title
                            </Label>
                            <Input
                              value={job.job_title || ""}
                              onChange={(e) => {
                                const newCareer = [...editedCareer];
                                newCareer[index].job_title = e.target.value;
                                setEditedCareer(newCareer);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              Company
                            </Label>
                            <Input
                              value={job.institution || ""}
                              onChange={(e) => {
                                const newCareer = [...editedCareer];
                                newCareer[index].institution = e.target.value;
                                setEditedCareer(newCareer);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              Location
                            </Label>
                            <Input
                              value={job.location || ""}
                              onChange={(e) => {
                                const newCareer = [...editedCareer];
                                newCareer[index].location = e.target.value;
                                setEditedCareer(newCareer);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              Start Date
                            </Label>
                            <Input
                              value={job.start_date || ""}
                              onChange={(e) => {
                                const newCareer = [...editedCareer];
                                newCareer[index].start_date = e.target.value;
                                setEditedCareer(newCareer);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              End Date
                            </Label>
                            <Input
                              value={job.end_date || ""}
                              onChange={(e) => {
                                const newCareer = [...editedCareer];
                                newCareer[index].end_date = e.target.value;
                                setEditedCareer(newCareer);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              Description
                            </Label>
                            <Input
                              value={job.description || ""}
                              onChange={(e) => {
                                const newCareer = [...editedCareer];
                                newCareer[index].description = e.target.value;
                                setEditedCareer(newCareer);
                              }}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <hr />
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Label className="font-semibold text-base">
                          {job.job_title}
                        </Label>
                        <p className="text-sm font-medium">{job.institution}</p>
                        <p className="text-sm">{job.location}</p>
                        <CardDescription>{job.description}</CardDescription>
                        <p className="text-sm">
                          {job.start_date} {job.start_date && <>-</>}{" "}
                          {job.end_date || "Present"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {isEditingCareer && (
                  <div className="flex justify-end gap-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditedCareer(
                          sidePanelContent.additionalInfo.career || []
                        );
                        setIsEditingCareer(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
              <hr />

              <CardHeader className="flex flex-row justify-between">
                <CardTitle className="text-lg">Education</CardTitle>
                <div className="flex gap-4 h-full justify-between items-center">
                  {isEditingEducation && (
                    <Plus
                      size={20}
                      className="cursor-pointer"
                      onClick={() =>
                        setEditedEducation((prev) => [
                          ...prev,
                          {
                            title: "",
                            institution: "",
                            institution_location: "",
                            institution_logo: "",
                            start_date: "",
                            end_date: "",
                            description: "",
                          },
                        ])
                      }
                    />
                  )}
                  <Edit2
                    size={16}
                    className="cursor-pointer"
                    onClick={() => setIsEditingEducation(!isEditingEducation)}
                  />
                </div>
              </CardHeader>
              <CardContent className="gap-6 flex flex-col">
                {editedEducation.map((job, index) => (
                  <div key={index}>
                    {isEditingEducation ? (
                      <>
                        <div className="space-y-2">
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              Title
                            </Label>
                            <Input
                              value={job.title || ""}
                              onChange={(e) => {
                                const newEdu = [...editedEducation];
                                newEdu[index].title = e.target.value;
                                setEditedEducation(newEdu);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              Institution
                            </Label>
                            <Input
                              value={job.institution || ""}
                              onChange={(e) => {
                                const newEdu = [...editedEducation];
                                newEdu[index].institution = e.target.value;
                                setEditedEducation(newEdu);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              Location
                            </Label>
                            <Input
                              value={job.location || ""}
                              onChange={(e) => {
                                const newEdu = [...editedEducation];
                                newEdu[index].location = e.target.value;
                                setEditedEducation(newEdu);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              Logo URL
                            </Label>
                          </div>
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              Start Date
                            </Label>
                            <Input
                              value={job.start_date || ""}
                              onChange={(e) => {
                                const newEdu = [...editedEducation];
                                newEdu[index].start_date = e.target.value;
                                setEditedEducation(newEdu);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              End Date
                            </Label>
                            <Input
                              value={job.end_date || ""}
                              onChange={(e) => {
                                const newEdu = [...editedEducation];
                                newEdu[index].end_date = e.target.value;
                                setEditedEducation(newEdu);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-0">
                            <Label className="font-semibold text-xs">
                              Description
                            </Label>
                            <Input
                              value={job.description || ""}
                              onChange={(e) => {
                                const newEdu = [...editedEducation];
                                newEdu[index].description = e.target.value;
                                setEditedEducation(newEdu);
                              }}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <hr />
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-start gap-3">
                          <div>
                            <Label className="font-semibold text-base">
                              {job.title}
                            </Label>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-start w-[50%]">
                            {job.institution}
                          </p>
                          <p className="text-sm text-end">{job.location}</p>
                        </div>
                        <CardDescription className="text-sm">
                          {job.description}
                        </CardDescription>
                        <div className="flex items-center gap-3">
                          <p className="text-sm">{job.start_date}</p>
                          {job.start_date && <p>-</p>}
                          <p className="text-sm">{job.end_date || "Present"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isEditingEducation && (
                  <div className="flex justify-end gap-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditedEducation(
                          sidePanelContent.additionalInfo.education || []
                        );
                        setIsEditingEducation(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>
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
