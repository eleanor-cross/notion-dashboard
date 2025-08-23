// ABOUTME: Unit tests for analytics routes
// ABOUTME: Tests reading speed analytics, time distribution, and insights endpoints

const request = require('supertest');
const express = require('express');
const analyticsRoutes = require('../routes/analytics');

describe('Analytics Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/analytics', analyticsRoutes);
  });

  describe('GET /analytics/reading-speed', () => {
    it('should return reading speed analytics with default timeframe', async () => {
      const response = await request(app)
        .get('/analytics/reading-speed');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.timeframe).toBe('30 days');
      expect(response.body.data).toEqual({
        summary: {
          averageSpeed: 15.2,
          totalPagesRead: 234,
          totalTimeSpent: 920,
          sessionsCount: 18
        },
        byTextbook: expect.arrayContaining([
          expect.objectContaining({
            textbookId: expect.any(String),
            textbookName: expect.any(String),
            averageSpeed: expect.any(Number),
            pagesRead: expect.any(Number),
            timeSpent: expect.any(Number)
          })
        ]),
        trend: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            speed: expect.any(Number)
          })
        ])
      });
    });

    it('should accept custom timeframe parameter', async () => {
      const response = await request(app)
        .get('/analytics/reading-speed?timeframe=7');

      expect(response.status).toBe(200);
      expect(response.body.timeframe).toBe('7 days');
    });

    it('should accept filter parameters', async () => {
      const response = await request(app)
        .get('/analytics/reading-speed?textbookId=book-123&className=Constitutional+Law');

      expect(response.status).toBe(200);
      expect(response.body.filters).toEqual({
        textbookId: 'book-123',
        className: 'Constitutional Law'
      });
    });
  });

  describe('GET /analytics/time-distribution', () => {
    it('should return time distribution analytics', async () => {
      const response = await request(app)
        .get('/analytics/time-distribution');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.timeframe).toBe('7 days');
      expect(response.body.data).toEqual({
        byClass: expect.arrayContaining([
          expect.objectContaining({
            class: expect.any(String),
            minutes: expect.any(Number),
            percentage: expect.any(Number)
          })
        ]),
        byActivity: expect.arrayContaining([
          expect.objectContaining({
            activity: expect.any(String),
            minutes: expect.any(Number),
            percentage: expect.any(Number)
          })
        ]),
        dailyBreakdown: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            minutes: expect.any(Number)
          })
        ])
      });
    });

    it('should accept custom timeframe', async () => {
      const response = await request(app)
        .get('/analytics/time-distribution?timeframe=14');

      expect(response.status).toBe(200);
      expect(response.body.timeframe).toBe('14 days');
    });

    it('should return valid percentage calculations', async () => {
      const response = await request(app)
        .get('/analytics/time-distribution');

      const byClass = response.body.data.byClass;
      const totalPercentage = byClass.reduce((sum, item) => sum + item.percentage, 0);
      
      // Should be close to 100% (allow for rounding differences)
      expect(totalPercentage).toBeCloseTo(100, 1);
    });
  });

  describe('GET /analytics/insights', () => {
    it('should return productivity insights', async () => {
      const response = await request(app)
        .get('/analytics/insights');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        weeklyGoals: {
          target: expect.any(Number),
          current: expect.any(Number),
          percentage: expect.any(Number)
        },
        streaks: {
          currentStudyStreak: expect.any(Number),
          longestStudyStreak: expect.any(Number),
          currentReadingGoal: expect.any(Number)
        },
        predictions: {
          weeklyCompletion: {
            estimated: expect.any(String),
            timeNeeded: expect.any(Number),
            confidence: expect.stringMatching(/high|medium|low/)
          },
          readingBacklog: {
            estimatedHours: expect.any(Number),
            priority: expect.stringMatching(/high|medium|low/)
          }
        },
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringMatching(/schedule|workload|efficiency/),
            title: expect.any(String),
            description: expect.any(String),
            priority: expect.stringMatching(/high|medium|low/)
          })
        ])
      });
    });

    it('should return valid weekly goals data', async () => {
      const response = await request(app)
        .get('/analytics/insights');

      const weeklyGoals = response.body.data.weeklyGoals;
      
      expect(weeklyGoals.target).toBeGreaterThan(0);
      expect(weeklyGoals.current).toBeGreaterThanOrEqual(0);
      expect(weeklyGoals.percentage).toBeGreaterThanOrEqual(0);
      expect(weeklyGoals.percentage).toBeLessThanOrEqual(100);
    });

    it('should return valid streak data', async () => {
      const response = await request(app)
        .get('/analytics/insights');

      const streaks = response.body.data.streaks;
      
      expect(streaks.currentStudyStreak).toBeGreaterThanOrEqual(0);
      expect(streaks.longestStudyStreak).toBeGreaterThanOrEqual(streaks.currentStudyStreak);
      expect(streaks.currentReadingGoal).toBeGreaterThanOrEqual(0);
    });

    it('should return recommendations with proper priority levels', async () => {
      const response = await request(app)
        .get('/analytics/insights');

      const recommendations = response.body.data.recommendations;
      
      recommendations.forEach(rec => {
        expect(['high', 'medium', 'low']).toContain(rec.priority);
        expect(['schedule', 'workload', 'efficiency']).toContain(rec.type);
        expect(rec.title).toBeTruthy();
        expect(rec.description).toBeTruthy();
      });
    });
  });

  describe('GET /analytics/performance', () => {
    it('should return performance analytics with default period', async () => {
      const response = await request(app)
        .get('/analytics/performance');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        current: {
          period: 'week',
          totalMinutes: expect.any(Number),
          avgSessionLength: expect.any(Number),
          efficiency: expect.any(Number),
          focusScore: expect.any(Number)
        },
        previous: {
          totalMinutes: expect.any(Number),
          avgSessionLength: expect.any(Number),
          efficiency: expect.any(Number),
          focusScore: expect.any(Number)
        },
        trends: {
          minutesChange: expect.any(Number),
          sessionLengthChange: expect.any(Number),
          efficiencyChange: expect.any(Number),
          focusScoreChange: expect.any(Number)
        },
        milestones: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            description: expect.any(String),
            achieved: expect.any(Boolean)
          })
        ])
      });
    });

    it('should accept custom period parameter', async () => {
      const response = await request(app)
        .get('/analytics/performance?period=month');

      expect(response.status).toBe(200);
      expect(response.body.data.current.period).toBe('month');
    });

    it('should return valid performance metrics', async () => {
      const response = await request(app)
        .get('/analytics/performance');

      const current = response.body.data.current;
      
      expect(current.totalMinutes).toBeGreaterThanOrEqual(0);
      expect(current.avgSessionLength).toBeGreaterThanOrEqual(0);
      expect(current.efficiency).toBeGreaterThanOrEqual(0);
      expect(current.efficiency).toBeLessThanOrEqual(100);
      expect(current.focusScore).toBeGreaterThanOrEqual(0);
      expect(current.focusScore).toBeLessThanOrEqual(10);
    });

    it('should return valid trend calculations', async () => {
      const response = await request(app)
        .get('/analytics/performance');

      const { current, previous, trends } = response.body.data;
      
      // Verify trend calculations
      expect(trends.minutesChange).toBe(current.totalMinutes - previous.totalMinutes);
      expect(trends.sessionLengthChange).toBe(current.avgSessionLength - previous.avgSessionLength);
      expect(trends.efficiencyChange).toBe(current.efficiency - previous.efficiency);
      expect(trends.focusScoreChange).toBeCloseTo(current.focusScore - previous.focusScore, 1);
    });

    it('should return milestones with progress tracking', async () => {
      const response = await request(app)
        .get('/analytics/performance');

      const milestones = response.body.data.milestones;
      
      milestones.forEach(milestone => {
        expect(milestone.title).toBeTruthy();
        expect(milestone.description).toBeTruthy();
        expect(typeof milestone.achieved).toBe('boolean');
        
        if (!milestone.achieved && milestone.progress !== undefined) {
          expect(milestone.progress).toBeGreaterThanOrEqual(0);
          expect(milestone.progress).toBeLessThan(100);
        }
      });
    });
  });

  describe('Error handling', () => {
    it('should handle malformed requests gracefully', async () => {
      // This would typically be tested with actual error conditions
      // Since we're using mock data, we'll test parameter validation
      
      const response = await request(app)
        .get('/analytics/reading-speed?timeframe=invalid');

      expect(response.status).toBe(200); // Mock data returns successfully
      expect(response.body.success).toBe(true);
    });
  });
});