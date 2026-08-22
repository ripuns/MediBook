import type { NextFunction, Request, Response } from 'express';

import { loginSchema, logoutSchema, refreshTokenSchema, registerSchema } from '../schemas/auth.schema';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from '../services/auth.service';

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration payload.',
        errors: parsed.error.flatten(),
      });
    }

    const result = await registerUser(parsed.data);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid login payload.',
        errors: parsed.error.flatten(),
      });
    }

    const result = await loginUser(parsed.data);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function refreshController(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = refreshTokenSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refresh payload.',
        errors: parsed.error.flatten(),
      });
    }

    const result = await refreshUserSession(parsed.data);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function logoutController(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = logoutSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid logout payload.',
        errors: parsed.error.flatten(),
      });
    }

    await logoutUser(parsed.data);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    return next(error);
  }
}

export async function meController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;

    if (!user?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const currentUser = await getCurrentUser(user.sub);

    return res.status(200).json({
      success: true,
      data: currentUser,
    });
  } catch (error) {
    return next(error);
  }
}
