import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { WeightLog } from '@/utils/weightTrendCalculations';

export function useWeightLogs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .limit(90); // Last 90 days for trend analysis

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching weight logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load weight logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addWeight = async (weight_kg: number, date?: string): Promise<boolean> => {
    if (!user) return false;

    const log_date = date || new Date().toISOString().split('T')[0];
    setAdding(true);

    try {
      // Check for existing entry on this date
      const existingLog = logs.find((log) => log.log_date === log_date);

      if (existingLog) {
        // Update existing entry
        const { error } = await supabase
          .from('daily_weight_logs')
          .update({ weight_kg })
          .eq('id', existingLog.id);

        if (error) throw error;

        setLogs((prev) =>
          prev.map((log) =>
            log.id === existingLog.id ? { ...log, weight_kg } : log
          )
        );

        toast({
          title: 'Weight Updated',
          description: `Updated to ${weight_kg} kg`,
        });
      } else {
        // Insert new entry
        const { data, error } = await supabase
          .from('daily_weight_logs')
          .insert({
            user_id: user.id,
            weight_kg,
            log_date,
          })
          .select()
          .single();

        if (error) throw error;

        setLogs((prev) => [data, ...prev]);

        toast({
          title: 'Weight Logged',
          description: `${weight_kg} kg recorded for ${log_date}`,
        });
      }

      return true;
    } catch (error: any) {
      console.error('Error saving weight:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save weight',
        variant: 'destructive',
      });
      return false;
    } finally {
      setAdding(false);
    }
  };

  const deleteWeight = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('daily_weight_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLogs((prev) => prev.filter((log) => log.id !== id));

      toast({
        title: 'Entry Deleted',
        description: 'Weight log removed',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting weight:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    logs,
    loading,
    adding,
    addWeight,
    deleteWeight,
    refetch: fetchLogs,
  };
}
