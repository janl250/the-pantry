-- Create enum for group roles
CREATE TYPE public.group_role AS ENUM ('creator', 'member');

-- Create groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.group_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Add group_id and added_by to meal_plans
ALTER TABLE public.meal_plans 
ADD COLUMN group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
ADD COLUMN added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Users can view groups they are members of"
ON public.groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups"
ON public.groups FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
ON public.groups FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'creator'
  )
);

CREATE POLICY "Group creators can delete their groups"
ON public.groups FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'creator'
  )
);

-- RLS Policies for group_members
CREATE POLICY "Users can view members of their groups"
ON public.group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join groups"
ON public.group_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group creators can update member roles"
ON public.group_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.role = 'creator'
  )
);

CREATE POLICY "Users can leave groups"
ON public.group_members FOR DELETE
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.role = 'creator'
  )
);

-- Update meal_plans RLS policies to include group access
DROP POLICY IF EXISTS "Users can view their own meal plans" ON public.meal_plans;
CREATE POLICY "Users can view their meal plans and group meal plans"
ON public.meal_plans FOR SELECT
USING (
  auth.uid() = user_id OR
  (group_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = meal_plans.group_id
    AND group_members.user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Users can create their own meal plans" ON public.meal_plans;
CREATE POLICY "Users can create meal plans for themselves and their groups"
ON public.meal_plans FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    group_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = meal_plans.group_id
      AND group_members.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can update their own meal plans" ON public.meal_plans;
CREATE POLICY "Users can update meal plans they have access to"
ON public.meal_plans FOR UPDATE
USING (
  auth.uid() = user_id OR
  (group_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = meal_plans.group_id
    AND group_members.user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Users can delete their own meal plans" ON public.meal_plans;
CREATE POLICY "Users can delete meal plans they have access to"
ON public.meal_plans FOR DELETE
USING (
  auth.uid() = user_id OR
  (group_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = meal_plans.group_id
    AND group_members.user_id = auth.uid()
  ))
);

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.groups WHERE invite_code = code) INTO exists_code;
    
    -- Exit loop if code is unique
    IF NOT exists_code THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Enable realtime for groups and group_members
ALTER TABLE public.groups REPLICA IDENTITY FULL;
ALTER TABLE public.group_members REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;