require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const reservationRoutes = require('./routes/reservation.routes');
const folioRoutes = require('./routes/folio.routes');
const housekeepingRoutes = require('./routes/housekeeping.routes');
const activityRoutes = require('./routes/activity.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const posRoutes = require('./routes/pos.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const usersRoutes = require('./routes/users.routes');
const financeRoutes = require('./routes/finance.routes');
const reportsRoutes = require('./routes/reports.routes');
const { errorMiddleware } = require('./middleware/error.middleware');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '2mb' }));

  // CORS — allow localhost in dev and the deployed frontend URL in production
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:4000'];
  if (process.env.APP_URL) allowedOrigins.push(process.env.APP_URL);
  if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use('/api/health', healthRoutes);
  app.use('/api/auth/login', loginLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/folios', folioRoutes);
  app.use('/api/housekeeping', housekeepingRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/pos', posRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/finance', financeRoutes);
  app.use('/api/reports', reportsRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
