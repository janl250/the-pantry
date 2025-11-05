-- Ensure fast lookup by invite code
create index if not exists groups_invite_code_idx on public.groups (invite_code);

-- Prevent duplicate memberships
create unique index if not exists group_members_unique_idx on public.group_members (group_id, user_id);

-- Secure RPC to join a group by invite code
create or replace function public.join_group_by_code(invite_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_uid uuid := auth.uid();
  v_status text := 'joined';
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select id into v_group_id
  from public.groups
  where invite_code = upper(trim(invite_code))
  limit 1;

  if v_group_id is null then
    return jsonb_build_object('status','not_found');
  end if;

  if exists (
    select 1 from public.group_members gm
    where gm.group_id = v_group_id and gm.user_id = v_uid
  ) then
    return jsonb_build_object('status','already_member', 'group_id', v_group_id);
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, v_uid, 'member');

  return jsonb_build_object('status', v_status, 'group_id', v_group_id);
end;
$$;

-- Allow authenticated users to call the RPC
grant execute on function public.join_group_by_code(text) to authenticated;