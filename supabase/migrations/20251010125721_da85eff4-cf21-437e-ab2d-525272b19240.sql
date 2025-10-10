-- Create user_dishes table for custom user dishes
CREATE TABLE IF NOT EXISTS public.user_dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  cooking_time text NOT NULL CHECK (cooking_time IN ('quick', 'medium', 'long')),
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine text NOT NULL,
  category text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_dishes
ALTER TABLE public.user_dishes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_dishes
CREATE POLICY "Users can view their own dishes"
  ON public.user_dishes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dishes"
  ON public.user_dishes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dishes"
  ON public.user_dishes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dishes"
  ON public.user_dishes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_user_dishes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_user_dishes_timestamp
  BEFORE UPDATE ON public.user_dishes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_dishes_updated_at();