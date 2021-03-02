# PWA 实战分析

一个  PWA 渐进式 WEB 应用程序至少需要2个条件和4个基础功能。

2个条件分别是：
1. 一个应用程序清单`manifest.json` 或者 `pwa.webmanifest`
2. service worker 服务，负责处理离线储存和服务端推送

4个基础功能：
1. 可以将应用程序安装到桌面
2. 可以离线操作应用程序
3. 可以离线存储待应用程序上线时可以同步离线数据
4. 可以服务端推送信息

## 新建 PWA 渐进式 WEB 应用程序

新建一个 PWA 渐进式 WEB 应用程序，首先要搭建项目架构，比如VEU框架已经集成了PWA功能，只需要在 vue.config.js 中的 pwa 属性中配置 应用程序清单即可。新建项目后，根据项目结构来配置应用程序清单 `manifest.json`:
```json
{
    "name": "应用程序名称",
    "short_name": "应用程序简称",
    "theme_color": "应用程序主题颜色，十六进制",
    "start_url": "应用程序的入口文件路径，可以是相对路径，也可以时绝对路径",
    "display": "fullscreen",
    "description": "应用程序的介绍和描述信息",
    "icons": [
        {
            "src": "应用程序的图标路径，可以是相对路径，也可以是绝对路径",
            "sizes": "应用程序图标的文件大小，不能小于144x144",
            "type": "应用程序图标的文件类型，如image/png"
        }
    ],
    "permissions": {
        "desktop-notification": {
            "name": "桌面通知权限配置"
        }
    },
    "background_color": "应用程序背景色，十六进制"
}
```
manifest.json中的name和icons必须要配置正确，否则无法显示安装图标也就无法实现应用程序的安装了，icons 中图标大小必须要大于144x144否则也无法正常显示安装图标。

### 注册 service worker 服务进程

PWA 的离线操作和服务端信息推送接收和数据的同步、存储等都需要 service worker 服务进程的支持，所以我们首先需要注册 service worker 服务。

在注册 service worker 服务之前需要先判断您的浏览器是否支持 service worker 服务。

```js
// serviceWorker service worker 服务
// PushManger 是用来推送信息
if ('serviceWorker' in navigator && 'PushManager' in window) {}
```
只有注册 server worker 服务之后才能使用 server worker 的API功能
```js
navigator.serverWorker.register('./sw.js');
```
navigator.serverWorker.register 方法可以使用 Promise 类似的语法，比如then,catch方法等

### 应用程序安装

正确配置 manifest.json 后再浏览器就可以看到浏览器地址栏尾部有一个安装按钮图标，点击安装按钮出现一个应用程序对话框，可以将应用程序安装到桌面。可以通过