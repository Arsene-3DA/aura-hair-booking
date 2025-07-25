import { supabase } from '@/integrations/supabase/client';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Register for push notifications
 * @param vapidPublicKey - VAPID public key for push notifications
 * @returns Promise that resolves when registration is complete
 */
export async function registerPushNotifications(vapidPublicKey: string): Promise<boolean> {
  try {
    console.log('🔔 Registering for push notifications...');

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.error('❌ Service Worker not supported');
      return false;
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
      console.error('❌ Push messaging not supported');
      return false;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission denied');
      return false;
    }

    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Convert VAPID key from base64 to Uint8Array
      const vapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User not authenticated:', userError);
      return false;
    }

    // Save subscription to database
    const { error: saveError } = await supabase.functions.invoke('save-push-sub', {
      body: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey('p256dh') ? 
            btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : '',
          auth: subscription.getKey('auth') ? 
            btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : ''
        }
      }
    });

    if (saveError) {
      console.error('❌ Failed to save push subscription:', saveError);
      return false;
    }

    console.log('✅ Push notifications registered successfully');
    return true;

  } catch (error) {
    console.error('💥 Error registering push notifications:', error);
    return false;
  }
}

/**
 * Unregister from push notifications
 */
export async function unregisterPushNotifications(): Promise<boolean> {
  try {
    console.log('🔕 Unregistering from push notifications...');

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      
      // Mark subscription as inactive in database
      const { error } = await supabase
        .from('webpush_subscriptions')
        .update({ is_active: false })
        .eq('endpoint', subscription.endpoint);

      if (error) {
        console.error('❌ Failed to update subscription status:', error);
        return false;
      }
    }

    console.log('✅ Push notifications unregistered successfully');
    return true;

  } catch (error) {
    console.error('💥 Error unregistering push notifications:', error);
    return false;
  }
}

/**
 * Check if push notifications are supported and enabled
 */
export function isPushNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  return Notification.permission;
}

/**
 * Convert VAPID key from base64 to Uint8Array
 * @param base64String - Base64 encoded VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}