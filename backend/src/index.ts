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
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger, logError } from './middleware/logger';

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

// Build CORS allowlist from environment variable (comma-separated list of origins)
// Example: CORS_ORIGINS=https://myapp.web.app,https://myapp.firebaseapp.com
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Middleware
app.use(requestLogger); // HTTP request/response logger (first!)
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    },
    credentials: true,
  })
); // Enable CORS with origin allowlist
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ── Rate Limiting ───────────────────────────────────────────────────────────
// General limiter: applied to all /api routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window per IP
  standardHeaders: 'draft-7', // use RateLimit-* headers (RFC 9110)
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests. Please try again later.' } },
});

// Stricter limiter for write operations (log entries + quiz submissions)
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,             // max 20 writes per minute per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many write requests. Please slow down.' } },
});

// Health check endpoint (not rate-limited — used by Cloud Run health probes)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply general rate limit to all API routes
app.use('/api', apiLimiter);

// Apply stricter limits to write endpoints
app.use('/api/logs/entries', writeLimiter);
app.use('/api/quiz', writeLimiter);

// API routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Handle port-in-use errors gracefully instead of crashing
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logError(
      'Server',
      `Port ${PORT} is already in use. Kill the existing process first:`,
    );
    console.error(`  Run: netstat -ano | findstr :${PORT}`);
    console.error(`  Then: taskkill /PID <PID> /F`);
  } else {
    logError('Server', 'Failed to start server', err);
  }
  process.exit(1);
});

export default app;

// Made with Bob
