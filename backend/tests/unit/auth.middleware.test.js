const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../../middleware/auth');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('protect', () => {
  it('401 when no Authorization header', () => {
    const res = mockRes();
    const next = jest.fn();
    protect({ headers: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('401 for a malformed token', () => {
    const res = mockRes();
    protect({ headers: { authorization: 'Bearer garbage' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('401 for an expired token', () => {
    const token = jwt.sign({ id: 1, role: 'Admin' }, process.env.JWT_SECRET, { expiresIn: -10 });
    const res = mockRes();
    protect({ headers: { authorization: `Bearer ${token}` } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('attaches the decoded user and calls next for a valid token', () => {
    const token = jwt.sign({ id: 'u1', role: 'Employee', name: 'E' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    protect(req, mockRes(), next);
    expect(req.user).toMatchObject({ id: 'u1', role: 'Employee' });
    expect(next).toHaveBeenCalled();
  });
});

describe('authorize (RBAC)', () => {
  it('allows a permitted role', () => {
    const next = jest.fn();
    authorize('Admin')({ user: { role: 'Admin' } }, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('403 for a role that is not permitted', () => {
    const res = mockRes();
    const next = jest.fn();
    authorize('Admin')({ user: { role: 'Employee' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('403 when there is no user on the request', () => {
    const res = mockRes();
    authorize('Admin')({}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
