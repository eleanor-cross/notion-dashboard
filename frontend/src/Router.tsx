// ABOUTME: React Router setup for Duke Law Dashboard with widget embedding support  
// ABOUTME: Handles main dashboard and individual widget routes for Notion embedding

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { WidgetPage, EmbeddedWidget } from './pages/WidgetPage.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          {/* Main dashboard route */}
          <Route path="/" element={<App />} />
          
          {/* Individual widget routes for embedding */}
          <Route path="/widget/:widgetType" element={<WidgetPage />} />
          
          {/* Embedded widget routes (minimal layout for iframes) */}
          <Route path="/embed/:widgetType" element={<EmbeddedWidget />} />
          
          {/* Fallback route */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h1 className="text-xl font-semibold text-gray-800 mb-2">Page Not Found</h1>
                <p className="text-gray-600 mb-4">
                  The page you're looking for doesn't exist.
                </p>
                <a 
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                >
                  ← Back to Dashboard
                </a>
              </div>
            </div>
          } />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
};