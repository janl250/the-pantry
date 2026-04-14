
-- Table for per-user dish customizations (overrides for predefined dishes)
CREATE TABLE public.dish_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dish_id TEXT NOT NULL,
  cooking_time TEXT,
  difficulty TEXT,
  cuisine TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, dish_id)
);

ALTER TABLE public.dish_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own overrides" ON public.dish_overrides FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own overrides" ON public.dish_overrides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own overrides" ON public.dish_overrides FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own overrides" ON public.dish_overrides FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_dish_overrides_updated_at
  BEFORE UPDATE ON public.dish_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table for admin-added global dishes visible to all users
CREATE TABLE public.global_dishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  cooking_time TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  category TEXT NOT NULL,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.global_dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view global dishes" ON public.global_dishes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admin can insert global dishes" ON public.global_dishes FOR INSERT TO authenticated WITH CHECK (auth.uid() = 'f0c40ab8-de62-4662-8eb1-45c183b8d502'::uuid);
CREATE POLICY "Only admin can update global dishes" ON public.global_dishes FOR UPDATE TO authenticated USING (auth.uid() = 'f0c40ab8-de62-4662-8eb1-45c183b8d502'::uuid);
CREATE POLICY "Only admin can delete global dishes" ON public.global_dishes FOR DELETE TO authenticated USING (auth.uid() = 'f0c40ab8-de62-4662-8eb1-45c183b8d502'::uuid);

CREATE TRIGGER update_global_dishes_updated_at
  BEFORE UPDATE ON public.global_dishes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
