/* eslint-disable @typescript-eslint/no-explicit-any */
import pino from 'pino';
import pinoHttp from 'pino-http';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const isDev = process.env.NODE_ENV !== 'production';

// Configuration for transports (daily rolling files & console pretty print)
const targets: any[] = [
  // 1. Daily rotating log file for ALL logs
  {
    target: 'pino-roll',
    options: {
      file: path.join(logDir, 'app'),
      frequency: 'daily',
      dateFormat: 'yyyy-MM-dd',
      extension: '.log',
      mkdir: true,
    },
    level: 'info',
  },
  // 2. Daily rotating log file ONLY for ERROR logs
  {
    target: 'pino-roll',
    options: {
      file: path.join(logDir, 'error'),
      frequency: 'daily',
      dateFormat: 'yyyy-MM-dd',
      extension: '.log',
      mkdir: true,
    },
    level: 'error',
  },
];

// Console pretty printer in dev
if (isDev) {
  targets.push({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
    level: 'info',
  });
}

const transport = pino.transport({ targets });

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: { env: process.env.NODE_ENV || 'development' },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);

// Express HTTP Request/Response Logger Middleware
export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (res: any, err: any) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  },
  customSuccessMessage: (res: any) => {
    return `Request completed with status ${res.statusCode}`;
  },
  customErrorMessage: (err: any, res: any) => {
    return `Request failed with status ${res.statusCode}: ${err.message}`;
  },
});

export default logger;
