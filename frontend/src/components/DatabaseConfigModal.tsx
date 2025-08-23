// ABOUTME: Modal component for configuring Notion database links per widget
// ABOUTME: Allows users to input database URLs, validates them, and manages configuration

import React, { useState, useEffect } from 'react';
import { XMarkIcon, LinkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DatabaseConfig {
  tasks: string;
  textbooks: string;
  timeTracking: string;
  schedule: string;
}

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: DatabaseConfig) => void;
  currentConfig?: DatabaseConfig;
}

const DATABASE_TYPES = {
  tasks: {
    label: 'Tasks Database',
    description: 'Your Notion database containing tasks and assignments',
    example: 'https://notion.so/your-workspace/tasks-database-id'
  },
  textbooks: {
    label: 'Textbooks Database', 
    description: 'Database with your textbooks and reading materials',
    example: 'https://notion.so/your-workspace/textbooks-database-id'
  },
  timeTracking: {
    label: 'Time Tracking Database',
    description: 'Database for logging time entries and sessions',
    example: 'https://notion.so/your-workspace/time-tracking-database-id'
  },
  schedule: {
    label: 'Schedule Database',
    description: 'Your class schedule and calendar events',
    example: 'https://notion.so/your-workspace/schedule-database-id'
  }
} as const;

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig
}) => {
  const [config, setConfig] = useState<DatabaseConfig>({
    tasks: '',
    textbooks: '',
    timeTracking: '',
    schedule: ''
  });
  
  const [validation, setValidation] = useState<Record<keyof DatabaseConfig, {
    isValid: boolean;
    message: string;
  }>>({
    tasks: { isValid: false, message: '' },
    textbooks: { isValid: false, message: '' },
    timeTracking: { isValid: false, message: '' },
    schedule: { isValid: false, message: '' }
  });

  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
    }
  }, [currentConfig]);

  const validateNotionUrl = (url: string): { isValid: boolean; message: string } => {
    if (!url.trim()) {
      return { isValid: false, message: 'URL is required' };
    }

    // Basic Notion URL validation
    const notionUrlPattern = /^https:\/\/(?:www\.)?notion\.so\/[^/]+\/[a-f0-9-]+$/i;
    const notionSharePattern = /^https:\/\/[^.]+\.notion\.site\/[a-f0-9-]+$/i;
    
    if (!notionUrlPattern.test(url) && !notionSharePattern.test(url)) {
      return { 
        isValid: false, 
        message: 'Invalid Notion URL format. Expected: https://notion.so/workspace/database-id' 
      };
    }

    return { isValid: true, message: 'Valid Notion URL format' };
  };

  const handleUrlChange = (type: keyof DatabaseConfig, url: string) => {
    setConfig(prev => ({ ...prev, [type]: url }));
    
    // Validate URL format
    const validation = validateNotionUrl(url);
    setValidation(prev => ({
      ...prev,
      [type]: validation
    }));
  };

  const testDatabaseConnections = async () => {
    setIsValidating(true);
    
    try {
      // Test each database URL by attempting to connect
      for (const [type, url] of Object.entries(config)) {
        if (url.trim()) {
          // This will be implemented in the backend
          const response = await fetch('/api/database/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, type })
          });
          
          const result = await response.json();
          
          setValidation(prev => ({
            ...prev,
            [type]: {
              isValid: result.success,
              message: result.success ? 'Database accessible' : result.error
            }
          }));
        }
      }
    } catch (error) {
      console.error('Database validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    // Check if at least one database is configured
    const hasValidConfig = Object.values(config).some(url => url.trim() !== '');
    
    if (!hasValidConfig) {
      alert('Please configure at least one database');
      return;
    }

    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configure Notion Databases</h2>
            <p className="text-sm text-gray-600 mt-1">
              Connect your Notion databases to load live data into each widget
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {Object.entries(DATABASE_TYPES).map(([type, info]) => (
            <div key={type} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {info.label}
                </label>
                <p className="text-xs text-gray-500 mb-2">{info.description}</p>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={config[type as keyof DatabaseConfig]}
                  onChange={(e) => handleUrlChange(type as keyof DatabaseConfig, e.target.value)}
                  placeholder={info.example}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                
                {/* Validation indicator */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {config[type as keyof DatabaseConfig] && (
                    validation[type as keyof DatabaseConfig].isValid ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    )
                  )}
                </div>
              </div>
              
              {/* Validation message */}
              {config[type as keyof DatabaseConfig] && validation[type as keyof DatabaseConfig].message && (
                <p className={`text-xs ${
                  validation[type as keyof DatabaseConfig].isValid 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {validation[type as keyof DatabaseConfig].message}
                </p>
              )}
            </div>
          ))}

          {/* Test connections button */}
          <div className="flex items-center justify-center pt-4">
            <button
              onClick={testDatabaseConnections}
              disabled={isValidating || !Object.values(config).some(url => url.trim())}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Testing Connections...' : 'Test Database Connections'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};