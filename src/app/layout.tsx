import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'BuddySync | Habit & Fitness Tracker for Accountability Buddies',
  description: 'Track daily weight, step goals, and workouts with your accountability partner. Schedule joint workout sessions, send encouragement, and reach fitness checkpoints together.',
  keywords: ['fitness tracker', 'accountability buddies', 'habit tracking', 'workout planner', 'weight tracking', 'step counter'],
  authors: [{ name: 'BuddySync Team' }],
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
      <head>
        {/* Apply saved theme before paint to avoid a flash of the wrong theme on refresh */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('buddysync_theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen antialiased selection:bg-emerald-500 selection:text-white`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
