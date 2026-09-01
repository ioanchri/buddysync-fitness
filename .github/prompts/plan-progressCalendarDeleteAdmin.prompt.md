# Plan: Progress logging, calendar workouts, deletions, admin user management

## Decisions from user
- Progress page: reuse existing `DailyMetricForm` inline (same as Dashboard), not a modal.
- Calendar: add Delete button only to the workout detail modal (no Progress-page workout list).
- Admin password reset: generate a random temporary password server-side via Supabase Admin API and display it once to the admin (not an email link).
- Buddy removal: requires a confirm dialog (unlike workout delete, which has no confirmation).

## Phase A — Progress page: add daily metrics inline
Files: `src/app/progress/page.tsx`
- Import `DailyMetricForm` and `LogWorkoutModal` (both already exist, used on `src/app/page.tsx`).
- Add local state: `isWorkoutModalOpen` (boolean).
- Render `<DailyMetricForm onOpenWorkoutModal={() => setIsWorkoutModalOpen(true)} />` near top of page (above/alongside charts).
- Render `<LogWorkoutModal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} />` at bottom of JSX.
- No context changes needed — `logDailyMetrics`, `addWorkout` already handle both demo & Supabase modes.

## Phase B — Calendar: add workout + delete workout
Files: `src/components/dashboard/LogWorkoutModal.tsx`, `src/app/calendar/page.tsx`
1. `LogWorkoutModal`: add optional prop `initialDate?: string`. In the `useEffect` "new workout" branch (`isOpen && !workoutToEdit`), set `loggedDate` to `initialDate || format(new Date(), 'yyyy-MM-dd')` instead of always today.
2. `calendar/page.tsx`:
   - Add state `isWorkoutModalOpen` (boolean).
   - Add a "+ Log Workout" `Button` (icon `Dumbbell`) near the existing "Plan Joint Workout" button (~L65-71), opening the modal.
   - Render `<LogWorkoutModal isOpen={isWorkoutModalOpen} onClose={...} initialDate={format(selectedDate, 'yyyy-MM-dd')} />`.
   - In the Workout Detail Modal (~L340-403), add a Delete button (Trash2 icon, `variant="ghost"` or danger styling) per workout shown, calling `deleteWorkout(workout.id)` (from `useAppState()`, already imported pattern used on dashboard `src/app/page.tsx#L236`). No confirmation (matches existing dashboard behavior). After delete, update `selectedDayWorkouts` local state to remove the deleted item (filter) so the modal reflects the change immediately; close modal if list becomes empty.

## Phase C — Delete buddies (remove friend)
Files: `supabase/schema.sql`, `src/context/AppStateContext.tsx`, `src/app/buddies/page.tsx`
1. **Schema**: add DELETE RLS policy for `buddies` table (currently missing — only SELECT/INSERT/UPDATE exist, see L199-200 area):
   ```
   CREATE POLICY "Delete buddy connection" ON public.buddies
     FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
   ```
