/*
 * QUADLUD — Shared logical difficulty rating contract
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation
 * without prior written authorization is prohibited.
 */
(function(root){
'use strict';

const VERSION=1;
const SCHEMA_VERSION=1;
const RATING_VERSION=1;
const FINGERPRINT_VERSION=1;
const GENERATOR_VERSION=1;

const TIER_DEFINITIONS=Object.freeze([
  Object.freeze({index:0,key:'easy',name:'Easy'}),
  Object.freeze({index:1,key:'medium',name:'Medium'}),
  Object.freeze({index:2,key:'hard',name:'Hard'}),
  Object.freeze({index:3,key:'expert',name:'Expert'})
]);
const TIER_KEYS=Object.freeze(TIER_DEFINITIONS.map(x=>x.key));
const STATUSES=Object.freeze(['solved','blocked','contradictory','budget-exhausted','invalid']);
const GAMES=Object.freeze(['queens','tango','sudoku','patches']);

function copy(value){return value==null?value:JSON.parse(JSON.stringify(value))}
function assertObject(value,message){if(!value||typeof value!=='object'||Array.isArray(value))throw new Error(message)}
function assertGame(game){if(!GAMES.includes(game))throw new Error('Unknown difficulty-rating game')}
function assertGrid(grid,n,valid,message){
  if(!Array.isArray(grid)||grid.length!==n||grid.some(row=>!Array.isArray(row)||row.length!==n))throw new Error(message);
  for(const row of grid)for(const value of row)if(!valid(value))throw new Error(message);
}
function assertCell(cell,n,message){if(!Array.isArray(cell)||cell.length!==2||!cell.every(Number.isInteger)||cell[0]<0||cell[0]>=n||cell[1]<0||cell[1]>=n)throw new Error(message)}
function compareScalar(a,b){return typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b))}
function normalizeRegionLabels(reg){
  let labels=new Map(),next=0;
  return reg.map(row=>row.map(value=>{let key=typeof value+':'+String(value);if(!labels.has(key))labels.set(key,next++);return labels.get(key)}));
}
function canonicalQueens(puzzle){
  let n=Number(puzzle.n);
  if(!Number.isInteger(n)||n<2)throw new Error('Invalid Queens public puzzle size');
  let reg=puzzle.reg??puzzle.regions;
  assertGrid(reg,n,value=>Number.isInteger(value)||typeof value==='string','Invalid Queens public regions');
  return {schema:SCHEMA_VERSION,game:'queens',n,reg:normalizeRegionLabels(reg)};
}
function canonicalTango(puzzle){
  let state=puzzle.initialState??puzzle.state,n=Number(puzzle.n??state?.length);
  if(!Number.isInteger(n)||n<2||n%2)throw new Error('Invalid Soleil/Lune public puzzle size');
  assertGrid(state,n,value=>value===-1||value===0||value===1,'Invalid Soleil/Lune public state');
  let edges=Array.isArray(puzzle.edges)?puzzle.edges.map(edge=>{
    if(!Array.isArray(edge)||edge.length!==4)throw new Error('Invalid Soleil/Lune public relation');
    let [r,c,dir,rel]=edge;if(!Number.isInteger(r)||!Number.isInteger(c)||(dir!=='r'&&dir!=='d')||(rel!=='='&&rel!=='×'))throw new Error('Invalid Soleil/Lune public relation');
    let other=dir==='r'?[r,c+1]:[r+1,c];assertCell([r,c],n,'Invalid Soleil/Lune public relation');assertCell(other,n,'Invalid Soleil/Lune public relation');
    return [r,c,dir,rel];
  }):[];
  edges.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2].localeCompare(b[2])||a[3].localeCompare(b[3]));
  return {schema:SCHEMA_VERSION,game:'tango',n,state:state.map(row=>row.slice()),edges};
}
function canonicalSudoku(puzzle){
  let state=puzzle.initialState??puzzle.state,n=Number(puzzle.n??state?.length);
  if(n!==6)throw new Error('Invalid Grille 6 public puzzle size');
  assertGrid(state,n,value=>Number.isInteger(value)&&value>=0&&value<=6,'Invalid Grille 6 public state');
  return {schema:SCHEMA_VERSION,game:'sudoku',n,state:state.map(row=>row.slice())};
}
function normalizeShape(shape){
  if(shape==null)return null;
  if(shape==='square'||shape==='carré'||shape==='□')return 'square';
  if(shape==='vertical'||shape==='▯')return 'vertical';
  if(shape==='horizontal'||shape==='▭')return 'horizontal';
  throw new Error('Invalid Rectangles public clue shape');
}
function canonicalPatches(puzzle){
  let n=Number(puzzle.n);if(!Number.isInteger(n)||n<5||n>10)throw new Error('Invalid Rectangles public puzzle size');
  if(Array.isArray(puzzle.clues)){let clues={};puzzle.clues.forEach((clue,id)=>{clues[id]=copy(clue)});return canonicalPatches({n,ids:puzzle.clues.map((_,id)=>id),clues})}
  assertObject(puzzle.clues,'Rectangles public clues are required');
  let ids=Array.isArray(puzzle.ids)?puzzle.ids.slice():Object.keys(puzzle.clues).map(x=>Number.isNaN(Number(x))?x:Number(x));
  if(!ids.length)throw new Error('Rectangles public clues are required');
  ids.sort(compareScalar);
  let seen=new Set(),clues=ids.map(id=>{
    let raw=puzzle.clues[id];assertObject(raw,'Invalid Rectangles public clue');assertCell(raw.pos,n,'Invalid Rectangles public clue position');
    let cell=raw.pos[0]+','+raw.pos[1];if(seen.has(cell))throw new Error('Two Rectangles public clues cannot share a cell');seen.add(cell);
    let mode=raw.mode??'both';if(!['both','size','shape','none'].includes(mode))throw new Error('Invalid Rectangles public clue mode');
    let out={pos:raw.pos.slice(),mode};
    if(mode==='both'||mode==='size'){let size=Number(raw.size??raw.area);if(!Number.isInteger(size)||size<1||size>n*n)throw new Error('Invalid Rectangles public clue size');out.size=size}
    if(mode==='both'||mode==='shape'){let shape=normalizeShape(raw.shape);if(!shape)throw new Error('Invalid Rectangles public clue shape');out.shape=shape}
    return out;
  });
  clues.sort((a,b)=>a.pos[0]-b.pos[0]||a.pos[1]-b.pos[1]||a.mode.localeCompare(b.mode));
  return {schema:SCHEMA_VERSION,game:'patches',n,clues};
}
function canonicalizePublicPuzzle(puzzle){
  assertObject(puzzle,'Public puzzle is required');let game=String(puzzle.game||'');assertGame(game);
  if(game==='queens')return canonicalQueens(puzzle);
  if(game==='tango')return canonicalTango(puzzle);
  if(game==='sudoku')return canonicalSudoku(puzzle);
  return canonicalPatches(puzzle);
}
function canonicalString(puzzle){return JSON.stringify(canonicalizePublicPuzzle(puzzle))}
function fnv1a128(text){
  let hash=0x6c62272e07bb014262b821756295c58dn,prime=0x0000000001000000000000000000013bn,mask=(1n<<128n)-1n;
  for(let i=0;i<text.length;i++){let code=text.charCodeAt(i);hash^=BigInt(code&0xff);hash=(hash*prime)&mask;hash^=BigInt(code>>>8);hash=(hash*prime)&mask}
  return hash.toString(16).padStart(32,'0');
}
function fingerprintCanonical(canonical){return 'qfp'+FINGERPRINT_VERSION+'-'+fnv1a128(JSON.stringify(canonical))}
function fingerprintPublicPuzzle(puzzle){return fingerprintCanonical(canonicalizePublicPuzzle(puzzle))}
function tierIndex(tier){
  if(tier==null)return null;
  if(Number.isInteger(tier)&&tier>=0&&tier<TIER_DEFINITIONS.length)return tier;
  let key=String(tier).toLowerCase(),found=TIER_DEFINITIONS.find(x=>x.key===key);if(!found)throw new Error('Invalid difficulty tier');return found.index;
}
function tierKey(tier){let index=tierIndex(tier);return index==null?null:TIER_DEFINITIONS[index].key}
function normalizeCountMap(value){
  if(value==null)return {};
  assertObject(value,'deductionsByRule must be an object');let out={};for(const key of Object.keys(value).sort()){let count=Number(value[key]);if(!Number.isInteger(count)||count<0)throw new Error('Invalid deduction count');if(count)out[key]=count}return out;
}
function createAvailabilityTracker(){return {samples:0,initialAvailableMoves:null,minAvailableMoves:null,bottleneckCount:0}}
function recordAvailableMoves(tracker,count){
  assertObject(tracker,'Availability tracker is required');let n=Number(count);if(!Number.isInteger(n)||n<0)throw new Error('Invalid available move count');
  if(!Number.isInteger(tracker.samples)||tracker.samples<0)throw new Error('Invalid availability tracker');
  if(tracker.samples===0){tracker.initialAvailableMoves=n;tracker.minAvailableMoves=n;tracker.bottleneckCount=1}
  else if(n<tracker.minAvailableMoves){tracker.minAvailableMoves=n;tracker.bottleneckCount=1}
  else if(n===tracker.minAvailableMoves)tracker.bottleneckCount++;
  tracker.samples++;return tracker;
}
function availabilityMetrics(tracker){
  if(tracker==null)return {initialAvailableMoves:null,minAvailableMoves:null,bottleneckCount:0};
  assertObject(tracker,'Availability tracker is required');
  if(!Number.isInteger(tracker.samples)||tracker.samples<0)throw new Error('Invalid availability tracker');
  if(!tracker.samples)return {initialAvailableMoves:null,minAvailableMoves:null,bottleneckCount:0};
  return {initialAvailableMoves:Number(tracker.initialAvailableMoves),minAvailableMoves:Number(tracker.minAvailableMoves),bottleneckCount:Number(tracker.bottleneckCount)};
}
function normalizeTierAttemptResult(result,tier){
  assertObject(result,'Difficulty tier adapter must return an object');
  let status=String(result.status||'');
  if(!STATUSES.includes(status))throw new Error('Invalid difficulty tier adapter status');
  if(status==='blocked'&&result.budgetHit)throw new Error('Blocked difficulty tier result cannot report budgetHit; use budget-exhausted');
  return {
    tierIndex:tier.index,
    tier:tier.key,
    status,
    budgetHit:status==='budget-exhausted'||!!result.budgetHit,
    result:copy(result)
  };
}
function profileMetricsFromResult(result){
  let value=result&&typeof result==='object'?result:{};
  return {
    limitingTechniqueLevel:value.limitingTechniqueLevel??null,
    limitingRules:value.limitingRules??[],
    totalLogicalSteps:value.totalLogicalSteps??0,
    deductionsByRule:value.deductionsByRule??{},
    limitingTierStepCount:value.limitingTierStepCount??0,
    initialAvailableMoves:value.initialAvailableMoves??null,
    minAvailableMoves:value.minAvailableMoves??null,
    bottleneckCount:value.bottleneckCount??0,
    maxProofDepth:value.maxProofDepth??0,
    structure:value.structure??{}
  };
}
function runMinimumRequiredTier(options){
  assertObject(options,'Minimum-tier runner options are required');
  assertObject(options.adapter,'Difficulty tier adapter is required');
  if(typeof options.adapter.solveTier!=='function')throw new Error('Difficulty tier adapter must expose solveTier()');
  let initialPuzzle=canonicalizePublicPuzzle(options.puzzle),attempts=[];
  for(const tier of TIER_DEFINITIONS){
    let attemptPuzzle=copy(initialPuzzle);
    let raw=options.adapter.solveTier({puzzle:attemptPuzzle,tier:tier.key,tierIndex:tier.index});
    if(raw&&typeof raw.then==='function')throw new Error('Async difficulty tier adapters are not supported');
    let attempt=normalizeTierAttemptResult(raw,tier);attempts.push(attempt);
    if(attempt.status==='solved'){
      return {
        status:'solved',
        difficulty:tier.key,
        minimumRequiredTier:tier.index,
        attempts:copy(attempts),
        winningAttempt:copy(attempt),
        profile:createDifficultyProfile({puzzle:initialPuzzle,status:'solved',difficulty:tier.key,minimumRequiredTier:tier.index,budgetHit:attempt.budgetHit,...profileMetricsFromResult(attempt.result)})
      };
    }
    if(attempt.status==='blocked')continue;
    return {
      status:attempt.status,
      difficulty:null,
      minimumRequiredTier:null,
      attempts:copy(attempts),
      winningAttempt:null,
      profile:createDifficultyProfile({puzzle:initialPuzzle,status:attempt.status,budgetHit:attempt.budgetHit,...profileMetricsFromResult(attempt.result)})
    };
  }
  return {
    status:'blocked',
    difficulty:null,
    minimumRequiredTier:null,
    attempts:copy(attempts),
    winningAttempt:null,
    profile:createDifficultyProfile({puzzle:initialPuzzle,status:'blocked',...profileMetricsFromResult(attempts[attempts.length-1]?.result)})
  };
}

