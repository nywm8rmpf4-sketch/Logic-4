/*
 * QUADLUD
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation without prior written authorization is prohibited.
 */
const CACHE='quadlud-v2.32.0';
const ASSETS=['./','./index.html','./styles.css?v=2.32.0','./queens-logic.js?v=2.32.0','./difficulty-rating.js?v=2.32.0','./queens-difficulty.js?v=2.32.0','./tango-logic.js?v=2.32.0','./tango-difficulty.js?v=2.32.0','./patches-logic.js?v=2.32.0','./patches-difficulty.js?v=2.32.0','./sudoku-logic.js?v=2.32.0','./sudoku-difficulty.js?v=2.32.0','./platform-web.js?v=2.32.0','./web-storage.js?v=2.32.0','./data-serialization.js?v=2.32.0','./persistence-services.js?v=2.32.0','./generation-common.js?v=2.32.0','./queens-generator.js?v=2.32.0','./tango-generator.js?v=2.32.0','./sudoku-generator.js?v=2.32.0','./patches-generator.js?v=2.32.0','./session-core.js?v=2.32.0','./logical-move.js?v=2.32.0','./game-session-adapters.js?v=2.32.0','./reasoning-view.js?v=2.32.0','./game-ui-adapters.js?v=2.32.0','./game-contract.js?v=2.32.0','./game-manifest.js?v=2.32.0','./game-registry.js?v=2.32.0','./queens-ui.js?v=2.32.0','./tango-ui.js?v=2.32.0','./sudoku-ui.js?v=2.32.0','./patches-ui.js?v=2.32.0','./queens-runtime.js?v=2.32.0',
  './tango-runtime.js?v=2.32.0',
  './sudoku-runtime.js?v=2.32.0',
  './patches-runtime.js?v=2.32.0',
  './game-pedagogy-adapters.js?v=2.32.0','./queens-pedagogy.js?v=2.32.0','./tango-pedagogy.js?v=2.32.0','./sudoku-pedagogy.js?v=2.32.0','./patches-pedagogy.js?v=2.32.0','./pedagogy-metadata.js?v=2.32.0','./reasoning-presentation.js?v=2.32.0','./queens-reasoning-presentation.js?v=2.32.0','./tango-reasoning-presentation.js?v=2.32.0','./sudoku-reasoning-presentation.js?v=2.32.0','./patches-reasoning-presentation.js?v=2.32.0','./i18n-catalog.js?v=2.32.0',
  './queens-i18n.js?v=2.32.0',
  './tango-i18n.js?v=2.32.0',
  './sudoku-i18n.js?v=2.32.0',
  './patches-i18n.js?v=2.32.0','./nonogram-logic.js?v=2.32.0','./nonogram-validation-solver.js?v=2.32.0','./nonogram-difficulty.js?v=2.32.0','./nonogram-generator.js?v=2.32.0','./nonogram-ui.js?v=2.32.0','./nonogram-runtime.js?v=2.32.0','./nonogram-pedagogy.js?v=2.32.0','./nonogram-reasoning-presentation.js?v=2.32.0','./nonogram-i18n.js?v=2.32.0','./progression-stats.js?v=2.32.0','./app.js?v=2.32.0','./precompute-worker.js?v=2.32.0','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png','./build-info.json','./LICENSE'];
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
