-- Create security definer functions to check group membership without recursion
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_group_creator(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
      AND role = 'creator'
  )
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group creators can update member roles" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view their meal plans and group meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can create meal plans for themselves and their groups" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update meal plans they have access to" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete meal plans they have access to" ON public.meal_plans;

-- Recreate policies using security definer functions to avoid recursion

-- group_members policies
CREATE POLICY "Users can view members of their groups"
ON public.group_members
FOR SELECT
USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Group creators can update member roles"
ON public.group_members
FOR UPDATE
USING (public.is_group_creator(auth.uid(), group_id));

CREATE POLICY "Users can leave groups"
ON public.group_members
FOR DELETE
USING (
  (user_id = auth.uid()) OR 
  public.is_group_creator(auth.uid(), group_id)
);

-- groups policies
CREATE POLICY "Users can view groups they are members of"
ON public.groups
FOR SELECT
USING (public.is_group_member(auth.uid(), id));

CREATE POLICY "Group creators can update their groups"
ON public.groups
FOR UPDATE
USING (public.is_group_creator(auth.uid(), id));

CREATE POLICY "Group creators can delete their groups"
ON public.groups
FOR DELETE
USING (public.is_group_creator(auth.uid(), id));

-- meal_plans policies
CREATE POLICY "Users can view their meal plans and group meal plans"
ON public.meal_plans
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (group_id IS NOT NULL AND public.is_group_member(auth.uid(), group_id))
);

CREATE POLICY "Users can create meal plans for themselves and their groups"
ON public.meal_plans
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) AND 
  (group_id IS NULL OR public.is_group_member(auth.uid(), group_id))
);

CREATE POLICY "Users can update meal plans they have access to"
ON public.meal_plans
FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  (group_id IS NOT NULL AND public.is_group_member(auth.uid(), group_id))
);

CREATE POLICY "Users can delete meal plans they have access to"
ON public.meal_plans
FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (group_id IS NOT NULL AND public.is_group_member(auth.uid(), group_id))
);