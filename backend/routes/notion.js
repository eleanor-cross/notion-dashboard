// ABOUTME: Express routes for Notion database operations
// ABOUTME: Handles tasks, textbooks, schedule, and general Notion API endpoints

const express = require('express');
const router = express.Router();
const notionService = require('../services/notionClient');

// Test mode mock data
const mockData = {
  tasks: [
    {
      id: 'test-task-1',
      title: 'Constitutional Law Reading',
      status: 'Not Started',
      dueDate: new Date().toISOString().split('T')[0],
      class: 'Constitutional Law',
      priority: 'High',
      estimatedTime: 120
    }
  ],
  textbooks: [
    {
      id: 'test-textbook-1',
      title: 'Constitutional Law: Principles and Policies',
      class: 'Constitutional Law',
      totalPages: 800,
      averageSpeed: 15
    }
  ],
  schedule: [
    {
      id: 'test-schedule-1',
      title: 'Constitutional Law',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T10:30:00Z',
      location: 'Room 101'
    }
  ]
};

// Tasks endpoints
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await notionService.getTasks();
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.get('/tasks/today', async (req, res) => {
  try {
    const tasks = await notionService.getTodaysTasks();
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.get('/tasks/active', async (req, res) => {
  try {
    const tasks = await notionService.getActiveTasks();
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Textbooks endpoints
router.get('/textbooks', async (req, res) => {
  try {
    const textbooks = await notionService.getTextbooks();
    res.json({ success: true, data: textbooks });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Schedule endpoints
router.get('/schedule/today', async (req, res) => {
  try {
    const schedule = await notionService.getTodaysSchedule();
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Reading session endpoint
router.post('/reading-session', async (req, res) => {
  try {
    const { 
      textbookId, 
      textbookName, 
      className, 
      pagesRead, 
      duration 
    } = req.body;

    if (!textbookName || !pagesRead || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: textbookName, pagesRead, duration'
      });
    }

    const readingSpeed = (pagesRead / (duration / 3600000)); // pages per hour
    
    const session = await notionService.createReadingSession(
      textbookId,
      textbookName,
      className,
      pagesRead,
      duration,
      readingSpeed
    );

    res.json({ 
      success: true, 
      data: { 
        id: session.id,
        readingSpeed: Math.round(readingSpeed * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;