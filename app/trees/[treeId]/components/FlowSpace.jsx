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
      const entries = await Promise.all(
        people.map(async p => ({ id: String(p.person_id), data: await transformPerson(p) }))
      );

      const entryMap = Object.fromEntries(entries.map(e => [e.id, e]));
      const rfNodes = entries.map(e => ({
        id: e.id,
        type: "treeCard",
        data: { ...e.data, onDelete: nid => setNodes(ns => ns.filter(n => n.id !== nid)) },
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

      // Step 1: Layout with Dagre based on parent-child connections
      const laid = runDagre(rfNodes, rfEdges);
      const mapById = Object.fromEntries(laid.map(n => [n.id, { ...n }]));

      // Step 2: Position spouses side-by-side
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

      // Step 3: Spread children centered under couples
      const childrenMap = {};
      rfEdges.filter(e => e.sourceHandle === "bottom").forEach(e => {
        (childrenMap[e.source] ??= []).push(e.target);
      });

      relationships.filter(r => r.fk_type_id === 3).forEach(({ person_1, person_2 }) => {
        const p1 = String(person_1);
        const p2 = String(person_2);
        const kids = Array.from(new Set([...(childrenMap[p1] || []), ...(childrenMap[p2] || [])]));
        
        const parent1 = mapById[p1];
        const parent2 = mapById[p2];
        if (!parent1 || !parent2) return;

        const midX = (parent1.position.x + parent2.position.x) / 2;
        const y = Math.max(parent1.position.y, parent2.position.y) + NODE_H + 60;

        if (kids.length === 0) return;

        // Special case: center single child under both parents
        if (kids.length === 1) {
          const child = mapById[kids[0]];
          if (child) {
            child.position.x = midX;
            child.position.y = y;
          }
          return;
        }

        const blocks = [];
        const placed = new Set();

        kids.forEach((id) => {
          if (placed.has(id)) return;
          const person = mapById[id];
          if (!person) return;

          const spouseRel = relationships.find(
            r => r.fk_type_id === 3 && (r.person_1 == id || r.person_2 == id)
          );
          const spouseId = spouseRel ? String(spouseRel.person_1 == id ? spouseRel.person_2 : spouseRel.person_1) : null;
          const spouse = spouseId ? mapById[spouseId] : null;

          if (spouse && !placed.has(spouseId)) {
            blocks.push([person, spouse]);
            placed.add(id);
            placed.add(spouseId);
          } else {
            blocks.push([person]);
            placed.add(id);
          }
        });

        const blockWidths = blocks.map(b => b.length * NODE_W + (b.length - 1) * 60);
        const totalWidth = blockWidths.reduce((a, b) => a + b, 0) + (blocks.length - 1) * 60;

        let cursorX = midX - totalWidth / 2;
        blocks.forEach((block, i) => {
          const innerSpacing = (NODE_W + 60);
          block.forEach((node, j) => {
            node.position.x = cursorX + j * innerSpacing;
            node.position.y = y;
          });
          cursorX += blockWidths[i] + 60; // space between blocks
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
