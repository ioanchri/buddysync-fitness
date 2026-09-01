'use client';

import React, { useState } from 'react';
import { BellRing, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [title, setTitle] = useState('BuddySync update');
  const [message, setMessage] = useState('');
  const [path, setPath] = useState('/');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

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
    </div>
  );
}