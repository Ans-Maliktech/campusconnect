const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// 🟢 NEW SECURITY IMPORTS
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

connectDB();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(cors({
  origin: [
    // process.env.FRONTEND_URL,
    "https://campusconnect-eevd.vercel.app", 
    "https://campusconnect-bhw5qx7t-ans-abdullah-maliks-projects.vercel.app",
    "https://campusconnect-sigma.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    // "http://localhost:3000", // React default
    // process.env.FRONTEND_URL // Useful to keep localhost working for testing
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true 
}));
app.use(express.json()); 

app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = parseInt(process.env.PORT) || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));