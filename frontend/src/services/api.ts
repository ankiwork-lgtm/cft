/**
 * Backend API Client
 * Handles all API requests to the backend
 */

import {
  ApiResponse,
  SubmitQuizRequest,
  SubmitQuizResponse,
  DashboardSummary
} from '@cft/shared';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get authentication token from Firebase Auth
 */
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
};

/**
 * Make an authenticated API request
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Include status code — statusText is often empty in HTTP/2 (e.g., Cloud Run)
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody?.error?.message) {
        errorMessage += `: ${errBody.error.message}`;
      } else if (errBody?.message) {
        errorMessage += `: ${errBody.message}`;
      }
    } catch {
      // ignore JSON parse errors on error body
    }
    const err = new Error(errorMessage) as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  return response.json();
};

/**
 * API client methods
 */
export const api = {
  // Generic request methods
  get: async <T>(endpoint: string) => {
    return apiRequest<T>(endpoint, { method: 'GET' });
  },

  post: async <T>(endpoint: string, data: unknown) => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: async <T>(endpoint: string, data: unknown) => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async <T>(endpoint: string) => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
  },

  // Quiz endpoints
  submitQuiz: async (request: SubmitQuizRequest) => {
    return apiRequest<SubmitQuizResponse>('/quiz', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  getQuizResult: async () => {
    return apiRequest<SubmitQuizResponse>('/quiz/result', {
      method: 'GET',
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

  // Dashboard endpoints
  getDashboardSummary: async (range: 'week' | 'month' = 'week') => {
    return apiRequest<DashboardSummary>(`/dashboard/summary?range=${range}`);
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
