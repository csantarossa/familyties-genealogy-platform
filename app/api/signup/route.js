import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { firstname, lastname, email, password } = await req.json();

    // Check if email already exists
    const result = await sql`SELECT * FROM users WHERE user_email = ${email}`;
    if (result.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Account already exists",
      });
    }

    // Hash password (async)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await sql`
      INSERT INTO users (user_firstname, user_lastname, user_email, user_password)
      VALUES (${firstname}, ${lastname}, ${email}, ${hashedPassword})
    `;

    // Success response
    return NextResponse.json({ success: true, message: "Signup successful" });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    });
  }
}
