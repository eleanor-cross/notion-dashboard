import React, { useState, useEffect } from 'react';
import './CircularClock.css';

interface CircularClockProps {
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
  size?: number;
  showTicks?: boolean;
  ticksColor?: string;
  colors?: {
    hours?: string;
    minutes?: string;
    seconds?: string;
    background?: string;
    text?: string;
    dots?: string;
  };
}

const CircularClock: React.FC<CircularClockProps> = ({
  initialHours = 0,
  initialMinutes = 0,
  initialSeconds = 0,
  size = 300,
  showTicks = true,
  ticksColor,
  colors = {}
}) => {
  const [time, setTime] = useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prevTime => {
        let { hours, minutes, seconds } = prevTime;
        seconds++;
        
        if (seconds >= 60) {
          seconds = 0;
          minutes++;
        }
        
        if (minutes >= 60) {
          minutes = 0;
          hours++;
        }
        
        if (hours >= 24) {
          hours = 0;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  // Calculate percentages for each ring
  const secondsPercentage = (time.seconds / 60) * 100;
  const minutesPercentage = (time.minutes / 60) * 100;
  const hoursPercentage = ((time.hours % 12) / 12) * 100;

  // Calculate stroke-dasharray values for SVG circles
  // Circumference = 2 * PI * radius
  const calculateDashArray = (radius: number, percentage: number) => {
    const circumference = 2 * Math.PI * radius;
    const filledLength = (percentage / 100) * circumference;
    return `${filledLength} ${circumference - filledLength}`;
  };

  // Ring radii based on size
  const outerRadius = (size / 2) - 15; // Hours ring
  const middleRadius = outerRadius - 35; // Minutes ring
  const innerRadius = middleRadius - 35; // Seconds ring

  // Custom CSS variables for colors (using theme colors as defaults)
  const cssVariables = {
    '--clock-color-hours': colors.hours || 'var(--theme-color1)',
    '--clock-color-minutes': colors.minutes || 'var(--theme-color2)',
    '--clock-color-seconds': colors.seconds || 'var(--theme-color3)',
    '--clock-color-background': colors.background || 'var(--theme-border)',
    '--clock-color-text': colors.text || 'var(--theme-text)',
    '--clock-color-dots': colors.dots || 'var(--theme-accent)',
    '--clock-color-hours-light': colors.hours ? `${colors.hours}26` : 'var(--theme-color1-light)',
    '--clock-color-minutes-light': colors.minutes ? `${colors.minutes}26` : 'var(--theme-color2-light)',
    '--clock-color-seconds-light': colors.seconds ? `${colors.seconds}26` : 'var(--theme-color3-light)',
  } as React.CSSProperties;

  // Generate tick marks
  const generateTicks = (radius: number, count: number, length: number, isHour: boolean = false) => {
    const ticks = [];
    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count - 90;
      const angleRad = (angle * Math.PI) / 180;
      
      const x1 = size / 2 + (radius - length) * Math.cos(angleRad);
      const y1 = size / 2 + (radius - length) * Math.sin(angleRad);
      const x2 = size / 2 + radius * Math.cos(angleRad);
      const y2 = size / 2 + radius * Math.sin(angleRad);
      
      ticks.push(
        <line
          key={`tick-${radius}-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className={isHour && i % 3 === 0 ? "clock-tick-major" : "clock-tick"}
          stroke={ticksColor || "var(--theme-accent)"}
          strokeWidth={isHour && i % 3 === 0 ? 2 : 1}
          opacity={isHour && i % 3 === 0 ? 0.8 : 0.4}
        />
      );
    }
    return ticks;
  };

  return (
    <div className="circular-clock-container" style={cssVariables}>
      <div className="circular-clock" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="clock-svg">
          {/* Tick marks - rendered first so they appear behind */}
          {showTicks && (
            <g className="clock-ticks">
              {generateTicks(outerRadius + 12, 12, 8, true)}  {/* Hour marks outside outer ring */}
              {generateTicks(middleRadius + 12, 60, 5)}        {/* Minute marks outside middle ring */}
              {generateTicks(innerRadius + 12, 60, 5)}         {/* Second marks outside inner ring */}
            </g>
          )}

          {/* Background circles with color */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={outerRadius}
            className="clock-ring-background clock-ring-background-hours"
            stroke={colors.hours || "var(--theme-color1)"}
            strokeWidth="20"
            fill="none"
            opacity="0.1"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={middleRadius}
            className="clock-ring-background clock-ring-background-minutes"
            stroke={colors.minutes || "var(--theme-color2)"}
            strokeWidth="20"
            fill="none"
            opacity="0.1"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            className="clock-ring-background clock-ring-background-seconds"
            stroke={colors.seconds || "var(--theme-color3)"}
            strokeWidth="20"
            fill="none"
            opacity="0.1"
          />

          {/* Removed static ring outlines - now using dynamic outlines on progress rings */}

          {/* Progress rings */}
          {/* Hours ring (outer) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={outerRadius}
            className="clock-ring clock-ring-hours"
            strokeDasharray={calculateDashArray(outerRadius, hoursPercentage)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {/* Hour ring outline - top */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={outerRadius + 10}
            className="clock-ring-outline-progress"
            fill="none"
            stroke={colors.hours || "var(--theme-color1)"}
            strokeWidth="2"
            strokeDasharray={calculateDashArray(outerRadius + 10, hoursPercentage)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity="0.6"
          />
          {/* Hour ring outline - bottom */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={outerRadius - 10}
            className="clock-ring-outline-progress"
            fill="none"
            stroke={colors.hours || "var(--theme-color1)"}
            strokeWidth="2"
            strokeDasharray={calculateDashArray(outerRadius - 10, hoursPercentage)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity="0.6"
          />

          {/* Minutes ring (middle) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={middleRadius}
            className="clock-ring clock-ring-minutes"
            strokeDasharray={calculateDashArray(middleRadius, minutesPercentage)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {/* Minute ring outline - top */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={middleRadius + 10}
            className="clock-ring-outline-progress"
            fill="none"
            stroke={colors.minutes || "var(--theme-color2)"}
            strokeWidth="2"
            strokeDasharray={calculateDashArray(middleRadius + 10, minutesPercentage)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity="0.6"
          />
          {/* Minute ring outline - bottom */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={middleRadius - 10}
            className="clock-ring-outline-progress"
            fill="none"
            stroke={colors.minutes || "var(--theme-color2)"}
            strokeWidth="2"
            strokeDasharray={calculateDashArray(middleRadius - 10, minutesPercentage)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity="0.6"
          />

          {/* Seconds ring (inner) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            className="clock-ring clock-ring-seconds"
            strokeDasharray={calculateDashArray(innerRadius, secondsPercentage)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {/* Second ring outline - top */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius + 10}
            className="clock-ring-outline-progress"
            fill="none"
            stroke={colors.seconds || "var(--theme-color3)"}
            strokeWidth="2"
            strokeDasharray={calculateDashArray(innerRadius + 10, secondsPercentage)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity="0.6"
          />
          {/* Second ring outline - bottom */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius - 10}
            className="clock-ring-outline-progress"
            fill="none"
            stroke={colors.seconds || "var(--theme-color3)"}
            strokeWidth="2"
            strokeDasharray={calculateDashArray(innerRadius - 10, secondsPercentage)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            opacity="0.6"
          />

          {/* End dots */}
          <circle
            cx={size / 2}
            cy={size / 2 - outerRadius}
            r="6"
            className="clock-dot clock-dot-hours"
            transform={`rotate(${(hoursPercentage / 100) * 360} ${size / 2} ${size / 2})`}
          />          <circle
            cx={size / 2}
            cy={size / 2 - middleRadius}
            r="5"
            className="clock-dot clock-dot-minutes"
            transform={`rotate(${(minutesPercentage / 100) * 360} ${size / 2} ${size / 2})`}
          />
          <circle
            cx={size / 2}
            cy={size / 2 - innerRadius}
            r="4"
            className="clock-dot clock-dot-seconds"
            transform={`rotate(${(secondsPercentage / 100) * 360} ${size / 2} ${size / 2})`}
          />
        </svg>

        {/* Digital time display in center */}
        <div className="clock-digital-display">
          <div className="clock-time">
            {String(time.hours).padStart(2, '0')}:
            {String(time.minutes).padStart(2, '0')}:
            {String(time.seconds).padStart(2, '0')}
          </div>
          <div className="clock-labels">
            <span className="clock-label clock-label-hours">H</span>
            <span className="clock-label clock-label-minutes">M</span>
            <span className="clock-label clock-label-seconds">S</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularClock;