<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ⚡ PulseSync (BuddySync) — Agent Knowledge & Architecture Guide

Welcome to **PulseSync** (also branded as **BuddySync**), a modern, responsive, mobile-first accountability and fitness tracking web application. This document is the single source of truth for AI agents working on this codebase.

---

## 1. Project Overview & Core Mission

PulseSync solves the problem of fitness habit drop-off by combining **individual habit tracking** with **social accountability between workout partners (buddies)**.

### Core Value Propositions:
- **Daily Metric Tracking**: Lightweight, fast logging for daily steps, weight, hydration, and detailed workouts.
- **Accountability Squad**: Partner syncing via unique invite codes (e.g. `ALEX888`, `JORDAN99`).
- **Privacy-First Buddy Sharing**: Ability to toggle between sharing exact weights vs. percentage changes (`-2.1% Δ`) to protect user comfort.
- **Joint Workout Planner**: Interactive calendar with shared scheduling, location tags, and real-time invite confirmations.
- **Gamification & Social Interaction**: Streak shields, milestone badges, cheer reactions (🔥, 🙌, 💪, 🎉, ❤️), nudges, and weekly squad leaderboards.
- **Zero-Config Dual Mode**: Immediate out-of-the-box local storage demo mode with preloaded deterministic data, plus seamless cloud database & auth integration with Supabase.

---

## 2. Technology Stack

| Layer | Technology | Version / Details |
|---|---|---|
| **Framework** | Next.js (App Router) | v16+ (React 19) |
| **Language** | TypeScript | Strict mode configured |
| **Styling** | Tailwind CSS v4 | PostCSS + custom glassmorphism & gradients |
| **Icons** | Lucide React | Lightweight SVG icons |
| **Charts** | Recharts | Responsive Line & Bar Charts |
| **Animations / FX** | Canvas Confetti | Celebrations on goal completion |
| **Date Utilities** | date-fns | v4+ date calculations and formatters |
| **Database & Auth** | Supabase (PostgreSQL + RLS) | `@supabase/supabase-js` v2 |
| **Deployment Target** | Vercel | Edge/Node serverless hosting |

---

## 3. Directory & File Structure

```
fitness-tracker/
├── public/                     # Static assets & favicon
├── src/
│   ├── app/                    # Next.js App Router routes & layouts
│   │   ├── auth/page.tsx       # Auth: Sign in, Sign up & user switcher
│   │   ├── buddies/page.tsx    # Buddy squad, invite codes & shared feed
│   │   ├── calendar/page.tsx   # Interactive workout calendar & joint planner
│   │   ├── onboarding/page.tsx # Goal setup, profile config & privacy controls
│   │   ├── progress/page.tsx   # Recharts weight/step analytics & milestone badges
│   │   ├── globals.css         # Tailwind v4 theme, custom gradients & glass styles
│   │   ├── layout.tsx          # Root layout wrapping AppShell & AppStateProvider
│   │   └── page.tsx            # Main Dashboard (step ring, cards, quick logger)
│   ├── components/
│   │   ├── dashboard/          # Dashboard widgets (forms, rings, streak shields, etc.)
│   │   │   ├── DailyMetricForm.tsx
│   │   │   ├── HealthSyncModal.tsx
│   │   │   ├── LogWorkoutModal.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── NudgeBanner.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── StreakShieldCard.tsx
│   │   │   ├── SyncAndNotificationBar.tsx
│   │   │   ├── WaterTrackerCard.tsx
│   │   │   └── WeeklyLeaderboardCard.tsx
│   │   ├── layout/             # Navigation & shell components
│   │   │   ├── AppShell.tsx    # Responsive shell (Desktop sidebar + Mobile bottom nav)
│   │   │   ├── BottomNav.tsx   # Mobile navigation bar
│   │   │   ├── Header.tsx      # Top bar with streak indicator, theme switch & user profile
│   │   │   └── Sidebar.tsx     # Desktop navigation sidebar
│   │   └── ui/                 # Reusable atomic UI components
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Modal.tsx
│   ├── context/
│   │   └── AppStateContext.tsx # Centralized global state (Auth, Logs, Buddies, Feeds)
│   └── lib/
│       ├── notifications.ts    # Browser Notification API utilities
│       ├── supabase.ts         # Supabase client instantiation & config check
│       └── types.ts            # TypeScript interfaces & data models
├── supabase/
│   └── schema.sql              # Complete PostgreSQL DDL, Triggers & RLS Policies
├── .env.example                # Template for environment variables
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler config
└── AGENTS.md                   # This agent guidance file
```

