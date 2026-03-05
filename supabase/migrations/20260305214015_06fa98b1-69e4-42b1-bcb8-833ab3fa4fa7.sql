-- Fix 1: Drop parameterized is_premium to prevent subscription enumeration
DROP FUNCTION IF EXISTS public.is_premium(uuid);

-- Create parameterless version using auth.uid()
CREATE OR REPLACE FUNCTION public.is_premium()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > now())
  )
$$;

-- Fix 2: Enforce dish limit (10 for free users) at RLS level
DROP POLICY IF EXISTS "Users can create their own dishes" ON public.user_dishes;
CREATE POLICY "Users can create their own dishes"
ON public.user_dishes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.is_premium()
    OR (SELECT count(*) FROM public.user_dishes WHERE user_id = auth.uid()) < 10
  )
);

-- Fix 3: Enforce group membership limit (3 for free users) in groups INSERT
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
CREATE POLICY "Users can create groups"
ON public.groups
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND (
    (SELECT count(*) FROM public.groups g
     WHERE g.created_by = auth.uid()
       AND g.created_at > (now() - interval '1 hour')) < 5
  )
  AND (
    public.is_premium()
    OR (SELECT count(*) FROM public.group_members WHERE user_id = auth.uid()) < 3
  )
);

-- Fix 4: Add group membership limit to join_group_by_code RPC
CREATE OR REPLACE FUNCTION public.join_group_by_code(p_invite_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id uuid;
  v_uid uuid := auth.uid();
  v_member_count int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Check group membership limit for non-premium users
  IF NOT public.is_premium() THEN
    SELECT count(*) INTO v_member_count
    FROM public.group_members
    WHERE user_id = v_uid;
    
    IF v_member_count >= 3 THEN
      RETURN jsonb_build_object('status', 'limit_reached');
    END IF;
  END IF;

  SELECT g.id INTO v_group_id
  FROM public.groups g
  WHERE g.invite_code = UPPER(TRIM(p_invite_code))
  LIMIT 1;

  IF v_group_id IS NULL THEN
    RETURN jsonb_build_object('status','not_found');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = v_group_id AND gm.user_id = v_uid
  ) THEN
    RETURN jsonb_build_object('status','already_member', 'group_id', v_group_id);
  END IF;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_uid, 'member');

  RETURN jsonb_build_object('status','joined', 'group_id', v_group_id);
END;
$$;