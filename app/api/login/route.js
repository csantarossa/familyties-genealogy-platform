import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Query user by email
    const result = await sql`SELECT * FROM users WHERE user_email = ${email}`;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }


    const user = result[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.user_password);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }


    // Success
    return NextResponse.json(
    {
      success: true,
      user: {
        id: user.user_id,
        firstname: user.user_firstname,
        lastname: user.user_lastname,
        email: user.user_email,
      },
    },
    { status: 200 }
  );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    });
  }
}
