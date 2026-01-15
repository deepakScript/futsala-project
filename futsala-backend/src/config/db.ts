import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
});

pool.query('SELECT NOW()')
  .then(() => console.log("✅ Connected to Neon PostgreSQL"))
  .catch((err) => console.error("❌ Database connection error:", err));

  pool.on("error", (err) => {
    console.error("❌ Postgres Pool Error (Idle Client):", err.message);
    if (err.stack) console.error(err.stack);
    // process.exit(-1); // Prevent crash, let the pool handle reconnection
  });

export default pool;
