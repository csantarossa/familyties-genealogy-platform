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
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";
import toast from "react-hot-toast";

import TreeNode from "./TreeNode";
import BackButton from "./BackButton";
import GetStartedModal from "./GetStartedModal";
import { PersonContext } from "@/app/contexts/PersonContext";
import { getRelationships } from "@/app/actions";

// Dagre config
const nodeWidth = 310;
const nodeHeight = 210;
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

export default function FlowSpace() {
  const { treeId } = useParams();
  const { people, loading: peopleLoading } = useContext(PersonContext);

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  // Remove node from UI
  const handleDeleteNode = (id) => {
    setNodes((prev) => prev.filter((n) => n.id !== id.toString()));
  };

  // Fetch relationships and layout once people are ready
  useEffect(() => {
    if (peopleLoading) return;

    setLoading(true);
    const toastId = toast.loading("Setting up the tree…");

    // Build nodes from context
    const rawNodes = people.map((p) => ({
      id: `${p.id}`,
      type: "treeCard",
      data: { ...p, onDelete: handleDeleteNode },
      position: { x: 0, y: 0 },
    }));
    setNodes(rawNodes);

    // Fetch and render edges
    getRelationships(treeId)
      .then((rels) => {
        const peopleMap = Object.fromEntries(people.map((p) => [p.id, p]));
        const rawEdges = generateEdges(rels, peopleMap);

        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(rawNodes, rawEdges);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      })
      .catch((err) => console.error("Error loading relationships:", err))
      .finally(() => {
        toast.dismiss(toastId);
        setLoading(false);
      });
  }, [peopleLoading, people, treeId]);

  const nodeTypes = useMemo(() => ({ treeCard: TreeNode }), []);

  return (
    <div className="w-screen h-screen bg-zinc-200/50">
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

// --- Helpers ---
function generateEdges(relationships, peopleMap) {
  return relationships.reduce((acc, { person_1, person_2, fk_type_id }) => {
    if (!peopleMap[person_1] || !peopleMap[person_2]) return acc;

    let src = person_1;
    let tgt = person_2;
    if (fk_type_id === 4) {
      [src, tgt] = [person_2, person_1];
    }

    const edge = {
      id: `${fk_type_id}-${src}-${tgt}`,
      source: `${src}`,
      target: `${tgt}`,
      type: "smoothstep",
      style: { strokeWidth: 2 },
    };

    if (fk_type_id === 2) {
      edge.sourceHandle = "right";
      edge.targetHandle = "left";
    }

    acc.push(edge);
    return acc;
  }, []);
}

function getLayoutedElements(nodes, edges) {
  dagreGraph.setGraph({ rankdir: "TB", align: "UL" });

  nodes.forEach((n) =>
    dagreGraph.setNode(n.id, { width: nodeWidth, height: nodeHeight })
  );
  edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));

  dagre.layout(dagreGraph);

  const layouted = nodes.map((n) => {
    const { x, y } = dagreGraph.node(n.id);
    return {
      ...n,
      position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 },
      targetPosition: "top",
      sourcePosition: "bottom",
    };
  });

  return { nodes: layouted, edges };
}
