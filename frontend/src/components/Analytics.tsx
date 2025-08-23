// ABOUTME: Analytics dashboard component displaying reading speed and time distribution
// ABOUTME: Uses Chart.js to visualize productivity metrics and insights

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { analyticsApi } from '../services/api.ts';
import { ReadingSpeedAnalytics, TimeDistribution, ProductivityInsights } from '../types';
import { formatMinutes } from '../utils/time.ts';
import { ChartBarIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const Analytics: React.FC = () => {
  const [readingSpeed, setReadingSpeed] = useState<ReadingSpeedAnalytics | null>(null);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution | null>(null);
  const [insights, setInsights] = useState<ProductivityInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('7');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const [speedData, distributionData, insightsData] = await Promise.all([
        analyticsApi.getReadingSpeed(timeframe),
        analyticsApi.getTimeDistribution(timeframe),
        analyticsApi.getInsights()
      ]);

      setReadingSpeed(speedData);
      setTimeDistribution(distributionData);
      setInsights(insightsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const readingSpeedChartData = {
    labels: readingSpeed?.trend.map(item => new Date(item.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Reading Speed (pages/hour)',
        data: readingSpeed?.trend.map(item => item.speed) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const timeDistributionByClassData = {
    labels: timeDistribution?.byClass.map(item => item.class) || [],
    datasets: [
      {
        label: 'Minutes',
        data: timeDistribution?.byClass.map(item => item.minutes) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const timeDistributionByActivityData = {
    labels: timeDistribution?.byActivity.map(item => item.activity) || [],
    datasets: [
      {
        data: timeDistribution?.byActivity.map(item => item.minutes) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>

        {/* Summary Stats */}
        {readingSpeed && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {readingSpeed.summary.averageSpeed}
              </div>
              <div className="text-sm text-gray-600">Avg Speed (pages/hr)</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {readingSpeed.summary.totalPagesRead}
              </div>
              <div className="text-sm text-gray-600">Pages Read</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {formatMinutes(readingSpeed.summary.totalTimeSpent)}
              </div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {readingSpeed.summary.sessionsCount}
              </div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
          </div>
        )}
      </div>

      {/* Reading Speed Trend */}
      {readingSpeed && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Reading Speed Trend</h3>
          </div>
          <div className="h-64">
            <Line data={readingSpeedChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Time Distribution Charts */}
      {timeDistribution && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Class */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Time by Class</h3>
            </div>
            <div className="h-64">
              <Bar data={timeDistributionByClassData} options={chartOptions} />
            </div>
          </div>

          {/* By Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Time by Activity</h3>
            </div>
            <div className="h-64">
              <Doughnut data={timeDistributionByActivityData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Reading Speed by Textbook */}
      {readingSpeed && readingSpeed.byTextbook.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Speed by Textbook</h3>
          <div className="space-y-3">
            {readingSpeed.byTextbook.map((book, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{book.textbookName}</div>
                  <div className="text-sm text-gray-600">
                    {book.pagesRead} pages • {formatMinutes(book.timeSpent)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">{book.averageSpeed}</div>
                  <div className="text-sm text-gray-600">pages/hour</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights and Recommendations */}
      {insights && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
          
          {/* Weekly Goals */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Weekly Goal Progress</span>
              <span className="text-sm text-gray-600">
                {formatMinutes(insights.weeklyGoals.current)} / {formatMinutes(insights.weeklyGoals.target)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(insights.weeklyGoals.percentage, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {insights.weeklyGoals.percentage}% complete
            </div>
          </div>

          {/* Streaks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {insights.streaks.currentStudyStreak}
              </div>
              <div className="text-sm text-gray-600">Current Streak (days)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {insights.streaks.longestStudyStreak}
              </div>
              <div className="text-sm text-gray-600">Longest Streak (days)</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {insights.streaks.currentReadingGoal}
              </div>
              <div className="text-sm text-gray-600">Reading Goal (days)</div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Recommendations</h4>
            <div className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    rec.priority === 'high'
                      ? 'bg-red-50 border-red-400'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="font-medium text-gray-900">{rec.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{rec.description}</div>
                  <div className="text-xs text-gray-500 mt-1 capitalize">
                    {rec.priority} priority • {rec.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};