const express = require("express");
const pool = require("../db");

const router = express.Router();

// ============================================
// DASHBOARD DATA
// ============================================

router.get("/", async (req, res) => {
  try {
    const [
      papersResult,
      pendingPapersResult,
      leaksResult,
      centersResult,
      investigationsResult,
      recentCasesResult,
      chartResult,
      activitiesResult,
    ] = await Promise.all([
      // ========================================
      // TOTAL PAPERS
      // ========================================
      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM question_papers
      `),

      // ========================================
      // PENDING QUESTION PAPERS
      //
      // Show ALL papers which are still in workflow:
      //
      // pending_review
      // pending_final_approval
      //
      // This means Creator can also SEE them.
      // Actual Approve/Reject permissions will be
      // handled separately in QuestionPaper.jsx.
      // ========================================
      pool.query(`
        SELECT
          qp.id,
          qp.paper_code,
          qp.paper_title,
          qp.exam_id,
          qp.status,
          qp.workflow_status,
          qp.created_by,
          qp.created_at,
          qp.updated_at
        FROM question_papers qp
        WHERE qp.workflow_status IN (
          'pending_review',
          'pending_final_approval'
        )
        ORDER BY qp.created_at DESC
      `),

      // ========================================
      // LEAK ALERTS
      // ========================================
      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM leak_cases
      `),

      // ========================================
      // EXAM CENTERS
      // ========================================
      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM exam_centers
        WHERE is_active = true
      `),

      // ========================================
      // INVESTIGATIONS
      // ========================================
      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM investigations
      `),

      // ========================================
      // RECENT LEAK CASES
      // ========================================
      pool.query(`
        SELECT
          lc.case_code AS id,
          COALESCE(e.exam_name, 'Unknown Exam') AS exam,
          COALESCE(ec.center_name, 'Unknown Center') AS center,
          lc.status,
          TO_CHAR(lc.detected_at, 'DD Mon YYYY') AS date
        FROM leak_cases lc

        LEFT JOIN question_papers qp
          ON lc.question_paper_id = qp.id

        LEFT JOIN exams e
          ON qp.exam_id = e.id

        LEFT JOIN exam_centers ec
          ON lc.source = ec.center_code

        ORDER BY lc.detected_at DESC
        LIMIT 5
      `),

      // ========================================
      // LAST 6 MONTHS LEAK TREND
      // ========================================
      pool.query(`
        SELECT
          TO_CHAR(month, 'Mon') AS month,
          COUNT(lc.id)::int AS leaks
        FROM generate_series(
          DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
          DATE_TRUNC('month', CURRENT_DATE),
          INTERVAL '1 month'
        ) AS month

        LEFT JOIN leak_cases lc
          ON DATE_TRUNC('month', lc.detected_at) = month

        GROUP BY month
        ORDER BY month
      `),

      // ========================================
      // RECENT ACTIVITIES
      // ========================================
      pool.query(`
        SELECT
          action,
          description,
          created_at
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT 5
      `),
    ]);

    // ========================================
    // RESPONSE
    // ========================================

    res.json({
      status: "success",

      stats: {
        totalPapers: papersResult.rows[0].count,

        // Count BOTH pending workflow stages
        pendingQuestionPapers: pendingPapersResult.rows.length,

        leakAlerts: leaksResult.rows[0].count,
        examCenters: centersResult.rows[0].count,
        investigations: investigationsResult.rows[0].count,
      },

      // ========================================
      // ALL PENDING WORKFLOW PAPERS
      // ========================================
      pendingQuestionPapers: pendingPapersResult.rows,

      recentCases: recentCasesResult.rows,

      chartData: chartResult.rows,

      activities: activitiesResult.rows,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load dashboard data",
      error: error.message,
    });
  }
});

module.exports = router;