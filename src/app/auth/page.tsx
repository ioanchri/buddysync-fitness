'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Activity, Mail, Lock, User, CheckCircle, RefreshCw,
  KeyRound, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function AuthPage() {
  const router = useRouter();
  const { user, isDemoMode, signUp, login, logout } = useAppState();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Detect Supabase password recovery redirect (URL hash contains type=recovery)
  useEffect(() => {
    if (typeof window === 'undefined' || !isSupabaseConfigured) return;
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setMode('reset');
    }
  }, []);

  // Already signed in? Send the user back to the dashboard instead of showing the auth form.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isRecovery = window.location.hash.includes('type=recovery');
    if (user && !isRecovery && mode !== 'reset') {
      router.replace('/');
    }
  }, [user, mode, router]);

  const resetForm = (nextMode: AuthMode) => {
    setAuthMessage(null);
    setEmail('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setName('');
    setMode(nextMode);
  };

  // ── Sign In / Sign Up ─────────────────────────────────────────────────────
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setAuthMessage({ success: res.success, text: res.message });
      if (res.success) setTimeout(() => router.push('/'), 800);

    } else if (mode === 'signup') {
      if (!name.trim()) { setIsSubmitting(false); return; }
      if (password.length < 6) {
        setAuthMessage({ success: false, text: 'Password must be at least 6 characters.' });
        setIsSubmitting(false);
        return;
      }
      const res = await signUp(email, password, name);
      setAuthMessage({ success: res.success, text: res.message });
      if (res.success && isDemoMode) setTimeout(() => router.push('/onboarding'), 800);
    }
    setIsSubmitting(false);
  };

  // ── Forgot Password (send reset email) ────────────────────────────────────
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setAuthMessage({ success: false, text: 'Password reset is only available in live Supabase mode.' });
      return;
    }
    setAuthMessage(null);
    setIsSubmitting(true);

    const redirectTo = `${window.location.origin}/auth`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setAuthMessage({ success: false, text: error.message });
    } else {
      setAuthMessage({
        success: true,
        text: 'Reset link sent! Check your email. Click the link to set a new password.',
      });
    }
    setIsSubmitting(false);
  };

  // ── Set New Password (after recovery redirect) ────────────────────────────
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) return;
    setAuthMessage(null);

    if (newPassword.length < 6) {
      setAuthMessage({ success: false, text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthMessage({ success: false, text: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setAuthMessage({ success: false, text: error.message });
    } else {
      setAuthMessage({ success: true, text: 'Password updated successfully! Redirecting to dashboard…' });
      setTimeout(() => router.push('/'), 1500);
    }
    setIsSubmitting(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl buddysync-gradient-bg flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
            <Activity className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Buddy<span className="buddysync-glow-text">Sync</span>
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Accountability &amp; Fitness Tracking for Partners
          </p>
        </div>

        {/* Currently Signed In Banner */}
        {user && mode !== 'reset' && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                {user.full_name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Active: {user.full_name}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Invite Code: {user.invite_code}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Sign Out
            </Button>
          </div>
        )}

        {/* ── SET NEW PASSWORD (recovery redirect) ─────────────────────── */}
        {mode === 'reset' && (
          <Card className="shadow-2xl">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Set New Password</p>
                <p className="text-[11px] text-slate-500">Choose a strong new password for your account</p>
              </div>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                leftIcon={<ShieldCheck className="w-4 h-4 text-slate-400" />}
              />

              {authMessage && (
                <p className={`text-xs font-bold ${authMessage.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {authMessage.text}
                </p>
              )}

              <Button variant="primary" type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          </Card>
        )}

        {/* ── FORGOT PASSWORD ───────────────────────────────────────────── */}
        {mode === 'forgot' && (
          <Card className="shadow-2xl">
            <button
              type="button"
              onClick={() => resetForm('login')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>

            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Reset Password</p>
                <p className="text-[11px] text-slate-500">We&apos;ll email you a reset link</p>
              </div>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="alex@buddysync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />

              {authMessage && (
                <p className={`text-xs font-bold ${authMessage.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {authMessage.text}
                </p>
              )}

              <Button variant="primary" type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>
          </Card>
        )}

        {/* ── SIGN IN / SIGN UP ─────────────────────────────────────────── */}
        {(mode === 'login' || mode === 'signup') && (
          <Card className="shadow-2xl">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => resetForm(m)}
                  className={`flex-1 py-3 text-sm font-bold transition-colors cursor-pointer ${
                    mode === m
                      ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {mode === 'signup' && (
                <Input
                  label="Full Name"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                />
              )}

              <Input
                label="Email address"
                type="email"
                placeholder="alex@buddysync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />
                {mode === 'login' && isSupabaseConfigured && (
                  <button
                    type="button"
                    onClick={() => resetForm('forgot')}
                    className="mt-1.5 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer float-right"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {authMessage && (
                <p className={`text-xs font-bold pt-1 ${authMessage.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {authMessage.text}
                </p>
              )}

              <Button variant="primary" type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Please wait…'
                  : mode === 'login'
                    ? 'Sign In to BuddySync'
                    : 'Create Buddy Account'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{isSupabaseConfigured ? 'Live Supabase Auth' : 'Demo Mode — no real auth'}</span>
              </p>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
