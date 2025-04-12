"use client";
import React, { useContext } from "react";
import { useParams } from "next/navigation";
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

  const { treeId } = useParams();
  const [sidePanelContent, setSidePanelContent] = useContext(SidePanelContext);


  const openPanel = () => {
    setSidePanelContent({
      id: data.id,
      trigger: true,
      treeId: treeId,
      ...data,
    });
  };

const handleDeleteNode = async (id) => {
  try {
    const res = await fetch(`/api/trees/${treeId}/nodes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete node");
    console.log("Node deleted successfully");
    // Optionally: trigger a refresh or UI state update
    // ✅ Remove from UI instantly
    if (data.onDelete) {
      data.onDelete(id);console.log("Calling onDelete from TreeNode for ID:", id);
    }
  } catch (err) {
    console.error("Error deleting node:", err);
  }
};

  

  return (
    <div className="nodrag">
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Card
        onClick={openPanel}
        className="w-fit flex flex-row justify-between items-center p-4 gap-4"
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

          <CardHeader className="h-fit flex-col flex justify-between">
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
              <CardDescription className="capitalize text-xs mt-1">
                {data.gender}
              </CardDescription>
              <CardDescription className="capitalize text-xs mt-1">
                {data.dob} - {data.dod}
              </CardDescription>
            </div>
          </CardHeader>
        </div>
        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent panel from opening
            handleDeleteNode(data.id);
          }}
          className="ml-2 text-red-500 text-xs border border-red-500 px-2 py-1 rounded hover:bg-red-100"
        >
          Delete
        </button>
      </Card>
    </div>
  );
};

export default TreeNode;
