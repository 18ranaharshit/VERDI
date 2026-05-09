// Performance: Singleton MongoDB connection with pool management - prevents cold-start reconnections on Render
const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  isConnected = conn.connections[0].readyState === 1;
  console.error(`[DB] MongoDB connected: ${conn.connection.host}`);
};

module.exports = { connectDB };
