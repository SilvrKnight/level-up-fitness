import React from 'react';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { useAuth } from '@/contexts/AuthContext';
import { WeightInput } from './WeightInput';
import { WeightChart } from './WeightChart';
import { WeeklySummary } from './WeeklySummary';
import { Loader2, Scale } from 'lucide-react';

export const WeightTracker: React.FC = () => {
  const { profile } = useAuth();
  const { logs, loading, adding, addWeight } = useWeightLogs();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentWeight = profile?.current_weight_kg || 70;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Weight Tracking
        </h2>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Weight Input - smaller on large screens */}
        <div className="lg:col-span-1">
          <WeightInput logs={logs} onSubmit={addWeight} loading={adding} />
        </div>

        {/* Weekly Summary */}
        <div className="lg:col-span-1">
          <WeeklySummary logs={logs} currentWeight={currentWeight} />
        </div>

        {/* Chart - spans 2 columns */}
        <div className="lg:col-span-2">
          <WeightChart logs={logs} daysToShow={30} />
        </div>
      </div>
    </div>
  );
};
