import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, Loader2 } from 'lucide-react';
import { hasTodayEntry, getLatestWeight, type WeightLog } from '@/utils/weightTrendCalculations';

interface WeightInputProps {
  logs: WeightLog[];
  onSubmit: (weight: number) => Promise<boolean>;
  loading: boolean;
}

export const WeightInput: React.FC<WeightInputProps> = ({
  logs,
  onSubmit,
  loading,
}) => {
  const todayLogged = hasTodayEntry(logs);
  const latestWeight = getLatestWeight(logs);
  const [weight, setWeight] = useState<string>(
    todayLogged && latestWeight ? latestWeight.toString() : ''
  );
  const [isEditing, setIsEditing] = useState(!todayLogged);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum < 20 || weightNum > 500) return;

    const success = await onSubmit(weightNum);
    if (success) {
      setIsEditing(false);
    }
  };

  const todayEntry = logs.find(
    (log) => log.log_date === new Date().toISOString().split('T')[0]
  );

  return (
    <Card glow className="border-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          Daily Weigh-In
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing && todayEntry ? (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display text-accent">
                {todayEntry.weight_kg}
              </span>
              <span className="text-muted-foreground">kg</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Logged today
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWeight(todayEntry.weight_kg.toString());
                setIsEditing(true);
              }}
              className="w-full"
            >
              Update
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                min="20"
                max="500"
                placeholder={latestWeight ? latestWeight.toString() : '70.0'}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-lg font-mono"
              />
              <span className="flex items-center text-muted-foreground">kg</span>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="glow"
                size="sm"
                disabled={loading || !weight}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : todayLogged ? (
                  'Update'
                ) : (
                  'Log Weight'
                )}
              </Button>
              {isEditing && todayLogged && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
            {latestWeight && !todayLogged && (
              <p className="text-xs text-muted-foreground">
                Last: {latestWeight} kg
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
};
