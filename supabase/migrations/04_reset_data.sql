-- DANGER: This will delete ALL data in your database.
-- Run this in the Supabase SQL Editor to start fresh.

-- Disable triggers temporarily if needed, but TRUNCATE CASCADE handles foreign keys.

TRUNCATE TABLE public.bookings CASCADE;
TRUNCATE TABLE public.services CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- Optional: Reset sequences if you were using serial IDs (you are using UUIDs so this isn't strictly necessary but good practice if you had serials)
-- ALTER SEQUENCE table_name_id_seq RESTART WITH 1;
