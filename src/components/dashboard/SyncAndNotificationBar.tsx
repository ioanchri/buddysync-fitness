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
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-emerald-500/20">
        
        {/* Push Notifications Section */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Push Notifications</h3>
              <Badge variant={permission === 'granted' ? 'emerald' : 'slate'}>
                {permission === 'granted' ? 'Enabled 🔔' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Get real-time buddy workout alerts & reminders</p>
          </div>
        </div>

        {/* HealthKit & Push Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {permission !== 'granted' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleEnableNotifications}
              leftIcon={<BellCheck className="w-3.5 h-3.5" />}
            >
              Enable Browser Push Alerts
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              leftIcon={testSentNotice ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bell className="w-3.5 h-3.5 text-purple-500" />}
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
