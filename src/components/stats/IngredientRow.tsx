import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Sparkles } from 'lucide-react';
import { Ingredient, calculateIngredientTotals } from '@/types/meal';

interface IngredientRowProps {
  ingredient: Ingredient;
  onChange: (id: string, field: keyof Ingredient, value: string | number | boolean) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const IngredientRow: React.FC<IngredientRowProps> = ({
  ingredient,
  onChange,
  onRemove,
  canRemove,
}) => {
  const totals = calculateIngredientTotals(ingredient);

  const handleNumberChange = (field: keyof Ingredient, value: string) => {
    const num = parseFloat(value) || 0;
    onChange(ingredient.id, field, Math.max(0, num));
  };

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder="Ingredient name"
            value={ingredient.ingredient_name}
            onChange={(e) => onChange(ingredient.id, 'ingredient_name', e.target.value)}
            className="font-medium"
          />
        </div>
        <div className="w-24">
          <Input
            type="number"
            placeholder="Grams"
            min="0"
            value={ingredient.grams || ''}
            onChange={(e) => handleNumberChange('grams', e.target.value)}
            className="text-center"
          />
        </div>
        {ingredient.is_ai_estimated && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs">
            <Sparkles className="h-3 w-3" />
            <span>AI</span>
          </div>
        )}
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(ingredient.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Protein/100g</label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={ingredient.protein_per_100g || ''}
            onChange={(e) => handleNumberChange('protein_per_100g', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Carbs/100g</label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={ingredient.carbs_per_100g || ''}
            onChange={(e) => handleNumberChange('carbs_per_100g', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Fats/100g</label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={ingredient.fats_per_100g || ''}
            onChange={(e) => handleNumberChange('fats_per_100g', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Fiber/100g</label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={ingredient.fiber_per_100g || ''}
            onChange={(e) => handleNumberChange('fiber_per_100g', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 text-xs text-muted-foreground border-t border-border/30 pt-2">
        <span>P: <span className="text-success font-medium">{totals.protein_total}g</span></span>
        <span>C: <span className="text-warning font-medium">{totals.carbs_total}g</span></span>
        <span>F: <span className="text-glow-blue font-medium">{totals.fats_total}g</span></span>
        <span>Fiber: <span className="text-foreground font-medium">{totals.fiber_total}g</span></span>
        <span>Cal: <span className="text-accent font-medium">{totals.calories_total}</span></span>
      </div>
    </div>
  );
};
