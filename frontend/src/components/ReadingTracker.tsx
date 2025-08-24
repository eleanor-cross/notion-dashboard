// ABOUTME: Reading tracker component for logging textbook reading sessions
// ABOUTME: Calculates reading speed and creates Notion reading session entries

import React, { useState, useEffect } from 'react';
import { Textbook } from '../types/index.ts';
import { readingApi, textbooksApi } from '../services/api.ts';
import { formatMinutes, calculateReadingSpeed, estimateReadingTime } from '../utils/time.ts';
import { BookOpenIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export const ReadingTracker: React.FC = () => {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [selectedTextbookId, setSelectedTextbookId] = useState<string>('');
  const [customTextbook, setCustomTextbook] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [pagesRead, setPagesRead] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchTextbooks();
  }, []);

  const fetchTextbooks = async () => {
    try {
      const books = await textbooksApi.getAll();
      setTextbooks(books);
    } catch (err) {
      console.error('Failed to fetch textbooks:', err);
    }
  };

  const selectedTextbook = textbooks.find(t => t.id === selectedTextbookId);

  const startReading = () => {
    if (!selectedTextbookId && !customTextbook.trim()) {
      setError('Please select a textbook or enter a custom textbook name');
      return;
    }

    setStartTime(new Date());
    setIsReading(true);
    setError('');
    setSuccess('');
  };

  const stopReading = async () => {
    if (!startTime) return;

    if (!pagesRead.trim() || isNaN(Number(pagesRead)) || Number(pagesRead) <= 0) {
      setError('Please enter a valid number of pages read');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      const pages = Number(pagesRead);
      
      const textbookName = selectedTextbook?.title || customTextbook.trim();
      const speed = calculateReadingSpeed(pages, duration);

      await readingApi.createSession({
        textbookId: selectedTextbookId || undefined,
        textbookName,
        className: className || selectedTextbook?.class || undefined,
        pagesRead: pages,
        duration
      });

      setSuccess(`Reading session logged! You read ${pages} pages at ${speed} pages/hour.`);
      
      // Reset form
      setPagesRead('');
      setIsReading(false);
      setStartTime(null);
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log reading session');
    } finally {
      setLoading(false);
    }
  };

  const cancelReading = () => {
    setIsReading(false);
    setStartTime(null);
    setPagesRead('');
    setError('');
  };

  const getReadingDuration = () => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime.getTime()) / 1000);
  };

  const formatReadingTime = () => {
    const seconds = getReadingDuration();
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEstimatedTime = (pages: number) => {
    if (!selectedTextbook?.avgReadingSpeed || pages <= 0) return null;
    return estimateReadingTime(pages, selectedTextbook.avgReadingSpeed);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <BookOpenIcon className="h-6 w-6 text-green-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Reading Tracker</h2>
      </div>

      {/* Reading Timer Display */}
      {isReading && startTime && (
        <div className="text-center mb-6 p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-mono font-bold text-green-600 mb-2">
            {formatReadingTime()}
          </div>
          <div className="text-lg text-gray-700 mb-1">
            {selectedTextbook?.title || customTextbook}
          </div>
          <div className="text-sm text-gray-500">
            Reading since {startTime.toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Textbook Selection */}
      {!isReading && (
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="textbook-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Textbook
            </label>
            <select
              id="textbook-select"
              value={selectedTextbookId}
              onChange={(e) => {
                setSelectedTextbookId(e.target.value);
                if (e.target.value) {
                  setCustomTextbook('');
                  const book = textbooks.find(t => t.id === e.target.value);
                  setClassName(book?.class || '');
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select from your textbooks...</option>
              {textbooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} {book.class && `(${book.class})`}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center text-gray-500 text-sm">or</div>

          <div>
            <label htmlFor="custom-textbook" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Custom Textbook
            </label>
            <input
              id="custom-textbook"
              type="text"
              value={customTextbook}
              onChange={(e) => {
                setCustomTextbook(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedTextbookId('');
                }
              }}
              placeholder="e.g., Constitutional Law: Principles and Policies"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Class Input for Custom Textbook */}
          {customTextbook && (
            <div>
              <label htmlFor="class-name" className="block text-sm font-medium text-gray-700 mb-2">
                Class Name (Optional)
              </label>
              <input
                id="class-name"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., Constitutional Law"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          )}

          {/* Textbook Stats */}
          {selectedTextbook && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center text-sm text-gray-600">
                <ChartBarIcon className="h-4 w-4 mr-1" />
                <span>Average Speed: {selectedTextbook.avgReadingSpeed || 'Unknown'} pages/hour</span>
              </div>
              {selectedTextbook.totalPages && (
                <div className="text-sm text-gray-600 mt-1">
                  Total Pages: {selectedTextbook.totalPages}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pages Read Input (shown when reading is active) */}
      {isReading && (
        <div className="mb-6">
          <label htmlFor="pages-read" className="block text-sm font-medium text-gray-700 mb-2">
            Pages Read
          </label>
          <input
            id="pages-read"
            type="number"
            min="1"
            value={pagesRead}
            onChange={(e) => setPagesRead(e.target.value)}
            placeholder="Enter number of pages"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          
          {/* Estimated Time Display */}
          {pagesRead && selectedTextbook?.avgReadingSpeed && (
            <div className="mt-2 text-sm text-gray-600">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Estimated time: {formatMinutes(getEstimatedTime(Number(pagesRead)) || 0)}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!isReading ? (
          <button
            onClick={startReading}
            disabled={!selectedTextbookId && !customTextbook.trim()}
            className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <BookOpenIcon className="h-5 w-5 mr-2" />
            Start Reading
          </button>
        ) : (
          <>
            <button
              onClick={cancelReading}
              className="flex items-center px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={stopReading}
              disabled={loading || !pagesRead.trim()}
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              {loading ? 'Logging...' : 'Log Session'}
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Track your reading sessions to see speed improvements and accurate time estimates
      </div>
    </div>
  );
};