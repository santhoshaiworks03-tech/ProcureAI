import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'paypal';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium border border-blue-700/80 shadow-subtle',
    secondary: 'bg-ink-900 hover:bg-ink-800 text-white font-medium border border-ink-700 shadow-subtle',
    outline: 'border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-subtle',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-subtle',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    paypal: 'bg-[#FFC439] hover:bg-[#F4BA34] text-slate-900 font-semibold border border-[#E2AC28] shadow-subtle'
  };

  const sizeStyles = {
    sm: 'text-xs h-8 px-3 rounded-lg gap-1.5',
    md: 'text-xs h-9 px-3.5 rounded-lg gap-2',
    lg: 'text-sm h-10 px-4 rounded-lg gap-2'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-current" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
