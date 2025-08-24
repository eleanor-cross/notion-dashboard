// ABOUTME: API service layer for communicating with backend
// ABOUTME: Provides typed methods for all Duke Law Dashboard API endpoints

import axios from 'axios';
import { 
  Task, 
  Textbook, 
  ScheduleItem, 
  TimerState, 
  QuickTask, 
  ReadingSpeedAnalytics,
  TimeDistribution,
  ProductivityInsights,
  PerformanceData,
  ApiResponse,
  ReadingSession
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configure axios with default settings
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add session ID to requests for timer tracking
apiClient.interceptors.request.use((config) => {
  const sessionId = sessionStorage.getItem('dashboardSessionId') || 
    (() => {
      const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('dashboardSessionId', id);
      return id;
    })();
  
  config.headers['session-id'] = sessionId;
  return config;
});

// Tasks API
export const tasksApi = {
  async getAll(): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>('/notion/tasks');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch tasks');
    }
    return response.data.data || [];
  },

  async getToday(): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>('/notion/tasks/today');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch today\'s tasks');
    }
    return response.data.data || [];
  },

  async getActive(): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>('/notion/tasks/active');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch active tasks');
    }
    return response.data.data || [];
  },
};

// Timer API
export const timerApi = {
  async start(taskId: string | null, taskName: string, taskType: 'manual' | 'quick' = 'manual'): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/timer/start', {
      taskId,
      taskName,
      taskType,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to start timer');
    }
    return response.data.data;
  },

  async stop(): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/timer/stop');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to stop timer');
    }
    return response.data.data;
  },

  async getStatus(): Promise<TimerState> {
    const response = await apiClient.get<ApiResponse<TimerState>>('/timer/status');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get timer status');
    }
    return response.data.data || { isRunning: false, timer: null };
  },

  async quickStart(taskName: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/timer/quick-start', {
      taskName,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to start quick timer');
    }
    return response.data.data;
  },

  async getQuickTasks(): Promise<QuickTask[]> {
    const response = await apiClient.get<ApiResponse<QuickTask[]>>('/timer/quick-tasks');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch quick tasks');
    }
    return response.data.data || [];
  },
};

// Textbooks API
export const textbooksApi = {
  async getAll(): Promise<Textbook[]> {
    const response = await apiClient.get<ApiResponse<Textbook[]>>('/notion/textbooks');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch textbooks');
    }
    return response.data.data || [];
  },
};

// Schedule API
export const scheduleApi = {
  async getToday(): Promise<ScheduleItem[]> {
    const response = await apiClient.get<ApiResponse<ScheduleItem[]>>('/notion/schedule/today');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch today\'s schedule');
    }
    return response.data.data || [];
  },
};

// Reading Sessions API
export const readingApi = {
  async createSession(session: ReadingSession): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/notion/reading-session', session);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create reading session');
    }
    return response.data.data;
  },
};

// Analytics API
export const analyticsApi = {
  async getReadingSpeed(timeframe: string = '30', textbookId?: string, className?: string): Promise<ReadingSpeedAnalytics> {
    const params = new URLSearchParams({ timeframe });
    if (textbookId) params.append('textbookId', textbookId);
    if (className) params.append('className', className);
    
    const response = await apiClient.get<ApiResponse<ReadingSpeedAnalytics>>(`/analytics/reading-speed?${params}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch reading speed analytics');
    }
    return response.data.data!;
  },

  async getTimeDistribution(timeframe: string = '7'): Promise<TimeDistribution> {
    const response = await apiClient.get<ApiResponse<TimeDistribution>>(`/analytics/time-distribution?timeframe=${timeframe}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch time distribution');
    }
    return response.data.data!;
  },

  async getInsights(): Promise<ProductivityInsights> {
    const response = await apiClient.get<ApiResponse<ProductivityInsights>>('/analytics/insights');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch insights');
    }
    return response.data.data!;
  },

  async getPerformance(period: string = 'week'): Promise<PerformanceData> {
    const response = await apiClient.get<ApiResponse<PerformanceData>>(`/analytics/performance?period=${period}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch performance data');
    }
    return response.data.data!;
  },
};

// Health check
export const healthApi = {
  async check(): Promise<any> {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default {
  tasks: tasksApi,
  timer: timerApi,
  textbooks: textbooksApi,
  schedule: scheduleApi,
  reading: readingApi,
  analytics: analyticsApi,
  health: healthApi,
};