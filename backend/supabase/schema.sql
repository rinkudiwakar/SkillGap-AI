-- SkillGap AI Supabase Schema
-- PostgreSQL schema for SkillGap AI backend

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth, but we add extra fields)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE,
    full_name TEXT,
    profile_picture_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uploaded resumes
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    s3_key TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_size_bytes INT,
    extraction_confidence FLOAT,
    extracted_text TEXT,
    raw_sections JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, filename)
);

-- Match results
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    jd_text TEXT NOT NULL,
    jd_source_url TEXT,
    jd_role TEXT,
    jd_seniority_level TEXT,
    jd_years_required INT,
    
    -- Scores
    cosine_similarity FLOAT NOT NULL,
    match_score FLOAT NOT NULL,
    hiring_probability INT NOT NULL,
    
    -- Component scores
    skill_match_score FLOAT,
    project_relevance_score FLOAT,
    experience_relevance_score FLOAT,
    
    -- Skills analysis
    matched_skills TEXT[] DEFAULT '{}',
    missing_skills TEXT[] DEFAULT '{}',
    critical_missing TEXT[] DEFAULT '{}',
    important_missing TEXT[] DEFAULT '{}',
    nice_to_have_missing TEXT[] DEFAULT '{}',
    skill_coverage_percentage FLOAT,
    skill_gap_report JSONB,
    granular_scores JSONB,
    
    -- Recommendations
    alt_job_titles TEXT[] DEFAULT '{}',
    recommended_roles JSONB DEFAULT '[]'::jsonb,
    
    -- Generated content
    summary TEXT,
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    roadmap TEXT,
    rewritten_bullets JSONB DEFAULT '[]'::jsonb,
    resume_suggestions TEXT,
    learning_resources TEXT,
    interview_questions TEXT,
    score_factors JSONB DEFAULT '{}'::jsonb,
    resume_completeness_score FLOAT,
    raw_result JSONB,
    
    -- Metadata
    processing_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application tracker (for users to track their applications)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    match_result_id UUID REFERENCES public.match_results(id) ON DELETE SET NULL,
    
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    url TEXT,
    
    applied_date DATE,
    status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn')),
    
    match_score FLOAT,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match history (for trend analysis)
CREATE TABLE IF NOT EXISTS public.match_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    match_result_id UUID NOT NULL REFERENCES public.match_results(id) ON DELETE CASCADE,
    
    snapshot_match_score FLOAT,
    snapshot_hiring_probability INT,
    snapshot_timestamp TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON public.resumes(created_at);

CREATE INDEX IF NOT EXISTS idx_match_results_user_id ON public.match_results(user_id);
CREATE INDEX IF NOT EXISTS idx_match_results_resume_id ON public.match_results(resume_id);
CREATE INDEX IF NOT EXISTS idx_match_results_created_at ON public.match_results(created_at);
CREATE INDEX IF NOT EXISTS idx_match_results_hiring_prob ON public.match_results(hiring_probability);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON public.applications(applied_date);

CREATE INDEX IF NOT EXISTS idx_match_history_user_id ON public.match_history(user_id);
CREATE INDEX IF NOT EXISTS idx_match_history_timestamp ON public.match_history(snapshot_timestamp);

-- RLS Policies (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;

-- User can only see their own data
CREATE POLICY "Users can see their own profiles" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profiles" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can see their own resumes" ON public.resumes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can see their own match results" ON public.match_results
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can see their own applications" ON public.applications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can see their own match history" ON public.match_history
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own data
CREATE POLICY "Users can insert their own resumes" ON public.resumes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own match results" ON public.match_results
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own applications" ON public.applications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own match history" ON public.match_history
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own data
CREATE POLICY "Users can update their own applications" ON public.applications
    FOR UPDATE USING (user_id = auth.uid());

-- Comments for documentation
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';
COMMENT ON TABLE public.resumes IS 'Uploaded resume PDFs with metadata';
COMMENT ON TABLE public.match_results IS 'Complete skill gap analysis results';
COMMENT ON TABLE public.applications IS 'Job applications tracker';
COMMENT ON TABLE public.match_history IS 'Historical match score snapshots for trend analysis';

ALTER TABLE public.match_results
    ADD COLUMN IF NOT EXISTS jd_source_url TEXT;

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
