let deferredPrompt;
const addBtn = document.querySelector('.add-button');
const notifications = document.getElementById('notifications');
const noticeBtn = document.querySelector('.notice-button');

addBtn.style.display = 'none';

if ('serviceWorker' in navigator && 'PushManager' in window) {
    var publicKey = 'BOEQSjdhorIf8M0XFNlwohK3sTzO9iJwvbYU-fuXRF0tvRpPPMGO6d_gJC_pUQwBT7wD8rKutpNTFHOHN3VqJ0A';
    // 注册 sw
    navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
            notifications.innerHTML = 'Service Worker 注册成功'
            console.log('Service Worker Registered'); 
            // 开启该客户端的消息推送订阅功能
            return subscribeUserToPush(registration, publicKey);
        }).then(subscription => {
            const body = { subscription }
            body.uniqueid = Date.now()
            console.log(`uniqueid: ${body.uniqueid}`)
            // 将生成的客户端订阅信息存储在自己的服务器上
            // return sendSubscriptionToServer(JSON.stringify(body));
        });
} else {
    notifications.innerHTML = '浏览器不支持 service worker 功能'
    // return;
}

function subscribeUserToPush(registration, publicKey) {
    const subscribeOptions = {
        userVisibleOnly: true,
        // applicationServerKey: window.Uint8Array(publicKey)
        applicationServerKey: publicKey
    }
    return registration.pushManager.subscribe(subscribeOptions).then(pushSubscription => {
        console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
        return pushSubscription;
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

// Code to handle install prompt on desktop
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