2. **Context** (`AppStateContext.tsx`): add `removeBuddy: (buddyId: string) => Promise<void>;` to `AppStateContextType` interface (~L33-48) and implement near `inviteBuddyByCode` (~L1084):
   - Supabase mode: `await supabase.from('buddies').delete().or(\`and(requester_id.eq.${user.id},addressee_id.eq.${buddyId}),and(requester_id.eq.${buddyId},addressee_id.eq.${user.id})\`)` (connection row's own id isn't tracked in state — `buddies` is `UserProfile[]` keyed by the other user's profile id, per L272-297 fetch logic — so match on both directions instead of a connection-row id).
   - Then both modes: `setBuddies(prev => prev.filter(b => b.id !== buddyId))` and `setSharedFeed(prev => prev.filter(item => item.user_id !== buddyId))` to also clear their feed entries.
   - Export `removeBuddy` in the context provider value (~L1334-1347 area).
3. **UI** (`buddies/page.tsx`): the current "Connected Squad" bar (~L92-116) only shows overlapping avatar circles with no per-buddy detail — not suitable for attaching a remove action. Replace/extend it with a roster list: one row per buddy (avatar, name, invite code) with a "Remove" button (`Trash2` icon or text button, danger styling).
   - Add state `buddyToRemove: UserProfile | null`.
   - Clicking "Remove" sets `buddyToRemove` (opens confirm modal), does not delete immediately.
   - Add a confirm `Modal` ("Remove buddy?") with buddy's name, Cancel / Remove buttons; Remove calls `await removeBuddy(buddyToRemove.id)` then closes.

## Phase D — Admin: list users + reset password
Files: `supabase/functions/admin-list-users/index.ts` (new), `supabase/functions/admin-reset-password/index.ts` (new), `src/app/admin/page.tsx`
Both new edge functions follow the exact auth pattern from `supabase/functions/send-admin-notification/index.ts` (L1-40): read `authorization` header → create anon-key client scoped to that JWT → `authClient.auth.getUser()` → check email against `ADMIN_EMAILS` env allowlist → 403 if not admin. Reuse the same `ADMIN_EMAILS` secret (no new config).

1. **`admin-list-users`**:
   - Auth-check as above.
   - Use service-role client: `serviceClient.auth.admin.listUsers({ page: 1, perPage: 200 })` to get `{id, email, created_at, last_sign_in_at}` for all auth users (single page sufficient for app scale — note as scope limit, no pagination UI).
   - Fetch `serviceClient.from('profiles').select('id, full_name, avatar_url, invite_code, streak_days')`.
   - Merge by `id`, return JSON array, sorted by `created_at` desc.
2. **`admin-reset-password`**:
   - Auth-check as above.
   - Accept `{ user_id }` in body (validate is non-empty string).
   - Generate a random temporary password (e.g. crypto-random 12+ chars, mixed case/digits/symbols).
   - `serviceClient.auth.admin.updateUserById(user_id, { password: tempPassword })`.
   - Return `{ temporary_password: tempPassword }` (only ever returned once, not stored).
3. **`admin/page.tsx`**: add a "Users" section below the existing notification form.
   - On mount (if `supabase` configured), `supabase.functions.invoke('admin-list-users')` → store in `users` state; handle 403 (show "You are not authorized" message) and loading/error states.
   - Render a table/list: Name, Email, Joined date, Last sign-in, and a "Reset Password" button per row.
   - Clicking Reset Password → confirm (simple `window.confirm` or reuse `Modal` pattern) → `supabase.functions.invoke('admin-reset-password', { body: { user_id } })` → on success, show the returned temporary password in a dismissable alert/modal with a "Copy" button and a one-time-visibility warning.
   - Demo mode (`!supabase`): show existing-style fallback text "Admin user management requires live Supabase mode."

## Relevant files summary
- `src/app/progress/page.tsx` — add DailyMetricForm + LogWorkoutModal (Phase A)
- `src/components/dashboard/LogWorkoutModal.tsx` — add `initialDate` prop (Phase B)
- `src/app/calendar/page.tsx` — add Log Workout button + delete in detail modal (Phase B)
- `supabase/schema.sql` — add buddies DELETE policy (Phase C)
- `src/context/AppStateContext.tsx` — add `removeBuddy` (Phase C)
- `src/app/buddies/page.tsx` — roster list + remove confirm modal (Phase C)
- `supabase/functions/admin-list-users/index.ts` (new, Phase D)
- `supabase/functions/admin-reset-password/index.ts` (new, Phase D)
- `src/app/admin/page.tsx` — Users section + reset password UI (Phase D)

## Verification
- `npm run lint` / `npm run build` after each phase.
- Manual demo-mode test (no Supabase env vars): Progress page logging works & persists to localStorage; Calendar add/delete workout updates dashboard's list too (shared state); Buddies remove updates squad list (demo mode, no persistence needed per existing pattern — buddies aren't in localStorage today).
- For Phase D, since it requires live Supabase + deployed edge functions + `ADMIN_EMAILS` secret, verification is manual: deploy functions (`supabase functions deploy admin-list-users admin-reset-password`), sign in as an allow-listed admin email, confirm list loads and reset-password returns a working new password (test login with it).
- Phase C schema change requires running the new policy SQL against the Supabase project (`supabase/schema.sql` is the source of truth but isn't auto-applied — note this to the user).

## Scope exclusions
- No pagination UI for admin user list (single fetch, up to 200 users).
- No edit-workout action added to calendar detail modal (only delete, per user's request).
- No new "role/is_admin" DB column — admin check stays email-allowlist based (existing pattern).
- Buddy removal in demo mode is in-memory only (matches existing demo buddies behavior — not persisted to localStorage today).
