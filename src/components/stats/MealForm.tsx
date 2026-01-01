import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { IngredientRow } from './IngredientRow';
import { ApiKeyModal } from './ApiKeyModal';
import { useDeepSeekKey } from '@/hooks/useDeepSeekKey';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Ingredient, calculateMealTotals } from '@/types/meal';

interface MealFormProps {
  onSubmit: (data: MealFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface MealFormData {
  meal_name: string;
  time_consumed: string;
  notes: string;
  ingredients: Ingredient[];
}

const createEmptyIngredient = (): Ingredient => ({
  id: crypto.randomUUID(),
  ingredient_name: '',
  grams: 0,
  protein_per_100g: 0,
  carbs_per_100g: 0,
  fats_per_100g: 0,
  fiber_per_100g: 0,
  is_ai_estimated: false,
});

export const MealForm: React.FC<MealFormProps> = ({ onSubmit, onCancel, loading }) => {
  const { toast } = useToast();
  const { apiKey, setApiKey, hasApiKey } = useDeepSeekKey();
  
  const [mealName, setMealName] = useState('');
  const [timeConsumed, setTimeConsumed] = useState(new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([createEmptyIngredient()]);
  const [pasteText, setPasteText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const handleIngredientChange = (id: string, field: keyof Ingredient, value: string | number | boolean) => {
    setIngredients(prev =>
      prev.map(ing =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  };

  const handleAddIngredient = () => {
    setIngredients(prev => [...prev, createEmptyIngredient()]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const handleParseIngredients = async () => {
    if (!pasteText.trim()) {
      toast({
        title: 'Empty input',
        description: 'Please paste some ingredients to parse',
        variant: 'destructive',
      });
      return;
    }

    if (!hasApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-ingredients', {
        body: { text: pasteText, apiKey },
      });

      if (error) throw error;

      if (data?.ingredients && Array.isArray(data.ingredients)) {
        const parsedIngredients: Ingredient[] = data.ingredients.map((ing: any) => ({
          id: crypto.randomUUID(),
          ingredient_name: ing.ingredient_name,
          grams: ing.grams,
          protein_per_100g: ing.protein_per_100g,
          carbs_per_100g: ing.carbs_per_100g,
          fats_per_100g: ing.fats_per_100g,
          fiber_per_100g: ing.fiber_per_100g,
          is_ai_estimated: true,
        }));

        // Replace empty ingredients or add to existing
        const hasValidIngredients = ingredients.some(ing => ing.ingredient_name.trim());
        if (hasValidIngredients) {
          setIngredients(prev => [...prev, ...parsedIngredients]);
        } else {
          setIngredients(parsedIngredients);
        }
        
        setPasteText('');
        toast({
          title: 'Ingredients parsed',
          description: `Added ${parsedIngredients.length} ingredients from AI`,
        });
      }
    } catch (error: any) {
      console.error('Error parsing ingredients:', error);
      
      if (error.message?.includes('Invalid DeepSeek API key') || error.message?.includes('401')) {
        toast({
          title: 'Invalid API Key',
          description: 'Please check your DeepSeek API key and try again',
          variant: 'destructive',
        });
        setShowApiKeyModal(true);
      } else {
        toast({
          title: 'Parsing failed',
          description: error.message || 'Failed to parse ingredients',
          variant: 'destructive',
        });
      }
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!mealName.trim()) {
      toast({
        title: 'Meal name required',
        description: 'Please enter a meal name',
        variant: 'destructive',
      });
      return;
    }

    const validIngredients = ingredients.filter(
      ing => ing.ingredient_name.trim() && ing.grams > 0
    );

    if (validIngredients.length === 0) {
      toast({
        title: 'Ingredients required',
        description: 'Add at least one ingredient with a name and weight',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      meal_name: mealName,
      time_consumed: timeConsumed,
      notes,
      ingredients: validIngredients,
    });
  };

  const totals = calculateMealTotals(ingredients.filter(ing => ing.grams > 0));

  return (
    <>
      <Card glow className="border-primary/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Add Meal</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Meal Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1 space-y-2">
                <Label htmlFor="meal_name">Meal Name *</Label>
                <Input
                  id="meal_name"
                  placeholder="e.g., Chicken Rice Bowl"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <Label htmlFor="time_consumed">Time Consumed</Label>
                <Input
                  id="time_consumed"
                  type="time"
                  value={timeConsumed}
                  onChange={(e) => setTimeConsumed(e.target.value)}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this meal..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[60px] bg-muted border-border text-foreground"
                />
              </div>
            </div>

            {/* AI Ingredient Parsing */}
            <div className="border border-dashed border-primary/30 rounded-lg p-4 space-y-3 bg-primary/5">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI Ingredient Parser (Optional)
              </div>
              <Textarea
                placeholder="Paste ingredients here, e.g.: 200g chicken breast, 150g cooked rice, 10g olive oil"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="min-h-[60px] bg-background border-border text-foreground"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleParseIngredients}
                disabled={parsing || !pasteText.trim()}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                {parsing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Parse with AI
                  </>
                )}
              </Button>
              {!hasApiKey && (
                <p className="text-xs text-muted-foreground">
                  Requires DeepSeek API key. You'll be prompted on first use.
                </p>
              )}
            </div>

            {/* Ingredients List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Ingredients *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddIngredient}
                  className="text-primary"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Ingredient
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {ingredients.map((ingredient) => (
                  <IngredientRow
                    key={ingredient.id}
                    ingredient={ingredient}
                    onChange={handleIngredientChange}
                    onRemove={handleRemoveIngredient}
                    canRemove={ingredients.length > 1}
                  />
                ))}
              </div>
            </div>

            {/* Meal Totals */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Meal Totals (Auto-calculated)</h4>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Weight</div>
                  <div className="font-semibold">{Math.round(totals.total_weight)}g</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Calories</div>
                  <div className="font-semibold text-accent">{totals.total_calories}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Protein</div>
                  <div className="font-semibold text-success">{Math.round(totals.total_protein)}g</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Carbs</div>
                  <div className="font-semibold text-warning">{Math.round(totals.total_carbs)}g</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Fats</div>
                  <div className="font-semibold text-glow-blue">{Math.round(totals.total_fats)}g</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Fiber</div>
                  <div className="font-semibold">{Math.round(totals.total_fiber)}g</div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="glow" disabled={loading} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Adding...' : 'Add Meal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ApiKeyModal
        open={showApiKeyModal}
        onOpenChange={setShowApiKeyModal}
        onSave={setApiKey}
      />
    </>
  );
};
