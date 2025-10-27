const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Define PORT from environment or default
const PORT = process.env.PORT || 3001;

// CORS Configuration
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      console.error(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow cookies to be sent
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Campus Hire API is running' });
});

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const recruiterRoutes = require('./routes/recruiter');
const jobRoutes = require('./routes/job');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/jobs', jobRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// MongoDB connection with retry logic
let connectionAttempts = 0;
const maxAttempts = 5;

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');
        
        // Start server only after successful MongoDB connection
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        connectionAttempts++;
        console.error(`MongoDB connection attempt ${connectionAttempts} failed:`, err);
        
        if (connectionAttempts < maxAttempts) {
            const backoff = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
            console.log(`Retrying connection in ${backoff/1000}s...`);
            setTimeout(connectToMongoDB, backoff);
        } else {
            console.error('Failed to connect to MongoDB after multiple attempts');
            process.exit(1);
        }
    }
};

// Start connection process
connectToMongoDB();