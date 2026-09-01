'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Users, 
  MapPin, 
  Clock, 
  Check, 
  X, 
  Dumbbell, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Flame,
  Footprints,
  Trash2
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { LogWorkoutModal } from '@/components/dashboard/LogWorkoutModal';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';

export default function CalendarPage() {
  const { user, buddies, workouts, jointInvites, createWorkoutInvite, respondToInvite, deleteWorkout } = useAppState();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isWorkoutDetailOpen, setIsWorkoutDetailOpen] = useState(false);
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState<typeof workouts>([]);
  const [isInviteDetailOpen, setIsInviteDetailOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<typeof jointInvites[number] | null>(null);

  // Invite modal form fields
  const [selectedBuddyId, setSelectedBuddyId] = useState(buddies[0]?.id || '');
  const [inviteActivity, setInviteActivity] = useState('Walking');
  const [inviteTime, setInviteTime] = useState('09:00');
  const [inviteLocation, setInviteLocation] = useState('Central Park Entrance / Gym');
  const activityOptions = ['Walking', 'Running', 'Tennis', 'Gym Lifting', 'Gym Cardio', 'Basketball', 'Football'];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const daysInCalendar = eachDayOfInterval({ start: startDate, end: endDate });

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuddyId) return;

    const scheduledDateStr = `${format(selectedDate, 'yyyy-MM-dd')}T${inviteTime}:00`;

    createWorkoutInvite({
      buddyId: selectedBuddyId,
      scheduledAt: scheduledDateStr,
      activityType: inviteActivity,
      locationNotes: inviteLocation,
    });

    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-purple-500" />
            <span>Interactive Calendar & Joint Workout Planner</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track daily workout completion status and invite accountability partners to joint sessions
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsWorkoutModalOpen(true)} leftIcon={<Dumbbell className="w-4 h-4" />}>
            + Log Workout
          </Button>
          <Button variant="primary" onClick={() => setIsInviteModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            + Plan Joint Workout
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Calendar View (2 cols), Right Pending Invites (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Section (2 Cols) */}
        <Card data-tour="calendar-grid" glow="purple" className="lg:col-span-2 space-y-4">
          
          {/* Month Header Controls */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-500 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 text-center text-xs font-extrabold uppercase text-slate-400 py-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysInCalendar.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const hasLoggedWorkout = workouts.some(w => w.date === dayStr);
              const jointEvents = jointInvites.filter(i => format(new Date(i.scheduled_at), 'yyyy-MM-dd') === dayStr);
              
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonthDay = isSameMonth(day, currentMonth);

              return (
                <button
                  key={dayStr}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[76px] p-1.5 rounded-2xl flex flex-col items-start justify-between border transition-all text-left cursor-pointer ${
                    !isCurrentMonthDay ? 'opacity-30 border-transparent' :
                    isSelected ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10' :
                    isToday ? 'border-purple-500/60 bg-purple-500/5 font-bold' :
                    'border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={`text-xs font-extrabold ${isToday ? 'text-purple-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {format(day, 'd')}
                  </span>

                  <div className="w-full space-y-1 mt-1">
                    {hasLoggedWorkout && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayWorkouts(workouts.filter(w => w.date === dayStr));
                          setIsWorkoutDetailOpen(true);
                        }}
                        className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 truncate hover:bg-emerald-500/30 transition-colors w-full text-left cursor-pointer"
                      >
                        <Dumbbell className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">Workout</span>
                      </button>
                    )}
                    {jointEvents.map(inv => (
                      <button 
                        key={inv.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvite(inv);
                          setIsInviteDetailOpen(true);
                        }}
                        className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate hover:opacity-80 transition-opacity w-full text-left cursor-pointer ${
                          inv.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          inv.status === 'accepted' ? 'bg-cyan-500/20 text-cyan-400' :
                          inv.status === 'missed' ? 'bg-slate-500/20 text-slate-400' :
                          inv.status === 'declined' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        <Users className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{inv.activity_type}</span>
                      </button>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

        </Card>

        {/* Joint Workout Invites Column (1 Col) */}
        <div data-tour="calendar-invites" className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <span>Joint Workout Invites</span>
          </h2>

          {jointInvites.length === 0 ? (
            <Card className="text-center py-6">
              <p className="text-xs text-slate-500">No upcoming joint workout invitations</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {jointInvites.map(inv => {
                const isPendingForMe = inv.buddy_id === user?.id && inv.status === 'pending';
                const isMine = inv.host_id === user?.id || inv.buddy_id === user?.id;
                const isPastSession = new Date(inv.scheduled_at).getTime() < Date.now();
                const needsCompletionConfirm = isMine && isPastSession && inv.status === 'accepted';

                const badgeVariant =
                  inv.status === 'accepted' ? 'cyan' :
                  inv.status === 'completed' ? 'emerald' :
                  inv.status === 'declined' ? 'rose' :
                  inv.status === 'missed' ? 'slate' : 'amber';

                return (
                  <Card key={inv.id} className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={badgeVariant}>
                        {inv.status.toUpperCase()}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {format(new Date(inv.scheduled_at), 'MMM d, h:mm a')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{inv.activity_type}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-purple-500" />
                        <span>Host: {inv.host_name} • Buddy: {inv.buddy_name}</span>
                      </p>
                      {inv.location_notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{inv.location_notes}</span>
                        </p>
                      )}
                    </div>

                    {/* Accept / Decline Controls */}
                    {isPendingForMe && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => respondToInvite(inv.id, 'accepted')}
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-1"
                          onClick={() => respondToInvite(inv.id, 'declined')}
                          leftIcon={<X className="w-3.5 h-3.5" />}
                        >
                          Decline
                        </Button>
                      </div>
                    )}

                    {/* Confirm whether a past scheduled session actually happened */}
                    {needsCompletionConfirm && (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Did this session actually happen?</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={() => respondToInvite(inv.id, 'completed')}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Confirm Done
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => respondToInvite(inv.id, 'missed')}
                            leftIcon={<X className="w-3.5 h-3.5" />}
                          >
                            Mark Missed
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Plan Joint Workout Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Schedule Joint Workout Session"
        subtitle={`Schedule a shared session for ${format(selectedDate, 'MMMM d, yyyy')}`}
      >
        <form onSubmit={handleCreateInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Select Accountability Buddy
            </label>
            <select
              value={selectedBuddyId}
              onChange={(e) => setSelectedBuddyId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {buddies.map(b => (
                <option key={b.id} value={b.id}>{b.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Activity / Workout Type
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {activityOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setInviteActivity(option)}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                    inviteActivity === option
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <Input
              placeholder="e.g. 5k Outdoor Run or Leg Day Gym"
              value={inviteActivity}
              onChange={(e) => setInviteActivity(e.target.value)}
              required
              leftIcon={<Dumbbell className="w-4 h-4 text-emerald-500" />}
            />
          </div>

          <Input
            label="Start Time"
            type="time"
            value={inviteTime}
            onChange={(e) => setInviteTime(e.target.value)}
            required
            leftIcon={<Clock className="w-4 h-4 text-cyan-500" />}
          />

          <Input
            label="Location / Meeting Notes"
            placeholder="e.g. Metro Gym Main Floor / Park Bench"
            value={inviteLocation}
            onChange={(e) => setInviteLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4 text-rose-500" />}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Send Workout Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Workout Detail Modal */}
      <Modal
        isOpen={isWorkoutDetailOpen}
        onClose={() => setIsWorkoutDetailOpen(false)}
        title="Workout Details"
        subtitle={selectedDayWorkouts.length > 0 ? `${selectedDayWorkouts[0].date} — ${selectedDayWorkouts.length} session${selectedDayWorkouts.length > 1 ? 's' : ''}` : ''}
      >
        <div className="space-y-4">
          {selectedDayWorkouts.map(wo => (
            <div key={wo.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{wo.title}</h3>
                <Badge variant="emerald">{wo.category}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                  {wo.duration_minutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  {wo.intensity}
                </span>
                {wo.steps_added && wo.steps_added > 0 && (
                  <span className="flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-emerald-500" />
                    {wo.steps_added.toLocaleString()} steps
                  </span>
                )}
              </div>

              {wo.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  &quot;{wo.notes}&quot;
                </p>
              )}

              {wo.photo_url && (
                <img
                  src={wo.photo_url}
                  alt={wo.title}
                  className="w-full h-40 object-cover rounded-xl"
                />
              )}

              <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-3">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    await deleteWorkout(wo.id);
                    setSelectedDayWorkouts(prev => prev.filter(workout => workout.id !== wo.id));
                    if (selectedDayWorkouts.length <= 1) setIsWorkoutDetailOpen(false);
                  }}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <LogWorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        initialDate={format(selectedDate, 'yyyy-MM-dd')}
      />

      {/* Joint Workout Invite Detail Modal */}
      <Modal
        isOpen={isInviteDetailOpen}
        onClose={() => setIsInviteDetailOpen(false)}
        title="Joint Workout Details"
        subtitle={selectedInvite ? format(new Date(selectedInvite.scheduled_at), 'EEEE, MMMM d, yyyy • h:mm a') : ''}
      >
        {selectedInvite && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedInvite.activity_type}</h3>
              <Badge variant={
                selectedInvite.status === 'accepted' ? 'cyan' :
                selectedInvite.status === 'completed' ? 'emerald' :
                selectedInvite.status === 'declined' ? 'rose' :
                selectedInvite.status === 'missed' ? 'slate' : 'amber'
              }>
                {selectedInvite.status.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span><strong className="text-slate-700 dark:text-slate-300">Host:</strong> {selectedInvite.host_name}</span>
              </p>
              <p className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-cyan-500" />
                <span><strong className="text-slate-700 dark:text-slate-300">Buddy:</strong> {selectedInvite.buddy_name}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                <span>{format(new Date(selectedInvite.scheduled_at), 'h:mm a')}</span>
              </p>
              {selectedInvite.location_notes && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{selectedInvite.location_notes}</span>
                </p>
              )}
            </div>

            {selectedInvite.status === 'pending' && selectedInvite.buddy_id === user?.id && (
              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    respondToInvite(selectedInvite.id, 'accepted');
                    setSelectedInvite({ ...selectedInvite, status: 'accepted' });
                  }}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Accept
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    respondToInvite(selectedInvite.id, 'declined');
                    setSelectedInvite({ ...selectedInvite, status: 'declined' });
                  }}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                >
                  Decline
                </Button>
              </div>
            )}

            {selectedInvite.status === 'accepted' && new Date(selectedInvite.scheduled_at).getTime() < Date.now() && (
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Did this session actually happen?</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      respondToInvite(selectedInvite.id, 'completed');
                      setSelectedInvite({ ...selectedInvite, status: 'completed' });
                    }}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Confirm Done
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      respondToInvite(selectedInvite.id, 'missed');
                      setSelectedInvite({ ...selectedInvite, status: 'missed' });
                    }}
                    leftIcon={<X className="w-3.5 h-3.5" />}
                  >
                    Mark Missed
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
