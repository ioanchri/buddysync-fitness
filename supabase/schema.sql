-- ===================================================
-- PulseSync Fitness & Habit Tracker - Supabase DDL Schema
-- ===================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  initial_weight NUMERIC(5,2) DEFAULT 75.0,
  target_weight NUMERIC(5,2) DEFAULT 70.0,
  step_goal INTEGER DEFAULT 10000,
  weekly_checkpoint_goal INTEGER DEFAULT 5,
  water_goal_ml INTEGER DEFAULT 2500,
  streak_shields INTEGER DEFAULT 2,
  streak_days INTEGER DEFAULT 1,
  weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
  share_exact_weight BOOLEAN DEFAULT true,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Daily Metrics Log (Weight, Steps & Water)
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(5,2),
  steps INTEGER DEFAULT 0,
  water_ml INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 4. Workouts Log
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Running', 'Weightlifting', 'Cycling', 'Yoga', 'HIIT', 'Walking', 'Swimming', 'Other')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  intensity TEXT NOT NULL CHECK (intensity IN ('Low', 'Medium', 'High', 'Extreme')),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Buddies / Accountability Connections
CREATE TABLE IF NOT EXISTS public.buddies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- 6. Reactions & Quick Encouragement Messages on Log/Workout Entries
CREATE TABLE IF NOT EXISTS public.log_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  log_id UUID REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (log_id IS NOT NULL OR workout_id IS NOT NULL)
);

-- 7. Joint Workout Invitations & Calendar Planning
CREATE TABLE IF NOT EXISTS public.joint_workout_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  buddy_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  activity_type TEXT NOT NULL,
  location_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_buddies_users ON public.buddies(requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS idx_joint_invites_buddy ON public.joint_workout_invites(buddy_id, scheduled_at);

-- ===================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ===================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Fitness Enthusiast'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joint_workout_invites ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all profiles (for buddy invites) and update their own profile
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Daily Logs & Workouts: Read own data OR accepted buddies' data
CREATE POLICY "Users and buddies view daily logs" ON public.daily_logs
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.buddies
      WHERE status = 'accepted'
      AND ((requester_id = auth.uid() AND addressee_id = daily_logs.user_id)
        OR (addressee_id = auth.uid() AND requester_id = daily_logs.user_id))
    )
  );

CREATE POLICY "Users insert own daily logs" ON public.daily_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own daily logs" ON public.daily_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users and buddies view workouts" ON public.workouts
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.buddies
      WHERE status = 'accepted'
      AND ((requester_id = auth.uid() AND addressee_id = workouts.user_id)
        OR (addressee_id = auth.uid() AND requester_id = workouts.user_id))
    )
  );

CREATE POLICY "Users insert own workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own workouts" ON public.workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own workouts" ON public.workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Buddies: View connections involved in, send or accept connections
CREATE POLICY "View buddy connections" ON public.buddies
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Create buddy connection" ON public.buddies
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Update buddy connection" ON public.buddies
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Reactions & Quick Cheers: View reactions on logs/workouts accessible to user
CREATE POLICY "View reactions" ON public.log_reactions FOR SELECT USING (true);
CREATE POLICY "Insert reactions" ON public.log_reactions FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Joint Workout Invites: Host or recipient can view/update
CREATE POLICY "View workout invites" ON public.joint_workout_invites
  FOR SELECT USING (auth.uid() = host_id OR auth.uid() = buddy_id);

CREATE POLICY "Create workout invite" ON public.joint_workout_invites
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Update workout invite" ON public.joint_workout_invites
  FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = buddy_id);
