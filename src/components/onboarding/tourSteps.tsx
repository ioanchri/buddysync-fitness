'use client';

export const TOUR_STORAGE_KEY = 'buddysync_tour_completed';

const introContent = (
  <div className="space-y-2 text-left">
    <p className="text-sm font-extrabold">Welcome to BuddySync 👋</p>
    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
      This 60-second tour shows every part of the app and what it does. Use arrows and Next / Back to navigate.
      You can restart it anytime from <span className="font-bold">Profile &amp; Targets → Onboarding</span>.
    </p>
  </div>
);

export function getTourSteps(isMobile: boolean): any[] {
  // Common steps — order matters, easy to insert new ones later.
  // Targets use data-tour selectors added across AppShell & pages.
  // react-joyride will skip a step gracefully if target not found (we also handle isMobile routing).
  const steps: any[] = [
    {
      target: 'body',
      title: 'Welcome to BuddySync',
      content: introContent,
      placement: 'center' as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="header-brand"]',
      title: 'BuddySync Brand & Theme',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Your global header — brand, dark/light switch, notifications (bell) and profile. It stays visible on every screen and on mobile uses the same controls.
          </p>
          <p className="text-[11px] text-slate-400">Tip: Toggle theme here to see the tour adapt to light/dark.</p>
        </div>
      ),
      placement: 'bottom' as const,
      disableBeacon: true,
    },
    {
      // Navigation — responsive target
      target: isMobile ? '[data-tour="bottom-nav"]' : '[data-tour="sidebar-nav"]',
      title: isMobile ? 'Mobile Bottom Navigation' : 'Desktop Sidebar Navigation',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {isMobile
              ? 'On mobile, all sections live in the bottom bar: Dashboard, Buddies, Calendar, Progress, Goals.'
              : 'On desktop, the sidebar gives you instant access: Daily Dashboard, Buddy Feed, Calendar & Invites, Progress & Badges, Profile & Targets. The + Log New Workout button is always here.'}
          </p>
        </div>
      ),
      placement: isMobile ? ('top' as const) : ('right' as const),
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard-welcome"]',
      title: 'Dashboard — Accountability Checkpoint',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Welcome banner shows date, streak and how many workouts you need to hit the weekly checkpoint with your squad.
          </p>
        </div>
      ),
      placement: 'bottom' as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard-metrics"]',
      title: 'Daily Metric Logging',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Log weight, steps and hydration fast — steppers (+1,000 / +2,500 / +5,000) and water buttons (+250 ml / +500 ml) mirror the dummy data you saw as a guest.
          </p>
        </div>
      ),
      placement: 'bottom' as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard-steps"]',
      title: 'Step Ring & Weight Progress',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Circular ring for daily steps vs goal, plus weight trajectory (%). Hit 100% to trigger confetti 🎉. Dummy value example: 8,234 / 10,000 steps = 82%.
          </p>
        </div>
      ),
      placement: isMobile ? ('bottom' as const) : ('right' as const),
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard-streak"]',
      title: 'Streak Shield Protection',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Safeguard your streak on off-days. You start with shields and earn more by hitting weekly targets.
          </p>
        </div>
      ),
      placement: 'top' as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard-feed"]',
      title: 'Recent Workouts & Squad Shortcuts',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Recent workout logs with edit/delete, plus quick links to Buddy Feed and Joint Calendar. This is your daily hub.
          </p>
        </div>
      ),
      placement: 'top' as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="buddies-invite"]',
      title: 'Buddy Squad — Invite by Code',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Invite cards use codes like <span className="font-mono font-bold">ALEX888</span> / <span className="font-mono font-bold">JORDAN99</span>. Buddies appear in the squad bar.
          </p>
        </div>
      ),
      placement: 'bottom' as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="buddies-feed"]',
      title: 'Accountability Feed & Privacy',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            See buddy workouts & daily logs. Toggle <span className="font-bold">Exact weight</span> vs <span className="font-bold">-2.1% Δ (Private)</span>. React with 🔥 🙌 💪 🎉 ❤️ and send nudges.
          </p>
        </div>
      ),
      placement: 'top' as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="calendar-grid"]',
      title: 'Interactive Calendar',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Month grid shows past workouts (emerald) and joint invites (amber/cyan). Tap a day to see details or plan a joint session.
          </p>
        </div>
      ),
      placement: 'top' as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="calendar-invites"]',
      title: 'Joint Workout Invites Workflow',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Invites go <span className="font-bold">pending → accepted → completed/missed</span>. Buddies accept/decline, then confirm if the session happened.
          </p>
        </div>
      ),
      placement: isMobile ? ('top' as const) : ('left' as const),
      disableBeacon: true,
    },
    {
      target: '[data-tour="progress-weight"]',
      title: 'Weight Over Time Chart',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Recharts line chart with target reference line. Dummy logs show a steady trajectory toward the goal.
          </p>
        </div>
      ),
      placement: 'top' as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="progress-badges"]',
      title: 'Milestone Badges & Gamification',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Badges like Consistency King, Accountability Squad, Weekly Champion unlock as you hit streaks. Leaderboard and confetti keep motivation high.
          </p>
        </div>
      ),
      placement: 'top' as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="onboarding-profile"]',
      title: 'Profile & Goal Settings',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Set name, avatar (DiceBear), starting/target weight, step goal, weekly checkpoint, unit (kg/lbs) and privacy mode. Changes sync instantly.
          </p>
        </div>
      ),
      placement: 'top' as const,
      disableBeacon: true,
    },
    {
      target: '[data-tour="onboarding-code"]',
      title: 'Your Accountability Code & Tour',
      content: (
        <div className="space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Copy your invite code to share with a partner. And yes — this Onboarding card itself is where you can restart this tour anytime!
          </p>
        </div>
      ),
      placement: 'top' as const,
      disableBeacon: true,
    },
    {
      target: 'body',
      title: 'You’re all set! 🎉',
      content: (
        <div className="space-y-2 text-left">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            You’ve seen every core section. Next: log your first metrics on the Dashboard or invite a buddy with your code. Need a refresher? Head back to Profile & Targets → Onboarding.
          </p>
        </div>
      ),
      placement: 'center' as const,
      disableBeacon: true,
    },
  ];

  // Mobile overrides: Joyride can flip placement automatically, but we ensure tooltip stays in viewport
  // by preferring 'bottom'/'top' on narrow screens for wide elements.
  if (isMobile) {
    // ensure dashboard weight step placement stays readable on mobile
  }

  return steps;
}
