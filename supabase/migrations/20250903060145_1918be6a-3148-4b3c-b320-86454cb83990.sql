-- Add additional profile fields for more user information
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT,
ADD COLUMN bio TEXT,
ADD COLUMN location TEXT,
ADD COLUMN interests TEXT;