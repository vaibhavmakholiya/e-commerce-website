const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB at ${config.mongoUri}. Reason: ${error.message}`);
    console.warn(`[Database Warning] The server is continuing to run. Please configure MONGODB_URI in server/.env when ready.`);
    isConnected = false;
  }
};

const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = {
  connectDB,
  getDbStatus
};
