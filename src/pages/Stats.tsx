import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords } from 'lucide-react';

const Stats: React.FC = () => {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const weight = profile?.current_weight_kg || 70;
  const maintenance = Math.round(weight * 30);
  const cutCalories = Math.round(maintenance * 0.8);
  const protein = Math.round(weight * 2);
  const water = Math.round(weight * 0.035 * 1000);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground glow-text-cyan mb-8">Daily Stats</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card glow><CardHeader><CardTitle className="text-sm">Maintenance</CardTitle></CardHeader><CardContent><p className="text-3xl font-display text-primary">{maintenance}</p><p className="text-xs text-muted-foreground">kcal/day</p></CardContent></Card>
          <Card glow><CardHeader><CardTitle className="text-sm">Cut Calories</CardTitle></CardHeader><CardContent><p className="text-3xl font-display text-accent">{cutCalories}</p><p className="text-xs text-muted-foreground">kcal/day</p></CardContent></Card>
          <Card glow><CardHeader><CardTitle className="text-sm">Protein Target</CardTitle></CardHeader><CardContent><p className="text-3xl font-display text-success">{protein}g</p><p className="text-xs text-muted-foreground">per day</p></CardContent></Card>
          <Card glow><CardHeader><CardTitle className="text-sm">Water Target</CardTitle></CardHeader><CardContent><p className="text-3xl font-display text-glow-blue">{water}ml</p><p className="text-xs text-muted-foreground">per day</p></CardContent></Card>
        </div>
        <div className="mt-8 text-center text-muted-foreground"><Swords className="h-12 w-12 mx-auto mb-2 text-primary/30" /><p>Meal tracking coming soon</p></div>
      </div>
    </Layout>
  );
};

export default Stats;
