/**
 * Activity Log types for Carbon Footprint Tracker
 * Subcollection under users/{uid}/entries/{entryId}
 */

import { ActivityCategory } from './activity.types';

export interface ActivityLogEntry {
  id: string;
  userId: string;
  date: Date;
  category: ActivityCategory;
  activityType: string;
  quantity: number;
  unit: string;
  co2Kg: number;
  createdAt: Date;
  notes?: string;
}

export interface ActivityLogInput {
  date: Date;
  category: ActivityCategory;
  activityType: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface ActivityLogSummary {
  totalCO2Kg: number;
  byCategory: Record<ActivityCategory, number>;
  entryCount: number;
  period: {
    start: Date;
    end: Date;
  };
}

// Made with Bob
