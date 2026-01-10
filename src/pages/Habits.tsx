import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addWeeks, 
  subWeeks,
  subDays,
  isSameDay,
  startOfDay,
  isBefore
} from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HabitScorecard from '@/components/habits/HabitScorecard';

const Habits: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<any[]>([]);
  const [habitLogs, setHabitLogs] = useState<any[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);

  const weekDays = useMemo(() => 
    eachDayOfInterval({ 
      start: currentWeekStart, 
      end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }) 
    }),
    [currentWeekStart]
  );

  // Extended days for expanded view (21 days back from today)
  const extendedDays = useMemo(() => {
    const today = new Date();
    const start = subDays(today, 20);
    return eachDayOfInterval({ start, end: today });
  }, []);

  // Fetch range for logs (covers both week view and extended view)
  const fetchStart = useMemo(() => {
    const weekStart = format(currentWeekStart, 'yyyy-MM-dd');
    const extendedStart = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    return weekStart < extendedStart ? weekStart : extendedStart;
  }, [currentWeekStart]);

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchHabitLogs();
    }
  }, [user, fetchStart]);

  const fetchHabits = async () => {
    const { data } = await supabase.from('habits').select('*');
    if (data) setHabits(data);
  };

  const fetchHabitLogs = async () => {
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user!.id)
      .gte('log_date', fetchStart);
    if (data) setHabitLogs(data);
  };

  const toggleHabit = async (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = habitLogs.find(l => l.habit_id === habitId && l.log_date === dateStr);

    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id);
      setHabitLogs(habitLogs.filter(l => l.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ user_id: user!.id, habit_id: habitId, log_date: dateStr, completed: true })
        .select()
        .single();
      if (data) setHabitLogs([...habitLogs, data]);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getCompletedCount = (habitId: string) => {
    return weekDays.filter(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const today = startOfDay(new Date());
      // Only count past days and today
      if (isBefore(today, startOfDay(day))) return false;
      return habitLogs.some(l => l.habit_id === habitId && l.log_date === dateStr);
    }).length;
  };

  const getStreak = (habitId: string) => {
    let streak = 0;
    let currentDate = startOfDay(new Date());
    
    // Check if today is completed, if not start from yesterday
    const todayStr = format(currentDate, 'yyyy-MM-dd');
    const todayCompleted = habitLogs.some(l => l.habit_id === habitId && l.log_date === todayStr);
    if (!todayCompleted) {
      currentDate = subDays(currentDate, 1);
    }
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const completed = habitLogs.some(l => l.habit_id === habitId && l.log_date === dateStr);
      if (!completed) break;
      streak++;
      currentDate = subDays(currentDate, 1);
    }
    
    return streak;
  };

  const getLongestStreak = (habitId: string) => {
    const logs = habitLogs
      .filter(l => l.habit_id === habitId)
      .map(l => l.log_date)
      .sort();
    
    if (logs.length === 0) return 0;
    
    let longest = 1;
    let current = 1;
    
    for (let i = 1; i < logs.length; i++) {
      const prev = new Date(logs[i - 1]);
      const curr = new Date(logs[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }
    
    return longest;
  };

  const getLastBreakDate = (habitId: string) => {
    let currentDate = subDays(startOfDay(new Date()), 1);
    
    for (let i = 0; i < 30; i++) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const completed = habitLogs.some(l => l.habit_id === habitId && l.log_date === dateStr);
      if (!completed) {
        return format(currentDate, 'MMM d');
      }
      currentDate = subDays(currentDate, 1);
    }
    
    return null;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => 
      direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const isCurrentWeek = isSameDay(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return (
    <Layout>
      <div className="min-h-screen bg-[hsl(222,47%,4%)]">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          {/* Page Header */}
          <div className="mb-10">
            <h1 
              className="text-2xl font-medium text-[hsl(210,20%,92%)] tracking-tight"
              style={{ fontFamily: "'Source Serif 4', 'Inter', serif" }}
            >
              Habits
            </h1>
            <p className="text-[13px] text-[hsl(222,15%,40%)] mt-1 tracking-wide">
              Consistency over time
            </p>
          </div>

          {/* Week Selector */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 text-[hsl(222,15%,45%)] hover:text-[hsl(210,20%,75%)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="text-center">
              <span 
                className="text-[14px] text-[hsl(210,20%,80%)] tabular-nums"
                style={{ fontFamily: "'Source Serif 4', 'Inter', serif" }}
              >
                {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
              </span>
              {isCurrentWeek && (
                <span className="ml-2 text-[11px] text-[hsl(var(--primary)/0.7)] uppercase tracking-wider">
                  This week
                </span>
              )}
            </div>

            <button
              onClick={() => navigateWeek('next')}
              className="p-2 text-[hsl(222,15%,45%)] hover:text-[hsl(210,20%,75%)] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Shared Day Labels */}
          <div className="flex items-center gap-[2px] mb-4 px-5">
            {weekDays.map((day, idx) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div 
                  key={idx}
                  className="flex-1 text-center"
                >
                  <span 
                    className={`text-[11px] tracking-wider ${
                      isToday 
                        ? 'text-[hsl(var(--primary)/0.8)] border-b border-[hsl(var(--primary)/0.4)] pb-[2px]' 
                        : 'text-[hsl(222,15%,40%)]'
                    }`}
                  >
                    {format(day, 'EEE')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Habit Scorecards */}
          <div className="space-y-3">
            {habits.map(habit => (
              <div 
                key={habit.id}
                className={`transition-opacity duration-200 ${
                  expandedHabit && expandedHabit !== habit.id ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <HabitScorecard
                  habit={habit}
                  weekDays={weekDays}
                  habitLogs={habitLogs}
                  onToggle={toggleHabit}
                  completedCount={getCompletedCount(habit.id)}
                  streak={getStreak(habit.id)}
                  isExpanded={expandedHabit === habit.id}
                  onExpand={() => setExpandedHabit(
                    expandedHabit === habit.id ? null : habit.id
                  )}
                  extendedDays={extendedDays}
                  longestStreak={getLongestStreak(habit.id)}
                  lastBreakDate={getLastBreakDate(habit.id)}
                />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {habits.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[hsl(222,15%,40%)] text-[14px]">
                No habits configured yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Habits;
