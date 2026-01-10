import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { z } from 'zod';
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

// Line height for the ruled paper effect - matches textarea line-height
const LINE_HEIGHT = 32;

// Paper ink colors
const INK = {
  primary: '#1a1a1a',
  secondary: '#3d3d3d',
  placeholder: '#9a9a9a',
  muted: '#6b6b6b',
  error: '#8b3a3a',
  accent: '#2c4a7c',
};

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
  const [isFocused, setIsFocused] = useState(false);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const lineCount = (value.match(/\n/g) || []).length + 1;
      const contentRows = Math.max(lineCount, Math.ceil(textarea.scrollHeight / LINE_HEIGHT));
      setRows(Math.max(minRows, contentRows));
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  // Hide placeholder when focused or has value
  const showPlaceholder = !isFocused && !value;

  return (
    <div className="relative">
      {/* Placeholder as separate element to prevent ghost text */}
      {showPlaceholder && (
        <div 
          className="absolute pointer-events-none select-none"
          style={{
            color: INK.placeholder,
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '16px',
            lineHeight: `${LINE_HEIGHT}px`,
            paddingTop: '2px',
            fontStyle: 'italic',
          }}
        >
          {placeholder}
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={maxLength}
        rows={rows}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className={cn(
          "w-full bg-transparent border-none outline-none resize-none",
          "transition-all duration-150"
        )}
        style={{ 
          color: hasError ? INK.error : INK.primary,
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: '16px',
          lineHeight: `${LINE_HEIGHT}px`,
          paddingTop: '2px',
          caretColor: INK.accent,
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
        className="relative rounded-sm overflow-hidden"
        style={{
          backgroundColor: '#f8f6f1',
          boxShadow: `
            0 1px 3px rgba(0,0,0,0.10),
            0 4px 12px rgba(0,0,0,0.06),
            0 12px 40px rgba(0,0,0,0.10),
            inset 0 0 60px rgba(0,0,0,0.02)
          `,
        }}
      >
        {/* Paper grain/texture overlay - extremely subtle */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: 0.03,
            mixBlendMode: 'multiply',
          }}
        />

        {/* Red margin line */}
        <div 
          className="absolute top-0 bottom-0 w-px" 
          style={{ left: '60px', backgroundColor: 'rgba(180,100,100,0.35)' }}
        />
        
        {/* Ruled lines background */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent,
              transparent ${LINE_HEIGHT - 1}px,
              rgba(180,190,200,0.3) ${LINE_HEIGHT - 1}px,
              rgba(180,190,200,0.3) ${LINE_HEIGHT}px
            )`,
            backgroundPosition: `0 ${LINE_HEIGHT + 12}px`,
          }}
        />

        {/* Content area with left margin */}
        <div className="relative pl-16 pr-8 py-6">
          
          {/* Header Row */}
          <div 
            className="flex items-baseline justify-between mb-1"
            style={{ height: `${LINE_HEIGHT}px`, lineHeight: `${LINE_HEIGHT}px` }}
          >
            <h1 
              className="font-medium text-lg tracking-wide"
              style={{ 
                color: INK.primary,
                fontFamily: "'Source Serif 4', Georgia, serif",
              }}
            >
              Daily Journal
            </h1>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="flex items-center gap-1.5 transition-colors text-sm hover:opacity-70"
                    style={{ color: INK.muted }}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span 
                      className="font-medium"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                    >
                      {format(selectedDate, 'EEEE, MMM d')}
                    </span>
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

          {/* Margin annotations: Energy & Plan - handwritten style */}
          <div 
            className="absolute flex flex-col gap-4" 
            style={{ left: '10px', top: `${LINE_HEIGHT * 2 + 20}px` }}
          >
            {/* Energy Level - pencil-style notation */}
            <div className="flex flex-col items-center gap-1">
              <span 
                className="uppercase tracking-widest"
                style={{ 
                  fontSize: '8px', 
                  color: INK.placeholder,
                  fontFamily: "'Source Serif 4', Georgia, serif",
                }}
              >
                energy
              </span>
              <div className="flex flex-col gap-px">
                {[5, 4, 3, 2, 1].map((level) => (
                  <button
                    key={level}
                    onClick={() => updateField('energy_level', level)}
                    className="transition-all duration-100"
                    style={{
                      width: '18px',
                      height: '14px',
                      fontSize: '10px',
                      fontFamily: "'Source Serif 4', Georgia, serif",
                      color: formData.energy_level === level ? INK.primary : INK.placeholder,
                      fontWeight: formData.energy_level === level ? 600 : 400,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: formData.energy_level === level ? 1 : 0.5,
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
              {hasError('energy_level') && formData.energy_level === 0 && (
                <div 
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: INK.error }}
                />
              )}
            </div>
            
            {/* Plan Followed - pencil mark style */}
            <div className="flex flex-col items-center gap-1">
              <span 
                className="uppercase tracking-widest"
                style={{ 
                  fontSize: '8px', 
                  color: INK.placeholder,
                  fontFamily: "'Source Serif 4', Georgia, serif",
                }}
              >
                plan
              </span>
              <button
                onClick={() => updateField('plan_followed', !formData.plan_followed)}
                className="transition-all duration-100"
                style={{
                  width: '18px',
                  height: '18px',
                  fontSize: '14px',
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: formData.plan_followed ? INK.secondary : INK.placeholder,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {formData.plan_followed ? '✓' : '—'}
              </button>
            </div>
          </div>

          {/* Save status in top margin */}
          <div 
            className="absolute text-right"
            style={{ 
              top: '12px', 
              left: '12px',
              fontSize: '9px',
              color: INK.placeholder,
              fontFamily: "'Source Serif 4', Georgia, serif",
            }}
          >
            {lastSaved ? format(lastSaved, 'HH:mm') : ''}
          </div>

          {/* Writing Content - flows naturally with lines */}
          <div className="space-y-0">
            
            {/* Plan deviation reason - appears if plan not followed */}
            <div className={cn(
              "overflow-hidden transition-all duration-300",
              !formData.plan_followed ? "max-h-[96px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div 
                ref={firstErrorField === 'plan_deviation_reason' ? firstErrorRef : null}
                style={{ lineHeight: `${LINE_HEIGHT}px`, paddingTop: '2px' }}
              >
                <textarea
                  value={formData.plan_deviation_reason}
                  onChange={(e) => updateField('plan_deviation_reason', e.target.value)}
                  placeholder="What broke the plan?"
                  rows={2}
                  spellCheck={false}
                  className={cn(
                    "w-full bg-transparent border-none outline-none resize-none",
                    hasError('plan_deviation_reason') && "underline decoration-dotted"
                  )}
                  style={{ 
                    color: INK.error,
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    fontSize: '15px',
                    lineHeight: `${LINE_HEIGHT}px`,
                    fontStyle: 'italic',
                    textDecorationColor: hasError('plan_deviation_reason') ? 'rgba(139,58,58,0.5)' : 'transparent',
                  }}
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

            {/* Tomorrow's Priority - emphasized */}
            <div 
              ref={firstErrorField === 'tomorrow_goal' ? firstErrorRef : null}
              className="relative pt-6"
            >
              <div className="relative">
                <input
                  type="text"
                  value={formData.tomorrow_goal}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[\r\n]/g, '');
                    updateField('tomorrow_goal', val);
                  }}
                  placeholder={formData.tomorrow_goal ? '' : "Tomorrow's single priority…"}
                  maxLength={255}
                  spellCheck={false}
                  className="w-full bg-transparent border-none outline-none"
                  style={{ 
                    color: hasError('tomorrow_goal') ? INK.error : INK.primary,
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    fontSize: '18px',
                    fontWeight: 500,
                    lineHeight: `${LINE_HEIGHT}px`,
                    height: `${LINE_HEIGHT}px`,
                    caretColor: INK.accent,
                  }}
                />
                {/* Thicker underline for emphasis */}
                <div 
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: '2px', backgroundColor: 'rgba(100,120,140,0.3)' }}
                />
              </div>
            </div>

            {/* Additional notes - lighter emphasis */}
            <div className="pt-6" style={{ opacity: 0.65 }}>
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
          <div className="flex justify-end mt-8 pb-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="transition-all duration-150 disabled:opacity-40"
              style={{
                padding: '8px 20px',
                borderRadius: '3px',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: isFormValid ? '#fff' : 'rgba(255,255,255,0.8)',
                backgroundColor: isFormValid ? 'rgba(60,80,110,0.9)' : 'rgba(100,110,120,0.6)',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              }}
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
