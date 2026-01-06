import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { JournalEntryForm } from '@/components/journal/JournalEntryForm';
import { JournalEntryList } from '@/components/journal/JournalEntryList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, History } from 'lucide-react';

const Journal: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('entry');
  const [listKey, setListKey] = useState(0);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const handleEntrySaved = () => {
    // Trigger list refresh
    setListKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-foreground glow-text-cyan mb-8">Journal</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="entry" className="gap-2">
              <FileText className="h-4 w-4" />
              Entry
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="mt-6">
            <JournalEntryForm onSaved={handleEntrySaved} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <JournalEntryList key={listKey} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Journal;
