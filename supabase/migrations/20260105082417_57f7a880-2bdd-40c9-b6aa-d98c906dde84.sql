-- Add measurement_type and grams_per_unit columns to food_items
ALTER TABLE public.food_items 
ADD COLUMN measurement_type TEXT NOT NULL DEFAULT 'weight_based' CHECK (measurement_type IN ('unit_based', 'weight_based', 'hybrid')),
ADD COLUMN grams_per_unit NUMERIC NULL;

-- Update eggs to be unit-based (1 egg = 50g edible portion)
UPDATE public.food_items SET measurement_type = 'unit_based', grams_per_unit = 50 WHERE name = 'Eggs (Whole)';
UPDATE public.food_items SET measurement_type = 'unit_based', grams_per_unit = 33 WHERE name = 'Egg Whites';

-- Update bread slices to be unit-based
UPDATE public.food_items SET measurement_type = 'unit_based', grams_per_unit = 30 WHERE name = 'Bread (White)';
UPDATE public.food_items SET measurement_type = 'unit_based', grams_per_unit = 32 WHERE name = 'Bread (Whole Wheat)';

-- Bananas and apples as unit-based
UPDATE public.food_items SET measurement_type = 'unit_based', grams_per_unit = 120 WHERE name = 'Banana';
UPDATE public.food_items SET measurement_type = 'unit_based', grams_per_unit = 180 WHERE name = 'Apple';

-- Chapati MUST stay weight_based due to size variability (already default)