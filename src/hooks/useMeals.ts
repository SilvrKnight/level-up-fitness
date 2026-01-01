import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Meal {
  id: string;
  meal_name: string;
  ingredients: string | null;
  total_weight_grams: number | null;
  time_consumed: string | null;
  calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fats_grams: number | null;
  fiber_grams: number | null;
  meal_date: string;
}

interface MealInput {
  meal_name: string;
  ingredients: string;
  total_weight_grams: number;
  time_consumed: string;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  fiber_grams: number;
}

export const useMeals = (date: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchMeals = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .eq('meal_date', date)
        .order('time_consumed', { ascending: true });

      if (error) throw error;
      setMeals(data || []);
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

  const addMeal = async (mealData: MealInput) => {
    if (!user) return;

    setAdding(true);
    try {
      const { error } = await supabase.from('meals').insert({
        user_id: user.id,
        meal_date: date,
        meal_name: mealData.meal_name,
        ingredients: mealData.ingredients || null,
        total_weight_grams: mealData.total_weight_grams || null,
        time_consumed: mealData.time_consumed || null,
        calories: mealData.calories || 0,
        protein_grams: mealData.protein_grams || 0,
        carbs_grams: mealData.carbs_grams || 0,
        fats_grams: mealData.fats_grams || 0,
        fiber_grams: mealData.fiber_grams || 0,
      });

      if (error) throw error;

      toast({
        title: 'Meal Added',
        description: `${mealData.meal_name} has been logged`,
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
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Meal Deleted',
        description: 'Meal has been removed',
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
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein_grams || 0),
      carbs: acc.carbs + (meal.carbs_grams || 0),
      fats: acc.fats + (meal.fats_grams || 0),
      fiber: acc.fiber + (meal.fiber_grams || 0),
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
