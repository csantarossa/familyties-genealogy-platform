"use client";
import React, { useState } from "react";
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

const TreeNode = ({ data }) => {
  return (
    <div>
      <Handle type="source" position={Position.Top} />
      {/* https://reactflow.dev/api-reference/components/handle */}
      <Handle position={Position.Left} />
      <Handle position={Position.Right} />

      <Card className="w-fit h-fit flex justify-between items-center">
        <div className="absolute top-4 right-5 flex gap-2">
          {data.tags.map((tag, index) => (
            <p key={index}>{tag}</p>
          ))}
        </div>
        <Image
          src={data.img}
          width={180}
          height={180}
          alt="Persons main image"
          className="rounded-lg m-5 object-cover"
        />
        <div>
          <CardHeader>
            <div>
              <div className="flex gap-1">
                <CardTitle className="text-lg font-medium">
                  {data.firstname}
                </CardTitle>
                <CardTitle className="text-lg font-medium">
                  {data.middlename}
                </CardTitle>
              </div>

              <CardTitle className="uppercase">{data.lastname}</CardTitle>
            </div>
            <CardDescription>{data.gender}</CardDescription>
          </CardHeader>
          {/* <CardContent>
            <input
              type="text"
              placeholder="Summarise this person"
              className="w-full bg-slate-100 rounded-lg p-2"
            />
          </CardContent> */}
          <CardFooter>
            <p>
              {data.dob} - {data.dod ? data.dod : "Present"}
            </p>
          </CardFooter>
        </div>
      </Card>
      <Handle type="target" position={Position.Bottom} />
    </div>
  );
};

export default TreeNode;
