'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { LandingPage } from '@/components/landing/LandingPage';
import { useAppState } from '@/context/AppStateContext';

/**
 * Explicit /welcome route – also serves as the guest landing.
 * Logged-in users are redirected to the dashboard so they never see it,
 * satisfying: "The logged in users won't see that page".
 */
export default function WelcomePage() {
  const { user, isLoadingUser } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingUser && user) {
      router.replace('/');
    }
  }, [user, isLoadingUser, router]);

  if (isLoadingUser) return null;
  if (user) return null; // will redirect

  // Welcome is rendered without AppShell chrome, so add minimal header for consistency
  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl buddysync-gradient-bg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight buddysync-glow-text">BuddySync</span>
          </Link>
          <Link href="/auth">
            <span className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors inline-flex items-center gap-1.5">
              Sign In / Register
            </span>
          </Link>
        </div>
      </header>
      <LandingPage />
    </div>
  );
}
