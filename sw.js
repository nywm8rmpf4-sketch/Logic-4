/*
 * QUADLUD
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation without prior written authorization is prohibited.
 */
const CACHE='quadlud-v3.0.1';
const ASSETS=['./','./index.html','./styles.css?v=3.0.1','./queens-logic.js?v=3.0.1','./difficulty-rating.js?v=3.0.1','./queens-difficulty.js?v=3.0.1','./tango-logic.js?v=3.0.1','./tango-difficulty.js?v=3.0.1','./patches-logic.js?v=3.0.1','./patches-difficulty.js?v=3.0.1','./sudoku-logic.js?v=3.0.1','./sudoku-difficulty.js?v=3.0.1','./platform-web.js?v=3.0.1','./web-storage.js?v=3.0.1','./data-serialization.js?v=3.0.1','./persistence-services.js?v=3.0.1','./generation-common.js?v=3.0.1','./queens-generator.js?v=3.0.1','./tango-generator.js?v=3.0.1','./sudoku-generator.js?v=3.0.1','./patches-generator.js?v=3.0.1','./session-core.js?v=3.0.1','./logical-move.js?v=3.0.1','./game-session-adapters.js?v=3.0.1','./reasoning-view.js?v=3.0.1','./game-ui-adapters.js?v=3.0.1','./game-contract.js?v=3.0.1','./game-manifest.js?v=3.0.1','./game-registry.js?v=3.0.1','./queens-ui.js?v=3.0.1','./tango-ui.js?v=3.0.1','./sudoku-ui.js?v=3.0.1','./patches-ui.js?v=3.0.1','./queens-runtime.js?v=3.0.1',
  './tango-runtime.js?v=3.0.1',
  './sudoku-runtime.js?v=3.0.1',
  './patches-runtime.js?v=3.0.1',
  './game-pedagogy-adapters.js?v=3.0.1','./queens-pedagogy.js?v=3.0.1','./tango-pedagogy.js?v=3.0.1','./sudoku-pedagogy.js?v=3.0.1','./patches-pedagogy.js?v=3.0.1','./pedagogy-metadata.js?v=3.0.1','./reasoning-presentation.js?v=3.0.1','./queens-reasoning-presentation.js?v=3.0.1','./tango-reasoning-presentation.js?v=3.0.1','./sudoku-reasoning-presentation.js?v=3.0.1','./patches-reasoning-presentation.js?v=3.0.1','./i18n-catalog.js?v=3.0.1',
  './queens-i18n.js?v=3.0.1',
  './tango-i18n.js?v=3.0.1',
  './sudoku-i18n.js?v=3.0.1',
  './patches-i18n.js?v=3.0.1','./nonogram-logic.js?v=3.0.1','./nonogram-validation-solver.js?v=3.0.1','./nonogram-difficulty.js?v=3.0.1','./nonogram-generator.js?v=3.0.1','./nonogram-ui.js?v=3.0.1','./nonogram-runtime.js?v=3.0.1','./nonogram-pedagogy.js?v=3.0.1','./nonogram-reasoning-presentation.js?v=3.0.1','./nonogram-i18n.js?v=3.0.1','./progression-stats.js?v=3.0.1','./app.js?v=3.0.1','./precompute-worker.js?v=3.0.1','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png','./build-info.json','./LICENSE'];
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
