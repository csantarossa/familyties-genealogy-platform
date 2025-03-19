"use server";
import { neon } from "@neondatabase/serverless";

export async function getPeople(treeId) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`select * from person where fk_tree_id = ${treeId}`;
  return data;
}

export async function getTrees(user_id) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`select * from trees where tree_owner = ${user_id}`;
  return data;
}

export async function getRelationships() {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`select * from relationships`;
  return data;
}
