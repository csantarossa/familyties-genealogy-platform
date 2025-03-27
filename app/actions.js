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

export async function getSpouses(id) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`SELECT 
  r.*,
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
  END AS other_person_lastname
FROM relationships r
JOIN person p1 ON r.person_1 = p1.person_id
JOIN person p2 ON r.person_2 = p2.person_id
WHERE (r.person_1 = ${id} OR r.person_2 = ${id})
  AND r.fk_type_id = 3;`;
  return data;
}
