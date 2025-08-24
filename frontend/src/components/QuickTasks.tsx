// ABOUTME: Quick task buttons for common law school activities
// ABOUTME: Provides one-click timer start for predefined tasks like email, briefing

import React, { useState, useEffect } from 'react';
import { QuickTask, TimerState } from '../types/index.ts';
import { timerApi } from '../services/api.ts';
import { formatDuration } from '../utils/time.ts';
import { 
  EnvelopeIcon, 
  DocumentTextIcon, 
  BookOpenIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

interface QuickTasksProps {
  timerState: TimerState;
  onTimerUpdate: () => void;
}

const taskIcons: Record<string, React.ComponentType<any>> = {
  'Check Email': EnvelopeIcon,
  'Case Brief': DocumentTextIcon,
  'Outline Review': BookOpenIcon,
  'Research': MagnifyingGlassIcon,
  'Class Prep': AcademicCapIcon,
  'Study Group': UserGroupIcon,
  'Office Hours': BuildingOfficeIcon,
  'Bar Prep': ScaleIcon,
};

export const QuickTasks: React.FC<QuickTasksProps> = ({ timerState, onTimerUpdate }) => {
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [loading, setLoading] = useState<string>(''); // Track which task is loading
  const [error, setError] = useState<string>('');
  const [sessionStats, setSessionStats] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchQuickTasks();
    loadSessionStats();
  }, []);

  const fetchQuickTasks = async () => {
    try {
      const tasks = await timerApi.getQuickTasks();
      setQuickTasks(tasks);
    } catch (err) {
      setError('Failed to load quick tasks');
      console.error('Failed to fetch quick tasks:', err);
    }
  };

  const loadSessionStats = () => {
    const saved = sessionStorage.getItem('quickTaskStats');
    if (saved) {
      setSessionStats(JSON.parse(saved));
    }
  };

  const saveSessionStats = (stats: Record<string, number>) => {
    sessionStorage.setItem('quickTaskStats', JSON.stringify(stats));
    setSessionStats(stats);
  };

  const handleQuickStart = async (taskName: string) => {
    if (timerState.isRunning) {
      setError('Please stop the current timer before starting a new task');
      return;
    }

    setLoading(taskName);
    setError('');

    try {
      await timerApi.quickStart(taskName);
      onTimerUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quick task');
    } finally {
      setLoading('');
    }
  };

  const handleStop = async () => {
    if (!timerState.isRunning) return;

    setLoading('stop');
    setError('');

    try {
      const result = await timerApi.stop();
      
      // Update session stats
      if (result && timerState.timer) {
        const taskName = timerState.timer.taskName;
        const duration = result.duration || 0;
        const newStats = {
          ...sessionStats,
          [taskName]: (sessionStats[taskName] || 0) + duration
        };
        saveSessionStats(newStats);
      }
      
      onTimerUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop timer');
    } finally {
      setLoading('');
    }
  };

  const getTaskIcon = (taskName: string) => {
    const IconComponent = taskIcons[taskName] || DocumentTextIcon;
    return <IconComponent className="w-5 h-5" />;
  };

  const getTaskStats = (taskName: string) => {
    const minutes = sessionStats[taskName] || 0;
    return minutes > 0 ? `${minutes}m today` : '';
  };

  const isCurrentTask = (taskName: string) => {
    return timerState.isRunning && 
           timerState.timer?.taskName === taskName && 
           timerState.timer?.taskType === 'quick';
  };

  return (
    <div className="card card-interactive mb-lg">
      <h2 className="text-xl font-semibold text-primary mb-md">Quick Tasks</h2>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error mb-md animate-fade-in">
          <p>{error}</p>
        </div>
      )}

      {/* Current Running Task Display */}
      {timerState.isRunning && timerState.timer?.taskType === 'quick' && (
        <div className="mb-lg p-md bg-success-light border border-success/30 rounded-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-success">
                {getTaskIcon(timerState.timer.taskName)}
              </div>
              <div className="ml-sm">
                <div className="font-medium text-success">
                  {timerState.timer.taskName}
                </div>
                <div className="text-sm text-success/80 font-mono">
                  {formatDuration(timerState.timer.currentDuration)}
                </div>
              </div>
            </div>
            <button
              onClick={handleStop}
              disabled={loading === 'stop'}
              className="btn btn-error btn-sm"
            >
              {loading === 'stop' ? 'Stopping...' : 'Stop'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Task Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {quickTasks.map((task) => {
          const isActive = isCurrentTask(task.name);
          const isLoading = loading === task.name;
          const stats = getTaskStats(task.name);

          return (
            <button
              key={task.name}
              onClick={() => handleQuickStart(task.name)}
              disabled={timerState.isRunning || isLoading}
              className={`
                task-card
                ${isActive ? 'task-card-active' : 'task-card-default'}
                ${(timerState.isRunning && !isActive) || isLoading ? 'task-card-disabled' : ''}
              `}
            >
              <div className="flex items-center mb-sm">
                <div className={isActive ? 'text-success' : 'text-secondary'}>
                  {getTaskIcon(task.name)}
                </div>
                <span className="ml-sm font-medium text-sm truncate">
                  {task.name}
                </span>
              </div>
              
              <div className="text-xs text-tertiary">
                {task.category}
              </div>
              
              {stats && (
                <div className="text-xs text-primary mt-xs">
                  {stats}
                </div>
              )}
              
              {isLoading && (
                <div className="text-xs text-primary mt-xs animate-pulse">
                  Starting...
                </div>
              )}
              
              {isActive && (
                <div className="text-xs text-success mt-xs font-medium">
                  Active
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Session Summary */}
      {Object.keys(sessionStats).length > 0 && (
        <div className="mt-lg pt-md border-t border-color">
          <h3 className="text-sm font-medium text-secondary mb-sm">Today's Session Summary</h3>
          <div className="text-sm text-tertiary">
            Total: {Object.values(sessionStats).reduce((sum, minutes) => sum + minutes, 0)} minutes
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-md text-xs text-tertiary">
        Click any task to start a quick timer. Perfect for tracking routine activities.
      </div>
    </div>
  );
};