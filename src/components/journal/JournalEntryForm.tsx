import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { z } from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Check } from 'lucide-react';
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

// Line height for the ruled paper effect - matches textarea line-height
const LINE_HEIGHT = 28;

interface LinedTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  hasError?: boolean;
  minRows?: number;
}

const LinedTextArea: React.FC<LinedTextAreaProps> = ({
  value,
  onChange,
  placeholder,
  maxLength,
  hasError,
  minRows = 3,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(minRows);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Calculate rows based on content
      const lineCount = (value.match(/\n/g) || []).length + 1;
      const contentRows = Math.max(lineCount, Math.ceil(textarea.scrollHeight / LINE_HEIGHT));
      setRows(Math.max(minRows, contentRows));
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={cn(
          "w-full bg-transparent border-none outline-none resize-none",
          "text-foreground placeholder:text-muted-foreground/30",
          "font-body text-[15px] leading-[28px]",
          "focus:placeholder:opacity-0 transition-all",
          hasError && "text-destructive/80"
        )}
        style={{ 
          lineHeight: `${LINE_HEIGHT}px`,
          paddingTop: '4px',
        }}
      />
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
  const paperRef = useRef<HTMLDivElement>(null);

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
    <div className="max-w-3xl mx-auto px-4">
      {/* Paper Surface */}
      <div 
        ref={paperRef}
        className="relative bg-[hsl(45,30%,96%)] rounded-sm overflow-hidden"
        style={{
          boxShadow: `
            0 1px 3px rgba(0,0,0,0.12),
            0 4px 12px rgba(0,0,0,0.08),
            0 12px 40px rgba(0,0,0,0.12),
            inset 0 0 80px rgba(0,0,0,0.03)
          `,
        }}
      >
        {/* Red margin line */}
        <div 
          className="absolute top-0 bottom-0 w-px bg-[hsl(0,50%,75%)]" 
          style={{ left: '72px' }}
        />
        
        {/* Ruled lines background */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent,
              transparent ${LINE_HEIGHT - 1}px,
              hsl(210 20% 85%) ${LINE_HEIGHT - 1}px,
              hsl(210 20% 85%) ${LINE_HEIGHT}px
            )`,
            backgroundPosition: `0 ${LINE_HEIGHT + 8}px`,
          }}
        />

        {/* Content area with left margin */}
        <div className="relative pl-20 pr-8 py-6">
          
          {/* Header Row */}
          <div 
            className="flex items-baseline justify-between mb-2"
            style={{ height: `${LINE_HEIGHT}px`, lineHeight: `${LINE_HEIGHT}px` }}
          >
            <h1 className="text-[hsl(220,15%,25%)] font-medium text-lg tracking-wide">
              Daily Journal
            </h1>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 text-[hsl(220,15%,40%)] hover:text-[hsl(220,15%,25%)] transition-colors text-sm">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span className="font-medium">{format(selectedDate, 'EEEE, MMM d')}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Save status & button in margin area */}
          <div className="absolute top-6 left-3 flex flex-col items-center gap-2 text-[10px] text-[hsl(220,10%,55%)]">
            <span className="writing-mode-vertical">
              {lastSaved ? format(lastSaved, 'HH:mm') : '—'}
            </span>
          </div>

          {/* Margin annotations: Energy & Plan */}
          <div className="absolute left-2 flex flex-col gap-1" style={{ top: `${LINE_HEIGHT * 2 + 24}px` }}>
            {/* Energy Level - tiny margin notation */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-[hsl(220,10%,50%)] uppercase tracking-wider">E</span>
              <div className="flex flex-col gap-0.5">
                {[5, 4, 3, 2, 1].map((level) => (
                  <button
                    key={level}
                    onClick={() => updateField('energy_level', level)}
                    className={cn(
                      "w-4 h-4 rounded-full text-[9px] font-medium transition-all duration-150",
                      formData.energy_level === level
                        ? "bg-[hsl(220,60%,50%)] text-white"
                        : "bg-[hsl(220,15%,88%)] text-[hsl(220,10%,45%)] hover:bg-[hsl(220,20%,80%)]",
                      hasError('energy_level') && formData.energy_level === 0 && "ring-1 ring-[hsl(0,60%,55%)]"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Plan Followed - tiny checkbox in margin */}
            <div className="flex flex-col items-center gap-0.5 mt-3">
              <span className="text-[9px] text-[hsl(220,10%,50%)] uppercase tracking-wider">P</span>
              <button
                onClick={() => updateField('plan_followed', !formData.plan_followed)}
                className={cn(
                  "w-4 h-4 rounded border transition-all flex items-center justify-center",
                  formData.plan_followed 
                    ? "bg-[hsl(145,50%,40%)] border-[hsl(145,50%,35%)]" 
                    : "bg-[hsl(220,15%,92%)] border-[hsl(220,15%,75%)]"
                )}
              >
                {formData.plan_followed && <Check className="h-2.5 w-2.5 text-white" />}
              </button>
            </div>
          </div>

          {/* Writing Content - flows naturally with lines */}
          <div className="space-y-0">
            
            {/* Plan deviation reason - appears if plan not followed */}
            <div className={cn(
              "overflow-hidden transition-all duration-300",
              !formData.plan_followed ? "max-h-[84px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div 
                ref={firstErrorField === 'plan_deviation_reason' ? firstErrorRef : null}
                style={{ lineHeight: `${LINE_HEIGHT}px`, paddingTop: '4px' }}
              >
                <textarea
                  value={formData.plan_deviation_reason}
                  onChange={(e) => updateField('plan_deviation_reason', e.target.value)}
                  placeholder="What broke the plan?"
                  rows={2}
                  className={cn(
                    "w-full bg-transparent border-none outline-none resize-none",
                    "text-[hsl(0,50%,40%)] placeholder:text-[hsl(0,30%,60%)] italic",
                    "font-body text-[15px] leading-[28px]",
                    hasError('plan_deviation_reason') && "underline decoration-wavy decoration-[hsl(0,60%,55%)]"
                  )}
                  style={{ lineHeight: `${LINE_HEIGHT}px` }}
                />
              </div>
            </div>

            {/* What worked */}
            <div ref={firstErrorField === 'what_went_well' ? firstErrorRef : null}>
              <LinedTextArea
                value={formData.what_went_well}
                onChange={(v) => updateField('what_went_well', v)}
                placeholder="What worked today…"
                maxLength={500}
                hasError={!!hasError('what_went_well')}
              />
            </div>

            {/* What failed */}
            <div ref={firstErrorField === 'what_was_difficult' ? firstErrorRef : null}>
              <LinedTextArea
                value={formData.what_was_difficult}
                onChange={(v) => updateField('what_was_difficult', v)}
                placeholder="What caused friction…"
                maxLength={500}
                hasError={!!hasError('what_was_difficult')}
              />
            </div>

            {/* Lessons */}
            <div ref={firstErrorField === 'what_i_learned' ? firstErrorRef : null}>
              <LinedTextArea
                value={formData.what_i_learned}
                onChange={(v) => updateField('what_i_learned', v)}
                placeholder="Lessons learned…"
                maxLength={500}
                hasError={!!hasError('what_i_learned')}
              />
            </div>

            {/* Tomorrow's Priority - emphasized with underline */}
            <div 
              ref={firstErrorField === 'tomorrow_goal' ? firstErrorRef : null}
              className="relative pt-4"
            >
              <div className="relative">
                <input
                  type="text"
                  value={formData.tomorrow_goal}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[\r\n]/g, '');
                    updateField('tomorrow_goal', val);
                  }}
                  placeholder="Tomorrow's single priority…"
                  maxLength={255}
                  className={cn(
                    "w-full bg-transparent border-none outline-none",
                    "text-[hsl(220,30%,20%)] placeholder:text-[hsl(220,10%,60%)]",
                    "font-medium text-base",
                    hasError('tomorrow_goal') && "text-[hsl(0,50%,45%)]"
                  )}
                  style={{ 
                    lineHeight: `${LINE_HEIGHT}px`,
                    height: `${LINE_HEIGHT}px`,
                  }}
                />
                {/* Thicker underline for emphasis */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[hsl(220,30%,70%)]" />
              </div>
            </div>

            {/* Additional notes - lighter emphasis */}
            <div className="pt-4 opacity-70">
              <LinedTextArea
                value={formData.additional_notes}
                onChange={(v) => updateField('additional_notes', v)}
                placeholder="Additional notes…"
                maxLength={1000}
                minRows={2}
              />
            </div>
          </div>

          {/* Save Button - subtle, bottom right */}
          <div className="flex justify-end mt-6 pb-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "px-5 py-1.5 rounded text-sm font-medium transition-all",
                "bg-[hsl(220,50%,45%)] text-white hover:bg-[hsl(220,50%,40%)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-sm hover:shadow",
                !isFormValid && "opacity-60"
              )}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save Entry'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
