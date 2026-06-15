/**
 * Carbon score-related types for Carbon Footprint Tracker
 */

import { ActivityCategory } from './activity.types';

export interface CarbonScore {
  id: string;
  userId: string;
  date: Date;
  score: number; // Total CO2 in kg
  breakdown: CategoryBreakdown;
  calculatedAt: Date;
}

export interface CategoryBreakdown {
  transport: number;
  food: number;
  energy: number;
  shopping: number;
}

export interface ScoreTrend {
  userId: string;
  period: 'week' | 'month' | 'year';
  scores: ScoreDataPoint[];
  average: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
}

export interface ScoreDataPoint {
  date: Date;
  score: number;
  breakdown: CategoryBreakdown;
}

export interface ScoreComparison {
  userScore: number;
  averageScore: number;
  percentile: number;
  category: ActivityCategory;
}

// Made with Bob
