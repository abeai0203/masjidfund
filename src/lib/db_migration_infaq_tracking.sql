-- Migration: Add Infaq Tracking to Contributors

-- 1. Add tracking columns to contributors table
ALTER TABLE public.contributors 
ADD COLUMN IF NOT EXISTS total_infaq_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_infaq_amount NUMERIC DEFAULT 0;

-- 2. Add contributor_id to donations table
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS contributor_id UUID REFERENCES public.contributors(id);

-- 3. Create function to update contributor stats on donation
CREATE OR REPLACE FUNCTION public.update_contributor_on_donation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.contributor_id IS NOT NULL THEN
        UPDATE public.contributors
        SET total_infaq_count = total_infaq_count + 1,
            total_infaq_amount = total_infaq_amount + NEW.total_amount,
            updated_at = NOW()
        WHERE id = NEW.contributor_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger on donations table
DROP TRIGGER IF EXISTS tr_on_donation_logged ON public.donations;
CREATE TRIGGER tr_on_donation_logged
AFTER INSERT ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_contributor_on_donation();
