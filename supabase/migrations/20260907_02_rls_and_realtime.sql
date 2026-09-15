-- ==============================================================================
-- BTechPath AI OS — Migration 02: Row Level Security (RLS) & Realtime Publication
-- Target: PostgreSQL 14+ / Supabase
-- Description: Enables RLS on all tables, establishes idempotent security policies,
--              sets REPLICA IDENTITY FULL, and subscribes tables to supabase_realtime.
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. IDEMPOTENT ROW LEVEL SECURITY POLICIES

-- PROFILES
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Insert profile via auth trigger or admin" ON public.profiles;
CREATE POLICY "Insert profile via auth trigger or admin" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- USER PREFERENCES
DROP POLICY IF EXISTS "Users manage own preferences" ON public.user_preferences;
CREATE POLICY "Users manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- BRANCHES (Read by all, manage by admin)
DROP POLICY IF EXISTS "Public view active branches" ON public.branches;
CREATE POLICY "Public view active branches" ON public.branches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage branches" ON public.branches;
CREATE POLICY "Admin manage branches" ON public.branches FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- VIDEOS (Read by all, manage by admin)
DROP POLICY IF EXISTS "Public view videos" ON public.videos;
CREATE POLICY "Public view videos" ON public.videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage videos" ON public.videos;
CREATE POLICY "Admin manage videos" ON public.videos FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CAREERS, SKILLS & PROJECTS (Read by all, manage by admin)
DROP POLICY IF EXISTS "Public view careers" ON public.careers;
CREATE POLICY "Public view careers" ON public.careers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage careers" ON public.careers;
CREATE POLICY "Admin manage careers" ON public.careers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public view career skills" ON public.career_skills;
CREATE POLICY "Public view career skills" ON public.career_skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage career skills" ON public.career_skills;
CREATE POLICY "Admin manage career skills" ON public.career_skills FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public view career projects" ON public.career_projects;
CREATE POLICY "Public view career projects" ON public.career_projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage career projects" ON public.career_projects;
CREATE POLICY "Admin manage career projects" ON public.career_projects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- JOBS & INTERNSHIPS
DROP POLICY IF EXISTS "Public view active jobs" ON public.jobs;
CREATE POLICY "Public view active jobs" ON public.jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage jobs" ON public.jobs;
CREATE POLICY "Admin manage jobs" ON public.jobs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- INTERNSHIP APPLICATIONS
DROP POLICY IF EXISTS "Users view own applications" ON public.internship_applications;
CREATE POLICY "Users view own applications" ON public.internship_applications FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users create own applications" ON public.internship_applications;
CREATE POLICY "Users create own applications" ON public.internship_applications FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users or admin update applications" ON public.internship_applications;
CREATE POLICY "Users or admin update applications" ON public.internship_applications FOR UPDATE USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ROADMAPS
DROP POLICY IF EXISTS "Users manage own roadmaps" ON public.roadmaps;
CREATE POLICY "Users manage own roadmaps" ON public.roadmaps FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- DOUBTS
DROP POLICY IF EXISTS "Users manage own doubts" ON public.doubts;
CREATE POLICY "Users manage own doubts" ON public.doubts FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- RESUMES
DROP POLICY IF EXISTS "Users manage own resumes" ON public.resumes;
CREATE POLICY "Users manage own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- MOCK INTERVIEWS
DROP POLICY IF EXISTS "Users manage own mock interviews" ON public.mock_interviews;
CREATE POLICY "Users manage own mock interviews" ON public.mock_interviews FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- REVIEWS (Public view approved, user create own)
DROP POLICY IF EXISTS "Public view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved' OR is_approved = true);

DROP POLICY IF EXISTS "Authenticated users create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can submit a review" ON public.reviews;
CREATE POLICY "Authenticated users can submit a review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

