const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // 🟢 CRITICAL: Connection Pool Configuration
      maxPoolSize: 50,        // Max 10 connections (safe for free tier)
      minPoolSize: 2,         // Keep 2 warm connections
      maxIdleTimeMS: 30000,   // Close idle connections after 30s
      
      // 🟢 CRITICAL: Timeout Configuration
      serverSelectionTimeoutMS: 5000,   // Fail fast if MongoDB unreachable
      socketTimeoutMS: 45000,           // Close hanging sockets after 45s
      connectTimeoutMS: 10000,          // Timeout connection attempts
      
      // 🟢 CRITICAL: Connection Management
      family: 4,                        // Use IPv4, avoid DNS issues
      retryWrites: true,
      w: 'majority',
      
      // Deprecated options (keep for compatibility)
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Pool Size: ${conn.connection.client.s.options.maxPoolSize}`);
    
    // 🟢 Monitor connection health
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting reconnect...');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
    });
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;