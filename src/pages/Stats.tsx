import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MealForm, MealFormData } from '@/components/stats/MealForm';
import { MealCard } from '@/components/stats/MealCard';
import { MacroProgress } from '@/components/stats/MacroProgress';
import { useMeals } from '@/hooks/useMeals';
import { Plus, Utensils, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Stats: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [showMealForm, setShowMealForm] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const { meals, loading: mealsLoading, adding, addMeal, deleteMeal, totals } = useMeals(today);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const weight = profile?.current_weight_kg || 70;
  const maintenance = Math.round(weight * 30);
  const cutCalories = Math.round(maintenance * 0.8);
  const protein = Math.round(weight * 2);
  const water = Math.round(weight * 0.035 * 1000);

  // Calculate macro targets based on calorie goal
  const targetCalories = profile?.target_goal === 'cut' ? cutCalories : maintenance;
  const targetProtein = protein;
  const targetCarbs = Math.round((targetCalories * 0.4) / 4); // 40% from carbs
  const targetFats = Math.round((targetCalories * 0.25) / 9); // 25% from fats
  const targetFiber = 30; // Standard recommendation

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
          <Card glow>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display text-primary">{maintenance}</p>
              <p className="text-xs text-muted-foreground">kcal/day</p>
            </CardContent>
          </Card>
          <Card glow>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cut Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display text-accent">{cutCalories}</p>
              <p className="text-xs text-muted-foreground">kcal/day</p>
            </CardContent>
          </Card>
          <Card glow>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Protein Target</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display text-success">{protein}g</p>
              <p className="text-xs text-muted-foreground">per day</p>
            </CardContent>
          </Card>
          <Card glow>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Water Target</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display text-glow-blue">{water}ml</p>
              <p className="text-xs text-muted-foreground">per day</p>
            </CardContent>
          </Card>
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

          {/* Macro Progress Sidebar */}
          <div>
            <MacroProgress
              consumed={totals}
              targets={{
                calories: targetCalories,
                protein: targetProtein,
                carbs: targetCarbs,
                fats: targetFats,
                fiber: targetFiber,
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Stats;
