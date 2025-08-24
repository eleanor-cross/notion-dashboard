// ABOUTME: TypeScript type definitions for Duke Law Dashboard
// ABOUTME: Defines interfaces for tasks, timers, analytics, and API responses

export interface Task {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  dueDate: string | null;
  class: string | null;
  priority: 'Low' | 'Medium' | 'High';
  estimatedTime: number | null;
  url: string;
}

export interface Textbook {
  id: string;
  title: string;
  class: string | null;
  author: string | null;
  avgReadingSpeed: number | null;
  totalPages: number | null;
}

export interface ScheduleItem {
  id: string;
  class: string;
  time: string | null;
  location: string | null;
  type: 'Class' | 'Office Hours' | 'Study Group' | 'Other';
  professor: string | null;
}

export interface TimerState {
  isRunning: boolean;
  timer: {
    entryId: string;
    taskName: string;
    taskType: 'manual' | 'quick';
    startTime: string;
    currentDuration: number; // seconds
    durationMinutes: number;
  } | null;
}

export interface QuickTask {
  name: string;
  category: string;
}

export interface ReadingSpeedAnalytics {
  summary: {
    averageSpeed: number;
    totalPagesRead: number;
    totalTimeSpent: number;
    sessionsCount: number;
  };
  byTextbook: Array<{
    textbookId: string;
    textbookName: string;
    averageSpeed: number;
    pagesRead: number;
    timeSpent: number;
  }>;
  trend: Array<{
    date: string;
    speed: number;
  }>;
}

export interface TimeDistribution {
  byClass: Array<{
    class: string;
    minutes: number;
    percentage: number;
  }>;
  byActivity: Array<{
    activity: string;
    minutes: number;
    percentage: number;
  }>;
  dailyBreakdown: Array<{
    date: string;
    minutes: number;
  }>;
}

export interface ProductivityInsights {
  weeklyGoals: {
    target: number;
    current: number;
    percentage: number;
  };
  streaks: {
    currentStudyStreak: number;
    longestStudyStreak: number;
    currentReadingGoal: number;
  };
  predictions: {
    weeklyCompletion: {
      estimated: string;
      timeNeeded: number;
      confidence: 'high' | 'medium' | 'low';
    };
    readingBacklog: {
      estimatedHours: number;
      priority: 'high' | 'medium' | 'low';
    };
  };
  recommendations: Array<{
    type: 'schedule' | 'workload' | 'efficiency';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface PerformanceData {
  current: {
    period: string;
    totalMinutes: number;
    avgSessionLength: number;
    efficiency: number;
    focusScore: number;
  };
  previous: {
    totalMinutes: number;
    avgSessionLength: number;
    efficiency: number;
    focusScore: number;
  };
  trends: {
    minutesChange: number;
    sessionLengthChange: number;
    efficiencyChange: number;
    focusScoreChange: number;
  };
  milestones: Array<{
    title: string;
    description: string;
    achieved: boolean;
    progress?: number;
    date?: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ReadingSession {
  textbookId?: string;
  textbookName: string;
  className?: string;
  pagesRead: number;
  duration: number; // milliseconds
}