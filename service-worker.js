self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('content-cache').then((cache) => {
      return cache.addAll([
        '/StatsDev/',
        '/StatsDev/index.html',
        '/StatsDev/styles.css',
        '/StatsDev/app.js',
        '/StatsDev/manifest.json',
        '/StatsDev/Icon.png',
        '/StatsDev/Phoenix.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
}); // v4.2
