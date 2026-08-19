import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose' | 'slate';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  className,
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
