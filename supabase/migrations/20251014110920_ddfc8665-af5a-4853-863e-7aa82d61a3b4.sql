-- Ensure INSERT is allowed on groups with correct RLS
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
CREATE POLICY "Users can create groups"
ON public.groups
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Make invite code generation bypass RLS for uniqueness check and set search_path
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists (bypass RLS via SECURITY DEFINER)
    SELECT EXISTS(SELECT 1 FROM public.groups WHERE invite_code = code) INTO exists_code;
    
    -- Exit loop if code is unique
    IF NOT exists_code THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$function$;