import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'provisional';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
    success: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/60',
    warning: 'bg-amber-50/80 text-amber-800 border-amber-200/60',
    danger: 'bg-rose-50/80 text-rose-800 border-rose-200/60',
    info: 'bg-blue-50/80 text-blue-800 border-blue-200/60',
    outline: 'bg-transparent text-slate-600 border-slate-200',
    provisional: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const dotColors = {
    default: 'bg-slate-400',
    neutral: 'bg-slate-400',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-rose-600',
    info: 'bg-blue-600',
    outline: 'bg-slate-400',
    provisional: 'bg-slate-400'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1.5',
    md: 'text-xs px-2.5 py-1 rounded-md gap-1.5'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border tabular-nums select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};
