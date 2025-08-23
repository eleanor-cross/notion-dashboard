// ABOUTME: Theme switcher component for Duke Law Dashboard theme selection
// ABOUTME: Provides dropdown interface with theme previews and smooth transitions

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeName, ThemeConfig } from '../contexts/ThemeContext';

interface ThemeSwitcherProps {
  variant?: 'dropdown' | 'toggle' | 'compact';
  showPreview?: boolean;
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'dropdown',
  showPreview = true,
  className = '',
}) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Get current theme config
  const currentThemeConfig = availableThemes.find(theme => theme.name === currentTheme);

  // Theme selection handler
  const handleThemeSelect = (themeName: ThemeName) => {
    setTheme(themeName);
    setIsOpen(false);
  };

  // Render theme preview colors
  const renderThemePreview = (theme: ThemeConfig) => {
    if (!showPreview) return null;

    return (
      <div className="theme-preview" aria-hidden="true">
        <div 
          className="theme-preview-color"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div 
          className="theme-preview-color"
          style={{ backgroundColor: theme.colors.secondary }}
        />
        <div 
          className="theme-preview-color"
          style={{ backgroundColor: theme.colors.background }}
        />
      </div>
    );
  };

  // Toggle variant (simple switch between light/dark)
  if (variant === 'toggle') {
    const toggleTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    return (
      <button
        type="button"
        className={`theme-toggle ${className}`}
        onClick={() => handleThemeSelect(toggleTheme)}
        aria-label={`Switch to ${toggleTheme} theme`}
        title={`Switch to ${toggleTheme} theme`}
      >
        <div className="theme-toggle-track">
          <div className={`theme-toggle-thumb ${currentTheme === 'dark' ? 'active' : ''}`}>
            {currentTheme === 'light' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.43 2.3c-2.38-.59-4.68-.27-6.63.64-.35.16-.41.64-.1.86C7.13 4.85 8.5 6.91 8.5 9.5c0 3.82-2.66 6.76-6.33 7.85-.35.1-.46.49-.23.76 1.24 1.47 3.47 2.89 6.56 2.89 4.74 0 8.5-3.76 8.5-8.5 0-4.19-2.55-7.84-6.57-9.2z"/>
              </svg>
            )}
          </div>
        </div>
        <span className="sr-only">
          Current theme: {currentThemeConfig?.displayName}
        </span>
      </button>
    );
  }

  // Compact variant (icon button with theme indicator)
  if (variant === 'compact') {
    return (
      <div className={`theme-switcher-compact ${className}`} ref={dropdownRef}>
        <button
          type="button"
          className="theme-switcher-button compact"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Theme selector"
        >
          <div className="theme-indicator">
            <div 
              className="theme-indicator-color"
              style={{ backgroundColor: currentThemeConfig?.colors.primary }}
            />
          </div>
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className={`chevron ${isOpen ? 'open' : ''}`}
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
          </svg>
        </button>

        {isOpen && (
          <div className="theme-switcher-dropdown compact">
            <div className="dropdown-header">
              <span className="dropdown-title">Theme</span>
            </div>
            
            <div className="theme-options">
              {availableThemes.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  className={`theme-option ${theme.name === currentTheme ? 'active' : ''}`}
                  onClick={() => handleThemeSelect(theme.name)}
                >
                  <div className="theme-option-content">
                    {renderThemePreview(theme)}
                    <span className="theme-name">{theme.displayName}</span>
                  </div>
                  {theme.name === currentTheme && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`theme-switcher ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="theme-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Theme selector"
      >
        <div className="current-theme">
          {renderThemePreview(currentThemeConfig!)}
          <div className="current-theme-info">
            <span className="current-theme-name">
              {currentThemeConfig?.displayName}
            </span>
            <span className="current-theme-description">
              {currentThemeConfig?.description}
            </span>
          </div>
        </div>
        
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className={`chevron ${isOpen ? 'open' : ''}`}
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </button>

      {isOpen && (
        <div className="theme-switcher-dropdown">
          <div className="dropdown-header">
            <span className="dropdown-title">Choose Theme</span>
            <span className="dropdown-subtitle">
              Select your preferred color scheme
            </span>
          </div>
          
          <div className="theme-options">
            {availableThemes.map((theme) => (
              <button
                key={theme.name}
                type="button"
                className={`theme-option ${theme.name === currentTheme ? 'active' : ''}`}
                onClick={() => handleThemeSelect(theme.name)}
                disabled={theme.name === currentTheme}
              >
                <div className="theme-option-content">
                  {renderThemePreview(theme)}
                  <div className="theme-option-info">
                    <span className="theme-name">{theme.displayName}</span>
                    <span className="theme-description">{theme.description}</span>
                  </div>
                </div>
                
                {theme.name === currentTheme && (
                  <div className="theme-option-check">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="dropdown-footer">
            <span className="dropdown-hint">
              Theme preference is saved automatically
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;