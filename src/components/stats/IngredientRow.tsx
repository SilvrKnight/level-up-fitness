import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Sparkles, Database, Hash, Scale } from 'lucide-react';
import { Ingredient, calculateIngredientTotals } from '@/types/meal';
import { FoodItem } from '@/types/food';
import { FoodSelector } from './FoodSelector';
import { cn } from '@/lib/utils';

interface IngredientRowProps {
  ingredient: Ingredient;
  onChange: (id: string, field: keyof Ingredient, value: string | number | boolean) => void;
  onFoodSelect: (id: string, food: FoodItem | null, customName?: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const IngredientRow: React.FC<IngredientRowProps> = ({
  ingredient,
  onChange,
  onFoodSelect,
  onRemove,
  canRemove,
}) => {
  const totals = calculateIngredientTotals(ingredient);
  const isCurated = !ingredient.is_ai_estimated && ingredient.protein_per_100g > 0;
  const isUnitBased = ingredient.measurement_type === 'unit_based' && ingredient.grams_per_unit;

  const handleGramsChange = (value: string) => {
    const num = parseFloat(value) || 0;
    onChange(ingredient.id, 'grams', Math.max(0, num));
  };

  const handleUnitChange = (value: string) => {
    const count = parseFloat(value) || 0;
    const gramsPerUnit = ingredient.grams_per_unit || 0;
    const totalGrams = Math.round(count * gramsPerUnit);
    
    // Update both unit_count and grams
    onChange(ingredient.id, 'unit_count', Math.max(0, count));
    onChange(ingredient.id, 'grams', totalGrams);
  };

  // Get display name for units
  const getUnitLabel = () => {
    const name = ingredient.ingredient_name.toLowerCase();
    if (name.includes('egg')) return 'eggs';
    if (name.includes('banana')) return 'pcs';
    if (name.includes('apple')) return 'pcs';
    if (name.includes('bread')) return 'slices';
    return 'units';
  };

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-3">
      <div className="flex items-center gap-2">
        <FoodSelector
          value={ingredient.ingredient_name}
          onSelect={(food, customName) => onFoodSelect(ingredient.id, food, customName)}
        />
        
        {/* Dynamic input based on measurement type */}
        {isUnitBased ? (
          <div className="w-28 flex items-center gap-1">
            <Input
              type="number"
              placeholder="Count"
              min="0"
              step="0.5"
              value={ingredient.unit_count || ''}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="text-center"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {getUnitLabel()}
            </span>
          </div>
        ) : (
          <div className="w-24">
            <Input
              type="number"
              placeholder="Grams"
              min="0"
              value={ingredient.grams || ''}
              onChange={(e) => handleGramsChange(e.target.value)}
              className="text-center"
            />
          </div>
        )}
        
        {/* Measurement type indicator */}
        {isUnitBased && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs">
            <Hash className="h-3 w-3" />
            <span className="hidden sm:inline">{Math.round(ingredient.grams)}g</span>
          </div>
        )}
        
        {/* Source indicator */}
        {isCurated && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-success/10 text-success text-xs">
            <Database className="h-3 w-3" />
            <span className="hidden sm:inline">DB</span>
          </div>
        )}
        {ingredient.is_ai_estimated && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs">
            <Sparkles className="h-3 w-3" />
            <span className="hidden sm:inline">AI</span>
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

      {/* Macro display - read-only for curated foods */}
      <div className="grid grid-cols-4 gap-2">
        <MacroDisplay 
          label="Protein/100g" 
          value={ingredient.protein_per_100g} 
          isCurated={isCurated}
        />
        <MacroDisplay 
          label="Carbs/100g" 
          value={ingredient.carbs_per_100g} 
          isCurated={isCurated}
        />
        <MacroDisplay 
          label="Fats/100g" 
          value={ingredient.fats_per_100g} 
          isCurated={isCurated}
        />
        <MacroDisplay 
          label="Fiber/100g" 
          value={ingredient.fiber_per_100g} 
          isCurated={isCurated}
        />
      </div>

      {/* Derived totals */}
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

interface MacroDisplayProps {
  label: string;
  value: number;
  isCurated: boolean;
}

const MacroDisplay: React.FC<MacroDisplayProps> = ({ label, value, isCurated }) => {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div 
        className={cn(
          "h-8 text-sm rounded-md border px-3 flex items-center",
          isCurated 
            ? "bg-muted/50 border-success/30 text-success" 
            : "bg-muted/30 border-border/50 text-muted-foreground"
        )}
      >
        {value || '-'}
      </div>
    </div>
  );
};
