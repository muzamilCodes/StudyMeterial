// Self-unregistering service worker to cleanly remove any cached service worker from localhost:3000
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    self.registration.unregister().then(function () {
      return self.clients.matchAll();
    }).then(function (clients) {
      clients.forEach(function (client) {
        if (client.url && 'navigate' in client) {
          // Client can stay on current URL
        }
      });
    })
  );
});
