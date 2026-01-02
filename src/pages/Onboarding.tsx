import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Swords, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { estimateBodyFat, calculateLBM } from '@/utils/nutritionCalculations';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Onboarding: React.FC = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    age: '',
    height_cm: '',
    gender: '',
    current_weight_kg: '',
    training_frequency: '',
    target_goal: '',
    uses_creatine: false,
    body_fat_method: '' as '' | 'percentage' | 'waist' | 'estimate',
    body_fat_percentage: '',
    waist_cm: '',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Swords className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.onboarding_completed) {
    return <Navigate to="/habits" replace />;
  }

  const calculateBodyComposition = () => {
    const weight = parseFloat(formData.current_weight_kg) || 70;
    const height = parseFloat(formData.height_cm) || 170;
    const age = parseInt(formData.age) || 30;
    const gender = (formData.gender || 'male') as 'male' | 'female' | 'other';

    let bodyFat: number;
    let bodyFatSource: 'user' | 'estimated' = 'estimated';

    if (formData.body_fat_method === 'percentage' && formData.body_fat_percentage) {
      bodyFat = parseFloat(formData.body_fat_percentage);
      bodyFatSource = 'user';
    } else if (formData.body_fat_method === 'waist' && formData.waist_cm) {
      bodyFat = estimateBodyFat(gender, weight, height, age, parseFloat(formData.waist_cm));
    } else {
      bodyFat = estimateBodyFat(gender, weight, height, age);
    }

    const lbm = calculateLBM(weight, bodyFat);

    return { bodyFat, bodyFatSource, lbm, waist_cm: parseFloat(formData.waist_cm) || null };
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { bodyFat, bodyFatSource, lbm, waist_cm } = calculateBodyComposition();
      
      // Determine protein basis
      const proteinBasis = bodyFat >= 25 ? 'LBM' : 'BW';
      const proteinMultiplier = bodyFat >= 25 ? 2.1 : 1.8;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          age: parseInt(formData.age) || null,
          height_cm: parseFloat(formData.height_cm) || null,
          gender: formData.gender || null,
          current_weight_kg: parseFloat(formData.current_weight_kg) || null,
          training_frequency: parseInt(formData.training_frequency) || null,
          target_goal: formData.target_goal || null,
          uses_creatine: formData.uses_creatine,
          body_fat_percentage: bodyFat,
          body_fat_source: bodyFatSource,
          waist_cm: waist_cm,
          lean_body_mass: lbm,
          protein_basis: proteinBasis,
          protein_multiplier: proteinMultiplier,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: 'Profile Complete!',
        description: 'Welcome, Hunter. Your journey begins now.',
      });
      navigate('/habits');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  // Preview body composition for step 3
  const previewComposition = () => {
    if (!formData.current_weight_kg || !formData.height_cm) return null;
    const { bodyFat, lbm } = calculateBodyComposition();
    return { bodyFat: Math.round(bodyFat * 10) / 10, lbm: Math.round(lbm * 10) / 10 };
  };

  const composition = step === 3 ? previewComposition() : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Swords className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">ARISE</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Character Setup
          </h1>
          <p className="text-muted-foreground">
            Configure your stats to begin your journey
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full xp-bar transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {step} of {totalSteps}
          </p>
        </div>

        <Card glow className="slide-up backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {step === 1 && 'Basic Stats'}
              {step === 2 && 'Physical Attributes'}
              {step === 3 && 'Body Composition'}
              {step === 4 && 'Training Goals'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us about yourself'}
              {step === 2 && 'Your current physical stats'}
              {step === 3 && 'Help us calculate your lean mass'}
              {step === 4 && 'Define your training objectives'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['male', 'female', 'other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={cn(
                          "px-4 py-3 rounded-md border text-sm font-heading uppercase tracking-wider transition-all",
                          formData.gender === g
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="e.g., 175"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Current Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 70.5"
                    value={formData.current_weight_kg}
                    onChange={(e) => setFormData({ ...formData, current_weight_kg: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label>Body Composition Method</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This helps us calculate your protein needs more accurately. Higher body fat = protein based on lean mass, not total weight.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: 'percentage', label: 'I know my body fat %' },
                      { value: 'waist', label: 'Measure from waist' },
                      { value: 'estimate', label: "I don't know (estimate for me)" },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, body_fat_method: method.value as any })}
                        className={cn(
                          "px-4 py-3 rounded-md border text-sm font-heading transition-all text-left",
                          formData.body_fat_method === method.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.body_fat_method === 'percentage' && (
                  <div>
                    <Label htmlFor="bodyfat">Body Fat Percentage (%)</Label>
                    <Input
                      id="bodyfat"
                      type="number"
                      step="0.1"
                      min="5"
                      max="50"
                      placeholder="e.g., 18"
                      value={formData.body_fat_percentage}
                      onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
                    />
                  </div>
                )}

                {formData.body_fat_method === 'waist' && (
                  <div>
                    <Label htmlFor="waist">Waist Circumference (cm)</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Measure at navel level, relaxed
                    </p>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 85"
                      value={formData.waist_cm}
                      onChange={(e) => setFormData({ ...formData, waist_cm: e.target.value })}
                    />
                  </div>
                )}

                {composition && formData.body_fat_method && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                    <p className="text-sm font-heading text-primary">Estimated Composition</p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-display text-foreground">{composition.bodyFat}%</p>
                        <p className="text-xs text-muted-foreground">Body Fat</p>
                      </div>
                      <div>
                        <p className="text-2xl font-display text-foreground">{composition.lbm}kg</p>
                        <p className="text-xs text-muted-foreground">Lean Mass</p>
                      </div>
                    </div>
                    {composition.bodyFat >= 25 && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        ⚡ Protein will be calculated based on lean mass
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="frequency">Training Frequency (days/week)</Label>
                  <Input
                    id="frequency"
                    type="number"
                    min="0"
                    max="7"
                    placeholder="e.g., 5"
                    value={formData.training_frequency}
                    onChange={(e) => setFormData({ ...formData, training_frequency: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Target Goal</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { value: 'cut', label: 'Cut' },
                      { value: 'maintain', label: 'Maintain' },
                      { value: 'lean_bulk', label: 'Lean Bulk' },
                    ].map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, target_goal: goal.value })}
                        className={cn(
                          "px-4 py-3 rounded-md border text-sm font-heading uppercase tracking-wider transition-all",
                          formData.target_goal === goal.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Do you use creatine?</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[true, false].map((val) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setFormData({ ...formData, uses_creatine: val })}
                        className={cn(
                          "px-4 py-3 rounded-md border text-sm font-heading uppercase tracking-wider transition-all",
                          formData.uses_creatine === val
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {val ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              {step < totalSteps ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button variant="glow" onClick={handleSubmit} disabled={saving}>
                  {saving ? 'Saving...' : 'Begin Journey'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
