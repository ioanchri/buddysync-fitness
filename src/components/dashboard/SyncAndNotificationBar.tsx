'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HealthSyncModal } from '@/components/dashboard/HealthSyncModal';
import { 
  Bell, 
  BellCheck, 
  RefreshCw, 
  Smartphone, 
  Apple, 
  Check 
} from 'lucide-react';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendBrowserNotification 
} from '@/lib/notifications';
import { useAppState } from '@/context/AppStateContext';

export const SyncAndNotificationBar: React.FC = () => {
  const { user, buddies } = useAppState();

  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [testSentNotice, setTestSentNotice] = useState(false);

  useEffect(() => {
    if (isNotificationSupported()) {
      setPermission(getNotificationPermission());
    }
  }, []);

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);

    if (res === 'granted') {
      sendBrowserNotification('⚡ BuddySync Notifications Active!', {
        body: `You'll now receive instant alerts when ${buddies[0]?.full_name || 'your buddy'} completes a workout or invites you!`,
      });
      setTestSentNotice(true);
      setTimeout(() => setTestSentNotice(false), 3000);
    }
  };

  const handleTestNotification = () => {
    sendBrowserNotification('🔥 Workout Buddy Alert!', {
      body: `${buddies[0]?.full_name || 'Jordan'} just completed a 5K Run & sent a High-Five! 🙌`,
    });
    setTestSentNotice(true);
    setTimeout(() => setTestSentNotice(false), 3000);
  };

  return (
    <>
      <Card className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-emerald-500/20">
        
        {/* Push Notifications Section */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Push Notifications</h3>
              <Badge variant={permission === 'granted' ? 'emerald' : 'slate'}>
                {permission === 'granted' ? 'Enabled 🔔' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get real-time buddy workout alerts & reminders</p>
          </div>
        </div>

        {/* HealthKit & Push Action Buttons */}
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {permission !== 'granted' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleEnableNotifications}
              leftIcon={<BellCheck className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto"
            >
              Enable Browser Push Alerts
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              leftIcon={testSentNotice ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bell className="w-3.5 h-3.5 text-purple-500" />}
              className="w-full sm:w-auto"
            >
              {testSentNotice ? 'Alert Sent!' : 'Test Notification'}
            </Button>
          )}

          {/* Health API Integration Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHealthModalOpen(true)}
            leftIcon={<Apple className="w-3.5 h-3.5 text-slate-900 dark:text-white" />}
            rightIcon={<Smartphone className="w-3.5 h-3.5 text-emerald-500" />}
            className="w-full sm:w-auto"
          >
            Sync Apple Health / Google Fit
          </Button>
        </div>

      </Card>

      {/* Health Sync Modal */}
      <HealthSyncModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
      />
    </>
  );
};
