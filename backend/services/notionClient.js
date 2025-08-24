// ABOUTME: Notion API client service for database operations
// ABOUTME: Provides abstraction layer for all Notion database interactions

const { Client } = require('@notionhq/client');

class NotionService {
  constructor() {
    this.client = new Client({
      auth: process.env.NOTION_TOKEN,
    });
    
    this.databases = {
      tasks: process.env.TASKS_DB_ID,
      timeTracking: process.env.TIME_TRACKING_DB_ID,
      textbooks: process.env.TEXTBOOKS_DB_ID,
      schedule: process.env.SCHEDULE_DB_ID
    };
  }

  // Tasks Database Operations
  async getTasks(filter = null) {
    try {
      // Input validation
      if (filter && typeof filter !== 'object') {
        throw new Error('Filter must be an object');
      }
      
      const queryParams = {
        database_id: this.databases.tasks,
        sorts: [
          {
            property: 'Due date',
            direction: 'ascending'
          }
        ]
      };
      
      // Only add filter if it's not empty
      if (filter && Object.keys(filter).length > 0) {
        queryParams.filter = filter;
      }
      
      const response = await this.client.databases.query(queryParams);
      return response.results?.map(this.formatTaskPage) || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Return empty array for resilient error handling
      return [];
    }
  }

  async getTodaysTasks() {
    const today = new Date().toISOString().split('T')[0];
    const filter = {
      and: [
        {
          property: 'Due date',
          date: {
            equals: today
          }
        },
        {
          property: 'Status',
          status: {
            does_not_equal: 'Done'
          }
        }
      ]
    };
    return this.getTasks(filter);
  }

  async getActiveTasks() {
    const filter = {
      property: 'Status',
      status: {
        equals: 'In Progress'
      }
    };
    return this.getTasks(filter);
  }

  // Time Tracking Database Operations
  async createTimeEntry(taskId, taskName, startTime, endTime = null, duration = null) {
    try {
      const properties = {
        'Name': {
          title: [
            {
              text: {
                content: taskName
              }
            }
          ]
        },
        'Start Date': {
          date: {
            start: startTime
          }
        }
      };

      if (endTime) {
        properties['End Date'] = {
          date: {
            start: endTime
          }
        };
      }

      if (taskId && this.databases.tasks) {
        properties['Task'] = {
          relation: [
            {
              id: taskId
            }
          ]
        };
      }

      const response = await this.client.pages.create({
        parent: {
          database_id: this.databases.timeTracking
        },
        properties
      });

      return response;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw new Error('Failed to create time tracking entry');
    }
  }

  async updateTimeEntry(entryId, endTime, duration) {
    try {
      const response = await this.client.pages.update({
        page_id: entryId,
        properties: {
          'End Date': {
            date: {
              start: endTime
            }
          }
        }
      });
      return response;
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw new Error('Failed to update time tracking entry');
    }
  }

  // Textbooks Database Operations
  async getTextbooks() {
    try {
      const response = await this.client.databases.query({
        database_id: this.databases.textbooks,
        sorts: [
          {
            property: 'Classes Fall 2025',
            direction: 'ascending'
          }
        ]
      });
      return response.results.map(this.formatTextbookPage);
    } catch (error) {
      console.error('Error fetching textbooks:', error);
      // Return empty array for resilient error handling
      return [];
    }
  }

  async createReadingSession(textbookId, textbookName, className, pagesRead, duration, readingSpeed) {
    try {
      const properties = {
        'Textbook': {
          title: [
            {
              text: {
                content: textbookName
              }
            }
          ]
        },
        'Class': {
          select: {
            name: className
          }
        },
        'Pages Read': {
          number: pagesRead
        },
        'Duration (mins)': {
          number: Math.round(duration / 60000)
        },
        'Reading Speed (pages/hour)': {
          number: readingSpeed
        },
        'Date': {
          date: {
            start: new Date().toISOString().split('T')[0]
          }
        }
      };

      if (textbookId) {
        properties['Related Textbook'] = {
          relation: [
            {
              id: textbookId
            }
          ]
        };
      }

      const response = await this.client.pages.create({
        parent: {
          database_id: this.databases.timeTracking // Using same DB with different properties
        },
        properties
      });

      return response;
    } catch (error) {
      console.error('Error creating reading session:', error);
      throw new Error('Failed to create reading session entry');
    }
  }

  // Schedule Database Operations
  async getTodaysSchedule() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await this.client.databases.query({
        database_id: this.databases.schedule,
        filter: {
          property: 'Date',
          date: {
            equals: today
          }
        },
        sorts: [
          {
            property: 'Time',
            direction: 'ascending'
          }
        ]
      });
      return response.results.map(this.formatSchedulePage);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      // Return empty array for resilient error handling
      return [];
    }
  }

  // Utility methods for formatting Notion pages
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
      author: page.properties['ISBN']?.rich_text?.[0]?.text?.content || null, // Using ISBN as author for now
      avgReadingSpeed: null, // Not available in this database
      totalPages: null // Not available in this database
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
}

module.exports = new NotionService();