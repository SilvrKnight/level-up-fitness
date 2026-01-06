import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { JournalEntry, JournalEntryFormData } from '@/types/journal';
import { format } from 'date-fns';

export function useJournalEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching journal entries:', error);
    } else {
      setEntries(data as JournalEntry[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, refetch: fetchEntries };
}

export function useJournalEntry(date: Date) {
  const { user } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const dateStr = format(date, 'yyyy-MM-dd');

  const fetchEntry = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('entry_date', dateStr)
      .maybeSingle();

    if (error) {
      console.error('Error fetching journal entry:', error);
    } else {
      setEntry(data as JournalEntry | null);
      if (data?.updated_at) {
        setLastSaved(new Date(data.updated_at));
      } else {
        setLastSaved(null);
      }
    }
    setLoading(false);
  }, [user, dateStr]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const saveEntry = async (formData: JournalEntryFormData): Promise<boolean> => {
    if (!user) return false;

    setSaving(true);
    
    const payload = {
      user_id: user.id,
      entry_date: dateStr,
      energy_level: formData.energy_level,
      plan_followed: formData.plan_followed,
      plan_deviation_reason: formData.plan_followed ? null : formData.plan_deviation_reason || null,
      what_went_well: formData.what_went_well,
      what_was_difficult: formData.what_was_difficult,
      what_i_learned: formData.what_i_learned,
      tomorrow_goal: formData.tomorrow_goal,
      additional_notes: formData.additional_notes || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('journal_entries')
      .upsert(payload, { onConflict: 'user_id,entry_date' })
      .select()
      .single();

    setSaving(false);

    if (error) {
      console.error('Error saving journal entry:', error);
      return false;
    }

    setEntry(data as JournalEntry);
    setLastSaved(new Date());
    return true;
  };

  return { entry, loading, saving, lastSaved, saveEntry, refetch: fetchEntry };
}
