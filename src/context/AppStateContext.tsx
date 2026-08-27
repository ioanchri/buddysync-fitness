'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  UserProfile, 
  DailyLog, 
  Workout, 
  SharedFeedItem, 
  JointWorkoutInvite, 
  MilestoneBadge, 
  LogReaction,
  NudgeNotification
} from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendBrowserNotification } from '@/lib/notifications';
import { format, subDays } from 'date-fns';

interface AppStateContextType {
  user: UserProfile | null;
  isDemoMode: boolean;
  isLoadingUser: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toast: { id: string; text: string } | null;
  dismissToast: () => void;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; message: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchAccount: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  dailyLogs: DailyLog[];
  workouts: Workout[];
  buddies: UserProfile[];
  sharedFeed: SharedFeedItem[];
  jointInvites: JointWorkoutInvite[];
  nudges: NudgeNotification[];
  milestones: MilestoneBadge[];
  logDailyMetrics: (metrics: { weight?: number; steps: number; logDate?: string }) => void;
  logWater: (amountMl: number) => void;
  exportDailyLogsCsv: () => void;
  useStreakShield: () => { success: boolean; message: string };
  sendNudge: (buddyId: string, type: 'workout' | 'water' | 'high_five') => void;
  addWorkout: (workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>) => void;
  updateWorkout: (id: string, updates: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => void;
  inviteBuddyByCode: (code: string) => Promise<{ success: boolean; message: string }>;
  addReaction: (itemId: string, emoji: string, message?: string) => void;
  createWorkoutInvite: (invite: { buddyId: string; scheduledAt: string; activityType: string; locationNotes?: string }) => void;
  respondToInvite: (inviteId: string, status: 'accepted' | 'declined' | 'completed' | 'missed') => void;
  resetDemoData: () => void;
  refreshData: () => Promise<void>;
}

const DEFAULT_USERS_DATABASE: UserProfile[] = [
  {
    id: 'usr-alex-1',
    full_name: 'Alex Morgan',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    initial_weight: 78.5,
    target_weight: 70.0,
    step_goal: 10000,
    weekly_checkpoint_goal: 5,
    water_goal_ml: 2500,
    streak_shields: 2,
    streak_days: 7,
    weight_unit: 'kg',
    share_exact_weight: true,
    invite_code: 'ALEX888',
  },
  {
    id: 'usr-jordan-2',
    full_name: 'Jordan Lee',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    initial_weight: 85.0,
    target_weight: 78.0,
    step_goal: 12000,
    weekly_checkpoint_goal: 4,
    water_goal_ml: 3000,
    streak_shields: 1,
    streak_days: 12,
    weight_unit: 'kg',
    share_exact_weight: false,
    invite_code: 'JORDAN99',
  },
];

const generateDeterministicLogs = (userId: string): DailyLog[] => {
  const logs: DailyLog[] = [];
  const baseWeight = 73.5;
  const stepPreset = [9500, 10400, 11200, 8900, 10100, 12300, 10800];
  const waterPreset = [2000, 2500, 2250, 1750, 2500, 2750, 2500];

  for (let i = 6; i >= 1; i--) {
    const d = subDays(new Date(), i);
    logs.push({
      id: `log-${userId}-${i}`,
      user_id: userId,
      date: format(d, 'yyyy-MM-dd'),
      weight: Number((baseWeight - (6 - i) * 0.2).toFixed(1)),
      steps: stepPreset[6 - i],
      water_ml: waterPreset[6 - i],
    });
  }
  return logs.sort((a, b) => b.date.localeCompare(a.date));
};

const generateDeterministicWorkouts = (userId: string): Workout[] => [
  {
    id: `wo-${userId}-1`,
    user_id: userId,
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    title: 'High Intensity Interval Training',
    category: 'Gym',
    duration_minutes: 45,
    intensity: 'High',
    notes: 'Sweaty session! Smashing burpees & kettlebell swings.',
  },
  {
    id: `wo-${userId}-2`,
    user_id: userId,
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    title: 'Upper Body Power & Core',
    category: 'Weightlifting',
    duration_minutes: 60,
    intensity: 'Extreme',
    notes: 'New personal record on bench press!',
  }
];

const generateInitialBadges = (): MilestoneBadge[] => [
  {
    id: 'b-1',
    title: 'First Step taken',
    description: 'Log your very first daily metrics',
    icon: 'Footprints',
    unlocked: true,
    category: 'steps',
  },
  {
    id: 'b-2',
    title: 'Consistency King',
    description: 'Hit 10,000+ steps 3 days in a row',
    icon: 'Zap',
    unlocked: true,
    category: 'streak',
  },
  {
    id: 'b-3',
    title: 'Accountability Squad',
    description: 'Connect with an accountability buddy',
    icon: 'Users',
    unlocked: true,
    category: 'buddy',
  },
  {
    id: 'b-4',
    title: 'Weekly Champion',
    description: 'Complete 5 workouts in a single week',
    icon: 'Trophy',
    unlocked: false,
    category: 'streak',
  }
];

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Shared localStorage keys so demo accounts (Alex/Jordan) can "notify" each other within the same browser.
const NUDGES_STORAGE_KEY = 'buddysync_nudges';
const JOINT_INVITES_STORAGE_KEY = 'buddysync_joint_invites';
const REACTIONS_STORAGE_KEY = 'buddysync_reactions';

interface StoredReactionRecord {
  itemId: string;
  recipientId: string;
  reaction: LogReaction;
}

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Demo mode state
  const [user, setUser] = useState<UserProfile | null>(isSupabaseConfigured ? null : DEFAULT_USERS_DATABASE[0]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEFAULT_USERS_DATABASE);

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() =>
    isSupabaseConfigured ? [] : generateDeterministicLogs(DEFAULT_USERS_DATABASE[0].id)
  );
  const [workouts, setWorkouts] = useState<Workout[]>(() =>
    isSupabaseConfigured ? [] : generateDeterministicWorkouts(DEFAULT_USERS_DATABASE[0].id)
  );
  const [buddies, setBuddies] = useState<UserProfile[]>(isSupabaseConfigured ? [] : [DEFAULT_USERS_DATABASE[1]]);

  const [sharedFeed, setSharedFeed] = useState<SharedFeedItem[]>([]);
  const [jointInvites, setJointInvites] = useState<JointWorkoutInvite[]>([]);
  const [nudges, setNudges] = useState<NudgeNotification[]>([]);
  const [milestones, setMilestones] = useState<MilestoneBadge[]>(generateInitialBadges);
  const [toast, setToast] = useState<{ id: string; text: string } | null>(null);

  // Track ids already handled so the cross-tab storage listener doesn't re-notify for old/duplicate entries.
  const userRef = useRef<UserProfile | null>(user);
  const knownNudgeIdsRef = useRef<Set<string>>(new Set());
  const knownReactionIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const dismissToast = () => setToast(null);

  const showToast = (text: string) => {
    const id = `toast-${Date.now()}`;
    setToast({ id, text });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  };

  const isDemoMode = !isSupabaseConfigured;

  // ─── Supabase: Fetch all user data ────────────────────────────────────────
  const fetchUserData = useCallback(async (userId: string) => {
    if (!supabase) return;

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setUser({
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url || '',
        initial_weight: profile.initial_weight ?? 75,
        target_weight: profile.target_weight ?? 70,
        step_goal: profile.step_goal ?? 10000,
        weekly_checkpoint_goal: profile.weekly_checkpoint_goal ?? 5,
        water_goal_ml: profile.water_goal_ml ?? 2500,
        streak_shields: profile.streak_shields ?? 2,
        streak_days: profile.streak_days ?? 1,
        weight_unit: profile.weight_unit ?? 'kg',
        share_exact_weight: profile.share_exact_weight ?? true,
        invite_code: profile.invite_code,
        created_at: profile.created_at,
      });
    }

    // Fetch daily logs (last 30 days)
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);
    if (logs) setDailyLogs(logs as DailyLog[]);

    // Fetch workouts
    const { data: wks } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(50);
    if (wks) setWorkouts(wks as Workout[]);

    // Fetch accepted buddies
    const { data: buddyRows } = await supabase
      .from('buddies')
      .select('*, requester:requester_id(*), addressee:addressee_id(*)')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (buddyRows) {
      const buddyProfiles: UserProfile[] = buddyRows.map((row: any) => {
        const isRequester = row.requester_id === userId;
        const rawProfile = isRequester ? row.addressee : row.requester;
        return {
          id: rawProfile.id,
          full_name: rawProfile.full_name,
          avatar_url: rawProfile.avatar_url || '',
          initial_weight: rawProfile.initial_weight ?? 75,
          target_weight: rawProfile.target_weight ?? 70,
          step_goal: rawProfile.step_goal ?? 10000,
          weekly_checkpoint_goal: rawProfile.weekly_checkpoint_goal ?? 5,
          water_goal_ml: rawProfile.water_goal_ml ?? 2500,
          streak_shields: rawProfile.streak_shields ?? 2,
          streak_days: rawProfile.streak_days ?? 1,
          weight_unit: rawProfile.weight_unit ?? 'kg',
          share_exact_weight: rawProfile.share_exact_weight ?? true,
          invite_code: rawProfile.invite_code,
        };
      });
      setBuddies(buddyProfiles);

      // Build a shared feed from buddies' recent workouts & logs
      const buddyIds = buddyProfiles.map(b => b.id);
      if (buddyIds.length > 0) {
        const { data: buddyWorkouts } = await supabase
          .from('workouts')
          .select('*')
          .in('user_id', buddyIds)
          .order('created_at', { ascending: false })
          .limit(20);

        const { data: buddyLogs } = await supabase
          .from('daily_logs')
          .select('*')
          .in('user_id', buddyIds)
          .order('date', { ascending: false })
          .limit(20);

        const feedItems: SharedFeedItem[] = [];

        (buddyWorkouts || []).forEach((wk: any) => {
          const bp = buddyProfiles.find(b => b.id === wk.user_id);
          if (bp) {
            feedItems.push({
              id: `feed-wk-${wk.id}`,
              type: 'workout',
              user_id: bp.id,
              user_name: bp.full_name,
              user_avatar: bp.avatar_url,
              date: wk.date,
              workout: wk as Workout,
              reactions: [],
            });
          }
        });

        (buddyLogs || []).forEach((lg: any) => {
          const bp = buddyProfiles.find(b => b.id === lg.user_id);
          if (bp) {
            feedItems.push({
              id: `feed-lg-${lg.id}`,
              type: 'daily_log',
              user_id: bp.id,
              user_name: bp.full_name,
              user_avatar: bp.avatar_url,
              date: lg.date,
              log: lg as DailyLog,
              reactions: [],
            });
          }
        });

        feedItems.sort((a, b) => b.date.localeCompare(a.date));
        setSharedFeed(feedItems);
      }
    }

    // Fetch joint workout invites
    const { data: invites } = await supabase
      .from('joint_workout_invites')
      .select('*, host:host_id(*), buddy:buddy_id(*)')
      .or(`host_id.eq.${userId},buddy_id.eq.${userId}`)
      .order('scheduled_at', { ascending: true });

    if (invites) {
      setJointInvites(invites.map((inv: any) => ({
        id: inv.id,
        host_id: inv.host_id,
        host_name: inv.host?.full_name ?? 'Unknown',
        buddy_id: inv.buddy_id,
        buddy_name: inv.buddy?.full_name ?? 'Unknown',
        scheduled_at: inv.scheduled_at,
        activity_type: inv.activity_type,
        location_notes: inv.location_notes,
        status: inv.status,
        created_at: inv.created_at,
      })));
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      setUser((prev) => prev ?? {
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Athlete',
        avatar_url: authUser.user_metadata?.avatar_url || '',
        initial_weight: 75,
        target_weight: 70,
        step_goal: 10000,
        weekly_checkpoint_goal: 5,
        water_goal_ml: 2500,
        streak_shields: 2,
        streak_days: 1,
        weight_unit: 'kg',
        share_exact_weight: true,
        invite_code: 'LOADING',
      });
      await fetchUserData(authUser.id);
    }
  }, [fetchUserData]);

  // ─── Mount + Auth state listener ──────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('buddysync_theme') as 'dark' | 'light' | null;
    const currentTheme = savedTheme || 'dark';
    setTheme(currentTheme);
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');

    const savedNudges = localStorage.getItem(NUDGES_STORAGE_KEY);
    if (savedNudges) {
      try {
        const parsed: NudgeNotification[] = JSON.parse(savedNudges);
        setNudges(parsed);
        parsed.forEach(n => knownNudgeIdsRef.current.add(n.id));
      } catch (e) {}
    }

    const savedReactions = localStorage.getItem(REACTIONS_STORAGE_KEY);
    if (savedReactions) {
      try {
        const parsed: StoredReactionRecord[] = JSON.parse(savedReactions);
        parsed.forEach(r => knownReactionIdsRef.current.add(r.reaction.id));
      } catch (e) {}
    }

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode: restore from localStorage
      const savedAllUsers = localStorage.getItem('buddysync_all_users');
      if (savedAllUsers) {
        try { setAllUsers(JSON.parse(savedAllUsers)); } catch (e) {}
      }
      const savedActiveUser = localStorage.getItem('buddysync_active_user');
      if (savedActiveUser) {
        try { setUser(JSON.parse(savedActiveUser)); } catch (e) {}
      }
      setIsLoadingUser(false);
      return;
    }

    // Supabase mode: listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsLoadingUser(true);
        setUser({
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Athlete',
          avatar_url: session.user.user_metadata?.avatar_url || '',
          initial_weight: 75,
          target_weight: 70,
          step_goal: 10000,
          weekly_checkpoint_goal: 5,
          water_goal_ml: 2500,
          streak_shields: 2,
          streak_days: 1,
          weight_unit: 'kg',
          share_exact_weight: true,
          invite_code: 'LOADING',
        });
        await fetchUserData(session.user.id);
        setIsLoadingUser(false);
      } else {
        setUser(null);
        setDailyLogs([]);
        setWorkouts([]);
        setBuddies([]);
        setSharedFeed([]);
        setJointInvites([]);
        setIsLoadingUser(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  // ─── Cross-tab live sync: notifies the receiver in real time if they have another tab/window open ──
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NUDGES_STORAGE_KEY && e.newValue) {
        try {
          const updated: NudgeNotification[] = JSON.parse(e.newValue);
          setNudges(updated);
          updated.forEach(n => {
            if (knownNudgeIdsRef.current.has(n.id)) return;
            knownNudgeIdsRef.current.add(n.id);
            const currentUser = userRef.current;
            if (currentUser && n.buddy_id === currentUser.id && n.sender_id !== currentUser.id) {
              showToast(n.message);
              sendBrowserNotification(`📣 ${n.sender_name} sent you a nudge!`, { body: n.message });
            }
          });
        } catch (err) {}
        return;
      }

      if (e.key === REACTIONS_STORAGE_KEY && e.newValue) {
        try {
          const records: StoredReactionRecord[] = JSON.parse(e.newValue);
          records.forEach(rec => {
            if (knownReactionIdsRef.current.has(rec.reaction.id)) return;
            knownReactionIdsRef.current.add(rec.reaction.id);

            setSharedFeed(prev => prev.map(item =>
              item.id === rec.itemId && !item.reactions.some(r => r.id === rec.reaction.id)
                ? { ...item, reactions: [...item.reactions, rec.reaction] }
                : item
            ));

            const currentUser = userRef.current;
            if (currentUser && rec.recipientId === currentUser.id && rec.reaction.sender_id !== currentUser.id) {
              const text = `${rec.reaction.emoji} ${rec.reaction.sender_name} cheered your progress!`;
              showToast(text);
              sendBrowserNotification(text, { body: rec.reaction.message || 'Sent an encouragement reaction.' });
            }
          });
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ─── Demo mode: load per-user data from localStorage ──────────────────────
  useEffect(() => {
    if (!user || !mounted || isSupabaseConfigured) return;

    const savedLogs = localStorage.getItem(`buddysync_logs_${user.id}`);
    if (savedLogs) {
      try { setDailyLogs(JSON.parse(savedLogs)); } catch (e) {}
    } else {
      setDailyLogs(generateDeterministicLogs(user.id));
    }

    const savedWorkouts = localStorage.getItem(`buddysync_workouts_${user.id}`);
    if (savedWorkouts) {
      try { setWorkouts(JSON.parse(savedWorkouts)); } catch (e) {}
    } else {
      setWorkouts(generateDeterministicWorkouts(user.id));
    }

    const buddyObj = allUsers.find(u => u.id !== user.id) || DEFAULT_USERS_DATABASE[1];
    setBuddies([buddyObj]);

    const seededFeed: SharedFeedItem[] = [
      {
        id: `feed-1`,
        type: 'workout',
        user_id: buddyObj.id,
        user_name: buddyObj.full_name,
        user_avatar: buddyObj.avatar_url,
        date: format(new Date(), 'yyyy-MM-dd'),
        workout: {
          id: `b-wo-1`,
          user_id: buddyObj.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          title: '5K Tempo Park Run',
          category: 'Running',
          duration_minutes: 28,
          intensity: 'High',
          notes: 'Pushed pace! Beat my previous 5k time by 45 seconds.',
        },
        reactions: [
          {
            id: `r-1`,
            sender_id: user.id,
            sender_name: user.full_name,
            emoji: '🔥',
            message: 'Crushing it! Keep that pace up!',
            created_at: new Date().toISOString(),
          }
        ]
      },
      {
        id: `feed-2`,
        type: 'daily_log',
        user_id: buddyObj.id,
        user_name: buddyObj.full_name,
        user_avatar: buddyObj.avatar_url,
        date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        log: {
          id: `b-log-1`,
          user_id: buddyObj.id,
          date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
          weight: 80.2,
          steps: 13420,
          water_ml: 2750,
        },
        reactions: []
      }
    ];

    // Re-apply any cheers/reactions a buddy already left while this tab wasn't open.
    const storedReactionsRaw = localStorage.getItem(REACTIONS_STORAGE_KEY);
    let storedReactions: StoredReactionRecord[] = [];
    if (storedReactionsRaw) {
      try { storedReactions = JSON.parse(storedReactionsRaw); } catch (e) {}
    }
    storedReactions.forEach(rec => knownReactionIdsRef.current.add(rec.reaction.id));

    setSharedFeed(seededFeed.map(item => {
      const extra = storedReactions
        .filter(rec => rec.itemId === item.id)
        .map(rec => rec.reaction)
        .filter(reaction => !item.reactions.some(existing => existing.id === reaction.id));
      return extra.length > 0 ? { ...item, reactions: [...item.reactions, ...extra] } : item;
    }));

    const savedInvites = localStorage.getItem(JOINT_INVITES_STORAGE_KEY);
    if (savedInvites) {
      try { setJointInvites(JSON.parse(savedInvites)); } catch (e) {
        setJointInvites([{
          id: 'invite-1',
          host_id: buddyObj.id,
          host_name: buddyObj.full_name,
          buddy_id: user.id,
          buddy_name: user.full_name,
          scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
          activity_type: 'Leg Day & Core Workout',
          location_notes: 'Metro Fitness Gym - Main Floor',
          status: 'pending',
          created_at: new Date().toISOString(),
        }]);
      }
    } else {
      setJointInvites([
        {
          id: 'invite-1',
          host_id: buddyObj.id,
          host_name: buddyObj.full_name,
          buddy_id: user.id,
          buddy_name: user.full_name,
          scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
          activity_type: 'Leg Day & Core Workout',
          location_notes: 'Metro Fitness Gym - Main Floor',
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      ]);
    }
  }, [user?.id, mounted]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, mounted]);

  // ─── Theme ────────────────────────────────────────────────────────────────
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('buddysync_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  // ─── Auth ─────────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string, fullName: string): Promise<{ success: boolean; message: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Account created! Check your email to confirm, then sign in.` };
    }

    // Demo mode
    const newCode = `BUDDY-${Math.floor(100 + Math.random() * 900)}`;
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      full_name: fullName.trim(),
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`,
      initial_weight: 75.0,
      target_weight: 70.0,
      step_goal: 10000,
      weekly_checkpoint_goal: 5,
      water_goal_ml: 2500,
      streak_shields: 2,
      streak_days: 1,
      weight_unit: 'kg',
      share_exact_weight: true,
      invite_code: newCode,
    };
    const updatedAll = [...allUsers, newUser];
    setAllUsers(updatedAll);
    setUser(newUser);
    localStorage.setItem('buddysync_all_users', JSON.stringify(updatedAll));
    localStorage.setItem('buddysync_active_user', JSON.stringify(newUser));
    return { success: true, message: `Account created! Welcome to BuddySync, ${fullName}.` };
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, message: error.message };
      // onAuthStateChange will fire and call fetchUserData
      return { success: true, message: `Welcome back!` };
    }

    // Demo mode
    const found = allUsers.find(u =>
      u.full_name.toLowerCase().includes(email.toLowerCase()) ||
      email.toLowerCase().includes(u.full_name.toLowerCase().split(' ')[0])
    );
    let targetUser: UserProfile;
    if (found) {
      targetUser = found;
    } else {
      const newCode = `BUDDY-${Math.floor(100 + Math.random() * 900)}`;
      targetUser = {
        id: `usr-${Date.now()}`,
        full_name: email.split('@')[0].replace('.', ' '),
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        initial_weight: 75.0, target_weight: 70.0, step_goal: 10000,
        weekly_checkpoint_goal: 5, water_goal_ml: 2500, streak_shields: 2,
        streak_days: 1, weight_unit: 'kg', share_exact_weight: true, invite_code: newCode,
      };
      setAllUsers(prev => [...prev, targetUser]);
    }
    setUser(targetUser);
    localStorage.setItem('buddysync_active_user', JSON.stringify(targetUser));
    return { success: true, message: `Welcome back, ${targetUser.full_name}!` };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
      // onAuthStateChange will clear state
      return;
    }
    setUser(null);
    localStorage.removeItem('buddysync_active_user');
  };

  const switchAccount = () => {
    if (isSupabaseConfigured) return; // N/A in live mode
    const otherUser = allUsers.find(u => u.id !== user?.id) || DEFAULT_USERS_DATABASE[1];
    setUser(otherUser);
    localStorage.setItem('buddysync_active_user', JSON.stringify(otherUser));
  };

  // ─── Profile ──────────────────────────────────────────────────────────────
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update({
        full_name: updated.full_name,
        avatar_url: updated.avatar_url,
        initial_weight: updated.initial_weight,
        target_weight: updated.target_weight,
        step_goal: updated.step_goal,
        weekly_checkpoint_goal: updated.weekly_checkpoint_goal,
        water_goal_ml: updated.water_goal_ml,
        streak_shields: updated.streak_shields,
        streak_days: updated.streak_days,
        weight_unit: updated.weight_unit,
        share_exact_weight: updated.share_exact_weight,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
      return;
    }

    const updatedAll = allUsers.map(u => u.id === updated.id ? updated : u);
    setAllUsers(updatedAll);
    localStorage.setItem('buddysync_active_user', JSON.stringify(updated));
    localStorage.setItem('buddysync_all_users', JSON.stringify(updatedAll));
  };

  // ─── Daily Metrics ────────────────────────────────────────────────────────
  const logDailyMetrics = async ({ weight, steps, logDate }: { weight?: number; steps: number; logDate?: string }) => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const targetDate = (logDate && logDate.trim()) ? logDate : today;

    if (isSupabaseConfigured && supabase) {
      const existing = dailyLogs.find(l => l.date === targetDate);
      const payload = {
        user_id: user.id,
        date: targetDate,
        steps,
        ...(weight !== undefined ? { weight } : {}),
        water_ml: existing?.water_ml ?? 0,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('daily_logs')
        .upsert(payload, { onConflict: 'user_id,date' })
        .select()
        .single();
      if (!error && data) {
        setDailyLogs(prev => {
          const idx = prev.findIndex(l => l.date === targetDate);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = data as DailyLog;
            return updated;
          }
          return [data as DailyLog, ...prev];
        });
      }
      return;
    }

    // Demo mode
    setDailyLogs(prev => {
      const existingIdx = prev.findIndex(l => l.date === targetDate);
      let updatedLogs: DailyLog[];
      if (existingIdx >= 0) {
        updatedLogs = [...prev];
        updatedLogs[existingIdx] = {
          ...updatedLogs[existingIdx],
          steps,
          ...(weight !== undefined ? { weight } : {})
        };
      } else {
        const newLog: DailyLog = {
          id: `log-${Date.now()}`,
          user_id: user.id,
          date: targetDate,
          weight: weight ?? user.initial_weight,
          steps,
          water_ml: 0,
        };
        updatedLogs = [newLog, ...prev];
      }
      const sortedLogs = [...updatedLogs].sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem(`buddysync_logs_${user.id}`, JSON.stringify(sortedLogs));
      return sortedLogs;
    });
  };

  const exportDailyLogsCsv = () => {
    if (!user || dailyLogs.length === 0) return;

    const headers = ['date', 'weight', 'steps', 'water_ml'];
    const rows = [...dailyLogs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((log) => [
        log.date,
        log.weight ?? '',
        log.steps,
        log.water_ml,
      ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => {
        const value = String(cell ?? '');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const safeName = user.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    anchor.href = url;
    anchor.download = `buddysync-logs-${safeName}-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  // ─── Water Logging ────────────────────────────────────────────────────────
  const logWater = async (amountMl: number) => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const existing = dailyLogs.find(l => l.date === today);
    const newWater = Math.max(0, (existing?.water_ml ?? 0) + amountMl);

    if (isSupabaseConfigured && supabase) {
      const payload = {
        user_id: user.id,
        date: today,
        steps: existing?.steps ?? 0,
        water_ml: newWater,
        ...(existing?.weight !== undefined ? { weight: existing.weight } : {}),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('daily_logs')
        .upsert(payload, { onConflict: 'user_id,date' })
        .select()
        .single();
      if (!error && data) {
        setDailyLogs(prev => {
          const idx = prev.findIndex(l => l.date === today);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = data as DailyLog;
            return updated;
          }
          return [data as DailyLog, ...prev];
        });
      }
      return;
    }

    // Demo mode
    setDailyLogs(prev => {
      const existingIdx = prev.findIndex(l => l.date === today);
      let updatedLogs: DailyLog[];
      if (existingIdx >= 0) {
        updatedLogs = [...prev];
        updatedLogs[existingIdx] = { ...updatedLogs[existingIdx], water_ml: newWater };
      } else {
        const newLog: DailyLog = {
          id: `log-${Date.now()}`, user_id: user.id, date: today, steps: 0, water_ml: newWater,
        };
        updatedLogs = [newLog, ...prev];
      }
      localStorage.setItem(`buddysync_logs_${user.id}`, JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  // ─── Streak Shield ────────────────────────────────────────────────────────
  const useStreakShield = (): { success: boolean; message: string } => {
    if (!user) return { success: false, message: "Log in first" };
    if (user.streak_shields <= 0) {
      return { success: false, message: "No Streak Shields available! Earn one by reaching weekly targets." };
    }
    updateProfile({ streak_shields: user.streak_shields - 1 });
    return { success: true, message: "Streak Shield activated! Your streak is protected today 🛡️" };
  };

  // ─── Nudges ───────────────────────────────────────────────────────────────
  const sendNudge = (buddyId: string, type: 'workout' | 'water' | 'high_five') => {
    if (!user) return;
    const messages = {
      workout: `⚡ ${user.full_name} nudged you to hit today's workout!`,
      water: `💧 ${user.full_name} sent a hydration reminder! Drink a glass of water.`,
      high_five: `🙌 ${user.full_name} sent you a High Five for crushing goals!`,
    };
    const newNudge: NudgeNotification = {
      id: `nudge-${Date.now()}`,
      sender_id: user.id,
      sender_name: user.full_name,
      buddy_id: buddyId,
      type,
      message: messages[type],
      created_at: new Date().toISOString(),
    };
    knownNudgeIdsRef.current.add(newNudge.id);
    setNudges(prev => {
      const updated = [newNudge, ...prev];
      // Shared storage key so the buddy sees it once they're the active demo account.
      localStorage.setItem(NUDGES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    const buddyName = buddies.find(b => b.id === buddyId)?.full_name || 'your buddy';
    const confirmationTitles = {
      workout: `⚡ Workout nudge sent to ${buddyName}`,
      water: `💧 Hydration reminder sent to ${buddyName}`,
      high_five: `🙌 High Five sent to ${buddyName}`,
    };
    showToast(confirmationTitles[type]);
    sendBrowserNotification(confirmationTitles[type], { body: newNudge.message });
  };

  // ─── Workouts ─────────────────────────────────────────────────────────────
  const addWorkout = async (workoutData: Omit<Workout, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('workouts')
        .insert({ ...workoutData, user_id: user.id })
        .select()
        .single();
      if (!error && data) {
        const newWorkout = data as Workout;
        setWorkouts(prev => [newWorkout, ...prev]);
        setSharedFeed(prev => [{
          id: `feed-wo-${newWorkout.id}`,
          type: 'workout',
          user_id: user.id,
          user_name: user.full_name,
          user_avatar: user.avatar_url,
          date: newWorkout.date,
          workout: newWorkout,
          reactions: [],
        }, ...prev]);
      }
      return;
    }

    // Demo mode
    const newWorkout: Workout = {
      ...workoutData,
      id: `wo-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };
    setWorkouts(prev => {
      const updated = [newWorkout, ...prev];
      localStorage.setItem(`buddysync_workouts_${user.id}`, JSON.stringify(updated));
      return updated;
    });
    setSharedFeed(prev => [{
      id: `feed-wo-${Date.now()}`,
      type: 'workout',
      user_id: user.id,
      user_name: user.full_name,
      user_avatar: user.avatar_url,
      date: newWorkout.date,
      workout: newWorkout,
      reactions: [],
    }, ...prev]);
  };

  const updateWorkout = async (id: string, updates: Partial<Workout>) => {
    if (!user) return;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (!error && data && data.length > 0) {
        const updatedWorkout = data[0] as Workout;
        setWorkouts(prev => prev.map(w => w.id === id ? updatedWorkout : w));
        setSharedFeed(prev => prev.map(item => {
          if (item.type === 'workout' && item.workout?.id === id) {
            return { ...item, workout: updatedWorkout, date: updatedWorkout.date };
          }
          return item;
        }));
      }
      return;
    }

    setWorkouts(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, ...updates } : w);
      localStorage.setItem(`buddysync_workouts_${user.id}`, JSON.stringify(updated));
      return updated;
    });

    setSharedFeed(prev => prev.map(item => {
      if (item.type === 'workout' && item.workout?.id === id) {
        return {
          ...item,
          workout: item.workout ? { ...item.workout, ...updates } : item.workout,
          date: updates.date || item.date,
        };
      }
      return item;
    }));
  };

  const deleteWorkout = async (id: string) => {
    if (!user) return;

    if (isSupabaseConfigured && supabase) {
      await supabase.from('workouts').delete().eq('id', id).eq('user_id', user.id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
      setSharedFeed(prev => prev.filter(item => !(item.type === 'workout' && item.workout?.id === id)));
      return;
    }

    setWorkouts(prev => {
      const updated = prev.filter(w => w.id !== id);
      localStorage.setItem(`buddysync_workouts_${user.id}`, JSON.stringify(updated));
      return updated;
    });
    setSharedFeed(prev => prev.filter(item => !(item.type === 'workout' && item.workout?.id === id)));
  };

  // ─── Buddy Connection ─────────────────────────────────────────────────────
  const inviteBuddyByCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "Please log in first" };
    const normalizedInput = code.trim();
    const cleanCode = normalizedInput.toUpperCase();

    if (!cleanCode) {
      return { success: false, message: "Please enter a valid invite code." };
    }

    if (cleanCode === user.invite_code?.toUpperCase()) {
      return { success: false, message: "You cannot add yourself as a buddy!" };
    }
    if (buddies.some(b => b.invite_code?.toUpperCase() === cleanCode)) {
      return { success: false, message: "Buddy is already connected in your squad!" };
    }

    if (isSupabaseConfigured && supabase) {
      // Stored invite codes may be lowercased by the DB default; do a case-insensitive lookup.
      const { data: targetProfile, error: lookupErr } = await supabase
        .from('profiles')
        .select('*')
        .ilike('invite_code', cleanCode)
        .single();

      if (lookupErr || !targetProfile) {
        if (normalizedInput.includes('@')) {
          return { success: false, message: "Email lookup is not supported yet. Please use your buddy's invite code." };
        }
        return { success: false, message: "No user found with that invite code." };
      }

      // Insert buddy connection
      const { error: insertErr } = await supabase.from('buddies').insert({
        requester_id: user.id,
        addressee_id: targetProfile.id,
        status: 'accepted', // auto-accept for simplicity; could be 'pending'
      });

      if (insertErr) {
        if (insertErr.message.toLowerCase().includes('duplicate key')) {
          return { success: false, message: "Buddy connection already exists." };
        }
        return { success: false, message: insertErr.message };
      }

      const newBuddy: UserProfile = {
        id: targetProfile.id,
        full_name: targetProfile.full_name,
        avatar_url: targetProfile.avatar_url || '',
        initial_weight: targetProfile.initial_weight ?? 75,
        target_weight: targetProfile.target_weight ?? 70,
        step_goal: targetProfile.step_goal ?? 10000,
        weekly_checkpoint_goal: targetProfile.weekly_checkpoint_goal ?? 5,
        water_goal_ml: targetProfile.water_goal_ml ?? 2500,
        streak_shields: targetProfile.streak_shields ?? 2,
        streak_days: targetProfile.streak_days ?? 1,
        weight_unit: targetProfile.weight_unit ?? 'kg',
        share_exact_weight: targetProfile.share_exact_weight ?? true,
        invite_code: targetProfile.invite_code,
      };
      setBuddies(prev => [...prev, newBuddy]);
      return { success: true, message: `Connected with ${newBuddy.full_name}!` };
    }

    // Demo mode
    const matchUser = allUsers.find(u => u.invite_code?.toUpperCase() === cleanCode);
    if (!matchUser) {
      if (normalizedInput.includes('@')) {
        return { success: false, message: "Email lookup is not supported in demo mode. Please use an invite code." };
      }
      return { success: false, message: "No user found with that invite code." };
    }
    const newBuddy: UserProfile = matchUser;
    setBuddies(prev => [...prev, newBuddy]);
    return { success: true, message: `Connected with ${newBuddy.full_name}!` };
  };

  // ─── Reactions ────────────────────────────────────────────────────────────
  const addReaction = async (itemId: string, emoji: string, message?: string) => {
    if (!user) return;

    const feedItemForToast = sharedFeed.find(f => f.id === itemId);
    const newReaction: LogReaction = {
      id: `r-${Date.now()}`,
      sender_id: user.id,
      sender_name: user.full_name,
      emoji,
      message,
      created_at: new Date().toISOString(),
    };
    knownReactionIdsRef.current.add(newReaction.id);

    // Optimistic UI update
    setSharedFeed(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, reactions: [...item.reactions, newReaction] };
      }
      return item;
    }));

    if (isSupabaseConfigured && supabase) {
      if (feedItemForToast) {
        const insertPayload: Record<string, unknown> = {
          sender_id: user.id,
          emoji,
          message: message || null,
        };
        if (feedItemForToast.type === 'workout' && feedItemForToast.workout) {
          insertPayload.workout_id = feedItemForToast.workout.id;
        } else if (feedItemForToast.type === 'daily_log' && feedItemForToast.log) {
          insertPayload.log_id = feedItemForToast.log.id;
        }
        await supabase.from('log_reactions').insert(insertPayload);
      }
    } else if (feedItemForToast) {
      // Persist so the recipient sees it once they're the active demo account (or live, via another open tab).
      const stored = localStorage.getItem(REACTIONS_STORAGE_KEY);
      let records: StoredReactionRecord[] = [];
      if (stored) {
        try { records = JSON.parse(stored); } catch (e) {}
      }
      records.push({ itemId, recipientId: feedItemForToast.user_id, reaction: newReaction });
      localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(records));
    }

    const recipientName = feedItemForToast?.user_name || 'your buddy';
    showToast(`${emoji} Cheer sent to ${recipientName}!`);
    sendBrowserNotification(`${emoji} Cheer sent to ${recipientName}!`, {
      body: message || 'Sent an encouragement reaction.',
    });
  };

  // ─── Joint Workout Invites ────────────────────────────────────────────────
  const createWorkoutInvite = async ({ buddyId, scheduledAt, activityType, locationNotes }: {
    buddyId: string; scheduledAt: string; activityType: string; locationNotes?: string;
  }) => {
    if (!user) return;
    const buddyObj = buddies.find(b => b.id === buddyId) || buddies[0] || DEFAULT_USERS_DATABASE[1];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('joint_workout_invites').insert({
        host_id: user.id,
        buddy_id: buddyObj.id,
        scheduled_at: scheduledAt,
        activity_type: activityType,
        location_notes: locationNotes || null,
        status: 'pending',
      }).select().single();

      if (!error && data) {
        setJointInvites(prev => [{
          id: data.id,
          host_id: user.id,
          host_name: user.full_name,
          buddy_id: buddyObj.id,
          buddy_name: buddyObj.full_name,
          scheduled_at: data.scheduled_at,
          activity_type: data.activity_type,
          location_notes: data.location_notes,
          status: data.status,
          created_at: data.created_at,
        }, ...prev]);
      }
      return;
    }

    // Demo mode
    const newInvite: JointWorkoutInvite = {
      id: `invite-${Date.now()}`,
      host_id: user.id,
      host_name: user.full_name,
      buddy_id: buddyObj.id,
      buddy_name: buddyObj.full_name,
      scheduled_at: scheduledAt,
      activity_type: activityType,
      location_notes: locationNotes,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setJointInvites(prev => {
      const updated = [newInvite, ...prev];
      localStorage.setItem(JOINT_INVITES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    sendBrowserNotification('📅 Joint workout invite sent!', {
      body: `Invited ${buddyObj.full_name} to ${activityType}.`,
    });
  };

  const respondToInvite = async (inviteId: string, status: 'accepted' | 'declined' | 'completed' | 'missed') => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('joint_workout_invites')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', inviteId);

      if (error) {
        showToast('Failed to update invite. Please try again.');
        return;
      }
    }

    setJointInvites(prev => {
      const updated = prev.map(inv => inv.id === inviteId ? { ...inv, status } : inv);
      if (!isSupabaseConfigured) localStorage.setItem(JOINT_INVITES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    if (!isSupabaseConfigured) {
      const statusLabels: Record<typeof status, string> = {
        accepted: 'accepted ✅',
        declined: 'declined ❌',
        completed: 'confirmed as completed 🎉',
        missed: 'marked as missed',
      };
      sendBrowserNotification('📅 Joint workout updated', {
        body: `Session status: ${statusLabels[status]}`,
      });
    }
  };

  // ─── Demo Reset ───────────────────────────────────────────────────────────
  const resetDemoData = () => {
    localStorage.clear();
    setAllUsers(DEFAULT_USERS_DATABASE);
    setUser(DEFAULT_USERS_DATABASE[0]);
    setDailyLogs(generateDeterministicLogs(DEFAULT_USERS_DATABASE[0].id));
    setWorkouts(generateDeterministicWorkouts(DEFAULT_USERS_DATABASE[0].id));
    setBuddies([DEFAULT_USERS_DATABASE[1]]);
    setJointInvites([]);
    setSharedFeed([]);
    setNudges([]);
  };

  return (
    <AppStateContext.Provider value={{
      user,
      isDemoMode,
      isLoadingUser,
      theme,
      toggleTheme,
      toast,
      dismissToast,
      signUp,
      login,
      logout,
      switchAccount,
      updateProfile,
      dailyLogs,
      workouts,
      buddies,
      sharedFeed,
      jointInvites,
      nudges,
      milestones,
      logDailyMetrics,
      logWater,
      exportDailyLogsCsv,
      useStreakShield,
      sendNudge,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      inviteBuddyByCode,
      addReaction,
      createWorkoutInvite,
      respondToInvite,
      resetDemoData,
      refreshData,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
