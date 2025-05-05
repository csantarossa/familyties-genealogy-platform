import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);
const USER_ID = 24; // replace with real session-based ID

// GET current user
export async function GET() {
    try {
        const result = await sql`
        SELECT user_firstname, user_lastname, user_email FROM users WHERE user_id = ${USER_ID}
    `;
        if (result.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(result[0]); // This is now safe
    } catch (err) {
        console.error('GET /api/settings failed:', err);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}


// POST update user
export async function POST(req) {
    try {
        const { firstName, lastName, email, password } = await req.json();

        if (!firstName || !lastName || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await sql`
        UPDATE users
        SET user_firstname = ${firstName},
            user_lastname = ${lastName},
            user_email = ${email},
            user_password = ${hashedPassword}
        WHERE user_id = ${USER_ID}
    `;
        } else {
            await sql`
        UPDATE users
        SET user_firstname = ${firstName},
            user_lastname = ${lastName},
            user_email = ${email}
        WHERE user_id = ${USER_ID}
    `;
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('POST /api/settings failed:', err);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
