'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Scale, Footprints, PlusCircle, CheckCircle2, Dumbbell, Download } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';

interface DailyMetricFormProps {
  onOpenWorkoutModal: () => void;
}

export const DailyMetricForm: React.FC<DailyMetricFormProps> = ({ onOpenWorkoutModal }) => {
  const { user, dailyLogs, logDailyMetrics, exportDailyLogsCsv } = useAppState();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const selectedLog = dailyLogs.find(l => l.date === selectedDate);

  const [weight, setWeight] = useState<string>('');
  const [steps, setSteps] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (selectedLog) {
      if (selectedLog.weight !== undefined) {
        setWeight(selectedLog.weight.toString());
      } else if (user) {
        setWeight(user.initial_weight.toString());
      }

      if (selectedLog.steps !== undefined) {
        setSteps(selectedLog.steps.toString());
      } else {
        setSteps('');
      }
    } else if (user) {
      setWeight(user.initial_weight.toString());
      setSteps('');
    }
  }, [selectedLog, user]);

  const parsedSteps = Number.parseInt(steps, 10);
  const safeSteps = Number.isFinite(parsedSteps) ? Math.max(0, parsedSteps) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = weight ? parseFloat(weight) : undefined;
    logDailyMetrics({
      weight: parsedWeight,
      steps: safeSteps,
      logDate: selectedDate,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);

    // Trigger celebration confetti if goal reached!
    if (user && selectedDate === todayStr && safeSteps >= user.step_goal) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }
  };

  const handleAddSteps = (amount: number) => {
    setSteps((safeSteps + amount).toString());
  };

  return (
    <Card className="border-emerald-500/30 dark:border-emerald-500/20">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Daily Tracking Quick Log</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Log today or backfill previous days when you forget</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportDailyLogsCsv}
            leftIcon={<Download className="w-4 h-4 text-cyan-500" />}
          >
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOpenWorkoutModal}
            leftIcon={<Dumbbell className="w-4 h-4 text-emerald-500" />}
          >
            + Log Workout
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1 sm:col-span-1">
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Log Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={todayStr}
            />
          </div>
          <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center">
            {selectedLog ? `Existing log found for ${selectedDate}. Saving will update it.` : `No log for ${selectedDate}. Saving will create a new entry.`}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Weight Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Weight ({user?.weight_unit || 'kg'})
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder={`e.g. ${user?.initial_weight || 75.0}`}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              leftIcon={<Scale className="w-4 h-4 text-emerald-500" />}
            />
          </div>

          {/* Steps Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Steps Logged ({safeSteps.toLocaleString()} / {user?.step_goal.toLocaleString()})
            </label>
            <Input
              type="number"
              step="100"
              placeholder="e.g. 10000"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              leftIcon={<Footprints className="w-4 h-4 text-cyan-500" />}
            />
            {/* Quick Increment Taps */}
            <div className="flex items-center gap-1.5 pt-1.5">
              <span className="text-[10px] text-slate-400 font-semibold">Quick add:</span>
              {[1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddSteps(amt)}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-500 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  +{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 animate-bounce" />
              <span>Metrics saved for {selectedDate}.</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Auto-saves to your local & buddy history</span>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Save Daily Metrics
          </Button>
        </div>
      </form>
    </Card>
  );
};
