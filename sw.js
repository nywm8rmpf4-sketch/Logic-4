/*
 * QUADLUD
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation without prior written authorization is prohibited.
 */
const CACHE='quadlud-v2.26.0';
const ASSETS=['./','./index.html','./styles.css?v=2.26.0','./queens-logic.js?v=2.26.0','./difficulty-rating.js?v=2.26.0','./queens-difficulty.js?v=2.26.0','./tango-logic.js?v=2.26.0','./tango-difficulty.js?v=2.26.0','./patches-logic.js?v=2.26.0','./patches-difficulty.js?v=2.26.0','./sudoku-logic.js?v=2.26.0','./sudoku-difficulty.js?v=2.26.0','./platform-web.js?v=2.26.0','./web-storage.js?v=2.26.0','./data-serialization.js?v=2.26.0','./persistence-services.js?v=2.26.0','./generation-common.js?v=2.26.0','./queens-generator.js?v=2.26.0','./tango-generator.js?v=2.26.0','./sudoku-generator.js?v=2.26.0','./patches-generator.js?v=2.26.0','./session-core.js?v=2.26.0','./game-session-adapters.js?v=2.26.0','./game-contract.js?v=2.26.0','./game-registry.js?v=2.26.0','./app.js?v=2.26.0','./precompute-worker.js?v=2.26.0','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png','./build-info.json','./LICENSE'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{let x=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',x));return r}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    let network=fetch(e.request).then(r=>{if(r&&r.ok){let x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x))}return r}).catch(()=>cached);
    return cached||network
  }))
});