-- STUDY SESSIONS
DROP POLICY IF EXISTS "Users manage own study sessions" ON public.study_sessions;
CREATE POLICY "Users manage own study sessions" ON public.study_sessions FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- DAILY TASKS
DROP POLICY IF EXISTS "Users manage own daily tasks" ON public.daily_tasks;
CREATE POLICY "Users manage own daily tasks" ON public.daily_tasks FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- EXAMS
DROP POLICY IF EXISTS "Users manage own exams" ON public.exams;
CREATE POLICY "Users manage own exams" ON public.exams FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- EXAM DOCUMENTS & TAXONOMY
DROP POLICY IF EXISTS "Users manage own exam documents" ON public.exam_documents;
CREATE POLICY "Users manage own exam documents" ON public.exam_documents FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Public read exam syllabus taxonomy" ON public.exam_papers;
CREATE POLICY "Public read exam syllabus taxonomy" ON public.exam_papers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read exam subjects" ON public.exam_subjects;
CREATE POLICY "Public read exam subjects" ON public.exam_subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read exam topics" ON public.exam_topics;
CREATE POLICY "Public read exam topics" ON public.exam_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read exam subtopics" ON public.exam_subtopics;
CREATE POLICY "Public read exam subtopics" ON public.exam_subtopics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own topic progress" ON public.exam_topic_progress;
CREATE POLICY "Users manage own topic progress" ON public.exam_topic_progress FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users manage own study plans" ON public.exam_study_plans;
CREATE POLICY "Users manage own study plans" ON public.exam_study_plans FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users manage own exam notes" ON public.exam_notes;
CREATE POLICY "Users manage own exam notes" ON public.exam_notes FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Public read exam questions" ON public.exam_questions;
CREATE POLICY "Public read exam questions" ON public.exam_questions FOR SELECT USING (true);

-- FLASHCARDS
DROP POLICY IF EXISTS "Users manage own flashcards" ON public.flashcards;
CREATE POLICY "Users manage own flashcards" ON public.flashcards FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- QUIZZES & ATTEMPTS
DROP POLICY IF EXISTS "Public read quizzes" ON public.quizzes;
CREATE POLICY "Public read quizzes" ON public.quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users manage own quiz attempts" ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- AD CONFIGURATION (Public read, admin manage)
DROP POLICY IF EXISTS "Public view ad config" ON public.ad_configuration;
CREATE POLICY "Public view ad config" ON public.ad_configuration FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage ad config" ON public.ad_configuration;
CREATE POLICY "Admin manage ad config" ON public.ad_configuration FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ADMIN AUDIT LOGS (Admin read/insert only)
DROP POLICY IF EXISTS "Admin read audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admin read audit logs" ON public.admin_audit_logs FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admin insert audit logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (public.is_admin());

-- 3. REPLICA IDENTITY FULL (Ensures Realtime broadcasts contain entire row)
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.user_preferences REPLICA IDENTITY FULL;
ALTER TABLE public.branches REPLICA IDENTITY FULL;
ALTER TABLE public.videos REPLICA IDENTITY FULL;
ALTER TABLE public.careers REPLICA IDENTITY FULL;
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER TABLE public.internship_applications REPLICA IDENTITY FULL;
ALTER TABLE public.roadmaps REPLICA IDENTITY FULL;
ALTER TABLE public.doubts REPLICA IDENTITY FULL;
ALTER TABLE public.resumes REPLICA IDENTITY FULL;
ALTER TABLE public.mock_interviews REPLICA IDENTITY FULL;
ALTER TABLE public.reviews REPLICA IDENTITY FULL;
ALTER TABLE public.study_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.daily_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.exams REPLICA IDENTITY FULL;
ALTER TABLE public.exam_documents REPLICA IDENTITY FULL;
ALTER TABLE public.exam_topic_progress REPLICA IDENTITY FULL;
ALTER TABLE public.exam_study_plans REPLICA IDENTITY FULL;
ALTER TABLE public.exam_notes REPLICA IDENTITY FULL;
ALTER TABLE public.flashcards REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_attempts REPLICA IDENTITY FULL;

-- 4. SUPABASE REALTIME PUBLICATION SETUP
DO $$
DECLARE
    t TEXT;
    realtime_tables TEXT[] := ARRAY[
        'profiles',
        'user_preferences',
        'branches',
        'videos',
        'careers',
        'jobs',
        'internship_applications',
        'roadmaps',
        'doubts',
        'resumes',
        'mock_interviews',
        'reviews',
        'study_sessions',
        'daily_tasks',
        'exams',
        'exam_documents',
        'exam_topic_progress',
        'exam_study_plans',
        'exam_notes',
        'flashcards',
        'quiz_attempts'
    ];
BEGIN
    -- Ensure publication exists
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;

    -- Add each table safely without duplicates
    FOREACH t IN ARRAY realtime_tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
        END IF;
    END LOOP;
END $$;
