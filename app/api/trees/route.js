import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { user_id, title, desc } = await req.json();

    if (!title || !user_id) {
      return NextResponse.json(
        { success: false, message: "Title and user ID are required" },
        { status: 400 }
      );
    }

    // Insert tree into database
    const result = await sql`
      INSERT INTO trees (tree_owner, tree_name, tree_desc)
      VALUES (${user_id}, ${title}, ${desc}) RETURNING tree_id
    `;

    return NextResponse.json({
      success: true,
      message: "Tree created successfully",
      tree_id: result[0].tree_id,
    });
  } catch (error) {
    console.error("Error creating tree:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create tree" },
      { status: 500 }
    );
  }
}
