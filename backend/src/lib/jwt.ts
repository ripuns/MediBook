import jwt from 'jsonwebtoken';

import { env } from '../config/env';

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = env;

export function signAccessToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_ACCESS_SECRET) as jwt.JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET) as jwt.JwtPayload;
}
