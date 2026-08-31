const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// ============================================================
// CONSTANTS
// ============================================================

const PAPER_STATUSES = [
  "active",
  "revoked",
  "leaked",
  "archived",
];

const WORKFLOW_STATUSES = [
  "draft",
  "pending_review",
  "review_rejected",
  "pending_final_approval",
  "final_rejected",
  "approved",
];

// ============================================================
// ROLE HELPERS
// ============================================================

const CREATOR_ROLES = ["creator"];

const REVIEWER_ROLES = ["reviewer"];

const APPROVER_ROLES = [
  "approver",
  "final_approver",
];

const FINAL_DOWNLOAD_ROLES = [
  ...APPROVER_ROLES,
  "admin",
];

// ============================================================
// GENERATE PAPER CODE
// ============================================================

const generatePaperCode = () => {
  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `TP-${new Date().getFullYear()}-${randomPart}`;
};

// ============================================================
// GET CURRENT USER
// ============================================================

const getCurrentUser = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      full_name,
      email,
      role,
      is_active,
      department
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

// ============================================================
// CHECK ROLE
// ============================================================

const hasRole = (user, allowedRoles) => {
  if (!user || !user.role) {
    return false;
  }

  return allowedRoles.includes(
    String(user.role).trim().toLowerCase()
  );
};

const canAccessPaper = (paper, user) => {
  const userRole = String(user.role || "")
    .trim()
    .toLowerCase();

  if (userRole === "admin") {
    return true;
  }

  if (userRole === "creator") {
    return Number(paper.created_by) === Number(user.id);
  }

  if (userRole === "reviewer") {
    return [
      "pending_review",
      "pending_final_approval",
      "review_rejected",
    ].includes(paper.workflow_status) &&
      Number(paper.created_by) !== Number(user.id);
  }

  if (APPROVER_ROLES.includes(userRole)) {
    return [
      "pending_final_approval",
      "approved",
      "final_rejected",
    ].includes(paper.workflow_status) &&
      Number(paper.created_by) !== Number(user.id);
  }

  return false;
};

// ============================================================
// AUDIT HELPER
// ============================================================

