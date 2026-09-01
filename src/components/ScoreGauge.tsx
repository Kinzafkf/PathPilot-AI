import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 'md', label }) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  // Color selection
  let strokeColor = '#ef4444'; // red
  let bgColor = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800';
  let badgeText = 'Needs Work';

  if (normalizedScore >= 85) {
    strokeColor = '#10b981'; // emerald
    bgColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    badgeText = 'Excellent (ATS Ready)';
  } else if (normalizedScore >= 70) {
    strokeColor = '#3b82f6'; // blue
    bgColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    badgeText = 'Competitive';
  } else if (normalizedScore >= 50) {
    strokeColor = '#f59e0b'; // amber
    bgColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    badgeText = 'Moderate Gaps';
  }

  const radius = size === 'lg' ? 68 : size === 'md' ? 52 : 36;
  const strokeWidth = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  const viewBoxSize = (radius + strokeWidth) * 2;

  return (
    <div id="score-gauge-container" className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={viewBoxSize}
          height={viewBoxSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${
              size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-xl'
            }`}
          >
            {normalizedScore}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ 100</span>
        </div>
      </div>

      {label && (
        <span className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
      )}

      <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgColor}`}>
        {badgeText}
      </span>
    </div>
  );
};
