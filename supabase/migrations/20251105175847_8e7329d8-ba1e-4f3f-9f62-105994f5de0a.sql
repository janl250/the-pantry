-- Fix parameter shadowing by dropping and recreating function
DROP FUNCTION IF EXISTS public.join_group_by_code(text);

CREATE OR REPLACE FUNCTION public.join_group_by_code(p_invite_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id uuid;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
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

GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO authenticated;