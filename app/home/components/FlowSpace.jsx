"use client";
import { ReactFlow, Controls, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo, useState } from "react";
import TreeNode from "./TreeNode";

function FlowSpace() {
  const nodeTypes = useMemo(() => ({ treeCard: TreeNode }), []);
  const initialNodes = [
    {
      id: "node-1",
      type: "treeCard",
      position: { x: 0, y: 0 },
      data: {
        firstname: "Corey",
        middlename: "Flavio",
        lastname: "Santarossa",
        dob: "04/08/1998",
        dod: null,
        gender: "Male",
        img: "/sample.jpg",
        tags: ["🇦🇺", "🇮🇹", "🇵🇹"],
      },
    },
  ];
  const [nodes, setNodes] = useState(initialNodes);
  return (
    <div className="w-screen h-screen bg-zinc-100/50 ">
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          zIndex: 0,
        }}
      >
        <ReactFlow nodes={nodes} nodeTypes={nodeTypes}>
          <Background style={{ zIndex: -1 }} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default FlowSpace;
