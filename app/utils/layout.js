import dagre from "@dagrejs/dagre";

const NODE_W = 360;
const NODE_H = 210;
const H_SPACING = 120;
const V_SPACING = 150;
const SPOUSE_W = NODE_W * 2 + 40;

/**
 * 1️⃣ Build maps of spouse & parent–child links (all IDs as strings).
 */
export function buildRelationshipMaps(rawRels) {
  const spouseMap = {};
  const childToParents = {};
  const parentToChildren = {};

  rawRels.forEach((rel) => {
    const id1 = String(rel.person_1);
    const id2 = String(rel.person_2);

    if (rel.fk_type_id === 3) {
      spouseMap[id1] = id2;
      spouseMap[id2] = id1;
    }

    if (rel.fk_type_id === 4) {
      childToParents[id1] = childToParents[id1] || [];
      childToParents[id1].push(id2);

      parentToChildren[id2] = parentToChildren[id2] || [];
      parentToChildren[id2].push(id1);
    }
  });

  return { spouseMap, childToParents, parentToChildren };
}

/**
 * 2️⃣ Group spouses into container nodes, return containers + singles + map.
 */
export function makeSpouseContainers(nodes, { spouseMap, childToParents }) {
  const containerMap = {};
  const used = new Set();
  const parentPos = {}; // track “left” or “right”
  const containers = [];

  nodes.forEach((node) => {
    const id = node.id;
    if (used.has(id)) return;
    const spouse = spouseMap[id];
    if (!spouse || used.has(spouse)) return;

    // decide left/right by parents’ side, else by numeric ID
    let left = id,
      right = spouse;
    const parents = childToParents[id] || [];
    for (let p of parents) {
      if (parentPos[p] === "left") {
        left = id;
        right = spouse;
        break;
      }
      if (parentPos[p] === "right") {
        left = spouse;
        right = id;
        break;
      }
    }
    if (!parents.length && parseInt(id) > parseInt(spouse)) {
      [left, right] = [right, left];
    }

    parentPos[left] = "left";
    parentPos[right] = "right";

    const cid = `cont-${left}-${right}`;
    const leftData = nodes.find((n) => n.id === left).data;
    const rightData = nodes.find((n) => n.id === right).data;

    containers.push({
      id: cid,
      type: "spouseContainer",
      data: { person: leftData, spouse: rightData },
      position: { x: 0, y: 0 },
      contained: [left, right],
    });

    containerMap[left] = cid;
    containerMap[right] = cid;
    used.add(left);
    used.add(right);
  });

  const singles = nodes.filter((n) => !used.has(n.id));
  return { containers, singles, containerMap };
}

/**
 * 3️⃣ Apply Dagre layout on containers + singles, using only parent–child edges.
 */
export function applyDagreLayout(nodes, rels, containerMap) {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "TB",
    nodesep: H_SPACING * 2,
    ranksep: V_SPACING,
    marginx: 20,
    marginy: 20,
  });

  // add nodes with correct dimensions
  nodes.forEach((n) => {
    const w = n.type === "spouseContainer" ? SPOUSE_W : NODE_W;
    g.setNode(n.id, { width: w, height: NODE_H });
  });

  // add only parent→child edges
  rels.forEach((rel) => {
    if (rel.fk_type_id !== 4) return;
    const child = String(rel.person_1);
    const parent = String(rel.person_2);
    const src = containerMap[parent] || parent;
    const tgt = containerMap[child] || child;
    if (src === tgt) return;
    g.setEdge(src, tgt);
  });

  dagre.layout(g);

  // extract positions
  return nodes.map((n) => {
    const { x, y } = g.node(n.id);
    const w = n.type === "spouseContainer" ? SPOUSE_W : NODE_W;
    return {
      ...n,
      position: { x: x - w / 2, y: y - NODE_H / 2 },
    };
  });
}

/**
 * 4️⃣ Minor post-processing: center any single child under its parent.
 */
export function postProcess(nodes, rels, containerMap) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const parentToKids = {};

  rels.forEach((r) => {
    if (r.fk_type_id !== 4) return;
    const child = containerMap[String(r.person_1)] || String(r.person_1);
    const parent = containerMap[String(r.person_2)] || String(r.person_2);
    parentToKids[parent] = parentToKids[parent] || [];
    parentToKids[parent].push(child);
  });

  Object.entries(parentToKids).forEach(([parentId, kids]) => {
    if (kids.length !== 1) return;
    const p = byId[parentId];
    const c = byId[kids[0]];
    if (!p || !c) return;
    const pW = p.type === "spouseContainer" ? SPOUSE_W : NODE_W;
    const cW = c.type === "spouseContainer" ? SPOUSE_W : NODE_W;
    c.position.x = p.position.x + pW / 2 - cW / 2;
  });

  return Object.values(byId);
}
