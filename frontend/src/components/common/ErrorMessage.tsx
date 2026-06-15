/**
 * Error Message Component
 * Consistent error display with positive, non-alarming styling
 */

import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`bg-amber-50 border-2 border-amber-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">💭</div>
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-800 mb-2">
            Hmm, something's not quite right
          </h3>
          <p className="text-neutral-700 mb-4">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Made with Bob