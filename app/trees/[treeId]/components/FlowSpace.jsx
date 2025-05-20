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

import TreeNode from "./TreeNode";
import SpouseContainerNode from "./SpouseContainerNode";
import BackButton from "./BackButton";
import GetStartedModal from "./GetStartedModal";
import { PersonContext } from "@/app/contexts/PersonContext";
import { getRelationships } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useSafeToast } from "@/app/lib/toast";

// Adjusted dimensions and spacing for better layout
const NODE_W = 360; // Reduced from 720 to match TreeNode's actual width
const NODE_H = 210;
const SPOUSE_CONTAINER_W = NODE_W * 2 + 40; // Reduced spacing between spouses
const HORIZONTAL_SPACING = 120; // Increased for better separation between nodes
const VERTICAL_SPACING = 150; // Increased for better separation between generations

function hybridLayout(nodes, relationships) {
  // Create maps for easy data access
  const nodeMap = Object.fromEntries(
    nodes.map((node) => [node.id, { ...node }])
  );

  // Build relationship maps
  const spouseMap = {};

  // Build parent-child relationships map
  const childToParentsMap = {};
  const parentToChildrenMap = {};

  // Track already created spouse containers
  const spouseContainersMap = {};
  const parentPositionsMap = {}; // Track parent positions in containers (left or right)

  // Process relationships
  relationships.forEach((rel) => {
    // Process spouse relationships
    if (rel.fk_type_id === 3) {
      const id1 = String(rel.person_1);
      const id2 = String(rel.person_2);

      if (!nodeMap[id1] || !nodeMap[id2]) return;

      spouseMap[id1] = id2;
      spouseMap[id2] = id1;
    }

    // Process parent-child relationships
    if (rel.fk_type_id === 4) {
      const childId = String(rel.person_1);
      const parentId = String(rel.person_2);

      // Skip if either node doesn't exist
      if (!nodeMap[childId] || !nodeMap[parentId]) return;

      // Track parents for each child
      if (!childToParentsMap[childId]) {
        childToParentsMap[childId] = [];
      }
      childToParentsMap[childId].push(parentId);

      // Track children for each parent
      if (!parentToChildrenMap[parentId]) {
        parentToChildrenMap[parentId] = [];
      }
      parentToChildrenMap[parentId].push(childId);
    }
  });

  // Create topological sorting of nodes to process parents before children
  function createTopologicalOrder() {
    const visited = new Set();
    const order = [];

    function dfs(nodeId) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Process parents first (if any)
      const parents = childToParentsMap[nodeId] || [];
      for (const parentId of parents) {
        dfs(parentId);
      }

      order.push(nodeId);
    }

    // Start DFS from all nodes
    for (const nodeId of Object.keys(nodeMap)) {
      dfs(nodeId);
    }

    return order;
  }

  const processingOrder = createTopologicalOrder();

  // Create spouse containers in topological order
  const spouseContainers = [];
  const containedNodes = new Set();

  // Process nodes in order (parents before children)
  for (const nodeId of processingOrder) {
    // Skip if this node is already in a container
    if (containedNodes.has(nodeId)) continue;

    // Check if this node has a spouse
    const spouseId = spouseMap[nodeId];
    if (!spouseId || containedNodes.has(spouseId)) continue;

    // Both node and spouse exist and are not yet in containers
    const id1 = nodeId;
    const id2 = spouseId;
    const containerId = `spouse-container-${id1}-${id2}`;

    // Get person data for both spouses
    const person1 = nodeMap[id1].data;
    const person2 = nodeMap[id2].data;

    // SIMPLIFIED POSITIONING LOGIC: Focus solely on parent-child relationships
    let leftPerson, rightPerson;
    let positionDetermined = false;

    // Check if either person has a parent in a spouse container
    const parents1 = childToParentsMap[id1] || [];
    const parents2 = childToParentsMap[id2] || [];

    // For each parent of person1, check if the parent is in a container
    for (const parentId of parents1) {
      if (!parentPositionsMap[parentId]) continue;

      // If we know the parent's position, position the child accordingly
      const parentPosition = parentPositionsMap[parentId];

      if (parentPosition === "left") {
        // If parent is on the left, put this person on the left
        leftPerson = person1;
        rightPerson = person2;
        positionDetermined = true;
      } else if (parentPosition === "right") {
        // If parent is on the right, put this person on the right
        leftPerson = person2;
        rightPerson = person1;
        positionDetermined = true;
      }

      if (positionDetermined) break;
    }

    // If person1's parents didn't determine position, try person2's parents
    if (!positionDetermined) {
      for (const parentId of parents2) {
        if (!parentPositionsMap[parentId]) continue;

        const parentPosition = parentPositionsMap[parentId];

        if (parentPosition === "left") {
          // If parent is on the left, put this person on the left
          leftPerson = person2;
          rightPerson = person1;
          positionDetermined = true;
        } else if (parentPosition === "right") {
          // If parent is on the right, put this person on the right
          leftPerson = person1;
          rightPerson = person2;
          positionDetermined = true;
        }

        if (positionDetermined) break;
      }
    }

    // If parents didn't determine position, use the node IDs as a consistent fallback
    if (!positionDetermined) {
      // Simple deterministic fallback that has nothing to do with gender or surnames
      if (parseInt(id1) < parseInt(id2)) {
        leftPerson = person1;
        rightPerson = person2;
      } else {
        leftPerson = person2;
        rightPerson = person1;
      }
    }

    // Record positions of people in this container for their children to reference
    parentPositionsMap[person1.id] = leftPerson === person1 ? "left" : "right";
    parentPositionsMap[person2.id] = rightPerson === person2 ? "right" : "left";

    // Create the spouse container with the determined positions
    spouseContainers.push({
      id: containerId,
      type: "spouseContainer",
      data: {
        person: leftPerson,
        spouse: rightPerson,
      },
      position: { x: 0, y: 0 },
      // Store the IDs of the contained nodes for reference
      containedIds: [id1, id2],
    });

    // Track these nodes as contained
    containedNodes.add(id1);
    containedNodes.add(id2);

    // Track this container for the contained nodes
    spouseContainersMap[id1] = containerId;
    spouseContainersMap[id2] = containerId;
  }

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
          // Store the original ids for specific connection points
          data: {
            originalSource: parentId,
            originalTarget: childId,
          },
        },
      ];
    }

    return [];
  });

  // Run dagre layout on the modified nodes
  return {
    nodes: runDagre(
      modifiedNodes,
      dagreEdges,
      nodeToContainerMap,
      parentToChildrenMap,
      childToParentsMap
    ),
    nodeToContainerMap,
  };
}

