/**
 * Weight Trend Calculations
 * All progress evaluations use averages, not single-day values.
 */

export interface WeightLog {
  id: string;
  user_id: string;
  log_date: string;
  weight_kg: number;
  created_at: string | null;
}

export interface DayData {
  date: string;
  weight: number | null;
  rollingAvg: number | null;
}

export interface WeekSummary {
  weekStart: string;
  weekEnd: string;
  average: number | null;
  previousAverage: number | null;
  change: number | null;
  changePercent: number | null;
  status: 'on_track' | 'too_slow' | 'too_fast' | 'stall' | 'insufficient_data';
}

/**
 * Calculate 7-day rolling average for a given date
 */
export function calculateRollingAverage(
  logs: WeightLog[],
  targetDate: string,
  windowDays: number = 7
): number | null {
  const targetTime = new Date(targetDate).getTime();
  const windowStart = targetTime - (windowDays - 1) * 24 * 60 * 60 * 1000;

  const windowLogs = logs.filter((log) => {
    const logTime = new Date(log.log_date).getTime();
    return logTime >= windowStart && logTime <= targetTime;
  });

  if (windowLogs.length < 3) return null; // Need at least 3 data points

  const sum = windowLogs.reduce((acc, log) => acc + log.weight_kg, 0);
  return Math.round((sum / windowLogs.length) * 100) / 100;
}

/**
 * Get week bounds (Monday to Sunday)
 */
export function getWeekBounds(date: Date): { start: Date; end: Date } {
  const dayOfWeek = date.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const start = new Date(date);
  start.setDate(date.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Calculate weekly average
 */
export function calculateWeeklyAverage(
  logs: WeightLog[],
  weekStart: Date,
  weekEnd: Date
): number | null {
  const weekLogs = logs.filter((log) => {
    const logDate = new Date(log.log_date);
    return logDate >= weekStart && logDate <= weekEnd;
  });

  if (weekLogs.length < 3) return null; // Need at least 3 data points for reliability

  const sum = weekLogs.reduce((acc, log) => acc + log.weight_kg, 0);
  return Math.round((sum / weekLogs.length) * 100) / 100;
}

/**
 * Calculate weekly summary with progress status
 */
export function calculateWeeklySummary(
  logs: WeightLog[],
  currentWeight: number
): WeekSummary {
  const today = new Date();
  const { start: thisWeekStart, end: thisWeekEnd } = getWeekBounds(today);
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekEnd);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

  const currentAverage = calculateWeeklyAverage(logs, thisWeekStart, thisWeekEnd);
  const previousAverage = calculateWeeklyAverage(logs, lastWeekStart, lastWeekEnd);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  if (currentAverage === null || previousAverage === null) {
    return {
      weekStart: formatDate(thisWeekStart),
      weekEnd: formatDate(thisWeekEnd),
      average: currentAverage,
      previousAverage,
      change: null,
      changePercent: null,
      status: 'insufficient_data',
    };
  }

  const change = Math.round((currentAverage - previousAverage) * 100) / 100;
  const changePercent = Math.round((change / previousAverage) * 10000) / 100;

  // Determine status based on body weight percentage change
  let status: WeekSummary['status'];
  const absChangePercent = Math.abs(changePercent);

  if (change < 0) {
    // Weight loss
    if (absChangePercent >= 0.5 && absChangePercent <= 1.0) {
      status = 'on_track';
    } else if (absChangePercent < 0.3) {
      status = 'too_slow';
    } else if (absChangePercent > 1.2) {
      status = 'too_fast';
    } else {
      status = 'on_track';
    }
  } else if (change > 0) {
    // Weight gain - for fat loss goal this is concerning
    if (absChangePercent < 0.3) {
      status = 'stall';
    } else {
      status = 'too_slow'; // Gaining when should be losing
    }
  } else {
    status = 'stall';
  }

  return {
    weekStart: formatDate(thisWeekStart),
    weekEnd: formatDate(thisWeekEnd),
    average: currentAverage,
    previousAverage,
    change,
    changePercent,
    status,
  };
}

/**
 * Generate chart data with daily weights and rolling averages
 */
export function generateChartData(
  logs: WeightLog[],
  daysToShow: number = 30
): DayData[] {
  const today = new Date();
  const data: DayData[] = [];

  // Sort logs by date
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
  );

  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayLog = sortedLogs.find((log) => log.log_date === dateStr);
    const rollingAvg = calculateRollingAverage(sortedLogs, dateStr);

    data.push({
      date: dateStr,
      weight: dayLog ? dayLog.weight_kg : null,
      rollingAvg,
    });
  }

  return data;
}

/**
 * Get status label and color
 */
export function getStatusInfo(status: WeekSummary['status']): {
  label: string;
  description: string;
  colorClass: string;
} {
  switch (status) {
    case 'on_track':
      return {
        label: 'On Track',
        description: '0.5-1.0% weekly loss - optimal for fat loss with muscle retention',
        colorClass: 'text-success',
      };
    case 'too_slow':
      return {
        label: 'Too Slow',
        description: '<0.3% weekly change - review calorie tracking accuracy',
        colorClass: 'text-warning',
      };
    case 'too_fast':
      return {
        label: 'Too Fast',
        description: '>1.2% weekly loss - muscle loss risk, consider increasing calories',
        colorClass: 'text-destructive',
      };
    case 'stall':
      return {
        label: 'Stall',
        description: 'No meaningful change detected',
        colorClass: 'text-muted-foreground',
      };
    case 'insufficient_data':
    default:
      return {
        label: 'Collecting Data',
        description: 'Need more weigh-ins for accurate trend analysis',
        colorClass: 'text-muted-foreground',
      };
  }
}

/**
 * Check if today already has a weight entry
 */
export function hasTodayEntry(logs: WeightLog[]): boolean {
  const today = new Date().toISOString().split('T')[0];
  return logs.some((log) => log.log_date === today);
}

/**
 * Get the most recent weight entry
 */
export function getLatestWeight(logs: WeightLog[]): number | null {
  if (logs.length === 0) return null;
  
  const sorted = [...logs].sort(
    (a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
  );
  
  return sorted[0].weight_kg;
}
