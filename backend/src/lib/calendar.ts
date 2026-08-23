import { google } from 'googleapis';

import { env } from '../config/env';
import { prisma } from './prisma';

export type StoredGoogleTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
};

export type CalendarEventInput = {
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    timeZone?: string;
  };
  attendees?: Array<{ email?: string; optional?: boolean }>;
  status?: string;
};

export async function storeTokens(userId: string, tokens: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number | string;
}) {
  const expiresAt = new Date(Number(tokens.expiry_date ?? Date.now() + 60 * 60 * 1000));

  const googleToken = await prisma.googleToken.upsert({
    where: { userId },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? (await prisma.googleToken.findUnique({ where: { userId } }))?.refreshToken ?? '',
      expiresAt,
    },
    create: {
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? '',
      expiresAt,
    },
  });

  return googleToken;
}

export async function getTokens(userId: string) {
  return prisma.googleToken.findUnique({
    where: { userId },
  });
}

export async function getOAuthClient(userId: string) {
  const tokens = await getTokens(userId);

  if (!tokens) {
    throw new Error(`Google Calendar tokens not found for user ${userId}`);
  }

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );

  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiresAt.getTime(),
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  return { oauth2Client, calendar };
}

export async function createEvent(userId: string, event: CalendarEventInput) {
  const { calendar } = await getOAuthClient(userId);

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    sendUpdates: 'externalOnly',
  });

  return response.data;
}

export async function updateEvent(userId: string, eventId: string, event: CalendarEventInput) {
  const { calendar } = await getOAuthClient(userId);

  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId,
    requestBody: event,
    sendUpdates: 'externalOnly',
  });

  return response.data;
}

export async function deleteEvent(userId: string, eventId: string) {
  const { calendar } = await getOAuthClient(userId);

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });

  return true;
}
