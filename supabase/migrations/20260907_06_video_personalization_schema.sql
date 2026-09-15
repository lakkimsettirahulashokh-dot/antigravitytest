-- ==============================================================================
-- BTechPath AI OS — Migration 06: LearnHub Video Personalization System
-- Target: PostgreSQL 14+ / Supabase
-- Description: Establishes relational schema for multi-department & multi-semester
--              video catalog, student progress tracking, RLS, and accredited seed videos.
-- ==============================================================================

-- 1. EXTEND VIDEOS TABLE SCHEMA
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    provider TEXT NOT NULL DEFAULT 'youtube',
    duration TEXT DEFAULT '15:00',
    language TEXT DEFAULT 'English',
    instructor TEXT DEFAULT 'BTechPath AI Faculty',
    difficulty TEXT DEFAULT 'Intermediate',
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist if table was previously created
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='description') THEN
        ALTER TABLE public.videos ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='provider') THEN
        ALTER TABLE public.videos ADD COLUMN provider TEXT NOT NULL DEFAULT 'youtube';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='language') THEN
        ALTER TABLE public.videos ADD COLUMN language TEXT DEFAULT 'English';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='difficulty') THEN
        ALTER TABLE public.videos ADD COLUMN difficulty TEXT DEFAULT 'Intermediate';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='is_published') THEN
        ALTER TABLE public.videos ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='is_featured') THEN
        ALTER TABLE public.videos ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='sort_order') THEN
        ALTER TABLE public.videos ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='created_by') THEN
        ALTER TABLE public.videos ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='updated_at') THEN
        ALTER TABLE public.videos ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- 2. VIDEO DEPARTMENT RELATIONSHIP TABLE
CREATE TABLE IF NOT EXISTS public.video_departments (
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    department_id TEXT NOT NULL,
    PRIMARY KEY (video_id, department_id)
);
CREATE INDEX IF NOT EXISTS idx_video_departments_dept ON public.video_departments(department_id);

-- 3. VIDEO SEMESTER RELATIONSHIP TABLE
CREATE TABLE IF NOT EXISTS public.video_semesters (
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    semester_id INTEGER NOT NULL,
    PRIMARY KEY (video_id, semester_id)
);
CREATE INDEX IF NOT EXISTS idx_video_semesters_sem ON public.video_semesters(semester_id);

-- 4. VIDEO SUBJECTS & TOPICS RELATIONSHIP TABLES
CREATE TABLE IF NOT EXISTS public.video_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_video_subjects_name ON public.video_subjects(subject_name);

CREATE TABLE IF NOT EXISTS public.video_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    topic_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_video_topics_name ON public.video_topics(topic_name);

CREATE TABLE IF NOT EXISTS public.video_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.video_careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    career_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. USER VIDEO PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.user_video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    progress_seconds INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);
CREATE INDEX IF NOT EXISTS idx_user_video_progress_user ON public.user_video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_video_progress_watched ON public.user_video_progress(user_id, last_watched_at DESC);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_progress ENABLE ROW LEVEL SECURITY;

-- Helper function for Admin verification (rahulashokhlakkimsetty@gmail.com)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
          AND (
            LOWER(email) = 'rahulashokhlakkimsetty@gmail.com'
            OR raw_user_meta_data->>'role' = 'admin'
          )
    );
$$;

-- VIDEOS POLICIES
DROP POLICY IF EXISTS "Public can view published videos" ON public.videos;
CREATE POLICY "Public can view published videos" ON public.videos
    FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage videos" ON public.videos;
CREATE POLICY "Admin can manage videos" ON public.videos
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RELATIONSHIP TABLES POLICIES (Readable by all, writable only by Admin)
DROP POLICY IF EXISTS "Public can view video_departments" ON public.video_departments;
CREATE POLICY "Public can view video_departments" ON public.video_departments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage video_departments" ON public.video_departments;
CREATE POLICY "Admin manage video_departments" ON public.video_departments FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view video_semesters" ON public.video_semesters;
CREATE POLICY "Public can view video_semesters" ON public.video_semesters FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage video_semesters" ON public.video_semesters;
CREATE POLICY "Admin manage video_semesters" ON public.video_semesters FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view video_subjects" ON public.video_subjects;
CREATE POLICY "Public can view video_subjects" ON public.video_subjects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage video_subjects" ON public.video_subjects;
CREATE POLICY "Admin manage video_subjects" ON public.video_subjects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view video_topics" ON public.video_topics;
CREATE POLICY "Public can view video_topics" ON public.video_topics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage video_topics" ON public.video_topics;
CREATE POLICY "Admin manage video_topics" ON public.video_topics FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- USER VIDEO PROGRESS POLICIES (Strictly User Isolated)
DROP POLICY IF EXISTS "Users can view own video progress" ON public.user_video_progress;
CREATE POLICY "Users can view own video progress" ON public.user_video_progress
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own video progress" ON public.user_video_progress;
CREATE POLICY "Users can insert own video progress" ON public.user_video_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own video progress" ON public.user_video_progress;
CREATE POLICY "Users can update own video progress" ON public.user_video_progress
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own video progress" ON public.user_video_progress;
CREATE POLICY "Users can delete own video progress" ON public.user_video_progress
    FOR DELETE USING (auth.uid() = user_id);

-- 7. REALTIME PUBLICATION
ALTER TABLE public.videos REPLICA IDENTITY FULL;
ALTER TABLE public.user_video_progress REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_video_progress;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
