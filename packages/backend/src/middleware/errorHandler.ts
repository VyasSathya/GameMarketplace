import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Custom error class for application errors
 */
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware factory
 */
export function errorHandler(logger: Logger) {
  return (error: AppError, req: Request, res: Response, next: NextFunction) => {
    // Default error values
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    let details: any = undefined;

    // Handle different error types
    if (error instanceof ZodError) {
      statusCode = 400;
      message = 'Validation Error';
      details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation failed';
    } else if (error.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
    } else if (error.name === 'MongoError' && (error as any).code === 11000) {
      statusCode = 409;
      message = 'Duplicate field value';
    }

    // Log error
    const errorLog = {
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    };

    if (statusCode >= 500) {
      logger.error('Server Error', errorLog);
    } else {
      logger.warn('Client Error', errorLog);
    }

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const errorResponse: any = {
      error: getErrorName(statusCode),
      message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    };

    if (details) {
      errorResponse.details = details;
    }

    if (isDevelopment && error.stack) {
      errorResponse.stack = error.stack;
    }

    res.status(statusCode).json(errorResponse);
  };
}

/**
 * Get error name from status code
 */
function getErrorName(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Unprocessable Entity';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Internal Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    default:
      return 'Error';
  }
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found middleware
 */
export function notFound(req: Request, res: Response, next: NextFunction) {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
}
