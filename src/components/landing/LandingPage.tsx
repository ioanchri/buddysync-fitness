'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Droplets,
  Dumbbell,
  Eye,
  EyeOff,
  Flame,
  Footprints,
  Heart,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
  Lock,
  MessageCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/dashboard/ProgressRing';

/**
 * Public Introduction / Landing page for unauthenticated visitors.
 * Uses deterministic dummy data from the offline/demo mode to showcase
 * what logged-in users get. Includes a persistent login banner.
 */

const DEMO_STATS = {
  steps: 8234,
  stepGoal: 10000,
  currentWeight: 72.8,
  targetWeight: 70.0,
  initialWeight: 78.5,
  unit: 'kg' as const,
  workoutsThisWeek: 3,
  weeklyGoal: 5,
  waterMl: 1750,
  waterGoal: 2500,
};

export const LandingPage: React.FC = () => {
  const stepProgress = Math.min(100, (DEMO_STATS.steps / DEMO_STATS.stepGoal) * 100);
  const weightProgress = Math.min(
    100,
    (Math.abs(DEMO_STATS.initialWeight - DEMO_STATS.currentWeight) /
      Math.abs(DEMO_STATS.initialWeight - DEMO_STATS.targetWeight)) *
      100
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* ── Sticky Login Prompt Banner (sits just below Header h-16) ── */}
      <div className="sticky top-16 z-30 backdrop-blur-md bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
              <Eye className="w-3 h-3" /> Preview Mode
            </span>
            <span className="text-xs sm:text-sm">
              You’re viewing demo data — <span className="font-extrabold">sign in to save your own progress</span> and invite your buddy.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/auth">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Sign In / Register
              </Button>
            </Link>
            <Link
              href="/auth"
              className="hidden sm:inline text-amber-700 dark:text-amber-300 hover:underline font-bold text-xs"
            >
              Create free account →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 buddysync-gradient-bg opacity-[0.08] dark:opacity-[0.12]" />
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-emerald-400/20 via-cyan-400/20 to-indigo-400/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Accountability + Habit Tracking — Zero-config demo inside</span>
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                  Stay consistent.
                  <span className="buddysync-glow-text block">Together.</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  <span className="font-extrabold text-slate-900 dark:text-white">PulseSync (BuddySync)</span> combines lightweight daily tracking
                  with social accountability. Log steps, weight & workouts — share progress with a buddy, plan joint sessions, and protect your streak.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/auth" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Get Started — It’s Free
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    See how it works
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-500" /> Privacy-first sharing
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-500" /> Buddy codes: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">ALEX888</span> ·{' '}
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">JORDAN99</span>
                </span>
              </div>
            </div>

            {/* Hero Preview Card — dashboard snapshot with dummy data */}
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[2rem] buddysync-gradient-bg opacity-20 blur-2xl" />
              <Card glow="emerald" className="p-0 overflow-hidden shadow-2xl">
                <div className="buddysync-gradient-bg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-50">
                      <Activity className="w-4 h-4" /> Live Demo Preview
                    </div>
                    <Badge variant="cyan" className="bg-white/20 text-white border-white/30">
                      Dummy data
                    </Badge>
                  </div>
                  <p className="text-sm font-bold mt-1">Welcome back, Alex Morgan! 💪</p>
                  <p className="text-xs text-emerald-50/90">You’re 2 workouts away from this week’s squad checkpoint.</p>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Step Goal</span>
                    <div className="scale-[0.72] -my-2">
                      <ProgressRing
                        progress={stepProgress}
                        size={140}
                        strokeWidth={12}
                        icon={<Footprints className="w-5 h-5" />}
                        centerText={DEMO_STATS.steps.toLocaleString()}
                        subText={`Target: ${DEMO_STATS.stepGoal.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">1,766 steps left • Preview</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Target Weight</span>
                        <Scale className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-black text-slate-900 dark:text-white">{DEMO_STATS.currentWeight}</span>
                        <span className="text-xs font-bold text-slate-500">{DEMO_STATS.unit}</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${weightProgress}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500">Target {DEMO_STATS.targetWeight} {DEMO_STATS.unit} • Demo</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-400">Hydration</span>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {DEMO_STATS.waterMl} / {DEMO_STATS.waterGoal} ml
                        </p>
                      </div>
                      <Droplets className="w-5 h-5 text-cyan-500" />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
                      <Users className="w-3.5 h-3.5 text-purple-500" /> Squad
                    </div>
                    <div className="flex -space-x-2 my-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                        alt="Alex"
                        className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                        alt="Jordan"
                        className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Alex + Jordan — streak 7d 🔥</p>
                    <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Heart className="w-3 h-3" /> 2 cheers • preview
                    </span>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <Link href="/auth" className="block">
                    <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Sign in to replace this with your data
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="emerald" className="mb-3">
            Why BuddySync
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Everything you need to stay accountable
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Demo data below is exactly what you’ll see on day one — no setup required. Connect a buddy with a code when you’re ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card glow="cyan" hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
              <Footprints className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Daily Metric Tracking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Log weight, steps & hydration in seconds. One-tap steppers (+1k, +2.5k) and water buttons (+250 ml) make it effortless.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
              <Zap className="w-3.5 h-3.5" /> Includes streak shields
            </div>
          </Card>

          <Card glow="emerald" hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Accountability Squad</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Invite by code (<span className="font-mono font-bold">ALEX888</span>). Share exact weight or just delta % — you control privacy.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <MessageCircle className="w-3.5 h-3.5" /> Cheer with 🔥 🙌 💪 🎉 ❤️
            </div>
          </Card>

          <Card glow="purple" hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Joint Workout Planner</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Interactive calendar with pending → accepted flow. Set activity, time & location notes for shared sessions.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
              <Target className="w-3.5 h-3.5" /> Metro Fitness · Leg Day
            </div>
          </Card>

          <Card glow="amber" hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Progress & Gamification</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Weight & step charts, milestone badges (Consistency King, Weekly Champion), nudges, and leaderboards.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-500">
              <Trophy className="w-3.5 h-3.5" /> Badges + confetti 🎉
            </div>
          </Card>
        </div>
      </section>

      {/* ── Screens / Demo Data Showcase ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Explore the screens — powered by dummy data</h2>
          <Badge variant="slate" className="ml-2 hidden sm:inline-flex">
            Offline demo mode
          </Badge>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 -mt-6 max-w-3xl">
          These are real components from the app rendered with the same deterministic demo dataset that loads when no database is configured.
          After login, your own logs replace these values instantly.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dashboard preview */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Dashboard
              </h3>
              <Badge variant="cyan">Preview</Badge>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full w-[82%] buddysync-gradient-bg" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold">8,234 steps • 82%</span>
                <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold">72.8 kg • -2.1% Δ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Streak 7 days
                </span>
                <span className="text-[11px] px-2 py-1 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-bold">HIIT • 45 min</span>
              </div>
            </div>
            <Link href="/auth">
              <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Open Dashboard after login
              </Button>
            </Link>
          </Card>

          {/* Buddy Feed preview */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-500" /> Buddy Feed
              </h3>
              <Badge variant="emerald">Social</Badge>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                    alt="Jordan"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Jordan Lee • Running</p>
                    <p className="text-[11px] text-slate-500">5K Tempo Park Run • 28 min • High</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 border">🔥</span>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500 text-white font-bold">Cheer sent</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Eye className="w-3.5 h-3.5" /> Exact weight
                <span className="mx-1">·</span>
                <EyeOff className="w-3.5 h-3.5" /> Hide as <span className="font-bold text-emerald-600">-2.1% Δ</span>
              </div>
            </div>
            <Link href="/auth">
              <Button variant="outline" size="sm" className="w-full" rightIcon={<Users className="w-3.5 h-3.5" />}>
                View Buddy Feed after login
              </Button>
            </Link>
          </Card>

          {/* Calendar & Progress preview */}
          <div className="space-y-6">
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-purple-500" /> Calendar
                </h3>
                <Badge variant="amber">Joint</Badge>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Leg Day & Core — pending</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3 text-purple-500" /> Jordan → Alex • Metro Fitness
                </p>
                <div className="mt-2 flex gap-1.5">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500 text-white font-bold">Accept</span>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-white dark:bg-slate-800 border font-bold">Decline</span>
                </div>
              </div>
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Progress
                </h3>
                <Badge variant="slate">Charts</Badge>
              </div>
              <div className="h-20 rounded-xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-slate-200 dark:border-slate-700 flex items-end gap-1 p-2">
                {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-emerald-500/80" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Consistency King — unlocked
                <span className="ml-auto flex items-center gap-1 text-slate-400">
                  <Lock className="w-3 h-3" /> Weekly Champion locked
                </span>
              </div>
            </Card>
          </div>
        </div>

        {/* Privacy highlight strip */}
        <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">Privacy-first by design</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                Choose <span className="font-bold">Exact weight</span> or <span className="font-bold">% change only</span> on the buddy feed. Your invite code is yours to share — no email scraping.
              </p>
            </div>
          </div>
          <Link href="/auth" className="shrink-0 w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Create Account
            </Button>
          </Link>
        </Card>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              step: '01',
              title: 'Set your targets',
              desc: 'Weight, step goal, weekly checkpoint & hydration — pick kg/lbs, set invite code.',
              icon: <Target className="w-5 h-5" />,
            },
            {
              step: '02',
              title: 'Log daily in seconds',
              desc: 'Steps, weight, water & workouts. Streak shields protect off-days.',
              icon: <Dumbbell className="w-5 h-5" />,
            },
            {
              step: '03',
              title: 'Stay accountable together',
              desc: 'Cheer, nudge, schedule joint sessions & watch the leaderboard.',
              icon: <Heart className="w-5 h-5" />,
            },
          ].map((s) => (
            <Card key={s.step} className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 text-7xl font-black text-slate-900/[0.04] dark:text-white/[0.04]">{s.step}</div>
              <div className="relative space-y-2">
                <div className="w-8 h-8 rounded-lg buddysync-gradient-bg flex items-center justify-center text-white text-xs font-black">
                  {s.step}
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-emerald-500">{s.icon}</span> {s.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Final CTA Banner ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-[2rem] buddysync-gradient-bg p-6 sm:p-10 text-white shadow-xl shadow-emerald-500/20">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Ready when you are
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">
                See your own numbers replace the demo — in 30 seconds.
              </h2>
              <p className="text-sm text-emerald-50 mt-2 max-w-xl">
                Sign in, set your goals, and invite a buddy with your code. Your data stays in your browser in demo mode, or syncs to Supabase when configured.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full lg:w-auto">
              <Link href="/auth" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50 border-white shadow-none"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In / Register
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto text-white hover:bg-white/10 border border-white/30"
                >
                  Learn more
                </Button>
              </a>
            </div>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-4">
          Preview uses offline dummy data (Alex • 78.5→70 kg, Jordan • squad feed). No account needed to explore — sign in to make it yours.
        </p>
      </section>
    </div>
  );
};

export default LandingPage;
