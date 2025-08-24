// ABOUTME: Theme context provider for Duke Law Dashboard theme management
// ABOUTME: Handles theme switching, localStorage persistence, and system preference detection

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Theme types
export type ThemeName = 'light' | 'dark' | 'duke-blue';

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
  };
}

// Theme configurations for display and preview
export const themes: Record<ThemeName, ThemeConfig> = {
  light: {
    name: 'light',
    displayName: 'Light',
    description: 'Clean, bright interface with high contrast',
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      background: '#ffffff',
      surface: '#ffffff',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
    },
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
    description: 'Easy on the eyes with reduced eye strain',
    colors: {
      primary: '#60a5fa',
      secondary: '#9ca3af',
      background: '#111827',
      surface: '#1f2937',
      textPrimary: '#f9fafb',
      textSecondary: '#d1d5db',
    },
  },
  'duke-blue': {
    name: 'duke-blue',
    displayName: 'Duke Blue',
    description: 'Official Duke University colors and branding',
    colors: {
      primary: '#003087',
      secondary: '#FFD960',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      textPrimary: '#212529',
      textSecondary: '#495057',
    },
  },
};

// Context interface
interface ThemeContextType {
  currentTheme: ThemeName;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  isSystemDarkMode: boolean;
  availableThemes: ThemeConfig[];
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Local storage key
const THEME_STORAGE_KEY = 'duke-law-dashboard-theme';

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility function to detect system dark mode preference
const getSystemDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Handle testing environments where matchMedia might not be available
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (error) {
    // Fallback for test environments
    return false;
  }
};

// Utility function to get initial theme
const getInitialTheme = (): ThemeName => {
  // Try to get from localStorage first
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
    if (savedTheme && Object.keys(themes).includes(savedTheme)) {
      return savedTheme;
    }
  }
  
  // Fall back to system preference
  return getSystemDarkMode() ? 'dark' : 'light';
};

// Utility function to apply theme to document
const applyThemeToDocument = (theme: ThemeName): void => {
  if (typeof document === 'undefined') return;
  
  // Add transitioning class to prevent flash
  document.documentElement.classList.add('theme-transitioning');
  
  // Set theme attribute
  document.documentElement.setAttribute('data-theme', theme);
  
  // Remove transitioning class after a short delay
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 50);
};

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme 
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    return defaultTheme || getInitialTheme();
  });
  const [isSystemDarkMode, setIsSystemDarkMode] = useState<boolean>(() => {
    return getSystemDarkMode();
  });

  // Set theme function
  const setTheme = (theme: ThemeName): void => {
    setCurrentTheme(theme);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    
    // Apply to document
    applyThemeToDocument(theme);
    
    // Dispatch custom event for other components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChange', { 
        detail: { theme, config: themes[theme] } 
      }));
    }
  };

  // Toggle between light and dark themes (preserves duke-blue if current)
  const toggleTheme = (): void => {
    if (currentTheme === 'duke-blue') {
      // If duke-blue, toggle to dark/light based on system preference
      setTheme(isSystemDarkMode ? 'dark' : 'light');
    } else if (currentTheme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  // Listen for system dark mode changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Handle testing environments where matchMedia might not be available
    let mediaQuery;
    try {
      mediaQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    } catch (error) {
      // Skip event listeners in test environment
      return;
    }

    if (!mediaQuery) return;
    
    const handleSystemThemeChange = (e: MediaQueryListEvent): void => {
      setIsSystemDarkMode(e.matches);
      
      // Only auto-switch if no theme is explicitly saved
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, []);

  // Apply initial theme on mount
  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  // Prepare context value
  const contextValue: ThemeContextType = {
    currentTheme,
    themeConfig: themes[currentTheme],
    setTheme,
    toggleTheme,
    isSystemDarkMode,
    availableThemes: Object.values(themes),
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for theme-specific styles
export const useThemeStyles = () => {
  const { themeConfig } = useTheme();
  
  return {
    // CSS custom properties as inline styles
    style: {
      '--theme-primary': themeConfig.colors.primary,
      '--theme-secondary': themeConfig.colors.secondary,
      '--theme-background': themeConfig.colors.background,
      '--theme-surface': themeConfig.colors.surface,
      '--theme-text-primary': themeConfig.colors.textPrimary,
      '--theme-text-secondary': themeConfig.colors.textSecondary,
    } as React.CSSProperties,
    
    // Helper functions for dynamic styling
    colors: themeConfig.colors,
    isDark: themeConfig.name === 'dark',
    isLight: themeConfig.name === 'light',
    isDuke: themeConfig.name === 'duke-blue',
  };
};

// Hook for listening to theme changes
export const useThemeChangeListener = (callback: (theme: ThemeName, config: ThemeConfig) => void) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleThemeChange = (event: CustomEvent) => {
      callback(event.detail.theme, event.detail.config);
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, [callback]);
};

// Utility hook for responsive theme behavior
export const useResponsiveTheme = () => {
  const { currentTheme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    currentTheme,
    setTheme,
    isMobile,
    // Helper to automatically switch to dark theme on mobile for battery saving
    enableMobileDarkMode: () => {
      if (isMobile && currentTheme !== 'dark') {
        setTheme('dark');
      }
    },
  };
};

export default ThemeProvider;