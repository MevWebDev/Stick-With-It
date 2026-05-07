/**
 * Push notification subscription and management
 */

import { API_URL } from "@/app/lib/api/apiConfig";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as BufferSource;
}

/**
 * Register Service Worker
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      throw new Error("Failed to register Service Worker");
    }
  }
  throw new Error("Service Workers are not supported in this browser");
}

/**
 * Request browser permission for notifications
 */
async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * Get push subscription and save to backend
 */
async function subscribeUserToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription> {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error("VAPID public key not configured");
  }

  let subscription = await registration.pushManager.getSubscription();

  // If subscription exists, always unsubscribe and create fresh one
  // This ensures we get valid keys, not corrupted cached ones
  if (subscription) {
    console.log("Found existing subscription, unsubscribing to get fresh keys...");
    await subscription.unsubscribe();
    subscription = null;
  }

  if (!subscription) {
    console.log("Creating new push subscription with fresh keys...");
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    console.log("✅ Push subscription created with fresh keys:", subscription);
  }

  // Send subscription to backend
  await saveSubscriptionToBackend(subscription);

  return subscription;
}

/**
 * Convert Uint8Array to base64 string
 */
function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return window.btoa(binary);
}

/**
 * Save subscription details to backend
 */
async function saveSubscriptionToBackend(subscription: PushSubscription) {
  const subscriptionJSON = subscription.toJSON();
  
  // Get auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
  
  if (!token) {
    throw new Error("Not authenticated. Please log in first.");
  }

  // Extract keys
  let p256dh: string | undefined = subscriptionJSON.keys?.p256dh as string | undefined;
  let auth: string | undefined = subscriptionJSON.keys?.auth as string | undefined;
  
  console.log("📊 Raw keys from subscription:");
  console.log(`  p256dh length: ${p256dh?.length}, first 20 chars: ${p256dh?.substring(0, 20)}`);
  console.log(`  auth length: ${auth?.length}, first 20 chars: ${auth?.substring(0, 20)}`);
  
  // If keys are Uint8Array (shouldn't happen after toJSON, but be safe), convert to base64
  if (p256dh && typeof p256dh !== 'string' && (p256dh as any).byteLength !== undefined) {
    console.log("  Converting p256dh from Uint8Array to base64...");
    p256dh = uint8ArrayToBase64(p256dh as any);
  }
  if (auth && typeof auth !== 'string' && (auth as any).byteLength !== undefined) {
    console.log("  Converting auth from Uint8Array to base64...");
    auth = uint8ArrayToBase64(auth as any);
  }

  console.log("📤 Sending to backend:");
  console.log(`  endpoint: ${subscriptionJSON.endpoint?.substring(0, 60)}...`);
  console.log(`  p256dh: ${p256dh?.substring(0, 20)}...`);
  console.log(`  auth: ${auth?.substring(0, 20)}...`);

  const response = await fetch(`${API_URL}/api/auth/push/subscribe/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint: subscriptionJSON.endpoint,
      p256dh: p256dh,
      auth: auth,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to save subscription to backend");
  }

  console.log("✅ Subscription saved to backend successfully");
  return await response.json();
}

/**
 * Main function to subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<boolean> {
  try {
    // Check browser support
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error("Your browser does not support push notifications");
    }

    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error("Notification permission denied. Please enable notifications in your browser settings.");
    }

    // Register service worker
    const registration = await registerServiceWorker();

    // Subscribe to push
    const subscription = await subscribeUserToPush(registration);

    console.log("✅ Successfully subscribed to push notifications");
    return true;
  } catch (error: any) {
    console.error("❌ Error subscribing to push notifications:", error);
    throw new Error(
      error.message || "Failed to enable push notifications. Please try again."
    );
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<void> {
  try {
    // First, unsubscribe from browser push manager
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log("Unsubscribed from push notifications (browser)");
    }

    // Then, remove subscription from backend
    const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;

    if (!token) {
      throw new Error("Not authenticated. Please log in first.");
    }

    const response = await fetch(`${API_URL}/api/auth/push/subscribe/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to unsubscribe from backend");
    }

    console.log("✅ Unsubscribed from push notifications (backend)");
    return await response.json();
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    throw error;
  }
}