const createAuditLog = async ({
  userId,
  action,
  entityId,
  description,
  ipAddress,
}) => {
  try {
    await pool.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        entity_type,
        entity_id,
        description,
        ip_address
      )
      VALUES
      (
        $1,
        $2,
        'question_paper',
        $3,
        $4,
        $5
      )
      `,
      [
        userId,
        action,
        entityId,
        description,
        ipAddress,
      ]
    );
  } catch (error) {
    console.error(
      "AUDIT LOG ERROR:",
      error.message
    );
  }
};

// ============================================================
// GET QUESTION PAPERS
// ROLE BASED
// ============================================================

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const user = await getCurrentUser(
        req.user.id
      );

      if (!user) {
        return res.status(401).json({
          status: "error",
          message:
            "Authenticated user not found.",
        });
      }

      if (user.is_active === false) {
        return res.status(403).json({
          status: "error",
          message:
            "Your account is inactive.",
        });
      }

      const userRole = String(user.role)
        .trim()
        .toLowerCase();

      let query = `
        SELECT
          qp.id,
          qp.paper_code,
          qp.exam_id,
          qp.paper_title,
          qp.file_name,
          qp.file_path,
          qp.file_hash,
          qp.fingerprint,
          qp.version,
          qp.status,
          qp.workflow_status,
          qp.created_at,
          qp.updated_at,
          qp.created_by,
          creator.full_name AS created_by_name,
          creator.role AS created_by_role,
          e.exam_code,
          e.exam_name,
          e.subject,
          e.exam_date,
          e.exam_time
        FROM question_papers qp
        LEFT JOIN exams e
          ON qp.exam_id = e.id
        LEFT JOIN users creator
          ON qp.created_by = creator.id
      `;

      const queryParams = [];

      // ======================================================
      // CREATOR
      // ======================================================

      if (userRole === "creator") {
        query += `
          WHERE qp.created_by = $1
        `;

        queryParams.push(user.id);
      }

      // ======================================================
      // REVIEWER
      // ======================================================

      else if (userRole === "reviewer") {
        query += `
          WHERE qp.workflow_status IN (
            'pending_review',
            'pending_final_approval',
            'review_rejected'
          )
            AND qp.created_by <> $1
        `;

        queryParams.push(user.id);
      }

      // ======================================================
      // FINAL APPROVER
      // ======================================================

      else if (
        userRole === "approver" ||
        userRole === "final_approver"
      ) {
        query += `
          WHERE qp.workflow_status =
            'pending_final_approval'
            AND qp.created_by <> $1
        `;

        queryParams.push(user.id);
      }

      // ======================================================
      // ADMIN
      // ======================================================

      else if (userRole === "admin") {
        // Admin sees everything.
      }

      // ======================================================
      // OTHER ROLES
      // ======================================================

      else {
        query += `
          WHERE 1 = 0
        `;
      }

      query += `
        ORDER BY qp.created_at DESC
      `;

      const result = await pool.query(
        query,
        queryParams
      );

      return res.json({
        status: "success",
        role: userRole,
        papers: result.rows,
      });
    } catch (error) {
      console.error(
        "GET QUESTION PAPERS ERROR:",
        error
      );

      return res.status(500).json({
        status: "error",
        message:
          "Failed to fetch question papers.",
        detail: error.message,
      });
    }
  }
);

// ============================================================
// CREATE QUESTION PAPER
// CREATOR ONLY
// ============================================================

router.post(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const creator =
        await getCurrentUser(req.user.id);

      if (!creator) {
        return res.status(401).json({
          status: "error",
          message:
            "Authenticated user not found.",
        });
      }

      if (creator.is_active === false) {
        return res.status(403).json({
          status: "error",
          message:
            "Your account is inactive.",
        });
      }

      // Creator only
      if (
        !hasRole(
          creator,
          CREATOR_ROLES
        )
      ) {
        return res.status(403).json({
          status: "error",
          message:
            "Only the Creator can create a question paper.",
          requiredRole: "creator",
          currentRole: creator.role,
        });
      }

      let {
        exam_id,
        exam_code,
        paper_title,
        file_name,
        file_path,
        file_hash,
        fingerprint,
        exam_name,
        subject,
        exam_date,
        exam_time,
        file_data,
      } = req.body;

      // ======================================================
      // NORMALIZE
      // ======================================================

      exam_id =
        exam_id !== undefined &&
        exam_id !== null &&
        String(exam_id).trim() !== ""
          ? String(exam_id).trim()
          : null;

      exam_code =
        exam_code !== undefined &&
        exam_code !== null &&
        String(exam_code).trim() !== ""
          ? String(exam_code).trim()
          : null;

      file_name =
        file_name !== undefined &&
        file_name !== null
          ? String(file_name).trim()
          : null;

      file_path =
        file_path !== undefined &&
        file_path !== null
          ? String(file_path).trim()
          : null;

      file_hash =
        file_hash !== undefined &&
        file_hash !== null
          ? String(file_hash).trim()
          : null;

      let pdfBuffer = null;

      if (file_data) {
        try {
          pdfBuffer = Buffer.from(String(file_data), "base64");
        } catch {
          return res.status(400).json({
            status: "error",
            message: "The uploaded PDF data is invalid.",
          });
        }

        if (
          pdfBuffer.length < 5 ||
          pdfBuffer.subarray(0, 5).toString() !== "%PDF-"
        ) {
          return res.status(400).json({
            status: "error",
            message: "The uploaded file must be a valid PDF.",
          });
        }
      }

      // ======================================================
      // PAPER TITLE
      // ======================================================

      if (
        !paper_title ||
        !String(paper_title).trim()
      ) {
        if (file_name) {
          paper_title = file_name
            .replace(/\.pdf$/i, "")
            .replace(/[_-]+/g, " ")
            .trim();
        }
      }

      if (
        !paper_title ||
        !String(paper_title).trim()
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Paper title is required. Please select a PDF file.",
        });
      }

      paper_title = String(
        paper_title
      ).trim();

      // ======================================================
      // FIND EXAM
      // ======================================================

      let exam = null;
      let finalExamId = null;

      // ------------------------------------------------------
      // EXAM ID
      // ------------------------------------------------------

      if (exam_id) {
        const numericExamId = Number(
          exam_id
        );

        if (
          Number.isInteger(
            numericExamId
          ) &&
          numericExamId > 0
        ) {
          try {
            const examResult =
              await pool.query(
                `
                SELECT
                  id,
                  exam_code,
                  exam_name,
                  subject,
                  exam_date,
                  exam_time
                FROM exams
                WHERE id = $1
                `,
                [numericExamId]
              );

            if (
              examResult.rows.length > 0
            ) {
              exam =
                examResult.rows[0];

              finalExamId =
                exam.id;
            }
          } catch (examError) {
            console.log(
              "EXAM ID LOOKUP SKIPPED:",
              examError.message
            );
          }
        }
      }

      // ------------------------------------------------------
      // EXAM CODE
      // ------------------------------------------------------

      if (!exam && exam_code) {
        try {
          const examResult =
            await pool.query(
              `
              SELECT
                id,
                exam_code,
                exam_name,
                subject,
                exam_date,
                exam_time
              FROM exams
              WHERE UPPER(TRIM(exam_code))
                    =
                    UPPER(TRIM($1))
              LIMIT 1
              `,
              [exam_code]
            );

          if (
            examResult.rows.length > 0
          ) {
            exam =
              examResult.rows[0];

            finalExamId =
              exam.id;
          }
        } catch (examError) {
          console.log(
            "EXAM CODE LOOKUP SKIPPED:",
            examError.message
          );
        }
      }

      // ------------------------------------------------------
      // OPTIONAL EXAM
      // ------------------------------------------------------

      if (!exam) {
        exam = {
          id: null,
          exam_code:
            exam_code || null,
          exam_name:
            exam_name || null,
          subject:
            subject || null,
          exam_date:
            exam_date || null,
          exam_time:
            exam_time || null,
        };

        finalExamId = null;
      }

      // ======================================================
      // GENERATE PAPER CODE
      // ======================================================

      let paperCode = null;
      let codeExists = true;

      while (codeExists) {
        paperCode =
          generatePaperCode();

        const codeCheck =
          await pool.query(
            `
            SELECT id
            FROM question_papers
            WHERE paper_code = $1
            `,
            [paperCode]
          );

        codeExists =
          codeCheck.rows.length > 0;
      }

      // ======================================================
      // FINGERPRINT
      // ======================================================

      let finalFingerprint =
        fingerprint &&
        String(fingerprint).trim()
          ? String(fingerprint)
              .trim()
              .toLowerCase()
          : null;

      if (!finalFingerprint) {
        const fingerprintInput = [
          paperCode,
          finalExamId || "NO-EXAM",
          paper_title,
          file_name || "",
          file_hash || "",
          Date.now(),
        ].join("|");

        finalFingerprint =
          crypto
            .createHash("sha256")
            .update(fingerprintInput)
            .digest("hex");
      }

      // ======================================================
      // DUPLICATE CHECK
      // ======================================================

      const duplicateCheck =
        await pool.query(
          `
          SELECT
            id,
            paper_code
          FROM question_papers
          WHERE LOWER(fingerprint)
                =
                LOWER($1)
          LIMIT 1
          `,
          [finalFingerprint]
        );

      if (
        duplicateCheck.rows.length > 0
      ) {
        return res.status(409).json({
          status: "error",
          message:
            "This question paper is already registered.",
          existingPaper:
            duplicateCheck.rows[0],
        });
      }

      // ======================================================
      // INSERT PAPER
      // ======================================================

      const result =
        await pool.query(
          `
          INSERT INTO question_papers
          (
            paper_code,
            exam_id,
            paper_title,
            file_name,
            file_path,
            file_hash,
            fingerprint,
            version,
            uploaded_by,
            status,
            created_by,
            workflow_status
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            1,
            $8,
            'active',
            $8,
            'pending_review'
          )
          RETURNING *
          `,
          [
            paperCode,
            finalExamId,
            paper_title,
            file_name || null,
            file_path || null,
            file_hash || null,
            finalFingerprint,
            creator.id,
          ]
        );

      const paper =
        result.rows[0];

      if (pdfBuffer) {
        await fs.promises.mkdir(UPLOADS_DIR, {
          recursive: true,
        });

        const storedFileName = `${paper.id}-${crypto
          .randomBytes(16)
          .toString("hex")}.pdf`;
        const storedFilePath = path.join(
          UPLOADS_DIR,
          storedFileName
        );

        await fs.promises.writeFile(
          storedFilePath,
          pdfBuffer,
          { flag: "wx" }
        );

        const pathResult = await pool.query(
          `
          UPDATE question_papers
          SET file_path = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
          `,
          [storedFilePath, paper.id]
        );

        Object.assign(paper, pathResult.rows[0]);
      }

      // ======================================================
      // AUDIT
      // ======================================================

      await createAuditLog({
        userId: creator.id,
        action: "PAPER_CREATED",
        entityId: paper.id,
        description:
          `Question paper ${paper.paper_code} was created by ${creator.full_name} and submitted for review.`,
        ipAddress: req.ip,
      });

      // ======================================================
      // SUCCESS
      // ======================================================

      return res.status(201).json({
        status: "success",
        message:
          "Question paper created and submitted for review.",
        paper,
        workflow: {
          status: "pending_review",
          nextRole: "reviewer",
        },
        creator: {
          id: creator.id,
          name: creator.full_name,
          role: creator.role,
        },
        exam: {
          id: exam.id,
          code: exam.exam_code,
          name: exam.exam_name,
          subject: exam.subject,
          date: exam.exam_date,
          time: exam.exam_time,
        },
      });
    } catch (error) {
      console.error(
        "CREATE QUESTION PAPER ERROR:",
        error
      );

      if (error.code === "23505") {
        return res.status(409).json({
          status: "error",
          message:
            "A question paper with this information already exists.",
          detail:
            error.detail || null,
        });
      }

      if (error.code === "23503") {
        return res.status(400).json({
          status: "error",
          message:
            "The selected exam does not exist in the database.",
          detail:
            error.detail || null,
        });
      }

      if (error.code === "23514") {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid workflow status for the current database schema.",
          detail:
            error.detail || null,
        });
      }

      return res.status(500).json({
        status: "error",
        message:
          "Failed to create question paper.",
        detail: error.message,
      });
    }
  }
);

// ============================================================
// REVIEW QUESTION PAPER
// REVIEWER ONLY
// ============================================================

router.put(
  "/:id/review",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const decision = String(
        req.body.decision || "approve"
      )
        .trim()
        .toLowerCase();

      const reviewComment =
        req.body.comment
          ? String(req.body.comment).trim()
          : null;

      // ======================================================
      // GET REVIEWER
      // ======================================================

      const reviewer =
        await getCurrentUser(req.user.id);

      if (!reviewer) {
        return res.status(401).json({
          status: "error",
          message:
            "Authenticated user not found.",
        });
      }

      if (reviewer.is_active === false) {
        return res.status(403).json({
          status: "error",
          message:
            "Your account is inactive.",
        });
      }

      // ======================================================
      // ROLE
      // ======================================================

      if (
        !hasRole(
          reviewer,
          REVIEWER_ROLES
        )
      ) {
        return res.status(403).json({
          status: "error",
          message:
            "Only the Reviewer can review a question paper.",
          requiredRole: "reviewer",
          currentRole: reviewer.role,
        });
      }

      // ======================================================
      // DECISION
      // ======================================================

      if (
        !["approve", "reject"].includes(
          decision
        )
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Decision must be approve or reject.",
        });
      }

      // ======================================================
      // GET PAPER
      // ======================================================

      const paperResult =
        await pool.query(
          `
          SELECT
            id,
            paper_code,
            workflow_status,
            created_by
          FROM question_papers
          WHERE id = $1
          `,
          [id]
        );

      if (
        paperResult.rows.length === 0
      ) {
        return res.status(404).json({
          status: "error",
          message:
            "Question paper not found.",
        });
      }

      const paper =
        paperResult.rows[0];

      // ======================================================
      // STATUS CHECK
      // ======================================================

      if (
        paper.workflow_status !==
        "pending_review"
      ) {
        return res.status(400).json({
          status: "error",
          message:
            `Paper cannot be reviewed because its current workflow status is "${paper.workflow_status}".`,
          currentStatus:
            paper.workflow_status,
          requiredStatus:
            "pending_review",
        });
      }

      // ======================================================
      // OWN PAPER CHECK
      // ======================================================

      if (
        Number(paper.created_by) ===
        Number(reviewer.id)
      ) {
        return res.status(403).json({
          status: "error",
          message:
            "The Creator cannot review their own question paper.",
        });
      }

      // ======================================================
      // NEW STATUS
      // ======================================================

      const newWorkflowStatus =
        decision === "approve"
          ? "pending_final_approval"
          : "review_rejected";

      // ======================================================
      // UPDATE
      // ======================================================

      const updateResult =
        await pool.query(
          `
          UPDATE question_papers
          SET
            workflow_status = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
            AND workflow_status = 'pending_review'
          RETURNING
            id,
            paper_code,
            workflow_status,
            updated_at
          `,
          [
            newWorkflowStatus,
            id,
          ]
        );

      const updatedPaper =
        updateResult.rows[0];

      if (!updatedPaper) {
        return res.status(409).json({
          status: "error",
          message:
            "The question paper is no longer pending review.",
          currentStatus:
            paper.workflow_status,
          requiredStatus:
            "pending_review",
        });
      }

      // ======================================================
      // AUDIT
      // ======================================================

      await createAuditLog({
        userId: reviewer.id,
        action:
          decision === "approve"
            ? "PAPER_REVIEWED"
            : "PAPER_REVIEW_REJECTED",
        entityId: id,
        description:
          `Question paper ${paper.paper_code} was ${
            decision === "approve"
              ? "reviewed and forwarded to Final Approver"
              : "rejected by Reviewer"
          } by ${reviewer.full_name}.${
            reviewComment
              ? ` Comment: ${reviewComment}`
              : ""
          }`,
        ipAddress: req.ip,
      });

      // ======================================================
      // SUCCESS
      // ======================================================

      return res.json({
        status: "success",
        message:
          decision === "approve"
            ? "Question paper reviewed successfully and sent to Final Approver."
            : "Question paper rejected by Reviewer.",
        paper: updatedPaper,
        workflow: {
          status: newWorkflowStatus,
          nextRole:
            decision === "approve"
              ? "final_approver"
              : "creator",
        },
      });
    } catch (error) {
      console.error(
        "REVIEW QUESTION PAPER ERROR:",
        error
      );

      return res.status(500).json({
        status: "error",
        message:
          "Failed to review question paper.",
        detail: error.message,
      });
    }
  }
);

// ============================================================
// FINAL APPROVAL
// APPROVER ONLY
// ============================================================

router.put(
  "/:id/approve",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const decision = String(
        req.body.decision || "approve"
      )
        .trim()
        .toLowerCase();

      const approvalComment =
        req.body.comment
          ? String(req.body.comment).trim()
          : null;

      // ======================================================
      // GET APPROVER
      // ======================================================

      const approver =
        await getCurrentUser(req.user.id);

      if (!approver) {
        return res.status(401).json({
          status: "error",
          message:
            "Authenticated user not found.",
        });
      }

      if (approver.is_active === false) {
        return res.status(403).json({
          status: "error",
          message:
            "Your account is inactive.",
        });
      }

      // ======================================================
      // ROLE
      // ======================================================

      if (
        !hasRole(
          approver,
          APPROVER_ROLES
        )
      ) {
        return res.status(403).json({
          status: "error",
          message:
            "Only the Final Approver can give final approval.",
          requiredRole: "approver",
          currentRole: approver.role,
        });
      }

      // ======================================================
      // DECISION
      // ======================================================

      if (
        !["approve", "reject"].includes(
          decision
        )
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Decision must be approve or reject.",
        });
      }

      // ======================================================
      // GET PAPER
      // ======================================================

      const paperResult =
        await pool.query(
          `
          SELECT
            id,
            paper_code,
            workflow_status,
            created_by
          FROM question_papers
          WHERE id = $1
          `,
          [id]
        );

      if (
        paperResult.rows.length === 0
      ) {
        return res.status(404).json({
          status: "error",
          message:
            "Question paper not found.",
        });
      }

      const paper =
        paperResult.rows[0];

      // ======================================================
      // STATUS CHECK
      // ======================================================

      if (
        paper.workflow_status !==
        "pending_final_approval"
      ) {
        return res.status(400).json({
          status: "error",
          message:
            `Paper cannot be finally approved because its current workflow status is "${paper.workflow_status}".`,
          currentStatus:
            paper.workflow_status,
          requiredStatus:
            "pending_final_approval",
        });
      }

      // ======================================================
      // OWN PAPER CHECK
      // ======================================================

      if (
        Number(paper.created_by) ===
        Number(approver.id)
      ) {
        return res.status(403).json({
          status: "error",
          message:
            "The Creator cannot give final approval to their own paper.",
        });
      }

      // ======================================================
      // NEW STATUS
      // ======================================================

      const newWorkflowStatus =
        decision === "approve"
          ? "approved"
          : "final_rejected";

      // ======================================================
      // UPDATE
      // ======================================================

      const updateResult =
        await pool.query(
          `
          UPDATE question_papers
          SET
            workflow_status = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING
            id,
            paper_code,
            workflow_status,
            updated_at
          `,
          [
            newWorkflowStatus,
            id,
          ]
        );

      const updatedPaper =
        updateResult.rows[0];

      // ======================================================
      // AUDIT
      // ======================================================

      await createAuditLog({
        userId: approver.id,
        action:
          decision === "approve"
            ? "PAPER_APPROVED"
            : "PAPER_FINAL_REJECTED",
        entityId: id,
        description:
          `Question paper ${paper.paper_code} was ${
            decision === "approve"
              ? "finally approved"
              : "rejected by Final Approver"
          } by ${approver.full_name}.${
            approvalComment
              ? ` Comment: ${approvalComment}`
              : ""
          }`,
        ipAddress: req.ip,
      });

      return res.json({
        status: "success",
        message:
          decision === "approve"
            ? "Question paper finally approved."
            : "Question paper rejected by Final Approver.",
        paper: updatedPaper,
        workflow: {
          status: newWorkflowStatus,
          nextRole:
            decision === "approve"
              ? "printing"
              : "creator",
        },
      });
    } catch (error) {
      console.error(
        "FINAL APPROVAL ERROR:",
        error
      );

      return res.status(500).json({
        status: "error",
        message:
          "Failed to process final approval.",
        detail: error.message,
      });
    }
  }
);

// ============================================================
// FINAL PAPER DOWNLOAD AUTHORIZATION
// ============================================================

router.get(
  "/:id/download-permission/:downloadType",
  authenticateToken,
  async (req, res) => {
    try {
      const { id, downloadType } = req.params;
      const allowedDownloadTypes = [
        "secure-pdf",
        "certificate",
      ];

      if (!allowedDownloadTypes.includes(downloadType)) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid final paper download type.",
        });
      }

      const user = await getCurrentUser(req.user.id);

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Authenticated user not found.",
        });
      }

      if (user.is_active === false) {
        return res.status(403).json({
          status: "error",
          message: "Your account is inactive.",
        });
      }

      const userRole = String(user.role)
        .trim()
        .toLowerCase();

      if (!FINAL_DOWNLOAD_ROLES.includes(userRole)) {
        return res.status(403).json({
          status: "error",
          message:
            "You are not authorized to download final paper files.",
          role: userRole,
        });
      }

      const paperResult = await pool.query(
        `
        SELECT id, paper_code, workflow_status
        FROM question_papers
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );

      if (paperResult.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Question paper not found.",
        });
      }

      const paper = paperResult.rows[0];

      if (paper.workflow_status !== "approved") {
        return res.status(403).json({
          status: "error",
          message:
            "Final paper downloads are available only after approval.",
          currentStatus: paper.workflow_status,
          requiredStatus: "approved",
        });
      }

      return res.json({
        status: "success",
        authorized: true,
        downloadType,
        paper: {
          id: paper.id,
          paper_code: paper.paper_code,
          workflow_status: paper.workflow_status,
        },
      });
    } catch (error) {
      console.error(
        "FINAL PAPER DOWNLOAD AUTHORIZATION ERROR:",
        error
      );

      return res.status(500).json({
        status: "error",
        message:
          "Failed to authorize final paper download.",
        detail: error.message,
      });
    }
  }
);

