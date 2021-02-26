let deferredPrompt;
const addBtn = document.querySelector('.add-button');
const serverPush = document.querySelector('.server-push');
const notifications = document.getElementById('notifications');
const noticeBtn = document.querySelector('.notice-button');

addBtn.style.display = 'none';
let subscription;

if ('serviceWorker' in navigator && 'PushManager' in window) {
    // 注册 sw
    navigator.serviceWorker.register('./sw.js').then(() => {
        notifications.innerHTML = 'Service Worker 注册成功'
        console.log('Service Worker Registered'); 
    })
    navigator.serviceWorker.ready.then((registration) => {
        return registration.pushManager.getSubscription()
            .then(async (subscription) => {
                if (subscription) {
                    return subscription;
                }
                const response = await fetch('https://localhost:3000/api/pwa/vapidPublicKey')
                const vapidPublicKey = await response.text();
                // 开启该客户端的消息推送订阅功能
                return subscribeUserToPush(registration, vapidPublicKey);
            })
    }).then(subscription => {
        // 将生成的客户端订阅信息存储在自己的服务器上
        console.log('subscription: ', subscription)
        return sendSubscriptionToServer(subscription);
    });
} else {
    notifications.innerHTML = '浏览器不支持 service worker 功能'
}
/**
 * 客户端的消息推送订阅功能
 * @param {*} registration 
 * @param {*} publicKey 
 */
function subscribeUserToPush(registration, publicKey) {
    const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
    }
    return registration.pushManager.subscribe(subscribeOptions).then(pushSubscription => {
        console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
        return pushSubscription;
    })
}

function sendSubscriptionToServer(subscription) {
    fetch('https://localhost:3000/api/pwa/send', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            subscription,
            delay: 0,
            ttl: 10
        })
    })
}

// 发送通知
noticeBtn.onclick = function() {
    Notification.requestPermission().then((result) => {
        /**
         * result: default 默认询问
         * result: granted 允许
         * result: denied 禁止
         */
        console.log(result)
        if (result === 'default') {
            notifications.innerHTML = '浏览器通知权限：默认询问'
        } else if (result === 'denied') {
            notifications.innerHTML = '浏览器通知权限：禁止'
        } else if (result === 'granted') {
            notifications.innerHTML = '浏览器通知权限：允许'
            new Notification('这是一个通知', {
                body: '这是一个通知的通知内容'
            })
        }
    });
}

serverPush.onclick = function() {
    fetch('https://localhost:3000/api/pwa/push', {
        method: 'post',
        body: '',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

// 安装WEB应用程序之前需要做的操作
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    addBtn.style.display = 'block';

    addBtn.addEventListener('click', () => {
        // hide our user interface that shows our A2HS button
        addBtn.style.display = 'none';
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
    });
});

// 设备离线时需要做的事情
window.addEventListener('offline', e => {
    Notification.requestPermission().then(result => {
        new Notification('信息提示', {
            body: '您已离线，已进入离线操作模式。'
        })
    })
});

// 设备上线后需要做的事情
window.addEventListener('online', e => {
    Notification.requestPermission().then(result => {
        new Notification('信息提示', {
            body: '您已上线，正在为您同步数据，请稍后...'
        })
    });
});

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
