import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MealForm, MealFormData } from '@/components/stats/MealForm';
import { MealCard } from '@/components/stats/MealCard';
import { MacroProgress } from '@/components/stats/MacroProgress';
import { NutritionExplanation } from '@/components/stats/NutritionExplanation';
import { PerformanceRadar } from '@/components/stats/PerformanceRadar';
import { WeightTracker } from '@/components/weight/WeightTracker';
import { useMeals } from '@/hooks/useMeals';
import { calculateNutritionTargets, UserStats } from '@/utils/nutritionCalculations';
import { Plus, Utensils, Loader2, Droplets } from 'lucide-react';
import { format } from 'date-fns';

const Stats: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [showMealForm, setShowMealForm] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const { meals, loading: mealsLoading, adding, addMeal, deleteMeal, totals } = useMeals(today);

  // Calculate nutrition targets using the adaptive engine
  const { targets, explanation } = useMemo(() => {
    if (!profile) {
      return {
        targets: { calories: 2000, protein: 140, carbs: 200, fats: 67, fiber: 30, water_ml: 2500 },
        explanation: null
      };
    }

    const userStats: UserStats = {
      age: profile.age || 30,
      gender: (profile.gender as 'male' | 'female' | 'other') || 'male',
      height_cm: profile.height_cm || 170,
      current_weight_kg: profile.current_weight_kg || 70,
      body_fat_percentage: profile.body_fat_percentage,
      body_fat_source: profile.body_fat_source as 'user' | 'estimated' | 'AI',
      waist_cm: profile.waist_cm,
      training_frequency: profile.training_frequency || 3,
      target_goal: (profile.target_goal as 'cut' | 'maintain' | 'lean_bulk') || 'maintain',
    };

    return calculateNutritionTargets(userStats);
  }, [profile]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const handleAddMeal = async (mealData: MealFormData) => {
    const success = await addMeal(mealData);
    if (success) {
      setShowMealForm(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground glow-text-cyan mb-8">
          Daily Stats
        </h1>

        {/* Daily Targets Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card glow className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowExplanation(!showExplanation)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Target Calories
                <span className="text-xs text-muted-foreground">
                  {explanation ? (showExplanation ? '▲' : '▼ Why?') : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display text-accent">{targets.calories}</p>
              <p className="text-xs text-muted-foreground">kcal/day</p>
            </CardContent>
          </Card>
          <Card glow>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display text-foreground/70">{explanation?.calories.maintenance || Math.round(targets.calories * 1.1)}</p>
              <p className="text-xs text-muted-foreground">kcal/day</p>
            </CardContent>
          </Card>
          <Card glow>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Protein Target</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display text-success">{targets.protein}g</p>
              <p className="text-xs text-muted-foreground">
                {explanation?.protein.basis === 'LBM' ? 'based on lean mass' : 'per day'}
              </p>
            </CardContent>
          </Card>
          <Card glow>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1">
                <Droplets className="h-4 w-4 text-glow-blue" />
                Water Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display text-glow-blue">{targets.water_ml}ml</p>
              <p className="text-xs text-muted-foreground">per day</p>
            </CardContent>
          </Card>
        </div>

        {/* Explanation Panel */}
        {showExplanation && explanation && (
          <div className="mb-8 animate-in slide-in-from-top-2 duration-200">
            <NutritionExplanation explanation={explanation} />
          </div>
        )}

        {/* Weight Tracking Section */}
        <div className="mb-8">
          <WeightTracker />
        </div>

        {/* Meal Tracking Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Meals List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                Today's Meals
              </h2>
              {!showMealForm && (
                <Button variant="glow" size="sm" onClick={() => setShowMealForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meal
                </Button>
              )}
            </div>

            {showMealForm && (
              <MealForm
                onSubmit={handleAddMeal}
                onCancel={() => setShowMealForm(false)}
                loading={adding}
              />
            )}

            {mealsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : meals.length === 0 ? (
              <Card className="border-dashed border-border/50">
                <CardContent className="py-12 text-center">
                  <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No meals logged today</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Click "Add Meal" to start tracking
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} onDelete={deleteMeal} />
                ))}
              </div>
            )}
          </div>

          {/* Performance Sidebar */}
          <div className="space-y-6">
            {/* PUBG-style Radar Chart */}
            <PerformanceRadar
              consumed={totals}
              targets={{
                calories: targets.calories,
                protein: targets.protein,
                carbs: targets.carbs,
                fats: targets.fats,
                fiber: targets.fiber,
              }}
            />

            {/* Macro Progress */}
            <MacroProgress
              consumed={totals}
              targets={{
                calories: targets.calories,
                protein: targets.protein,
                carbs: targets.carbs,
                fats: targets.fats,
                fiber: targets.fiber,
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Stats;
