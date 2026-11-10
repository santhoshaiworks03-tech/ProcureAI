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
        'bg-white border border-[rgba(19,17,15,0.08)] rounded-2xl p-5 shadow-[0_1px_3px_rgba(19,17,15,0.03)] transition-all duration-200',
        hoverEffect && 'hover:border-[rgba(19,17,15,0.18)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(19,17,15,0.06)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
