/**
 * Quiz Page Container
 * Manages quiz flow: questions -> results -> goal selection
 * Updated with improved loading and error states
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '../components/quiz/Quiz';
import { QuizResults } from '../components/quiz/QuizResults';
import { QuizResponse, SubmitQuizRequest, SubmitQuizResponse } from '@cft/shared';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

type QuizStep = 'questions' | 'results';

export const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<QuizStep>('questions');
  const [quizResult, setQuizResult] = useState<SubmitQuizResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuizComplete = async (responses: QuizResponse[]) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const request: SubmitQuizRequest = {
        responses,
      };

      const response = await api.post<SubmitQuizResponse>('/quiz', request);

      if (response.success && response.data) {
        setQuizResult(response.data);
        setStep('results');
      } else {
        setError(response.error?.message || 'Unable to submit quiz');
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
      setError('An error occurred while submitting your quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalSelected = async (goalTarget: number) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Update user's goal target
      // Note: Goal target update logic would go here
      // For now, navigate to dashboard with the selected goal
      console.log('Goal target selected:', goalTarget);

      // We need to update the goal separately or include it in the initial submission
      // For now, let's navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Goal selection error:', err);
      setError('An error occurred while setting your goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipGoal = () => {
    navigate('/dashboard');
  };

  const handleSkipQuiz = () => {
    navigate('/dashboard');
  };

  const handleRetry = () => {
    setError(null);
    if (step === 'results' && quizResult) {
      // Stay on results
    } else {
      setStep('questions');
    }
  };

  if (isSubmitting) {
    return (
      <LoadingSpinner
        fullScreen
        message={step === 'questions' ? 'Calculating your carbon footprint...' : 'Saving your goal...'}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-soft p-8 max-w-md w-full border border-neutral-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">💭</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Oops!</h2>
          </div>
          <ErrorMessage message={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  if (step === 'questions') {
    return <Quiz onComplete={handleQuizComplete} onSkip={handleSkipQuiz} />;
  }

  if (step === 'results' && quizResult) {
    return (
      <QuizResults
        baselineScore={quizResult.baselineScore}
        footprintEstimate={quizResult.footprintEstimate}
        breakdown={quizResult.result.breakdown}
        onGoalSelected={handleGoalSelected}
        onSkipGoal={handleSkipGoal}
      />
    );
  }

  return null;
};

// Made with Bob
