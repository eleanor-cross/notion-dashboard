// ABOUTME: Integration test setup for end-to-end workflows
// ABOUTME: Configures test environment for full application testing

const { spawn } = require('child_process');
const axios = require('axios');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = 3002; // Different port for integration tests
process.env.NOTION_TOKEN = 'test_integration_token';
process.env.TASKS_DB_ID = 'test_integration_tasks_db';
process.env.TIME_TRACKING_DB_ID = 'test_integration_time_db';
process.env.TEXTBOOKS_DB_ID = 'test_integration_textbooks_db';
process.env.SCHEDULE_DB_ID = 'test_integration_schedule_db';
process.env.FRONTEND_URL = 'http://localhost:3000';

let serverProcess;

// Mock Notion client before server startup
jest.mock('../backend/services/notionClient', () => ({
  getTasks: jest.fn().mockResolvedValue([{
    id: 'test-task-1',
    title: 'Integration Test Task',
    status: 'Not Started',
    dueDate: new Date().toISOString().split('T')[0],
    class: 'Test Class',
    priority: 'Medium',
    estimatedTime: 60
  }]),
  getTodaysTasks: jest.fn().mockResolvedValue([]),
  getActiveTasks: jest.fn().mockResolvedValue([]),
  getTextbooks: jest.fn().mockResolvedValue([]),
  getTodaysSchedule: jest.fn().mockResolvedValue([]),
  createTimeEntry: jest.fn().mockResolvedValue({
    id: 'test-time-entry',
    taskName: 'Integration Test Task',
    startTime: new Date().toISOString()
  }),
  updateTimeEntry: jest.fn().mockResolvedValue({
    id: 'test-time-entry',
    endTime: new Date().toISOString(),
    duration: 2
  }),
  createReadingSession: jest.fn().mockResolvedValue({
    id: 'test-reading-session',
    textbookName: 'Test Book',
    pagesRead: 10,
    readingSpeed: 30
  })
}));

// Start test server before all tests  
beforeAll(async () => {
  // Clear require cache to pick up mocks
  delete require.cache[require.resolve('../backend/server.js')];
  
  // Ensure no server is already running on the test port
  try {
    await axios.get('http://localhost:3002/api/health');
    console.warn('Server already running on port 3002, attempting to continue...');
  } catch (error) {
    // Expected when no server is running
  }
  
  // Start the backend server for integration tests
  serverProcess = spawn('node', ['backend/server.js'], {
    env: { 
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3002' // Explicitly set port for integration tests
    },
    stdio: ['pipe', 'pipe', 'pipe'] // Capture all output
  });

  // Handle server output for debugging
  if (serverProcess.stdout) {
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (process.env.DEBUG_INTEGRATION) {
        console.log('SERVER OUT:', output);
      }
      if (output.includes('Server running') || output.includes('ready')) {
        console.log('Integration test server is ready');
      }
    });
  }
  
  if (serverProcess.stderr) {
    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (process.env.DEBUG_INTEGRATION) {
        console.error('SERVER ERR:', error);
      }
    });
  }
  
  // Handle server process errors
  serverProcess.on('error', (error) => {
    console.error('Failed to start server process:', error);
  });
  
  serverProcess.on('exit', (code, signal) => {
    if (code !== 0) {
      console.error(`Server process exited with code ${code}, signal ${signal}`);
    }
  });

  // Wait for server to start with proper error handling
  try {
    await waitForServer('http://localhost:3002/api/health', 45000); // Increased timeout
    console.log('Integration test server startup complete');
  } catch (error) {
    console.error('Failed to start integration test server:', error.message);
    
    // Kill the process if it's still running
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGTERM');
    }
    
    throw error;
  }
}, 60000); // Increase Jest timeout to 60 seconds

