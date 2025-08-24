// ABOUTME: Dynamic Notion API client service with runtime token configuration
// ABOUTME: Provides session-based token management and fallback to environment variables

const { Client } = require('@notionhq/client');
const crypto = require('crypto');

class DynamicNotionService {
  constructor() {
    // Don't initialize client in constructor - will be created per request
    this.clients = new Map(); // Cache clients by token hash for performance
    this.defaultDatabases = {
      tasks: process.env.TASKS_DB_ID,
      timeTracking: process.env.TIME_TRACKING_DB_ID,
      textbooks: process.env.TEXTBOOKS_DB_ID,
      schedule: process.env.SCHEDULE_DB_ID
    };
  }

  /**
   * Get or create Notion client for given token
   * Caches clients for performance while maintaining security
   */
  getClient(token, useCache = true) {
    if (!token) {
      // Fallback to environment token
      token = process.env.NOTION_TOKEN;
      if (!token) {
        throw new Error('No Notion token provided and no environment fallback available');
      }
    }

    // Create token hash for caching (don't store actual token)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex').substring(0, 16);
    
    if (useCache && this.clients.has(tokenHash)) {
      return this.clients.get(tokenHash);
    }

    const client = new Client({ auth: token });
    
    if (useCache) {
      // Limit cache size to prevent memory leaks
      if (this.clients.size > 10) {
        const firstKey = this.clients.keys().next().value;
        this.clients.delete(firstKey);
      }
      this.clients.set(tokenHash, client);
    }

    return client;
  }

  /**
   * Get database IDs from session config or environment fallback
   */
  getDatabases(sessionConfig = null) {
    if (sessionConfig && sessionConfig.databases) {
      return sessionConfig.databases;
    }
    return this.defaultDatabases;
  }

  /**
   * Validate Notion token by attempting to list databases
   */
  async validateToken(token) {
    try {
      const client = this.getClient(token, false); // Don't cache validation attempts
      
      // Test token by listing first few databases
      const response = await client.search({
        filter: { property: 'object', value: 'database' },
        page_size: 5
      });

      return {
        isValid: true,
        databaseCount: response.results.length,
        hasAccess: response.results.length > 0,
        tokenType: token.startsWith('secret_') ? 'integration' : 'unknown',
        message: 'Token is valid and has database access'
      };
    } catch (error) {
      console.error('Token validation failed:', error.message);
      
      let errorMessage = 'Invalid token';
      if (error.code === 'unauthorized') {
        errorMessage = 'Token is unauthorized or expired';
      } else if (error.code === 'invalid_request') {
        errorMessage = 'Invalid token format';
      }

      return {
        isValid: false,
        error: errorMessage,
        code: error.code || 'unknown_error'
      };
    }
  }

  // Core database operations with dynamic token and database support

