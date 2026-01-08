import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
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

interface WritingSectionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  hasError?: boolean;
  rows?: number;
}

const WritingSection: React.FC<WritingSectionProps> = ({
  value,
  onChange,
  placeholder,
  maxLength,
  hasError,
  rows = 3,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, rows * 24)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <div className={cn(
      "relative pl-4 border-l-2 transition-colors duration-300",
      hasError ? "border-destructive/60" : "border-primary/20"
    )}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          "w-full bg-transparent border-none outline-none resize-none",
          "text-foreground placeholder:text-muted-foreground/50",
          "text-sm leading-relaxed py-2",
          "focus:placeholder:text-muted-foreground/30"
        )}
        style={{ minHeight: `${rows * 24}px` }}
      />
      <div className="absolute bottom-1 right-0 text-[10px] text-muted-foreground/40">
        {value.length}/{maxLength}
      </div>
    </div>
  );
};

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onSaved }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<JournalEntryFormData>(EMPTY_JOURNAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  
  const { entry, loading, saving, lastSaved, saveEntry } = useJournalEntry(selectedDate);
  const { toast } = useToast();
  const firstErrorRef = useRef<HTMLDivElement>(null);

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
      setShowErrors(false);
      setErrors({});
    } else if (!loading) {
      setFormData(EMPTY_JOURNAL_FORM);
      setShowErrors(false);
      setErrors({});
    }
  }, [entry, loading]);

  const updateField = (field: keyof JournalEntryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      setShowErrors(true);
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
        title: 'Missing Fields',
        description: 'Complete all required sections before saving',
        variant: 'destructive',
      });
      // Scroll to first error
      setTimeout(() => {
        firstErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    const success = await saveEntry(formData);
    if (success) {
      toast({
        title: 'Saved',
        description: format(selectedDate, 'MMM d, yyyy'),
      });
      onSaved?.();
    } else {
      toast({
        title: 'Save Failed',
        description: 'Could not save entry. Try again.',
        variant: 'destructive',
      });
    }
  };

  const hasError = (field: string) => showErrors && errors[field];
  const firstErrorField = Object.keys(errors)[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground tracking-wide">
          Daily Journal
        </h1>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-sm">
                <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                <span>{format(selectedDate, 'MMM d, yyyy')}</span>
              </button>
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
          <span className="text-xs text-muted-foreground">
            {lastSaved ? `Saved ${format(lastSaved, 'HH:mm')}` : 'Not saved'}
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="space-y-8 bg-card/30 rounded-xl p-6 border border-border/50">
        
        {/* Energy Level - Inline segmented control */}
        <div 
          ref={firstErrorField === 'energy_level' ? firstErrorRef : null}
          className="space-y-2"
        >
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Energy</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => updateField('energy_level', level)}
                  className={cn(
                    "w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200",
                    formData.energy_level === level
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                    hasError('energy_level') && formData.energy_level === 0 && "ring-1 ring-destructive/50"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60 pl-0">
            Correlated with calories, protein, and weight data
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/30" />

        {/* Plan Followed - Inline toggle */}
        <div 
          ref={firstErrorField === 'plan_deviation_reason' ? firstErrorRef : null}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.plan_followed}
              onCheckedChange={(checked) => updateField('plan_followed', checked)}
              className="data-[state=checked]:bg-success"
            />
            <span className={cn(
              "text-sm transition-colors",
              formData.plan_followed ? "text-foreground" : "text-muted-foreground"
            )}>
              Plan followed today
            </span>
          </div>
          
          {/* Deviation reason - fades in */}
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            !formData.plan_followed ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className={cn(
              "pl-4 border-l-2 transition-colors",
              hasError('plan_deviation_reason') ? "border-destructive/60" : "border-warning/30"
            )}>
              <textarea
                value={formData.plan_deviation_reason}
                onChange={(e) => updateField('plan_deviation_reason', e.target.value)}
                placeholder="What broke the plan?"
                className="w-full bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/50 py-2 leading-relaxed"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/30" />

        {/* What Worked */}
        <div ref={firstErrorField === 'what_went_well' ? firstErrorRef : null}>
          <p className="text-xs text-muted-foreground/70 mb-2">What worked today</p>
          <WritingSection
            value={formData.what_went_well}
            onChange={(v) => updateField('what_went_well', v)}
            placeholder="Describe specific actions or decisions that produced results..."
            maxLength={500}
            hasError={!!hasError('what_went_well')}
          />
        </div>

        {/* What Failed */}
        <div ref={firstErrorField === 'what_was_difficult' ? firstErrorRef : null}>
          <p className="text-xs text-muted-foreground/70 mb-2">What failed / caused friction</p>
          <WritingSection
            value={formData.what_was_difficult}
            onChange={(v) => updateField('what_was_difficult', v)}
            placeholder="Identify concrete causes: time, hunger, stress, poor planning..."
            maxLength={500}
            hasError={!!hasError('what_was_difficult')}
          />
        </div>

        {/* Lessons */}
        <div ref={firstErrorField === 'what_i_learned' ? firstErrorRef : null}>
          <p className="text-xs text-muted-foreground/70 mb-2">Lessons</p>
          <WritingSection
            value={formData.what_i_learned}
            onChange={(v) => updateField('what_i_learned', v)}
            placeholder="State insights as actionable learnings, not complaints..."
            maxLength={500}
            hasError={!!hasError('what_i_learned')}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/30" />

        {/* Tomorrow's Priority - emphasized single line */}
        <div ref={firstErrorField === 'tomorrow_goal' ? firstErrorRef : null}>
          <p className="text-xs text-primary/80 mb-2 font-medium">Tomorrow's priority</p>
          <div className={cn(
            "relative pl-4 border-l-2 transition-colors",
            hasError('tomorrow_goal') ? "border-destructive/60" : "border-primary/40"
          )}>
            <input
              type="text"
              value={formData.tomorrow_goal}
              onChange={(e) => {
                const val = e.target.value.replace(/[\r\n]/g, '');
                updateField('tomorrow_goal', val);
              }}
              placeholder="One single action to focus on tomorrow"
              maxLength={255}
              className="w-full bg-transparent border-none outline-none text-foreground text-base font-medium placeholder:text-muted-foreground/50 placeholder:font-normal py-2"
            />
            <div className="absolute bottom-1 right-0 text-[10px] text-muted-foreground/40">
              {formData.tomorrow_goal.length}/255
            </div>
          </div>
        </div>

        {/* Additional Notes - lighter emphasis */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground/50 mb-2">Additional notes</p>
          <div className="pl-4 border-l-2 border-muted/30">
            <textarea
              value={formData.additional_notes}
              onChange={(e) => updateField('additional_notes', e.target.value)}
              placeholder="Any other observations..."
              maxLength={1000}
              className="w-full bg-transparent border-none outline-none resize-none text-sm text-muted-foreground placeholder:text-muted-foreground/30 py-2 leading-relaxed"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Save Button - outside canvas */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "px-6 transition-all",
            !isFormValid && "opacity-70"
          )}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Save Entry'
          )}
        </Button>
      </div>
    </div>
  );
};
