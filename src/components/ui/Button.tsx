import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'violet' | 'outline' | 'danger' | 'ghost' | 'paypal';
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
    primary: 'bg-[#13110F] hover:bg-[#26221F] text-[#FAF7F2] font-medium border border-[#13110F] shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-[#FAF7F2] text-[#13110F] font-medium border border-[rgba(19,17,15,0.12)] shadow-subtle',
    violet: 'bg-[#F2C8A8] hover:bg-[#E2B28D] text-[#13110F] font-medium border border-[#E2B28D] shadow-sm',
    outline: 'border border-[rgba(19,17,15,0.12)] hover:border-[rgba(19,17,15,0.24)] hover:bg-[#FAF7F2] text-[#13110F] bg-white shadow-subtle',
    danger: 'bg-[#BE123C] hover:bg-[#9F1239] text-white font-medium shadow-subtle',
    ghost: 'hover:bg-[rgba(19,17,15,0.06)] text-[#6B6560] hover:text-[#13110F]',
    paypal: 'bg-[#FFC439] hover:bg-[#F4BA34] text-slate-900 font-semibold border border-[#E2AC28] shadow-subtle'
  };

  const sizeStyles = {
    sm: 'text-xs h-8 px-3 rounded-xl gap-1.5',
    md: 'text-xs h-9 px-3.5 rounded-xl gap-2',
    lg: 'text-sm h-10 px-4 rounded-xl gap-2'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#13110F]/15 disabled:opacity-50 disabled:cursor-not-allowed select-none hover:scale-[1.03] active:scale-[0.97] whitespace-nowrap',
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
