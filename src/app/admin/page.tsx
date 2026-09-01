'use client';

import React, { useEffect, useState } from 'react';
import { BellRing, Send, ShieldCheck, Users, KeyRound, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/lib/supabase';

interface AdminUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  full_name?: string;
  avatar_url?: string;
  invite_code?: string;
  streak_days?: number;
}

export default function AdminPage() {
  const [title, setTitle] = useState('BuddySync update');
  const [message, setMessage] = useState('');
  const [path, setPath] = useState('/');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(Boolean(supabase));
  const [usersError, setUsersError] = useState<string | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const loadUsers = async () => {
      const { data, error } = await client.functions.invoke('admin-list-users');
      setUsersLoading(false);
      if (error) {
        const status = (error as { context?: { status?: number } }).context?.status;
        setUsersError(status === 403 || error.message.includes('403') ? 'You are not authorized.' : error.message);
        return;
      }
      setUsers(data ?? []);
    };
    void loadUsers();
  }, []);

  const resetPassword = async (userId: string) => {
    if (!supabase || !window.confirm('Generate a new temporary password for this user?')) return;
    const client = supabase;
    setResettingUserId(userId);
    setUsersError(null);
    const { data, error } = await client.functions.invoke('admin-reset-password', { body: { user_id: userId } });
    setResettingUserId(null);
    if (error) {
      setUsersError(error.message);
      return;
    }
    setTemporaryPassword(data.temporary_password);
  };

  const sendNotification = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setResult('Admin notifications require live Supabase mode.');
      return;
    }

    setIsSending(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke('send-admin-notification', {
      body: { title, body: message, url: path },
    });
    setIsSending(false);

    if (error) {
      setResult(error.message);
      return;
    }

    setResult(`Delivered to ${data.sent} device${data.sent === 1 ? '' : 's'}${data.failed ? `; ${data.failed} failed.` : '.'}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
          <BellRing className="h-7 w-7 text-emerald-500" />
          Notification Broadcast
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Send an in-app update to every device with BuddySync reminders enabled.</p>
      </div>

      <Card className="space-y-5">
        <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <span>This action is authorized by the server using your signed-in email address.</span>
        </div>

        <form onSubmit={sendNotification} className="space-y-4">
          <Input label="Notification title" value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} required />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Message</label>
            <textarea
              value={message}
              maxLength={240}
              rows={4}
              onChange={(event) => setMessage(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>
          <Input label="Open path" value={path} pattern="/.*" onChange={(event) => setPath(event.target.value)} required />
          {result && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{result}</p>}
          <Button type="submit" isLoading={isSending} leftIcon={<Send className="h-4 w-4" />}>
            Send Notification
          </Button>
        </form>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-500" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Users</h2>
        </div>
        {!supabase ? (
          <Card><p className="text-sm text-slate-500">Admin user management requires live Supabase mode.</p></Card>
        ) : usersLoading ? (
          <Card><p className="text-sm text-slate-500">Loading users...</p></Card>
        ) : usersError ? (
          <Card><p className="text-sm font-semibold text-rose-500">{usersError}</p></Card>
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800">
                <tr className="text-slate-400"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Joined</th><th className="p-4">Last sign-in</th><th className="p-4" /></tr>
              </thead>
              <tbody>
                {users.map(adminUser => (
                  <tr key={adminUser.id} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{adminUser.full_name || 'Unnamed'}</td>
                    <td className="p-4 text-slate-500">{adminUser.email || 'No email'}</td>
                    <td className="p-4 text-slate-500">{new Date(adminUser.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-500">{adminUser.last_sign_in_at ? new Date(adminUser.last_sign_in_at).toLocaleDateString() : 'Never'}</td>
                    <td className="p-4"><Button variant="outline" size="sm" isLoading={resettingUserId === adminUser.id} onClick={() => void resetPassword(adminUser.id)} leftIcon={<KeyRound className="h-3.5 w-3.5" />}>Reset Password</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      <Modal isOpen={Boolean(temporaryPassword)} onClose={() => setTemporaryPassword(null)} title="Temporary password" subtitle="This password is shown once. Share it securely with the user.">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-100 p-3 font-mono text-sm dark:bg-slate-800">
            <span className="break-all">{temporaryPassword}</span>
            <Button variant="outline" size="sm" onClick={() => temporaryPassword && void navigator.clipboard.writeText(temporaryPassword)} leftIcon={<Copy className="h-3.5 w-3.5" />}>Copy</Button>
          </div>
          <Button variant="primary" className="w-full" onClick={() => setTemporaryPassword(null)}>Done</Button>
        </div>
      </Modal>
    </div>
  );
}