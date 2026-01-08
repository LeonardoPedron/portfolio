const CACHE_VERSION = 'lp-portfolio-v2.1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const MAX_DYNAMIC_CACHE_SIZE = 50;

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/main.js',
    '/js/interactive.js',
    '/js/i18n.js',
    '/manifest.json'
];

const limitCacheSize = (cacheName, maxSize) => {
    caches.open(cacheName).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > maxSize) {
                cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxSize));
            }
        });
    });
};

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name.startsWith('lp-portfolio-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') return;

    if (url.origin === location.origin) {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request).then(networkResponse => {
                    if (networkResponse.status === 200) {
                        return caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(request, networkResponse.clone());
                            limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
                            return networkResponse;
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    if (request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
            })
        );
    } else {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                return cachedResponse || fetch(request).then(networkResponse => {
                    if (networkResponse.status === 200 && request.url.match(/\.(css|js|woff2|woff|ttf)$/)) {
                        return caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(request, networkResponse.clone());
                            limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
                            return networkResponse;
                        });
                    }
                    return networkResponse;
                }).catch(() => cachedResponse);
            })
        );
    }
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
