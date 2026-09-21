const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const queueRoutes = require('./routes/queueRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Standard Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Kisan Connect Backend API with Government Procurement Engine',
    timestamp: new Date().toISOString()
  });
});

// Production Security Error Handler (prevents sensitive stack trace leakage)
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : (err.message || 'Internal server error.')
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌾 Kisan Connect Backend API running on http://localhost:${PORT}`);
  });
}

module.exports = app;

