import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Beef, Wheat, Droplets, Salad } from 'lucide-react';

interface MacroProgressProps {
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
}

export const MacroProgress: React.FC<MacroProgressProps> = ({ consumed, targets }) => {
  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getRemaining = (current: number, target: number) => {
    const remaining = target - current;
    return remaining > 0 ? remaining : 0;
  };

  const macros = [
    {
      label: 'Calories',
      icon: Flame,
      consumed: consumed.calories,
      target: targets.calories,
      unit: 'kcal',
      colorClass: 'text-accent',
      progressClass: '[&>div]:bg-accent',
    },
    {
      label: 'Protein',
      icon: Beef,
      consumed: consumed.protein,
      target: targets.protein,
      unit: 'g',
      colorClass: 'text-success',
      progressClass: '[&>div]:bg-success',
    },
    {
      label: 'Carbs',
      icon: Wheat,
      consumed: consumed.carbs,
      target: targets.carbs,
      unit: 'g',
      colorClass: 'text-warning',
      progressClass: '[&>div]:bg-warning',
    },
    {
      label: 'Fats',
      icon: Droplets,
      consumed: consumed.fats,
      target: targets.fats,
      unit: 'g',
      colorClass: 'text-glow-blue',
      progressClass: '[&>div]:bg-glow-blue',
    },
    {
      label: 'Fiber',
      icon: Salad,
      consumed: consumed.fiber,
      target: targets.fiber,
      unit: 'g',
      colorClass: 'text-primary',
      progressClass: '[&>div]:bg-primary',
    },
  ];

  return (
    <Card glow>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Daily Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {macros.map((macro) => (
          <div key={macro.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <macro.icon className={`h-4 w-4 ${macro.colorClass}`} />
                <span className="text-foreground">{macro.label}</span>
              </div>
              <div className="text-right">
                <span className={macro.colorClass}>{Math.round(macro.consumed)}</span>
                <span className="text-muted-foreground"> / {macro.target} {macro.unit}</span>
              </div>
            </div>
            <Progress 
              value={calculateProgress(macro.consumed, macro.target)} 
              className={`h-2 ${macro.progressClass}`}
            />
            <p className="text-xs text-muted-foreground text-right">
              {getRemaining(macro.consumed, macro.target)} {macro.unit} remaining
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
