import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// DELETE a person node from the tree
export async function DELETE(req, context) {
  const params = await context.params;
  const personId = parseInt(params.nodeId);
  try {
    await sql`DELETE FROM images WHERE fk_person_id = ${personId}`;
    await sql`DELETE FROM career WHERE fk_person_id = ${personId}`;
    await sql`DELETE FROM education WHERE fk_person_id = ${personId}`;

    await sql`
        DELETE FROM relationships 
        WHERE person_1 = ${personId} OR person_2 = ${personId}
    `;

    await sql`
        DELETE FROM person 
        WHERE person_id = ${personId}
    `;
    return NextResponse.json({
      success: true,
      message: "Person deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting person:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete person" },
      { status: 500 }
    );
  }
}


export async function GET(req, context) {
  const { nodeId } = await context.params;
  console.log("✅ nodeId received:", nodeId);

  try {
    const result = await sql`
      SELECT * FROM person WHERE person_id = ${nodeId}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    const person = result[0];

    return NextResponse.json({
      person: {
        ...person,
        person_tags: person.person_tags ?? [],
        additionalInfo:
          typeof person.additional_information === "string"
            ? JSON.parse(person.additional_information || "{}")
            : person.additional_information || {},
        gallery:
          typeof person.gallery === "string"
            ? JSON.parse(person.gallery || "[]")
            : person.gallery || [],
      },
    });
  } catch (err) {
    console.error("❌ Failed to fetch person:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
