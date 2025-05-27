const { Pool } = require("pg");

// Gunakan environment variable untuk keamanan
const pool = new Pool({
  user: process.env.DB_USER || "postgres.ltfnuyacimqdvasyvpqs",
  host: process.env.DB_HOST || "aws-0-ap-southeast-1.pooler.supabase.com",
  database: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "Piroy030504",
  port: process.env.DB_PORT || 6543,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
