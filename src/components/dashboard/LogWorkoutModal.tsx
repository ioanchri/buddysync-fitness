'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dumbbell, Clock, Flame, Image as ImageIcon, MessageSquare, Footprints } from 'lucide-react';
import { Workout, WorkoutCategory, WorkoutIntensity } from '@/lib/types';
import { useAppState } from '@/context/AppStateContext';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

interface LogWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutToEdit?: Workout | null;
  initialDate?: string;
}

const CATEGORIES: WorkoutCategory[] = [
  'Walking',
  'Running',
  'Gym',
  'Weightlifting',
  'Tennis',
  'Football',
  'Basketball',
  'Yoga',
  'Cycling',
  'Swimming',
  'Other',
];

const INTENSITIES: WorkoutIntensity[] = ['Low', 'Medium', 'High', 'Extreme'];

export const LogWorkoutModal: React.FC<LogWorkoutModalProps> = ({ isOpen, onClose, workoutToEdit, initialDate }) => {
  const { addWorkout, updateWorkout, dailyLogs, logDailyMetrics } = useAppState();

  const [title, setTitle] = useState('');
  const [loggedDate, setLoggedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState<WorkoutCategory>('Running');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [intensity, setIntensity] = useState<WorkoutIntensity>('High');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [stepsAdded, setStepsAdded] = useState(0);

  const isWalkingOrRunning = category === 'Walking' || category === 'Running';

  const isEditing = Boolean(workoutToEdit);

  useEffect(() => {
    if (isOpen && workoutToEdit) {
      setTitle(workoutToEdit.title || '');
      setLoggedDate(workoutToEdit.date || format(new Date(), 'yyyy-MM-dd'));
      setCategory(workoutToEdit.category || 'Running');
      setDurationMinutes(workoutToEdit.duration_minutes || 30);
      setIntensity(workoutToEdit.intensity || 'High');
      setNotes(workoutToEdit.notes || '');
      setPhotoUrl(workoutToEdit.photo_url || '');
      setStepsAdded(workoutToEdit.steps_added || 0);
      return;
    }

    if (isOpen && !workoutToEdit) {
      setTitle('');
      setLoggedDate(initialDate || format(new Date(), 'yyyy-MM-dd'));
      setCategory('Running');
      setDurationMinutes(30);
      setIntensity('High');
      setNotes('');
      setPhotoUrl('');
      setStepsAdded(0);
    }
  }, [initialDate, isOpen, workoutToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      date: loggedDate,
      title: title.trim(),
      category,
      duration_minutes: Number(durationMinutes),
      intensity,
      notes: notes.trim() || undefined,
      photo_url: photoUrl.trim() || undefined,
      ...(isWalkingOrRunning && stepsAdded > 0 ? { steps_added: stepsAdded } : {}),
    };

    if (isEditing && workoutToEdit) {
      await updateWorkout(workoutToEdit.id, payload);
    } else {
      addWorkout(payload);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}

      if (isWalkingOrRunning && stepsAdded > 0) {
        const existingLog = dailyLogs.find(l => l.date === loggedDate);
        const currentSteps = existingLog?.steps ?? 0;
        logDailyMetrics({ steps: currentSteps + stepsAdded, logDate: loggedDate });
      }
    }

    setTitle('');
    setNotes('');
    setPhotoUrl('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Workout Session' : 'Log New Workout Session'}
      subtitle={isEditing ? 'Update the details for this workout.' : 'Track your exercise details to celebrate progress with your buddy'}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Workout Date
            </label>
            <Input
              type="date"
              value={loggedDate}
              onChange={(e) => setLoggedDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
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

        </div>

        {/* Steps (Walking/Running only) */}
        {isWalkingOrRunning && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-emerald-500" />
              <span>Steps from this workout (optional)</span>
            </label>
            <Input
              type="number"
              min="0"
              max="100000"
              value={stepsAdded}
              onChange={(e) => setStepsAdded(Number(e.target.value))}
              placeholder="e.g. 5000"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              These steps will be added to your daily step count.
            </p>
          </div>
        )}

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
            {isEditing ? 'Save Changes' : 'Save & Publish to Feed'}
          </Button>
        </div>

      </form>
    </Modal>
  );
};
