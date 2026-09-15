-- ==============================================================================
-- Migration: 20260912_19_user_consents.sql
-- Description: Dedicated user consents tracking table with strict RLS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    terms_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    privacy_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    terms_version TEXT NOT NULL DEFAULT '2026.1',
    privacy_version TEXT NOT NULL DEFAULT '2026.1',
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for rapid lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);

-- Ensure profiles table has consent columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '2026.1';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_version TEXT DEFAULT '2026.1';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_accepted_at TIMESTAMPTZ;

-- Enable Row Level Security
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own consent records" ON public.user_consents;
DROP POLICY IF EXISTS "Users can insert own consent records" ON public.user_consents;
DROP POLICY IF EXISTS "Admins can view all consent records" ON public.user_consents;
DROP POLICY IF EXISTS "Admins have full access to consent records" ON public.user_consents;

-- 1. Users can read only their own consent record
CREATE POLICY "Users can read own consent records"
    ON public.user_consents
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 2. Users can insert their own consent record
CREATE POLICY "Users can insert own consent records"
    ON public.user_consents
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 3. Admins have full access for auditing and compliance
CREATE POLICY "Admins have full access to consent records"
    ON public.user_consents
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
