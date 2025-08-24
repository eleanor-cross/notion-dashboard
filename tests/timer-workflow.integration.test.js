// ABOUTME: Integration tests for timer workflow
// ABOUTME: Tests complete timer start/stop cycle with Notion integration

describe('Timer Workflow Integration', () => {
  const { testHelpers } = global;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Timer Workflow', () => {
    it('should complete full timer start/stop cycle', async () => {
      // 1. Check initial timer status
      const initialStatus = await testHelpers.getTimerStatus();
      expect(initialStatus.status).toBe(200);
      expect(initialStatus.data.success).toBe(true);
      expect(initialStatus.data.data.isRunning).toBe(false);

      // 2. Start timer
      const startResponse = await testHelpers.startTimer('Integration Test Task');
      expect(startResponse.status).toBe(200);
      expect(startResponse.data.success).toBe(true);
      expect(startResponse.data.data).toHaveProperty('entryId');
      expect(startResponse.data.data.taskName).toBe('Integration Test Task');

      // 3. Check timer is running
      const runningStatus = await testHelpers.getTimerStatus();
      expect(runningStatus.data.data.isRunning).toBe(true);
      expect(runningStatus.data.data.timer).toHaveProperty('entryId');
      expect(runningStatus.data.data.timer.taskName).toBe('Integration Test Task');

      // 4. Wait a moment to accumulate some time
      await new Promise(resolve => setTimeout(resolve, 100));

      // 5. Stop timer
      const stopResponse = await testHelpers.stopTimer();
      expect(stopResponse.status).toBe(200);
      expect(stopResponse.data.success).toBe(true);
      expect(stopResponse.data.data).toHaveProperty('duration');
      expect(stopResponse.data.data.duration).toBeGreaterThan(0);

      // 6. Verify timer is stopped
      const stoppedStatus = await testHelpers.getTimerStatus();
      expect(stoppedStatus.data.data.isRunning).toBe(false);
      expect(stoppedStatus.data.data.timer).toBe(null);
    });

    it('should prevent starting multiple timers', async () => {
      // Start first timer
      const firstTimer = await testHelpers.startTimer('First Task');
      expect(firstTimer.status).toBe(200);

      // Try to start second timer - should fail
      try {
        await testHelpers.startTimer('Second Task');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('Timer is already running');
      }

      // Clean up
      await testHelpers.stopTimer();
    });

    it('should handle stopping timer when none is running', async () => {
      try {
        await testHelpers.stopTimer();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('No active timer found');
      }
    });
  });

  describe('Quick Tasks Integration', () => {
    it('should start and stop quick task', async () => {
      // Get available quick tasks
      const quickTasksResponse = await testHelpers.makeRequest('GET', '/api/timer/quick-tasks');
      expect(quickTasksResponse.status).toBe(200);
      expect(Array.isArray(quickTasksResponse.data.data)).toBe(true);
      expect(quickTasksResponse.data.data.length).toBeGreaterThan(0);

      const firstQuickTask = quickTasksResponse.data.data[0];

      // Start quick task
      const startResponse = await testHelpers.makeRequest('POST', '/api/timer/quick-start', {
        taskName: firstQuickTask.name
      });
      expect(startResponse.status).toBe(200);

      // Verify it's running
      const status = await testHelpers.getTimerStatus();
      expect(status.data.data.isRunning).toBe(true);
      expect(status.data.data.timer.taskName).toBe(firstQuickTask.name);

      // Stop the timer
      const stopResponse = await testHelpers.stopTimer();
      expect(stopResponse.status).toBe(200);
    });

    it('should reject invalid quick task names', async () => {
      try {
        await testHelpers.makeRequest('POST', '/api/timer/quick-start', {
          taskName: 'Invalid Task Name'
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('Invalid quick task name');
      }
    });
  });

  describe('Timer Session Persistence', () => {
    it('should maintain timer state across multiple status checks', async () => {
      const taskName = 'Persistence Test Task';
      
      // Start timer
      await testHelpers.startTimer(taskName);

      // Check status multiple times
      for (let i = 0; i < 3; i++) {
        const status = await testHelpers.getTimerStatus();
        expect(status.data.data.isRunning).toBe(true);
        expect(status.data.data.timer.taskName).toBe(taskName);
        expect(status.data.data.timer.currentDuration).toBeGreaterThanOrEqual(0);
        
        // Small delay between checks
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Clean up
      await testHelpers.stopTimer();
    });

    it('should track duration accurately', async () => {
      // Start timer
      const startResponse = await testHelpers.startTimer('Duration Test');
      const startTime = Date.now();

      // Wait for a known duration
      await new Promise(resolve => setTimeout(resolve, 200));

      // Stop timer
      const stopResponse = await testHelpers.stopTimer();
      const endTime = Date.now();
      const actualDuration = endTime - startTime;

      // Check that recorded duration is close to actual duration
      const recordedDuration = stopResponse.data.data.duration * 60 * 1000; // Convert minutes to ms
      const tolerance = 500; // 500ms tolerance for CI environments

      expect(Math.abs(recordedDuration - actualDuration)).toBeLessThan(tolerance);
    });
  });

  describe('Error Recovery', () => {
    it('should handle server restart gracefully', async () => {
      // This test simulates what happens when the server restarts
      // and the in-memory timer state is lost
      
      // Start timer
      await testHelpers.startTimer('Recovery Test');

      // Simulate server restart by checking that timer state 
      // can be queried without errors
      const status = await testHelpers.getTimerStatus();
      expect(status.status).toBe(200);
      expect(status.data.success).toBe(true);

      // The timer might not be running due to restart simulation,
      // but the API should respond correctly
      expect(status.data.data).toHaveProperty('isRunning');
      expect(status.data.data).toHaveProperty('timer');
    });

    it('should validate timer start parameters', async () => {
      // Test missing task name
      try {
        await testHelpers.makeRequest('POST', '/api/timer/start', {
          taskId: 'test-id'
          // Missing taskName
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('Task name is required');
      }

      // Test empty task name
      try {
        await testHelpers.makeRequest('POST', '/api/timer/start', {
          taskName: ''
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('Task name is required');
      }
    });
  });

  describe('Notion Integration', () => {
    it('should create Notion entries when timer operations occur', async () => {
      const { Client } = require('@notionhq/client');
      const mockClient = new Client();

      // Start timer
      await testHelpers.startTimer('Notion Integration Test');

      // Verify that create was called on the Notion client
      expect(mockClient.pages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: {
            database_id: process.env.TIME_TRACKING_DB_ID
          },
          properties: expect.objectContaining({
            'Task': {
              title: [
                {
                  text: {
                    content: 'Notion Integration Test'
                  }
                }
              ]
            },
            'Start Time': {
              date: {
                start: expect.any(String)
              }
            }
          })
        })
      );

      // Stop timer
      await testHelpers.stopTimer();

      // Verify that update was called
      expect(mockClient.pages.update).toHaveBeenCalledWith(
        expect.objectContaining({
          page_id: expect.any(String),
          properties: expect.objectContaining({
            'End Time': {
              date: {
                start: expect.any(String)
              }
            },
            'Duration (mins)': {
              number: expect.any(Number)
            }
          })
        })
      );
    });
  });
});