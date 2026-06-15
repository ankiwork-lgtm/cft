/**
 * Tip-related types for Carbon Footprint Tracker
 */

import { ActivityCategory } from './activity.types';

export type TipPriority = 'high' | 'medium' | 'low';

export interface Tip {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  priority: TipPriority;
  potentialSavings: number; // Estimated CO2 savings in kg
  actionable: boolean;
}

export interface PersonalizedTip extends Tip {
  userId: string;
  reason: string; // Why this tip was generated for the user
  generatedAt: Date;
}

export interface TipCollection {
  id: string;
  userId: string;
  weekStart: Date;
  tips: PersonalizedTip[];
  generatedAt: Date;
  viewed: boolean;
}

export interface TipFeedback {
  tipId: string;
  userId: string;
  helpful: boolean;
  implemented: boolean;
  feedback?: string;
  submittedAt: Date;
}

// Made with Bob
