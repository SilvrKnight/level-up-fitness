import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, Flame, Beef, Wheat, Droplets, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { MealWithIngredients } from '@/types/meal';

interface MealCardProps {
  meal: MealWithIngredients;
  onDelete: (id: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const hasAiIngredients = meal.ingredients.some(ing => ing.is_ai_estimated);

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-heading font-semibold text-foreground truncate">
                {meal.meal_name}
              </h4>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(meal.time_consumed)}
              </span>
              {hasAiIngredients && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">
                  <Sparkles className="h-3 w-3" />
                </span>
              )}
            </div>
            
            {meal.notes && (
              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                {meal.notes}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-accent" />
                <span className="text-accent font-medium">{Math.round(meal.total_calories)}</span>
                <span className="text-muted-foreground">kcal</span>
              </div>
              <div className="flex items-center gap-1">
                <Beef className="h-3 w-3 text-success" />
                <span className="text-success font-medium">{Math.round(meal.total_protein)}g</span>
                <span className="text-muted-foreground">protein</span>
              </div>
              <div className="flex items-center gap-1">
                <Wheat className="h-3 w-3 text-warning" />
                <span className="text-warning font-medium">{Math.round(meal.total_carbs)}g</span>
                <span className="text-muted-foreground">carbs</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3 text-glow-blue" />
                <span className="text-glow-blue font-medium">{Math.round(meal.total_fats)}g</span>
                <span className="text-muted-foreground">fats</span>
              </div>
            </div>

            {/* Expandable ingredients */}
            {meal.ingredients.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
                  <span className="text-muted-foreground/60">• {Math.round(meal.total_weight)}g total</span>
                </button>
                
                {expanded && (
                  <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-border/50">
                    {meal.ingredients.map((ing) => (
                      <div key={ing.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground">{ing.ingredient_name}</span>
                          <span className="text-muted-foreground">({ing.grams}g)</span>
                          {ing.is_ai_estimated && (
                            <Sparkles className="h-3 w-3 text-primary/60" />
                          )}
                        </div>
                        <div className="flex gap-2 text-muted-foreground">
                          <span className="text-success">{Math.round(Number(ing.protein_total))}P</span>
                          <span className="text-warning">{Math.round(Number(ing.carbs_total))}C</span>
                          <span className="text-glow-blue">{Math.round(Number(ing.fats_total))}F</span>
                          <span className="text-accent">{Math.round(Number(ing.calories_total))}kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(meal.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
