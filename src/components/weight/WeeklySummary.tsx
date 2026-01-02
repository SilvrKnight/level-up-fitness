import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Minus, AlertTriangle } from 'lucide-react';
import {
  calculateWeeklySummary,
  getStatusInfo,
  type WeightLog,
} from '@/utils/weightTrendCalculations';

interface WeeklySummaryProps {
  logs: WeightLog[];
  currentWeight: number;
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({
  logs,
  currentWeight,
}) => {
  const summary = calculateWeeklySummary(logs, currentWeight);
  const statusInfo = getStatusInfo(summary.status);

  const formatChange = (val: number | null) => {
    if (val === null) return '—';
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}`;
  };

  const formatPercent = (val: number | null) => {
    if (val === null) return '';
    const sign = val > 0 ? '+' : '';
    return `(${sign}${val.toFixed(2)}%)`;
  };

  const TrendIcon = () => {
    if (summary.change === null) return <Minus className="h-5 w-5 text-muted-foreground" />;
    if (summary.change < -0.1) return <TrendingDown className="h-5 w-5 text-success" />;
    if (summary.change > 0.1) return <TrendingUp className="h-5 w-5 text-warning" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Card glow>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Weekly Summary</span>
          <span className={`text-xs font-normal ${statusInfo.colorClass}`}>
            {statusInfo.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Week Average */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">This Week Avg</p>
            <p className="text-2xl font-display text-foreground">
              {summary.average?.toFixed(1) || '—'}
              <span className="text-sm text-muted-foreground ml-1">kg</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Last Week Avg</p>
            <p className="text-2xl font-display text-foreground/70">
              {summary.previousAverage?.toFixed(1) || '—'}
              <span className="text-sm text-muted-foreground ml-1">kg</span>
            </p>
          </div>
        </div>

        {/* Weekly Change */}
        <div className="flex items-center justify-between py-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <TrendIcon />
            <span className="text-sm text-muted-foreground">Weekly Change</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-mono font-semibold">
              {formatChange(summary.change)} kg
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {formatPercent(summary.changePercent)}
            </span>
          </div>
        </div>

        {/* Status Description */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {statusInfo.description}
          </p>
        </div>

        {/* Warning for too fast loss */}
        {summary.status === 'too_fast' && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">
              Rapid weight loss may indicate muscle loss. Consider increasing calories slightly.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
