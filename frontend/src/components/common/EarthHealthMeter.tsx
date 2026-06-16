/**
 * Earth Health Meter Component
 * A horizontal gauge showing the user's Carbon Score from green to yellow
 * Higher scores (better) show greener, lower scores show more yellow
 */

import React from 'react';

interface EarthHealthMeterProps {
  score: number; // 0-100 scale
  baselineScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const EarthHealthMeter: React.FC<EarthHealthMeterProps> = ({
  score,
  baselineScore,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  // Normalize score to 0-100 range
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Calculate color based on score (green for high, yellow for low)
  const getColor = (score: number): string => {
    if (score >= 80) return '#22c55e'; // green-600
    if (score >= 60) return '#84cc16'; // lime-500
    if (score >= 40) return '#eab308'; // yellow-500
    if (score >= 20) return '#f59e0b'; // amber-500
    return '#fb923c'; // orange-400
  };

  const getGradient = (score: number): string => {
    const color = getColor(score);
    return `linear-gradient(90deg, ${color} 0%, ${color}dd ${score}%, #e5e7eb ${score}%)`;
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Needs Improvement';
    return 'Getting Started';
  };

  const getEmoji = (score: number): string => {
    if (score >= 80) return '🌍✨';
    if (score >= 60) return '🌍';
    if (score >= 40) return '🌎';
    if (score >= 20) return '🌏';
    return '🌱';
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      height: 'h-3',
      text: 'text-sm',
      emoji: 'text-xl',
      scoreText: 'text-2xl',
    },
    md: {
      height: 'h-4',
      text: 'text-base',
      emoji: 'text-2xl',
      scoreText: 'text-3xl',
    },
    lg: {
      height: 'h-6',
      text: 'text-lg',
      emoji: 'text-3xl',
      scoreText: 'text-4xl',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={config.emoji}>{getEmoji(normalizedScore)}</span>
            <span className={`font-semibold text-neutral-700 ${config.text}`}>
              Earth Health Score
            </span>
          </div>
          <div className="text-right">
            <div className={`font-bold text-primary-600 ${config.scoreText}`}>
              {normalizedScore}
            </div>
            <div className="text-xs text-neutral-500">{getScoreLabel(normalizedScore)}</div>
          </div>
        </div>
      )}

      {/* Meter Bar — Issue 3: role=progressbar + ARIA */}
      <div
        role="progressbar"
        aria-valuenow={normalizedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Earth Health Score: ${normalizedScore} out of 100 — ${getScoreLabel(normalizedScore)}`}
        className={`w-full bg-neutral-200 rounded-full ${config.height} overflow-hidden relative`}
      >
        <div
          className={`${config.height} rounded-full transition-all duration-700 ease-out`}
          style={{
            width: `${normalizedScore}%`,
            background: getGradient(normalizedScore),
          }}
          aria-hidden="true"
        />
        
        {/* Baseline marker if provided */}
        {baselineScore !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-neutral-400"
            style={{ left: `${Math.min(100, Math.max(0, baselineScore))}%` }}
            aria-hidden="true"
            title={`Baseline: ${baselineScore}`}
          >
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-neutral-400 rounded-full" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Score range labels */}
      {size !== 'sm' && (
        <div className="flex justify-between mt-1 text-xs text-neutral-500">
          <span>0</span>
          <span className="text-neutral-400">Getting Started</span>
          <span className="text-primary-600">Excellent</span>
          <span>100</span>
        </div>
      )}

      {/* Improvement indicator */}
      {baselineScore !== undefined && normalizedScore !== baselineScore && (
        <div className="mt-2 text-sm">
          {normalizedScore > baselineScore ? (
            <div className="flex items-center gap-1 text-primary-600">
              <span>↑</span>
              <span className="font-medium">
                +{(normalizedScore - baselineScore).toFixed(0)} points from baseline
              </span>
              <span>🎉</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-neutral-600">
              <span>↓</span>
              <span className="font-medium">
                {(baselineScore - normalizedScore).toFixed(0)} points below baseline
              </span>
              <span>💪</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Made with Bob