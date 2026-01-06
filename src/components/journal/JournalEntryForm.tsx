import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, Info, Save, Loader2 } from 'lucide-react';
import { useJournalEntry } from '@/hooks/useJournalEntries';
import { JournalEntryFormData, EMPTY_JOURNAL_FORM } from '@/types/journal';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const journalSchema = z.object({
  energy_level: z.number().min(1, 'Select energy level').max(5),
  plan_followed: z.boolean(),
  plan_deviation_reason: z.string(),
  what_went_well: z.string().min(10, 'Minimum 10 characters').max(500, 'Maximum 500 characters'),
  what_was_difficult: z.string().min(10, 'Minimum 10 characters').max(500, 'Maximum 500 characters'),
  what_i_learned: z.string().min(10, 'Minimum 10 characters').max(500, 'Maximum 500 characters'),
  tomorrow_goal: z.string().min(1, 'Required').max(255, 'Maximum 255 characters'),
  additional_notes: z.string().max(1000, 'Maximum 1000 characters'),
}).refine((data) => {
  if (!data.plan_followed && data.plan_deviation_reason.trim().length < 5) {
    return false;
  }
  return true;
}, {
  message: 'Explain why the plan was not followed',
  path: ['plan_deviation_reason'],
});

interface JournalEntryFormProps {
  onSaved?: () => void;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onSaved }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<JournalEntryFormData>(EMPTY_JOURNAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const { entry, loading, saving, lastSaved, saveEntry } = useJournalEntry(selectedDate);
  const { toast } = useToast();

  // Load entry data when date changes or entry loads
  useEffect(() => {
    if (entry) {
      setFormData({
        energy_level: entry.energy_level ?? 0,
        plan_followed: entry.plan_followed ?? true,
        plan_deviation_reason: entry.plan_deviation_reason ?? '',
        what_went_well: entry.what_went_well ?? '',
        what_was_difficult: entry.what_was_difficult ?? '',
        what_i_learned: entry.what_i_learned ?? '',
        tomorrow_goal: entry.tomorrow_goal ?? '',
        additional_notes: entry.additional_notes ?? '',
      });
      setTouched({});
      setErrors({});
    } else if (!loading) {
      setFormData(EMPTY_JOURNAL_FORM);
      setTouched({});
      setErrors({});
    }
  }, [entry, loading]);

  const updateField = (field: keyof JournalEntryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const result = journalSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const isFormValid = useMemo(() => {
    const result = journalSchema.safeParse(formData);
    return result.success;
  }, [formData]);

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        variant: 'destructive',
      });
      return;
    }

    const success = await saveEntry(formData);
    if (success) {
      toast({
        title: 'Entry Saved',
        description: `Journal entry for ${format(selectedDate, 'MMM d, yyyy')} saved`,
      });
      onSaved?.();
    } else {
      toast({
        title: 'Save Failed',
        description: 'Could not save journal entry. Try again.',
        variant: 'destructive',
      });
    }
  };

  const getFieldError = (field: string) => {
    return touched[field] ? errors[field] : undefined;
  };

  return (
    <Card glow className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Daily Journal</CardTitle>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="text-xs text-muted-foreground">
            {lastSaved ? `Saved ${format(lastSaved, 'HH:mm')}` : 'Not saved'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Section 1: Energy Level */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Energy Level</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Used for correlation with calories, protein, sleep, and weight trend analysis.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={formData.energy_level.toString()}
                onValueChange={(val) => updateField('energy_level', parseInt(val))}
                className="flex gap-2"
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <div key={level} className="flex items-center">
                    <RadioGroupItem
                      value={level.toString()}
                      id={`energy-${level}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`energy-${level}`}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-md border cursor-pointer transition-colors",
                        formData.energy_level === level
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted hover:bg-muted/80 border-border"
                      )}
                    >
                      {level}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {getFieldError('energy_level') && (
                <p className="text-xs text-destructive">{getFieldError('energy_level')}</p>
              )}
            </div>

            {/* Section 2: Plan Adherence */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Plan Followed Today</Label>
                <Switch
                  checked={formData.plan_followed}
                  onCheckedChange={(checked) => updateField('plan_followed', checked)}
                />
              </div>
              {!formData.plan_followed && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Why was the plan not followed?</Label>
                  <Textarea
                    value={formData.plan_deviation_reason}
                    onChange={(e) => updateField('plan_deviation_reason', e.target.value)}
                    placeholder="Describe what prevented adherence (1-2 sentences)"
                    className="resize-none"
                    rows={2}
                  />
                  {getFieldError('plan_deviation_reason') && (
                    <p className="text-xs text-destructive">{getFieldError('plan_deviation_reason')}</p>
                  )}
                </div>
              )}
            </div>

            {/* Section 3: What Worked */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">What Worked</Label>
              <Textarea
                value={formData.what_went_well}
                onChange={(e) => updateField('what_went_well', e.target.value)}
                placeholder="Describe specific actions or decisions that produced results"
                className="resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between">
                {getFieldError('what_went_well') && (
                  <p className="text-xs text-destructive">{getFieldError('what_went_well')}</p>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {formData.what_went_well.length}/500
                </span>
              </div>
            </div>

            {/* Section 4: What Failed */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">What Failed / Caused Friction</Label>
              <Textarea
                value={formData.what_was_difficult}
                onChange={(e) => updateField('what_was_difficult', e.target.value)}
                placeholder="Identify concrete causes: time constraints, hunger, stress, poor planning"
                className="resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between">
                {getFieldError('what_was_difficult') && (
                  <p className="text-xs text-destructive">{getFieldError('what_was_difficult')}</p>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {formData.what_was_difficult.length}/500
                </span>
              </div>
            </div>

            {/* Section 5: Lessons */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Lessons</Label>
              <Textarea
                value={formData.what_i_learned}
                onChange={(e) => updateField('what_i_learned', e.target.value)}
                placeholder="State insights as actionable learnings, not complaints"
                className="resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between">
                {getFieldError('what_i_learned') && (
                  <p className="text-xs text-destructive">{getFieldError('what_i_learned')}</p>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {formData.what_i_learned.length}/500
                </span>
              </div>
            </div>

            {/* Section 6: Tomorrow's Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tomorrow's Priority</Label>
              <Input
                value={formData.tomorrow_goal}
                onChange={(e) => {
                  // Reject multi-line content
                  const val = e.target.value.replace(/[\r\n]/g, '');
                  updateField('tomorrow_goal', val);
                }}
                placeholder="One single action to focus on tomorrow"
                maxLength={255}
              />
              <div className="flex justify-between">
                {getFieldError('tomorrow_goal') && (
                  <p className="text-xs text-destructive">{getFieldError('tomorrow_goal')}</p>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {formData.tomorrow_goal.length}/255
                </span>
              </div>
            </div>

            {/* Section 7: Additional Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Additional Notes (Optional)</Label>
              <Textarea
                value={formData.additional_notes}
                onChange={(e) => updateField('additional_notes', e.target.value)}
                placeholder="Any other observations"
                className="resize-none"
                rows={2}
                maxLength={1000}
              />
              <span className="text-xs text-muted-foreground">
                {formData.additional_notes.length}/1000
              </span>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-border">
              <Button
                onClick={handleSave}
                disabled={!isFormValid || saving}
                className="w-full gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Entry
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
