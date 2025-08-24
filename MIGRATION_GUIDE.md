# CSS Architecture Migration Guide

This guide helps migrate your Duke Law Dashboard components from the legacy CSS system to the new modular theme-aware architecture.

## Overview of Changes

The CSS architecture has been completely refactored to support:

- **Multiple Themes**: Light, dark, and Duke Blue themes
- **CSS Variables**: Consistent design tokens across all themes
- **Modular Structure**: Separated concerns into themed modules
- **Semantic Classes**: Meaningful utility classes using theme variables
- **Component Variants**: Reusable component styles with multiple variants
- **Accessibility**: Built-in support for reduced motion and high contrast
- **Performance**: Optimized for bundle size and runtime performance

## New Architecture Structure

```
frontend/src/styles/
├── themes.css        # CSS variables for all themes
├── utilities.css     # Semantic utility classes
├── components.css    # Reusable component styles
├── animations.css    # Animation utilities and keyframes
└── index.css         # Main entry point with imports
```

## Migration Steps

### 1. Update Component Imports

**Before:**
```typescript
// No theme context needed
import './Timer.css';
```

**After:**
```typescript
// Import theme context
import { useTheme, useThemeStyles } from '../contexts/ThemeContext';
```

### 2. Replace Hard-coded Classes

**Before:**
```jsx
<div className="bg-white shadow-sm border-gray-200 text-gray-900">
  <button className="bg-blue-500 hover:bg-blue-600 text-white">
    Start Timer
  </button>
</div>
```

**After:**
```jsx
<div className="bg-surface shadow-card border-color text-primary">
  <button className="btn btn-primary">
    Start Timer
  </button>
</div>
```

### 3. Use Theme Context in Components

**Before:**
```jsx
const TimerComponent = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#111827' }}>
      Timer Content
    </div>
  );
};
```

**After:**
```jsx
const TimerComponent = () => {
  const { themeConfig } = useTheme();
  const { colors } = useThemeStyles();
  
  return (
    <div className="bg-surface text-primary">
      Timer Content
    </div>
  );
};
```

### 4. Add Theme Provider to App

**Add to your main App component:**
```jsx
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeSwitcher from './components/ThemeSwitcher';

function App() {
  return (
    <ThemeProvider>
      <div className="app-layout">
        <header className="app-header">
          <ThemeSwitcher variant="compact" />
        </header>
        <main className="app-main">
          {/* Your app content */}
        </main>
      </div>
    </ThemeProvider>
  );
}
```

## Class Migration Reference

### Background Classes
| Legacy | New Semantic | CSS Variable |
|--------|-------------|--------------|
| `bg-white` | `bg-surface` | `var(--color-surface)` |
| `bg-gray-100` | `bg-surface-alt` | `var(--color-surface-alt)` |
| `bg-gray-50` | `bg-background-alt` | `var(--color-background-alt)` |
| `bg-blue-500` | `bg-primary` | `var(--color-primary)` |
| `bg-red-500` | `bg-error` | `var(--color-error)` |
| `bg-green-500` | `bg-success` | `var(--color-success)` |

### Text Classes
| Legacy | New Semantic | CSS Variable |
|--------|-------------|--------------|
| `text-gray-900` | `text-primary` | `var(--color-text-primary)` |
| `text-gray-600` | `text-secondary` | `var(--color-text-secondary)` |
| `text-gray-400` | `text-tertiary` | `var(--color-text-tertiary)` |
| `text-blue-500` | `text-primary-color` | `var(--color-primary)` |
| `text-white` | `text-inverse` | `var(--color-text-inverse)` |

### Border Classes
| Legacy | New Semantic | CSS Variable |
|--------|-------------|--------------|
| `border-gray-200` | `border-color` | `var(--color-border)` |
| `border-gray-300` | `border-dark` | `var(--color-border-dark)` |
| `border-blue-500` | `border-primary` | `var(--color-primary)` |

### Button Classes
| Legacy | New Component | Features |
|--------|--------------|----------|
| `bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded` | `btn btn-primary` | Theme-aware, multiple sizes |
| `bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded` | `btn btn-secondary` | Consistent theming |
| `bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded` | `btn btn-error` | Semantic variants |

### Card Classes
| Legacy | New Component | Features |
|--------|--------------|----------|
| `bg-white shadow-lg rounded-lg p-6` | `card` | Theme-aware backgrounds |
| `bg-white shadow-lg rounded-lg p-6 hover:shadow-xl` | `card card-interactive` | Hover effects |

## Component Examples

### Button Migration

**Before:**
```jsx
<button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors">
  Save Changes
</button>
```

**After:**
```jsx
<button className="btn btn-primary">
  Save Changes
</button>
```

### Card Migration

**Before:**
```jsx
<div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Timer Stats</h3>
  <p className="text-gray-600">Your productivity data</p>
</div>
```

**After:**
```jsx
<div className="card">
  <h3 className="text-lg font-semibold text-primary mb-md">Timer Stats</h3>
  <p className="text-secondary">Your productivity data</p>
</div>
```

### Form Migration

**Before:**
```jsx
<input 
  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  type="text"
/>
```

**After:**
```jsx
<input 
  className="input input-primary"
  type="text"
/>
```

## Theme Usage Patterns

### 1. Using Theme Context
```jsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { currentTheme, setTheme, themeConfig } = useTheme();
  
  return (
    <div>
      <p>Current theme: {themeConfig.displayName}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to Dark
      </button>
    </div>
  );
};
```

