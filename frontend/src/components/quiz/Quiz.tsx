/**
 * Multi-step Quiz Component
 * Displays lifestyle quiz questions one at a time with progress indicator
 * Updated with improved UI/UX and positive design
 */

import React, { useState } from 'react';
import { QUIZ_QUESTIONS, QuizResponse } from '@cft/shared';

interface QuizProps {
  onComplete: (responses: QuizResponse[]) => void;
  onSkip?: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;
  const isLastQuestion = currentStep === QUIZ_QUESTIONS.length - 1;

  const handleNext = () => {
    if (selectedAnswer === null) return;

    // Save response
    const newResponse: QuizResponse = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (isLastQuestion) {
      // Quiz complete
      onComplete(updatedResponses);
    } else {
      // Move to next question
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Remove last response and go back
      const updatedResponses = responses.slice(0, -1);
      setResponses(updatedResponses);
      setCurrentStep(currentStep - 1);
      
      // Restore previous answer
      const previousResponse = updatedResponses[currentStep - 1];
      setSelectedAnswer(previousResponse?.answer || null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport':
        return '🚗';
      case 'food':
        return '🍽️';
      case 'energy':
        return '⚡';
      case 'shopping':
        return '🛍️';
      default:
        return '📋';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transport':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'food':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'energy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shopping':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            Lifestyle Carbon Quiz
          </h1>
          <p className="text-neutral-600 text-lg">
            Help us understand your lifestyle to calculate your carbon footprint
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-neutral-700">
              Question {currentStep + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <span className="text-sm font-medium text-primary-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 mb-6 border border-neutral-200">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl">{getCategoryIcon(currentQuestion.category)}</span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getCategoryColor(
                currentQuestion.category
              )}`}
            >
              {currentQuestion.category.charAt(0).toUpperCase() +
                currentQuestion.category.slice(1)}
            </span>
          </div>

          {/* Question */}
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-6">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={String(option.value)}
                onClick={() => setSelectedAnswer(option.value)}
                className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  selectedAnswer === option.value
                    ? 'border-primary-600 bg-primary-50 shadow-md'
                    : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedAnswer === option.value
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-neutral-300'
                    }`}
                  >
                    {selectedAnswer === option.value && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-neutral-900 font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              currentStep === 0
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border-2 border-neutral-200'
            }`}
          >
            ← Back
          </button>

          <div className="flex gap-3">
            {onSkip && currentStep === 0 && (
              <button
                onClick={onSkip}
                className="px-6 py-3 rounded-xl font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                Skip for now
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className={`px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 ${
                selectedAnswer === null
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
              }`}
            >
              {isLastQuestion ? '✓ Complete Quiz' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Made with Bob
