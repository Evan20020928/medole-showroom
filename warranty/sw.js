/* 保固維修回報已搬到 https://evan20020928.github.io/warranty-app/ ：舊位置的 service worker 自行移除並清掉快取 */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('warranty-app-')).map(n=>caches.delete(n)))).then(()=>self.registration.unregister()))});
