/**
 * Seed Script for Firestore
 * Loads emission factors and tip templates into Firestore
 *
 * Run with: npm run seed (add to package.json scripts)
 * Or: tsx src/scripts/seedData.ts
 */

// Load environment variables BEFORE importing Firebase config
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { db } from '../config/firebase';
import { EmissionFactorInput, TipTemplateInput } from '@cft/shared';

/**
 * Emission Factors Data
 * Sources: EPA, DEFRA, and other widely-cited public averages
 */
const emissionFactors: EmissionFactorInput[] = [
  // TRANSPORT
  // Source: EPA (2023) - Average passenger vehicle emissions
  {
    category: 'transport',
    activityType: 'car',
    unit: 'km',
    kgCO2PerUnit: 0.192,
    source: 'EPA 2023 - Average passenger vehicle (gasoline)',
    description: 'Average emissions for a gasoline passenger car',
  },
  {
    category: 'transport',
    activityType: 'car_electric',
    unit: 'km',
    kgCO2PerUnit: 0.053,
    source: 'EPA 2023 - Electric vehicle (US grid average)',
    description: 'Average emissions for an electric vehicle using US grid electricity',
  },
  // Source: DEFRA 2023 - Public transport emissions
  {
    category: 'transport',
    activityType: 'bus',
    unit: 'km',
    kgCO2PerUnit: 0.089,
    source: 'DEFRA 2023 - Average local bus',
    description: 'Average emissions per passenger for local bus travel',
  },
  {
    category: 'transport',
    activityType: 'train',
    unit: 'km',
    kgCO2PerUnit: 0.041,
    source: 'DEFRA 2023 - National rail',
    description: 'Average emissions per passenger for train travel',
  },
  {
    category: 'transport',
    activityType: 'subway',
    unit: 'km',
    kgCO2PerUnit: 0.028,
    source: 'DEFRA 2023 - London Underground',
    description: 'Average emissions per passenger for subway/metro travel',
  },
  // Source: ICAO Carbon Emissions Calculator
  {
    category: 'transport',
    activityType: 'flight_short',
    unit: 'km',
    kgCO2PerUnit: 0.255,
    source: 'ICAO 2023 - Short-haul flight (<1500km)',
    description: 'Average emissions per passenger for short-haul flights',
  },
  {
    category: 'transport',
    activityType: 'flight_long',
    unit: 'km',
    kgCO2PerUnit: 0.195,
    source: 'ICAO 2023 - Long-haul flight (>1500km)',
    description: 'Average emissions per passenger for long-haul flights',
  },
  {
    category: 'transport',
    activityType: 'bike',
    unit: 'km',
    kgCO2PerUnit: 0.0,
    source: 'Zero emissions',
    description: 'Cycling produces no direct emissions',
  },
  {
    category: 'transport',
    activityType: 'walk',
    unit: 'km',
    kgCO2PerUnit: 0.0,
    source: 'Zero emissions',
    description: 'Walking produces no direct emissions',
  },

  // FOOD
  // Source: Poore & Nemecek (2018) - Science journal, most comprehensive food emissions study
  {
    category: 'food',
    activityType: 'beef',
    unit: 'serving',
    kgCO2PerUnit: 6.61,
    source: 'Poore & Nemecek 2018 - Beef (200g serving)',
    description: 'Beef has the highest carbon footprint of common foods',
  },
  {
    category: 'food',
    activityType: 'lamb',
    unit: 'serving',
    kgCO2PerUnit: 4.85,
    source: 'Poore & Nemecek 2018 - Lamb (200g serving)',
    description: 'Lamb has a high carbon footprint due to methane emissions',
  },
  {
    category: 'food',
    activityType: 'pork',
    unit: 'serving',
    kgCO2PerUnit: 1.72,
    source: 'Poore & Nemecek 2018 - Pork (200g serving)',
    description: 'Pork has moderate emissions compared to other meats',
  },
  {
    category: 'food',
    activityType: 'chicken',
    unit: 'serving',
    kgCO2PerUnit: 0.89,
    source: 'Poore & Nemecek 2018 - Chicken (200g serving)',
    description: 'Chicken has lower emissions than red meat',
  },
  {
    category: 'food',
    activityType: 'fish',
    unit: 'serving',
    kgCO2PerUnit: 1.24,
    source: 'Poore & Nemecek 2018 - Fish (200g serving)',
    description: 'Fish emissions vary by species and fishing method',
  },
  {
    category: 'food',
    activityType: 'cheese',
    unit: 'serving',
    kgCO2PerUnit: 2.37,
    source: 'Poore & Nemecek 2018 - Cheese (100g serving)',
    description: 'Cheese has high emissions due to dairy production',
  },
  {
    category: 'food',
    activityType: 'eggs',
    unit: 'serving',
    kgCO2PerUnit: 0.51,
    source: 'Poore & Nemecek 2018 - Eggs (2 eggs)',
    description: 'Eggs have relatively low emissions',
  },
  {
    category: 'food',
    activityType: 'vegetarian',
    unit: 'meal',
    kgCO2PerUnit: 0.39,
    source: 'Poore & Nemecek 2018 - Average vegetarian meal',
    description: 'Vegetarian meals have significantly lower emissions',
  },
  {
    category: 'food',
    activityType: 'vegan',
    unit: 'meal',
    kgCO2PerUnit: 0.29,
    source: 'Poore & Nemecek 2018 - Average vegan meal',
    description: 'Vegan meals have the lowest emissions',
  },

  // ENERGY
  // Source: EPA eGRID 2023 - US electricity grid emissions
  {
    category: 'energy',
    activityType: 'electricity',
    unit: 'kWh',
    kgCO2PerUnit: 0.385,
    source: 'EPA eGRID 2023 - US national average',
    description: 'Average US grid electricity emissions',
  },
  {
    category: 'energy',
    activityType: 'electricity_renewable',
    unit: 'kWh',
    kgCO2PerUnit: 0.0,
    source: 'Zero emissions for renewable energy',
    description: 'Solar, wind, and other renewables produce no direct emissions',
  },
  // Source: EPA - Natural gas emissions
  {
    category: 'energy',
    activityType: 'natural_gas',
    unit: 'kWh',
    kgCO2PerUnit: 0.185,
    source: 'EPA 2023 - Natural gas combustion',
    description: 'Natural gas heating emissions',
  },
  {
    category: 'energy',
    activityType: 'heating_oil',
    unit: 'kWh',
    kgCO2PerUnit: 0.247,
    source: 'EPA 2023 - Heating oil combustion',
    description: 'Heating oil emissions',
  },

  // SHOPPING
  // Source: Various studies on consumer goods lifecycle emissions
  {
    category: 'shopping',
    activityType: 'clothing_new',
    unit: 'item',
    kgCO2PerUnit: 5.5,
    source: 'Ellen MacArthur Foundation 2017 - Average clothing item',
    description: 'New clothing production has significant emissions',
  },
  {
    category: 'shopping',
    activityType: 'clothing_secondhand',
    unit: 'item',
    kgCO2PerUnit: 0.5,
    source: 'Estimated - Secondhand clothing',
    description: 'Secondhand clothing avoids production emissions',
  },
  {
    category: 'shopping',
    activityType: 'electronics_phone',
    unit: 'item',
    kgCO2PerUnit: 55.0,
    source: 'Apple Environmental Report 2023 - iPhone production',
    description: 'Smartphone production emissions',
  },
  {
    category: 'shopping',
    activityType: 'electronics_laptop',
    unit: 'item',
    kgCO2PerUnit: 200.0,
    source: 'Dell Product Carbon Footprint 2023 - Average laptop',
    description: 'Laptop production emissions',
  },
  {
    category: 'shopping',
    activityType: 'furniture',
    unit: 'item',
    kgCO2PerUnit: 50.0,
    source: 'Estimated - Average furniture item',
    description: 'Furniture production and transport emissions',
  },
  {
    category: 'shopping',
    activityType: 'books',
    unit: 'item',
    kgCO2PerUnit: 1.0,
    source: 'Green Press Initiative - Average book',
    description: 'Book production emissions',
  },
];

