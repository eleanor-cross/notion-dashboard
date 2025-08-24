// ABOUTME: Express server for Duke Law Dashboard with Notion API integration
// ABOUTME: Handles timer, tasks, reading tracking, and analytics endpoints

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const notionRoutes = require('./routes/notion');
const timerRoutes = require('./routes/timer');
const analyticsRoutes = require('./routes/analytics');
const databaseRoutes = require('./routes/database');

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware with iframe-friendly configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    }
  },
  // Allow iframe embedding for widget pages
  frameOptions: false
}));

// CORS configuration for widget embedding
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    // Allow Notion domains for iframe embedding
    'https://www.notion.so',
    'https://notion.so',
    // Allow localhost for development
    /^http:\/\/localhost:\d+$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'session-id']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    build_commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    deployed_at: process.env.VERCEL_DEPLOYMENT_URL || `http://localhost:${PORT}`
  });
});

// Base API route - provides information about available endpoints
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Duke Law Dashboard API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      notion: {
        tasks: '/api/notion/tasks',
        todaysTasks: '/api/notion/tasks/today',
        activeTasks: '/api/notion/tasks/active',
        textbooks: '/api/notion/textbooks',
        schedule: '/api/notion/schedule/today'
      },
      timer: {
        start: 'POST /api/timer/start',
        stop: 'POST /api/timer/stop',
        status: '/api/timer/status',
        quickTasks: '/api/timer/quick-tasks'
      },
      analytics: {
        readingSpeed: '/api/analytics/reading-speed',
        timeDistribution: '/api/analytics/time-distribution',
        insights: '/api/analytics/insights'
      }
    },
    documentation: 'See README.md for full API documentation'
  });
});

// API routes
app.use('/api/notion', notionRoutes);
app.use('/api/timer', timerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/database', databaseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl 
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard API ready at http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;