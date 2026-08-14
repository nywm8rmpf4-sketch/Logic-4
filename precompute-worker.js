/*
 * Logic 4 — background puzzle precomputation worker
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation
 * without prior written authorization is prohibited.
 */
'use strict';

/* app.js contains the authoritative generators.  The worker provides a minimal
   DOM/storage shim so the same generator code can be reused without maintaining
   a second implementation that might drift from the main application. */
function __noop(){}
function __classList(){return {add:__noop,remove:__noop,toggle:__noop,contains:()=>false}}
function __el(){
  return new Proxy({
    innerHTML:'',textContent:'',value:'',checked:false,hidden:false,dataset:{},style:{setProperty:__noop,removeProperty:__noop},
    classList:__classList(),children:[],appendChild:__noop,insertAdjacentHTML:__noop,addEventListener:__noop,
    querySelector:()=>__el(),querySelectorAll:()=>[],setAttribute:__noop,removeAttribute:__noop,remove:__noop,
    getBoundingClientRect:()=>({left:0,top:0,width:320,height:320})
  },{get:(t,p)=>p in t?t[p]:__noop,set:(t,p,v)=>(t[p]=v,true)})
}
self.addEventListener=__noop;
self.matchMedia=()=>({matches:false,addEventListener:__noop});
self.innerWidth=390;self.innerHeight=844;
self.window=self;
self.document={
  documentElement:{dataset:{},lang:'fr'},
  body:{dataset:{},classList:__classList(),appendChild:__noop,insertAdjacentHTML:__noop},
  hidden:false,
  querySelector:()=>__el(),querySelectorAll:()=>[],createElement:()=>__el(),addEventListener:__noop
};
self.localStorage={getItem:()=>null,setItem:__noop,removeItem:__noop,clear:__noop};
if(!self.navigator)self.navigator={};
self.requestAnimationFrame=f=>{try{f()}catch(_){};return 0};
self.cancelAnimationFrame=__noop;
self.setInterval=()=>0;
self.clearInterval=__noop;

// Use the exact same versioned generator implementation as the UI.
importScripts('./app.js?v=2.8.1');

function __queenBackgroundCandidate(diff,forbidden){
  let count=diff==='expert'?16:diff==='hard'?14:6;
  let out=[],batch=new Set(),guard=0,maxTries=Math.max(64,count*16),blocked=new Set(forbidden||[]);
  while(out.length<count&&guard++<maxTries){
    try{
      let g=queenCandidate(diff),sig=queenCanonicalSignature(g.reg);
      if(blocked.has(sig)||batch.has(sig))continue;
      batch.add(sig);g.__queenSignature=sig;out.push(g)
    }catch(_){}
  }
  if(!out.length)throw new Error('No fresh Queens candidate available');
  let g=targetPick(out,diff);
  if(!g.__queenSignature)g.__queenSignature=queenCanonicalSignature(g.reg);
  return g
}
function __build(game,diff,forbiddenQueens){
  if(game==='queens')return __queenBackgroundCandidate(diff,forbiddenQueens);
  if(game==='tango')return targetPick(collectCandidates(()=>tangoCandidate(diff),6),diff);
  if(game==='sudoku')return targetPick(collectCandidates(()=>sudokuCandidate(diff),8),diff);
  if(game==='patches')return targetPick(collectCandidates(()=>patchesCandidate(diff),diff==='hard'?5:4),diff);
  throw new Error('Unknown game')
}
self.onmessage=e=>{
  let m=e.data||{};
  if(m.cmd!=='generate')return;
  let started=Date.now();
  try{
    let candidate=__build(m.game,m.diff,m.forbiddenQueens||[]);
    self.postMessage({ok:true,id:m.id,game:m.game,diff:m.diff,day:m.day,candidate,ms:Date.now()-started})
  }catch(err){
    self.postMessage({ok:false,id:m.id,game:m.game,diff:m.diff,day:m.day,error:String(err?.message||err),ms:Date.now()-started})
  }
};
