/**
 * API request/response interfaces for Carbon Footprint Tracker
 */

import { Activity, ActivityInput } from '../types/activity.types';
import { QuizSubmission, QuizResult } from '../types/quiz.types';
import { CarbonScore, ScoreTrend } from '../types/score.types';
import { TipCollection } from '../types/tip.types';

// Common API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Quiz API
export interface SubmitQuizRequest {
  responses: QuizSubmission['responses'];
  goalTarget?: number; // Optional goal percentage (5, 10, or 15)
}

export interface SubmitQuizResponse {
  result: QuizResult;
  baselineScore: number;
  currentScore: number;
  footprintEstimate: number; // Annual CO2 in kg
  nationalAverage: number; // For comparison
}

// Activity API
export interface CreateActivityRequest {
  activity: ActivityInput;
}

export interface CreateActivityResponse {
  activity: Activity;
}

export interface GetActivitiesRequest {
  startDate?: string;
  endDate?: string;
  category?: string;
  limit?: number;
}

export interface GetActivitiesResponse {
  activities: Activity[];
  total: number;
}

export interface UpdateActivityRequest {
  activityId: string;
  updates: Partial<ActivityInput>;
}

export interface DeleteActivityRequest {
  activityId: string;
}

// Score API
export interface GetScoreRequest {
  period?: 'week' | 'month' | 'year';
}

export interface GetScoreResponse {
  currentScore: CarbonScore;
  trend: ScoreTrend;
}

export interface GetScoreHistoryRequest {
  startDate?: string;
  endDate?: string;
}

export interface GetScoreHistoryResponse {
  scores: CarbonScore[];
}

// Dashboard API
export interface GetDashboardSummaryRequest {
  range?: 'week' | 'month';
}

export interface DashboardSummary {
  totalCO2: number;
  categoryBreakdown: {
    category: string;
    co2Kg: number;
    percentage: number;
  }[];
  dailyTotals: {
    date: string;
    total: number;
    byCategory: Record<string, number>;
  }[];
  goalProgress: {
    currentScore: number;
    baselineScore: number;
    percentageChange: number;
    goalTarget?: number;
    progressTowardGoal?: number;
  };
  period: {
    range: 'week' | 'month';
    startDate: string;
    endDate: string;
  };
  hasData: boolean;
}

export interface GetDashboardSummaryResponse {
  summary: DashboardSummary;
}

// Tips API
export interface GetTipsRequest {
  weekStart?: string;
}

export interface GetTipsResponse {
  tips: TipCollection;
}

export interface MarkTipViewedRequest {
  tipCollectionId: string;
}

// Auth API
export interface AuthTokenRequest {
  idToken: string;
}

export interface AuthTokenResponse {
  userId: string;
  email: string;
}

// Made with Bob