  async getTasks(token, databases, filter = null) {
    try {
      const client = this.getClient(token);
      const dbs = this.getDatabases(databases);
      
      if (!dbs.tasks) {
        throw new Error('Tasks database not configured');
      }

      const queryParams = {
        database_id: dbs.tasks,
        sorts: [{ property: 'Due Date', direction: 'ascending' }]
      };
      
      if (filter && Object.keys(filter).length > 0) {
        queryParams.filter = filter;
      }
      
      const response = await client.databases.query(queryParams);
      return response.results?.map(this.formatTaskPage) || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.message.includes('database not configured')) {
        throw error; // Re-throw configuration errors
      }
      return []; // Return empty array for API errors
    }
  }

  async getTodaysTasks(token, databases) {
    const today = new Date().toISOString().split('T')[0];
    const filter = {
      and: [
        { property: 'Due Date', date: { equals: today } },
        { property: 'Status', select: { does_not_equal: 'Done' } }
      ]
    };
    return this.getTasks(token, databases, filter);
  }

  async getActiveTasks(token, databases) {
    const filter = {
      property: 'Status',
      select: { equals: 'In Progress' }
    };
    return this.getTasks(token, databases, filter);
  }

  async createTimeEntry(token, databases, taskId, taskName, startTime, endTime = null) {
    try {
      const client = this.getClient(token);
      const dbs = this.getDatabases(databases);
      
      if (!dbs.timeTracking) {
        throw new Error('Time tracking database not configured');
      }

      const properties = {
        'Name': {
          title: [{ text: { content: taskName } }]
        },
        'Start Date': {
          date: { start: startTime }
        }
      };

      if (endTime) {
        properties['End Date'] = { date: { start: endTime } };
      }

      if (taskId && dbs.tasks) {
        properties['Task'] = { relation: [{ id: taskId }] };
      }

      const response = await client.pages.create({
        parent: { database_id: dbs.timeTracking },
        properties
      });

      return response;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw new Error(`Failed to create time tracking entry: ${error.message}`);
    }
  }

  async updateTimeEntry(token, entryId, endTime) {
    try {
      const client = this.getClient(token);
      
      const response = await client.pages.update({
        page_id: entryId,
        properties: {
          'End Date': { date: { start: endTime } }
        }
      });
      return response;
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw new Error(`Failed to update time tracking entry: ${error.message}`);
    }
  }

  async getTextbooks(token, databases) {
    try {
      const client = this.getClient(token);
      const dbs = this.getDatabases(databases);
      
      if (!dbs.textbooks) {
        throw new Error('Textbooks database not configured');
      }

      const response = await client.databases.query({
        database_id: dbs.textbooks,
        sorts: [{ property: 'Classes Fall 2025', direction: 'ascending' }]
      });
      
      return response.results.map(this.formatTextbookPage);
    } catch (error) {
      console.error('Error fetching textbooks:', error);
      if (error.message.includes('database not configured')) {
        throw error;
      }
      return [];
    }
  }

  async createReadingSession(token, databases, textbookId, textbookName, className, pagesRead, duration, readingSpeed) {
    try {
      const client = this.getClient(token);
      const dbs = this.getDatabases(databases);
      
      if (!dbs.timeTracking) {
        throw new Error('Time tracking database not configured for reading sessions');
      }

      const properties = {
        'Textbook': { title: [{ text: { content: textbookName } }] },
        'Class': { select: { name: className } },
        'Pages Read': { number: pagesRead },
        'Duration (mins)': { number: Math.round(duration / 60000) },
        'Reading Speed (pages/hour)': { number: readingSpeed },
        'Date': { date: { start: new Date().toISOString().split('T')[0] } }
      };

      if (textbookId) {
        properties['Related Textbook'] = { relation: [{ id: textbookId }] };
      }

      const response = await client.pages.create({
        parent: { database_id: dbs.timeTracking },
        properties
      });

      return response;
    } catch (error) {
      console.error('Error creating reading session:', error);
      throw new Error(`Failed to create reading session entry: ${error.message}`);
    }
  }

  async getTodaysSchedule(token, databases) {
    try {
      const client = this.getClient(token);
      const dbs = this.getDatabases(databases);
      
      if (!dbs.schedule) {
        throw new Error('Schedule database not configured');
      }

      const today = new Date().toISOString().split('T')[0];
      const response = await client.databases.query({
        database_id: dbs.schedule,
        filter: { property: 'Date', date: { equals: today } },
        sorts: [{ property: 'Time', direction: 'ascending' }]
      });
      
      return response.results.map(this.formatSchedulePage);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      if (error.message.includes('database not configured')) {
        throw error;
      }
      return [];
    }
  }

  // Utility methods for formatting Notion pages (same as original)
  formatTaskPage(page) {
    return {
      id: page.id,
      title: page.properties['Task name']?.title?.[0]?.text?.content || 'Untitled',
      status: page.properties.Status?.status?.name || 'Not Started',
      dueDate: page.properties['Due date']?.date?.start || null,
      class: page.properties['⚖️ Class']?.relation?.[0]?.id || null,
      priority: page.properties.Category?.select?.name || 'Medium',
      estimatedTime: page.properties['Total Time (minutes)']?.formula?.number || null,
      url: page.url
    };
  }

  formatTextbookPage(page) {
    return {
      id: page.id,
      title: page.properties['Doc name']?.title?.[0]?.text?.content || 'Untitled',
      class: page.properties['Classes Fall 2025']?.relation?.[0]?.id || null,
      author: page.properties['ISBN']?.rich_text?.[0]?.text?.content || null,
      avgReadingSpeed: null,
      totalPages: null
    };
  }

  formatSchedulePage(page) {
    return {
      id: page.id,
      class: page.properties.Class?.title?.[0]?.text?.content || 'Untitled',
      time: page.properties.Time?.rich_text?.[0]?.text?.content || null,
      location: page.properties.Location?.rich_text?.[0]?.text?.content || null,
      type: page.properties.Type?.select?.name || 'Class',
      professor: page.properties.Professor?.rich_text?.[0]?.text?.content || null
    };
  }

  /**
   * Clear cached clients (for security/memory management)
   */
  clearCache() {
    this.clients.clear();
  }
}

module.exports = new DynamicNotionService();