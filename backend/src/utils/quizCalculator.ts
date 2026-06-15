/**
 * Quiz Calculator - Calculate CO2 footprint and Carbon Score from quiz responses
 *
 * This module processes quiz answers and estimates annual CO2 footprint
 * using documented assumptions and conversion factors.
 */

import { QuizResponse } from '@cft/shared';
import { QUIZ_QUESTIONS, NATIONAL_AVERAGE_CO2 } from '@cft/shared';

interface QuizCalculationResult {
  footprintEstimate: number; // Annual CO2 in kg
  baselineScore: number; // 0-100 score (higher is better)
  breakdown: {
    transport: number;
    food: number;
    energy: number;
    shopping: number;
  };
}

/**
 * Calculate annual CO2 footprint from quiz responses
 * 
 * Formula breakdown by category:
 * 
 * TRANSPORT:
 * - Base commute emissions from commute_mode
 * - Multiplied by commute_distance factor
 * - Plus air_travel emissions
 * 
 * FOOD:
 * - Base diet emissions from diet_type
 * - Plus food_waste additional emissions
 * 
 * ENERGY:
 * - Base home emissions from home_type
 * - Multiplied by heating_type factor
 * - Divided by household_size (shared impact)
 * 
 * SHOPPING:
 * - Base shopping emissions from shopping_frequency
 * - Multiplied by shopping_habits factor
 * 
 * @param responses - Array of quiz responses
 * @returns Calculation result with footprint, score, and breakdown
 */
