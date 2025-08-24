// ABOUTME: Unit tests for ReadingTracker component
// ABOUTME: Tests reading session logging, textbook selection, and speed calculations

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render, mockTextbooks, clickButton, typeIntoInput } from '../test-utils/test-utils';
import { ReadingTracker } from '../components/ReadingTracker';
import { server } from '../setupTests';
import { rest } from 'msw';

describe('ReadingTracker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render reading tracker interface', async () => {
      render(<ReadingTracker />);

      expect(screen.getByText('Reading Tracker')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Textbook')).toBeInTheDocument();
      expect(screen.getByLabelText('Enter Custom Textbook')).toBeInTheDocument();
      expect(screen.getByText('Start Reading')).toBeInTheDocument();
    });

    it('should load textbooks on mount', async () => {
      render(<ReadingTracker />);

      await waitFor(() => {
        expect(screen.getByText('Constitutional Law: Principles and Policies (Constitutional Law)')).toBeInTheDocument();
      });
    });

    it('should show instructions', () => {
      render(<ReadingTracker />);

      expect(screen.getByText('Track your reading sessions to see speed improvements and accurate time estimates')).toBeInTheDocument();
    });
  });

  describe('Textbook Selection', () => {
    it('should enable start button when textbook is selected', async () => {
      render(<ReadingTracker />);

      const textbookSelect = screen.getByLabelText('Select Textbook');
      await clickButton(textbookSelect);

      await waitFor(() => {
        const textbookOption = screen.getByText('Constitutional Law: Principles and Policies (Constitutional Law)');
        clickButton(textbookOption);
      });

      const startButton = screen.getByText('Start Reading');
      expect(startButton).not.toBeDisabled();
    });

    it('should enable start button when custom textbook is entered', async () => {
      render(<ReadingTracker />);

      const customTextbookInput = screen.getByLabelText('Enter Custom Textbook');
      await typeIntoInput(customTextbookInput, 'Custom Law Book');

      const startButton = screen.getByText('Start Reading');
      expect(startButton).not.toBeDisabled();
    });

    it('should show textbook stats when selected', async () => {
      render(<ReadingTracker />);

      const textbookSelect = screen.getByLabelText('Select Textbook');
      await clickButton(textbookSelect);

      await waitFor(() => {
        const textbookOption = screen.getByText('Constitutional Law: Principles and Policies (Constitutional Law)');
        clickButton(textbookOption);
      });

      await waitFor(() => {
        expect(screen.getByText('Average Speed: 15 pages/hour')).toBeInTheDocument();
        expect(screen.getByText('Total Pages: 800')).toBeInTheDocument();
      });
    });

    it('should clear custom textbook when selecting from dropdown', async () => {
      render(<ReadingTracker />);

      const customTextbookInput = screen.getByLabelText('Enter Custom Textbook');
      await typeIntoInput(customTextbookInput, 'Custom Book');

      const textbookSelect = screen.getByLabelText('Select Textbook');
      await clickButton(textbookSelect);

      await waitFor(() => {
        const textbookOption = screen.getByText('Constitutional Law: Principles and Policies (Constitutional Law)');
        clickButton(textbookOption);
      });

      expect(customTextbookInput).toHaveValue('');
    });

    it('should show class input for custom textbook', async () => {
      render(<ReadingTracker />);

      const customTextbookInput = screen.getByLabelText('Enter Custom Textbook');
      await typeIntoInput(customTextbookInput, 'Custom Law Book');

      await waitFor(() => {
        expect(screen.getByLabelText('Class Name (Optional)')).toBeInTheDocument();
      });
    });
  });

  describe('Reading Session', () => {
    it('should start reading session', async () => {
      render(<ReadingTracker />);

      const customTextbookInput = screen.getByLabelText('Enter Custom Textbook');
      await typeIntoInput(customTextbookInput, 'Test Textbook');

      const startButton = screen.getByText('Start Reading');
      await clickButton(startButton);

      await waitFor(() => {
        expect(screen.getByText('Test Textbook')).toBeInTheDocument();
        expect(screen.getByText(/Reading since/)).toBeInTheDocument();
        expect(screen.getByLabelText('Pages Read')).toBeInTheDocument();
      });
    });

    it('should show timer during reading session', async () => {
      render(<ReadingTracker />);

      const customTextbookInput = screen.getByLabelText('Enter Custom Textbook');
      await typeIntoInput(customTextbookInput, 'Test Textbook');

      const startButton = screen.getByText('Start Reading');
      await clickButton(startButton);

      await waitFor(() => {
        const timerDisplay = screen.getByText(/^\d+:\d{2}$/);
        expect(timerDisplay).toBeInTheDocument();
      });
    });

    it('should show estimated time for selected textbook', async () => {
      render(<ReadingTracker />);

      const textbookSelect = screen.getByLabelText('Select Textbook');
      await clickButton(textbookSelect);

      await waitFor(() => {
        const textbookOption = screen.getByText('Constitutional Law: Principles and Policies (Constitutional Law)');
        clickButton(textbookOption);
      });

      const startButton = screen.getByText('Start Reading');
      await clickButton(startButton);

      const pagesInput = screen.getByLabelText('Pages Read');
      await typeIntoInput(pagesInput, '10');

      await waitFor(() => {
        expect(screen.getByText(/Estimated time:/)).toBeInTheDocument();
      });
    });

    it('should cancel reading session', async () => {
      render(<ReadingTracker />);

      const customTextbookInput = screen.getByLabelText('Enter Custom Textbook');
      await typeIntoInput(customTextbookInput, 'Test Textbook');

      const startButton = screen.getByText('Start Reading');
      await clickButton(startButton);

      const cancelButton = screen.getByText('Cancel');
      await clickButton(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Start Reading')).toBeInTheDocument();
        expect(screen.queryByText('Test Textbook')).not.toBeInTheDocument();
      });
    });
  });

  describe('Logging Reading Session', () => {
    beforeEach(async () => {
      render(<ReadingTracker />);

      const customTextbookInput = screen.getByLabelText('Enter Custom Textbook');
      await typeIntoInput(customTextbookInput, 'Test Textbook');

      const startButton = screen.getByText('Start Reading');
      await clickButton(startButton);
    });

    it('should require pages read to log session', async () => {
      const logButton = screen.getByText('Log Session');
      await clickButton(logButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid number of pages read')).toBeInTheDocument();
      });
    });

    it('should log reading session successfully', async () => {
      const pagesInput = screen.getByLabelText('Pages Read');
      await typeIntoInput(pagesInput, '15');

      const logButton = screen.getByText('Log Session');
      await clickButton(logButton);

      await waitFor(() => {
        expect(screen.getByText(/Reading session logged!/)).toBeInTheDocument();
        expect(screen.getByText(/You read 15 pages at/)).toBeInTheDocument();
      });
    });

    it('should reset form after successful logging', async () => {
      const pagesInput = screen.getByLabelText('Pages Read');
      await typeIntoInput(pagesInput, '15');

      const logButton = screen.getByText('Log Session');
      await clickButton(logButton);

      await waitFor(() => {
        expect(screen.getByText('Start Reading')).toBeInTheDocument();
        expect(pagesInput).toHaveValue('');
      });
    });

    it('should handle API errors when logging', async () => {
      server.use(
        rest.post('/api/notion/reading-session', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              error: 'Failed to create reading session entry'
            })
          );
        })
      );

      const pagesInput = screen.getByLabelText('Pages Read');
      await typeIntoInput(pagesInput, '15');

      const logButton = screen.getByText('Log Session');
      await clickButton(logButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create reading session entry')).toBeInTheDocument();
      });
    });

    it('should validate pages read input', async () => {
      const pagesInput = screen.getByLabelText('Pages Read');
      
      // Test invalid input
      await typeIntoInput(pagesInput, 'abc');
      const logButton = screen.getByText('Log Session');
      await clickButton(logButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid number of pages read')).toBeInTheDocument();
      });

      // Test zero pages
      await typeIntoInput(pagesInput, '0');
      await clickButton(logButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid number of pages read')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state when logging session', async () => {
      server.use(
        rest.post('/api/notion/reading-session', (req, res, ctx) => {
          return res(
            ctx.delay(100),
            ctx.json({
              success: true,
              data: {
                id: 'session-123',
                readingSpeed: 15
              }
            })
          );
        })
      );

      render(<ReadingTracker />);

      const customTextbookInput = screen.getByLabelText('Enter Custom Textbook');
      await typeIntoInput(customTextbookInput, 'Test Textbook');

      const startButton = screen.getByText('Start Reading');
      await clickButton(startButton);

      const pagesInput = screen.getByLabelText('Pages Read');
      await typeIntoInput(pagesInput, '15');

      const logButton = screen.getByText('Log Session');
      await clickButton(logButton);

      expect(screen.getByText('Logging...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error when no textbook is selected', async () => {
      render(<ReadingTracker />);

      const startButton = screen.getByText('Start Reading');
      await clickButton(startButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a textbook or enter a custom textbook name')).toBeInTheDocument();
      });
    });

    it('should handle textbook loading errors gracefully', async () => {
      server.use(
        rest.get('/api/notion/textbooks', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              error: 'Failed to fetch textbooks'
            })
          );
        })
      );

      // Component should still render even if textbooks fail to load
      render(<ReadingTracker />);

      expect(screen.getByText('Reading Tracker')).toBeInTheDocument();
      expect(screen.getByLabelText('Enter Custom Textbook')).toBeInTheDocument();
    });
  });

  describe('Success Message Auto-Clear', () => {
    it('should clear success message after 5 seconds', async () => {
      jest.useFakeTimers();

      render(<ReadingTracker />);

      const customTextbookInput = screen.getByLabelText('Enter Custom Textbook');
      await typeIntoInput(customTextbookInput, 'Test Textbook');

      const startButton = screen.getByText('Start Reading');
      await clickButton(startButton);

      const pagesInput = screen.getByLabelText('Pages Read');
      await typeIntoInput(pagesInput, '15');

      const logButton = screen.getByText('Log Session');
      await clickButton(logButton);

      await waitFor(() => {
        expect(screen.getByText(/Reading session logged!/)).toBeInTheDocument();
      });

      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.queryByText(/Reading session logged!/)).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<ReadingTracker />);

      expect(screen.getByLabelText('Select Textbook')).toBeInTheDocument();
      expect(screen.getByLabelText('Enter Custom Textbook')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      render(<ReadingTracker />);

      const customTextbookInput = screen.getByLabelText('Enter Custom Textbook');
      customTextbookInput.focus();
      
      expect(document.activeElement).toBe(customTextbookInput);
    });
  });
});