const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

// Initialize App
const app = express();

// Database Connection
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  // Also clean trailing slash if present
  try {
    const trimmed = process.env.FRONTEND_URL.replace(/\/$/, "");
    if (!allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  } catch (e) {
    // Ignore error
  }
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger - MUST BE ABOVE ROUTES
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Root Route
app.get('/', (req, res) => {
  res.send('UrbanKick API is running...');
});

// Port Configuration
const PORT = process.env.PORT || 5000;

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`📡 Server running on port ${PORT}`);
});
