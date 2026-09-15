-- ==============================================================================
-- BTechPath AI OS — AI Doubt Solver & Multimodal Image Recognition Schema
-- Migration: 20260908_08_doubt_images_schema.sql
-- ==============================================================================

-- 1. Enhance public.doubts table
ALTER TABLE public.doubts ADD COLUMN IF NOT EXISTS detected_question TEXT;
ALTER TABLE public.doubts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.doubts ADD COLUMN IF NOT EXISTS image_path TEXT;
ALTER TABLE public.doubts ADD COLUMN IF NOT EXISTS structured_answer JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.doubts ADD COLUMN IF NOT EXISTS confidence TEXT DEFAULT 'high';
ALTER TABLE public.doubts ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'conceptual';
ALTER TABLE public.doubts ADD COLUMN IF NOT EXISTS clarity_warning TEXT;
ALTER TABLE public.doubts ADD COLUMN IF NOT EXISTS conversation_id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.doubts ADD COLUMN IF NOT EXISTS parent_doubt_id UUID REFERENCES public.doubts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_doubts_conversation ON public.doubts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_doubts_parent ON public.doubts(parent_doubt_id);

-- 2. Create public.doubt_messages table for conversational follow-ups
CREATE TABLE IF NOT EXISTS public.doubt_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doubt_id UUID NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    structured_data JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doubt_messages_doubt ON public.doubt_messages(doubt_id);
CREATE INDEX IF NOT EXISTS idx_doubt_messages_user ON public.doubt_messages(user_id);

-- Enable RLS
ALTER TABLE public.doubt_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own doubt messages" ON public.doubt_messages;
CREATE POLICY "Users manage own doubt messages" ON public.doubt_messages
    FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 3. Storage Bucket for Doubt Images (Private Supabase Storage)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'doubt-images',
            'doubt-images',
            false,
            10485760, -- 10MB Limit
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif']
        )
        ON CONFLICT (id) DO UPDATE SET
            public = false,
            file_size_limit = 10485760,
            allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
    END IF;
END $$;

-- 4. Storage Policies for doubt-images bucket (Isolated by auth.uid())
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        -- Allow authenticated users to upload to their own user_id folder
        DROP POLICY IF EXISTS "Users can upload own doubt images" ON storage.objects;
        CREATE POLICY "Users can upload own doubt images" ON storage.objects
            FOR INSERT
            TO authenticated
            WITH CHECK (
                bucket_id = 'doubt-images' AND
                (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
            );

        -- Allow users to view their own doubt images
        DROP POLICY IF EXISTS "Users can view own doubt images" ON storage.objects;
        CREATE POLICY "Users can view own doubt images" ON storage.objects
            FOR SELECT
            TO authenticated
            USING (
                bucket_id = 'doubt-images' AND
                (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
            );

        -- Allow users to delete their own doubt images
        DROP POLICY IF EXISTS "Users can delete own doubt images" ON storage.objects;
        CREATE POLICY "Users can delete own doubt images" ON storage.objects
            FOR DELETE
            TO authenticated
            USING (
                bucket_id = 'doubt-images' AND
                (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
            );
    END IF;
END $$;
