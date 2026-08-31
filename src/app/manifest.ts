import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'BuddySync - Accountability Buddy Fitness Tracker',
    short_name: 'BuddySync',
    description: 'Track daily weight, step goals, and workouts with your accountability partner.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0b0f19',
    theme_color: '#10b981',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
      { src: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
  };
}
