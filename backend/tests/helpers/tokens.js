const jwt = require('jsonwebtoken');

const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

module.exports = {
  employeeToken: (id = 'emp1') => sign({ id, role: 'Employee', name: 'Emma Employee' }),
  adminToken: (id = 'adm1') => sign({ id, role: 'Admin', name: 'Alex Admin' }),
};
