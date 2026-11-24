const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');

const openapiDocument = require('./swagger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Builds the Express app WITHOUT starting a server or connecting to the DB,
// so Supertest can import it directly.
const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Liveness: the process is up and able to answer HTTP.
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'DeskFlow API is running.' });
});

// Readiness: only ready for traffic once MongoDB is connected (readyState 1).
app.get('/api/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ success: ready, database: ready ? 'connected' : 'unavailable' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