// ============================================================
// PAPER LIFECYCLE
// APPROVER ONLY
// ============================================================

router.put(
  "/:id/lifecycle",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedLifecycleStatuses = [
        "printed",
        "dispatched",
        "received",
      ];

      if (
        !allowedLifecycleStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid lifecycle status.",
          allowedStatuses:
            allowedLifecycleStatuses,
        });
      }

      const user =
        await getCurrentUser(req.user.id);

      if (!user) {
        return res.status(401).json({
          status: "error",
          message:
            "Authenticated user not found.",
        });
      }

      if (user.is_active === false) {
        return res.status(403).json({
          status: "error",
          message:
            "Your account is inactive.",
        });
      }

      if (
        !hasRole(
          user,
          APPROVER_ROLES
        )
      ) {
        return res.status(403).json({
          status: "error",
          message:
            "Only the Final Approver can update paper lifecycle.",
          requiredRole: "approver",
          currentRole: user.role,
        });
      }

      const paperResult =
        await pool.query(
          `
          SELECT
            id,
            paper_code,
            workflow_status,
            created_by
          FROM question_papers
          WHERE id = $1
          `,
          [id]
        );

      if (
        paperResult.rows.length === 0
      ) {
        return res.status(404).json({
          status: "error",
          message:
            "Question paper not found.",
        });
      }

      const paper =
        paperResult.rows[0];

      if (
        paper.workflow_status !==
        "approved"
      ) {
        return res.status(400).json({
          status: "error",
          message:
            `Lifecycle cannot start because paper workflow status is "${paper.workflow_status}".`,
          requiredStatus: "approved",
          currentStatus:
            paper.workflow_status,
        });
      }

      await createAuditLog({
        userId: user.id,
        action:
          `PAPER_${status.toUpperCase()}`,
        entityId: id,
        description:
          `Question paper ${paper.paper_code} lifecycle event "${status}" recorded by ${user.full_name}.`,
        ipAddress: req.ip,
      });

      return res.json({
        status: "success",
        message:
          `Question paper lifecycle event "${status}" recorded successfully.`,
        paper: {
          id: paper.id,
          paper_code:
            paper.paper_code,
          workflow_status:
            paper.workflow_status,
          lifecycle_status: status,
        },
      });
    } catch (error) {
      console.error(
        "PAPER LIFECYCLE ERROR:",
        error
      );

      return res.status(500).json({
        status: "error",
        message:
          "Failed to record paper lifecycle.",
        detail: error.message,
      });
    }
  }
);

