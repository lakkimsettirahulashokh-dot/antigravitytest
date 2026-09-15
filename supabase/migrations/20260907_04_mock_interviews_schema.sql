-- ==============================================================================
-- BTechPath AI OS - Migration 04: Enhanced AI Mock Interview Schema
-- Real Resume-Aware, Adaptive Interview Architecture with Strict User Isolation
-- ==============================================================================

-- 1. Extend mock_interviews table
ALTER TABLE public.mock_interviews
    ADD COLUMN IF NOT EXISTS resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS department_id TEXT DEFAULT 'CSE',
    ADD COLUMN IF NOT EXISTS target_role TEXT DEFAULT 'Software Engineer',
    ADD COLUMN IF NOT EXISTS interview_type TEXT DEFAULT 'Mixed Interview',
    ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Intermediate',
    ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed',
    ADD COLUMN IF NOT EXISTS overall_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS technical_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS communication_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS problem_solving_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS resume_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS role_readiness_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS report JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create mock_interview_questions table
CREATE TABLE IF NOT EXISTS public.mock_interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES public.mock_interviews(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    skill_id TEXT,
    project_reference TEXT,
    difficulty TEXT DEFAULT 'Intermediate',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create mock_interview_answers table
CREATE TABLE IF NOT EXISTS public.mock_interview_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.mock_interview_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    technical_score INTEGER DEFAULT 0,
    relevance_score INTEGER DEFAULT 0,
    depth_score INTEGER DEFAULT 0,
    feedback TEXT,
    missing_concepts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Indexes for high performance queries
CREATE INDEX IF NOT EXISTS idx_mock_interviews_user ON public.mock_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_resume ON public.mock_interviews(resume_id);
CREATE INDEX IF NOT EXISTS idx_mock_questions_interview ON public.mock_interview_questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_mock_answers_question ON public.mock_interview_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_mock_answers_user ON public.mock_interview_answers(user_id);

-- 5. Row Level Security (RLS)
ALTER TABLE public.mock_interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_answers ENABLE ROW LEVEL SECURITY;

-- Questions RLS: Users can access questions belonging to their interviews
DROP POLICY IF EXISTS "Users manage own interview questions" ON public.mock_interview_questions;
CREATE POLICY "Users manage own interview questions" ON public.mock_interview_questions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.mock_interviews mi
            WHERE mi.id = interview_id
            AND (mi.user_id = auth.uid() OR public.is_admin())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.mock_interviews mi
            WHERE mi.id = interview_id
            AND (mi.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Answers RLS: Users can only manage their own answers
DROP POLICY IF EXISTS "Users manage own interview answers" ON public.mock_interview_answers;
CREATE POLICY "Users manage own interview answers" ON public.mock_interview_answers
    FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 6. Realtime Replication
ALTER TABLE public.mock_interview_questions REPLICA IDENTITY FULL;
ALTER TABLE public.mock_interview_answers REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.mock_interview_questions;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.mock_interview_answers;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;
