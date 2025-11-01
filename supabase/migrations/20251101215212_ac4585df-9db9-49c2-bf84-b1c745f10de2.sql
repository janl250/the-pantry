-- Add foreign key from group_members to profiles so Supabase recognizes the relationship
ALTER TABLE public.group_members
ADD CONSTRAINT fk_group_members_profiles
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;