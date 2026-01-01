import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Ingredient, MealWithIngredients, MealIngredient, calculateMealTotals } from '@/types/meal';
import { MealFormData } from '@/components/stats/MealForm';

export const useMeals = (date: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meals, setMeals] = useState<MealWithIngredients[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchMeals = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch meals for the date
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('id, meal_name, time_consumed, notes, meal_date')
        .eq('user_id', user.id)
        .eq('meal_date', date)
        .order('time_consumed', { ascending: true });

      if (mealsError) throw mealsError;

      if (!mealsData || mealsData.length === 0) {
        setMeals([]);
        return;
      }

      // Fetch ingredients for all meals
      const mealIds = mealsData.map(m => m.id);
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('meal_ingredients')
        .select('*')
        .in('meal_id', mealIds);

      if (ingredientsError) throw ingredientsError;

      // Map ingredients to meals and calculate totals
      const mealsWithIngredients: MealWithIngredients[] = mealsData.map(meal => {
        const mealIngredients = (ingredientsData || []).filter(
          ing => ing.meal_id === meal.id
        ) as MealIngredient[];

        const totals = mealIngredients.reduce(
          (acc, ing) => ({
            total_weight: acc.total_weight + Number(ing.grams),
            total_protein: acc.total_protein + Number(ing.protein_total || 0),
            total_carbs: acc.total_carbs + Number(ing.carbs_total || 0),
            total_fats: acc.total_fats + Number(ing.fats_total || 0),
            total_fiber: acc.total_fiber + Number(ing.fiber_total || 0),
            total_calories: acc.total_calories + Number(ing.calories_total || 0),
          }),
          { total_weight: 0, total_protein: 0, total_carbs: 0, total_fats: 0, total_fiber: 0, total_calories: 0 }
        );

        return {
          ...meal,
          ingredients: mealIngredients,
          ...totals,
        };
      });

      setMeals(mealsWithIngredients);
    } catch (error: any) {
      console.error('Error fetching meals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load meals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, date, toast]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const addMeal = async (mealData: MealFormData) => {
    if (!user) return false;

    setAdding(true);
    try {
      // Calculate totals from ingredients
      const totals = calculateMealTotals(mealData.ingredients);

      // Insert meal
      const { data: mealResult, error: mealError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          meal_date: date,
          meal_name: mealData.meal_name,
          time_consumed: mealData.time_consumed || null,
          notes: mealData.notes || null,
          total_weight_grams: totals.total_weight,
          calories: totals.total_calories,
          protein_grams: totals.total_protein,
          carbs_grams: totals.total_carbs,
          fats_grams: totals.total_fats,
          fiber_grams: totals.total_fiber,
        })
        .select('id')
        .single();

      if (mealError) throw mealError;

      // Insert ingredients
      const ingredientsToInsert = mealData.ingredients.map(ing => ({
        meal_id: mealResult.id,
        ingredient_name: ing.ingredient_name,
        grams: ing.grams,
        protein_per_100g: ing.protein_per_100g,
        carbs_per_100g: ing.carbs_per_100g,
        fats_per_100g: ing.fats_per_100g,
        fiber_per_100g: ing.fiber_per_100g,
        is_ai_estimated: ing.is_ai_estimated,
      }));

      const { error: ingredientsError } = await supabase
        .from('meal_ingredients')
        .insert(ingredientsToInsert);

      if (ingredientsError) throw ingredientsError;

      toast({
        title: 'Meal Added',
        description: `${mealData.meal_name} with ${mealData.ingredients.length} ingredients logged`,
      });

      await fetchMeals();
      return true;
    } catch (error: any) {
      console.error('Error adding meal:', error);
      toast({
        title: 'Error',
        description: 'Failed to add meal',
        variant: 'destructive',
      });
      return false;
    } finally {
      setAdding(false);
    }
  };

  const deleteMeal = async (mealId: string) => {
    if (!user) return;

    try {
      // meal_ingredients will be deleted automatically via CASCADE
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Meal Deleted',
        description: 'Meal and all ingredients removed',
      });

      setMeals(prev => prev.filter(m => m.id !== mealId));
    } catch (error: any) {
      console.error('Error deleting meal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete meal',
        variant: 'destructive',
      });
    }
  };

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.total_calories,
      protein: acc.protein + meal.total_protein,
      carbs: acc.carbs + meal.total_carbs,
      fats: acc.fats + meal.total_fats,
      fiber: acc.fiber + meal.total_fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );

  return {
    meals,
    loading,
    adding,
    addMeal,
    deleteMeal,
    totals,
  };
};
