/**
 * User Routes
 * Returns user profile data so the frontend doesn't need direct Firestore access
 */

import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import { verifyAuth } from '../middleware/auth';
import { initializeUser } from '../middleware/initializeUser';
import { ApiResponse } from '@cft/shared';

const router = Router();

const protectedRoute = [verifyAuth, initializeUser];

/**
 * GET /api/user/profile
 * Returns user's profile: quizCompleted status, scores, goal etc.
 */
router.get('/profile', protectedRoute, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.uid;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.json({
        success: true,
        data: {
          quizCompleted: false,
          baselineScore: null,
          currentScore: null,
          goalTarget: null,
        },
      });
    }

    const data = userDoc.data()!;
    return res.json({
      success: true,
      data: {
        quizCompleted: data.quizCompleted ?? false,
        baselineScore: data.baselineScore ?? null,
        currentScore: data.currentScore ?? null,
        goalTarget: data.goalTarget ?? null,
      },
    } as ApiResponse<unknown>);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user profile' },
    });
  }
});

export default router;

// Made with Bob
