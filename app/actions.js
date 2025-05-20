"use server";
import { neon } from "@neondatabase/serverless";
//hello

export async function getPeople(treeId) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`select * from person where fk_tree_id = ${treeId}`;
  return data;
}

export async function getRelationshipTypes() {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`select * from relationship_types`;
  return data;
}

export async function getTrees(user_id) {
  const sql = neon(process.env.DATABASE_URL);
  const data =
    await sql`select * from trees where tree_owner = ${user_id} order by tree_created_at desc`;
  return data;
}

export async function getRelationships() {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`select * from relationships`;
  return data;
}
export async function getImmediateFamily(id) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`
    SELECT 
      r.*,
      rt.type_name,
      CASE 
        WHEN r.person_1 = ${id} THEN p2.person_id
        ELSE p1.person_id
      END AS other_person_id,
      CASE 
        WHEN r.person_1 = ${id} THEN p2.person_firstname
        ELSE p1.person_firstname
      END AS other_person_firstname,
      CASE 
        WHEN r.person_1 = ${id} THEN p2.person_lastname
        ELSE p1.person_lastname
      END AS other_person_lastname,
      CASE 
        WHEN rt.type_name = 'parent' AND r.person_1 = ${id} THEN 'parent'
        WHEN rt.type_name = 'parent' AND r.person_2 = ${id} THEN 'child'
        WHEN rt.type_name = 'child' AND r.person_1 = ${id} THEN 'child'
        WHEN rt.type_name = 'child' AND r.person_2 = ${id} THEN 'parent'
        ELSE rt.type_name
      END AS direction
    FROM relationships r
    JOIN person p1 ON r.person_1 = p1.person_id
    JOIN person p2 ON r.person_2 = p2.person_id
    JOIN relationship_types rt ON r.fk_type_id = rt.type_id
    WHERE (r.person_1 = ${id} OR r.person_2 = ${id})
      AND r.fk_type_id IN (1, 2, 3, 4);
  `;
  return data;
}

export async function getSiblingsBySharedParents(id) {
  const sql = neon(process.env.DATABASE_URL);

  const data = await sql`
    --  Find people who share at least one parent with the given person
    SELECT DISTINCT
      s.person_id,
      s.person_firstname,
      s.person_lastname
    FROM relationships r1
    -- r1: relationships where the selected person is a child
    -- r2: relationships where other people are children of the same parent
    JOIN relationships r2
      ON r1.person_2 = r2.person_2 -- Match on shared parent (person_2)
      AND r1.person_1 != r2.person_1 -- Exclude the selected person themself
      AND r1.fk_type_id = 4 -- Only use parent-child relationships
      AND r2.fk_type_id = 4
    JOIN person s
      ON s.person_id = r2.person_1 --  Get sibling info (person_1 in r2 is the sibling)
    WHERE r1.person_1 = ${id}; -- The current person whose siblings we want
  `;

  return data;
}

export async function getAllEducation(personIds) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`
    SELECT * FROM education WHERE fk_person_id = ANY(${personIds}) ORDER BY start_date ASC;
  `;

  // Group by person ID
  return data.reduce((acc, item) => {
    if (!acc[item.fk_person_id]) {
      acc[item.fk_person_id] = [];
    }
    acc[item.fk_person_id].push(item);
    return acc;
  }, {});
}

export async function getAllCareer(personIds) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`
    SELECT * FROM career WHERE fk_person_id = ANY(${personIds}) ORDER BY start_date ASC;
  `;

  return data.reduce((acc, item) => {
    if (!acc[item.fk_person_id]) {
      acc[item.fk_person_id] = [];
    }
    acc[item.fk_person_id].push(item);
    return acc;
  }, {});
}

export async function getAllGallery(personIds) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`
    SELECT * FROM images WHERE fk_person_id = ANY(${personIds});
  `;

  // Group by person ID
  return data.reduce((acc, item) => {
    if (!acc[item.fk_person_id]) {
      acc[item.fk_person_id] = [];
    }
    acc[item.fk_person_id].push(item);
    return acc;
  }, {});
}

export async function createRelationship(person1Id, person2Id, typeId) {
  const isChildRelation = Number(typeId) === 1;
  const isParentRelation = Number(typeId) === 4;
  let person1 = person1Id;
  let person2 = person2Id;
  let type = typeId;

  if (isChildRelation) {
    person1 = person1Id;
    person2 = person2Id;
    type = 4;
  } else if (isParentRelation) {
    person1 = person2Id;
    person2 = person1Id;
    type = 4;
  }

  const sql = neon(process.env.DATABASE_URL);
  await sql`
    INSERT INTO relationships (person_1, person_2, fk_type_id)
    VALUES (${person1}, ${person2}, ${type})
  `;
}

export async function deleteRelationship(relationshipId) {
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    DELETE FROM relationships
    WHERE relationship_id = ${relationshipId}
  `;
}
