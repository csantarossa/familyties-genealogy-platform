"use client";
import React, { useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Handle, Position } from "@xyflow/react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { SidePanelContext } from "../page";

const TreeNode = ({ data }) => {
  const [sidePanelContent, setSidePanelContent] = useContext(SidePanelContext);

  // Opens the panel when a tree member is clicked
  const openPanel = () => {
    setSidePanelContent({
      firstname: data.firstname,
      middlename: data.middlename,
      lastname: data.lastname,
      trigger: true,
      img: data.mainImg,
      gender: data.gender,
      tags: data.tags,
      gallery: data.gallery,
      confidence: data.confidence,
      dob: {
        date: data.dob,
        birthTown: data.birthTown,
        birthCity: data.birthCity,
        birthState: data.birthState,
        birthCountry: data.birthCountry,
      },
      dod: {
        date: data.dod,
      },
      additionalInfo: data.additionalInfo,
    });
  };

  return (
    <div className="nodrag">
      <Handle type="source" position={Position.Bottom} id="bottom" />
      {/* For children */}
      <Handle type="target" position={Position.Top} id="top" />
      {/* For parents */}
      <Handle type="source" position={Position.Right} id="right" />
      {/* For spouse */}
      <Handle type="target" position={Position.Left} id="left" />
      {/* For spouse */}
      {/* Card content */}
      <Card
        onClick={openPanel}
        className="w-fit flex justify-between items-center p-4 gap-4"
      >
        {data.confidence === "Unverified" ? (
          <Badge
            className={`fixed text-xs top-[-10px] left-[-13px] ${
              data.confidence === "Verified" ? "bg-green-400" : "bg-red-400"
            }`}
          >
            {data.confidence}
          </Badge>
        ) : null}

        <div className="relative w-24 h-24 ">
          <Image
            src={data.mainImg}
            alt="Person's main image"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
        <div className="">
          <CardHeader className="p-0 h-24 flex-col flex justify-between">
            <div className="">
              <div className="flex items-center justify-end gap-1 h-4">
                {data.tags.map((tag, index) => (
                  <p className="text-xs" key={index}>
                    {tag}
                  </p>
                ))}
              </div>
              <div className="flex gap-1">
                <CardTitle className="text-sm font-medium capitalize">
                  {data.firstname}
                </CardTitle>
                <CardTitle className="text-sm font-normal capitalize">
                  {data.middlename}
                </CardTitle>
              </div>
              <CardTitle className="uppercase text-xl font-semibold">
                {data.lastname}
              </CardTitle>
              <div className="flex justify-between gap-3">
                <CardDescription className="capitalize text-xs mt-1">
                  {data.gender}
                </CardDescription>
                <CardDescription className="capitalize text-xs mt-1">
                  {data.dob}
                </CardDescription>
              </div>
            </div>

            {/* <p className="text-xs">
              {data.dob} - {data.dod}
            </p> */}
          </CardHeader>
        </div>
      </Card>
    </div>
  );
};

export default TreeNode;
