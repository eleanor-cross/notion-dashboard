// ABOUTME: Express routes for dynamic Notion database configuration
// ABOUTME: Handles database URL validation, testing, and configuration management

const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const dynamicNotionService = require('../services/dynamicNotionClient');
const crypto = require('crypto');
const { 
  extractDatabaseId, 
  parseNotionDatabaseConfig
} = require('../utils/notionUrlParser');

// In-memory storage for database configurations per session
// Now includes encrypted token storage
const sessionConfigs = new Map();

// Simple encryption for session token storage
const ENCRYPTION_KEY = process.env.SESSION_ENCRYPTION_KEY || crypto.randomBytes(32);

function encryptToken(token) {
  if (!token) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptToken(encryptedToken) {
  if (!encryptedToken) return null;
  try {
    const textParts = encryptedToken.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Token decryption failed:', error);
    return null;
  }
}

/**
 * Validate Notion token
 */
router.post('/validate-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Notion token is required'
      });
    }

    const validation = await dynamicNotionService.validateToken(token);
    
    res.json({
      success: true,
      validation
    });

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during token validation'
    });
  }
});

/**
 * Test database connection with provided token
 */
router.post('/test', async (req, res) => {
  try {
    const { url, type, token } = req.body;
    const sessionId = req.headers['session-id'] || 'default';
    
    if (!url || !type) {
      return res.status(400).json({
        success: false,
        error: 'URL and type are required'
      });
    }

    // Validate URL format
    const databaseId = extractDatabaseId(url);
    if (!databaseId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Notion URL format'
      });
    }

    // Get token from request or session
    let notionToken = token;
    if (!notionToken) {
      const sessionConfig = sessionConfigs.get(sessionId);
      if (sessionConfig && sessionConfig.encryptedToken) {
        notionToken = decryptToken(sessionConfig.encryptedToken);
      } else {
        notionToken = process.env.NOTION_TOKEN;
      }
    }

    if (!notionToken) {
      return res.status(400).json({
        success: false,
        error: 'No Notion token available. Please configure your token first.'
      });
    }

    // Use dynamic client for testing
    const client = dynamicNotionService.getClient(notionToken, false);

    try {
      // Test database access by querying first page
      const response = await client.databases.query({
        database_id: databaseId,
        page_size: 1
      });

      // Get database metadata
      const database = await client.databases.retrieve({
        database_id: databaseId
      });

      res.json({
        success: true,
        databaseId: databaseId,
        title: database.title?.[0]?.plain_text || 'Untitled Database',
        properties: Object.keys(database.properties || {}),
        pageCount: response.results?.length || 0,
        accessible: true
      });

    } catch (notionError) {
      console.error('Notion API error:', notionError);
      
      let errorMessage = 'Database not accessible';
      if (notionError.code === 'object_not_found') {
        errorMessage = 'Database not found or not shared with integration';
      } else if (notionError.code === 'unauthorized') {
        errorMessage = 'Unauthorized access to database';
      }

      res.status(403).json({
        success: false,
        error: errorMessage,
        databaseId: databaseId
      });
    }

  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during database test'
    });
  }
});

/**
 * Configure database URLs and token for a session
 */
router.post('/configure', async (req, res) => {
  try {
    const { token, ...databaseConfig } = req.body;
    const sessionId = req.headers['session-id'] || 'default';

    if (!databaseConfig || typeof databaseConfig !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Configuration object is required'
      });
    }

    // Validate token if provided
    let tokenValidation = null;
    if (token) {
      tokenValidation = await dynamicNotionService.validateToken(token);
      if (!tokenValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Notion token provided',
          tokenError: tokenValidation.error
        });
      }
    }

    // Parse and validate database configuration
    const parsed = parseNotionDatabaseConfig(databaseConfig);

    if (!parsed.hasValidDatabases && !token) {
      return res.status(400).json({
        success: false,
        error: 'No valid database URLs or token provided',
        invalid: parsed.invalid
      });
    }

    // Prepare session configuration
    const sessionConfig = {
      databases: parsed.valid,
      timestamp: new Date().toISOString()
    };

    // Store encrypted token if provided
    if (token) {
      sessionConfig.encryptedToken = encryptToken(token);
      sessionConfig.hasToken = true;
      sessionConfig.tokenValidation = {
        isValid: tokenValidation.isValid,
        databaseCount: tokenValidation.databaseCount,
        tokenType: tokenValidation.tokenType
      };
    }

    // Store configuration for this session
    sessionConfigs.set(sessionId, sessionConfig);

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      validDatabases: Object.keys(parsed.valid),
      invalidDatabases: Object.keys(parsed.invalid),
      tokenConfigured: !!token,
      tokenValidation: tokenValidation ? {
        isValid: tokenValidation.isValid,
        databaseCount: tokenValidation.databaseCount,
        hasAccess: tokenValidation.hasAccess
      } : null
    });

  } catch (error) {
    console.error('Database configuration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during configuration'
    });
  }
});

/**
 * Get current database configuration for a session
 */
router.get('/configuration', (req, res) => {
  try {
    const sessionId = req.headers['session-id'] || 'default';
    const sessionConfig = sessionConfigs.get(sessionId);

    if (!sessionConfig) {
      return res.json({
        success: true,
        configured: false,
        hasToken: false,
        message: 'No configuration found for this session'
      });
    }

    // Return configuration without sensitive data
    const safeConfig = {};
    if (sessionConfig.databases) {
      for (const [type, config] of Object.entries(sessionConfig.databases)) {
        safeConfig[type] = {
          configured: true,
          databaseId: config.databaseId,
          hasUrl: Boolean(config.originalUrl)
        };
      }
    }

    res.json({
      success: true,
      configured: Object.keys(safeConfig).length > 0 || sessionConfig.hasToken,
      hasToken: Boolean(sessionConfig.hasToken),
      tokenValidation: sessionConfig.tokenValidation || null,
      databases: safeConfig,
      timestamp: sessionConfig.timestamp
    });

  } catch (error) {
    console.error('Get configuration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get session configuration including token and databases
 * This is used internally by other routes
 */
function getSessionConfig(sessionId) {
  const sessionConfig = sessionConfigs.get(sessionId || 'default');
  
  if (!sessionConfig) {
    return {
      token: process.env.NOTION_TOKEN,
      databases: {
        tasks: process.env.TASKS_DB_ID,
        textbooks: process.env.TEXTBOOKS_DB_ID,
        timeTracking: process.env.TIME_TRACKING_DB_ID,
        schedule: process.env.SCHEDULE_DB_ID
      }
    };
  }
  
  return {
    token: sessionConfig.encryptedToken ? decryptToken(sessionConfig.encryptedToken) : process.env.NOTION_TOKEN,
    databases: sessionConfig.databases || {}
  };
}

/**
 * Get database ID for a specific type and session (legacy function for compatibility)
 */
function getDatabaseId(sessionId, type) {
  const config = getSessionConfig(sessionId);
  return config.databases[type] || null;
}

/**
 * Clear database configuration for a session
 */
router.delete('/configuration', (req, res) => {
  try {
    const sessionId = req.headers['session-id'] || 'default';
    
    const deleted = sessionConfigs.delete(sessionId);
    
    res.json({
      success: true,
      message: deleted ? 'Configuration cleared' : 'No configuration found',
      cleared: deleted
    });

  } catch (error) {
    console.error('Clear configuration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Export both the router and helper functions
module.exports = router;
module.exports.getDatabaseId = getDatabaseId;
module.exports.getSessionConfig = getSessionConfig;