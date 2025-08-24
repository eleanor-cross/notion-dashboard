// ABOUTME: Time utility functions for formatting and calculations
// ABOUTME: Provides consistent time formatting across the Duke Law Dashboard

export const formatDuration = (seconds: number): string => {
  // Handle negative values by returning zero duration
  if (seconds < 0) {
    return '00:00';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

export const formatMinutes = (minutes: number): string => {
  // Handle negative values by using absolute value
  const absMinutes = Math.abs(minutes);
  
  if (absMinutes < 60) {
    return `${absMinutes}m`;
  }
  
  const hours = Math.floor(absMinutes / 60);
  const remainingMinutes = absMinutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

export const minutesToHours = (minutes: number): number => {
  return Math.round((minutes / 60) * 100) / 100;
};

export const hoursToMinutes = (hours: number): number => {
  return Math.round(hours * 60);
};

export const calculateReadingSpeed = (pages: number, durationMs: number): number => {
  // Handle edge cases
  if (durationMs <= 0 || pages < 0) {
    return 0;
  }
  
  const hours = durationMs / (1000 * 60 * 60);
  const speed = pages / hours;
  
  // Handle division by very small numbers that result in Infinity
  if (!isFinite(speed)) {
    return 0;
  }
  
  return Math.round(speed * 100) / 100;
};

export const estimateReadingTime = (pages: number, speedPagesPerHour: number): number => {
  return Math.round((pages / speedPagesPerHour) * 60); // return minutes
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (timeString: string): string => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const daysFromNow = (dateString: string): number => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const days = diffTime / (1000 * 60 * 60 * 24);
  
  // Use Math.round for more accurate results and avoid -0
  const result = Math.round(days);
  
  // Explicitly handle -0 case
  return result === 0 ? 0 : result;
};