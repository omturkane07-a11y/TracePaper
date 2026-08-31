-- ============================================================
-- TRACEPAPER
-- QUESTION PAPER 3-MEMBER APPROVAL WORKFLOW
-- Migration: 002_question_paper_approval_workflow.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ADD WORKFLOW COLUMNS
-- ============================================================

ALTER TABLE question_papers
ADD COLUMN IF NOT EXISTS created_by INTEGER;

ALTER TABLE question_papers
ADD COLUMN IF NOT EXISTS reviewed_by INTEGER;

ALTER TABLE question_papers
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

ALTER TABLE question_papers
ADD COLUMN IF NOT EXISTS review_comment TEXT;

ALTER TABLE question_papers
ADD COLUMN IF NOT EXISTS final_approved_by INTEGER;

ALTER TABLE question_papers
ADD COLUMN IF NOT EXISTS final_approved_at TIMESTAMP;

ALTER TABLE question_papers
ADD COLUMN IF NOT EXISTS final_approval_comment TEXT;

ALTER TABLE question_papers
ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(30)
DEFAULT 'draft';

-- ============================================================
-- 2. FOREIGN KEYS
-- ============================================================

ALTER TABLE question_papers
ADD CONSTRAINT fk_question_papers_created_by
FOREIGN KEY (created_by)
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE question_papers
ADD CONSTRAINT fk_question_papers_reviewed_by
FOREIGN KEY (reviewed_by)
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE question_papers
ADD CONSTRAINT fk_question_papers_final_approved_by
FOREIGN KEY (final_approved_by)
REFERENCES users(id)
ON DELETE SET NULL;

-- ============================================================
-- 3. WORKFLOW STATUS CHECK
-- ============================================================

ALTER TABLE question_papers
ADD CONSTRAINT question_papers_workflow_status_check
CHECK (
  workflow_status IN (
    'draft',
    'submitted',
    'review_approved',
    'review_rejected',
    'final_approved',
    'final_rejected'
  )
);

-- ============================================================
-- 4. EXISTING RECORDS
-- ============================================================

UPDATE question_papers
SET created_by = uploaded_by
WHERE created_by IS NULL;

UPDATE question_papers
SET workflow_status = 'draft'
WHERE workflow_status IS NULL;

-- ============================================================
-- 5. INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_question_papers_workflow_status
ON question_papers(workflow_status);

CREATE INDEX IF NOT EXISTS idx_question_papers_created_by
ON question_papers(created_by);

CREATE INDEX IF NOT EXISTS idx_question_papers_reviewed_by
ON question_papers(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_question_papers_final_approved_by
ON question_papers(final_approved_by);

COMMIT;