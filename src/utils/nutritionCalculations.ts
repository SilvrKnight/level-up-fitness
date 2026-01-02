/**
 * Adaptive Protein & Macro Engine
 * Calculates macros based on Lean Body Mass (LBM) when body fat is high
 */

export interface UserStats {
  age: number;
  gender: 'male' | 'female' | 'other';
  height_cm: number;
  current_weight_kg: number;
  body_fat_percentage?: number | null;
  body_fat_source?: 'user' | 'estimated' | 'AI';
  waist_cm?: number | null;
  training_frequency?: number;
  target_goal?: 'cut' | 'maintain' | 'lean_bulk';
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  water_ml: number;
}

export interface ProteinExplanation {
  target: number;
  basis: 'LBM' | 'BW';
  multiplier: number;
  lbm: number;
  bodyFat: number;
  bodyFatSource: 'user' | 'estimated' | 'AI';
  reason: string;
}

export interface MacroExplanation {
  protein: ProteinExplanation;
  calories: {
    maintenance: number;
    target: number;
    method: 'Katch-McArdle' | 'Mifflin-St Jeor';
    reason: string;
  };
  fats: {
    target: number;
    multiplier: number;
    reason: string;
  };
  carbs: {
    target: number;
    reason: string;
  };
}

/**
 * Estimate body fat percentage using the US Navy method
 * Falls back to BMI-based estimation if waist not provided
 */
export function estimateBodyFat(
  gender: 'male' | 'female' | 'other',
  weight_kg: number,
  height_cm: number,
  age: number,
  waist_cm?: number | null
): number {
  // If waist measurement provided, use Navy method (simplified)
  if (waist_cm && gender !== 'other') {
    const height_in = height_cm / 2.54;
    const waist_in = waist_cm / 2.54;
    
    if (gender === 'male') {
      // Simplified Navy formula for men (neck assumed as waist * 0.37)
      const neck_in = waist_in * 0.37;
      const bf = 86.010 * Math.log10(waist_in - neck_in) - 70.041 * Math.log10(height_in) + 36.76;
      return Math.max(5, Math.min(50, bf));
    } else {
      // Simplified for women (neck assumed, hip estimated)
      const neck_in = waist_in * 0.35;
      const hip_in = waist_in * 1.15;
      const bf = 163.205 * Math.log10(waist_in + hip_in - neck_in) - 97.684 * Math.log10(height_in) - 78.387;
      return Math.max(10, Math.min(55, bf));
    }
  }

  // BMI-based estimation (Deurenberg formula)
  const height_m = height_cm / 100;
  const bmi = weight_kg / (height_m * height_m);
  
  let bodyFat: number;
  if (gender === 'male') {
    bodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
  } else if (gender === 'female') {
    bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
  } else {
    // Average for 'other'
    bodyFat = (1.20 * bmi) + (0.23 * age) - 10.8;
  }

  return Math.max(5, Math.min(50, bodyFat));
}

/**
 * Calculate Lean Body Mass
 */
export function calculateLBM(weight_kg: number, body_fat_percentage: number): number {
  return weight_kg * (1 - body_fat_percentage / 100);
}

/**
 * Calculate BMR using Katch-McArdle (if BF known) or Mifflin-St Jeor
 */
export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: 'male' | 'female' | 'other',
  lbm?: number
): { bmr: number; method: 'Katch-McArdle' | 'Mifflin-St Jeor' } {
  if (lbm && lbm > 0) {
    // Katch-McArdle formula (more accurate when LBM is known)
    return {
      bmr: 370 + (21.6 * lbm),
      method: 'Katch-McArdle'
    };
  }

  // Mifflin-St Jeor formula
  let bmr: number;
  if (gender === 'male') {
    bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
  } else if (gender === 'female') {
    bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
  } else {
    // Average for 'other'
    bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 78;
  }

  return { bmr, method: 'Mifflin-St Jeor' };
}

/**
 * Get activity multiplier based on training frequency
 */
export function getActivityMultiplier(trainingDaysPerWeek: number): number {
  if (trainingDaysPerWeek === 0) return 1.2; // Sedentary
  if (trainingDaysPerWeek <= 2) return 1.375; // Light
  if (trainingDaysPerWeek <= 4) return 1.55; // Moderate
  if (trainingDaysPerWeek <= 6) return 1.725; // Active
  return 1.9; // Very active
}

/**
 * Calculate protein target with adaptive LBM/BW logic
 */
