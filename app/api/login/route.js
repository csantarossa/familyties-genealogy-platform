import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";

const sql = neon(process.env.DATABASE_URL);

// sanitization function
function escapeQuotes(str) {
  return String(str)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // sanitize input (used only for logging or frontend rendering)
    const sanitizedEmail = escapeQuotes(email);
    const sanitizedPassword = escapeQuotes(password);

    // Query user by email
    const result = await sql`SELECT * FROM users WHERE user_email = ${email}`;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const user = result[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.user_password);

    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: "Invalid password" });
    }

    // Success
    return NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        firstname: escapeQuotes(user.user_firstname),
        lastname: escapeQuotes(user.user_lastname),
        email: escapeQuotes(user.user_email),
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    });
  }
}
