const express = require("express");
const router = express.Router();

const pool = require("../db");

// ============================================
// GET NOTIFICATIONS
// ============================================

router.get("/", async (req, res) => {
  console.log("NOTIFICATIONS API CALLED");

  try {
    const result = await pool.query(`
      SELECT *
      FROM (
        -- High risk cases
        SELECT
          'security' AS type,
          'High Risk Case Detected' AS title,
          CONCAT(
            'Case ',
            lc.case_code,
            ' has been marked as ',
            LOWER(lc.severity),
            ' risk'
          ) AS message,
          lc.created_at AS created_at
        FROM leak_cases lc
        WHERE LOWER(lc.severity) = 'high'

        UNION ALL

        -- New investigations
        SELECT
          'investigation' AS type,
          'New Investigation Created' AS title,
          CONCAT(
            'Investigation ',
            i.investigation_code,
            ' was created'
          ) AS message,
          i.created_at AS created_at
        FROM investigations i

        UNION ALL

        -- Generated reports
        SELECT
          'email' AS type,
          'Investigation Report Available' AS title,
          CONCAT(
            'Report ',
            i.investigation_code,
            ' is available'
          ) AS message,
          i.created_at AS created_at
        FROM investigations i
      ) notifications
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      status: "success",
      notifications: result.rows,
    });

  } catch (error) {
    console.error(
      "Notifications API error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message: "Failed to fetch notifications",
    });
  }
});

module.exports = router;