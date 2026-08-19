/*
 * QUADLUD — generic pedagogy/audit adapter collection
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation
 * without prior written authorization is prohibited.
 */
(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.QuadludGamePedagogyAdapters=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION=1;
  const REQUIRED_METHODS=Object.freeze([
    'visibleErrors','errorFromAction','auditNeutralValue','auditConstructiveValue','auditMoveText',
    'canAcceptHypothesis','firstKnownLogicalMove','justifyMove','explorationContradiction',
    'suppressUnjustifiedAfterComplete','historyChangeText',
    'masteryDirectHint','learningMoveText','applyLearningMove','trainingHintForTechnique','trainingRandomProgress',
    'prepareTrainingBase','buildDirectTraining','trainingTargetStillCorrect','trainingCoachText','trainingRevealLabel','applyTrainingMove','coachAction',
    'walkthroughRootSnapshot','walkthroughVisibleClone','walkthroughSnapshot','walkthroughComplete','walkthroughGenerateNext',
    'walkthroughBoard','walkthroughContradictionText','walkthroughAfterRender','walkthroughInitialize',
    'localizedHint','pieceName','coachLookText','coachContextCells','runCoachHint','afterFinish'
  ]);
  function normalizeId(id){if(typeof id!=='string'||!id.trim())throw new TypeError('QUADLUD pedagogy adapter id must be a non-empty string');return id.trim()}
  function validateAdapter(id,adapter){
    if(!adapter||(typeof adapter!=='object'&&typeof adapter!=='function'))throw new TypeError(`QUADLUD pedagogy adapter unavailable: ${id}`);
    for(const method of REQUIRED_METHODS)if(typeof adapter[method]!=='function')throw new TypeError(`QUADLUD pedagogy adapter "${id}" must expose ${method}()`);
    return adapter
  }
  function createCollection(ids,resolver){
    if(!Array.isArray(ids))throw new TypeError('QUADLUD pedagogy adapter ids must be an array');
    if(typeof resolver!=='function')throw new TypeError('QUADLUD pedagogy adapter resolver must be a function');
    const normalized=[],known=new Set();
    for(const raw of ids){const id=normalizeId(raw);if(known.has(id))throw new TypeError(`Duplicate QUADLUD pedagogy adapter id: ${id}`);known.add(id);normalized.push(id)}
    const frozenIds=Object.freeze(normalized.slice()),cache=new Map();
    function has(id){return known.has(String(id||''))}
    function requireAdapter(id){const key=String(id||'');if(!known.has(key))throw new Error(`Unknown QUADLUD pedagogy adapter: ${id}`);if(cache.has(key))return cache.get(key);const adapter=validateAdapter(key,resolver(key));cache.set(key,adapter);return adapter}
    return Object.freeze({ids:frozenIds,has,require:requireAdapter})
  }
  return Object.freeze({VERSION,REQUIRED_METHODS,createCollection})
});
