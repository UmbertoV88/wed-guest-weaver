-- DROP existing permissive policies that may be too lenient
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create RESTRICTIVE policies that explicitly require authentication
-- RESTRICTIVE policies use AND logic - ALL must be satisfied

-- Policy 1: Require authentication for any access
CREATE POLICY "Require authentication for profiles access"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Policy 2: Users can only see their own profile data
CREATE POLICY "Users can view own profile only"
ON public.profiles 
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Users can only update their own profile
CREATE POLICY "Users can update own profile only"
ON public.profiles
FOR UPDATE  
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Block all INSERT/DELETE operations for regular users
-- (Only system triggers should insert/delete profiles)
CREATE POLICY "Block manual profile creation"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "Block profile deletion"
ON public.profiles  
FOR DELETE
TO public
USING (false);