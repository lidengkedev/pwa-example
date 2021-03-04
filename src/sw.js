importScripts('utils/auth.js');
// self.importScripts('data/index.js');

const CHECK_NAME = 'cache_v1'

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
self.addEventListener('activate', handleAddEventListenerActivate);      // 激活
self.addEventListener('fetch', handleAddEventListenerFetch);            // 请求
self.addEventListener('push', handleAddEventListenerPush);              // 监听服务器推送的消息
self.addEventListener('notificationclick', handleNotificationClick);    // 监听推送消息对话框点击事件
self.onmessage = handleOnMessage;                                       // 消息通知

/**
 * 安装和激活：填充缓存
 * @param {*} e 
 * install 事件会在注册完成之后触发。
 * install 事件一般是被用来填充你的浏览器的离线缓存能力。
 * waitUntil() 方法会确保Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成。
 * caches.open() 方法来创建了一个叫做 v1 的新的缓存，将会是我们的站点资源缓存的第一个版本。
 * 接着会调用在创建的缓存示例上的一个方法 addAll()，这个方法的参数是一个由一组相对于 origin 的 URL 组成的数组，
 * 这些 URL 就是你想缓存的资源的列表。
 * 当安装成功完成之后， service worker 就会激活。
 * IndexedDB 可以在 service worker 内做数据存储。
 */
function handleAddEventListenerInstall(e) {
    console.log('[Service Worker] Install', e);

    async function something() {
        const cache = await caches.open(CHECK_NAME)
        cache.addAll([
            './',
            './index.js',
            './css/index.css',
            './favicon.ico',
            './manifest.json',
            './pwa.webmanifest'
        ])
        // 跳过等待直接激活
        // self.skipWaiting() 方法是异步的，返回的是一个 promise 对象
        await self.skipWaiting();
    }
    e.waitUntil(something());
    
}
/**
 * 激活
 * @param {*} e 
 */
function handleAddEventListenerActivate(e) {
    // 默认情况下，激活 service worker 后并没有获得 页面的控制权，
    // 需要刷新一下才能完全控制页面
    // 激活后立即获得控制权
    async function something() {
        const keys = await caches.keys()
        keys.forEach(key => {
            if (key !== CHECK_NAME) {
                caches.delete(key)
            }
        })
        await self.clients.claim()
    }
    e.waitUntil(something())
}
/**
 * 监听请求事件
 * @param {*} e 
 * 给 service worker 添加一个 fetch 的事件监听器，
 * 接着调用 event 上的 respondWith() 方法来劫持我们的 HTTP 响应，
 * 然后你用可以用自己的方法来更新他们。
 */
function handleAddEventListenerFetch(e) {
    console.log(
        `[Service Worker] Fetch: request.url==> ${e.request.url}`, e
    );
    // caches.match(event.request) 允许我们对网络请求的资源和 cache 里可获取的资源进行匹配，查看是否缓存中有相应的资源。
    e.respondWith(
        caches.match(e.request)
            .then(cacheresponse => {
                return cacheresponse || fetch(e.request).then(response => {
                    return caches.open('v1').then(cache => {
                        cache.put(e.request, response.clone())
                        return response
                    })
                })
            })
            .catch(() => {
                // 提供一个默认的回退方案以便不管发生了什么，用户至少能得到些东西
                return caches.match('./images/error.jpg')
            })
    );
}
/**
 * 服务器推送信息
 * @param {*} e 
 */
function handleAddEventListenerPush(e) {
    console.log('[Service Worker] Push', e);
    // let data;
    // if (e.data) {
    //     data = e.data.json();
    //     console.log(`push 的数据是：${JSON.stringify(data)}`);
    //     self.registration.showNotification('推送消息', {
    //         body: '您有新的消息，请注意查收',
    //         data: {
    //             url: './'
    //         }
    //     })
    // } else {
    //     console.log('没有推送任何消息。')
    // }
    e.waitUntil(
        self.registration.showNotification('服务端推送信息', {
            body: '服务端推送信息',
        })
    )
}
/**
 * 消息通知
 * @param {*} e 
 */
function handleOnMessage(e) {
    console.log(['[Service Worker]:onmessage', e])
}
/**
 * 消息推送对话框点击事件
 * @param {*} e 
 */
function handleNotificationClick(e) {
    console.log('[Service Worker] Notificationclick', e);
    // 关闭当前的弹窗
    e.notification.close();
    // 在新窗口打开页面
    e.waitUntil(
        // e.notification.data 取出推送通知中的数据
        // clients.openWindow(e.notification.data)
        clients.openWindow(e.notification.data.url)
    );
}