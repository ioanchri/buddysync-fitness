'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Activity, Bell, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { LogWorkoutModal } from '@/components/dashboard/LogWorkoutModal';
import { AppStateProvider, useAppState } from '@/context/AppStateContext';

const AppShellInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoadingUser, toast, dismissToast } = useAppState();
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] transition-colors duration-200">
        <div className="w-14 h-14 rounded-3xl buddysync-gradient-bg flex items-center justify-center shadow-xl shadow-emerald-500/25">
          <Activity className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200">

      {/* Header Navigation */}
      <Header />

      {/* Main Body Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">

        {/* Desktop Sidebar */}
        <Sidebar onOpenWorkoutModal={() => setIsWorkoutModalOpen(true)} />

        {/* Core Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full pb-24 md:pb-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Workout Logger Modal */}
      <LogWorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
      />

      {/* Global in-app toast for nudges/cheers, works regardless of browser notification permission */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto z-[60] flex justify-end">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xl border border-slate-700 max-w-sm animate-in fade-in slide-in-from-bottom-2">
            <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold flex-1">{toast.text}</span>
            <button
              onClick={dismissToast}
              aria-label="Dismiss notification"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/auth';

  if (isAuthRoute) {
    return <AppStateProvider>{children}</AppStateProvider>;
  }

  return (
    <AppStateProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppStateProvider>
  );
};