export function calculateProtein(
  weight_kg: number,
  lbm: number,
  body_fat_percentage: number,
  target_goal: 'cut' | 'maintain' | 'lean_bulk'
): ProteinExplanation & { bodyFatSource: 'user' | 'estimated' | 'AI' } {
  const isOverfat = body_fat_percentage >= 25;
  
  // Determine protein basis and range
  let basis: 'LBM' | 'BW';
  let minMultiplier: number;
  let maxMultiplier: number;
  let reason: string;

  if (isOverfat) {
    basis = 'LBM';
    minMultiplier = 2.0;
    maxMultiplier = 2.2;
    reason = `Body fat ~${Math.round(body_fat_percentage)}%, using lean mass to prevent overfeeding protein`;
  } else {
    basis = 'BW';
    minMultiplier = 1.6;
    maxMultiplier = 2.0;
    reason = `Body fat ~${Math.round(body_fat_percentage)}%, using body weight for protein calculation`;
  }

  // Adjust multiplier based on goal
  let multiplier: number;
  if (target_goal === 'cut') {
    multiplier = maxMultiplier; // Higher protein during cut for muscle preservation
    reason += ', prioritizing muscle preservation during deficit';
  } else if (target_goal === 'lean_bulk') {
    multiplier = minMultiplier + (maxMultiplier - minMultiplier) * 0.5; // Mid-range for bulk
    reason += ', balanced for muscle growth';
  } else {
    multiplier = (minMultiplier + maxMultiplier) / 2; // Midpoint for maintenance
    reason += ', maintenance level';
  }

  const referenceWeight = basis === 'LBM' ? lbm : weight_kg;
  let target = Math.round(referenceWeight * multiplier);

  // Clamp values
  const minProtein = Math.round(weight_kg * 1.6); // Never go below 1.6g/kg BW equivalent
  const maxProtein = Math.round(lbm * 2.6); // Never exceed 2.6g/kg LBM
  target = Math.max(minProtein, Math.min(maxProtein, target));

  return {
    target,
    basis,
    multiplier,
    lbm,
    bodyFat: body_fat_percentage,
    bodyFatSource: 'estimated', // Will be overwritten by caller
    reason
  };
}

/**
 * Calculate all nutrition targets with explanations
 */
export function calculateNutritionTargets(stats: UserStats): {
  targets: NutritionTargets;
  explanation: MacroExplanation;
} {
  // Estimate body fat if not provided
  let bodyFat = stats.body_fat_percentage;
  let bodyFatSource: 'user' | 'estimated' | 'AI' = stats.body_fat_source || 'estimated';

  if (!bodyFat || bodyFat <= 0) {
    bodyFat = estimateBodyFat(
      stats.gender,
      stats.current_weight_kg,
      stats.height_cm,
      stats.age,
      stats.waist_cm
    );
    bodyFatSource = 'estimated';
  }

  // Calculate LBM
  const lbm = calculateLBM(stats.current_weight_kg, bodyFat);

  // Calculate BMR and TDEE
  const { bmr, method: bmrMethod } = calculateBMR(
    stats.current_weight_kg,
    stats.height_cm,
    stats.age,
    stats.gender,
    lbm
  );
  const activityMultiplier = getActivityMultiplier(stats.training_frequency || 0);
  const maintenance = Math.round(bmr * activityMultiplier);

  // Calculate target calories based on goal
  let targetCalories: number;
  let calorieReason: string;
  const goal = stats.target_goal || 'maintain';

  switch (goal) {
    case 'cut':
      targetCalories = Math.round(maintenance * 0.8); // 20% deficit
      calorieReason = '20% deficit for sustainable fat loss';
      break;
    case 'lean_bulk':
      targetCalories = Math.round(maintenance * 1.1); // 10% surplus
      calorieReason = '10% surplus for lean muscle gain';
      break;
    default:
      targetCalories = maintenance;
      calorieReason = 'Maintenance calories';
  }

  // Calculate protein
  const proteinResult = calculateProtein(
    stats.current_weight_kg,
    lbm,
    bodyFat,
    goal
  );
  proteinResult.bodyFatSource = bodyFatSource;

  // Calculate fats (0.7-0.8g per kg LBM)
  const fatMultiplier = goal === 'cut' ? 0.7 : 0.8;
  const targetFats = Math.round(lbm * fatMultiplier);
  const fatReason = `${fatMultiplier}g per kg lean mass for hormone health`;

  // Calculate carbs from remaining calories
  const proteinCalories = proteinResult.target * 4;
  const fatCalories = targetFats * 9;
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const targetCarbs = Math.max(50, Math.round(remainingCalories / 4)); // Minimum 50g carbs
  const carbReason = 'Remaining calories after protein and fat allocation';

  // Calculate water (35ml per kg body weight)
  const water_ml = Math.round(stats.current_weight_kg * 35);

  // Fiber target
  const targetFiber = 30; // Standard recommendation

  return {
    targets: {
      calories: targetCalories,
      protein: proteinResult.target,
      carbs: targetCarbs,
      fats: targetFats,
      fiber: targetFiber,
      water_ml
    },
    explanation: {
      protein: proteinResult,
      calories: {
        maintenance,
        target: targetCalories,
        method: bmrMethod,
        reason: calorieReason
      },
      fats: {
        target: targetFats,
        multiplier: fatMultiplier,
        reason: fatReason
      },
      carbs: {
        target: targetCarbs,
        reason: carbReason
      }
    }
  };
}

/**
 * Format protein explanation for display
 */
export function formatProteinExplanation(explanation: ProteinExplanation): string {
  const basisLabel = explanation.basis === 'LBM' ? 'lean mass' : 'body weight';
  const sourceLabel = explanation.bodyFatSource === 'user' ? '' : ' (estimated)';
  const referenceWeight = explanation.basis === 'LBM' ? explanation.lbm : (explanation.lbm / (1 - explanation.bodyFat / 100));
  
  return `Based on ${basisLabel}${sourceLabel}:\n${Math.round(explanation.basis === 'LBM' ? explanation.lbm : referenceWeight)}kg × ${explanation.multiplier.toFixed(1)}g/kg\n\nReason: ${explanation.reason}`;
}
