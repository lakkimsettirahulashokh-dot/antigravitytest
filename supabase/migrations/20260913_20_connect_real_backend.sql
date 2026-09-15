-- ==============================================================================
-- Migration: 20260913_20_connect_real_backend.sql
-- Description: Core schema additions & RLS security hardening for real backend
-- 1. Fix public.is_admin() to strictly check authorized email rahulashokhlakkimsetty@gmail.com
-- 2. Create user_consents table with RLS
-- 3. Create contact_messages table with RLS
-- 4. Create user_streaks, saved_items, and user_progress tables with RLS
-- 5. Set up storage buckets ('profile-images', 'pdf_documents') and RLS policies
-- ==============================================================================

-- 1. Hardened is_admin() Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND LOWER(email) = 'rahulashokhlakkimsetty@gmail.com'
  );
$$;

-- 2. User Consents Table
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

CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '2026.1';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_version TEXT DEFAULT '2026.1';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_accepted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own consent records" ON public.user_consents;
CREATE POLICY "Users can read own consent records"
    ON public.user_consents FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consent records" ON public.user_consents;
CREATE POLICY "Users can insert own consent records"
    ON public.user_consents FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all consent records" ON public.user_consents;
CREATE POLICY "Admins can view all consent records"
    ON public.user_consents FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to consent records" ON public.user_consents;
CREATE POLICY "Admins have full access to consent records"
    ON public.user_consents FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    category TEXT NOT NULL DEFAULT 'General Question',
    subject TEXT NOT NULL CHECK (char_length(trim(subject)) >= 3),
    message TEXT NOT NULL CHECK (char_length(trim(message)) >= 10 AND char_length(trim(message)) <= 5000),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_category ON public.contact_messages(category);
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON public.contact_messages(user_id);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact message" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact message"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own contact messages" ON public.contact_messages;
CREATE POLICY "Users can view own contact messages"
    ON public.contact_messages FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to contact messages" ON public.contact_messages;
CREATE POLICY "Admins have full access to contact messages"
    ON public.contact_messages FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. User Streaks, Saved Items & User Progress Tables
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own streaks" ON public.user_streaks;
CREATE POLICY "Users can read own streaks"
    ON public.user_streaks FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streaks" ON public.user_streaks;
CREATE POLICY "Users can update own streaks"
    ON public.user_streaks FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    title TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_saved_items_user_type ON public.saved_items(user_id, item_type);
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own saved items" ON public.saved_items;
CREATE POLICY "Users can manage own saved items"
    ON public.saved_items FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    progress_percent NUMERIC(5,2) DEFAULT 0,
    last_studied_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, category, reference_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id, category);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;
CREATE POLICY "Users can manage own progress"
    ON public.user_progress FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Storage Buckets and RLS Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880;
-- Note: storage.objects already has RLS enabled by default in Supabase

DROP POLICY IF EXISTS "Public Profile Images Access" ON storage.objects;
CREATE POLICY "Public Profile Images Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Users Upload Own Profile Image" ON storage.objects;
CREATE POLICY "Users Upload Own Profile Image"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'profile-images' AND
        (auth.uid())::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users Update Own Profile Image" ON storage.objects;
CREATE POLICY "Users Update Own Profile Image"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'profile-images' AND
        (auth.uid())::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'profile-images' AND
        (auth.uid())::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users Delete Own Profile Image" ON storage.objects;
CREATE POLICY "Users Delete Own Profile Image"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'profile-images' AND
        (auth.uid())::text = (storage.foldername(name))[1]
    );

-- Storage Policies for pdf_documents (private bucket)
DROP POLICY IF EXISTS "Users Upload Own PDFs" ON storage.objects;
CREATE POLICY "Users Upload Own PDFs"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'pdf_documents' AND
        ((auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin())
    );

DROP POLICY IF EXISTS "Users Access Own PDFs" ON storage.objects;
CREATE POLICY "Users Access Own PDFs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'pdf_documents' AND
        ((auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin())
    );

DROP POLICY IF EXISTS "Users Delete Own PDFs" ON storage.objects;
CREATE POLICY "Users Delete Own PDFs"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'pdf_documents' AND
        ((auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin())
    );
