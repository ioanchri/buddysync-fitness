'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { SyncAndNotificationBar } from '@/components/dashboard/SyncAndNotificationBar';
import { 
  UserCheck, 
  Scale, 
  Footprints, 
  Target, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles,
  Database,
  GraduationCap,
  Play,
  Compass
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { WeightUnit } from '@/lib/types';
import { startTour } from '@/components/onboarding/JoyrideTour';
import { TOUR_STORAGE_KEY } from '@/components/onboarding/tourSteps';

const avatarSeeds = ['Mimi', 'Sasha', 'Lilly', 'Tigger', 'Bella', 'Zoe', 'Kitty', 'Nova', 'Cleo', 'Milo', 'Sage', 'Iris'] as const;

const avatarOptions = avatarSeeds.map((seed, index) => ({
  id: `avatar-${index + 1}`,
  src: `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(seed)}&size=128&radius=24&backgroundColor=ecfccb&backgroundColor=f8fafc&backgroundColor=e2e8f0&backgroundColor=dbeafe&backgroundColor=f3e8ff&backgroundColor=fef3c7`,
}));

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isDemoMode, updateProfile, resetDemoData } = useAppState();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [initialWeight, setInitialWeight] = useState((user?.initial_weight ?? 75.0).toString());
  const [targetWeight, setTargetWeight] = useState((user?.target_weight ?? 70.0).toString());
  const [stepGoal, setStepGoal] = useState((user?.step_goal ?? 10000).toString());
  const [weeklyGoal, setWeeklyGoal] = useState((user?.weekly_checkpoint_goal ?? 5).toString());
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(user?.weight_unit || 'kg');
  const [shareExactWeight, setShareExactWeight] = useState(user?.share_exact_weight ?? true);

  const [copiedCode, setCopiedCode] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  React.useEffect(() => {
    try {
      setTourCompleted(localStorage.getItem(TOUR_STORAGE_KEY) === 'true');
    } catch {}
    const handler = () => {
      try { setTourCompleted(localStorage.getItem(TOUR_STORAGE_KEY) === 'true'); } catch {}
    };
    window.addEventListener('storage', handler);
    // also listen custom finish event
    window.addEventListener('buddysync:tour-finished', handler as EventListener);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('buddysync:tour-finished', handler as EventListener);
    };
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = user;
    const parseOrFallback = (value: string, fallback: number) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && value.trim() !== '' ? parsed : fallback;
    };

    updateProfile({
      full_name: fullName.trim() || 'Fitness Tracker',
      avatar_url: avatarUrl.trim() || undefined,
      initial_weight: parseOrFallback(initialWeight, currentUser?.initial_weight ?? 75),
      target_weight: parseOrFallback(targetWeight, currentUser?.target_weight ?? 70),
      step_goal: parseOrFallback(stepGoal, currentUser?.step_goal ?? 10000),
      weekly_checkpoint_goal: parseOrFallback(weeklyGoal, currentUser?.weekly_checkpoint_goal ?? 5),
      weight_unit: weightUnit,
      share_exact_weight: shareExactWeight,
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const copyInviteCode = () => {
    if (user?.invite_code) {
      navigator.clipboard.writeText(user.invite_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-emerald-500" />
            <span>Profile & Goal Settings</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure your personal targets and accountability buddy privacy rules
          </p>
        </div>
        <Badge variant="emerald">BuddySync Profile</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols - Main Settings Form */}
        <div data-tour="onboarding-profile" className="md:col-span-2 space-y-6">
          <Card>
            <form key={user?.id ?? 'profile'} onSubmit={handleSaveProfile} className="space-y-5">
              
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                1. Basic Info
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Display Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="Avatar Image URL (Optional)"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Choose an avatar</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pick a modern profile look or keep your custom image URL.</p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {avatarOptions.map((option, index) => {
                    const isSelected = avatarUrl === option.src;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setAvatarUrl(option.src)}
                        className={`group relative rounded-2xl border p-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-400 hover:-translate-y-0.5'
                        }`}
                        aria-label={`Select avatar ${index + 1}`}
                      >
                        <div className="overflow-hidden rounded-xl bg-white/60 dark:bg-slate-900/40">
                          <Image
                            src={option.src}
                            alt=""
                            width={128}
                            height={128}
                            unoptimized
                            className="w-full aspect-square object-cover"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2 pt-2">
                2. Weight & Target Goals
              </h2>

              {/* Unit Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Preferred Unit System
                </label>
                <div className="flex items-center gap-3">
                  {(['kg', 'lbs'] as WeightUnit[]).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setWeightUnit(u)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                        weightUnit === u
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {u === 'kg' ? 'Kilograms (kg)' : 'Pounds (lbs)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={`Starting Weight (${weightUnit})`}
                  type="number"
                  step="0.1"
                  value={initialWeight}
                  onChange={(e) => setInitialWeight(e.target.value)}
                  leftIcon={<Scale className="w-4 h-4 text-emerald-500" />}
                />
                <Input
                  label={`Target Goal Weight (${weightUnit})`}
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  leftIcon={<Target className="w-4 h-4 text-cyan-500" />}
                />
              </div>

              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2 pt-2">
                3. Activity Targets
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Daily Step Goal"
                  type="number"
                  step="500"
                  value={stepGoal}
                  onChange={(e) => setStepGoal(e.target.value)}
                  leftIcon={<Footprints className="w-4 h-4 text-cyan-500" />}
                />
                <Input
                  label="Weekly Checkpoint Target (Workouts/Wk)"
                  type="number"
                  min="1"
                  max="14"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(e.target.value)}
                  leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
                />
              </div>

              {/* Privacy Setting */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Buddy Privacy Controls</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Choose how your weight progress displays on your buddy feed</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShareExactWeight(true)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      shareExactWeight
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold mb-1">
                      <Eye className="w-4 h-4 text-emerald-500" />
                      <span>Exact Weight</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">Buddies can see exact log (e.g., 73.5 kg)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShareExactWeight(false)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      !shareExactWeight
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold mb-1">
                      <EyeOff className="w-4 h-4 text-cyan-500" />
                      <span>Percentage Δ (Private)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">Shows weight change percentage (e.g., -2.1% Δ)</p>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between pt-3">
                {savedNotice ? (
                  <span className="text-xs font-bold text-emerald-500 animate-pulse">
                    ✓ Profile & Goals Updated!
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400">Updates sync instantly</span>
                )}
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Right 1 Col - Buddy Code Card & Tools */}
        <div className="space-y-6">
          <SyncAndNotificationBar />

          {/* Sync Status Card */}
          <Card>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Data Sync Status
            </h3>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
              {isDemoMode ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>Offline / Demo Mode — data saved to this browser only</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>Supabase Cloud Sync — data saved to your account</span>
                </>
              )}
            </div>
          </Card>

          {/* Invite Code Card */}
          <Card data-tour="onboarding-code" glow="emerald">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Your Accountability Code
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Share this unique code with a workout partner so they can connect with you on BuddySync:
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                {user?.invite_code || 'BUDDY888'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyInviteCode}
                leftIcon={copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedCode ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </Card>

          {/* Onboarding Tour Card — triggers Joyride */}
          <Card glow="cyan" data-tour="onboarding-tour-card" className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl buddysync-gradient-bg flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Onboarding</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Interactive guided tour with arrows & steps</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              New here? Take a 60-second walkthrough of every section — Dashboard, Buddies, Calendar, Progress & more — with spotlight arrows and Next / Back controls. Responsive on mobile.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => startTour(0)}
                leftIcon={<Play className="w-3.5 h-3.5" />}
                rightIcon={<Compass className="w-3.5 h-3.5" />}
              >
                {tourCompleted ? 'Replay Tour' : 'Start Interactive Tour'}
              </Button>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className={`font-bold ${tourCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {tourCompleted ? '✓ Completed — replay anytime' : 'Not completed yet'}
              </span>
              {tourCompleted && (
                <button
                  onClick={() => {
                    try { localStorage.removeItem(TOUR_STORAGE_KEY); setTourCompleted(false); } catch {}
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Developer & Testing Tools
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Need to test clean state? Reset LocalStorage demo logs and restored default buddy interactions.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-rose-500 dark:text-rose-400 hover:bg-rose-500/10"
              onClick={() => {
                resetDemoData();
                router.push('/');
              }}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset Data State
            </Button>
          </Card>

        </div>

      </div>
    </div>
  );
}
