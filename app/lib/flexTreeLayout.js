// lib/flexTreeLayout.js
import { hierarchy, tree as d3tree } from "d3-hierarchy";

export function layoutElements(treeData, rootId, direction = "TB") {
  const isHorizontal = direction === "LR" || direction === "RL";

  const root = hierarchy(treeData[rootId], (d) => d.children || []);

  const treeLayout = d3tree();

  treeLayout(root);

  const nodes = [];
  const edges = [];

  root.each((node) => {
    nodes.push({
      id: node.data.id.toString(),
      type: "treeCard",
      data: node.data.data,
      position: isHorizontal
        ? { x: node.y, y: node.x }
        : { x: node.x, y: node.y },
    });

    if (node.parent) {
      edges.push({
        id: `${node.parent.data.id}-${node.data.id}`,
        source: node.parent.data.id.toString(),
        target: node.data.id.toString(),
        type: "smoothstep",
        style: { strokeWidth: 2, stroke: "#000" },
      });
    }
  });

  return { nodes, edges };
}
