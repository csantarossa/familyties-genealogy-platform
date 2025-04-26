"use client";
import React, { useContext } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Handle, Position } from "@xyflow/react";
import Image from "next/image";

import { CircleCheck, CircleMinus } from "lucide-react";

import { formatDisplayDate } from "@/app/utils/parseDate";
import { PersonContext } from "@/app/contexts/PersonContext";

const TreeNode = ({ data, isInSpouseContainer = false }) => {
  const { treeId } = useParams();
  const { selectPerson } = useContext(PersonContext);

  const openPanel = () => {
    selectPerson(data);
  };

  return (
    <div className="nodrag">
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!absolute !top-0 !left-1/2 !-translate-x-1/2 !w-32 opacity-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!absolute !left-0 !top-1/2 !-translate-y-1/2 !h-24 opacity-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!absolute !right-0 !top-1/2 !-translate-y-1/2 !h-24 opacity-0"
      />

      {/* Only show the bottom handle if not in a spouse container */}
      {!isInSpouseContainer && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!absolute !bottom-0 !left-1/2 !-translate-x-1/2 opacity-0"
        />
      )}

      {/* This adds distributed connection points across the bottom */}
      {!isInSpouseContainer && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id={`bottom-left`}
            className="!absolute !bottom-0 !left-1/4 !-translate-x-1/2 opacity-0"
            style={{ background: "#000" }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`bottom-center`}
            className="!absolute !bottom-0 !left-1/2 !-translate-x-1/2 opacity-0"
            style={{ background: "#000" }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`bottom-right`}
            className="!absolute !bottom-0 !left-3/4 !-translate-x-1/2 opacity-0"
            style={{ background: "#000" }}
          />
        </>
      )}

      {/* This adds distributed connection points across the top */}
      <Handle
        type="target"
        position={Position.Top}
        id={`top-left`}
        className="!absolute !top-0 !left-1/4 !-translate-x-1/2 opacity-0"
        style={{ background: "#000" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`top-center`}
        className="!absolute !top-0 !left-1/2 !-translate-x-1/2 opacity-0"
        style={{ background: "#000" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`top-right`}
        className="!absolute !top-0 !left-3/4 !-translate-x-1/2 opacity-0"
        style={{ background: "#000" }}
      />
      <Card
        onClick={openPanel}
        className="w-fit flex flex-row justify-between items-center p-3 gap-4"
      >
        <div className="h-24 flex justify-center items-center">
          {data.tags.length > 0 && (
            <div className="flex items-center justify-end gap-2 h-4 absolute -top-3 -right-3 bg-white border py-3 px-2 rounded-lg">
              {data.tags.map((tag, index) => (
                <p className="text-xs" key={index}>
                  {tag}
                </p>
              ))}
            </div>
          )}
          <div className="relative w-24 h-full">
            <Image
              src={data.img}
              alt="Person's main image"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>

          <CardHeader className="h-fit flex-col flex justify-start relative">
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
            <div className="flex flex-col justify-between gap-1">
              <CardDescription className="capitalize text-xs mt-1 flex justify-between items-center">
                {data.gender || <div></div>}
                {data.confidence === "Unverified" ? (
                  <CircleMinus color="orange" size={14} />
                ) : (
                  <CircleCheck color="green" size={14} />
                )}
              </CardDescription>
              <CardDescription className="capitalize text-xs mt-1">
                {formatDisplayDate(data.dob)} -{" "}
                {formatDisplayDate(data.dod, true)}
              </CardDescription>
            </div>
          </CardHeader>
        </div>
      </Card>
    </div>
  );
};

export default TreeNode;