// Clean up after all tests
afterAll(async () => {
  if (serverProcess && !serverProcess.killed) {
    console.log('Cleaning up integration test server...');
    
    // Try graceful shutdown first
    serverProcess.kill('SIGTERM');
    
    // Wait for graceful shutdown
    await new Promise(resolve => {
      const timeout = setTimeout(() => {
        if (!serverProcess.killed) {
          console.log('Force killing server process...');
          serverProcess.kill('SIGKILL');
        }
        resolve();
      }, 5000);
      
      serverProcess.on('exit', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
    
    console.log('Integration test server cleanup complete');
  }
}, 10000);

// Helper function to wait for server to be ready
async function waitForServer(url, timeout = 45000) {
  const startTime = Date.now();
  let lastError;
  
  console.log(`Waiting for server at ${url} (timeout: ${timeout}ms)`);
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      if (response.status === 200) {
        console.log('Server health check passed');
        return;
      }
    } catch (error) {
      lastError = error;
      // Server not ready yet, wait a bit
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.error('Last error while waiting for server:', lastError?.message);
  throw new Error(`Server did not start within ${timeout}ms. Last error: ${lastError?.message}`);
}

// Mock the Notion client for integration tests
const mockClient = {
  databases: {
    query: jest.fn().mockImplementation(() => 
      Promise.resolve({
        results: [
          {
            id: 'test-page-id',
            url: 'https://notion.so/test-page',
            properties: {
              Name: { title: [{ text: { content: 'Integration Test Task' } }] },
              Status: { select: { name: 'Not Started' } },
              'Due Date': { date: { start: new Date().toISOString().split('T')[0] } },
              Class: { select: { name: 'Test Class' } },
              Priority: { select: { name: 'Medium' } },
              'Estimated Time (mins)': { number: 60 }
            }
          }
        ],
        has_more: false,
        next_cursor: null
      })
    ),
  },
  pages: {
    create: jest.fn().mockImplementation((data) => {
      const entryId = `entry-${Date.now()}`;
      return Promise.resolve({
        id: entryId,
        url: `https://notion.so/${entryId}`,
        properties: data.properties || {}
      });
    }),
    update: jest.fn().mockImplementation((data) => 
      Promise.resolve({
        id: data.page_id || 'updated-page-id',
        url: `https://notion.so/${data.page_id || 'updated-page-id'}`,
        properties: data.properties || {}
      })
    ),
  },
};

jest.mock('@notionhq/client', () => {
  return {
    Client: jest.fn().mockImplementation(() => mockClient),
  };
});

// Export mock client for test access
global.mockIntegrationClient = mockClient;

// Global test helpers for integration tests
global.testHelpers = {
  baseURL: 'http://localhost:3002',
  
  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method,
      url,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
        'session-id': 'integration-test-session'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    try {
      return await axios(config);
    } catch (error) {
      // Enhanced error logging for debugging
      console.error(`Request failed: ${method} ${endpoint}`);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  async startTimer(taskName = 'Integration Test Task') {
    return this.makeRequest('POST', '/api/timer/start', {
      taskName,
      taskType: 'manual'
    });
  },

  async stopTimer() {
    return this.makeRequest('POST', '/api/timer/stop');
  },

  async getTimerStatus() {
    return this.makeRequest('GET', '/api/timer/status');
  },

  async createReadingSession(data) {
    return this.makeRequest('POST', '/api/notion/reading-session', {
      textbookName: 'Test Textbook',
      pagesRead: 10,
      duration: 3600000, // 1 hour
      ...data
    });
  },

  async getTasks() {
    return this.makeRequest('GET', '/api/notion/tasks');
  },

  async getAnalytics(endpoint) {
    return this.makeRequest('GET', `/api/analytics/${endpoint}`);
  }
};

// Console override to reduce noise in integration tests
const originalConsoleLog = console.log;
console.log = (...args) => {
  if (args[0]?.includes?.('🚀 Server running') || 
      args[0]?.includes?.('📊 Dashboard API ready')) {
    return; // Suppress server startup messages
  }
  originalConsoleLog.call(console, ...args);
};