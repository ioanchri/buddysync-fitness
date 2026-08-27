export type WeightUnit = 'kg' | 'lbs';

export type WorkoutCategory = 
  | 'Walking'
  | 'Running'
  | 'Gym'
  | 'Weightlifting'
  | 'Tennis'
  | 'Football'
  | 'Basketball'
  | 'Yoga'
  | 'Cycling'
  | 'Swimming'
  | 'Other';

export type WorkoutIntensity = 'Low' | 'Medium' | 'High' | 'Extreme';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  initial_weight: number;
  target_weight: number;
  step_goal: number;
  weekly_checkpoint_goal: number;
  water_goal_ml: number;
  streak_shields: number;
  streak_days: number;
  weight_unit: WeightUnit;
  share_exact_weight: boolean;
  invite_code: string;
  created_at?: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  weight?: number;
  steps: number;
  water_ml: number;
  created_at?: string;
}

export interface Workout {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: WorkoutCategory;
  duration_minutes: number;
  intensity: WorkoutIntensity;
  notes?: string;
  photo_url?: string;
  steps_added?: number;
  created_at?: string;
}

export interface BuddyConnection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at?: string;
  buddy_profile?: UserProfile;
}

export interface LogReaction {
  id: string;
  log_id?: string;
  workout_id?: string;
  sender_id: string;
  sender_name: string;
  emoji: string;
  message?: string;
  created_at: string;
}

export interface JointWorkoutInvite {
  id: string;
  host_id: string;
  host_name: string;
  buddy_id: string;
  buddy_name: string;
  scheduled_at: string;
  activity_type: string;
  location_notes?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'missed';
  created_at?: string;
}

export interface NudgeNotification {
  id: string;
  sender_id: string;
  sender_name: string;
  buddy_id: string;
  type: 'workout' | 'water' | 'high_five';
  message: string;
  created_at: string;
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
  category: 'streak' | 'steps' | 'weight' | 'buddy' | 'hydration';
}

export interface SharedFeedItem {
  id: string;
  type: 'daily_log' | 'workout' | 'milestone';
  user_id: string;
  user_name: string;
  user_avatar?: string;
  date: string;
  log?: DailyLog;
  workout?: Workout;
  milestone_title?: string;
  milestone_description?: string;
  reactions: LogReaction[];
}
