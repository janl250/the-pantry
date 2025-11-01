-- Fix: allow creators to SELECT their own groups so INSERT ... RETURNING works
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'groups'
      AND policyname = 'Users can view groups they created'
  ) THEN
    CREATE POLICY "Users can view groups they created"
    ON public.groups
    FOR SELECT
    USING (created_by = auth.uid());
  END IF;
END
$$;