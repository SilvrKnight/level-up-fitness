import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { JournalEntryForm } from '@/components/journal/JournalEntryForm';
import { JournalEntryList } from '@/components/journal/JournalEntryList';
import { cn } from '@/lib/utils';

const Journal: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');
  const [listKey, setListKey] = useState(0);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const handleEntrySaved = () => {
    setListKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        {/* Subtle tab switcher - floating above the paper */}
        <div className="max-w-3xl mx-auto px-4 mb-4">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setActiveTab('entry')}
              className={cn(
                "px-4 py-1.5 text-sm rounded-full transition-all",
                activeTab === 'entry'
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-4 py-1.5 text-sm rounded-full transition-all",
                activeTab === 'history'
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              History
            </button>
          </div>
        </div>

        {activeTab === 'entry' ? (
          <JournalEntryForm onSaved={handleEntrySaved} />
        ) : (
          <JournalEntryList key={listKey} />
        )}
      </div>
    </Layout>
  );
};

export default Journal;
