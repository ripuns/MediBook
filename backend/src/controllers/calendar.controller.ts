import type { NextFunction, Request, Response } from 'express';
import { google } from 'googleapis';

import { env } from '../config/env';
import { getTokens, storeTokens } from '../lib/calendar';

export async function calendarConnectController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI,
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly',
      ],
      state: userId,
    });

    return res.status(200).json({
      success: true,
      data: {
        url: authUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function calendarCallbackController(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Google OAuth callback is missing required parameters.',
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI,
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return res.status(502).json({
        success: false,
        message: 'Google OAuth did not return an access token.',
      });
    }

    await storeTokens(state, {
      access_token: tokens.access_token,
      ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
      ...(tokens.expiry_date !== null && tokens.expiry_date !== undefined
        ? { expiry_date: tokens.expiry_date }
        : {}),
    });

    const redirectUrl = `${env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/calendar-connected`;
    return res.redirect(redirectUrl);
  } catch (error) {
    return next(error);
  }
}

export async function calendarStatusController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const tokens = await getTokens(userId);

    return res.status(200).json({
      success: true,
      data: {
        connected: Boolean(tokens),
      },
    });
  } catch (error) {
    return next(error);
  }
}
