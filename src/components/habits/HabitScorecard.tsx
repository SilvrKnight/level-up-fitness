import React, { useState } from 'react';
import { format, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dumbbell, Droplet, Ban, Circle } from 'lucide-react';

const habitIcons: Record<string, React.ElementType> = {
  'Gym': Dumbbell,
  'Water Intake': Droplet,
  'No Junk Food': Ban,
};

interface HabitScorecardProps {
  habit: {
    id: string;
    name: string;
  };
  weekDays: Date[];
  habitLogs: any[];
  onToggle: (habitId: string, date: Date) => void;
  completedCount: number;
  streak: number;
  isExpanded: boolean;
  onExpand: () => void;
  extendedDays?: Date[];
  longestStreak?: number;
  lastBreakDate?: string | null;
}

const HabitScorecard: React.FC<HabitScorecardProps> = ({
  habit,
  weekDays,
  habitLogs,
  onToggle,
  completedCount,
  streak,
  isExpanded,
  onExpand,
  extendedDays = [],
  longestStreak = 0,
  lastBreakDate,
}) => {
  const Icon = habitIcons[habit.name] || Circle;
  const today = startOfDay(new Date());
  
  const isCompletedOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habitLogs.some(l => l.habit_id === habit.id && l.log_date === dateStr);
  };

  const isToday = (date: Date) => isSameDay(date, today);
  const isFuture = (date: Date) => isAfter(startOfDay(date), today);
  const isPast = (date: Date) => isBefore(startOfDay(date), today);

  // Check if any day is today for spine highlight
  const hasActiveToday = weekDays.some(d => isToday(d));

  return (
    <div 
      className={cn(
        "relative rounded-lg transition-all duration-200 ease-out cursor-pointer",
        "bg-gradient-to-b from-[hsl(222,30%,12%)] to-[hsl(222,30%,10%)]",
        "border border-[hsl(222,20%,18%)]",
        isExpanded && "shadow-lg shadow-black/20"
      )}
      onClick={onExpand}
    >
      {/* Left Spine */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg transition-colors duration-200",
          hasActiveToday ? "bg-[hsl(var(--primary)/0.6)]" : "bg-[hsl(222,20%,25%)]"
        )}
      />

      <div className="pl-5 pr-4 py-4">
        {/* Identity Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-[hsl(222,15%,50%)]" strokeWidth={1.5} />
            <span 
              className="text-[15px] font-medium tracking-wide text-[hsl(210,20%,88%)]"
              style={{ fontFamily: "'Source Serif 4', 'Inter', serif" }}
            >
              {habit.name}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-[13px] tabular-nums">
            <span className="text-[hsl(222,15%,50%)]">
              <span className="text-[hsl(210,20%,75%)]">{completedCount}</span>
              <span className="mx-1">/</span>
              <span>7</span>
            </span>
            <span className="text-[hsl(222,15%,45%)]">
              Streak <span className="text-[hsl(210,20%,70%)]">{streak}</span>
            </span>
          </div>
        </div>

        {/* Rhythm Track */}
        <div className="flex items-center gap-[2px]">
          {weekDays.map((day, idx) => {
            const completed = isCompletedOnDate(day);
            const todayMark = isToday(day);
            const future = isFuture(day);
            
            return (
              <button
                key={day.toISOString()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!future) onToggle(habit.id, day);
                }}
                disabled={future}
                className={cn(
                  "flex-1 h-[6px] rounded-full transition-all duration-150",
                  "hover:opacity-80",
                  future && "cursor-not-allowed",
                  // Completed state
                  completed && "bg-[hsl(var(--primary)/0.7)]",
                  // Missed (past, not completed)
                  !completed && isPast(day) && !todayMark && "bg-[hsl(222,20%,22%)] border border-[hsl(222,15%,28%)]",
                  // Today not completed
                  !completed && todayMark && "bg-transparent border-2 border-[hsl(var(--primary)/0.5)]",
                  // Future
                  future && "bg-transparent border border-[hsl(222,15%,20%)] opacity-40"
                )}
                style={{ height: '6px' }}
              />
            );
          })}
        </div>

        {/* Expanded State */}
        {isExpanded && (
          <div 
            className="mt-6 pt-4 border-t border-[hsl(222,20%,16%)] animate-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Extended rhythm track (14-21 days) */}
            <div className="mb-4">
              <p className="text-[11px] text-[hsl(222,15%,45%)] mb-2 tracking-wide uppercase">Last 21 days</p>
              <div className="flex items-center gap-[2px]">
                {extendedDays.map((day) => {
                  const completed = isCompletedOnDate(day);
                  const todayMark = isToday(day);
                  const future = isFuture(day);
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => {
                        if (!future) onToggle(habit.id, day);
                      }}
                      disabled={future}
                      className={cn(
                        "flex-1 h-[4px] rounded-full transition-all duration-150",
                        "hover:opacity-80",
                        future && "cursor-not-allowed",
                        completed && "bg-[hsl(var(--primary)/0.6)]",
                        !completed && isPast(day) && !todayMark && "bg-[hsl(222,20%,20%)]",
                        !completed && todayMark && "bg-transparent border border-[hsl(var(--primary)/0.4)]",
                        future && "bg-transparent border border-[hsl(222,15%,18%)] opacity-30"
                      )}
                      style={{ height: '4px' }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-[12px] tabular-nums text-[hsl(222,15%,50%)]">
              <div>
                <span className="text-[hsl(222,15%,40%)]">Longest streak</span>
                <span className="ml-2 text-[hsl(210,20%,70%)]">{longestStreak}</span>
              </div>
              {lastBreakDate && (
                <div>
                  <span className="text-[hsl(222,15%,40%)]">Last break</span>
                  <span className="ml-2 text-[hsl(210,20%,70%)]">{lastBreakDate}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitScorecard;
