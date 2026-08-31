const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../db");

const router = express.Router();

// ============================================================
// ALLOWED USER ROLES
// ============================================================

const ALLOWED_ROLES = [
  "admin",
  "investigator",
  "exam_board",
  "exam_center",
  "viewer",
  "creator",
  "reviewer",
  "approver",
];

const createAuthToken = (user) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured.");
    error.code = "JWT_CONFIG_ERROR";
    throw error;
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

// ============================================================
// REGISTER
// ============================================================

router.post("/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      department,
      role,
    } = req.body;

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (!full_name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message:
          "Full name, email and password are required.",
      });
    }

    // --------------------------------------------------------
    // PASSWORD VALIDATION
    // --------------------------------------------------------

    if (String(password).length < 6) {
      return res.status(400).json({
        status: "error",
        message:
          "Password must be at least 6 characters long.",
      });
    }

    // --------------------------------------------------------
    // NORMALIZE EMAIL
    // --------------------------------------------------------

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    // --------------------------------------------------------
    // NORMALIZE ROLE
    //
    // If role is not provided:
    // investigator will be used.
    // --------------------------------------------------------

    const userRole = role
      ? String(role).trim().toLowerCase()
      : "investigator";

    // --------------------------------------------------------
    // ROLE VALIDATION
    // --------------------------------------------------------

    if (!ALLOWED_ROLES.includes(userRole)) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid role. Allowed roles are: " +
          ALLOWED_ROLES.join(", "),
        allowedRoles: ALLOWED_ROLES,
      });
    }

    // --------------------------------------------------------
    // CHECK EXISTING USER
    // --------------------------------------------------------

    const existingUser = await pool.query(
      `
      SELECT
        id,
        email
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message:
          "An account with this email already exists.",
      });
    }

    // --------------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------------

    const passwordHash = await bcrypt.hash(
      String(password),
      10
    );

    // --------------------------------------------------------
    // INSERT USER
    // --------------------------------------------------------

    const insertQuery = `
      INSERT INTO users
      (
        full_name,
        email,
        password_hash,
        role,
        phone,
        department
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      RETURNING
        id,
        full_name,
        email,
        role,
        phone,
        department,
        is_active,
        created_at
    `;

    const result = await pool.query(
      insertQuery,
      [
        String(full_name).trim(),
        normalizedEmail,
        passwordHash,
        userRole,
        phone
          ? String(phone).trim()
          : null,
        department
          ? String(department).trim()
          : null,
      ]
    );

    const user = result.rows[0];

    // --------------------------------------------------------
    // CREATE JWT
    // --------------------------------------------------------

    const token = createAuthToken(user);

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(201).json({
      status: "success",
      message:
        "User registered successfully.",

      user,

      token,
    });
  } catch (error) {
    console.error(
      "REGISTRATION ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        "Registration failed.",
      detail: error.message,
    });
  }
});

// ============================================================
// LOGIN
// ============================================================

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message:
          "Email and password are required.",
      });
    }

    // --------------------------------------------------------
    // NORMALIZE EMAIL
    // --------------------------------------------------------

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    // --------------------------------------------------------
    // GET USER
    //
    // IMPORTANT:
    // role is fetched directly from database.
    // --------------------------------------------------------

    const loginQuery = `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        role,
        phone,
        department,
        is_active,
        created_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `;

    const result = await pool.query(
      loginQuery,
      [normalizedEmail]
    );

    // --------------------------------------------------------
    // USER NOT FOUND
    // --------------------------------------------------------

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message:
          "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    // --------------------------------------------------------
    // ACCOUNT STATUS
    // --------------------------------------------------------

    if (user.is_active === false) {
      return res.status(403).json({
        status: "error",
        message:
          "Your account is inactive.",
      });
    }

    // --------------------------------------------------------
    // NORMALIZE DATABASE ROLE
    // --------------------------------------------------------

    const databaseRole = user.role
      ? String(user.role)
          .trim()
          .toLowerCase()
      : null;

    // --------------------------------------------------------
    // ROLE VALIDATION
    // --------------------------------------------------------

    if (
      !databaseRole ||
      !ALLOWED_ROLES.includes(databaseRole)
    ) {
      return res.status(403).json({
        status: "error",
        message:
          "Your account has an invalid role.",
        currentRole: user.role,
        allowedRoles: ALLOWED_ROLES,
      });
    }

    // --------------------------------------------------------
    // PASSWORD CHECK
    // --------------------------------------------------------

    let passwordMatch = false;

    if (typeof user.password_hash === "string") {
      passwordMatch = await bcrypt.compare(
        String(password),
        user.password_hash
      );
    }

    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        message:
          "Invalid email or password.",
      });
    }

    // --------------------------------------------------------
    // CREATE JWT
    //
    // IMPORTANT:
    // Actual database role is stored in JWT.
    // --------------------------------------------------------

    const token = createAuthToken({
      ...user,
      role: databaseRole,
    });

    // --------------------------------------------------------
    // REMOVE PASSWORD HASH
    // --------------------------------------------------------

    delete user.password_hash;

    // Make sure response also contains normalized role
    user.role = databaseRole;

    // --------------------------------------------------------
    // SUCCESS RESPONSE
    // --------------------------------------------------------

    console.log(
      "LOGIN SUCCESS:",
      {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    );

    return res.status(200).json({
      status: "success",
      message:
        "Login successful.",

      user,

      token,
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    if (error.code === "JWT_CONFIG_ERROR") {
      return res.status(500).json({
        status: "error",
        message: "Authentication service is not configured.",
      });
    }

    if (error.code && error.code.startsWith("28")) {
      return res.status(503).json({
        status: "error",
        message: "Authentication database is unavailable.",
      });
    }

    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return res.status(503).json({
        status: "error",
        message: "Authentication database is unavailable.",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Login failed due to a server error.",
    });
  }
});

// ============================================================
// EXPORT
// ============================================================

module.exports = router;