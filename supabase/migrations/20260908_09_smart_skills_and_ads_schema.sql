-- ==============================================================================
-- BTechPath AI OS - Smart Skills Learning System & Google Ads Schema
-- Migration: 20260908_09_smart_skills_and_ads_schema.sql
-- ==============================================================================

-- 1. Master Careers Directory Table
CREATE TABLE IF NOT EXISTS public.master_careers (
    id TEXT PRIMARY KEY,
    branch_code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'work',
    core_focus TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Master Skills Taxonomy Table
CREATE TABLE IF NOT EXISTS public.master_skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Core, Tools, Fundamental, Technical, Soft, Practical, Portfolio, Interview, Advanced
    description TEXT,
    why_it_matters TEXT,
    primary_branch TEXT,
    difficulty TEXT DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Career-to-Skill Mapping Table
CREATE TABLE IF NOT EXISTS public.career_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id TEXT NOT NULL,
    skill_id TEXT,
    skill_name TEXT,
    importance TEXT DEFAULT 'Mandatory',
    proficiency_level TEXT DEFAULT 'Advanced',
    priority TEXT DEFAULT 'Core', -- Core, Recommended, Optional, Advanced
    importance_weight INT DEFAULT 80, -- 1-100 weight in career readiness
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(career_id, skill_id)
);

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

-- 4. User Skill Progress & Mastery (Strict Isolation: auth.uid() = user_id)
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_email TEXT,
    career_id TEXT,
    skill_id TEXT NOT NULL,
    claimed_level TEXT DEFAULT 'Beginner', -- Beginner, Learning, Intermediate, Advanced, Strong
    assessment_score NUMERIC(5, 2) DEFAULT 0,
    knowledge_score NUMERIC(5, 2) DEFAULT 0,
    practical_score NUMERIC(5, 2) DEFAULT 0,
    confidence TEXT DEFAULT 'Moderate', -- High, Moderate, Low
    practice_score NUMERIC(5, 2) DEFAULT 0,
    learning_progress NUMERIC(5, 2) DEFAULT 0,
    lessons_completed INT DEFAULT 0,
    total_lessons INT DEFAULT 12,
    has_project_evidence BOOLEAN DEFAULT FALSE,
    project_name TEXT,
    last_assessed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'Learning', -- Not Started, Learning, Practicing, Mastered
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- 5. User Skill Assessment History
CREATE TABLE IF NOT EXISTS public.skill_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_email TEXT,
    skill_id TEXT NOT NULL,
    career_id TEXT,
    assessment_type TEXT DEFAULT 'AI_ASSESSMENT', -- DIAGNOSTIC, AI_ASSESSMENT, PRACTICE_QUIZ
    knowledge_percentage NUMERIC(5, 2) NOT NULL,
    practical_percentage NUMERIC(5, 2) NOT NULL,
    overall_score NUMERIC(5, 2) NOT NULL,
    estimated_level TEXT NOT NULL,
    confidence TEXT NOT NULL,
    questions_count INT DEFAULT 5,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Project Evidence Verification Table
CREATE TABLE IF NOT EXISTS public.skill_project_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_email TEXT,
    skill_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    what_built TEXT NOT NULL,
    technologies_used TEXT[] NOT NULL,
    personal_implementation TEXT NOT NULL,
    problems_solved TEXT NOT NULL,
    repo_or_demo_url TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Centralized Ad System Configuration Table
CREATE TABLE IF NOT EXISTS public.ad_configurations (
    id TEXT PRIMARY KEY DEFAULT 'global_ads_config',
    ads_enabled BOOLEAN DEFAULT TRUE,
    publisher_id TEXT DEFAULT 'ca-pub-2659485988975906',
    test_mode BOOLEAN DEFAULT FALSE,
    placements JSONB DEFAULT '{
        "dashboard_bottom": true,
        "skills_content_boundary": true,
        "career_discovery_boundary": true,
        "internships_boundary": true,
        "roadmap_boundary": true
    }'::jsonb,
    updated_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.master_careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_project_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public Catalogs (Read-only for all, write for authenticated admin)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view master careers" ON public.master_careers;
    CREATE POLICY "Public can view master careers" ON public.master_careers FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view master skills" ON public.master_skills;
    CREATE POLICY "Public can view master skills" ON public.master_skills FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public view career skills" ON public.career_skills;
    DROP POLICY IF EXISTS "Public can view career skills" ON public.career_skills;
    CREATE POLICY "Public can view career skills" ON public.career_skills FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view ad configs" ON public.ad_configurations;
    CREATE POLICY "Public can view ad configs" ON public.ad_configurations FOR SELECT USING (true);

    -- Strict User Isolation Policies: Students can only view/modify their own records
    DROP POLICY IF EXISTS "Users can view own skills" ON public.user_skills;
    CREATE POLICY "Users can view own skills" ON public.user_skills FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own skills" ON public.user_skills;
    CREATE POLICY "Users can insert own skills" ON public.user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own skills" ON public.user_skills;
    CREATE POLICY "Users can update own skills" ON public.user_skills FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can view own assessments" ON public.skill_assessments;
    CREATE POLICY "Users can view own assessments" ON public.skill_assessments FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own assessments" ON public.skill_assessments;
    CREATE POLICY "Users can insert own assessments" ON public.skill_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can view own project evidence" ON public.skill_project_evidence;
    CREATE POLICY "Users can view own project evidence" ON public.skill_project_evidence FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own project evidence" ON public.skill_project_evidence;
    CREATE POLICY "Users can insert own project evidence" ON public.skill_project_evidence FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own project evidence" ON public.skill_project_evidence;
    CREATE POLICY "Users can update own project evidence" ON public.skill_project_evidence FOR UPDATE USING (auth.uid() = user_id);
END $$;
