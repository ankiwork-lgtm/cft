/**
 * Emission Factor types for Carbon Footprint Tracker
 * Reference data for CO2 calculations
 */

export type EmissionCategory = 'transport' | 'food' | 'energy' | 'shopping';

export interface EmissionFactor {
  id: string;
  category: EmissionCategory;
  activityType: string;
  unit: string;
  kgCO2PerUnit: number;
  source: string; // Citation for the emission factor
  description?: string;
  lastUpdated: Date;
}

export interface EmissionFactorInput {
  category: EmissionCategory;
  activityType: string;
  unit: string;
  kgCO2PerUnit: number;
  source: string;
  description?: string;
}

// Made with Bob
