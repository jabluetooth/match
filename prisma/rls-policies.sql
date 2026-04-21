-- Row Level Security (RLS) Policies for Match Application
-- This ensures users can only access their own data at the database level

-- Enable RLS on all user-specific tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "application_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "follow_up_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "interview_prep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "company_research" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tailored_resumes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity_log" ENABLE ROW LEVEL SECURITY;

-- Users table: users can only see their own record
CREATE POLICY "users_select_own" ON "users"
  FOR SELECT
  USING (id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "users_update_own" ON "users"
  FOR UPDATE
  USING (id = current_setting('app.current_user_id', TRUE));

-- Applications: users can only see/modify their own applications
CREATE POLICY "applications_select_own" ON "applications"
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "applications_insert_own" ON "applications"
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "applications_update_own" ON "applications"
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "applications_delete_own" ON "applications"
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', TRUE));

-- Application Events
CREATE POLICY "application_events_select_own" ON "application_events"
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "application_events_insert_own" ON "application_events"
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

-- Follow-up Log
CREATE POLICY "follow_up_log_select_own" ON "follow_up_log"
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "follow_up_log_insert_own" ON "follow_up_log"
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "follow_up_log_update_own" ON "follow_up_log"
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', TRUE));

-- Interview Prep
CREATE POLICY "interview_prep_select_own" ON "interview_prep"
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "interview_prep_insert_own" ON "interview_prep"
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "interview_prep_update_own" ON "interview_prep"
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', TRUE));

-- Company Research
CREATE POLICY "company_research_select_own" ON "company_research"
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "company_research_insert_own" ON "company_research"
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "company_research_update_own" ON "company_research"
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', TRUE));

-- Tailored Resumes
CREATE POLICY "tailored_resumes_select_own" ON "tailored_resumes"
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "tailored_resumes_insert_own" ON "tailored_resumes"
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

-- User Profiles
CREATE POLICY "user_profiles_select_own" ON "user_profiles"
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "user_profiles_insert_own" ON "user_profiles"
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "user_profiles_update_own" ON "user_profiles"
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', TRUE));

-- Activity Log
CREATE POLICY "activity_log_select_own" ON "activity_log"
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "activity_log_insert_own" ON "activity_log"
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

-- Jobs table: publicly readable (no user_id column)
ALTER TABLE "jobs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_select_all" ON "jobs"
  FOR SELECT
  USING (true);
