const app = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/db');

// Connect to MongoDB Atlas (or local fallback)
connectDB();

// Start HTTP Server
const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 NovaCart API Server running on port ${config.port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Base URL: http://localhost:${config.port}`);
  console.log(`🩺 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection Error]: ${err.message}`);
  // In production, server can close gracefully
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception Error]: ${err.message}`);
  process.exit(1);
});

module.exports = server;