/**
 * Tip Templates Data
 * Evidence-based tips for reducing carbon footprint
 */
const tipTemplates: TipTemplateInput[] = [
  // TRANSPORT TIPS
  {
    category: 'transport',
    priority: 'high',
    title: 'Switch to Public Transportation',
    description: 'Using public transport instead of driving alone can reduce your transport emissions by up to 45%.',
    actionableSteps: [
      'Plan your route using public transit apps',
      'Consider a monthly transit pass for regular commutes',
      'Combine walking or cycling with public transport',
    ],
    potentialSavingsPercent: 45,
    triggerConditions: {
      category: 'transport',
      minCO2Threshold: 50,
      activityTypes: ['car'],
    },
    source: 'EPA - Public Transportation Benefits',
  },
  {
    category: 'transport',
    priority: 'high',
    title: 'Consider an Electric Vehicle',
    description: 'Electric vehicles produce 60-70% less emissions than gasoline cars over their lifetime.',
    actionableSteps: [
      'Research EV models that fit your needs',
      'Check for local EV incentives and rebates',
      'Install home charging if possible',
    ],
    potentialSavingsPercent: 65,
    triggerConditions: {
      category: 'transport',
      minCO2Threshold: 100,
      activityTypes: ['car'],
      frequencyThreshold: 20,
    },
    source: 'Union of Concerned Scientists - EV Emissions Study',
  },
  {
    category: 'transport',
    priority: 'medium',
    title: 'Bike or Walk for Short Trips',
    description: 'Half of all car trips are less than 3 miles. Biking or walking these distances eliminates emissions entirely.',
    actionableSteps: [
      'Identify trips under 3 miles that you could bike or walk',
      'Invest in a comfortable bike or walking shoes',
      'Plan routes using bike-friendly paths',
    ],
    potentialSavingsPercent: 100,
    triggerConditions: {
      category: 'transport',
      minCO2Threshold: 20,
    },
    source: 'League of American Bicyclists',
  },

  // FOOD TIPS
  {
    category: 'food',
    priority: 'high',
    title: 'Reduce Beef Consumption',
    description: 'Beef has the highest carbon footprint of all foods. Reducing beef by just one meal per week can save 300kg CO2 per year.',
    actionableSteps: [
      'Try "Meatless Mondays" or similar initiatives',
      'Substitute beef with chicken, fish, or plant-based proteins',
      'Explore new vegetarian recipes',
    ],
    potentialSavingsPercent: 50,
    triggerConditions: {
      category: 'food',
      minCO2Threshold: 30,
      activityTypes: ['beef'],
    },
    source: 'Poore & Nemecek 2018 - Science',
  },
  {
    category: 'food',
    priority: 'medium',
    title: 'Eat More Plant-Based Meals',
    description: 'Plant-based meals produce 10-50 times less emissions than meat-based meals.',
    actionableSteps: [
      'Start with one plant-based meal per day',
      'Explore diverse cuisines with plant-based traditions',
      'Focus on whole foods like beans, lentils, and vegetables',
    ],
    potentialSavingsPercent: 40,
    triggerConditions: {
      category: 'food',
      minCO2Threshold: 20,
    },
    source: 'Oxford University - Food Emissions Study',
  },
  {
    category: 'food',
    priority: 'medium',
    title: 'Reduce Food Waste',
    description: 'Food waste accounts for 8-10% of global emissions. Planning meals and proper storage can cut waste significantly.',
    actionableSteps: [
      'Plan weekly meals and make shopping lists',
      'Store food properly to extend freshness',
      'Use leftovers creatively',
      'Compost food scraps when possible',
    ],
    potentialSavingsPercent: 25,
    triggerConditions: {
      category: 'food',
      minCO2Threshold: 15,
    },
    source: 'UN FAO - Food Waste Report',
  },

  // ENERGY TIPS
  {
    category: 'energy',
    priority: 'high',
    title: 'Switch to Renewable Energy',
    description: 'Switching to renewable energy can eliminate your electricity emissions entirely.',
    actionableSteps: [
      'Check if your utility offers renewable energy plans',
      'Consider installing solar panels if you own your home',
      'Look into community solar programs',
    ],
    potentialSavingsPercent: 100,
    triggerConditions: {
      category: 'energy',
      minCO2Threshold: 50,
      activityTypes: ['electricity'],
    },
    source: 'EPA - Green Power Partnership',
  },
  {
    category: 'energy',
    priority: 'medium',
    title: 'Improve Home Energy Efficiency',
    description: 'Simple efficiency improvements can reduce energy use by 20-30%.',
    actionableSteps: [
      'Replace old bulbs with LED lights',
      'Use a programmable thermostat',
      'Seal air leaks around windows and doors',
      'Upgrade to energy-efficient appliances',
    ],
    potentialSavingsPercent: 25,
    triggerConditions: {
      category: 'energy',
      minCO2Threshold: 30,
    },
    source: 'Department of Energy - Energy Saver Guide',
  },

  // SHOPPING TIPS
  {
    category: 'shopping',
    priority: 'medium',
    title: 'Buy Secondhand When Possible',
    description: 'Buying secondhand eliminates production emissions and extends product lifecycles.',
    actionableSteps: [
      'Check thrift stores and online marketplaces first',
      'Join local buy-nothing or swap groups',
      'Consider refurbished electronics',
    ],
    potentialSavingsPercent: 80,
    triggerConditions: {
      category: 'shopping',
      minCO2Threshold: 20,
    },
    source: 'Ellen MacArthur Foundation - Circular Economy',
  },
  {
    category: 'shopping',
    priority: 'low',
    title: 'Choose Quality Over Quantity',
    description: 'Buying fewer, higher-quality items that last longer reduces overall emissions.',
    actionableSteps: [
      'Research product durability before purchasing',
      'Repair items instead of replacing them',
      'Avoid impulse purchases',
    ],
    potentialSavingsPercent: 30,
    triggerConditions: {
      category: 'shopping',
      minCO2Threshold: 15,
    },
    source: 'Right to Repair Movement',
  },

  // GENERAL TIPS
  {
    category: 'general',
    priority: 'medium',
    title: 'Track Your Progress',
    description: 'Regularly monitoring your carbon footprint helps maintain awareness and motivation.',
    actionableSteps: [
      'Review your dashboard weekly',
      'Set monthly reduction goals',
      'Celebrate your progress',
    ],
    potentialSavingsPercent: 15,
    triggerConditions: {},
    source: 'Behavioral Science - Goal Setting Research',
  },
];

/**
 * Seed emission factors into Firestore
 */
async function seedEmissionFactors() {
  console.log('📊 Seeding emission factors...');
  
  const batch = db.batch();
  let count = 0;

  for (const factor of emissionFactors) {
    const docRef = db.collection('emissionFactors').doc();
    batch.set(docRef, {
      ...factor,
      lastUpdated: new Date(),
    });
    count++;
  }

  await batch.commit();
  console.log(`✅ Seeded ${count} emission factors`);
}

/**
 * Seed tip templates into Firestore
 */
async function seedTipTemplates() {
  console.log('💡 Seeding tip templates...');
  
  const batch = db.batch();
  let count = 0;

  for (const tip of tipTemplates) {
    const docRef = db.collection('tips').doc();
    batch.set(docRef, {
      ...tip,
      createdAt: new Date(),
    });
    count++;
  }

  await batch.commit();
  console.log(`✅ Seeded ${count} tip templates`);
}

/**
 * Main seed function
 */
async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');
    
    await seedEmissionFactors();
    await seedTipTemplates();
    
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed();
}

export { seed, seedEmissionFactors, seedTipTemplates };

// Made with Bob
