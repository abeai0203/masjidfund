-- Migration: Implement RBAC for Admin Dashboard

-- 1. Add role column to contributors
ALTER TABLE public.contributors 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Set 'narapidana@gmail.com' as Super Admin
-- This updates existing records and ensures future syncs (via triggers or logic) 
-- can be handled, but for now we target the specific email.
UPDATE public.contributors
SET role = 'admin'
WHERE email = 'narapidana@gmail.com';

-- 3. (Optional) Logic to handle automatic admin assignment if record doesn't exist yet
-- We can add a policy or check in the syncContributor code, but SQL is faster for static admins.
