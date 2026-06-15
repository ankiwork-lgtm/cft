/**
 * Tip Template types for Carbon Footprint Tracker
 * Static pool of tip templates with trigger conditions
 */

import { ActivityCategory } from './activity.types';

export type TipCategory = ActivityCategory | 'general';
export type TipPriority = 'high' | 'medium' | 'low';

export interface TipTriggerCondition {
  category?: TipCategory;
  minCO2Threshold?: number; // Minimum CO2 kg to trigger this tip
  activityTypes?: string[]; // Specific activity types that trigger this tip
  frequencyThreshold?: number; // Minimum number of activities to trigger
}

export interface TipTemplate {
  id: string;
  category: TipCategory;
  priority: TipPriority;
  title: string;
  description: string;
  actionableSteps: string[];
  potentialSavingsPercent: number; // Estimated % reduction
  triggerConditions: TipTriggerCondition;
  source?: string; // Citation for the tip
  createdAt: Date;
}

export interface TipTemplateInput {
  category: TipCategory;
  priority: TipPriority;
  title: string;
  description: string;
  actionableSteps: string[];
  potentialSavingsPercent: number;
  triggerConditions: TipTriggerCondition;
  source?: string;
}

// Made with Bob
