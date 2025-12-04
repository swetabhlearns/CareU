-- Drop the old check constraint
ALTER TABLE public.bookings 
DROP CONSTRAINT bookings_status_check;

-- Add the new check constraint including 'in_review'
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'in_review', 'completed', 'cancelled'));
