/**
 * Seed Emission Factors Data
 * Populates Firestore with emission factor reference data
 */

import { db } from '../config/firebase';
import { EmissionFactorInput } from '@cft/shared';

const emissionFactors: EmissionFactorInput[] = [
  // Transport emission factors (kg CO2e per km)
  {
    category: 'transport',
    activityType: 'car',
    unit: 'km',
    kgCO2PerUnit: 0.192,
    source: 'UK Government GHG Conversion Factors 2023',
    description: 'Average petrol car',
  },
  {
    category: 'transport',
    activityType: 'bus',
    unit: 'km',
    kgCO2PerUnit: 0.089,
    source: 'UK Government GHG Conversion Factors 2023',
    description: 'Local bus',
  },
  {
    category: 'transport',
    activityType: 'train',
    unit: 'km',
    kgCO2PerUnit: 0.041,
    source: 'UK Government GHG Conversion Factors 2023',
    description: 'National rail',
  },
  {
    category: 'transport',
    activityType: 'bike',
    unit: 'km',
    kgCO2PerUnit: 0,
    source: 'Zero emissions',
    description: 'Bicycle',
  },
  {
    category: 'transport',
    activityType: 'walk',
    unit: 'km',
    kgCO2PerUnit: 0,
    source: 'Zero emissions',
    description: 'Walking',
  },

  // Food emission factors (kg CO2e per serving)
  {
    category: 'food',
    activityType: 'beef',
    unit: 'servings',
    kgCO2PerUnit: 6.61,
    source: 'Our World in Data - Environmental Impacts of Food',
    description: 'Beef meal (200g)',
  },
  {
    category: 'food',
    activityType: 'pork',
    unit: 'servings',
    kgCO2PerUnit: 1.72,
    source: 'Our World in Data - Environmental Impacts of Food',
    description: 'Pork meal (200g)',
  },
  {
    category: 'food',
    activityType: 'chicken',
    unit: 'servings',
    kgCO2PerUnit: 0.89,
    source: 'Our World in Data - Environmental Impacts of Food',
    description: 'Chicken meal (200g)',
  },
  {
    category: 'food',
    activityType: 'fish',
    unit: 'servings',
    kgCO2PerUnit: 1.24,
    source: 'Our World in Data - Environmental Impacts of Food',
    description: 'Fish meal (200g)',
  },
  {
    category: 'food',
    activityType: 'vegetarian',
    unit: 'servings',
    kgCO2PerUnit: 0.39,
    source: 'Our World in Data - Environmental Impacts of Food',
    description: 'Vegetarian meal',
  },
  {
    category: 'food',
    activityType: 'vegan',
    unit: 'servings',
    kgCO2PerUnit: 0.29,
    source: 'Our World in Data - Environmental Impacts of Food',
    description: 'Vegan meal',
  },

  // Energy emission factors (kg CO2e per kWh)
  {
    category: 'energy',
    activityType: 'electricity',
    unit: 'kWh',
    kgCO2PerUnit: 0.385,
    source: 'US EPA eGRID 2023',
    description: 'Grid electricity (US average)',
  },
  {
    category: 'energy',
    activityType: 'gas',
    unit: 'kWh',
    kgCO2PerUnit: 0.185,
    source: 'UK Government GHG Conversion Factors 2023',
    description: 'Natural gas',
  },
  {
    category: 'energy',
    activityType: 'heating',
    unit: 'kWh',
    kgCO2PerUnit: 0.215,
    source: 'UK Government GHG Conversion Factors 2023',
    description: 'Heating oil',
  },
  {
    category: 'energy',
    activityType: 'cooling',
    unit: 'kWh',
    kgCO2PerUnit: 0.195,
    source: 'Estimated from electricity usage',
    description: 'Air conditioning',
  },

  // Shopping emission factors (kg CO2e per item)
  {
    category: 'shopping',
    activityType: 'clothing',
    unit: 'items',
    kgCO2PerUnit: 5.5,
    source: 'Ellen MacArthur Foundation',
    description: 'Average clothing item',
  },
  {
    category: 'shopping',
    activityType: 'electronics',
    unit: 'items',
    kgCO2PerUnit: 85.0,
    source: 'EPA Electronics Environmental Benefits Calculator',
    description: 'Average electronic device',
  },
  {
    category: 'shopping',
    activityType: 'furniture',
    unit: 'items',
    kgCO2PerUnit: 45.0,
    source: 'Furniture Industry Sustainability Programme',
    description: 'Average furniture item',
  },
  {
    category: 'shopping',
    activityType: 'other',
    unit: 'items',
    kgCO2PerUnit: 2.5,
    source: 'General consumer goods estimate',
    description: 'Other shopping items',
  },
];

async function seedEmissionFactors() {
  console.log('🌱 Starting emission factors seed...');

  try {
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

    console.log(`✅ Successfully seeded ${count} emission factors`);
    console.log('\nEmission factors by category:');
    
    const categories = ['transport', 'food', 'energy', 'shopping'];
    for (const category of categories) {
      const categoryFactors = emissionFactors.filter(f => f.category === category);
      console.log(`  ${category}: ${categoryFactors.length} factors`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding emission factors:', error);
    process.exit(1);
  }
}

// Run the seed function
seedEmissionFactors();

// Made with Bob