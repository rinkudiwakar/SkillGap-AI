-- Run this in Supabase SQL Editor to persist the complete analysis payload.
-- It is safe to run more than once.

ALTER TABLE public.match_results
    ADD COLUMN IF NOT EXISTS skill_gap_report JSONB,
    ADD COLUMN IF NOT EXISTS granular_scores JSONB,
    ADD COLUMN IF NOT EXISTS recommended_roles JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS summary TEXT,
    ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS weaknesses TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS rewritten_bullets JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS score_factors JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS resume_completeness_score FLOAT,
    ADD COLUMN IF NOT EXISTS raw_result JSONB;
