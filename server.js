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

// Robust Production & Localhost CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://kisan-connect-portal.netlify.app'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(...process.env.FRONTEND_URL.split(',').map((u) => u.trim().replace(/\/$/, '')));
}
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(',').map((u) => u.trim().replace(/\/$/, '')));
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, tests, server-side calls)
    if (!origin) return callback(null, true);

    try {
      const parsedUrl = new URL(origin);
      const isAllowedExplicitly = allowedOrigins.includes(origin) || allowedOrigins.includes(parsedUrl.origin);
      const isNetlifyOrigin = /\.netlify\.app$/.test(parsedUrl.hostname);
      const isLocalhost = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';

      if (isAllowedExplicitly || isNetlifyOrigin || isLocalhost) {
        return callback(null, true);
      }
    } catch (e) {}

    return callback(new Error(`CORS origin ${origin} not allowed by Access-Control-Allow-Origin policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'Kisan Connect Backend API with Government Procurement Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Kisan Connect Backend API with Government Procurement Engine',
    timestamp: new Date().toISOString()
  });
});

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
