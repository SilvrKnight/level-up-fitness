import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart } from 'lucide-react';

const Analytics: React.FC = () => {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground glow-text-cyan mb-8">Analytics</h1>
        <Card glow>
          <CardContent className="py-12 text-center">
            <LineChart className="h-12 w-12 mx-auto mb-4 text-primary/30" />
            <p className="text-muted-foreground">Charts coming soon</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;
