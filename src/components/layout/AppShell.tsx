'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { LogWorkoutModal } from '@/components/dashboard/LogWorkoutModal';
import { AppStateProvider } from '@/context/AppStateContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

  return (
    <AppStateProvider>
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
    </AppStateProvider>
  );
};
