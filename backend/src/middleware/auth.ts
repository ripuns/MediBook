import type { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../lib/jwt';

export type AuthUser = {
  sub: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const payload = verifyAccessToken(token) as AuthUser;

    if (!payload?.sub) {
      throw new Error('Invalid token payload.');
    }

    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token.',
      error: error instanceof Error ? error.message : 'Unknown auth error',
    });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      });
    }

    return next();
  };
}
