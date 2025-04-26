"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
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
import SpouseContainerNode from "./SpouseContainerNode";
import BackButton from "./BackButton";
import GetStartedModal from "./GetStartedModal";
import { PersonContext } from "@/app/contexts/PersonContext";
import { getRelationships } from "@/app/actions";

const NODE_W = 310;
const NODE_H = 210;
const SPOUSE_CONTAINER_W = NODE_W * 2 + 80; // Width for two nodes + spacing
const HORIZONTAL_SPACING = 60; // Space between nodes horizontally
const VERTICAL_SPACING = 100; // Space between generations

function hybridLayout(nodes, relationships) {
  // Create maps for easy data access
  const nodeMap = Object.fromEntries(
    nodes.map((node) => [node.id, { ...node }])
  );

  // Build relationship maps
  const spouseMap = {};

  // Process spouse relationships
  relationships.forEach((rel) => {
    if (rel.fk_type_id === 3) {
      const id1 = String(rel.person_1);
      const id2 = String(rel.person_2);

      if (!nodeMap[id1] || !nodeMap[id2]) return;

      spouseMap[id1] = id2;
      spouseMap[id2] = id1;
    }
  });

  // Create spouse containers and track contained nodes
  const spouseContainers = [];
  const containedNodes = new Set();

  // Create containers for each couple
  Object.entries(spouseMap).forEach(([id1, id2]) => {
    // Only process each couple once (by lower ID to avoid duplicates)
    if (id1 < id2 && nodeMap[id1] && nodeMap[id2]) {
      const containerId = `spouse-container-${id1}-${id2}`;

      spouseContainers.push({
        id: containerId,
        type: "spouseContainer",
        data: {
          person: nodeMap[id1].data,
          spouse: nodeMap[id2].data,
        },
        position: { x: 0, y: 0 },
        // Store the IDs of the contained nodes for reference
        containedIds: [id1, id2],
      });

      // Mark these nodes as contained
      containedNodes.add(id1);
      containedNodes.add(id2);
    }
  });

  // Create a map from original IDs to container IDs
  const nodeToContainerMap = {};
  spouseContainers.forEach((container) => {
    container.containedIds.forEach((id) => {
      nodeToContainerMap[id] = container.id;
    });
  });

  // Create a new modified list of nodes, including containers and non-contained individuals
  const modifiedNodes = [
    ...spouseContainers,
    ...nodes.filter((node) => !containedNodes.has(node.id)),
  ];

  // Create transformed relationships for dagre layout
  const transformedRelationships = relationships.filter((rel) => {
    // Skip spouse relationships as they're now represented by containers
    if (rel.fk_type_id === 3) return false;

    // Keep parent-child relationships
    if (rel.fk_type_id === 4) {
      const childId = String(rel.person_1);
      const parentId = String(rel.person_2);

      // Skip if either node doesn't exist in our map
      if (!nodeMap[childId] || !nodeMap[parentId]) return false;

      return true;
    }

    return rel.fk_type_id !== 2; // Skip type 2 relationships
  });

  // Create edges for dagre layout
  const dagreEdges = transformedRelationships.flatMap((rel) => {
    if (rel.fk_type_id === 4) {
      const childId = String(rel.person_1);
      const parentId = String(rel.person_2);

      // Get effective IDs (using containers where relevant)
      const effectiveChildId = nodeToContainerMap[childId] || childId;
      const effectiveParentId = nodeToContainerMap[parentId] || parentId;

      // Skip if both nodes are in the same container
      if (effectiveChildId === effectiveParentId) return [];

      return [
        {
          id: `${rel.fk_type_id}-${effectiveParentId}-${effectiveChildId}`,
          source: effectiveParentId,
          target: effectiveChildId,
          sourceHandle: "bottom",
          targetHandle: "top",
        },
      ];
    }

    return [];
  });

  // Run dagre layout on the modified nodes
  return {
    nodes: runDagre(modifiedNodes, dagreEdges, nodeToContainerMap),
    nodeToContainerMap,
  };
}

