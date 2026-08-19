'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  Smartphone, 
  Apple, 
  Flame, 
  Footprints, 
  ShieldCheck 
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

interface HealthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthSyncModal: React.FC<HealthSyncModalProps> = ({ isOpen, onClose }) => {
  const { logDailyMetrics } = useAppState();

  const [appleHealthConnected, setAppleHealthConnected] = useState(true);
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string | null>(null);

  const handleSyncData = () => {
    setSyncing(true);
    setLastSyncMsg(null);

    setTimeout(() => {
      // Simulate reading steps from Apple HealthKit / Google Health Connect API
      const importedSteps = 11450;
      logDailyMetrics({ steps: importedSteps });

      setSyncing(false);
      setLastSyncMsg(`✓ Imported ${importedSteps.toLocaleString()} steps from Apple Health!`);
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apple Health & Google Fit Sync"
      subtitle="Automatically import step counts, active calories, and workouts from your device"
    >
      <div className="space-y-4">
        
        {/* Apple Health Connection Card */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Apple HealthKit</span>
                {appleHealthConnected && <Badge variant="emerald">Connected</Badge>}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">iOS Health app integration</p>
            </div>
          </div>

          <Button
            variant={appleHealthConnected ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setAppleHealthConnected(!appleHealthConnected)}
          >
            {appleHealthConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>

        {/* Google Fit / Health Connect Card */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Google Health Connect</span>
                {googleFitConnected && <Badge variant="emerald">Connected</Badge>}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Android Google Fit API</p>
            </div>
          </div>

          <Button
            variant={googleFitConnected ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setGoogleFitConnected(!googleFitConnected)}
          >
            {googleFitConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>

        {/* Sync Permissions List */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Active Sync Permissions</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Footprints className="w-3.5 h-3.5 text-cyan-500" /> Daily Steps</span>
            <span className="text-emerald-500 font-bold">Auto-Syncing</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-500" /> Active Calories & Workouts</span>
            <span className="text-emerald-500 font-bold">Auto-Syncing</span>
          </div>
        </div>

        {/* Sync Action & Feedback */}
        {lastSyncMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{lastSyncMsg}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            isLoading={syncing}
            onClick={handleSyncData}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Sync Fitness Data Now
          </Button>
        </div>

      </div>
    </Modal>
  );
};
