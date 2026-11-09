import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200/80 rounded-xl p-5 shadow-card transition-colors duration-150',
        hoverEffect && 'hover:border-slate-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
