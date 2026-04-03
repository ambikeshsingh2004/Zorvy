require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase standard connections
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to Supabase PostgreSQL database successfully!');
  release();
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const userAnalyticsRoutes = require('./routes/userAnalyticsRoutes');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

// Use Routes
app.use('/api/auth', authRoutes(pool));
app.use('/api/records', recordRoutes(pool));
app.use('/api/dashboard/analytics', analyticsRoutes(pool));
app.use('/api/users', userRoutes(pool));
app.use('/api/user-analytics', userAnalyticsRoutes(pool));

// Basic API health check
app.get('/api', (req, res) => res.json({ status: 'ok', message: 'API is running.' }));

// ==========================================
// SINGLE DEPLOYMENT - Serve Frontend Statically
// ==========================================
// In production, Express will serve the compiled React bundle
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// For any other route, send the React index.html so React Router handles it
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Global error handler — must be LAST
app.use(errorHandler);

// ==========================================
// GRACEFUL SHUTDOWN — fixes EADDRINUSE on nodemon restart
// ==========================================
const server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});

// Handle port already in use
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Retrying in 2s...`);
        setTimeout(() => {
            server.close();
            server.listen(PORT);
        }, 2000);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});

// Graceful shutdown on SIGTERM (sent by nodemon on restart)
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received — shutting down gracefully...');
    server.close(() => {
        pool.end(() => {
            console.log('✅ DB pool closed. Process exiting.');
            process.exit(0);
        });
    });
});

// Graceful shutdown on Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🔄 SIGINT received — shutting down...');
    server.close(() => {
        pool.end(() => {
            process.exit(0);
        });
    });
});
