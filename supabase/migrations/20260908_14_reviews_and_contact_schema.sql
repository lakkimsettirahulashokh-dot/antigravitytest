-- ==============================================================================
-- Migration: 20260908_14_reviews_and_contact_schema.sql
-- Description: Create reviews and contact_messages tables with RLS and constraints
-- ==============================================================================

-- 1. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL CHECK (char_length(review_text) >= 10 AND char_length(review_text) <= 1500),
    feature_used TEXT DEFAULT 'General',
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure columns exist if table was previously created
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'feature_used') THEN
        ALTER TABLE public.reviews ADD COLUMN feature_used TEXT DEFAULT 'General';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'name') THEN
        ALTER TABLE public.reviews ADD COLUMN name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'status') THEN
        ALTER TABLE public.reviews ADD COLUMN status TEXT NOT NULL DEFAULT 'approved';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'is_featured') THEN
        ALTER TABLE public.reviews ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'updated_at') THEN
        ALTER TABLE public.reviews ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- Backfill existing review rows safely
UPDATE public.reviews
SET feature_used = COALESCE(feature_used, branch, 'General'),
    name = COALESCE(name, student_name, author_name, 'Student'),
    updated_at = COALESCE(updated_at, created_at, now()),
    is_featured = COALESCE(is_featured, false)
WHERE feature_used IS NULL OR name IS NULL OR updated_at IS NULL OR is_featured IS NULL;

-- Index for public queries (approved reviews, sorted by date or featured status)
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON public.reviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_feature ON public.reviews(feature_used);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- 2. CONTACT MESSAGES TABLE
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

-- Index for admin dashboard message triage
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_category ON public.contact_messages(category);
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON public.contact_messages(user_id);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR REVIEWS

-- Public users (and students) can read approved reviews only
DROP POLICY IF EXISTS "Public users can view approved reviews" ON public.reviews;
CREATE POLICY "Public users can view approved reviews"
    ON public.reviews
    FOR SELECT
    USING (status = 'approved');

-- Students can read their own reviews (even if pending or rejected)
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
CREATE POLICY "Users can view their own reviews"
    ON public.reviews
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Authenticated and anonymous students can submit reviews (defaults to status = 'approved')
DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a review"
    ON public.reviews
    FOR INSERT
    WITH CHECK (
        (status = 'approved') AND
        (auth.uid() IS NULL OR user_id = auth.uid())
    );

-- Students can update their own review
DROP POLICY IF EXISTS "Users can edit their own pending review" ON public.reviews;
DROP POLICY IF EXISTS "Users can edit their own review" ON public.reviews;
CREATE POLICY "Users can edit their own review"
    ON public.reviews
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Students can delete their own review
DROP POLICY IF EXISTS "Users can delete their own review" ON public.reviews;
CREATE POLICY "Users can delete their own review"
    ON public.reviews
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Admin full access to reviews
DROP POLICY IF EXISTS "Admins have full access to reviews" ON public.reviews;
CREATE POLICY "Admins have full access to reviews"
    ON public.reviews
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. RLS POLICIES FOR CONTACT MESSAGES

-- Authenticated users or anonymous visitors can insert contact messages
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
    ON public.contact_messages
    FOR INSERT
    WITH CHECK (
        (status = 'new') AND
        (auth.uid() IS NULL OR user_id = auth.uid())
    );

-- Students can read their own submitted contact messages only
DROP POLICY IF EXISTS "Users can view their own contact messages" ON public.contact_messages;
CREATE POLICY "Users can view their own contact messages"
    ON public.contact_messages
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Admin has full access to contact messages
DROP POLICY IF EXISTS "Admins have full access to contact messages" ON public.contact_messages;
CREATE POLICY "Admins have full access to contact messages"
    ON public.contact_messages
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
