import type { NextFunction, Request, Response } from 'express';

// We centralize error formatting here so route handlers can throw business errors
// without duplicating HTTP response boilerplate across the API surface.
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode =
    error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
      ? error.statusCode
      : 500;

  const message =
    error instanceof Error
      ? error.message
      : 'An unexpected error occurred while processing your request.';

  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? message : undefined,
  });
}
