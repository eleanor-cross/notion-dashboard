// ABOUTME: Test utilities for React Testing Library
// ABOUTME: Custom render function and common test helpers

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../contexts/ThemeContext.tsx';

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <ThemeProvider defaultTheme="light">
        {children}
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock timer state for testing
export const mockTimerState = {
  isRunning: false,
  timer: null
};

export const mockRunningTimerState = {
  isRunning: true,
  timer: {
    entryId: 'test-entry-123',
    taskName: 'Test Task',
    taskType: 'manual' as const,
    startTime: new Date().toISOString(),
    currentDuration: 1800, // 30 minutes in seconds
    durationMinutes: 30
  }
};

// Mock tasks data
export const mockTasks = [
  {
    id: 'task-1',
    title: 'Read Constitutional Law Ch. 5',
    status: 'Not Started' as const,
    dueDate: new Date().toISOString().split('T')[0],
    class: 'Constitutional Law',
    priority: 'High' as const,
    estimatedTime: 120,
    url: 'https://notion.so/task-1'
  },
  {
    id: 'task-2',
    title: 'Write Case Brief',
    status: 'In Progress' as const,
    dueDate: new Date().toISOString().split('T')[0],
    class: 'Contracts',
    priority: 'Medium' as const,
    estimatedTime: 90,
    url: 'https://notion.so/task-2'
  }
];

// Mock textbooks data
export const mockTextbooks = [
  {
    id: 'textbook-1',
    title: 'Constitutional Law: Principles and Policies',
    class: 'Constitutional Law',
    author: 'Jesse Choper',
    avgReadingSpeed: 15,
    totalPages: 800
  },
  {
    id: 'textbook-2',
    title: 'Contracts: Law in Action',
    class: 'Contracts',
    author: 'Stewart Macaulay',
    avgReadingSpeed: 18,
    totalPages: 600
  }
];

// Mock analytics data
export const mockAnalyticsData = {
  readingSpeed: {
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
  },
  insights: {
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
        confidence: 'high' as const
      }
    },
    recommendations: [
      {
        type: 'schedule' as const,
        title: 'Optimize Reading Time',
        description: 'Your reading speed is fastest between 2-4 PM',
        priority: 'high' as const
      }
    ]
  }
};

// Helper function to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper to simulate user typing
export const typeIntoInput = async (input: HTMLElement, text: string) => {
  const user = userEvent.setup();
  await user.clear(input);
  await user.type(input, text);
};

// Helper to simulate user clicking
export const clickButton = async (button: HTMLElement) => {
  const user = userEvent.setup();
  await user.click(button);
};

// Helper to simulate keyboard events
export const pressKey = async (key: string) => {
  const user = userEvent.setup();
  await user.keyboard(key);
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { userEvent };