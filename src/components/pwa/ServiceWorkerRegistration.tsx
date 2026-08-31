'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { APP_VERSION } from '@/lib/appVersion';

export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let isRefreshing = false;

    const handleControllerChange = () => {
      if (!isRefreshing) {
        isRefreshing = true;
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      registrationRef.current = registration;

      const showUpdate = () => {
        if (registration.waiting) {
          setUpdateAvailable(true);
        }
      };

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
      showUpdate();
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const applyUpdate = () => {
    registrationRef.current?.waiting?.postMessage({ type: 'SKIP_WAITING' });
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-5 z-[70] mx-auto flex max-w-sm items-center justify-between gap-3 rounded-lg border border-emerald-400/30 bg-slate-950 px-3 py-2.5 text-white shadow-xl">
      <span className="text-xs font-semibold">Version {APP_VERSION} is ready.</span>
      <button
        type="button"
        onClick={applyUpdate}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-400"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Update
      </button>
    </div>
  );
}