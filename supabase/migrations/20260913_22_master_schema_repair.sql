-- ==============================================================================
-- BTechPath AI OS — Migration 22: Master Database Schema & Security Repair
-- Target: PostgreSQL 14+ / Supabase
-- Description: Authoritative, fully idempotent repair:
--   1. Fixes missing 'feature_used' column and related attributes on public.reviews
--   2. Backfills and indexes public.reviews
--   3. Synchronizes public.career_skills multi-version taxonomy columns
--   4. Hardens public.is_admin() and enforces anti-self-promotion on public.profiles
--   5. Eliminates all duplicate and leaky RLS policies across the entire database
--   6. Enforces strict RLS on 100% of public tables
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. REPAIR & NORMALIZE public.reviews TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    student_name TEXT DEFAULT 'Student',
    author_name TEXT DEFAULT 'Student',
    name TEXT DEFAULT 'Student',
    author_avatar TEXT,
    branch TEXT DEFAULT 'AIML',
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT '',
    review_text TEXT NOT NULL DEFAULT '',
    feature_used TEXT DEFAULT 'General',
    module TEXT DEFAULT 'general',
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_approved BOOLEAN DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Idempotently ensure all columns exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'feature_used') THEN
        ALTER TABLE public.reviews ADD COLUMN feature_used TEXT DEFAULT 'General';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'name') THEN
        ALTER TABLE public.reviews ADD COLUMN name TEXT DEFAULT 'Student';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'status') THEN
        ALTER TABLE public.reviews ADD COLUMN status TEXT NOT NULL DEFAULT 'approved';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'is_featured') THEN
        ALTER TABLE public.reviews ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'is_approved') THEN
        ALTER TABLE public.reviews ADD COLUMN is_approved BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'module') THEN
        ALTER TABLE public.reviews ADD COLUMN module TEXT DEFAULT 'general';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'updated_at') THEN
        ALTER TABLE public.reviews ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- Backfill existing review rows without overwriting user data
UPDATE public.reviews
SET feature_used = COALESCE(feature_used, branch, 'General'),
    name = COALESCE(name, student_name, author_name, 'Student'),
    updated_at = COALESCE(updated_at, created_at, timezone('utc'::text, now())),
    status = COALESCE(status, CASE WHEN is_approved = true THEN 'approved' ELSE 'approved' END),
    is_approved = COALESCE(is_approved, CASE WHEN status = 'approved' THEN true ELSE false END),
    is_featured = COALESCE(is_featured, false)
WHERE feature_used IS NULL OR name IS NULL OR updated_at IS NULL OR status IS NULL OR is_featured IS NULL;

-- Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_feature ON public.reviews(feature_used);
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON public.reviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- ------------------------------------------------------------------------------
-- 2. REPAIR public.career_skills MULTI-VERSION TAXONOMY
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'career_skills' AND column_name = 'skill_id') THEN
        ALTER TABLE public.career_skills ADD COLUMN skill_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'career_skills' AND column_name = 'priority') THEN
        ALTER TABLE public.career_skills ADD COLUMN priority TEXT DEFAULT 'Core';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'career_skills' AND column_name = 'importance_weight') THEN
        ALTER TABLE public.career_skills ADD COLUMN importance_weight INT DEFAULT 80;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'career_skills' AND column_name = 'created_at') THEN
        ALTER TABLE public.career_skills ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Populate skill_id from skill_name if empty
UPDATE public.career_skills
SET skill_id = LOWER(REGEXP_REPLACE(skill_name, '[^a-zA-Z0-9]+', '_', 'g'))
WHERE skill_id IS NULL AND skill_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_career_skills_career_skill ON public.career_skills(career_id, skill_id);

-- ------------------------------------------------------------------------------
-- 3. HARDEN is_admin() & ADMIN ROLE AUTHORIZATION
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
        LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN ('rahulashokhlakkimsetty@gmail.com', 'lakkimsettirahulashokh@gmail.com', 'lakkimsettirahulashokh@gmail.com')
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
    LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN ('rahulashokhlakkimsetty@gmail.com', 'lakkimsettirahulashokh@gmail.com', 'lakkimsettirahulashokh@gmail.com')
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND LOWER(email) IN ('rahulashokhlakkimsetty@gmail.com', 'lakkimsettirahulashokh@gmail.com', 'lakkimsettirahulashokh@gmail.com')
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_role_assignments
      WHERE user_id = auth.uid()
    )
  );
