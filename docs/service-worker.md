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
4. 在受 service worker 控制的页面中，在页面打开后浏览器会尝试去安装 service worker 。最先发送给 service worker 的事件是 install （安装）事件，在这个事件中可以开始进行填充 indexedDB 和缓存站点资源。这个流程同原生APP或者Firefox OS APP 是一样的，让所有资源可以离线方法问。
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

service worker 存储缓存一般是在 install 的时候进行的，使用 service worker API 的全局对象 cache 。

```js
self.addEventListener('install', e => {
    // waitUntil 方法是用于确保 service worker 不会在 waitUntil 里面的代码执行完成之前完成安装，导致存储失败
    e.waitUntil(
        // caches.open 方法可以新建一个名叫 v1 的缓存，
        // 将站点上的资源缓存在 浏览器 application 下的 Cache Storage 中作为第一个版本
        // cache.addAll 方法将会把传入的资源缓存下来
        caches.open('v1').then(cache => {
            return cache.addAll([
                '/sw-test/',
                '/sw-test/index.html',
                '/sw-test/app.js',
                '/sw-test/images/',
                '/sw-test/images/bg.png'
            ])
        })
    )
})
```
