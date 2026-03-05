
-- Fix 1: Replace get_dish_ratings to use auth.uid() instead of parameter
CREATE OR REPLACE FUNCTION public.get_dish_ratings()
RETURNS TABLE(dish_id text, avg_rating numeric, rating_count bigint, user_rating integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    dr.dish_id,
    ROUND(AVG(dr.rating)::numeric, 2) AS avg_rating,
    COUNT(*) AS rating_count,
    MAX(CASE WHEN dr.user_id = auth.uid() THEN dr.rating END) AS user_rating
  FROM public.dish_ratings dr
  GROUP BY dr.dish_id
$$;

-- Fix 2: Add CASCADE DELETE FK on meal_plans.group_id
ALTER TABLE public.meal_plans
  DROP CONSTRAINT IF EXISTS meal_plans_group_id_fkey;

ALTER TABLE public.meal_plans
  ADD CONSTRAINT meal_plans_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;

-- Fix 3: Rate limit group creation (max 5 per hour per user)
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;

CREATE POLICY "Users can create groups"
  ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    (SELECT COUNT(*) FROM public.groups
     WHERE created_by = auth.uid()
     AND created_at > now() - interval '1 hour') < 5
  );
