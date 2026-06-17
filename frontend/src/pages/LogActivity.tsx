/**
 * Log Activity Page
 * Simplified one-tap logging interface with positive UX
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ActivityCategory } from '@cft/shared';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

interface ActivityOption {
  type: string;
  label: string;
  unit: string;
  defaultQuantity?: number;
}

interface CategoryConfig {
  label: string;
  icon: string;
  color: string;
  activities: ActivityOption[];
}

const ACTIVITY_CATEGORIES: Record<ActivityCategory, CategoryConfig> = {
  transport: {
    label: 'Transport',
    icon: '🚗',
    color: 'blue',
    activities: [
      { type: 'car', label: 'Car', unit: 'km', defaultQuantity: 10 },
      { type: 'bus', label: 'Bus', unit: 'km', defaultQuantity: 5 },
      { type: 'train', label: 'Train', unit: 'km', defaultQuantity: 20 },
      { type: 'bike', label: 'Bike', unit: 'km', defaultQuantity: 5 },
      { type: 'walk', label: 'Walk', unit: 'km', defaultQuantity: 2 },
    ],
  },
  food: {
    label: 'Food',
    icon: '🍽️',
    color: 'green',
    activities: [
      { type: 'beef', label: 'Beef Meal', unit: 'servings', defaultQuantity: 1 },
      { type: 'pork', label: 'Pork Meal', unit: 'servings', defaultQuantity: 1 },
      { type: 'chicken', label: 'Chicken Meal', unit: 'servings', defaultQuantity: 1 },
      { type: 'fish', label: 'Fish Meal', unit: 'servings', defaultQuantity: 1 },
      { type: 'vegetarian', label: 'Vegetarian Meal', unit: 'servings', defaultQuantity: 1 },
      { type: 'vegan', label: 'Vegan Meal', unit: 'servings', defaultQuantity: 1 },
    ],
  },
  energy: {
    label: 'Energy',
    icon: '⚡',
    color: 'yellow',
    activities: [
      { type: 'electricity', label: 'Electricity', unit: 'kWh', defaultQuantity: 10 },
      { type: 'gas', label: 'Natural Gas', unit: 'kWh', defaultQuantity: 5 },
      { type: 'heating', label: 'Heating', unit: 'kWh', defaultQuantity: 8 },
      { type: 'cooling', label: 'Cooling', unit: 'kWh', defaultQuantity: 6 },
    ],
  },
  shopping: {
    label: 'Shopping',
    icon: '🛍️',
    color: 'purple',
    activities: [
      { type: 'clothing', label: 'Clothing', unit: 'items', defaultQuantity: 1 },
      { type: 'electronics', label: 'Electronics', unit: 'items', defaultQuantity: 1 },
      { type: 'furniture', label: 'Furniture', unit: 'items', defaultQuantity: 1 },
      { type: 'other', label: 'Other', unit: 'items', defaultQuantity: 1 },
    ],
  },
};

export const LogActivity: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityOption | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCategorySelect = (category: ActivityCategory) => {
    setSelectedCategory(category);
    setSelectedActivity(null);
    setQuantity(0);
    setNotes('');
    setError(null);
    setSuccess(false);
  };

  const handleActivitySelect = (activity: ActivityOption) => {
    setSelectedActivity(activity);
    setQuantity(activity.defaultQuantity || 1);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !selectedActivity || quantity <= 0) {
      setError('Please select a category, activity, and enter a valid quantity');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/logs/entries', {
        date: new Date().toISOString(),
        category: selectedCategory,
        activityType: selectedActivity.type,
        quantity,
        unit: selectedActivity.unit,
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      
      // Reset form after 1.5 seconds
      setTimeout(() => {
        setSelectedCategory(null);
        setSelectedActivity(null);
        setQuantity(0);
        setNotes('');
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = async (category: ActivityCategory, activity: ActivityOption) => {
    setLoading(true);
    setError(null);

    try {
      await api.post('/logs/entries', {
        date: new Date().toISOString(),
        category,
        activityType: activity.type,
        quantity: activity.defaultQuantity || 1,
        unit: activity.unit,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">Log Activity</h1>
          <p className="text-neutral-600 mt-2">Quick and easy tracking of your daily activities</p>
        </div>

        {/* Success Message */}
        {success && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mb-6 p-4 bg-primary-50 border-2 border-primary-200 rounded-xl animate-pulse"
          >
            <p className="text-primary-800 font-medium flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">✓</span>
              <span>Activity logged successfully! Great job! 🎉</span>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          </div>
        )}

        {/* Category Selection */}
        {!selectedCategory && (
          <div className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 border border-neutral-200">
            <h2 className="text-xl font-semibold mb-6 text-neutral-900">Select Category</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(ACTIVITY_CATEGORIES) as ActivityCategory[]).map((category) => {
                const config = ACTIVITY_CATEGORIES[category];
                return (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="p-6 rounded-xl border-2 border-neutral-200 hover:border-primary-500 hover:bg-primary-50 transition-all transform hover:scale-105 active:scale-95"
                  >
                    <div className="text-5xl mb-3">{config.icon}</div>
                    <div className="font-semibold text-neutral-900">{config.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity Selection and Form */}
        {selectedCategory && (
          <div className="space-y-6">
            {/* Quick Log Options */}
            <div className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 border border-neutral-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-3xl">{ACTIVITY_CATEGORIES[selectedCategory].icon}</span>
                  <span className="text-neutral-900">{ACTIVITY_CATEGORIES[selectedCategory].label}</span>
                </h2>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-neutral-500 hover:text-neutral-700 font-medium transition-colors"
                >
                  Change Category
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-medium text-neutral-700 mb-4 flex items-center gap-2">
                  <span>⚡</span>
                  <span>One-Tap Quick Log</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ACTIVITY_CATEGORIES[selectedCategory].activities.map((activity) => (
                    <button
                      key={activity.type}
                      onClick={() => handleQuickLog(selectedCategory, activity)}
                      disabled={loading}
                      className="p-4 border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left transform hover:scale-105 active:scale-95"
                    >
                      <div className="font-medium text-neutral-900 mb-1">{activity.label}</div>
                      <div className="text-sm text-neutral-500">
                        {activity.defaultQuantity} {activity.unit}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t-2 border-neutral-100 pt-8">
                <h3 className="text-sm font-medium text-neutral-700 mb-4 flex items-center gap-2">
                  <span>✏️</span>
                  <span>Custom Amount</span>
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Activity Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Activity Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ACTIVITY_CATEGORIES[selectedCategory].activities.map((activity) => (
                        <button
                          key={activity.type}
                          type="button"
                          onClick={() => handleActivitySelect(activity)}
                          className={`p-3 border-2 rounded-xl text-sm transition-all ${
                            selectedActivity?.type === activity.type
                              ? 'border-primary-500 bg-primary-50 font-medium'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {activity.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Input */}
                  {selectedActivity && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Quantity ({selectedActivity.unit})
                        </label>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          required
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          placeholder="Add any additional details..."
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading || quantity <= 0}
                        className="w-full bg-primary-600 text-white py-4 rounded-xl hover:bg-primary-700 disabled:bg-neutral-400 disabled:cursor-not-allowed font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <LoadingSpinner size="sm" message="" />
                            <span>Logging...</span>
                          </span>
                        ) : (
                          '✓ Log Activity'
                        )}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Today's Logs Button */}
        <div className="mt-6 text-center">
          {/* Issue 1: use <Link> instead of <button onClick(navigate)> */}
          <Link
            to="/today"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors focus:outline-none focus:underline"
          >
            View Today's Activities →
          </Link>
        </div>
      </div>
    </div>
  );
};

// Made with Bob