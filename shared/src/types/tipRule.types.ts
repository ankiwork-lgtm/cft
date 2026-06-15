/**
 * Tip Rule types for Carbon Footprint Tracker
 * Defines rule-based conditions for generating personalized tips
 */

import { ActivityCategory } from './activity.types';
import { TipPriority } from './tip.types';

export type TipRuleConditionType =
  | 'category_percentage' // Category exceeds % of total
  | 'category_absolute' // Category exceeds absolute CO2 value
  | 'activity_frequency' // Specific activity logged N+ times
  | 'no_activity' // No logs in N days
  | 'high_impact_activity' // Single activity exceeds threshold
  | 'always'; // Always show (default tips)

export interface TipRuleCondition {
  type: TipRuleConditionType;
  category?: ActivityCategory;
  activityType?: string;
  threshold?: number; // Percentage (0-100) or absolute value or count
  days?: number; // For time-based conditions
}

export interface TipRule {
  id: string;
  title: string;
  message: string;
  category: ActivityCategory | 'general';
  priority: TipPriority;
  condition: TipRuleCondition;
  estimatedSavingsKg: number; // Estimated CO2 savings per day/week
  savingsPeriod: 'day' | 'week';
  actionableSteps: string[];
  source?: string;
}

export interface EvaluatedTip {
  rule: TipRule;
  matchReason: string;
  relevanceScore: number; // 0-100, higher = more relevant
}

// Made with Bob