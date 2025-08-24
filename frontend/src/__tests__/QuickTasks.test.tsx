// ABOUTME: Unit tests for QuickTasks component
// ABOUTME: Tests quick task buttons, session stats, and timer integration

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render, mockTimerState, mockRunningTimerState, clickButton } from '../test-utils/test-utils';
import { QuickTasks } from '../components/QuickTasks';
import { server } from '../setupTests';
import { rest } from 'msw';

const mockOnTimerUpdate = jest.fn();

describe('QuickTasks Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear session storage
    window.sessionStorage.clear();
  });

  describe('Initial Render', () => {
    it('should render quick tasks grid', async () => {
      render(<QuickTasks timerState={mockTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      expect(screen.getByText('Quick Tasks')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Check Email')).toBeInTheDocument();
        expect(screen.getByText('Case Brief')).toBeInTheDocument();
        expect(screen.getByText('Outline Review')).toBeInTheDocument();
      });
    });

    it('should show task categories', async () => {
      render(<QuickTasks timerState={mockTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        expect(screen.getByText('Administrative')).toBeInTheDocument();
        expect(screen.getByText('Reading')).toBeInTheDocument();
        expect(screen.getByText('Study')).toBeInTheDocument();
      });
    });

    it('should display instructions', () => {
      render(<QuickTasks timerState={mockTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      expect(screen.getByText('Click any task to start a quick timer. Perfect for tracking routine activities.')).toBeInTheDocument();
    });
  });

  describe('Task Interactions', () => {
    it('should start quick task successfully', async () => {
      render(<QuickTasks timerState={mockTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        const emailButton = screen.getByText('Check Email');
        expect(emailButton).toBeInTheDocument();
      });

      const emailButton = screen.getByText('Check Email');
      await clickButton(emailButton);

      await waitFor(() => {
        expect(mockOnTimerUpdate).toHaveBeenCalled();
      });
    });

    it('should show error when timer is already running', async () => {
      render(<QuickTasks timerState={mockRunningTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        const emailButton = screen.getByText('Check Email');
        expect(emailButton).toBeInTheDocument();
      });

      const emailButton = screen.getByText('Check Email');
      await clickButton(emailButton);

      await waitFor(() => {
        expect(screen.getByText('Please stop the current timer before starting a new task')).toBeInTheDocument();
      });
    });

    it('should handle API errors', async () => {
      server.use(
        rest.post('/api/timer/quick-start', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              error: 'Server error'
            })
          );
        })
      );

      render(<QuickTasks timerState={mockTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        const emailButton = screen.getByText('Check Email');
        expect(emailButton).toBeInTheDocument();
      });

      const emailButton = screen.getByText('Check Email');
      await clickButton(emailButton);

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });
  });

  describe('Running Timer Display', () => {
    const quickTaskTimerState = {
      isRunning: true,
      timer: {
        entryId: 'test-entry-123',
        taskName: 'Check Email',
        taskType: 'quick' as const,
        startTime: new Date().toISOString(),
        currentDuration: 600, // 10 minutes
        durationMinutes: 10
      }
    };

    it('should display running quick task', () => {
      render(<QuickTasks timerState={quickTaskTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      expect(screen.getByText('Check Email')).toBeInTheDocument();
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });

    it('should highlight active task button', async () => {
      render(<QuickTasks timerState={quickTaskTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        const emailButton = screen.getByText('Check Email').closest('button');
        expect(emailButton).toHaveClass('border-green-500', 'bg-green-50');
      });
    });

    it('should disable other tasks when one is running', async () => {
      render(<QuickTasks timerState={quickTaskTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        const briefButton = screen.getByText('Case Brief').closest('button');
        expect(briefButton).toHaveClass('opacity-50', 'cursor-not-allowed');
      });
    });

    it('should stop quick task timer', async () => {
      render(<QuickTasks timerState={quickTaskTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      const stopButton = screen.getByText('Stop');
      await clickButton(stopButton);

      await waitFor(() => {
        expect(mockOnTimerUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('Session Statistics', () => {
    beforeEach(() => {
      // Mock session storage with stats
      const mockStats = {
        'Check Email': 45,
        'Case Brief': 120,
        'Outline Review': 90
      };
      window.sessionStorage.setItem('quickTaskStats', JSON.stringify(mockStats));
    });

    it('should display session summary when stats exist', () => {
      render(<QuickTasks timerState={mockTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      expect(screen.getByText('Today\'s Session Summary')).toBeInTheDocument();
      expect(screen.getByText('Total: 255 minutes')).toBeInTheDocument();
    });

    it('should show individual task stats on buttons', async () => {
      render(<QuickTasks timerState={mockTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        expect(screen.getByText('45m today')).toBeInTheDocument();
        expect(screen.getByText('120m today')).toBeInTheDocument();
        expect(screen.getByText('90m today')).toBeInTheDocument();
      });
    });

    it('should update stats after stopping timer', async () => {
      const quickTaskTimerState = {
        isRunning: true,
        timer: {
          entryId: 'test-entry-123',
          taskName: 'Check Email',
          taskType: 'quick' as const,
          startTime: new Date().toISOString(),
          currentDuration: 1800,
          durationMinutes: 30
        }
      };

      server.use(
        rest.post('/api/timer/stop', (req, res, ctx) => {
          return res(
            ctx.json({
              success: true,
              data: {
                entryId: 'test-entry-123',
                taskName: 'Check Email',
                duration: 30 // 30 minutes
              }
            })
          );
        })
      );

      render(<QuickTasks timerState={quickTaskTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      const stopButton = screen.getByText('Stop');
      await clickButton(stopButton);

      await waitFor(() => {
        expect(mockOnTimerUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state for starting task', async () => {
      server.use(
        rest.post('/api/timer/quick-start', (req, res, ctx) => {
          return res(
            ctx.delay(100),
            ctx.json({
              success: true,
              data: {
                entryId: 'test-entry-123',
                taskName: 'Check Email'
              }
            })
          );
        })
      );

      render(<QuickTasks timerState={mockTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        const emailButton = screen.getByText('Check Email');
        expect(emailButton).toBeInTheDocument();
      });

      const emailButton = screen.getByText('Check Email');
      await clickButton(emailButton);

      expect(screen.getByText('Starting...')).toBeInTheDocument();
    });

    it('should show loading state for stopping task', async () => {
      const quickTaskTimerState = {
        isRunning: true,
        timer: {
          entryId: 'test-entry-123',
          taskName: 'Check Email',
          taskType: 'quick' as const,
          startTime: new Date().toISOString(),
          currentDuration: 600,
          durationMinutes: 10
        }
      };

      server.use(
        rest.post('/api/timer/stop', (req, res, ctx) => {
          return res(
            ctx.delay(100),
            ctx.json({
              success: true,
              data: {
                entryId: 'test-entry-123',
                taskName: 'Check Email',
                duration: 10
              }
            })
          );
        })
      );

      render(<QuickTasks timerState={quickTaskTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      const stopButton = screen.getByText('Stop');
      await clickButton(stopButton);

      expect(screen.getByText('Stopping...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle failed API request for quick tasks', async () => {
      server.use(
        rest.get('/api/timer/quick-tasks', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              error: 'Failed to load quick tasks'
            })
          );
        })
      );

      render(<QuickTasks timerState={mockTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load quick tasks')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles and labels', async () => {
      render(<QuickTasks timerState={mockTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
        
        buttons.forEach(button => {
          expect(button).toHaveAttribute('type', 'button');
        });
      });
    });

    it('should be keyboard navigable', async () => {
      render(<QuickTasks timerState={mockTimerState} onTimerUpdate={mockOnTimerUpdate} />);

      await waitFor(() => {
        const emailButton = screen.getByText('Check Email').closest('button');
        emailButton?.focus();
        expect(document.activeElement).toBe(emailButton);
      });
    });
  });
});