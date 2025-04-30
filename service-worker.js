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
/*
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
*/
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open('content-cache');
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  event.respondWith(networkFirst(event.request));
});
