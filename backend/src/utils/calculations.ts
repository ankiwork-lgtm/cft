/**
 * CO2 Calculation Utilities
 * Placeholder for CO2 emission calculation logic
 */

import { ActivityCategory, ActivityType } from '@cft/shared';

/**
 * Calculate CO2 emissions for an activity
 * @param category - Activity category
 * @param type - Specific activity type
 * @param amount - Amount/quantity
 * @param unit - Unit of measurement
 * @returns CO2 emissions in kg
 */
export const calculateCO2 = (
  category: ActivityCategory,
  type: ActivityType,
  amount: number,
  unit: string
): number => {
  // TODO: Implement actual CO2 calculation logic
  // This is a placeholder that returns a simple calculation
  // Real implementation should use emission factors database

  // Example emission factors (kg CO2e per unit)
  const emissionFactors: Record<string, number> = {
    // Transport (per km)
    car: 0.192,
    bus: 0.089,
    train: 0.041,
    flight: 0.255,
    bike: 0,
    walk: 0,

    // Food (per serving)
    beef: 6.61,
    pork: 1.72,
    chicken: 0.89,
    fish: 1.24,
    vegetarian: 0.39,
    vegan: 0.29,

    // Energy (per kWh)
    electricity: 0.385,
    gas: 0.185,
    heating: 0.215,
    cooling: 0.195,

    // Shopping (per item/dollar)
    clothing: 0.5,
    electronics: 2.0,
    furniture: 1.5,
    other: 0.3,
  };

  const factor = emissionFactors[type] || 0.5; // Default factor if not found
  return amount * factor;
};

/**
 * Calculate baseline carbon score from quiz responses
 * @param responses - Quiz responses
 * @returns Baseline carbon score in kg CO2e per year
 */
export const calculateBaselineScore = (
  responses: Record<string, string | number>
): number => {
  // TODO: Implement actual baseline calculation logic
  // This is a placeholder
  let totalScore = 0;

  // Example calculation based on common quiz questions
  // Real implementation should use proper emission factors

  return totalScore || 5000; // Default baseline score
};

// Made with Bob
