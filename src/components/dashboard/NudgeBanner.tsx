'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BellRing, Zap, Droplets, HeartHandshake, X } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export const NudgeBanner: React.FC = () => {
  const { nudges, buddies, sendNudge } = useAppState();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const activeNudges = nudges.filter(n => !dismissed.includes(n.id));

  const handleSendNudgeToBuddy = (type: 'workout' | 'water' | 'high_five') => {
    if (buddies.length > 0) {
      sendNudge(buddies[0].id, type);
      const labels = {
        workout: `Sent workout nudge to ${buddies[0].full_name}! ⚡`,
        water: `Sent hydration reminder to ${buddies[0].full_name}! 💧`,
        high_five: `Sent High-Five to ${buddies[0].full_name}! 🙌`,
      };
      setSentNotice(labels[type]);
      setTimeout(() => setSentNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Active Received Nudges Banner */}
      {activeNudges.map(nudge => (
        <Card
          key={nudge.id}
          className="p-3.5 bg-gradient-to-r from-purple-500/10 via-emerald-500/10 to-cyan-500/10 border-purple-500/30 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500 text-white shadow-md animate-bounce">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{nudge.message}</span>
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Received from {nudge.sender_name}</span>
            </div>
          </div>

          <button
            onClick={() => setDismissed(prev => [...prev, nudge.id])}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </Card>
      ))}

      {/* Quick Nudge Action Trigger Bar */}
      <Card className="p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <BellRing className="w-4 h-4 text-purple-500" />
          <span>Send Quick Nudge to Buddy:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sentNotice ? (
            <span className="text-xs font-bold text-emerald-500 animate-pulse">{sentNotice}</span>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs"
                onClick={() => handleSendNudgeToBuddy('workout')}
                leftIcon={<Zap className="w-3.5 h-3.5 text-amber-500" />}
              >
                ⚡ Workout Nudge
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 text-xs"
                onClick={() => handleSendNudgeToBuddy('water')}
                leftIcon={<Droplets className="w-3.5 h-3.5 text-cyan-500" />}
              >
                💧 Water Reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs"
                onClick={() => handleSendNudgeToBuddy('high_five')}
                leftIcon={<HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />}
              >
                🙌 High Five
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
