// ABOUTME: Unit tests for Notion API routes
// ABOUTME: Tests tasks, textbooks, schedule, and reading session endpoints

const request = require('supertest');
const express = require('express');
const notionRoutes = require('../routes/notion');

// Mock the notion service
jest.mock('../services/notionClient', () => ({
  getTasks: jest.fn(),
  getTodaysTasks: jest.fn(),
  getActiveTasks: jest.fn(),
  getTextbooks: jest.fn(),
  getTodaysSchedule: jest.fn(),
  createReadingSession: jest.fn(),
}));

describe('Notion Routes', () => {
  let app;
  let notionService;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/notion', notionRoutes);
    
    notionService = require('../services/notionClient');
    jest.clearAllMocks();
  });

  describe('GET /notion/tasks', () => {
    it('should fetch all tasks successfully', async () => {
      const mockTasks = [
        {
          id: 'test-task-1',
          title: 'Constitutional Law Reading',
          status: 'Not Started',
          dueDate: '2025-08-20',
          class: 'Constitutional Law',
          priority: 'High',
          estimatedTime: 120
        }
      ];

      notionService.getTasks.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/notion/tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTasks);
      expect(notionService.getTasks).toHaveBeenCalledWith();
    });

    it('should handle service errors', async () => {
      notionService.getTasks.mockRejectedValue(new Error('Failed to fetch tasks from Notion'));

      const response = await request(app)
        .get('/notion/tasks');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch tasks from Notion');
    });
  });

  describe('GET /notion/tasks/today', () => {
    it('should fetch today\'s tasks successfully', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Today\'s Task',
          status: 'In Progress',
          dueDate: new Date().toISOString().split('T')[0],
          class: 'Test Class',
          priority: 'Medium',
          estimatedTime: 60,
          url: 'https://notion.so/task-1'
        }
      ];

      notionService.getTodaysTasks.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/notion/tasks/today');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTasks);
      expect(notionService.getTodaysTasks).toHaveBeenCalled();
    });
  });

  describe('GET /notion/tasks/active', () => {
    it('should fetch active tasks successfully', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Active Task',
          status: 'In Progress',
          dueDate: '2024-01-15',
          class: 'Test Class',
          priority: 'High',
          estimatedTime: 90,
          url: 'https://notion.so/task-1'
        }
      ];

      notionService.getActiveTasks.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/notion/tasks/active');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTasks);
      expect(notionService.getActiveTasks).toHaveBeenCalled();
    });
  });

  describe('GET /notion/textbooks', () => {
    it('should fetch textbooks successfully', async () => {
      const mockTextbooks = [
        {
          id: 'textbook-1',
          title: 'Constitutional Law: Principles and Policies',
          class: 'Constitutional Law',
          author: 'Jesse Choper',
          avgReadingSpeed: 15,
          totalPages: 800
        }
      ];

      notionService.getTextbooks.mockResolvedValue(mockTextbooks);

      const response = await request(app)
        .get('/notion/textbooks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTextbooks);
      expect(notionService.getTextbooks).toHaveBeenCalled();
    });
  });

  describe('GET /notion/schedule/today', () => {
    it('should fetch today\'s schedule successfully', async () => {
      const mockSchedule = [
        {
          id: 'schedule-1',
          class: 'Constitutional Law',
          time: '10:00 AM',
          location: 'Room 101',
          type: 'Class',
          professor: 'Professor Smith'
        }
      ];

      notionService.getTodaysSchedule.mockResolvedValue(mockSchedule);

      const response = await request(app)
        .get('/notion/schedule/today');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSchedule);
      expect(notionService.getTodaysSchedule).toHaveBeenCalled();
    });
  });

  describe('POST /notion/reading-session', () => {
    it('should create reading session successfully', async () => {
      const mockSession = { 
        id: 'session-123',
        readingSpeed: 15.5
      };

      notionService.createReadingSession.mockResolvedValue({ id: 'session-123' });

      const sessionData = {
        textbookId: 'textbook-1',
        textbookName: 'Constitutional Law Textbook',
        className: 'Constitutional Law',
        pagesRead: 15,
        duration: 3600000 // 1 hour
      };

      const response = await request(app)
        .post('/notion/reading-session')
        .send(sessionData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        id: 'session-123',
        readingSpeed: 15
      });

      expect(notionService.createReadingSession).toHaveBeenCalledWith(
        'textbook-1',
        'Constitutional Law Textbook',
        'Constitutional Law',
        15,
        3600000,
        15 // calculated reading speed (pages per hour)
      );
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/notion/reading-session')
        .send({
          textbookName: 'Test Book'
          // Missing pagesRead and duration
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Missing required fields: textbookName, pagesRead, duration');
    });

    it('should handle service errors', async () => {
      notionService.createReadingSession.mockRejectedValue(new Error('Failed to create reading session entry'));

      const sessionData = {
        textbookName: 'Test Book',
        pagesRead: 10,
        duration: 1800000
      };

      const response = await request(app)
        .post('/notion/reading-session')
        .send(sessionData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to create reading session entry');
    });

    it('should calculate reading speed correctly', async () => {
      notionService.createReadingSession.mockResolvedValue({ id: 'session-123' });

      const sessionData = {
        textbookName: 'Test Book',
        pagesRead: 20,
        duration: 7200000 // 2 hours
      };

      const response = await request(app)
        .post('/notion/reading-session')
        .send(sessionData);

      expect(response.status).toBe(200);
      expect(response.body.data.readingSpeed).toBe(10); // 20 pages / 2 hours = 10 pages/hour

      expect(notionService.createReadingSession).toHaveBeenCalledWith(
        undefined,
        'Test Book',
        undefined,
        20,
        7200000,
        10
      );
    });

    it('should handle fractional reading speeds', async () => {
      notionService.createReadingSession.mockResolvedValue({ id: 'session-123' });

      const sessionData = {
        textbookName: 'Test Book',
        pagesRead: 25,
        duration: 5400000 // 1.5 hours
      };

      const response = await request(app)
        .post('/notion/reading-session')
        .send(sessionData);

      expect(response.status).toBe(200);
      // 25 pages / 1.5 hours = 16.666... ≈ 16.67 (rounded to 2 decimal places)
      expect(response.body.data.readingSpeed).toBe(16.67);
    });
  });
});