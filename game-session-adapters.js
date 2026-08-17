/*
 * QUADLUD — per-game generated-session lifecycle adapters
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation
 * without prior written authorization is prohibited.
 */
(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./session-core.js'):root?.QuadludSessionCore);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.QuadludGameSessionAdapters=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(SessionCore){
  'use strict';
  if(!SessionCore?.createGeneratedSession)throw new Error('QUADLUD session core unavailable');

  const PATCH_PALETTE=Object.freeze(['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1']);

  function solvedAgainstSolution(session){
    return !!session?.state&&Array.isArray(session.sol)&&session.state.every((row,r)=>row.every((value,c)=>value===session.sol?.[r]?.[c]));
  }
  function patchShape(cells){
    if(!Array.isArray(cells)||!cells.length)return 'libre';
    const rs=cells.map(x=>x[0]),cs=cells.map(x=>x[1]),h=Math.max(...rs)-Math.min(...rs)+1,w=Math.max(...cs)-Math.min(...cs)+1;
    if(h*w!==cells.length)return 'libre';
    return h===w?'carré':h>w?'vertical':'horizontal';
  }

  const queens=Object.freeze({
    createGeneratedSession(diff,candidate){return SessionCore.createGeneratedSession('queens',diff,candidate)},
    validateVictory(session){
      const n=Number(session?.n)||0,state=session?.state,sol=session?.sol;
      const solved=!!session&&session.game==='queens'&&Array.isArray(state)&&Array.isArray(sol)&&state.every((row,r)=>row?.[sol[r]]===2)&&state.flat().filter(v=>v===2).length===n;
      return Object.freeze({solved,reasonKey:solved?null:'gridIncomplete'});
    }
  });
  const tango=Object.freeze({
    createGeneratedSession(diff,candidate,options={}){
      const include=options.context!=='challenge';
      return SessionCore.createGeneratedSession('tango',diff,candidate,{includeTangoDerivedRelations:include});
    },
    validateVictory(session){const solved=!!session&&session.game==='tango'&&solvedAgainstSolution(session);return Object.freeze({solved,reasonKey:solved?null:'tangoIncomplete'})}
  });
  const sudoku=Object.freeze({
    createGeneratedSession(diff,candidate){return SessionCore.createGeneratedSession('sudoku',diff,candidate)},
    validateVictory(session){const solved=!!session&&session.game==='sudoku'&&solvedAgainstSolution(session);return Object.freeze({solved,reasonKey:solved?null:'sudokuIncomplete'})}
  });
  const patches=Object.freeze({
    createGeneratedSession(diff,candidate){
      const session=SessionCore.createGeneratedSession('patches',diff,candidate);
      session.pal=[...PATCH_PALETTE];session.active=candidate.ids[0];return session
    },
    validateVictory(session,options={}){
      if(!session||session.game!=='patches')return Object.freeze({solved:false,reasonKey:'patchAll'});
      if(options.strictGeneratedSolution===true){
        const solved=Array.isArray(session.paint)&&Array.isArray(session.reg)&&session.paint.every((row,r)=>row.every((value,c)=>value===session.reg?.[r]?.[c]));
        return Object.freeze({solved,reasonKey:solved?null:'patchAll'});
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

  return Object.freeze({VERSION:1,PATCH_PALETTE,queens,tango,sudoku,patches});
});
