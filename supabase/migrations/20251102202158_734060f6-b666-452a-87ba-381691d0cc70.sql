-- Create group_activities table to track what happens in groups
CREATE TABLE public.group_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'dish_added', 'dish_removed', 'member_joined', 'member_removed', etc.
  dish_name TEXT,
  day_of_week TEXT,
  week_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_activities ENABLE ROW LEVEL SECURITY;

-- RLS policy: Group members can view activities
CREATE POLICY "Group members can view activities"
ON public.group_activities
FOR SELECT
USING (is_group_member(auth.uid(), group_id));

-- RLS policy: Group members can insert activities
CREATE POLICY "Group members can insert activities"
ON public.group_activities
FOR INSERT
WITH CHECK (is_group_member(auth.uid(), group_id) AND auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_group_activities_group_id ON public.group_activities(group_id);
CREATE INDEX idx_group_activities_created_at ON public.group_activities(created_at DESC);

-- Add foreign key to link meal_plans to user_dishes for custom dishes
ALTER TABLE public.meal_plans ADD COLUMN user_dish_id UUID REFERENCES public.user_dishes(id) ON DELETE SET NULL;