function runDagre(nodes, edges, nodeToContainerMap) {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  // Configure dagre with horizontal and vertical spacing
  g.setGraph({
    rankdir: "TB",
    align: "UL",
    nodesep: HORIZONTAL_SPACING * 1.5,
    ranksep: VERTICAL_SPACING * 1.5,
    marginx: 30,
    marginy: 30,
  });

  // Add nodes to dagre graph with proper dimensions
  nodes.forEach((node) => {
    const width = node.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;
    const height = NODE_H;
    g.setNode(node.id, { width, height });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));

  // Run the layout
  dagre.layout(g);

  // Extract positions from dagre
  const positionedNodes = nodes.map((node) => {
    const { x, y } = g.node(node.id);
    const width = node.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;
    return {
      ...node,
      position: {
        x: x - width / 2,
        y: y - NODE_H / 2,
      },
    };
  });

  // Create object map of positioned nodes for reference
  const positionedNodeMap = Object.fromEntries(
    positionedNodes.map((node) => [node.id, node])
  );

  // Refine positioning for siblings (children of the same parent)
  const childrenByParent = {};

  edges.forEach((edge) => {
    const parentId = edge.source;
    const childId = edge.target;

    if (!childrenByParent[parentId]) {
      childrenByParent[parentId] = [];
    }

    childrenByParent[parentId].push(childId);
  });

  // Center children under their parents
  Object.entries(childrenByParent).forEach(([parentId, childIds]) => {
    if (childIds.length > 1) {
      const parent = positionedNodeMap[parentId];
      if (!parent) return;

      const parentWidth =
        parent.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;
      const parentCenterX = parent.position.x + parentWidth / 2;

      // Calculate children's total width
      let totalChildWidth = 0;
      let spacingNeeded = 0;

      childIds.forEach((childId) => {
        const child = positionedNodeMap[childId];
        if (!child) return;

        const childWidth =
          child.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;
        totalChildWidth += childWidth;
        spacingNeeded += 1;
      });

      // Add spacing between children
      totalChildWidth += (spacingNeeded - 1) * HORIZONTAL_SPACING;

      // Calculate starting position to center the children under the parent
      let startX = parentCenterX - totalChildWidth / 2;

      // Position children
      childIds.forEach((childId) => {
        const child = positionedNodeMap[childId];
        if (!child) return;

        const childWidth =
          child.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;

        // Center this child
        child.position.x = startX;

        // Move to next position
        startX += childWidth + HORIZONTAL_SPACING;
      });
    }
  });

  // Create a more accurate node-to-position map after adjustments
  const adjustedNodeMap = Object.fromEntries(
    positionedNodes.map((node) => [node.id, { ...node }])
  );

  // Final improvement: Handle nodes with multiple parents by centering them
  const parentsByChild = {};

  edges.forEach((edge) => {
    const parentId = edge.source;
    const childId = edge.target;

    if (!parentsByChild[childId]) {
      parentsByChild[childId] = [];
    }

    parentsByChild[childId].push(parentId);
  });

  // Center children between multiple parents
  Object.entries(parentsByChild).forEach(([childId, parentIds]) => {
    if (parentIds.length > 1) {
      const child = adjustedNodeMap[childId];
      if (!child) return;

      let totalParentCenterX = 0;

      parentIds.forEach((parentId) => {
        const parent = adjustedNodeMap[parentId];
        if (!parent) return;

        const parentWidth =
          parent.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;
        totalParentCenterX += parent.position.x + parentWidth / 2;
      });

      const avgParentCenterX = totalParentCenterX / parentIds.length;
      const childWidth =
        child.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;

      // Center child between parents
      child.position.x = avgParentCenterX - childWidth / 2;
    }
  });

  return Object.values(adjustedNodeMap);
}

