import React from 'react';
import { Card } from '@/components/ui/Card';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  currentValue: string | number;
  targetValue: string | number;
  unit: string;
  progressPercent: number; // 0 to 100
  icon: React.ReactNode;
  subtitle?: string;
  accentColor?: 'emerald' | 'cyan' | 'purple' | 'amber';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  currentValue,
  targetValue,
  unit,
  progressPercent,
  icon,
  subtitle,
  accentColor = 'emerald',
}) => {
  const colorMap = {
    emerald: 'from-emerald-500 to-teal-500 text-emerald-500',
    cyan: 'from-cyan-500 to-blue-500 text-cyan-500',
    purple: 'from-purple-500 to-indigo-500 text-purple-500',
    amber: 'from-amber-500 to-orange-500 text-amber-500',
  };

  const clampedProgress = Math.min(Math.max(progressPercent, 0), 100);

  return (
    <Card hoverable glow={accentColor}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentValue}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {unit}
            </span>
          </div>
        </div>
        <div className={clsx("p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60", colorMap[accentColor].split(' ')[2])}>
          {icon}
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5 mt-4">
        <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Target: {targetValue} {unit}</span>
          <span className="font-bold text-slate-900 dark:text-white">{clampedProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-300/30 dark:border-slate-700/30">
          <div
            className={clsx("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", colorMap[accentColor].split(' ').slice(0, 2).join(' '))}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};