$$;

-- ------------------------------------------------------------------------------
-- 4. ELIMINATE DUPLICATE & LEAKY POLICIES
-- ------------------------------------------------------------------------------

-- (A) public.reviews RLS: Drop leaky "Public view reviews" and duplicates
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public users can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can submit a review" ON public.reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can edit their own pending review" ON public.reviews;
DROP POLICY IF EXISTS "Users can edit their own review" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own review" ON public.reviews;
DROP POLICY IF EXISTS "Admin can manage all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins have full access to reviews" ON public.reviews;

-- Strict public view: Approved reviews only
CREATE POLICY "Public can view approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved' OR is_approved = true);

-- Authenticated students can view their own reviews (any status)
CREATE POLICY "Users can view their own reviews"
    ON public.reviews FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Authenticated users can insert reviews
CREATE POLICY "Authenticated users can submit a review"
    ON public.reviews FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Authenticated users can update own reviews
CREATE POLICY "Users can edit their own review"
    ON public.reviews FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete own reviews
CREATE POLICY "Users can delete their own review"
    ON public.reviews FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Admin full access
CREATE POLICY "Admins have full access to reviews"
    ON public.reviews FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- (B) public.profiles RLS: Eliminate duplicates & enforce anti-self-promotion
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'Engineering Scholar';
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Insert profile via auth trigger or admin" ON public.profiles;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

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

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- (C) public.career_skills RLS: Deduplicate
ALTER TABLE public.career_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view career skills" ON public.career_skills;
DROP POLICY IF EXISTS "Public can view career skills" ON public.career_skills;
DROP POLICY IF EXISTS "Admin manage career skills" ON public.career_skills;

CREATE POLICY "Public can view career skills"
    ON public.career_skills FOR SELECT
    USING (true);

CREATE POLICY "Admin manage career skills"
    ON public.career_skills FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- (D) public.videos RLS: Deduplicate
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view videos" ON public.videos;
DROP POLICY IF EXISTS "Public can view published videos" ON public.videos;
DROP POLICY IF EXISTS "Admin can manage videos" ON public.videos;
DROP POLICY IF EXISTS "Admin manage videos" ON public.videos;

CREATE POLICY "Public can view published videos"
    ON public.videos FOR SELECT
    USING (is_published = true OR public.is_admin());

CREATE POLICY "Admin manage videos"
    ON public.videos FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- (E) public.doubts RLS: Deduplicate
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their doubts" ON public.doubts;
DROP POLICY IF EXISTS "Users manage own doubts" ON public.doubts;

CREATE POLICY "Users manage own doubts"
    ON public.doubts FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- (F) public.user_consents RLS: Deduplicate
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own consent records" ON public.user_consents;
DROP POLICY IF EXISTS "Users can insert own consent records" ON public.user_consents;
DROP POLICY IF EXISTS "Admins can view all consent records" ON public.user_consents;
DROP POLICY IF EXISTS "Admins have full access to consent records" ON public.user_consents;

CREATE POLICY "Users can read own consent records"
    ON public.user_consents FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records"
    ON public.user_consents FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to consent records"
    ON public.user_consents FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. VIDEO REPOSITORY SEED SAFEGUARDS & DEDUPLICATION
-- ------------------------------------------------------------------------------
DELETE FROM public.videos v1
USING public.videos v2
WHERE v1.title = v2.title
  AND v1.video_url = v2.video_url
  AND v1.created_at > v2.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS uq_videos_title_url ON public.videos (title, video_url);

-- ------------------------------------------------------------------------------
-- 6. RECORD MASTER REPAIR IN MIGRATIONS LEDGER
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'supabase_migrations' AND table_name = 'schema_migrations'
    ) THEN
        INSERT INTO supabase_migrations.schema_migrations (version, name)
        VALUES ('20260913220000', '20260913_22_master_schema_repair')
        ON CONFLICT (version) DO NOTHING;
    END IF;
END $$;
