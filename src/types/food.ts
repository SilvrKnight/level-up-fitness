export interface FoodItem {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'mixed';
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  calories_per_100g: number;
  verified: boolean;
  source: 'internal' | 'ai_estimated';
}

export interface MealTemplate {
  id: string;
  user_id: string;
  meal_name: string;
  ingredients_snapshot: IngredientSnapshot[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_fiber: number;
  is_favorite: boolean;
  usage_count: number;
  last_used_at: string;
  created_at: string;
}

export interface IngredientSnapshot {
  ingredient_name: string;
  grams: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  food_item_id?: string;
  source: 'curated' | 'ai_estimated' | 'manual';
}