// ============================================================
// GET SINGLE QUESTION PAPER
// ROLE BASED ACCESS
// ============================================================

router.get(
  "/:id/preview",
  authenticateToken,
  async (req, res) => {
    try {
      const user = await getCurrentUser(req.user.id);

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Authenticated user not found.",
        });
      }

      if (user.is_active === false) {
        return res.status(403).json({
          status: "error",
          message: "Your account is inactive.",
        });
      }

      const result = await pool.query(
        `
        SELECT id, file_name, file_path, workflow_status, created_by
        FROM question_papers
        WHERE id = $1
        LIMIT 1
        `,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Question paper not found.",
        });
      }

      const paper = result.rows[0];

      if (!canAccessPaper(paper, user)) {
        return res.status(403).json({
          status: "error",
          message: "You are not authorized to preview this question paper.",
        });
      }

      if (!paper.file_path) {
        return res.status(404).json({
          status: "error",
          message: "The original PDF is not available for this paper.",
        });
      }

      const resolvedPath = path.resolve(paper.file_path);

      if (
        !resolvedPath.startsWith(`${path.resolve(UPLOADS_DIR)}${path.sep}`) ||
        !(await fs.promises.stat(resolvedPath).catch(() => null))
      ) {
        return res.status(404).json({
          status: "error",
          message: "The original PDF is not available for this paper.",
        });
      }

      res.type("application/pdf");
      res.set("Content-Disposition", "inline");
      return res.sendFile(resolvedPath);
    } catch (error) {
      console.error("PREVIEW QUESTION PAPER ERROR:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to preview question paper.",
      });
    }
  }
);

