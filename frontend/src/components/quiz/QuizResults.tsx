/**
 * Quiz Results Component
 * Displays carbon score, comparison to national average, and goal selection
 */

import React, { useState } from 'react';
import { NATIONAL_AVERAGE_CO2, GOAL_OPTIONS } from '@cft/shared';

interface QuizResultsProps {
  baselineScore: number;
  footprintEstimate: number;
  breakdown: {
    transport: number;
    food: number;
    energy: number;
    shopping: number;
  };
  onGoalSelected: (goalTarget: number) => void;
  onSkipGoal: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  baselineScore,
  footprintEstimate,
  breakdown,
  onGoalSelected,
  onSkipGoal,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

  // Calculate percentage difference from national average
  const percentageFromAverage =
    ((footprintEstimate - NATIONAL_AVERAGE_CO2) / NATIONAL_AVERAGE_CO2) * 100;

  const getScoreLabel = (score: number): string => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Fair';
    return 'Needs Improvement';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-blue-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 75) return 'from-green-500 to-green-600';
    if (score >= 50) return 'from-blue-500 to-blue-600';
    if (score >= 25) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const handleSetGoal = () => {
    if (selectedGoal !== null) {
      onGoalSelected(selectedGoal);
    }
  };

  // Calculate category percentages
  const total = breakdown.transport + breakdown.food + breakdown.energy + breakdown.shopping;
  const categoryPercentages = {
    transport: (breakdown.transport / total) * 100,
    food: (breakdown.food / total) * 100,
    energy: (breakdown.energy / total) * 100,
    shopping: (breakdown.shopping / total) * 100,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Carbon Footprint Results
          </h1>
          <p className="text-gray-600">
            Here's your baseline carbon score and how you compare
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="inline-block">
              <div
                className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreGradient(
                  baselineScore
                )} flex items-center justify-center mb-4 mx-auto`}
              >
                <div className="text-white">
                  <div className="text-4xl font-bold">{baselineScore}</div>
                  <div className="text-sm">/ 100</div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(baselineScore)}`}>
                {getScoreLabel(baselineScore)}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Annual Carbon Footprint
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Your Footprint</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(footprintEstimate / 1000).toFixed(1)} tonnes
                </div>
                <div className="text-xs text-gray-500">CO₂e per year</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">National Average</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(NATIONAL_AVERAGE_CO2 / 1000).toFixed(1)} tonnes
                </div>
                <div className="text-xs text-gray-500">CO₂e per year</div>
              </div>
            </div>

            {/* Comparison */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                {percentageFromAverage < 0 ? (
                  <>
                    <span className="text-green-600 font-semibold">
                      {Math.abs(percentageFromAverage).toFixed(0)}% below
                    </span>
                    <span className="text-gray-700">the national average 🎉</span>
                  </>
                ) : (
                  <>
                    <span className="text-orange-600 font-semibold">
                      {percentageFromAverage.toFixed(0)}% above
                    </span>
                    <span className="text-gray-700">the national average</span>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-600 text-center mt-1">
                Source: World Bank, Our World in Data (2023)
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Emissions Breakdown
          </h3>
          <div className="space-y-4">
            {/* Transport */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚗</span>
                  <span className="font-medium text-gray-900">Transport</span>
                </div>
                <span className="text-sm text-gray-600">
                  {breakdown.transport} kg ({categoryPercentages.transport.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${categoryPercentages.transport}%` }}
                />
              </div>
            </div>

            {/* Food */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍽️</span>
                  <span className="font-medium text-gray-900">Food</span>
                </div>
                <span className="text-sm text-gray-600">
                  {breakdown.food} kg ({categoryPercentages.food.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${categoryPercentages.food}%` }}
                />
              </div>
            </div>

            {/* Energy */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <span className="font-medium text-gray-900">Energy</span>
                </div>
                <span className="text-sm text-gray-600">
                  {breakdown.energy} kg ({categoryPercentages.energy.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${categoryPercentages.energy}%` }}
                />
              </div>
            </div>

            {/* Shopping */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛍️</span>
                  <span className="font-medium text-gray-900">Shopping</span>
                </div>
                <span className="text-sm text-gray-600">
                  {breakdown.shopping} kg ({categoryPercentages.shopping.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${categoryPercentages.shopping}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Goal Selection */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Set Your Reduction Goal
          </h3>
          <p className="text-gray-600 mb-6">
            Choose a target to reduce your carbon footprint over the next 3 months
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {GOAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedGoal(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedGoal === option.value
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {option.label}
                </div>
                <div className="text-sm text-gray-600">{option.description}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Target: {((footprintEstimate * (100 - option.value)) / 100 / 1000).toFixed(1)}{' '}
                  tonnes/year
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={onSkipGoal}
              className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip for now
            </button>

            <button
              onClick={handleSetGoal}
              disabled={selectedGoal === null}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedGoal === null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Set Goal & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Made with Bob
