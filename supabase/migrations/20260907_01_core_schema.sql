-- ==============================================================================
-- BTechPath AI OS — Migration 01: Complete Normalized Core Schema
-- Target: PostgreSQL 14+ / Supabase
-- Description: Extensions, core functions, normalized entity tables, foreign keys,
--              triggers, and performance indexes. Zero syntax errors.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CORE UTILITY FUNCTIONS & TRIGGERS

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Admin authorization verification function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        LOWER(auth.jwt() ->> 'email') = 'rahulashokhlakkimsetty@gmail.com'
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin' AND LOWER(email) = 'rahulashokhlakkimsetty@gmail.com'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. USER MANAGEMENT TABLES

-- Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor')),
    tier TEXT NOT NULL DEFAULT 'Engineering Scholar',
    branch TEXT NOT NULL DEFAULT 'AIML',
    target_career TEXT DEFAULT 'Machine Learning Engineer',
    streak INTEGER NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'dark',
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    sound_effects BOOLEAN NOT NULL DEFAULT true,
    daily_target_minutes INTEGER NOT NULL DEFAULT 120,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile trigger on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, tier)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN LOWER(NEW.email) = 'rahulashokhlakkimsetty@gmail.com' THEN 'admin'
            ELSE 'student'
        END,
        'Engineering Scholar'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ACADEMIC CURRICULUM & VIDEO LEARNING TABLES

-- Engineering Branches
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    semesters JSONB DEFAULT '[]'::jsonb,
    subjects JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Video Lectures Library
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    branch_code TEXT REFERENCES public.branches(code) ON DELETE SET NULL,
    semester INTEGER NOT NULL DEFAULT 1,
    subject TEXT NOT NULL,
    video_url TEXT NOT NULL,
    duration TEXT DEFAULT '15:00',
    instructor TEXT DEFAULT 'BTechPath AI Faculty',
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CAREER & OPPORTUNITY ECOSYSTEM

-- Career Paths
CREATE TABLE IF NOT EXISTS public.careers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT DEFAULT 'Software & AI',
    salary_range TEXT DEFAULT '$95,000 - $145,000',
    description TEXT,
    match_score INTEGER DEFAULT 85,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Required Skills per Career
CREATE TABLE IF NOT EXISTS public.career_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id TEXT REFERENCES public.careers(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    importance TEXT DEFAULT 'Mandatory',
    proficiency_level TEXT DEFAULT 'Advanced'
);

-- Recommended Projects per Career
CREATE TABLE IF NOT EXISTS public.career_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id TEXT REFERENCES public.careers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Intermediate',
    tech_stack JSONB DEFAULT '[]'::jsonb,
    description TEXT
);

-- Live Jobs & Internships
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT DEFAULT 'Remote / Hybrid',
    type TEXT NOT NULL DEFAULT 'Full-time',
    stipend TEXT DEFAULT '$6,500/mo',
    branch TEXT DEFAULT 'AIML',
    deadline TIMESTAMPTZ,
    description TEXT,
    apply_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Internship Applications
CREATE TABLE IF NOT EXISTS public.internship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Interview Scheduled', 'Offered', 'Rejected')),
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resume_url TEXT,
    cover_letter TEXT,
    notes TEXT
);

-- 6. STUDENT WORKSPACE & PRODUCTIVITY

-- Personalized Learning Roadmaps
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    branch TEXT NOT NULL,
    target_career TEXT DEFAULT '',
    track_type TEXT NOT NULL DEFAULT 'engineering',
    progress INTEGER NOT NULL DEFAULT 0,
    phases JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Doubt Solver Queries
CREATE TABLE IF NOT EXISTS public.doubts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    solution TEXT,
    is_live_ai BOOLEAN DEFAULT true,
    ai_model TEXT DEFAULT 'BTechPath AI',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ATS Resume Builder Documents
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Main Technical Resume',
    target_role TEXT DEFAULT 'Software Engineer',
    ats_score INTEGER DEFAULT 82,
    content JSONB DEFAULT '{}'::jsonb,
    personal_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mock Interview Sessions
