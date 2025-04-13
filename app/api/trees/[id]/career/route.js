import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function PUT(req) {
  try {
    const { personId, career } = await req.json();

    if (!personId || !Array.isArray(career)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    await sql`DELETE FROM career WHERE fk_person_id = ${personId}`;

    for (const job of career) {
      await sql`
        INSERT INTO career (
          fk_person_id, job_title, institution, location,
          start_date, end_date, description
        ) VALUES (
          ${personId},
          ${job.job_title},
          ${job.institution},
          ${job.location},
          ${job.start_date || null},
          ${job.end_date || null},
          ${job.description}
        )
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating career:", error);
    return NextResponse.json(
      { success: false, message: "Error updating career" },
      { status: 500 }
    );
  }
}
