/**
 * Firestore document interfaces for Carbon Footprint Tracker
 */

import { ActivityCategory, ActivityType } from '../types/activity.types';
import { CategoryBreakdown } from '../types/score.types';
import { PersonalizedTip } from '../types/tip.types';
import { UserPreferences } from '../types/user.types';

// Firestore Timestamp type (compatible with both client and admin SDK)
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Firestore uses Timestamp instead of Date
// These interfaces represent the actual document structure in Firestore

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  createdAt: FirestoreTimestamp;
  baselineScore: number;
  preferences: UserPreferences;
}

export interface ActivityDocument {
  userId: string;
  date: FirestoreTimestamp;
  category: ActivityCategory;
  type: ActivityType;
  amount: number;
  unit: string;
  co2Impact: number;
  notes?: string;
  createdAt: FirestoreTimestamp;
}

export interface QuizResponseDocument {
  userId: string;
  responses: Record<string, string | number>;
  calculatedScore: number;
  breakdown: CategoryBreakdown;
  completedAt: FirestoreTimestamp;
}

export interface CarbonScoreDocument {
  userId: string;
  date: FirestoreTimestamp;
  score: number;
  breakdown: CategoryBreakdown;
  calculatedAt: FirestoreTimestamp;
}

export interface TipCollectionDocument {
  userId: string;
  weekStart: FirestoreTimestamp;
  tips: PersonalizedTip[];
  generatedAt: FirestoreTimestamp;
  viewed: boolean;
}

// Helper type to convert Date to FirestoreTimestamp in types
export type FirestoreDocument<T> = {
  [K in keyof T]: T[K] extends Date
    ? FirestoreTimestamp
    : T[K] extends Date | undefined
    ? FirestoreTimestamp | undefined
    : T[K];
};

// Made with Bob
