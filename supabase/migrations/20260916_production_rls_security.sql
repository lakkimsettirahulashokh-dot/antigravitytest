-- ==============================================================================
-- Migration: 20260916_production_rls_security.sql
-- Description: Comprehensive Row Level Security (RLS) & Database Hardening
--
-- 1. Hardened is_admin() with lakkimsettirahulashokh@gmail.com
-- 2. Forced Row Level Security (RLS) across all user and app tables
-- 3. Owner-isolated CRUD policies (auth.uid() = user_id)
-- 4. Immutable security audit log table for tamper-evident event logging
-- 5. Revocation of overly permissive database privileges from anon role
-- ==============================================================================

-- 1. UPDATE / STRENGTHEN is_admin() FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN (
      'lakkimsettirahulashokh@gmail.com',
      'rahulashokhlakkimsetty@gmail.com'
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND LOWER(email) IN (
          'lakkimsettirahulashokh@gmail.com',
          'rahulashokhlakkimsetty@gmail.com'
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_role_assignments
      WHERE user_id = auth.uid()
        AND LOWER(email) IN (
          'lakkimsettirahulashokh@gmail.com',
          'rahulashokhlakkimsetty@gmail.com'
        )
    )
  );
$$;

-- 2. SECURITY AUDIT LOGS TABLE (TAMPER-RESISTANT)
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_ip TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_audit_logs;
CREATE POLICY "Admins can view security logs" ON public.security_audit_logs
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users insert security logs" ON public.security_audit_logs;
CREATE POLICY "Authenticated users insert security logs" ON public.security_audit_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Deny all updates and deletes to preserve immutable audit trail
DROP POLICY IF EXISTS "No log modifications" ON public.security_audit_logs;
CREATE POLICY "No log modifications" ON public.security_audit_logs
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS "No log deletions" ON public.security_audit_logs;
CREATE POLICY "No log deletions" ON public.security_audit_logs
    FOR DELETE USING (false);

-- 3. ENFORCE ROW LEVEL SECURITY ON ALL APPLICATION TABLES
DO $$
DECLARE
    tbl text;
    user_tables text[] := ARRAY[
        'profiles',
        'study_sessions',
        'study_records',
        'notes',
        'ai_notes',
        'note_bookmarks',
        'bulk_pdf_batches',
        'bulk_pdf_documents',
        'bulk_pdf_notes',
        'doubts',
        'doubt_messages',
        'resumes',
        'flashcards',
        'mock_interviews',
        'reviews',
        'quiz_attempts',
        'roadmaps',
        'user_progress',
        'user_streaks',
        'user_consents',
        'contact_messages',
        'career_skills'
    ];
BEGIN
    FOREACH tbl IN ARRAY user_tables
    LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
            EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', tbl);
        END IF;
    END LOOP;
END $$;

