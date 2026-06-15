/**
 * Lifestyle Quiz Questions for Carbon Footprint Baseline Assessment
 * 
 * This quiz estimates a user's annual CO2 footprint across 4 categories:
 * - Transport: Commute and travel habits
 * - Food: Diet and eating patterns
 * - Energy: Home energy usage
 * - Shopping: Consumer habits
 * 
 * CO2 factors are based on:
 * - UK Government GHG Conversion Factors 2023
 * - EPA Greenhouse Gas Equivalencies Calculator
 * - Our World in Data carbon footprint research
 */

import { QuizQuestion } from '../types/quiz.types';

/**
 * Quiz questions with CO2 impact factors
 * 
 * CO2 factors represent kg CO2e per year for each answer option
 * These are estimates based on typical usage patterns
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // TRANSPORT CATEGORY
  {
    id: 'commute_mode',
    category: 'transport',
    question: 'What is your primary mode of transportation for daily commute?',
    type: 'multiple-choice',
    options: [
      {
        value: 'car_alone',
        label: 'Drive alone (petrol/diesel car)',
        co2Factor: 2400, // ~10 km/day * 250 days * 0.192 kg CO2/km (avg car)
      },
      {
        value: 'car_shared',
        label: 'Carpool/rideshare',
        co2Factor: 1200, // Half of driving alone
      },
      {
        value: 'public_transport',
        label: 'Bus or train',
        co2Factor: 600, // ~10 km/day * 250 days * 0.041 kg CO2/km (bus)
      },
      {
        value: 'bike_walk',
        label: 'Bike or walk',
        co2Factor: 0, // Zero emissions
      },
      {
        value: 'work_from_home',
        label: 'Work from home',
        co2Factor: 0, // Zero commute emissions
      },
    ],
  },
  {
    id: 'commute_distance',
    category: 'transport',
    question: 'How far is your daily commute (one way)?',
    type: 'multiple-choice',
    options: [
      {
        value: 'none',
        label: 'No commute / Work from home',
        co2Factor: 0,
      },
      {
        value: 'short',
        label: 'Less than 5 km',
        co2Factor: 0.5, // Multiplier for commute_mode
      },
      {
        value: 'medium',
        label: '5-15 km',
        co2Factor: 1.0, // Base multiplier
      },
      {
        value: 'long',
        label: '15-30 km',
        co2Factor: 2.0,
      },
      {
        value: 'very_long',
        label: 'More than 30 km',
        co2Factor: 3.0,
      },
    ],
  },
  {
    id: 'air_travel',
    category: 'transport',
    question: 'How many flights do you take per year?',
    type: 'multiple-choice',
    options: [
      {
        value: 'none',
        label: 'None',
        co2Factor: 0,
      },
      {
        value: 'rare',
        label: '1-2 short-haul flights',
        co2Factor: 600, // ~300 kg CO2 per short-haul return flight
      },
      {
        value: 'occasional',
        label: '3-5 flights (mix of short and long-haul)',
        co2Factor: 2000,
      },
      {
        value: 'frequent',
        label: '6+ flights or 2+ long-haul',
        co2Factor: 4000,
      },
    ],
  },

  // FOOD CATEGORY
  {
    id: 'diet_type',
    category: 'food',
    question: 'Which best describes your diet?',
    type: 'multiple-choice',
    options: [
      {
        value: 'high_meat',
        label: 'Meat with most meals (including beef/lamb)',
        co2Factor: 2500, // High meat diet: ~7.2 kg CO2e/day
      },
      {
        value: 'medium_meat',
        label: 'Meat several times a week',
        co2Factor: 1700, // Medium meat: ~5.2 kg CO2e/day
      },
      {
        value: 'low_meat',
        label: 'Meat occasionally (mostly chicken/fish)',
        co2Factor: 1200, // Low meat: ~4.0 kg CO2e/day
      },
      {
        value: 'vegetarian',
        label: 'Vegetarian (eggs and dairy)',
        co2Factor: 1000, // Vegetarian: ~3.8 kg CO2e/day
      },
      {
        value: 'vegan',
        label: 'Vegan (plant-based only)',
        co2Factor: 700, // Vegan: ~2.9 kg CO2e/day
      },
    ],
  },
  {
    id: 'food_waste',
    category: 'food',
    question: 'How much food do you typically waste?',
    type: 'multiple-choice',
    options: [
      {
        value: 'minimal',
        label: 'Very little - I plan meals and use leftovers',
        co2Factor: 0, // Baseline
      },
      {
        value: 'some',
        label: 'Some - occasional spoiled food',
        co2Factor: 200, // ~20% food waste adds emissions
      },
      {
        value: 'significant',
        label: 'Quite a bit - often throw away food',
        co2Factor: 400, // ~40% food waste
      },
    ],
  },

  // ENERGY CATEGORY
  {
    id: 'home_type',
    category: 'energy',
    question: 'What type of home do you live in?',
    type: 'multiple-choice',
    options: [
      {
        value: 'apartment',
        label: 'Apartment/flat',
        co2Factor: 1500, // Smaller space, shared walls
      },
      {
        value: 'small_house',
        label: 'Small house (1-2 bedrooms)',
        co2Factor: 2200,
      },
      {
        value: 'medium_house',
        label: 'Medium house (3 bedrooms)',
        co2Factor: 3000,
      },
      {
        value: 'large_house',
        label: 'Large house (4+ bedrooms)',
        co2Factor: 4000,
      },
    ],
  },
  {
    id: 'household_size',
    category: 'energy',
    question: 'How many people live in your household?',
    type: 'multiple-choice',
    options: [
      {
        value: '1',
        label: '1 (just me)',
        co2Factor: 1.0, // Full impact
      },
      {
        value: '2',
        label: '2 people',
        co2Factor: 0.6, // Shared impact
      },
      {
        value: '3',
        label: '3 people',
        co2Factor: 0.4,
      },
      {
        value: '4+',
        label: '4 or more people',
        co2Factor: 0.3,
      },
    ],
  },
  {
    id: 'heating_type',
    category: 'energy',
    question: 'What is your primary heating source?',
    type: 'multiple-choice',
    options: [
      {
        value: 'gas',
        label: 'Natural gas',
        co2Factor: 1.2, // Multiplier for home_type
      },
      {
        value: 'electric',
        label: 'Electric heating',
        co2Factor: 1.0, // Base multiplier
      },
      {
        value: 'oil',
        label: 'Oil or coal',
        co2Factor: 1.5, // Higher emissions
      },
      {
        value: 'renewable',
        label: 'Heat pump or renewable',
        co2Factor: 0.5, // Lower emissions
      },
      {
        value: 'minimal',
        label: 'Minimal heating needed',
        co2Factor: 0.3,
      },
    ],
  },

  // SHOPPING CATEGORY
  {
    id: 'shopping_frequency',
    category: 'shopping',
    question: 'How often do you buy new clothes, electronics, or other goods?',
    type: 'multiple-choice',
    options: [
      {
        value: 'minimal',
        label: 'Rarely - only when necessary',
        co2Factor: 500, // Minimal consumption
      },
      {
        value: 'moderate',
        label: 'Occasionally - a few times per month',
        co2Factor: 1200, // Average consumption
      },
      {
        value: 'frequent',
        label: 'Regularly - weekly shopping',
        co2Factor: 2000, // High consumption
      },
      {
        value: 'very_frequent',
        label: 'Very often - love shopping!',
        co2Factor: 3000, // Very high consumption
      },
    ],
  },
  {
    id: 'shopping_habits',
    category: 'shopping',
    question: 'Which best describes your shopping habits?',
    type: 'multiple-choice',
    options: [
      {
        value: 'secondhand',
        label: 'Mostly secondhand/thrift shopping',
        co2Factor: 0.5, // Multiplier - much lower impact
      },
      {
        value: 'sustainable',
        label: 'Prefer sustainable/eco-friendly brands',
        co2Factor: 0.7, // Slightly lower impact
      },
      {
        value: 'mixed',
        label: 'Mix of new and secondhand',
        co2Factor: 0.85,
      },
      {
        value: 'conventional',
        label: 'Mostly new items from regular stores',
        co2Factor: 1.0, // Base multiplier
      },
      {
        value: 'fast_fashion',
        label: 'Fast fashion and frequent purchases',
        co2Factor: 1.3, // Higher impact
      },
    ],
  },
];

/**
 * National average CO2 footprint for comparison
 * Source: World Bank, Our World in Data (2023)
 * 
 * Global average: ~4.5 tonnes CO2e per person per year
 * US average: ~15 tonnes
 * EU average: ~7 tonnes
 * UK average: ~5.5 tonnes
 * 
 * We use 6000 kg (6 tonnes) as a reasonable developed-country average
 */
export const NATIONAL_AVERAGE_CO2 = 6000; // kg CO2e per year

/**
 * Goal reduction options (percentage reduction over 3 months)
 */
export const GOAL_OPTIONS = [
  { value: 5, label: '5% reduction', description: 'Small sustainable changes' },
  { value: 10, label: '10% reduction', description: 'Moderate lifestyle adjustments' },
  { value: 15, label: '15% reduction', description: 'Significant commitment' },
];

// Made with Bob
