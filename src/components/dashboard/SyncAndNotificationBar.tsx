'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HealthSyncModal } from '@/components/dashboard/HealthSyncModal';
import { 
  Bell, 
  BellCheck, 
  Smartphone, 
  Apple, 
  Check 
} from 'lucide-react';
import {
  hasPushSubscription,
  isWebPushConfigured,
  isWebPushSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '@/lib/pushNotifications';
import { useAppState } from '@/context/AppStateContext';

export const SyncAndNotificationBar: React.FC = () => {
  const { user } = useAppState();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  useEffect(() => {
    void hasPushSubscription().then(setPushEnabled);
  }, []);

  const handleEnableNotifications = async () => {
    if (!user) return;
    setPushMessage(null);

    try {
      await subscribeToPushNotifications(user.id);
      setPushEnabled(true);
      setPushMessage('Daily log reminders are enabled for 8:00 PM.');
    } catch (error) {
      setPushMessage(error instanceof Error ? error.message : 'Unable to enable notifications.');
    }
  };

  const handleDisableNotifications = async () => {
    setPushMessage(null);

    try {
      await unsubscribeFromPushNotifications();
      setPushEnabled(false);
      setPushMessage('Daily log reminders are disabled on this device.');
    } catch (error) {
      setPushMessage(error instanceof Error ? error.message : 'Unable to disable notifications.');
    }
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
              <Badge variant={pushEnabled ? 'emerald' : 'slate'}>
                {pushEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Daily reminders are sent at 8:00 PM in your time zone.</p>
            {pushMessage && <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{pushMessage}</p>}
          </div>
        </div>

        {/* HealthKit & Push Action Buttons */}
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {!pushEnabled ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleEnableNotifications}
              leftIcon={<BellCheck className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto"
              disabled={!user || !isWebPushConfigured() || !isWebPushSupported()}
            >
              Enable Daily Reminders
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisableNotifications}
              leftIcon={<Check className="w-3.5 h-3.5 text-emerald-500" />}
              className="w-full sm:w-auto"
            >
              Reminders Enabled
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
