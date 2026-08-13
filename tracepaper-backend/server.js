const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

// ============================================
// ROOT TEST ROUTE
// ============================================

app.get("/", (req, res) => {
  res.json({
    message: "TracePaper Backend is running!",
    status: "success",
  });
});

// ============================================
// DATABASE TEST ROUTE
// ============================================

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "success",
      message: "Neon PostgreSQL connected successfully!",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ============================================
// AUTH ROUTES
// ============================================

app.use("/api/auth", authRoutes);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(
    `TracePaper Backend running on http://localhost:${PORT}`
  );
});