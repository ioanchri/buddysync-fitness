'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, TrendingUp, UserCheck, Flame, PlusCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppState } from '@/context/AppStateContext';

interface SidebarProps {
  onOpenWorkoutModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenWorkoutModal }) => {
  const pathname = usePathname();
  const { user } = useAppState();

  const navItems = [
    { label: 'Daily Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Buddy Feed', href: '/buddies', icon: Users },
    { label: 'Calendar & Invites', href: '/calendar', icon: Calendar },
    { label: 'Progress & Badges', href: '/progress', icon: TrendingUp },
    { label: 'Profile & Targets', href: '/onboarding', icon: UserCheck },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 bg-[var(--bg-card)] shrink-0 transition-colors duration-200">
      
      {/* Quick Action Button */}
      {onOpenWorkoutModal && (
        <button
          onClick={onOpenWorkoutModal}
          className="w-full mb-6 py-3 px-4 rounded-2xl buddysync-gradient-bg text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Log New Workout</span>
        </button>
      )}

      {/* Nav List */}
      <div className="space-y-1.5 flex-1">
        <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Navigation
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Progress Mini Card */}
      {user && (
        <div className="glass-card rounded-2xl p-4 mt-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Weekly Goal Status</span>
          </div>
          <div className="flex items-baseline justify-between text-sm font-extrabold text-slate-900 dark:text-white mb-1.5">
            <span>{user.weekly_checkpoint_goal} Sessions/Wk</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">Target Active</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full buddysync-gradient-bg w-[75%] rounded-full transition-all duration-500" />
          </div>
        </div>
      )}

    </aside>
  );
};
