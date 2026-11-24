const { errorHandler } = require('../../middleware/errorHandler');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => console.error.mockRestore());

it('maps Mongoose ValidationError to 400', () => {
  const res = mockRes();
  errorHandler({ name: 'ValidationError', errors: { a: { message: 'A bad' } } }, {}, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(400);
});

it('maps CastError to 400', () => {
  const res = mockRes();
  errorHandler({ name: 'CastError', value: 'zzz' }, {}, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(400);
});

it('maps duplicate key (11000) to 400', () => {
  const res = mockRes();
  errorHandler({ code: 11000, keyValue: { email: 'x' } }, {}, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(400);
});

it('hides details of unexpected errors behind a 500', () => {
  const res = mockRes();
  errorHandler(new Error('secret detail'), {}, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json.mock.calls[0][0].message).toBe('Internal Server Error');
});