### 2. Using Theme Styles Hook
```jsx
import { useThemeStyles } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { style, colors, isDark } = useThemeStyles();
  
  return (
    <div style={style}>
      <div style={{ color: colors.primary }}>
        Themed content
      </div>
      {isDark && <p>Dark mode specific content</p>}
    </div>
  );
};
```

### 3. Listening to Theme Changes
```jsx
import { useThemeChangeListener } from '../contexts/ThemeContext';

const MyComponent = () => {
  useThemeChangeListener((theme, config) => {
    console.log('Theme changed to:', theme);
    // React to theme changes
  });
  
  return <div>Component content</div>;
};
```

## Adding the Theme Switcher

### Basic Usage
```jsx
import ThemeSwitcher from './components/ThemeSwitcher';

// Dropdown with full preview
<ThemeSwitcher />

// Simple toggle between light/dark
<ThemeSwitcher variant="toggle" />

// Compact dropdown for mobile
<ThemeSwitcher variant="compact" />

// Without color previews
<ThemeSwitcher showPreview={false} />
```

### In Header Component
```jsx
const Header = () => (
  <header className="app-header">
    <div className="app-container flex items-center justify-between h-16">
      <h1 className="text-xl font-bold text-primary">Duke Law Dashboard</h1>
      <ThemeSwitcher variant="compact" />
    </div>
  </header>
);
```

## Responsive Design

The new system includes mobile-first responsive design:

```jsx
// Responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  <div className="card">Mobile-first responsive card</div>
</div>

// Responsive text
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
  Responsive heading
</h1>

// Responsive spacing
<div className="p-sm md:p-md lg:p-lg">
  Responsive padding
</div>
```

## Animation Usage

### Basic Animations
```jsx
// Fade in animation
<div className="animate-fade-in">Content</div>

// Slide up animation
<div className="animate-slide-in-up">Content</div>

// Hover effects
<div className="hover-lift">Lifts on hover</div>

// Loading states
<div className="animate-pulse">Loading...</div>
<div className="animate-spin">Spinner</div>
```

### Custom Animations
```jsx
// Staggered animations for lists
<div className="stagger-fade-in">
  <div>Item 1 (delays 0.1s)</div>
  <div>Item 2 (delays 0.2s)</div>
  <div>Item 3 (delays 0.3s)</div>
</div>
```

## Accessibility Features

The new system includes built-in accessibility:

- **Reduced Motion**: Respects `prefers-reduced-motion`
- **High Contrast**: Supports `prefers-contrast: high`
- **Focus Management**: Proper focus rings and keyboard navigation
- **Screen Reader**: Semantic HTML and ARIA attributes
- **Color Contrast**: WCAG compliant color combinations

```jsx
// Accessibility-aware animations
<div className="animate-fade-in">
  {/* Animation respects user preferences */}
</div>

// Screen reader only content
<span className="sr-only">
  Hidden content for screen readers
</span>

// Focus management
<button className="btn btn-primary focus-ring">
  Accessible button
</button>
```

## Performance Considerations

### Bundle Size Optimization
- CSS variables reduce duplicate code
- Modular imports allow tree-shaking
- Optimized animations use `transform` and `opacity`

### Runtime Performance
- Smooth 60fps animations
- Efficient theme switching
- Optimized re-renders with React context

### Memory Usage
- Lightweight theme context
- Efficient CSS custom properties
- Minimal JavaScript overhead

## Troubleshooting

### Common Issues

1. **Missing CSS Variables**
   - Ensure `themes.css` is imported first
   - Check ThemeProvider wraps your app

2. **Theme Not Switching**
   - Verify ThemeProvider is at app root
   - Check data-theme attribute on document

3. **Styles Not Applying**
   - Import order: themes → utilities → components → animations
   - Check CSS variable names match exactly

4. **Animation Issues**
   - Verify animations.css import
   - Check for conflicting CSS transitions

### Browser Support

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **CSS Variables**: IE11 not supported (graceful degradation)
- **CSS Grid**: IE11 requires prefixes
- **Custom Properties**: Use fallback values

## Best Practices

1. **Always use semantic classes**: `bg-primary` instead of `bg-blue-500`
2. **Prefer component classes**: `btn btn-primary` instead of individual utilities
3. **Use theme context**: Access theme data programmatically when needed
4. **Test all themes**: Ensure your components work in light, dark, and Duke Blue
5. **Consider accessibility**: Test with screen readers and keyboard navigation
6. **Optimize performance**: Use CSS classes over inline styles when possible

## Migration Checklist

- [ ] Add ThemeProvider to app root
- [ ] Replace legacy classes with semantic equivalents
- [ ] Update component imports to use theme context
- [ ] Add ThemeSwitcher component to header
- [ ] Test all themes (light, dark, Duke Blue)
- [ ] Verify responsive design works
- [ ] Test accessibility features
- [ ] Check animation performance
- [ ] Validate with reduced motion preferences
- [ ] Test high contrast mode support

## Need Help?

If you encounter issues during migration:

1. Check the CSS architecture documentation
2. Review the component examples in this guide  
3. Test your changes in all three themes
4. Verify accessibility with screen readers
5. Check browser developer tools for CSS variable values

The new architecture provides a much more maintainable and flexible foundation for the Duke Law Dashboard while maintaining full backward compatibility during the migration period.