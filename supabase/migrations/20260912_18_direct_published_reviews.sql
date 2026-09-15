-- ==============================================================================
-- Migration: 20260912_18_direct_published_reviews.sql
-- Description: Direct review publication (User review = directly published),
--              owner-scoped modification/deletion, and admin management.
-- ==============================================================================

-- 1. Ensure status defaults to 'approved' so submitted reviews appear immediately
ALTER TABLE public.reviews ALTER COLUMN status SET DEFAULT 'approved';

-- 2. Update existing pending reviews to approved so all valid submissions are visible
UPDATE public.reviews SET status = 'approved' WHERE status = 'pending';

-- 3. Drop existing policies cleanly using correct PostgreSQL syntax
DROP POLICY IF EXISTS "Public users can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
DROP POLICY IF EXISTS "Users can edit their own pending review" ON public.reviews;
DROP POLICY IF EXISTS "Admins have full access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can submit a review" ON public.reviews;
DROP POLICY IF EXISTS "Users can edit their own review" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own review" ON public.reviews;

-- 4. Public and authenticated users can view all approved reviews
CREATE POLICY "Public users can view approved reviews"
    ON public.reviews
    FOR SELECT
    USING (status = 'approved');

-- 5. Authenticated users can read their own reviews (regardless of status)
CREATE POLICY "Users can view their own reviews"
    ON public.reviews
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Authenticated users can directly insert their own published review
CREATE POLICY "Authenticated users can submit a review"
    ON public.reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (status = 'approved') AND
        (user_id = auth.uid())
    );

-- 7. Users can update only their own review
CREATE POLICY "Users can edit their own review"
    ON public.reviews
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. Users can delete only their own review
CREATE POLICY "Users can delete their own review"
    ON public.reviews
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 9. Admins have full access to all reviews (moderation, deletion, curation)
CREATE POLICY "Admins have full access to reviews"
    ON public.reviews
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
