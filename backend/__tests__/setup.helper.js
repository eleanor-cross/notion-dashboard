// ABOUTME: Test setup file for backend testing environment
// ABOUTME: Configures mocks, environment variables, and global test utilities

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.NOTION_TOKEN = 'test_token_mock';
process.env.TASKS_DB_ID = 'test_tasks_db_id';
process.env.TIME_TRACKING_DB_ID = 'test_time_tracking_db_id';
process.env.TEXTBOOKS_DB_ID = 'test_textbooks_db_id';
process.env.SCHEDULE_DB_ID = 'test_schedule_db_id';
process.env.PORT = 3001;
process.env.FRONTEND_URL = 'http://localhost:3000';

// Mock the Notion client
const mockQuery = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@notionhq/client', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      databases: {
        query: mockQuery,
      },
      pages: {
        create: mockCreate,
        update: mockUpdate,
      },
    })),
  };
});

// Export mock functions for test access
global.mockNotionClient = {
  databases: { query: mockQuery },
  pages: { create: mockCreate, update: mockUpdate },
};

// Global test utilities
global.mockNotionResponse = (data = [], hasMore = false) => ({
  results: data,
  has_more: hasMore,
  next_cursor: hasMore ? 'next_cursor' : null,
});

global.mockNotionPage = (properties = {}) => ({
  id: 'test-page-id',
  url: 'https://notion.so/test-page',
  properties,
  created_time: new Date().toISOString(),
  last_edited_time: new Date().toISOString(),
});

// Mock task page
global.mockTaskPage = (overrides = {}) => mockNotionPage({
  Name: {
    title: [{ text: { content: overrides.title || 'Test Task' } }]
  },
  Status: {
    select: { name: overrides.status || 'Not Started' }
  },
  'Due Date': {
    date: { start: overrides.dueDate || '2024-01-01' }
  },
  Class: {
    select: { name: overrides.class || 'Test Class' }
  },
  Priority: {
    select: { name: overrides.priority || 'Medium' }
  },
  'Estimated Time (mins)': {
    number: overrides.estimatedTime || 60
  },
  ...overrides.properties
});

// Mock textbook page
global.mockTextbookPage = (overrides = {}) => mockNotionPage({
  Name: {
    title: [{ text: { content: overrides.title || 'Test Textbook' } }]
  },
  Class: {
    select: { name: overrides.class || 'Test Class' }
  },
  Author: {
    rich_text: [{ text: { content: overrides.author || 'Test Author' } }]
  },
  'Avg Reading Speed': {
    number: overrides.avgReadingSpeed || 15
  },
  'Total Pages': {
    number: overrides.totalPages || 500
  },
  ...overrides.properties
});

// Mock schedule page
global.mockSchedulePage = (overrides = {}) => mockNotionPage({
  Class: {
    title: [{ text: { content: overrides.class || 'Test Class' } }]
  },
  Time: {
    rich_text: [{ text: { content: overrides.time || '10:00 AM' } }]
  },
  Location: {
    rich_text: [{ text: { content: overrides.location || 'Test Location' } }]
  },
  Type: {
    select: { name: overrides.type || 'Class' }
  },
  Professor: {
    rich_text: [{ text: { content: overrides.professor || 'Test Professor' } }]
  },
  ...overrides.properties
});

// Console override to reduce noise in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('Warning: ReactDOM.render is deprecated') ||
      args[0]?.includes?.('Warning: componentWillReceiveProps has been renamed')) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});