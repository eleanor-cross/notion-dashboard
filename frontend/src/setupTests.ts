// ABOUTME: Test setup file for React Testing Library
// ABOUTME: Configures Jest DOM matchers and MSW for API mocking

import '@testing-library/jest-dom';
import React from 'react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock matchMedia (must be early in setup)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock API endpoints for testing
export const server = setupServer(
  // Timer endpoints
  rest.get('http://localhost:3001/api/timer/status', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          isRunning: false,
          timer: null
        }
      })
    );
  }),

  rest.post('http://localhost:3001/api/timer/start', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          entryId: 'test-entry-123',
          taskName: 'Test Task',
          startTime: new Date().toISOString(),
          message: 'Timer started successfully'
        }
      })
    );
  }),

  rest.post('http://localhost:3001/api/timer/stop', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          entryId: 'test-entry-123',
          taskName: 'Test Task',
          startTime: new Date(Date.now() - 1800000).toISOString(),
          endTime: new Date().toISOString(),
          duration: 30,
          message: 'Timer stopped and logged successfully'
        }
      })
    );
  }),

  rest.get('http://localhost:3001/api/timer/quick-tasks', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          { name: 'Check Email', category: 'Administrative' },
          { name: 'Case Brief', category: 'Reading' },
          { name: 'Outline Review', category: 'Study' }
        ]
      })
    );
  }),

  // Tasks endpoints
  rest.get('http://localhost:3001/api/notion/tasks/today', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: 'task-1',
            title: 'Read Constitutional Law Ch. 5',
            status: 'Not Started',
            dueDate: new Date().toISOString().split('T')[0],
            class: 'Constitutional Law',
            priority: 'High',
            estimatedTime: 120,
            url: 'https://notion.so/task-1'
          }
        ]
      })
    );
  }),

  rest.get('http://localhost:3001/api/notion/tasks/active', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: []
      })
    );
  }),

  // Textbooks endpoints
  rest.get('http://localhost:3001/api/notion/textbooks', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: 'textbook-1',
            title: 'Constitutional Law: Principles and Policies',
            class: 'Constitutional Law',
            author: 'Jesse Choper',
            avgReadingSpeed: 15,
            totalPages: 800
          }
        ]
      })
    );
  }),

  // Reading session endpoint
  rest.post('http://localhost:3001/api/notion/reading-session', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: 'session-123',
          readingSpeed: 16.5
        }
      })
    );
  }),

  // Analytics endpoints
  rest.get('http://localhost:3001/api/analytics/reading-speed', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          summary: {
            averageSpeed: 15.2,
            totalPagesRead: 234,
            totalTimeSpent: 920,
            sessionsCount: 18
          },
          byTextbook: [
            {
              textbookId: 'textbook-1',
              textbookName: 'Constitutional Law',
              averageSpeed: 12.3,
              pagesRead: 89,
              timeSpent: 434
            }
          ],
          trend: [
            { date: '2024-01-01', speed: 14.2 },
            { date: '2024-01-02', speed: 15.8 },
            { date: '2024-01-03', speed: 16.1 }
          ]
        }
      })
    );
  }),

  rest.get('http://localhost:3001/api/analytics/insights', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          weeklyGoals: {
            target: 1800,
            current: 1295,
            percentage: 72
          },
          streaks: {
            currentStudyStreak: 5,
            longestStudyStreak: 12,
            currentReadingGoal: 8
          },
          predictions: {
            weeklyCompletion: {
              estimated: '95%',
              timeNeeded: 505,
              confidence: 'high'
            }
          },
          recommendations: [
            {
              type: 'schedule',
              title: 'Optimize Reading Time',
              description: 'Your reading speed is fastest between 2-4 PM',
              priority: 'high'
            }
          ]
        }
      })
    );
  }),

  // Health endpoint
  rest.get('http://localhost:3001/api/health', (req, res, ctx) => {
    return res(
      ctx.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: 123456
      })
    );
  })
);

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock Chart.js to avoid canvas issues in tests
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  ArcElement: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Line: jest.fn().mockImplementation(() => ({ type: 'div', props: { 'data-testid': 'line-chart' } })),
  Bar: jest.fn().mockImplementation(() => ({ type: 'div', props: { 'data-testid': 'bar-chart' } })),
  Doughnut: jest.fn().mockImplementation(() => ({ type: 'div', props: { 'data-testid': 'doughnut-chart' } })),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

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

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('Warning: ReactDOM.render is deprecated') ||
      args[0]?.includes?.('componentWillReceiveProps')) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};