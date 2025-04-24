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

// Constants for node dimensions
const NODE_W = 310;
const NODE_H = 210;

/**
 * Runs a Dagre layout on only the parent→child edges to compute
 * initial positions for each node.
 */
function runDagre(nodes, edges) {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const verticalEdges = edges.filter(e => e.sourceHandle === "bottom");

  // Graph configuration: spacing between nodes and ranks
  g.setGraph({
    rankdir: "TB",    // top to bottom
    align: "UL",      // upper-left alignment
    nodesep: 60,       // horizontal gap between nodes
    ranksep: 100,      // vertical gap between ranks (generations)
    marginx: 20,
    marginy: 20,
  });

  // Register each node
  nodes.forEach(node =>
    g.setNode(node.id, { width: NODE_W, height: NODE_H })
  );

  // Register only the vertical (parent→child) edges for layout
  verticalEdges.forEach(edge =>
    g.setEdge(edge.source, edge.target)
  );

  // Compute layout
  dagre.layout(g);

  // Pull back computed positions and adjust by half the node size
  return nodes.map(node => {
    const { x, y } = g.node(node.id);
    return {
      ...node,
      position: { x: x - NODE_W / 2, y: y - NODE_H / 2 },
    };
  });
}

export default function FlowSpace() {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const { treeId } = useParams();

  useEffect(() => {
    fetchAndLayoutTree(treeId);
  }, [treeId]);

  /**
   * Fetches people and relationships, computes positions, snaps spouses,
   * then clusters children under their parents.
   */
  async function fetchAndLayoutTree(id) {
    setLoading(true);
    toast.loading("Setting up the tree");
  
    try {
      // 1) Fetch data
      const people = await getPeople(id);
      const relationships = await getRelationships(id);
  
      // 2) Build nodes
      const entries = await Promise.all(
        people.map(async p => ({
          id: String(p.person_id),
          data: await transformPerson(p),
        }))
      );
      const entryMap = Object.fromEntries(entries.map(e => [e.id, e]));
      const rfNodes = entries.map(e => ({
        id: e.id,
        type: "treeCard",
        data: {
          ...e.data,
          onDelete: nid => setNodes(ns => ns.filter(n => n.id !== nid)),
        },
        position: { x: 0, y: 0 },
      }));
  
      // 3) Build edges
      const rfEdges = relationships.flatMap(r => {
        const { person_1, person_2, fk_type_id } = r;
        if (fk_type_id === 2 || !entryMap[person_1] || !entryMap[person_2]) return [];
  
        let src = person_1, tgt = person_2;
        if (fk_type_id === 4) [src, tgt] = [person_2, person_1];
  
        return [{
          id: `${fk_type_id}-${src}-${tgt}`,
          source: String(src),
          target: String(tgt),
          type: "smoothstep",
          style: { stroke: "#000", strokeWidth: 2 },
          sourceHandle: fk_type_id === 3 ? "right" : "bottom",
          targetHandle: fk_type_id === 3 ? "left"  : "top",
        }];
      });
  
      // 4) Layout parent-child edges with Dagre
      const laid = runDagre(rfNodes, rfEdges);
      const mapById = Object.fromEntries(laid.map(n => [n.id, { ...n }]));
  
      // 5) Snap spouses horizontally
      const SPACING = NODE_W + 60;
      relationships
        .filter(r => r.fk_type_id === 3)
        .forEach(({ person_1, person_2 }) => {
          const id1 = String(person_1);
          const id2 = String(person_2);
          const node1 = mapById[id1];
          const node2 = mapById[id2];
          if (!node1 || !node2) return;
  
          const midX = (node1.position.x + node2.position.x) / 2;
          const midY = (node1.position.y + node2.position.y) / 2;
  
          node1.position.x = midX - SPACING / 2;
          node2.position.x = midX + SPACING / 2;
          node1.position.y = midY;
          node2.position.y = midY;
        });
  
      // 6) Sibling layout with spouse-aware block spacing
      const parentToChildren = {};
      rfEdges
        .filter(e => e.sourceHandle === "bottom")
        .forEach(e => {
          (parentToChildren[e.source] ??= []).push(e.target);
        });
  
      const getSpouse = (id) => {
        const rel = relationships.find(
          r => r.fk_type_id === 3 && (r.person_1 == id || r.person_2 == id)
        );
        if (!rel) return null;
        return String(rel.person_1 == id ? rel.person_2 : rel.person_1);
      };
  
      Object.entries(parentToChildren).forEach(([parentId, children]) => {
        const siblingIds = Array.from(new Set(children));
        if (siblingIds.length === 0) return;
  
        // Create horizontal "blocks" of person + optional spouse
        const blocks = siblingIds.map((id) => {
          const person = mapById[id];
          const spouseId = getSpouse(id);
          const spouse = mapById[spouseId];
          return [person, spouse].filter(Boolean);
        });
  
        const blockWidths = blocks.map(b => b.length * NODE_W + (b.length - 1) * 60);
        const totalWidth = blockWidths.reduce((a, b) => a + b, 0) + (blocks.length - 1) * 60;
  
        const parentNode = mapById[parentId];
        if (!parentNode) return;
  
        let cursorX = parentNode.position.x - totalWidth / 2;
  
        blocks.forEach((block, i) => {
          block.forEach((node, j) => {
            node.position.x = cursorX + j * (NODE_W + 60);
          });
          cursorX += blockWidths[i] + 60;
        });
      });
  
      // 7) Commit final layout
      setNodes(Object.values(mapById));
      setEdges(rfEdges);
    } catch (error) {
      console.error(error);
    } finally {
      toast.dismiss();
      setLoading(false);
    }
  }
  

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