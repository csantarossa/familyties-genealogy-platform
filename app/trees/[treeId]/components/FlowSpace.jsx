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

// 🧠 Create edges intelligently, based on whether both spouses share children
function createSmartEdges(rels, containerMap, parentToChildren) {
  return rels
    .filter((r) => r.fk_type_id === 4)
    .map((r) => {
      const parentId = String(r.person_2);
      const childId = String(r.person_1);

      const parentContainer = containerMap[parentId];
      const childContainer = containerMap[childId];

      let useContainer = false;
      if (parentContainer) {
        const [_, id1, id2] = parentContainer.split("-");
        const spouseId = id1 === parentId ? id2 : id1;

        const spouseChildren = parentToChildren[spouseId] || [];
        const thisChildren = parentToChildren[parentId] || [];

        if (
          spouseChildren.length &&
          thisChildren.length &&
          arraysEqual(spouseChildren, thisChildren)
        ) {
          useContainer = true;
        }
      }

      const src = useContainer ? parentContainer : parentId;
      const tgt = childContainer || childId;

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

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return [...a].sort().every((val, i) => val === [...b].sort()[i]);
}

export default function FlowSpace({ refreshTrigger }) {
  const { treeId } = useParams();
  const { people, loading: peopleLoading } = useContext(PersonContext);

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteNode = (id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (peopleLoading) return;
    setLoading(true);

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
        const { spouseMap, childToParents, parentToChildren } = buildRelationshipMaps(rels);

        const { containers, singles, containerMap } = makeSpouseContainers(
          rawNodes,
          { spouseMap, childToParents }
        );

        const laidOut = applyDagreLayout(
          [...containers, ...singles],
          rels,
          containerMap
        );

        let finalNodes = postProcess(laidOut, rels, containerMap);

        // 🔧 Ensure all edge-referenced containers are included
        const requiredIds = new Set();
        rels.forEach((r) => {
          if (r.fk_type_id !== 4) return;
          const parentId = String(r.person_2);
          const childId = String(r.person_1);
          requiredIds.add(containerMap[parentId] || parentId);
          requiredIds.add(containerMap[childId] || childId);
        });

        requiredIds.forEach((id) => {
          if (!finalNodes.some((n) => n.id === id)) {
            const fallback = [...containers, ...singles].find((n) => n.id === id);
            if (fallback) finalNodes.push(fallback);
          }
        });

        const allNodeIds = new Set(finalNodes.map((n) => n.id));

        const filteredEdges = createSmartEdges(rels, containerMap, parentToChildren)
          .filter((e) => allNodeIds.has(e.source) && allNodeIds.has(e.target));

        setNodes(finalNodes);
        setEdges(filteredEdges);
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
