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


self.addEventListener('install', handleAddEventListenerInstall);        // 安装
self.addEventListener('fetch', handleAddEventListenerFetch);            // 请求
self.addEventListener('push', handleAddEventListenerPush);              // 监听服务器推送的消息
self.addEventListener('notificationclick', handleNotificationClick);    // 监听推送消息对话框点击事件
self.onmessage = handleOnMessage;                                       // 消息通知

// 安装
function handleAddEventListenerInstall(e) {
    console.log('[Service Worker] Install');
    e.waitUntil(
        caches.open('fox-store').then((cache) => cache.addAll([
        './index.html',
        './index.js',
        './css/index.css',
        './favicon.ico',
        './sw.js'
        ])),
    );
}
// 监听请求事件
function handleAddEventListenerFetch(e) {
    console.log(
        `[Service Worker] Fetch: request.url==> ${e.request.url}`
    );
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
}
/**
 * 服务器推送信息
 * @param {*} e 
 */
function handleAddEventListenerPush(e) {
    console.log('[Service Worker] Push');
    let data;
    if (e.data) {
        data = e.data.json();
        console.log(`push 的数据是：${JSON.stringify(data)}`);
        self.registration.showNotification(e.data.text())
    } else {
        console.log('没有推送任何消息。')
    }
}
/**
 * 消息通知
 * @param {*} e 
 */
function handleOnMessage(e) {
    console.log('[Service Worker] Install');
    console.log(['[Service Worker]:onmessage', e])
}
/**
 * 消息推送对话框点击事件
 * @param {*} e 
 */
function handleNotificationClick(e) {
    // 
    console.log('[Service Worker] Notificationclick');
}