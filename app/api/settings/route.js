import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

// POST handles both fetching and updating depending on input
export async function POST(req) {
    try {
        const body = await req.json();
        const { userId, firstName, lastName, email, password } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        // FETCH if only userId is provided
        if (!firstName && !lastName && !email) {
            const result = await sql`
        SELECT user_firstname, user_lastname, user_email
        FROM users
        WHERE user_id = ${userId}
      `;

            if (result.length === 0) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            return NextResponse.json(result[0]);
        }

        // UPDATE if full data is present
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
        WHERE user_id = ${userId}
      `;
        } else {
            await sql`
        UPDATE users
        SET user_firstname = ${firstName},
            user_lastname = ${lastName},
            user_email = ${email}
        WHERE user_id = ${userId}
      `;
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('POST /api/settings failed:', err);
        return NextResponse.json({ error: 'Failed to process settings request' }, { status: 500 });
    }
}