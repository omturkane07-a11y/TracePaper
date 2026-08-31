const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },

  // Keep database connection alive
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// ============================================
// DATABASE CONNECT
// ============================================

pool.on("connect", () => {
  console.log("Connected to Neon PostgreSQL");
});

// ============================================
// DATABASE ERROR
// ============================================

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err.message);
});

// ============================================
// TEST DATABASE CONNECTION
// ============================================

const testDatabaseConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log(
      "Neon PostgreSQL connection successful:",
      result.rows[0].now
    );
  } catch (error) {
    console.error(
      "Neon PostgreSQL connection failed:",
      error.message
    );
  }
};

testDatabaseConnection();

module.exports = pool;