import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { person_id, url } = await req.json();

    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/uploads/${url}`;
    console.log(publicUrl);

    if (!url || !person_id) {
      return NextResponse.json(
        { success: false, message: "Image URL and person ID are required" },
        { status: 400 }
      );
    }

    await sql`
        INSERT INTO images (image_url, fk_person_id)
        VALUES (${url}, ${person_id})
      `;

    return NextResponse.json({
      success: true,
      message: "Image added successfully",
    });
  } catch (error) {
    console.error("Image upload DB error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add image" },
      { status: 500 }
    );
  }
}

// Delete function for gallery tabs
export async function DELETE(req) {
  try {
    const { person_id, url } = await req.json();

    await sql`
      DELETE FROM images 
      WHERE fk_person_id = ${person_id} AND image_url = ${url}
    `;

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("❌ Image delete DB error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete image" },
      { status: 500 }
    );
  }
}
