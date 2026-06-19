/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@cft/shared';
import { logError } from './logger';

/**
 * Extended error type that carries an HTTP status code.
 * Routes can set err.status (or err.statusCode) before calling next(err).
 */
interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Resolve status code: prefer err.status, then err.statusCode, then default 500
  const statusCode = err.status ?? err.statusCode ?? 500;

  logError('ErrorHandler', `Unhandled error on ${req.method} ${req.path} [${statusCode}]`, err);

  // Map status to a readable error code
  const errorCode: string =
    statusCode === 400 ? 'BAD_REQUEST' :
    statusCode === 401 ? 'UNAUTHORIZED' :
    statusCode === 403 ? 'FORBIDDEN' :
    statusCode === 404 ? 'NOT_FOUND' :
    statusCode === 409 ? 'CONFLICT' :
    statusCode === 422 ? 'UNPROCESSABLE_ENTITY' :
    statusCode === 429 ? 'TOO_MANY_REQUESTS' :
    'INTERNAL_SERVER_ERROR';

  const error: ApiError = {
    code: errorCode,
    message: err.message || 'An unexpected error occurred',
  };

  res.status(statusCode).json({
    success: false,
    error,
  });
};

// Made with Bob
