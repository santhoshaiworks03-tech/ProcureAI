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
    primary: 'bg-brand-blue hover:bg-blue-600 text-white shadow-sm border border-transparent font-medium',
    secondary: 'bg-navy-900 hover:bg-navy-800 text-white font-medium border border-navy-700 shadow-sm',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-sm',
    danger: 'bg-brand-error hover:bg-red-600 text-white font-medium shadow-sm',
    ghost: 'hover:bg-slate-100 text-slate-700',
    paypal: 'bg-[#FFC439] hover:bg-[#F2BA36] text-navy-900 font-bold border border-[#E0AC30] shadow-sm hover:shadow'
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
