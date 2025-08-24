// ABOUTME: React app entry point for Duke Law Dashboard
// ABOUTME: Renders the main App component with React 18 concurrent features

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppRouter } from './Router.tsx';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);