-- ==============================================================================
-- BTechPath AI OS — Migration 08: Projects Hub & Multi-Department Architecture
-- Description: Normalized schema for engineering departments, capstone projects,
--              multi-department mappings, year/semester associations, project guides,
--              progress tracking, and strict Row Level Security (RLS).
-- ==============================================================================

-- 1. DEPARTMENTS TABLE (Canonical source of all engineering branches)
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

-- 2. PROJECTS TABLE (Comprehensive Production Projects & Capstone Repository)
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    why_build_it TEXT NOT NULL,
    who_it_is_for TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Production Capstone')),
    duration_weeks INTEGER NOT NULL DEFAULT 4,
    estimated_hours INTEGER NOT NULL DEFAULT 60,
    prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    tech_stack JSONB NOT NULL DEFAULT '[]'::jsonb,
    hardware_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    software_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    objective TEXT NOT NULL,
    how_it_works TEXT NOT NULL,
    folder_structure TEXT NOT NULL,
    database_design JSONB NOT NULL DEFAULT '{}'::jsonb,
    api_design JSONB NOT NULL DEFAULT '[]'::jsonb,
    step_by_step_guide JSONB NOT NULL DEFAULT '[]'::jsonb,
    testing_guide JSONB NOT NULL DEFAULT '{}'::jsonb,
    common_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
    expected_output TEXT NOT NULL,
    demo_guide TEXT NOT NULL,
    resume_bullet TEXT NOT NULL,
    interview_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    extensions JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_careers JSONB NOT NULL DEFAULT '[]'::jsonb,
    repository_url TEXT,
    demo_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROJECT-DEPARTMENT RELATIONSHIP (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.project_departments (
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    department_code TEXT NOT NULL REFERENCES public.departments(code) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (project_id, department_code)
);

-- 4. PROJECT-YEAR & SEMESTER RELATIONSHIPS
CREATE TABLE IF NOT EXISTS public.project_years (
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    year_number INTEGER NOT NULL CHECK (year_number BETWEEN 1 AND 4),
    PRIMARY KEY (project_id, year_number)
);

CREATE TABLE IF NOT EXISTS public.project_semesters (
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    semester_number INTEGER NOT NULL CHECK (semester_number BETWEEN 1 AND 8),
    PRIMARY KEY (project_id, semester_number)
);

-- 5. PROJECT-VIDEO CONNECTION (Connecting projects to LearnHub videos)
CREATE TABLE IF NOT EXISTS public.project_videos (
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    title TEXT,
    url TEXT,
    PRIMARY KEY (project_id, video_id)
);

-- 6. USER PROJECT PROGRESS (Private student tracking)
CREATE TABLE IF NOT EXISTS public.user_project_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Planning' CHECK (status IN ('Not Started', 'Planning', 'Learning', 'Building', 'Testing', 'Completed')),
    progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_notes TEXT,
    repository_url TEXT,
    live_demo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_project UNIQUE (user_id, project_id)
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_difficulty ON public.projects(difficulty);
CREATE INDEX IF NOT EXISTS idx_proj_depts_dept ON public.project_departments(department_code);
CREATE INDEX IF NOT EXISTS idx_proj_years_year ON public.project_years(year_number);
CREATE INDEX IF NOT EXISTS idx_proj_semesters_sem ON public.project_semesters(semester_number);
CREATE INDEX IF NOT EXISTS idx_user_proj_progress_user ON public.user_project_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_proj_progress_status ON public.user_project_progress(user_id, status);

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_project_progress ENABLE ROW LEVEL SECURITY;

-- Read policies (Students can read active departments and published projects)
DROP POLICY IF EXISTS "Public read active departments" ON public.departments;
CREATE POLICY "Public read active departments" ON public.departments
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public read published projects" ON public.projects;
CREATE POLICY "Public read published projects" ON public.projects
    FOR SELECT USING (is_published = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Public read project departments" ON public.project_departments;
CREATE POLICY "Public read project departments" ON public.project_departments
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read project years" ON public.project_years;
CREATE POLICY "Public read project years" ON public.project_years
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read project semesters" ON public.project_semesters;
CREATE POLICY "Public read project semesters" ON public.project_semesters
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public read project videos" ON public.project_videos;
CREATE POLICY "Public read project videos" ON public.project_videos
    FOR SELECT USING (TRUE);

-- User project progress policies (Private to owner)
DROP POLICY IF EXISTS "Users read own project progress" ON public.user_project_progress;
CREATE POLICY "Users read own project progress" ON public.user_project_progress
    FOR SELECT USING (auth.uid()::text = user_id OR user_id = 'guest_user' OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own project progress" ON public.user_project_progress;
CREATE POLICY "Users insert own project progress" ON public.user_project_progress
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = 'guest_user');

DROP POLICY IF EXISTS "Users update own project progress" ON public.user_project_progress;
CREATE POLICY "Users update own project progress" ON public.user_project_progress
    FOR UPDATE USING (auth.uid()::text = user_id OR user_id = 'guest_user');

DROP POLICY IF EXISTS "Users delete own project progress" ON public.user_project_progress;
CREATE POLICY "Users delete own project progress" ON public.user_project_progress
    FOR DELETE USING (auth.uid()::text = user_id OR user_id = 'guest_user');

-- Admin full management policies
DROP POLICY IF EXISTS "Admin manage departments" ON public.departments;
CREATE POLICY "Admin manage departments" ON public.departments
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin manage projects" ON public.projects;
CREATE POLICY "Admin manage projects" ON public.projects
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin manage project departments" ON public.project_departments;
CREATE POLICY "Admin manage project departments" ON public.project_departments
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin manage project years" ON public.project_years;
CREATE POLICY "Admin manage project years" ON public.project_years
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin manage project semesters" ON public.project_semesters;
CREATE POLICY "Admin manage project semesters" ON public.project_semesters
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin manage project videos" ON public.project_videos;
CREATE POLICY "Admin manage project videos" ON public.project_videos
    FOR ALL USING (public.is_admin());
