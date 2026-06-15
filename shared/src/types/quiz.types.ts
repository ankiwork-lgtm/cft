/**
 * Quiz-related types for Carbon Footprint Tracker
 */

export interface QuizQuestion {
  id: string;
  category: 'transport' | 'food' | 'energy' | 'shopping';
  question: string;
  type: 'multiple-choice' | 'number' | 'slider';
  options?: QuizOption[];
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface QuizOption {
  value: string | number;
  label: string;
  co2Factor: number; // CO2 impact factor for this option
}

export interface QuizResponse {
  questionId: string;
  answer: string | number;
}

export interface QuizSubmission {
  userId: string;
  responses: QuizResponse[];
  completedAt: Date;
}

export interface QuizResult {
  userId: string;
  calculatedScore: number;
  breakdown: {
    transport: number;
    food: number;
    energy: number;
    shopping: number;
  };
  responses: Record<string, string | number>;
  completedAt: Date;
}

// Made with Bob
