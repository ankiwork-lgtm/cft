/**
 * HTTP Request Logger Middleware
 * Prints coloured, structured logs for every incoming request and response
 */

import { Request, Response, NextFunction } from 'express';

// ANSI colour codes
const c = {
  reset:   '\x1b[0m',
  dim:     '\x1b[2m',
  bold:    '\x1b[1m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  cyan:    '\x1b[36m',
  magenta: '\x1b[35m',
  blue:    '\x1b[34m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
};

/** Colour the HTTP method */
function colourMethod(method: string): string {
  const map: Record<string, string> = {
    GET:    c.green  + c.bold,
    POST:   c.blue   + c.bold,
    PUT:    c.yellow + c.bold,
    PATCH:  c.yellow + c.bold,
    DELETE: c.red    + c.bold,
  };
  return (map[method] ?? c.white + c.bold) + method.padEnd(6) + c.reset;
}

/** Colour the HTTP status code */
function colourStatus(status: number): string {
  let colour = c.green;
  if (status >= 500) colour = c.red + c.bold;
  else if (status >= 400) colour = c.yellow + c.bold;
  else if (status >= 300) colour = c.cyan;
  return colour + status + c.reset;
}

/** Format elapsed milliseconds */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;

}

/** Timestamp */
function timestamp(): string {
  return c.gray + new Date().toISOString().replace('T', ' ').slice(0, 23) + c.reset;
}

/**
 * requestLogger — drop-in Express middleware
 * Logs: timestamp | method | path | status | duration | user (if authed)
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log the incoming request immediately
  console.log(
    `${timestamp()} ${c.cyan}→${c.reset} ${colourMethod(req.method)} ${c.white}${req.path}${c.reset}` +
    (Object.keys(req.query).length
      ? c.gray + ' ?' + new URLSearchParams(req.query as Record<string, string>).toString() + c.reset
      : '')
  );

  // Intercept the response to log its status + duration
  res.on('finish', () => {
    const ms = Date.now() - start;
    const uid = (req as any).user?.uid;
    const userStr = uid ? ` ${c.magenta}[${uid.slice(0, 8)}…]${c.reset}` : '';

    console.log(
      `${timestamp()} ${c.cyan}←${c.reset} ${colourMethod(req.method)} ${c.white}${req.path}${c.reset}` +
      ` ${colourStatus(res.statusCode)} ${c.gray}${formatDuration(ms)}${c.reset}${userStr}`
    );
  });

  next();
};

/**
 * logInfo — convenience helper for structured info logs
 */
export function logInfo(context: string, message: string, meta?: Record<string, unknown>): void {
  const metaStr = meta ? ' ' + c.gray + JSON.stringify(meta) + c.reset : '';
  console.log(`${timestamp()} ${c.green}ℹ${c.reset}  ${c.bold}[${context}]${c.reset} ${message}${metaStr}`);
}

/**
 * logWarn — convenience helper for structured warning logs
 */
export function logWarn(context: string, message: string, meta?: Record<string, unknown>): void {
  const metaStr = meta ? ' ' + c.gray + JSON.stringify(meta) + c.reset : '';
  console.warn(`${timestamp()} ${c.yellow}⚠${c.reset}  ${c.bold}[${context}]${c.reset} ${message}${metaStr}`);
}

/**
 * logError — convenience helper for structured error logs
 */
export function logError(context: string, message: string, error?: unknown): void {
  const errStr = error instanceof Error
    ? ` ${c.red}${error.message}${c.reset}${c.gray}\n    Stack: ${error.stack}${c.reset}`
    : error ? ` ${c.red}${String(error)}${c.reset}` : '';
  console.error(`${timestamp()} ${c.red}✖${c.reset}  ${c.bold}[${context}]${c.reset} ${message}${errStr}`);
}

// Made with Bob
