-- 1. Create contributors table
CREATE TABLE IF NOT EXISTS public.contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    last_lat DOUBLE PRECISION,
    last_lng DOUBLE PRECISION,
    total_submissions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add contributor-related columns to leads table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE column_name = 'contributor_id' AND table_name = 'leads') THEN
        ALTER TABLE public.leads ADD COLUMN contributor_id UUID REFERENCES public.contributors(id);
        ALTER TABLE public.leads ADD COLUMN contributor_lat DOUBLE PRECISION;
        ALTER TABLE public.leads ADD COLUMN contributor_lng DOUBLE PRECISION;
        ALTER TABLE public.leads ADD COLUMN is_anonymous BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Everyone can see contributors (for leaderboard)
DROP POLICY IF EXISTS "Contributors are viewable by everyone" ON public.contributors;
CREATE POLICY "Contributors are viewable by everyone" 
ON public.contributors FOR SELECT USING (true);

-- Users can manage their own contributor record
DROP POLICY IF EXISTS "Users can update their own contributor profile" ON public.contributors;
CREATE POLICY "Users can update their own contributor profile" 
ON public.contributors FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert contributors" ON public.contributors;
CREATE POLICY "System can insert contributors" 
ON public.contributors FOR INSERT WITH CHECK (true);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_contributors_updated_at ON public.contributors;
CREATE TRIGGER update_contributors_updated_at
    BEFORE UPDATE ON public.contributors
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 6. Trigger to increment total_submissions when a lead is added
CREATE OR REPLACE FUNCTION increment_contributor_submissions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.contributor_id IS NOT NULL THEN
        UPDATE public.contributors 
        SET total_submissions = total_submissions + 1,
            last_lat = NEW.contributor_lat,
            last_lng = NEW.contributor_lng,
            updated_at = NOW()
        WHERE id = NEW.contributor_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS on_lead_submitted ON public.leads;
CREATE TRIGGER on_lead_submitted
    AFTER INSERT ON public.leads
    FOR EACH ROW
    EXECUTE PROCEDURE increment_contributor_submissions();
