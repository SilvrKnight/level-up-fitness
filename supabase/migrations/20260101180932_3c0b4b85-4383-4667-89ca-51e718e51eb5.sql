-- Create meal_ingredients table for atomic ingredient tracking
CREATE TABLE public.meal_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  grams NUMERIC NOT NULL CHECK (grams > 0),
  protein_per_100g NUMERIC NOT NULL DEFAULT 0 CHECK (protein_per_100g >= 0),
  carbs_per_100g NUMERIC NOT NULL DEFAULT 0 CHECK (carbs_per_100g >= 0),
  fats_per_100g NUMERIC NOT NULL DEFAULT 0 CHECK (fats_per_100g >= 0),
  fiber_per_100g NUMERIC NOT NULL DEFAULT 0 CHECK (fiber_per_100g >= 0),
  protein_total NUMERIC GENERATED ALWAYS AS (grams * protein_per_100g / 100) STORED,
  carbs_total NUMERIC GENERATED ALWAYS AS (grams * carbs_per_100g / 100) STORED,
  fats_total NUMERIC GENERATED ALWAYS AS (grams * fats_per_100g / 100) STORED,
  fiber_total NUMERIC GENERATED ALWAYS AS (grams * fiber_per_100g / 100) STORED,
  calories_total NUMERIC GENERATED ALWAYS AS ((grams * protein_per_100g / 100 * 4) + (grams * carbs_per_100g / 100 * 4) + (grams * fats_per_100g / 100 * 9)) STORED,
  is_ai_estimated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on meal_ingredients
ALTER TABLE public.meal_ingredients ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_ingredients (access via meal ownership)
CREATE POLICY "Users can view ingredients of own meals"
ON public.meal_ingredients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.meals
    WHERE meals.id = meal_ingredients.meal_id
    AND meals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert ingredients to own meals"
ON public.meal_ingredients
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meals
    WHERE meals.id = meal_ingredients.meal_id
    AND meals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update ingredients of own meals"
ON public.meal_ingredients
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.meals
    WHERE meals.id = meal_ingredients.meal_id
    AND meals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete ingredients of own meals"
ON public.meal_ingredients
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.meals
    WHERE meals.id = meal_ingredients.meal_id
    AND meals.user_id = auth.uid()
  )
);

-- Add notes column to meals table
ALTER TABLE public.meals ADD COLUMN IF NOT EXISTS notes TEXT;