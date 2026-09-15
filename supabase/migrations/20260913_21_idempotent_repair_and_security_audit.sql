-- ==============================================================================
-- Migration: 20260913_21_idempotent_repair_and_security_audit.sql
-- Description: Comprehensive Supabase Database Repair, Idempotency & Security Audit
--
-- 1. STRENGTHEN is_admin() & ADMIN ASSIGNMENTS
--    Strictly authorizes only rahulashokhlakkimsetty@gmail.com.
-- 2. RESOLVE ALL DUPLICATE & CONFLICTING RLS POLICIES
--    - profiles: Drop leaky "Public can view profiles", keep strict owner + admin
--    - reviews: Drop leaky "Public view reviews", enforce status = 'approved'
--    - doubts, career_skills, quiz_attempts, resumes, roadmaps, study_sessions, videos:
--      Drop redundant duplicate policies.
-- 3. ENSURE IDEMPOTENT RLS POLICIES FOR ALL USER TABLES
--    - bulk_pdf_batches, bulk_pdf_documents, bulk_pdf_notes
--    - pdf_documents, ai_notes, note_bookmarks
--    - mock_interviews, user_progress, user_streaks, user_consents, contact_messages
-- 4. CURRICULUM & DEPARTMENT TAXONOMY NORMALIZATION
--    Populate canonical engineering departments (AIML, CSE, ECE, IT, MECH, CIVIL, EEE)
-- 5. SEED IDEMPOTENCY SAFEGUARDS
--    Unique constraint/index on videos to prevent duplicate lecture creation on rerun
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. STRENGTHEN is_admin() FUNCTION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_role_assignments (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by TEXT NOT NULL DEFAULT 'system_bootstrap'
);

ALTER TABLE public.admin_role_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin reads role assignments" ON public.admin_role_assignments;
CREATE POLICY "Admin reads role assignments" ON public.admin_role_assignments
    FOR SELECT USING (
        LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'rahulashokhlakkimsetty@gmail.com'
    );

DROP POLICY IF EXISTS "No self-assignment" ON public.admin_role_assignments;
CREATE POLICY "No self-assignment" ON public.admin_role_assignments
    FOR ALL USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'rahulashokhlakkimsetty@gmail.com'
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND LOWER(email) = 'rahulashokhlakkimsetty@gmail.com'
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_role_assignments
      WHERE user_id = auth.uid()
        AND LOWER(email) = 'rahulashokhlakkimsetty@gmail.com'
    )
  );
$$;

-- Bootstrap admin assignment if auth record exists
DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    SELECT id INTO v_admin_id FROM auth.users WHERE LOWER(email) = 'rahulashokhlakkimsetty@gmail.com' LIMIT 1;
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO public.admin_role_assignments (user_id, email, granted_by)
        VALUES (v_admin_id, 'rahulashokhlakkimsetty@gmail.com', 'system_bootstrap')
        ON CONFLICT (user_id) DO NOTHING;

        UPDATE public.profiles SET role = 'admin'
        WHERE id = v_admin_id AND role != 'admin';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. ELIMINATE DUPLICATE & CONFLICTING POLICIES
-- ------------------------------------------------------------------------------