CREATE TABLE IF NOT EXISTS public.mock_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    transcript JSONB DEFAULT '[]'::jsonb,
    feedback TEXT,
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform Reviews & Testimonials
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Student',
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    feature_used TEXT DEFAULT 'General',
    module TEXT DEFAULT 'general',
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dedicated Study Tracker Sessions
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    skill_id TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    study_date DATE NOT NULL DEFAULT CURRENT_DATE,
    timezone TEXT DEFAULT 'UTC',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily Planner Tasks
CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TEXT DEFAULT '09:00',
    end_time TEXT DEFAULT '10:00',
    completed BOOLEAN NOT NULL DEFAULT false,
    study_duration_seconds INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam Schedule
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TEXT DEFAULT '10:00 AM',
    room TEXT DEFAULT 'Hall A',
    syllabus TEXT,
    target_score INTEGER DEFAULT 90,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. EXAM TRACKER & PDF SYLLABUS ANALYSIS

-- Uploaded Exam Syllabus Documents
CREATE TABLE IF NOT EXISTS public.exam_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    exam_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT,
    extracted_text TEXT,
    status TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Official Exam Papers / Standard Taxonomy
CREATE TABLE IF NOT EXISTS public.exam_papers (
    id TEXT PRIMARY KEY,
    exam_type TEXT NOT NULL,
    title TEXT NOT NULL,
    total_marks INTEGER NOT NULL DEFAULT 100,
    duration_minutes INTEGER NOT NULL DEFAULT 180,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam Subjects
CREATE TABLE IF NOT EXISTS public.exam_subjects (
    id TEXT PRIMARY KEY,
    paper_id TEXT REFERENCES public.exam_papers(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    credits INTEGER DEFAULT 4,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam Topics
CREATE TABLE IF NOT EXISTS public.exam_topics (
    id TEXT PRIMARY KEY,
    subject_id TEXT REFERENCES public.exam_subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    importance TEXT NOT NULL DEFAULT 'High',
    weightage_percentage INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam Subtopics
CREATE TABLE IF NOT EXISTS public.exam_subtopics (
    id TEXT PRIMARY KEY,
    topic_id TEXT REFERENCES public.exam_topics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_concepts JSONB DEFAULT '[]'::jsonb,
    formulas JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Topic Progress Tracking
CREATE TABLE IF NOT EXISTS public.exam_topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subtopic_id TEXT REFERENCES public.exam_subtopics(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'mastered')),
    confidence_level TEXT NOT NULL DEFAULT 'medium',
    revision_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Personalized Exam Study Plans
CREATE TABLE IF NOT EXISTS public.exam_study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id TEXT NOT NULL,
    title TEXT NOT NULL,
    target_completion_date DATE,
    milestones JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam Revision Notes
CREATE TABLE IF NOT EXISTS public.exam_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam Practice Questions
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ACTIVE RECALL FLASHCARDS & ASSESSMENTS

-- 3D Spaced Repetition Flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    deck_name TEXT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    formula TEXT,
    interval_days INTEGER NOT NULL DEFAULT 1,
    ease_factor NUMERIC(3,2) NOT NULL DEFAULT 2.50,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quizzes Catalog
CREATE TABLE IF NOT EXISTS public.quizzes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    branch TEXT DEFAULT 'AIML',
    total_questions INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Quiz Attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT true,
    answers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PLATFORM ADMINISTRATION & TELEMETRY

-- Ad & Announcement Placement Engine
CREATE TABLE IF NOT EXISTS public.ad_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_network TEXT NOT NULL DEFAULT 'direct',
    placement TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin Security & Audit Trail
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_videos_branch_sem ON public.videos(branch_code, semester);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_internship_apps_user ON public.internship_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_doubts_user ON public.doubts(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_user ON public.mock_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON public.study_sessions(user_id, study_date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exams_user ON public.exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_docs_user ON public.exam_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_topic_prog_user ON public.exam_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_due ON public.flashcards(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
