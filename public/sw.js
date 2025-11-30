const CACHE_NAME = "dr-dhobi-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  let data = { title: "New Booking", body: "New booking received!" };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
    vibrate: [200, 100, 200],
    tag: "booking-notification",
    requireInteraction: true,
    actions: [
      { action: "view", title: "View Booking" },
      { action: "close", title: "Dismiss" }
    ],
    data: {
      url: data.url || "/admin",
      bookingId: data.bookingId
    }
  };

  event.waitUntil(
    self.registration.showNotification("🧺 Dr Dhobi - " + data.title, options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view" || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window open
        for (let client of clientList) {
          if (client.url.includes("/admin") && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});
