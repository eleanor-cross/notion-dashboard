// ABOUTME: Express routes for dynamic Notion database configuration
// ABOUTME: Handles database URL validation, testing, and configuration management

const express = require('express');
const router = express.Router();
const { Client } = require('@notionhq/client');
const { 
  extractDatabaseId, 
  parseNotionDatabaseConfig
} = require('../utils/notionUrlParser');

// In-memory storage for database configurations per session
// In production, this should be stored in a database or Redis
const sessionConfigs = new Map();

/**
 * Test database connection and accessibility
 */
router.post('/test', async (req, res) => {
  try {
    const { url, type } = req.body;

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

    // Initialize Notion client
    const client = new Client({
      auth: process.env.NOTION_TOKEN,
    });

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
 * Configure database URLs for a session
 */
router.post('/configure', async (req, res) => {
  try {
    const config = req.body;
    const sessionId = req.headers['session-id'] || 'default';

    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Configuration object is required'
      });
    }

    // Parse and validate configuration
    const parsed = parseNotionDatabaseConfig(config);

    if (!parsed.hasValidDatabases) {
      return res.status(400).json({
        success: false,
        error: 'No valid database URLs provided',
        invalid: parsed.invalid
      });
    }

    // Store configuration for this session
    sessionConfigs.set(sessionId, {
      config: parsed.valid,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Database configuration updated',
      validDatabases: Object.keys(parsed.valid),
      invalidDatabases: Object.keys(parsed.invalid)
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
        message: 'No database configuration found for this session'
      });
    }

    // Return configuration without sensitive database IDs in URLs
    const safeConfig = {};
    for (const [type, config] of Object.entries(sessionConfig.config)) {
      safeConfig[type] = {
        configured: true,
        databaseId: config.databaseId,
        // Don't expose full original URL for security
        hasUrl: Boolean(config.originalUrl)
      };
    }

    res.json({
      success: true,
      configured: true,
      config: safeConfig,
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
 * Get database ID for a specific type and session
 * This is used internally by other routes
 */
function getDatabaseId(sessionId, type) {
  const sessionConfig = sessionConfigs.get(sessionId || 'default');
  
  if (sessionConfig && sessionConfig.config[type]) {
    return sessionConfig.config[type].databaseId;
  }
  
  // Fallback to environment variables
  const envMap = {
    tasks: process.env.TASKS_DB_ID,
    textbooks: process.env.TEXTBOOKS_DB_ID,
    timeTracking: process.env.TIME_TRACKING_DB_ID,
    schedule: process.env.SCHEDULE_DB_ID
  };
  
  return envMap[type] || null;
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

// Export both the router and the helper function
module.exports = router;
module.exports.getDatabaseId = getDatabaseId;