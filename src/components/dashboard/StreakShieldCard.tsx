'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Flame, CheckCircle2 } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export const StreakShieldCard: React.FC = () => {
  const { user, useStreakShield } = useAppState();
  const [shieldNotice, setShieldNotice] = useState<string | null>(null);

  const handleShieldActivate = () => {
    const res = useStreakShield();
    setShieldNotice(res.message);
    setTimeout(() => setShieldNotice(null), 3000);
  };

  return (
    <Card glow="amber" className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Active Streak & Freeze Protection</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {user?.streak_days || 7} Days
            </span>
            <span className="text-xs font-bold text-amber-500">🔥 On Fire!</span>
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Shield className="w-6 h-6" />
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-900 dark:text-white">Streak Shields Available</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Protect rest days or sickness from breaking streak</p>
        </div>
        <span className="font-mono text-lg font-black text-amber-500">
          🛡️ {user?.streak_shields ?? 2}
        </span>
      </div>

      {shieldNotice ? (
        <div className="p-2 text-center text-xs font-bold text-emerald-500 flex items-center justify-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>{shieldNotice}</span>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
          onClick={handleShieldActivate}
          leftIcon={<Shield className="w-3.5 h-3.5" />}
        >
          Activate Streak Freeze Shield Today
        </Button>
      )}
    </Card>
  );
};
