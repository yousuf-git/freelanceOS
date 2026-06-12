import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../../src/app.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('POST /api/v1/auth/register', () => {
  it('registers a new freelancer', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      baseCurrency: 'PKR',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.user.role).toBe('freelancer');
  });

  it('rejects duplicate email with 409', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User 2',
      email: 'test@example.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects short password with 400', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User 3',
      email: 'test3@example.com',
      password: 'short',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/v1/auth/login', () => {
  it('logs in with valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'WrongPassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });
});

describe('GET /api/v1/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'Password123!',
    });
    token = res.body.data.accessToken;
  });

  it('returns user with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('test@example.com');
  });

  it('rejects without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
