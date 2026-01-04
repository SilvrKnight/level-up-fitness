import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FoodItem } from '@/types/food';

export const useFoodItems = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFoods = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setFoods(data as FoodItem[]);
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const searchFoods = useCallback((query: string): FoodItem[] => {
    if (!query.trim()) return foods.slice(0, 10);
    
    const lowerQuery = query.toLowerCase();
    return foods
      .filter(food => food.name.toLowerCase().includes(lowerQuery))
      .slice(0, 15);
  }, [foods]);

  const getFoodByName = useCallback((name: string): FoodItem | undefined => {
    return foods.find(food => 
      food.name.toLowerCase() === name.toLowerCase()
    );
  }, [foods]);

  return {
    foods,
    loading,
    searchFoods,
    getFoodByName,
    refetch: fetchFoods,
  };
};
