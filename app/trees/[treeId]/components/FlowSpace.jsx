"use client";
import {
  ReactFlow,
  Controls,
  Background,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useState } from "react";
import TreeNode from "./TreeNode";
import { layoutFromMap } from "entitree-flex";
import { getPeople } from "@/app/actions";

const nodeWidth = 300;
const nodeHeight = 200;

const entitreeSettings = {
  clone: true,
  enableFlex: true,
  firstDegreeSpacing: 100,
  nextAfterAccessor: "spouses",
  nextAfterSpacing: 100,
  nextBeforeAccessor: "siblings",
  nextBeforeSpacing: 100,
  nodeHeight,
  nodeWidth,
  orientation: "vertical",
  rootX: 0,
  rootY: 0,
  secondDegreeSpacing: 100,
  sourcesAccessor: "parents",
  sourceTargetSpacing: 100,
  targetsAccessor: "children",
};

function FlowSpace() {
  const [treeRootId, setTreeRootId] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    fetchAndLayoutTree();
  }, []);

  const fetchAndLayoutTree = async () => {
    try {
      const data = await getPeople();

      // Transform data into a map suitable for entitree-flex
      const tree = {};
      data.forEach((person) => {
        tree[person.person_id] = {
          id: `${person.person_id}`,
          name: `${person.person_firstname} ${person.person_lastname}`,
          // parents: person.parents || [],
          children: person.children || [],
          siblings: person.siblings || [],
          spouses: person.spouse || [],
          data: {
            mainImg: person.person_main_img || "/person_placeholder.png",
            firstname: person.person_firstname?.toLowerCase() || "",
            middlename: person.person_middlename
              ? person.person_middlename.toLowerCase()
              : "",
            lastname: person.person_lastname.toLowerCase() || "",
            dob: person.person_dob
              ? new Date(person.person_dob).toLocaleDateString()
              : "Unknown",
            dod: person.person_dod
              ? new Date(person.person_dod).toLocaleDateString()
              : "Alive",
            gender: person.person_gender?.toLowerCase() || "",
            img: "/img.png",
            tags: person.person_tags || [],
            birthTown: person.birth_town || "",
            birthCity: person.birth_city || "",
            birthState: person.birth_state || "",
            birthCountry: person.birth_country || "",
            additionalInfo: {
              career: person.additional_information?.career || [],
              education: person.additional_information?.education || [],
              hobbies: person.additional_information?.hobbies || [],
            },
            gallery: person.gallery,
            confidence: getConfidenceScore(person.confidence),
          },
        };
      });

      // Debugging: Log tree structure
      console.log("Tree structure:", tree);

      // Find the root ID
      const rootId = findRootId(data);
      if (!tree[rootId]) {
        console.error("Root ID not found in tree:", rootId);
        return;
      }
      setTreeRootId(rootId);

      // Generate layout using entitree-flex
      const { nodes: entitreeNodes, rels: entitreeEdges } = layoutFromMap(
        rootId,
        tree,
        entitreeSettings
      );

      // Debugging: Log generated nodes and edges
      console.log("Generated nodes:", entitreeNodes);
      console.log("Generated edges from entitree-flex:", entitreeEdges);

      // Transform nodes for ReactFlow
      const reactFlowNodes = entitreeNodes.map((node) => ({
        id: node.id,
        type: "treeCard",
        position: { x: node.x, y: node.y },
        data: node.data,
      }));

      const relationshipEdges = generateEdges(tree);

      const reactFlowEdges = [...relationshipEdges];

      setNodes([...reactFlowNodes]);
      setEdges(reactFlowEdges);

      console.log("Final ReactFlow nodes:", [...reactFlowNodes]);
      console.log("Final ReactFlow edges:", reactFlowEdges);
    } catch (error) {
      console.error("Error fetching and laying out the tree:", error);
    }
  };

  const generateEdges = (tree) => {
    const edges = [];

    Object.values(tree).forEach((node) => {
      // Parent-Child relationships (top-to-bottom)
      node.children.forEach((childId) => {
        if (tree[childId]) {
          edges.push({
            id: `parent-child-${node.id}-${childId}`,
            source: `${node.id}`, // Parent is the source
            target: `${childId}`, // Child is the target
            sourceHandle: "bottom", // Parent's bottom handle
            targetHandle: "top", // Child's top handle
            type: "smoothstep",
            style: {
              stroke: "#AAA",
              strokeWidth: 2,
            },
          });
        }
      });

      // Spouse relationships (left-to-right)
      node.spouses.forEach((spouseId) => {
        if (tree[spouseId]) {
          edges.push({
            id: `spouse-${node.id}-${spouseId}`,
            source: `${node.id}`, // Spouse 1 is the source
            target: `${spouseId}`, // Spouse 2 is the target
            sourceHandle: "right", // Spouse 1's right handle
            targetHandle: "left", // Spouse 2's left handle
            type: "smoothstep",
            style: {
              stroke: "#009E60",
              strokeWidth: 2,
            },
          });
        }
      });
    });

    return edges;
  };

  const findRootId = (data) => {
    return data.reduce(
      (oldest, person) =>
        new Date(person.person_dob).getTime() <
        new Date(oldest.person_dob).getTime()
          ? person
          : oldest,
      data[0]
    ).person_id;
  };

  const getConfidenceScore = (confidence) => {
    let result;
    if (confidence === 1) {
      result = "Verified";
    } else if (confidence === 2) {
      result = "Unverified";
    } else {
      result = null;
    }
    return result;
  };

  // Tree Node Configuration
  const nodeTypes = useMemo(() => ({ treeCard: TreeNode }), []);

  return (
    <div className="w-screen h-screen bg-zinc-200/50">
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          zIndex: 0,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          nodeTypes={nodeTypes}
          style={{ backgroundColor: "#F7F9FB" }}
        >
          <Background style={{ zIndex: -1 }} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default FlowSpace;
