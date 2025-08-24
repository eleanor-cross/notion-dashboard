// ABOUTME: Active task timer component with start/stop functionality
// ABOUTME: Displays current timer status and creates Notion time tracking entries

import React, { useState, useEffect, useCallback } from 'react';
import { Task, TimerState } from '../types/index.ts';
import { timerApi, tasksApi } from '../services/api.ts';
import { formatDuration } from '../utils/time.ts';
// import { useTheme } from '../contexts/ThemeContext.tsx';
import { PlayIcon, StopIcon, ClockIcon } from '@heroicons/react/24/solid';

interface TimerProps {
  onTimerUpdate?: (state: TimerState) => void;
}

export const Timer: React.FC<TimerProps> = ({ onTimerUpdate }) => {
  // const { themeConfig } = useTheme();
  const [timerState, setTimerState] = useState<TimerState>({ isRunning: false, timer: null });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [customTaskName, setCustomTaskName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchTimerStatus = useCallback(async () => {
    try {
      const status = await timerApi.getStatus();
      setTimerState(status);
    } catch (err) {
      console.error('Failed to fetch timer status:', err);
    }
  }, [setTimerState]);

  // Fetch timer status and tasks on component mount
  useEffect(() => {
    fetchTimerStatus();
    fetchTasks();
  }, [fetchTimerStatus]);

  // Update timer display every second when running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerState.isRunning) {
      interval = setInterval(() => {
        fetchTimerStatus();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, fetchTimerStatus]);

  // Notify parent of timer updates
  useEffect(() => {
    if (onTimerUpdate) {
      onTimerUpdate(timerState);
    }
  }, [timerState, onTimerUpdate]);

  const fetchTasks = async () => {
    try {
      const todaysTasks = await tasksApi.getToday();
      const activeTasks = await tasksApi.getActive();
      
      // Combine and deduplicate tasks
      const allTasks = [...activeTasks, ...todaysTasks];
      const uniqueTasks = allTasks.filter((task, index, self) => 
        index === self.findIndex(t => t.id === task.id)
      );
      
      setTasks(uniqueTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const startTimer = useCallback(async () => {
    if (!selectedTaskId && !customTaskName.trim()) {
      setError('Please select a task or enter a custom task name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedTask = tasks.find(t => t.id === selectedTaskId);
      const taskName = selectedTask?.title || customTaskName.trim();
      
      await timerApi.start(selectedTaskId || null, taskName);
      await fetchTimerStatus();
      
      // Clear custom task name after starting
      if (!selectedTaskId) {
        setCustomTaskName('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start timer');
    } finally {
      setLoading(false);
    }
  }, [selectedTaskId, customTaskName, fetchTimerStatus, tasks]);

  const stopTimer = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      await timerApi.stop();
      await fetchTimerStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop timer');
    } finally {
      setLoading(false);
    }
  }, [fetchTimerStatus]);


  // Add global keyboard listener
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (timerState.isRunning) {
          stopTimer();
        } else if (selectedTaskId || customTaskName.trim()) {
          startTimer();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyPress);
    return () => document.removeEventListener('keydown', handleGlobalKeyPress);
  }, [timerState.isRunning, selectedTaskId, customTaskName, startTimer, stopTimer]);

  return (
    <div className="card card-interactive mb-lg">
      <div className="flex items-center mb-md">
        <ClockIcon className="w-6 h-6 text-primary mr-sm" />
        <h2 className="text-xl font-semibold text-primary">Active Task Timer</h2>
      </div>

      {/* Timer Display */}
      {timerState.isRunning && timerState.timer && (
        <div className="text-center mb-lg p-md bg-primary-light border border-primary/20 rounded-lg animate-fade-in">
          <div className="timer-display text-primary mb-sm">
            {formatDuration(timerState.timer.currentDuration)}
          </div>
          <div className="text-lg text-secondary mb-xs font-medium">
            {timerState.timer.taskName}
          </div>
          <div className="text-sm text-tertiary">
            Started at {new Date(timerState.timer.startTime).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Task Selection */}
      {!timerState.isRunning && (
        <div className="space-y-md mb-lg animate-fade-in-up">
          <div>
            <label htmlFor="task-select" className="label">
              Select a Task
            </label>
            <select
              id="task-select"
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                if (e.target.value) {
                  setCustomTaskName('');
                }
              }}
              className="input input-primary w-full"
            >
              <option value="">Select from your tasks...</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} {task.class && `(${task.class})`}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center text-tertiary text-sm font-medium">or</div>

          <div>
            <label htmlFor="custom-task" className="label">
              Enter Custom Task
            </label>
            <input
              id="custom-task"
              type="text"
              value={customTaskName}
              onChange={(e) => {
                setCustomTaskName(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedTaskId('');
                }
              }}
              placeholder="e.g., Reading Constitutional Law Ch. 5"
              className="input input-primary w-full"
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="alert alert-error mb-md animate-fade-in">
          <p>{error}</p>
        </div>
      )}

      {/* Timer Controls */}
      <div className="flex justify-center">
        {timerState.isRunning ? (
          <button
            onClick={stopTimer}
            disabled={loading}
            className="btn btn-error btn-lg hover-lift"
          >
            <StopIcon className="w-5 h-5 mr-sm" />
            {loading ? 'Stopping...' : 'Stop Timer'}
          </button>
        ) : (
          <button
            onClick={startTimer}
            disabled={loading || (!selectedTaskId && !customTaskName.trim())}
            className="btn btn-success btn-lg hover-lift"
          >
            <PlayIcon className="w-5 h-5 mr-sm" />
            {loading ? 'Starting...' : 'Start Timer'}
          </button>
        )}
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="mt-md text-center text-sm text-tertiary">
        Press <kbd className="kbd">Space</kbd> to {timerState.isRunning ? 'stop' : 'start'} timer
      </div>
    </div>
  );
};