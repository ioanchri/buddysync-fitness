'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Activity } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { LogWorkoutModal } from '@/components/dashboard/LogWorkoutModal';
import { AppStateProvider, useAppState } from '@/context/AppStateContext';

const AppShellInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoadingUser } = useAppState();
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
