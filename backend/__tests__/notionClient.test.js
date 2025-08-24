// ABOUTME: Unit tests for NotionService class
// ABOUTME: Tests all Notion API interactions with mocked responses

const notionService = require('../services/notionClient');

describe('NotionService', () => {
  let mockClient;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch and format tasks successfully', async () => {
      const mockResponse = mockNotionResponse([
        mockTaskPage({
          title: 'Constitutional Law Reading',
          status: 'In Progress',
          dueDate: '2024-01-15',
          class: 'Constitutional Law',
          priority: 'High',
          estimatedTime: 120
        })
      ]);

      global.mockNotionClient.databases.query.mockResolvedValue(mockResponse);

      const tasks = await notionService.getTasks();

      expect(global.mockNotionClient.databases.query).toHaveBeenCalledWith({
        database_id: process.env.TASKS_DB_ID,
        filter: {},
        sorts: [
          {
            property: 'Due Date',
            direction: 'ascending'
          }
        ]
      });

      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toEqual({
        id: 'test-page-id',
        title: 'Constitutional Law Reading',
        status: 'In Progress',
        dueDate: '2024-01-15',
        class: 'Constitutional Law',
        priority: 'High',
        estimatedTime: 120,
        url: 'https://notion.so/test-page'
      });
    });

    it('should handle empty task list', async () => {
      global.mockNotionClient.databases.query.mockResolvedValue(mockNotionResponse([]));

      const tasks = await notionService.getTasks();

      expect(tasks).toEqual([]);
    });

    it('should handle Notion API errors gracefully', async () => {
      global.mockNotionClient.databases.query.mockRejectedValue(new Error('Notion API Error'));

      const tasks = await notionService.getTasks();
      expect(tasks).toEqual([]); // Should return empty array for resilient error handling
    });
  });

  describe('getTodaysTasks', () => {
    it('should filter tasks for today', async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockResponse = mockNotionResponse([mockTaskPage()]);

      global.mockNotionClient.databases.query.mockResolvedValue(mockResponse);

      await notionService.getTodaysTasks();

      expect(global.mockNotionClient.databases.query).toHaveBeenCalledWith({
        database_id: process.env.TASKS_DB_ID,
        filter: {
          and: [
            {
              property: 'Due Date',
              date: {
                equals: today
              }
            },
            {
              property: 'Status',
              select: {
                does_not_equal: 'Done'
              }
            }
          ]
        },
        sorts: [
          {
            property: 'Due Date',
            direction: 'ascending'
          }
        ]
      });
    });
  });

  describe('getActiveTasks', () => {
    it('should filter for in-progress tasks', async () => {
      const mockResponse = mockNotionResponse([mockTaskPage({ status: 'In Progress' })]);

      global.mockNotionClient.databases.query.mockResolvedValue(mockResponse);

      await notionService.getActiveTasks();

      expect(global.mockNotionClient.databases.query).toHaveBeenCalledWith({
        database_id: process.env.TASKS_DB_ID,
        filter: {
          property: 'Status',
          select: {
            equals: 'In Progress'
          }
        },
        sorts: [
          {
            property: 'Due Date',
            direction: 'ascending'
          }
        ]
      });
    });
  });

  describe('createTimeEntry', () => {
    it('should create time entry successfully', async () => {
      const mockResponse = { id: 'new-time-entry-id' };
      global.mockNotionClient.pages.create.mockResolvedValue(mockResponse);

      const startTime = new Date().toISOString();
      const result = await notionService.createTimeEntry(
        'task-id',
        'Test Task',
        startTime
      );

      expect(global.mockNotionClient.pages.create).toHaveBeenCalledWith({
        parent: {
          database_id: process.env.TIME_TRACKING_DB_ID
        },
        properties: {
          'Task': {
            title: [
              {
                text: {
                  content: 'Test Task'
                }
              }
            ]
          },
          'Start Time': {
            date: {
              start: startTime
            }
          },
          'Duration (mins)': undefined,
          'Related Task': {
            relation: [
              {
                id: 'task-id'
              }
            ]
          }
        }
      });

      expect(result).toEqual(mockResponse);
    });

    it('should create time entry with duration', async () => {
      const mockResponse = { id: 'new-time-entry-id' };
      global.mockNotionClient.pages.create.mockResolvedValue(mockResponse);

      const startTime = new Date().toISOString();
      const duration = 3600000; // 1 hour in milliseconds

      await notionService.createTimeEntry(
        'task-id',
        'Test Task',
        startTime,
        null,
        duration
      );

      expect(global.mockNotionClient.pages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            'Duration (mins)': {
              number: 60 // 1 hour = 60 minutes
            }
          })
        })
      );
    });

    it('should handle time entry creation errors', async () => {
      global.mockNotionClient.pages.create.mockRejectedValue(new Error('Creation failed'));

      await expect(
        notionService.createTimeEntry('task-id', 'Test Task', new Date().toISOString())
      ).rejects.toThrow('Failed to create time tracking entry');
    });
  });

  describe('updateTimeEntry', () => {
    it('should update time entry with end time and duration', async () => {
      const mockResponse = { id: 'updated-entry-id' };
      global.mockNotionClient.pages.update.mockResolvedValue(mockResponse);

      const endTime = new Date().toISOString();
      const duration = 1800000; // 30 minutes

      const result = await notionService.updateTimeEntry(
        'entry-id',
        endTime,
        duration
      );

      expect(global.mockNotionClient.pages.update).toHaveBeenCalledWith({
        page_id: 'entry-id',
        properties: {
          'End Time': {
            date: {
              start: endTime
            }
          },
          'Duration (mins)': {
            number: 30
          }
        }
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle update errors', async () => {
      global.mockNotionClient.pages.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        notionService.updateTimeEntry('entry-id', new Date().toISOString(), 1000)
      ).rejects.toThrow('Failed to update time tracking entry');
    });
  });

  describe('getTextbooks', () => {
    it('should fetch and format textbooks', async () => {
      const mockResponse = mockNotionResponse([
        mockTextbookPage({
          title: 'Constitutional Law Textbook',
          class: 'Constitutional Law',
          author: 'Test Author',
          avgReadingSpeed: 18,
          totalPages: 600
        })
      ]);

      global.mockNotionClient.databases.query.mockResolvedValue(mockResponse);

      const textbooks = await notionService.getTextbooks();

      expect(global.mockNotionClient.databases.query).toHaveBeenCalledWith({
        database_id: process.env.TEXTBOOKS_DB_ID,
        sorts: [
          {
            property: 'Class',
            direction: 'ascending'
          }
        ]
      });

      expect(textbooks).toHaveLength(1);
      expect(textbooks[0]).toEqual({
        id: 'test-page-id',
        title: 'Constitutional Law Textbook',
        class: 'Constitutional Law',
        author: 'Test Author',
        avgReadingSpeed: 18,
        totalPages: 600
      });
    });
  });

  describe('createReadingSession', () => {
    it('should create reading session with calculated speed', async () => {
      const mockResponse = { id: 'new-reading-session-id' };
      global.mockNotionClient.pages.create.mockResolvedValue(mockResponse);

      const result = await notionService.createReadingSession(
        'textbook-id',
        'Test Textbook',
        'Test Class',
        10, // pages
        3600000, // 1 hour duration
        10 // reading speed
      );

      expect(global.mockNotionClient.pages.create).toHaveBeenCalledWith({
        parent: {
          database_id: process.env.TIME_TRACKING_DB_ID
        },
        properties: {
          'Textbook': {
            title: [
              {
                text: {
                  content: 'Test Textbook'
                }
              }
            ]
          },
          'Class': {
            select: {
              name: 'Test Class'
            }
          },
          'Pages Read': {
            number: 10
          },
          'Duration (mins)': {
            number: 60
          },
          'Reading Speed (pages/hour)': {
            number: 10
          },
          'Date': {
            date: {
              start: expect.any(String)
            }
          },
          'Related Textbook': {
            relation: [
              {
                id: 'textbook-id'
              }
            ]
          }
        }
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTodaysSchedule', () => {
    it('should fetch today\'s schedule', async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockResponse = mockNotionResponse([
        mockSchedulePage({
          class: 'Constitutional Law',
          time: '10:00 AM',
          location: 'Room 101',
          type: 'Class',
          professor: 'Professor Smith'
        })
      ]);

      global.mockNotionClient.databases.query.mockResolvedValue(mockResponse);

      const schedule = await notionService.getTodaysSchedule();

      expect(global.mockNotionClient.databases.query).toHaveBeenCalledWith({
        database_id: process.env.SCHEDULE_DB_ID,
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

      expect(schedule).toHaveLength(1);
      expect(schedule[0]).toEqual({
        id: 'test-page-id',
        class: 'Constitutional Law',
        time: '10:00 AM',
        location: 'Room 101',
        type: 'Class',
        professor: 'Professor Smith'
      });
    });
  });

  describe('formatting methods', () => {
    it('should format task page correctly', () => {
      const page = mockTaskPage({
        title: 'Test Task',
        status: 'In Progress',
        dueDate: '2024-01-15',
        class: 'Test Class',
        priority: 'High',
        estimatedTime: 90
      });

      const formatted = notionService.formatTaskPage(page);

      expect(formatted).toEqual({
        id: 'test-page-id',
        title: 'Test Task',
        status: 'In Progress',
        dueDate: '2024-01-15',
        class: 'Test Class',
        priority: 'High',
        estimatedTime: 90,
        url: 'https://notion.so/test-page'
      });
    });

    it('should handle missing properties in task formatting', () => {
      const page = {
        id: 'test-id',
        url: 'test-url',
        properties: {}
      };

      const formatted = notionService.formatTaskPage(page);

      expect(formatted).toEqual({
        id: 'test-id',
        title: 'Untitled',
        status: 'Not Started',
        dueDate: null,
        class: null,
        priority: 'Medium',
        estimatedTime: null,
        url: 'test-url'
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed Notion API responses', async () => {
      // Test with null response
      global.mockNotionClient.databases.query.mockResolvedValue(null);
      const tasks = await notionService.getTasks();
      expect(tasks).toEqual([]);
      
      // Test with response missing results
      global.mockNotionClient.databases.query.mockResolvedValue({});
      const tasks2 = await notionService.getTasks();
      expect(tasks2).toEqual([]);
    });

    it('should validate filter parameter types', async () => {
      // Invalid filter type should throw
      await expect(notionService.getTasks('invalid-filter')).rejects.toThrow('Filter must be an object');
      await expect(notionService.getTasks(123)).rejects.toThrow('Filter must be an object');
      await expect(notionService.getTasks([])).rejects.toThrow('Filter must be an object');
    });

    it('should handle network timeouts gracefully', async () => {
      global.mockNotionClient.databases.query.mockRejectedValue(new Error('ECONNRESET'));
      const tasks = await notionService.getTasks();
      expect(tasks).toEqual([]);
      
      const textbooks = await notionService.getTextbooks();
      expect(textbooks).toEqual([]);
      
      const schedule = await notionService.getTodaysSchedule();
      expect(schedule).toEqual([]);
    });

    it('should handle malformed page properties gracefully', async () => {
      const malformedPage = {
        id: 'malformed-id',
        url: 'test-url',
        properties: {
          Name: null, // Missing title structure
          Status: { select: null }, // Missing select name
          'Due Date': { date: null }, // Missing date structure
          Class: undefined,
          Priority: { select: { name: 'InvalidPriority' } }, // Invalid priority
          'Estimated Time (mins)': { number: 'not-a-number' } // Invalid number
        }
      };

      const formatted = notionService.formatTaskPage(malformedPage);
      
      expect(formatted).toEqual({
        id: 'malformed-id',
        title: 'Untitled',
        status: 'Not Started',
        dueDate: null,
        class: null,
        priority: 'Medium', // Should default to Medium for invalid priority
        estimatedTime: null,
        url: 'test-url'
      });
    });

    it('should handle write operation failures appropriately', async () => {
      // Write operations should still throw errors for proper error handling
      global.mockNotionClient.pages.create.mockRejectedValue(new Error('Network error'));
      
      await expect(notionService.createTimeEntry('task-1', 'Test Task', new Date().toISOString()))
        .rejects.toThrow('Failed to create time tracking entry');
        
      global.mockNotionClient.pages.update.mockRejectedValue(new Error('Update failed'));
      
      await expect(notionService.updateTimeEntry('entry-1', new Date().toISOString(), 3600000))
        .rejects.toThrow('Failed to update time tracking entry');
    });
  });
});