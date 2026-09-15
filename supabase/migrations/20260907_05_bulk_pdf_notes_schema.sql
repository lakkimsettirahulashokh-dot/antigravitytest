-- ==============================================================================
-- BTechPath AI OS - Migration 05: Bulk PDF Upload & AI Detailed Notes Schema
-- Multi-Document Ingestion, Structured Note Decomposition & Master Synthesis
-- ==============================================================================

-- 1. Create bulk_pdf_batches table
CREATE TABLE IF NOT EXISTS public.bulk_pdf_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'partially_failed', 'failed')),
    total_files INTEGER NOT NULL DEFAULT 0,
    completed_files INTEGER NOT NULL DEFAULT 0,
    failed_files INTEGER NOT NULL DEFAULT 0,
    master_notes JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create bulk_pdf_documents table
CREATE TABLE IF NOT EXISTS public.bulk_pdf_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.bulk_pdf_batches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT,
    file_size BIGINT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'application/pdf',
    processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'extracting', 'analyzing', 'completed', 'failed')),
    page_count INTEGER NOT NULL DEFAULT 0,
    extracted_text TEXT,
    detected_structure JSONB DEFAULT '{}'::jsonb,
    processing_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create bulk_pdf_notes table
CREATE TABLE IF NOT EXISTS public.bulk_pdf_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.bulk_pdf_batches(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.bulk_pdf_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT,
    main_points JSONB DEFAULT '[]'::jsonb,
    detailed_notes JSONB DEFAULT '[]'::jsonb,
    definitions JSONB DEFAULT '[]'::jsonb,
    formulas JSONB DEFAULT '[]'::jsonb,
    examples JSONB DEFAULT '[]'::jsonb,
    key_concepts JSONB DEFAULT '[]'::jsonb,
    exam_focus JSONB DEFAULT '[]'::jsonb,
    important_questions JSONB DEFAULT '[]'::jsonb,
    practice_questions JSONB DEFAULT '[]'::jsonb,
    quick_revision JSONB DEFAULT '[]'::jsonb,
    one_minute_revision JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. High performance indexes
CREATE INDEX IF NOT EXISTS idx_bulk_batches_user ON public.bulk_pdf_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_batches_status ON public.bulk_pdf_batches(status);
CREATE INDEX IF NOT EXISTS idx_bulk_docs_batch ON public.bulk_pdf_documents(batch_id);
CREATE INDEX IF NOT EXISTS idx_bulk_docs_user ON public.bulk_pdf_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_notes_batch ON public.bulk_pdf_notes(batch_id);
CREATE INDEX IF NOT EXISTS idx_bulk_notes_doc ON public.bulk_pdf_notes(document_id);
CREATE INDEX IF NOT EXISTS idx_bulk_notes_user ON public.bulk_pdf_notes(user_id);

-- 5. Row Level Security (RLS)
ALTER TABLE public.bulk_pdf_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_pdf_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_pdf_notes ENABLE ROW LEVEL SECURITY;

-- Batches RLS
DROP POLICY IF EXISTS "Users can view their own batches" ON public.bulk_pdf_batches;
CREATE POLICY "Users can view their own batches"
    ON public.bulk_pdf_batches FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own batches" ON public.bulk_pdf_batches;
CREATE POLICY "Users can create their own batches"
    ON public.bulk_pdf_batches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own batches" ON public.bulk_pdf_batches;
CREATE POLICY "Users can update their own batches"
    ON public.bulk_pdf_batches FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own batches" ON public.bulk_pdf_batches;
CREATE POLICY "Users can delete their own batches"
    ON public.bulk_pdf_batches FOR DELETE
    USING (auth.uid() = user_id);

-- Documents RLS
DROP POLICY IF EXISTS "Users can view their own documents" ON public.bulk_pdf_documents;
CREATE POLICY "Users can view their own documents"
    ON public.bulk_pdf_documents FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own documents" ON public.bulk_pdf_documents;
CREATE POLICY "Users can create their own documents"
    ON public.bulk_pdf_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own documents" ON public.bulk_pdf_documents;
CREATE POLICY "Users can update their own documents"
    ON public.bulk_pdf_documents FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own documents" ON public.bulk_pdf_documents;
CREATE POLICY "Users can delete their own documents"
    ON public.bulk_pdf_documents FOR DELETE
    USING (auth.uid() = user_id);

-- Notes RLS
DROP POLICY IF EXISTS "Users can view their own notes" ON public.bulk_pdf_notes;
CREATE POLICY "Users can view their own notes"
    ON public.bulk_pdf_notes FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own notes" ON public.bulk_pdf_notes;
CREATE POLICY "Users can create their own notes"
    ON public.bulk_pdf_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notes" ON public.bulk_pdf_notes;
CREATE POLICY "Users can update their own notes"
    ON public.bulk_pdf_notes FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.bulk_pdf_notes;
CREATE POLICY "Users can delete their own notes"
    ON public.bulk_pdf_notes FOR DELETE
    USING (auth.uid() = user_id);

-- Service role bypass for server administrative tasks
DROP POLICY IF EXISTS "Service role full access on batches" ON public.bulk_pdf_batches;
CREATE POLICY "Service role full access on batches"
    ON public.bulk_pdf_batches FOR ALL
    TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on documents" ON public.bulk_pdf_documents;
CREATE POLICY "Service role full access on documents"
    ON public.bulk_pdf_documents FOR ALL
    TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on notes" ON public.bulk_pdf_notes;
CREATE POLICY "Service role full access on notes"
    ON public.bulk_pdf_notes FOR ALL
    TO service_role USING (true) WITH CHECK (true);
