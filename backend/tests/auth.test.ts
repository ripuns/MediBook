import request from 'supertest';

import app from '../src/app';

describe('MediBook auth API', () => {
  const validUser = {
    name: 'Test Patient',
    email: `testpatient-${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'PATIENT' as const,
  };

  let refreshToken: string;
  let accessToken: string;

  it('registers a new user and returns tokens', async () => {
    const response = await request(app).post('/api/auth/register').send(validUser);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(validUser.email);
    expect(response.body.data.tokens.accessToken).toBeTruthy();
    expect(response.body.data.tokens.refreshToken).toBeTruthy();

    accessToken = response.body.data.tokens.accessToken;
    refreshToken = response.body.data.tokens.refreshToken;
  });

  it('returns 409 for a duplicate email', async () => {
    const response = await request(app).post('/api/auth/register').send(validUser);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('rejects invalid password login', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: validUser.email,
      password: 'WrongPassword123!',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('returns 401 when the bearer token is missing', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('returns user data for a valid token', async () => {
    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(validUser.email);
  });

  it('refreshes the session with a valid refresh token', async () => {
    const response = await request(app).post('/api/auth/refresh').send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeTruthy();
    expect(response.body.data.refreshToken).toBeTruthy();

    refreshToken = response.body.data.refreshToken;
  });

  it('logs the user out', async () => {
    const response = await request(app).post('/api/auth/logout').send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Logged out successfully.');
  });
});
