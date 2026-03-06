-- Drop the old parameterized is_premium(uuid) that allows subscription enumeration
DROP FUNCTION IF EXISTS public.is_premium(uuid);