const { sendSuccess } = require('../utils/responseHandler');
const { getDbStatus } = require('../config/db');

/**
 * Health check endpoint controller
 */
const getHealthStatus = (req, res) => {
  const healthData = {
    service: 'NovaCart API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    database: getDbStatus(),
    environment: process.env.NODE_ENV || 'development'
  };

  sendSuccess(res, 'NovaCart API is running smoothly', healthData);
};

module.exports = {
  getHealthStatus
};
