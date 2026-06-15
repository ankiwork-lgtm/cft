/**
 * Tips Section Component
 * Displays personalized carbon reduction tips with positive, encouraging language
 */

import { useEffect, useState } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';

interface Tip {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  estimatedSavings: {
    amount: number;
    period: string;
    description: string;
  };
  actionableSteps: string[];
  matchReason: string;
  relevanceScore: number;
  source?: string;
}

interface TipsData {
  tips: Tip[];
  period: {
    start: string;
    end: string;
  };
  activityCount: number;
  generatedAt: string;
}

// Positive color scheme - no red/alarm tones
const PRIORITY_COLORS = {
  high: 'border-primary-200 bg-primary-50',
  medium: 'border-blue-200 bg-blue-50',
  low: 'border-neutral-200 bg-neutral-50',
};

const PRIORITY_BADGES = {
  high: 'bg-primary-100 text-primary-800',
  medium: 'bg-blue-100 text-blue-800',
  low: 'bg-neutral-100 text-neutral-800',
};

// Positive priority labels
const PRIORITY_LABELS = {
  high: 'Quick Win',
  medium: 'Great Idea',
  low: 'Nice to Have',
};

const CATEGORY_ICONS: Record<string, string> = {
  transport: '🚗',
  food: '🍽️',
  energy: '⚡',
  shopping: '🛍️',
  general: '💡',
};

export function TipsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipsData, setTipsData] = useState<TipsData | null>(null);
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTips();
  }, []);

  const loadTips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<TipsData>('/tips');
      if (response.success && response.data) {
        setTipsData(response.data);
      } else {
        setError('Unable to load tips right now');
      }
    } catch (err) {
      console.error('Error loading tips:', err);
      setError('Unable to load personalized tips');
    } finally {
      setLoading(false);
    }
  };

  const toggleTip = (tipId: string) => {
    setExpandedTips((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tipId)) {
        newSet.delete(tipId);
      } else {
        newSet.add(tipId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-soft">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">💡 Tips for You</h2>
        <LoadingSpinner message="Loading personalized tips..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-soft">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">💡 Tips for You</h2>
        <ErrorMessage message={error} onRetry={loadTips} />
      </div>
    );
  }

  if (!tipsData || tipsData.tips.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-soft">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">💡 Tips for You</h2>
        <EmptyState
          icon="🌱"
          title="Keep Going!"
          description="Keep logging your activities to receive personalized tips and insights!"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">💡 Your Personalized Tips</h2>
        <button
          onClick={loadTips}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          title="Refresh tips"
        >
          🔄 Refresh
        </button>
      </div>

      <p className="text-sm text-neutral-600 mb-6">
        Based on your activity from{' '}
        {new Date(tipsData.period.start).toLocaleDateString()} to{' '}
        {new Date(tipsData.period.end).toLocaleDateString()}
      </p>

      <div className="space-y-4">
        {tipsData.tips.map((tip) => {
          const isExpanded = expandedTips.has(tip.id);
          return (
            <div
              key={tip.id}
              className={`border-2 rounded-xl p-5 transition-all ${
                PRIORITY_COLORS[tip.priority]
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">
                  {CATEGORY_ICONS[tip.category] || '💡'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-neutral-900">{tip.title}</h3>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                        PRIORITY_BADGES[tip.priority]
                      }`}
                    >
                      {PRIORITY_LABELS[tip.priority]}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-700 mb-3">{tip.message}</p>

                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="bg-primary-100 text-primary-800 text-xs px-3 py-1.5 rounded-full font-medium">
                      💚 {tip.estimatedSavings.description}
                    </div>
                    {tip.source && (
                      <div className="text-xs text-neutral-500">
                        Source: {tip.source}
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t-2 border-neutral-200">
                      <h4 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                        <span>✨</span>
                        <span>How to make it happen:</span>
                      </h4>
                      <ul className="space-y-2">
                        {tip.actionableSteps.map((step, index) => (
                          <li
                            key={index}
                            className="text-sm text-neutral-700 flex items-start gap-2"
                          >
                            <span className="text-primary-600 font-bold flex-shrink-0 mt-0.5">
                              {index + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => toggleTip(tip.id)}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    {isExpanded ? '▲ Show less' : '▼ Show action steps'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t-2 border-neutral-100">
        <p className="text-xs text-neutral-500 text-center">
          💪 Tips are personalized based on your weekly activity patterns. Keep
          logging to get more relevant suggestions!
        </p>
      </div>
    </div>
  );
}

// Made with Bob