/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../utils/customError';
import { logger } from '../utils/logger';
import env from '../config/env.config';

export const globalErrorHandler = (
  err: Error & { statusCode?: number; errorCode?: ErrorCode; details?: unknown; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || ErrorCode.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  const details = err.details || null;

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    statusCode = 409;
    errorCode = ErrorCode.CONFLICT;
    message = 'A record with this unique value already exists';
  }
  // Prisma record not found
  else if (err.code === 'P2025') {
    statusCode = 404;
    errorCode = ErrorCode.NOT_FOUND;
    message = 'Requested resource not found';
  }

  logger.error(
    {
      statusCode,
      errorCode,
      message,
      stack: err.stack,
    },
    `Unhandled Error: ${message}`
  );

  res.status(statusCode).json({
    success: false,
    statusCode,
    errorCode,
    message,
    details: env.NODE_ENV === 'development' ? details || err.stack : details,
  });
};

export default globalErrorHandler;
