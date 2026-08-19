'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, TrendingUp, UserCheck } from 'lucide-react';
import { clsx } from 'clsx';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Buddies', href: '/buddies', icon: Users },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Progress', href: '/progress', icon: TrendingUp },
    { label: 'Goals', href: '/onboarding', icon: UserCheck },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-emerald-600 dark:text-emerald-400 font-bold scale-105" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive && "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
