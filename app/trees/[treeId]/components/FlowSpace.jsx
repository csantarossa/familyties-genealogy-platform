"use client";
import React, { useContext, useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import toast from "react-hot-toast";

import TreeNode from "./TreeNode";
import SpouseContainerNode from "./SpouseContainerNode";
import BackButton from "./BackButton";
import GetStartedModal from "./GetStartedModal";

import { PersonContext } from "@/app/contexts/PersonContext";
import { getRelationships } from "@/app/actions";

import {
  buildRelationshipMaps,
  makeSpouseContainers,
  applyDagreLayout,
  postProcess,
} from "@/app/utils/layout";

/** Create only parent→child edges for the layout */
function createEdges(rels, containerMap) {
  return rels
    .filter((r) => r.fk_type_id === 4)
    .map((r) => {
      const src = containerMap[String(r.person_2)] || String(r.person_2);
      const tgt = containerMap[String(r.person_1)] || String(r.person_1);
      return {
        id: `4-${src}-${tgt}-${r.relationship_id}`,
        source: src,
        target: tgt,
        type: "smoothstep",
        sourceHandle: "bottom",
        targetHandle: "top",
        style: { strokeWidth: 3 },
      };
    });
}

export default function FlowSpace({ refreshTrigger }) {
  const { treeId } = useParams();
  const { people, loading: peopleLoading } = useContext(PersonContext);

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  // Remove a node when its “delete” button is clicked
  const handleDeleteNode = (id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (peopleLoading) return;
    setLoading(true);

    // 1️⃣ Build raw nodes
    const rawNodes = people.map((p) => ({
      id: String(p.id),
      type: "treeCard",
      data: { ...p, onDelete: handleDeleteNode },
      position: { x: 0, y: 0 },
    }));

    toast.dismiss();
    toast.loading("Loading relationships...");

    getRelationships(treeId)
      .then((rels) => {
        // 2️⃣ Build relationship maps
        const maps = buildRelationshipMaps(rels);

        // 3️⃣ Pack spouses into containers
        const { containers, singles, containerMap } = makeSpouseContainers(
          rawNodes,
          maps
        );

        // 4️⃣ Layout with Dagre
        const laidOut = applyDagreLayout(
          [...containers, ...singles],
          rels,
          containerMap
        );

        // 5️⃣ Minor post-processing
        const finalNodes = postProcess(laidOut, rels, containerMap);

        setNodes(finalNodes);
        setEdges(createEdges(rels, containerMap));
      })
      .catch((err) => console.error("Error loading relationships:", err))
      .finally(() => {
        toast.dismiss();
        setLoading(false);
      });
  }, [peopleLoading, people, treeId, refreshTrigger]);

  const nodeTypes = useMemo(
    () => ({ treeCard: TreeNode, spouseContainer: SpouseContainerNode }),
    []
  );

  return (
    <div className="w-screen h-screen bg-zinc-200/50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        style={{ backgroundColor: "#F7F9FB" }}
      >
        {loading ? null : nodes.length === 0 ? (
          <GetStartedModal treeId={treeId} />
        ) : (
          <>
            <BackButton />
            <Controls />
            <Background style={{ zIndex: -1 }} />
          </>
        )}
      </ReactFlow>
    </div>
  );
}