router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const user =
        await getCurrentUser(req.user.id);

      if (!user) {
        return res.status(401).json({
          status: "error",
          message:
            "Authenticated user not found.",
        });
      }

      if (user.is_active === false) {
        return res.status(403).json({
          status: "error",
          message:
            "Your account is inactive.",
        });
      }

      const userRole = String(user.role)
        .trim()
        .toLowerCase();

      const paperResult =
        await pool.query(
          `
          SELECT
            qp.*,
            e.exam_code,
            e.exam_name,
            e.subject,
            e.exam_date,
            e.exam_time,
            creator.full_name AS created_by_name,
            creator.role AS created_by_role
          FROM question_papers qp
          LEFT JOIN exams e
            ON qp.exam_id = e.id
          LEFT JOIN users creator
            ON qp.created_by = creator.id
          WHERE qp.id = $1
          `,
          [id]
        );

      if (
        paperResult.rows.length === 0
      ) {
        return res.status(404).json({
          status: "error",
          message:
            "Question paper not found.",
        });
      }

      const paper =
        paperResult.rows[0];

      // ======================================================
      // ACCESS CONTROL
      // ======================================================

      let canAccess = false;

      // Admin
      if (userRole === "admin") {
        canAccess = true;
      }

      // Creator
      else if (userRole === "creator") {
        canAccess =
          Number(paper.created_by) ===
          Number(user.id);
      }

      // Reviewer
      else if (userRole === "reviewer") {
        /*
         * Reviewer can open:
         * 1. pending_review papers
         * 2. papers already forwarded to final approval
         * 3. papers rejected during review
         *
         * This prevents the UI from showing
         * "reviewed successfully" + "unauthorized"
         * after a successful review.
         */
        canAccess =
          (
            paper.workflow_status ===
              "pending_review" ||
            paper.workflow_status ===
              "pending_final_approval" ||
            paper.workflow_status ===
              "review_rejected"
          ) &&
          Number(paper.created_by) !==
            Number(user.id);
      }

      // Final Approver
      else if (
        userRole === "approver" ||
        userRole === "final_approver"
      ) {
        canAccess =
          (
            paper.workflow_status ===
              "pending_final_approval" ||
            paper.workflow_status ===
              "approved" ||
            paper.workflow_status ===
              "final_rejected"
          ) &&
          Number(paper.created_by) !==
            Number(user.id);
      }

      if (!canAccess) {
        return res.status(403).json({
          status: "error",
          message:
            "You are not authorized to access this question paper.",
          role: userRole,
        });
      }

      // ======================================================
      // AUDIT TRAIL
      // ======================================================

      const auditResult =
        await pool.query(
          `
          SELECT
            al.id,
            al.action,
            al.entity_type,
            al.entity_id,
            al.description,
            al.ip_address,
            al.created_at,
            u.id AS user_id,
            u.full_name AS user_name,
            u.role AS user_role
          FROM audit_logs al
          LEFT JOIN users u
            ON al.user_id = u.id
          WHERE
            al.entity_type = 'question_paper'
            AND al.entity_id = $1
          ORDER BY
            al.created_at ASC
          `,
          [paper.id]
        );

      return res.json({
        status: "success",
        paper,
        auditTrail:
          auditResult.rows,
      });
    } catch (error) {
      console.error(
        "GET QUESTION PAPER ERROR:",
        error
      );

      return res.status(500).json({
        status: "error",
        message:
          "Failed to fetch question paper.",
        detail: error.message,
      });
    }
  }
);

