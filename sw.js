/*
 * QUADLUD
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation without prior written authorization is prohibited.
 */
const CACHE='quadlud-v3.1.2';
const ASSETS=['./','./index.html','./styles.css?v=3.1.2','./queens-logic.js?v=3.1.2','./difficulty-rating.js?v=3.1.2','./queens-difficulty.js?v=3.1.2','./tango-logic.js?v=3.1.2','./tango-difficulty.js?v=3.1.2','./patches-logic.js?v=3.1.2','./patches-difficulty.js?v=3.1.2','./sudoku-logic.js?v=3.1.2','./sudoku-difficulty.js?v=3.1.2','./platform-web.js?v=3.1.2','./web-storage.js?v=3.1.2','./data-serialization.js?v=3.1.2','./persistence-services.js?v=3.1.2','./generation-common.js?v=3.1.2','./queens-qpool4.js?v=3.1.2','./queens-generator.js?v=3.1.2','./tango-generator.js?v=3.1.2','./sudoku-generator.js?v=3.1.2','./patches-generator.js?v=3.1.2','./session-core.js?v=3.1.2','./logical-move.js?v=3.1.2','./game-session-adapters.js?v=3.1.2','./reasoning-view.js?v=3.1.2','./game-ui-adapters.js?v=3.1.2','./game-contract.js?v=3.1.2','./game-manifest.js?v=3.1.2','./game-registry.js?v=3.1.2','./queens-ui.js?v=3.1.2','./tango-ui.js?v=3.1.2','./sudoku-ui.js?v=3.1.2','./patches-ui.js?v=3.1.2','./queens-runtime.js?v=3.1.2',
  './tango-runtime.js?v=3.1.2',
  './sudoku-runtime.js?v=3.1.2',
  './patches-runtime.js?v=3.1.2',
  './game-pedagogy-adapters.js?v=3.1.2','./queens-pedagogy.js?v=3.1.2','./tango-pedagogy.js?v=3.1.2','./sudoku-pedagogy.js?v=3.1.2','./patches-pedagogy.js?v=3.1.2','./pedagogy-metadata.js?v=3.1.2','./reasoning-presentation.js?v=3.1.2','./queens-reasoning-presentation.js?v=3.1.2','./tango-reasoning-presentation.js?v=3.1.2','./sudoku-reasoning-presentation.js?v=3.1.2','./patches-reasoning-presentation.js?v=3.1.2','./i18n-catalog.js?v=3.1.2',
  './queens-i18n.js?v=3.1.2',
  './tango-i18n.js?v=3.1.2',
  './sudoku-i18n.js?v=3.1.2',
  './patches-i18n.js?v=3.1.2','./nonogram-logic.js?v=3.1.2','./nonogram-validation-solver.js?v=3.1.2','./nonogram-difficulty.js?v=3.1.2','./nonogram-generator.js?v=3.1.2','./nonogram-ui.js?v=3.1.2','./nonogram-runtime.js?v=3.1.2','./nonogram-pedagogy.js?v=3.1.2','./nonogram-reasoning-presentation.js?v=3.1.2','./nonogram-i18n.js?v=3.1.2','./progression-stats.js?v=3.1.2','./diagnostic-ui-structural.js?v=3.1.2','./diagnostic-attachments.js?v=3.1.2','./diagnostic-recorder.js?v=3.1.2','./app.js?v=3.1.2','./precompute-worker.js?v=3.1.2','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png','./build-info.json','./LICENSE'];
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
