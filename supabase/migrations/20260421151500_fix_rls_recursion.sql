-- Fix for infinite recursion in Supabase RLS
-- The previous policy tried to check the profiles table inside a policy ON the profiles table

-- We completely drop the recursive policy on profiles.
-- By keeping ONLY "Users can read own profile", the other policies will safely resolve 
-- without entering an infinite loop!

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
