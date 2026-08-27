/*
 * QUADLUD
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation without prior written authorization is prohibited.
 */
const CACHE='quadlud-v3.1.4';
const ASSETS=['./','./index.html','./styles-core.css?v=3.1.4','./styles-patches.css?v=3.1.4','./styles-i18n.css?v=3.1.4','./styles-pedagogy.css?v=3.1.4','./styles-patches-direct.css?v=3.1.4','./styles-accessibility.css?v=3.1.4','./styles-sudoku-proof.css?v=3.1.4','./styles-data.css?v=3.1.4','./styles-nonogram.css?v=3.1.4','./styles-mobile.css?v=3.1.4','./queens-logic.js?v=3.1.4','./difficulty-rating.js?v=3.1.4','./queens-difficulty.js?v=3.1.4','./tango-logic.js?v=3.1.4','./tango-difficulty.js?v=3.1.4','./patches-logic.js?v=3.1.4','./patches-difficulty.js?v=3.1.4','./sudoku-logic.js?v=3.1.4','./sudoku-difficulty.js?v=3.1.4','./platform-web.js?v=3.1.4','./web-storage.js?v=3.1.4','./data-serialization.js?v=3.1.4','./persistence-services.js?v=3.1.4','./generation-common.js?v=3.1.4','./queens-qpool4.js?v=3.1.4','./queens-generator.js?v=3.1.4','./tango-generator.js?v=3.1.4','./sudoku-generator.js?v=3.1.4','./patches-generator.js?v=3.1.4','./session-core.js?v=3.1.4','./logical-move.js?v=3.1.4','./game-session-adapters.js?v=3.1.4','./reasoning-view.js?v=3.1.4','./game-ui-adapters.js?v=3.1.4','./game-contract.js?v=3.1.4','./game-manifest.js?v=3.1.4','./game-registry.js?v=3.1.4','./queens-ui.js?v=3.1.4','./tango-ui.js?v=3.1.4','./sudoku-ui.js?v=3.1.4','./patches-ui.js?v=3.1.4','./queens-runtime.js?v=3.1.4',
  './tango-runtime.js?v=3.1.4',
  './sudoku-runtime.js?v=3.1.4',
  './patches-runtime.js?v=3.1.4',
  './game-pedagogy-adapters.js?v=3.1.4','./queens-pedagogy.js?v=3.1.4','./tango-pedagogy.js?v=3.1.4','./sudoku-pedagogy.js?v=3.1.4','./patches-pedagogy.js?v=3.1.4','./pedagogy-metadata.js?v=3.1.4','./reasoning-presentation.js?v=3.1.4','./queens-reasoning-presentation.js?v=3.1.4','./tango-reasoning-presentation.js?v=3.1.4','./sudoku-reasoning-presentation.js?v=3.1.4','./patches-reasoning-presentation.js?v=3.1.4','./i18n-catalog.js?v=3.1.4',
  './queens-i18n.js?v=3.1.4',
  './tango-i18n.js?v=3.1.4',
  './sudoku-i18n.js?v=3.1.4',
  './patches-i18n.js?v=3.1.4','./nonogram-logic.js?v=3.1.4','./nonogram-validation-solver.js?v=3.1.4','./nonogram-difficulty.js?v=3.1.4','./nonogram-generator.js?v=3.1.4','./nonogram-ui.js?v=3.1.4','./nonogram-runtime.js?v=3.1.4','./nonogram-pedagogy.js?v=3.1.4','./nonogram-reasoning-presentation.js?v=3.1.4','./nonogram-i18n.js?v=3.1.4','./mastery-model.js?v=3.1.4','./progression-stats.js?v=3.1.4','./challenge-protocol.js?v=3.1.4','./daily-model.js?v=3.1.4','./diagnostic-ui-structural.js?v=3.1.4','./diagnostic-attachments.js?v=3.1.4','./diagnostic-recorder.js?v=3.1.4','./app-precompute.js?v=3.1.4','./app.js?v=3.1.4','./precompute-worker.js?v=3.1.4','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png','./build-info.json','./LICENSE'];
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
