-- Add provider_id column to services table
ALTER TABLE public.services 
ADD COLUMN provider_id text REFERENCES public.users(id);

-- Update RLS policies for services
-- Allow providers to update their own services
CREATE POLICY "Providers can update own services" 
ON public.services 
FOR UPDATE 
USING (auth.uid()::text = provider_id);

-- Allow providers to insert their own services
CREATE POLICY "Providers can insert own services" 
ON public.services 
FOR INSERT 
WITH CHECK (auth.uid()::text = provider_id);
