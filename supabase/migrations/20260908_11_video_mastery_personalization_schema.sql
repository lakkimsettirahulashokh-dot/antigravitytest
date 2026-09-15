-- ==============================================================================
-- BTechPath AI OS — Migration 11: LearnHub Video Mastery Personalization System
-- Target: PostgreSQL 14+ / Supabase
-- Description: Ensures profiles table has explicit department_id, semester, year,
--              and videos table has is_common flag, with optimized RLS and indexes.
-- ==============================================================================

-- 1. EXTEND PROFILES TABLE WITH ACADEMIC PROGRESSION COLUMNS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'department_id') THEN
        ALTER TABLE public.profiles ADD COLUMN department_id TEXT DEFAULT 'CSE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;

    -- Safely migrate semester from TEXT to INTEGER if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'semester' AND data_type = 'text'
    ) THEN
        ALTER TABLE public.profiles ALTER COLUMN semester DROP DEFAULT;
        ALTER TABLE public.profiles 
        ALTER COLUMN semester TYPE INTEGER 
        USING (
            CASE 
                WHEN semester IS NULL OR TRIM(semester) = '' THEN 1
                WHEN (NULLIF(regexp_replace(semester, '[^0-9]', '', 'g'), '')) IS NOT NULL 
                     AND (regexp_replace(semester, '[^0-9]', '', 'g'))::integer BETWEEN 1 AND 8 
                     THEN (regexp_replace(semester, '[^0-9]', '', 'g'))::integer
                ELSE 1
            END
        );
        ALTER TABLE public.profiles ALTER COLUMN semester SET DEFAULT 1;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'semester'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN semester INTEGER DEFAULT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'year') THEN
        ALTER TABLE public.profiles ADD COLUMN year INTEGER DEFAULT 1;
    END IF;

    -- Add check constraints safely
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_semester') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_semester CHECK (semester >= 1 AND semester <= 8);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_year') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_year CHECK (year >= 1 AND year <= 4);
    END IF;
END $$;

-- Synchronize branch to department_id if empty
UPDATE public.profiles
SET department_id = UPPER(COALESCE(department_id, branch, 'CSE'))
WHERE department_id IS NULL;

-- Synchronize name and full_name
UPDATE public.profiles
SET full_name = COALESCE(full_name, name)
WHERE full_name IS NULL AND name IS NOT NULL;

UPDATE public.profiles
SET name = COALESCE(name, full_name)
WHERE name IS NULL AND full_name IS NOT NULL;

-- Compute year from integer semester safely
UPDATE public.profiles
SET year = LEAST(4, GREATEST(1, CEIL(semester / 2.0)::INTEGER))
WHERE year IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_semester ON public.profiles(semester);

-- 2. EXTEND VIDEOS TABLE WITH is_common COLUMN
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'is_common') THEN
        ALTER TABLE public.videos ADD COLUMN is_common BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_videos_is_common ON public.videos(is_common);
CREATE INDEX IF NOT EXISTS idx_videos_published_common ON public.videos(is_published, is_common);

-- 3. SYNCHRONIZE VIDEO TAXONOMY TABLES FROM BASE VIDEOS TABLE
INSERT INTO public.video_departments (video_id, department_id)
SELECT v.id, UPPER(v.branch_code)
FROM public.videos v
WHERE v.branch_code IS NOT NULL AND v.branch_code != ''
ON CONFLICT (video_id, department_id) DO NOTHING;

INSERT INTO public.video_semesters (video_id, semester_id)
SELECT v.id, v.semester
FROM public.videos v
WHERE v.semester IS NOT NULL AND v.semester >= 1 AND v.semester <= 8
ON CONFLICT (video_id, semester_id) DO NOTHING;

INSERT INTO public.video_subjects (video_id, subject_name)
SELECT v.id, v.subject
FROM public.videos v
WHERE v.subject IS NOT NULL AND v.subject != ''
  AND NOT EXISTS (
      SELECT 1 FROM public.video_subjects vs 
      WHERE vs.video_id = v.id AND vs.subject_name = v.subject
  );