---

## 4. Key Workflows & Features

### 1. Daily Tracking & Dashboard (`/`)
- **Step Progress Ring**: Circular SVG progress meter tracking percentage against daily step goal (e.g. 10,000 steps). Triggers full-screen canvas confetti upon goal completion.
- **Quick Logging**: Stepper form for entering daily weight and steps with one-tap incremental buttons (`+1,000`, `+2,500`, `+5,000`).
- **Water Hydration Tracker**: Daily water intake logger with preset buttons (`+250ml`, `+500ml`) and progress visualizer.
- **Streak Shield Protection**: Mechanistic streak safeguard that users can activate if they cannot work out on a particular day.
- **Workout Logger Modal**: Category picker (Running, Weightlifting, Cycling, Yoga, HIIT, Walking, Swimming, Other), intensity selector, duration, notes, and photo URL.

### 2. Buddy Squad & Shared Feed (`/buddies`)
- **Buddy Connection by Code**: Users share 8-character codes (`ALEX888`, `JORDAN99`) to link accounts.
- **Privacy Mode**: Users can choose to expose exact weight or only show delta percentage on buddy feeds.
- **Social Feed**: Real-time activity timeline of buddy workout logs and daily completions.
- **Cheer Reactions & Comments**: Emoji reactions (🔥, 🙌, 💪, 🎉, ❤️) with custom encouragement messages.
- **Direct Nudges**: Send high-fives, hydration reminders, or workout nudges to squad members.

### 3. Joint Workout Calendar Planner (`/calendar`)
- **Monthly Interactive Calendar**: Visual indicators of past workout days, active streaks, and scheduled joint sessions.
- **Joint Workout Invites**: Host invites buddy with date, time, activity type, and meeting location notes.
- **Status Workflow**: Invites transition from `pending` to `accepted` or `declined`.

### 4. Progress Analytics & Badges (`/progress`)
- **Weight Trajectory**: Recharts line chart showing historical weigh-ins with a horizontal target reference line.
- **Step Volume History**: Recharts bar chart showing daily steps against the goal line.
- **Milestone Matrix**: Achievement badges (e.g., *Consistency King*, *Accountability Squad*, *Weekly Champion*).

### 5. Profile & Goals Setup (`/onboarding`)
- Customize Initial Weight, Target Weight, Daily Step Goal, Weekly Workout Checkpoint Goal, Hydration Target, Unit System (`kg` vs `lbs`), and Privacy Settings.

---

## 5. State Management & Dual Mode Architecture

All state is handled through `src/context/AppStateContext.tsx`:
- **Demo Mode (`isDemoMode = true`)**: Automatically active when Supabase environment variables are absent. Data is persisted to browser `localStorage` with rich deterministic initial data.
- **Live Supabase Mode (`isDemoMode = false`)**: Active when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided. Communicates with PostgreSQL via Supabase Auth and RLS-protected queries.

---

## 6. Database Schema (`supabase/schema.sql`)

The database consists of 6 primary PostgreSQL tables:
1. `profiles`: Extends `auth.users` with user settings, goals, unit preferences, streak counts, and invite codes. Auto-created via `handle_new_user()` trigger.
2. `daily_logs`: Daily step counts, weigh-ins, and hydration logs (`UNIQUE(user_id, date)`).
3. `workouts`: Individual workout sessions with duration, category, and intensity.
4. `buddies`: Buddy connections (`requester_id`, `addressee_id`, `status`).
5. `log_reactions`: Emoji cheers and comments linked to logs or workouts.
6. `joint_workout_invites`: Shared workout sessions between buddies.

All tables are protected with PostgreSQL **Row Level Security (RLS)** allowing users to read and modify their own data, and share logs exclusively with accepted buddies.

---

## 7. Development Guidelines & Rules for Agents

- **Client Components**: Because the app relies heavily on interactive state, charts, and animations, client pages use `'use client'` at the top.
- **Styling**: Use Tailwind CSS utility classes and design tokens defined in `globals.css` (`buddysync-gradient-bg`, `buddysync-glow-text`, `buddysync-glass`). Avoid ad-hoc inline styles.
- **Do Not Break Demo Mode**: When adding new features to `AppStateContext.tsx`, ensure both the local fallback and the Supabase query paths are supported.
