/**
 * Today View Page
 * Shows today's activity entries grouped by category with daily target
 * Updated with improved UI/UX and CO2 translator
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ActivityCategory, ActivityLogEntry } from '@cft/shared';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { getPrimaryComparison } from '../utils/co2Translator';

interface DayData {
  date: string;
  entries: ActivityLogEntry[];
  totals: {
    total: number;
    byCategory: Record<ActivityCategory, number>;
  };
  entryCount: number;
}

interface CategoryDisplay {
  label: string;
  icon: string;
  color: string;
}

const CATEGORY_DISPLAY: Record<ActivityCategory, CategoryDisplay> = {
  transport: { label: 'Transport', icon: '🚗', color: 'blue' },
  food: { label: 'Food', icon: '🍽️', color: 'green' },
  energy: { label: 'Energy', icon: '⚡', color: 'yellow' },
  shopping: { label: 'Shopping', icon: '🛍️', color: 'purple' },
};

export const TodayView: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dailyTarget, setDailyTarget] = useState<number>(0);
  // Issue 5: state for accessible ConfirmDialog (replaces window.confirm)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteLabel, setPendingDeleteLabel] = useState<string>('');

  // Calculate daily target from user's baseline and goal
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get<any>('/quiz/result');
        const { baselineScore, goalTarget } = response.data || {};

        // Daily target = (baseline * (1 - goalPercentage/100)) / 365
        const annualTarget = goalTarget
          ? baselineScore * (1 - goalTarget / 100)
          : baselineScore;

        const daily = annualTarget / 365;
        setDailyTarget(parseFloat(daily.toFixed(2)));
      } catch (err: unknown) {
        // 404 = quiz not taken yet (expected)
        // 401 = Firebase auth token not yet ready on mount (expected race condition)
        // 0   = network error (handled separately by apiRequest)
        const status = (err as { status?: number })?.status;
        const isSilentError = status === 404 || status === 401;
        if (!isSilentError) {
          console.error('Failed to fetch user data:', err);
        }
        // Default to 13.7 kg CO2/day (≈ 5000 kg annual / 365 days)
        setDailyTarget(13.7);
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchTodayData = async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const response = await api.get<any>(`/logs/entries?date=${today}`);
      setDayData(response.data);  // apiRequest already unwraps JSON: response = { success, data }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load today's activities";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, []);

  // Issue 5: open ConfirmDialog instead of calling window.confirm()
  const handleDelete = (entryId: string, activityLabel: string) => {
    setPendingDeleteId(entryId);
    setPendingDeleteLabel(activityLabel);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!pendingDeleteId) return;
    setConfirmOpen(false);
    setDeletingId(pendingDeleteId);

    try {
      await api.delete(`/logs/entries/${pendingDeleteId}`);
      // Refresh data
      await fetchTodayData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(message);
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
      setPendingDeleteLabel('');
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
    setPendingDeleteLabel('');
  };

  const getProgressColor = (current: number, target: number): string => {
    const percentage = (current / target) * 100;
    if (percentage <= 80) return 'primary';
    if (percentage <= 100) return 'yellow';
    return 'amber';
  };

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading today's activities..." />;
  }

  const totalCO2 = dayData?.totals.total || 0;
  const progressColor = getProgressColor(totalCO2, dailyTarget);
  const progressPercentage = getProgressPercentage(totalCO2, dailyTarget);
  const totalComparison = getPrimaryComparison(totalCO2);

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Issue 1: use <Link> instead of <button onClick(navigate)> */}
          <Link
            to="/dashboard"
            className="text-primary-600 hover:text-primary-700 mb-4 flex items-center font-medium transition-colors focus:outline-none focus:underline"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">Today's Activities</h1>
          <p className="text-neutral-600 mt-2">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={fetchTodayData} />
          </div>
        )}

        {/* Daily Progress Card */}
        <div className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 mb-6 border border-neutral-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">Daily Progress</h2>
            <Link
              to="/log-activity"
              className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all transform hover:scale-105 font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              + Log Activity
            </Link>
          </div>

          <div className="space-y-6">
            {/* Total CO2 */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2 mb-3">
                <span className="text-neutral-700 font-medium">Total CO2 Today</span>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-neutral-900">
                    {totalCO2.toFixed(2)} kg
                  </div>
                  <div className="text-sm text-primary-600 mt-1">
                    {totalComparison.icon} ≈ {totalComparison.value} {totalComparison.description}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-neutral-600 mb-2">
                <span>Daily Target: {dailyTarget.toFixed(2)} kg</span>
                <span className={`font-medium ${
                  progressColor === 'primary' ? 'text-primary-600' :
                  progressColor === 'yellow' ? 'text-yellow-600' :
                  'text-amber-600'
                }`}>
                  {totalCO2 <= dailyTarget 
                    ? `${(dailyTarget - totalCO2).toFixed(2)} kg remaining 🎉`
                    : `${(totalCO2 - dailyTarget).toFixed(2)} kg over target 💪`
                  }
                </span>
              </div>
              {/* Issue 3: add role=progressbar + ARIA values */}
              <div
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Daily CO₂ progress: ${progressPercentage.toFixed(0)}% of target`}
                className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden"
              >
                <div
                  className={`h-full transition-all duration-500 ${
                    progressColor === 'primary' ? 'bg-gradient-to-r from-primary-500 to-primary-600' :
                    progressColor === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    'bg-gradient-to-r from-amber-400 to-amber-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t-2 border-neutral-100">
              {(Object.keys(CATEGORY_DISPLAY) as ActivityCategory[]).map((category) => {
                const display = CATEGORY_DISPLAY[category];
                const value = dayData?.totals.byCategory[category] || 0;
                return (
                  <div key={category} className="text-center p-3 bg-neutral-50 rounded-xl">
                    <div className="text-3xl mb-2">{display.icon}</div>
                    <div className="text-sm text-neutral-600 mb-1">{display.label}</div>
                    <div className="text-lg font-semibold text-neutral-900">{value.toFixed(2)} kg</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activity Entries by Category */}
        {dayData && dayData.entryCount > 0 ? (
          <div className="space-y-6">
            {(Object.keys(CATEGORY_DISPLAY) as ActivityCategory[]).map((category) => {
              const categoryEntries = dayData.entries.filter(e => e.category === category);
              
              if (categoryEntries.length === 0) return null;

              const display = CATEGORY_DISPLAY[category];

              return (
                <div key={category} className="bg-white rounded-2xl shadow-soft p-6 border border-neutral-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="text-3xl mr-3">{display.icon}</span>
                    <span className="text-neutral-900">{display.label}</span>
                    <span className="ml-auto text-sm font-normal text-neutral-600">
                      {categoryEntries.length} {categoryEntries.length === 1 ? 'entry' : 'entries'}
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {categoryEntries.map((entry) => {
                      const comparison = getPrimaryComparison(entry.co2Kg);
                      return (
                        <div
                          key={entry.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-neutral-50 rounded-xl"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-neutral-900 capitalize mb-1">
                              {entry.activityType.replace(/-/g, ' ')}
                            </div>
                            <div className="text-sm text-neutral-600">
                              {entry.quantity} {entry.unit}
                              {entry.notes && ` • ${entry.notes}`}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                              {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="flex-1 sm:flex-initial text-left sm:text-right">
                              <div className="font-semibold text-lg text-neutral-900">
                                {entry.co2Kg.toFixed(2)} kg
                              </div>
                              <div className="text-xs text-primary-600">
                                {comparison.icon} ≈ {comparison.value} {comparison.description}
                              </div>
                            </div>
                            {/* Issue 2: aria-label + Issue 5: opens ConfirmDialog instead of window.confirm */}
                            <button
                              onClick={() => handleDelete(entry.id, entry.activityType.replace(/-/g, ' '))}
                              disabled={deletingId === entry.id}
                              aria-label={`Delete ${entry.activityType.replace(/-/g, ' ')} entry`}
                              aria-busy={deletingId === entry.id}
                              className="text-amber-600 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
                            >
                              <span aria-hidden="true">{deletingId === entry.id ? '...' : '🗑️'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft p-12 border border-neutral-200">
            <EmptyState
              icon="📝"
              title="No activities logged today"
              description="Start tracking your carbon footprint by logging your first activity"
              actionLabel="Log Your First Activity"
              onAction={() => navigate('/log-activity')}
            />
          </div>
        )}
      </div>
    </div>

    {/* Issue 5: Accessible ConfirmDialog replaces window.confirm() */}
    <ConfirmDialog
      isOpen={confirmOpen}
      title="Delete Activity"
      message={`Are you sure you want to delete the "${pendingDeleteLabel}" entry? This cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Keep it"
      isDestructive
      onConfirm={executeDelete}
      onCancel={cancelDelete}
    />
    </>
  );
};

// Made with Bob