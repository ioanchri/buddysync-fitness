'use client';

export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  const permission = await Notification.requestPermission();
  return permission;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (!isNotificationSupported()) return;
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }
};
