import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

// We centralize error formatting here so route handlers can throw business errors
// without duplicating HTTP response boilerplate across the API surface.
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  let statusCode = 500;

  if (error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number') {
    statusCode = error.statusCode;
  } else if (error instanceof ZodError) {
    statusCode = 400;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      statusCode = 409;
    } else if (error.code === 'P2025') {
      statusCode = 404;
    } else {
      statusCode = 400;
    }
  }

  const message =
    error instanceof ZodError
      ? 'Validation failed.'
      : error instanceof Error
      ? error.message
      : 'An unexpected error occurred while processing your request.';

  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development'
      ? error instanceof Error
        ? error.message
        : String(error)
      : undefined,
  });
}
