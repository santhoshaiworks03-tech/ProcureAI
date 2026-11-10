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
    default: 'bg-[#EDE6DC] text-[#13110F] border-[rgba(19,17,15,0.08)]',
    neutral: 'bg-[#EDE6DC] text-[#6B6560] border-[rgba(19,17,15,0.08)]',
    success: 'bg-[rgba(180,199,166,0.22)] text-[#3E5C31] border-[rgba(180,199,166,0.6)]',
    warning: 'bg-[rgba(217,119,6,0.10)] text-[#92400E] border-[rgba(217,119,6,0.25)]',
    danger: 'bg-[rgba(190,18,60,0.08)] text-[#9F1239] border-[rgba(190,18,60,0.20)]',
    info: 'bg-[rgba(242,200,168,0.22)] text-[#8C522A] border-[rgba(242,200,168,0.6)]',
    outline: 'bg-transparent text-[#6B6560] border-[rgba(19,17,15,0.12)]',
    provisional: 'bg-[#EDE6DC] text-[#6B6560] border-[rgba(19,17,15,0.08)]'
  };

  const dotColors = {
    default: 'bg-[#13110F]',
    neutral: 'bg-[#6B6560]',
    success: 'bg-[#4D6B3E]',
    warning: 'bg-[#D97706]',
    danger: 'bg-[#BE123C]',
    info: 'bg-[#C27D4E]',
    outline: 'bg-[#6B6560]',
    provisional: 'bg-[#8C847D]'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full gap-1.5',
    md: 'text-xs px-3 py-1 rounded-full gap-1.5'
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
