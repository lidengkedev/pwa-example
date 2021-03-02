# PWA 渐进式 WEB 应用程序介绍

> PWA（`Progressive web apps`，渐进式 Web 应用）运用现代的 Web API 以及传统的渐进式增强策略来创建跨平台 Web 应用程序。
这些应用无处不在、功能丰富，使其具有与原生应用相同的用户体验优势。

## 如何辨别一个web应用是否是一个PWA应用

PWA具有一下几种特点：

- [Discoverable](https://developer.mozilla.org/en-US/Apps/Progressive/Advantages#Discoverable), 内容可以通过搜索引擎发现。
- [Installable](https://developer.mozilla.org/en-US/Apps/Progressive/Advantages#Installable), 可以出现在设备的主屏幕。
- [Linkable](https://developer.mozilla.org/Apps/Progressive/Advantages#Linkable), 你可以简单地通过一个URL来分享它。 
- [Network independent](https://developer.mozilla.org/en-US/Apps/Progressive/Advantages#Network_independent), 它可以在离线状态或者是在网速很差的情况下运行。
- [Progressive](https://developer.mozilla.org/en-US/Apps/Progressive/Advantages#Progressive), 它在老版本的浏览器仍旧可以使用，在新版本的浏览器上可以使用全部功能。
- [Re-engageable](https://developer.mozilla.org/en-US/Apps/Progressive/Advantages#Re-engageable), 无论何时有新的内容它都可以发送通知。
- [Responsive](https://developer.mozilla.org/en-US/Apps/Progressive/Advantages#Responsive), 它在任何具有屏幕和浏览器的设备上可以正常使用——包括手机，平板电脑，笔记本，电视，冰箱，等。
- [Safe](https://developer.mozilla.org/en-US/Apps/Progressive/Advantages#Safe), 在你和应用之间的连接是安全的，可以阻止第三方访问你的敏感数据。

## WEB 应用框架

渲染网站主要有两种方法：**服务端** 或者 **客户端** 上渲染。

- **服务器端渲染（SSR）** 意思是在服务器上渲染网页，因此首次加载会更快，但是在不同页面之间导航都需要下载新的HTML内容。 它在浏览器中运行良好，但它受到加载速度的制约，因而带来可以感知的性能延迟——加载一个页面就需要和服务器之间一次往返。（原文：`but it suffers in terms of loading speed and therefore general perceived performance — loading every single page requires a new round trip to the server.`）
- **客户端渲染（CSR）** 允许在导航到不同页面时几乎立即在浏览器中更新网站，但在开始时需要更多的初始下载和客户端上的额外渲染。 首次访问时网站速度较慢，但后续访问速度要快得多。
将SSR与CSR混合可以获得最佳结果 - 可以在服务器上渲染网站，缓存其内容，然后在客户端需要时更新渲染。

## 兼容性
![image](https://lidengkedev.gitee.io/images/note/pwa-20201130173828.png)

## 参考

> 可以访问的成功案例站点如：

- vue 站点: [`https://cn.vuejs.org/`](https://cn.vuejs.org/)
- vue-cli 站点: [`https://cli.vuejs.org/zh/`](https://cli.vuejs.org/zh/)
- vue ssr demo 站点: [`https://vue-hn.herokuapp.com/top`](https://vue-hn.herokuapp.com/top)

> 可供参考的项目：

- 以链式 API 来完成 PWA 相关的操作 : [`https://github.com/JimmyVV/web-pwa`](https://github.com/JimmyVV/web-pwa)
- @vue/cli : [`https://github.com/vuejs/vue-cli/tree/docs`](https://github.com/vuejs/vue-cli/tree/docs)
- vue-hackernews-2.0 : [`https://github.com/vuejs/vue-hackernews-2.0`](https://github.com/vuejs/vue-hackernews-2.0)
- https://github.com/mdn/pwa-examples