export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  VENUE_NOT_FOUND = 'VENUE_NOT_FOUND',
  COURT_NOT_FOUND = 'COURT_NOT_FOUND',
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  SLOT_UNAVAILABLE = 'SLOT_UNAVAILABLE',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.name = 'AppError';

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
