'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Trophy, Send, Zap, Footprints, Dumbbell, Check } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { format, startOfWeek, endOfWeek, isWithinInterval, getWeek } from 'date-fns';

export const WeeklyLeaderboardCard: React.FC = () => {
  const { user, buddies, dailyLogs, workouts, sharedFeed, sendNudge } = useAppState();
  const [sentToId, setSentToId] = useState<string | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const userTodayLog = dailyLogs.find(l => l.date === todayStr);
  const userSteps = userTodayLog?.steps ?? 0;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const isThisWeek = (dateStr: string) => isWithinInterval(new Date(dateStr), { start: weekStart, end: weekEnd });

  const userWorkoutsThisWeek = workouts.filter(w => isThisWeek(w.date)).length;

  const getLatestBuddyLog = (buddyId: string) => {
    const logs = sharedFeed.filter(item => item.type === 'daily_log' && item.user_id === buddyId && item.log);
    if (logs.length === 0) return null;
    return logs.reduce((a, b) => (a.date > b.date ? a : b));
  };

  const handleHighFive = (buddyId: string) => {
    sendNudge(buddyId, 'high_five');
    setSentToId(buddyId);
    setTimeout(() => setSentToId(null), 2000);
  };

  // Build squad standings
  const leaderboard = [
    {
      id: user?.id || 'usr-1',
      name: `${user?.full_name} (You)`,
      avatar: user?.avatar_url,
      steps: userSteps,
      workouts: userWorkoutsThisWeek,
      streak: user?.streak_days || 0,
    },
    ...buddies.map((b) => {
      const latestLog = getLatestBuddyLog(b.id);
      const buddyWorkoutsThisWeek = sharedFeed.filter(
        item => item.type === 'workout' && item.user_id === b.id && isThisWeek(item.date)
      ).length;
      return {
        id: b.id,
        name: b.full_name,
        avatar: b.avatar_url,
        steps: latestLog?.log?.steps ?? 0,
        workouts: buddyWorkoutsThisWeek,
        streak: b.streak_days || 0,
      };
    })
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
        <Badge variant="purple">Week {getWeek(new Date())} Challenge</Badge>
      </div>

      <div className="space-y-2">
        {leaderboard.map((item, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
          const isCurrentUser = item.id === user?.id;

          return (
            <div
              key={item.id}
              className={`flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl border transition-all ${
                isCurrentUser
                  ? 'bg-purple-500/10 border-purple-500/40 text-slate-900 dark:text-white font-bold'
                  : 'bg-slate-100/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg font-black shrink-0">{medal}</span>
                <img
                  src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                  alt={item.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/30 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-cyan-500 shrink-0" />
                      {item.steps.toLocaleString()} steps
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3 h-3 text-emerald-500 shrink-0" />
                      {item.workouts} this wk
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                      {item.streak}d streak
                    </span>
                  </p>
                </div>
              </div>

              {!isCurrentUser && (
                <div className="flex items-center gap-1 shrink-0 ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 whitespace-nowrap"
                    onClick={() => handleHighFive(item.id)}
                    leftIcon={sentToId === item.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Send className="w-3 h-3" />}
                  >
                    {sentToId === item.id ? 'Sent!' : 'High Five'}
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
