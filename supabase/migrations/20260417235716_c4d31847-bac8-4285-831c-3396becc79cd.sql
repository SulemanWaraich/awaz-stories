-- Add onboarding fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_categories integer[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;