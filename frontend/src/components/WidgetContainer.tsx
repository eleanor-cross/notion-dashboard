// ABOUTME: Widget container with share button for embeddable widgets
// ABOUTME: Wraps dashboard widgets with sharing functionality for Notion embedding

import React from 'react';
import { WidgetShareButton } from './WidgetShareButton.tsx';

interface WidgetContainerProps {
  widgetType: 'timer' | 'quick-tasks' | 'reading' | 'analytics';
  widgetName: string;
  children: React.ReactNode;
  className?: string;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widgetType,
  widgetName,
  children,
  className = ''
}) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Share button positioned in top-right corner */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <WidgetShareButton
          widgetType={widgetType}
          widgetName={widgetName}
          size="sm"
          className="bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-gray-200/50"
        />
      </div>
      
      {/* Widget content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};