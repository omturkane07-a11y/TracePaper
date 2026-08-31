const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

// ============================================
// ROUTES
// ============================================

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const investigationRoutes = require("./routes/investigations");
const usersRoutes = require("./routes/users");
const analyticsRoutes = require("./routes/analytics");
const reportsRoutes = require("./routes/reports");
const notificationsRoutes = require("./routes/notifications");
const questionPapersRoutes = require("./routes/questionPapers");

// ============================================
// APP
// ============================================

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));

// ============================================
// REQUEST LOGGER
// ============================================

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ============================================
// ROUTES
// ============================================

app.use("/api/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/investigations", investigationRoutes);

app.use("/api/users", usersRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/reports", reportsRoutes);

app.use("/api/notifications", notificationsRoutes);

// ============================================
// QUESTION PAPER ROUTES
// ============================================

app.use(
  "/api/question-papers",
  questionPapersRoutes
);

// ============================================
// DATABASE TEST
// ============================================

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Neon PostgreSQL connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(
      "Database test error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ============================================
// ROOT
// ============================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TracePaper Backend API is running",
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error(
    "GLOBAL ERROR:",
    err.stack || err.message
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ============================================
// SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `TracePaper backend running on http://localhost:${PORT}`
  );

  console.log(
    "Question Paper API: http://localhost:" +
      `${PORT}/api/question-papers`
  );
});