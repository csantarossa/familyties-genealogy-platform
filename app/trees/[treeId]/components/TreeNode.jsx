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

import { ShieldCheck, ShieldQuestion } from "lucide-react";

import { formatDisplayDate } from "@/app/utils/parseDate";
import { PersonContext } from "@/app/contexts/PersonContext";

const TreeNode = ({ data }) => {
  const { treeId } = useParams();
  const { selectPerson } = useContext(PersonContext);

  const openPanel = () => {
    selectPerson(data);
  };

  return (
    <div className="nodrag">
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
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
                  <ShieldQuestion color="orange" size={14} />
                ) : (
                  <ShieldCheck color="green" size={14} />
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
