import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function DELETE(req, { params }) {
  try {
    const treeId = params.id; // ✅ Extract tree ID from URL

    await sql`DELETE FROM trees WHERE tree_id = ${treeId}`;

    return NextResponse.json({
      success: true,
      message: "Tree deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tree:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete tree" },
      { status: 500 }
    );
  }
}
