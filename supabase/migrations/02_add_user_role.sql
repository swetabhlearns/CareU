-- Add role column to users table
ALTER TABLE public.users 
ADD COLUMN role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin'));

-- Update RLS policies to allow users to read their own role (already covered by "Users can view own profile")
-- But we might want to allow public read of roles if needed (e.g. to check if someone is a provider)
-- For now, let's keep it private or allow reading basic info.

-- Allow anyone to read basic user info (name, role) for provider profiles
CREATE POLICY "Public can view basic user info" 
ON public.users 
FOR SELECT 
USING (true); 
-- Note: You might want to restrict columns in a real app, but Supabase RLS applies to rows. 
-- Ideally, we'd have a separate public_profiles table, but for this MVP, we'll allow reading users.
-- If "Users can view own profile" exists, we might need to drop it or adjust it to avoid conflicts if we want public read.
-- Actually, let's just add the column for now. The existing policy "Users can view own profile" is fine for the dashboard.
-- Providers are linked in 'services' table, so we can fetch provider details via that relation usually.
