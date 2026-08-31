'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Sun, Moon, Settings, LogOut, User, Bell, CalendarClock, Zap, CheckCircle2 } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { APP_VERSION } from '@/lib/appVersion';

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, theme, toggleTheme, logout, jointInvites, nudges } = useAppState();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);

  React.useEffect(() => {
    if (!user?.id) {
      setSeenNotificationIds([]);
      return;
    }

    const stored = localStorage.getItem(`buddysync_seen_notifications_${user.id}`);
    if (stored) {
      try {
        setSeenNotificationIds(JSON.parse(stored));
      } catch {
        setSeenNotificationIds([]);
      }
    } else {
      setSeenNotificationIds([]);
    }
  }, [user?.id]);

  const pendingInvites = useMemo(() => {
    if (!user) return [];
    return jointInvites.filter((invite) => invite.buddy_id === user.id && invite.status === 'pending');
  }, [jointInvites, user]);

  const incomingNudges = useMemo(() => {
    if (!user) return [];
    return nudges.filter((nudge) => nudge.buddy_id === user.id);
  }, [nudges, user]);

  const upcomingAcceptedInvites = useMemo(() => {
    if (!user) return [];
    const now = Date.now();
    return jointInvites.filter((invite) => {
      const isMine = invite.host_id === user.id || invite.buddy_id === user.id;
      return isMine && invite.status === 'accepted' && new Date(invite.scheduled_at).getTime() > now;
    });
  }, [jointInvites, user]);

  const notifications = useMemo(() => {
    const inviteNotifications = pendingInvites.map((invite) => ({
      id: `invite-${invite.id}`,
      title: 'New joint workout invite',
      message: `${invite.host_name} invited you to ${invite.activity_type}`,
      createdAt: invite.created_at || invite.scheduled_at,
      type: 'invite' as const,
    }));

    const nudgeNotifications = incomingNudges.map((nudge) => ({
      id: `nudge-${nudge.id}`,
      title: 'Buddy nudge',
      message: nudge.message,
      createdAt: nudge.created_at,
      type: 'nudge' as const,
    }));

    const scheduleNotifications = upcomingAcceptedInvites.map((invite) => ({
      id: `schedule-${invite.id}`,
      title: 'Upcoming joint session',
      message: `${invite.activity_type} on ${new Date(invite.scheduled_at).toLocaleString()}`,
      createdAt: invite.scheduled_at,
      type: 'schedule' as const,
    }));

    return [...inviteNotifications, ...nudgeNotifications, ...scheduleNotifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [incomingNudges, pendingInvites, upcomingAcceptedInvites]);

  const unreadCount = notifications.filter((item) => !seenNotificationIds.includes(item.id)).length;

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => {
      const next = !prev;
      if (next && user?.id) {
        const merged = new Set([...seenNotificationIds, ...notifications.map((item) => item.id)]);
        const nextSeen = Array.from(merged);
        setSeenNotificationIds(nextSeen);
        localStorage.setItem(`buddysync_seen_notifications_${user.id}`, JSON.stringify(nextSeen));
      }
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" data-tour="header-brand">
          <div className="w-10 h-10 rounded-2xl buddysync-gradient-bg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold tracking-tight buddysync-glow-text">BuddySync</span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500" title={`App version ${APP_VERSION}`}>
                v{APP_VERSION}
              </span>
            </div>
          </div>
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 relative ml-auto shrink-0">
          {user && (
            <div className="relative">
              <button
                onClick={toggleNotifications}
                aria-label="Notifications"
                className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 sm:right-0 left-1/2 -translate-x-1/2 sm:translate-x-0 mt-2 w-[min(320px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between mb-2 px-1 gap-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Notifications</h3>
                    {notifications.length > 0 && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{notifications.length} updates</span>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
                      No new activity right now.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-auto pr-1">
                      {notifications.map((item) => (
                        <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                            {item.type === 'invite' && <CalendarClock className="w-3.5 h-3.5 text-purple-500" />}
                            {item.type === 'nudge' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                            {item.type === 'schedule' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                            <span>{item.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{item.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* User Account Controls */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/onboarding"
                className="flex items-center gap-2 p-1.5 pl-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
              >
                <span className="hidden sm:inline text-xs font-semibold">
                  {user.full_name}
                </span>
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name} 
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500/40" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                )}
                <Settings className="w-4 h-4 text-slate-400 hidden sm:inline" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Log Out to Auth Screen"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/auth">
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer">
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};
