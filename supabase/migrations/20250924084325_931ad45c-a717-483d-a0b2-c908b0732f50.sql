-- Add RLS policies for the Users table to fix the security warning
CREATE POLICY "Users can view their own profile" 
ON public."Users" 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can create their own profile" 
ON public."Users" 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" 
ON public."Users" 
FOR UPDATE 
USING (auth.uid()::text = id::text);