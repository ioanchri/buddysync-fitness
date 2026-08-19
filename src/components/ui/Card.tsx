import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: 'emerald' | 'cyan' | 'purple' | 'amber' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  glow = 'none',
  ...props
}) => {
  const glowStyles = {
    none: '',
    emerald: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:border-emerald-500/40',
    cyan: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-500/40',
    purple: 'hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] hover:border-purple-500/40',
    amber: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:border-amber-500/40',
  };

  return (
    <div
      className={clsx(
        "glass-card rounded-2xl p-5 transition-all duration-300 relative overflow-hidden",
        hoverable && "hover:-translate-y-0.5 cursor-pointer",
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
