// ABOUTME: Unit tests for timer routes
// ABOUTME: Tests timer start/stop functionality and quick tasks

const request = require('supertest');
const express = require('express');
const timerRoutes = require('../routes/timer');

// Mock the notion service
jest.mock('../services/notionClient', () => ({
  createTimeEntry: jest.fn(),
  updateTimeEntry: jest.fn(),
}));

describe('Timer Routes', () => {
  let app;
  let notionService;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/timer', timerRoutes);
    
    notionService = require('../services/notionClient');
    jest.clearAllMocks();
  });

  describe('POST /timer/start', () => {
    it('should start timer successfully', async () => {
      const mockTimeEntry = { 
        id: 'test-entry-123',
        taskName: 'Test Task',
        startTime: expect.any(String)
      };
      notionService.createTimeEntry.mockResolvedValue(mockTimeEntry);

      const response = await request(app)
        .post('/timer/start')
        .set('session-id', 'test-session')
        .send({
          taskId: 'task-123',
          taskName: 'Test Task',
          taskType: 'manual'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        entryId: 'test-entry-123',
        taskName: 'Test Task',
        startTime: expect.any(String),
        message: 'Timer started successfully'
      });

      expect(notionService.createTimeEntry).toHaveBeenCalledWith(
        'task-123',
        'Test Task',
        expect.any(String)
      );
    });

    it('should return error if task name is missing', async () => {
      const response = await request(app)
        .post('/timer/start')
        .set('session-id', 'test-session')
        .send({
          taskId: 'task-123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task name is required');
    });

    it('should return error if timer is already running', async () => {
      const mockTimeEntry = { id: 'time-entry-123' };
      notionService.createTimeEntry.mockResolvedValue(mockTimeEntry);

      // Start first timer
      await request(app)
        .post('/timer/start')
        .set('session-id', 'test-session')
        .send({
          taskName: 'First Task'
        });

      // Try to start second timer with same session
      const response = await request(app)
        .post('/timer/start')
        .set('session-id', 'test-session')
        .send({
          taskName: 'Second Task'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Timer is already running. Stop current timer first.');
    });

    it('should handle notion service errors', async () => {
      notionService.createTimeEntry.mockRejectedValue(new Error('Notion error'));

      const response = await request(app)
        .post('/timer/start')
        .set('session-id', 'test-session')
        .send({
          taskName: 'Test Task'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task name is required');
    });
  });

  describe('POST /timer/stop', () => {
    beforeEach(async () => {
      // Start a timer first
      const mockTimeEntry = { 
        id: 'test-entry-123',
        taskName: 'Test Task',
        startTime: expect.any(String)
      };
      notionService.createTimeEntry.mockResolvedValue(mockTimeEntry);

      await request(app)
        .post('/timer/start')
        .set('session-id', 'test-session')
        .send({
          taskName: 'Test Task'
        });
    });

    it('should stop timer successfully', async () => {
      notionService.updateTimeEntry.mockResolvedValue({ id: 'updated-entry' });

      const response = await request(app)
        .post('/timer/stop')
        .set('session-id', 'test-session');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        entryId: 'test-entry-123',
        taskName: 'Test Task',
        startTime: expect.any(String),
        endTime: expect.any(String),
        duration: expect.any(Number),
        message: 'Timer stopped and logged successfully'
      });

      expect(notionService.updateTimeEntry).toHaveBeenCalledWith(
        'test-entry-123',
        expect.any(String),
        expect.any(Number)
      );
    });

    it('should return error if no timer is running', async () => {
      const response = await request(app)
        .post('/timer/stop')
        .set('session-id', 'different-session');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No active timer found');
    });

    it('should handle notion service errors', async () => {
      notionService.updateTimeEntry.mockRejectedValue(new Error('Update failed'));

      const response = await request(app)
        .post('/timer/stop')
        .set('session-id', 'test-session');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Update failed');
    });
  });

  describe('GET /timer/status', () => {
    it('should return no timer running when none active', async () => {
      const response = await request(app)
        .get('/timer/status')
        .set('session-id', 'test-session');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        isRunning: false,
        timer: null
      });
    });

    it('should return timer status when running', async () => {
      // Start a timer first
      const mockTimeEntry = { 
        id: 'test-entry-123',
        taskName: 'Test Task',
        startTime: expect.any(String)
      };
      notionService.createTimeEntry.mockResolvedValue(mockTimeEntry);

      await request(app)
        .post('/timer/start')
        .set('session-id', 'test-session')
        .send({
          taskName: 'Test Task',
          taskType: 'manual'
        });

      // Small delay to ensure duration > 0
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app)
        .get('/timer/status')
        .set('session-id', 'test-session');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isRunning).toBe(true);
      expect(response.body.data.timer).toEqual({
        entryId: 'test-entry-123',
        taskName: 'Test Task',
        taskType: 'manual',
        startTime: expect.any(String),
        currentDuration: expect.any(Number),
        durationMinutes: expect.any(Number)
      });
      expect(response.body.data.timer.currentDuration).toBeGreaterThan(0);
    });
  });

  describe('POST /timer/quick-start', () => {
    it('should start quick task successfully', async () => {
      const mockTimeEntry = { 
        id: 'test-entry-123',
        taskName: 'Check Email',
        startTime: expect.any(String)
      };
      notionService.createTimeEntry.mockResolvedValue(mockTimeEntry);

      const response = await request(app)
        .post('/timer/quick-start')
        .set('session-id', 'test-session')
        .send({
          taskName: 'Check Email'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return error for invalid quick task', async () => {
      const response = await request(app)
        .post('/timer/quick-start')
        .set('session-id', 'test-session')
        .send({
          taskName: 'Invalid Task'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid quick task name');
    });
  });

  describe('GET /timer/quick-tasks', () => {
    it('should return list of quick tasks', async () => {
      const response = await request(app)
        .get('/timer/quick-tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        { name: 'Check Email', category: 'Administrative' },
        { name: 'Case Brief', category: 'Reading' },
        { name: 'Outline Review', category: 'Study' },
        { name: 'Research', category: 'Academic' },
        { name: 'Class Prep', category: 'Study' },
        { name: 'Study Group', category: 'Collaborative' },
        { name: 'Office Hours', category: 'Academic' },
        { name: 'Bar Prep', category: 'Study' }
      ]);
    });
  });
});