// ============================================================
// FINGERPRINT VERIFICATION
// ============================================================

router.post(
  "/verify",
  authenticateToken,
  async (req, res) => {
    try {
      const { fingerprint } = req.body;

      if (
        !fingerprint ||
        !String(fingerprint).trim()
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Fingerprint is required.",
        });
      }

      const user =
        await getCurrentUser(req.user.id);

      if (!user) {
        return res.status(401).json({
          status: "error",
          message:
            "Authenticated user not found.",
        });
      }

      if (user.is_active === false) {
        return res.status(403).json({
          status: "error",
          message:
            "Your account is inactive.",
        });
      }

      const normalizedFingerprint =
        String(fingerprint)
          .trim()
          .toLowerCase();

      const result =
        await pool.query(
          `
          SELECT
            qp.id,
            qp.paper_code,
            qp.paper_title,
            qp.file_name,
            qp.file_hash,
            qp.fingerprint,
            qp.version,
            qp.status,
            qp.workflow_status,
            qp.created_at,
            qp.updated_at,
            qp.created_by,
            creator.full_name AS created_by_name,
            creator.role AS created_by_role,
            e.exam_code,
            e.exam_name,
            e.subject,
            e.exam_date,
            e.exam_time
          FROM question_papers qp
          LEFT JOIN users creator
            ON qp.created_by = creator.id
          LEFT JOIN exams e
            ON qp.exam_id = e.id
          WHERE LOWER(qp.fingerprint) = $1
          LIMIT 1
          `,
          [normalizedFingerprint]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          status: "success",
          matchFound: false,
          message:
            "No matching question paper found.",
        });
      }

      const paper =
        result.rows[0];

      await createAuditLog({
        userId: req.user.id,
        action:
          "PAPER_FINGERPRINT_VERIFIED",
        entityId: paper.id,
        description:
          `Fingerprint verification performed for ${paper.paper_code}.`,
        ipAddress: req.ip,
      });

      const auditResult =
        await pool.query(
          `
          SELECT
            al.id,
            al.action,
            al.entity_type,
            al.entity_id,
            al.description,
            al.ip_address,
            al.created_at,
            u.id AS user_id,
            u.full_name AS user_name,
            u.role AS user_role
          FROM audit_logs al
          LEFT JOIN users u
            ON al.user_id = u.id
          WHERE
            al.entity_type = 'question_paper'
            AND al.entity_id = $1
          ORDER BY
            al.created_at ASC
          `,
          [paper.id]
        );

      return res.json({
        status: "success",
        matchFound: true,
        message:
          "Question paper fingerprint matched successfully.",
        paper,
        workflow: {
          status:
            paper.workflow_status ||
            "pending_review",
          creator: {
            id: paper.created_by,
            name:
              paper.created_by_name,
            role:
              paper.created_by_role,
          },
        },
        auditTrail:
          auditResult.rows,
      });
    } catch (error) {
      console.error(
        "FINGERPRINT VERIFICATION ERROR:",
        error
      );

      return res.status(500).json({
        status: "error",
        message:
          "Fingerprint verification failed.",
        detail: error.message,
      });
    }
  }
);

