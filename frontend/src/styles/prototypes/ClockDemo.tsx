import React, { useState } from 'react';
import CircularClock from './CircularClock';
import './ClockDemo.css';

const ClockDemo: React.FC = () => {
  const [theme, setTheme] = useState('default');
  
  // Apply theme to document
  React.useEffect(() => {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);
  
  return (
    <div className="clock-demo-container">
      {/* Theme Switcher */}
      <div className="theme-switcher">
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="default">Default Theme</option>
          <option value="ocean">Ocean Theme</option>
          <option value="sunset">Sunset Theme</option>
          <option value="forest">Forest Theme</option>
          <option value="duke">Duke Blue Theme</option>
          <option value="dark">Dark Theme</option>
        </select>
      </div>
      
      <h1 className="demo-title">Circular Clock Component Demo</h1>
      <p className="demo-subtitle">Counting up from initial values with theme-based colors</p>
      
      <div className="clock-grid">
        {/* Clock 1 - Using theme defaults */}
        <div className="clock-item">
          <h3>Theme Colors</h3>
          <CircularClock 
            initialHours={10}
            initialMinutes={25}
            initialSeconds={45}
            size={280}
          />
          <p className="clock-description">
            Using Color1, Color2, Color3
          </p>
        </div>
        {/* Clock 2 - Accent focused */}
        <div className="clock-item">
          <h3>Accent Focused</h3>
          <CircularClock 
            initialHours={3}
            initialMinutes={15}
            initialSeconds={30}
            size={280}
            colors={{
              hours: 'var(--theme-accent)',
              minutes: 'var(--theme-color2)',
              seconds: 'var(--theme-color3)'
            }}
          />
          <p className="clock-description">
            Accent + Color2 + Color3
          </p>
        </div>

        {/* Clock 3 - Reverse order */}
        <div className="clock-item">
          <h3>Reversed Colors</h3>
          <CircularClock 
            initialHours={18}
            initialMinutes={45}
            initialSeconds={0}
            size={280}
            colors={{
              hours: 'var(--theme-color3)',
              minutes: 'var(--theme-color2)',
              seconds: 'var(--theme-color1)'
            }}
          />
          <p className="clock-description">
            Color3 + Color2 + Color1
          </p>
        </div>

        {/* Clock 4 - Monochrome with accent */}
        <div className="clock-item">
          <h3>Monochrome</h3>
          <CircularClock 
            initialHours={7}
            initialMinutes={30}
            initialSeconds={15}
            size={280}
            colors={{
              hours: 'var(--theme-text)',
              minutes: 'var(--theme-text-secondary)',
              seconds: 'var(--theme-accent)'
            }}
          />
          <p className="clock-description">
            Text colors + Accent
          </p>
        </div>

        {/* Clock 5 - Custom override */}
        <div className="clock-item">
          <h3>Custom Override</h3>
          <CircularClock 
            initialHours={22}
            initialMinutes={10}
            initialSeconds={50}
            size={280}
            colors={{
              hours: '#8b5cf6',  // Custom purple
              minutes: '#3b82f6', // Custom blue
              seconds: '#10b981'  // Custom green
            }}
          />
          <p className="clock-description">
            Custom color values
          </p>
        </div>

        {/* Clock 6 - No ticks */}
        <div className="clock-item">
          <h3>Without Ticks</h3>
          <CircularClock 
            initialHours={12}
            initialMinutes={0}
            initialSeconds={0}
            size={280}
            showTicks={false}
          />
          <p className="clock-description">
            Clean minimal design
          </p>
        </div>
      </div>

      <div className="demo-features">
        <h2>Theme System Features</h2>
        <ul>
          <li>🎨 Central color theme system with CSS variables</li>
          <li>⚡ Tick marks around rings using Accent color</li>
          <li>🎭 Multiple theme presets (Default, Ocean, Sunset, Forest, Duke, Dark)</li>
          <li>🎯 Six core colors: Background, Text, Accent, Color1, Color2, Color3</li>
          <li>💫 Automatic theme inheritance from parent</li>
          <li>🔄 Dynamic theme switching</li>
          <li>🎪 Override with custom colors when needed</li>
          <li>📐 Optional tick marks with customizable colors</li>
          <li>📱 Responsive and accessible</li>
          <li>🌙 Dark mode support</li>
        </ul>
      </div>

      <div className="demo-features" style={{marginTop: '20px'}}>
        <h2>Color Definitions</h2>
        <ul>
          <li><strong>Background:</strong> Main surface color</li>
          <li><strong>Text:</strong> Primary text color</li>
          <li><strong>Accent:</strong> Primary brand/action color</li>
          <li><strong>Color1:</strong> Warm semantic color (Hours)</li>
          <li><strong>Color2:</strong> Cool semantic color (Minutes)</li>
          <li><strong>Color3:</strong> Vibrant semantic color (Seconds)</li>
        </ul>
      </div>
    </div>
  );
};

export default ClockDemo;