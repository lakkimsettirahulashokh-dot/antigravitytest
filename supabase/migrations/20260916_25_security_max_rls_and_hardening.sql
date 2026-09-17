-- ==============================================================================
-- TechPath AI OS — Migration: 20260916_25_security_max_rls_and_hardening.sql
-- Description: Production Security Max & Database RLS Hardening
--
-- 1. Hardened is_admin() supporting both official support and admin email accounts
-- 2. Forced Row Level Security (RLS) on all application tables
-- 3. Strict owner isolation policies (auth.uid() = user_id)
-- 4. Immutable security audit log table
-- 5. Revocation of unsafe public permissions
-- ==============================================================================

-- 1. HARDEN is_admin() FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN (
      'lakkimsettirahulashok@gmail.com',
      'lakkimsettirahulashokh@gmail.com',
      'rahulashokhlakkimsetty@gmail.com'
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND LOWER(email) IN (
          'lakkimsettirahulashok@gmail.com',
          'lakkimsettirahulashokh@gmail.com',
          'rahulashokhlakkimsetty@gmail.com'
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_role_assignments
      WHERE user_id = auth.uid()
        AND LOWER(email) IN (
          'lakkimsettirahulashok@gmail.com',
          'lakkimsettirahulashokh@gmail.com',
          'rahulashokhlakkimsetty@gmail.com'
        )
    )
  );
$$;

-- 2. IMMUTABLE SECURITY EVENTS & AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'INFO',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_ip TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view security events" ON public.security_events;
CREATE POLICY "Admins can view security events" ON public.security_events
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;
CREATE POLICY "System can insert security events" ON public.security_events
    FOR INSERT WITH CHECK (true);

-- Disallow updates and deletes on security events to preserve immutable chain
DROP POLICY IF EXISTS "Deny event updates" ON public.security_events;
CREATE POLICY "Deny event updates" ON public.security_events
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Deny event deletes" ON public.security_events;
CREATE POLICY "Deny event deletes" ON public.security_events
    FOR DELETE USING (false);

-- 3. ENABLE RLS & ISOLATION POLICIES ON APPLICATION TABLES
DO $$
DECLARE
    t text;
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
    FOREACH t IN ARRAY user_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        END IF;
    END LOOP;
END $$;

-- 4. PROFILE ISOLATION POLICIES
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
        CREATE POLICY "Public profiles read" ON public.profiles
            FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
        CREATE POLICY "Users update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id OR public.is_admin());

        DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
        CREATE POLICY "Users insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

        DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
        CREATE POLICY "Admins manage profiles" ON public.profiles
            FOR DELETE USING (public.is_admin());
    END IF;
END $$;

-- 5. STUDY SESSIONS & RECORDS POLICIES
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_sessions') THEN
        DROP POLICY IF EXISTS "Users view own study sessions" ON public.study_sessions;
        CREATE POLICY "Users view own study sessions" ON public.study_sessions
            FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

        DROP POLICY IF EXISTS "Users insert own study sessions" ON public.study_sessions;
        CREATE POLICY "Users insert own study sessions" ON public.study_sessions
            FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

        DROP POLICY IF EXISTS "Users update own study sessions" ON public.study_sessions;
        CREATE POLICY "Users update own study sessions" ON public.study_sessions
            FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
    END IF;
END $$;

-- 6. CONTACT MESSAGES POLICIES
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_messages') THEN
        DROP POLICY IF EXISTS "Anyone can insert contact message" ON public.contact_messages;
        CREATE POLICY "Anyone can insert contact message" ON public.contact_messages
            FOR INSERT WITH CHECK (true);

        DROP POLICY IF EXISTS "Admins view contact messages" ON public.contact_messages;
        CREATE POLICY "Admins view contact messages" ON public.contact_messages
            FOR SELECT USING (public.is_admin());

        DROP POLICY IF EXISTS "Admins update contact messages" ON public.contact_messages;
        CREATE POLICY "Admins update contact messages" ON public.contact_messages
            FOR UPDATE USING (public.is_admin());

        DROP POLICY IF EXISTS "Admins delete contact messages" ON public.contact_messages;
        CREATE POLICY "Admins delete contact messages" ON public.contact_messages
            FOR DELETE USING (public.is_admin());
    END IF;
END $$;

-- 7. REVIEWS POLICIES
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
        DROP POLICY IF EXISTS "Public can view published reviews" ON public.reviews;
        CREATE POLICY "Public can view published reviews" ON public.reviews
            FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR public.is_admin());

        DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
        CREATE POLICY "Users can create reviews" ON public.reviews
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

        DROP POLICY IF EXISTS "Users update own reviews" ON public.reviews;
        CREATE POLICY "Users update own reviews" ON public.reviews
            FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

        DROP POLICY IF EXISTS "Admins manage all reviews" ON public.reviews;
        CREATE POLICY "Admins manage all reviews" ON public.reviews
            FOR DELETE USING (public.is_admin());
    END IF;
END $$;

-- 8. REVOKE DANGEROUS PERMISSIONS FROM ANON ROLE
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon;
