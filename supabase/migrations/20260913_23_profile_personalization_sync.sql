-- Migration: Add missing profile personalization columns
-- Date: 2026-09-13
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS degree TEXT DEFAULT 'B.Tech',
  ADD COLUMN IF NOT EXISTS university TEXT DEFAULT 'AICTE',
  ADD COLUMN IF NOT EXISTS regulation TEXT DEFAULT 'R22 / R23',
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'English';
