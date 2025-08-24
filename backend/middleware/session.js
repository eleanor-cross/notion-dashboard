// ABOUTME: Session management middleware for Duke Law Dashboard
// ABOUTME: Provides secure session handling with environment-based configuration

const session = require('express-session');
const crypto = require('crypto');

/**
 * Session configuration with security best practices
 */
const sessionConfig = {
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  name: 'duke.session.id', // Custom session name for security
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  }
};

/**
 * Initialize session middleware
 */
function initializeSession() {
  return session(sessionConfig);
}

/**
 * Check if user has valid session
 */
function isAuthenticated(req) {
  return req.session && req.session.authenticated === true;
}

/**
 * Set user as authenticated in session
 */
function authenticateUser(req) {
  if (req.session) {
    req.session.authenticated = true;
    req.session.loginTime = new Date().toISOString();
  }
}

/**
 * Clear user authentication from session
 */
function logoutUser(req) {
  if (req.session) {
    req.session.destroy();
  }
}

module.exports = {
  initializeSession,
  isAuthenticated,
  authenticateUser,
  logoutUser,
  sessionConfig
};