function createEdges(relationships, nodeMap, nodeToContainerMap) {
  // Use a Set to track unique edge combinations and avoid duplicates
  const uniqueEdgeKeys = new Set();
  const edges = [];

  relationships.forEach((r) => {
    const { person_1, person_2, fk_type_id } = r;

    // Skip non-existent nodes or non-relevant relationships
    if (
      fk_type_id === 2 || // Skip this relationship type
      !nodeMap[String(person_1)] ||
      !nodeMap[String(person_2)]
    ) {
      return;
    }

    // For parent-child relationship: parent (source) -> child (target)
    // For parent-child, original data has person_2 as parent, person_1 as child
    let src = person_1;
    let tgt = person_2;

    // For parent-child relationships, the parent is person_2 and should be the source
    if (fk_type_id === 4) {
      [src, tgt] = [person_2, person_1];
    }

    // Convert to string IDs
    src = String(src);
    tgt = String(tgt);

    // Get the original IDs (needed for identifying specific handles)
    const originalSrc = src;
    const originalTgt = tgt;

    // If either node is in a spouse container, use the container ID instead
    const effectiveSrc = nodeToContainerMap[src] || src;
    const effectiveTgt = nodeToContainerMap[tgt] || tgt;

    // Skip if both nodes are in the same container (internal relationship)
    if (effectiveSrc === effectiveTgt) {
      return;
    }

    // Skip spouse relationships if either person is in a container
    // (as the container itself visually represents the spouse relationship)
    if (
      fk_type_id === 3 &&
      (nodeToContainerMap[src] || nodeToContainerMap[tgt])
    ) {
      return;
    }

    // Create a unique key for this edge to prevent duplicates
    // Using both node IDs and relationship type, sorted to ensure consistency
    const edgeKey = `${fk_type_id}-${[effectiveSrc, effectiveTgt]
      .sort()
      .join("-")}`;

    // If we've already created this edge, skip it
    if (uniqueEdgeKeys.has(edgeKey)) {
      return;
    }

    // Track this unique edge
    uniqueEdgeKeys.add(edgeKey);

    // Generate a unique ID that includes the relationship ID to guarantee uniqueness
    const edgeId = `${fk_type_id}-${effectiveSrc}-${effectiveTgt}-${
      r.relationship_id || Math.random().toString(36).substr(2, 9)
    }`;

    // Determine source and target handles based on relationship type and container status
    let sourceHandle = fk_type_id === 3 ? "right" : "bottom";
    let targetHandle = fk_type_id === 3 ? "left" : "top";

    // For parent-child relationships where the source is a spouse container,
    // use the specific handle for the parent inside the container
    if (fk_type_id === 4 && effectiveSrc !== originalSrc) {
      sourceHandle = `bottom`; // Use the container's bottom handle
    }

    // For parent-child relationships where the target is a spouse container,
    // use the specific handle for the child inside the container
    if (fk_type_id === 4 && effectiveTgt !== originalTgt) {
      targetHandle = `top-${originalTgt}`; // Use the specific person's top handle
    }

    edges.push({
      id: edgeId,
      source: effectiveSrc,
      target: effectiveTgt,
      type: "smoothstep",
      style: {
        stroke: "#000",
        strokeWidth: 3,
        strokeDasharray: fk_type_id === 3 ? "6 4" : undefined,
      },
      sourceHandle: sourceHandle,
      targetHandle: targetHandle,
    });
  });

  return edges;
}

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

    // Fetch and render edges
    getRelationships(treeId)
      .then((rels) => {
        // Ensure each relationship has a unique identifier
        const enhancedRelationships = rels.map((rel, index) => ({
          ...rel,
          relationship_id: rel.relationship_id || `rel-${index}`,
        }));

        // Create the layout with spouse containers
        const { nodes: layoutedNodes, nodeToContainerMap } = hybridLayout(
          rawNodes,
          enhancedRelationships
        );

        // Create the people map for edge creation
        const peopleMap = Object.fromEntries(people.map((p) => [p.id, p]));

        // Create edges with the container mapping
        const layoutedEdges = createEdges(
          enhancedRelationships,
          peopleMap,
          nodeToContainerMap
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      })
      .catch((err) => console.error("Error loading relationships:", err))
      .finally(() => {
        toast.dismiss(toastId);
        setLoading(false);
      });
  }, [peopleLoading, people, treeId]);

  const nodeTypes = useMemo(
    () => ({
      treeCard: TreeNode,
      spouseContainer: SpouseContainerNode,
    }),
    []
  );

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
