// ABOUTME: Simple authentication middleware for Duke Law Dashboard
// ABOUTME: Provides basic auth protection with configurable credentials

const crypto = require('crypto');
const { isAuthenticated, authenticateUser } = require('./session');

// Authentication configuration
const AUTH_CONFIG = {
  enabled: process.env.PROTECTION_ENABLED === 'true',
  username: process.env.AUTH_USERNAME || 'duke-student',
  password: process.env.AUTH_PASSWORD || 'change-me-please',
  sessionSecret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex')
};

/**
 * Authentication middleware with environment-based protection
 * Supports both session-based and basic auth
 */
function requireAuth(req, res, next) {
  // Skip protection if disabled via environment
  if (!AUTH_CONFIG.enabled) {
    return next();
  }

  // Skip auth for API health checks (for monitoring)
  if (req.path === '/api/health') {
    return next();
  }

  // Check for existing session
  if (isAuthenticated(req)) {
    return next();
  }

  // Check for basic auth header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Basic ')) {
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const [username, password] = credentials;

    if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
      // Set session for future requests
      authenticateUser(req);
      return next();
    }
  }

  // Require authentication
  res.set('WWW-Authenticate', 'Basic realm="Duke Law Dashboard"');
  res.status(401).json({
    error: 'Authentication required',
    message: 'Please provide valid credentials to access this application'
  });
}

/**
 * Login endpoint for session-based auth
 */
function handleLogin(req, res) {
  const { username, password } = req.body;

  if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
    authenticateUser(req);
    res.json({ 
      success: true, 
      message: 'Authentication successful',
      user: AUTH_CONFIG.username
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials' 
    });
  }
}

/**
 * Logout endpoint
 */
function handleLogout(req, res) {
  if (req.session) {
    req.session.destroy();
  }
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
}

module.exports = {
  requireAuth,
  handleLogin,
  handleLogout,
  AUTH_CONFIG
};