-- 4. CLEANUP LEAKY & DUPLICATE POLICIES
DROP POLICY IF EXISTS "Admin manage videos" ON public.videos;
DROP POLICY IF EXISTS "Public view videos" ON public.videos;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- 5. FUNCTION TO RETRIEVE STUDENT'S PERSONALIZED VIDEO FEED
DROP FUNCTION IF EXISTS public.get_personalized_video_feed(UUID, INTEGER);

CREATE OR REPLACE FUNCTION public.get_personalized_video_feed(
    p_student_id UUID DEFAULT NULL,
    p_requested_semester INTEGER DEFAULT NULL,
    p_department TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    provider TEXT,
    duration TEXT,
    difficulty TEXT,
    subject TEXT,
    topic TEXT,
    is_common BOOLEAN,
    departments TEXT[],
    semesters INTEGER[]
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_dept TEXT := COALESCE(UPPER(p_department), 'CSE');
    v_current_sem INTEGER := 1;
    v_active_sem INTEGER;
BEGIN
    -- Derive student's academic profile if provided
    IF p_student_id IS NOT NULL THEN
        SELECT COALESCE(department_id, branch, v_dept), COALESCE(semester, 1)
        INTO v_dept, v_current_sem
        FROM public.profiles
        WHERE profiles.id = p_student_id;
    END IF;

    -- Use requested semester or default to student's current enrolled semester
    v_active_sem := COALESCE(p_requested_semester, v_current_sem, 1);

    RETURN QUERY
    SELECT 
        v.id,
        v.title,
        v.description,
        v.video_url,
        v.thumbnail_url,
        v.provider,
        v.duration,
        v.difficulty,
        COALESCE(sub.subject_name, v.subject, 'Academic Curriculum') AS subject,
        COALESCE(top.topic_name, 'Foundational Theory') AS topic,
        v.is_common,
        ARRAY_AGG(DISTINCT COALESCE(vd.department_id, UPPER(v.branch_code))) FILTER (WHERE COALESCE(vd.department_id, UPPER(v.branch_code)) IS NOT NULL) AS departments,
        ARRAY_AGG(DISTINCT COALESCE(vs.semester_id, v.semester)) FILTER (WHERE COALESCE(vs.semester_id, v.semester) IS NOT NULL) AS semesters
    FROM public.videos v
    LEFT JOIN public.video_departments vd ON vd.video_id = v.id
    LEFT JOIN public.video_semesters vs ON vs.video_id = v.id
    LEFT JOIN LATERAL (
        SELECT subject_name FROM public.video_subjects WHERE video_id = v.id LIMIT 1
    ) sub ON true
    LEFT JOIN LATERAL (
        SELECT topic_name FROM public.video_topics WHERE video_id = v.id LIMIT 1
    ) top ON true
    WHERE v.is_published = true
      AND (
          -- Department Condition: Must match student's department OR video is genuinely common
          v.is_common = true
          OR vd.department_id = UPPER(v_dept)
          OR vd.department_id = 'COMMON'
          OR vd.department_id = 'ALL'
          OR UPPER(v.branch_code) = UPPER(v_dept)
          OR UPPER(v.branch_code) = 'COMMON'
          OR UPPER(v.branch_code) = 'ALL'
      )
      AND (
          -- Semester Condition: Must match active semester OR universal common (semester 0 or all semesters)
          vs.semester_id = v_active_sem
          OR vs.semester_id = 0
          OR v.semester = v_active_sem
          OR (v.is_common = true AND vs.semester_id IS NULL)
      )
    GROUP BY v.id, v.title, v.description, v.video_url, v.thumbnail_url, v.provider, v.duration, v.difficulty, v.subject, v.branch_code, v.semester, v.is_common, sub.subject_name, top.topic_name
    ORDER BY v.sort_order ASC, v.created_at DESC;
END;
$$;
