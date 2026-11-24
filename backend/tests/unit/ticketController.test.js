jest.mock('../../models/Ticket');
const Ticket = require('../../models/Ticket');
const { createTicket, getTickets, updateTicketStatus } = require('../../controllers/ticketController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => jest.clearAllMocks());

describe('createTicket', () => {
  const user = { id: 'u1', name: 'Emma' };

  it('creates a ticket and returns 201', async () => {
    Ticket.create.mockResolvedValue({ _id: 't1', title: 'Wifi down' });
    const res = mockRes();
    await createTicket(
      { body: { title: ' Wifi down ', description: ' No wifi ', priority: 'High' }, user },
      res,
      jest.fn()
    );
    expect(Ticket.create).toHaveBeenCalledWith({
      title: 'Wifi down',
      description: 'No wifi',
      priority: 'High',
      createdBy: 'u1',
      createdByName: 'Emma',
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 400 listing every missing field', async () => {
    const res = mockRes();
    await createTicket({ body: { title: '  ' }, user }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toMatch(/title, description, priority/);
    expect(Ticket.create).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid priority', async () => {
    const res = mockRes();
    await createTicket({ body: { title: 'a', description: 'b', priority: 'Urgent' }, user }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toMatch(/Priority must be one of/);
  });

  it('forwards DB errors to next()', async () => {
    const err = new Error('db down');
    Ticket.create.mockRejectedValue(err);
    const next = jest.fn();
    await createTicket({ body: { title: 'a', description: 'b', priority: 'Low' }, user }, mockRes(), next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe('getTickets', () => {
  const chain = (rows) => ({ sort: jest.fn().mockResolvedValue(rows) });

  it('scopes employees to their own tickets', async () => {
    Ticket.find.mockReturnValue(chain([{ _id: 1 }]));
    const res = mockRes();
    await getTickets({ user: { id: 'u1', role: 'Employee' } }, res, jest.fn());
    expect(Ticket.find).toHaveBeenCalledWith({ createdBy: 'u1' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('lets admins see all tickets', async () => {
    Ticket.find.mockReturnValue(chain([]));
    await getTickets({ user: { id: 'a1', role: 'Admin' } }, mockRes(), jest.fn());
    expect(Ticket.find).toHaveBeenCalledWith({});
  });
});

describe('updateTicketStatus (status transitions)', () => {
  it.each(['Open', 'In Progress', 'Resolved'])('accepts status "%s"', async (status) => {
    const ticket = { status: 'Open', save: jest.fn().mockResolvedValue() };
    Ticket.findById.mockResolvedValue(ticket);
    const res = mockRes();
    await updateTicketStatus({ params: { id: 't1' }, body: { status } }, res, jest.fn());
    expect(ticket.status).toBe(status);
    expect(ticket.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects an unknown status', async () => {
    const res = mockRes();
    await updateTicketStatus({ params: { id: 't1' }, body: { status: 'Closed' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects a missing status', async () => {
    const res = mockRes();
    await updateTicketStatus({ params: { id: 't1' }, body: {} }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when the ticket does not exist', async () => {
    Ticket.findById.mockResolvedValue(null);
    const res = mockRes();
    await updateTicketStatus({ params: { id: 'nope' }, body: { status: 'Resolved' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
