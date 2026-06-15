/**
 * Backend API Client
 * Handles all API requests to the backend
 */

import { ApiResponse } from '@cft/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get authentication token from Firebase
 */
const getAuthToken = async (): Promise<string | null> => {
  // TODO: Implement actual token retrieval from Firebase Auth
  // This is a placeholder
  return null;
};

/**
 * Make an authenticated API request
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * API client methods
 */
export const api = {
  // Quiz endpoints
  submitQuiz: async (responses: Record<string, string | number>) => {
    return apiRequest('/quiz', {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });
  },

  // Activity endpoints
  getActivities: async (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return apiRequest(`/activities?${queryParams}`);
  },

  createActivity: async (activity: unknown) => {
    return apiRequest('/activities', {
      method: 'POST',
      body: JSON.stringify({ activity }),
    });
  },

  // Score endpoints
  getScore: async (period?: 'week' | 'month' | 'year') => {
    const queryParams = period ? `?period=${period}` : '';
    return apiRequest(`/scores${queryParams}`);
  },

  // Tips endpoints
  getTips: async () => {
    return apiRequest('/tips');
  },
};

export default api;

// Made with Bob
