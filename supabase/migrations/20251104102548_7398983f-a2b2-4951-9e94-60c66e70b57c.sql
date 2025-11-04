-- Create dish_ratings table for rating system
CREATE TABLE IF NOT EXISTS public.dish_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dish_id TEXT NOT NULL,
  is_user_dish BOOLEAN NOT NULL DEFAULT false,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, dish_id)
);

-- Enable RLS
ALTER TABLE public.dish_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dish_ratings
CREATE POLICY "Users can view all ratings"
  ON public.dish_ratings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own ratings"
  ON public.dish_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.dish_ratings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.dish_ratings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_dish_ratings_updated_at
  BEFORE UPDATE ON public.dish_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.dish_ratings;

-- Add leftover columns to meal_plans
ALTER TABLE public.meal_plans 
  ADD COLUMN IF NOT EXISTS is_leftover BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS leftover_of_dish TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.meal_plans.is_leftover IS 'Indicates if this meal is leftovers from another dish';
COMMENT ON COLUMN public.meal_plans.leftover_of_dish IS 'Name of the original dish that this leftover comes from';