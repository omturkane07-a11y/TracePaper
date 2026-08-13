-- ============================================
-- TRACEPAPER INITIAL DATABASE SCHEMA
-- PostgreSQL
-- ============================================

-- ============================================
-- USERS
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    role VARCHAR(50) NOT NULL DEFAULT 'investigator',

    phone VARCHAR(20),

    department VARCHAR(150),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_role_check
        CHECK (
            role IN (
                'admin',
                'investigator',
                'exam_board',
                'exam_center',
                'viewer'
            )
        )
);


-- ============================================
-- EXAM CENTERS
-- ============================================

CREATE TABLE IF NOT EXISTS exam_centers (
    id SERIAL PRIMARY KEY,

    center_code VARCHAR(50) UNIQUE NOT NULL,

    center_name VARCHAR(200) NOT NULL,

    address TEXT,

    city VARCHAR(100),

    state VARCHAR(100),

    contact_person VARCHAR(150),

    contact_phone VARCHAR(20),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- EXAMS
-- ============================================

CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,

    exam_code VARCHAR(100) UNIQUE NOT NULL,

    exam_name VARCHAR(255) NOT NULL,

    subject VARCHAR(150),

    exam_date DATE,

    exam_time TIME,

    duration_minutes INTEGER,

    total_marks INTEGER,

    created_by INTEGER,

    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT exams_status_check
        CHECK (
            status IN (
                'draft',
                'scheduled',
                'completed',
                'cancelled'
            )
        ),

    CONSTRAINT exams_created_by_fk
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- ============================================
-- QUESTION PAPERS
-- ============================================

CREATE TABLE IF NOT EXISTS question_papers (
    id SERIAL PRIMARY KEY,

    paper_code VARCHAR(100) UNIQUE NOT NULL,

    exam_id INTEGER NOT NULL,

    paper_title VARCHAR(255) NOT NULL,

    file_name VARCHAR(255),

    file_path TEXT,

    file_hash VARCHAR(255),

    fingerprint VARCHAR(255) UNIQUE,

    version INTEGER NOT NULL DEFAULT 1,

    uploaded_by INTEGER,

    status VARCHAR(50) NOT NULL DEFAULT 'active',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT question_papers_exam_fk
        FOREIGN KEY (exam_id)
        REFERENCES exams(id)
        ON DELETE CASCADE,

    CONSTRAINT question_papers_uploaded_by_fk
        FOREIGN KEY (uploaded_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT question_papers_status_check
        CHECK (
            status IN (
                'active',
                'revoked',
                'leaked',
                'archived'
            )
        )
);


-- ============================================
-- PAPER FINGERPRINTS
-- ============================================

CREATE TABLE IF NOT EXISTS paper_fingerprints (
    id SERIAL PRIMARY KEY,

    question_paper_id INTEGER NOT NULL,

    fingerprint_hash VARCHAR(255) UNIQUE NOT NULL,

    watermark_data TEXT,

    generated_for VARCHAR(150),

    generated_by INTEGER,

    verification_count INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT paper_fingerprints_paper_fk
        FOREIGN KEY (question_paper_id)
        REFERENCES question_papers(id)
        ON DELETE CASCADE,

    CONSTRAINT paper_fingerprints_user_fk
        FOREIGN KEY (generated_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- ============================================
-- INVESTIGATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS investigations (
    id SERIAL PRIMARY KEY,

    investigation_code VARCHAR(100) UNIQUE NOT NULL,

    question_paper_id INTEGER,

    investigator_id INTEGER,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    priority VARCHAR(30) NOT NULL DEFAULT 'medium',

    status VARCHAR(50) NOT NULL DEFAULT 'open',

    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    closed_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT investigations_paper_fk
        FOREIGN KEY (question_paper_id)
        REFERENCES question_papers(id)
        ON DELETE SET NULL,

    CONSTRAINT investigations_investigator_fk
        FOREIGN KEY (investigator_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT investigations_priority_check
        CHECK (
            priority IN (
                'low',
                'medium',
                'high',
                'critical'
            )
        ),

    CONSTRAINT investigations_status_check
        CHECK (
            status IN (
                'open',
                'investigating',
                'resolved',
                'closed'
            )
        )
);


-- ============================================
-- LEAK CASES
-- ============================================

CREATE TABLE IF NOT EXISTS leak_cases (
    id SERIAL PRIMARY KEY,

    case_code VARCHAR(100) UNIQUE NOT NULL,

    question_paper_id INTEGER,

    investigation_id INTEGER,

    detected_fingerprint VARCHAR(255),

    source VARCHAR(255),

    detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    severity VARCHAR(30) NOT NULL DEFAULT 'medium',

    status VARCHAR(50) NOT NULL DEFAULT 'detected',

    evidence TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT leak_cases_paper_fk
        FOREIGN KEY (question_paper_id)
        REFERENCES question_papers(id)
        ON DELETE SET NULL,

    CONSTRAINT leak_cases_investigation_fk
        FOREIGN KEY (investigation_id)
        REFERENCES investigations(id)
        ON DELETE SET NULL,

    CONSTRAINT leak_cases_severity_check
        CHECK (
            severity IN (
                'low',
                'medium',
                'high',
                'critical'
            )
        ),

    CONSTRAINT leak_cases_status_check
        CHECK (
            status IN (
                'detected',
                'under_investigation',
                'confirmed',
                'resolved',
                'false_positive'
            )
        )
);


-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,

    user_id INTEGER,

    action VARCHAR(100) NOT NULL,

    entity_type VARCHAR(100),

    entity_id INTEGER,

    description TEXT,

    ip_address VARCHAR(100),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT audit_logs_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_question_papers_exam
ON question_papers(exam_id);

CREATE INDEX IF NOT EXISTS idx_question_papers_fingerprint
ON question_papers(fingerprint);

CREATE INDEX IF NOT EXISTS idx_paper_fingerprints_hash
ON paper_fingerprints(fingerprint_hash);

CREATE INDEX IF NOT EXISTS idx_investigations_status
ON investigations(status);

CREATE INDEX IF NOT EXISTS idx_investigations_investigator
ON investigations(investigator_id);

CREATE INDEX IF NOT EXISTS idx_leak_cases_status
ON leak_cases(status);

CREATE INDEX IF NOT EXISTS idx_leak_cases_severity
ON leak_cases(severity);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user
ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created
ON audit_logs(created_at);


-- ============================================
-- MIGRATION COMPLETE
-- ============================================

SELECT 'TracePaper database schema created successfully!' AS message;