function runDagre(
  nodes,
  edges,
  nodeToContainerMap,
  parentToChildrenMap,
  childToParentsMap
) {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  // Configure dagre with improved horizontal and vertical spacing
  g.setGraph({
    rankdir: "TB", // Top to bottom layout
    align: "DL", // Changed from UL to DL for better centering
    nodesep: HORIZONTAL_SPACING * 2, // Increased spacing between nodes in same rank
    ranksep: VERTICAL_SPACING, // Space between ranks (generations)
    marginx: 50,
    marginy: 50,
    rankSep: VERTICAL_SPACING,
    acyclicer: "greedy", // Help with node ordering
    ranker: "network-simplex", // Better for genealogical trees
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

  // Build parent-child relationships
  const childrenByParent = {};
  const parentsByChild = {};

  edges.forEach((edge) => {
    const parentId = edge.source;
    const childId = edge.target;

    // Track children by parent
    if (!childrenByParent[parentId]) {
      childrenByParent[parentId] = [];
    }
    childrenByParent[parentId].push(childId);

    // Track parents by child
    if (!parentsByChild[childId]) {
      parentsByChild[childId] = [];
    }
    parentsByChild[childId].push(parentId);
  });

  // First pass: Center children under their parents (handle both single and multiple children)
  Object.entries(childrenByParent).forEach(([parentId, childIds]) => {
    const parent = positionedNodeMap[parentId];
    if (!parent) return;

    const parentWidth =
      parent.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;
    const parentCenterX = parent.position.x + parentWidth / 2;

    // Special handling for single child - center directly under parent
    if (childIds.length === 1) {
      const childId = childIds[0];
      const child = positionedNodeMap[childId];
      if (!child) return;

      const childWidth =
        child.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;

      // Position the single child centered under the parent
      child.position.x = parentCenterX - childWidth / 2;
      return;
    }

    // Handle multiple children
    if (childIds.length > 1) {
      // Calculate total width needed for all children with spacing
      let totalChildrenWidth = 0;
      const childWidths = [];

      childIds.forEach((childId) => {
        const child = positionedNodeMap[childId];
        if (!child) return;

        const childWidth =
          child.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;

        childWidths.push(childWidth);
        totalChildrenWidth += childWidth;
      });

      // Add spacing between children
      const totalSpacing = (childIds.length - 1) * HORIZONTAL_SPACING;
      totalChildrenWidth += totalSpacing;

      // Calculate start position to center all children under the parent
      let currentX = parentCenterX - totalChildrenWidth / 2;

      // Position children
      childIds.forEach((childId, index) => {
        const child = positionedNodeMap[childId];
        if (!child) return;

        const childWidth = childWidths[index];

        // Position this child
        child.position.x = currentX;

        // Move to next position
        currentX += childWidth + HORIZONTAL_SPACING;
      });
    }
  });

  // Second pass: Handle nodes with multiple parents by placing them between the parents
  Object.entries(parentsByChild).forEach(([childId, parentIds]) => {
    if (parentIds.length > 1) {
      const child = positionedNodeMap[childId];
      if (!child) return;

      // Calculate center position between all parents
      let totalParentCenterX = 0;
      parentIds.forEach((parentId) => {
        const parent = positionedNodeMap[parentId];
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

  // Third pass: Ensure no nodes overlap horizontally by adjusting nodes in the same generation
  const nodesByRank = {};

  // Group nodes by their vertical position (rank/generation)
  positionedNodes.forEach((node) => {
    const rankY = Math.round(node.position.y / 10) * 10; // Round to help group nodes in the same rank
    if (!nodesByRank[rankY]) {
      nodesByRank[rankY] = [];
    }
    nodesByRank[rankY].push(node);
  });

  // For each rank, check and fix overlaps
  Object.values(nodesByRank).forEach((rankNodes) => {
    // Sort nodes by x position
    rankNodes.sort((a, b) => a.position.x - b.position.x);

    // Check each node against its right neighbor
    for (let i = 0; i < rankNodes.length - 1; i++) {
      const current = rankNodes[i];
      const next = rankNodes[i + 1];

      const currentWidth =
        current.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;
      const currentRight = current.position.x + currentWidth;
      const minSpacing = HORIZONTAL_SPACING / 2; // Minimum space between nodes

      // If there's an overlap
      if (currentRight + minSpacing > next.position.x) {
        // Move the next node
        const overlap = currentRight + minSpacing - next.position.x;

        // Shift this node and all nodes to its right
        for (let j = i + 1; j < rankNodes.length; j++) {
          rankNodes[j].position.x += overlap;
        }
      }
    }
  });

  // Fourth pass: Final adjustment for single children with no siblings in the same generation
  // This helps with the case of isolated nodes that might be positioned far to one side
  Object.entries(childrenByParent).forEach(([parentId, childIds]) => {
    if (childIds.length === 1) {
      const childId = childIds[0];
      const child = positionedNodeMap[childId];
      const parent = positionedNodeMap[parentId];

      if (!child || !parent) return;

      // Check if this child is the only one in its rank
      const childRankY = Math.round(child.position.y / 10) * 10;
      const siblingsInRank = nodesByRank[childRankY] || [];

      // If it's alone in this rank or has very few siblings
      if (siblingsInRank.length <= 2) {
        const parentWidth =
          parent.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;
        const childWidth =
          child.type === "spouseContainer" ? SPOUSE_CONTAINER_W : NODE_W;
        const parentCenterX = parent.position.x + parentWidth / 2;

        // Force center the child under its parent again (this might override earlier positioning)
        child.position.x = parentCenterX - childWidth / 2;
      }
    }
  });

  // Fifth pass: Final adjustment to ensure consistent parent-child alignment
  // This ensures that children in spouse containers appear on the same side as their parents
  Object.entries(parentsByChild).forEach(([childId, parentIds]) => {
    const child = positionedNodeMap[childId];
    if (!child || child.type !== "spouseContainer") return;

    // Skip nodes that aren't spouse containers
    if (!child.containedIds || child.containedIds.length !== 2) return;

    // Get the two people in this container
    const [personId1, personId2] = child.containedIds;

    // Check if either person has a parent in one of our parent containers
    let foundMatchingParent = false;
    let swapNeeded = false;

    // For each parent of this child container
    for (const parentId of parentIds) {
      const parent = positionedNodeMap[parentId];
      if (!parent || parent.type !== "spouseContainer") continue;

      // Skip if parent isn't a spouse container
      if (!parent.containedIds || parent.containedIds.length !== 2) continue;

      // Check if any person in the parent container is a parent of either person in child container
      for (const potentialParentId of parent.containedIds) {
        // For each person in the child container
        for (let i = 0; i < child.containedIds.length; i++) {
          const childPersonId = child.containedIds[i];

          // Check if this is a parent-child relationship
          const isParentOf =
            parentToChildrenMap[potentialParentId]?.includes(childPersonId);
          if (!isParentOf) continue;

          // We found a parent-child relationship!
          foundMatchingParent = true;

          // Check if parent is on the left in parent container
          const isParentOnLeft =
            parent.data.person.id.toString() === potentialParentId.toString();

          // Check if child is on the left in child container
          const isChildOnLeft =
            child.data.person.id.toString() === childPersonId.toString();

          // If parent and child aren't on the same side, we need to swap
          if (isParentOnLeft !== isChildOnLeft) {
            swapNeeded = true;
          }

          // Once we find a match, we can stop looking
          break;
        }

        if (foundMatchingParent) break;
      }

      if (foundMatchingParent) break;
    }

    // If we need to swap positions in the child container
    if (foundMatchingParent && swapNeeded) {
      // Swap the positions
      const temp = child.data.person;
      child.data.person = child.data.spouse;
      child.data.spouse = temp;
    }
  });

  return positionedNodes;
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
    const edgeId = `${fk_type_id}-${effectiveSrc}-${effectiveTgt}-${r.relationship_id || Math.random().toString(36).substr(2, 9)
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

export default function FlowSpace({ refreshTrigger }) {
  const { treeId } = useParams();
  const { people, loading: peopleLoading } = useContext(PersonContext);
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toast = useSafeToast();

  useEffect(() => {
    setMounted(true);
    // read the actual class on <html> once we've hydrated
    setIsDark(
      typeof window !== 'undefined' &&
      document.documentElement.classList.contains('dark')
    );
  }, []);

  // Remove node from UI
  const handleDeleteNode = (id) => {
    setNodes((prev) => prev.filter((n) => n.id !== id.toString()));
  };

  // Fetch relationships and layout once people are ready
  useEffect(() => {
    if (peopleLoading) {
      return;
    }

    setLoading(true);

    // Build nodes from context
    const rawNodes = people.map((p) => ({
      id: `${p.id}`,
      type: "treeCard",
      data: { ...p, onDelete: handleDeleteNode },
      position: { x: 0, y: 0 },
    }));

    toast.dismiss();
    // Fetch and render edges
    toast.loading("Loading relationships...");
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
        toast.dismiss();
        setLoading(false);
      });
  }, [peopleLoading, people, treeId, refreshTrigger]);

  const nodeTypes = useMemo(
    () => ({
      treeCard: TreeNode,
      spouseContainer: SpouseContainerNode,
    }),
    []
  );

  return (
    <div className="w-screen h-screen bg-zinc-200/50 dark:bg-zinc-900 relative">
      {/* Global overrides so edges, controls & watermark invert in dark mode */}
      {mounted && (
        <style jsx global>{`
          /* ---------- Light mode (defaults) ---------- */
          .react-flow__edge-path {
            stroke: #000 !important;
          }
          .react-flow__controls button svg {
            stroke: #000 !important;
          }
          .react-flow__attribution {
            filter: none !important;
          }
      
          /* ---------- Dark mode overrides ---------- */
          .dark .react-flow__edge-path {
            stroke: #fff !important;
          }
          .dark .react-flow__controls button svg {
            stroke: #fff !important;
          }
          .dark .react-flow__attribution {
            filter: invert(1) !important;
          }
          .dark .react-flow__controls {
            background: rgba(0, 0, 0, 0.6) !important;
            border-radius: 4px !important;
            padding: 4px !important;
          }
          .dark .react-flow__controls-button {
            background: transparent !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            margin: 2px !important;
          }
          .dark .react-flow__controls-button:hover {
            background: rgba(255, 255, 255, 0.1) !important;
          }
          .dark .react-flow__controls-button svg {
            stroke: #fff !important;
          }
        `}</style>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        style={{ backgroundColor: "var(--rf-background-color)" }}
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
