-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Block manual profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Block profile deletion" ON public.profiles;
DROP POLICY IF EXISTS "Require authentication for profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;

-- Create a single, strict SELECT policy that only allows users to see their own profile
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a strict UPDATE policy
CREATE POLICY "Users can only update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Explicitly deny INSERT and DELETE for all users (system handles this via triggers)
CREATE POLICY "Deny manual profile insert"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "Deny manual profile delete"
ON public.profiles
FOR DELETE
TO public
USING (false);