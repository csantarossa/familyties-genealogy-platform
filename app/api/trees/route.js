import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { user_id, title, desc } = await req.json();

    if (!title || !user_id) {
      return NextResponse.json(
        { success: false, message: "Tree Title is required" },
        { status: 400 }
      );
    }

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

export async function PUT(req) {
  try {
    const { tree_id, editedTitle, editedDesc } = await req.json();

    if (!tree_id || !editedTitle) {
      return NextResponse.json(
        { success: false, message: "Tree ID and title are required" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE trees
      SET tree_name = ${editedTitle}, tree_desc = ${editedDesc}
      WHERE tree_id = ${tree_id}
    `;

    return NextResponse.json({
      success: true,
      message: "Tree updated successfully",
    });
  } catch (error) {
    console.error("Error updating tree:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update tree" },
      { status: 500 }
    );
  }
}
