-- ==============================================================================
-- Migration: 20260909_16_study_time_daily_and_sessions.sql
-- Description: Real "Today's Study Time" Tracker Schema & Strict RLS Isolation
-- Tables:
--   1. public.study_time_daily (daily aggregate per user_id + study_date)
--   2. Enhancements to public.study_sessions (activity_type, last_active_at)
-- Strict RLS: auth.uid() = user_id OR public.is_admin()
-- ==============================================================================

-- 1. Create Daily Study Time Aggregation Table
CREATE TABLE IF NOT EXISTS public.study_time_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    study_date DATE NOT NULL DEFAULT CURRENT_DATE,
    active_seconds INTEGER NOT NULL DEFAULT 0 CHECK (active_seconds >= 0),
    daily_goal_seconds INTEGER NOT NULL DEFAULT 7200 CHECK (daily_goal_seconds > 0), -- Default 2 hours
    activity_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_study_time_daily_user_date UNIQUE (user_id, study_date)
);

-- Index for instant lookup of user's today and history study stats
CREATE INDEX IF NOT EXISTS idx_study_time_daily_user_date 
    ON public.study_time_daily(user_id, study_date DESC);

-- 2. Ensure study_sessions has activity_type & last_active_at columns if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'study_sessions' 
        AND column_name = 'activity_type'
    ) THEN
        ALTER TABLE public.study_sessions ADD COLUMN activity_type TEXT DEFAULT 'general';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'study_sessions' 
        AND column_name = 'last_active_at'
    ) THEN
        ALTER TABLE public.study_sessions ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.study_time_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Strict Ownership Policies for study_time_daily
DROP POLICY IF EXISTS "Users can read own study daily" ON public.study_time_daily;
CREATE POLICY "Users can read own study daily" 
    ON public.study_time_daily 
    FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own study daily" ON public.study_time_daily;
CREATE POLICY "Users can insert own study daily" 
    ON public.study_time_daily 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own study daily" ON public.study_time_daily;
CREATE POLICY "Users can update own study daily" 
    ON public.study_time_daily 
    FOR UPDATE 
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own study daily" ON public.study_time_daily;
CREATE POLICY "Users can delete own study daily" 
    ON public.study_time_daily 
    FOR DELETE 
    USING (auth.uid() = user_id OR public.is_admin());

-- 5. Realtime Publication for Live Dashboard Sync
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication 
        WHERE pubname = 'supabase_realtime'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.study_time_daily;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
