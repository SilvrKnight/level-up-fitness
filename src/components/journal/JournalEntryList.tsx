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
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">No entries yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Start journaling to see your history</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry?.(entry)}
              className={cn(
                "group cursor-pointer rounded-xl p-5 transition-all duration-200",
                "bg-card/30 border border-border/30",
                "hover:bg-card/50 hover:border-border/50",
                "fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {format(new Date(entry.entry_date), 'EEE, MMM d')}
                  </span>
                  
                  {/* Energy indicator */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-colors",
                          level <= (entry.energy_level ?? 0)
                            ? "bg-primary"
                            : "bg-muted/50"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Plan followed indicator */}
                {entry.plan_followed !== null && (
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full",
                    entry.plan_followed 
                      ? "bg-success/20 text-success" 
                      : "bg-destructive/20 text-destructive"
                  )}>
                    {entry.plan_followed ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </div>
                )}
              </div>

              {/* Lesson preview */}
              {entry.what_i_learned && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 pl-0">
                  {entry.what_i_learned}
                </p>
              )}

              {/* Tomorrow's priority preview */}
              {entry.tomorrow_goal && (
                <p className="text-xs text-primary/70 mt-2 line-clamp-1">
                  → {entry.tomorrow_goal}
                </p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
