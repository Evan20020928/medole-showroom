/* 米多力展示台 service worker — app shell cached on install, CDN (three.js / fonts) cached on first use, works offline afterwards. */
const VERSION='medole-showroom-3d9ad7bfb8';
const SHELL=["./", "data.js", "engine.js", "families.js", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-32.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "index.html", "manifest.webmanifest", "models/md-100lb.js", "models/md-130lb.js", "models/md-140lb.js", "models/md-210lb.js", "models/md-250lb.js", "models/md-300lbd.js", "models/md-30lb.js", "models/md-35lb-tp.js", "models/md-40lbd.js", "models/md-70lbad.js", "models/md-70lbd.js", "models/md-70lbdn.js", "models/md-a40lb.js"];
const CDN=/^https:\/\/(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('medole-showroom-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(req.mode==='navigate'){   // page: network first so updates show up, cached copy when offline
    e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put('./',c));return r;}).catch(()=>caches.match('./').then(r=>r||caches.match('index.html'))));return;}
  if(url.origin===location.origin||CDN.test(req.url)){   // assets: cache first, refresh in the background
    e.respondWith(caches.open(VERSION).then(c=>c.match(req,{ignoreSearch:url.origin===location.origin}).then(hit=>{
      const net=fetch(req,{cache:'no-cache'}).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r;}).catch(()=>hit);
      return hit||net;})));
  }
});
