-- Create a security definer function to get aggregated ratings + user's own rating
CREATE OR REPLACE FUNCTION public.get_dish_ratings(_user_id uuid)
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
    MAX(CASE WHEN dr.user_id = _user_id THEN dr.rating END) AS user_rating
  FROM public.dish_ratings dr
  GROUP BY dr.dish_id
$$;

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all ratings" ON public.dish_ratings;

-- Create restrictive SELECT policy: users can only see their own ratings
CREATE POLICY "Users can view their own ratings"
  ON public.dish_ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
