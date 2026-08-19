# ⚡ PulseSync - Fitness & Habit Tracker for Accountability Buddies

PulseSync is a responsive, mobile-first web application built with Next.js (App Router), TypeScript, Tailwind CSS, Recharts, and Supabase. It is designed for friends and workout partners to track daily fitness metrics, log workouts, celebrate progress, and schedule joint workout sessions together.

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
   - Invite buddies via unique invite codes (e.g. `PULSE888`).
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

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
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

> **Note on Zero-Config Demo Mode**: If no Supabase credentials are provided, PulseSync automatically runs in **Demo Mode** using browser LocalStorage and pre-populated demo data for immediate testing!

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
