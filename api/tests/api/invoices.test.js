import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../../src/app.js';

let mongod;
let token;
let platformId;
let clientId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  // Register + login
  await request(app).post('/api/v1/auth/register').send({
    name: 'Invoice Tester',
    email: 'invoices@test.com',
    password: 'Password123!',
  });
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'invoices@test.com',
    password: 'Password123!',
  });
  token = loginRes.body.data.accessToken;

  // Create platform
  const platformRes = await request(app)
    .post('/api/v1/platforms')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Platform', feeModel: 'none', feeConfig: {} });
  platformId = platformRes.body.data._id;

  // Create client
  const clientRes = await request(app)
    .post('/api/v1/clients')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Client', billingCurrency: 'USD' });
  clientId = clientRes.body.data._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('POST /api/v1/invoices', () => {
  it('creates a draft invoice', async () => {
    const res = await request(app)
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        platformId,
        currency: 'USD',
        issueDate: '2026-06-01T00:00:00.000Z',
        dueDate: '2026-07-01T00:00:00.000Z',
        lineItems: [{ description: 'Dev work', quantity: 1, unitPriceMinor: 100000 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('draft');
    expect(res.body.data.totalMinor).toBe(100000);
    expect(res.body.data.number).toMatch(/^INV-/);
  });

  it('rejects invoice without line items', async () => {
    const res = await request(app)
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        platformId,
        currency: 'USD',
        issueDate: '2026-06-01T00:00:00.000Z',
        dueDate: '2026-07-01T00:00:00.000Z',
        lineItems: [],
      });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/invoices', () => {
  it('returns invoice list with meta', async () => {
    const res = await request(app)
      .get('/api/v1/invoices')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('page');
  });
});
