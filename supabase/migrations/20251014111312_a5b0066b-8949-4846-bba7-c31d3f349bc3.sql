-- Add database constraints for input validation

-- Add constraints to user_dishes table
ALTER TABLE public.user_dishes
  ADD CONSTRAINT user_dishes_name_length CHECK (char_length(name) > 0 AND char_length(name) <= 100),
  ADD CONSTRAINT user_dishes_cuisine_length CHECK (char_length(cuisine) > 0 AND char_length(cuisine) <= 50),
  ADD CONSTRAINT user_dishes_category_length CHECK (char_length(category) > 0 AND char_length(category) <= 50);

-- Add constraint to groups table
ALTER TABLE public.groups
  ADD CONSTRAINT groups_name_length CHECK (char_length(name) > 0 AND char_length(name) <= 50);

-- Add constraint to meal_plans table
ALTER TABLE public.meal_plans
  ADD CONSTRAINT meal_plans_dish_name_length CHECK (char_length(dish_name) > 0 AND char_length(dish_name) <= 100);

-- Add DELETE policy for Users table (allow users to delete their own profile)
CREATE POLICY "Users can delete their own profile"
ON public."Users"
FOR DELETE
USING ((auth.uid())::text = (id)::text);

-- Fix SECURITY DEFINER trigger function to SECURITY INVOKER
DROP TRIGGER IF EXISTS update_user_dishes_updated_at ON public.user_dishes;

CREATE OR REPLACE FUNCTION public.update_user_dishes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_user_dishes_updated_at
  BEFORE UPDATE ON public.user_dishes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_dishes_updated_at();

-- Add iteration limit to generate_invite_code to prevent infinite loops
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
  max_attempts INTEGER := 100;
  attempt_count INTEGER := 0;
BEGIN
  LOOP
    attempt_count := attempt_count + 1;
    
    -- Prevent infinite loop
    IF attempt_count > max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique invite code after % attempts', max_attempts;
    END IF;
    
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