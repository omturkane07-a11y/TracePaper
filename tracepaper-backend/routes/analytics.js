const express = require("express");
const router = express.Router();

const pool = require("../db");

// ============================================
// GET ANALYTICS DATA
// ============================================

router.get("/", async (req, res) => {
  try {
    // ============================================
    // TOTAL INVESTIGATIONS
    // ============================================

    const totalCasesResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM investigations
    `);

    // ============================================
    // LEAK DETECTED
    // ============================================

    const leakDetectedResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM leak_cases
      WHERE status IN ('detected', 'confirmed')
    `);

    // ============================================
    // RESOLVED INVESTIGATIONS
    // ============================================

    const resolvedResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM investigations
      WHERE status IN ('resolved', 'closed')
    `);

    // ============================================
    // RISK DISTRIBUTION
    // ============================================

    const riskResult = await pool.query(`
      SELECT
        INITCAP(priority) AS name,
        COUNT(*)::int AS value
      FROM investigations
      GROUP BY priority
      ORDER BY
        CASE priority
          WHEN 'low' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'high' THEN 3
          WHEN 'critical' THEN 4
        END
    `);

    // ============================================
    // MONTHLY INVESTIGATIONS
    // CURRENT YEAR
    // ============================================

    const monthlyResult = await pool.query(`
      SELECT
        TO_CHAR(created_at, 'Mon') AS month,
        EXTRACT(MONTH FROM created_at)::int AS month_number,
        COUNT(*)::int AS investigations
      FROM investigations
      WHERE EXTRACT(YEAR FROM created_at)
            = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY
        TO_CHAR(created_at, 'Mon'),
        EXTRACT(MONTH FROM created_at)
      ORDER BY month_number
    `);

    // ============================================
    // SOURCE ANALYSIS
    // ============================================

    const sourceResult = await pool.query(`
      SELECT
        source,
        COUNT(*)::int AS count
      FROM leak_cases
      WHERE source IS NOT NULL
        AND TRIM(source) <> ''
      GROUP BY source
      ORDER BY count DESC
    `);

    // ============================================
    // RESPONSE
    // ============================================

    res.json({
      success: true,

      stats: {
        totalCases: totalCasesResult.rows[0].total,
        leakDetected: leakDetectedResult.rows[0].total,
        resolved: resolvedResult.rows[0].total,
      },

      riskDistribution: riskResult.rows,

      monthlyInvestigations: monthlyResult.rows.map((item) => ({
        month: item.month,
        investigations: item.investigations,
      })),

      sourceAnalysis: sourceResult.rows,
    });
  } catch (error) {
    console.error("Analytics API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load analytics data",
    });
  }
});

module.exports = router;