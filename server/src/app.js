const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const apiRoutes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// 1. HTTP Request Logging (morgan)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 2. Safe CORS Configuration
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, automated test suites)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-guest-cart-id']
}));

// 3. Body Parsing Middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Rate Limiting Middleware
app.use('/api', apiLimiter);

// 5. Root API Greeting Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'NovaCart E-Commerce REST API',
    version: '1.0.0',
    documentation: '/api/v1/health',
    status: 'online'
  });
});

// 6. Mount Versioned API Routes (/api/v1 and /api)
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);

// 7. 404 & Centralized Error Handling Middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
