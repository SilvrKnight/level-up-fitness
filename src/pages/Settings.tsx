import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground glow-text-cyan mb-8">Settings</h1>
        <Card glow>
          <CardContent className="py-12 text-center">
            <SettingsIcon className="h-12 w-12 mx-auto mb-4 text-primary/30" />
            <p className="text-muted-foreground">Settings coming soon</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
