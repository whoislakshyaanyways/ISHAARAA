import React from 'react';
import { cn } from '@/lib/utils';

interface StatBadgeProps {
  icon: React.ReactNode;
  value: string | number;
  label?: string;
  color?: 'amber' | 'rose' | 'emerald' | 'sky' | 'purple' | 'slate';
  onClick?: () => void;
  className?: string;
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  icon,
  value,
  label,
  color = 'slate',
  onClick,
  className,
}) => {
  const colorStyles = {
    amber: 'text-amber-600 hover:bg-amber-50 border-amber-200',
    rose: 'text-rose-500 hover:bg-rose-50 border-rose-200',
    emerald: 'text-emerald-600 hover:bg-emerald-50 border-emerald-200',
    sky: 'text-sky-600 hover:bg-sky-50 border-sky-200',
    purple: 'text-purple-600 hover:bg-purple-50 border-purple-200',
    slate: 'text-slate-700 hover:bg-slate-100 border-slate-200',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold transition-all select-none',
        colorStyles[color],
        onClick && 'cursor-pointer active:scale-95',
        className
      )}
    >
      <span className="flex-shrink-0 text-base">{icon}</span>
      <span>{value}</span>
      {label && <span className="text-xs text-slate-500 font-medium">{label}</span>}
    </Component>
  );
};
