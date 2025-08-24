// ABOUTME: Widget sharing button component for generating embeddable widget links
// ABOUTME: Provides copy-to-clipboard functionality for Notion embedding

import React, { useState } from 'react';
import { LinkIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface WidgetShareButtonProps {
  widgetType: 'timer' | 'quick-tasks' | 'reading' | 'analytics';
  widgetName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const WidgetShareButton: React.FC<WidgetShareButtonProps> = ({
  widgetType,
  widgetName,
  className = '',
  size = 'sm'
}) => {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const baseUrl = window.location.origin;
  const widgetUrl = `${baseUrl}/widget/${widgetType}`;
  const embedUrl = `${baseUrl}/embed/${widgetType}`;

  const copyToClipboard = async (url: string, type: 'widget' | 'embed') => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setShowDropdown(false);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      // Show success feedback
      console.log(`${type === 'widget' ? 'Widget' : 'Embed'} link copied:`, url);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback: select the text for manual copy
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main share button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`${buttonSizeClasses[size]} text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors group relative`}
        title={`Share ${widgetName} widget`}
        aria-label={`Share ${widgetName} widget`}
      >
        {copied ? (
          <CheckIcon className={`${sizeClasses[size]} text-green-600`} />
        ) : (
          <LinkIcon className={sizeClasses[size]} />
        )}
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Share {widgetName}
        </div>
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown content */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            <div className="px-3 py-2 border-b border-gray-100">
              <h3 className="font-medium text-gray-900 text-sm">Share {widgetName}</h3>
              <p className="text-xs text-gray-500 mt-1">
                Embed this widget in Notion or other platforms
              </p>
            </div>
            
            {/* Widget Link */}
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-700">
                  🔗 Standalone Widget
                </label>
                <button
                  onClick={() => copyToClipboard(widgetUrl, 'widget')}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                >
                  <ClipboardIcon className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono break-all">
                {widgetUrl}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Full-featured widget with header and navigation
              </p>
            </div>
            
            {/* Embed Link */}
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-700">
                  📋 Embed Code (Recommended)
                </label>
                <button
                  onClick={() => copyToClipboard(embedUrl, 'embed')}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded transition-colors"
                >
                  <ClipboardIcon className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono break-all">
                {embedUrl}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimal layout optimized for embedding in Notion
              </p>
            </div>

            {/* Usage instructions */}
            <div className="px-3 py-2 border-t border-gray-100">
              <h4 className="text-xs font-medium text-gray-700 mb-2">📝 How to embed in Notion:</h4>
              <ol className="text-xs text-gray-600 space-y-1">
                <li>1. Copy the embed link above</li>
                <li>2. In Notion, type <code className="bg-gray-100 px-1 rounded">/embed</code></li>
                <li>3. Paste the link and press Enter</li>
                <li>4. Resize as needed</li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
};