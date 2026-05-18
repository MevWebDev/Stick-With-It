// @ts-nocheck
// public/worker/index.ts
// Custom service worker logic for push notifications
// This will be merged with next-pwa's generated service worker

export default function worker() {
  // Handle push notifications
  self.addEventListener("push", function (event) {
    // @ts-ignore
    if (event.data) {
      // Parse the JSON sent from Django (accounts/tasks.py)
      const data = event.data.json();

      const options = {
        body: data.body,
        icon: "/icon-192x192.png", // Add your app icon here if you have one
        badge: "/icon-192x192.png", // Small icon for the status bar
        vibrate: [100, 50, 100],
        data: {
          url: "/", // Where to take the user when they click the notification
        },
      };

      // Show the notification
      event.waitUntil(self.registration.showNotification(data.title, options));
    }
  });

  // Handle notification clicks
  self.addEventListener("notificationclick", function (event) {
    // @ts-ignore
    event.notification.close();

    // Safely get the URL from notification data
    const url =
      (event.notification &&
        event.notification.data &&
        event.notification.data.url) ||
      "/";

    event.waitUntil(self.clients.openWindow(url));
  });
}
