import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MealTemplate, IngredientSnapshot } from '@/types/food';
import { Ingredient, calculateMealTotals } from '@/types/meal';
import { useToast } from '@/hooks/use-toast';

export const useMealTemplates = () => {
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('meal_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('usage_count', { ascending: false })
        .order('last_used_at', { ascending: false });

      if (error) throw error;
      
      // Parse JSON snapshots
      const parsed = (data || []).map(t => ({
        ...t,
        ingredients_snapshot: typeof t.ingredients_snapshot === 'string' 
          ? JSON.parse(t.ingredients_snapshot) 
          : t.ingredients_snapshot
      })) as MealTemplate[];
      
      setTemplates(parsed);
    } catch (error) {
      console.error('Error fetching meal templates:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const saveMealAsTemplate = useCallback(async (
    mealName: string,
    ingredients: Ingredient[]
  ) => {
    if (!user) return;

    const totals = calculateMealTotals(ingredients);
    
    // Create snapshot as plain JSON-compatible objects
    const snapshot = ingredients.map(ing => ({
      ingredient_name: ing.ingredient_name,
      grams: ing.grams,
      protein_per_100g: ing.protein_per_100g,
      carbs_per_100g: ing.carbs_per_100g,
      fats_per_100g: ing.fats_per_100g,
      fiber_per_100g: ing.fiber_per_100g,
      source: ing.is_ai_estimated ? 'ai_estimated' : 'curated',
    }));

    // Check if template already exists
    const existing = templates.find(t => 
      t.meal_name.toLowerCase() === mealName.toLowerCase()
    );

    try {
      if (existing) {
        // Update existing template
        const { error } = await supabase
          .from('meal_templates')
          .update({
            ingredients_snapshot: JSON.stringify(snapshot),
            total_calories: totals.total_calories,
            total_protein: totals.total_protein,
            total_carbs: totals.total_carbs,
            total_fats: totals.total_fats,
            total_fiber: totals.total_fiber,
            usage_count: existing.usage_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from('meal_templates')
          .insert([{
            user_id: user.id,
            meal_name: mealName,
            ingredients_snapshot: JSON.stringify(snapshot),
            total_calories: totals.total_calories,
            total_protein: totals.total_protein,
            total_carbs: totals.total_carbs,
            total_fats: totals.total_fats,
            total_fiber: totals.total_fiber,
          }]);

        if (error) throw error;
      }

      await fetchTemplates();
    } catch (error) {
      console.error('Error saving meal template:', error);
    }
  }, [user, templates, fetchTemplates]);

  const toggleFavorite = useCallback(async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      const { error } = await supabase
        .from('meal_templates')
        .update({ is_favorite: !template.is_favorite })
        .eq('id', templateId);

      if (error) throw error;

      await fetchTemplates();
      toast({
        title: template.is_favorite ? 'Removed from favorites' : 'Added to favorites',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [templates, fetchTemplates, toast]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('meal_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  }, [fetchTemplates]);

  const getIngredientsFromTemplate = useCallback((template: MealTemplate): Ingredient[] => {
    return template.ingredients_snapshot.map(snap => ({
      id: crypto.randomUUID(),
      ingredient_name: snap.ingredient_name,
      grams: snap.grams,
      protein_per_100g: snap.protein_per_100g,
      carbs_per_100g: snap.carbs_per_100g,
      fats_per_100g: snap.fats_per_100g,
      fiber_per_100g: snap.fiber_per_100g,
      is_ai_estimated: snap.source === 'ai_estimated',
    }));
  }, []);

  return {
    templates,
    loading,
    saveMealAsTemplate,
    toggleFavorite,
    deleteTemplate,
    getIngredientsFromTemplate,
    refetch: fetchTemplates,
  };
};
