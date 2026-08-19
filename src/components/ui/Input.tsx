import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isNumberInput = props.type === 'number';

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            "w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            "bg-slate-100 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700/80",
            "text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
            isNumberInput && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error && "border-rose-500 focus:ring-rose-500/50",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
