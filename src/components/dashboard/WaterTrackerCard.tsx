'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Droplets, Plus, GlassWater } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { format } from 'date-fns';

export const WaterTrackerCard: React.FC = () => {
  const { user, dailyLogs, logWater } = useAppState();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayLog = dailyLogs.find(l => l.date === todayStr);

  const currentWater = todayLog?.water_ml || 1500;
  const targetWater = user?.water_goal_ml || 2500;
  const progressPercent = Math.min(100, Math.max(0, (currentWater / targetWater) * 100));

  return (
    <Card glow="cyan" className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-500" />
            <span>Hydration Tracker</span>
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {(currentWater / 1000).toFixed(1)} L
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              / {(targetWater / 1000).toFixed(1)} L Goal
            </span>
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
          <GlassWater className="w-6 h-6" />
        </div>
      </div>

      {/* Visual Water Fill Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
          <span>{currentWater} ml</span>
          <span className="text-cyan-600 dark:text-cyan-400">{progressPercent.toFixed(0)}% Hydrated</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5 border border-cyan-500/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Quick Hydration Tap Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10"
          onClick={() => logWater(250)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          +250ml Glass
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
          onClick={() => logWater(500)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          +500ml Bottle
        </Button>
      </div>
    </Card>
  );
};
