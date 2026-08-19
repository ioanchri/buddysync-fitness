'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dumbbell, Clock, Flame, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { WorkoutCategory, WorkoutIntensity } from '@/lib/types';
import { useAppState } from '@/context/AppStateContext';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

interface LogWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: WorkoutCategory[] = [
  'Running',
  'Weightlifting',
  'Cycling',
  'Yoga',
  'HIIT',
  'Walking',
  'Swimming',
  'Other',
];

const INTENSITIES: WorkoutIntensity[] = ['Low', 'Medium', 'High', 'Extreme'];

export const LogWorkoutModal: React.FC<LogWorkoutModalProps> = ({ isOpen, onClose }) => {
  const { addWorkout } = useAppState();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkoutCategory>('Running');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [intensity, setIntensity] = useState<WorkoutIntensity>('High');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addWorkout({
      date: format(new Date(), 'yyyy-MM-dd'),
      title: title.trim(),
      category,
      duration_minutes: Number(durationMinutes),
      intensity,
      notes: notes.trim() || undefined,
      photo_url: photoUrl.trim() || undefined,
    });

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {}

    // Reset form
    setTitle('');
    setNotes('');
    setPhotoUrl('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log New Workout Session"
      subtitle="Track your exercise details to celebrate progress with your buddy"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Title */}
        <Input
          label="Workout Title"
          placeholder="e.g. Morning 5k Trail Run"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          leftIcon={<Dumbbell className="w-4 h-4 text-emerald-500" />}
        />

        {/* Category & Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WorkoutCategory)}
              className="w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Duration (Mins)
            </label>
            <Input
              type="number"
              min="1"
              max="300"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              leftIcon={<Clock className="w-4 h-4 text-cyan-500" />}
            />
          </div>
        </div>

        {/* Intensity Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Intensity Level</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {INTENSITIES.map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setIntensity(lvl)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  intensity === lvl
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Notes / Reflection (Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="How did you feel? Sets, reps, personal records..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Optional Photo URL */}
        <Input
          label="Workout Photo URL (Optional)"
          placeholder="https://images.unsplash.com/photo-..."
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          leftIcon={<ImageIcon className="w-4 h-4 text-purple-500" />}
        />

        {/* Submit */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save & Publish to Feed
          </Button>
        </div>

      </form>
    </Modal>
  );
};
