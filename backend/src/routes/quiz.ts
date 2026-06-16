/**
 * Quiz Routes
 * Handle lifestyle quiz submission and baseline score calculation
 */

import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import { verifyAuth } from '../middleware/auth';
import { initializeUser } from '../middleware/initializeUser';
import {
  SubmitQuizRequest,
  SubmitQuizResponse,
  ApiResponse,
} from '@cft/shared';
import {
  calculateFootprintFromQuiz,
} from '../utils/quizCalculator';
import { NATIONAL_AVERAGE_CO2 } from '@cft/shared';

const router = Router();

/**
 * POST /api/quiz
 * Submit quiz responses and calculate baseline Carbon Score
 * 
 * This endpoint:
 * 1. Validates quiz responses
 * 2. Calculates annual CO2 footprint using documented formulas
 * 3. Converts footprint to a 0-100 Carbon Score (higher = better)
 * 4. Saves results to user's Firestore document
 * 5. Optionally saves a reduction goal
 */
router.post(
  '/',
  verifyAuth,
  initializeUser,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { responses, goalTarget } = req.body as SubmitQuizRequest;

      // Validate request
      if (!responses || !Array.isArray(responses) || responses.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Quiz responses are required',
          },
        } as ApiResponse<never>);
        return;
      }

      // Validate goal target if provided
      if (goalTarget !== undefined && ![5, 10, 15].includes(goalTarget)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_GOAL',
            message: 'Goal target must be 5, 10, or 15',
          },
        } as ApiResponse<never>);
        return;
      }

      // Calculate footprint and score
      const calculation = calculateFootprintFromQuiz(responses);

      // Convert responses array to object for storage
      const answersMap: Record<string, string | number> = {};
      responses.forEach((r) => {
        answersMap[r.questionId] = r.answer;
      });

      // Prepare user document update
      const userUpdate: any = {
        quizCompleted: true,
        quizAnswers: answersMap,
        baselineScore: calculation.baselineScore,
        currentScore: calculation.baselineScore, // Initially same as baseline
        footprintEstimate: calculation.footprintEstimate,
      };

      // Add goal target if provided
      if (goalTarget !== undefined) {
        userUpdate.goalTarget = goalTarget;
      }

      // Update user document (use set+merge so it works even if doc was just created)
      await db.collection('users').doc(userId).set(userUpdate, { merge: true });

      // Also save quiz response to separate collection for analytics
      await db.collection('quizResponses').add({
        userId,
        responses: answersMap,
        calculatedScore: calculation.baselineScore,
        breakdown: calculation.breakdown,
        completedAt: new Date(),
      });

      // Prepare response
      const response: SubmitQuizResponse = {
        result: {
          userId,
          calculatedScore: calculation.baselineScore,
          breakdown: calculation.breakdown,
          responses: answersMap,
          completedAt: new Date(),
        },
        baselineScore: calculation.baselineScore,
        currentScore: calculation.baselineScore,
        footprintEstimate: calculation.footprintEstimate,
        nationalAverage: NATIONAL_AVERAGE_CO2,
      };

      res.json({
        success: true,
        data: response,
        message: 'Quiz completed successfully',
      } as ApiResponse<SubmitQuizResponse>);
    } catch (error) {
      console.error('Quiz submission error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process quiz submission',
        },
      } as ApiResponse<never>);
    }
  }
);

/**
 * GET /api/quiz/result
 * Get user's quiz results if they've completed it
 */
router.get(
  '/result',
  verifyAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.uid;

      // Get user document
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        } as ApiResponse<never>);
        return;
      }

      const userData = userDoc.data();

      if (!userData?.quizCompleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'QUIZ_NOT_COMPLETED',
            message: 'User has not completed the quiz',
          },
        } as ApiResponse<never>);
        return;
      }

      // Get quiz response from collection
      const quizResponseSnapshot = await db
        .collection('quizResponses')
        .where('userId', '==', userId)
        .orderBy('completedAt', 'desc')
        .limit(1)
        .get();

      if (quizResponseSnapshot.empty) {
        res.status(404).json({
          success: false,
          error: {
            code: 'QUIZ_RESULT_NOT_FOUND',
            message: 'Quiz result not found',
          },
        } as ApiResponse<never>);
        return;
      }

      const quizData = quizResponseSnapshot.docs[0].data();

      const response: SubmitQuizResponse = {
        result: {
          userId,
          calculatedScore: quizData.calculatedScore,
          breakdown: quizData.breakdown,
          responses: quizData.responses,
          completedAt: quizData.completedAt.toDate(),
        },
        baselineScore: userData.baselineScore,
        currentScore: userData.currentScore,
        footprintEstimate: userData.footprintEstimate || 0,
        nationalAverage: NATIONAL_AVERAGE_CO2,
      };

      res.json({
        success: true,
        data: response,
      } as ApiResponse<SubmitQuizResponse>);
    } catch (error) {
      console.error('Get quiz result error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve quiz result',
        },
      } as ApiResponse<never>);
    }
  }
);

export default router;

// Made with Bob