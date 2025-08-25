# Circular Clock Component with Theme System

A modern, customizable circular clock component with a centralized theme color system. Features three concentric rings representing hours, minutes, and seconds, with all colors pulled from a central theme system.

## 🎨 Theme Color System

All components now use a centralized color theme defined in `theme-colors.css`:

### Core Colors
- **Background** - Main surface color for containers (`--theme-background`)
- **Text** - Primary text color (`--theme-text`)
- **Accent** - Primary brand/action color (`--theme-accent`)
- **Color1** - Warm semantic color, default for hours (`--theme-color1`)
- **Color2** - Cool semantic color, default for minutes (`--theme-color2`)
- **Color3** - Vibrant semantic color, default for seconds (`--theme-color3`)

### Theme File
The central theme is defined in `theme-colors.css` and provides:
- CSS custom properties for all colors
- Multiple theme presets (Ocean, Sunset, Forest, Duke, Dark)
- Derived colors (borders, shadows, gradients)
- Utility classes for quick styling

## Files

- `theme-colors.css` - **Central theme system (NEW)**
- `CircularClock.tsx` - React component (updated to use theme)
- `CircularClock.css` - Component styles (updated to use theme)
- `ClockDemo.tsx` - Demo with theme switcher (updated)
- `ClockDemo.css` - Demo styles (updated to use theme)
- `ClockPreview.html` - Standalone preview with themes
- `README.md` - Documentation

## Usage

### Basic Usage (Inherits Theme Colors)

```tsx
import CircularClock from './CircularClock';
import './theme-colors.css'; // Import theme system

<CircularClock 
  initialHours={10}
  initialMinutes={25}
  initialSeconds={45}
/>
// Automatically uses Color1, Color2, Color3 from theme
```

### Using Theme Variables

```tsx
<CircularClock 
  colors={{
    hours: 'var(--theme-accent)',     // Use accent color
    minutes: 'var(--theme-color2)',   // Use Color2
    seconds: 'var(--theme-color3)'    // Use Color3
  }}
/>
```

### Tick Marks Configuration

```tsx
// Show with default accent color ticks
<CircularClock 
  initialHours={10}
  initialMinutes={25}
  initialSeconds={45}
  showTicks={true}  // Default is true
/>

// Hide tick marks for minimal design
<CircularClock 
  showTicks={false}
/>

// Custom tick color
<CircularClock 
  showTicks={true}
  ticksColor="#gold"  // Or use theme variable: 'var(--theme-color1)'
/>
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialHours` | number | 0 | Starting hour value (0-23) |
| `initialMinutes` | number | 0 | Starting minute value (0-59) |
| `initialSeconds` | number | 0 | Starting second value (0-59) |
| `size` | number | 300 | Clock diameter in pixels |
| `showTicks` | boolean | true | Show/hide tick marks around rings |
| `ticksColor` | string | 'var(--theme-accent)' | Color for tick marks |
| `colors` | object | See below | Custom color configuration |

### Switching Themes

```javascript
// Default theme
document.documentElement.removeAttribute('data-theme');

// Apply a preset theme
document.documentElement.setAttribute('data-theme', 'ocean');
document.documentElement.setAttribute('data-theme', 'sunset');
document.documentElement.setAttribute('data-theme', 'forest');
document.documentElement.setAttribute('data-theme', 'duke');
document.documentElement.setAttribute('data-theme', 'dark');
```

## Customizing the Theme

Edit `theme-colors.css` to change colors globally:

```css
:root {
  /* Change these values to update all components */
  --theme-background: #ffffff;
  --theme-text: #1f2937;
  --theme-accent: #7c3aed;
  --theme-color1: #f59e0b;  /* Hours default */
  --theme-color2: #06b6d4;  /* Minutes default */
  --theme-color3: #ec4899;  /* Seconds default */
}
```

## Theme Presets

### Default Theme
- Background: White
- Text: Dark gray
- Accent: Purple
- Color1: Amber (warm)
- Color2: Cyan (cool)
- Color3: Pink (vibrant)

### Ocean Theme
- Cool blues and teals
- Perfect for marine/water themes

### Sunset Theme
- Warm reds, oranges, and yellows
- Great for energy/warmth themes

### Forest Theme
- Natural greens
- Ideal for eco/nature themes

### Duke Blue Theme
- Duke University colors
- Professional navy and blue tones

### Dark Theme
- Dark backgrounds with bright accents
- High contrast for dark mode

## Utility Classes

The theme system provides utility classes:

```html
<!-- Background utilities -->
<div class="bg-theme">...</div>
<div class="bg-accent">...</div>
<div class="bg-color1">...</div>

<!-- Text utilities -->
<span class="text-theme">...</span>
<span class="text-accent">...</span>
<span class="text-color1">...</span>

<!-- Border utilities -->
<div class="border-theme">...</div>
<div class="border-accent">...</div>

<!-- Shadow utilities -->
<div class="shadow-theme-lg">...</div>

<!-- Gradient utilities -->
<div class="gradient-primary">...</div>
```

## Component Integration

### React Component with Theme
```tsx
import './theme-colors.css';
import CircularClock from './CircularClock';

function App() {
  const [theme, setTheme] = useState('default');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  return (
    <div className="bg-theme text-theme">
      <CircularClock />
    </div>
  );
}
```

### Using in Existing CSS
```css
/* Import theme at the top of your CSS */
@import './theme-colors.css';

/* Use theme variables */
.my-component {
  background: var(--theme-background);
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
  box-shadow: var(--theme-shadow-md);
}

.my-button {
  background: var(--theme-accent);
  color: var(--theme-text-inverse);
}
```

## Preview

To see the theme system in action:

1. Open `ClockPreview.html` in your browser
2. Use the theme dropdown to switch between themes
3. Watch all colors update automatically

## Migration Guide

To update existing components to use the theme system:

1. Import `theme-colors.css`
2. Replace hardcoded colors:
   - `#ffffff` → `var(--theme-background)`
   - `#1f2937` → `var(--theme-text)`
   - `#7c3aed` → `var(--theme-accent)`
   - Primary colors → `var(--theme-color1)`
   - Secondary colors → `var(--theme-color2)`
   - Tertiary colors → `var(--theme-color3)`

## Benefits

- **Centralized**: Change colors in one place
- **Consistent**: All components use the same palette
- **Themeable**: Switch themes instantly
- **Maintainable**: Easy to update and extend
- **Accessible**: Supports dark mode and high contrast
- **Flexible**: Override when needed

## Browser Support

- Modern browsers with CSS Custom Properties support
- Automatic dark mode detection with `prefers-color-scheme`
- Fallback values included for older browsers

## License

Part of the Duke Law Dashboard project.