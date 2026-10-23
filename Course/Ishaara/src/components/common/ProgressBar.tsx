import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
  barClassName?: string;
  color?: 'green' | 'blue' | 'yellow' | 'rose' | 'orange' | 'purple';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className,
  barClassName,
  color = 'green',
  height = 'md',
  showLabel = false,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
  };

  const colorStyles = {
    green: 'bg-emerald-500 shadow-duo-green',
    blue: 'bg-sky-500 shadow-duo-blue',
    yellow: 'bg-amber-400 shadow-duo-yellow',
    rose: 'bg-rose-500 shadow-duo-rose',
    orange: 'bg-orange-500 shadow-duo-orange',
    purple: 'bg-purple-500 shadow-duo-purple',
  };

  return (
    <div className={cn('w-full flex items-center gap-2', className)}>
      <div
        className={cn(
          'relative w-full bg-slate-200 rounded-full overflow-hidden p-0.5',
          heightStyles[height]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out relative',
            colorStyles[color],
            barClassName
          )}
          style={{ width: `${clamped}%` }}
        >
          {/* Top highlight for 3D bubble effect */}
          <div className="absolute top-0 left-1 right-1 h-[30%] bg-white/40 rounded-full" />
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-bold text-slate-600 min-w-[2.5rem] text-right">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
};
