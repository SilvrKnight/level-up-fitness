import React, { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface PerformanceRadarProps {
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
}

interface RadarDataPoint {
  metric: string;
  score: number;
  actual: number;
  target: number;
  unit: string;
  fullMark: 100;
}

const calculateScore = (actual: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min(Math.round((actual / target) * 100), 100);
};

const getOverallRating = (scores: number[]): { label: string; color: string } => {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const variance = max - min;

  // Check for specific deficiencies
  if (min < 40) {
    const weakIndex = scores.indexOf(min);
    const metrics = ['Calories', 'Protein', 'Carbs', 'Fats', 'Fiber'];
    return { 
      label: `${metrics[weakIndex]}-deficient`, 
      color: 'text-destructive' 
    };
  }

  if (avg >= 90 && variance < 20) {
    return { label: 'Optimal', color: 'text-success' };
  }

  if (avg >= 75 && variance < 30) {
    return { label: 'Balanced', color: 'text-primary' };
  }

  if (variance > 50) {
    return { label: 'Imbalanced', color: 'text-warning' };
  }

  if (avg >= 50) {
    return { label: 'Partial', color: 'text-muted-foreground' };
  }

  return { label: 'Incomplete', color: 'text-destructive/70' };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as RadarDataPoint;
    return (
      <div className="bg-card/95 border border-border/50 px-3 py-2 rounded-sm backdrop-blur-sm">
        <p className="text-sm font-heading text-foreground font-semibold">
          {data.metric}
        </p>
        <p className="text-xs text-muted-foreground">
          {data.actual}{data.unit} / {data.target}{data.unit}
        </p>
        <p className="text-sm font-display text-primary mt-1">
          {data.score}%
        </p>
      </div>
    );
  }
  return null;
};

export const PerformanceRadar: React.FC<PerformanceRadarProps> = ({
  consumed,
  targets,
}) => {
  const { data, scores, hasData } = useMemo(() => {
    const caloriesScore = calculateScore(consumed.calories, targets.calories);
    const proteinScore = calculateScore(consumed.protein, targets.protein);
    const carbsScore = calculateScore(consumed.carbs, targets.carbs);
    const fatsScore = calculateScore(consumed.fats, targets.fats);
    const fiberScore = calculateScore(consumed.fiber, targets.fiber);

    const scores = [caloriesScore, proteinScore, carbsScore, fatsScore, fiberScore];
    const hasData = scores.some(s => s > 0);

    const data: RadarDataPoint[] = [
      {
        metric: 'CAL',
        score: caloriesScore,
        actual: Math.round(consumed.calories),
        target: targets.calories,
        unit: '',
        fullMark: 100,
      },
      {
        metric: 'PRO',
        score: proteinScore,
        actual: Math.round(consumed.protein),
        target: targets.protein,
        unit: 'g',
        fullMark: 100,
      },
      {
        metric: 'CARB',
        score: carbsScore,
        actual: Math.round(consumed.carbs),
        target: targets.carbs,
        unit: 'g',
        fullMark: 100,
      },
      {
        metric: 'FAT',
        score: fatsScore,
        actual: Math.round(consumed.fats),
        target: targets.fats,
        unit: 'g',
        fullMark: 100,
      },
      {
        metric: 'FIB',
        score: fiberScore,
        actual: Math.round(consumed.fiber),
        target: targets.fiber,
        unit: 'g',
        fullMark: 100,
      },
    ];

    return { data, scores, hasData };
  }, [consumed, targets]);

  const rating = useMemo(() => getOverallRating(scores), [scores]);
  const avgScore = useMemo(
    () => Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    [scores]
  );

  return (
    <Card className="bg-[hsl(222,47%,5%)] border-border/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-heading flex items-center gap-2 text-muted-foreground">
          <Target className="h-4 w-4 text-primary" />
          DAILY STATUS
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 border border-border/30 rounded-full flex items-center justify-center">
                <Target className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground/60 font-heading">
                NO DATA LOGGED
              </p>
              <p className="text-xs text-muted-foreground/40 mt-1">
                Log meals to see performance
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-[240px] relative">
              {/* Ideal shape reference (100% on all axes) */}
              <div className="absolute inset-0 opacity-20">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.map(d => ({ ...d, score: 100 }))}>
                    <Radar
                      dataKey="score"
                      stroke="hsl(var(--muted-foreground))"
                      fill="transparent"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Main chart */}
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.4}
                    gridType="polygon"
                  />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 11,
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 600,
                    }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 9,
                    }}
                    tickCount={5}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.25}
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: 'hsl(var(--primary))',
                      strokeWidth: 0,
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Rating footer */}
            <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-heading">
                  Status
                </p>
                <p className={`text-lg font-display font-bold ${rating.color}`}>
                  {rating.label}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-heading">
                  Avg Score
                </p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {avgScore}
                  <span className="text-sm text-muted-foreground">%</span>
                </p>
              </div>
            </div>

            {/* Axis breakdown */}
            <div className="mt-4 grid grid-cols-5 gap-1">
              {data.map((d) => (
                <div
                  key={d.metric}
                  className="text-center py-2 px-1 bg-muted/20 rounded-sm"
                >
                  <p className="text-[10px] text-muted-foreground/60 font-heading">
                    {d.metric}
                  </p>
                  <p
                    className={`text-xs font-display font-bold ${
                      d.score >= 80
                        ? 'text-success'
                        : d.score >= 50
                        ? 'text-primary'
                        : d.score >= 25
                        ? 'text-warning'
                        : 'text-destructive'
                    }`}
                  >
                    {d.score}%
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
