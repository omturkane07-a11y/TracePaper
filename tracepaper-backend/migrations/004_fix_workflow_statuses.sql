BEGIN;

ALTER TABLE question_papers
DROP CONSTRAINT IF EXISTS question_papers_workflow_status_check;

ALTER TABLE question_papers
ADD CONSTRAINT question_papers_workflow_status_check
CHECK (
  workflow_status IN (
    'draft',
    'pending_review',
    'review_rejected',
    'pending_final_approval',
    'final_rejected',
    'approved'
  )
);

COMMIT;