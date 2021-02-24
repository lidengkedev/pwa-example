// self.importScripts('data/index.js');

// self.addEventListener('install', function(e) {
//     console.log('[Service Worker] Install');
//     e.waitUntil(
//         caches.open(cacheName).then(function(cache) {
//         console.log('[Service Worker] Caching all: app shell and content');
//         return cache.addAll(contentToCache);
//         })
//     );
// });

// self.addEventListener('fetch', function(e) {
//     e.respondWith(
//         caches.match(e.request).then(function(r) {
//             console.log('[Service Worker] Fetching resource: '+e.request.url);
//             return r || fetch(e.request).then(function(response) {
//                 return caches.open(cacheName).then(function(cache) {
//                     console.log('[Service Worker] Caching new resource: '+e.request.url);
//                     cache.put(e.request, response.clone());
//                     return response;
//                 });
//             });
//         })
//     );
// });

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('fox-store').then((cache) => cache.addAll([
        '/',
        '/index.html',
        '/index.js',
        '/css/index.css',
        '/favicon.ico',
        '/pwa.webmanifest',
        '/sw.js'
        ])),
    );
});

self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
});

self.onmessage = function(e) {
    console.log(['sw:onmessage', e])
}

self.addEventListener('push', (e) => {
    let data;
    if (data) {
        data = e.data.json();
        console.log(`push 的数据是：${data}`);
        self.registration.showNotification(data.text)
    } else {
        console.log('没有推送任何消息。')
    }
})