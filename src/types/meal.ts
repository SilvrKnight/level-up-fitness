export interface Ingredient {
  id: string;
  ingredient_name: string;
  grams: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  is_ai_estimated: boolean;
}

export interface IngredientTotals {
  protein_total: number;
  carbs_total: number;
  fats_total: number;
  fiber_total: number;
  calories_total: number;
}

export interface MealWithIngredients {
  id: string;
  meal_name: string;
  time_consumed: string | null;
  notes: string | null;
  meal_date: string;
  ingredients: MealIngredient[];
  total_weight: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_fiber: number;
}

export interface MealIngredient {
  id: string;
  meal_id: string;
  ingredient_name: string;
  grams: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  protein_total: number;
  carbs_total: number;
  fats_total: number;
  fiber_total: number;
  calories_total: number;
  is_ai_estimated: boolean;
}

export function calculateIngredientTotals(ingredient: Omit<Ingredient, 'id'>): IngredientTotals {
  const { grams, protein_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g } = ingredient;
  
  const protein_total = (grams * protein_per_100g) / 100;
  const carbs_total = (grams * carbs_per_100g) / 100;
  const fats_total = (grams * fats_per_100g) / 100;
  const fiber_total = (grams * fiber_per_100g) / 100;
  const calories_total = (protein_total * 4) + (carbs_total * 4) + (fats_total * 9);

  return {
    protein_total: Math.round(protein_total * 10) / 10,
    carbs_total: Math.round(carbs_total * 10) / 10,
    fats_total: Math.round(fats_total * 10) / 10,
    fiber_total: Math.round(fiber_total * 10) / 10,
    calories_total: Math.round(calories_total),
  };
}

export function calculateMealTotals(ingredients: Ingredient[]): {
  total_weight: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_fiber: number;
  total_calories: number;
} {
  return ingredients.reduce(
    (acc, ing) => {
      const totals = calculateIngredientTotals(ing);
      return {
        total_weight: acc.total_weight + ing.grams,
        total_protein: acc.total_protein + totals.protein_total,
        total_carbs: acc.total_carbs + totals.carbs_total,
        total_fats: acc.total_fats + totals.fats_total,
        total_fiber: acc.total_fiber + totals.fiber_total,
        total_calories: acc.total_calories + totals.calories_total,
      };
    },
    { total_weight: 0, total_protein: 0, total_carbs: 0, total_fats: 0, total_fiber: 0, total_calories: 0 }
  );
}
