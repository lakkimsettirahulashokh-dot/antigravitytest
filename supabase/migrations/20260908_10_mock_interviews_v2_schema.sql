-- ==============================================================================
-- BTechPath AI OS - Migration 10: Mock Interview V2 End-to-End Schema
-- Video Recording Storage, Speaking Characteristics Analysis & Session Recovery
-- ==============================================================================

-- 1. Extend mock_interviews session table
ALTER TABLE public.mock_interviews
    ADD COLUMN IF NOT EXISTS current_question INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS session_metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Extend mock_interview_questions table
ALTER TABLE public.mock_interview_questions
    ADD COLUMN IF NOT EXISTS skill TEXT,
    ADD COLUMN IF NOT EXISTS source_from_resume TEXT,
    ADD COLUMN IF NOT EXISTS context_reason TEXT,
    ADD COLUMN IF NOT EXISTS is_follow_up BOOLEAN DEFAULT false;

-- 3. Extend mock_interview_answers table with video recording & speaking metrics
ALTER TABLE public.mock_interview_answers
    ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.mock_interviews(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS question_number INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS recording_path TEXT,
    ADD COLUMN IF NOT EXISTS duration NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'video/webm',
    ADD COLUMN IF NOT EXISTS transcript TEXT,
    ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'completed',
    ADD COLUMN IF NOT EXISTS communication_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS clarity_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS structure_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS pace_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS speaking_wpm INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS filler_word_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS filler_words JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS pause_observations TEXT,
    ADD COLUMN IF NOT EXISTS strengths JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS weaknesses JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS improvement TEXT,
    ADD COLUMN IF NOT EXISTS model_answer TEXT,
    ADD COLUMN IF NOT EXISTS detailed_feedback TEXT;

-- 4. Create dedicated mock_interview_feedbacks table if preferred for separate queries
CREATE TABLE IF NOT EXISTS public.mock_interview_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.mock_interviews(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES public.mock_interview_answers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    answer_score NUMERIC DEFAULT 0,
    technical_score INTEGER DEFAULT 0,
    communication_score INTEGER DEFAULT 0,
    clarity_score INTEGER DEFAULT 0,
    structure_score INTEGER DEFAULT 0,
    relevance_score INTEGER DEFAULT 0,
    pace_score INTEGER DEFAULT 0,
    speaking_wpm INTEGER DEFAULT 0,
    filler_word_count INTEGER DEFAULT 0,
    filler_words JSONB DEFAULT '[]'::jsonb,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    improvement TEXT,
    model_answer TEXT,
    detailed_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes for fast session lookups
CREATE INDEX IF NOT EXISTS idx_mock_answers_session ON public.mock_interview_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_mock_feedbacks_session ON public.mock_interview_feedbacks(session_id);
CREATE INDEX IF NOT EXISTS idx_mock_feedbacks_user ON public.mock_interview_feedbacks(user_id);

-- 6. Row Level Security
ALTER TABLE public.mock_interview_feedbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own interview feedbacks" ON public.mock_interview_feedbacks;
CREATE POLICY "Users manage own interview feedbacks" ON public.mock_interview_feedbacks
    FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 7. Supabase Storage Bucket for mock interview recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'mock-interviews',
    'mock-interviews',
    false,
    104857600, -- 100 MB max recording file size
    ARRAY['video/webm', 'video/mp4', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 104857600,
    allowed_mime_types = ARRAY['video/webm', 'video/mp4', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];

-- Storage RLS: Authenticated users can upload to their own user_id directory
DROP POLICY IF EXISTS "Users upload own interview recordings" ON storage.objects;
CREATE POLICY "Users upload own interview recordings" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'mock-interviews'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users view own interview recordings" ON storage.objects;
CREATE POLICY "Users view own interview recordings" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'mock-interviews'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