export function calculateFootprintFromQuiz(
  responses: QuizResponse[]
): QuizCalculationResult {
  // Convert responses array to map for easy lookup
  const answersMap = new Map<string, string | number>();
  responses.forEach((r) => answersMap.set(r.questionId, r.answer));

  // Initialize category totals
  let transportTotal = 0;
  let foodTotal = 0;
  let energyTotal = 0;
  let shoppingTotal = 0;

  // TRANSPORT CALCULATION
  // Get commute mode base emissions
  const commuteMode = answersMap.get('commute_mode');
  const commuteModeQuestion = QUIZ_QUESTIONS.find((q) => q.id === 'commute_mode');
  const commuteModeOption = commuteModeQuestion?.options?.find(
    (opt) => opt.value === commuteMode
  );
  let commuteEmissions = commuteModeOption?.co2Factor || 0;

  // Apply distance multiplier
  const commuteDistance = answersMap.get('commute_distance');
  const commuteDistanceQuestion = QUIZ_QUESTIONS.find(
    (q) => q.id === 'commute_distance'
  );
  const commuteDistanceOption = commuteDistanceQuestion?.options?.find(
    (opt) => opt.value === commuteDistance
  );
  const distanceMultiplier = commuteDistanceOption?.co2Factor || 1.0;
  commuteEmissions *= distanceMultiplier;

  // Add air travel
  const airTravel = answersMap.get('air_travel');
  const airTravelQuestion = QUIZ_QUESTIONS.find((q) => q.id === 'air_travel');
  const airTravelOption = airTravelQuestion?.options?.find(
    (opt) => opt.value === airTravel
  );
  const airTravelEmissions = airTravelOption?.co2Factor || 0;

  transportTotal = commuteEmissions + airTravelEmissions;

  // FOOD CALCULATION
  // Get diet base emissions
  const dietType = answersMap.get('diet_type');
  const dietTypeQuestion = QUIZ_QUESTIONS.find((q) => q.id === 'diet_type');
  const dietTypeOption = dietTypeQuestion?.options?.find(
    (opt) => opt.value === dietType
  );
  let dietEmissions = dietTypeOption?.co2Factor || 1700; // Default to medium meat

  // Add food waste
  const foodWaste = answersMap.get('food_waste');
  const foodWasteQuestion = QUIZ_QUESTIONS.find((q) => q.id === 'food_waste');
  const foodWasteOption = foodWasteQuestion?.options?.find(
    (opt) => opt.value === foodWaste
  );
  const foodWasteEmissions = foodWasteOption?.co2Factor || 0;

  foodTotal = dietEmissions + foodWasteEmissions;

  // ENERGY CALCULATION
  // Get home type base emissions
  const homeType = answersMap.get('home_type');
  const homeTypeQuestion = QUIZ_QUESTIONS.find((q) => q.id === 'home_type');
  const homeTypeOption = homeTypeQuestion?.options?.find(
    (opt) => opt.value === homeType
  );
  let homeEmissions = homeTypeOption?.co2Factor || 2200; // Default to small house

  // Apply heating type multiplier
  const heatingType = answersMap.get('heating_type');
  const heatingTypeQuestion = QUIZ_QUESTIONS.find((q) => q.id === 'heating_type');
  const heatingTypeOption = heatingTypeQuestion?.options?.find(
    (opt) => opt.value === heatingType
  );
  const heatingMultiplier = heatingTypeOption?.co2Factor || 1.0;
  homeEmissions *= heatingMultiplier;

  // Divide by household size (shared impact)
  const householdSize = answersMap.get('household_size');
  const householdSizeQuestion = QUIZ_QUESTIONS.find(
    (q) => q.id === 'household_size'
  );
  const householdSizeOption = householdSizeQuestion?.options?.find(
    (opt) => opt.value === householdSize
  );
  const householdDivisor = householdSizeOption?.co2Factor || 1.0;
  homeEmissions *= householdDivisor;

  energyTotal = homeEmissions;

  // SHOPPING CALCULATION
  // Get shopping frequency base emissions
  const shoppingFrequency = answersMap.get('shopping_frequency');
  const shoppingFrequencyQuestion = QUIZ_QUESTIONS.find(
    (q) => q.id === 'shopping_frequency'
  );
  const shoppingFrequencyOption = shoppingFrequencyQuestion?.options?.find(
    (opt) => opt.value === shoppingFrequency
  );
  let shoppingEmissions = shoppingFrequencyOption?.co2Factor || 1200; // Default to moderate

  // Apply shopping habits multiplier
  const shoppingHabits = answersMap.get('shopping_habits');
  const shoppingHabitsQuestion = QUIZ_QUESTIONS.find(
    (q) => q.id === 'shopping_habits'
  );
  const shoppingHabitsOption = shoppingHabitsQuestion?.options?.find(
    (opt) => opt.value === shoppingHabits
  );
  const shoppingMultiplier = shoppingHabitsOption?.co2Factor || 1.0;
  shoppingEmissions *= shoppingMultiplier;

  shoppingTotal = shoppingEmissions;

  // Calculate total annual footprint
  const footprintEstimate = transportTotal + foodTotal + energyTotal + shoppingTotal;

  // Calculate Carbon Score (0-100, higher is better)
  // Formula: Score = 100 - (userFootprint / nationalAverage * 100)
  // Capped at 0-100 range
  // 
  // Examples:
  // - User at 3000 kg (50% of average): Score = 100 - (3000/6000 * 100) = 50
  // - User at 6000 kg (100% of average): Score = 100 - (6000/6000 * 100) = 0
  // - User at 9000 kg (150% of average): Score = 100 - (9000/6000 * 100) = -50 → capped to 0
  // - User at 1500 kg (25% of average): Score = 100 - (1500/6000 * 100) = 75
  //
  // This means:
  // - Score 100 = zero emissions (theoretical)
  // - Score 75 = 25% of national average (excellent)
  // - Score 50 = 50% of national average (good)
  // - Score 0 = at or above national average (needs improvement)
  const rawScore = 100 - (footprintEstimate / NATIONAL_AVERAGE_CO2) * 100;
  const baselineScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    footprintEstimate: Math.round(footprintEstimate),
    baselineScore,
    breakdown: {
      transport: Math.round(transportTotal),
      food: Math.round(foodTotal),
      energy: Math.round(energyTotal),
      shopping: Math.round(shoppingTotal),
    },
  };
}

/**
 * Get a descriptive label for a Carbon Score
 */
export function getScoreLabel(score: number): string {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 25) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Calculate percentage difference from national average
 */
export function getPercentageFromAverage(footprint: number): number {
  const percentage = ((footprint - NATIONAL_AVERAGE_CO2) / NATIONAL_AVERAGE_CO2) * 100;
  return Math.round(percentage);
}

// Made with Bob
