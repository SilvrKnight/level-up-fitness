-- Create food_items table for curated food database
CREATE TABLE public.food_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('protein', 'carb', 'fat', 'mixed')),
  protein_per_100g NUMERIC NOT NULL DEFAULT 0,
  carbs_per_100g NUMERIC NOT NULL DEFAULT 0,
  fats_per_100g NUMERIC NOT NULL DEFAULT 0,
  fiber_per_100g NUMERIC NOT NULL DEFAULT 0,
  calories_per_100g NUMERIC NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'internal' CHECK (source IN ('internal', 'ai_estimated')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on food name for quick lookups
CREATE UNIQUE INDEX idx_food_items_name ON public.food_items (LOWER(name));

-- Enable RLS
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read curated foods
CREATE POLICY "Food items are viewable by authenticated users" 
ON public.food_items 
FOR SELECT 
USING (true);

-- Create meal_templates table for meal reuse
CREATE TABLE public.meal_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_name TEXT NOT NULL,
  ingredients_snapshot JSONB NOT NULL,
  total_calories NUMERIC NOT NULL DEFAULT 0,
  total_protein NUMERIC NOT NULL DEFAULT 0,
  total_carbs NUMERIC NOT NULL DEFAULT 0,
  total_fats NUMERIC NOT NULL DEFAULT 0,
  total_fiber NUMERIC NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for quick user lookup and sorting
CREATE INDEX idx_meal_templates_user ON public.meal_templates (user_id, last_used_at DESC);
CREATE INDEX idx_meal_templates_favorites ON public.meal_templates (user_id, is_favorite, usage_count DESC);

-- Enable RLS
ALTER TABLE public.meal_templates ENABLE ROW LEVEL SECURITY;

-- Users can only access their own meal templates
CREATE POLICY "Users can view own meal templates" 
ON public.meal_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal templates" 
ON public.meal_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal templates" 
ON public.meal_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal templates" 
ON public.meal_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add food_item_id to meal_ingredients to link to curated foods
ALTER TABLE public.meal_ingredients 
ADD COLUMN food_item_id UUID REFERENCES public.food_items(id);

-- Add source tracking to meal_ingredients
ALTER TABLE public.meal_ingredients 
ADD COLUMN source TEXT DEFAULT 'manual' CHECK (source IN ('curated', 'ai_estimated', 'manual'));

-- Trigger for updated_at on food_items
CREATE TRIGGER update_food_items_updated_at
BEFORE UPDATE ON public.food_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed curated food database with common foods
-- PROTEINS
INSERT INTO public.food_items (name, category, protein_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g, calories_per_100g, verified, source) VALUES
('Chicken Breast (Raw)', 'protein', 23.1, 0, 1.2, 0, 106, true, 'internal'),
('Chicken Breast (Cooked)', 'protein', 31, 0, 3.6, 0, 165, true, 'internal'),
('Eggs (Whole)', 'protein', 13, 1.1, 11, 0, 155, true, 'internal'),
('Egg Whites', 'protein', 11, 0.7, 0.2, 0, 52, true, 'internal'),
('Paneer', 'protein', 18, 3, 22, 0, 265, true, 'internal'),
('Tofu (Firm)', 'protein', 8, 2, 4.8, 0.3, 76, true, 'internal'),
('Salmon (Cooked)', 'protein', 25, 0, 13, 0, 208, true, 'internal'),
('White Fish (Cooked)', 'protein', 23, 0, 1.5, 0, 105, true, 'internal'),
('Whey Protein Powder', 'protein', 80, 5, 3, 0, 370, true, 'internal'),
('Greek Yogurt', 'protein', 10, 3.6, 0.7, 0, 59, true, 'internal'),
('Curd (Dahi)', 'protein', 3.4, 4.7, 3.3, 0, 61, true, 'internal'),
('Moong Dal (Cooked)', 'protein', 7.5, 19, 0.5, 4, 106, true, 'internal'),
('Toor Dal (Cooked)', 'protein', 7, 21, 0.4, 5, 116, true, 'internal'),
('Chana Dal (Cooked)', 'protein', 8, 22, 1.5, 5, 130, true, 'internal'),
('Chickpeas (Cooked)', 'protein', 8.9, 27, 2.6, 7.6, 164, true, 'internal'),
('Black Beans (Cooked)', 'protein', 8.9, 23, 0.5, 8.7, 132, true, 'internal'),
('Cottage Cheese (Low Fat)', 'protein', 11, 3.4, 4.3, 0, 98, true, 'internal'),

-- CARBS
('Rice (White, Cooked)', 'carb', 2.7, 28, 0.3, 0.4, 130, true, 'internal'),
('Rice (Brown, Cooked)', 'carb', 2.6, 23, 0.9, 1.8, 111, true, 'internal'),
('Rice (White, Raw)', 'carb', 7, 79, 0.6, 1.3, 365, true, 'internal'),
('Roti (Wheat)', 'carb', 8, 45, 3, 4, 240, true, 'internal'),
('Chapati', 'carb', 8, 45, 3, 4, 240, true, 'internal'),
('Oats (Dry)', 'carb', 13, 66, 7, 10.6, 389, true, 'internal'),
('Oats (Cooked)', 'carb', 2.5, 12, 1.5, 1.7, 71, true, 'internal'),
('Bread (White)', 'carb', 9, 49, 3.2, 2.7, 265, true, 'internal'),
('Bread (Whole Wheat)', 'carb', 13, 43, 3.4, 7, 247, true, 'internal'),
('Potato (Boiled)', 'carb', 2, 17, 0.1, 1.8, 77, true, 'internal'),
('Sweet Potato (Boiled)', 'carb', 1.6, 20, 0.1, 3, 86, true, 'internal'),
('Banana', 'carb', 1.1, 23, 0.3, 2.6, 89, true, 'internal'),
('Apple', 'carb', 0.3, 14, 0.2, 2.4, 52, true, 'internal'),
('Orange', 'carb', 0.9, 12, 0.1, 2.4, 47, true, 'internal'),
('Mango', 'carb', 0.8, 15, 0.4, 1.6, 60, true, 'internal'),
('Pasta (Cooked)', 'carb', 5, 25, 0.9, 1.8, 131, true, 'internal'),
('Quinoa (Cooked)', 'carb', 4.4, 21, 1.9, 2.8, 120, true, 'internal'),

-- VEGETABLES
('Broccoli (Cooked)', 'carb', 2.8, 7, 0.4, 3.3, 35, true, 'internal'),
('Spinach (Cooked)', 'carb', 2.9, 3.6, 0.4, 2.4, 23, true, 'internal'),
('Mixed Vegetables (Cooked)', 'carb', 2.5, 8, 0.3, 3, 45, true, 'internal'),
('Cucumber', 'carb', 0.7, 3.6, 0.1, 0.5, 16, true, 'internal'),
('Tomato', 'carb', 0.9, 3.9, 0.2, 1.2, 18, true, 'internal'),
('Onion (Cooked)', 'carb', 1.1, 9, 0.1, 1.4, 44, true, 'internal'),
('Bell Pepper', 'carb', 1, 6, 0.3, 2.1, 31, true, 'internal'),
('Cauliflower (Cooked)', 'carb', 1.8, 4.1, 0.3, 2.3, 23, true, 'internal'),

-- FATS
('Olive Oil', 'fat', 0, 0, 100, 0, 884, true, 'internal'),
('Butter', 'fat', 0.9, 0.1, 81, 0, 717, true, 'internal'),
('Ghee', 'fat', 0, 0, 99.5, 0, 900, true, 'internal'),
('Coconut Oil', 'fat', 0, 0, 100, 0, 862, true, 'internal'),
('Cooking Oil (Generic)', 'fat', 0, 0, 100, 0, 884, true, 'internal'),
('Almonds', 'fat', 21, 22, 49, 12.5, 579, true, 'internal'),
('Peanuts', 'fat', 26, 16, 49, 8.5, 567, true, 'internal'),
('Cashews', 'fat', 18, 30, 44, 3.3, 553, true, 'internal'),
('Walnuts', 'fat', 15, 14, 65, 6.7, 654, true, 'internal'),
('Peanut Butter', 'fat', 25, 20, 50, 6, 588, true, 'internal'),
('Avocado', 'fat', 2, 9, 15, 7, 160, true, 'internal'),
('Cheese (Cheddar)', 'fat', 25, 1.3, 33, 0, 403, true, 'internal'),

-- MIXED
('Milk (Whole)', 'mixed', 3.4, 4.8, 3.9, 0, 64, true, 'internal'),
('Milk (Skim)', 'mixed', 3.4, 5, 0.1, 0, 34, true, 'internal'),
('Soy Milk', 'mixed', 3.3, 6, 1.8, 0.5, 54, true, 'internal'),
('Almond Milk (Unsweetened)', 'mixed', 0.5, 0.3, 1.1, 0, 13, true, 'internal');