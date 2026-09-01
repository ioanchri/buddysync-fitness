import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0b0f19',
  colorScheme: 'dark light',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'BuddySync | Habit & Fitness Tracker for Accountability Buddies',
  description: 'Track daily weight, step goals, and workouts with your accountability partner. Schedule joint workout sessions, send encouragement, and reach fitness checkpoints together.',
  keywords: ['fitness tracker', 'accountability buddies', 'habit tracking', 'workout planner', 'weight tracking', 'step counter'],
  authors: [{ name: 'BuddySync Team' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
  },
  openGraph: {
    title: 'BuddySync - Accountability Buddy Fitness Tracker',
    description: 'Track daily metrics, share progress with buddies, and plan joint workouts together.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased selection:bg-emerald-500 selection:text-white`}>
        <ServiceWorkerRegistration />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
