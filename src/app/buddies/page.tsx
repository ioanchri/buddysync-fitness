'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  UserPlus, 
  Flame, 
  MessageCircle, 
  Send, 
  Eye, 
  EyeOff, 
  Dumbbell, 
  Footprints, 
  Heart, 
  PartyPopper, 
  Check, 
  Copy,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { UserProfile } from '@/lib/types';
import { format } from 'date-fns';

const QUICK_EMOJIS = ['🔥', '🙌', '💪', '🎉', '❤️'];

export default function BuddiesPage() {
  const { user, buddies, sharedFeed, inviteBuddyByCode, addReaction, removeBuddy } = useAppState();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string } | null>(null);

  // Global override toggle to test both exact weight vs percentage change view for buddies!
  const [overridePrivacy, setOverridePrivacy] = useState<boolean | null>(null);
  const [buddyToRemove, setBuddyToRemove] = useState<UserProfile | null>(null);

  const [commentInputs, setCommentInputs] = useState<{ [itemId: string]: string }>({});

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    const res = await inviteBuddyByCode(inviteCodeInput);
    setInviteResult(res);

    if (res.success) {
      setInviteCodeInput('');
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteResult(null);
      }, 1500);
    }
  };

  const handleAddComment = (itemId: string, emoji: string) => {
    const customMsg = commentInputs[itemId] || '';
    addReaction(itemId, emoji, customMsg.trim() || undefined);
    setCommentInputs(prev => ({ ...prev, [itemId]: '' }));
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-500" />
            <span>Accountability Squad & Feed</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Stay synced with your workout partners, send cheers, and celebrate daily progress
          </p>
        </div>

        <Button
          data-tour="buddies-invite"
          variant="primary"
          onClick={() => setIsInviteModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          + Invite Accountability Buddy
        </Button>
      </div>

      {/* Connected Squad Members */}
      <Card data-tour="buddies-squad" className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Connected Squad ({buddies.length})</span>
        </div>
        {buddies.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {buddies.map(buddy => (
              <div key={buddy.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={buddy.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                    alt={buddy.full_name}
                    className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-emerald-500"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{buddy.full_name}</p>
                    <p className="font-mono text-[10px] text-slate-400">{buddy.invite_code}</p>
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={() => setBuddyToRemove(buddy)} leftIcon={<Trash2 className="h-3.5 w-3.5" />}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* View Privacy Mode Simulator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>Feed Weight Privacy View:</span>
          <button
            onClick={() => setOverridePrivacy(prev => prev === true ? null : true)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
              overridePrivacy === true
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            Show Exact Weight
          </button>
          <button
            onClick={() => setOverridePrivacy(prev => prev === false ? null : false)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
              overridePrivacy === false
                ? 'bg-cyan-500 text-white border-cyan-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            Show % Change
          </button>
        </div>
      </Card>

      {/* Shared Feed Items */}
      <div data-tour="buddies-feed" className="space-y-6 max-w-3xl mx-auto">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Activity Stream</span>
        </h2>

        {sharedFeed.map(item => {
          // Determine privacy mode for weight display
          const displayExactWeight = overridePrivacy !== null 
            ? overridePrivacy 
            : (user?.share_exact_weight ?? true);

          return (
            <Card key={item.id} hoverable glow="emerald" className="space-y-4">
              
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt={item.user_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{item.user_name}</span>
                      <Badge variant="cyan">{item.type === 'workout' ? 'Workout Logged' : 'Daily Metric'}</Badge>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                  </div>
                </div>
              </div>

              {/* Workout Content */}
              {item.workout && (
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-emerald-500" />
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">{item.workout.title}</span>
                    </div>
                    <Badge variant="amber">{item.workout.intensity} Intensity</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>Category: {item.workout.category}</span>
                    <span>•</span>
                    <span>Duration: {item.workout.duration_minutes} Mins</span>
                  </div>

                  {item.workout.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                      &quot;{item.workout.notes}&quot;
                    </p>
                  )}
                </div>
              )}

              {/* Daily Log Content */}
              {item.log && (
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
                      <Footprints className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-slate-400">Steps</span>
                      <p className="text-base font-black text-slate-900 dark:text-white">
                        {item.log.steps.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-slate-400">
                        {displayExactWeight ? 'Weight' : 'Weight Progress'}
                      </span>
                      <p className="text-base font-black text-slate-900 dark:text-white">
                        {displayExactWeight ? (
                          `${item.log.weight || 80.2} kg`
                        ) : (
                          <span className="text-emerald-500 font-bold">-2.1% Δ (Private)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reactions & Encouragement Comments Section */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
                
                {/* List existing reactions */}
                {item.reactions.length > 0 && (
                  <div className="space-y-1.5">
                    {item.reactions.map(r => (
                      <div key={r.id} className="flex items-start gap-2 p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/50 text-xs">
                        <span className="text-base">{r.emoji}</span>
                        <div className="flex-1">
                          <span className="font-bold text-slate-900 dark:text-white mr-1.5">{r.sender_name}:</span>
                          <span className="text-slate-600 dark:text-slate-300">{r.message || 'Cheered your progress!'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Emoji Reaction Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-400">Quick Cheer:</span>
                  {QUICK_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleAddComment(item.id, emoji)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:scale-110 active:scale-95 transition-transform text-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Custom Encouraging Comment Box */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Write an encouraging message to your buddy..."
                    value={commentInputs[item.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [item.id]: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddComment(item.id, '🙌')}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Cheer
                  </Button>
                </div>

              </div>

            </Card>
          );
        })}
      </div>

      {/* Invite Buddy Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Accountability Buddy"
        subtitle="Connect with a workout partner using their unique BuddySync invite code"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label="Buddy Invite Code"
            placeholder="e.g. JORDAN99"
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value)}
            required
            helperText="Use your buddy's invite code (email lookup is not available yet)."
          />

          {inviteResult && (
            <p className={`text-xs font-bold ${inviteResult.success ? 'text-emerald-500' : 'text-rose-500'}`}>
              {inviteResult.message}
            </p>
          )}

          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-500 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Your own invite code:</span>
            <div className="font-mono text-emerald-500 font-bold text-sm">{user?.invite_code}</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Connect Squad Member
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(buddyToRemove)}
        onClose={() => setBuddyToRemove(null)}
        title="Remove buddy?"
        subtitle={buddyToRemove ? `Remove ${buddyToRemove.full_name} from your accountability squad and feed.` : undefined}
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setBuddyToRemove(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (buddyToRemove) await removeBuddy(buddyToRemove.id);
              setBuddyToRemove(null);
            }}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Remove Buddy
          </Button>
        </div>
      </Modal>

    </div>
  );
}