// ============================================================
// UPDATE GENERAL PAPER STATUS
// APPROVER ONLY
// ============================================================

router.put(
  "/:id/status",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        !status ||
        !PAPER_STATUSES.includes(status)
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid paper status.",
          allowedStatuses:
            PAPER_STATUSES,
        });
      }

      const user =
        await getCurrentUser(req.user.id);

      if (!user) {
        return res.status(401).json({
          status: "error",
          message:
            "Authenticated user not found.",
        });
      }

      if (user.is_active === false) {
        return res.status(403).json({
          status: "error",
          message:
            "Your account is inactive.",
        });
      }

      if (
        !hasRole(
          user,
          APPROVER_ROLES
        )
      ) {
        return res.status(403).json({
          status: "error",
          message:
            "Only the Final Approver can change the paper status.",
          requiredRole: "approver",
          currentRole: user.role,
        });
      }

      const result =
        await pool.query(
          `
          UPDATE question_papers
          SET
            status = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING
            id,
            paper_code,
            status,
            workflow_status,
            updated_at
          `,
          [status, id]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          status: "error",
          message:
            "Question paper not found.",
        });
      }

      const paper =
        result.rows[0];

      await createAuditLog({
        userId: user.id,
        action:
          "PAPER_STATUS_CHANGED",
        entityId: id,
        description:
          `Question paper ${paper.paper_code} status changed to ${status} by ${user.full_name}.`,
        ipAddress: req.ip,
      });

      return res.json({
        status: "success",
        message:
          "Paper status updated successfully.",
        paper,
      });
    } catch (error) {
      console.error(
        "UPDATE PAPER STATUS ERROR:",
        error
      );

      return res.status(500).json({
        status: "error",
        message:
          "Failed to update question paper status.",
        detail: error.message,
      });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;