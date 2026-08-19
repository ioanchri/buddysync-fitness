'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { DailyMetricForm } from '@/components/dashboard/DailyMetricForm';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { StreakShieldCard } from '@/components/dashboard/StreakShieldCard';
import { WeeklyLeaderboardCard } from '@/components/dashboard/WeeklyLeaderboardCard';
import { SyncAndNotificationBar } from '@/components/dashboard/SyncAndNotificationBar';
import { LogWorkoutModal } from '@/components/dashboard/LogWorkoutModal';
import { 
  Footprints, 
  Scale, 
  Trophy, 
  Dumbbell, 
  ArrowRight, 
  Trash2, 
  Users, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, dailyLogs, workouts, deleteWorkout } = useAppState();
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayLog = dailyLogs.find(l => l.date === todayStr);

  const currentSteps = todayLog?.steps || 8420;
  const currentWeight = todayLog?.weight || user?.initial_weight || 73.5;
  const targetWeight = user?.target_weight || 70.0;
  const initialWeight = user?.initial_weight || 78.5;
  const stepGoal = user?.step_goal || 10000;
  const unit = user?.weight_unit || 'kg';

  const totalWeightToChange = Math.abs(initialWeight - targetWeight) || 1;
  const weightChangeSoFar = Math.abs(initialWeight - currentWeight);
  const weightProgressPercent = Math.min(100, Math.max(0, (weightChangeSoFar / totalWeightToChange) * 100));
  const stepProgressPercent = Math.min(100, Math.max(0, (currentSteps / stepGoal) * 100));

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl buddysync-gradient-bg p-6 text-white shadow-xl shadow-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-100 mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.full_name || 'Athlete'}! 💪
            </h1>
            <p className="text-sm text-emerald-50 mt-1 max-w-xl font-medium">
              You&apos;re 4 workouts away from smashing this week&apos;s accountability checkpoint with your squad!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-md"
              onClick={() => setIsWorkoutModalOpen(true)}
              leftIcon={<Dumbbell className="w-4 h-4" />}
            >
              + Log Workout
            </Button>
          </div>
        </div>
      </div>

      {/* Device Sync & Push Notifications Control Bar */}
      <SyncAndNotificationBar />

      {/* Daily Input Form */}
      <DailyMetricForm onOpenWorkoutModal={() => setIsWorkoutModalOpen(true)} />

      {/* Visual Analytics & Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Step Ring Progress Card */}
        <Card className="flex flex-col items-center justify-center text-center p-6" glow="cyan">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daily Step Goal
            </span>
            <Badge variant="cyan">{stepProgressPercent >= 100 ? 'Goal Reached! 🎉' : 'In Progress'}</Badge>
          </div>

          <div className="my-3">
            <ProgressRing
              progress={stepProgressPercent}
              size={170}
              strokeWidth={14}
              icon={<Footprints className="w-6 h-6" />}
              centerText={currentSteps.toLocaleString()}
              subText={`Target: ${stepGoal.toLocaleString()}`}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {(stepGoal - currentSteps) > 0 
              ? `${(stepGoal - currentSteps).toLocaleString()} steps remaining today` 
              : 'Daily step target achieved!'}
          </p>
        </Card>

        {/* Weight Loss / Target Metric Card */}
        <MetricCard
          title={`Target Weight Progress (${unit})`}
          currentValue={currentWeight}
          targetValue={targetWeight}
          unit={unit}
          progressPercent={weightProgressPercent}
          icon={<Scale className="w-6 h-6" />}
          accentColor="emerald"
          subtitle={`Started at ${initialWeight} ${unit} • ${(initialWeight - currentWeight).toFixed(1)} ${unit} change`}
        />

        {/* Weekly Checkpoint Metric Card */}
        <MetricCard
          title="Weekly Workout Checkpoint"
          currentValue={`${workouts.length}`}
          targetValue={`${user?.weekly_checkpoint_goal || 5}`}
          unit="sessions"
          progressPercent={Math.min(100, (workouts.length / (user?.weekly_checkpoint_goal || 5)) * 100)}
          icon={<Trophy className="w-6 h-6" />}
          accentColor="purple"
          subtitle="Stay consistent with your accountability squad!"
        />

      </div>

      {/* Streak Protection Feature */}
      <StreakShieldCard />

      {/* Lower Section: Weekly Leaderboard & Recent Workouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Workouts History List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-500" />
              <span>Recent Workout Logs</span>
            </h2>
            <Link href="/progress" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              <span>View All Trends</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {workouts.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-slate-500 dark:text-slate-400">No workouts logged yet for this week!</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setIsWorkoutModalOpen(true)}
              >
                Log Your First Workout
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {workouts.map(wo => (
                <Card key={wo.id} hoverable className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="emerald">{wo.category}</Badge>
                      <Badge variant="amber">{wo.intensity} Intensity</Badge>
                      <span className="text-xs text-slate-400 font-medium">{wo.date}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{wo.title}</h3>
                    {wo.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        &quot;{wo.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-2 sm:pt-0">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{wo.duration_minutes}</span>
                      <span className="text-xs text-slate-400 font-medium ml-1">mins</span>
                    </div>
                    <button
                      onClick={() => deleteWorkout(wo.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete workout"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Leaderboard (1 col) */}
        <div className="space-y-4">
          <WeeklyLeaderboardCard />

          <Card glow="cyan" className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Accountability Feed</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">See your buddy&apos;s daily logs & reactions</p>
              </div>
            </div>
            <Link href="/buddies">
              <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Open Buddy Feed
              </Button>
            </Link>
          </Card>

          <Card glow="purple" className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Joint Workout Planner</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Schedule shared workouts with invites</p>
              </div>
            </div>
            <Link href="/calendar">
              <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Workout Calendar
              </Button>
            </Link>
          </Card>
        </div>

      </div>

      {/* Log Workout Modal */}
      <LogWorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
      />

    </div>
  );
}
