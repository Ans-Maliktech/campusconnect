// const dotenv = require('dotenv');
// dotenv.config();
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const path = require('path');

// // 🟢 NEW SECURITY IMPORTS
// const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');

// connectDB();

// const app = express();

// app.set('trust proxy', 1);

// app.use(helmet());

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 100, 
//   message: 'Too many requests from this IP, please try again after 15 minutes',
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);
// app.use(cors({
//   origin: [
//     // process.env.FRONTEND_URL,
//     "https://campusconnect-eevd.vercel.app", 
//     "https://campusconnect-bhw5qx7t-ans-abdullah-maliks-projects.vercel.app",
//     "https://campusconnect-sigma.vercel.app",
//     "http://localhost:5173",
//     "http://localhost:3000",
//     // "http://localhost:3000", // React default
//     // process.env.FRONTEND_URL // Useful to keep localhost working for testing
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true 
// }));
// // 🟢 CRITICAL: Health check endpoint (no DB, no auth)
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime()
//   });
// });

// app.get('/api/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK',
//     database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     timestamp: new Date().toISOString()
//   });
// });
// app.use(express.json()); 

// app.use('/api/listings', require('./routes/listingRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/auth', require('./routes/authRoutes'));

// const PORT = parseInt(process.env.PORT) || 5000;
// app.get('/ping', (req, res) => {
//   res.status(200).send('Pong! Server is awake.');
// });
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose'); // 🟢 FIX: Added mongoose for database status check
const path = require('path');

// 🟢 NEW SECURITY IMPORTS
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

connectDB();

const app = express();

// =========================================================
// 🟢 CRITICAL FIX: HEALTH CHECK ROUTES (MUST be before limiter)
// These routes are essential for load testing and Render status checks.
// =========================================================

// 1. Basic Health Check (No DB, used by Render/Vercel)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 2. Load Test Health Check (Checks Database Status)
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        // Check if DB is connected (requires mongoose import)
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});
// =========================================================
// END: NON-RATE-LIMITED ROUTES
// =========================================================

// =========================================================
// 🟢 Middleware Chain (Applied to API Routes ONLY)
// =========================================================
app.set('trust proxy', 1); // Required for rate limiting when hosted behind a proxy

app.use(helmet());

// JSON Body Parser MUST be applied before routes
app.use(express.json()); 

app.use(cors({
    origin: [
        "https://campusconnect-eevd.vercel.app", 
        "https://campusconnect-bhw5qx7t-ans-abdullah-maliks-projects.vercel.app",
        "https://campusconnect-sigma.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 300, 
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply the limiter to all API routes
app.use(limiter); 
// =========================================================
// END: Middleware Chain
// =========================================================


// =========================================================
// 🟢 API Route Definitions
// =========================================================
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));


const PORT = parseInt(process.env.PORT) || 5000;

// Catch-all simple endpoint
app.get('/ping', (req, res) => {
    res.status(200).send('Pong! Server is awake.');
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));