/**
 * User-related types for Carbon Footprint Tracker
 */

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  quizCompleted: boolean;
  quizAnswers?: Record<string, string | number>;
  baselineScore: number;
  currentScore: number;
  goalTarget?: number;
  preferences: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  weeklyTips: boolean;
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  quizCompleted: boolean;
  baselineScore: number;
  currentScore: number;
  goalTarget?: number;
  joinedDate: Date;
}

// Made with Bob
