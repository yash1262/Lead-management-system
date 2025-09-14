const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config({ override: true });

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');

const app = express();
const User = require('./models/User');

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/lead_management';
const MONGO_URI = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

// Database connection with in-memory fallback for local dev
async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${MONGO_URI}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Falling back to in-memory MongoDB for development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mem = await MongoMemoryServer.create();
      const uri = mem.getUri();
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to in-memory MongoDB instance');
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB:', memErr);
      process.exit(1);
    }
  }
}

async function ensureTestUser() {
  try {
    const existing = await User.findOne({ email: 'admin@test.com' });
    if (!existing) {
      // Delete any existing user with this email first
      await User.deleteOne({ email: 'admin@test.com' });
      
      // Create new user using the same method as registration
      const testUser = new User({
        email: 'admin@test.com',
        password: 'password123', // Let the pre-save hook hash it
        firstName: 'Admin',
        lastName: 'User'
      });
      await testUser.save();
      console.log('Test user created: admin@test.com / password123');
    } else {
      console.log('Test user already exists: admin@test.com');
    }
  } catch (e) {
    console.error('Error ensuring test user:', e);
  }
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDatabase();
  await ensureTestUser();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();