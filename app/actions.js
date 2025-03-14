"use server";
import { neon } from "@neondatabase/serverless";

export async function getPeople() {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`select * from person`;
  return data;
}

export async function getRelationships() {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`select * from relationships`;
  return data;
}
