/*
 * QUADLUD — Couronnes Web renderer/input adapter
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation
 * without prior written authorization is prohibited.
 */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.QuadludQueensUI=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  const REQUIRED=[
    'document','query','shell','gameLabel','difficultyLabel','tr','gameRules','getCurrent','isPaused',
    'getPrefs','savePrefs','historySnapshotKey','historyRecord','saveCurrent','closeHintNotice','clearHintFocus',
    'markBacktrack','haptic','maybeAutoFinish','a11ySetupGrid','a11yAnnounce','a11yCoord','a11ySetCell',
    'applyConfiguredIllegalClasses','applyUnjustifiedHighlights','updateScoreFlags',
    'checkVictory','hint','finish','showToast'
  ];

  function createAdapter(deps){
    if(!deps||typeof deps!=='object')throw new Error('QUADLUD Couronnes UI dependencies unavailable');
    for(const name of REQUIRED)if(deps[name]==null)throw new Error(`QUADLUD Couronnes UI dependency unavailable: ${name}`);

    const {
      document,query,shell,gameLabel,difficultyLabel,tr,gameRules,getCurrent,isPaused,getPrefs,savePrefs,
      historySnapshotKey,historyRecord,saveCurrent,closeHintNotice,clearHintFocus,markBacktrack,haptic,maybeAutoFinish,
      a11ySetupGrid,a11yAnnounce,a11yCoord,a11ySetCell,applyConfiguredIllegalClasses,applyUnjustifiedHighlights,
      updateScoreFlags,checkVictory,hint,finish,showToast
    }=deps;
    const regionColors=deps.regionColors||root?.QuadludQueensRuntime?.regionColors||['#f6d68a','#c9dca5','#b9d8e9','#d9c4e8','#f3b8ad','#b5dbc9','#e7c9a3','#c6c7e9','#c4dfd7'];
    const queenIllegalCells=deps.queenIllegalCells||root?.queenIllegalCells;if(typeof queenIllegalCells!=='function')throw new Error('QUADLUD Couronnes UI dependency unavailable: queenIllegalCells');

    function autoCrossEnabled(){return getPrefs().queenAutoCross===true}
    function setAutoCross(value){const prefs=getPrefs();prefs.queenAutoCross=!!value;savePrefs(prefs)}

    function crossCellsFor(r,c){
      const current=getCurrent(),out=[],seen=new Set(),n=current.n,z=current.reg[r][c];
      function add(rr,cc){
        if(rr<0||cc<0||rr>=n||cc>=n||(rr===r&&cc===c))return;
        const key=rr+','+cc;if(!seen.has(key)){seen.add(key);out.push([rr,cc])}
      }
      for(let i=0;i<n;i++){add(r,i);add(i,c)}
      for(let rr=0;rr<n;rr++)for(let cc=0;cc<n;cc++)if(current.reg[rr][cc]===z)add(rr,cc);
      for(let rr=r-1;rr<=r+1;rr++)for(let cc=c-1;cc<=c+1;cc++)add(rr,cc);
      return out
    }

    function applyAutoCross(r,c){
      if(!autoCrossEnabled())return;
      const current=getCurrent();
      for(const [rr,cc] of crossCellsFor(r,c))if(current.state[rr][cc]!==2)current.state[rr][cc]=1
    }

    function setCell(r,c,value){
      const current=getCurrent();current.state[r][c]=value;if(value===2)applyAutoCross(r,c)
    }

    function dragRange(sr,sc,er,ec,axis){
      const out=[];
      if(axis==='row'){
        const a=Math.min(sc,ec),b=Math.max(sc,ec);for(let c=a;c<=b;c++)out.push([sr,c])
      }else if(axis==='col'){
        const a=Math.min(sr,er),b=Math.max(sr,er);for(let r=a;r<=b;r++)out.push([r,sc])
      }
      return out
    }

    function syncAccessibility(){
      const current=getCurrent(),board=query('#qboard');
      if(!current||current.game!=='queens'||!board)return false;
      [...board.children].forEach((cell,i)=>{
        const r=Math.floor(i/current.n),c=i%current.n,value=current.state[r][c],parts=[a11yCoord(r,c)];
        if(value===2)parts.push('♛');else if(value===1)parts.push('×');
        parts.push(`${tr('zone')} ${current.reg[r][c]+1}`);
        a11ySetCell(cell,r,c,parts.join(', '))
      });
      return true
    }

    function draw(){
      const current=getCurrent(),board=query('#qboard');
      if(!current||current.game!=='queens'||!board)return false;
      if(current.completed)board.classList.add('queens-win');
      [...board.children].forEach((cell,i)=>{
        const r=Math.floor(i/current.n),c=i%current.n,value=current.state[r][c];
        cell.innerHTML=value===2?'<span class="queen" aria-hidden="true">♛</span>':value===1?'<span class="mark" aria-hidden="true">×</span>':'';
        cell.classList.remove('error')
      });
      applyConfiguredIllegalClasses(board,queenIllegalCells(),current.n);
      applyUnjustifiedHighlights();
      syncAccessibility();
      updateScoreFlags();
      return true
    }

    function reset(session=getCurrent()){
      if(!session||session.game!=='queens')return false;
      query('#qboard')?.classList.remove('queens-win');return draw()
    }

    function revealSolution(){
      if(isPaused())return;
      const current=getCurrent();
      current.state=current.state.map((row,r)=>row.map((_,c)=>c===current.sol[r]?2:1));
      draw();finish(tr('solutionShown'),'revealed')
    }

    function render(session){
      const colors=regionColors;
      shell(gameLabel('queens'),`${session.n}×${session.n} · ${difficultyLabel(session.diff)} · ${tr('generated')}`,session.diff,`<div class="queen-options"><label class="switch-row"><input type="checkbox" id="queenAutoCross" ${autoCrossEnabled()?'checked':''}><span>${tr('autoCross')}</span></label></div><div class="board-wrap"><div class="board" id="qboard" style="grid-template-columns:repeat(${session.n},minmax(0,1fr));grid-template-rows:repeat(${session.n},minmax(0,1fr))"></div></div><div class="legend">${tr('queensLegend')}</div>`,gameRules('queens'));
      const board=query('#qboard');
      let dragging=false,pointerId=null,startCell=null,dragAxis=null,dragged=false,dragMode='add',visited=new Set(),historyBefore=null;

      function boardCellAt(x,y){
        const rect=board.getBoundingClientRect(),rx=x-rect.left,ry=y-rect.top;
        if(rx<0||ry<0||rx>=rect.width||ry>=rect.height)return null;
        const col=Math.min(session.n-1,Math.max(0,Math.floor(rx/rect.width*session.n))),r=Math.min(session.n-1,Math.max(0,Math.floor(ry/rect.height*session.n)));
        return board.children[r*session.n+col]||null
      }

      function applyDragCell(r,c){
        const key=r+','+c,current=getCurrent();
        if(visited.has(key)||current.state[r][c]===2)return;
        visited.add(key);current.hintFlow=null;clearHintFocus();
        const value=dragMode==='remove'?0:1;
        if(current.state[r][c]!==value){if(current.state[r][c]===1&&value===0)markBacktrack();current.state[r][c]=value;dragged=true}
      }

      function applyDragTo(hit){
        if(!startCell||!hit)return;
        const sr=+startCell.dataset.r,sc=+startCell.dataset.c,hr=+hit.dataset.r,hc=+hit.dataset.c;
        if(!dragAxis&&(hr!==sr||hc!==sc))dragAxis=Math.abs(hc-sc)>=Math.abs(hr-sr)?'row':'col';
        if(!dragAxis)return;
        const er=dragAxis==='row'?sr:hr,ec=dragAxis==='col'?sc:hc;
        for(const [r,c] of dragRange(sr,sc,er,ec,dragAxis))applyDragCell(r,c);
        draw()
      }

      for(let r=0;r<session.n;r++)for(let c=0;c<session.n;c++){
        const cell=document.createElement('div');cell.className='cell';cell.style.background=colors[session.reg[r][c]%colors.length];cell.dataset.r=r;cell.dataset.c=c;board.appendChild(cell)
      }

      a11ySetupGrid(board,session.n,session.n,{activate:cell=>{
        if(isPaused())return;
        const current=getCurrent(),r=+cell.dataset.r,c=+cell.dataset.c,before=historySnapshotKey();
        closeHintNotice();current.hintFlow=null;clearHintFocus();
        const prev=current.state[r][c],next=(prev+1)%3;
        if(prev===2&&next===0)markBacktrack();
        setCell(r,c,next);haptic(next===2?16:7);draw();
        historyRecord({type:'QUEEN_CYCLE',primaryTarget:[r,c],input:'keyboard'},before);saveCurrent();maybeAutoFinish();a11yAnnounce(cell.getAttribute('aria-label'))
      }});

      board.ondblclick=event=>{event.preventDefault();event.stopPropagation()};
      board.addEventListener('contextmenu',event=>event.preventDefault());
      board.addEventListener('gesturestart',event=>event.preventDefault(),{passive:false});
      board.addEventListener('touchstart',event=>event.preventDefault(),{passive:false});
      board.addEventListener('touchmove',event=>event.preventDefault(),{passive:false});
      board.addEventListener('touchend',event=>event.preventDefault(),{passive:false});
      board.onpointerdown=event=>{
        if(isPaused())return;
        const cell=boardCellAt(event.clientX,event.clientY);if(!cell)return;
        event.preventDefault();historyBefore=historySnapshotKey();dragging=true;pointerId=event.pointerId;startCell=cell;dragAxis=null;dragged=false;visited.clear();
        const current=getCurrent(),r=+cell.dataset.r,c=+cell.dataset.c;dragMode=current.state[r][c]===1?'remove':'add';
        try{board.setPointerCapture(pointerId)}catch(_){}
      };
      board.onpointermove=event=>{if(!dragging||event.pointerId!==pointerId)return;event.preventDefault();const hit=boardCellAt(event.clientX,event.clientY);if(hit)applyDragTo(hit)};
      const endDrag=event=>{
        if(!dragging||event.pointerId!==pointerId)return;
        event.preventDefault();const finalHit=boardCellAt(event.clientX,event.clientY);if(finalHit)applyDragTo(finalHit);
        try{board.releasePointerCapture(pointerId)}catch(_){}
        const cell=startCell;dragging=false;pointerId=null;
        if(!dragged&&cell){
          const current=getCurrent(),r=+cell.dataset.r,c=+cell.dataset.c;current.hintFlow=null;clearHintFocus();
          const prev=current.state[r][c],next=(prev+1)%3;if(prev===2&&next===0)markBacktrack();setCell(r,c,next);haptic(next===2?16:7);draw()
        }else if(dragged)haptic(7);
        historyRecord({type:dragged?'QUEEN_DRAG':'QUEEN_CYCLE',primaryTarget:(!dragged&&cell)?[+cell.dataset.r,+cell.dataset.c]:null},historyBefore);
        saveCurrent();maybeAutoFinish();historyBefore=null;startCell=null;dragAxis=null;visited.clear()
      };
      board.onpointerup=endDrag;
      board.onpointercancel=event=>{
        if(!dragging||event.pointerId!==pointerId)return;
        try{board.releasePointerCapture(pointerId)}catch(_){}
        dragging=false;pointerId=null;startCell=null;dragAxis=null;visited.clear();draw()
      };

      draw();
      query('#queenAutoCross').onchange=event=>{
        const before=historySnapshotKey();setAutoCross(event.target.checked);
        if(event.target.checked){
          const current=getCurrent();for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.state[r][c]===2)applyAutoCross(r,c);
          draw();historyRecord({type:'AUTO_CROSS_ENABLE'},before);saveCurrent();showToast(tr('autoCrossOn'))
        }else showToast(tr('autoCrossOff'))
      };
      query('#checkBtn').onclick=checkVictory;query('#hintBtn').onclick=hint;query('#solutionBtn').onclick=revealSolution;
      return board
    }

    return Object.freeze({render,draw,reset,syncAccessibility})
  }

  return Object.freeze({createAdapter})
});
