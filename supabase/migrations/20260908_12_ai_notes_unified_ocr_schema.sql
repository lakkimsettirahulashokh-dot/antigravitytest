-- ==============================================================================
-- BTechPath AI OS - Migration 12: Unified AI Notes & OCR Document Intelligence
-- Unifies Single/Bulk PDF Ingestion, Multi-Tier OCR Pipeline & Master Notes
-- ==============================================================================

-- 1. Ensure pdf_documents has OCR and page-level metadata columns
ALTER TABLE public.pdf_documents 
    ADD COLUMN IF NOT EXISTS extraction_method TEXT DEFAULT 'native',
    ADD COLUMN IF NOT EXISTS ocr_status TEXT DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS page_data JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS text_density NUMERIC DEFAULT 0;

-- 2. Ensure ai_notes supports all 26 academic sections and Master Notes synthesis
ALTER TABLE public.ai_notes
    ADD COLUMN IF NOT EXISTS is_master_note BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS master_note_sources JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS topic_notes JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS practical_applications JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS formula_explanations JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS diagram_descriptions JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS comparisons JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS mcqs JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS takeaways JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS source_references JSONB DEFAULT '[]'::jsonb;

-- 3. Additional Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_pdf_docs_ocr ON public.pdf_documents(ocr_status);
CREATE INDEX IF NOT EXISTS idx_ai_notes_master ON public.ai_notes(is_master_note);

-- 4. Storage Bucket Security: Ensure pdf_documents bucket exists and is private
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'pdf_documents',
            'pdf_documents',
            false,
            36700160, -- 35MB
            ARRAY['application/pdf', 'text/plain']
        )
        ON CONFLICT (id) DO UPDATE SET
            public = false,
            file_size_limit = 36700160;
    END IF;
END $$;