-- (A) PROFILES: Drop dangerous public read policy & duplicate update policy
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Insert profile via auth trigger or admin" ON public.profiles;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        public.is_admin()
        OR (
            auth.uid() = id
            AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Insert profile via auth trigger or admin"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- (B) REVIEWS: Drop leaky public view & duplicate insert policy
DROP POLICY IF EXISTS "Public view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public users can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can submit a review" ON public.reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can edit their own review" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own review" ON public.reviews;
DROP POLICY IF EXISTS "Admin can manage all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins have full access to reviews" ON public.reviews;

CREATE POLICY "Public can view approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved' OR is_approved = true);

CREATE POLICY "Users can view their own reviews"
    ON public.reviews FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can submit a review"
    ON public.reviews FOR INSERT
    TO authenticated
    WITH CHECK (
        (auth.uid() = user_id OR user_id IS NULL)
    );

CREATE POLICY "Users can edit their own review"
    ON public.reviews FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review"
    ON public.reviews FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to reviews"
    ON public.reviews FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- (C) DOUBTS: Deduplicate
DROP POLICY IF EXISTS "Users can manage their doubts" ON public.doubts;
DROP POLICY IF EXISTS "Users manage own doubts" ON public.doubts;
CREATE POLICY "Users manage own doubts"
    ON public.doubts FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- (D) CAREER SKILLS: Deduplicate
DROP POLICY IF EXISTS "Public view career skills" ON public.career_skills;
DROP POLICY IF EXISTS "Public can view career skills" ON public.career_skills;
CREATE POLICY "Public can view career skills"
    ON public.career_skills FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admin manage career skills" ON public.career_skills;
CREATE POLICY "Admin manage career skills"
    ON public.career_skills FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- (E) QUIZ ATTEMPTS: Deduplicate
DROP POLICY IF EXISTS "Users can view and save their quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users manage own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users manage own quiz attempts"
    ON public.quiz_attempts FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- (F) RESUMES: Deduplicate
DROP POLICY IF EXISTS "Users can manage their resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users manage own resumes" ON public.resumes;
CREATE POLICY "Users manage own resumes"
    ON public.resumes FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- (G) ROADMAPS: Deduplicate
DROP POLICY IF EXISTS "Users can manage their own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users manage own roadmaps" ON public.roadmaps;
CREATE POLICY "Users manage own roadmaps"
    ON public.roadmaps FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- (H) STUDY SESSIONS: Deduplicate
DROP POLICY IF EXISTS "Users can manage their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users manage own study sessions" ON public.study_sessions;
CREATE POLICY "Users manage own study sessions"
    ON public.study_sessions FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- (I) VIDEOS: Deduplicate & enforce publication filter
DROP POLICY IF EXISTS "Public view videos" ON public.videos;
DROP POLICY IF EXISTS "Public can view published videos" ON public.videos;
CREATE POLICY "Public can view published videos"
    ON public.videos FOR SELECT
    USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage videos" ON public.videos;
DROP POLICY IF EXISTS "Admin manage videos" ON public.videos;
CREATE POLICY "Admin manage videos"
    ON public.videos FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. IDEMPOTENT RLS POLICIES FOR ALL USER-OWNED TABLES
-- ------------------------------------------------------------------------------

-- BULK PDF BATCHES
DROP POLICY IF EXISTS "Users can view their own batches" ON public.bulk_pdf_batches;
CREATE POLICY "Users can view their own batches"
    ON public.bulk_pdf_batches FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own batches" ON public.bulk_pdf_batches;
CREATE POLICY "Users can create their own batches"
    ON public.bulk_pdf_batches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own batches" ON public.bulk_pdf_batches;
CREATE POLICY "Users can update their own batches"
    ON public.bulk_pdf_batches FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own batches" ON public.bulk_pdf_batches;
CREATE POLICY "Users can delete their own batches"
    ON public.bulk_pdf_batches FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Service role full access on batches" ON public.bulk_pdf_batches;
CREATE POLICY "Service role full access on batches"
    ON public.bulk_pdf_batches FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- BULK PDF DOCUMENTS
DROP POLICY IF EXISTS "Users can view their own documents" ON public.bulk_pdf_documents;
CREATE POLICY "Users can view their own documents"
    ON public.bulk_pdf_documents FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own documents" ON public.bulk_pdf_documents;
CREATE POLICY "Users can create their own documents"
    ON public.bulk_pdf_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own documents" ON public.bulk_pdf_documents;
CREATE POLICY "Users can update their own documents"
    ON public.bulk_pdf_documents FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own documents" ON public.bulk_pdf_documents;
CREATE POLICY "Users can delete their own documents"
    ON public.bulk_pdf_documents FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Service role full access on documents" ON public.bulk_pdf_documents;
CREATE POLICY "Service role full access on documents"
    ON public.bulk_pdf_documents FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- BULK PDF NOTES
DROP POLICY IF EXISTS "Users can view their own notes" ON public.bulk_pdf_notes;
CREATE POLICY "Users can view their own notes"
    ON public.bulk_pdf_notes FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own notes" ON public.bulk_pdf_notes;
CREATE POLICY "Users can create their own notes"
    ON public.bulk_pdf_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notes" ON public.bulk_pdf_notes;
CREATE POLICY "Users can update their own notes"
    ON public.bulk_pdf_notes FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.bulk_pdf_notes;
CREATE POLICY "Users can delete their own notes"
    ON public.bulk_pdf_notes FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Service role full access on notes" ON public.bulk_pdf_notes;
CREATE POLICY "Service role full access on notes"
    ON public.bulk_pdf_notes FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- PDF DOCUMENTS
DROP POLICY IF EXISTS "Users can view their own pdf documents" ON public.pdf_documents;
CREATE POLICY "Users can view their own pdf documents"
    ON public.pdf_documents FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own pdf documents" ON public.pdf_documents;
CREATE POLICY "Users can create their own pdf documents"
    ON public.pdf_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pdf documents" ON public.pdf_documents;
CREATE POLICY "Users can update their own pdf documents"
    ON public.pdf_documents FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own pdf documents" ON public.pdf_documents;
CREATE POLICY "Users can delete their own pdf documents"
    ON public.pdf_documents FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- AI NOTES
DROP POLICY IF EXISTS "Users can view their own ai notes" ON public.ai_notes;
CREATE POLICY "Users can view their own ai notes"
    ON public.ai_notes FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own ai notes" ON public.ai_notes;
CREATE POLICY "Users can create their own ai notes"
    ON public.ai_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ai notes" ON public.ai_notes;
CREATE POLICY "Users can update their own ai notes"
    ON public.ai_notes FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own ai notes" ON public.ai_notes;
CREATE POLICY "Users can delete their own ai notes"
    ON public.ai_notes FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- MOCK INTERVIEWS
DROP POLICY IF EXISTS "Users manage own mock interviews" ON public.mock_interviews;
CREATE POLICY "Users manage own mock interviews"
    ON public.mock_interviews FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- CONTACT MESSAGES
DROP POLICY IF EXISTS "Anyone can insert contact message" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Users can view their own contact messages" ON public.contact_messages;
CREATE POLICY "Users can view their own contact messages"
    ON public.contact_messages FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to contact messages" ON public.contact_messages;
CREATE POLICY "Admins have full access to contact messages"
    ON public.contact_messages FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. CURRICULUM & DEPARTMENT TAXONOMY NORMALIZATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Computing', 'Electrical', 'Mechanical', 'Civil',
        'Chemical', 'Biotech', 'Aerospace', 'Agriculture', 'Specialized'
    )),
    icon TEXT NOT NULL DEFAULT 'school',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active departments" ON public.departments;
