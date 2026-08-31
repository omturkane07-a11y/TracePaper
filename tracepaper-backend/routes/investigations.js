const express = require("express");
const pool = require("../db");

const router = express.Router();

// ============================================
// GET ALL INVESTIGATIONS
// ============================================

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.investigation_code,
        i.title,
        i.description,
        i.priority,
        i.status,
        i.started_at,
        i.closed_at,
        i.created_at,

        qp.paper_code,
        qp.paper_title,

        e.exam_code,
        e.exam_name

      FROM investigations i

      LEFT JOIN question_papers qp
        ON i.question_paper_id = qp.id

      LEFT JOIN exams e
        ON qp.exam_id = e.id

      ORDER BY i.created_at DESC
    `);

    res.json({
      status: "success",
      investigations: result.rows,
    });

  } catch (error) {
    console.error("Get investigations error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load investigations",
      error: error.message,
    });
  }
});


// ============================================
// CREATE INVESTIGATION
// ============================================

router.post("/", async (req, res) => {
  try {
    const {
      title,
      status,
      priority,
      started_at,
    } = req.body;

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Investigation title is required",
      });
    }

    // Validate date
    if (!started_at) {
      return res.status(400).json({
        status: "error",
        message: "Investigation date is required",
      });
    }

    // ============================================
    // GENERATE INVESTIGATION CODE
    // ============================================

    const lastCodeResult = await pool.query(`
      SELECT investigation_code
      FROM investigations
      WHERE investigation_code LIKE 'INV-%'
      ORDER BY id DESC
      LIMIT 1
    `);

    let nextNumber = 1001;

    if (lastCodeResult.rows.length > 0) {
      const lastCode =
        lastCodeResult.rows[0].investigation_code;

      const number = parseInt(
        lastCode.replace("INV-", ""),
        10
      );

      if (!isNaN(number)) {
        nextNumber = number + 1;
      }
    }

    const investigationCode = `INV-${nextNumber}`;

    // ============================================
    // INSERT INTO NEON DATABASE
    // ============================================

    const result = await pool.query(
      `
      INSERT INTO investigations (
        investigation_code,
        title,
        priority,
        status,
        started_at
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        investigationCode,
        title.trim(),
        priority || "medium",
        status || "open",
        started_at,
      ]
    );

    const investigation = result.rows[0];

    // ============================================
    // AUDIT LOG
    // ============================================

    await pool.query(
      `
      INSERT INTO audit_logs (
        action,
        entity_type,
        entity_id,
        description
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        "INVESTIGATION_CREATED",
        "investigation",
        investigation.id,
        `Investigation ${investigationCode} created`,
      ]
    );

    // ============================================
    // RESPONSE
    // ============================================

    res.status(201).json({
      status: "success",
      message: "Investigation created successfully",
      investigation,
    });

  } catch (error) {
    console.error("Create investigation error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to create investigation",
      error: error.message,
    });
  }
});


// ============================================
// GET SINGLE INVESTIGATION
// ============================================

router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      `
      SELECT
        i.id,
        i.investigation_code,
        i.title,
        i.description,
        i.priority,
        i.status,
        i.started_at,
        i.closed_at,
        i.created_at,

        qp.paper_code,
        qp.paper_title,

        e.exam_code,
        e.exam_name

      FROM investigations i

      LEFT JOIN question_papers qp
        ON i.question_paper_id = qp.id

      LEFT JOIN exams e
        ON qp.exam_id = e.id

      WHERE i.investigation_code = $1
      `,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Investigation not found",
      });
    }

    res.json({
      status: "success",
      investigation: result.rows[0],
    });

  } catch (error) {
    console.error("Get investigation error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load investigation",
      error: error.message,
    });
  }
});


module.exports = router;