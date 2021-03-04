# Service Worker

## Service Worker 要解决的问题

> 丢失网络链接问题

即使是世界上最好的 WEB APP ，如果不下载它，也是非常糟糕的体验。如今已经有很多技术尝试着去解决这些问题，而且离线页面的出现，解决了一部分问题，但是最重要的问题依然没有解决，就是没有一个好的统筹机制对资源缓存和自定义的网络请求进行控制。

> APP Cache

APP Cache 是一个不错的方法，它可以很容易的指定需要离线缓存的资源，但是它需要遵循很多规则，如果不严格执行这些规则，它会把你的APP搞的一塌糊涂。APP Cache 更多信息可以查看 [Jake Archibald](http://alistapart.com/article/application-cache-is-a-douchebag)

而 Service Worker 的出现就是为了解决这些问题。

## Service Worker 安全问题

Service Worker 在使用起来权限比较大，所以在使用起来，安全问题是必须要重视的问题。所以Service Worker 的使用必须在 HTTPS 协议上才能正常运行。为了便于开发， localhost 也会被浏览器认为是安全源。

## Service Worker 是如何注册的

Service worker 遵循以下7个基本步骤：

1. Service Worker URL 通过 register() 来获取和注册。
2. 注册成功后 service Worker 在一个非主进程（执行脚本）的进程中运行，有一个独立的运行环境，并且没有访问DOM的能力
3. 注册成功后就可以在自己的作用域中处理事件了
4. 在受 service worker 控制的页面中，在页面打开后浏览器会尝试去安装 service worker 。最先发送给 service worker 的事件是 install （安装）事件，在这个事件中可以开始进行填充 indexedDB 和缓存站点资源。这个流程同原生APP或者Firefox OS APP 是一样的，让所有资源可以离线访问。
5. 当 oninstall 事件处理程序执行完后，就可以认为 service worker 已经完成了安装
6. 激活 service worker 。当 service worker 安装完成后，就会触发一个激活事件 activate ，它的用途是用来清理先前版本的 service worker 中使用的资源。
7. 最后 service worker 就可以控制页面了，但只能是在 register() 注册过的页面才可以控制页面。也就是说，页面起始于有没有 service worker ，且在页面的接下来生命周期内维持这个状态。所以，页面不得不重新加载以让 service worker 获得完全的控制。

![image](https://mdn.mozillademos.org/files/12636/sw-lifecycle.png)

## Service Worker 支持的事件

- install 安装
- activate 激活
- message 消息
- function event 方法函数
    - fetch 请求
    - sync 异步
    - push 推送

## Service Worker 的核心工作机制

service worker 的核心工作机制是 Promise，也就是说 service worker 可以使用链式调用，如 then、catch 方法。

## 注册 Service worker

在主进程中注册 service worker ，在 sw.js 文件中使用 service worker 的事件处理。

- 首先要先检查 浏览器 是否支持 service worker 。
- 接着使用 register() 函数来注册站点的 service worker，service worker 只是驻留在 APP 中的一个 JS 文件，这个文件的 URL 是相对于 Origin ，而不是相对于引用它的那个 JS　文件的。
- scope 是选填项，用来指定 service worker 控制的内容的子目录。这里的 /sw-test/ 代表 service worker 可以控制 /sw-test/ 目录下的所有页面，如果 scope 不指定，则 service worker 可以控制 Origin 下的所有页面。

```js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw-test/sw.js', { scope: '/sw-test/' }).then(registration => {
        // 注册成功
        console.log('注册成功：', registration.scope)
    }).catch(error => {
        // 注册失败
        console.log('注册失败：' + error)
    })
}
```
单个 service worker 可以控制很多页面，而且 service worker 脚本中声明的都是全局变量，每个页面不会拥有自己的 worker 。所以多个页面之间的都可以访问 service worker 中声明的全局变量。

service worker 就像是一个代理服务器一样，它允许你修改请求和相应，用它们的缓存来替代它们等。

## service worker 注册失败的原因

1. 站点没有运行在 HTTPS 下
2. service worker 文件的地址没有写对。地址是相对于 origin 的，而不是相对于 APP 根目录的。
3. service worker 在不同的 origin 中，而不是在自己的 APP 中。

> 注意事项

- service worker 只能抓取在 service worker scope 中从客户端发出的请求。
- 最大的 scope 就是 service worker 所在的地址
- 如果 service worker 被激活在一个有 Service-Worker-Allowed header 的客户端，可以为 service worker 指定一个最大的 scope 的列表。

在 Firefox 的 隐私模式下，无法使用 service worker API。

## service worker 存储缓存

service worker 存储缓存一般是在 install 的时候进行的，使用 service worker API 的全局对象 caches 。

self 是 service worker 中的全局变量，等同于 this 和 window 对象。但是它没有操作 DOM 的能力。

```js
// sw.js
self.addEventListener('install', e => {
    // waitUntil 方法是用于确保 service worker 不会在 waitUntil 里面的代码执行完成之前完成安装，导致存储失败
    e.waitUntil(
        // caches.open 方法可以新建一个名叫 v1 的缓存，
        // 将站点上的资源缓存在 浏览器 application 下的 Cache Storage 中作为第一个版本
        // cache.addAll 方法将会把传入的资源缓存下来
        // 主文件的路径不能直接写 /sw-test/index.html，否则在离线的时候无法匹配路径导致网站无法启动
        // 主文件的路径可以写 /sw-test/ ，在离线加载过程中去获取缓存时会主动找到 /sw-test/ 域下的 index.html，
        // 如果路径直接写成 /sw-test/index.html ，
        // 在离线加载过程中去获取缓存时反而找不到 /sw-test/ 域下的 index.html 资源
        // 同样也可以缓存API接口
        // 对于固定不变的资源可以采用直接获取缓存不需要请求网络资源
        // 对于需要动态变化的资源可以采用网络请求不需要缓存资源
        caches.open('v1').then(cache => {
            return cache.addAll([
                '/sw-test/',
                '/sw-test/app.js',
                '/sw-test/images/',
                '/sw-test/images/bg.png',
                '/sw-test/manifest.json',
                '/api/pwa/push'
            ])
        })
    )
})
```
## 自定义请求的响应

在 service worker 中使用 fetch 来代替 XMLHttpRequest 方法，用于处理请求的响应。

![image](https://mdn.mozillademos.org/files/12634/sw-fetch.png)

任何被 service worker 控制的页面中的资源被请求时，都会触发 fetch 事件，这些资源包括文档引用的资源，跨域的请求，图片等。

在资源请求的过程中拦截请求的资源，然后匹配缓存资源，如果是缓存资源则直接使用缓存资源，如果不是缓存资源则发起请求，并将请求获取的新资源存储到缓存中，对于一些不需要的资源也可以选择不缓存。

```js
// sw.js
self.addEventListener('fetch', e => {
    // 请求网络资源并缓存资源时只能缓存同源下的网络资源资源
    const req = e.request

    const url = new URL(req.url)

    if (url.origin === self.origin) return;

    if (url.incldues('/api')) {
        // 网络优先
        networkFirst()
    } else {
        // 缓存优先
        cacheFirst()
    }
    // respondWith 方法用来劫持 HTTP 请求的响应数据
    e.respondWith(
        // caches.match 方法是对网络请求的资源和 cache 里面可获取的资源进行匹配，查看是否缓存中有相应的资源。
        // 这个匹配通过 url 和 vary header 进行，就像正常的 http 请求一样。
        // 如果没有在缓存中找到匹配的资源，可以使用 fetch 进行请求获取网络资源。
        // 如果没有在缓存中找到匹配的资源，同时网络也不可用，这个时候可以把
        // 一些回退的页面作为响应来匹配这些资源。如 error.html
        caches.match(e.request).then(response => {
            return response || fetch(e.request).then(res => {
                // 从服务器请求资源后，将资源保存到缓存中以便离线时可以使用
                return caches.open('v1').then(cache => {
                    // cache.put() 把这些资源加入到缓存中
                    // res.clone() 克隆一份响应并加入到缓存中，
                    // 但是它的原始响应则会返回给浏览器，并给调用它的页面用。
                    cache.put(e.request, res.clone())
                    return res
                })
            })
        }).catch(err => {
            // 当请求失败提供一个回退的方案就是提供一个错误信息页面或者提供一张图片
            // return caches.match('/sw-test/error.jpg')
            return caches.match('/sw-test/error.html')
        })
    );
})
```

对于资源文件应该采取缓存优先的方式获取资源，对于API接口因该通过网络优先的方式获取资源

> 网络优先

虽然采用的时网络优先，但时依然需要考虑两个问题：

1. 当断网的时候，页面如何展示
2. 当断网后，页面显示什么资源

当网络断开的时候，应该采用缓存资源，这个时候就需要获取缓存，当网络请求成功时，同样需要将请求的资源添加到缓存中，以便当断网的时候能够显示最新的缓存资源。

```js
async function networkFirst(req) {
    try {
        // 有网络时通过网络获取资源
        const response = await fetch(req)
        const res = await response.json()
        // 将请求成功的资源克隆一份添加到缓存中
        caches.put(req, res.clone())
        // 将原始资源返回给客户端操作
        return res
    } catch (err) {
        // 没有网络或者API接口异常时通过缓存获取资源
        const cache = await caches.open(CACHE_NAME)
        console.log('通过 network 获取资源失败，开始采用 cache 资源', err)
        return await cache.match(req)
    }
}
```

> 缓存优先

```js
async function cachesFirst(req) {
    try {
        const cache = await caches.open(CACHE_NAME)
        return await cache.match(req)
    } catch (err) {
        // 有网络时通过网络获取资源
        const response = await fetch(req)
        const res = await response.json()
        // 将请求成功的资源克隆一份添加到缓存中
        caches.put(req, res.clone())
        console.log('通过 caches 获取资源失败，开始 network 资源', err)
        // 将原始资源返回给客户端操作
        return res
    }
}
```

> 克隆一份响应并加入到缓存中，这么做的目的是什么？

这是因为请求和响应流只能被读取一次。为了给浏览器返回响应以及把它缓存起来，不得不克隆一份。所以原始的会返回给浏览器，克隆的会发送到缓存中。它们都只读取了一次。

## 更新 service worker

如果 service worker 已经安装，但是刷新页面的时候有一个新的版本，新版本会在后台安装，但是并没有被激活，当所有已加载的页面资源不再使用旧版本的 service worker 的时候，新版本的 service worker 才会被激活。

> 如何更改版本

更改版本非常简单，只需要把 service worker 中的 caches.open('v2') 中的 v1 更改为 v2 就可以了，这时更新网页就会出现一个新的版本v2和一个旧的版本v1，如果v1不再需要的时候，可以在 activate 事件中清除旧版本。

```js
// const CACHE_NAME = 'cache_v1'
const CACHE_NAME = 'cache_v2'
self.addEventListener('install', async e => {
    const cache = await caches.open(CACHE_NAME)
    cache.addAll([...])
    await self.skipWaiting()
})
```

## 删除缓存

activate 事件一般用来做破坏之前还在运行的旧版本的缓存。可以用来清理一些不再需要的数据，避免占用太多的磁盘空间。

每个浏览器对 service worker 的可用缓存空间有硬性限制，浏览器清理磁盘的时候通常会删除域下面的所有数据。而 waitUntil() 方法的 Promise 会阻塞其他的事件，直到它完成，它可以确保在清理磁盘操作会在第一个 fetch 事件之前完成，从而避免 fetch 刚获取的数据被清理掉。

```js
// sw.js
self.addEventListener('activate', e => {
    // 白名单
    const cacheWhiteList = ['v2']
    e.waitUntil(
        // 在 fetch 请求之前会完成以下操作
        caches.keys().then(keyList => {
            // 查找所有的缓存版本，并把不再白名单中的版本全部删除
            return Promise.all(keyList.map(key => {
                if (cacheWhiteList.indexOf() === -1) {
                    return caches.delete(key)
                }
            }))
        })
    )
})
```