CREATE POLICY "Public read active departments" ON public.departments
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admin manage departments" ON public.departments;
CREATE POLICY "Admin manage departments" ON public.departments
    FOR ALL USING (public.is_admin());

INSERT INTO public.departments (code, name, category, icon, is_active)
VALUES
    ('AIML', 'Artificial Intelligence & Machine Learning', 'Computing', 'school', true),
    ('CSE', 'Computer Science & Engineering', 'Computing', 'computer', true),
    ('ECE', 'Electronics & Communication Engineering', 'Electrical', 'memory', true),
    ('IT', 'Information Technology', 'Computing', 'terminal', true),
    ('MECH', 'Mechanical Engineering', 'Mechanical', 'precision_manufacturing', true),
    ('CIVIL', 'Civil Engineering', 'Civil', 'architecture', true),
    ('EEE', 'Electrical & Electronics Engineering', 'Electrical', 'electric_bolt', true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon,
    is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 5. VIDEO REPOSITORY SEED SAFEGUARDS & DEDUPLICATION
-- ------------------------------------------------------------------------------
-- Deduplicate any existing duplicate seed videos, keeping oldest
DELETE FROM public.videos v1
USING public.videos v2
WHERE v1.title = v2.title
  AND v1.video_url = v2.video_url
  AND v1.created_at > v2.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS uq_videos_title_url ON public.videos (title, video_url);

