import { z } from 'zod';

const isTestEnv = process.env.NODE_ENV === 'test';
const testDefaults = {
  DATABASE_URL: 'postgresql://user:password@localhost:5432/medibook_test',
  JWT_ACCESS_SECRET: 'test-jwt-access-secret-12345678901234567890',
  JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-12345678901234567890',
  GMAIL_USER: 'test@example.com',
  GMAIL_APP_PASSWORD: 'test-app-password',
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  GOOGLE_REDIRECT_URI: 'http://localhost:5000/api/calendar/oauth/callback',
  NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
};

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default(isTestEnv ? testDefaults.DATABASE_URL : ''),
  JWT_ACCESS_SECRET: z.string().min(32).default(isTestEnv ? testDefaults.JWT_ACCESS_SECRET : ''),
  JWT_REFRESH_SECRET: z.string().min(32).default(isTestEnv ? testDefaults.JWT_REFRESH_SECRET : ''),
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  GMAIL_USER: z.string().email().default(isTestEnv ? testDefaults.GMAIL_USER : ''),
  GMAIL_APP_PASSWORD: z.string().min(1).default(isTestEnv ? testDefaults.GMAIL_APP_PASSWORD : ''),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).default(isTestEnv ? testDefaults.GOOGLE_CLIENT_ID : ''),
  GOOGLE_CLIENT_SECRET: z.string().min(1).default(isTestEnv ? testDefaults.GOOGLE_CLIENT_SECRET : ''),
  GOOGLE_REDIRECT_URI: z.string().url().default(isTestEnv ? testDefaults.GOOGLE_REDIRECT_URI : ''),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().default(isTestEnv ? testDefaults.NEXT_PUBLIC_API_URL : ''),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
