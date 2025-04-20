// lib/db.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // important for Neon
});

export default pool;
