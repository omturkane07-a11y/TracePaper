const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../db");

const router = express.Router();

// ============================================
// REGISTER
// ============================================

router.post("/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      department,
    } = req.body;

    // Required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Full name, email and password are required.",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 6 characters long.",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `
      INSERT INTO users
        (full_name, email, password_hash, role, phone, department)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        full_name,
        email,
        role,
        phone,
        department,
        is_active,
        created_at
      `,
      [
        full_name.trim(),
        normalizedEmail,
        passwordHash,
        "investigator",
        phone || null,
        department || null,
      ]
    );

    const user = result.rows[0];

    // Create JWT token
    const token = jwt.sign(
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

    res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Registration failed.",
    });
  }
});

// ============================================
// LOGIN
// ============================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Required fields
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required.",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        role,
        phone,
        department,
        is_active
      FROM users
      WHERE email = $1
      `,
      [normalizedEmail]
    );

    // User not found
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    // Check account status
    if (user.is_active === false) {
      return res.status(403).json({
        status: "error",
        message: "Your account is inactive.",
      });
    }

    // Compare entered password with stored bcrypt hash
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password.",
      });
    }

    // Create JWT token
    const token = jwt.sign(
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

    // Remove password hash before sending user data
    delete user.password_hash;

    res.status(200).json({
      status: "success",
      message: "Login successful.",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Login failed.",
    });
  }
});

// ============================================
// EXPORT ROUTER
// ============================================

module.exports = router;