/**
 * Emission Calculator Utility
 * Calculates CO2 emissions based on activity data and emission factors
 */

import { db } from '../config/firebase';
import { EmissionFactor, ActivityCategory } from '@cft/shared';

/**
 * Cache for emission factors to reduce Firestore reads
 */
let emissionFactorsCache: EmissionFactor[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Load emission factors from Firestore
 */
async function loadEmissionFactors(): Promise<EmissionFactor[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (emissionFactorsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return emissionFactorsCache;
  }

  console.log('📊 Loading emission factors from Firestore...');
  
  const snapshot = await db.collection('emissionFactors').get();
  
  emissionFactorsCache = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
  })) as EmissionFactor[];
  
  cacheTimestamp = now;
  
  console.log(`✅ Loaded ${emissionFactorsCache.length} emission factors`);
  
  return emissionFactorsCache;
}

/**
 * Find emission factor for a specific activity
 */
async function findEmissionFactor(
  category: ActivityCategory,
  activityType: string,
  unit: string
): Promise<EmissionFactor | null> {
  const factors = await loadEmissionFactors();
  
  const factor = factors.find(
    f => f.category === category && 
         f.activityType === activityType && 
         f.unit === unit
  );
  
  return factor || null;
}

/**
 * Calculate CO2 emissions for an activity
 * 
 * @param category - Activity category (transport, food, energy, shopping)
 * @param activityType - Specific activity type (e.g., 'car', 'beef', 'electricity')
 * @param quantity - Amount of activity
 * @param unit - Unit of measurement (e.g., 'km', 'servings', 'kWh')
 * @returns CO2 emissions in kg, or null if no matching factor found
 */
export async function calculateCO2(
  category: ActivityCategory,
  activityType: string,
  quantity: number,
  unit: string
): Promise<number | null> {
  try {
    const factor = await findEmissionFactor(category, activityType, unit);
    
    if (!factor) {
      console.warn(
        `⚠️  No emission factor found for: ${category}/${activityType}/${unit}`
      );
      return null;
    }
    
    const co2Kg = quantity * factor.kgCO2PerUnit;
    
    console.log(
      `🧮 Calculated CO2: ${quantity} ${unit} of ${activityType} = ${co2Kg.toFixed(2)} kg CO2e`
    );
    
    return co2Kg;
  } catch (error) {
    console.error('❌ Error calculating CO2:', error);
    throw error;
  }
}

/**
 * Get all emission factors for a category
 */
export async function getEmissionFactorsByCategory(
  category: ActivityCategory
): Promise<EmissionFactor[]> {
  const factors = await loadEmissionFactors();
  return factors.filter(f => f.category === category);
}

/**
 * Get all available activity types for a category
 */
export async function getActivityTypes(
  category: ActivityCategory
): Promise<string[]> {
  const factors = await getEmissionFactorsByCategory(category);
  return [...new Set(factors.map(f => f.activityType))];
}

/**
 * Clear the emission factors cache (useful for testing or after updates)
 */
export function clearEmissionFactorsCache(): void {
  emissionFactorsCache = null;
  cacheTimestamp = 0;
  console.log('🗑️  Emission factors cache cleared');
}

/**
 * Validate if an activity type exists for a category
 */
export async function validateActivity(
  category: ActivityCategory,
  activityType: string,
  unit: string
): Promise<boolean> {
  const factor = await findEmissionFactor(category, activityType, unit);
  return factor !== null;
}

// Made with Bob
