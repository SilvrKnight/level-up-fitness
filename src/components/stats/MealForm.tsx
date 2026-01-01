import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

interface MealFormData {
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

interface MealFormProps {
  onSubmit: (data: MealFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const MealForm: React.FC<MealFormProps> = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState<MealFormData>({
    meal_name: '',
    ingredients: '',
    total_weight_grams: 0,
    time_consumed: new Date().toTimeString().slice(0, 5),
    calories: 0,
    protein_grams: 0,
    carbs_grams: 0,
    fats_grams: 0,
    fiber_grams: 0,
  });

  const handleChange = (field: keyof MealFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Auto-calculate calories from macros (rough estimate)
  const calculateCalories = () => {
    const proteinCals = formData.protein_grams * 4;
    const carbsCals = formData.carbs_grams * 4;
    const fatsCals = formData.fats_grams * 9;
    const total = proteinCals + carbsCals + fatsCals;
    handleChange('calories', total);
  };

  return (
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="meal_name">Meal Name</Label>
              <Input
                id="meal_name"
                placeholder="e.g., Chicken Rice Bowl"
                value={formData.meal_name}
                onChange={(e) => handleChange('meal_name', e.target.value)}
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                placeholder="e.g., 200g chicken breast, 150g rice, vegetables..."
                value={formData.ingredients}
                onChange={(e) => handleChange('ingredients', e.target.value)}
                className="min-h-[80px] bg-muted border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_weight">Total Weight (g)</Label>
              <Input
                id="total_weight"
                type="number"
                min="0"
                value={formData.total_weight_grams || ''}
                onChange={(e) => handleChange('total_weight_grams', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_consumed">Time</Label>
              <Input
                id="time_consumed"
                type="time"
                value={formData.time_consumed}
                onChange={(e) => handleChange('time_consumed', e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Macros</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label htmlFor="protein" className="text-xs">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  min="0"
                  value={formData.protein_grams || ''}
                  onChange={(e) => handleChange('protein_grams', Number(e.target.value))}
                  onBlur={calculateCalories}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-xs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  min="0"
                  value={formData.carbs_grams || ''}
                  onChange={(e) => handleChange('carbs_grams', Number(e.target.value))}
                  onBlur={calculateCalories}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fats" className="text-xs">Fats (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  min="0"
                  value={formData.fats_grams || ''}
                  onChange={(e) => handleChange('fats_grams', Number(e.target.value))}
                  onBlur={calculateCalories}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiber" className="text-xs">Fiber (g)</Label>
                <Input
                  id="fiber"
                  type="number"
                  min="0"
                  value={formData.fiber_grams || ''}
                  onChange={(e) => handleChange('fiber_grams', Number(e.target.value))}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories">Calories (auto-calculated or manual)</Label>
            <Input
              id="calories"
              type="number"
              min="0"
              value={formData.calories || ''}
              onChange={(e) => handleChange('calories', Number(e.target.value))}
            />
          </div>

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
  );
};
