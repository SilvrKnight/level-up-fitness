import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { JournalEntryForm } from '@/components/journal/JournalEntryForm';
import { JournalEntryList } from '@/components/journal/JournalEntryList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Minimal tab switcher */}
          <div className="max-w-2xl mx-auto mb-6">
            <TabsList className="bg-transparent border-b border-border/30 rounded-none w-full justify-start gap-6 p-0 h-auto">
              <TabsTrigger 
                value="entry" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-2 text-sm"
              >
                Entry
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-2 text-sm"
              >
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="entry" className="mt-0">
            <JournalEntryForm onSaved={handleEntrySaved} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <JournalEntryList key={listKey} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Journal;
