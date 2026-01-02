import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MacroExplanation } from '@/utils/nutritionCalculations';
import { Info, Flame, Beef, Droplets, Wheat } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NutritionExplanationProps {
  explanation: MacroExplanation;
}

export const NutritionExplanation: React.FC<NutritionExplanationProps> = ({ explanation }) => {
  const { protein, calories, fats, carbs } = explanation;
  
  const sourceLabel = protein.bodyFatSource === 'user' 
    ? '' 
    : protein.bodyFatSource === 'AI' 
      ? ' (AI estimated)' 
      : ' (estimated)';

  return (
    <Card glow className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Why These Numbers?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Protein Explanation */}
        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-start gap-3">
            <Beef className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-semibold text-success">
                  Protein: {protein.target}g/day
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Based on {protein.basis === 'LBM' ? 'Lean Body Mass' : 'Body Weight'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {protein.basis === 'LBM' ? 'lean mass' : 'body weight'}{sourceLabel}:
              </p>
              <p className="text-sm font-mono text-foreground/80">
                {Math.round(protein.basis === 'LBM' ? protein.lbm : protein.lbm / (1 - protein.bodyFat / 100))}kg × {protein.multiplier.toFixed(1)}g/kg
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                {protein.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Calories Explanation */}
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
          <div className="flex items-start gap-3">
            <Flame className="h-5 w-5 text-accent mt-0.5 shrink-0" />
            <div className="space-y-1 min-w-0">
              <span className="font-heading font-semibold text-accent">
                Calories: {calories.target} kcal/day
              </span>
              <p className="text-sm text-muted-foreground">
                Maintenance: {calories.maintenance} kcal ({calories.method})
              </p>
              <p className="text-xs text-muted-foreground/80">
                {calories.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Fats Explanation */}
        <div className="p-3 rounded-lg bg-glow-blue/5 border border-glow-blue/20">
          <div className="flex items-start gap-3">
            <Droplets className="h-5 w-5 text-glow-blue mt-0.5 shrink-0" />
            <div className="space-y-1 min-w-0">
              <span className="font-heading font-semibold text-glow-blue">
                Fats: {fats.target}g/day
              </span>
              <p className="text-sm text-muted-foreground">
                {fats.multiplier}g × {Math.round(protein.lbm)}kg LBM
              </p>
              <p className="text-xs text-muted-foreground/80">
                {fats.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Carbs Explanation */}
        <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
          <div className="flex items-start gap-3">
            <Wheat className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div className="space-y-1 min-w-0">
              <span className="font-heading font-semibold text-warning">
                Carbs: {carbs.target}g/day
              </span>
              <p className="text-xs text-muted-foreground/80">
                {carbs.reason}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
