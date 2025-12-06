const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
// const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// 🟢 NEW SECURITY IMPORTS
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
// dotenv.config();
connectDB();

const app = express();
app.set('trust proxy', 1);
// 🟢 1. HELMET: Sets secure HTTP headers (Hides that you are using Express)
app.use(helmet());

// 🟢 2. RATE LIMITER: Blocks IPs that make too many requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

app.use(cors());
app.use(express.json()); // Body parser

// ... (Rest of your routes remain the same) ...
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes')); // Make sure auth routes are here

const PORT = parseInt(process.env.PORT) || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));