import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Dumbbell, Droplet, Ban } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const habitIcons: Record<string, React.ElementType> = {
  'Gym': Dumbbell,
  'Water Intake': Droplet,
  'No Junk Food': Ban,
};

const Habits: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<any[]>([]);
  const [habitLogs, setHabitLogs] = useState<any[]>([]);
  const [currentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchHabitLogs();
    }
  }, [user]);

  const fetchHabits = async () => {
    const { data } = await supabase.from('habits').select('*');
    if (data) setHabits(data);
  };

  const fetchHabitLogs = async () => {
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user!.id)
      .gte('log_date', format(monthStart, 'yyyy-MM-dd'))
      .lte('log_date', format(monthEnd, 'yyyy-MM-dd'));
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

  const isCompleted = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habitLogs.some(l => l.habit_id === habitId && l.log_date === dateStr);
  };

  const getCompletionRate = (habitId: string) => {
    const today = new Date();
    const daysPassed = daysInMonth.filter(d => d <= today).length;
    const completed = habitLogs.filter(l => l.habit_id === habitId).length;
    return daysPassed > 0 ? Math.round((completed / daysPassed) * 100) : 0;
  };

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground glow-text-cyan">Daily Quests</h1>
          <p className="text-muted-foreground mt-1">{format(currentDate, 'MMMM yyyy')}</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {habits.map(habit => {
              const Icon = habitIcons[habit.name] || Circle;
              return (
                <Card key={habit.id} glow>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {habit.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-xs text-muted-foreground py-1">{d}</div>
                      ))}
                      {Array(monthStart.getDay()).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                      {daysInMonth.map(day => {
                        const completed = isCompleted(habit.id, day);
                        const isToday = isSameDay(day, new Date());
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => toggleHabit(habit.id, day)}
                            className={cn(
                              "aspect-square rounded-md flex items-center justify-center text-xs transition-all",
                              completed ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
                              isToday && !completed && "ring-1 ring-primary"
                            )}
                          >
                            {completed ? <CheckCircle2 className="h-4 w-4" /> : format(day, 'd')}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            <Card glow>
              <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {habits.map(habit => (
                  <div key={habit.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{habit.name}</span>
                      <span className="text-primary">{getCompletionRate(habit.id)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full xp-bar" style={{ width: `${getCompletionRate(habit.id)}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Habits;
