import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, Flame, Beef, Wheat, Droplets } from 'lucide-react';

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
}

interface MealCardProps {
  meal: Meal;
  onDelete: (id: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onDelete }) => {
  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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
            </div>
            
            {meal.ingredients && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {meal.ingredients}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-accent" />
                <span className="text-accent font-medium">{meal.calories || 0}</span>
                <span className="text-muted-foreground">kcal</span>
              </div>
              <div className="flex items-center gap-1">
                <Beef className="h-3 w-3 text-success" />
                <span className="text-success font-medium">{meal.protein_grams || 0}g</span>
                <span className="text-muted-foreground">protein</span>
              </div>
              <div className="flex items-center gap-1">
                <Wheat className="h-3 w-3 text-warning" />
                <span className="text-warning font-medium">{meal.carbs_grams || 0}g</span>
                <span className="text-muted-foreground">carbs</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3 text-glow-blue" />
                <span className="text-glow-blue font-medium">{meal.fats_grams || 0}g</span>
                <span className="text-muted-foreground">fats</span>
              </div>
            </div>
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
