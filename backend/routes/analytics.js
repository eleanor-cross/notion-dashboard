// ABOUTME: Express routes for analytics and data visualization
// ABOUTME: Provides reading speed analytics, time distribution, and performance insights

const express = require('express');
const router = express.Router();
const notionService = require('../services/notionClient');

// Get reading speed analytics
router.get('/reading-speed', async (req, res) => {
  try {
    const { timeframe = '30', textbookId, className } = req.query;
    
    // This would ideally query a dedicated reading sessions database
    // For now, we'll return mock data structure that matches the expected format
    const analyticsData = {
      summary: {
        averageSpeed: 15.2,
        totalPagesRead: 234,
        totalTimeSpent: 920, // minutes
        sessionsCount: 18
      },
      byTextbook: [
        {
          textbookId: 'mock-1',
          textbookName: 'Constitutional Law',
          averageSpeed: 12.3,
          pagesRead: 89,
          timeSpent: 434
        },
        {
          textbookId: 'mock-2', 
          textbookName: 'Contracts',
          averageSpeed: 18.1,
          pagesRead: 145,
          timeSpent: 486
        }
      ],
      trend: [
        { date: '2024-01-01', speed: 14.2 },
        { date: '2024-01-02', speed: 15.8 },
        { date: '2024-01-03', speed: 16.1 },
        { date: '2024-01-04', speed: 15.3 },
        { date: '2024-01-05', speed: 17.2 }
      ]
    };

    res.json({
      success: true,
      data: analyticsData,
      timeframe: `${timeframe} days`,
      filters: { textbookId, className }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get time distribution analytics
router.get('/time-distribution', async (req, res) => {
  try {
    const { timeframe = '7' } = req.query;

    const distributionData = {
      byClass: [
        { class: 'Constitutional Law', minutes: 340, percentage: 28.5 },
        { class: 'Contracts', minutes: 285, percentage: 23.9 },
        { class: 'Torts', minutes: 245, percentage: 20.5 },
        { class: 'Criminal Law', minutes: 195, percentage: 16.3 },
        { class: 'Administrative', minutes: 130, percentage: 10.8 }
      ],
      byActivity: [
        { activity: 'Reading', minutes: 650, percentage: 54.2 },
        { activity: 'Case Brief', minutes: 280, percentage: 23.3 },
        { activity: 'Outline Review', minutes: 150, percentage: 12.5 },
        { activity: 'Research', minutes: 75, percentage: 6.3 },
        { activity: 'Check Email', minutes: 45, percentage: 3.7 }
      ],
      dailyBreakdown: [
        { date: '2024-01-01', minutes: 180 },
        { date: '2024-01-02', minutes: 165 },
        { date: '2024-01-03', minutes: 220 },
        { date: '2024-01-04', minutes: 195 },
        { date: '2024-01-05', minutes: 240 },
        { date: '2024-01-06', minutes: 160 },
        { date: '2024-01-07', minutes: 135 }
      ]
    };

    res.json({
      success: true,
      data: distributionData,
      timeframe: `${timeframe} days`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get productivity insights
router.get('/insights', async (req, res) => {
  try {
    const insights = {
      weeklyGoals: {
        target: 1800, // minutes
        current: 1295,
        percentage: 72
      },
      streaks: {
        currentStudyStreak: 5,
        longestStudyStreak: 12,
        currentReadingGoal: 8 // days
      },
      predictions: {
        weeklyCompletion: {
          estimated: '95%',
          timeNeeded: 505, // additional minutes
          confidence: 'high'
        },
        readingBacklog: {
          estimatedHours: 12.5,
          priority: 'medium'
        }
      },
      recommendations: [
        {
          type: 'schedule',
          title: 'Optimize Reading Time',
          description: 'Your reading speed is fastest between 2-4 PM',
          priority: 'high'
        },
        {
          type: 'workload',
          title: 'Balance Class Distribution',
          description: 'Consider increasing time on Criminal Law (currently 16.3%)',
          priority: 'medium'
        },
        {
          type: 'efficiency',
          title: 'Break Optimization',
          description: 'Take a 5-minute break every 45 minutes for better retention',
          priority: 'low'
        }
      ]
    };

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get performance comparison
router.get('/performance', async (req, res) => {
  try {
    const { period = 'week' } = req.query;

    const performanceData = {
      current: {
        period: period,
        totalMinutes: 1295,
        avgSessionLength: 42,
        efficiency: 87, // percentage
        focusScore: 8.2 // out of 10
      },
      previous: {
        totalMinutes: 1180,
        avgSessionLength: 38,
        efficiency: 82,
        focusScore: 7.8
      },
      trends: {
        minutesChange: +115,
        sessionLengthChange: +4,
        efficiencyChange: +5,
        focusScoreChange: +0.4
      },
      milestones: [
        {
          title: 'Study Consistency',
          description: 'Studied every day this week',
          achieved: true,
          date: '2024-01-07'
        },
        {
          title: 'Reading Goal',
          description: 'Complete 100 pages in Constitutional Law',
          achieved: false,
          progress: 89
        }
      ]
    };

    res.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;