function createDifficultyProfile(options){
  assertObject(options,'DifficultyProfile options are required');
  let puzzle=options.puzzle,publicPuzzle=canonicalizePublicPuzzle(puzzle),status=options.status??'blocked';if(!STATUSES.includes(status))throw new Error('Invalid difficulty status');
  let minimumRequiredTier=tierIndex(options.minimumRequiredTier),difficulty=options.difficulty==null?tierKey(minimumRequiredTier):tierKey(options.difficulty);
  if(minimumRequiredTier!=null&&difficulty!=null&&tierKey(minimumRequiredTier)!==difficulty)throw new Error('Difficulty and minimumRequiredTier disagree');
  let limitingTechniqueLevel=options.limitingTechniqueLevel==null?null:Number(options.limitingTechniqueLevel);if(limitingTechniqueLevel!=null&&(!Number.isInteger(limitingTechniqueLevel)||limitingTechniqueLevel<0))throw new Error('Invalid limiting technique level');
  let limitingRules=Array.isArray(options.limitingRules)?[...new Set(options.limitingRules.map(String))].sort():[];
  let nonNegativeInteger=(value,name,defaultValue=0)=>{if(value==null)return defaultValue;let n=Number(value);if(!Number.isInteger(n)||n<0)throw new Error('Invalid '+name);return n};
  return {
    schema:SCHEMA_VERSION,
    ratingVersion:RATING_VERSION,
    game:publicPuzzle.game,
    status,
    difficulty,
    minimumRequiredTier,
    limitingTechniqueLevel,
    limitingRules,
    totalLogicalSteps:nonNegativeInteger(options.totalLogicalSteps,'totalLogicalSteps'),
    deductionsByRule:normalizeCountMap(options.deductionsByRule),
    limitingTierStepCount:nonNegativeInteger(options.limitingTierStepCount,'limitingTierStepCount'),
    initialAvailableMoves:options.initialAvailableMoves==null?null:nonNegativeInteger(options.initialAvailableMoves,'initialAvailableMoves'),
    minAvailableMoves:options.minAvailableMoves==null?null:nonNegativeInteger(options.minAvailableMoves,'minAvailableMoves'),
    bottleneckCount:nonNegativeInteger(options.bottleneckCount,'bottleneckCount'),
    maxProofDepth:nonNegativeInteger(options.maxProofDepth,'maxProofDepth'),
    budgetHit:!!options.budgetHit,
    structure:options.structure==null?{}:copy(options.structure),
    fingerprint:fingerprintCanonical(publicPuzzle)
  };
}

root.DifficultyRating={
  VERSION,SCHEMA_VERSION,RATING_VERSION,FINGERPRINT_VERSION,GENERATOR_VERSION,
  TIER_DEFINITIONS,TIER_KEYS,STATUSES,GAMES,
  canonicalizePublicPuzzle,canonicalString,fingerprintPublicPuzzle,createDifficultyProfile,runMinimumRequiredTier,tierIndex,tierKey,
  createAvailabilityTracker,recordAvailableMoves,availabilityMetrics
};
if(typeof module!=='undefined'&&module.exports)module.exports=root.DifficultyRating;
})(typeof globalThis!=='undefined'?globalThis:this);
