-- MasjidFund Supabase Schema

-- Ensure we are using UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PROJECTS TABLE
-- ==========================================
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    mosque_name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    project_type TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'Pending',
    publish_status TEXT NOT NULL DEFAULT 'Draft',
    target_amount NUMERIC NOT NULL DEFAULT 0,
    collected_amount NUMERIC NOT NULL DEFAULT 0,
    completion_percent NUMERIC GENERATED ALWAYS AS (
        CASE 
            WHEN target_amount > 0 THEN LEAST((collected_amount / target_amount) * 100, 100)
            ELSE 0 
        END
    ) STORED,
    needs_donation BOOLEAN NOT NULL DEFAULT true,
    donation_method_type TEXT NOT NULL,
    duitnow_qr_url TEXT,
    bank_name TEXT,
    account_name TEXT,
    account_number TEXT,
    image_url TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. LEADS TABLE (Submissions)
-- ==========================================
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_title TEXT NOT NULL,
    raw_summary TEXT NOT NULL,
    extracted_mosque_name TEXT,
    state TEXT,
    source_type TEXT NOT NULL DEFAULT 'Manual Submission',
    source_url TEXT,
    lead_score INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT,
    detected_qr TEXT,
    detected_bank_name TEXT,
    detected_acc_number TEXT,
    detected_acc_name TEXT,
    image_url TEXT,
    detected_project_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ==========================================
-- We will enable RLS to secure our tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Projects Read Policy: Anyone can read "Published" projects
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.projects FOR SELECT 
USING (publish_status = 'Published');

-- Projects Insert Policy: Allow lead conversion
CREATE POLICY "Anyone can insert projects." 
ON public.projects FOR INSERT 
WITH CHECK (true);

-- Projects Update Policy: Allow admin edits and donation updates
CREATE POLICY "Anyone can update projects." 
ON public.projects FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Lead Insert Policy: Anyone can submit a lead (e.g. via the /submit form)
CREATE POLICY "Anyone can submit a lead." 
ON public.leads FOR INSERT 
WITH CHECK (true);

-- Lead Select Policy: Allow admin to view leads
CREATE POLICY "Anyone can view leads." 
ON public.leads FOR SELECT 
USING (true);

-- Lead Update Policy: Allow admin to update lead status
CREATE POLICY "Anyone can update lead status." 
ON public.leads FOR UPDATE 
USING (true)
WITH CHECK (true);

-- (NOTE: For Admin operations like Update/Delete or viewing Drafts, 
-- you will later need to authenticate using Supabase Auth and add policies for 'authenticated' users. 
-- For now, data entry can be done manually via the Supabase Dashboard as a Super Admin.)

-- ==========================================
-- 4. TRIGGERS
-- ==========================================
-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_leads_modtime
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 5. FEEDBACK TABLE
-- ==========================================
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    project_name TEXT,
    message TEXT NOT NULL,
    contact_name TEXT,
    contact_phone TEXT,
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'Unread' -- 'Unread', 'Read', 'Resolved'
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback." 
ON public.feedback FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view feedback." 
ON public.feedback FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update feedback." 
ON public.feedback FOR UPDATE 
USING (true)
WITH CHECK (true);
