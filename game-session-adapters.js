/*
 * QUADLUD — per-game generated-session + serializable-state lifecycle adapters
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation
 * without prior written authorization is prohibited.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.QuadludGameSessionAdapters=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const VERSION=2;
  const PATCH_PALETTE=Object.freeze(['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1']);

  function cloneGrid(value){return Array.isArray(value)?value.map(row=>Array.isArray(row)?[...row]:row):value}
  function cloneJson(value){return value==null?value:JSON.parse(JSON.stringify(value))}
  function emptyPatchEvidence(){return {schema:1,owners:[],notOwners:[],selected:[],eliminated:[]}}
  function commonSession(game,diff,g){return {game,diff,difficultyProfile:g.difficultyProfile,generationStats:g.generationStats,generated:true,unique:true,completed:false}}
  function matrixChanges(before,after,key){
    const a=before?.[key],b=after?.[key];if(!Array.isArray(a)||!Array.isArray(b))return [];
    const out=[];for(let r=0;r<Math.min(a.length,b.length);r++)for(let c=0;c<Math.min(a[r]?.length||0,b[r]?.length||0);c++)if(a[r][c]!==b[r][c])out.push({row:r,column:c,from:a[r][c],to:b[r][c]});
    return out
  }
  function singleCellAction(type){return (_session,action,changes)=>{
    const out={...action};if(out.type==='MOVE'&&changes.length===1){const ch=changes[0];out.type=type;out.target={row:ch.row,column:ch.column}}return out
  }}
  function solvedAgainstSolution(session){return !!session?.state&&Array.isArray(session.sol)&&session.state.every((row,r)=>row.every((value,c)=>value===session.sol?.[r]?.[c]))}
  function patchShape(cells){
    if(!Array.isArray(cells)||!cells.length)return 'libre';
    const rs=cells.map(x=>x[0]),cs=cells.map(x=>x[1]),h=Math.max(...rs)-Math.min(...rs)+1,w=Math.max(...cs)-Math.min(...cs)+1;
    if(h*w!==cells.length)return 'libre';
    return h===w?'carré':h>w?'vertical':'horizontal'
  }

  const queens=Object.freeze({
    createGeneratedSession(diff,g){if(!g)throw new Error('Invalid queens generated session input');return {...commonSession('queens',diff,g),n:g.n,reg:g.reg,sol:g.sol,state:Array.from({length:g.n},()=>Array(g.n).fill(0))}},
    snapshot(session){return {game:'queens',state:cloneGrid(session.state)}},
    applySnapshot(session,snapshot){if(snapshot?.game!=='queens')return false;session.state=cloneGrid(snapshot.state);return true},
    hasProgress(session){return !!session.state?.flat?.().some(v=>v!==0)},
    resetState(session){session.state=Array.from({length:session.n},()=>Array(session.n).fill(0));return true},
    historyChanges(before,after){return matrixChanges(before,after,'state')},
    normalizeHistoryAction:singleCellAction('SET_QUEEN_CELL'),
    validateVictory(session){
      const n=Number(session?.n)||0,state=session?.state,sol=session?.sol;
      const solved=!!session&&session.game==='queens'&&Array.isArray(state)&&Array.isArray(sol)&&state.every((row,r)=>row?.[sol[r]]===2)&&state.flat().filter(v=>v===2).length===n;
      return Object.freeze({solved,reasonKey:solved?null:'gridIncomplete'})
    }
  });
  const tango=Object.freeze({
    createGeneratedSession(diff,g,options={}){
      if(!g)throw new Error('Invalid tango generated session input');const state=Array.from({length:6},()=>Array(6).fill(-1));for(const i of g.givens)state[Math.floor(i/6)][i%6]=g.sol[Math.floor(i/6)][i%6];
      const out={...commonSession('tango',diff,g),n:6,sol:g.sol,givens:g.givens,edges:g.edges,state};if(options.context!=='challenge')out.tangoDerivedRelations=[];return out
    },
    snapshot(session){return {game:'tango',state:cloneGrid(session.state),tangoPendingCell:session.tangoPendingCell?[...session.tangoPendingCell]:null,tangoDerivedRelations:cloneJson(session.tangoDerivedRelations||[])}},
    applySnapshot(session,snapshot){if(snapshot?.game!=='tango')return false;session.state=cloneGrid(snapshot.state);session.tangoPendingCell=snapshot.tangoPendingCell?[...snapshot.tangoPendingCell]:null;session.tangoDerivedRelations=cloneJson(snapshot.tangoDerivedRelations||[]);return true},
    hasProgress(session){return !!session.state?.some((row,r)=>row.some((v,c)=>!session.givens?.has(r*6+c)&&v!==-1))},
    resetState(session){session.tangoPendingCell=null;session.tangoDerivedRelations=[];session.state=Array.from({length:6},()=>Array(6).fill(-1));for(const i of session.givens||[])session.state[Math.floor(i/6)][i%6]=session.sol[Math.floor(i/6)][i%6];return true},
    historyChanges(before,after){return matrixChanges(before,after,'state')},
    normalizeHistoryAction:singleCellAction('SET_SYMBOL'),
    validateVictory(session){const solved=!!session&&session.game==='tango'&&solvedAgainstSolution(session);return Object.freeze({solved,reasonKey:solved?null:'tangoIncomplete'})}
  });
  const sudoku=Object.freeze({
    createGeneratedSession(diff,g){if(!g)throw new Error('Invalid sudoku generated session input');return {...commonSession('sudoku',diff,g),n:6,sol:g.sol,empty:g.empty,state:g.sol.map((row,r)=>row.map((v,c)=>g.empty.has(r*6+c)?0:v)),sel:null}},
    snapshot(session){return {game:'sudoku',state:cloneGrid(session.state)}},
    applySnapshot(session,snapshot){if(snapshot?.game!=='sudoku')return false;session.state=cloneGrid(snapshot.state);return true},
    hasProgress(session){return !!session.state?.some((row,r)=>row.some((v,c)=>session.empty?.has(r*6+c)&&v!==0))},
    resetState(session){session.state=session.sol.map((row,r)=>row.map((v,c)=>session.empty.has(r*6+c)?0:v));return true},
    historyChanges(before,after){return matrixChanges(before,after,'state')},
    normalizeHistoryAction:singleCellAction('SET_DIGIT'),
    validateVictory(session){const solved=!!session&&session.game==='sudoku'&&solvedAgainstSolution(session);return Object.freeze({solved,reasonKey:solved?null:'sudokuIncomplete'})}
  });
  const patches=Object.freeze({
    createGeneratedSession(diff,g){if(!g)throw new Error('Invalid patches generated session input');return {...commonSession('patches',diff,g),n:g.n,reg:g.reg,ids:g.ids,cellsBy:g.cellsBy,clues:g.clues,paint:Array.from({length:g.n},()=>Array(g.n).fill(null)),patchSelectedRects:{},patchLogicEvidence:emptyPatchEvidence(),pal:[...PATCH_PALETTE],active:g.ids[0]}},
    snapshot(session){return {game:'patches',paint:cloneGrid(session.paint),patchSelectedRects:cloneJson(session.patchSelectedRects||{}),patchLogicEvidence:cloneJson(session.patchLogicEvidence||emptyPatchEvidence())}},
    applySnapshot(session,snapshot){if(snapshot?.game!=='patches')return false;session.paint=cloneGrid(snapshot.paint);session.patchSelectedRects=cloneJson(snapshot.patchSelectedRects||{});session.patchLogicEvidence=cloneJson(snapshot.patchLogicEvidence||emptyPatchEvidence());return true},
    hasProgress(session){return !!session.paint?.flat?.().some(v=>v!==null)},
    resetState(session){session.paint=Array.from({length:session.n},()=>Array(session.n).fill(null));session.patchSelectedRects={};session.patchLogicEvidence=emptyPatchEvidence();return true},
    historyChanges(before,after){return matrixChanges(before,after,'paint')},
    normalizeHistoryAction:singleCellAction('SET_REGION_CELL'),
    validateVictory(session,options={}){
      if(!session||session.game!=='patches')return Object.freeze({solved:false,reasonKey:'patchAll'});
      if(options.strictGeneratedSolution===true){
        const solved=Array.isArray(session.paint)&&Array.isArray(session.reg)&&session.paint.every((row,r)=>row.every((value,c)=>value===session.reg?.[r]?.[c]));
        return Object.freeze({solved,reasonKey:solved?null:'patchAll'})
      }
      const n=Number(session.n)||0,paint=session.paint,ids=session.ids||[],clues=session.clues||{};
      if(!Array.isArray(paint)||!paint.every(row=>Array.isArray(row)&&row.every(v=>v!==null)))return Object.freeze({solved:false,reasonKey:'patchAll'});
      const cluePositions=new Map(ids.map(id=>[clues[id].pos.join(','),id]));
      for(const id of ids){
        const cells=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(paint[r][c]===id)cells.push([r,c]);
        if(!cells.length)return Object.freeze({solved:false,reasonKey:'patchEach'});
        const own=clues[id].pos;
        if(!cells.some(([r,c])=>r===own[0]&&c===own[1]))return Object.freeze({solved:false,reasonKey:'patchOwn'});
        if(cells.some(([r,c])=>cluePositions.has(`${r},${c}`)&&cluePositions.get(`${r},${c}`)!==id))return Object.freeze({solved:false,reasonKey:'patchTwo'});
        const set=new Set(cells.map(x=>x.join(','))),seen=new Set([cells[0].join(',')]),queue=[cells[0]];
        while(queue.length){const [r,c]=queue.pop();for(const [rr,cc] of [[r+1,c],[r-1,c],[r,c+1],[r,c-1]]){const key=`${rr},${cc}`;if(set.has(key)&&!seen.has(key)){seen.add(key);queue.push([rr,cc])}}}
        if(seen.size!==cells.length)return Object.freeze({solved:false,reasonKey:'patchConnected'});
        const clue=clues[id],shape=patchShape(cells);
        if(shape==='libre')return Object.freeze({solved:false,reasonKey:'patchRect'});
        if((clue.mode==='both'||clue.mode==='size')&&cells.length!==clue.size)return Object.freeze({solved:false,reasonKey:'patchSize'});
        if((clue.mode==='both'||clue.mode==='shape')&&shape!==clue.shape)return Object.freeze({solved:false,reasonKey:'patchShape'});
      }
      return Object.freeze({solved:true,reasonKey:null});
    }
  });

  return Object.freeze({VERSION,PATCH_PALETTE,queens,tango,sudoku,patches});
});
