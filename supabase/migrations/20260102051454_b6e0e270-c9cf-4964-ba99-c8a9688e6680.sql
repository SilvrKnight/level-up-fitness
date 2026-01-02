-- Add body composition and protein calculation fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS body_fat_percentage numeric,
ADD COLUMN IF NOT EXISTS body_fat_source text DEFAULT 'estimated',
ADD COLUMN IF NOT EXISTS waist_cm numeric,
ADD COLUMN IF NOT EXISTS lean_body_mass numeric,
ADD COLUMN IF NOT EXISTS protein_basis text DEFAULT 'BW',
ADD COLUMN IF NOT EXISTS protein_multiplier numeric DEFAULT 1.8;

-- Add check constraint for body_fat_source
ALTER TABLE public.user_profiles
ADD CONSTRAINT valid_body_fat_source CHECK (body_fat_source IN ('user', 'estimated', 'AI'));

-- Add check constraint for protein_basis
ALTER TABLE public.user_profiles
ADD CONSTRAINT valid_protein_basis CHECK (protein_basis IN ('LBM', 'BW'));