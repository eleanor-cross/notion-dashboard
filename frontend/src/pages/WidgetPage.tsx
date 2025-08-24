// ABOUTME: Standalone widget page for embedding individual widgets in external sites
// ABOUTME: Provides minimal layout optimized for iframe embedding in Notion pages

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Timer } from '../components/Timer.tsx';
import { QuickTasks } from '../components/QuickTasks.tsx';
import { ReadingTracker } from '../components/ReadingTracker.tsx';
import { Analytics } from '../components/Analytics.tsx';
import { TimerState } from '../types/index.ts';
import { healthApi } from '../services/api.ts';
import '../styles/embed.css';

// Widget configuration
const WIDGET_CONFIG = {
  timer: {
    title: 'Study Timer',
    description: 'Track your study sessions',
    component: Timer,
    icon: '⏱️'
  },
  'quick-tasks': {
    title: 'Quick Tasks',
    description: 'Start quick study activities',
    component: QuickTasks,
    icon: '⚡'
  },
  reading: {
    title: 'Reading Tracker',
    description: 'Log your reading sessions',
    component: ReadingTracker,
    icon: '📚'
  },
  analytics: {
    title: 'Study Analytics',
    description: 'View your productivity insights',
    component: Analytics,
    icon: '📊'
  }
} as const;

type WidgetType = keyof typeof WIDGET_CONFIG;

interface WidgetPageProps {
  embedded?: boolean;
}

export const WidgetPage: React.FC<WidgetPageProps> = ({ embedded = false }) => {
  const { widgetType } = useParams<{ widgetType: string }>();
  const [timerState, setTimerState] = useState<TimerState>({ isRunning: false, timer: null });
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [isInIframe, setIsInIframe] = useState(false);

  const config = WIDGET_CONFIG[widgetType as WidgetType];

  useEffect(() => {
    checkApiHealth();
    
    // Detect if running in iframe
    setIsInIframe(window.self !== window.top);
    
    // Add iframe-specific optimizations
    if (embedded || window.self !== window.top) {
      document.body.classList.add('embedded-widget-body');
      // Remove any max-width constraints for full iframe usage
      document.documentElement.style.maxWidth = 'none';
    }
  }, [embedded]);

  const checkApiHealth = async () => {
    try {
      await healthApi.check();
      setApiHealthy(true);
    } catch (err) {
      setApiHealthy(false);
    }
  };

  const handleTimerUpdate = () => {
    setTimerState(prev => ({ ...prev }));
  };

  if (!config) {
    return (
      <div className={`min-h-screen bg-gray-50 ${embedded ? 'p-2' : 'p-4'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Widget Not Found</h1>
          <p className="text-gray-600 mb-4">
            The widget '{widgetType}' does not exist.
          </p>
          <div className="text-sm text-gray-500">
            Available widgets: timer, quick-tasks, reading, analytics
          </div>
        </div>
      </div>
    );
  }

  const renderWidget = () => {
    switch (widgetType) {
      case 'timer':
        return <Timer onTimerUpdate={setTimerState} />;
      case 'quick-tasks':
        return (
          <QuickTasks
            timerState={timerState}
            onTimerUpdate={handleTimerUpdate}
          />
        );
      case 'reading':
        return <ReadingTracker />;
      case 'analytics':
        return <Analytics />;
      default:
        return null;
    }
  };

  const isEmbedded = embedded || isInIframe;
  
  return (
    <div className={`${isEmbedded ? 'embed-container' : 'min-h-screen'} bg-gray-50 ${isEmbedded ? 'p-2' : 'p-4'}`}>
      {/* Minimal header for standalone widgets */}
      {!embedded && (
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-2xl">{config.icon}</span>
            <h1 className="text-xl font-semibold text-gray-800">{config.title}</h1>
          </div>
          <p className="text-sm text-gray-600">{config.description}</p>
          
          {/* API Status for standalone view */}
          <div className="mt-2 flex items-center justify-center space-x-2">
            {apiHealthy === false && (
              <div className="flex items-center text-red-600 text-xs">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
                API Offline
              </div>
            )}
            {apiHealthy === true && (
              <div className="flex items-center text-green-600 text-xs">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                Connected
              </div>
            )}
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className={`${embedded ? 'max-w-none' : 'max-w-2xl mx-auto'}`}>
        {renderWidget()}
      </div>

      {/* Attribution footer for embedded widgets */}
      {embedded && (
        <div className="text-center mt-4 pt-2 border-t border-gray-200">
          <a 
            href={window.location.origin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Duke Law Dashboard
          </a>
        </div>
      )}
    </div>
  );
};

// Embedded version component for iframe use
export const EmbeddedWidget: React.FC = () => {
  return <WidgetPage embedded={true} />;
};