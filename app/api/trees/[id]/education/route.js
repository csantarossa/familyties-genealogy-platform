import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function PUT(req) {
  try {
    const { personId, education } = await req.json();

    if (!personId || !Array.isArray(education)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    await sql`DELETE FROM education WHERE fk_person_id = ${personId}`;

    for (const edu of education) {
      await sql`
        INSERT INTO education (
          fk_person_id, title, institution, location, start_date, end_date, description
        )
        VALUES (
          ${personId},
          ${edu.title},
          ${edu.institution},
          ${edu.institution_location},
          ${edu.start_date || null},
          ${edu.end_date || null},
          ${edu.description}
        )
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json(
      { success: false, message: "Error updating education" },
      { status: 500 }
    );
  }
}
