/**
 * API Routes Aggregator
 */

import { Router, Request, Response } from 'express';
import quizRoutes from './quiz';
import logsRoutes from './logs';
import dashboardRoutes from './dashboard';
import tipsRoutes from './tips';
import userRoutes from './user';

const router = Router();

// Public routes (no auth required)
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Carbon Footprint Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      quiz: '/api/quiz',
      logs: '/api/logs',
      dashboard: '/api/dashboard',
      tips: '/api/tips',
    },
  });
});

// Protected routes (auth required)

/**
 * Quiz routes
 */
router.use('/quiz', quizRoutes);

/**
 * Activity logs routes
 */
router.use('/logs', logsRoutes);

/**
 * Dashboard routes
 */
router.use('/dashboard', dashboardRoutes);

/**
 * Tips routes
 */
router.use('/tips', tipsRoutes);

/**
 * User profile routes
 */
router.use('/user', userRoutes);

export default router;

// Made with Bob
