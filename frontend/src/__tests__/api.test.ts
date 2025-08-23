// ABOUTME: Unit tests for API service layer
// ABOUTME: Tests all API endpoints, error handling, and data transformation

import { 
  tasksApi, 
  timerApi, 
  textbooksApi, 
  scheduleApi, 
  readingApi, 
  analyticsApi, 
  healthApi 
} from '../services/api';
import { server } from '../setupTests';
import { rest } from 'msw';

// Mock session storage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue('test-session-id');
  });

  describe('Session Management', () => {
    it('should create session ID if none exists', async () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      await tasksApi.getToday();

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'dashboardSessionId',
        expect.stringMatching(/^session_\d+_[a-z0-9]+$/)
      );
    });

    it('should use existing session ID', async () => {
      mockSessionStorage.getItem.mockReturnValue('existing-session-id');

      await tasksApi.getToday();

      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Tasks API', () => {
    describe('getAll', () => {
      it('should fetch all tasks successfully', async () => {
        const tasks = await tasksApi.getAll();

        expect(Array.isArray(tasks)).toBe(true);
        if (tasks.length > 0) {
          expect(tasks[0]).toHaveProperty('id');
          expect(tasks[0]).toHaveProperty('title');
          expect(tasks[0]).toHaveProperty('status');
        }
      });

      it('should handle API errors', async () => {
        server.use(
          rest.get('/api/notion/tasks', (req, res, ctx) => {
            return res(
              ctx.status(500),
              ctx.json({ success: false, error: 'Server error' })
            );
          })
        );

        await expect(tasksApi.getAll()).rejects.toThrow('Server error');
      });

      it('should handle missing data property', async () => {
        server.use(
          rest.get('/api/notion/tasks', (req, res, ctx) => {
            return res(ctx.json({ success: true }));
          })
        );

        const tasks = await tasksApi.getAll();
        expect(tasks).toEqual([]);
      });
    });

    describe('getToday', () => {
      it('should fetch today\'s tasks', async () => {
        const tasks = await tasksApi.getToday();

        expect(Array.isArray(tasks)).toBe(true);
        if (tasks.length > 0) {
          expect(tasks[0].dueDate).toBe(new Date().toISOString().split('T')[0]);
        }
      });
    });

    describe('getActive', () => {
      it('should fetch active tasks', async () => {
        const tasks = await tasksApi.getActive();

        expect(Array.isArray(tasks)).toBe(true);
      });
    });
  });

  describe('Timer API', () => {
    describe('start', () => {
      it('should start timer successfully', async () => {
        const result = await timerApi.start('task-123', 'Test Task', 'manual');

        expect(result).toHaveProperty('entryId');
        expect(result).toHaveProperty('taskName');
        expect(result).toHaveProperty('startTime');
      });

      it('should handle start timer errors', async () => {
        server.use(
          rest.post('/api/timer/start', (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({ success: false, error: 'Timer already running' })
            );
          })
        );

        await expect(timerApi.start(null, 'Test Task')).rejects.toThrow('Timer already running');
      });
    });

    describe('stop', () => {
      it('should stop timer successfully', async () => {
        const result = await timerApi.stop();

        expect(result).toHaveProperty('entryId');
        expect(result).toHaveProperty('duration');
      });

      it('should handle stop timer errors', async () => {
        server.use(
          rest.post('/api/timer/stop', (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({ success: false, error: 'No active timer' })
            );
          })
        );

        await expect(timerApi.stop()).rejects.toThrow('No active timer');
      });
    });

    describe('getStatus', () => {
      it('should get timer status', async () => {
        const status = await timerApi.getStatus();

        expect(status).toHaveProperty('isRunning');
        expect(status).toHaveProperty('timer');
        expect(typeof status.isRunning).toBe('boolean');
      });

      it('should return default state on error', async () => {
        server.use(
          rest.get('/api/timer/status', (req, res, ctx) => {
            return res(
              ctx.status(500),
              ctx.json({ success: false, error: 'Server error' })
            );
          })
        );

        await expect(timerApi.getStatus()).rejects.toThrow('Server error');
      });
    });

    describe('quickStart', () => {
      it('should start quick task', async () => {
        const result = await timerApi.quickStart('Check Email');

        expect(result).toBeDefined();
      });

      it('should handle invalid quick task', async () => {
        server.use(
          rest.post('/api/timer/quick-start', (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({ success: false, error: 'Invalid quick task name' })
            );
          })
        );

        await expect(timerApi.quickStart('Invalid Task')).rejects.toThrow('Invalid quick task name');
      });
    });

    describe('getQuickTasks', () => {
      it('should fetch quick tasks list', async () => {
        const quickTasks = await timerApi.getQuickTasks();

        expect(Array.isArray(quickTasks)).toBe(true);
        if (quickTasks.length > 0) {
          expect(quickTasks[0]).toHaveProperty('name');
          expect(quickTasks[0]).toHaveProperty('category');
        }
      });
    });
  });

  describe('Textbooks API', () => {
    describe('getAll', () => {
      it('should fetch all textbooks', async () => {
        const textbooks = await textbooksApi.getAll();

        expect(Array.isArray(textbooks)).toBe(true);
        if (textbooks.length > 0) {
          expect(textbooks[0]).toHaveProperty('id');
          expect(textbooks[0]).toHaveProperty('title');
          expect(textbooks[0]).toHaveProperty('class');
        }
      });
    });
  });

  describe('Schedule API', () => {
    describe('getToday', () => {
      it('should fetch today\'s schedule', async () => {
        const schedule = await scheduleApi.getToday();

        expect(Array.isArray(schedule)).toBe(true);
      });
    });
  });

  describe('Reading API', () => {
    describe('createSession', () => {
      it('should create reading session', async () => {
        const sessionData = {
          textbookName: 'Test Book',
          pagesRead: 10,
          duration: 3600000 // 1 hour
        };

        const result = await readingApi.createSession(sessionData);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('readingSpeed');
      });

      it('should handle missing required fields', async () => {
        server.use(
          rest.post('/api/notion/reading-session', (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({ success: false, error: 'Missing required fields' })
            );
          })
        );

        const sessionData = {
          textbookName: 'Test Book',
          pagesRead: 0,
          duration: 0
        };

        await expect(readingApi.createSession(sessionData)).rejects.toThrow('Missing required fields');
      });
    });
  });

  describe('Analytics API', () => {
    describe('getReadingSpeed', () => {
      it('should fetch reading speed analytics', async () => {
        const analytics = await analyticsApi.getReadingSpeed();

        expect(analytics).toHaveProperty('summary');
        expect(analytics).toHaveProperty('byTextbook');
        expect(analytics).toHaveProperty('trend');
        expect(analytics.summary).toHaveProperty('averageSpeed');
        expect(Array.isArray(analytics.byTextbook)).toBe(true);
        expect(Array.isArray(analytics.trend)).toBe(true);
      });

      it('should accept filter parameters', async () => {
        const analytics = await analyticsApi.getReadingSpeed('7', 'book-123', 'Constitutional Law');

        expect(analytics).toHaveProperty('summary');
      });
    });

    describe('getTimeDistribution', () => {
      it('should fetch time distribution', async () => {
        const distribution = await analyticsApi.getTimeDistribution();

        expect(distribution).toHaveProperty('byClass');
        expect(distribution).toHaveProperty('byActivity');
        expect(distribution).toHaveProperty('dailyBreakdown');
        expect(Array.isArray(distribution.byClass)).toBe(true);
        expect(Array.isArray(distribution.byActivity)).toBe(true);
        expect(Array.isArray(distribution.dailyBreakdown)).toBe(true);
      });
    });

    describe('getInsights', () => {
      it('should fetch productivity insights', async () => {
        const insights = await analyticsApi.getInsights();

        expect(insights).toHaveProperty('weeklyGoals');
        expect(insights).toHaveProperty('streaks');
        expect(insights).toHaveProperty('predictions');
        expect(insights).toHaveProperty('recommendations');
        expect(Array.isArray(insights.recommendations)).toBe(true);
      });
    });

    describe('getPerformance', () => {
      it('should fetch performance data', async () => {
        const performance = await analyticsApi.getPerformance();

        expect(performance).toHaveProperty('current');
        expect(performance).toHaveProperty('previous');
        expect(performance).toHaveProperty('trends');
        expect(performance).toHaveProperty('milestones');
      });

      it('should accept custom period', async () => {
        const performance = await analyticsApi.getPerformance('month');

        expect(performance.current.period).toBe('month');
      });
    });
  });

  describe('Health API', () => {
    describe('check', () => {
      it('should check API health', async () => {
        const health = await healthApi.check();

        expect(health).toHaveProperty('status');
        expect(health.status).toBe('OK');
      });

      it('should handle health check errors', async () => {
        server.use(
          rest.get('/api/health', (req, res, ctx) => {
            return res(ctx.status(500));
          })
        );

        await expect(healthApi.check()).rejects.toThrow();
      });
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors', async () => {
      server.use(
        rest.get('/api/notion/tasks', (req, res, ctx) => {
          return res.networkError('Failed to connect');
        })
      );

      await expect(tasksApi.getAll()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      server.use(
        rest.get('/api/notion/tasks', (req, res, ctx) => {
          return res(ctx.delay(15000)); // Longer than 10s timeout
        })
      );

      await expect(tasksApi.getAll()).rejects.toThrow();
    });
  });
});