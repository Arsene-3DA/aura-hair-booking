/* eslint-disable no-undef */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope & {
  skipWaiting(): void;
  clients: ServiceWorkerGlobalScope['clients'];
  registration: ServiceWorkerRegistration;
  addEventListener: typeof addEventListener;
  __WB_MANIFEST: any;
};

// Skip waiting and claim clients immediately
self.skipWaiting();
self.addEventListener('activate', () => {
  self.clients.claim();
});

// Clean up outdated caches
cleanupOutdatedCaches();

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache strategies
// 1. HTML pages - Network First (always try network first for fresh content)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'html-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// 2. JavaScript, CSS, and Worker files - Stale While Revalidate
registerRoute(
  ({ request }) => ['script', 'style', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);

// 3. Supabase Storage images (avatars, uploads) - Cache First
registerRoute(
  ({ url }) => 
    url.hostname.includes('supabase.co') && 
    (url.pathname.includes('/storage/v1/object/public/') || 
     url.pathname.includes('/stylists/')),
  new CacheFirst({
    cacheName: 'supabase-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);

// 4. External images (ui-avatars.com, unsplash, etc.) - Cache First
registerRoute(
  ({ request, url }) => 
    request.destination === 'image' && 
    (url.hostname.includes('ui-avatars.com') || 
     url.hostname.includes('unsplash.com') ||
     url.hostname.includes('images.unsplash.com')),
  new CacheFirst({
    cacheName: 'external-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);

// 5. API calls - Network First with fallback
registerRoute(
  ({ url }) => 
    url.hostname.includes('supabase.co') && 
    (url.pathname.includes('/rest/v1/') || 
     url.pathname.includes('/functions/v1/')),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 5, // 5 minutes
      }),
    ],
  })
);

// Handle push notifications
self.addEventListener('push', (event: PushEvent) => {
  console.log('📱 Push notification received:', event);
  
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Aura Hair Booking', options)
    );
  } catch (error) {
    console.error('❌ Error handling push notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Aura Hair Booking', {
        body: 'Vous avez une nouvelle notification',
        icon: '/icons/icon-192.png',
      })
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();

  const clickAction = event.action;
  const notificationData = event.notification.data;

  let urlToOpen = '/';
  
  // Determine URL based on notification data
  if (notificationData?.bookingId) {
    urlToOpen = `/bookings/${notificationData.bookingId}`;
  } else if (notificationData?.url) {
    urlToOpen = notificationData.url;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle background sync (future feature)
self.addEventListener('sync', (event: SyncEvent) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Future: implement background sync for offline booking queue
      Promise.resolve()
    );
  }
});

console.log('✅ Service Worker loaded and configured');