// ABOUTME: Main App component for Duke Law Dashboard
// ABOUTME: Manages global state and renders timer, quick tasks, reading tracker, and analytics

import React, { useState, useEffect } from 'react';
import { Timer } from './components/Timer.tsx';
import { QuickTasks } from './components/QuickTasks.tsx';
import { ReadingTracker } from './components/ReadingTracker.tsx';
import { Analytics } from './components/Analytics.tsx';
import { DatabaseConfigModal } from './components/DatabaseConfigModal.tsx';
import { TimerState } from './types/index.ts';
import { healthApi } from './services/api.ts';

function App() {
  const [timerState, setTimerState] = useState<TimerState>({ isRunning: false, timer: null });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [databaseConfig, setDatabaseConfig] = useState<{
    tasks: string;
    textbooks: string;
    timeTracking: string;
    schedule: string;
  } | null>(null);

  useEffect(() => {
    checkApiHealth();
    loadDatabaseConfig();
  }, []);

  const checkApiHealth = async () => {
    try {
      await healthApi.check();
      setApiHealthy(true);
    } catch (err) {
      setApiHealthy(false);
      console.error('API health check failed:', err);
    }
  };

  const handleTimerUpdate = () => {
    // Force timer status refresh by updating a key
    setTimerState(prev => ({ ...prev }));
  };

  const loadDatabaseConfig = () => {
    try {
      const saved = localStorage.getItem('notionDatabaseConfig');
      if (saved) {
        setDatabaseConfig(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load database config:', error);
    }
  };

  const saveDatabaseConfig = (config: typeof databaseConfig & { token?: string }) => {
    try {
      if (config) {
        // Separate token from database URLs
        const { token, ...databaseUrls } = config;
        
        // Only store database URLs in localStorage (not the token for security)
        localStorage.setItem('notionDatabaseConfig', JSON.stringify(databaseUrls));
        setDatabaseConfig(databaseUrls);
        
        // Send full configuration including token to backend
        fetch('/api/database/configure', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'session-id': sessionStorage.getItem('dashboardSessionId') || ''
          },
          body: JSON.stringify(config) // Include token in backend request
        })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            console.log('Configuration saved successfully:', {
              databases: result.validDatabases,
              tokenConfigured: result.tokenConfigured
            });
            
            // Show success message
            alert(`Configuration saved successfully!\n${result.tokenConfigured ? '✅ Token configured' : ''}\n📊 Databases: ${result.validDatabases.join(', ')}`);
          } else {
            console.error('Configuration save failed:', result.error);
            alert(`Failed to save configuration: ${result.error}`);
          }
        })
        .catch(err => {
          console.error('Failed to update backend config:', err);
          alert('Failed to save configuration. Please check your connection.');
        });
      }
    } catch (error) {
      console.error('Failed to save database config:', error);
      alert('An error occurred while saving the configuration.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Duke Law Dashboard</h1>
              </div>
              <div className="ml-4 text-sm text-gray-600">
                Notion-Integrated Productivity Tracker
              </div>
            </div>
            
            {/* API Status Indicator */}
            <div className="flex items-center space-x-4">
              {apiHealthy === false && (
                <div className="flex items-center text-red-600 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  API Offline
                </div>
              )}
              {apiHealthy === true && (
                <div className="flex items-center text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Connected
                </div>
              )}
              
              {/* Tab Navigation */}
              <div className="flex items-center space-x-3">
                <nav className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'dashboard'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'analytics'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Analytics
                  </button>
                </nav>
                
                {/* Database Config Button */}
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Configure Notion Databases"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TEST: Database Config Button - Always Visible */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            🔧 Configure Notion Databases
          </button>
          <p className="text-sm text-blue-600 mt-2">
            Click to configure your Notion database connections
          </p>
        </div>
        {/* API Offline Warning */}
        {apiHealthy === false && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-yellow-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Backend API is offline
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    The dashboard is running in demo mode. Make sure your backend server is running on port 3001.
                    <button
                      onClick={checkApiHealth}
                      className="ml-2 text-yellow-800 underline hover:text-yellow-900"
                    >
                      Retry connection
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-medium rounded-md transition-colors"
              >
                Configure Databases
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* Timer and Quick Tasks Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Timer onTimerUpdate={setTimerState} />
              </div>
              <div>
                <QuickTasks 
                  timerState={timerState} 
                  onTimerUpdate={handleTimerUpdate}
                />
              </div>
            </div>

            {/* Reading Tracker */}
            <div className="grid grid-cols-1">
              <ReadingTracker />
            </div>

            {/* Current Session Summary */}
            {timerState.isRunning && timerState.timer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Current Session</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-blue-700 font-medium">Active Task</div>
                    <div className="text-blue-900">{timerState.timer.taskName}</div>
                  </div>
                  <div>
                    <div className="text-blue-700 font-medium">Duration</div>
                    <div className="text-blue-900">{timerState.timer.durationMinutes}m</div>
                  </div>
                  <div>
                    <div className="text-blue-700 font-medium">Type</div>
                    <div className="text-blue-900 capitalize">{timerState.timer.taskType}</div>
                  </div>
                  <div>
                    <div className="text-blue-700 font-medium">Started</div>
                    <div className="text-blue-900">
                      {new Date(timerState.timer.startTime).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Analytics />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Duke Law Dashboard - Built with React and Notion API</p>
            <p className="mt-1">Track your study time, analyze productivity, and optimize your law school workflow</p>
          </div>
        </div>
      </footer>

      {/* Database Configuration Modal */}
      <DatabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={saveDatabaseConfig}
        currentConfig={databaseConfig}
      />
    </div>
  );
}

export default App;