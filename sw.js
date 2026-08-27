/*
 * QUADLUD
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation without prior written authorization is prohibited.
 */
const CACHE='quadlud-v3.1.5';
const ASSETS=['./','./index.html','./styles-core.css?v=3.1.5','./styles-patches.css?v=3.1.5','./styles-i18n.css?v=3.1.5','./styles-pedagogy.css?v=3.1.5','./styles-patches-direct.css?v=3.1.5','./styles-accessibility.css?v=3.1.5','./styles-sudoku-proof.css?v=3.1.5','./styles-data.css?v=3.1.5','./styles-nonogram.css?v=3.1.5','./styles-mobile.css?v=3.1.5','./queens-logic.js?v=3.1.5','./difficulty-rating.js?v=3.1.5','./queens-difficulty.js?v=3.1.5','./tango-logic.js?v=3.1.5','./tango-difficulty.js?v=3.1.5','./patches-logic.js?v=3.1.5','./patches-difficulty.js?v=3.1.5','./sudoku-logic.js?v=3.1.5','./sudoku-difficulty.js?v=3.1.5','./platform-web.js?v=3.1.5','./web-storage.js?v=3.1.5','./data-serialization.js?v=3.1.5','./persistence-services.js?v=3.1.5','./generation-common.js?v=3.1.5','./queens-qpool4.js?v=3.1.5','./queens-generator.js?v=3.1.5','./tango-generator.js?v=3.1.5','./sudoku-generator.js?v=3.1.5','./patches-generator.js?v=3.1.5','./session-core.js?v=3.1.5','./logical-move.js?v=3.1.5','./game-session-adapters.js?v=3.1.5','./reasoning-view.js?v=3.1.5','./game-ui-adapters.js?v=3.1.5','./game-contract.js?v=3.1.5','./game-manifest.js?v=3.1.5','./game-registry.js?v=3.1.5','./queens-ui.js?v=3.1.5','./tango-ui.js?v=3.1.5','./sudoku-ui.js?v=3.1.5','./patches-ui.js?v=3.1.5','./queens-runtime.js?v=3.1.5',
  './tango-runtime.js?v=3.1.5',
  './sudoku-runtime.js?v=3.1.5',
  './patches-runtime.js?v=3.1.5',
  './game-pedagogy-adapters.js?v=3.1.5','./queens-pedagogy.js?v=3.1.5','./tango-pedagogy.js?v=3.1.5','./sudoku-pedagogy.js?v=3.1.5','./patches-pedagogy.js?v=3.1.5','./pedagogy-metadata.js?v=3.1.5','./reasoning-presentation.js?v=3.1.5','./queens-reasoning-presentation.js?v=3.1.5','./tango-reasoning-presentation.js?v=3.1.5','./sudoku-reasoning-presentation.js?v=3.1.5','./patches-reasoning-presentation.js?v=3.1.5','./i18n-catalog.js?v=3.1.5',
  './queens-i18n.js?v=3.1.5',
  './tango-i18n.js?v=3.1.5',
  './sudoku-i18n.js?v=3.1.5',
  './patches-i18n.js?v=3.1.5','./nonogram-logic.js?v=3.1.5','./nonogram-validation-solver.js?v=3.1.5','./nonogram-difficulty.js?v=3.1.5','./nonogram-generator.js?v=3.1.5','./nonogram-ui.js?v=3.1.5','./nonogram-runtime.js?v=3.1.5','./nonogram-pedagogy.js?v=3.1.5','./nonogram-reasoning-presentation.js?v=3.1.5','./nonogram-i18n.js?v=3.1.5','./mastery-model.js?v=3.1.5','./progression-stats.js?v=3.1.5','./challenge-protocol.js?v=3.1.5','./daily-model.js?v=3.1.5','./diagnostic-ui-structural.js?v=3.1.5','./diagnostic-attachments.js?v=3.1.5','./diagnostic-recorder.js?v=3.1.5','./app-precompute.js?v=3.1.5','./app.js?v=3.1.5','./precompute-worker.js?v=3.1.5','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png','./build-info.json','./LICENSE'];
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
