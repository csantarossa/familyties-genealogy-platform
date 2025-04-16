"use server";
import { neon } from "@neondatabase/serverless";

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
    -- Direct relationships
    SELECT 
      r.relationship_id,
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

    UNION

    -- Infer parents from spouse (spouse of parent)
    SELECT 
      r2.relationship_id,
      'parent' AS type_name,
      s.person_id AS other_person_id,
      s.person_firstname AS other_person_firstname,
      s.person_lastname AS other_person_lastname,
      'parent' AS direction
    FROM relationships r
    JOIN relationships r2 ON r.fk_type_id IN (1, 2) -- parent links
      AND ((r.person_1 = ${id} AND r2.person_1 = r.person_2)
        OR (r.person_2 = ${id} AND r2.person_2 = r.person_1))
      AND r2.fk_type_id = 3 -- spouse
    JOIN person s ON s.person_id = CASE
      WHEN r2.person_1 = r.person_2 THEN r2.person_2
      ELSE r2.person_1
    END

    UNION

    -- Infer children from spouse
    SELECT 
      r2.relationship_id,
      'child' AS type_name,
      c.person_id AS other_person_id,
      c.person_firstname AS other_person_firstname,
      c.person_lastname AS other_person_lastname,
      'child' AS direction
    FROM relationships r
    JOIN relationships r2 ON r.fk_type_id = 3
      AND ((r.person_1 = ${id} AND r2.person_1 = r.person_2)
        OR (r.person_2 = ${id} AND r2.person_2 = r.person_1))
      AND r2.fk_type_id IN (1, 2)
    JOIN person c ON c.person_id = CASE
      WHEN r2.fk_type_id = 1 THEN r2.person_2
      ELSE r2.person_1
    END;
  `;

  console.log("🧪 Full ImmediateFamily for ID:", id, data);
  return data;
}




export async function getSiblingsBySharedParents(id) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`
    -- Case A: child → parent (fk_type_id = 2)
    SELECT DISTINCT s.person_id, s.person_firstname, s.person_lastname
    FROM relationships r1
    JOIN relationships r2 ON r1.person_2 = r2.person_2
    JOIN person s ON s.person_id = r2.person_1
    WHERE r1.fk_type_id = 2 AND r2.fk_type_id = 2
      AND r1.person_1 = ${id}
      AND r2.person_1 != ${id}

    UNION

    -- Case B: parent → child (fk_type_id = 1)
    SELECT DISTINCT s.person_id, s.person_firstname, s.person_lastname
    FROM relationships r1
    JOIN relationships r2 ON r1.person_1 = r2.person_1
    JOIN person s ON s.person_id = r2.person_2
    WHERE r1.fk_type_id = 1 AND r2.fk_type_id = 1
      AND r1.person_2 = ${id}
      AND r2.person_2 != ${id};
  `;
  return data;
}

export async function getEducation(id) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`
  SELECT * FROM education where fk_person_id = ${id};`;
  return data;
}

export async function getCareer(id) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`
  SELECT * FROM career where fk_person_id = ${id};`;
  return data;
}

export async function getGallery(id) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`
  SELECT * FROM images where fk_person_id = ${id};`;
  return data;
}
