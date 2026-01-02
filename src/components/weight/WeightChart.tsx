import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { generateChartData, type WeightLog } from '@/utils/weightTrendCalculations';
import { format, parseISO, startOfWeek, isMonday } from 'date-fns';

interface WeightChartProps {
  logs: WeightLog[];
  daysToShow?: number;
}

const chartConfig = {
  weight: {
    label: 'Daily Weight',
    color: 'hsl(var(--muted-foreground))',
  },
  rollingAvg: {
    label: '7-Day Average',
    color: 'hsl(var(--primary))',
  },
};

export const WeightChart: React.FC<WeightChartProps> = ({
  logs,
  daysToShow = 30,
}) => {
  const chartData = useMemo(() => {
    const data = generateChartData(logs, daysToShow);
    return data.map((d) => ({
      ...d,
      dateLabel: format(parseISO(d.date), 'MMM d'),
      isMonday: isMonday(parseISO(d.date)),
    }));
  }, [logs, daysToShow]);

  // Find min/max for Y axis with padding
  const weights = chartData
    .flatMap((d) => [d.weight, d.rollingAvg])
    .filter((v): v is number => v !== null);

  if (weights.length === 0) {
    return (
      <Card glow>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Weight Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Start logging weight to see trends
          </p>
        </CardContent>
      </Card>
    );
  }

  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);

  // Find new week starts for reference lines
  const weekStarts = chartData
    .filter((d) => d.isMonday)
    .map((d) => d.dateLabel);

  return (
    <Card glow>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Weight Trend</span>
          <div className="flex items-center gap-4 text-xs font-normal">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
              <span className="text-muted-foreground">Daily</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">7-Day Avg</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minWeight, maxWeight]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}`}
              width={35}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  formatter={(value, name) => {
                    if (value === null) return null;
                    const label = name === 'weight' ? 'Daily' : '7-Day Avg';
                    return (
                      <span>
                        {label}: <strong>{Number(value).toFixed(1)} kg</strong>
                      </span>
                    );
                  }}
                />
              }
            />
            {/* Week start reference lines */}
            {weekStarts.map((weekStart) => (
              <ReferenceLine
                key={weekStart}
                x={weekStart}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
                opacity={0.5}
              />
            ))}
            {/* Daily weight - secondary, dotted */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              strokeOpacity={0.5}
              dot={{
                fill: 'hsl(var(--muted-foreground))',
                strokeWidth: 0,
                r: 2,
              }}
              activeDot={{
                fill: 'hsl(var(--foreground))',
                strokeWidth: 0,
                r: 4,
              }}
              connectNulls={false}
            />
            {/* Rolling average - primary, bold */}
            <Line
              type="monotone"
              dataKey="rollingAvg"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
                r: 5,
              }}
              connectNulls={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
