// ABOUTME: Unit tests for time utility functions
// ABOUTME: Tests duration formatting, calculations, and date utilities

import {
  formatDuration,
  formatMinutes,
  minutesToHours,
  hoursToMinutes,
  calculateReadingSpeed,
  estimateReadingTime,
  formatDate,
  formatTime,
  isToday,
  daysFromNow
} from '../utils/time';

describe('Time Utilities', () => {
  describe('formatDuration', () => {
    it('should format seconds to MM:SS when under 1 hour', () => {
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(30)).toBe('00:30');
      expect(formatDuration(90)).toBe('01:30');
      expect(formatDuration(600)).toBe('10:00');
      expect(formatDuration(3599)).toBe('59:59');
    });

    it('should format seconds to HH:MM:SS when 1 hour or more', () => {
      expect(formatDuration(3600)).toBe('01:00:00');
      expect(formatDuration(3661)).toBe('01:01:01');
      expect(formatDuration(7200)).toBe('02:00:00');
      expect(formatDuration(7321)).toBe('02:02:01');
      expect(formatDuration(36000)).toBe('10:00:00');
    });

    it('should handle edge cases', () => {
      expect(formatDuration(3600 * 24)).toBe('24:00:00'); // 24 hours
      expect(formatDuration(3600 * 25 + 61)).toBe('25:01:01'); // Over 24 hours
    });
  });

  describe('formatMinutes', () => {
    it('should format minutes when under 1 hour', () => {
      expect(formatMinutes(0)).toBe('0m');
      expect(formatMinutes(30)).toBe('30m');
      expect(formatMinutes(59)).toBe('59m');
    });

    it('should format hours when 60 minutes or more', () => {
      expect(formatMinutes(60)).toBe('1h');
      expect(formatMinutes(120)).toBe('2h');
      expect(formatMinutes(90)).toBe('1h 30m');
      expect(formatMinutes(150)).toBe('2h 30m');
      expect(formatMinutes(61)).toBe('1h 1m');
    });

    it('should handle large values', () => {
      expect(formatMinutes(1440)).toBe('24h'); // 24 hours
      expect(formatMinutes(1500)).toBe('25h'); // 25 hours
      expect(formatMinutes(1470)).toBe('24h 30m'); // 24.5 hours
    });
  });

  describe('minutesToHours', () => {
    it('should convert minutes to hours with 2 decimal places', () => {
      expect(minutesToHours(60)).toBe(1);
      expect(minutesToHours(90)).toBe(1.5);
      expect(minutesToHours(45)).toBe(0.75);
      expect(minutesToHours(30)).toBe(0.5);
      expect(minutesToHours(0)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(minutesToHours(50)).toBe(0.83); // 50/60 = 0.8333...
      expect(minutesToHours(33)).toBe(0.55); // 33/60 = 0.55
      expect(minutesToHours(37)).toBe(0.62); // 37/60 = 0.6166...
    });
  });

  describe('hoursToMinutes', () => {
    it('should convert hours to minutes', () => {
      expect(hoursToMinutes(1)).toBe(60);
      expect(hoursToMinutes(2.5)).toBe(150);
      expect(hoursToMinutes(0.5)).toBe(30);
      expect(hoursToMinutes(0)).toBe(0);
    });

    it('should round to nearest minute', () => {
      expect(hoursToMinutes(1.5167)).toBe(91); // 1.5167 * 60 = 91.002
      expect(hoursToMinutes(0.8333)).toBe(50); // 0.8333 * 60 = 49.998
    });
  });

  describe('calculateReadingSpeed', () => {
    it('should calculate pages per hour correctly', () => {
      const oneHour = 1000 * 60 * 60; // 1 hour in milliseconds
      expect(calculateReadingSpeed(15, oneHour)).toBe(15);
      expect(calculateReadingSpeed(30, oneHour * 2)).toBe(15);
      expect(calculateReadingSpeed(10, oneHour / 2)).toBe(20); // 30 minutes
    });

    it('should round to 2 decimal places', () => {
      const oneHour = 1000 * 60 * 60;
      expect(calculateReadingSpeed(10, oneHour * 0.6)).toBe(16.67); // 10 pages in 36 minutes
      expect(calculateReadingSpeed(7, oneHour * 0.5)).toBe(14); // 7 pages in 30 minutes
    });

    it('should handle edge cases', () => {
      const oneHour = 1000 * 60 * 60;
      expect(calculateReadingSpeed(0, oneHour)).toBe(0);
      expect(calculateReadingSpeed(1, oneHour / 60)).toBe(60); // 1 page in 1 minute
    });
  });

  describe('estimateReadingTime', () => {
    it('should estimate reading time in minutes', () => {
      expect(estimateReadingTime(15, 15)).toBe(60); // 15 pages at 15 pages/hour = 1 hour
      expect(estimateReadingTime(30, 15)).toBe(120); // 30 pages at 15 pages/hour = 2 hours
      expect(estimateReadingTime(7.5, 15)).toBe(30); // 7.5 pages at 15 pages/hour = 30 minutes
    });

    it('should round to nearest minute', () => {
      expect(estimateReadingTime(10, 15)).toBe(40); // 10/15 * 60 = 40 minutes
      expect(estimateReadingTime(5, 12)).toBe(25); // 5/12 * 60 = 25 minutes
    });

    it('should handle edge cases', () => {
      expect(estimateReadingTime(0, 15)).toBe(0);
      expect(estimateReadingTime(1, 60)).toBe(1); // 1 page at 60 pages/hour = 1 minute
    });
  });

  describe('formatDate', () => {
    it('should format date strings correctly', () => {
      // Use more flexible assertions for cross-timezone compatibility
      expect(formatDate('2024-01-15')).toMatch(/Jan 1[45], 2024/);
      expect(formatDate('2024-12-31')).toMatch(/Dec 3[01], 2024/);
      expect(formatDate('2024-07-04')).toMatch(/Jul [34], 2024/);
    });

    it('should handle ISO datetime strings', () => {
      expect(formatDate('2024-01-15T10:30:00Z')).toBe('Jan 15, 2024');
      expect(formatDate('2024-06-01T14:45:30.123Z')).toBe('Jun 1, 2024');
    });
  });

  describe('formatTime', () => {
    it('should format time strings correctly', () => {
      // Use more flexible patterns for cross-timezone compatibility
      expect(formatTime('2024-01-15T10:30:00Z')).toMatch(/\d{1,2}:\d{2}\s?(AM|PM|am|pm)/);
      expect(formatTime('2024-01-15T14:45:00Z')).toMatch(/\d{1,2}:\d{2}\s?(AM|PM|am|pm)/);
      expect(formatTime('2024-01-15T00:00:00Z')).toMatch(/\d{1,2}:\d{2}\s?(AM|PM|am|pm)/);
      expect(formatTime('2024-01-15T12:00:00Z')).toMatch(/\d{1,2}:\d{2}\s?(AM|PM|am|pm)/);
    });

    it('should handle different time zones gracefully', () => {
      const timeString = '2024-01-15T15:30:00Z';
      const formatted = formatTime(timeString);
      expect(formatted).toMatch(/\d{1,2}:\d{2}\s?(AM|PM|am|pm)/);
    });
  });

  describe('isToday', () => {
    beforeEach(() => {
      // Use fake timers with a consistent date
      jest.useFakeTimers();
      // Set to January 15, 2024 at noon local time
      jest.setSystemTime(new Date(2024, 0, 15, 12, 0, 0));
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for today\'s date', () => {
      // Use local timezone format that matches the mock
      expect(isToday('2024-01-15T12:00:00')).toBe(true);
      expect(isToday('2024-01-15T10:30:00')).toBe(true);
    });

    it('should return false for other dates', () => {
      expect(isToday('2024-01-14T12:00:00')).toBe(false);
      expect(isToday('2024-01-16T12:00:00')).toBe(false);
      expect(isToday('2023-01-15T12:00:00')).toBe(false);
      expect(isToday('2025-01-15T12:00:00')).toBe(false);
    });
  });

  describe('daysFromNow', () => {
    beforeEach(() => {
      // Mock Date to ensure consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return 0 for today', () => {
      expect(daysFromNow('2024-01-15')).toBe(0);
    });

    it('should return positive numbers for future dates', () => {
      expect(daysFromNow('2024-01-16')).toBe(1);
      expect(daysFromNow('2024-01-22')).toBe(7);
    });

    it('should return negative numbers for past dates', () => {
      expect(daysFromNow('2024-01-14')).toBe(-1);
    });

    it('should handle different date formats', () => {
      expect(daysFromNow('2024-01-16T10:30:00Z')).toBe(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle negative values gracefully', () => {
      // Test graceful handling of negative inputs
      expect(formatDuration(-1)).toBe('00:00'); // Returns zero duration for negative input
      expect(formatDuration(-100)).toBe('00:00'); // Returns zero duration for negative input
      expect(formatMinutes(-30)).toBe('30m'); // Uses absolute value
      expect(calculateReadingSpeed(-5, 3600000)).toBe(0); // Returns 0 for negative pages
      expect(calculateReadingSpeed(5, -3600000)).toBe(0); // Returns 0 for negative duration
    });

    it('should handle very large values', () => {
      expect(formatDuration(999999)).toBe('277:46:39'); // ~278 hours
      expect(formatMinutes(100000)).toBe('1666h 40m');
    });

    it('should handle division by zero', () => {
      expect(calculateReadingSpeed(10, 0)).toBe(0); // Returns 0 for zero duration
      expect(estimateReadingTime(10, 0)).toBe(Infinity); // estimateReadingTime still returns Infinity
    });
  });
});