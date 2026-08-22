import bcrypt from 'bcrypt';

import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';

export type AuthUser = {
  id: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  email: string;
  name: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    const error = new Error('A user with this email already exists.') as Error & { statusCode?: number };
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
    },
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role, email: user.email });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    tokens: { accessToken, refreshToken },
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    const error = new Error('Invalid email or password.') as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    const error = new Error('Invalid email or password.') as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role, email: user.email });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    tokens: { accessToken, refreshToken },
  };
}

export async function refreshUserSession(input: { refreshToken: string }) {
  const payload = verifyRefreshToken(input.refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: input.refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    const error = new Error('Refresh token is invalid or expired.') as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }

  const user = storedToken.user;
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role, email: user.email });

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: storedToken.id } }),
    prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    payload,
  };
}

export async function logoutUser(input: { refreshToken: string }) {
  const token = await prisma.refreshToken.findUnique({
    where: { token: input.refreshToken },
  });

  if (!token) {
    const error = new Error('Refresh token not found.') as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }

  await prisma.refreshToken.delete({ where: { id: token.id } });

  return { success: true };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    const error = new Error('User not found.') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  return user;
}
