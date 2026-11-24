const request = require('supertest');
const bcrypt = require('bcryptjs');
jest.mock('../../models/User');
const User = require('../../models/User');
const app = require('../../app');

const withSelect = (user) => ({ select: jest.fn().mockResolvedValue(user) });

beforeEach(() => jest.clearAllMocks());

describe('POST /api/auth/login', () => {
  it('400 when email/password missing', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('401 for an unknown user', async () => {
    User.findOne.mockReturnValue(withSelect(null));
    const res = await request(app).post('/api/auth/login').send({ email: 'x@y.com', password: 'pw' });
    expect(res.status).toBe(401);
  });

  it('401 for a wrong password', async () => {
    User.findOne.mockReturnValue(withSelect({ password: await bcrypt.hash('right', 4) }));
    const res = await request(app).post('/api/auth/login').send({ email: 'x@y.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('200 + JWT with role for valid credentials', async () => {
    User.findOne.mockReturnValue(
      withSelect({ _id: 'u1', name: 'Alex', email: 'a@d.com', role: 'Admin', password: await bcrypt.hash('password123', 4) })
    );
    const res = await request(app).post('/api/auth/login').send({ email: 'A@D.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('Admin');
    expect(res.body.user.password).toBeUndefined();
  });
});

describe('platform endpoints', () => {
  it('GET /api/health is 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('GET /api/ready is 503 when the DB is not connected', async () => {
    const res = await request(app).get('/api/ready');
    expect(res.status).toBe(503);
  });

  it('unknown route returns the JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
  });
});
