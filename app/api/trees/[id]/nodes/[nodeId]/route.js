import { createClient } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function DELETE(req, context) {
const params = await context.params;
const personId = parseInt(params.nodeId);

const client = createClient();
await client.connect();

try {
    // Delete all relationships where the person appears in either column
    await client.sql`
DELETE FROM relationships 
WHERE person_1 = ${personId} OR person_2 = ${personId}
    `;

    // Delete the person from the person table
    await client.sql`
DELETE FROM person 
WHERE person_id = ${personId}
    `;

    return NextResponse.json({ success: true });
} catch (error) {
    console.error("DB ERROR:", error);
    return NextResponse.json({ error: "Failed to delete node" }, { status: 500 });
}
}