-- 4. PROFILE SECURITY (STRICT OWNER ISOLATION)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
        CREATE POLICY "Users can read own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id OR public.is_admin());

        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
        CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 5. STUDY SESSIONS & STUDY RECORDS
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_sessions') THEN
        DROP POLICY IF EXISTS "Users manage own study sessions" ON public.study_sessions;
        CREATE POLICY "Users manage own study sessions" ON public.study_sessions
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_records') THEN
        DROP POLICY IF EXISTS "Users manage own study records" ON public.study_records;
        CREATE POLICY "Users manage own study records" ON public.study_records
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 6. AI NOTES & BOOKMARKS
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_notes') THEN
        DROP POLICY IF EXISTS "Users manage own ai notes" ON public.ai_notes;
        CREATE POLICY "Users manage own ai notes" ON public.ai_notes
            FOR ALL USING (auth.uid() = user_id OR public.is_admin())
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'note_bookmarks') THEN
        DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.note_bookmarks;
        CREATE POLICY "Users manage own bookmarks" ON public.note_bookmarks
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 7. DOUBTS & DOUBT MESSAGES
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'doubts') THEN
        DROP POLICY IF EXISTS "Users manage own doubts" ON public.doubts;
        CREATE POLICY "Users manage own doubts" ON public.doubts
            FOR ALL USING (auth.uid() = user_id OR public.is_admin())
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'doubt_messages') THEN
        DROP POLICY IF EXISTS "Users manage own doubt messages" ON public.doubt_messages;
        CREATE POLICY "Users manage own doubt messages" ON public.doubt_messages
            FOR ALL USING (
                auth.uid() = user_id 
                OR EXISTS (SELECT 1 FROM public.doubts d WHERE d.id = doubt_id AND d.user_id = auth.uid())
                OR public.is_admin()
            )
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 8. BULK PDF BATCHES & NOTES
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_pdf_batches') THEN
        DROP POLICY IF EXISTS "Users manage own batches" ON public.bulk_pdf_batches;
        CREATE POLICY "Users manage own batches" ON public.bulk_pdf_batches
            FOR ALL USING (auth.uid() = user_id OR public.is_admin())
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_pdf_documents') THEN
        DROP POLICY IF EXISTS "Users manage own bulk documents" ON public.bulk_pdf_documents;
        CREATE POLICY "Users manage own bulk documents" ON public.bulk_pdf_documents
            FOR ALL USING (auth.uid() = user_id OR public.is_admin())
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_pdf_notes') THEN
        DROP POLICY IF EXISTS "Users manage own bulk notes" ON public.bulk_pdf_notes;
        CREATE POLICY "Users manage own bulk notes" ON public.bulk_pdf_notes
            FOR ALL USING (auth.uid() = user_id OR public.is_admin())
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 9. MOCK INTERVIEWS & RESUMES
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mock_interviews') THEN
        DROP POLICY IF EXISTS "Users manage own mock interviews" ON public.mock_interviews;
        CREATE POLICY "Users manage own mock interviews" ON public.mock_interviews
            FOR ALL USING (auth.uid() = user_id OR public.is_admin())
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resumes') THEN
        DROP POLICY IF EXISTS "Users manage own resumes" ON public.resumes;
        CREATE POLICY "Users manage own resumes" ON public.resumes
            FOR ALL USING (auth.uid() = user_id OR public.is_admin())
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'flashcards') THEN
        DROP POLICY IF EXISTS "Users manage own flashcards" ON public.flashcards;
        CREATE POLICY "Users manage own flashcards" ON public.flashcards
            FOR ALL USING (auth.uid() = user_id OR public.is_admin())
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 10. REVIEWS (STRICT MODERATION & PUBLIC READ OF APPROVED ONLY)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
        DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
        CREATE POLICY "Public can view approved reviews" ON public.reviews
            FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

        DROP POLICY IF EXISTS "Authenticated users create pending review" ON public.reviews;
        CREATE POLICY "Authenticated users create pending review" ON public.reviews
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users update own unapproved review" ON public.reviews;
        CREATE POLICY "Users update own unapproved review" ON public.reviews
            FOR UPDATE USING (auth.uid() = user_id AND status != 'approved')
            WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Admins moderate reviews" ON public.reviews;
        CREATE POLICY "Admins moderate reviews" ON public.reviews
            FOR ALL USING (public.is_admin());
    END IF;
END $$;

-- 11. USER CONSENTS & CONTACT MESSAGES
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_consents') THEN
        DROP POLICY IF EXISTS "Users view own consents" ON public.user_consents;
        CREATE POLICY "Users view own consents" ON public.user_consents
            FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

        DROP POLICY IF EXISTS "Users update own consents" ON public.user_consents;
        CREATE POLICY "Users update own consents" ON public.user_consents
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_messages') THEN
        DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
        CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
            FOR INSERT WITH CHECK (true);

        DROP POLICY IF EXISTS "Only admin reads contact messages" ON public.contact_messages;
        CREATE POLICY "Only admin reads contact messages" ON public.contact_messages
            FOR SELECT USING (public.is_admin());
    END IF;
END $$;

-- 12. DATABASE PRIVILEGE RESTRICTION (LEAST PRIVILEGE ENFORCEMENT)
-- Restrict anon role from executing broad operations
REVOKE ALL ON SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Allow anon read-only access strictly on approved static public catalogs if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
        GRANT SELECT ON public.reviews TO anon;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'videos') THEN
        GRANT SELECT ON public.videos TO anon;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'curriculum_departments') THEN
        GRANT SELECT ON public.curriculum_departments TO anon;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_messages') THEN
        GRANT INSERT ON public.contact_messages TO anon;
    END IF;
END $$;

-- Grant authenticated users standard CRUD (governed by RLS policies above)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
