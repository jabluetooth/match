-- ============================================================
-- Match App – Full Schema Export
-- Database: PostgreSQL
-- Generated from: prisma/schema.prisma
--
-- NOTE: This app does NOT use Postgres Row Level Security. Tenant isolation
-- is enforced entirely at the application layer — see the comment block at
-- the top of prisma/schema.prisma for why.
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "users" (
  "id"         VARCHAR(255) PRIMARY KEY,          -- Clerk user ID
  "email"      VARCHAR(255) NOT NULL UNIQUE,
  "full_name"  VARCHAR(255),
  "phone"      VARCHAR(50),
  "location"   VARCHAR(255),
  "created_at" TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "jobs" (
  "id"              SERIAL       PRIMARY KEY,
  "external_id"     VARCHAR(255) UNIQUE,
  "source"          VARCHAR(100),
  "source_url"      TEXT         NOT NULL,
  "title"           VARCHAR(500) NOT NULL,
  "company_name"    VARCHAR(255) NOT NULL,
  "company_url"     TEXT,
  "location"        VARCHAR(255),
  "work_type"       VARCHAR(50),
  "employment_type" VARCHAR(50),
  "salary_min"      INTEGER,
  "salary_max"      INTEGER,
  "description"     TEXT,
  "requirements"    TEXT,
  "posted_date"     TIMESTAMPTZ,
  "scraped_at"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "status"          VARCHAR(50)  NOT NULL DEFAULT 'active',
  "created_at"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at"      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "applications" (
  "id"                   SERIAL      PRIMARY KEY,
  "user_id"              VARCHAR(255) NOT NULL,
  "job_id"               INTEGER      NOT NULL,
  "status"               VARCHAR(50)  NOT NULL DEFAULT 'interested',
  "applied_at"           TIMESTAMPTZ,
  "last_activity"        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "reminder_sent_at"     TIMESTAMPTZ,
  "interview_date"       TIMESTAMPTZ,
  "interview_location"   TEXT,
  "interview_type"       VARCHAR(50)  NOT NULL DEFAULT 'video',
  "interviewer_name"     VARCHAR(255),
  "interviewer_role"     VARCHAR(255),
  "notes"                TEXT,
  "created_at"           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at"           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE ("user_id", "job_id"),
  CONSTRAINT "applications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "applications_job_id_fkey"
    FOREIGN KEY ("job_id")  REFERENCES "jobs"("id")  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "application_events" (
  "id"             SERIAL       PRIMARY KEY,
  "application_id" INTEGER      NOT NULL,
  "user_id"        VARCHAR(255) NOT NULL,
  "action"         VARCHAR(100) NOT NULL,
  "from_status"    VARCHAR(50),
  "to_status"      VARCHAR(50),
  "metadata"       JSONB        NOT NULL DEFAULT '{}',
  "created_at"     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT "application_events_application_id_fkey"
    FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE,
  CONSTRAINT "application_events_user_id_fkey"
    FOREIGN KEY ("user_id")        REFERENCES "users"("id")        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "follow_up_log" (
  "id"              SERIAL       PRIMARY KEY,
  "application_id"  INTEGER      NOT NULL,
  "user_id"         VARCHAR(255) NOT NULL,
  "followup_type"   VARCHAR(50)  NOT NULL,
  "followup_number" INTEGER      NOT NULL DEFAULT 1,
  "draft_subject"   TEXT,
  "draft_body"      TEXT,
  "tone"            VARCHAR(50)  NOT NULL DEFAULT 'professional',
  "sent_at"         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "responded_at"    TIMESTAMPTZ,
  "response_status" VARCHAR(50)  NOT NULL DEFAULT 'pending',
  "created_at"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT "follow_up_log_application_id_fkey"
    FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE,
  CONSTRAINT "follow_up_log_user_id_fkey"
    FOREIGN KEY ("user_id")        REFERENCES "users"("id")        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "interview_prep" (
  "id"                       SERIAL       PRIMARY KEY,
  "application_id"           INTEGER      NOT NULL UNIQUE,
  "user_id"                  VARCHAR(255) NOT NULL,
  "job_id"                   INTEGER      NOT NULL,
  "interviewer_name"         VARCHAR(255),
  "interviewer_role"         VARCHAR(255),
  "interviewer_linkedin_url" TEXT,
  "linkedin_scraped"         BOOLEAN      NOT NULL DEFAULT FALSE,
  "role_analysis"            TEXT,
  "questions"                JSONB        NOT NULL DEFAULT '{}',
  "star_answers"             JSONB        NOT NULL DEFAULT '[]',
  "questions_to_ask"         JSONB        NOT NULL DEFAULT '[]',
  "dos_and_donts"            JSONB        NOT NULL DEFAULT '{}',
  "salary_guidance"          TEXT,
  "interviewer_insights"     TEXT,
  "prep_notes"               TEXT,
  "html_content"             TEXT,
  "pdf_binary"               BYTEA,
  "pdf_generated"            BOOLEAN      NOT NULL DEFAULT FALSE,
  "created_at"               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at"               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "company_research" (
  "id"                  SERIAL       PRIMARY KEY,
  "application_id"      INTEGER,
  "job_id"              INTEGER      NOT NULL,
  "user_id"             VARCHAR(255) NOT NULL,
  "company_name"        TEXT         NOT NULL,
  "company_url"         TEXT,
  "company_overview"    TEXT,
  "mission_and_values"  TEXT,
  "recent_developments" JSONB,
  "why_they_are_hiring" TEXT,
  "talking_points"      JSONB,
  "questions_to_ask"    JSONB,
  "red_flags"           JSONB,
  "research_notes"      TEXT,
  "confidence_score"    INTEGER,
  "html_content"        TEXT,
  "pdf_binary"          BYTEA,
  "website_scraped"     BOOLEAN      NOT NULL DEFAULT FALSE,
  "news_count"          INTEGER      NOT NULL DEFAULT 0,
  "created_at"          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at"          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE ("job_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "tailored_resumes" (
  "id"                   SERIAL       PRIMARY KEY,
  "user_id"              VARCHAR(255) NOT NULL,
  "job_id"               INTEGER      NOT NULL,
  "job_match_id"         INTEGER,
  "resume_url"           TEXT         NOT NULL,
  "storage_path"         TEXT         NOT NULL,
  "pdf_filename"         VARCHAR(255),
  "professional_summary" TEXT,
  "core_skills"          TEXT[]       NOT NULL DEFAULT '{}',
  "keywords"             TEXT[]       NOT NULL DEFAULT '{}',
  "tailoring_notes"      TEXT,
  "version"              INTEGER      NOT NULL DEFAULT 1,
  "created_at"           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at"           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id"                  SERIAL       PRIMARY KEY,
  "user_id"             VARCHAR(255),
  "base_resume_url"     TEXT,
  "skills"              TEXT[]       NOT NULL DEFAULT '{}',
  "experience_years"    INTEGER,
  "job_titles"          TEXT[]       NOT NULL DEFAULT '{}',
  "industries"          TEXT[]       NOT NULL DEFAULT '{}',
  "min_salary"          INTEGER,
  "max_salary"          INTEGER,
  "preferred_locations" TEXT[]       NOT NULL DEFAULT '{}',
  "work_type"           VARCHAR(50),
  "status"              VARCHAR(50)  NOT NULL DEFAULT 'active',
  "created_at"          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at"          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "activity_log" (
  "id"          SERIAL       PRIMARY KEY,
  "user_id"     VARCHAR(255) NOT NULL,
  "action"      VARCHAR(100) NOT NULL,
  "entity_type" VARCHAR(50),
  "entity_id"   INTEGER,
  "metadata"    JSONB,
  "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Legacy tables (kept for reference, not actively used)

CREATE TABLE IF NOT EXISTS "job_matches" (
  "id"             SERIAL         PRIMARY KEY,
  "user_id"        VARCHAR(255),
  "job_id"         INTEGER,
  "match_score"    DECIMAL(5, 2),
  "ai_reasoning"   TEXT,
  "skills_matched" TEXT[]         NOT NULL DEFAULT '{}',
  "skills_missing" TEXT[]         NOT NULL DEFAULT '{}',
  "status"         VARCHAR(50)    NOT NULL DEFAULT 'pending',
  "created_at"     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updated_at"     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE ("user_id", "job_id")
);

CREATE TABLE IF NOT EXISTS "interviews" (
  "id"               SERIAL      PRIMARY KEY,
  "application_id"   INTEGER,
  "interview_type"   VARCHAR(100),
  "scheduled_date"   TIMESTAMPTZ,
  "duration_minutes" INTEGER,
  "interviewer_name"  VARCHAR(255),
  "interviewer_title" VARCHAR(255),
  "location"         VARCHAR(255),
  "status"           VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  "prep_notes_url"   TEXT,
  "feedback"         TEXT,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "follow_ups" (
  "id"             SERIAL      PRIMARY KEY,
  "application_id" INTEGER,
  "follow_up_type" VARCHAR(50),
  "scheduled_date" TIMESTAMPTZ NOT NULL,
  "sent_date"      TIMESTAMPTZ,
  "email_template" TEXT,
  "status"         VARCHAR(50) NOT NULL DEFAULT 'pending',
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "documents" (
  "id"            SERIAL      PRIMARY KEY,
  "user_id"       VARCHAR(255),
  "document_type" VARCHAR(50),
  "job_match_id"  INTEGER,
  "file_url"      TEXT        NOT NULL,
  "file_name"     VARCHAR(255),
  "version"       INTEGER     NOT NULL DEFAULT 1,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS "applications_user_id_idx"      ON "applications"        ("user_id");
CREATE INDEX IF NOT EXISTS "applications_status_idx"        ON "applications"        ("status");
CREATE INDEX IF NOT EXISTS "applications_last_activity_idx" ON "applications"        ("last_activity");
CREATE INDEX IF NOT EXISTS "applications_interview_date_idx" ON "applications"       ("interview_date");

CREATE INDEX IF NOT EXISTS "application_events_application_id_idx" ON "application_events" ("application_id");
CREATE INDEX IF NOT EXISTS "application_events_user_id_idx"        ON "application_events" ("user_id");
CREATE INDEX IF NOT EXISTS "application_events_created_at_idx"     ON "application_events" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "follow_up_log_application_id_idx" ON "follow_up_log" ("application_id");
CREATE INDEX IF NOT EXISTS "follow_up_log_user_id_idx"         ON "follow_up_log" ("user_id");
CREATE INDEX IF NOT EXISTS "follow_up_log_sent_at_idx"         ON "follow_up_log" ("sent_at" DESC);
CREATE INDEX IF NOT EXISTS "follow_up_log_response_status_idx" ON "follow_up_log" ("response_status");

CREATE INDEX IF NOT EXISTS "interview_prep_user_id_idx"        ON "interview_prep" ("user_id");
CREATE INDEX IF NOT EXISTS "interview_prep_application_id_idx" ON "interview_prep" ("application_id");
CREATE INDEX IF NOT EXISTS "interview_prep_created_at_idx"     ON "interview_prep" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "follow_ups_scheduled_date_idx" ON "follow_ups" ("scheduled_date");
