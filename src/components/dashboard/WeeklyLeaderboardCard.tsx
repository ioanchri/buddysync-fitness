'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Trophy, Send, Zap, Footprints } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export const WeeklyLeaderboardCard: React.FC = () => {
  const { user, buddies, dailyLogs, sendNudge } = useAppState();

  const userTodayLog = dailyLogs[0];
  const userSteps = userTodayLog?.steps || 10400;

  // Build squad standings
  const leaderboard = [
    {
      id: user?.id || 'usr-1',
      name: `${user?.full_name} (You)`,
      avatar: user?.avatar_url,
      steps: userSteps,
      workouts: 4,
      streak: user?.streak_days || 7,
      rank: 1,
    },
    ...buddies.map((b, idx) => ({
      id: b.id,
      name: b.full_name,
      avatar: b.avatar_url,
      steps: 13420 - idx * 2100,
      workouts: 3,
      streak: b.streak_days || 5,
      rank: idx + 2,
    }))
  ].sort((a, b) => b.steps - a.steps);

  return (
    <Card glow="purple" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Squad Leaderboard</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Weekly step volume & workouts ranking</p>
          </div>
        </div>
        <Badge variant="purple">Week 34 Challenge</Badge>
      </div>

      <div className="space-y-2">
        {leaderboard.map((item, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
          const isCurrentUser = item.id === user?.id;

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                isCurrentUser
                  ? 'bg-purple-500/10 border-purple-500/40 text-slate-900 dark:text-white font-bold'
                  : 'bg-slate-100/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-black">{medal}</span>
                <img
                  src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                  alt={item.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/30"
                />
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-cyan-500" />
                      {item.steps.toLocaleString()} steps
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {item.streak}d streak
                    </span>
                  </p>
                </div>
              </div>

              {!isCurrentUser && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                    onClick={() => sendNudge(item.id, 'high_five')}
                    leftIcon={<Send className="w-3 h-3" />}
                  >
                    High Five
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
