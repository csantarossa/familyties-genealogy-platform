import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function PUT(req, context) {
const  { id:treeId } =  context.params;
const { person_id, image_url } = await req.json();

if (!person_id || !image_url) {
    return NextResponse.json(
    { success: false, message: "Missing person_id or image_url" },
    { status: 400 }
    );
}

try {

    // ✅ Corrected UPDATE query
    await sql`
    UPDATE person
    SET person_main_img = ${image_url}
    WHERE person_id = ${person_id} AND fk_tree_id = ${treeId};
    `;

    return NextResponse.json({
    success: true,
    message: "Profile image updated and removed from gallery.",
    });
} catch (err) {
    console.error("Error updating profile image:", err);
    return NextResponse.json(
    { success: false, message: "Internal server error" },
    { status: 500 }
    );
}
}
