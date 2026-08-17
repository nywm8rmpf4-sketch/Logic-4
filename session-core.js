/*
 * QUADLUD — serializable session/history core
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation
 * without prior written authorization is prohibited.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.QuadludSessionCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const HISTORY_SCHEMA=1;

  function cloneGrid(value){return Array.isArray(value)?value.map(row=>Array.isArray(row)?[...row]:row):value}
  function cloneJson(value){return value==null?value:JSON.parse(JSON.stringify(value))}
  function emptyPatchEvidence(){return {schema:1,owners:[],notOwners:[],selected:[],eliminated:[]}}

  function createGeneratedSession(game,diff,g,{includeTangoDerivedRelations=false}={}){
    if(!g||!game)throw new Error('Invalid generated session input');
    const common={game,diff,difficultyProfile:g.difficultyProfile,generationStats:g.generationStats,generated:true,unique:true,completed:false};
    if(game==='queens')return {...common,n:g.n,reg:g.reg,sol:g.sol,state:Array.from({length:g.n},()=>Array(g.n).fill(0))};
    if(game==='tango'){
      const state=Array.from({length:6},()=>Array(6).fill(-1));
      for(const i of g.givens)state[Math.floor(i/6)][i%6]=g.sol[Math.floor(i/6)][i%6];
      const out={...common,n:6,sol:g.sol,givens:g.givens,edges:g.edges,state};
      if(includeTangoDerivedRelations)out.tangoDerivedRelations=[];
      return out
    }
    if(game==='sudoku')return {...common,n:6,sol:g.sol,empty:g.empty,state:g.sol.map((row,r)=>row.map((v,c)=>g.empty.has(r*6+c)?0:v)),sel:null};
    if(game==='patches')return {...common,n:g.n,reg:g.reg,ids:g.ids,cellsBy:g.cellsBy,clues:g.clues,paint:Array.from({length:g.n},()=>Array(g.n).fill(null)),patchSelectedRects:{},patchLogicEvidence:emptyPatchEvidence()};
    throw new Error(`Unknown QUADLUD game: ${game}`)
  }

  function puzzleSnapshot(current){
    if(!current)return null;
    if(current.game==='queens')return {game:'queens',state:cloneGrid(current.state)};
    if(current.game==='tango')return {game:'tango',state:cloneGrid(current.state),tangoPendingCell:current.tangoPendingCell?[...current.tangoPendingCell]:null,tangoDerivedRelations:cloneJson(current.tangoDerivedRelations||[])};
    if(current.game==='sudoku')return {game:'sudoku',state:cloneGrid(current.state)};
    if(current.game==='patches')return {game:'patches',paint:cloneGrid(current.paint),patchSelectedRects:cloneJson(current.patchSelectedRects||{}),patchLogicEvidence:cloneJson(current.patchLogicEvidence||emptyPatchEvidence())};
    return {game:current.game}
  }

  function snapshotKey(snapshot){return JSON.stringify(snapshot)}

  function applyPuzzleSnapshot(current,snapshot){
    if(!current||!snapshot||snapshot.game!==current.game)return false;
    if(snapshot.game==='queens')current.state=cloneGrid(snapshot.state);
    else if(snapshot.game==='tango'){
      current.state=cloneGrid(snapshot.state);
      current.tangoPendingCell=snapshot.tangoPendingCell?[...snapshot.tangoPendingCell]:null;
      current.tangoDerivedRelations=cloneJson(snapshot.tangoDerivedRelations||[])
    }else if(snapshot.game==='sudoku')current.state=cloneGrid(snapshot.state);
    else if(snapshot.game==='patches'){
      current.paint=cloneGrid(snapshot.paint);
      current.patchSelectedRects=cloneJson(snapshot.patchSelectedRects||{});
      current.patchLogicEvidence=cloneJson(snapshot.patchLogicEvidence||emptyPatchEvidence())
    }
    return true
  }

  function hasPuzzleProgress(current){
    if(!current)return false;
    if(current.game==='queens')return !!current.state?.flat?.().some(v=>v!==0);
    if(current.game==='tango')return !!current.state?.some((row,r)=>row.some((v,c)=>!current.givens?.has(r*6+c)&&v!==-1));
    if(current.game==='sudoku')return !!current.state?.some((row,r)=>row.some((v,c)=>current.empty?.has(r*6+c)&&v!==0));
    if(current.game==='patches')return !!current.paint?.flat?.().some(v=>v!==null);
    return false
  }

  function resetPuzzleState(current){
    if(!current)return false;
    if(current.game==='queens')current.state=Array.from({length:current.n},()=>Array(current.n).fill(0));
    else if(current.game==='tango'){
      current.tangoPendingCell=null;current.tangoDerivedRelations=[];
      current.state=Array.from({length:6},()=>Array(6).fill(-1));
      for(const i of current.givens||[])current.state[Math.floor(i/6)][i%6]=current.sol[Math.floor(i/6)][i%6]
    }else if(current.game==='sudoku')current.state=current.sol.map((row,r)=>row.map((v,c)=>current.empty.has(r*6+c)?0:v));
    else if(current.game==='patches'){
      current.paint=Array.from({length:current.n},()=>Array(current.n).fill(null));
      current.patchSelectedRects={};current.patchLogicEvidence=emptyPatchEvidence()
    }else return false;
    return true
  }

  function ensureHistory(current,force=false,now=Date.now){
    if(!current)return null;
    const h=current.moveHistory;
    if(!force&&h&&h.schema===HISTORY_SCHEMA&&h.nodes&&h.cursor&&h.nodes[h.cursor])return h;
    const rootNode={id:'h0',parent:null,children:[],preferred:null,action:{type:'START',game:current.game,at:now()},snapshot:puzzleSnapshot(current)};
    current.moveHistory={schema:HISTORY_SCHEMA,nextId:1,cursor:'h0',nodes:{h0:rootNode},stats:{undos:0,redos:0,branches:0}};
    return current.moveHistory
  }

  function historyNode(current,id=null){const h=current?.moveHistory,key=id??h?.cursor;return key? h?.nodes?.[key]||null:null}
  function canUndo(current){const node=historyNode(current);return !!(current&&!current.completed&&node?.parent&&current.moveHistory.nodes[node.parent])}
  function redoTarget(current){
    const h=current?.moveHistory,node=h?.nodes?.[h?.cursor];if(!node||!node.children?.length)return null;
    const id=node.preferred&&node.children.includes(node.preferred)?node.preferred:node.children[node.children.length-1];
    return h.nodes[id]||null
  }
  function canRedo(current){return !!(current&&!current.completed&&redoTarget(current))}

  function historyChanges(beforeKey,after){
    if(!beforeKey||!after)return [];
    try{
      const before=JSON.parse(beforeKey),a=before.state||before.paint,b=after.state||after.paint;if(!Array.isArray(a)||!Array.isArray(b))return [];
      const out=[];for(let r=0;r<Math.min(a.length,b.length);r++)for(let c=0;c<Math.min(a[r]?.length||0,b[r]?.length||0);c++)if(a[r][c]!==b[r][c])out.push({row:r,column:c,from:a[r][c],to:b[r][c]});
      return out
    }catch(_){return []}
  }

  function normalizeHistoryAction(current,action,beforeKey=null,after=null,now=Date.now){
    const a=typeof action==='string'?{type:action}:(action&&typeof action==='object'?{...action}:{type:'MOVE'});
    a.type=a.type||'MOVE';a.game=current?.game||a.game||null;a.at=now();a.changes=historyChanges(beforeKey,after);
    if(a.type==='MOVE'&&a.changes.length===1){
      const ch=a.changes[0];a.target={row:ch.row,column:ch.column};
      if(a.game==='tango')a.type='SET_SYMBOL';else if(a.game==='sudoku')a.type='SET_DIGIT';else if(a.game==='queens')a.type='SET_QUEEN_CELL';else if(a.game==='patches')a.type='SET_REGION_CELL'
    }
    return a
  }

  function recordHistory(current,action='MOVE',beforeKey=null,now=Date.now){
    if(!current)return {changed:false,reason:'no-session'};
    const h=ensureHistory(current,false,now),snapshot=puzzleSnapshot(current),key=snapshotKey(snapshot);
    if(beforeKey!=null&&beforeKey===key)return {changed:false,reason:'same-snapshot',history:h,snapshot};
    const parent=h.nodes[h.cursor];if(!parent)return {changed:false,reason:'invalid-cursor',history:h,snapshot};
    const normalized=normalizeHistoryAction(current,action,beforeKey,snapshot,now);
    const existing=(parent.children||[]).map(id=>h.nodes[id]).find(node=>node&&snapshotKey(node.snapshot)===key);
    if(existing){parent.preferred=existing.id;h.cursor=existing.id;existing.action=normalized;return {changed:true,existing:true,hadAlternative:false,history:h,parent,node:existing,normalized,snapshot}}
    const id=`h${h.nextId++}`,hadAlternative=(parent.children||[]).length>0,node={id,parent:parent.id,children:[],preferred:null,action:normalized,snapshot};
    parent.children=parent.children||[];parent.children.push(id);parent.preferred=id;h.nodes[id]=node;h.cursor=id;
    if(hadAlternative)h.stats.branches=(h.stats.branches||0)+1;
    return {changed:true,existing:false,hadAlternative,history:h,parent,node,normalized,snapshot}
  }

  function undoHistory(current,count=1){
    const h=ensureHistory(current),countN=Math.max(1,Math.floor(Number(count)||1));let moved=0;
    while(moved<countN){const node=h.nodes[h.cursor];if(!node?.parent)break;const parent=h.nodes[node.parent];if(!parent)break;parent.preferred=node.id;h.cursor=parent.id;moved++}
    if(moved)h.stats.undos=(h.stats.undos||0)+moved;
    return {moved,history:h,node:h.nodes[h.cursor]||null,snapshot:h.nodes[h.cursor]?.snapshot||null}
  }

  function redoHistory(current,count=1){
    const h=ensureHistory(current),countN=Math.max(1,Math.floor(Number(count)||1));let moved=0;
    while(moved<countN){const node=h.nodes[h.cursor];if(!node?.children?.length)break;const id=node.preferred&&node.children.includes(node.preferred)?node.preferred:node.children[node.children.length-1],next=h.nodes[id];if(!next)break;h.cursor=id;moved++}
    if(moved)h.stats.redos=(h.stats.redos||0)+moved;
    return {moved,history:h,node:h.nodes[h.cursor]||null,snapshot:h.nodes[h.cursor]?.snapshot||null}
  }

  function nodeDepth(current,id){let h=current?.moveHistory,d=0,node=h?.nodes?.[id],guard=0;while(node?.parent&&guard++<10000){d++;node=h.nodes[node.parent]}return d}
  function isDescendant(current,id,ancestor){let h=current?.moveHistory,node=h?.nodes?.[id],guard=0;while(node&&guard++<10000){if(node.id===ancestor)return true;node=node.parent?h.nodes[node.parent]:null}return false}
  function pathFrom(current,ancestor,id){if(!isDescendant(current,id,ancestor))return [];const h=current.moveHistory,out=[];let node=h.nodes[id],guard=0;while(node&&node.id!==ancestor&&guard++<10000){out.push(node.id);node=h.nodes[node.parent]}return out.reverse()}
  function summary(current){const h=current?.moveHistory;if(!h)return {nodes:0,branches:0,undos:0,redos:0};return {nodes:Object.keys(h.nodes||{}).length,branches:h.stats?.branches||0,undos:h.stats?.undos||0,redos:h.stats?.redos||0}}
  function historyValid(current){const h=current?.moveHistory,node=h?.nodes?.[h.cursor],rootNode=h?.nodes?.h0;if(!h||h.schema!==HISTORY_SCHEMA||!node||!rootNode||rootNode.parent!==null)return false;try{return snapshotKey(node.snapshot)===snapshotKey(puzzleSnapshot(current))}catch(_){return false}}

  return Object.freeze({HISTORY_SCHEMA,cloneGrid,emptyPatchEvidence,createGeneratedSession,puzzleSnapshot,snapshotKey,applyPuzzleSnapshot,hasPuzzleProgress,resetPuzzleState,ensureHistory,historyNode,canUndo,redoTarget,canRedo,historyChanges,normalizeHistoryAction,recordHistory,undoHistory,redoHistory,nodeDepth,isDescendant,pathFrom,summary,historyValid});
});
