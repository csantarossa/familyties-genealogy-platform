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

const PersonTabs = () => {
  const [sidePanelContent, setSidePanelContent] = useContext(SidePanelContext);

  const [relationships, setRelationships] = useState([]);

  useEffect(() => {
    handleGetRelationships();
  }, []);

  console.log(sidePanelContent);
  const handleGetRelationships = async () => {
    const data = await getSpouses(sidePanelContent.id);
    setRelationships(data);
  };

  const birthLocation = [
    sidePanelContent.dob.birthTown,
    sidePanelContent.dob.birthCity,
    sidePanelContent.dob.birthState,
    sidePanelContent.dob.birthCountry,
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
        <TabsContent value="info" className="h-full overflow-auto ">
          <Card className="border-none shadow-none h-full">
            <CardHeader className="flex flex-row justify-between">
              <CardTitle className="text-lg">General Information</CardTitle>
              <div className="flex gap-4 h-full justify-between items-center">
                <Plus size={20} />
                <Edit2 size={16} />
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="space-y-0">
                <Label htmlFor="gender" className="font-semibold text-sm">
                  Gender
                </Label>
                <p className="border-none p-0 h-fit rounded-sm py-1 capitalize text-sm">
                  {sidePanelContent.gender}
                </p>
              </div>
              <hr />
              <div className="space-y-0">
                <Label htmlFor="born" className="font-semibold text-sm">
                  Birth
                </Label>
                <p className="border-none py-1 h-fit text-sm" id="dob">
                  {`${sidePanelContent.dob.date}`}
                </p>
                <a
                  className="flex flex-wrap underline underline-offset-2 text-sm"
                  target="_blank"
                  href={`https://www.google.com/search?q=${sidePanelContent.dob.birthTown}+${sidePanelContent.dob.birthCity}+${sidePanelContent.dob.birthCountry}`}
                >
                  {birthLocation.map((item, index) =>
                    item === "" || item === null ? null : (
                      <p key={index}>{item}, </p>
                    )
                  )}
                </a>
              </div>
              <hr />
              <div className="space-y-0">
                <Label htmlFor="death" className="font-semibold text-sm">
                  Death
                </Label>
                <div className="text-sm">
                  {sidePanelContent.dod.date
                    ? sidePanelContent.dod.date
                    : "Present"}
                </div>
              </div>
            </CardContent>
            <hr />
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

            <hr />
            <CardHeader className="flex flex-row justify-between">
              <CardTitle className="text-lg">Career</CardTitle>
              <div className="flex gap-4 h-full justify-between items-center">
                <Plus size={20} />
                <Edit2 size={16} />
              </div>
            </CardHeader>

            {sidePanelContent.additionalInfo.career.map((job, index) => (
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
                          className="font-semibold text-[15px]"
                        >
                          {job.title}
                        </Label>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium w-[50%] text-start">
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

            <CardFooter>{/* <Button>Save changes</Button> */}</CardFooter>
          </Card>
        </TabsContent>
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
                {sidePanelContent.gallery.map((img, index) => (
                  <div key={index} className="flex justify-center items-center">
                    <div className="w-28 h-28 relative">
                      <PopUp img={img} index={index} />
                    </div>
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
