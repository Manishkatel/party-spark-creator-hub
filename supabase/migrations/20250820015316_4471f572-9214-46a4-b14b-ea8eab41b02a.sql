-- Fix security vulnerability: Restrict profile visibility to own data only
-- Drop the overly permissive policy that allows viewing all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);