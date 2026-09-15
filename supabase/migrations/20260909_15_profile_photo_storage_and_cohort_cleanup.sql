-- ==============================================================================
-- Migration: 20260909_15_profile_photo_storage_and_cohort_cleanup.sql
-- Description:
--   1. Create and configure Supabase Storage bucket 'profile-images' with strict user ownership RLS.
--   2. Update 'profiles' table to change default tier to 'Engineering Scholar' and migrate any legacy rows.
--   3. Ensure RLS policies guarantee User A cannot overwrite User B's profile images.
-- ==============================================================================

-- 1. Create Supabase Storage Bucket 'profile-images'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Enable RLS on storage.objects if not already enabled (Handled by Supabase platform; table owned by supabase_storage_admin)
-- Note: Do not run 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY' as only table owner supabase_storage_admin can execute DDL on storage.objects.

-- 2. Storage Policies for 'profile-images'

-- Policy: Anyone can view public profile pictures
DROP POLICY IF EXISTS "Public Profile Images Access" ON storage.objects;
CREATE POLICY "Public Profile Images Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Policy: Authenticated users can upload their own profile picture only into their own folder (auth.uid())
DROP POLICY IF EXISTS "Users Upload Own Profile Image" ON storage.objects;
CREATE POLICY "Users Upload Own Profile Image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profile-images' AND
    (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy: Authenticated users can update their own profile picture only
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

-- Policy: Authenticated users can delete their own profile picture only
DROP POLICY IF EXISTS "Users Delete Own Profile Image" ON storage.objects;
CREATE POLICY "Users Delete Own Profile Image"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profile-images' AND
    (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Profiles Table: Ensure tier column exists, update default & clean up legacy values
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'Engineering Scholar';

ALTER TABLE public.profiles 
    ALTER COLUMN tier SET DEFAULT 'Engineering Scholar';

UPDATE public.profiles
SET tier = 'Engineering Scholar'
WHERE tier = 'AI Pro Cohort' OR tier IS NULL;

-- Ensure avatar_url column exists
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;
