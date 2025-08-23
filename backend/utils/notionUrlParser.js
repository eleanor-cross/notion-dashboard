// ABOUTME: Utility functions for parsing Notion database URLs and extracting IDs
// ABOUTME: Handles various Notion URL formats and validates database accessibility

/**
 * Extract database ID from various Notion URL formats
 * @param {string} url - Notion database URL
 * @returns {string|null} - Database ID or null if invalid
 */
function extractDatabaseId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Remove trailing slashes and query parameters
  const cleanUrl = url.trim().replace(/\/+$/, '').split('?')[0];

  // Pattern 1: https://www.notion.so/workspace/database-title-32char-id
  // Pattern 2: https://notion.so/workspace/database-title-32char-id  
  const standardPattern = /^https:\/\/(?:www\.)?notion\.so\/[^\/]+\/[^\/]*([a-f0-9]{32})$/i;
  let match = cleanUrl.match(standardPattern);
  if (match) {
    return formatDatabaseId(match[1]);
  }

  // Pattern 3: https://workspace.notion.site/database-title-32char-id
  const sitePattern = /^https:\/\/[^.]+\.notion\.site\/[^\/]*([a-f0-9]{32})$/i;
  match = cleanUrl.match(sitePattern);
  if (match) {
    return formatDatabaseId(match[1]);
  }

  // Pattern 4: Direct database ID (32 hex characters)
  const directIdPattern = /^([a-f0-9]{32})$/i;
  match = cleanUrl.match(directIdPattern);
  if (match) {
    return formatDatabaseId(match[1]);
  }

  // Pattern 5: Formatted database ID with dashes
  const formattedIdPattern = /^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
  match = cleanUrl.match(formattedIdPattern);
  if (match) {
    return match[1];
  }

  return null;
}

/**
 * Format database ID to standard UUID format
 * @param {string} id - Database ID (32 hex chars)
 * @returns {string} - Formatted UUID
 */
function formatDatabaseId(id) {
  if (!id || id.length !== 32) {
    return null;
  }

  // Insert dashes to create UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return [
    id.substring(0, 8),
    id.substring(8, 12),
    id.substring(12, 16),
    id.substring(16, 20),
    id.substring(20, 32)
  ].join('-');
}

/**
 * Validate if a string looks like a valid Notion database URL or ID
 * @param {string} input - URL or ID to validate
 * @returns {boolean} - True if format is valid
 */
function isValidNotionDatabaseInput(input) {
  return extractDatabaseId(input) !== null;
}

/**
 * Parse and validate database configuration object
 * @param {Object} config - Configuration object with database URLs
 * @returns {Object} - Parsed configuration with database IDs and validation results
 */
function parseNotionDatabaseConfig(config) {
  const result = {
    valid: {},
    invalid: {},
    hasValidDatabases: false
  };

  if (!config || typeof config !== 'object') {
    return result;
  }

  const databaseTypes = ['tasks', 'textbooks', 'timeTracking', 'schedule'];

  for (const type of databaseTypes) {
    if (config[type] && typeof config[type] === 'string') {
      const databaseId = extractDatabaseId(config[type]);
      
      if (databaseId) {
        result.valid[type] = {
          originalUrl: config[type],
          databaseId: databaseId
        };
        result.hasValidDatabases = true;
      } else {
        result.invalid[type] = {
          originalUrl: config[type],
          error: 'Invalid Notion URL format'
        };
      }
    }
  }

  return result;
}

/**
 * Generate example URLs for different database types
 * @returns {Object} - Example URLs for each database type
 */
function getExampleUrls() {
  return {
    tasks: 'https://notion.so/your-workspace/tasks-25310564a27b80ac8e8ec3a64daa5f22',
    textbooks: 'https://notion.so/your-workspace/textbooks-25210564a27b80f4bb98d3d7a4383587',
    timeTracking: 'https://notion.so/your-workspace/time-tracking-25310564a27b80f9a811cf2a842e26f2',
    schedule: 'https://notion.so/your-workspace/schedule-25210564a27b80eaae03e7a95b31723f'
  };
}

module.exports = {
  extractDatabaseId,
  formatDatabaseId,
  isValidNotionDatabaseInput,
  parseNotionDatabaseConfig,
  getExampleUrls
};