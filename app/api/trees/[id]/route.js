import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await sql`DELETE FROM trees WHERE tree_id = ${id}`;

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
