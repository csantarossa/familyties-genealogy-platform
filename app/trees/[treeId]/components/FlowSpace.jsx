"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Controls,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";
import TreeNode from "./TreeNode";
import { getPeople, getRelationships } from "@/app/actions";
import { useParams } from "next/navigation";
import BackButton from "./BackButton";
import GetStartedModal from "./GetStartedModal";
import toast from "react-hot-toast";
import { transformPerson } from "@/app/utils/transformPerson";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 310;
const nodeHeight = 210;

const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: "TB", align: "UL" }); // Vertical layout with top-left alignment

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: "top",
      sourcePosition: "bottom",
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  // const spouseEdges = edges.filter((edge) => edge.id.startsWith("e")); // Filter spouse edges
  const otherEdges = edges.filter((edge) => !edge.id.startsWith("e"));

  return {
    nodes: newNodes,
    edges: [...otherEdges], // Ensure spouses appear last for better layout
  };
};

function FlowSpace() {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [loading, setLoading] = useState(true); // ✅ Added loading state

  const params = useParams();
  const treeId = params.treeId;

  useEffect(() => {
    fetchAndLayoutTree(treeId);
  }, []);

  const fetchAndLayoutTree = async (treeId) => {
    setLoading(true);
    toast.loading("Setting up the tree");
    try {
      const people = await getPeople(treeId); // Fetch people data from the API
      const relationships = await getRelationships(treeId); // Fetch relationships from the API

      const tree = {};
      people.forEach((person) => {
        tree[person.person_id] = {
          id: `${person.person_id}`,
          name: `${person.person_firstname} ${person.person_lastname}`,
          data: transformPerson(person),
        };
      });

      const reactFlowNodes = Object.values(tree).map((node) => ({
        id: node.id,
        type: "treeCard",
        data: node.data,
        position: { x: 0, y: 0 },
      }));

      const relationshipEdges = generateEdges(relationships, tree);
      const layoutedElements = getLayoutedElements(
        reactFlowNodes,
        relationshipEdges
      );

      setNodes(layoutedElements.nodes);
      setEdges(layoutedElements.edges);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching and laying out the tree:", error);
    }
    toast.dismiss();
  };

  const generateEdges = (relationships, tree) => {
    const edges = [];

    relationships.forEach((relationship) => {
      let { person_1, person_2, fk_type_id } = relationship;

      // Skip if people not found in tree
      if (!tree[person_1] || !tree[person_2]) return;

      // Relationship direction logic
      if (fk_type_id === 1) {
        // person_1 is child, so child -> parent
        [person_1, person_2] = [person_1, person_2]; // no swap needed, this line optional
      } else if (fk_type_id === 4) {
        // person_1 is parent, so child <- parent
        [person_1, person_2] = [person_2, person_1]; // swap to make parent -> child
      }

      const edge = {
        id: `${fk_type_id}-${person_1}-${person_2}`,
        source: `${person_1}`,
        target: `${person_2}`,
        type: "smoothstep",
        style: { strokeWidth: 2, stroke: "#000" },
      };

      if (fk_type_id === 2) {
        edge.sourceHandle = "right";
        edge.targetHandle = "left";
      }

      edges.push(edge);
    });

    return edges;
  };

  const getConfidenceScore = (confidence) => {
    if (confidence === 1) return "Verified";
    if (confidence === 2) return "Unverified";
    return null;
  };

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
        {loading ? ( // ✅ Show nothing while loading
          <></>
        ) : nodes.length === 0 ? ( // ✅ Show modal only when loading is finished and no nodes exist
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

export default FlowSpace;
