/*
 * QUADLUD — Couronnes pedagogy lifecycle adapter
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation without prior written authorization is prohibited.
 */
(function(root,factory){const api=factory(root);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.QuadludQueensPedagogy=api})(typeof globalThis!=='undefined'?globalThis:this,function(root){'use strict';
const RUNTIME_DEPENDENCIES=Object.freeze(["findQueenLogicalHint","findQueenRank1Hint","findQueenRank2Hint","findQueenRank3Hint","hintQ","proofResult","queenBoundedContradiction","queenCandidate","queenErrorFromAction","queenImmediateContradictionDetail","queenLogicSession","queenLogicalComplete","queenRank3BranchSummary","queenReasoningPresenter","queenStateContradiction","queenVisibleErrors","queenWalkthroughRegionColor","trainingBuildQueensDirect","trainingSetQueenBase","walkthroughGenerateQueensNext"]);
function dependencyNames(){return RUNTIME_DEPENDENCIES}
function createAdapter(d={}){const common=d.common||{},runtime=d.runtime||{},services=Object.freeze({...common,...runtime,gameUi:d.gameUi}),need=n=>{let fn=services[n];if(typeof fn!=='function')throw new TypeError(`Queens pedagogy dependency missing: ${n}`);return fn},clone=x=>need('cloneGrid')(x),walkthroughSnapshot=c=>({state:clone(c.state)});
return Object.freeze({
 visibleErrors:()=>need('queenVisibleErrors')(),errorFromAction:a=>need('queenErrorFromAction')(a),auditNeutralValue:()=>0,auditConstructiveValue:v=>v===1||v===2,
 auditMoveText:r=>`${(r.action?.value===2?(need('lang')()==='fr'?'reine ♛':'queen ♛'):'X')} · ${need('cellName')(r.target.row,r.target.column)}`,historyChangeText:ch=>`${(ch.to===2?(need('lang')()==='fr'?'reine ♛':'queen ♛'):'X')} · ${need('cellName')(ch.row,ch.column)}`,
 canAcceptHypothesis:()=>true,suppressUnjustifiedAfterComplete:()=>false,
 firstKnownLogicalMove:()=>{let q=need('queenLogicSession')(),r=q.nextDeduction();return r.deduction?need('queenReasoningPresenter')().legacyReasoning(r.deduction):null},
 justifyMove:({change})=>{let q=need('queenLogicSession')(),p=q.proveAction([change.row,change.column],change.to);if(p.status==='proven'){let ded=p.deduction||null,presenter=need('queenReasoningPresenter')(),view=ded?presenter.presentation(ded):null,x=need('proofResult')('justified',view?.technique??null,view?.rank??p.fact?.rank??0,[change.row,change.column],{logicalStatus:'proven',deduction:ded?presenter.legacyReasoning(ded):null});x.logicalStatus='proven';return x}let x=need('proofResult')('unjustified',null,null,[change.row,change.column],{logicalStatus:p.status,contradiction:p.contradiction||null});x.logicalStatus=p.status;return x},
 explorationContradiction:({deadline})=>{if(need('queenStateContradiction')())return {bad:true,kind:'logic',html:need('queenImmediateContradictionDetail')()};let x=need('queenBoundedContradiction')(2,deadline);if(x?.bad)return {bad:true,kind:'logic',html:x.reason||need('queenRank3BranchSummary')(x)};return null},
 masteryDirectHint:()=>need('findQueenLogicalHint')(),
 learningMoveText:h=>need('lang')()==='fr'?`${h.v===2?'Place une reine':'Place un X'} en ligne ${h.r+1}, colonne ${h.c+1}.`:`${h.v===2?'Place a queen':'Place an X'} at row ${h.r+1}, column ${h.c+1}.`,
 applyLearningMove:h=>{let c=need('getCurrent')();c.state[h.r][h.c]=h.v;need('drawGameUi')();return true},
 trainingHintForTechnique:({rank,deadline})=>rank===0?need('findQueenLogicalHint')():rank===1?need('findQueenRank1Hint')(deadline):rank===2?need('findQueenRank2Hint')(deadline):need('findQueenRank3Hint')(deadline),
 trainingRandomProgress:({p})=>{let c=need('getCurrent')();c.state=Array.from({length:c.n},()=>Array(c.n).fill(0));for(let r=0;r<c.n;r++)for(let col=0;col<c.n;col++){if(col===c.sol[r]){if(Math.random()<p*.55)c.state[r][col]=2}else if(Math.random()<p*.42)c.state[r][col]=1}},
 prepareTrainingBase:diff=>need('trainingSetQueenBase')(need('queenCandidate')(diff),diff),buildDirectTraining:(id,deadline)=>need('trainingBuildQueensDirect')(id,deadline),
 trainingTargetStillCorrect:h=>need('getCurrent')().state[h.r][h.c]===h.v,
 trainingCoachText:h=>need('lang')()==='fr'?`${h.v===2?'Place une reine':'Place un X'} en ligne ${h.r+1}, colonne ${h.c+1}.`:`${h.v===2?'Place a queen':'Place an X'} at row ${h.r+1}, column ${h.c+1}.`,
 trainingRevealLabel:()=>need('tr')('queenPlaced'),applyTrainingMove:h=>{let c=need('getCurrent')();c.state[h.r][h.c]=h.v;need('drawGameUi')();return true},coachAction:h=>({type:h.v===1?'MARK_X':'PLACE_QUEEN',value:h.v===1?1:2}),
 localizedHint:({target,rank,value})=>{let [r,c]=target,loc=`${need('tr')('rowLabel')} ${r+1}, ${need('tr')('columnLabel')} ${c+1}`,action=value===1?need('tr')('markX'):need('tr')('placeQueen');let reasons=[need('tr')('directReason'),need('tr')('rank1Reason'),need('tr')('rank2Reason'),need('tr')('rank3Reason')];return {move:`${action} — ${loc}.`,where:need('tr')('visibleOnly'),why:reasons[Math.max(0,Math.min(3,Number(rank)||0))]}},
 pieceName:v=>v===2?(need('lang')()==='fr'?'reine ♛':'queen ♛'):'X',
 coachLookText:({target,current})=>{let [r,c]=target,row=`${need('tr')('rowLabel')} ${r+1}`,col=`${need('tr')('columnLabel')} ${c+1}`;return current?.reg?.[r]?`${need('tr')('zone')} ${current.reg[r][c]+1} · ${row} · ${col}`:`${row} · ${col}`},
 coachContextCells:({target,current})=>{let [r,c]=target,n=current?.n||6;if(!current?.reg?.[r])return [];let z=current.reg[r][c],out=[];for(let rr=0;rr<n;rr++)for(let cc=0;cc<n;cc++)if(current.reg[rr][cc]===z)out.push([rr,cc]);return out},runCoachHint:()=>need('hintQ')(),afterFinish:()=>{},
 walkthroughRootSnapshot:({historyRoot,puzzleSnapshot})=>historyRoot||puzzleSnapshot(),
 walkthroughVisibleClone:(c,root)=>c&&root?{game:c.game,diff:c.diff,n:c.n,reg:clone(c.reg),state:clone(root.state||c.state),completed:false}:null,
 walkthroughSnapshot,
 walkthroughComplete:()=>need('queenLogicalComplete')(),
 walkthroughGenerateNext:()=>need('walkthroughGenerateQueensNext')(),
 walkthroughBoard:({base:c,snapshot,deduction})=>{let n=c.n||6,cells=[],context=new Set(need('queenReasoningPresenter')().premiseCells(deduction,c).map(x=>x.join(','))),conclusions=new Set((deduction?.conclusions||[]).map(x=>x.cell.join(',')));for(let r=0;r<n;r++)for(let col=0;col<n;col++){let k=`${r},${col}`,v=snapshot.state[r][col],cls='cell walkthrough-cell'+(context.has(k)?' walkthrough-context':'')+(conclusions.has(k)?' walkthrough-target':''),body=v===2?'<span class="queen">♛</span>':v===1?'<span class="mark">×</span>':'';cells.push(`<div class="${cls}" style="background:${need('queenWalkthroughRegionColor')(c.reg[r][col])}">${body}</div>`)}return {boardClass:'',cellsHtml:cells.join('')}},
 walkthroughContradictionText:x=>need('queenReasoningPresenter')().contradictionText(x),walkthroughAfterRender:()=>{},
 walkthroughInitialize:s=>{s.queenLogic=need('queenLogicSession')(s.work,s.work.state);s.work.state=clone(s.queenLogic.state);s.initial=walkthroughSnapshot(s.work);return s}
})}return Object.freeze({createAdapter,dependencyNames})});
