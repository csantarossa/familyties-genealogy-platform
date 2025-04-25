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

const NODE_W = 310;
const NODE_H = 210;

// --- Dagre layout for parent-child hierarchy ---
function runDagre(nodes, edges) {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const verticalEdges = edges.filter(e => e.sourceHandle === "bottom");

  g.setGraph({ rankdir: "TB", align: "UL", nodesep: 60, ranksep: 100, marginx: 20, marginy: 20 });
  nodes.forEach(node => g.setNode(node.id, { width: NODE_W, height: NODE_H }));
  verticalEdges.forEach(edge => g.setEdge(edge.source, edge.target));

  dagre.layout(g);

  return nodes.map(node => {
    const { x, y } = g.node(node.id);
    return { ...node, position: { x: x - NODE_W / 2, y: y - NODE_H / 2 } };
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

  async function fetchAndLayoutTree(id) {
    setLoading(true);
    toast.loading("Setting up the tree");

    try {
      const people = await getPeople(id);
      const relationships = await getRelationships(id);

      const entries = await Promise.all(people.map(async p => ({
        id: String(p.person_id),
        data: await transformPerson(p),
      })));

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
          style: {
            stroke: "#000",
            strokeWidth: 2,
            strokeDasharray: fk_type_id === 3 ? "6 4" : undefined,
          },
          sourceHandle: fk_type_id === 3 ? "right" : "bottom",
          targetHandle: fk_type_id === 3 ? "left" : "top",
        }];
      });

      const laid = runDagre(rfNodes, rfEdges);
      const mapById = Object.fromEntries(laid.map(n => [n.id, { ...n }]));

      // --- Snap all spouses side-by-side ---
      const SPACING = NODE_W + 60;
      relationships.filter(r => r.fk_type_id === 3).forEach(({ person_1, person_2 }) => {
        const id1 = String(person_1);
        const id2 = String(person_2);
        const node1 = mapById[id1];
        const node2 = mapById[id2];
        if (!node1 || !node2) return;

        const midX = (node1.position.x + node2.position.x) / 2;
        const sharedY = Math.min(node1.position.y, node2.position.y);

        node1.position.x = midX - SPACING / 2;
        node2.position.x = midX + SPACING / 2;
        node1.position.y = sharedY;
        node2.position.y = sharedY;
      });

      // --- Space children under parents as blocks ---
      const childrenMap = {};
      rfEdges.filter(e => e.sourceHandle === "bottom").forEach(e => {
        (childrenMap[e.source] ??= []).push(e.target);
      });

      Object.entries(childrenMap).forEach(([parentId, children]) => {
        const siblingSet = new Set(children);

        // Also include their spouses
        children.forEach(childId => {
          const spouse = relationships.find(r => r.fk_type_id === 3 && (r.person_1 == childId || r.person_2 == childId));
          if (spouse) {
            const other = spouse.person_1 == childId ? spouse.person_2 : spouse.person_1;
            siblingSet.add(String(other));
          }
        });

        const siblingIds = Array.from(siblingSet);
        const blocks = [];
        const placed = new Set();

        siblingIds.forEach(id => {
          if (placed.has(id)) return;
          const person = mapById[id];
          if (!person) return;

          const spouseRel = relationships.find(r => r.fk_type_id === 3 && (r.person_1 == id || r.person_2 == id));
          if (spouseRel) {
            const spouseId = String(spouseRel.person_1 == id ? spouseRel.person_2 : spouseRel.person_1);
            const spouse = mapById[spouseId];
            if (spouse && !placed.has(spouseId)) {
              blocks.push([person, spouse]);
              placed.add(id);
              placed.add(spouseId);
              return;
            }
          }

          blocks.push([person]);
          placed.add(id);
        });

        const blockWidths = blocks.map(b => b.length * NODE_W + (b.length - 1) * 60);
        const totalWidth = blockWidths.reduce((a, b) => a + b, 0) + (blocks.length - 1) * 60;

        const parentNode = mapById[parentId];
        if (!parentNode) return;

        let startX = parentNode.position.x - totalWidth / 2;
        const y = parentNode.position.y + NODE_H + 60;

        blocks.forEach(block => {
          block.forEach((node, i) => {
            node.position.x = startX + i * (NODE_W + 60);
            node.position.y = y;
          });
          startX += block.length * NODE_W + (block.length - 1) * 60 + 60;
        });
      });

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
