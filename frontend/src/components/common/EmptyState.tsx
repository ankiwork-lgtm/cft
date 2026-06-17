/**
 * Empty State Component
 * Positive, encouraging empty states for various scenarios
 */

import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🌱',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-neutral-800 mb-3">{title}</h3>
      <p className="text-lg text-neutral-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all transform hover:scale-105 font-medium shadow-lg"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// Made with Bob