const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const pool = require("../db");

// ============================================
// GET ALL USERS
// ============================================

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        full_name,
        email,
        role,
        phone,
        department,
        is_active,
        created_at
      FROM users
      ORDER BY id DESC
    `);

    res.json({
      status: "success",
      users: result.rows,
    });

  } catch (error) {
    console.error("Error fetching users:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch users",
    });
  }
});

// ============================================
// GET SINGLE USER
// ============================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        role,
        phone,
        department,
        is_active,
        created_at
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Error fetching user:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch user",
    });
  }
});

// ============================================
// CREATE USER
// ============================================

router.post("/", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      role = "investigator",
      phone,
      department,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Full name, email and password are required",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "User with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        password_hash,
        role,
        phone,
        department
      )
      VALUES ($1, $2, $3, $4, $5, $6)
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
        full_name,
        email,
        passwordHash,
        role,
        phone || null,
        department || null,
      ]
    );

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Error creating user:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to create user",
    });
  }
});

// ============================================
// UPDATE USER
// ============================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      email,
      role,
      phone,
      department,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET
        full_name = COALESCE($1, full_name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        phone = $4,
        department = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
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
        full_name,
        email,
        role,
        phone || null,
        department || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      message: "User updated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Error updating user:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to update user",
    });
  }
});

// ============================================
// ACTIVATE / DEACTIVATE USER
// ============================================

router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        status: "error",
        message: "is_active must be true or false",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET
        is_active = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
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
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      message: is_active
        ? "User activated successfully"
        : "User deactivated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Error updating user status:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to update user status",
    });
  }
});

// ============================================
// DELETE USER
// ============================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting user:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to delete user",
    });
  }
});

module.exports = router;