-- ==============================================================================
-- BTechPath AI OS — Migration 13: Onboarding & Auth Flow Synchronization
-- Target: PostgreSQL 14+ / Supabase
-- Description: Adds onboarding_completed, department_id, semester, year, and
--              personalization fields to public.profiles. Configures RLS policies
--              for strict auth.uid() ownership.
-- ==============================================================================

-- 1. EXTEND PROFILES TABLE WITH ONBOARDING & ACADEMIC COLUMNS
DO $$
BEGIN
    -- onboarding_completed flag
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- department_id (Uppercase code, e.g. CSE, ECE, MECH, CIVIL, AIML)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'department_id') THEN
        ALTER TABLE public.profiles ADD COLUMN department_id TEXT;
    END IF;

    -- full_name column
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

    -- year (1 to 4)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'year') THEN
        ALTER TABLE public.profiles ADD COLUMN year INTEGER DEFAULT 1;
    END IF;

    -- target_role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'target_role') THEN
        ALTER TABLE public.profiles ADD COLUMN target_role TEXT DEFAULT 'Software Engineer';
    END IF;

    -- skill_level (Beginner, Intermediate, Advanced)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skill_level') THEN
        ALTER TABLE public.profiles ADD COLUMN skill_level TEXT DEFAULT 'Intermediate';
    END IF;

    -- career_goal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'career_goal') THEN
        ALTER TABLE public.profiles ADD COLUMN career_goal TEXT DEFAULT 'Top Tier Product Tech';
    END IF;

    -- Add check constraints safely
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_semester') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_semester CHECK (semester >= 1 AND semester <= 8);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_year') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_year CHECK (year >= 1 AND year <= 4);
    END IF;
END $$;

-- 2. BACKFILL EXISTING PROFILES
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

UPDATE public.profiles
SET year = LEAST(4, GREATEST(1, CEIL(COALESCE(semester, 1) / 2.0)::INTEGER))
WHERE year IS NULL;

-- If a profile already has full_name or name, branch/department, and semester, mark onboarding completed
UPDATE public.profiles
SET onboarding_completed = true
WHERE (COALESCE(full_name, name) IS NOT NULL AND COALESCE(full_name, name) != '') 
  AND department_id IS NOT NULL AND department_id != ''
  AND semester IS NOT NULL;

-- 3. INDEXES FOR FAST AUTH & ONBOARDING LOOKUPS
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_semester ON public.profiles(semester);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Deduplicate all previous profile policies
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Insert profile via auth trigger or admin" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        public.is_admin()
        OR (
            auth.uid() = id
            AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());
