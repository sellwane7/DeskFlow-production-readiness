const request = require('supertest');
jest.mock('../../models/Ticket');
const Ticket = require('../../models/Ticket');
const app = require('../../app');
const { employeeToken, adminToken } = require('../helpers/tokens');

beforeEach(() => jest.clearAllMocks());

describe('Auth guard on /api/tickets', () => {
  it('401 without a token', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/tickets', () => {
  const body = { title: 'Laptop broken', description: 'Screen cracked', priority: 'High' };

  it('201 for an Employee', async () => {
    Ticket.create.mockResolvedValue({ _id: 't1', ...body, status: 'Open' });
    const res = await request(app).post('/api/tickets').set('Authorization', `Bearer ${employeeToken()}`).send(body);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('Open');
  });

  it('403 for an Admin (RBAC)', async () => {
    const res = await request(app).post('/api/tickets').set('Authorization', `Bearer ${adminToken()}`).send(body);
    expect(res.status).toBe(403);
  });

  it('400 on invalid input', async () => {
    const res = await request(app).post('/api/tickets').set('Authorization', `Bearer ${employeeToken()}`).send({ title: 'x' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/tickets', () => {
  it('employees only query their own tickets', async () => {
    Ticket.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: 1 }]) });
    const res = await request(app).get('/api/tickets').set('Authorization', `Bearer ${employeeToken('emp9')}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(Ticket.find).toHaveBeenCalledWith({ createdBy: 'emp9' });
  });

  it('admins query everything', async () => {
    Ticket.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    await request(app).get('/api/tickets').set('Authorization', `Bearer ${adminToken()}`);
    expect(Ticket.find).toHaveBeenCalledWith({});
  });
});

describe('PUT /api/tickets/:id', () => {
  it('200 for an Admin changing status', async () => {
    const ticket = { status: 'Open', save: jest.fn().mockResolvedValue() };
    Ticket.findById.mockResolvedValue(ticket);
    const res = await request(app).put('/api/tickets/abc').set('Authorization', `Bearer ${adminToken()}`).send({ status: 'In Progress' });
    expect(res.status).toBe(200);
    expect(ticket.status).toBe('In Progress');
  });

  it('403 for an Employee (RBAC)', async () => {
    const res = await request(app).put('/api/tickets/abc').set('Authorization', `Bearer ${employeeToken()}`).send({ status: 'Resolved' });
    expect(res.status).toBe(403);
  });

  it('404 for a missing ticket', async () => {
    Ticket.findById.mockResolvedValue(null);
    const res = await request(app).put('/api/tickets/abc').set('Authorization', `Bearer ${adminToken()}`).send({ status: 'Resolved' });
    expect(res.status).toBe(404);
  });

  it('400 for an invalid status', async () => {
    const res = await request(app).put('/api/tickets/abc').set('Authorization', `Bearer ${adminToken()}`).send({ status: 'Nope' });
    expect(res.status).toBe(400);
  });
});
