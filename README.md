# ⚡ BuddySync - Fitness & Habit Tracker for Accountability Buddies

BuddySync is a responsive, mobile-first web application built with Next.js (App Router), TypeScript, Tailwind CSS, Recharts, and Supabase. It is designed for friends and workout partners to track daily fitness metrics, log workouts, celebrate progress, and schedule joint workout sessions together.

---

## 🔥 Key Features

1. **Authentication & Profile Setup**:
   - User profile setup with Initial Weight, Target Goal Weight, Daily Step Goal, and Weekly Checkpoint Target.
   - Unit system switcher (`kg` vs `lbs`).
   - Buddy Weight Privacy Control: Toggle displaying exact weight (e.g. `73.5 kg`) vs percentage change (`-2.1% Δ`) on shared buddy feeds.

2. **Daily Tracking Dashboard**:
   - Touch-friendly quick logger for weight and steps with `+1k`, `+2.5k`, `+5k` quick add tap buttons.
   - Circular SVG Progress Ring tracking daily step goals with confetti celebration triggers upon goal completion.
   - Target weight & weekly checkpoint progress cards.
   - Quick workout logger (Activity category, duration in minutes, intensity: Low/Medium/High/Extreme, notes, photo URL).

3. **Buddy System & Shared Social Feed**:
   - Invite buddies via unique invite codes (e.g. `ALEX888`).
   - Shared Feed showing connected accountability partner logs and workout entries.
   - Interactive Quick Reactions (🔥, 🙌, 💪, 🎉, ❤️) & custom encouraging comments.

4. **Progress Analytics & Checkpoint Badges**:
   - Interactive Recharts graphs for Weight trends over time (with target reference line) and Step volume history.
   - Milestone badges grid (e.g., Consistency King, Weightloss Warrior, Accountability Squad).

5. **Interactive Calendar & Joint Workout Planner**:
   - Monthly calendar grid highlighting workout completion days and scheduled sessions.
   - Joint Workout Invite System: Schedule shared workouts (Date, Time, Activity type, Location/Notes).
   - Invitation Accept/Decline status system with real-time calendar markers.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & custom glassmorphism design tokens
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **State Management**: Centralized `AppStateContext` supporting both Cloud Supabase and zero-config LocalStorage Demo Mode
- **Deployment Target**: Vercel

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional for Supabase)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

> **Note on Zero-Config Demo Mode**: If no Supabase credentials are provided, BuddySync automatically runs in **Demo Mode** using browser LocalStorage and pre-populated demo data for immediate testing!

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Cloud Setup & DDL Schema

To connect your own production Supabase PostgreSQL instance:

1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the complete DDL script located at `supabase/schema.sql`.
4. Copy your Supabase Project URL and Anon API key from **Project Settings -> API**.
5. Add them to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 🌐 Deploying Directly to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import your project into [Vercel](https://vercel.com/new).
3. Set the Environment Variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically build and publish your Next.js App Router application!

---

## Android PWA Release

BuddySync can be installed directly from Chrome on Android. Deploy it to a stable HTTPS domain, open the site in Chrome on the device, then choose **Install app** from the browser menu.

Before each release:

1. Update the `version` in `package.json` using semantic versioning. The build generates a matching service-worker version, cache namespace, and user-visible app version.
2. Run `npm run build`.
3. Deploy the production build.
4. Open the installed app and verify the version beside the BuddySync logo.
5. When an update banner appears, select **Update** to activate the new cached release.

The service worker caches static app assets and offers an offline fallback for already visited routes. Supabase requests stay network-only, so authenticated data is not shared from a stale cache.

### Android Smoke Test

1. Open the deployed HTTPS URL in Android Chrome.
2. Confirm the install prompt shows the BuddySync icon.
3. Install the app and verify its launcher icon and the displayed version.
4. Open Dashboard, Buddies, Calendar, Progress, and Profile.
5. Load the app online, disable the network, and confirm an already visited route still opens.
6. Re-enable the network, confirm data refreshes, then deploy a version increment and verify the in-app update banner.

---

## Web Push Daily Log Reminders

Installed Android PWAs can receive a daily reminder at 8:00 PM in the device's local time zone when no daily log exists. This requires live Supabase mode; demo mode has no server to deliver background notifications.

1. Run the updated `supabase/schema.sql` in the Supabase SQL Editor.
2. Generate VAPID keys with `npx web-push generate-vapid-keys --json`.
3. Set the public key as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in Vercel and `.env.local`.
4. Set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (for example `mailto:you@example.com`), and a random `PUSH_CRON_SECRET` as Supabase Edge Function secrets.
5. Deploy `supabase/functions/send-log-reminders` with JWT verification disabled. The function authenticates scheduled requests using `x-cron-secret` instead.
6. Configure Supabase Cron to call the function once per hour with that secret. The function selects each device only during its configured local 8 PM hour and records deliveries to prevent duplicates.
7. In BuddySync Profile & Goal Settings, select **Enable Daily Reminders** and accept the Android notification permission.

Never expose `VAPID_PRIVATE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `PUSH_CRON_SECRET` in browser variables or source control.
