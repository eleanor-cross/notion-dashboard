// ABOUTME: Unit tests for Timer component
// ABOUTME: Tests timer start/stop functionality, task selection, and keyboard shortcuts

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render, mockTasks, mockTimerState, mockRunningTimerState, clickButton, typeIntoInput, pressKey } from '../test-utils/test-utils';
import { Timer } from '../components/Timer';
import { server } from '../setupTests';
import { rest } from 'msw';

// Mock the API calls
const mockOnTimerUpdate = jest.fn();

describe('Timer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnTimerUpdate.mockClear();
  });

  describe('Initial State', () => {
    it('should render timer in stopped state by default', async () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      expect(screen.getByText('Active Task Timer')).toBeInTheDocument();
      expect(screen.getByLabelText('Select a Task')).toBeInTheDocument();
      expect(screen.getByLabelText('Enter Custom Task')).toBeInTheDocument();
      expect(screen.getByText('Start Timer')).toBeInTheDocument();
      // Check for Space key instruction
      const spaceKey = screen.getByText('Space');
      expect(spaceKey).toBeInTheDocument();
      expect(spaceKey.tagName).toBe('KBD');
    });

    it('should load tasks on mount', async () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        expect(screen.getByText('Read Constitutional Law Ch. 5 (Constitutional Law)')).toBeInTheDocument();
      });
    });

    it('should disable start button when no task is selected', () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      const startButton = screen.getByText('Start Timer');
      expect(startButton).toBeDisabled();
    });
  });

  describe('Task Selection', () => {
    it('should enable start button when task is selected', async () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      const taskSelect = screen.getByLabelText('Select a Task');
      await clickButton(taskSelect);
      
      await waitFor(() => {
        const taskOption = screen.getByText('Read Constitutional Law Ch. 5 (Constitutional Law)');
        clickButton(taskOption);
      });

      const startButton = screen.getByText('Start Timer');
      expect(startButton).not.toBeDisabled();
    });

    it('should enable start button when custom task is entered', async () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      const customTaskInput = screen.getByLabelText('Enter Custom Task');
      await typeIntoInput(customTaskInput, 'Custom Study Session');

      const startButton = screen.getByText('Start Timer');
      expect(startButton).not.toBeDisabled();
    });

    it('should clear custom task when selecting from dropdown', async () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      const customTaskInput = screen.getByLabelText('Enter Custom Task');
      await typeIntoInput(customTaskInput, 'Custom Task');

      const taskSelect = screen.getByLabelText('Select a Task');
      await clickButton(taskSelect);

      await waitFor(() => {
        const taskOption = screen.getByText('Read Constitutional Law Ch. 5 (Constitutional Law)');
        clickButton(taskOption);
      });

      expect(customTaskInput).toHaveValue('');
    });
  });

  describe('Timer Operations', () => {
    it('should start timer successfully', async () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      const customTaskInput = screen.getByLabelText('Enter Custom Task');
      await typeIntoInput(customTaskInput, 'Test Task');

      const startButton = screen.getByText('Start Timer');
      await clickButton(startButton);

      await waitFor(() => {
        expect(mockOnTimerUpdate).toHaveBeenCalled();
      });
    });

    it('should handle start timer errors', async () => {
      // Mock API error
      server.use(
        rest.post('/api/timer/start', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              error: 'Failed to start timer'
            })
          );
        })
      );

      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      const customTaskInput = screen.getByLabelText('Enter Custom Task');
      await typeIntoInput(customTaskInput, 'Test Task');

      const startButton = screen.getByText('Start Timer');
      await clickButton(startButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to start timer')).toBeInTheDocument();
      });
    });

    it('should show validation error when trying to start without task', async () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      const startButton = screen.getByText('Start Timer');
      await clickButton(startButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a task or enter a custom task name')).toBeInTheDocument();
      });
    });
  });

  describe('Running Timer State', () => {
    beforeEach(() => {
      // Mock running timer status
      server.use(
        rest.get('/api/timer/status', (req, res, ctx) => {
          return res(
            ctx.json({
              success: true,
              data: mockRunningTimerState
            })
          );
        })
      );
    });

    it('should display running timer information', async () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        expect(screen.getByText('30:00')).toBeInTheDocument(); // 30 minutes
        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('Stop Timer')).toBeInTheDocument();
      });
    });

    it('should stop timer successfully', async () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        const stopButton = screen.getByText('Stop Timer');
        expect(stopButton).toBeInTheDocument();
      });

      const stopButton = screen.getByText('Stop Timer');
      await clickButton(stopButton);

      await waitFor(() => {
        expect(mockOnTimerUpdate).toHaveBeenCalled();
      });
    });

    it('should handle stop timer errors', async () => {
      server.use(
        rest.post('/api/timer/stop', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              error: 'Failed to stop timer'
            })
          );
        })
      );

      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        const stopButton = screen.getByText('Stop Timer');
        expect(stopButton).toBeInTheDocument();
      });

      const stopButton = screen.getByText('Stop Timer');
      await clickButton(stopButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to stop timer')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should start timer with spacebar when task is selected', async () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      const customTaskInput = screen.getByLabelText('Enter Custom Task');
      await typeIntoInput(customTaskInput, 'Test Task');

      await pressKey('{Space}');

      await waitFor(() => {
        expect(mockOnTimerUpdate).toHaveBeenCalled();
      });
    });

    it('should stop timer with spacebar when running', async () => {
      server.use(
        rest.get('/api/timer/status', (req, res, ctx) => {
          return res(
            ctx.json({
              success: true,
              data: mockRunningTimerState
            })
          );
        })
      );

      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        expect(screen.getByText('Stop Timer')).toBeInTheDocument();
      });

      await pressKey('{Space}');

      await waitFor(() => {
        expect(mockOnTimerUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state when starting timer', async () => {
      // Mock delayed response
      server.use(
        rest.post('/api/timer/start', (req, res, ctx) => {
          return res(
            ctx.delay(100),
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
        })
      );

      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      const customTaskInput = screen.getByLabelText('Enter Custom Task');
      await typeIntoInput(customTaskInput, 'Test Task');

      const startButton = screen.getByText('Start Timer');
      await clickButton(startButton);

      expect(screen.getByText('Starting...')).toBeInTheDocument();
    });

    it('should show loading state when stopping timer', async () => {
      server.use(
        rest.get('/api/timer/status', (req, res, ctx) => {
          return res(
            ctx.json({
              success: true,
              data: mockRunningTimerState
            })
          );
        }),
        rest.post('/api/timer/stop', (req, res, ctx) => {
          return res(
            ctx.delay(100),
            ctx.json({
              success: true,
              data: {
                entryId: 'test-entry-123',
                taskName: 'Test Task',
                duration: 30
              }
            })
          );
        })
      );

      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        const stopButton = screen.getByText('Stop Timer');
        expect(stopButton).toBeInTheDocument();
      });

      const stopButton = screen.getByText('Stop Timer');
      await clickButton(stopButton);

      expect(screen.getByText('Stopping...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      expect(screen.getByLabelText('Select a Task')).toBeInTheDocument();
      expect(screen.getByLabelText('Enter Custom Task')).toBeInTheDocument();
    });

    it('should have keyboard navigation support', async () => {
      render(<Timer onTimerUpdate={mockOnTimerUpdate} />);

      const customTaskInput = screen.getByLabelText('Enter Custom Task');
      customTaskInput.focus();
      
      expect(document.activeElement).toBe(customTaskInput);
    });
  });
});