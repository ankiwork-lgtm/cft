/**
 * Activity-related types for Carbon Footprint Tracker
 */

export type ActivityCategory = 'transport' | 'food' | 'energy' | 'shopping';

export type TransportType = 'car' | 'bus' | 'train' | 'flight' | 'bike' | 'walk';
export type FoodType = 'beef' | 'pork' | 'chicken' | 'fish' | 'vegetarian' | 'vegan';
export type EnergyType = 'electricity' | 'gas' | 'heating' | 'cooling';
export type ShoppingType = 'clothing' | 'electronics' | 'furniture' | 'other';

export type ActivityType = TransportType | FoodType | EnergyType | ShoppingType;

export interface Activity {
  id: string;
  userId: string;
  date: Date;
  category: ActivityCategory;
  type: ActivityType;
  amount: number;
  unit: string;
  co2Impact: number; // in kg CO2e
  notes?: string;
  createdAt: Date;
}

export interface ActivityInput {
  category: ActivityCategory;
  type: ActivityType;
  amount: number;
  unit: string;
  date?: Date;
  notes?: string;
}

export interface ActivitySummary {
  totalCO2: number;
  byCategory: Record<ActivityCategory, number>;
  activityCount: number;
  period: {
    start: Date;
    end: Date;
  };
}

// Made with Bob
