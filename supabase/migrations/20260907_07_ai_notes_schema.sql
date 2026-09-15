-- ==============================================================================
-- BTechPath AI OS - Migration 07: AI Notes Maker & Document Intelligence Schema
-- Authoritative Schema for Single/Multi-PDF Notes, Bookmarks & User Isolation
-- ==============================================================================

-- 1. Create pdf_documents table
CREATE TABLE IF NOT EXISTS public.pdf_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT,
    file_size BIGINT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'application/pdf',
    page_count INTEGER NOT NULL DEFAULT 0,
    extracted_text TEXT,
    detected_structure JSONB DEFAULT '{}'::jsonb,
    is_scanned BOOLEAN NOT NULL DEFAULT false,
    processing_status TEXT NOT NULL DEFAULT 'uploaded' CHECK (
        processing_status IN ('uploaded', 'extracting', 'extracted', 'analyzing', 'generated', 'saved', 'failed')
    ),
    processing_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create ai_notes table (15-Section Academic Schema)
CREATE TABLE IF NOT EXISTS public.ai_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.pdf_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'detailed' CHECK (
        mode IN ('detailed', 'exam', 'simplified', 'quick', 'lastminute')
    ),
    summary TEXT,
    sections JSONB DEFAULT '[]'::jsonb,
    main_points JSONB DEFAULT '[]'::jsonb,
    detailed_explanation JSONB DEFAULT '[]'::jsonb,
    key_concepts JSONB DEFAULT '[]'::jsonb,
    definitions JSONB DEFAULT '[]'::jsonb,
    formulas JSONB DEFAULT '[]'::jsonb,
    examples JSONB DEFAULT '[]'::jsonb,
    applications JSONB DEFAULT '[]'::jsonb,
    common_mistakes JSONB DEFAULT '[]'::jsonb,
    exam_focus JSONB DEFAULT '[]'::jsonb,
    important_questions JSONB DEFAULT '[]'::jsonb,
    practice_questions JSONB DEFAULT '[]'::jsonb,
    quick_revision JSONB DEFAULT '[]'::jsonb,
    one_minute_revision JSONB DEFAULT '[]'::jsonb,
    raw_markdown TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create note_bookmarks table
CREATE TABLE IF NOT EXISTS public.note_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES public.ai_notes(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('note', 'topic', 'question', 'formula', 'definition')),
    item_id TEXT NOT NULL,
    title TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_pdf_docs_user ON public.pdf_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_docs_status ON public.pdf_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_ai_notes_user ON public.ai_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_notes_doc ON public.ai_notes(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_notes_mode ON public.ai_notes(mode);
CREATE INDEX IF NOT EXISTS idx_note_bookmarks_user ON public.note_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_note_bookmarks_note ON public.note_bookmarks(note_id);

-- 5. Row Level Security (RLS)
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_bookmarks ENABLE ROW LEVEL SECURITY;

-- pdf_documents RLS Policies
DROP POLICY IF EXISTS "Users can view their own pdf documents" ON public.pdf_documents;
CREATE POLICY "Users can view their own pdf documents"
    ON public.pdf_documents FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own pdf documents" ON public.pdf_documents;
CREATE POLICY "Users can create their own pdf documents"
    ON public.pdf_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pdf documents" ON public.pdf_documents;
CREATE POLICY "Users can update their own pdf documents"
    ON public.pdf_documents FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own pdf documents" ON public.pdf_documents;
CREATE POLICY "Users can delete their own pdf documents"
    ON public.pdf_documents FOR DELETE
    USING (auth.uid() = user_id);

-- ai_notes RLS Policies
DROP POLICY IF EXISTS "Users can view their own ai notes" ON public.ai_notes;
CREATE POLICY "Users can view their own ai notes"
    ON public.ai_notes FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own ai notes" ON public.ai_notes;
CREATE POLICY "Users can create their own ai notes"
    ON public.ai_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ai notes" ON public.ai_notes;
CREATE POLICY "Users can update their own ai notes"
    ON public.ai_notes FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ai notes" ON public.ai_notes;
CREATE POLICY "Users can delete their own ai notes"
    ON public.ai_notes FOR DELETE
    USING (auth.uid() = user_id);

-- note_bookmarks RLS Policies
DROP POLICY IF EXISTS "Users can view their own note bookmarks" ON public.note_bookmarks;
CREATE POLICY "Users can view their own note bookmarks"
    ON public.note_bookmarks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own note bookmarks" ON public.note_bookmarks;
CREATE POLICY "Users can create their own note bookmarks"
    ON public.note_bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own note bookmarks" ON public.note_bookmarks;
CREATE POLICY "Users can delete their own note bookmarks"
    ON public.note_bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Storage Bucket Configuration (Private PDF Storage)
-- Insert private storage bucket if storage schema exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'pdf_documents',
            'pdf_documents',
            false,
            31457280, -- 30MB Limit
            ARRAY['application/pdf']
        )
        ON CONFLICT (id) DO UPDATE SET
            public = false,
            file_size_limit = 31457280;
    END IF;
END $$;
