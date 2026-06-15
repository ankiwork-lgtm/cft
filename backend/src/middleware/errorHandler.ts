/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@cft/shared';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  // Default error response
  const error: ApiError = {
    code: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred',
  };

  // Send error response
  res.status(500).json({
    success: false,
    error,
  });
};

// Made with Bob
