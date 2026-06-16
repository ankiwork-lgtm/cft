/**
 * Backend API Entry Point
 * Express server for Carbon Footprint Tracker
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env FIRST before any other imports that depend on env vars (e.g. firebase config)
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

/**
 * Validate required environment variables
 * Logs clear warnings for missing configuration
 */
function validateEnvironment(): void {
  const requiredEnvVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  };

  // In production, we need GOOGLE_APPLICATION_CREDENTIALS or default credentials
  const isProduction = process.env.NODE_ENV === 'production';
  const hasCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || isProduction;

  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  if (!requiredEnvVars.NODE_ENV) {
    warnings.push('NODE_ENV is not set, defaulting to "development"');
  }

  if (!requiredEnvVars.PORT) {
    warnings.push('PORT is not set, defaulting to 3000');
  }

  // Check Firebase credentials
  if (!hasCredentials && !isProduction) {
    warnings.push(
      'GOOGLE_APPLICATION_CREDENTIALS is not set. ' +
      'For local development, set this to the path of your service account key JSON file. ' +
      'Download from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key'
    );
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  CONFIGURATION WARNINGS:');
    warnings.forEach((warning, index) => {
      console.warn(`   ${index + 1}. ${warning}`);
    });
    console.warn('');
  }

  // Log missing critical variables
  if (missingVars.length > 0) {
    console.error('\n❌ MISSING REQUIRED ENVIRONMENT VARIABLES:');
    missingVars.forEach((varName, index) => {
      console.error(`   ${index + 1}. ${varName}`);
    });
    console.error('\n   Please set these variables in your .env file or environment.');
    console.error('   See backend/.env.example for reference.\n');
    process.exit(1);
  }

  // Log success in production
  if (isProduction && warnings.length === 0) {
    console.log('✅ Environment configuration validated successfully');
  }
}

// Validate environment before starting server
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;

// Made with Bob
