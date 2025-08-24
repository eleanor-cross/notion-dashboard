// ABOUTME: Authentication routes for Duke Law Dashboard
// ABOUTME: Handles login, logout, and authentication status endpoints

const express = require('express');
const router = express.Router();
const { handleLogin, handleLogout, AUTH_CONFIG } = require('../middleware/auth');
const { logoutUser, isAuthenticated } = require('../middleware/session');

/**
 * Login endpoint
 * Accepts username/password and creates authenticated session
 */
router.post('/login', handleLogin);

/**
 * Logout endpoint  
 * Destroys current session
 */
router.post('/logout', (req, res) => {
  logoutUser(req);
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

/**
 * Authentication status check
 * Returns current authentication state
 */
router.get('/status', (req, res) => {
  const authenticated = isAuthenticated(req);
  
  res.json({
    success: true,
    authenticated,
    protectionEnabled: AUTH_CONFIG.enabled,
    user: authenticated ? AUTH_CONFIG.username : null,
    loginTime: req.session?.loginTime || null
  });
});

/**
 * Authentication configuration info
 * Returns public auth configuration (no sensitive data)
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    protectionEnabled: AUTH_CONFIG.enabled,
    authType: 'basic-session',
    sessionTimeout: '24 hours',
    features: [
      'Session-based authentication',
      'Basic HTTP auth fallback', 
      'Auto-logout on browser close',
      'CSRF protection enabled'
    ]
  });
});

module.exports = router;