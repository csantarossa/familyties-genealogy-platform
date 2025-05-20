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
        className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
      />

      {/* Only show the bottom handle if not in a spouse container */}
      {!isInSpouseContainer && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
        />
      )}

      {/* This adds distributed connection points across the bottom */}
      {!isInSpouseContainer && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id={`bottom-left`}
            className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
            style={{ background: "#000" }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`bottom-center`}
            className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
            style={{ background: "#000" }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`bottom-right`}
            className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
            style={{ background: "#000" }}
          />
        </>
      )}

      {/* This adds distributed connection points across the top */}
      <Handle
        type="target"
        position={Position.Top}
        id={`top-left`}
        className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
        style={{ background: "#000" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`top-center`}
        className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
        style={{ background: "#000" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`top-right`}
        className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
        style={{ background: "#000" }}
      />
      <Card
        id={`node-${data.id}`}
        onClick={openPanel}
        className="w-[310px] flex flex-row justify-between items-center p-3 gap-4 bg-white dark:bg-gray-800"
      >
        <div className="h-24 flex justify-center items-center w-full">
          {data.tags.length > 0 && (
            <div className="flex items-center justify-end gap-2 h-4 absolute -top-3 p-2 -right-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 py-3 px-2 rounded-lg">
              {data.tags.map((tag, index) => (
                <p className="text-xs text-gray-800 dark:text-gray-100" key={index}>
                  {tag}
                </p>
              ))}
            </div>
          )}

          <div className="h-full w-36 relative rounded-lg">
            <Image
              src={data.profileImage || "/person_placeholder.png"}
              alt="Person's main image"
              fill
              objectFit="cover"
              className="rounded-lg"
            />
          </div>

          <CardHeader className="h-fit flex-col flex justify-start relative w-full">
            <CardTitle
              data-fullname
              className="text-sm font-medium capitalize max-w-40 truncate text-gray-900 dark:text-white"
            >
              {data.firstname} {data.middlename}
            </CardTitle>

            <CardTitle
              data-fullname
              className="uppercase text-xl font-semibold  max-w-40 truncate text-gray-800 dark:text-white"
            >
              {data.lastname}
            </CardTitle>
            <div className="flex flex-col justify-between gap-1">
              <CardDescription className="capitalize text-xs mt-1 flex justify-between items-center text-gray-700 dark:text-gray-300">
                {data.gender || <div></div>}
                {data.confidence === "Unverified" ? (
                  <CircleMinus color="orange" size={14} />
                ) : (
                  <CircleCheck color="green" size={14} />
                )}
              </CardDescription>
              <CardDescription className="capitalize text-[11px] mt-1 text-gray-600 dark:text-gray-400">
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