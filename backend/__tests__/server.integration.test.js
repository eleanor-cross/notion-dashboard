// ABOUTME: Integration tests for Express server startup and core functionality
// ABOUTME: Tests middleware, routes, error handling, and server lifecycle

const request = require('supertest');

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.NOTION_TOKEN = 'test_token';
  process.env.TASKS_DB_ID = 'test_tasks_db';
  process.env.TIME_TRACKING_DB_ID = 'test_time_db';
  process.env.TEXTBOOKS_DB_ID = 'test_textbooks_db';
  process.env.SCHEDULE_DB_ID = 'test_schedule_db';
});

afterAll(() => {
  process.env = originalEnv;
});

describe('Server Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Clear the require cache to get a fresh server instance
    delete require.cache[require.resolve('../server')];
    app = require('../server');
  });

  describe('Server Configuration', () => {
    it('should export Express app', () => {
      expect(app).toBeDefined();
      expect(typeof app.get).toBe('function');
      expect(typeof app.post).toBe('function');
    });

    it('should have required middleware configured', () => {
      expect(app._router).toBeDefined();
      expect(app._router.stack.length).toBeGreaterThan(5); // Multiple middleware layers
    });
  });

  describe('Middleware Integration', () => {
    it('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/health')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should have security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined(); // Could be DENY or SAMEORIGIN
    });

    it('should parse JSON requests', async () => {
      await request(app)
        .post('/api/timer/start')
        .send({ taskName: 'Test Task' })
        .expect(200);
    });

    it('should enforce JSON size limits', async () => {
      const largeObject = { data: 'x'.repeat(1024 * 1024) }; // 1MB of data
      
      await request(app)
        .post('/api/timer/start')
        .send(largeObject)
        .expect(400); // Should reject large payloads
    });
  });

  describe('Health Check', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: 'test'
      });
    });

    it('should include performance metrics in health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.uptime).toBeGreaterThan(0);
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('API Route Integration', () => {
    it('should mount timer routes', async () => {
      await request(app)
        .get('/api/timer/status')
        .expect(200);
    });

    it('should mount notion routes', async () => {
      await request(app)
        .get('/api/notion/tasks')
        .expect(200);
    });

    it('should mount analytics routes', async () => {
      await request(app)
        .get('/api/analytics/reading-speed')
        .expect(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Route not found',
        path: '/non-existent-route'
      });
    });

    it('should handle 404 for unknown API routes', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route not found');
    });

    it('should handle malformed JSON gracefully', async () => {
      // Note: This test verifies error handling middleware is configured
      const response = await request(app)
        .post('/api/timer/start')
        .set('Content-Type', 'application/json')
        .send('{"malformed": json}')
        .expect(400);

      expect(response.status).toBe(400);
    });
  });

  describe('Environment Configuration', () => {
    it('should use test environment variables', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.FRONTEND_URL).toBe('http://localhost:3000');
    });

    it('should have required Notion environment variables', () => {
      expect(process.env.NOTION_TOKEN).toBe('test_token');
      expect(process.env.TASKS_DB_ID).toBe('test_tasks_db');
      expect(process.env.TIME_TRACKING_DB_ID).toBe('test_time_db');
      expect(process.env.TEXTBOOKS_DB_ID).toBe('test_textbooks_db');
      expect(process.env.SCHEDULE_DB_ID).toBe('test_schedule_db');
    });
  });

  describe('Performance', () => {
    it('should respond to health check within reasonable time', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500); // More reasonable for CI environments
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill().map(() => 
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});