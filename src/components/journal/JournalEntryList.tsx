import React from 'react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Check, X } from 'lucide-react';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { JournalEntry } from '@/types/journal';
import { cn } from '@/lib/utils';

interface JournalEntryListProps {
  onSelectEntry?: (entry: JournalEntry) => void;
}

const LINE_HEIGHT = 24;

export const JournalEntryList: React.FC<JournalEntryListProps> = ({ onSelectEntry }) => {
  const { entries, loading } = useJournalEntries();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4">
        <div 
          className="bg-[hsl(45,30%,96%)] rounded-sm p-8 text-center"
          style={{
            boxShadow: `
              0 1px 3px rgba(0,0,0,0.12),
              0 4px 12px rgba(0,0,0,0.08)
            `,
          }}
        >
          <p className="text-[hsl(220,15%,45%)] text-sm">No entries yet</p>
          <p className="text-[hsl(220,15%,60%)] text-xs mt-1">
            Start journaling to see your history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry?.(entry)}
              className={cn(
                "relative cursor-pointer rounded-sm overflow-hidden transition-all duration-200",
                "hover:translate-y-[-2px]",
                "fade-in"
              )}
              style={{ 
                animationDelay: `${index * 50}ms`,
                boxShadow: `
                  0 1px 2px rgba(0,0,0,0.08),
                  0 2px 8px rgba(0,0,0,0.06),
                  0 4px 16px rgba(0,0,0,0.04)
                `,
              }}
            >
              {/* Paper surface */}
              <div className="bg-[hsl(45,30%,96%)] relative">
                {/* Red margin line */}
                <div 
                  className="absolute top-0 bottom-0 w-px bg-[hsl(0,50%,80%)]" 
                  style={{ left: '48px' }}
                />
                
                {/* Ruled lines background */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      to bottom,
                      transparent,
                      transparent ${LINE_HEIGHT - 1}px,
                      hsl(210 20% 88%) ${LINE_HEIGHT - 1}px,
                      hsl(210 20% 88%) ${LINE_HEIGHT}px
                    )`,
                    backgroundPosition: '0 12px',
                  }}
                />

                {/* Content */}
                <div className="relative pl-14 pr-6 py-3">
                  {/* Date in margin */}
                  <div className="absolute left-2 top-3 flex flex-col items-center">
                    <span className="text-[10px] text-[hsl(220,10%,55%)] font-medium">
                      {format(new Date(entry.entry_date), 'MMM')}
                    </span>
                    <span className="text-sm text-[hsl(220,15%,35%)] font-semibold leading-none">
                      {format(new Date(entry.entry_date), 'd')}
                    </span>
                  </div>

                  {/* Header row */}
                  <div 
                    className="flex items-center justify-between"
                    style={{ height: `${LINE_HEIGHT}px`, lineHeight: `${LINE_HEIGHT}px` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[hsl(220,15%,30%)] font-medium">
                        {format(new Date(entry.entry_date), 'EEEE')}
                      </span>
                      
                      {/* Energy dots */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-colors",
                              level <= (entry.energy_level ?? 0)
                                ? "bg-[hsl(220,60%,50%)]"
                                : "bg-[hsl(220,15%,80%)]"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Plan followed indicator */}
                    {entry.plan_followed !== null && (
                      <div className={cn(
                        "flex items-center justify-center w-4 h-4 rounded",
                        entry.plan_followed 
                          ? "bg-[hsl(145,40%,85%)] text-[hsl(145,50%,35%)]" 
                          : "bg-[hsl(0,40%,90%)] text-[hsl(0,50%,45%)]"
                      )}>
                        {entry.plan_followed ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          <X className="h-2.5 w-2.5" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Lesson preview */}
                  {entry.what_i_learned && (
                    <p 
                      className="text-[13px] text-[hsl(220,15%,40%)] line-clamp-2"
                      style={{ lineHeight: `${LINE_HEIGHT}px` }}
                    >
                      {entry.what_i_learned}
                    </p>
                  )}

                  {/* Tomorrow's priority */}
                  {entry.tomorrow_goal && (
                    <p 
                      className="text-[13px] text-[hsl(220,40%,45%)] font-medium line-clamp-1 border-b border-[hsl(220,30%,75%)] inline-block"
                      style={{ lineHeight: `${LINE_HEIGHT}px` }}
                    >
                      {entry.tomorrow_goal}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
