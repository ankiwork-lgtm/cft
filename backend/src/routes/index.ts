/**
 * API Routes Aggregator
 */

import { Router, Request, Response } from 'express';
import { verifyAuth } from '../middleware/auth';
import { initializeUser } from '../middleware/initializeUser';
import quizRoutes from './quiz';
import logsRoutes from './logs';
import dashboardRoutes from './dashboard';
import tipsRoutes from './tips';

const router = Router();

// Middleware chain for protected routes: verify auth, then initialize user
const protectedRoute = [verifyAuth, initializeUser];

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

export default router;

// Made with Bob
