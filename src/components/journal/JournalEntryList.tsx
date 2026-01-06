import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { JournalEntry } from '@/types/journal';

interface JournalEntryListProps {
  onSelectEntry?: (entry: JournalEntry) => void;
}

export const JournalEntryList: React.FC<JournalEntryListProps> = ({ onSelectEntry }) => {
  const { entries, loading } = useJournalEntries();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No journal entries yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-3">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => onSelectEntry?.(entry)}
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {format(new Date(entry.entry_date), 'EEE, MMM d')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Energy: {entry.energy_level}/5
                    </Badge>
                    {entry.plan_followed !== null && (
                      entry.plan_followed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )
                    )}
                  </div>
                  {entry.what_i_learned && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {entry.what_i_learned}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
