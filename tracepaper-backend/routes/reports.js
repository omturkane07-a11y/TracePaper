const express = require("express");
const router = express.Router();

const pool = require("../db");

// ============================================
// GET ALL INVESTIGATION REPORTS
// ============================================

router.get("/", async (req, res) => {
  console.log("REPORT API CALLED");

  try {
    const result = await pool.query(`
      SELECT
        i.investigation_code AS report_id,
        lc.case_code AS case_id,
        e.exam_name AS exam,
        ec.center_name AS center,
        lc.severity AS risk,
        i.status AS status,
        i.created_at AS date

      FROM investigations i

      LEFT JOIN leak_cases lc
        ON lc.investigation_id = i.id

      LEFT JOIN question_papers qp
        ON i.question_paper_id = qp.id

      LEFT JOIN exams e
        ON qp.exam_id = e.id

      LEFT JOIN exam_centers ec
        ON e.exam_center_id = ec.id

      ORDER BY i.created_at DESC
    `);

    console.log("REPORTS FOUND:", result.rows.length);

    res.json({
      status: "success",
      reports: result.rows,
    });

  } catch (error) {
    console.error("REPORT API ERROR:", error);

    res.status(500).json({
      status: "error",
      message: error.message,
      detail: error.detail || null,
      code: error.code || null,
    });
  }
});

module.exports = router;