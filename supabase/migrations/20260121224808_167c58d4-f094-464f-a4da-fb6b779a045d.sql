-- Create meal_attendance table for group members to indicate if they'll be present for meals
CREATE TABLE public.meal_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  day_of_week TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown' CHECK (status IN ('attending', 'not_attending', 'unknown')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id, day_of_week, week_start_date)
);

-- Enable Row Level Security
ALTER TABLE public.meal_attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for group members
CREATE POLICY "Group members can view attendance"
ON public.meal_attendance
FOR SELECT
USING (is_group_member(auth.uid(), group_id));

CREATE POLICY "Users can update their own attendance"
ON public.meal_attendance
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_group_member(auth.uid(), group_id));

CREATE POLICY "Users can update their own attendance status"
ON public.meal_attendance
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attendance"
ON public.meal_attendance
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_meal_attendance_group_week ON public.meal_attendance(group_id, week_start_date);
CREATE INDEX idx_meal_attendance_user ON public.meal_attendance(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_meal_attendance_updated_at
BEFORE UPDATE ON public.meal_attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();