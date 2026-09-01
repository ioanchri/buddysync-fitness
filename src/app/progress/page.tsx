'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  TrendingUp, 
  Trophy, 
  Footprints, 
  Scale, 
  Zap, 
  Users, 
  Award, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { DailyMetricForm } from '@/components/dashboard/DailyMetricForm';
import { LogWorkoutModal } from '@/components/dashboard/LogWorkoutModal';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

export default function ProgressPage() {
  const { user, dailyLogs, milestones } = useAppState();
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

  // Reverse logs so oldest is left, newest is right
  const chartData = [...dailyLogs].reverse().map(l => ({
    date: l.date.slice(5), // MM-DD
    weight: l.weight || user?.initial_weight || 75,
    steps: l.steps,
    targetWeight: user?.target_weight || 70,
    stepGoal: user?.step_goal || 10000,
  }));

  const iconMap: { [key: string]: React.ReactNode } = {
    Footprints: <Footprints className="w-6 h-6 text-cyan-500" />,
    Zap: <Zap className="w-6 h-6 text-amber-500" />,
    TrendingDown: <Scale className="w-6 h-6 text-emerald-500" />,
    Users: <Users className="w-6 h-6 text-purple-500" />,
    Trophy: <Trophy className="w-6 h-6 text-rose-500" />,
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-emerald-500" />
            <span>Progress Analytics & Milestones</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track historical weight loss trajectories, step volume trends, and unlocked badges
          </p>
        </div>
        <Badge variant="emerald">Historical Analytics</Badge>
      </div>

      <DailyMetricForm onOpenWorkoutModal={() => setIsWorkoutModalOpen(true)} />

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weight Loss Trajectory Line Chart */}
        <Card data-tour="progress-weight" glow="emerald" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Weight Over Time</h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Target Line: {user?.target_weight} {user?.weight_unit}</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <ReferenceLine y={user?.target_weight || 70} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target', fill: '#10b981', fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#38bdf8" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#38bdf8' }} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Daily Step Trends Bar Chart */}
        <Card data-tour="progress-steps" glow="cyan" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Footprints className="w-5 h-5 text-cyan-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Daily Step Volume</h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Goal: {user?.step_goal.toLocaleString()}</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <ReferenceLine y={user?.step_goal || 10000} stroke="#06b6d4" strokeDasharray="3 3" />
                <Bar dataKey="steps" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

        {/* Milestone Checkpoint Badges Grid */}
        <div data-tour="progress-badges" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Milestone Checkpoints & Badges</span>
          </h2>
          <span className="text-xs font-bold text-emerald-500">
            {milestones.filter(m => m.unlocked).length} of {milestones.length} Badges Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {milestones.map(m => (
            <Card
              key={m.id}
              hoverable
              className={`p-4 transition-all ${
                m.unlocked 
                  ? 'border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/5' 
                  : 'opacity-60 grayscale'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {iconMap[m.icon] || <Trophy className="w-6 h-6 text-emerald-500" />}
                </div>
                {m.unlocked ? (
                  <Badge variant="emerald" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Unlocked</span>
                  </Badge>
                ) : (
                  <Badge variant="slate" className="gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </Badge>
                )}
              </div>

              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{m.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.description}</p>
            </Card>
          ))}
        </div>
      </div>

      <LogWorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
      />

    </div>
  );
}
