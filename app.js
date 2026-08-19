/*
 * QUADLUD
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation without prior written authorization is prohibited.
 */
'use strict';
const $=s=>document.querySelector(s), app=$('#app'), toast=$('#toast'), timerEl=$('#timer');
const VERSION='2.30.0';
const WebPlatform=QuadludWebPlatform.getWebPlatform();
const DataSerialization=QuadludDataSerialization;
const SessionCore=QuadludSessionCore;
const GameRegistry=QuadludGameRegistry;
const SessionHistory=SessionCore.createHistoryController(game=>gameSessionLifecycle(game));
const PedagogyMetadata=QuadludPedagogyMetadata;
const GAME_IDS=GameRegistry.IDS;
const PersistentData=globalThis.QuadludPersistentDataServices||QuadludPersistenceServices.createServices({storage:QuadludWebStorage.getLocalStorageAdapter(),serialization:DataSerialization});
const PERSISTENCE_BASELINE=PersistentData.baseline, SAVE_SCHEMA=PersistentData.schemas.save, SAVE_KEY=PersistentData.keys.save;
const LEGACY_PERSISTENCE_KEYS=PersistentData.legacyKeys;
const I18nCatalog=QuadludI18nCatalog,{I18N,SUPPORTED_LANGS,RTL_LANGS,LANGUAGE_OPTIONS,A11Y_SKIP_LABELS,GAME_RULES,TECHNIQUE_TERMS}=I18nCatalog;
const ProgressionStats=QuadludProgressionStats.createStatsService({persistentData:PersistentData,gameRegistry:GameRegistry,gameIds:GAME_IDS,persistenceBaseline:PERSISTENCE_BASELINE,clock:WebPlatform.clock,cloneMasterySession,mergeMasteryIntoStats:masteryMergeIntoStats});
const {statsSchema:STATS_SCHEMA,historyLimit:HISTORY_LIMIT}=ProgressionStats,STATS_KEY=PersistentData.keys.stats;
function blankStats(){return ProgressionStats.blankStats()}
function safeStats(){return ProgressionStats.safeStats()}
function writeStats(s){return ProgressionStats.writeStats(s)}
function statBucket(s,g,d){return ProgressionStats.statBucket(s,g,d)}
function localDay(ts){return arguments.length?ProgressionStats.localDay(ts):ProgressionStats.localDay()}
function statsStart(c){return ProgressionStats.statsStart(c,{safeStats,writeStats})}
function statsFinish(c,seconds,outcome){return ProgressionStats.statsFinish(c,seconds,outcome,{safeStats,writeStats})}
function statsSummary(){return ProgressionStats.statsSummary({safeStats})}
let current=null, tick=null, startedAt=0, elapsedBase=0, paused=false;
let DIFF={};
function lang(){let l=prefs().lang;return SUPPORTED_LANGS.includes(l)?l:'fr'}
function dateLocale(){return {"en":"en-US","zh":"zh-CN","hi":"hi-IN","es":"es-ES","ar":"ar","fr":"fr-FR","bn":"bn-BD","pt":"pt-PT","id":"id-ID","ur":"ur-PK","bg":"bg-BG","hr":"hr-HR","cs":"cs-CZ","da":"da-DK","nl":"nl-NL","et":"et-EE","fi":"fi-FI","de":"de-DE","el":"el-GR","hu":"hu-HU","ga":"ga-IE","it":"it-IT","lv":"lv-LV","lt":"lt-LT","mt":"mt-MT","pl":"pl-PL","ro":"ro-RO","sk":"sk-SK","sl":"sl-SI","sv":"sv-SE"}[lang()]||'en-US'}
function tr(k){return I18N[lang()]?.[k]??I18N.en[k]??I18N.fr[k]??k}
function updateI18n(){
  Object.assign(DIFF,{easy:tr('easy'),medium:tr('medium'),hard:tr('hard'),expert:tr('expert')});
  let l=lang(),rtl=RTL_LANGS.has(l);document.documentElement.lang=l==='zh'?'zh-Hans':l;document.documentElement.dir=rtl?'rtl':'ltr';
  document.body?.classList?.toggle('rtl',rtl);
  let hb=$('#homeBtn');if(hb)hb.setAttribute('aria-label',tr('homeAria'));
  let tb=$('#themeBtn');if(tb)tb.setAttribute('aria-label',tr('changeTheme'));
  let busy=$('#busyOverlay span');if(busy)busy.textContent=tr('generating');
  let skip=$('#skipLink');if(skip)skip.textContent=a11ySkipLabel();
}

function a11ySkipLabel(){return A11Y_SKIP_LABELS[lang()]||A11Y_SKIP_LABELS.en}
function a11yAttr(x){return String(x??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function a11yCoord(r,c){return `${tr('rowLabel')} ${r+1}, ${tr('columnLabel')} ${c+1}`}
function a11yAnnounce(text){let live=$('#a11yLive');if(!live||!text)return;live.textContent='';requestAnimationFrame(()=>{live.textContent=String(text)})}
function a11yCellFlags(el){
  if(!el)return;
  let invalid=el.classList.contains('illegal')||el.classList.contains('error')||el.classList.contains('error-focus');
  if(invalid)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');
  if(el.classList.contains('unjustified-piece'))el.setAttribute('aria-description',tr('moveUnjustified'));else el.removeAttribute('aria-description')
}
function a11ySetCell(el,r,c,label,{readonly=false,selected=false}={}){
  if(!el)return;el.setAttribute('role','gridcell');el.setAttribute('aria-rowindex',String(r+1));el.setAttribute('aria-colindex',String(c+1));el.setAttribute('aria-label',label);
  if(readonly)el.setAttribute('aria-readonly','true');else el.removeAttribute('aria-readonly');
  if(selected)el.setAttribute('aria-selected','true');else el.removeAttribute('aria-selected');a11yCellFlags(el)
}
function a11ySetupGrid(board,rows,cols,opts={}){
  if(!board)return;board.setAttribute('role','grid');board.setAttribute('aria-rowcount',String(rows));board.setAttribute('aria-colcount',String(cols));board.setAttribute('aria-label',opts.label||gameLabel(current?.game));
  board.setAttribute('aria-keyshortcuts',opts.keyshortcuts||'ArrowUp ArrowDown ArrowLeft ArrowRight Home End Enter Space');
  let cells=[...board.children],initial=Number.isInteger(opts.initialIndex)?opts.initialIndex:0;if(initial<0||initial>=cells.length)initial=0;
  cells.forEach((cell,i)=>{cell.tabIndex=i===initial?0:-1;if(!cell.dataset.r)cell.dataset.r=String(Math.floor(i/cols));if(!cell.dataset.c)cell.dataset.c=String(i%cols)});
  const focusIndex=(index,notify=true)=>{index=Math.max(0,Math.min(cells.length-1,index));cells.forEach((x,i)=>x.tabIndex=i===index?0:-1);let el=cells[index];if(el){el.focus({preventScroll:true});el.scrollIntoView({block:'nearest',inline:'nearest'});if(notify&&opts.onFocus)opts.onFocus(el,index)}return el};
  board.addEventListener('focusin',e=>{let cell=e.target.closest?.('.cell');if(!cell||cell.parentElement!==board)return;let i=cells.indexOf(cell);if(i>=0)cells.forEach((x,j)=>x.tabIndex=j===i?0:-1)});
  board.addEventListener('keydown',e=>{let cell=e.target.closest?.('.cell');if(!cell||cell.parentElement!==board)return;let i=cells.indexOf(cell),r=Math.floor(i/cols),c=i%cols,next=null;
    if(opts.onKey&&opts.onKey(e,cell,i)===true){e.preventDefault();return}
    if(e.key==='ArrowLeft')next=r*cols+Math.max(0,c-1);else if(e.key==='ArrowRight')next=r*cols+Math.min(cols-1,c+1);else if(e.key==='ArrowUp')next=Math.max(0,r-1)*cols+c;else if(e.key==='ArrowDown')next=Math.min(rows-1,r+1)*cols+c;else if(e.key==='Home')next=e.ctrlKey?0:r*cols;else if(e.key==='End')next=e.ctrlKey?cells.length-1:r*cols+(cols-1);
    if(next!=null){e.preventDefault();focusIndex(next,true);return}
    if((e.key==='Enter'||e.key===' ')&&opts.activate){e.preventDefault();opts.activate(cell,i)}
  });
  board._a11yFocusIndex=()=>{let i=cells.indexOf(document.activeElement);return i>=0?i:cells.findIndex(x=>x.tabIndex===0)}
}
let a11yDialogCounter=0;
function a11yFocusable(root){return [...root.querySelectorAll('button:not([disabled]),select:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>!x.hidden&&x.getClientRects().length)}
function a11yOpenDialog(root,initial=null){if(!root)return;let panel=root.querySelector('.sheet,.victory-card')||root,title=panel.querySelector('h1,h2');if(title&&!title.id)title.id=`a11y-dialog-title-${++a11yDialogCounter}`;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');if(title)root.setAttribute('aria-labelledby',title.id);panel.tabIndex=-1;root._a11yReturn=document.activeElement;root._a11yInert=[...document.body.children].filter(x=>x!==root&&x.tagName!=='SCRIPT');for(const x of root._a11yInert)x.inert=true;
  root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();a11yCloseDialog(root);return}if(e.key!=='Tab')return;let xs=a11yFocusable(root);if(!xs.length){e.preventDefault();panel.focus();return}let first=xs[0],last=xs[xs.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
  requestAnimationFrame(()=>{let target=initial?root.querySelector(initial):null;(target||a11yFocusable(root)[0]||panel).focus()})
}
function a11yCloseDialog(root,restore=true){if(!root)return;let ret=root._a11yReturn,inert=root._a11yInert||[];for(const x of inert)x.inert=false;root.remove();if(restore&&ret?.isConnected)requestAnimationFrame(()=>ret.focus())}
function gameRules(g){return GAME_RULES[g]?.[lang()]||GAME_RULES[g]?.en||''}

const PREF_KEY=PersistentData.keys.preferences;
function detectedLang(){try{for(let x of WebPlatform.locale.languages()){let c=String(x).toLowerCase().split('-')[0];if(c==='zh')return 'zh';if(SUPPORTED_LANGS.includes(c))return c}}catch(_){}return 'fr'}
function prefs(){return PersistentData.preferences.read({defaultLang:detectedLang(),supportedLangs:SUPPORTED_LANGS})}
function languageOptionsHtml(selected){return LANGUAGE_OPTIONS.map(([code,name])=>`<option value="${code}" ${selected===code?'selected':''}>${name}</option>`).join('')}
function savePrefs(p){PersistentData.preferences.write(p);applyPrefs()}
function resolvedTheme(){let p=prefs();return p.theme==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):p.theme}
function applyPrefs(){let p=prefs(),theme=resolvedTheme();document.documentElement.dataset.theme=theme;document.documentElement.dataset.themeMode=p.theme;let meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='dark'?'#171916':'#f4f1e9';let b=$('#themeBtn');if(b){b.textContent=theme==='dark'?'☾':'☀︎';b.setAttribute('aria-label',`${tr('themeLabel')} : ${p.theme}`)}}
function cycleTheme(){let p=prefs(),m={auto:'light',light:'dark',dark:'auto'};p.theme=m[p.theme];savePrefs(p);showToast(`${tr('themeLabel')} : ${{auto:tr('auto'),light:tr('light'),dark:tr('dark')}[p.theme]}`)}
function toggleSound(){let p=prefs();p.sound=!p.sound;savePrefs(p);showToast(p.sound?tr('soundsOn'):tr('soundsOff'));return p.sound}
function playTone(kind='tap'){if(!prefs().sound)return;try{let A=window.AudioContext||window.webkitAudioContext;if(!A)return;let c=new A(),o=c.createOscillator(),g=c.createGain(),now=c.currentTime;o.type='sine';o.frequency.value=kind==='win'?659:kind==='error'?180:420;g.gain.setValueAtTime(kind==='win'?.06:.025,now);g.gain.exponentialRampToValueAtTime(.001,now+(kind==='win'?.38:.12));o.connect(g);g.connect(c.destination);o.start(now);o.stop(now+(kind==='win'?.4:.13));setTimeout(()=>c.close().catch(()=>{}),600)}catch(_){}}
function settingsView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;let p=prefs();
  app.innerHTML=`<section class="panel settings-panel"><div class="stats-head"><div><h1>${tr('prefs')}</h1><p>${tr('settingsSaved')}</p></div><button class="btn" id="settingsBack">${tr('back')}</button></div>
  <div class="setting-row"><span><b>${tr('language')}</b><small>${tr('languageSub')}</small></span><select id="langSelect" class="difficulty" aria-label="${tr('language')}">${languageOptionsHtml(p.lang)}</select></div>
  <div class="setting-row"><span><b>${tr('theme')}</b><small>${tr('themeSub')}</small></span><select id="themeSelect" class="difficulty" aria-label="${tr('theme')}"><option value="auto" ${p.theme==='auto'?'selected':''}>${tr('auto')}</option><option value="light" ${p.theme==='light'?'selected':''}>${tr('light')}</option><option value="dark" ${p.theme==='dark'?'selected':''}>${tr('dark')}</option></select></div>
  <div class="setting-row"><span><b>${tr('sounds')}</b><small>${tr('soundsSub')}</small></span><button class="btn" id="soundToggle" aria-pressed="${p.sound?'true':'false'}">${p.sound?tr('on'):tr('off')}</button></div>
  <div class="setting-row"><span><b>${tr('coachMode')}</b><small>${tr('coachModeSub')}</small></span><select id="coachModeSelect" class="difficulty" aria-label="${tr('coachMode')}"><option value="minimal" ${p.coachMode==='minimal'?'selected':''}>${tr('coachMinimal')}</option><option value="normal" ${p.coachMode==='normal'?'selected':''}>${tr('coachNormal')} · ${tr('recommended')}</option><option value="pedagogical" ${p.coachMode==='pedagogical'?'selected':''}>${tr('coachPedagogical')}</option></select></div>
  <div class="setting-row"><span><b>${tr('illegalAlerts')}</b><small>${tr('illegalAlertsSub')}</small></span><button class="btn" id="illegalAlertsToggle" aria-pressed="${p.notifyIllegal?'true':'false'}">${p.notifyIllegal?tr('on'):tr('off')}</button></div>
  <div class="setting-row"><span><b>${tr('unjustifiedAlerts')}</b><small>${tr('unjustifiedAlertsSub')}</small></span><button class="btn" id="unjustifiedAlertsToggle" aria-pressed="${p.notifyUnjustified?'true':'false'}">${p.notifyUnjustified?tr('on'):tr('off')}</button></div>
  <div class="setting-row data-setting-row"><span><b>${tr('dataManage')}</b><small>${tr('dataManageSub')}</small></span><div class="data-actions"><button class="btn" id="storageInfo">${tr('privacy')}</button><button class="btn" id="dataExportBtn">${tr('exportData')}</button><button class="btn" id="dataImportBtn">${tr('importData')}</button><button class="btn danger" id="dataEraseBtn">${tr('eraseData')}</button></div><input class="sr-only" id="dataImportFile" type="file" accept="application/json,.json" /></div></section>`;
  $('#settingsBack').onclick=home;$('#langSelect').onchange=e=>{let q=prefs();q.lang=e.target.value;savePrefs(q);updateI18n();settingsView()};$('#themeSelect').onchange=e=>{let q=prefs();q.theme=e.target.value;savePrefs(q)};$('#soundToggle').onclick=()=>{let on=toggleSound(),b=$('#soundToggle');b.textContent=on?tr('on'):tr('off');b.setAttribute('aria-pressed',String(on))};$('#coachModeSelect').onchange=e=>{let q=prefs();q.coachMode=e.target.value;savePrefs(q)};$('#illegalAlertsToggle').onclick=()=>{let q=prefs();q.notifyIllegal=!q.notifyIllegal;savePrefs(q);let b=$('#illegalAlertsToggle');b.textContent=q.notifyIllegal?tr('on'):tr('off');b.setAttribute('aria-pressed',String(q.notifyIllegal))};$('#unjustifiedAlertsToggle').onclick=()=>{let q=prefs();q.notifyUnjustified=!q.notifyUnjustified;savePrefs(q);let b=$('#unjustifiedAlertsToggle');b.textContent=q.notifyUnjustified?tr('on'):tr('off');b.setAttribute('aria-pressed',String(q.notifyUnjustified))};$('#storageInfo').onclick=privacyInfoModal;$('#dataExportBtn').onclick=downloadUserDataExport;$('#dataImportBtn').onclick=()=>$('#dataImportFile').click();$('#dataImportFile').onchange=handleUserDataFileImport;$('#dataEraseBtn').onclick=confirmEraseUserData;app.querySelectorAll('button').forEach(pressFeedback)
}
function aboutView(){
 if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;
 app.innerHTML=`<section class="panel about-panel"><div class="stats-head"><div><h1>${tr('aboutTitle')}</h1><p>QUADLUD</p></div><button class="btn" id="aboutBack">${tr('back')}</button></div>
 <div class="about-grid"><div><span>${tr('version')}</span><b>${VERSION}</b></div><div><span>${tr('copyright')}</span><b>© 2026 Serge Benoliel</b></div><div><span>${tr('license')}</span><b>${tr('proprietary')}</b></div></div>
 <p class="legal-text">${tr('legal')}</p></section>`;
 $('#aboutBack').onclick=home;app.querySelectorAll('button').forEach(pressFeedback)
}
function resultText(c,seconds){let daily=c?.daily?` · ${tr('dailyLabel')}`:'',challenge=c?.challengeCode?`\n${tr('challengeCode')}: ${c.challengeCode}\n${challengeLink(c.challengeCode)}`:'';return `QUADLUD — ${gameLabel(c.game)}${daily}\n${DIFF[c.diff]} · ${fmt(seconds)}\n✓ ${tr('finishedShare')}${challenge}`}
function resultSvg(c,seconds){
  let bg=resolvedTheme()==='dark'?'#171916':'#f4f1e9',ink=resolvedTheme()==='dark'?'#f2efe7':'#22231f',muted=resolvedTheme()==='dark'?'#b8b5ad':'#6b6a64',accent='#397466',title=gameLabel(c.game).replace(/&/g,'&amp;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><rect width="1080" height="1080" rx="80" fill="${bg}"/><circle cx="110" cy="112" r="22" fill="${accent}"/><text x="155" y="130" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="54" font-weight="700" fill="${ink}">QUADLUD</text><text x="90" y="410" font-family="Georgia,serif" font-size="112" font-weight="700" fill="${ink}">${title}</text><text x="90" y="520" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="48" fill="${muted}">${DIFF[c.diff]}${c.daily?` · ${tr('dailyLabel')}`:''}</text><text x="90" y="720" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="132" font-weight="800" fill="${ink}">${fmt(seconds)}</text><text x="90" y="820" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="42" fill="${accent}">✓ ${tr('finishedShare')}</text><text x="90" y="965" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="32" fill="${muted}">QUADLUD · v${VERSION}</text></svg>`
}
async function shareResult(c,seconds){
  let text=resultText(c,seconds);
  try{
    let file=WebPlatform.files.createTextFile(resultSvg(c,seconds),`quadlud-${c.game}-${localDay()}.svg`,'image/svg+xml');
    if(file&&WebPlatform.sharing.canShare({files:[file]})&&await WebPlatform.sharing.share({title:'QUADLUD',text,files:[file]}))return;
    if(await WebPlatform.sharing.share({title:'QUADLUD',text}))return;
    if(await WebPlatform.sharing.copyText(text)){showToast(tr('resultCopied'));return}
  }catch(e){
    if(e?.name==='AbortError')return;
    try{if(await WebPlatform.sharing.copyText(text)){showToast(tr('resultCopied'));return}}catch(_){}
  }
  showToast(tr('shareUnavailable'))
}
function victoryOverlay(c,seconds){
  let old=$('#victory');if(old)old.remove(),dailyRec=c.daily?dailyRecord(c.dailyDay,c.game):null,next=c.daily?dailyNextGame(c.dailyDay):null;
  let dailyScore=c.daily?`<div class="victory-daily-score"><span>${tr('dailyLogicScore')}</span><strong>${dailyRec?.logicScore??'—'}/100</strong><small>${dailyRec?.logicScore!=null?dailyHelpLabel(dailyRec.helpStage):tr('dailyUnscoredLegacy')}</small></div>`:'';
  let dailyAction=c.daily?`<button class="btn primary" id="dailyVictoryNext">${next?tr('dailyNextGame'):tr('dailyReport')}</button>`:'',challengeAction=c.challengeCode?`<button class="btn primary" id="victoryShareChallenge">↗ ${tr('shareChallenge')}</button>`:'';
  document.body.insertAdjacentHTML('beforeend',`<div class="victory" id="victory"><div class="victory-card"><div class="victory-burst" aria-hidden="true">✦</div><small>${tr('victoryKicker')}</small><h2>${gameLabel(c.game)}</h2><div class="victory-time">${fmt(seconds)}</div>${dailyScore}<p>${DIFF[c.diff]}${c.daily?` · ${tr('dailyLabel')}`:''}</p><div class="victory-actions">${dailyAction}${challengeAction}<button class="btn" id="shareResult">${tr('share')}</button><button class="btn" id="closeVictory">${tr('continue')}</button></div></div></div>`);
  let root=$('#victory');$('#shareResult').onclick=()=>shareResult(c,seconds);$('#closeVictory').onclick=()=>a11yCloseDialog(root);
  let dn=$('#dailyVictoryNext');if(dn)dn.onclick=()=>{let d=c.dailyDay;a11yCloseDialog(root,false);next?launchDailyCircuit(d):dailyView()};let vc=$('#victoryShareChallenge');if(vc)vc.onclick=()=>shareChallenge(challengeParse(c.challengeCode));
  root.onclick=e=>{if(e.target===root)a11yCloseDialog(root)};a11yOpenDialog(root,'#closeVictory');playTone('win');haptic(28)
}

function markBacktrack(){if(current&&!current.completed)current.backtrackUsed=true}
function markHintUsed(){if(current&&!current.completed)current.hintUsed=true}
function aidBadges(c,compact=false){let a=[];if(c?.backtrackUsed)a.push(`<span class="aid-badge backtrack" title="${tr('backtrackFlag')}">↶${compact?'':` ${tr('backtrackFlag')}`}</span>`);if(c?.hintUsed)a.push(`<span class="aid-badge hint-used" title="${tr('hintFlag')}">💡${compact?'':` ${tr('hintFlag')}`}</span>`);return a.join(' ')}
function updateScoreFlags(){let m=document.querySelector('.difficulty-meter');if(!m||!current)return;let old=m.querySelector('.live-aids');if(old)old.remove();let h=document.createElement('span');h.className='live-aids';h.innerHTML=aidBadges(current,true);m.appendChild(h)}
function keyCell(r,c){return r+','+c}
function queenIllegalCells(){
  let bad=new Set(),q=[];for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.state[r][c]===2)q.push([r,c]);
  for(let i=0;i<q.length;i++)for(let j=i+1;j<q.length;j++){let [r,c]=q[i],[r2,c2]=q[j];if(r===r2||c===c2||current.reg[r][c]===current.reg[r2][c2]||(Math.abs(r-r2)<=1&&Math.abs(c-c2)<=1)){bad.add(keyCell(r,c));bad.add(keyCell(r2,c2))}}
  return bad
}
function tangoIllegalCells(ignoreKey=null){
  let bad=new Set(),n=6,s=current.state,hasIgnore=cells=>ignoreKey&&cells.some(x=>keyCell(...x)===ignoreKey);
  for(let r=0;r<n;r++){
    for(let v=0;v<=1;v++){let cells=[];for(let c=0;c<n;c++)if(s[r][c]===v)cells.push([r,c]);if(cells.length>3&&!hasIgnore(cells))cells.forEach(x=>bad.add(keyCell(...x)))}
    for(let c=0;c<n-2;c++)if(s[r][c]!==-1&&s[r][c]===s[r][c+1]&&s[r][c]===s[r][c+2]){let cells=[[r,c],[r,c+1],[r,c+2]];if(!hasIgnore(cells))cells.forEach(x=>bad.add(keyCell(...x)))}
  }
  for(let c=0;c<n;c++){
    for(let v=0;v<=1;v++){let cells=[];for(let r=0;r<n;r++)if(s[r][c]===v)cells.push([r,c]);if(cells.length>3&&!hasIgnore(cells))cells.forEach(x=>bad.add(keyCell(...x)))}
    for(let r=0;r<n-2;r++)if(s[r][c]!==-1&&s[r][c]===s[r+1][c]&&s[r][c]===s[r+2][c]){let cells=[[r,c],[r+1,c],[r+2,c]];if(!hasIgnore(cells))cells.forEach(x=>bad.add(keyCell(...x)))}
  }
  for(let [r,c,d,rel] of current.edges){
    let r2=d==='r'?r:r+1,c2=d==='r'?c+1:c,a=s[r][c],b=s[r2][c2],cells=[[r,c],[r2,c2]];
    if(a!==-1&&b!==-1&&!hasIgnore(cells)&&((rel==='='&&a!==b)||(rel==='×'&&a===b)))cells.forEach(x=>bad.add(keyCell(...x)))
  }
  return bad
}
function sudokuIllegalCells(){
  let bad=new Set(),s=current.state;
  function dup(cells){let by={};for(let [r,c] of cells){let v=s[r][c];if(!v)continue;(by[v]??=[]).push([r,c])}for(let a of Object.values(by))if(a.length>1)a.forEach(x=>bad.add(keyCell(...x)))}
  for(let r=0;r<6;r++)dup(Array.from({length:6},(_,c)=>[r,c]));for(let c=0;c<6;c++)dup(Array.from({length:6},(_,r)=>[r,c]));
  for(let br=0;br<6;br+=2)for(let bc=0;bc<6;bc+=3){let a=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)a.push([r,c]);dup(a)}
  return bad
}
function patchVisibleIssueForId(id){
  let n=current.n,cells=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.paint[r][c]===id)cells.push([r,c]);if(!cells.length)return null;
  let cl=current.clues[id],own=cl.pos,foreign=[];for(const other of current.ids){let p=current.clues[other].pos;if(other!==id&&cells.some(([r,c])=>r===p[0]&&c===p[1]))foreign.push(p)}
  if(foreign.length)return {rule:'P_TWO_CLUES',cells:[...cells,own,...foreign],target:foreign[0],region:id};
  let rs=cells.map(x=>x[0]),cs=cells.map(x=>x[1]),h=Math.max(...rs)-Math.min(...rs)+1,w=Math.max(...cs)-Math.min(...cs)+1,selected=current.patchSelectedRects?.[id];
  if((cl.mode==='size'||cl.mode==='both')&&(cells.length>cl.size||h*w>cl.size||(selected&&h*w!==cl.size)))return {rule:'P_SIZE',cells:[...cells,own],target:cells[cells.length-1],region:id};
  if(selected&&(cl.mode==='shape'||cl.mode==='both')){let sh=h===w?'carré':h>w?'vertical':'horizontal';if(sh!==cl.shape)return {rule:'P_SHAPE',cells:[...cells,own],target:cells[cells.length-1],region:id}}
  return null
}
function patchLogicVisibleContradiction(){if(!patchesLogicAvailable())return null;let w;try{w=patchesLogicSession().diagnoseBasic()}catch(_){return null}if(!w)return null;if(w.kind==='NO_COVER_FOR_CELL')return {rule:'P_NO_COVER',cells:[w.cell],target:w.cell,logicContradiction:w};if(w.kind==='NO_CANDIDATE_FOR_CLUE'||w.kind==='SHAPE_IMPOSSIBLE')return {rule:'P_NO_CANDIDATE',cells:[current.clues[w.clue].pos],target:current.clues[w.clue].pos,region:w.clue,logicContradiction:w};if(w.kind==='AREA_OVERFLOW')return {rule:'P_SIZE',cells:w.cells||[current.clues[w.clue].pos],target:current.clues[w.clue].pos,region:w.clue,logicContradiction:w};if(w.kind==='OWNER_CONFLICT')return {rule:'P_OWNER_CONFLICT',cells:w.cell?[w.cell]:[],target:w.cell||null,logicContradiction:w};if(w.kind==='SELECTED_OVERLAP')return {rule:'P_OVERLAP',cells:(w.rectangles||[]).flatMap(x=>PatchesLogic.helpers.rectCells(x)),target:null,logicContradiction:w};if(w.kind==='COVERAGE_DEFICIT'||w.kind==='NO_LOCAL_COMPLETION')return {rule:'P_LOGIC_CONTRADICTION',cells:w.cells||[],target:w.cell||null,logicContradiction:w};return null}
function patchIllegalCells(){
  let bad=new Set();for(const id of current.ids){let e=patchVisibleIssueForId(id);for(const [r,c] of e?.cells||[])bad.add(keyCell(r,c))}return bad
}
function applyIllegalClasses(board,bad,n){if(!board)return;[...board.children].forEach((d,i)=>d.classList.toggle('illegal',bad.has(keyCell(Math.floor(i/n),i%n))))}
function illegalAlertsEnabled(){return prefs().notifyIllegal!==false}
function unjustifiedAlertsEnabled(){return prefs().notifyUnjustified!==false}
function applyConfiguredIllegalClasses(board,bad,n){
  if(!board)return;
  if(!illegalAlertsEnabled()){[...board.children].forEach(d=>d.classList.remove('illegal'));return}
  applyIllegalClasses(board,bad,n)
}

// ===== v2.14.0 — explain visible rule violations and return before the error =====
function changedTargets(action){
  return (action?.changes||[]).filter(x=>x&&Number.isInteger(x.row)&&Number.isInteger(x.column))
}
function errorUsage(kind,technique=null){
  if(!current)return;
  let u=current.errorCoachUsage||(current.errorCoachUsage={detected:0,explained:0,returned:0,rejected:0});
  u[kind]=(u[kind]||0)+1;
  if(kind==='detected'&&technique&&PEDAGOGY_TECHNIQUES[technique])masteryRecord(technique,'errors')
}
function queenErrorFromAction(action){
  for(let ch of changedTargets(action).filter(x=>x.to===2)){
    let {row:r,column:c}=ch;
    for(let rr=0;rr<current.n;rr++)for(let cc=0;cc<current.n;cc++)if((rr!==r||cc!==c)&&current.state[rr][cc]===2){
      if(rr===r)return {rule:'Q_ROW',technique:'Q_EXCLUSION_ROW',cells:[[r,c],[rr,cc]],target:[r,c],other:[rr,cc]};
      if(cc===c)return {rule:'Q_COLUMN',technique:'Q_EXCLUSION_COLUMN',cells:[[r,c],[rr,cc]],target:[r,c],other:[rr,cc]};
      if(current.reg[rr][cc]===current.reg[r][c])return {rule:'Q_REGION',technique:'Q_EXCLUSION_REGION',cells:[[r,c],[rr,cc]],target:[r,c],other:[rr,cc],region:current.reg[r][c]};
      if(Math.abs(rr-r)<=1&&Math.abs(cc-c)<=1)return {rule:'Q_ADJACENCY',technique:'Q_EXCLUSION_ADJACENCY',cells:[[r,c],[rr,cc]],target:[r,c],other:[rr,cc]}
    }
  }
  return null
}
function tangoErrorFromAction(action){
  let ignore=current.tangoPendingCell?keyCell(...current.tangoPendingCell):null,bad=tangoIllegalCells(ignore);
  for(let ch of changedTargets(action)){
    let r=ch.row,c=ch.column,v=current.state[r]?.[c];if(v==null||v===-1||!bad.has(keyCell(r,c)))continue;
    let rowSame=[];for(let cc=0;cc<6;cc++)if(current.state[r][cc]===v)rowSame.push([r,cc]);
    if(rowSame.length>3)return {rule:'T_BALANCE_ROW',technique:'T_BALANCE_ROW',cells:rowSame,target:[r,c],value:v};
    let colSame=[];for(let rr=0;rr<6;rr++)if(current.state[rr][c]===v)colSame.push([rr,c]);
    if(colSame.length>3)return {rule:'T_BALANCE_COLUMN',technique:'T_BALANCE_COLUMN',cells:colSame,target:[r,c],value:v};
    for(let cc=Math.max(0,c-2);cc<=Math.min(c,3);cc++){
      let cells=[[r,cc],[r,cc+1],[r,cc+2]],vals=cells.map(([rr,ccc])=>current.state[rr][ccc]);
      if(vals[0]!==-1&&vals[0]===vals[1]&&vals[1]===vals[2])return {rule:'T_NO_THREE',technique:'T_NO_THREE',cells,target:[r,c],value:v}
    }
    for(let rr=Math.max(0,r-2);rr<=Math.min(r,3);rr++){
      let cells=[[rr,c],[rr+1,c],[rr+2,c]],vals=cells.map(([rrr,cc])=>current.state[rrr][cc]);
      if(vals[0]!==-1&&vals[0]===vals[1]&&vals[1]===vals[2])return {rule:'T_NO_THREE',technique:'T_NO_THREE',cells,target:[r,c],value:v}
    }
    for(let [er,ec,d,rel] of current.edges){
      let r2=d==='r'?er:er+1,c2=d==='r'?ec+1:ec;
      if(!((er===r&&ec===c)||(r2===r&&c2===c)))continue;
      let a=current.state[er][ec],b=current.state[r2][c2];
      if(a!==-1&&b!==-1&&((rel==='='&&a!==b)||(rel==='×'&&a===b))){
        return {rule:rel==='='?'T_RELATION_EQUAL':'T_RELATION_OPPOSITE',technique:rel==='='?'T_RELATION_EQUAL':'T_RELATION_OPPOSITE',cells:[[er,ec],[r2,c2]],target:[r,c],relation:rel}
      }
    }
  }
  return null
}
function sudokuErrorFromAction(action){
  let bad=sudokuIllegalCells();
  for(let ch of changedTargets(action)){
    let r=ch.row,c=ch.column,v=current.state[r]?.[c];if(!v||!bad.has(keyCell(r,c)))continue;
    for(let cc=0;cc<6;cc++)if(cc!==c&&current.state[r][cc]===v)return {rule:'S_ROW_DUPLICATE',cells:[[r,c],[r,cc]],target:[r,c],other:[r,cc],value:v};
    for(let rr=0;rr<6;rr++)if(rr!==r&&current.state[rr][c]===v)return {rule:'S_COLUMN_DUPLICATE',cells:[[r,c],[rr,c]],target:[r,c],other:[rr,c],value:v};
    let br=Math.floor(r/2)*2,bc=Math.floor(c/3)*3;
    for(let rr=br;rr<br+2;rr++)for(let cc=bc;cc<bc+3;cc++)if((rr!==r||cc!==c)&&current.state[rr][cc]===v)return {rule:'S_BOX_DUPLICATE',cells:[[r,c],[rr,cc]],target:[r,c],other:[rr,cc],value:v}
  }
  return null
}
function patchErrorFromAction(action){
  let ids=new Set();if(action?.region!=null)ids.add(Number(action.region));for(const ch of changedTargets(action))if(ch.to!=null)ids.add(Number(ch.to));
  for(const id of ids){if(!current.ids.includes(id))continue;let e=patchVisibleIssueForId(id);if(e)return e}
  let logic=patchLogicVisibleContradiction();return logic||null
}

// 29.5B — registry-driven pedagogy/audit lifecycle. Generic orchestration never dispatches product game IDs.
let gamePedagogyAdapterCollection=null;
const PEDAGOGY_COMMON_SERVICES=Object.freeze({
  getCurrent:()=>current,
  cloneGrid,
  drawGameUi,
  lang:()=>lang,
  tr,
  cellName
});
function bindPedagogyRuntimeDependencies(names=[]){
  let out={};
  for(const name of names){
    let fn=typeof globalThis!=='undefined'?globalThis?.[name]:null;
    if(typeof fn!=='function')throw new Error(`QUADLUD pedagogy runtime dependency unavailable: ${name}`);
    out[name]=fn
  }
  return Object.freeze(out)
}
function gamePedagogyDependencies(game,lifecycle){
  return {
    common:PEDAGOGY_COMMON_SERVICES,
    gameUi:()=>gameWebUi(game),
    runtime:bindPedagogyRuntimeDependencies(typeof lifecycle?.dependencyNames==='function'?lifecycle.dependencyNames():[])
  }
}
function createGamePedagogyAdapter(game){
  const lifecycle=GameRegistry.requireCapability(game,'pedagogyLifecycle');
  return lifecycle.createAdapter(gamePedagogyDependencies(game,lifecycle))
}
function gamePedagogyAdapters(){
  if(gamePedagogyAdapterCollection)return gamePedagogyAdapterCollection;
  if(typeof QuadludGamePedagogyAdapters==='undefined')throw new Error('QUADLUD pedagogy adapter collection unavailable');
  gamePedagogyAdapterCollection=QuadludGamePedagogyAdapters.createCollection(Array.from(GameRegistry.IDS),createGamePedagogyAdapter);
  return gamePedagogyAdapterCollection
}
function gamePedagogy(game=current?.game){return gamePedagogyAdapters().require(game)}

// ===== v2.18.1 — Logic Coach always explains visible errors before suggesting a move =====
function errorSignature(e){
  let cells=(e?.cells||[]).map(([r,c])=>`${r},${c}`).sort().join('|');
  return `${e?.rule||''}:${cells}`
}
function normalizeVisibleError(e){
  return e?{...e,schema:1,source:'visible-state',game:current?.game||e.game,at:WebPlatform.clock.nowMs(),canReturn:false}:null
}
function queenVisibleErrors(){
  let out=[],q=[];for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.state[r][c]===2)q.push([r,c]);
  for(let i=0;i<q.length;i++)for(let j=i+1;j<q.length;j++){
    let [r,c]=q[i],[r2,c2]=q[j],e=null;
    if(r===r2)e={rule:'Q_ROW',technique:'Q_EXCLUSION_ROW',cells:[[r,c],[r2,c2]],target:[r2,c2],other:[r,c]};
    else if(c===c2)e={rule:'Q_COLUMN',technique:'Q_EXCLUSION_COLUMN',cells:[[r,c],[r2,c2]],target:[r2,c2],other:[r,c]};
    else if(current.reg[r][c]===current.reg[r2][c2])e={rule:'Q_REGION',technique:'Q_EXCLUSION_REGION',cells:[[r,c],[r2,c2]],target:[r2,c2],other:[r,c],region:current.reg[r][c]};
    else if(Math.abs(r-r2)<=1&&Math.abs(c-c2)<=1)e={rule:'Q_ADJACENCY',technique:'Q_EXCLUSION_ADJACENCY',cells:[[r,c],[r2,c2]],target:[r2,c2],other:[r,c]};
    if(e)out.push(normalizeVisibleError(e))
  }
  return out
}
function tangoVisibleErrors(){
  let out=[],s=current.state,n=6,ignore=current.tangoPendingCell?keyCell(...current.tangoPendingCell):null,hasIgnore=cells=>ignore&&cells.some(x=>keyCell(...x)===ignore);
  for(let r=0;r<n;r++){
    for(let v=0;v<=1;v++){let cells=[];for(let c=0;c<n;c++)if(s[r][c]===v)cells.push([r,c]);if(cells.length>3&&!hasIgnore(cells))out.push(normalizeVisibleError({rule:'T_BALANCE_ROW',technique:'T_BALANCE_ROW',cells,target:cells[cells.length-1],value:v}))}
    for(let c=0;c<n-2;c++){let cells=[[r,c],[r,c+1],[r,c+2]];if(!hasIgnore(cells)&&s[r][c]!==-1&&s[r][c]===s[r][c+1]&&s[r][c]===s[r][c+2])out.push(normalizeVisibleError({rule:'T_NO_THREE',technique:'T_NO_THREE',cells,target:cells[2],value:s[r][c]}))}
  }
  for(let c=0;c<n;c++){
    for(let v=0;v<=1;v++){let cells=[];for(let r=0;r<n;r++)if(s[r][c]===v)cells.push([r,c]);if(cells.length>3&&!hasIgnore(cells))out.push(normalizeVisibleError({rule:'T_BALANCE_COLUMN',technique:'T_BALANCE_COLUMN',cells,target:cells[cells.length-1],value:v}))}
    for(let r=0;r<n-2;r++){let cells=[[r,c],[r+1,c],[r+2,c]];if(!hasIgnore(cells)&&s[r][c]!==-1&&s[r][c]===s[r+1][c]&&s[r][c]===s[r+2][c])out.push(normalizeVisibleError({rule:'T_NO_THREE',technique:'T_NO_THREE',cells,target:cells[2],value:s[r][c]}))}
  }
  for(let [r,c,d,rel] of current.edges){
    let r2=d==='r'?r:r+1,c2=d==='r'?c+1:c,cells=[[r,c],[r2,c2]],a=s[r][c],b=s[r2][c2];
    if(!hasIgnore(cells)&&a!==-1&&b!==-1&&((rel==='='&&a!==b)||(rel==='×'&&a===b)))out.push(normalizeVisibleError({rule:rel==='='?'T_RELATION_EQUAL':'T_RELATION_OPPOSITE',technique:rel==='='?'T_RELATION_EQUAL':'T_RELATION_OPPOSITE',cells,target:[r2,c2],other:[r,c],relation:rel}))
  }
  return out
}
function sudokuVisibleErrors(){
  let out=[],s=current.state;
  function duplicateErrors(cells,rule){
    let by={};for(let [r,c] of cells){let v=s[r][c];if(!v)continue;(by[v]??=[]).push([r,c])}
    for(let [v,a] of Object.entries(by))if(a.length>1)for(let i=1;i<a.length;i++)out.push(normalizeVisibleError({rule,cells:[a[0],a[i]],target:a[i],other:a[0],value:Number(v)}))
  }
  for(let r=0;r<6;r++)duplicateErrors(Array.from({length:6},(_,c)=>[r,c]),'S_ROW_DUPLICATE');
  for(let c=0;c<6;c++)duplicateErrors(Array.from({length:6},(_,r)=>[r,c]),'S_COLUMN_DUPLICATE');
  for(let br=0;br<6;br+=2)for(let bc=0;bc<6;bc+=3){let cells=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)cells.push([r,c]);duplicateErrors(cells,'S_BOX_DUPLICATE')}
  return out
}
function patchVisibleErrors(){
  let out=[];for(const id of current.ids){let e=patchVisibleIssueForId(id);if(e)out.push(normalizeVisibleError(e))}
  if(!out.length){let e=patchLogicVisibleContradiction();if(e)out.push(normalizeVisibleError(e))}
  return out
}
function currentVisibleErrors(){
  if(!current||current.completed)return [];
  let list=gamePedagogy().visibleErrors();
  let seen=new Set(),out=[];for(let e of list){let k=errorSignature(e);if(!seen.has(k)){seen.add(k);out.push(e)}}
  if(!out.length&&current.lastError?.source==='visible-state'&&current.lastError.canReturn===false)out.push({...current.lastError,transient:true});
  return out
}
function focusVisibleErrors(errors){
  clearErrorFocus();let board=document.querySelector('.board'),n=current?.n||6;if(!board)return;
  let seen=new Set();for(let e of errors)for(let [r,c] of e.cells||[]){let k=keyCell(r,c);if(seen.has(k))continue;seen.add(k);let d=board.children[r*n+c];if(d)d.classList.add('error-focus')}
}
function showVisibleErrorsBeforeHint(){
  let errors=currentVisibleErrors();if(!errors.length)return false;
  current.hintFlow=null;clearHintFocus();focusVisibleErrors(errors);
  let html=`<b>⚠ ${tr('errorDetected')}</b>`;
  for(let e of errors)html+=`<div class="coach-error-item"><b>${tr('errorRule')} :</b> ${errorRuleTitle(e)}<br><span>${errorDetailedMessage(e)}</span></div>`;
  if(current?.lastError?.canReturn)html+=`<button class="btn error-return-btn" onclick="returnBeforeLastError()">↶ ${tr('returnBeforeError')}</button>`;
  showHintNotice(html);errorUsage('explained');
  if(errors.every(e=>e.transient))current.lastError=null;
  saveCurrent();return true
}

function analyzeCurrentError(action){
  if(!current||current.completed||action?.type==='COACH_APPLY')return null;
  let e=gamePedagogy().errorFromAction(action);
  if(!e)return null;
  return {...e,schema:1,source:'visible-state',game:current.game,at:WebPlatform.clock.nowMs(),canReturn:true}
}
function errorRuleTitle(e){
  if(!e)return '';
  if(e.technique&&PEDAGOGY_TECHNIQUES[e.technique])return techniqueTitle(e.technique);
  if(e.rule==='S_ROW_DUPLICATE')return `${tr('errorDuplicate')} · ${tr('rowLabel')}`;
  if(e.rule==='S_COLUMN_DUPLICATE')return `${tr('errorDuplicate')} · ${tr('columnLabel')}`;
  if(e.rule==='S_BOX_DUPLICATE')return `${tr('errorDuplicate')} · 2×3`;
  if(e.rule==='P_TWO_CLUES')return tr('patchTwo');
  if(e.rule==='P_SIZE')return tr('patchSize');
  if(e.rule==='P_SHAPE')return tr('patchShape');
  if(e.rule==='P_OVERLAP')return tr('errorOverlap');
  if(e.rule==='P_CLUE')return tr('patchEach');
  if(e.rule==='P_NO_COVER')return tr('patchAll');
  if(e.rule==='P_NO_CANDIDATE')return tr('patchEach');
  if(e.rule==='P_OWNER_CONFLICT'||e.rule==='P_LOGIC_CONTRADICTION')return tr('errorConflict');
  return tr('errorRule')
}
function errorDetailedMessage(e){
  if(!e)return '';
  let L=lang(),target=e.target?cellName(...e.target):'',other=e.other?cellName(...e.other):'';
  if(L==='fr'){
    if(e.rule==='Q_ROW')return `${target} et ${other} contiennent deux couronnes sur la même ligne.`;
    if(e.rule==='Q_COLUMN')return `${target} et ${other} contiennent deux couronnes dans la même colonne.`;
    if(e.rule==='Q_REGION')return `${target} et ${other} placent deux couronnes dans ${queenZoneBadge(e.region)}.`;
    if(e.rule==='Q_ADJACENCY')return `Les couronnes en ${target} et ${other} se touchent : deux couronnes ne peuvent pas être adjacentes, même en diagonale.`;
    if(e.rule==='T_BALANCE_ROW')return `Cette ligne contient maintenant plus de trois symboles identiques, alors qu’elle doit contenir exactement 3 soleils et 3 lunes.`;
    if(e.rule==='T_BALANCE_COLUMN')return `Cette colonne contient maintenant plus de trois symboles identiques, alors qu’elle doit contenir exactement 3 soleils et 3 lunes.`;
    if(e.rule==='T_NO_THREE')return `Ce coup crée trois symboles identiques consécutifs, ce qui est interdit.`;
    if(e.rule==='T_RELATION_EQUAL')return `Les deux cases reliées par « = » doivent contenir le même symbole.`;
    if(e.rule==='T_RELATION_OPPOSITE')return `Les deux cases reliées par « × » doivent contenir des symboles différents.`;
    if(e.rule==='S_ROW_DUPLICATE')return `Le chiffre ${e.value} apparaît déjà dans la même ligne (${other}).`;
    if(e.rule==='S_COLUMN_DUPLICATE')return `Le chiffre ${e.value} apparaît déjà dans la même colonne (${other}).`;
    if(e.rule==='S_BOX_DUPLICATE')return `Le chiffre ${e.value} apparaît déjà dans le même bloc 2×3 (${other}).`;
    if(e.rule==='P_TWO_CLUES')return `Le rectangle de la zone ${e.region+1} contient l’indice d’une autre zone.`;
    if(e.rule==='P_SIZE')return `Le rectangle de la zone ${e.region+1} est déjà trop grand pour respecter son indice de taille.`;
    if(e.rule==='P_SHAPE')return `La forme actuelle de la zone ${e.region+1} ne peut plus respecter son indice de forme.`;
    if(e.rule==='P_CLUE')return `Un rectangle doit contenir exactement un indice de zone.`;
    if(e.rule==='P_OVERLAP')return `Ce rectangle chevauche une zone déjà attribuée.`
  }
  if(L==='en'){
    if(e.rule==='Q_ROW')return `${target} and ${other} contain two queens in the same row.`;
    if(e.rule==='Q_COLUMN')return `${target} and ${other} contain two queens in the same column.`;
    if(e.rule==='Q_REGION')return `${target} and ${other} place two queens in the same region.`;
    if(e.rule==='Q_ADJACENCY')return `The queens at ${target} and ${other} touch; queens may not be adjacent, even diagonally.`;
    if(e.rule==='T_BALANCE_ROW')return `This row now contains more than three identical symbols; it must contain exactly 3 suns and 3 moons.`;
    if(e.rule==='T_BALANCE_COLUMN')return `This column now contains more than three identical symbols; it must contain exactly 3 suns and 3 moons.`;
    if(e.rule==='T_NO_THREE')return `This move creates three identical consecutive symbols, which is forbidden.`;
    if(e.rule==='T_RELATION_EQUAL')return `The two cells linked by “=” must contain the same symbol.`;
    if(e.rule==='T_RELATION_OPPOSITE')return `The two cells linked by “×” must contain different symbols.`;
    if(e.rule==='S_ROW_DUPLICATE')return `Digit ${e.value} already appears in the same row (${other}).`;
    if(e.rule==='S_COLUMN_DUPLICATE')return `Digit ${e.value} already appears in the same column (${other}).`;
    if(e.rule==='S_BOX_DUPLICATE')return `Digit ${e.value} already appears in the same 2×3 box (${other}).`;
    if(e.rule==='P_TWO_CLUES')return `Region ${e.region+1}'s rectangle contains another region's clue.`;
    if(e.rule==='P_SIZE')return `Region ${e.region+1}'s rectangle is already too large to satisfy its size clue.`;
    if(e.rule==='P_SHAPE')return `Region ${e.region+1}'s current shape can no longer satisfy its shape clue.`;
    if(e.rule==='P_CLUE')return `A rectangle must contain exactly one region clue.`;
    if(e.rule==='P_OVERLAP')return `This rectangle overlaps an already assigned region.`
  }
  return tr('errorConflict')
}
function clearErrorFocus(){document.querySelectorAll('.error-focus').forEach(x=>x.classList.remove('error-focus'))}
function focusErrorCells(e){
  clearErrorFocus();let board=document.querySelector('.board'),n=current?.n||6;if(!board||!e?.cells)return;
  for(let [r,c] of e.cells){let d=board.children[r*n+c];if(d)d.classList.add('error-focus')}
}
function refreshErrorCoach(){
  let box=$('#errorCoach');if(!box)return;
  let e=current?.lastError;
  if(!illegalAlertsEnabled()||!e){box.hidden=true;box.innerHTML='';return}
  box.hidden=false;
  box.innerHTML=`<span class="error-coach-label">⚠ ${tr('errorDetected')}</span><button class="btn error-explain-btn" id="explainErrorBtn">${tr('explainError')}</button>`;
  let b=$('#explainErrorBtn');if(b)b.onclick=explainLastError
}
function explainLastError(){
  let e=current?.lastError;if(!e)return false;
  errorUsage('explained');focusErrorCells(e);
  let back=e.canReturn?`<button class="btn error-return-btn" onclick="returnBeforeLastError()">↶ ${tr('returnBeforeError')}</button>`:'';
  showHintNotice(`<b>${tr('errorRule')} :</b> ${errorRuleTitle(e)}<br><span class="error-explanation">${errorDetailedMessage(e)}</span>${back}`);
  saveCurrent();return true
}
function syncErrorFromHistory(){
  if(!current)return;
  let n=historyNode();current.lastError=n?.error?{...n.error}:null;clearErrorFocus();refreshErrorCoach()
}
function returnBeforeLastError(){
  let e=current?.lastError,h=current?.moveHistory;if(!e?.canReturn||!h||!e.historyNode||!e.parentNode)return false;
  let node=h.nodes[e.historyNode],parent=h.nodes[e.parentNode];if(!node||!parent)return false;
  parent.preferred=node.id;h.cursor=parent.id;h.stats.undos=(h.stats.undos||0)+1;markBacktrack();errorUsage('returned');
  restorePuzzleSnapshot(parent.snapshot);syncErrorFromHistory();updateHistoryButtons();saveCurrent();showToast(tr('errorReturned'));haptic(7);return true
}
function captureRejectedPatchError(info){
  if(!current||current.game!=='patches'||!info)return null;
  let rule=info.reason==='MULTIPLE_CLUES'?'P_TWO_CLUES':info.reason==='OVERLAP'?'P_OVERLAP':'P_CLUE';
  let e={schema:1,source:'visible-state',game:'patches',rule,at:WebPlatform.clock.nowMs(),canReturn:false,cells:info.rect?.cells||[],target:info.rect?.cells?.[0]||null,region:info.id};
  current.lastError=e;errorUsage('rejected');clearErrorFocus();refreshErrorCoach();return e
}

function closePreviousAttempt(){
  let c=current&&current.attemptId&&!current.completed?current:null,saved=!c?getSaved():null;
  if(!c&&saved?.current?.attemptId&&!saved.current.completed)c=saved.current;
  if(c&&!c.statsClosed)statsFinish(c,c===current?timerSeconds():(saved?.elapsed||0),'abandoned')
}

// ===== v2.23 — reproducible certified friend challenges =====
const CHALLENGE_SCHEMA=2,CHALLENGE_GENERATOR=1,CHALLENGE_NAMESPACE='quadlud-challenge-v2.23',CHALLENGE_VERSION_LABEL='v2.23';
const CHALLENGE_ALPHABET='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CHALLENGE_GAME_TO_CODE=Object.freeze(Object.fromEntries(GAME_IDS.map(game=>[game,GameRegistry.getMetadata(game)?.challengeCode]).filter(([,code])=>typeof code==='string'&&/^[A-Z]$/.test(code))));
const CHALLENGE_CODE_TO_GAME=Object.freeze(Object.fromEntries(Object.entries(CHALLENGE_GAME_TO_CODE).map(([game,code])=>[code,game])));
const CHALLENGE_DIFF_TO_CODE={easy:'E',medium:'M',hard:'H',expert:'X'};
const CHALLENGE_CODE_TO_DIFF={E:'easy',M:'medium',H:'hard',X:'expert'};
function challengeNormalizeCode(raw=''){return String(raw).toUpperCase().replace(/[^A-Z0-9]/g,'')}
function challengeChecksum(payload){
  let h=hash32(`quadlud-challenge-check:${payload}`),a=CHALLENGE_ALPHABET;
  return a[Math.floor(h/a.length)%a.length]+a[h%a.length]
}
function challengeRandomSeed(len=8){
  let a=CHALLENGE_ALPHABET,out='',bytes=null;
  try{if(globalThis.crypto?.getRandomValues){bytes=new Uint32Array(len);globalThis.crypto.getRandomValues(bytes)}}catch(_){}
  for(let i=0;i<len;i++){let n=bytes?bytes[i]:Math.floor(Math.random()*0x100000000);out+=a[n%a.length]}
  return out
}
function challengeMake(game,diff,seed=challengeRandomSeed(),generator=CHALLENGE_GENERATOR){
  if(!CHALLENGE_GAME_TO_CODE[game]||!CHALLENGE_DIFF_TO_CODE[diff])return null;
  generator=Number(generator);if(generator!==CHALLENGE_GENERATOR)return null;
  seed=challengeNormalizeCode(seed).slice(0,8);if(seed.length!==8||[...seed].some(c=>!CHALLENGE_ALPHABET.includes(c)))return null;
  let payload=`QL${CHALLENGE_SCHEMA}${generator}${CHALLENGE_GAME_TO_CODE[game]}${CHALLENGE_DIFF_TO_CODE[diff]}${seed}`,check=challengeChecksum(payload);
  return {schema:CHALLENGE_SCHEMA,generator,game,diff,seed,code:`QL${CHALLENGE_SCHEMA}${generator}-${CHALLENGE_GAME_TO_CODE[game]}${CHALLENGE_DIFF_TO_CODE[diff]}-${seed}-${check}`}
}
function challengeParse(raw){
  let n=challengeNormalizeCode(raw);
  // QL + schema + generator + game + difficulty + 8 canonical seed chars + 2 checksum chars.
  if(n.length!==16||n.slice(0,2)!=='QL')return null;
  let schema=Number(n[2]),generator=Number(n[3]),game=CHALLENGE_CODE_TO_GAME[n[4]],diff=CHALLENGE_CODE_TO_DIFF[n[5]],seed=n.slice(6,14),check=n.slice(14);
  if(schema!==CHALLENGE_SCHEMA||generator!==CHALLENGE_GENERATOR||!game||!diff)return null;
  if([...seed].some(c=>!CHALLENGE_ALPHABET.includes(c)))return null;
  let payload=n.slice(0,14);if(challengeChecksum(payload)!==check)return null;
  return challengeMake(game,diff,seed,generator)
}
function challengeSeedString(ch){return `${CHALLENGE_NAMESPACE}:s${ch.schema}:g${ch.generator}:${ch.game}:${ch.diff}:${ch.seed}`}
function challengePublicPuzzleFromCandidate(ch,g){return generatedPublicPuzzleFromCandidate(ch?.game,g)}
function challengeFingerprintFromCandidate(ch,g){return generatedCandidateFingerprint(ch?.game,g)}
function challengeCandidateProfile(g){return generatedCandidateProfile(g)}
function challengeCandidateCertified(ch,g){return !!ch&&generatedCandidateCertified(ch.game,ch.diff,g)}
function gameSessionLifecycle(game){return GameRegistry.requireCapability(game,'sessionLifecycle')}
function createRegisteredGeneratedSession(game,diff,candidate,options={}){return gameSessionLifecycle(game).createGeneratedSession(diff,candidate,options)}
// Rendering is delegated through the registered UI lifecycle; session creation remains registry-driven and separate from UI.
function renderInstalledSession(c){return renderGameUi(c)}
function installGeneratedSession(game,diff,candidate,{context='normal',metadata=null}={}){
  current=createRegisteredGeneratedSession(game,diff,candidate,{context});
  if(metadata&&typeof metadata==='object')Object.assign(current,metadata);
  renderInstalledSession(current);return current
}
function validateRegisteredVictory(session=current,options={}){
  if(!session?.game||!GameRegistry.hasCapability(session.game,'sessionLifecycle'))return {solved:false,reasonKey:'gridIncomplete'};
  return gameSessionLifecycle(session.game).validateVictory(session,options)
}
function checkRegisteredVictory(){let result=validateRegisteredVictory(current);if(result.solved)finish(`${tr('congrats')} ${gameLabel(current.game)}`);else status(tr(result.reasonKey||'gridIncomplete'),false);return result.solved}
function challengeBuildCandidate(ch){
  if(!ch||ch.schema!==CHALLENGE_SCHEMA||ch.generator!==CHALLENGE_GENERATOR||!CHALLENGE_GAME_TO_CODE[ch.game]||!CHALLENGE_DIFF_TO_CODE[ch.diff])return null;
  return withSeed(challengeSeedString(ch),()=>{
    let g=generateRegisteredCandidate(ch.game,ch.diff);
    if(!challengeCandidateCertified(ch,g))throw new Error('Challenge candidate is not certified at the requested difficulty');
    return g
  })
}
function challengePublicFingerprint(ch){return challengeFingerprintFromCandidate(ch,challengeBuildCandidate(ch))}
function challengeInstall(ch,g){
  return installGeneratedSession(ch.game,ch.diff,g,{context:'challenge',metadata:{challenge:true,challengeCode:ch.code,challengeSeed:ch.seed,challengeGenerator:ch.generator,challengeFingerprint:challengeFingerprintFromCandidate(ch,g)}})
}
function launchChallenge(value){
  let ch=typeof value==='string'?challengeParse(value):value;if(!ch){showToast(tr('invalidChallengeCode'));return false}
  closePreviousAttempt();clearSaved();stopTimer();paused=false;setBusy(true);
  requestAnimationFrame(()=>{try{
    let g=challengeBuildCandidate(ch);if(!g)throw new Error('challenge generation failed');challengeInstall(ch,g);
    historyInit(true);updateHistoryButtons();statsStart(current);startTimer(true,0,false);saveCurrent();haptic(8)
  }catch(_){showToast(tr('invalidChallengeCode'));home()}finally{setBusy(false);startBackgroundPrecompute(ch.game,ch.diff)}});return true
}
function challengeDiffOptions(game,selected='medium'){
  let ds=['easy','medium','hard','expert'];
  return ds.map(d=>`<option value="${d}" ${d===selected?'selected':''}>${DIFF[d]}</option>`).join('')
}
function challengeLink(code){
  try{if(typeof location!=='undefined'&&location.href){let base=location.href.split('#')[0].split('?')[0];return `${base}#challenge=${encodeURIComponent(code)}`}}catch(_){}
  return `#challenge=${encodeURIComponent(code)}`
}
function challengeShareText(ch){
  return `QUADLUD — ${tr('challenge')}\n${gameLabel(ch.game)} · ${DIFF[ch.diff]}\n${tr('challengeCode')}: ${ch.code}\n${challengeLink(ch.code)}`
}
async function copyChallengeCode(code){
  try{if(await WebPlatform.sharing.copyText(code)){showToast(tr('codeCopied'));return true}}catch(_){}
  showToast(tr('shareUnavailable'));return false
}
async function shareChallenge(ch){
  let text=challengeShareText(ch),url=challengeLink(ch.code);
  try{
    if(await WebPlatform.sharing.share({title:`QUADLUD — ${tr('challenge')}`,text,url}))return true;
    if(await WebPlatform.sharing.copyText(text)){showToast(tr('codeCopied'));return true}
  }catch(e){if(e?.name==='AbortError')return false;try{if(await WebPlatform.sharing.copyText(text)){showToast(tr('codeCopied'));return true}}catch(_){}}
  showToast(tr('shareUnavailable'));return false
}
function challengeReadyHtml(ch,fromLink=false){
  return `<div class="challenge-ready"><small>${fromLink?tr('challengeFromLink'):tr('challengeReady')}</small><div class="challenge-code">${ch.code}</div><div class="challenge-meta"><b>${gameLabel(ch.game)}</b><span>${DIFF[ch.diff]}</span><span>${tr('challengeGenerator')} ${CHALLENGE_VERSION_LABEL}</span></div><p>${tr('challengeSamePuzzle')} ${tr('challengeNoAccount')}</p><div class="challenge-actions"><button class="btn primary" id="challengePlay">${tr('playChallenge')}</button><button class="btn" id="challengeShare">${tr('shareChallenge')}</button><button class="btn" id="challengeCopy">${tr('copyCode')}</button></div></div>`
}
function challengeView(prefill=null,fromLink=false){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let ch=typeof prefill==='string'?challengeParse(prefill):prefill,game=ch?.game||'queens',diff=ch?.diff||'medium';
  app.innerHTML=`<section class="panel challenge-panel"><div class="stats-head"><div><h1>${tr('challenge')}</h1><p>${tr('challengeSub')}</p></div><button class="btn" id="challengeBack">${tr('back')}</button></div>
    <div class="challenge-columns">
      <section class="challenge-box"><h2>${tr('createChallenge')}</h2><label>${tr('game')}<select class="difficulty" id="challengeGame">${GAME_IDS.map(g=>`<option value="${g}" ${g===game?'selected':''}>${gameLabel(g)}</option>`).join('')}</select></label><label>${tr('difficulty')}<select class="difficulty" id="challengeDiff">${challengeDiffOptions(game,diff)}</select></label><button class="btn primary" id="challengeGenerate">${tr('generateChallenge')}</button></section>
      <section class="challenge-box"><h2>${tr('joinChallenge')}</h2><label>${tr('challengeCode')}<input id="challengeInput" class="challenge-input" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="QL21-QM-XXXXXXXX-XX" value="${ch?.code||''}"></label><button class="btn" id="challengeJoin">${tr('joinChallenge')}</button></section>
    </div>
    <div id="challengeReady">${ch?challengeReadyHtml(ch,fromLink):`<p class="challenge-note">${tr('challengeNoAccount')}</p>`}</div></section>`;
  $('#challengeBack').onclick=home;
  $('#challengeGame').onchange=e=>{let d=$('#challengeDiff');d.innerHTML=challengeDiffOptions(e.target.value,d.value)};
  $('#challengeGenerate').onclick=()=>challengeView(challengeMake($('#challengeGame').value,$('#challengeDiff').value),false);
  $('#challengeJoin').onclick=()=>{let parsed=challengeParse($('#challengeInput').value);if(!parsed)return showToast(tr('invalidChallengeCode'));challengeView(parsed,false)};
  if(ch){$('#challengePlay').onclick=()=>launchChallenge(ch);$('#challengeShare').onclick=()=>shareChallenge(ch);$('#challengeCopy').onclick=()=>copyChallengeCode(ch.code)}
  app.querySelectorAll('button').forEach(pressFeedback)
}
function challengeFromHash(){
  try{if(typeof location==='undefined')return null;let m=String(location.hash||'').match(/^#challenge=([^&]+)/i);return m?challengeParse(decodeURIComponent(m[1])):null}catch(_){return null}
}
function initialView(){let ch=challengeFromHash();if(ch)return challengeView(ch,true);home()}

const DAILY_KEY=PersistentData.keys.daily;
const DAILY_SCHEMA=2,DAILY_GENERATOR=1,DAILY_NAMESPACE='quadlud-daily-v2.23',DAILY_DIFFICULTY='medium';
const DAILY_GAMES=GAME_IDS;
const DAILY_LOGIC_POINTS={0:100,1:90,2:75,3:55,4:25};
function dailyState(){return PersistentData.daily.read()}
function saveDailyState(x){PersistentData.daily.write(x)}
function dailyKey(day,game){return `${day}:${game}`}
function dailyRecord(day,game,state=dailyState()){return state[dailyKey(day,game)]||null}
function dailySeedString(day,game){
  day=String(day||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!DAILY_GAMES.includes(game))return null;
  return `${DAILY_NAMESPACE}:s${DAILY_SCHEMA}:g${DAILY_GENERATOR}:${day}:${game}:${DAILY_DIFFICULTY}`
}
function dailyBuildCandidate(day,game){
  let seed=dailySeedString(day,game);if(!seed)return null;
  return withSeed(seed,()=>{
    let g=generateRegisteredCandidate(game,DAILY_DIFFICULTY);
    if(!generatedCandidateCertified(game,DAILY_DIFFICULTY,g))throw new Error(`Daily candidate is not certified Medium (${game})`);
    return g
  })
}
function dailyFingerprintFromCandidate(game,g){return generatedCandidateFingerprint(game,g)}
function dailyPublicFingerprint(day,game){let g=dailyBuildCandidate(day,game);return g?dailyFingerprintFromCandidate(game,g):null}
function dailyInstallCandidate(game,g,day){
  rememberGeneratedCandidateThisSession(game,g,day);
  return installGeneratedSession(game,DAILY_DIFFICULTY,g,{context:'daily',metadata:{daily:true,dailyDay:day,dailyCircuit:true,dailySchema:DAILY_SCHEMA,dailyGenerator:DAILY_GENERATOR,dailyFingerprint:dailyFingerprintFromCandidate(game,g)}})
}
function dailyHelpStage(c){
  if(c?.walkthroughUsed)return 4;
  let u=c?.coachUsage||{};
  if((u.reveal||0)>0)return 4;
  if((u.why||0)>0)return 3;
  if((u.rule||0)>0)return 2;
  if((u.where||0)>0)return 1;
  return c?.hintUsed?4:0
}
function dailyHelpLabel(stage){
  return [tr('dailyNoHelp'),tr('dailyOrientation'),tr('dailyRuleHelp'),tr('dailyExplanationHelp'),tr('dailyRevealHelp')][Math.max(0,Math.min(4,Number(stage)||0))]
}
function dailyLogicScore(c){return DAILY_LOGIC_POINTS[dailyHelpStage(c)]}
function dailyErrorCount(c){let e=c?.errorCoachUsage||{};return Math.max(0,Number(e.detected)||0)+Math.max(0,Number(e.rejected)||0)}
function dailyBacktrackCount(c){return Math.max(0,Number(c?.moveHistory?.stats?.undos)||0)}
function markDaily(c,outcome,seconds){
  if(!c?.daily)return;
  let s=dailyState(),k=dailyKey(c.dailyDay,c.game),old=s[k]||{},solvedBefore=old.outcome==='solved',sec=Math.max(0,Math.round(seconds));
  if(solvedBefore){
    // The official logical score is immutable after the first successful solve.
    old.best=old.best==null?sec:Math.min(old.best,sec);old.lastSeconds=sec;old.lastOutcome=outcome;old.lastCompletedAt=WebPlatform.clock.nowMs();s[k]=old;saveDailyState(s);return
  }
  let rec={day:c.dailyDay,game:c.game,outcome,seconds:sec,completedAt:WebPlatform.clock.nowMs(),best:outcome==='solved'?sec:old.best??null,dailySchema:c.dailySchema??DAILY_SCHEMA,dailyGenerator:c.dailyGenerator??DAILY_GENERATOR,fingerprint:c.dailyFingerprint||null};
  if(outcome==='solved'){
    rec.logicScore=dailyLogicScore(c);rec.helpStage=dailyHelpStage(c);rec.helpLabelKey=['dailyNoHelp','dailyOrientation','dailyRuleHelp','dailyExplanationHelp','dailyRevealHelp'][rec.helpStage];
    rec.errors=dailyErrorCount(c);rec.backtracks=dailyBacktrackCount(c);rec.official=true
  }
  s[k]=rec;saveDailyState(s)
}
function dailyProgress(day=localDay()){let s=dailyState();return DAILY_GAMES.map(g=>s[dailyKey(day,g)]).filter(x=>x?.outcome==='solved').length}
function dailyHomeLine(day=localDay()){let s=dailyCircuitSummary(day);return `${s.completed}/4 · ${s.scoreKnown?`${s.totalScore}/400`:tr('dailyLogicScore')}`}
function dailyCircuitSummary(day=localDay(),state=dailyState()){
  let rows=DAILY_GAMES.map(game=>({game,record:dailyRecord(day,game,state)})),solved=rows.filter(x=>x.record?.outcome==='solved'),scored=solved.filter(x=>Number.isFinite(Number(x.record.logicScore)));
  return {day,rows,completed:solved.length,totalScore:scored.reduce((a,x)=>a+Number(x.record.logicScore),0),scoredGames:scored.length,complete:solved.length===4,scoreKnown:solved.length===scored.length}
}
function dailyNextGame(day=localDay(),state=dailyState()){return DAILY_GAMES.find(g=>dailyRecord(day,g,state)?.outcome!=='solved')||null}
function dailyCalendar(days=28){
  let s=dailyState(),out=[],d=WebPlatform.clock.nowDate();d.setHours(12,0,0,0);
  for(let i=0;i<days;i++){let day=localDay(d.getTime()),sum=dailyCircuitSummary(day,s);out.push({day,n:sum.completed,score:sum.scoreKnown?sum.totalScore:null});d.setDate(d.getDate()-1)}
  return out
}
function dailyCardHtml(g,r){
  let done=r?.outcome==='solved',score=done&&Number.isFinite(Number(r.logicScore))?`${r.logicScore}/100`:done?'—/100':'',help=done&&r.logicScore!=null?dailyHelpLabel(r.helpStage):done?tr('dailyUnscoredLegacy'):'';
  return `<button class="daily-game ${done?'done':''}" data-daily="${g}"><span aria-hidden="true">${{queens:'♛',tango:'☀︎',sudoku:'✎',patches:'▦'}[g]}</span><b>${gameLabel(g)}</b><small>${done?`✓ ${score} · ${help} · ${fmt(r.best??r.seconds)}`:tr('play')}</small></button>`
}
function dailyReportHtml(day,state=dailyState()){
  let sum=dailyCircuitSummary(day,state),rows=sum.rows.map(({game,record:r})=>{
    let done=r?.outcome==='solved',score=done&&r.logicScore!=null?`${r.logicScore}/100`:'—',help=done&&r.logicScore!=null?dailyHelpLabel(r.helpStage):done?tr('dailyUnscoredLegacy'):'—';
    return `<div class="daily-report-row ${done?'done':''}"><span>${{queens:'♛',tango:'☀︎',sudoku:'✎',patches:'▦'}[game]}</span><b>${gameLabel(game)}</b><strong>${score}</strong><small>${help}</small><small>${tr('dailyErrorsCount')} ${r?.errors??0} · ${tr('dailyBacktracksCount')} ${r?.backtracks??0}</small></div>`
  }).join('');
  let score=sum.scoreKnown?`${sum.totalScore}/400`:`${sum.totalScore}/400*`;
  return `<section class="daily-report"><div class="daily-report-score"><span>${tr('dailyLogicScore')}</span><strong>${score}</strong><small>${sum.complete?tr('dailyCompleteReport'):`${sum.completed}/4 ${tr('finished')}`}</small></div>${rows}<p>${tr('dailyScoreNote')}</p><p><small>${tr('dailyScoreLocked')}</small></p></section>`
}
function dailyView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let day=localDay(),s=dailyState(),sum=dailyCircuitSummary(day,s),cards=DAILY_GAMES.map(g=>dailyCardHtml(g,dailyRecord(day,g,s))).join('');
  let cal=dailyCalendar().reverse().map(x=>`<div class="day-dot level-${x.n}" title="${x.day} · ${x.n}/4${x.score==null?'':` · ${x.score}/400`}"><span>${new Date(x.day+'T12:00:00').getDate()}</span></div>`).join('');
  let circuitLabel=sum.complete?tr('dailyReport'):(sum.completed?tr('dailyResumeCircuit'):tr('dailyStartCircuit'));
  app.innerHTML=`<section class="panel daily-panel"><div class="stats-head"><div><h1>${tr('dailyCircuit')}</h1><p>${new Date(day+'T12:00:00').toLocaleDateString(dateLocale(),{weekday:'long',day:'numeric',month:'long'})} · ${tr('dailyCircuitSub')}</p></div><button class="btn" id="dailyBack">${tr('back')}</button></div>
    <button class="btn primary daily-circuit-cta" id="dailyCircuitBtn">${sum.complete?`✓ ${circuitLabel}`:`◆ ${circuitLabel} · ${sum.completed}/4`}</button>
    ${dailyReportHtml(day,s)}
    <div class="daily-games">${cards}</div><h2>${tr('dailyLast')}</h2><div class="daily-calendar">${cal}</div><p class="daily-note">${tr('dailyNote')}</p></section>`;
  $('#dailyBack').onclick=home;$('#dailyCircuitBtn').onclick=()=>sum.complete?dailyView():launchDailyCircuit(day);
  app.querySelectorAll('[data-daily]').forEach(b=>b.onclick=()=>launchDaily(b.dataset.daily,day));app.querySelectorAll('button').forEach(pressFeedback)
}
function launchDailyCircuit(day=localDay()){let next=dailyNextGame(day);if(!next)return dailyView();launchDaily(next,day)}
function launchDaily(game,day=localDay()){
  if(!DAILY_GAMES.includes(game)||!dailySeedString(day,game))return false;
  closePreviousAttempt();clearSaved();stopTimer();paused=false;setBusy(true);current={game,diff:DAILY_DIFFICULTY,daily:true,dailyDay:day};
  requestAnimationFrame(()=>{try{
    let g=dailyBuildCandidate(day,game);if(!g)throw new Error('Daily generation failed');dailyInstallCandidate(game,g,day);
    historyInit(true);updateHistoryButtons();statsStart(current);startTimer(true,0,false);saveCurrent();haptic(8)
  }finally{setBusy(false);startBackgroundPrecompute(game,DAILY_DIFFICULTY)}});return true
}
const coarsePointer=()=>window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;
function haptic(ms=12){WebPlatform.haptics.vibrate(ms)}
function setBusy(on,label=null){label=label||tr('generating');document.body.classList.toggle('busy',!!on);document.body.setAttribute('aria-busy',String(!!on));let x=$('#busyOverlay');if(x){x.hidden=!on;x.setAttribute('aria-busy',String(!!on));let s=x.querySelector('span');if(s)s.textContent=label}}
function pressFeedback(el){if(!el)return;el.addEventListener('pointerdown',()=>el.classList.add('pressed'),{passive:true});for(let ev of ['pointerup','pointercancel','pointerleave'])el.addEventListener(ev,()=>el.classList.remove('pressed'),{passive:true})}

function showToast(t){toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1400)}

function closeHintNotice(){let n=$('#hintNotice');if(n)n.remove()}
function clampHintPosition(n,left,top){
  let w=n.offsetWidth||Math.min((window.innerWidth||390)*.92,520),h=n.offsetHeight||130,pad=8,W=window.innerWidth||390,H=window.innerHeight||844;
  return [Math.max(pad,Math.min(left,W-w-pad)),Math.max(pad,Math.min(top,H-h-pad))]
}
function makeHintDraggable(n){
  let h=n?.querySelector('.hint-drag-handle');if(!h)return;
  h.onpointerdown=e=>{
    if(e.button!=null&&e.button!==0)return;e.preventDefault();
    let rect=n.getBoundingClientRect(),dx=e.clientX-rect.left,dy=e.clientY-rect.top;
    n.style.left=rect.left+'px';n.style.top=rect.top+'px';n.style.bottom='auto';n.style.transform='none';
    try{h.setPointerCapture(e.pointerId)}catch(_){}
    h.onpointermove=ev=>{if(ev.pointerId!==e.pointerId)return;ev.preventDefault();let [x,y]=clampHintPosition(n,ev.clientX-dx,ev.clientY-dy);n.style.left=x+'px';n.style.top=y+'px'};
    let done=ev=>{if(ev.pointerId!==e.pointerId)return;try{h.releasePointerCapture(ev.pointerId)}catch(_){};h.onpointermove=null;h.onpointerup=null;h.onpointercancel=null};
    h.onpointerup=done;h.onpointercancel=done
  }
}
function showHintNotice(text){
  closeHintNotice();
  document.body.insertAdjacentHTML('beforeend',`<div class="hint-notice" id="hintNotice" role="status"><div class="hint-drag-handle" title="${tr('dragHint')}" aria-label="${tr('dragHint')}"><span>⋮⋮</span> ${tr('dragHint')}</div><div class="hint-notice-text">${text}</div><button class="btn primary hint-close" id="hintClose">${tr('closeHint')}</button></div>`);
  let n=$('#hintNotice');$('#hintClose').onclick=closeHintNotice;makeHintDraggable(n)
}
function timerSeconds(){return elapsedBase+(!paused&&startedAt?Math.floor((WebPlatform.clock.nowMs()-startedAt)/1000):0)}
function renderTimer(){timerEl.textContent=fmt(timerSeconds())}
function startTimer(reset=true,initial=0,isPaused=false){stopTimer(false);elapsedBase=reset?initial:timerSeconds();paused=isPaused;startedAt=paused?0:WebPlatform.clock.nowMs();renderTimer();if(!paused)tick=setInterval(()=>{renderTimer();if(current)saveCurrent()},1000)}
function stopTimer(commit=true){if(commit&&!paused&&startedAt){elapsedBase=timerSeconds();startedAt=0}if(tick)clearInterval(tick);tick=null}
function togglePause(){if(!current||current.completed)return;if(paused){paused=false;startedAt=WebPlatform.clock.nowMs();tick=setInterval(()=>{renderTimer();if(current)saveCurrent()},1000);showToast('Chrono repris')}else{elapsedBase=timerSeconds();startedAt=0;paused=true;if(tick)clearInterval(tick);tick=null;showToast('Chrono en pause')}updatePauseButton();saveCurrent()}
function updatePauseButton(){let b=$('#pauseBtn');if(b)b.textContent=paused?tr('resume'):tr('pause');updateHistoryButtons()}
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function modal(title,html){let old=$('#modal');if(old)a11yCloseDialog(old,false);document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="modal"><div class="sheet"><h2>${title}</h2>${html}<button class="btn primary" id="modalClose">${tr('closeHint')}</button></div></div>`);let root=$('#modal');$('#modalClose').onclick=()=>a11yCloseDialog(root);root.onclick=e=>{if(e.target===root)a11yCloseDialog(root)};a11yOpenDialog(root,'#modalClose')}
function confirmActionModal(title,html,confirmLabel,onConfirm){let old=$('#modal');if(old)a11yCloseDialog(old,false);document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="modal"><div class="sheet"><h2>${title}</h2>${html}<div class="modal-actions"><button class="btn" id="modalCancel">${tr('cancel')}</button><button class="btn danger" id="modalConfirm">${confirmLabel}</button></div></div></div>`);let root=$('#modal');$('#modalCancel').onclick=()=>a11yCloseDialog(root);$('#modalConfirm').onclick=()=>{a11yCloseDialog(root,false);onConfirm?.()};root.onclick=e=>{if(e.target===root)a11yCloseDialog(root)};a11yOpenDialog(root,'#modalCancel')}

// ===== v2.11.0 — structured Logic Coach reasoning + branching move history =====

// ===== v2.13.0 — pedagogical technique library =====
const PEDAGOGY_TECHNIQUES=PedagogyMetadata.CATALOG;
function techniqueTerm(k){let t=TECHNIQUE_TERMS[lang()]||TECHNIQUE_TERMS.en;return t[k]||TECHNIQUE_TERMS.en[k]||k}
function techniqueScope(scope){
  if(scope==='row')return tr('rowLabel');
  if(scope==='column')return tr('columnLabel');
  if(scope==='region')return tr('zone');
  if(scope==='box')return '2×3';
  return ''
}
function techniqueTitle(id){
  let x=PEDAGOGY_TECHNIQUES[id];if(!x)return id||techniqueTerm('technique');
  let title=techniqueTerm(x.kind);
  if(x.scope)title+=` · ${techniqueScope(x.scope)}`;
  if(x.symbol)title+=` ${x.symbol}`;
  if(x.kind==='balance')title+=' 3/3';
  if(x.kind==='contradiction')title+=` · R${x.rank}`;
  return title
}
function techniqueSummary(id){
  let x=PEDAGOGY_TECHNIQUES[id];if(!x)return tr('directReason');
  if(x.rank===1)return tr('rank1Reason');
  if(x.rank===2)return tr('rank2Reason');
  if(x.rank===3)return tr('rank3Reason');
  return tr('directReason')
}
function techniqueIdsForGame(game){return PedagogyMetadata.catalogIdsForGame(game)}
function techniqueLibraryHtml(game){
  let ids=techniqueIdsForGame(game);
  return `<div class="technique-library">${ids.map(id=>{let x=PEDAGOGY_TECHNIQUES[id];return `<article class="technique-card"><div class="technique-card-head"><b>${techniqueTitle(id)}</b><code>${id}</code></div><small>R${x.rank}</small><p>${techniqueSummary(id)}</p></article>`}).join('')}</div>`
}


// ===== v2.15.0 — logical mastery profile =====
const MASTERY_KINDS=['encountered','solo','where','rule','why','reveal','where3','why3','reveal3','errors'];
function emptyMasteryCounts(){return {encountered:0,solo:0,where:0,rule:0,why:0,reveal:0,where3:0,why3:0,reveal3:0,errors:0}}
function normalizeMasteryCounts(x={}){
  let o=emptyMasteryCounts();for(let k of MASTERY_KINDS)o[k]=Math.max(0,Number(x?.[k])||0);return o
}
function masterySessionBucket(id){
  if(!current||!PEDAGOGY_TECHNIQUES[id])return null;
  let s=current.masterySession||(current.masterySession={schema:1,techniques:{}});
  if(!s.techniques)s.techniques={};
  if(!s.techniques[id])s.techniques[id]=emptyMasteryCounts();
  return s.techniques[id]
}
function masteryRecord(id,kind){
  let b=masterySessionBucket(id);if(!b||!MASTERY_KINDS.includes(kind))return false;
  if(kind==='solo'||kind==='where'||kind==='where3'||kind==='errors')b.encountered++;
  b[kind]++;return true
}
function cloneMasterySession(s){return s?JSON.parse(JSON.stringify(s)):null}
function masteryMergeCounts(dst,src){
  dst=normalizeMasteryCounts(dst);src=normalizeMasteryCounts(src);
  for(let k of MASTERY_KINDS)dst[k]+=src[k];return dst
}
function masteryMergeIntoStats(stats,session){
  if(!stats.mastery||typeof stats.mastery!=='object')stats.mastery={schema:1,byTechnique:{},updatedAt:null};
  if(!stats.mastery.byTechnique)stats.mastery.byTechnique={};
  for(let [id,c] of Object.entries(session?.techniques||{})){
    if(!PEDAGOGY_TECHNIQUES[id])continue;
    stats.mastery.byTechnique[id]=masteryMergeCounts(stats.mastery.byTechnique[id],c)
  }
  if(session?.techniques&&Object.keys(session.techniques).length)stats.mastery.updatedAt=WebPlatform.clock.nowMs()
}
function masteryLegacyFromHistory(history=[]){
  let out={};
  for(let rec of history){
    if(rec?.masteryMerged)continue;
    for(let [id,t] of Object.entries(rec?.coachUsage?.techniques||{})){
      if(!PEDAGOGY_TECHNIQUES[id])continue;
      let b=out[id]||(out[id]=emptyMasteryCounts()),where=Math.max(0,Number(t.where)||0);
      if(rec?.coachUsage?.flowVersion===2){b.encountered+=where;b.where3+=where;b.why3+=Math.max(0,Number(t.why)||0);b.reveal3+=Math.max(0,Number(t.reveal)||0)}
      else{b.encountered+=where;b.where+=where;b.rule+=Math.max(0,Number(t.rule)||0);b.why+=Math.max(0,Number(t.why)||0);b.reveal+=Math.max(0,Number(t.reveal)||0)}
    }
  }
  return out
}
function effectiveMasteryByTechnique(stats=safeStats()){
  let out={};
  for(let id of Object.keys(PEDAGOGY_TECHNIQUES))out[id]=normalizeMasteryCounts(stats?.mastery?.byTechnique?.[id]);
  let legacy=masteryLegacyFromHistory(stats?.history||[]);
  for(let [id,c] of Object.entries(legacy))out[id]=masteryMergeCounts(out[id],c);
  return out
}
function masteryMetrics(c){
  c=normalizeMasteryCounts(c);
  let legacyWhere=Math.max(0,c.where-c.rule),ruleOnly=Math.max(0,c.rule-c.why),legacyWhy=Math.max(0,c.why-c.reveal),legacyReveal=c.reveal;
  let newWhere=Math.max(0,c.where3-c.why3),newWhy=Math.max(0,c.why3-c.reveal3),newReveal=c.reveal3;
  let whereOnly=legacyWhere+newWhere,whyOnly=legacyWhy+newWhy,revealed=legacyReveal+newReveal;
  let assisted=whereOnly+ruleOnly+whyOnly+revealed;
  let samples=c.solo+assisted+c.errors;
  let weighted=c.solo+whereOnly*.82+ruleOnly*.65+whyOnly*.45+revealed*.20;
  let score=samples?Math.max(0,Math.min(100,Math.round(weighted/samples*100))):null;
  let confidence=Math.min(100,Math.round(samples/12*100));
  return {...c,whereOnly,ruleOnly,whyOnly,revealed,assisted,samples,score,confidence}
}
function masteryLevel(m){
  if(!m||m.samples<3)return {key:'masteryInsufficient',level:0};
  if(m.score>=90)return {key:'masteryExcellent',level:4};
  if(m.score>=75)return {key:'masteryStrong',level:3};
  if(m.score>=55)return {key:'masteryAcquired',level:2};
  return {key:'masteryDeveloping',level:1}
}

function currentTechniqueMastery(id){
  if(!PEDAGOGY_TECHNIQUES[id])return masteryMetrics(emptyMasteryCounts());
  let all=effectiveMasteryByTechnique(safeStats()),base=normalizeMasteryCounts(all[id]),session=current?.masterySession?.techniques?.[id];
  return masteryMetrics(session?masteryMergeCounts(base,session):base)
}
function adaptiveCoachPlan(technique,mode=null){mode=current?.coachModeOverride||mode||prefs().coachMode;
  let m=currentTechniqueMastery(technique),lv=masteryLevel(m),entryStage=1,reason='light';
  if(mode==='minimal'){entryStage=1;reason='light'}
  else if(mode==='normal'){
    if(m.samples<3){entryStage=2;reason='learning'}
    else if(m.score>=75){entryStage=1;reason='light'}
    else{entryStage=2;reason='reinforced'}
  }else{
    if(m.score!=null&&m.score>=90){entryStage=1;reason='light'}
    else{entryStage=2;reason=m.samples<3?'learning':'reinforced'}
  }
  return {mode,entryStage,reason,technique,score:m.score,samples:m.samples,confidence:m.confidence,levelKey:lv.key,flowVersion:2}
}
function adaptiveCoachNote(plan){
  if(!plan||plan.mode==='minimal')return '';
  let label=plan.reason==='light'?tr('adaptiveLight'):plan.reason==='reinforced'?tr('adaptiveReinforced'):tr('adaptiveLearning');
  let detail=plan.samples<3?tr('masteryInsufficient'):`${tr(plan.levelKey)}${plan.score==null?'':` · ${plan.score}%`}`;
  return `<span class="coach-adaptive-note"><b>${tr('adaptiveHelp')} :</b> ${label} · ${detail}</span>`
}
function coachStageBlock(stage,kind,target,message){
  if(stage===1)return `<b>${tr('where')} :</b> ${message.look||coachLookText(kind,target,message)}`;
  if(stage===2)return `<b>${tr('hintWhy')} :</b> ${message.why}`;
  return `<b>${tr('hintMove')} :</b> ${message.move}<br><span class="hint-applied">${message.reveal}</span>`
}

function masteryStars(m){
  if(!m||m.samples<3||m.score==null)return '☆☆☆☆☆';
  let n=Math.max(1,Math.min(5,Math.round(m.score/20)));return '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(n)
}
function masteryGameMetrics(game,all){
  let total=emptyMasteryCounts();for(let id of techniqueIdsForGame(game))total=masteryMergeCounts(total,all[id]);
  return masteryMetrics(total)
}
function masteryDirectHintFromSnapshot(beforeKey){
  if(!current||!beforeKey)return null;
  let s;try{s=JSON.parse(beforeKey)}catch(_){return null}
  if(!s||s.game!==current.game)return null;
  let snap=current,clone={...current};
  if(s.state)clone.state=cloneGrid(s.state);if(s.paint)clone.paint=cloneGrid(s.paint);if('patchSelectedRects' in s)clone.patchSelectedRects=JSON.parse(JSON.stringify(s.patchSelectedRects||{}));if('patchLogicEvidence' in s)clone.patchLogicEvidence=JSON.parse(JSON.stringify(s.patchLogicEvidence||patchEmptyEvidence()));
  if('tangoPendingCell' in s)clone.tangoPendingCell=s.tangoPendingCell?[...s.tangoPendingCell]:null;if('tangoDerivedRelations' in s)clone.tangoDerivedRelations=JSON.parse(JSON.stringify(s.tangoDerivedRelations||[]));
  current=clone;
  try{
    let h=gamePedagogy(clone.game).masteryDirectHint();
    return h&&h.technique&&PEDAGOGY_TECHNIQUES[h.technique]?h:null
  }catch(_){return null}finally{current=snap}
}
function masteryActionMatchesHint(h,action){
  if(!h||!action)return false;
  if(action.type==='COACH_APPLY'||action.type==='QUEEN_DRAG'||action.type==='AUTO_CROSS_ENABLE'||action.type==='PATCH_REMOVE')return false;
  let target=action.primaryTarget||action.target||null,expected=h.id!=null?h.id:h.v;
  if(target&&Array.isArray(target)){
    let [r,c]=target,ch=(action.changes||[]).find(x=>x.row===r&&x.column===c);
    return r===h.r&&c===h.c&&!!ch&&ch.to===expected
  }
  if(target&&Number.isInteger(target.row)){
    let ch=(action.changes||[]).find(x=>x.row===target.row&&x.column===target.column);
    return target.row===h.r&&target.column===h.c&&!!ch&&ch.to===expected
  }
  return (action.changes||[]).some(ch=>ch.row===h.r&&ch.column===h.c&&ch.to===expected)
}
function masteryRecognizePlayerMove(beforeKey,action,error=null,audit=null){
  if(!current||current.training||error||!action||action.type==='COACH_APPLY')return false;
  if(audit?.status==='justified'&&audit.technique){
    let p=current.masteryPendingAid,t=Array.isArray(audit.target?.[0])?audit.target[0]:audit.target;
    if(p&&p.technique===audit.technique&&t&&p.target?.[0]===t[0]&&p.target?.[1]===t[1]){current.masteryPendingAid=null;return false}
    current.masteryPendingAid=null;return masteryRecord(audit.technique,'solo')
  }
  let h=masteryDirectHintFromSnapshot(beforeKey);if(!h||!masteryActionMatchesHint(h,action))return false;
  let p=current.masteryPendingAid;
  if(p&&p.technique===h.technique&&p.target?.[0]===h.r&&p.target?.[1]===h.c){current.masteryPendingAid=null;return false}
  current.masteryPendingAid=null;return masteryRecord(h.technique,'solo')
}
function masteryTechniqueCard(id,counts){
  let m=masteryMetrics(counts),lv=masteryLevel(m),pct=m.score==null?'—':`${m.score}%`;
  let aids=`<span title="${tr('where')}">🧭 ${m.whereOnly}</span><span title="${tr('rulesTitle')}">📘 ${m.ruleOnly}</span><span title="${tr('hintWhy')}">💡 ${m.whyOnly}</span><span title="${tr('solution')}">👁 ${m.revealed}</span>`;
  return `<article class="mastery-technique level-${lv.level}">
    <div class="mastery-technique-head"><div><b>${techniqueTitle(id)}</b><code>${id}</code></div><strong>${pct}</strong></div>
    <div class="mastery-stars" aria-label="${tr(lv.key)}">${masteryStars(m)} <small>${tr(lv.key)}</small></div>
    <div class="mastery-bar"><i style="width:${m.score??0}%"></i></div>
    <div class="mastery-detail"><span>${tr('masteryObserved')} <b>${m.encountered}</b></span><span>${tr('masterySolo')} <b>${m.solo}</b></span><span>${tr('masteryErrors')} <b>${m.errors}</b></span><span>${tr('masteryConfidence')} <b>${m.confidence}%</b></span></div>
    <div class="mastery-aids">${aids}</div><div class="mastery-card-actions"><button class="btn" data-learn-tech="${id}">${tr('learn')}</button><button class="btn mastery-train-btn" data-train-tech="${id}">${tr('train')}</button></div>
  </article>`
}
function masteryView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let s=safeStats(),all=effectiveMasteryByTechnique(s),games=GAME_IDS;
  let gm=games.map(g=>[g,masteryGameMetrics(g,all)]),globalCounts=emptyMasteryCounts();
  for(let [,m] of gm)globalCounts=masteryMergeCounts(globalCounts,m);
  let global=masteryMetrics(globalCounts),globalLv=masteryLevel(global),overall=global.score==null?'—':`${global.score}%`;
  let gameNav=gm.map(([g,m])=>{let lv=masteryLevel(m),score=m.score==null?'—':`${m.score}%`;return `<a class="mastery-game-summary level-${lv.level}" href="#mastery-${g}"><span aria-hidden="true">${{queens:'♛',tango:'☀︎',sudoku:'✎',patches:'▦'}[g]}</span><b>${gameLabel(g)}</b><strong>${score}</strong><small>${tr(lv.key)} · ${m.samples} ${tr('masteryObserved').toLowerCase()}</small></a>`}).join('');
  let sections=games.map(g=>`<section class="mastery-game" id="mastery-${g}"><h2>${gameLabel(g)}</h2><div class="mastery-techniques">${techniqueIdsForGame(g).map(id=>masteryTechniqueCard(id,all[id])).join('')}</div></section>`).join('');
  app.innerHTML=`<section class="panel mastery-panel"><div class="stats-head"><div><h1>${tr('mastery')}</h1><p>${tr('masterySub')}</p></div><button class="btn" id="masteryBack">${tr('back')}</button></div>
  <div class="mastery-overall"><div><span>${tr('masteryOverall')}</span><strong>${overall}</strong><small>${tr(globalLv.key)}</small></div><div class="mastery-bar"><i style="width:${global.score??0}%"></i></div><p>${tr('masteryObserved')} : <b>${global.encountered}</b> · ${tr('masterySolo')} : <b>${global.solo}</b> · ${tr('masteryConfidence')} : <b>${global.confidence}%</b></p></div>
  <div class="mastery-games">${gameNav}</div>${sections}</section>`;
  $('#masteryBack').onclick=home;app.querySelectorAll('[data-learn-tech]').forEach(b=>b.onclick=()=>lessonView(b.dataset.learnTech));app.querySelectorAll('[data-train-tech]').forEach(b=>b.onclick=()=>launchTraining(b.dataset.trainTech));app.querySelectorAll('button').forEach(pressFeedback)
}



// ===== v2.18.0 — interactive Learn path =====
function learningBucket(stats,id){
  if(!stats.learning||typeof stats.learning!=='object')stats.learning={schema:1,byTechnique:{}};
  if(!stats.learning.byTechnique)stats.learning.byTechnique={};
  let b=stats.learning.byTechnique[id]||(stats.learning.byTechnique[id]={explanation:0,guided:0,assisted:0,independent:0,completed:0,attempts:0,bestIndependent:null});
  for(let k of ['explanation','guided','assisted','independent','completed','attempts'])b[k]=Math.max(0,Number(b[k])||0);
  b.bestIndependent=b.bestIndependent==null?null:Math.max(0,Number(b.bestIndependent)||0);return b
}
function learningProgressValue(b){
  b=b||{};if(b.completed>0||b.independent>0)return 4;if(b.assisted>0)return 3;if(b.guided>0)return 2;if(b.explanation>0)return 1;return 0
}
function learningStatsMark(id,field,seconds=null){
  let s=safeStats(),b=learningBucket(s,id);if(field==='attempts')b.attempts++;else if(field in b)b[field]++;
  if(field==='independent'&&seconds!=null)b.bestIndependent=b.bestIndependent==null?seconds:Math.min(b.bestIndependent,seconds);
  if(field==='independent')b.completed=Math.max(1,b.completed);writeStats(s);return b
}
function learningCompletedCount(stats=safeStats()){
  return Object.keys(PEDAGOGY_TECHNIQUES).filter(id=>learningBucket(stats,id).completed>0).length
}
function lessonMethodText(id){
  let x=PEDAGOGY_TECHNIQUES[id];return x?.kind==='contradiction'?tr('lessonContradictionMethod'):tr('lessonDirectMethod')
}
function lessonExplanationHtml(id){
  let x=PEDAGOGY_TECHNIQUES[id];if(!x)return '';
  let scope=x.scope?` · ${techniqueScope(x.scope)}`:'',rank=`R${x.rank}`;
  return `<div class="lesson-explanation">
    <div class="lesson-technique-head"><span>${gameLabel(x.game)}</span><code>${id}</code><b>${rank}${scope}</b></div>
    <h2>${techniqueTitle(id)}</h2>
    <p><b>${tr('lessonObserve')} :</b> ${techniqueTitle(id)}</p>
    <p><b>${tr('lessonGoal')} :</b> ${techniqueSummary(id)}</p>
    <p>${lessonMethodText(id)}</p>
  </div>`
}
function lessonStepsHtml(id,b){
  let p=learningProgressValue(b),items=[
    [1,tr('lessonExplanation')],[2,tr('lessonGuided')],[3,tr('lessonAssisted')],[4,tr('lessonIndependent')]
  ];
  return `<div class="lesson-steps">${items.map(([n,t])=>`<div class="lesson-step ${p>=n?'done':''} ${p+1===n?'current':''}"><span>${p>=n?'✓':n}</span><b>${t}</b></div>`).join('')}</div>`
}
function learningCard(id,stats){
  let b=learningBucket(stats,id),p=learningProgressValue(b),x=PEDAGOGY_TECHNIQUES[id];
  return `<article class="learning-card ${b.completed?'completed':''}">
    <div class="learning-card-head"><div><b>${techniqueTitle(id)}</b><code>${id}</code></div><strong>${p}/4</strong></div>
    <small>${gameLabel(x.game)} · R${x.rank}</small>
    <div class="learning-mini-bar"><i style="width:${p*25}%"></i></div>
    <button class="btn ${b.completed?'':'primary'}" data-lesson="${id}">${b.completed?tr('lessonComplete'):tr('lesson')}</button>
  </article>`
}
function learningView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let s=safeStats(),games=GAME_IDS,done=learningCompletedCount(s);
  let sections=games.map(g=>`<section class="learning-game"><h2>${gameLabel(g)}</h2><div class="learning-grid">${techniqueIdsForGame(g).map(id=>learningCard(id,s)).join('')}</div></section>`).join('');
  app.innerHTML=`<section class="panel learning-panel"><div class="stats-head"><div><h1>${tr('learn')}</h1><p>${tr('learnSub')}</p></div><button class="btn" id="learningBack">${tr('back')}</button></div>
    <div class="learning-overall"><b>${done}/27</b><span>${tr('lessonCompletedCount')}</span><div class="learning-mini-bar"><i style="width:${done/27*100}%"></i></div></div>${sections}</section>`;
  $('#learningBack').onclick=home;app.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>lessonView(b.dataset.lesson));app.querySelectorAll('button').forEach(pressFeedback)
}
function lessonView(id){
  if(!PEDAGOGY_TECHNIQUES[id])return learningView();if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let s=safeStats(),b=learningBucket(s,id),p=learningProgressValue(b);
  app.innerHTML=`<section class="panel lesson-panel"><div class="stats-head"><div><h1>${tr('lesson')} — ${techniqueTitle(id)}</h1><p>${gameLabel(PEDAGOGY_TECHNIQUES[id].game)}</p></div><button class="btn" id="lessonBack">${tr('back')}</button></div>
    ${lessonStepsHtml(id,b)}${lessonExplanationHtml(id)}
    <div class="lesson-actions">
      <button class="btn primary" id="lessonGuidedBtn">${tr('lessonStartGuided')}</button>
      <button class="btn" id="lessonAssistedBtn" ${b.guided>0?'':'disabled'}>${tr('lessonStartAssisted')}</button>
      <button class="btn" id="lessonIndependentBtn" ${b.assisted>0?'':'disabled'}>${tr('lessonStartIndependent')}</button>
    </div>
    ${b.completed?`<div class="lesson-complete-banner">✓ ${tr('lessonComplete')}</div>`:''}
  </section>`;
  $('#lessonBack').onclick=learningView;
  $('#lessonGuidedBtn').onclick=()=>{if(!b.explanation)learningStatsMark(id,'explanation');launchLessonPhase(id,2)};
  $('#lessonAssistedBtn').onclick=()=>launchLessonPhase(id,3);
  $('#lessonIndependentBtn').onclick=()=>launchLessonPhase(id,4);
  app.querySelectorAll('button').forEach(pressFeedback)
}
function learningPhaseTitle(phase){
  return phase===2?tr('lessonGuided'):phase===3?tr('lessonAssisted'):tr('lessonIndependent')
}
function learningStatsStart(id,phase){let s=safeStats(),b=learningBucket(s,id);b.attempts++;writeStats(s)}
function learningStatsFinish(c,seconds,withCoach){
  if(!c?.learning||c.learningStatsClosed)return false;let s=safeStats(),b=learningBucket(s,c.learningTechnique);
  if(c.learningPhase===2)b.guided++;
  else if(c.learningPhase===3)b.assisted++;
  else if(c.learningPhase===4&&!withCoach){b.independent++;b.completed=Math.max(1,b.completed);b.bestIndependent=b.bestIndependent==null?seconds:Math.min(b.bestIndependent,seconds)}
  if(c.masterySession&&!c.learningMasteryMerged){masteryMergeIntoStats(s,c.masterySession);c.learningMasteryMerged=true}
  c.learningStatsClosed=true;writeStats(s);return c.learningPhase!==4||!withCoach
}
function launchLessonPhase(id,phase){
  if(!PEDAGOGY_TECHNIQUES[id]||![2,3,4].includes(phase))return lessonView(id);
  let s=safeStats(),b=learningBucket(s,id);if(phase===3&&!b.guided)return lessonView(id);if(phase===4&&!b.assisted)return lessonView(id);
  if(current&&!current.completed)clearSaved();stopTimer();paused=false;setBusy(true);
  requestAnimationFrame(()=>{try{
    if(!buildTrainingExercise(id)){showToast(tr('trainingUnavailable'));lessonView(id);return}
    current.learning=true;current.learningTechnique=id;current.learningPhase=phase;current.learningStatsClosed=false;current.learningMasteryMerged=false;
    current.coachModeOverride=phase===4?'minimal':'pedagogical';learningStatsStart(id,phase);
    trainingRender();historyInit(true);updateHistoryButtons();startTimer(true,0,false);saveCurrent();haptic(8)
  }finally{setBusy(false)}})
}
function learningHintWhy(h){return h?.why!=null?h.why:h.rank===3?rank3Why(h):h.rank===2?rank2Why(h):h.rank===1?rank1Why(h):h.why}
function learningMoveText(h){return gamePedagogy().learningMoveText(h)}
function learningApplyExpectedMove(actionType='LEARNING_GUIDED'){
  if(!current?.learning||!current.trainingTargetHint)return false;let h=current.trainingTargetHint,before=historySnapshotKey(),g=current.game;
  gamePedagogy(g).applyLearningMove(h);historyRecord({type:actionType,reasoning:structuredReasoning(g,h),primaryTarget:[h.r,h.c]},before);saveCurrent();return true
}
function learningRevealGuidedMove(){return learningApplyExpectedMove('LEARNING_GUIDED')}
function decorateLearningShell(){
  if(!current?.learning)return;let box=$('#learningGuide');if(!box)return;let h=current.trainingTargetHint,phase=current.learningPhase;
  box.hidden=false;
  if(phase===2){
    box.innerHTML=`<div class="learning-guide-head"><span>2/4</span><b>${tr('lessonGuided')} — ${techniqueTitle(current.learningTechnique)}</b></div>
      <p><b>${tr('lessonObserve')} :</b> ${coachLookText(current.game,[h.r,h.c],{reasoning:structuredReasoning(current.game,h)})}</p>
      <p><b>${tr('rulesTitle')} :</b> ${techniqueTitle(current.learningTechnique)}</p>
      <p><b>${tr('hintWhy')} :</b> ${learningHintWhy(h)}</p>
      <button class="btn primary" id="learningRevealBtn">${tr('lessonShowMove')}</button>`;
    let rb=$('#learningRevealBtn');if(rb)rb.onclick=learningRevealGuidedMove;clearHintFocus();focusHintContext(current.game,[h.r,h.c],{reasoning:structuredReasoning(current.game,h)})
  }else if(phase===3){
    box.innerHTML=`<div class="learning-guide-head"><span>3/4</span><b>${tr('lessonAssisted')} — ${techniqueTitle(current.learningTechnique)}</b></div>
      <p>${tr('lessonGoal')} : ${techniqueSummary(current.learningTechnique)}</p><p>${lessonMethodText(current.learningTechnique)}</p>`;
  }else{
    box.innerHTML=`<div class="learning-guide-head"><span>4/4</span><b>${tr('lessonIndependent')} — ${techniqueTitle(current.learningTechnique)}</b></div>
      <p>${tr('lessonGoal')} : ${techniqueSummary(current.learningTechnique)}</p><p>${lessonMethodText(current.learningTechnique)}</p>`;
  }
}
function finishLearningExercise(){
  if(!current?.learning||current.trainingCompleted)return false;current.trainingCompleted=true;
  let used=current.coachUsage?.techniques?.[current.learningTechnique],withCoach=!!(used&&(used.where||used.rule||used.why||used.reveal)),seconds=timerSeconds(),phase=current.learningPhase;
  if(phase===4&&!withCoach)masteryRecord(current.learningTechnique,'solo');
  stopTimer(false);elapsedBase=seconds;startedAt=0;paused=true;let valid=learningStatsFinish(current,seconds,withCoach);clearSaved();updatePauseButton();updateHistoryButtons();
  if(phase===4&&!valid){
    status(tr('lessonIndependentRetry'),false);
    showHintNotice(`<b>${tr('lessonIndependentRetry')}</b><div class="training-complete-actions"><button class="btn primary" onclick="launchLessonPhase('${current.learningTechnique}',4)">${tr('lessonStartIndependent')}</button><button class="btn" onclick="lessonView('${current.learningTechnique}')">${tr('lesson')}</button></div>`);
  }else{
    let complete=phase===4?tr('lessonComplete'):learningPhaseTitle(phase);
    status(`${complete} — ${fmt(seconds)}`,true);
    let next=phase===2?`<button class="btn primary" onclick="launchLessonPhase('${current.learningTechnique}',3)">${tr('lessonStartAssisted')}</button>`:
             phase===3?`<button class="btn primary" onclick="launchLessonPhase('${current.learningTechnique}',4)">${tr('lessonStartIndependent')}</button>`:
             `<button class="btn primary" onclick="learningView()">${tr('learn')}</button>`;
    showHintNotice(`<b>${complete}</b><br>${techniqueTitle(current.learningTechnique)}<div class="training-complete-actions">${next}<button class="btn" onclick="lessonView('${current.learningTechnique}')">${tr('lesson')}</button></div>`);haptic(18)
  }
  return true
}

// ===== v2.17.0 — targeted technique training =====
function trainingBucket(stats,id){
  if(!stats.training||typeof stats.training!=='object')stats.training={schema:1,byTechnique:{}};
  if(!stats.training.byTechnique)stats.training.byTechnique={};
  let b=stats.training.byTechnique[id]||(stats.training.byTechnique[id]={attempts:0,completed:0,withCoach:0,best:null});
  b.attempts=Math.max(0,Number(b.attempts)||0);b.completed=Math.max(0,Number(b.completed)||0);b.withCoach=Math.max(0,Number(b.withCoach)||0);b.best=b.best==null?null:Math.max(0,Number(b.best)||0);return b
}
function trainingStatsStart(id){if(current?.learning)return;let s=safeStats(),b=trainingBucket(s,id);b.attempts++;writeStats(s)}
function trainingStatsFinish(c,seconds){
  if(!c?.training||c.learning||c.trainingStatsClosed)return;
  let s=safeStats(),b=trainingBucket(s,c.trainingTechnique),used=c.coachUsage?.techniques?.[c.trainingTechnique],withCoach=!!(used&&(used.where||used.rule||used.why||used.reveal));
  b.completed++;if(withCoach)b.withCoach++;b.best=b.best==null?seconds:Math.min(b.best,seconds);
  if(c.masterySession&&!c.trainingMasteryMerged){masteryMergeIntoStats(s,c.masterySession);c.trainingMasteryMerged=true}
  c.trainingStatsClosed=true;writeStats(s)
}
function trainingRecommendedId(all=effectiveMasteryByTechnique(safeStats())){
  let ids=Object.keys(PEDAGOGY_TECHNIQUES),best=null,bestKey=Infinity;
  for(let id of ids){let m=masteryMetrics(all[id]),rank=PEDAGOGY_TECHNIQUES[id].rank,key=(m.samples<3?35:(m.score??50))-Math.min(5,m.errors)*4+rank*2;if(key<bestKey){bestKey=key;best=id}}
  return best||ids[0]
}
function trainingCard(id,all,stats,recommended){
  let x=PEDAGOGY_TECHNIQUES[id],m=masteryMetrics(all[id]),b=trainingBucket(stats,id),score=m.score==null?'—':`${m.score}%`,rec=id===recommended?`<span class="training-rec">★ ${tr('trainingRecommended')}</span>`:'';
  return `<article class="training-card ${id===recommended?'recommended':''}"><div class="training-card-head"><div><b>${techniqueTitle(id)}</b><code>${id}</code></div><strong>${score}</strong></div><small>R${x.rank} · ${tr(masteryLevel(m).key)}</small>${rec}<div class="training-card-stats"><span>${tr('trainingCompleted')} <b>${b.completed}</b></span><span>${tr('trainingAttempts')} <b>${b.attempts}</b></span></div><div class="training-card-actions"><button class="btn" data-learn-from-training="${id}">${tr('learn')}</button><button class="btn primary training-start" data-tech="${id}">${tr('trainTechnique')}</button></div></article>`
}
function trainingView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let s=safeStats(),all=effectiveMasteryByTechnique(s),recommended=trainingRecommendedId(all),games=GAME_IDS;
  let sections=games.map(g=>`<section class="training-game"><h2>${gameLabel(g)}</h2><div class="training-grid">${techniqueIdsForGame(g).map(id=>trainingCard(id,all,s,recommended)).join('')}</div></section>`).join('');
  app.innerHTML=`<section class="panel training-panel"><div class="stats-head"><div><h1>${tr('training')}</h1><p>${tr('trainingSub')}</p></div><button class="btn" id="trainingBack">${tr('back')}</button></div>${sections}</section>`;
  $('#trainingBack').onclick=home;app.querySelectorAll('[data-learn-from-training]').forEach(b=>b.onclick=()=>lessonView(b.dataset.learnFromTraining));app.querySelectorAll('[data-tech]').forEach(b=>b.onclick=()=>launchTraining(b.dataset.tech));app.querySelectorAll('button').forEach(pressFeedback)
}
function trainingDifficulty(id){let x=PEDAGOGY_TECHNIQUES[id];if(!x)return 'easy';return x.rank>=2?'hard':x.rank===1?'medium':'easy'}
function trainingSetQueenBase(g,diff){current={game:'queens',diff,n:g.n,reg:g.reg,sol:g.sol,difficultyProfile:g.difficultyProfile,generationStats:g.generationStats,state:Array.from({length:g.n},()=>Array(g.n).fill(0)),generated:true,unique:true,completed:false,training:true}}
function trainingSetTangoBase(g,diff,blank=true){let state=Array.from({length:6},()=>Array(6).fill(-1));if(!blank)for(let i of g.givens)state[Math.floor(i/6)][i%6]=g.sol[Math.floor(i/6)][i%6];current={game:'tango',diff,n:6,sol:g.sol,givens:new Set(blank?[]:g.givens),edges:blank?[]:g.edges,difficultyProfile:g.difficultyProfile,generationStats:g.generationStats,state,generated:true,unique:true,completed:false,training:true,tangoPendingCell:null}}
function trainingSetSudokuBase(g,diff){current={game:'sudoku',diff,n:6,sol:g.sol,empty:new Set(Array.from({length:36},(_,i)=>i)),difficultyProfile:g.difficultyProfile,generationStats:g.generationStats,state:Array.from({length:6},()=>Array(6).fill(0)),sel:null,generated:true,unique:true,completed:false,training:true}}
function trainingSetPatchBase(g,diff){const pal=['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1'];current={game:'patches',diff,n:g.n,reg:g.reg,ids:g.ids,cellsBy:g.cellsBy,clues:g.clues,difficultyProfile:g.difficultyProfile,generationStats:g.generationStats,pal,active:g.ids[0],paint:Array.from({length:g.n},()=>Array(g.n).fill(null)),patchSelectedRects:{},patchLogicEvidence:patchEmptyEvidence(),generated:true,unique:true,completed:false,training:true}}
function trainingSudokuDirectHint(id){
  if(!current||current.game!=='sudoku')return null;
  if(id==='S_NAKED_SINGLE'){
    for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.empty.has(r*6+c)&&current.state[r][c]===0){let cand=sudokuCandidatesAt(r,c);if(cand.length===1)return {r,c,v:cand[0],rank:0,technique:id,why:lang()==='fr'?`après élimination par la ligne, la colonne et le bloc 2×3, seul ${cand[0]} reste possible.`:`after elimination by the row, column and 2×3 box, only ${cand[0]} remains possible.`}}
    return null
  }
  let units=[];
  if(id==='S_HIDDEN_ROW')for(let r=0;r<6;r++)units.push({cells:Array.from({length:6},(_,c)=>[r,c]),nameFr:`la ligne ${r+1}`,nameEn:`row ${r+1}`});
  else if(id==='S_HIDDEN_COLUMN')for(let c=0;c<6;c++)units.push({cells:Array.from({length:6},(_,r)=>[r,c]),nameFr:`la colonne ${c+1}`,nameEn:`column ${c+1}`});
  else if(id==='S_HIDDEN_BOX')for(let br=0;br<6;br+=2)for(let bc=0;bc<6;bc+=3){let cells=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)cells.push([r,c]);units.push({cells,nameFr:`le bloc ${Math.floor(br/2)+1}-${Math.floor(bc/3)+1}`,nameEn:`the 2×3 box at rows ${br+1}-${br+2}, columns ${bc+1}-${bc+3}`})}
  for(let u of units)for(let v=1;v<=6;v++){let places=u.cells.filter(([r,c])=>current.state[r][c]===0&&sudokuCandidatesAt(r,c).includes(v));if(places.length===1){let [r,c]=places[0],cand=sudokuCandidatesAt(r,c);if(cand.length>1)return {r,c,v,rank:0,technique:id,why:lang()==='fr'?`${v} n’a qu’une seule position possible dans ${u.nameFr}.`:`${v} has only one possible position in ${u.nameEn}.`}}}
  return null
}
function trainingHintForId(id,deadline=WebPlatform.clock.nowMs()+1800){
  let x=PEDAGOGY_TECHNIQUES[id];if(!x||!current||current.game!==x.game)return null;let h=gamePedagogy(x.game).trainingHintForTechnique({id,rank:x.rank,deadline});
  if(!h||h.timeout||coachTechniqueId(x.game,h)!==id)return null;h.technique=id;return h
}
function trainingBuildQueensDirect(id,deadline){
  for(let attempt=0;attempt<5&&WebPlatform.clock.nowMs()<deadline;attempt++){
    let g=queenCandidate('medium');
    // Exclusions and unique-position exercises are constructed only from valid queen solution/regions; validation below uses visible state only.
    if(id==='Q_EXCLUSION_ROW'){
      for(let r=0;r<g.n;r++){trainingSetQueenBase(g,'medium');let q=g.sol[r],c=(q+2)%g.n;if(c===q)c=(c+1)%g.n;current.state[r][q]=2;let h=trainingHintForId(id,deadline);if(h)return h}
    }else if(id==='Q_EXCLUSION_COLUMN'){
      for(let r=0;r<g.n;r++){trainingSetQueenBase(g,'medium');let c=g.sol[r],rr=(r+2)%g.n;current.state[r][c]=2;let h=trainingHintForId(id,deadline);if(h)return h}
    }else if(id==='Q_EXCLUSION_REGION'){
      for(let r=0;r<g.n;r++){let q=[r,g.sol[r]],z=g.reg[q[0]][q[1]];for(let rr=0;rr<g.n;rr++)for(let cc=0;cc<g.n;cc++)if(g.reg[rr][cc]===z&&rr!==q[0]&&cc!==q[1]){trainingSetQueenBase(g,'medium');current.state[q[0]][q[1]]=2;let h=trainingHintForId(id,deadline);if(h)return h}}
    }else if(id==='Q_EXCLUSION_ADJACENCY'){
      for(let r=0;r<g.n;r++){let q=[r,g.sol[r]];for(let dr of [-1,1])for(let dc of [-1,1]){let rr=r+dr,cc=q[1]+dc;if(rr>=0&&rr<g.n&&cc>=0&&cc<g.n&&g.reg[rr][cc]!==g.reg[r][q[1]]){trainingSetQueenBase(g,'medium');current.state[r][q[1]]=2;let h=trainingHintForId(id,deadline);if(h)return h}}}
    }else if(id==='Q_UNIQUE_ROW'){
      for(let r=0;r<g.n;r++){trainingSetQueenBase(g,'medium');for(let c=0;c<g.n;c++)if(c!==g.sol[r])current.state[r][c]=1;let h=trainingHintForId(id,deadline);if(h)return h}
    }else if(id==='Q_UNIQUE_COLUMN'){
      for(let c=0;c<g.n;c++){let qr=g.sol.indexOf(c);if(qr<0)continue;trainingSetQueenBase(g,'medium');for(let r=0;r<g.n;r++)if(r!==qr)current.state[r][c]=1;let h=trainingHintForId(id,deadline);if(h)return h}
    }else if(id==='Q_UNIQUE_REGION'){
      for(let z of [...new Set(g.reg.flat())]){let q=null;for(let r=0;r<g.n;r++)if(g.reg[r][g.sol[r]]===z)q=[r,g.sol[r]];if(!q)continue;trainingSetQueenBase(g,'medium');for(let r=0;r<g.n;r++)for(let c=0;c<g.n;c++)if(g.reg[r][c]===z&&(r!==q[0]||c!==q[1]))current.state[r][c]=1;let h=trainingHintForId(id,deadline);if(h)return h}
    }
  }
  return null
}
function trainingBuildTangoDirect(id,deadline){
  for(let a=0;a<4&&WebPlatform.clock.nowMs()<deadline;a++){
    let g=tangoCandidate('easy');trainingSetTangoBase(g,'easy',true);
    if(id==='T_BALANCE_ROW'){
      for(let r=0;r<6;r++)for(let v=0;v<2;v++){let cells=[];for(let c=0;c<6;c++)if(g.sol[r][c]===v)cells.push(c);if(cells.length===3){current.state=Array.from({length:6},()=>Array(6).fill(-1));current.givens=new Set();for(let c of cells){current.state[r][c]=v;current.givens.add(r*6+c)}let h=trainingHintForId(id,deadline);if(h)return h}}
    }else if(id==='T_BALANCE_COLUMN'){
      for(let c=0;c<6;c++)for(let v=0;v<2;v++){let cells=[];for(let r=0;r<6;r++)if(g.sol[r][c]===v)cells.push(r);if(cells.length===3){current.state=Array.from({length:6},()=>Array(6).fill(-1));current.givens=new Set();for(let r of cells){current.state[r][c]=v;current.givens.add(r*6+c)}let h=trainingHintForId(id,deadline);if(h)return h}}
    }else if(id==='T_NO_THREE'){
      for(let r=0;r<6;r++)for(let c=0;c<4;c++){let v=[g.sol[r][c],g.sol[r][c+1],g.sol[r][c+2]];for(let k=0;k<3;k++){let others=[0,1,2].filter(x=>x!==k);if(v[others[0]]===v[others[1]]&&v[k]!==v[others[0]]){current.state=Array.from({length:6},()=>Array(6).fill(-1));current.givens=new Set();for(let j of others){current.state[r][c+j]=v[j];current.givens.add(r*6+c+j)}let h=trainingHintForId(id,deadline);if(h)return h}}}
    }else if(id==='T_RELATION_EQUAL'||id==='T_RELATION_OPPOSITE'){
      let rel=id==='T_RELATION_EQUAL'?'=':'×';
      for(let r=0;r<6;r++)for(let c=0;c<5;c++)if((g.sol[r][c]===g.sol[r][c+1])===(rel==='=')){current.state=Array.from({length:6},()=>Array(6).fill(-1));current.givens=new Set([r*6+c]);current.state[r][c]=g.sol[r][c];current.edges=[[r,c,'r',rel]];let h=trainingHintForId(id,deadline);if(h)return h}
    }
  }
  return null
}
function trainingBuildSudokuDirect(id,deadline){
  for(let a=0;a<4&&WebPlatform.clock.nowMs()<deadline;a++){
    let g=sudokuCandidate('medium');
    if(id==='S_NAKED_SINGLE'){
      for(let r=0;r<6;r++)for(let target=0;target<6;target++){trainingSetSudokuBase(g,'medium');current.empty=new Set();for(let rr=0;rr<6;rr++)for(let c=0;c<6;c++)if(rr!==r||c===target)current.empty.add(rr*6+c);current.state=Array.from({length:6},()=>Array(6).fill(0));for(let c=0;c<6;c++)if(c!==target)current.state[r][c]=g.sol[r][c];let h=trainingHintForId(id,deadline);if(h)return h}
    }else{
      for(let k=0;k<500&&WebPlatform.clock.nowMs()<deadline;k++){
        trainingSetSudokuBase(g,'medium');let holes=12+Math.floor(Math.random()*16),idx=shuffle(Array.from({length:36},(_,i)=>i)).slice(0,holes);current.empty=new Set(idx);current.state=g.sol.map((row,r)=>row.map((v,c)=>current.empty.has(r*6+c)?0:v));let h=trainingHintForId(id,deadline);if(h)return h
      }
    }
  }
  return null
}
function trainingBuildPatchDirect(id,deadline){
  for(let a=0;a<8&&WebPlatform.clock.nowMs()<deadline;a++){
    let g=patchesCandidate(id==='P_SINGLE_RECTANGLE'?'easy':'medium');trainingSetPatchBase(g,id==='P_SINGLE_RECTANGLE'?'easy':'medium');
    for(let k=0;k<100&&WebPlatform.clock.nowMs()<deadline;k++){
      current.paint=Array.from({length:g.n},()=>Array(g.n).fill(null));let p=id==='P_MANDATORY_CELL'?Math.random()*.42:Math.random()*.18;for(let r=0;r<g.n;r++)for(let c=0;c<g.n;c++)if(Math.random()<p)current.paint[r][c]=g.reg[r][c];let h=trainingHintForId(id,deadline);if(h)return h
    }
  }
  return null
}
function trainingRandomProgress(game,base,p){return gamePedagogy(game).trainingRandomProgress({base,p})}
const TRAINING_ADVANCED_FIXTURES={"Q_CONTRADICTION_R1":{"game":"queens","diff":"medium","n":7,"reg":[[2,2,2,0,0,0,0],[2,2,1,1,0,0,0],[2,2,2,1,1,1,0],[4,4,4,4,3,1,0],[4,4,4,4,4,1,0],[4,4,4,4,4,4,5],[6,4,4,4,4,4,4]],"sol":[5,3,1,4,2,6,0],"state":[[0,1,0,1,0,0,0],[0,0,0,2,0,0,1],[1,0,0,0,1,0,0],[0,0,0,0,0,0,0],[0,0,0,1,0,0,1],[0,1,0,1,0,0,2],[2,0,1,0,1,0,0]],"generated":true,"unique":true,"completed":false},"Q_CONTRADICTION_R2":{"game":"queens","diff":"hard","n":8,"reg":[[7,7,7,7,7,7,7,7],[6,7,7,5,5,7,7,5],[6,7,7,4,5,5,5,5],[6,6,7,4,4,4,5,3],[6,6,2,2,2,5,5,3],[6,6,6,2,2,2,2,2],[0,2,2,2,2,1,2,1],[0,0,2,2,2,1,1,1]],"sol":[2,0,6,4,7,3,5,1],"state":[[0,0,2,0,0,0,0,0],[2,1,1,1,0,0,0,0],[0,0,1,0,0,0,2,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0],[0,0,1,0,0,0,0,1],[0,0,1,1,1,0,0,0],[0,0,0,1,1,0,0,0]],"generated":true,"unique":true,"completed":false},"Q_CONTRADICTION_R3":{"game":"queens","diff":"hard","n":8,"reg":[[0,0,0,0,0,0,1,1],[2,0,0,3,0,1,1,1],[2,3,3,3,0,1,1,1],[2,3,3,3,3,3,1,1],[3,3,4,3,3,7,1,1],[3,4,4,4,7,7,7,5],[4,4,4,7,7,6,6,7],[4,4,7,7,7,7,7,7]],"sol":[1,6,0,4,2,7,5,3],"state":[[0,0,1,0,1,0,1,0],[0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],"generated":true,"unique":true,"completed":false},"T_CONTRADICTION_R1":{"game":"tango","diff":"medium","n":6,"sol":[[0,1,1,0,0,1],[0,1,1,0,1,0],[1,0,0,1,0,1],[1,0,1,1,0,0],[0,1,0,0,1,1],[1,0,0,1,1,0]],"givens":[3,4,7,8,21,22,31],"edges":[[2,1,"d","="],[1,1,"r","="],[4,0,"r","×"],[4,1,"r","×"],[1,0,"d","×"]],"state":[[-1,-1,-1,0,0,-1],[-1,1,1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,1,0,-1],[-1,-1,-1,-1,-1,-1],[-1,0,-1,-1,-1,-1]],"generated":true,"unique":true,"completed":false,"tangoPendingCell":null},"T_CONTRADICTION_R2":{"game":"tango","diff":"hard","n":6,"sol":[[0,1,0,1,1,0],[0,1,1,0,0,1],[1,0,1,1,0,0],[0,1,0,0,1,1],[1,0,0,1,0,1],[1,0,1,0,1,0]],"givens":[1,4,5,6,7,8,9,10,13,16,17,18,19,22,29,30,31,32,33,35],"edges":[[3,2,"r","="],[2,0,"d","×"],[0,1,"d","="],[1,3,"r","="],[3,3,"r","×"],[4,1,"r","="],[1,1,"r","="]],"state":[[-1,1,-1,-1,1,0],[0,1,1,0,0,-1],[-1,0,-1,-1,0,0],[0,1,-1,-1,1,-1],[-1,-1,-1,-1,-1,1],[1,0,1,0,-1,0]],"generated":true,"unique":true,"completed":false,"tangoPendingCell":null},"S_CONTRADICTION_R1":{"game":"sudoku","diff":"medium","n":6,"sol":[[6,2,1,5,4,3],[5,4,3,6,2,1],[2,1,5,4,3,6],[4,3,6,2,1,5],[1,5,4,3,6,2],[3,6,2,1,5,4]],"empty":[2,3,4,5,6,7,11,13,16,18,20,21,28,29,30,31,33],"state":[[6,2,0,0,0,0],[0,0,3,6,2,0],[2,0,5,4,0,6],[0,3,0,0,1,5],[1,5,4,3,0,0],[0,0,2,0,5,4]],"sel":null,"generated":true,"unique":true,"completed":false},"S_CONTRADICTION_R2":{"game":"sudoku","diff":"hard","n":6,"sol":[[2,3,4,1,5,6],[5,6,1,4,2,3],[6,4,5,2,3,1],[3,1,2,5,6,4],[4,2,6,3,1,5],[1,5,3,6,4,2]],"empty":[1,3,4,5,6,8,9,11,13,15,16,19,20,21,22,25,26,27,28,30,34,35],"state":[[2,0,4,0,0,0],[0,6,0,0,2,0],[6,0,5,0,0,1],[3,0,0,0,0,4],[4,0,0,0,0,5],[0,5,3,6,0,0]],"sel":null,"generated":true,"unique":true,"completed":false},"P_CONTRADICTION_R1":{"game":"patches","diff":"hard","n":7,"reg":[[9,9,9,9,9,9,9],[8,8,8,8,8,8,8],[5,5,5,5,5,6,7],[5,5,5,5,5,4,7],[3,3,3,3,3,3,3],[1,1,1,1,2,2,0],[1,1,1,1,2,2,0]],"ids":[0,1,2,3,4,5,6,7,8,9],"cellsBy":{"0":[[5,6],[6,6]],"1":[[5,0],[5,1],[5,2],[5,3],[6,0],[6,1],[6,2],[6,3]],"2":[[5,4],[5,5],[6,4],[6,5]],"3":[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6]],"4":[[3,5]],"5":[[2,0],[2,1],[2,2],[2,3],[2,4],[3,0],[3,1],[3,2],[3,3],[3,4]],"6":[[2,5]],"7":[[2,6],[3,6]],"8":[[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6]],"9":[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]]},"clues":{"0":{"pos":[6,6],"size":2,"shape":"vertical","mode":"size"},"1":{"pos":[5,3],"size":8,"shape":"horizontal","mode":"size"},"2":{"pos":[5,5],"size":4,"shape":"carré","mode":"shape"},"3":{"pos":[4,4],"size":7,"shape":"horizontal","mode":"shape"},"4":{"pos":[3,5],"size":1,"shape":"carré","mode":"size"},"5":{"pos":[2,0],"size":10,"shape":"horizontal","mode":"size"},"6":{"pos":[2,5],"size":1,"shape":"carré","mode":"none"},"7":{"pos":[2,6],"size":2,"shape":"vertical","mode":"size"},"8":{"pos":[1,2],"size":7,"shape":"horizontal","mode":"size"},"9":{"pos":[0,4],"size":7,"shape":"horizontal","mode":"none"}},"pal":["#f3c6a8","#b9d9c1","#c6d4ed","#e2c3df","#f0dc9d","#c7e0e3","#d5ceb8","#d4e3b4","#edbfc1","#c8c4e8","#e5d0a4","#b7d7d1"],"active":0,"paint":[[9,9,9,9,9,9,9],[8,8,8,8,8,8,8],[null,5,null,null,null,null,7],[5,5,null,null,null,4,7],[null,null,null,null,null,null,null],[null,null,1,null,null,null,null],[null,null,1,1,null,null,null]],"patchSelectedRects":{"4":{"r0":3,"r1":3,"c0":5,"c1":5},"7":{"r0":2,"r1":3,"c0":6,"c1":6},"8":{"r0":1,"r1":1,"c0":0,"c1":6},"9":{"r0":0,"r1":0,"c0":0,"c1":6}},"sol":null,"difficultyProfile":{"schema":1,"ratingVersion":1,"game":"patches","status":"solved","difficulty":"hard","minimumRequiredTier":2,"limitingTechniqueLevel":2,"limitingRules":["NO_SUPPORT_CELL"],"totalLogicalSteps":29,"deductionsByRule":{"CELL_LOCKED_TO_CLUE":3,"CELL_SINGLETON":5,"CLUE_SINGLETON":5,"COMMON_COVERAGE":3,"NO_SUPPORT_CELL":12,"RECTANGULAR_CLOSURE":1},"limitingTierStepCount":12,"initialAvailableMoves":26,"minAvailableMoves":3,"bottleneckCount":1,"maxProofDepth":18,"budgetHit":false,"structure":{"n":7,"clueCount":10,"clueModes":{"both":0,"size":6,"shape":2,"none":2}},"fingerprint":"qfp1-57b09c48a8125ee0bb0091b98f7a6520"},"generationStats":{"generatorVersion":1,"targetDifficulty":"hard","strategy":"certified-template-transform","sizeHeuristic":7,"rectangleRange":[10,12],"attempts":1,"randomAttempts":0,"templateAttempts":1,"rejected":{"structure":0,"uniqueness":0,"ratingMismatch":0,"budgetExhausted":0,"invalid":0},"fallbackUsed":false,"fingerprint":"qfp1-57b09c48a8125ee0bb0091b98f7a6520","minimumRequiredTier":2,"totalLogicalSteps":29,"n":7,"clueCount":10,"clueModes":{"both":0,"size":6,"shape":2,"none":2}},"generated":true,"unique":true,"completed":false},"P_CONTRADICTION_R2":{"game":"patches","diff":"hard","n":7,"reg":[[0,0,0,0,1,1,2],[0,0,0,0,1,1,2],[3,3,3,3,3,3,3],[4,4,4,4,4,5,7],[4,4,4,4,4,6,7],[8,8,8,8,8,8,8],[9,9,9,9,9,9,9]],"ids":[0,1,2,3,4,5,6,7,8,9],"cellsBy":{"0":[[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3]],"1":[[0,4],[0,5],[1,4],[1,5]],"2":[[0,6],[1,6]],"3":[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6]],"4":[[3,0],[3,1],[3,2],[3,3],[3,4],[4,0],[4,1],[4,2],[4,3],[4,4]],"5":[[3,5]],"6":[[4,5]],"7":[[3,6],[4,6]],"8":[[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6]],"9":[[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6]]},"clues":{"0":{"pos":[1,3],"size":8,"shape":"horizontal","mode":"size"},"1":{"pos":[1,5],"size":4,"shape":"carré","mode":"shape"},"2":{"pos":[0,6],"size":2,"shape":"vertical","mode":"size"},"3":{"pos":[2,4],"size":7,"shape":"horizontal","mode":"shape"},"4":{"pos":[4,0],"size":10,"shape":"horizontal","mode":"size"},"5":{"pos":[3,5],"size":1,"shape":"carré","mode":"size"},"6":{"pos":[4,5],"size":1,"shape":"carré","mode":"none"},"7":{"pos":[4,6],"size":2,"shape":"vertical","mode":"size"},"8":{"pos":[5,2],"size":7,"shape":"horizontal","mode":"size"},"9":{"pos":[6,4],"size":7,"shape":"horizontal","mode":"none"}},"pal":["#f3c6a8","#b9d9c1","#c6d4ed","#e2c3df","#f0dc9d","#c7e0e3","#d5ceb8","#d4e3b4","#edbfc1","#c8c4e8","#e5d0a4","#b7d7d1"],"active":0,"paint":[[null,null,null,0,null,null,null],[null,0,null,null,null,1,null],[null,null,null,null,3,null,null],[null,4,4,null,null,null,null],[null,4,null,null,4,null,7],[null,8,8,8,8,8,8],[null,9,9,9,null,9,9]],"generated":true,"unique":true,"completed":false}};
function trainingLoadAdvancedFixture(id,deadline){
  let raw=TRAINING_ADVANCED_FIXTURES[id];if(!raw)return null;let c=JSON.parse(JSON.stringify(raw));if(Array.isArray(c.givens))c.givens=new Set(c.givens);if(Array.isArray(c.empty))c.empty=new Set(c.empty);current=c;current.training=true;let h=trainingHintForId(id,deadline);if(!h){current=null;return null}return h
}
function trainingBuildAdvanced(id,deadline){
  let fixture=trainingLoadAdvancedFixture(id,deadline);if(fixture)return fixture;let x=PEDAGOGY_TECHNIQUES[id],diff=trainingDifficulty(id);
  for(let b=0;b<4&&WebPlatform.clock.nowMs()<deadline;b++){
    gamePedagogy(x.game).prepareTrainingBase(diff);
    let base=current;
    for(let k=0;k<90&&WebPlatform.clock.nowMs()<deadline;k++){
      let p=.12+Math.random()*.72;trainingRandomProgress(x.game,base,p);let h=trainingHintForId(id,deadline);if(h)return h
    }
  }
  return null
}
function buildTrainingExercise(id){
  let x=PEDAGOGY_TECHNIQUES[id];if(!x)return null;let deadline=WebPlatform.clock.nowMs()+5500,h=null;
  if(x.rank===0)h=gamePedagogy(x.game).buildDirectTraining(id,deadline);
  else h=trainingBuildAdvanced(id,deadline);
  if(!h)return null;
  current.training=true;current.trainingTechnique=id;current.trainingTargetHint={...h,technique:id};current.trainingCompleted=false;current.trainingOffPath=false;current.trainingStatsClosed=false;current.trainingMasteryMerged=false;current.coachUsage=null;current.masterySession=null;current.errorCoachUsage=null;current.lastError=null;current.hintFlow=null;current.lastReasoning=null;
  current.trainingStartSnapshot=puzzleSnapshot();return current
}
function trainingHintExpectedValue(h){return h?.id!=null?h.id:h?.v}
function trainingActionMatchesHint(h,action){if(!h||!action)return false;let expected=trainingHintExpectedValue(h);return (action.changes||[]).some(ch=>ch.row===h.r&&ch.column===h.c&&ch.to===expected)}
function trainingRender(){
  if(!current?.training)return;
  renderGameUi(current);
  decorateTrainingShell()
}
function decorateTrainingShell(){
  if(!current?.training)return;let d=$('#difficulty');if(d)d.disabled=true;let n=$('#newBtn');
  if(current.learning){
    if(n){n.textContent=tr('lesson');n.onclick=()=>lessonView(current.learningTechnique)}
  }else if(n){n.textContent=tr('newExercise');n.onclick=()=>launchTraining(current.trainingTechnique)}
  let r=$('#resetBtn');if(r)r.onclick=resetTrainingExercise;let c=$('#checkBtn');if(c)c.onclick=checkTrainingTarget;let sol=$('#solutionBtn');if(sol)sol.style.display='none';
  let hb=$('#hintBtn');if(hb&&current.learningPhase===2)hb.style.display='none';let eb=$('#exploreBtn');if(eb)eb.style.display='none';let wb=$('#walkthroughBtn');if(wb)wb.style.display='none';
  if(current.learning)decorateLearningShell()
}
function launchTraining(id){
  if(!PEDAGOGY_TECHNIQUES[id])return trainingView();if(current&&!current.completed)clearSaved();stopTimer();paused=false;setBusy(true);requestAnimationFrame(()=>{let ok=false;try{ok=!!buildTrainingExercise(id);if(!ok){showToast(tr('trainingUnavailable'));trainingView();return}trainingStatsStart(id);trainingRender();historyInit(true);updateHistoryButtons();startTimer(true,0,false);saveCurrent();haptic(8)}finally{setBusy(false)}})
}
function resetTrainingExercise(){
  if(!current?.training||!current.trainingStartSnapshot)return;paused=false;current.trainingCompleted=false;current.trainingOffPath=false;current.hintFlow=null;current.lastError=null;current.masteryPendingAid=null;restorePuzzleSnapshot(current.trainingStartSnapshot);historyInit(true);updateHistoryButtons();stopTimer(false);elapsedBase=0;startedAt=0;startTimer(true,0,false);decorateTrainingShell();saveCurrent();status('',true)
}
function trainingTargetStillCorrect(){let h=current?.trainingTargetHint;if(!h)return false;return gamePedagogy().trainingTargetStillCorrect(h)}
function checkTrainingTarget(){if(!current?.training)return;if(trainingTargetStillCorrect())return finishTrainingExercise();status(tr('trainingTryAgain'),false)}
function trainingMoveCompleted(action){
  if(!current?.training||current.trainingCompleted)return false;let h=current.trainingTargetHint;if(trainingActionMatchesHint(h,action)){if(action.type==='COACH_APPLY')current.trainingPendingComplete=true;else finishTrainingExercise();return true}current.trainingOffPath=true;status(tr('trainingTryAgain'),false);return false
}
function trainingSyncPath(){if(current?.training&&!current.trainingCompleted)current.trainingOffPath=current.moveHistory?.cursor!=='h0'}
function finishTrainingExercise(){
  if(current?.learning)return finishLearningExercise();
  if(!current?.training||current.trainingCompleted)return false;current.trainingCompleted=true;let used=current.coachUsage?.techniques?.[current.trainingTechnique],withCoach=!!(used&&(used.where||used.rule||used.why||used.reveal));if(!withCoach)masteryRecord(current.trainingTechnique,'solo');let seconds=timerSeconds();stopTimer(false);elapsedBase=seconds;startedAt=0;paused=true;trainingStatsFinish(current,seconds);clearSaved();updatePauseButton();updateHistoryButtons();status(`${tr('trainingComplete')} — ${fmt(seconds)}`,true);showHintNotice(`<b>${tr('trainingComplete')}</b><br>${techniqueTitle(current.trainingTechnique)}<div class="training-complete-actions"><button class="btn primary" onclick="launchTraining('${current.trainingTechnique}')">${tr('newExercise')}</button><button class="btn" onclick="trainingView()">${tr('training')}</button></div>`);haptic(18);return true
}
function trainingCoach(){
  if(!current?.training||paused&&current.trainingCompleted)return;if(showVisibleErrorsBeforeHint())return;if(current.trainingOffPath)return showToast(tr('trainingTryAgain'));let h=current.trainingTargetHint;if(!h)return showToast(tr('trainingUnavailable'));let g=current.game,p=gamePedagogy(g),move=p.trainingCoachText(h);
  let why=h.why!=null?h.why:h.rank===3?rank3Why(h):h.rank===2?rank2Why(h):h.rank===1?rank1Why(h):h.why,reasoning=structuredReasoning(g,h),reveal=p.trainingRevealLabel();
  hintStage(g,[h.r,h.c],{move,where:tr('trainingTarget')+` : ${techniqueTitle(current.trainingTechnique)}`,why,reveal,rank:h.rank||0,value:trainingHintExpectedValue(h),reasoning},()=>p.applyTrainingMove(h))
}

function coachActionFor(game,h){return gamePedagogy(game).coachAction(h)}
function coachTechniqueId(game,h){return PedagogyMetadata.techniqueIdForHint(game,h)}
function structuredReasoning(game,h){
  if(!h)return null;
  return {
    schema:1,
    source:'visible-state',
    game,
    technique:coachTechniqueId(game,h),
    rank:Math.max(0,Number(h.rank)||0),
    target:{row:h.r,column:h.c},
    action:coachActionFor(game,h),
    proof:{
      direct:h.why??null,
      hypothesis:h.hypothesis??null,
      consequence:h.consequence??null,
      secondStep:h.secondStep??null,
      deadend:h.deadend??null,
      conclusion:h.conclusion??null
    }
  }
}

// ===== v2.28 — specialized reasoning presenters =====
let reasoningPresenterCache=null;
function reasoningPresenters(){
  if(reasoningPresenterCache)return reasoningPresenterCache;
  let modules=[globalThis.QuadludQueensReasoningPresenter,globalThis.QuadludTangoReasoningPresenter,globalThis.QuadludSudokuReasoningPresenter,globalThis.QuadludPatchesReasoningPresenter];
  if(modules.some(x=>!x?.createPresenter||!x?.GAME))throw new Error('Reasoning presenter modules unavailable');
  let common={tr,lang,cellName,genericLocalizedHint,pieceName,isDetailedLanguage:code=>DETAILED_HINT_LANGS.has(code),zoneBadge:queenZoneBadge,unitCells:queenUnitCells},out={};
  for(let module of modules)out[module.GAME]=module.createPresenter(common);
  reasoningPresenterCache=Object.freeze(out);return reasoningPresenterCache
}
function reasoningPresenter(game){let p=reasoningPresenters()[game];if(!p)throw new Error(`Reasoning presenter unavailable: ${game}`);return p}
function queenReasoningPresenter(){return reasoningPresenter(globalThis.QuadludQueensReasoningPresenter.GAME)}
function tangoReasoningPresenter(){return reasoningPresenter(globalThis.QuadludTangoReasoningPresenter.GAME)}
function sudokuReasoningPresenter(){return reasoningPresenter(globalThis.QuadludSudokuReasoningPresenter.GAME)}
function patchesReasoningPresenter(){return reasoningPresenter(globalThis.QuadludPatchesReasoningPresenter.GAME)}

// ===== v2.21.18 — Grille 6 explicit proof engine adapter =====
function sudokuLogicAvailable(){return typeof SudokuLogic!=='undefined'&&SudokuLogic?.createSession}
function sudokuLogicBoard(c=current,state=null){return {state:cloneGrid(state||c.state)}}
function sudokuLogicSession(c=current,state=null){if(!sudokuLogicAvailable())throw new Error('Grille 6 inference engine unavailable');return SudokuLogic.createSession(sudokuLogicBoard(c,state))}
function sudokuFormat(key,vars={}){return String(tr(key)||key).replace(/\{([A-Za-z0-9_]+)\}/g,(_,k)=>vars[k]??'')}
function sudokuUnitHuman(ref){if(!ref)return '';let name=ref.family==='row'?`${tr('rowLabel')} ${Number(ref.id)+1}`:ref.family==='column'?`${tr('columnLabel')} ${Number(ref.id)+1}`:`${tr('slgBox')} ${Number(ref.id)+1}`;if(lang()!=='fr')return name;return ref.family==='row'?`la ${name}`:ref.family==='column'?`la ${name}`:`le ${name}`}
function sudokuUnitCells(ref){if(!ref)return [];if(ref.family==='row')return Array.from({length:6},(_,c)=>[Number(ref.id),c]);if(ref.family==='column')return Array.from({length:6},(_,r)=>[r,Number(ref.id)]);let br=Math.floor(Number(ref.id)/2)*2,bc=(Number(ref.id)%2)*3,out=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)out.push([r,c]);return out}
function sudokuCellListHuman(cells,limit=8){let names=(cells||[]).map(c=>cellName(...c));return names.length<=limit?names.join(', '):names.slice(0,limit).join(', ')+` (+${names.length-limit})`}
function sudokuCurrentValueStep(){let session=sudokuLogicSession();return {session,...session.nextValueStep()}}
function sudokuShowLogicalContradiction(w){current.hintFlow=null;clearHintFocus();let b=$('#sboard');if(b)for(let cell of w?.cells||[]){let el=b.children[cell[0]*6+cell[1]];if(el)el.classList.add('error-focus')}showHintNotice(`<b>⚠ ${tr('contradictionFound')}</b><br>${sudokuReasoningPresenter().contradictionText(w)}`);return true}

// ===== v2.21.10 — Queens explicit proof engine adapter =====
function queenLogicAvailable(){return typeof QueensLogic!=='undefined'&&QueensLogic?.createSession}
function queenLogicBoard(c=current,state=null){return {n:c.n,reg:cloneGrid(c.reg),state:cloneGrid(state||c.state)}}
function queenLogicSession(c=current,state=null){if(!queenLogicAvailable())throw new Error('Queens inference engine unavailable');return QueensLogic.createSession(queenLogicBoard(c,state))}
function queenUnitCells(ref,c=current){
  if(!ref||!c)return [];
  if(ref.family==='row')return Array.from({length:c.n},(_,col)=>[Number(ref.id),col]);
  if(ref.family==='column')return Array.from({length:c.n},(_,row)=>[row,Number(ref.id)]);
  let out=[];for(let r=0;r<c.n;r++)for(let col=0;col<c.n;col++)if(c.reg[r][col]===ref.id)out.push([r,col]);return out
}
function queenUnitHuman(ref){
  if(!ref)return '';
  if(ref.family==='row')return `${tr('rowLabel')} ${Number(ref.id)+1}`;
  if(ref.family==='column')return `${tr('columnLabel')} ${Number(ref.id)+1}`;
  return queenZoneBadge(Number(ref.id))
}
function queenFormat(key,vars={}){let text=String(tr(key)||key);return text.replace(/\{([A-Za-z0-9_]+)\}/g,(_,k)=>vars[k]??'')}
function queenUnitListHuman(units){return (units||[]).map(queenUnitHuman).join(tr('qlAnd'))}
function queenCellListHuman(cells,limit=8){let a=(cells||[]).map(x=>cellName(x[0],x[1]));if(a.length<=limit)return a.join(', ');return a.slice(0,limit).join(', ')+queenFormat('qlMore',{count:a.length-limit})}
function queenConflictReasonHuman(reasons){let r=reasons?.[0],key=r==='ROW'?'qlConflictRow':r==='COLUMN'?'qlConflictColumn':r==='REGION'?'qlConflictRegion':r==='ADJACENCY'?'qlConflictAdjacency':'qlConflictRule';return tr(key)}
function queenFocusDeduction(d,reveal=false){
  clearHintFocus();let board=$('#qboard')||document.querySelector('.board');if(!board||!current||!d)return;let n=current.n,ctx=queenReasoningPresenter().premiseCells(d,current),conclusions=(d.conclusions||[]).map(x=>x.cell),mark=(cell,cls)=>{let x=board.children[cell[0]*n+cell[1]];if(x)x.classList.add(cls)};
  for(let cell of ctx)mark(cell,'hint-context');if(reveal)for(let cell of conclusions)mark(cell,'hint-focus')
}
function queenApplyDeductionToCurrent(d){
  if(!d||!current||current.game!=='queens')return null;
  let engine=queenLogicSession(),applied=engine.applyDeduction(d);if(!applied?.deduction)return null;
  let changes=[...(applied.deduction.conclusions||[])];for(let a of applied.automatic||[])changes.push(...(a.conclusions||[]));
  for(let c of changes){let [r,col]=c.cell;if(current.state[r][col]===0)current.state[r][col]=c.value}
  return applied
}
function queenCurrentLogicResult(){let session=queenLogicSession();return {session,...session.nextDeduction()}}
function queenShowLogicalContradiction(w){
  current.hintFlow=null;clearHintFocus();let cells=w?.cells||w?.premises?.flatMap?.(p=>p.cell?[p.cell]:[])||[];let board=$('#qboard');if(board)for(let [r,c] of cells){let d=board.children[r*current.n+c];if(d)d.classList.add('error-focus')}
  showHintNotice(`<b>⚠ ${tr('contradictionFound')}</b><br>${queenReasoningPresenter().contradictionText(w)}`);return true
}
function queenCoachHandleDeduction(d){
  let presenter=queenReasoningPresenter(),boardKey=historySnapshotKey(),sig=d.id+'|'+d.rank,flow=current.hintFlow,isSame=flow?.kind==='queens-proof'&&flow.boardKey===boardKey&&flow.signature===sig,view=presenter.presentation(d);
  if(!isSame){current.hintFlow={kind:'queens-proof',boardKey,signature:sig,stage:1,deduction:JSON.parse(JSON.stringify(d))};coachUsage(1,view.technique);queenFocusDeduction(d,false);showHintNotice(`<span class="coach-progress">1/2</span><b>${tr('where')} :</b> ${view.explanation.where}`);saveCurrent();return}
  let proof=flow.deduction||d,before=historySnapshotKey();coachUsage(2,view.technique);coachUsage(3,view.technique);markHintUsed();updateScoreFlags();queenFocusDeduction(proof,true);let application=queenApplyDeductionToCurrent(proof);if(!application){current.hintFlow=null;showHintNotice(tr('hintError'));return}drawGameUi();let appliedView=presenter.presentation(application.deduction,application.automatic);historyRecord({type:'COACH_APPLY',reasoning:presenter.legacyReasoning(application.deduction,application.automatic),coachStage:2,coachFlowVersion:3},before);current.hintFlow=null;
  showHintNotice(`<span class="coach-progress">2/2</span><b>${appliedView.explanation.title}</b><br>${appliedView.explanation.why}`);maybeAutoFinish();saveCurrent();haptic(12)
}
// ===== v2.21.11 — Soleil/Lune explicit proof engine adapter =====
function tangoLogicAvailable(){return typeof TangoLogic!=='undefined'&&TangoLogic?.createSession}
function tangoLogicBoard(c=current,state=null,derived=null){return {n:c.n||6,state:cloneGrid(state||c.state),edges:JSON.parse(JSON.stringify(c.edges||[])),givens:c.givens||[],derivedRelations:JSON.parse(JSON.stringify(derived??c.tangoDerivedRelations??[]))}}
function tangoLogicSession(c=current,state=null,derived=null){if(!tangoLogicAvailable())throw new Error('Soleil/Lune inference engine unavailable');return TangoLogic.createSession(tangoLogicBoard(c,state,derived))}
function tangoUnitHuman(ref){if(!ref)return '';return `${tr(ref.family==='row'?'rowLabel':'columnLabel')} ${Number(ref.id)+1}`}
function tangoFormat(key,vars={}){return String(tr(key)||key).replace(/\{([A-Za-z0-9_]+)\}/g,(_,k)=>vars[k]??'')}
function tangoValueHuman(v){return pieceName('tango',Number(v))}
function tangoRelationHuman(p){return tr(Number(p)===0?'tlgSame':'tlgOpposite')}
function tangoFocusDeduction(d,reveal=false){clearHintFocus();let board=$('#tboard')||document.querySelector('.board');if(!board||!current||!d)return;let cells=[...(d.focusCells||[])];for(const r of d.focusRelations||[])cells.push(r.a,r.b);if(reveal)for(const c of d.conclusions||[])cells.push(...(c.type==='VALUE'?[c.cell]:[c.a,c.b]));let seen=new Set();for(const cell of cells){let k=cell.join(',');if(seen.has(k))continue;seen.add(k);let el=board.children[cell[0]*(current.n||6)+cell[1]];if(el)el.classList.add(reveal&&(d.conclusions||[]).some(c=>c.type==='VALUE'?c.cell[0]===cell[0]&&c.cell[1]===cell[1]:(c.a[0]===cell[0]&&c.a[1]===cell[1])||(c.b[0]===cell[0]&&c.b[1]===cell[1]))?'hint-focus':'hint-context')}}
function tangoApplyDeductionToCurrent(d){if(!d||!current||current.game!=='tango')return null;let engine=tangoLogicSession(),applied=engine.applyDeduction(d);if(!applied?.deduction)return null;current.state=cloneGrid(engine.state);current.tangoDerivedRelations=engine.exportDerivedRelations();return applied}
function tangoCurrentLogicResult(){let engine=tangoLogicSession(),result=engine.nextDeduction();return {...result,engine}}
function tangoCoachHandleDeduction(d){
  let presenter=tangoReasoningPresenter(),boardKey=historySnapshotKey(),sig=d.signature||d.id,flow=current.hintFlow,isSame=flow?.kind==='tango-proof'&&flow.boardKey===boardKey&&flow.signature===sig,view=presenter.presentation(d);
  if(!isSame){current.hintFlow={kind:'tango-proof',boardKey,signature:sig,stage:1,deduction:JSON.parse(JSON.stringify(d))};coachUsage(1,view.technique);tangoFocusDeduction(d,false);showHintNotice(`<span class="coach-progress">1/2</span><b>${tr('where')} :</b> ${view.explanation.where}`);saveCurrent();return}
  let proof=flow.deduction||d,before=historySnapshotKey();coachUsage(2,view.technique);coachUsage(3,view.technique);markHintUsed();updateScoreFlags();tangoFocusDeduction(proof,true);let application=tangoApplyDeductionToCurrent(proof);if(!application){current.hintFlow=null;showHintNotice(tr('hintError'));return}drawGameUi();let appliedView=presenter.presentation(application.deduction,application.automatic);historyRecord({type:'COACH_APPLY',reasoning:presenter.legacyReasoning(application.deduction,application.automatic),coachStage:2,coachFlowVersion:3},before);current.hintFlow=null;showHintNotice(`<span class="coach-progress">2/2</span><b>${appliedView.explanation.title}</b><br>${appliedView.explanation.why}`);maybeAutoFinish();saveCurrent();haptic(12)
}

// ===== v2.21.12 — Rectangles explicit proof engine adapter =====
function patchesLogicAvailable(){return typeof globalThis!=='undefined'&&globalThis.PatchesLogic&&typeof globalThis.PatchesLogic.createSession==='function'}
function patchEmptyEvidence(){return {schema:1,owners:[],notOwners:[],selected:[],eliminated:[]}}
function patchesLogicSession(c=current,paint=null,selectedRects=null,logicEvidence=null){if(!patchesLogicAvailable()||!c||c.game!=='patches')throw new Error('Rectangles logic engine unavailable');return PatchesLogic.createSession({n:c.n,ids:[...(c.ids||[])],clues:JSON.parse(JSON.stringify(c.clues||{})),paint:cloneGrid(paint||c.paint),selectedRects:JSON.parse(JSON.stringify(selectedRects||c.patchSelectedRects||{})),logicEvidence:JSON.parse(JSON.stringify(logicEvidence||c.patchLogicEvidence||patchEmptyEvidence()))})}
function patchFormat(k,vars={}){return String(tr(k)).replace(/\{(\w+)\}/g,(_,x)=>vars[x]??'')}
function patchZoneName(id){return `${tr('zone')} ${Number(id)+1}`}
function patchZonesName(ids){return (ids||[]).map(patchZoneName).join(lang()==='fr'?' et ':' and ')}
function patchVisibleActionForDeduction(d,c=current){if(!d||!c)return null;let owner=(d.conclusions||[]).find(x=>x.type==='OWNER'&&c.paint?.[x.cell?.[0]]?.[x.cell?.[1]]!==x.clue);if(owner)return {r:owner.cell[0],c:owner.cell[1],id:owner.clue};let selected=(d.conclusions||[]).find(x=>x.type==='SELECTED_RECT');if(!selected)return null;let id=selected.clue,cells=selected.rectangle?.cells||PatchesLogic.helpers.rectCells(selected.rectangle||{}),cell=cells.find(x=>c.paint?.[x[0]]?.[x[1]]!==id)||cells[0];return cell?{r:cell[0],c:cell[1],id}:null}
function patchVisibleHintFromEngine(expectedTechnique=null){if(!current||current.game!=='patches'||!patchesLogicAvailable())return null;let engine,result;try{engine=patchesLogicSession();result=engine.nextDeduction()}catch(_){return null}let d=result?.deduction;if(!d)return null;let presenter=patchesReasoningPresenter(),technique=presenter.techniqueForDeduction(d);if(!technique||(expectedTechnique&&technique!==expectedTechnique))return null;let target=patchVisibleActionForDeduction(d,current);if(!target)return null;return {...target,rank:d.rank,technique,why:presenter.explanation(d),structuredDeduction:JSON.parse(JSON.stringify(d)),reasoning:presenter.legacyReasoning(d)}}
function patchTrainingHintFromEngine(expectedTechnique=null){
  let direct=patchVisibleHintFromEngine(expectedTechnique);if(direct)return direct;
  if(expectedTechnique!=='P_CONTRADICTION_R1'||!current||!patchesLogicAvailable())return null;
  let engine;try{engine=patchesLogicSession(current,current.paint,current.patchSelectedRects,patchEmptyEvidence())}catch(_){return null}
  let presenter=patchesReasoningPresenter(),proofChain=[],first=null,actionDeduction=null,target=null;
  for(let guard=0;guard<12&&!target;guard++){
    let result;try{result=engine.nextDeduction()}catch(_){return null}let d=result?.deduction;if(!d)return null;let technique=presenter.techniqueForDeduction(d);
    if(!first){if(technique!==expectedTechnique)return null;first=JSON.parse(JSON.stringify(d))}
    let snapshot=JSON.parse(JSON.stringify(d));proofChain.push(snapshot);target=patchVisibleActionForDeduction(d,current);if(target){actionDeduction=snapshot;break}
    if(technique!==expectedTechnique)return null;
    let applied;try{applied=engine.applyDeduction(d)}catch(_){return null}if(!applied?.deduction||applied.contradiction)return null;
    for(const automatic of applied.automatic||[]){let a=JSON.parse(JSON.stringify(automatic));proofChain.push(a);let action=patchVisibleActionForDeduction(automatic,current);if(action){target=action;actionDeduction=a;break}}
  }
  if(!first||!target||!actionDeduction)return null;
  let why=proofChain.map(d=>presenter.explanation(d)).filter(Boolean).map(x=>`<span class="reason-step">${x}</span>`).join('');
  return {r:target.r,c:target.c,id:target.id,rank:first.rank,technique:expectedTechnique,why,structuredDeduction:first,finalStructuredDeduction:actionDeduction,proofChain,reasoning:presenter.legacyReasoning(first)}
}
function patchRectHuman(r){if(!r)return '';let h=r.r1-r.r0+1,w=r.c1-r.c0+1;return `${h}×${w} · ${cellName(r.r0,r.c0)}–${cellName(r.r1,r.c1)}`}
function patchFocusDeduction(d,reveal=false){clearHintFocus();let board=$('#pboard')||document.querySelector('.board');if(!board||!current||!d)return;let focus=[...(d.focusCells||[])],targets=[];for(const c of d.conclusions||[]){if(c.type==='OWNER')targets.push(c.cell);else if(c.type==='SELECTED_RECT')targets.push(...(c.rectangle.cells||[]));else if(c.type==='ELIMINATED_CANDIDATE'){let rr=(d.focusRectangles||[]).find(x=>(x.key||PatchesLogic.helpers.rectKey(x))===c.rectangleKey);if(rr)targets.push(...(rr.cells||PatchesLogic.helpers.rectCells(rr)))}}let targetKeys=new Set(targets.map(x=>x.join(','))),seen=new Set();for(const cell of focus.concat(reveal?targets:[])){let k=cell.join(',');if(seen.has(k))continue;seen.add(k);let el=board.children[cell[0]*current.n+cell[1]];if(el)el.classList.add(reveal&&targetKeys.has(k)?'hint-focus':'hint-context')}}
function patchSyncEngineToVisible(c,engine){c.patchLogicEvidence=engine.exportEvidence();c.patchSelectedRects=c.patchSelectedRects||{};for(const f of c.patchLogicEvidence.owners||[])c.paint[f.cell[0]][f.cell[1]]=f.clue;for(const f of c.patchLogicEvidence.selected||[]){let cand=engine.candidate(Number(f.clue),f.rectangleKey);if(!cand)continue;c.patchSelectedRects[f.clue]={r0:cand.r0,r1:cand.r1,c0:cand.c0,c1:cand.c1};for(const [r,col] of cand.cells)c.paint[r][col]=Number(f.clue)}}
function patchSyncEngineEvidence(c,engine){c.patchLogicEvidence=engine.exportEvidence()}
function patchApplyDeductionToState(c,d,engine=null){engine=engine||patchesLogicSession(c);let applied=engine.applyDeduction(d);if(!applied?.deduction)return null;patchSyncEngineToVisible(c,engine);return {...applied,engine}}
function patchApplyDeductionToCurrent(d){if(!current||current.game!=='patches')return null;return patchApplyDeductionToState(current,d)}
function patchCurrentLogicResult(){let engine=patchesLogicSession(),result=engine.nextDeduction();return {...result,engine}}
function patchCoachHandleDeduction(d){
  let presenter=patchesReasoningPresenter(),boardKey=historySnapshotKey(),sig=d.signature||d.id,flow=current.hintFlow,isSame=flow?.kind==='patches-proof'&&flow.boardKey===boardKey&&flow.signature===sig,view=presenter.presentation(d);
  if(!isSame){current.hintFlow={kind:'patches-proof',boardKey,signature:sig,stage:1,deduction:JSON.parse(JSON.stringify(d))};coachUsage(1,view.technique);patchFocusDeduction(d,false);showHintNotice(`<span class="coach-progress">1/2</span><b>${tr('where')} :</b> ${view.explanation.where}`);saveCurrent();return}
  let proof=flow.deduction||d,before=historySnapshotKey();coachUsage(2,view.technique);coachUsage(3,view.technique);markHintUsed();updateScoreFlags();patchFocusDeduction(proof,true);let application=patchApplyDeductionToCurrent(proof);if(!application){current.hintFlow=null;showHintNotice(tr('hintError'));return}drawGameUi();let appliedView=presenter.presentation(application.deduction,application.automatic);historyRecord({type:'COACH_APPLY',reasoning:presenter.legacyReasoning(application.deduction,application.automatic),coachStage:2,coachFlowVersion:4},before);current.hintFlow=null;showHintNotice(`<span class="coach-progress">2/2</span><b>${appliedView.explanation.title}</b><br>${appliedView.explanation.why}`);maybeAutoFinish();saveCurrent();haptic(12)
}

function cloneGrid(x){return SessionCore.cloneGrid(x)}
function puzzleSnapshot(){return SessionHistory.puzzleSnapshot(current)}
function historySnapshotKey(s=puzzleSnapshot()){return SessionCore.snapshotKey(s)}
function historyInit(force=false){return SessionHistory.ensureHistory(current,force)}
function historyNode(){return SessionHistory.historyNode(current)}
function historyCanUndo(){return SessionHistory.canUndo(current)}
function historyRedoTarget(){return SessionHistory.redoTarget(current)}
function historyCanRedo(){return SessionHistory.canRedo(current)}

// ===== v2.19.1 — classify legal moves as justified deductions or hypotheses =====
function reasoningAuditBucket(){
  if(!current)return null;
  return current.reasoningAudit||(current.reasoningAudit={justified:0,unjustified:0,hypotheses:0,unknown:0})
}
function auditPrimaryChange(action){
  if(!action||!Array.isArray(action.changes))return null;
  let t=action.primaryTarget||action.target;
  if(Array.isArray(t))return action.changes.find(x=>x.row===t[0]&&x.column===t[1])||null;
  if(t&&Number.isInteger(t.row))return action.changes.find(x=>x.row===t.row&&x.column===t.column)||null;
  return action.changes.length===1?action.changes[0]:null
}
function auditNeutralValue(game){return gamePedagogy(game).auditNeutralValue()}
function auditConstructiveChange(action){
  let ch=auditPrimaryChange(action),neutral=auditNeutralValue(current?.game);
  if(!ch||ch.from!==neutral)return null;
  if(!gamePedagogy().auditConstructiveValue(ch.to))return null;
  return ch
}
function withAuditSnapshot(beforeKey,fn){
  if(!current||!beforeKey)return null;let s;try{s=JSON.parse(beforeKey)}catch(_){return null}
  if(!s||s.game!==current.game)return null;
  let snap=current,clone={...current};
  if(s.state)clone.state=cloneGrid(s.state);if(s.paint)clone.paint=cloneGrid(s.paint);if('patchSelectedRects' in s)clone.patchSelectedRects=JSON.parse(JSON.stringify(s.patchSelectedRects||{}));if('patchLogicEvidence' in s)clone.patchLogicEvidence=JSON.parse(JSON.stringify(s.patchLogicEvidence||patchEmptyEvidence()));
  if('tangoPendingCell' in s)clone.tangoPendingCell=s.tangoPendingCell?[...s.tangoPendingCell]:null;if('tangoDerivedRelations' in s)clone.tangoDerivedRelations=JSON.parse(JSON.stringify(s.tangoDerivedRelations||[]));
  current=clone;try{return fn(clone)}finally{current=snap}
}
function proofResult(status,technique=null,rank=null,target=null,detail=null){
  return {schema:1,status,source:'visible-state',technique,rank,target,detail,at:WebPlatform.clock.nowMs()}
}
function queenDirectPlacementAt(r,c){
  if(current.state[r][c]!==0||!queenCellAllowed(r,c))return null;let n=current.n;
  if(!current.state[r].some(v=>v===2)){let a=[];for(let cc=0;cc<n;cc++)if(current.state[r][cc]===0&&queenCellAllowed(r,cc))a.push([r,cc]);if(a.length===1&&a[0][1]===c)return 'Q_UNIQUE_ROW'}
  let has=false,a=[];for(let rr=0;rr<n;rr++){if(current.state[rr][c]===2)has=true;else if(current.state[rr][c]===0&&queenCellAllowed(rr,c))a.push([rr,c])}
  if(!has&&a.length===1&&a[0][0]===r)return 'Q_UNIQUE_COLUMN';
  let id=current.reg[r][c];has=false;a=[];for(let rr=0;rr<n;rr++)for(let cc=0;cc<n;cc++)if(current.reg[rr][cc]===id){if(current.state[rr][cc]===2)has=true;else if(current.state[rr][cc]===0&&queenCellAllowed(rr,cc))a.push([rr,cc])}
  if(!has&&a.length===1&&a[0][0]===r&&a[0][1]===c)return 'Q_UNIQUE_REGION';
  return null
}
function justifyQueenAt(r,c,v,deadline){
  if(v===1){let q=queenDirectExclusionReason(r,c);if(q)return proofResult('justified',q.technique,0,[r,c],q.text)}
  if(v===2){let t=queenDirectPlacementAt(r,c);if(t)return proofResult('justified',t,0,[r,c],techniqueTitle(t))}
  let opp=v===2?1:2;
  let chosenBad=withTempCurrent(x=>{x.state[r][c]=v},()=>queenStateContradiction()),oppBad=withTempCurrent(x=>{x.state[r][c]=opp},()=>queenStateContradiction());
  if(!chosenBad&&oppBad)return proofResult('justified','Q_CONTRADICTION_R1',1,[r,c],null);
  if(WebPlatform.clock.nowMs()>=deadline)return proofResult('unknown',null,null,[r,c],'timeout');
  let opp2=withTempCurrent(x=>{x.state[r][c]=opp},()=>queenBoundedContradiction(1,deadline));if(opp2?.timeout)return proofResult('unknown',null,null,[r,c],'timeout');
  let chosen2=withTempCurrent(x=>{x.state[r][c]=v},()=>queenBoundedContradiction(1,deadline));if(chosen2?.timeout)return proofResult('unknown',null,null,[r,c],'timeout');
  if(opp2?.bad&&!chosen2?.bad)return proofResult('justified','Q_CONTRADICTION_R2',2,[r,c],null);
  if(WebPlatform.clock.nowMs()>=deadline)return proofResult('unknown',null,null,[r,c],'timeout');
  let opp3=withTempCurrent(x=>{x.state[r][c]=opp},()=>queenBoundedContradiction(2,deadline));if(opp3?.timeout)return proofResult('unknown',null,null,[r,c],'timeout');
  let chosen3=withTempCurrent(x=>{x.state[r][c]=v},()=>queenBoundedContradiction(2,deadline));if(chosen3?.timeout)return proofResult('unknown',null,null,[r,c],'timeout');
  if(opp3?.bad&&!chosen3?.bad)return proofResult('justified','Q_CONTRADICTION_R3',3,[r,c],null);
  return proofResult('unjustified',null,null,[r,c],null)
}
function tangoDirectTechniqueAt(r,c,v){
  let s=current.state,n=6;
  let rowOpp=s[r].filter(x=>x===1-v).length;if(rowOpp===3)return 'T_BALANCE_ROW';
  let colOpp=0;for(let rr=0;rr<n;rr++)if(s[rr][c]===1-v)colOpp++;if(colOpp===3)return 'T_BALANCE_COLUMN';
  for(let i=Math.max(0,c-2);i<=Math.min(c,3);i++){let vals=[i,i+1,i+2].filter(cc=>cc!==c).map(cc=>s[r][cc]);if(vals.length===2&&vals[0]===1-v&&vals[1]===1-v)return 'T_NO_THREE'}
  for(let i=Math.max(0,r-2);i<=Math.min(r,3);i++){let vals=[i,i+1,i+2].filter(rr=>rr!==r).map(rr=>s[rr][c]);if(vals.length===2&&vals[0]===1-v&&vals[1]===1-v)return 'T_NO_THREE'}
  for(let [er,ec,d,rel] of current.edges){let r2=d==='r'?er:er+1,c2=d==='r'?ec+1:ec;if(!((er===r&&ec===c)||(r2===r&&c2===c)))continue;let or=er===r&&ec===c?r2:er,oc=er===r&&ec===c?c2:ec,other=s[or][oc];if(other===-1)continue;let need=rel==='='?other:1-other;if(v===need)return rel==='='?'T_RELATION_EQUAL':'T_RELATION_OPPOSITE'}
  return null
}
function justifyTangoAt(r,c,v){
  let t=tangoDirectTechniqueAt(r,c,v);if(t)return proofResult('justified',t,0,[r,c],techniqueTitle(t));
  let opp=1-v,chosenBad=withTempCurrent(x=>{x.state[r][c]=v},()=>tangoStateContradiction()),oppBad=withTempCurrent(x=>{x.state[r][c]=opp},()=>tangoStateContradiction());
  if(!chosenBad&&oppBad)return proofResult('justified','T_CONTRADICTION_R1',1,[r,c],null);
  let opp2=withTempCurrent(x=>{x.state[r][c]=opp},()=>tangoRank2WitnessAfterAssumption()),chosen2=withTempCurrent(x=>{x.state[r][c]=v},()=>tangoRank2WitnessAfterAssumption());
  if(opp2&&!chosen2)return proofResult('justified','T_CONTRADICTION_R2',2,[r,c],null);
  return proofResult('unjustified',null,null,[r,c],null)
}
function sudokuDirectTechniqueAt(r,c,v){
  let cand=sudokuCandidatesAt(r,c);if(cand.length===1&&cand[0]===v)return 'S_NAKED_SINGLE';
  let units=[
    ['S_HIDDEN_ROW',Array.from({length:6},(_,cc)=>[r,cc])],
    ['S_HIDDEN_COLUMN',Array.from({length:6},(_,rr)=>[rr,c])]
  ],br=Math.floor(r/2)*2,bc=Math.floor(c/3)*3,box=[];for(let rr=br;rr<br+2;rr++)for(let cc=bc;cc<bc+3;cc++)box.push([rr,cc]);units.push(['S_HIDDEN_BOX',box]);
  for(let [id,cells] of units){let places=cells.filter(([rr,cc])=>current.state[rr][cc]===0&&current.empty.has(rr*6+cc)&&sudokuCandidatesAt(rr,cc).includes(v));if(places.length===1&&places[0][0]===r&&places[0][1]===c)return id}
  return null
}
function justifySudokuAt(r,c,v){
  if(!sudokuLogicAvailable())return proofResult('unknown',null,null,[r,c],{logicalStatus:'engine-unavailable'});
  let p=sudokuLogicSession().proveValue([r,c],v),d=p.deduction||null,presenter=sudokuReasoningPresenter(),view=p.status==='proven'&&d?presenter.presentProof(p,current.state):null,reasoning=d?presenter.legacyProofReasoning(p):null,detail={logicalStatus:p.status,reason:p.reason||null,provenValue:p.provenValue??null,fact:p.fact?JSON.parse(JSON.stringify(p.fact)):null,contradiction:p.contradiction?JSON.parse(JSON.stringify(p.contradiction)):null,deduction:reasoning,metrics:p.metrics?JSON.parse(JSON.stringify(p.metrics)):null};
  if(p.status==='proven'){let x=proofResult('justified',view?.technique??null,view?.metadata?.coachRank??0,[r,c],detail);x.logicalStatus='proven';return x}
  let outer=p.status==='contradictory'?'unknown':'unjustified',x=proofResult(outer,d?presenter.techniqueForDeduction(d):null,d?presenter.coachRank(d):null,[r,c],detail);x.logicalStatus=p.status;return x
}

function justifyPatchCellAt(r,c,id){
  if(!patchesLogicAvailable())return proofResult('unknown',null,null,[r,c],'engine-unavailable');
  let p=patchesLogicSession().proveOwner([r,c],Number(id));
  if(p.status==='proven'){let d=p.deduction||null,presenter=patchesReasoningPresenter(),view=d?presenter.presentation(d):null,x=proofResult('justified',view?.technique??null,view?.rank??p.fact?.rank??0,[r,c],{logicalStatus:'proven',deduction:d?presenter.legacyReasoning(d):null});x.logicalStatus='proven';return x}
  let x=proofResult('unjustified',null,null,[r,c],{logicalStatus:p.status,contradiction:p.contradiction||null});x.logicalStatus=p.status;return x
}
function patchRectangleJustification(action){
  if(action.type!=='PATCH_RECTANGLE'||action.region==null||!action.rectangle)return null;
  if(!patchesLogicAvailable())return proofResult('unknown',null,null,null,'engine-unavailable');
  let id=Number(action.region),p=patchesLogicSession().proveRectangle(id,action.rectangle),target=PatchesLogic.helpers.rectCells(action.rectangle);
  if(p.status==='proven'){let d=p.deduction||null,presenter=patchesReasoningPresenter(),view=d?presenter.presentation(d):null,x=proofResult('justified',view?.technique??null,view?.rank??p.fact?.rank??0,target,{logicalStatus:'proven',deduction:d?presenter.legacyReasoning(d):null});x.logicalStatus='proven';return x}
  let x=proofResult('unjustified',null,null,target,{logicalStatus:p.status,contradiction:p.contradiction||null});x.logicalStatus=p.status;return x
}
function firstKnownLogicalMoveFromSnapshot(beforeKey,deadline=WebPlatform.clock.nowMs()+250){
  return withAuditSnapshot(beforeKey,()=>gamePedagogy().firstKnownLogicalMove({deadline}))
}
function evaluateMoveJustification(beforeKey,action,error=null){
  if(!current||current.training||error||!action||['COACH_APPLY','AUTO_CROSS_ENABLE','PATCH_REMOVE','LEARNING_GUIDED'].includes(action.type))return null;
  let ch=auditConstructiveChange(action);if(!ch&&action.type!=='PATCH_RECTANGLE')return null;let deadline=WebPlatform.clock.nowMs()+350;
  let result=withAuditSnapshot(beforeKey,()=>gamePedagogy().justifyMove({change:ch,action,beforeKey,deadline}));
  if(result?.status==='unjustified')result.knownMove=firstKnownLogicalMoveFromSnapshot(beforeKey,deadline);
  return result
}
function auditMoveText(reasoning){
  if(!reasoning?.target)return '';
  let r=reasoning.target.row,c=reasoning.target.column,v=reasoning.action?.value,g=reasoning.game;
  return gamePedagogy(g).auditMoveText(reasoning)||cellName(r,c)
}
function applyAuditResult(node,result){
  if(!current||!node)return;
  node.justification=result?{...result}:null;current.lastMoveAudit=node.justification?{...node.justification,historyNode:node.id,parentNode:node.parent}:null;
  let b=reasoningAuditBucket();if(result?.status==='justified')b.justified++;else if(result?.status==='unjustified')b.unjustified++;else if(result?.status==='unknown')b.unknown++;
  refreshReasoningAudit()
}
function syncReasoningAuditFromHistory(){
  let n=historyNode();current.lastMoveAudit=n?.justification?{...n.justification,historyNode:n.id,parentNode:n.parent}:null;refreshReasoningAudit()
}
function auditTargetCells(node){
  let t=node?.justification?.target;
  if(Array.isArray(t)&&Number.isInteger(t[0])&&Number.isInteger(t[1]))return [[t[0],t[1]]];
  if(Array.isArray(t)&&Array.isArray(t[0]))return t.filter(x=>Array.isArray(x)&&Number.isInteger(x[0])&&Number.isInteger(x[1]));
  let a=node?.action||{},p=a.primaryTarget||a.target;
  if(Array.isArray(p)&&Number.isInteger(p[0])&&Number.isInteger(p[1]))return [[p[0],p[1]]];
  if(p&&Number.isInteger(p.row)&&Number.isInteger(p.column))return [[p.row,p.column]];
  return []
}
function unjustifiedCellsOnCurrentPath(){
  let h=current?.moveHistory,n=h?.nodes?.[h?.cursor],seen=new Set(),out=[],guard=0;
  while(n&&guard++<10000){
    let status=n.justification?.status,targets=auditTargetCells(n);
    if(['unjustified','hypothesis'].includes(status))for(let [r,c] of targets){let k=keyCell(r,c);if(!seen.has(k))out.push([r,c])}
    for(let ch of n.action?.changes||[])if(Number.isInteger(ch.row)&&Number.isInteger(ch.column))seen.add(keyCell(ch.row,ch.column));
    n=n.parent?h.nodes[n.parent]:null
  }
  return out
}
function applyUnjustifiedHighlights(){
  let board=document.querySelector('.board');if(!board||!current)return;
  [...board.children].forEach(d=>d.classList.remove('unjustified-piece'));
  // A completed Rectangles board must remain visually clean: move-audit warnings
  // are useful while solving, but must not leave orange/red cell outlines after victory.
  if(gamePedagogy().suppressUnjustifiedAfterComplete(current))return;
  if(!unjustifiedAlertsEnabled())return;
  let n=current.n||6;for(let [r,c] of unjustifiedCellsOnCurrentPath()){let d=board.children[r*n+c];if(d)d.classList.add('unjustified-piece')}
}
function refreshReasoningAudit(){
  let box=$('#reasoningAudit');if(box){box.hidden=true;box.innerHTML=''}
  applyUnjustifiedHighlights()
}
function acceptLastMoveAsHypothesis(){
  let h=current?.moveHistory,a=current?.lastMoveAudit;if(!h||!a?.historyNode)return false;let n=h.nodes[a.historyNode];if(!n?.justification||n.justification.status!=='unjustified')return false;if(!gamePedagogy().canAcceptHypothesis(n.justification))return false;
  n.justification.status='hypothesis';n.justification.acceptedAt=WebPlatform.clock.nowMs();let b=reasoningAuditBucket();b.hypotheses++;current.lastMoveAudit={...n.justification,historyNode:n.id,parentNode:n.parent};refreshReasoningAudit();saveCurrent();showToast(tr('hypothesisAccepted'));return true
}


// ===== v2.20.0 — visual Exploration mode on top of branching history =====
function explorationState(){
  if(!current)return null;
  let e=current.exploration;
  if(!e||typeof e!=='object')return null;
  return e
}
function historyNodeDepth(id){return SessionHistory.nodeDepth(current,id)}
function historyIsDescendant(id,ancestor){return SessionHistory.isDescendant(current,id,ancestor)}
function historyPathFrom(ancestor,id){return SessionHistory.pathFrom(current,ancestor,id)}
function historyActionShort(node){
  if(!node)return tr('branchStart');
  let a=node.action||{};if(a.type==='START')return tr('branchStart');let j=node.justification,e=node.error,ch=(a.changes||[])[0];
  if(e)return `⚠ ${errorRuleTitle(e)}`;
  if(ch){
    let cell=cellName(ch.row,ch.column),val=ch.to;
    return gamePedagogy(a.game).historyChangeText(ch)||cell;
  }
  if(a.type==='PATCH_RECTANGLE')return `${tr('gamePatches')} · ${tr('zone')} ${(a.region??0)+1}`;
  if(a.type==='COACH_APPLY')return `Logic Coach`;
  if(j?.status==='hypothesis')return tr('moveHypothesis');
  return a.type||tr('branchStart')
}
function explorationNodeStatus(node){
  if(!node)return '';
  if(node.error)return 'error';
  let s=node.justification?.status;
  if(s==='hypothesis')return 'hypothesis';
  if(s==='unjustified')return 'unjustified';
  if(s==='justified')return 'justified';
  return 'neutral'
}
function explorationStatusIcon(node){
  return {error:'⚠',hypothesis:'◇',unjustified:'?',justified:'✓',neutral:'•'}[explorationNodeStatus(node)]||'•'
}
function explorationBranchRoots(){
  let e=explorationState(),h=current?.moveHistory;if(!e||!h?.nodes?.[e.branchPoint])return [];
  return (h.nodes[e.branchPoint].children||[]).map(id=>h.nodes[id]).filter(Boolean)
}
function explorationCurrentRoot(){
  let e=explorationState();if(!e)return null;
  let path=historyPathFrom(e.branchPoint,current.moveHistory.cursor);return path[0]||null
}
function explorationBranchRepresentative(root){
  let h=current?.moveHistory,n=root,guard=0,best=root;
  while(n&&guard++<10000){
    if(['error','hypothesis','unjustified'].includes(explorationNodeStatus(n)))best=n;
    if(!n.preferred||!n.children?.includes(n.preferred))break;n=h.nodes[n.preferred]
  }
  return best
}
function explorationTreeHtml(){
  let e=explorationState(),h=current?.moveHistory;if(!e||!h)return '';
  let bp=h.nodes[e.branchPoint],roots=explorationBranchRoots(),cursor=h.cursor;
  let rows=roots.map((root,i)=>{
    let active=historyIsDescendant(cursor,root.id),pref=bp.preferred===root.id,path=active?historyPathFrom(root.id,cursor):[],leaf=active&&path.length?h.nodes[path[path.length-1]]:root;
    let representative=explorationBranchRepresentative(root),status=explorationNodeStatus(representative),depth=active?historyNodeDepth(cursor)-historyNodeDepth(e.branchPoint):1;
    return `<button class="exploration-branch ${active?'active':''} status-${status}" data-explore-node="${root.id}">
      <span class="exploration-branch-icon">${explorationStatusIcon(representative)}</span>
      <span><b>${historyActionShort(root)}</b><small>${pref?'★ ':''}${tr('currentBranch')}: ${active?'✓ ':''}${depth}</small></span>
      <em>${i+1}</em>
    </button>`
  }).join('');
  if(!rows)rows=`<div class="exploration-empty">${tr('testHypothesis')}</div>`;
  return `<div class="exploration-tree"><b>${tr('branchTree')}</b>${rows}</div>`
}
function refreshExplorationPanel(){
  let box=$('#explorationPanel'),btn=$('#exploreBtn');if(!box)return;
  let e=explorationState();
  if(btn){btn.textContent=e?.active?`◇ ${tr('explorationActive')}`:`◇ ${tr('exploration')}`;btn.classList.toggle('exploration-active',!!e?.active)}
  if(!e?.active){box.hidden=true;box.innerHTML='';return}
  let h=current.moveHistory,bp=h.nodes[e.branchPoint],root=explorationCurrentRoot(),path=historyPathFrom(e.branchPoint,h.cursor);
  box.hidden=false;box.innerHTML=`<div class="exploration-head"><div><span>◇</span><b>${tr('explorationActive')}</b><small>${tr('branchPoint')}: ${historyActionShort(bp)} · ${path.length}</small></div><button class="btn" id="closeExploreBtn">${tr('closeExploration')}</button></div>
    ${explorationTreeHtml()}
    <div class="exploration-actions">
      <button class="btn primary" id="analyzeExploreBtn">${tr('analyzeBranch')}</button>
      <button class="btn" id="returnExploreBtn" ${h.cursor===e.branchPoint?'disabled':''}>↶ ${tr('returnBranchPoint')}</button>
      <button class="btn" id="keepExploreBtn" ${root?'':'disabled'}>✓ ${tr('keepBranch')}</button>
    </div><div id="explorationAnalysis" class="exploration-analysis" hidden></div>`;
  $('#closeExploreBtn').onclick=closeExploration;
  $('#analyzeExploreBtn').onclick=analyzeExplorationBranch;
  $('#returnExploreBtn').onclick=returnToExplorationBranchPoint;
  $('#keepExploreBtn').onclick=keepExplorationBranch;
  app.querySelectorAll('[data-explore-node]').forEach(b=>b.onclick=()=>goToExplorationNode(b.dataset.exploreNode))
}
function startExploration(){
  if(!current||current.completed||paused||current.training)return false;
  let h=historyInit(),cursor=h.cursor;
  current.exploration={schema:1,active:true,branchPoint:cursor,startedAt:WebPlatform.clock.nowMs(),returns:0,analyses:0,kept:0};
  closeHintNotice();refreshExplorationPanel();saveCurrent();showToast(tr('testHypothesis'));return true
}
function closeExploration(){
  let e=explorationState();if(!e)return false;e.active=false;e.closedAt=WebPlatform.clock.nowMs();refreshExplorationPanel();saveCurrent();return true
}
function setHistoryCursor(id){
  let h=current?.moveHistory,n=h?.nodes?.[id];if(!n||current.completed||paused)return false;
  h.cursor=id;restorePuzzleSnapshot(n.snapshot);syncErrorFromHistory();syncReasoningAuditFromHistory();trainingSyncPath();updateHistoryButtons();refreshExplorationPanel();saveCurrent();haptic(7);return true
}
function goToExplorationNode(rootId){
  let e=explorationState(),h=current?.moveHistory;if(!e?.active||!h?.nodes?.[rootId]||!h.nodes[e.branchPoint]?.children?.includes(rootId))return false;
  let id=rootId,n=h.nodes[id],guard=0;while(n?.preferred&&n.children?.includes(n.preferred)&&guard++<10000){id=n.preferred;n=h.nodes[id]}
  return setHistoryCursor(id)
}
function returnToExplorationBranchPoint(){
  let e=explorationState();if(!e?.active)return false;e.returns=(e.returns||0)+1;let ok=setHistoryCursor(e.branchPoint);if(ok)showToast(tr('branchReturned'));return ok
}
function keepExplorationBranch(){
  let e=explorationState(),h=current?.moveHistory;if(!e?.active||h.cursor===e.branchPoint)return false;
  let path=historyPathFrom(e.branchPoint,h.cursor),parent=e.branchPoint;
  for(let id of path){let p=h.nodes[parent];if(p?.children?.includes(id))p.preferred=id;parent=id}
  e.kept=(e.kept||0)+1;e.keptNode=h.cursor;e.active=false;e.closedAt=WebPlatform.clock.nowMs();refreshExplorationPanel();saveCurrent();showToast(tr('branchKept'));return true
}
function explorationContradiction(){
  let errors=currentVisibleErrors();if(errors.length)return {bad:true,kind:'rules',html:errors.map(e=>`<b>${errorRuleTitle(e)}</b><br>${errorDetailedMessage(e)}`).join('<hr>')};
  let result=gamePedagogy().explorationContradiction({deadline:WebPlatform.clock.nowMs()+700});
  return result||{bad:false,kind:'none',html:tr('noContradiction')}
}
function analyzeExplorationBranch(){
  let e=explorationState();if(!e?.active)return false;e.analyses=(e.analyses||0)+1;
  let result=explorationContradiction(),box=$('#explorationAnalysis');if(box){box.hidden=false;box.classList.toggle('bad',result.bad);box.innerHTML=`<b>${result.bad?'⚠ '+tr('contradictionFound'):'✓ '+tr('analyzeBranch')}</b><div>${result.html}</div>`}
  saveCurrent();return result
}
function showExplorationContradictionBeforeHint(){
  let e=explorationState();if(!e?.active||current?.moveHistory?.cursor===e.branchPoint)return false;
  let result=explorationContradiction();if(!result.bad)return false;
  e.analyses=(e.analyses||0)+1;
  showHintNotice(`<b>◇ ${tr('exploration')} · ⚠ ${tr('contradictionFound')}</b><div class="coach-error-item">${result.html}</div><button class="btn error-return-btn" onclick="returnToExplorationBranchPoint()">↶ ${tr('returnBranchPoint')}</button>`);
  let box=$('#explorationAnalysis');if(box){box.hidden=false;box.classList.add('bad');box.innerHTML=`<b>⚠ ${tr('contradictionFound')}</b><div>${result.html}</div>`}
  saveCurrent();return true
}
function explorationOnRecordedNode(node){
  let e=explorationState();if(!e?.active||!node||!historyIsDescendant(node.id,e.branchPoint)||node.id===e.branchPoint)return;
  // In Exploration, a legal but unproved first move is explicitly a hypothesis.
  let path=historyPathFrom(e.branchPoint,node.id),h=current.moveHistory,priorHypothesis=path.slice(0,-1).some(id=>h.nodes[id]?.justification?.status==='hypothesis');
  if(!priorHypothesis&&node.justification?.status==='unjustified'&&gamePedagogy().canAcceptHypothesis(node.justification)){
    node.justification.status='hypothesis';node.justification.acceptedAt=WebPlatform.clock.nowMs();node.justification.exploration=true;
    let b=reasoningAuditBucket();b.hypotheses++;current.lastMoveAudit={...node.justification,historyNode:node.id,parentNode:node.parent};showToast(tr('branchHypothesisAuto'))
  }
  refreshReasoningAudit();refreshExplorationPanel()
}

function historyChanges(beforeKey,after){return SessionHistory.historyChanges(current,beforeKey,after)}
function normalizeHistoryAction(action,beforeKey=null,after=null){return SessionHistory.normalizeHistoryAction(current,action,beforeKey,after)}
function historyRecord(action='MOVE',beforeKey=null){
  if(!current)return false;
  let rec=SessionHistory.recordHistory(current,action,beforeKey);if(!rec.changed){updateHistoryButtons();return false}
  let {node,parent,normalized,existing}=rec;
  let err=analyzeCurrentError(normalized);node.error=err?{...err,historyNode:node.id,parentNode:parent.id}:null;
  current.lastError=node.error?{...node.error}:null;if(node.error)errorUsage('detected',node.error.technique||null);
  let audit=evaluateMoveJustification(beforeKey,normalized,node.error);applyAuditResult(node,audit);explorationOnRecordedNode(node);
  masteryRecognizePlayerMove(beforeKey,normalized,node.error,audit);if(current.training&&!node.error)trainingMoveCompleted(normalized);refreshErrorCoach();updateHistoryButtons();return true
}
function restorePuzzleSnapshot(s){
  if(!current||!s||s.game!==current.game)return false;
  current.hintFlow=null;current.lastReasoning=null;current.lastError=null;current.lastMoveAudit=null;current.masteryPendingAid=null;clearHintFocus();clearErrorFocus();closeHintNotice();$('#victory')?.remove();
  if(!SessionHistory.applyPuzzleSnapshot(current,s))return false;
  drawGameUi(current);
  status('',true);updateScoreFlags();return true
}
function undoMoves(count=1){
  if(!current||current.completed||paused)return 0;
  let step=SessionHistory.undoHistory(current,count),moved=step.moved;if(!moved){updateHistoryButtons();return 0}
  markBacktrack();restorePuzzleSnapshot(step.snapshot);syncErrorFromHistory();syncReasoningAuditFromHistory();trainingSyncPath();updateHistoryButtons();refreshExplorationPanel();saveCurrent();haptic(7);return moved
}
function redoMoves(count=1){
  if(!current||current.completed||paused)return 0;
  let step=SessionHistory.redoHistory(current,count),moved=step.moved;if(!moved){updateHistoryButtons();return 0}
  restorePuzzleSnapshot(step.snapshot);syncErrorFromHistory();syncReasoningAuditFromHistory();trainingSyncPath();updateHistoryButtons();refreshExplorationPanel();saveCurrent();haptic(7);return moved
}
function updateHistoryButtons(){
  let u=$('#undoBtn'),r=$('#redoBtn');
  if(u)u.disabled=!current||current.completed||paused||!historyCanUndo();
  if(r)r.disabled=!current||current.completed||paused||!historyCanRedo()
}
function historySummary(){return SessionHistory.summary(current)}
document.addEventListener('keydown',e=>{
  if(!(e.ctrlKey||e.metaKey)||String(e.key).toLowerCase()!=='z')return;
  if(!current||paused||current.completed)return;e.preventDefault();
  if(e.shiftKey)redoMoves(1);else undoMoves(1)
});

function plainCurrent(){return DataSerialization.serializeCurrentState(current)}
function discardLegacyPersistence(){PersistentData.save.discardLegacy()}
function persistenceContract(){let d=typeof DifficultyRating!=='undefined'?DifficultyRating:null;return {difficultySchema:d?.SCHEMA_VERSION??1,ratingVersion:d?.RATING_VERSION??1,fingerprintVersion:d?.FINGERPRINT_VERSION??1,generatorVersion:d?.GENERATOR_VERSION??1}}
function persistenceSnapshot(c){return SessionHistory.puzzleSnapshot(c)}
function persistenceHistoryValid(c){return SessionHistory.historyValid(c)}
function persistencePublicPuzzle(c){
  let root=c?.moveHistory?.nodes?.h0?.snapshot;if(!c||!root||!GameRegistry.hasGame(c.game))return null;
  try{return GameRegistry.requireCapability(c.game,'publicPuzzleFromSession')(c,root)}catch(_){return null}
}
function persistenceFingerprint(c){try{return typeof DifficultyRating!=='undefined'?DifficultyRating.fingerprintPublicPuzzle(persistencePublicPuzzle(c)):null}catch(_){return null}}
function persistenceNeedsCertifiedProfile(c){return !!(c?.generated&&!c.training&&!c.learning)}
function persistenceCertifiedProfileValid(c,fingerprint){
  if(!persistenceNeedsCertifiedProfile(c))return true;
  let d=typeof DifficultyRating!=='undefined'?DifficultyRating:null,p=c?.difficultyProfile;if(!d||!p||typeof p!=='object'||!fingerprint)return false;
  let tier;try{tier=d.tierIndex(c.diff)}catch(_){return false}
  if(p.schema!==d.SCHEMA_VERSION||p.ratingVersion!==d.RATING_VERSION||p.game!==c.game||p.status!=='solved'||p.difficulty!==c.diff||p.minimumRequiredTier!==tier||p.budgetHit||p.fingerprint!==fingerprint)return false;
  if(c.generationStats?.fingerprint&&c.generationStats.fingerprint!==fingerprint)return false;
  if(c.challenge&&c.challengeFingerprint!==fingerprint)return false;
  if(c.daily&&c.dailyFingerprint!==fingerprint)return false;
  return true
}
function persistencePayloadValid(x){
  if(!x||typeof x!=='object'||x.schema!==SAVE_SCHEMA||x.baseline!==PERSISTENCE_BASELINE||!x.current||typeof x.current!=='object')return false;
  let expected=persistenceContract(),contract=x.contract;if(!contract||contract.difficultySchema!==expected.difficultySchema||contract.ratingVersion!==expected.ratingVersion||contract.fingerprintVersion!==expected.fingerprintVersion)return false;
  let c=x.current;if(!GAME_IDS.includes(c.game)||!['easy','medium','hard','expert'].includes(c.diff)||c.completed||!persistenceHistoryValid(c))return false;
  let fingerprint=persistenceFingerprint(c);if((x.puzzleFingerprint||null)!==(fingerprint||null)||!persistenceCertifiedProfileValid(c,fingerprint))return false;
  return Number.isFinite(Number(x.elapsed))&&Number(x.elapsed)>=0&&typeof x.paused==='boolean'
}
function saveCurrent(){if(!current||current.completed||current.trainingCompleted)return;try{let c=plainCurrent();if(!persistenceHistoryValid(c))return;let fingerprint=persistenceFingerprint(c);if(!persistenceCertifiedProfileValid(c,fingerprint))return;let payload=DataSerialization.createSaveEnvelope({schema:SAVE_SCHEMA,baseline:PERSISTENCE_BASELINE,version:VERSION,contract:persistenceContract(),puzzleFingerprint:fingerprint,current:c,elapsed:timerSeconds(),paused:!!paused,savedAt:WebPlatform.clock.nowMs()});PersistentData.save.write(payload)}catch(_){}}
function getSaved(){return PersistentData.save.read({validate:persistencePayloadValid})}
function clearSaved(){PersistentData.save.clear()}


const PORTABLE_GAMES=GAME_IDS,PORTABLE_DIFFS=['easy','medium','hard','expert'],USER_DATA_MAX_BYTES=5*1024*1024,USER_DATA_MAX_DAILY_RECORDS=5000;
function portableJsonEqual(a,b){try{return JSON.stringify(a)===JSON.stringify(b)}catch(_){return false}}
function portableFiniteNonNegative(v){return typeof v==='number'&&Number.isFinite(v)&&v>=0}
function portablePreferencesValid(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;let n=DataSerialization.normalizePreferences(raw,{defaultLang:'en',supportedLangs:SUPPORTED_LANGS});return portableJsonEqual(n,raw)}
function portableStatsValid(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.schema!==STATS_SCHEMA||raw.baseline!==PERSISTENCE_BASELINE)return false;
  let n=DataSerialization.normalizeStats(raw,blankStats(),{schema:STATS_SCHEMA,baseline:PERSISTENCE_BASELINE,historyLimit:HISTORY_LIMIT,validGames:PORTABLE_GAMES,validDifficulties:PORTABLE_DIFFS});
  if(!portableJsonEqual(n,raw))return false;
  for(const key of ['started','solved','revealed','totalSolvedSeconds'])if(!portableFiniteNonNegative(raw[key]))return false;
  if(!raw.byGame||typeof raw.byGame!=='object'||Array.isArray(raw.byGame))return false;
  for(const [game,diffs] of Object.entries(raw.byGame)){
    if(!PORTABLE_GAMES.includes(game)||!diffs||typeof diffs!=='object'||Array.isArray(diffs))return false;
    for(const [diff,b] of Object.entries(diffs)){
      if(!PORTABLE_DIFFS.includes(diff)||!b||typeof b!=='object'||Array.isArray(b))return false;
      for(const key of ['started','solved','revealed','totalSeconds'])if(!portableFiniteNonNegative(b[key]))return false;
      if(b.best!=null&&!portableFiniteNonNegative(b.best))return false
    }
  }
  if(!Array.isArray(raw.history)||raw.history.length>HISTORY_LIMIT)return false;
  for(const h of raw.history){if(!h||typeof h!=='object'||!PORTABLE_GAMES.includes(h.game)||!PORTABLE_DIFFS.includes(h.diff)||!portableFiniteNonNegative(h.seconds)||!portableFiniteNonNegative(h.ts)||!['solved','revealed','abandoned','finished'].includes(h.outcome))return false}
  for(const name of ['mastery','training','learning']){let x=raw[name];if(!x||typeof x!=='object'||x.schema!==1||!x.byTechnique||typeof x.byTechnique!=='object'||Array.isArray(x.byTechnique))return false}
  return true
}
function portableDailyValid(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;let entries=Object.entries(raw);if(entries.length>USER_DATA_MAX_DAILY_RECORDS)return false;
  for(const [key,r] of entries){
    if(!r||typeof r!=='object'||Array.isArray(r)||!/^\d{4}-\d{2}-\d{2}:[a-z][a-z0-9-]*$/.test(key))return false;
    let split=key.lastIndexOf(':'),day=key.slice(0,split),game=key.slice(split+1);if(!GameRegistry.hasGame(game)||r.day!==day||r.game!==game||r.dailySchema!==DAILY_SCHEMA||r.dailyGenerator!==DAILY_GENERATOR||!['solved','revealed','abandoned'].includes(r.outcome))return false;
    if(!portableFiniteNonNegative(r.seconds)||!portableFiniteNonNegative(r.completedAt)||r.best!=null&&!portableFiniteNonNegative(r.best))return false;
    if(r.fingerprint!=null&&(typeof r.fingerprint!=='string'||!/^qfp1-[0-9a-f]{32}$/.test(r.fingerprint)))return false;
    if(r.outcome==='solved'&&r.official===true){if(!portableFiniteNonNegative(r.logicScore)||r.logicScore>100||!Number.isInteger(r.helpStage)||r.helpStage<0||r.helpStage>4)return false}
    for(const key2 of ['lastSeconds','lastCompletedAt'])if(r[key2]!=null&&!portableFiniteNonNegative(r[key2]))return false
  }
  return true
}
function portableImportBundle(pkg){
  let u=DataSerialization.unpackUserDataPackage(pkg);
  if(u.source?.persistenceBaseline!==PERSISTENCE_BASELINE||typeof u.source?.version!=='string'||!u.source.version)throw new Error('Unsupported QUADLUD persistence baseline');
  if(u.save!=null&&!persistencePayloadValid(u.save))throw new Error('Invalid QUADLUD save section');
  if(u.stats!=null&&!portableStatsValid(u.stats))throw new Error('Invalid QUADLUD stats section');
  if(u.daily!=null&&!portableDailyValid(u.daily))throw new Error('Invalid QUADLUD Daily section');
  if(u.preferences!=null&&!portablePreferencesValid(u.preferences))throw new Error('Invalid QUADLUD preferences section');
  return u
}
function userDataSnapshot(){return {save:getSaved(),stats:safeStats(),daily:dailyState(),preferences:prefs()}}
function writePortableSection(service,value){return value==null?service.clear():service.write(value)}
function replacePortableData(bundle){
  let old=userDataSnapshot(),ok=false;
  try{
    ok=writePortableSection(PersistentData.save,bundle.save)&&writePortableSection(PersistentData.stats,bundle.stats)&&writePortableSection(PersistentData.daily,bundle.daily)&&writePortableSection(PersistentData.preferences,bundle.preferences);
    if(!ok)throw new Error('Persistent write failed');discardLegacyPersistence();return true
  }catch(err){
    try{writePortableSection(PersistentData.save,old.save);writePortableSection(PersistentData.stats,old.stats);writePortableSection(PersistentData.daily,old.daily);writePortableSection(PersistentData.preferences,old.preferences)}catch(_){}
    throw err
  }
}
function createUserDataExport(){
  if(current&&!current.completed)saveCurrent();let data=userDataSnapshot();
  return DataSerialization.createUserDataPackage({sourceVersion:VERSION,persistenceBaseline:PERSISTENCE_BASELINE,exportedAt:WebPlatform.clock.nowIso(),...data})
}
function importUserDataPackage(pkg){let bundle=portableImportBundle(pkg);replacePortableData(bundle);stopTimer();timerEl.textContent='00:00';current=null;paused=false;elapsedBase=0;startedAt=0;applyPrefs();updateI18n();return bundle}
function eraseAllUserData(){let results=[PersistentData.save.clear(),PersistentData.stats.clear(),PersistentData.daily.clear(),PersistentData.preferences.clear()];discardLegacyPersistence();stopTimer();timerEl.textContent='00:00';current=null;paused=false;elapsedBase=0;startedAt=0;applyPrefs();updateI18n();return results.every(Boolean)}
function privacyInfoModal(){modal(tr('privacyTitle'),`<p>${tr('privacyText')}</p><p><b>${tr('privateExportNote')}</b> ${tr('privacyPrivateExport')}</p><p>${tr('privacyEraseScope')}</p>`)}
function downloadUserDataExport(){
  try{let pkg=createUserDataExport(),text=DataSerialization.stringify(pkg),day=WebPlatform.clock.nowIso().slice(0,10);if(!WebPlatform.files.downloadText(text,{filename:`QUADLUD-user-data-${day}.json`,type:'application/json'}))throw new Error('download-unavailable');showToast(tr('exportDone'));return pkg}catch(_){showToast(tr('exportFailed'));return null}
}
function readPortableFileText(file){return WebPlatform.files.readText(file)}
async function handleUserDataFileImport(e){let input=e?.target||$('#dataImportFile'),file=input?.files?.[0];if(!file)return;try{if(file.size>USER_DATA_MAX_BYTES)throw new Error('too-large');let text=await readPortableFileText(file);if(text.length>USER_DATA_MAX_BYTES)throw new Error('too-large');let pkg=DataSerialization.parse(text);importUserDataPackage(pkg);settingsView();showToast(tr('importDone'))}catch(err){showToast(err?.message==='too-large'?tr('importTooLarge'):err?.message==='Persistent write failed'?tr('importFailed'):tr('importInvalid'))}finally{if(input)input.value=''}}
function confirmEraseUserData(){confirmActionModal(tr('eraseTitle'),`<p>${tr('eraseConfirm')}</p>`,tr('eraseConfirmButton'),()=>{let ok=eraseAllUserData();settingsView();showToast(ok?tr('eraseDone'):tr('eraseFailed'))})}
globalThis.QuadludUserData=Object.freeze({createExport:createUserDataExport,validateImport:portableImportBundle,importPackage:importUserDataPackage,erase:eraseAllUserData});
$('#homeBtn').onclick=home;$('#themeBtn').onclick=cycleTheme;

function statsView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let {s,success,avg,streak}=statsSummary(),games=GAME_IDS;
  let rows=games.map(g=>{let bs=['easy','medium','hard','expert'].map(d=>s.byGame?.[g]?.[d]).filter(Boolean),started=bs.reduce((a,b)=>a+(b.started||0),0),solved=bs.reduce((a,b)=>a+(b.solved||0),0),total=bs.reduce((a,b)=>a+(b.totalSeconds||0),0),best=bs.map(b=>b.best).filter(v=>v!=null);return `<div class="stat-game"><b>${gameLabel(g)}</b><span>${solved}/${started} ${tr('solved')}</span><span>${solved?fmt(Math.round(total/solved)):'—'} ${tr('average')}</span><span>${best.length?fmt(Math.min(...best)):'—'} ${tr('record')}</span></div>`}).join('');
  let hist=s.history.slice(0,20).map(x=>`<div class="history-row"><span><b>${gameLabel(x.game)}</b> · ${DIFF[x.diff]}</span><span>${x.outcome==='solved'?tr('solvedStatus'):x.outcome==='revealed'?tr('revealedStatus'):x.outcome==='abandoned'?tr('abandonedStatus'):tr('finishedStatus')} · ${fmt(x.seconds)} ${aidBadges(x,true)}</span><small>${new Date(x.ts).toLocaleDateString(dateLocale())}</small></div>`).join('')||`<p class="empty-state">${tr('none')}</p>`;
  app.innerHTML=`<section class="panel stats-panel"><div class="stats-head"><div><h1>${tr('stats')}</h1><p>${tr('statsLocal')}</p></div><button class="btn" id="statsBack">${tr('back')}</button></div>
  <div class="stat-kpis"><div><strong>${s.solved}</strong><span>${tr('solved')}</span></div><div><strong>${success}%</strong><span>${tr('success')}</span></div><div><strong>${avg?fmt(avg):'—'}</strong><span>${tr('avgTime')}</span></div><div><strong>${streak}</strong><span>${tr('streak')}</span></div></div>
  <h2>${tr('byGame')}</h2><div class="stat-games">${rows}</div><h2>${tr('history')}</h2><div class="history-list">${hist}</div></section>`;
  $('#statsBack').onclick=home;app.querySelectorAll('button').forEach(pressFeedback)
}
function home(){if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();let saved=getSaved();app.innerHTML=`<section class="hero"><h1>${tr('homeTitle')}</h1><p>${tr('homeSub')}</p></section>${saved?`<button class="resume-card" id="resumeBtn"><b>${tr('resume')} ${gameLabel(saved.current.game)}</b><span>${DIFF[saved.current.diff]} · ${fmt(saved.elapsed||0)}</span></button>`:''}<section class="cards">
<button class="game-card" data-g="queens"><span class="game-icon" aria-hidden="true">♛</span><span><h2>${gameLabel('queens')}</h2><p>${gameDescription('queens')}</p></span></button>
<button class="game-card" data-g="tango"><span class="game-icon" aria-hidden="true">☀︎</span><span><h2>${gameLabel('tango')}</h2><p>${gameDescription('tango')}</p></span></button>
<button class="game-card" data-g="sudoku"><span class="game-icon" aria-hidden="true">✎</span><span><h2>${gameLabel('sudoku')}</h2><p>${gameDescription('sudoku')}</p></span></button>
<button class="game-card" data-g="patches"><span class="game-icon" aria-hidden="true">▦</span><span><h2>${gameLabel('patches')}</h2><p>${gameDescription('patches')}</p></span></button>
</section><button class="daily-card" id="dailyBtn"><span>◆</span><b>${tr('daily')}</b><small>${dailyHomeLine()}</small></button><button class="stats-card challenge-home-card" id="challengeBtn"><span>↗</span><b>${tr('challenge')}</b><small>${tr('challengeSub')}</small></button><button class="stats-card" id="statsBtn"><span>▥</span><b>${tr('stats')}</b><small>${tr('statsSub')}</small></button><button class="stats-card mastery-home-card" id="masteryBtn"><span>◎</span><b>${tr('mastery')}</b><small>${tr('masterySub')}</small></button><button class="stats-card learning-home-card" id="learnBtn"><span>◉</span><b>${tr('learn')}</b><small>${tr('learnSub')}</small></button><button class="stats-card training-home-card" id="trainingBtn"><span>◇</span><b>${tr('training')}</b><small>${tr('trainingSub')}</small></button><button class="settings-card" id="settingsBtn"><span>⚙︎</span><b>${tr('prefs')}</b><small>${tr('prefsSub')}</small></button><button class="settings-card" id="aboutBtn"><span>ⓘ</span><b>${tr('about')}</b><small>${tr('aboutSub')}</small></button><div class="footer-note">QUADLUD v${VERSION} · © 2026 Serge Benoliel</div>`;
if(saved)$('#resumeBtn').onclick=resumeSaved;$('#dailyBtn').onclick=dailyView;$('#challengeBtn').onclick=()=>challengeView();$('#statsBtn').onclick=statsView;$('#masteryBtn').onclick=masteryView;$('#learnBtn').onclick=learningView;$('#trainingBtn').onclick=trainingView;$('#settingsBtn').onclick=settingsView;$('#aboutBtn').onclick=aboutView;app.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>launch(b.dataset.g,'easy'));app.querySelectorAll('button').forEach(pressFeedback)}
function gameLabel(g){let metadata=GameRegistry.getMetadata(g);return metadata?tr(metadata.labelKey):g}
function gameDescription(g){let metadata=GameRegistry.getMetadata(g);return metadata?.descriptionKey?tr(metadata.descriptionKey):''}

// ===== v2.21.4 — non-destructive logical walkthrough =====
let walkthroughSession=null;
function walkthroughRootSnapshot(){
  let h=current?.moveHistory,root=h?.nodes?.h0?.snapshot,historyRoot=root?JSON.parse(JSON.stringify(root)):null;
  return gamePedagogy().walkthroughRootSnapshot({historyRoot,puzzleSnapshot})
}
function walkthroughVisibleClone(c,root){return c&&root?gamePedagogy(c.game).walkthroughVisibleClone(c,root):null}
function walkthroughSnapshot(c){return gamePedagogy(c.game).walkthroughSnapshot(c)}
function withWalkthroughCurrent(fn){let saved=current;current=walkthroughSession?.work||saved;try{return fn(current)}finally{current=saved}}
function walkthroughComplete(){return withWalkthroughCurrent(c=>!!c&&gamePedagogy(c.game).walkthroughComplete(c))}
function walkthroughGenerateQueensNext(){
  let s=walkthroughSession;if(!s||s.base.game!=='queens'||s.done||s.stalled)return false;
  if(!s.queenLogic)s.queenLogic=queenLogicSession(s.work,s.work.state);
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length;return false}
  let result=s.queenLogic.nextDeduction();
  if(result.contradiction){s.stalled=true;s.logicContradiction=result.contradiction;return false}
  if(!result.deduction){s.stalled=true;return false}
  let beforeSnapshot=walkthroughSnapshot(s.work),applied=s.queenLogic.applyDeduction(result.deduction),d=applied.deduction;if(!d){s.stalled=true;return false}
  s.work.state=cloneGrid(s.queenLogic.state);
  let presenter=queenReasoningPresenter(),presentation=presenter.presentation(d,applied.automatic),reasoning=presenter.legacyReasoning(d,applied.automatic),info={
    rule:presentation.rule,technique:presentation.technique,rank:presentation.rank,techniqueLevel:presentation.techniqueLevel,target:d.conclusions?.[0]?.cell?[...d.conclusions[0].cell]:null,
    presentation,deduction:reasoning,where:presentation.explanation.where,why:presentation.explanation.why,move:presentation.explanation.move,automatic:JSON.parse(JSON.stringify(applied.automatic||[])),metrics:s.queenLogic.metrics(),beforeSnapshot
  };
  info.snapshot=walkthroughSnapshot(s.work);s.moves.push(info);
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length;s.metrics=s.queenLogic.metrics()}
  return true
}
function walkthroughGenerateTangoNext(){
  let s=walkthroughSession;if(!s||s.base.game!=='tango'||s.done||s.stalled)return false;
  if(!s.tangoLogic)s.tangoLogic=tangoLogicSession(s.work,s.work.state,s.work.tangoDerivedRelations||[]);
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length;return false}
  let result=s.tangoLogic.nextDeduction();
  if(result.contradiction){s.stalled=true;s.logicContradiction=result.contradiction;return false}
  if(!result.deduction){s.stalled=true;return false}
  let beforeSnapshot=walkthroughSnapshot(s.work),applied=s.tangoLogic.applyDeduction(result.deduction),d=applied.deduction;if(!d){s.stalled=true;return false}
  s.work.state=cloneGrid(s.tangoLogic.state);s.work.tangoDerivedRelations=s.tangoLogic.exportDerivedRelations();
  let presenter=tangoReasoningPresenter(),presentation=presenter.presentation(d,applied.automatic),reasoning=presenter.legacyReasoning(d,applied.automatic),firstValue=(d.conclusions||[]).find(c=>c.type==='VALUE'),info={
    rule:presentation.rule,technique:presentation.technique,rank:presentation.rank,techniqueLevel:presentation.techniqueLevel,target:firstValue?firstValue.cell.slice():null,
    presentation,deduction:reasoning,where:presentation.explanation.where,why:presentation.explanation.why,move:presentation.explanation.move,automatic:JSON.parse(JSON.stringify(applied.automatic||[])),metrics:s.tangoLogic.metrics(),beforeSnapshot
  };
  info.snapshot=walkthroughSnapshot(s.work);s.moves.push(info);
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length;s.metrics=s.tangoLogic.metrics()}
  return true
}
function patchTutorSelectedIds(engine,ids){return new Set((ids||[]).filter(id=>engine.selectedRect(id)!=null))}
function patchTutorQueueSelections(s,beforeSelected,primary,automatic){let sequence=[primary,...(automatic||[])].filter(Boolean),afterSelected=patchTutorSelectedIds(s.patchLogic,s.base.ids),pending=new Set([...afterSelected].filter(id=>!beforeSelected.has(id)));s.patchRevealQueue=s.patchRevealQueue||[];let enqueue=(id,deduction)=>{id=Number(id);if(!pending.has(id))return;let rect=s.patchLogic.selectedRect(id)?.rect;if(!rect)return;s.patchRevealQueue.push({clue:id,rectangle:JSON.parse(JSON.stringify(rect)),deduction:JSON.parse(JSON.stringify(deduction||primary)),batchPrimaryId:primary?.id||null});pending.delete(id)};for(const d of sequence)for(const c of d?.conclusions||[])if(c.type==='SELECTED_RECT')enqueue(c.clue,d);for(const id of s.base.ids)if(pending.has(Number(id)))enqueue(id,primary)}
function patchTutorRevealNext(s){let item=s.patchRevealQueue?.shift();if(!item)return false;let id=item.clue,rect=item.rectangle,d=item.deduction,beforeSnapshot=walkthroughSnapshot(s.work);s.work.patchSelectedRects=s.work.patchSelectedRects||{};s.work.patchSelectedRects[id]={r0:rect.r0,r1:rect.r1,c0:rect.c0,c1:rect.c1};for(const [r,col] of rect.cells||PatchesLogic.helpers.rectCells(rect))s.work.paint[r][col]=id;let presenter=patchesReasoningPresenter(),presentation=presenter.presentation(d,[]),reasoning=presenter.legacyReasoning(d,[]),info={
    rule:presentation.rule,technique:presentation.technique,rank:presentation.rank,techniqueLevel:presentation.techniqueLevel,target:presenter.primaryCell(d),presentation,deduction:reasoning,
    where:presentation.explanation.where,why:presentation.explanation.why,move:presentation.explanation.move,automatic:[],metrics:s.patchLogic.metrics(),beforeSnapshot,revealedClue:id,revealedRectangle:{r0:rect.r0,r1:rect.r1,c0:rect.c0,c1:rect.c1}
  };info.snapshot=walkthroughSnapshot(s.work);info.after=info.snapshot;s.moves.push(info);if(walkthroughComplete()&&!s.patchRevealQueue.length){s.done=true;s.total=s.moves.length;s.metrics=s.patchLogic.metrics()}return true}
function walkthroughGeneratePatchesNext(){
  let s=walkthroughSession;if(!s||s.base.game!=='patches'||s.done||s.stalled)return false;
  if(!s.patchLogic)s.patchLogic=patchesLogicSession(s.work,s.work.paint,s.work.patchSelectedRects,s.work.patchLogicEvidence);
  if(s.patchRevealQueue?.length)return patchTutorRevealNext(s);
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length;return false}
  let guard=0,maxGuard=Math.max(20,(s.base.ids?.length||1)*20);
  while(!s.patchRevealQueue?.length&&guard++<maxGuard){
    let result=s.patchLogic.nextDeduction();
    if(result.contradiction){s.stalled=true;s.logicContradiction=result.contradiction;return false}
    if(!result.deduction){s.stalled=true;return false}
    let beforeSelected=patchTutorSelectedIds(s.patchLogic,s.base.ids),applied=s.patchLogic.applyDeduction(result.deduction),d=applied.deduction;if(!d){s.stalled=true;return false}
    if(applied.contradiction){s.stalled=true;s.logicContradiction=applied.contradiction;return false}
    patchSyncEngineEvidence(s.work,s.patchLogic);
    patchTutorQueueSelections(s,beforeSelected,d,applied.automatic);
  }
  if(!s.patchRevealQueue?.length){s.stalled=true;return false}
  return patchTutorRevealNext(s)
}
function walkthroughGenerateSudokuNext(){
  let s=walkthroughSession;if(!s||s.base.game!=='sudoku'||s.done||s.stalled)return false;
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length;return false}
  let session=sudokuLogicSession(s.work,s.work.state),result=session.nextValueStep();
  if(result.contradiction){s.stalled=true;s.logicContradiction=result.contradiction;s.sudokuStatus='contradiction';s.metrics=result.metrics;return false}
  let value=sudokuReasoningPresenter().valueStepConclusion(result);
  if(!value){s.stalled=true;s.sudokuStatus=result.status||'blocked';s.metrics=result.metrics;return false}
  let [r,c]=value.cell;if(s.work.state[r][c]!==0){s.stalled=true;s.sudokuStatus='invalid-value-target';return false}
  let beforeSnapshot=walkthroughSnapshot(s.work),primary=result.primaryDeduction||result.deduction,presenter=sudokuReasoningPresenter(),presentation=presenter.presentValueStep(result,beforeSnapshot.state),reasoning=presenter.legacyValueStepReasoning(result),valueStep={status:result.status,contradiction:null,deduction:JSON.parse(JSON.stringify(result.deduction)),primaryDeduction:JSON.parse(JSON.stringify(primary)),supportingDeductions:JSON.parse(JSON.stringify(result.supportingDeductions||[])),logicalSteps:result.logicalSteps,metrics:JSON.parse(JSON.stringify(result.metrics||{}))};
  s.work.state[r][c]=value.value;
  let info={
    rule:presentation.rule,technique:presentation.technique,rank:presentation.metadata.coachRank,techniqueLevel:presentation.techniqueLevel,target:[r,c],
    presentation,deduction:reasoning,logicDeduction:JSON.parse(JSON.stringify(primary)),finalDeduction:JSON.parse(JSON.stringify(result.deduction)),supportingDeductions:JSON.parse(JSON.stringify(result.supportingDeductions||[])),valueStep,
    where:presentation.explanation.where,why:presentation.explanation.why,move:`${value.value} · ${cellName(r,c)}`,automatic:[],metrics:JSON.parse(JSON.stringify(result.metrics||{})),beforeSnapshot
  };
  info.snapshot=walkthroughSnapshot(s.work);s.moves.push(info);s.sudokuStatus='value';s.metrics=info.metrics;
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length}
  return true
}
function walkthroughGenerateNext(){let s=walkthroughSession;if(!s||s.done||s.stalled)return false;return gamePedagogy(s.base.game).walkthroughGenerateNext(s)}
function walkthroughTarget(index){return index>0?walkthroughSession?.moves?.[index-1]?.target:null}
function walkthroughBoardHtml(snapshot,target=null,deduction=null){
  let s=walkthroughSession,c=s.base,n=c.n||6,view=gamePedagogy(c.game).walkthroughBoard({base:c,initial:s.initial,snapshot,target,deduction})||{},boardClass=view.boardClass?`${view.boardClass} `:'';
  return `<div class="walkthrough-board-wrap"><div class="board ${boardClass}walkthrough-board" style="grid-template-columns:repeat(${n},minmax(0,1fr));grid-template-rows:repeat(${n},minmax(0,1fr))">${view.cellsHtml||''}</div></div>`
}
function walkthroughExplanationHtml(index){
  let s=walkthroughSession;if(index===0)return `<div class="walkthrough-explanation start"><b>${tr('walkthroughStart')}</b><p>${tr('walkthroughSub')}</p></div>`;
  let m=s.moves[index-1],p=m?.presentation;
  if(p){let move=p.metadata?.showTutorMove?(m.move||p.explanation?.move):null;return `<div class="walkthrough-explanation"><div class="walkthrough-tech"><b>${p.explanation?.title||tr('logic')}</b><span>${p.metadata?.walkthroughBadge||`R${p.rank}`}</span></div><p><b>${tr('where')} :</b> ${m.where||p.explanation?.where||''}</p><p><b>${tr('walkthroughWhy')}</b><br>${m.why||p.explanation?.why||''}</p>${move?`<p class="walkthrough-move"><b>${tr('hintMove')} :</b> ${move}</p>`:''}</div>`}
  let tech=m.technique?techniqueTitle(m.technique):techniqueTerm('contradiction'),rank=m.exhaustive?'R+':`R${m.rank}`;
  return `<div class="walkthrough-explanation"><div class="walkthrough-tech"><b>${tech}</b><span>${rank}</span></div><p><b>${tr('where')} :</b> ${m.where}</p><p><b>${tr('walkthroughWhy')}</b><br>${m.why||''}</p><p class="walkthrough-move"><b>${tr('hintMove')} :</b> ${m.move}</p></div>`
}
function a11ySyncWalkthroughBoard(){
  let b=document.querySelector('.walkthrough-board'),s=walkthroughSession;if(!b||!s)return;let n=s.base?.n||6,cells=[...b.children];
  b.setAttribute('role','grid');b.setAttribute('aria-rowcount',String(n));b.setAttribute('aria-colcount',String(n));b.setAttribute('aria-label',`${tr('walkthrough')} · ${gameLabel(s.base.game)}`);
  cells.forEach((d,i)=>{let r=Math.floor(i/n),c=i%n,parts=[a11yCoord(r,c)],txt=(d.textContent||'').trim();if(txt)parts.push(txt);a11ySetCell(d,r,c,parts.join(', '),{readonly:true})});
}
function renderWalkthrough(){
  let s=walkthroughSession;if(!s)return;let i=s.index,snap=i===0?s.initial:s.moves[i-1].snapshot,target=walkthroughTarget(i),deduction=i>0?s.moves[i-1]?.deduction:null;
  let contradiction=s.logicContradiction?(gamePedagogy(s.base.game).walkthroughContradictionText(s.logicContradiction)||tr('walkthroughStalled')):tr('walkthroughStalled'),stateNote=s.done&&i===s.moves.length?`<div class="walkthrough-complete">✓ ${tr('walkthroughComplete')}</div>`:s.stalled&&i===s.moves.length?`<div class="walkthrough-stalled">⚠ ${contradiction}</div>`:'';
  let total=s.done?s.moves.length:'…',progress=`${i}/${total}`;document.body.classList.add('tutor-active');
  app.innerHTML=`<section class="panel walkthrough-panel"><div class="stats-head walkthrough-head"><div><h1>${tr('walkthrough')}</h1><p>${gameLabel(s.base.game)} · ${DIFF[s.base.diff]}</p></div><button class="btn" id="walkthroughClose">${tr('walkthroughClose')}</button></div>${walkthroughBoardHtml(snap,target,deduction)}<div class="walkthrough-actions walkthrough-actions-top"><button class="btn" id="walkthroughPrev" ${i===0?'disabled':''}>← ${tr('walkthroughPrevious')}</button><button class="btn walkthrough-step-counter" id="walkthroughRestart" ${i===0?'disabled':''} title="${tr('walkthroughRestart')}">${tr('walkthroughStep')} ${progress} · ↺</button><button class="btn primary" id="walkthroughNext" ${(s.done||s.stalled)&&i===s.moves.length?'disabled':''}>${tr('walkthroughNext')} →</button></div><div class="walkthrough-scroll" aria-live="polite" aria-atomic="false"><p class="walkthrough-help-note">💡 ${tr('walkthroughCountsAsHelp')}</p>${walkthroughExplanationHtml(i)}${stateNote}</div></section>`;
  a11ySyncWalkthroughBoard();
  gamePedagogy(s.base.game).walkthroughAfterRender(app.querySelector('.walkthrough-board'),s.base);
  $('#walkthroughClose').onclick=closeWalkthrough;$('#walkthroughPrev').onclick=()=>{if(s.index>0){s.index--;renderWalkthrough()}};$('#walkthroughRestart').onclick=()=>{s.index=0;renderWalkthrough()};$('#walkthroughNext').onclick=()=>{if(s.index<s.moves.length)s.index++;else if(walkthroughGenerateNext())s.index++;renderWalkthrough()};app.querySelectorAll('button').forEach(pressFeedback)
}
function openWalkthrough(){
  if(!current||current.training)return false;let root=walkthroughRootSnapshot(),work=walkthroughVisibleClone(current,root);if(!work)return false;
  let elapsed=timerSeconds(),wasPaused=paused;stopTimer(true);current.walkthroughUsed=true;markHintUsed();updateScoreFlags();saveCurrent();
  walkthroughSession={schema:2,base:work,work,initial:walkthroughSnapshot(work),moves:[],index:0,done:false,stalled:false,elapsed,wasPaused};
  gamePedagogy(work.game).walkthroughInitialize(walkthroughSession);
  renderWalkthrough();return true
}
function closeWalkthrough(){
  let s=walkthroughSession;if(!s||!current)return false;let elapsed=s.elapsed,wasPaused=s.wasPaused;walkthroughSession=null;document.body.classList.remove('tutor-active');
  renderGameUi(current);
  startTimer(true,elapsed,wasPaused);updatePauseButton();saveCurrent();return true
}

function shell(name,subtitle,diff,content,rules){let challengeTag=current?.challenge?` · <span class="challenge-shell-tag">↗ <b>${current.challengeCode}</b></span>`:'';let trainingTag=current?.learning?` · <span class="training-shell-tag">${tr('lesson')} ${current.learningPhase}/4 : <b>${techniqueTitle(current.learningTechnique)}</b></span>`:current?.training?` · <span class="training-shell-tag">${tr('trainingTarget')} : <b>${techniqueTitle(current.trainingTechnique)}</b></span>`:'';app.innerHTML=`<section class="panel"><div class="game-head"><div><h1>${name}</h1><p>${subtitle}${trainingTag}${challengeTag}${current?` · <span class="live-aids">${aidBadges(current,true)}</span>`:''}</p></div><select class="difficulty" id="difficulty" aria-label="${tr('difficulty')}">${Object.entries(DIFF).map(([k,v])=>`<option value="${k}" ${k===diff?'selected':''}>${v}</option>`).join('')}</select></div><div class="toolbar" role="group" aria-label="${tr('actions')}"><button class="btn primary" id="newBtn">${tr('newGame')}</button><button class="btn" id="resetBtn">${tr('reset')}</button><button class="btn history-action" id="undoBtn" title="${tr('undo')}" aria-label="${tr('undo')}">↶ ${tr('undo')}</button><button class="btn history-action" id="redoBtn" title="${tr('redo')}" aria-label="${tr('redo')}">↷ ${tr('redo')}</button><button class="btn" id="pauseBtn">${tr('pause')}</button><button class="btn" id="checkBtn">${tr('check')}</button><button class="btn" id="hintBtn">${tr('logicCoach')}</button><button class="btn" id="exploreBtn">◇ ${tr('exploration')}</button><button class="btn secondary-action" id="shareChallengeBtn" style="${current?.challenge?'':'display:none'}">↗ ${tr('shareChallenge')}</button><button class="btn tutor-action" id="walkthroughBtn">▹ ${tr('walkthrough')}</button><button class="btn secondary-action" id="solutionBtn">${tr('solution')}</button><button class="btn secondary-action" id="rulesBtn">${tr('rules')}</button><button class="btn secondary-action" id="techniquesBtn">${tr('techniques')}</button></div><div id="status" class="status" aria-live="polite"></div><div id="errorCoach" class="error-coach" hidden aria-live="polite"></div><div id="reasoningAudit" class="reasoning-audit" hidden aria-live="polite"></div><div id="explorationPanel" class="exploration-panel" hidden aria-live="polite"></div><div id="learningGuide" class="learning-guide" hidden aria-live="polite"></div>${content}<div class="rules">${rules}</div></section>`;
$('#difficulty').onchange=e=>launch(current.game,e.target.value);$('#newBtn').onclick=()=>current?.challengeCode?launchChallenge(current.challengeCode):launch(current.game,current.diff);if(current?.challenge){$('#difficulty').disabled=true}$('#resetBtn').onclick=resetCurrent;$('#undoBtn').onclick=()=>undoMoves(1);$('#redoBtn').onclick=()=>redoMoves(1);$('#pauseBtn').onclick=togglePause;$('#exploreBtn').onclick=()=>explorationState()?.active?refreshExplorationPanel():startExploration();let scb=$('#shareChallengeBtn');if(scb&&current?.challenge)scb.onclick=()=>shareChallenge(challengeParse(current.challengeCode));let wb=$('#walkthroughBtn');if(wb)wb.onclick=openWalkthrough;$('#rulesBtn').onclick=()=>modal(`${tr('rules')} — ${name}`,rules);$('#techniquesBtn').onclick=()=>modal(`${tr('techniques')} — ${name}`,techniqueLibraryHtml(current.game));app.querySelectorAll('button').forEach(pressFeedback);updatePauseButton();updateHistoryButtons();refreshErrorCoach();refreshReasoningAudit();refreshExplorationPanel();if(current?.training)decorateTrainingShell()}

function resetCurrent(){
  if(!current)return;
  if(current.training)return resetTrainingExercise();
  let hadProgress=SessionHistory.hasPuzzleProgress(current);if(hadProgress)markBacktrack();
  $('#victory')?.remove();closeHintNotice();clearHintFocus();current.hintFlow=null;current.lastError=null;current.lastMoveAudit=null;current.exploration=null;clearErrorFocus();
  if(!SessionHistory.resetPuzzleState(current))return;
  if(!resetGameUi(current))return;
  let wasCompleted=!!current.completed;
  current.completed=false;
  if(wasCompleted||current.statsClosed){current.backtrackUsed=false;current.hintUsed=false;current.attemptId=null;current.statsClosed=false;statsStart(current)}
  stopTimer(false);elapsedBase=0;startedAt=0;paused=false;startTimer(true,0,false);historyInit(true);updateHistoryButtons();
  saveCurrent();updatePauseButton();status('',true);showToast(tr('resetDone'));haptic(8)
}

// ===== v2.7.0 — background precomputation =====
const PRECOMPUTE_TARGET=2;
const PRECOMPUTE_COMBOS=GAME_IDS.flatMap(game=>['easy','medium','hard','expert'].map(diff=>[game,diff]));
const precomputeCache=new Map();
const precomputeReservedIdentities=new Map();
let precomputeWorker=null,precomputeBusy=false,precomputeRequestId=0,precomputeDay=null,precomputePreferred=null,precomputeStarted=false;

function precomputeKey(game,diff){return `${game}:${diff}`}
function precomputeBucket(game,diff){
  let k=precomputeKey(game,diff);if(!precomputeCache.has(k))precomputeCache.set(k,[]);return precomputeCache.get(k)
}
function precomputeReservedSet(game){if(!precomputeReservedIdentities.has(game))precomputeReservedIdentities.set(game,new Set());return precomputeReservedIdentities.get(game)}
function resetPrecomputeDay(day=localDay()){
  if(precomputeDay===day)return;
  precomputeDay=day;precomputeCache.clear();precomputeReservedIdentities.clear()
}
function precomputeForbiddenKeys(game,day=localDay()){
  resetPrecomputeDay(day);
  try{
    if(!GameRegistry.hasCapability(game,'generationIdentity'))return [];
    let out=new Set(precomputeReservedSet(game));
    for(let identity of generationSessionSet(game,day))out.add(identity);
    return [...out]
  }catch(_){return []}
}
function ensurePrecomputeWorker(){
  if(precomputeWorker)return precomputeWorker;
  if(!WebPlatform.workers.supported())return null;
  try{
    let w=WebPlatform.workers.create('./precompute-worker.js?v=2.30.0');if(!w)return null;
    w.onmessage=e=>{
      let m=e.data||{};precomputeBusy=false;
      if(m.ok&&m.day===precomputeDay&&m.candidate&&precomputeCandidateCertified(m.game,m.diff,m.candidate)){
        let bucket=precomputeBucket(m.game,m.diff);
        if(bucket.length<PRECOMPUTE_TARGET){
          let identity=generatedCandidateIdentity(m.game,m.candidate);
          if(identity==null)bucket.push(m.candidate);
          else{
            let displayed=false;try{displayed=generationSessionSet(m.game,m.day).has(identity)}catch(_){}
            let reserved=precomputeReservedSet(m.game);
            if(!displayed&&!reserved.has(identity)){m.candidate.__generationIdentity=identity;reserved.add(identity);bucket.push(m.candidate)}
          }
        }
      }
      setTimeout(()=>schedulePrecompute(),80)
    };
    w.onerror=()=>{precomputeBusy=false;try{w.terminate()}catch(_){};precomputeWorker=null};
    precomputeWorker=w;return w
  }catch(_){return null}
}
function precomputeComboSupported(game,diff){return PRECOMPUTE_COMBOS.some(([g,d])=>g===game&&d===diff)}
function precomputeCandidateCertified(game,diff,candidate){try{return precomputeComboSupported(game,diff)&&generatedCandidateCertified(game,diff,candidate)}catch(_){return false}}
function precomputeOrder(){
  let preferred=precomputePreferred,all=PRECOMPUTE_COMBOS.slice();
  if(!preferred)return all.filter(x=>x[1]!=='expert').concat(all.filter(x=>x[1]==='expert'));
  let exact=[],same=[],medium=[],rest=[],deferredExpert=[];
  for(let x of all){
    if(x[0]===preferred.game&&x[1]===preferred.diff)exact.push(x);
    else if(x[1]==='expert')deferredExpert.push(x);
    else if(x[0]===preferred.game)same.push(x);
    else if(x[1]==='medium')medium.push(x);
    else rest.push(x)
  }
  return exact.concat(same,medium,rest,deferredExpert)
}
function schedulePrecompute(game=null,diff=null){
  if(game&&diff)precomputePreferred={game,diff};
  if(!precomputeStarted||WebPlatform.lifecycle.isHidden()||precomputeBusy)return;
  let day=localDay();resetPrecomputeDay(day);
  let w=ensurePrecomputeWorker();if(!w)return;
  for(let [g,d] of precomputeOrder()){
    if(precomputeBucket(g,d).length>=PRECOMPUTE_TARGET)continue;
    precomputeBusy=true;
    let id=++precomputeRequestId;
    w.postMessage({cmd:'generate',id,game:g,diff:d,day,forbiddenKeys:precomputeForbiddenKeys(g,day)});
    return
  }
}
function startBackgroundPrecompute(game=current?.game,diff=current?.diff){
  precomputeStarted=true;if(game&&diff)precomputePreferred={game,diff};
  resetPrecomputeDay(localDay());setTimeout(()=>schedulePrecompute(),120)
}
function takePrecomputed(game,diff,day=localDay()){
  resetPrecomputeDay(day);
  let bucket=precomputeBucket(game,diff);
  while(bucket.length){
    let g=bucket.shift(),identity=generatedCandidateIdentity(game,g);
    if(identity!=null){
      precomputeReservedSet(game).delete(identity);
      let already=false;try{already=generationSessionSet(game,day).has(identity)}catch(_){}
      if(already)continue;
      rememberGeneratedCandidateThisSession(game,g,day)
    }
    return g
  }
  return null
}
function precomputeStatus(){
  let out={};for(let [g,d] of PRECOMPUTE_COMBOS)out[precomputeKey(g,d)]=precomputeBucket(g,d).length;return out
}
WebPlatform.lifecycle.onVisibilityChange(()=>{if(!WebPlatform.lifecycle.isHidden()&&precomputeStarted)setTimeout(()=>schedulePrecompute(),150)});

function launch(game,diff){if(!GameRegistry.hasGame(game))throw new Error(`Unknown QUADLUD game: ${game}`);closePreviousAttempt();clearSaved();stopTimer();paused=false;setBusy(true);current={game,diff};requestAnimationFrame(()=>{try{let candidate=normalLaunchCandidate(game,diff);installGeneratedSession(game,diff,candidate,{context:'normal'});historyInit(true);updateHistoryButtons();statsStart(current);startTimer(true,0,false);saveCurrent();haptic(8)}finally{setBusy(false);startBackgroundPrecompute(game,diff)}})}
function resumeSaved(){let s=getSaved();if(!s)return home();stopTimer();let c=DataSerialization.deserializeCurrentState(s.current);current=c;historyInit(false);renderGameUi(c);startTimer(true,s.elapsed||0,!!s.paused);updatePauseButton();refreshExplorationPanel();showToast(tr('restored'));if(!c.training)startBackgroundPrecompute(c.game,c.diff)}


function sudokuCandidatesAt(r,c){
  let s=new Set([1,2,3,4,5,6]);for(let i=0;i<6;i++){s.delete(current.state[r][i]);s.delete(current.state[i][c])}
  let br=Math.floor(r/2)*2,bc=Math.floor(c/3)*3;for(let rr=br;rr<br+2;rr++)for(let cc=bc;cc<bc+3;cc++)s.delete(current.state[rr][cc]);return [...s]
}
function tangoReason(r,c,v){
  let sym=v===1?(lang()==='fr'?'soleil ☀':'sun ☀'):(lang()==='fr'?'lune ☾':'moon ☾'),opp=1-v,s=current.state,reasons=[];
  let rowOpp=s[r].filter(x=>x===opp).length,rowSame=s[r].filter(x=>x===v).length,colOpp=0,colSame=0;for(let rr=0;rr<6;rr++){if(s[rr][c]===opp)colOpp++;if(s[rr][c]===v)colSame++}
  if(rowOpp===3)reasons.push(lang()==='fr'?`la ligne contient déjà 3 ${opp===1?'soleils':'lunes'}`:`the row already contains 3 ${opp===1?'suns':'moons'}`);
  if(colOpp===3)reasons.push(lang()==='fr'?`la colonne contient déjà 3 ${opp===1?'soleils':'lunes'}`:`the column already contains 3 ${opp===1?'suns':'moons'}`);
  for(let [rr,cc,d,rel] of current.edges){let r2=d==='r'?rr:rr+1,c2=d==='r'?cc+1:cc;if(!((rr===r&&cc===c)||(r2===r&&c2===c)))continue;let or=rr===r&&cc===c?r2:rr,oc=rr===r&&cc===c?c2:cc,ov=s[or][oc];if(ov===-1)continue;let forced=rel==='='?ov:1-ov;if(forced===v)reasons.push(lang()==='fr'?`la relation ${rel} avec la case voisine impose ce symbole`:`the ${rel} relation with the adjacent cell forces this symbol`)}
  let triples=[[[r,c-2],[r,c-1]],[[r,c-1],[r,c+1]],[[r,c+1],[r,c+2]],[[r-2,c],[r-1,c]],[[r-1,c],[r+1,c]],[[r+1,c],[r+2,c]]];
  for(let pair of triples){let vals=pair.map(([rr,cc])=>rr>=0&&rr<6&&cc>=0&&cc<6?s[rr][cc]:-9);if(vals[0]===opp&&vals[1]===opp){reasons.push(lang()==='fr'?`deux ${opp===1?'soleils':'lunes'} voisins interdisent un troisième symbole identique`:`two adjacent ${opp===1?'suns':'moons'} prevent a third identical symbol`);break}}
  if(!reasons.length)reasons.push(lang()==='fr'?`ce ${sym} est compatible avec l’équilibre 3/3, les relations et la règle des trois`:`this ${sym} is compatible with the 3/3 balance, relations and no-three rule`);
  return reasons.join(lang()==='fr'?' ; ': '; ')
}
function queenReason(r,c){
  let z=current.reg[r][c],sameRegion=[],sameRow=[],sameCol=[];for(let rr=0;rr<current.n;rr++)for(let cc=0;cc<current.n;cc++)if(current.state[rr][cc]!==1){if(current.reg[rr][cc]===z)sameRegion.push([rr,cc]);if(rr===r)sameRow.push([rr,cc]);if(cc===c)sameCol.push([rr,cc])}
  let txt=lang()==='fr'?`cette case respecte la ligne ${r+1}, la colonne ${c+1}, la zone ${z+1} et la règle de non-adjacence.`:`this cell satisfies row ${r+1}, column ${c+1}, region ${z+1}, and the non-adjacency rule.`;
  if(sameRegion.length===1)txt+=(lang()==='fr'?' C’est la dernière case non barrée de sa zone.':' It is the last unmarked cell in its region.');
  return txt
}
function patchReason(r,c,id,cl){
  let piece=lang()==='fr'?`zone ${id+1}`:`region ${id+1}`,shape=cl.shape==='carré'?(lang()==='fr'?'carrée':'square'):cl.shape==='vertical'?(lang()==='fr'?'verticale':'vertical'):cl.shape==='horizontal'?(lang()==='fr'?'horizontale':'horizontal'):(lang()==='fr'?'rectangulaire':'rectangular');
  if(cl.mode==='both')return lang()==='fr'?`l’indice impose une zone ${shape} de ${cl.size} cases ; cette case appartient au rectangle compatible avec cet indice.`:`the clue requires a ${shape} region of ${cl.size} cells; this cell belongs to the rectangle compatible with that clue.`;
  if(cl.mode==='size')return lang()==='fr'?`l’indice impose ${cl.size} cases ; cette case est nécessaire pour compléter un rectangle de cette surface.`:`the clue requires ${cl.size} cells; this cell is needed to complete a rectangle of that area.`;
  if(cl.mode==='shape')return lang()==='fr'?`l’indice impose une forme ${shape} ; cette case prolonge la zone sans recouvrir un autre indice.`:`the clue requires a ${shape} shape; this cell extends the region without covering another clue.`;
  return lang()==='fr'?`cette case appartient à ${piece} dans l’unique découpage valide et n’introduit ni chevauchement ni second indice.`:`this cell belongs to ${piece} in the unique valid partition and creates neither overlap nor a second clue.`
}

function showNoLogicalHint(){showHintNotice(tr('noLogicalHint'));saveCurrent()}
const DETAILED_HINT_LANGS=new Set(['fr','en']);
function genericLocalizedHint(kind,target,rank,value){return gamePedagogy(kind).localizedHint({target,rank,value})}


const QUEEN_REGION_COLORS=['#f6d68a','#c9dca5','#b9d8e9','#d9c4e8','#f3b8ad','#b5dbc9','#e7c9a3','#c6c7e9','#c4dfd7'];
function queenWalkthroughRegionColor(i){return QUEEN_REGION_COLORS[i%QUEEN_REGION_COLORS.length]}
function queenZoneBadge(id){
  let color=QUEEN_REGION_COLORS[id%QUEEN_REGION_COLORS.length],label=tr('zone');
  return `<span class="queen-zone-ref"><span class="queen-zone-swatch" style="background:${color}" aria-hidden="true"></span>${label} ${id+1}</span>`
}
function queenCellAllowed(r,c){
  if(current.state[r][c]===1)return false;
  for(let rr=0;rr<current.n;rr++)for(let cc=0;cc<current.n;cc++)if(current.state[rr][cc]===2){
    if(rr===r||cc===c||current.reg[rr][cc]===current.reg[r][c]||(Math.abs(rr-r)<=1&&Math.abs(cc-c)<=1))return rr===r&&cc===c
  }
  return true
}
function queenDirectExclusionReason(r,c){
  for(let rr=0;rr<current.n;rr++)for(let cc=0;cc<current.n;cc++)if(current.state[rr][cc]===2){
    if(rr===r)return {technique:'Q_EXCLUSION_ROW',text:lang()==='fr'?`la ligne ${r+1} contient déjà une reine en ${cellName(rr,cc)}.`:`row ${r+1} already contains a queen at ${cellName(rr,cc)}.`};
    if(cc===c)return {technique:'Q_EXCLUSION_COLUMN',text:lang()==='fr'?`la colonne ${c+1} contient déjà une reine en ${cellName(rr,cc)}.`:`column ${c+1} already contains a queen at ${cellName(rr,cc)}.`};
    if(current.reg[rr][cc]===current.reg[r][c])return {technique:'Q_EXCLUSION_REGION',text:lang()==='fr'?`${queenZoneBadge(current.reg[r][c])} contient déjà une reine en ${cellName(rr,cc)}.`:`${queenZoneBadge(current.reg[r][c])} already contains a queen at ${cellName(rr,cc)}.`};
    if(Math.abs(rr-r)<=1&&Math.abs(cc-c)<=1)return {technique:'Q_EXCLUSION_ADJACENCY',text:lang()==='fr'?`${cellName(r,c)} est adjacente à la reine de ${cellName(rr,cc)}.`:`${cellName(r,c)} is adjacent to the queen at ${cellName(rr,cc)}.`};
  }
  return null
}
function findQueenLogicalHint(){
  let n=current.n,cands=Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>queenCellAllowed(r,c)));
  // First expose direct X deductions if auto-cross is disabled or some X is missing.
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.state[r][c]===0&&!cands[r][c]){
    let reason=queenDirectExclusionReason(r,c);if(reason)return {r,c,v:1,rank:0,why:reason.text,technique:reason.technique}
  }
  function forcedFrom(cells,reasonFr,reasonEn,technique){
    let open=cells.filter(([r,c])=>cands[r][c]&&current.state[r][c]!==2),q=cells.filter(([r,c])=>current.state[r][c]===2);
    if(!q.length&&open.length===1)return {r:open[0][0],c:open[0][1],v:2,rank:0,why:lang()==='fr'?reasonFr:reasonEn,technique}
    return null
  }
  for(let r=0;r<n;r++){let h=forcedFrom(Array.from({length:n},(_,c)=>[r,c]),`toutes les autres cases de la ligne ${r+1} sont exclues`,`all other cells in row ${r+1} are excluded; only one queen position remains.`,'Q_UNIQUE_ROW');if(h)return h}
  for(let c=0;c<n;c++){let h=forcedFrom(Array.from({length:n},(_,r)=>[r,c]),`toutes les autres cases de la colonne ${c+1} sont exclues.`,`all other cells in column ${c+1} are excluded.`,'Q_UNIQUE_COLUMN');if(h)return h}
  let ids=[...new Set(current.reg.flat())];
  for(let id of ids){let cells=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.reg[r][c]===id)cells.push([r,c]);let h=forcedFrom(cells,`toutes les autres cases de ${queenZoneBadge(id)} sont exclues : cette zone n’a plus qu’une seule place possible pour sa reine.`,`all other cells in ${queenZoneBadge(id)} are excluded; only one queen position remains.`,'Q_UNIQUE_REGION');if(h)return h}
  return null
}

function findTangoLogicalHint(){
  let s=current.state,n=6;
  function out(r,c,v,whyFr,whyEn,technique){if(r>=0&&r<n&&c>=0&&c<n&&s[r][c]===-1)return {r,c,v,why:lang()==='fr'?whyFr:whyEn,technique};return null}
  // 3/3 balance
  for(let r=0;r<n;r++){for(let v=0;v<=1;v++){let count=s[r].filter(x=>x===v).length;if(count===3)for(let c=0;c<n;c++){let h=out(r,c,1-v,`la ligne contient déjà 3 ${v===1?'soleils':'lunes'} ; les cases restantes doivent être des ${v===1?'lunes':'soleils'}.`,`the row already has 3 ${v===1?'suns':'moons'}; remaining cells must be ${v===1?'moons':'suns'}.`,'T_BALANCE_ROW');if(h)return h}}}
  for(let c=0;c<n;c++){for(let v=0;v<=1;v++){let count=0;for(let r=0;r<n;r++)if(s[r][c]===v)count++;if(count===3)for(let r=0;r<n;r++){let h=out(r,c,1-v,`la colonne contient déjà 3 ${v===1?'soleils':'lunes'} ; les cases restantes doivent être des ${v===1?'lunes':'soleils'}.`,`the column already has 3 ${v===1?'suns':'moons'}; remaining cells must be ${v===1?'moons':'suns'}.`,'T_BALANCE_COLUMN');if(h)return h}}}
  // no three: XX_ _XX X_X
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(s[r][c]===-1){
    let pairs=[[[r,c-2],[r,c-1]],[[r,c-1],[r,c+1]],[[r,c+1],[r,c+2]],[[r-2,c],[r-1,c]],[[r-1,c],[r+1,c]],[[r+1,c],[r+2,c]]];
    for(let pair of pairs){let a=pair[0],b=pair[1];if(a[0]>=0&&a[0]<n&&a[1]>=0&&a[1]<n&&b[0]>=0&&b[0]<n&&b[1]>=0&&b[1]<n){let va=s[a[0]][a[1]],vb=s[b[0]][b[1]];if(va!==-1&&va===vb)return {r,c,v:1-va,technique:'T_NO_THREE',why:lang()==='fr'?`deux symboles identiques encadrent ou précèdent cette case ; un troisième identique est interdit.`:`two identical symbols surround or precede this cell; a third identical symbol is forbidden.`}}}
  }
  // relation with known neighbor
  for(let [r,c,d,rel] of current.edges){let r2=d==='r'?r:r+1,c2=d==='r'?c+1:c,a=s[r][c],b=s[r2][c2];
    if(a===-1&&b!==-1)return {r,c,v:rel==='='?b:1-b,technique:rel==='='?'T_RELATION_EQUAL':'T_RELATION_OPPOSITE',why:lang()==='fr'?`la relation ${rel} avec la case voisine impose ce symbole.`:`the ${rel} relation with the adjacent cell forces this symbol.`};
    if(b===-1&&a!==-1)return {r:r2,c:c2,v:rel==='='?a:1-a,technique:rel==='='?'T_RELATION_EQUAL':'T_RELATION_OPPOSITE',why:lang()==='fr'?`la relation ${rel} avec la case voisine impose ce symbole.`:`the ${rel} relation with the adjacent cell forces this symbol.`}
  }
  return null
}

function findSudokuLogicalHint(){
  let empties=[];for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.empty.has(r*6+c)&&current.state[r][c]===0)empties.push([r,c]);
  for(let [r,c] of empties){let cand=sudokuCandidatesAt(r,c);if(cand.length===1)return {r,c,v:cand[0],technique:'S_NAKED_SINGLE',why:lang()==='fr'?`après élimination par la ligne, la colonne et le bloc 2×3, seul ${cand[0]} reste possible.`:`after elimination by the row, column and 2×3 box, only ${cand[0]} remains possible.`}}
  let units=[];for(let r=0;r<6;r++)units.push({cells:Array.from({length:6},(_,c)=>[r,c]),nameFr:`la ligne ${r+1}`,nameEn:`row ${r+1}`,technique:'S_HIDDEN_ROW'});for(let c=0;c<6;c++)units.push({cells:Array.from({length:6},(_,r)=>[r,c]),nameFr:`la colonne ${c+1}`,nameEn:`column ${c+1}`,technique:'S_HIDDEN_COLUMN'});
  for(let br=0;br<6;br+=2)for(let bc=0;bc<6;bc+=3){let cells=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)cells.push([r,c]);units.push({cells,nameFr:`le bloc ${Math.floor(br/2)+1}-${Math.floor(bc/3)+1}`,nameEn:`the 2×3 box at rows ${br+1}-${br+2}, columns ${bc+1}-${bc+3}`,technique:'S_HIDDEN_BOX'})}
  for(let u of units)for(let v=1;v<=6;v++){let places=u.cells.filter(([r,c])=>current.state[r][c]===0&&sudokuCandidatesAt(r,c).includes(v));if(places.length===1){let [r,c]=places[0];return {r,c,v,technique:u.technique,why:lang()==='fr'?`${v} n’a qu’une seule position possible dans ${u.nameFr}.`:`${v} has only one possible position in ${u.nameEn}.`}}}
  return null
}

// ===== Rank-1 inference: simulate one candidate, then reject it if the
// resulting visible state already contains a contradiction or leaves any
// required next placement with no legal candidate. No hidden solution is used.

function withTempCurrent(mutator,fn){
  let snap=current,clone={...current};
  if(current.state)clone.state=current.state.map(r=>[...r]);
  if(current.paint)clone.paint=current.paint.map(r=>[...r]);
  current=clone;
  try{mutator(clone);return fn(clone)}finally{current=snap}
}

// QUEENS
function queenStateContradiction(){
  if(queenIllegalCells().size)return true;
  let n=current.n;
  // Every row, column and region still needing a queen must retain >=1 legal cell.
  for(let r=0;r<n;r++){
    let q=false,open=false;for(let c=0;c<n;c++){if(current.state[r][c]===2)q=true;else if(queenCellAllowed(r,c))open=true}
    if(!q&&!open)return true
  }
  for(let c=0;c<n;c++){
    let q=false,open=false;for(let r=0;r<n;r++){if(current.state[r][c]===2)q=true;else if(queenCellAllowed(r,c))open=true}
    if(!q&&!open)return true
  }
  for(let id of [...new Set(current.reg.flat())]){
    let q=false,open=false;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.reg[r][c]===id){if(current.state[r][c]===2)q=true;else if(queenCellAllowed(r,c))open=true}
    if(!q&&!open)return true
  }
  return false
}
const QUEEN_HINT_BUDGET_MS=5000;
function hintBudgetExpired(deadline){return Number.isFinite(deadline)&&WebPlatform.clock.nowMs()>=deadline}
function queenHintTimeout(){return {timeout:true}}
function findQueenRank1Hint(deadline=Infinity){
  let n=current.n;
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(hintBudgetExpired(deadline))return queenHintTimeout();else if(current.state[r][c]===0&&queenCellAllowed(r,c)){
    let queenBad=withTempCurrent(x=>{x.state[r][c]=2},()=>queenStateContradiction());
    let xBad=withTempCurrent(x=>{x.state[r][c]=1},()=>queenStateContradiction());
    if(hintBudgetExpired(deadline))return queenHintTimeout();
    if(queenBad!==xBad){
      let v=queenBad?1:2,rej=v===2?1:2,w;
      if(rej===2)w=queenRank1PlacementFailure(r,c);
      else w=withTempCurrent(x=>{x.state[r][c]=1},()=>{
        let n=current.n;
        for(let rr=0;rr<n;rr++){let q=current.state[rr].some(z=>z===2),open=[];for(let cc=0;cc<n;cc++)if(current.state[rr][cc]===0&&queenCellAllowed(rr,cc))open.push([rr,cc]);if(!q&&!open.length)return {text:lang()==='fr'?`la ligne ${rr+1} n'aurait plus aucune case disponible pour sa reine.`:`row ${rr+1} would have no cell left for its queen.`}}
        for(let cc=0;cc<n;cc++){let q=false,open=[];for(let rr=0;rr<n;rr++){if(current.state[rr][cc]===2)q=true;else if(current.state[rr][cc]===0&&queenCellAllowed(rr,cc))open.push([rr,cc])}if(!q&&!open.length)return {text:lang()==='fr'?`la colonne ${cc+1} n'aurait plus aucune case disponible pour sa reine.`:`column ${cc+1} would have no cell left for its queen.`}}
        for(let id of [...new Set(current.reg.flat())]){let q=false,open=[];for(let rr=0;rr<n;rr++)for(let cc=0;cc<n;cc++)if(current.reg[rr][cc]===id){if(current.state[rr][cc]===2)q=true;else if(current.state[rr][cc]===0&&queenCellAllowed(rr,cc))open.push([rr,cc])}if(!q&&!open.length)return {text:lang()==='fr'?`${queenZoneBadge(id)} n'aurait plus aucune case disponible pour sa reine.`:`${queenZoneBadge(id)} would have no cell left for its queen.`}}
        return null
      });
      let badText=w&&w.text?w.text:(lang()==='fr'?'une ligne, une colonne ou une zone deviendrait impossible.':'a row, column, or region would become impossible.');
      return {r,c,v,rank:1,
        hypothesis:lang()==='fr'?`essayons ${rej===2?'une reine ♛':'un X'} en ${cellName(r,c)}.`:`try ${rej===2?'a queen ♛':'an X'} at ${cellName(r,c)}.`,
        consequence:badText,
        deadend:lang()==='fr'?`ce choix ne permet donc pas de terminer la grille en respectant une reine par ligne, colonne et zone.`:`this choice cannot lead to a completed grid with one queen per row, column, and region.`,
        conclusion:lang()==='fr'?`${cellName(r,c)} doit donc contenir ${v===2?'une reine ♛':'un X'}.`:`${cellName(r,c)} must therefore contain ${v===2?'a queen ♛':'an X'}.`,
        why:null}
    }
  }
  return null
}

// TANGO
function tangoImmediateContradiction(){
  let s=current.state,n=6;
  if(tangoIllegalCells().size)return true;
  for(let r=0;r<n;r++)for(let v=0;v<=1;v++){let count=s[r].filter(x=>x===v).length,empty=s[r].filter(x=>x===-1).length;if(count>3||count+empty<3)return true}
  for(let c=0;c<n;c++)for(let v=0;v<=1;v++){let count=0,empty=0;for(let r=0;r<n;r++){if(s[r][c]===v)count++;if(s[r][c]===-1)empty++}if(count>3||count+empty<3)return true}
  return false
}
function tangoCandidateLocallyLegal(r,c,v){
  if(current.state[r][c]!==-1)return false;
  return withTempCurrent(x=>{x.state[r][c]=v},()=>!tangoImmediateContradiction())
}
function tangoStateContradiction(){
  if(tangoImmediateContradiction())return true;
  // Rank-1 consistency: every unresolved cell must retain at least one legal symbol.
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]===-1){
    let ok0=tangoCandidateLocallyLegal(r,c,0),ok1=tangoCandidateLocallyLegal(r,c,1);
    if(!ok0&&!ok1)return true
  }
  return false
}
function findTangoRank1Hint(){
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]===-1){
    let direct0=tangoCandidateLocallyLegal(r,c,0),direct1=tangoCandidateLocallyLegal(r,c,1);
    if(!direct0||!direct1)continue;
    let bad=[];for(let v=0;v<=1;v++)bad[v]=withTempCurrent(x=>{x.state[r][c]=v},()=>tangoStateContradiction());
    if(bad[0]!==bad[1]){
      let v=bad[0]?1:0,rejected=1-v;
      let d=withTempCurrent(x=>{x.state[r][c]=rejected},()=>tangoRank1ContradictionDetail());
      let detail=d&&d.text?d.text:(lang()==='fr'?'une case suivante ne conserverait plus aucun symbole possible.':'a following cell would have no possible symbol left.');
      return {r,c,v,rank:1,
        hypothesis:lang()==='fr'?`essayons ${pieceName('tango',rejected)} en ${cellName(r,c)}.`:`try ${pieceName('tango',rejected)} at ${cellName(r,c)}.`,
        consequence:detail,
        deadend:lang()==='fr'?`ce choix conduit donc à une situation impossible dès le coup suivant.`:`this choice therefore creates an impossible situation on the next move.`,
        conclusion:lang()==='fr'?`${cellName(r,c)} doit contenir ${pieceName('tango',v)}.`:`${cellName(r,c)} must contain ${pieceName('tango',v)}.`,
        why:null}
    }
  }
  return null
}

// MINI SUDOKU
function sudokuImmediateContradiction(){
  if(sudokuIllegalCells().size)return true;
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]===0&&sudokuCandidatesAt(r,c).length===0)return true;
  // Every missing digit in every unit must still have a possible position.
  let units=[];for(let r=0;r<6;r++)units.push(Array.from({length:6},(_,c)=>[r,c]));for(let c=0;c<6;c++)units.push(Array.from({length:6},(_,r)=>[r,c]));
  for(let br=0;br<6;br+=2)for(let bc=0;bc<6;bc+=3){let a=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)a.push([r,c]);units.push(a)}
  for(let u of units)for(let v=1;v<=6;v++){
    if(u.some(([r,c])=>current.state[r][c]===v))continue;
    if(!u.some(([r,c])=>current.state[r][c]===0&&sudokuCandidatesAt(r,c).includes(v)))return true
  }
  return false
}

function sudokuContradictionDetail(){
  if(sudokuIllegalCells().size)return lang()==='fr'?'un chiffre est en conflit direct avec sa ligne, sa colonne ou son bloc.':'a digit directly conflicts with its row, column, or box.';
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]===0&&sudokuCandidatesAt(r,c).length===0)return lang()==='fr'?`${cellName(r,c)} n'aurait plus aucun chiffre possible.`:`${cellName(r,c)} would have no possible digit left.`;
  let units=[];for(let r=0;r<6;r++)units.push({name:lang()==='fr'?`la ligne ${r+1}`:`row ${r+1}`,cells:Array.from({length:6},(_,c)=>[r,c])});
  for(let c=0;c<6;c++)units.push({name:lang()==='fr'?`la colonne ${c+1}`:`column ${c+1}`,cells:Array.from({length:6},(_,r)=>[r,c])});
  for(let br=0;br<6;br+=2)for(let bc=0;bc<6;bc+=3){let a=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)a.push([r,c]);units.push({name:lang()==='fr'?`le bloc L${br+1}-${br+2}/C${bc+1}-${bc+3}`:`box R${br+1}-${br+2}/C${bc+1}-${bc+3}`,cells:a})}
  for(let u of units)for(let v=1;v<=6;v++)if(!u.cells.some(([r,c])=>current.state[r][c]===v)&&!u.cells.some(([r,c])=>current.state[r][c]===0&&sudokuCandidatesAt(r,c).includes(v)))return lang()==='fr'?`le chiffre ${v} n'aurait plus aucun emplacement possible dans ${u.name}.`:`digit ${v} would have no possible place in ${u.name}.`;
  return lang()==='fr'?'les contraintes du Sudoku deviendraient impossibles.':'the Sudoku constraints would become impossible.';
}
function findSudokuRank1Hint(){
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]===0&&current.empty.has(r*6+c)){
    let cand=sudokuCandidatesAt(r,c);if(cand.length<2)continue;
    let good=[],bad=[],details={};
    for(let v of cand){let contradiction=withTempCurrent(x=>{x.state[r][c]=v},()=>sudokuImmediateContradiction());(contradiction?bad:good).push(v);if(contradiction)details[v]=withTempCurrent(x=>{x.state[r][c]=v},()=>sudokuContradictionDetail())}
    if(good.length===1&&bad.length){
      let lines=bad.map(v=>`• ${v} : ${details[v]}`).join('<br>');
      return {r,c,v:good[0],rank:1,
        hypothesis:lang()==='fr'?`${cellName(r,c)} accepte d'abord les candidats ${cand.join(', ')}. Testons les autres possibilités.`:`${cellName(r,c)} initially allows candidates ${cand.join(', ')}. Test the alternatives.`,
        consequence:lines,
        deadend:lang()==='fr'?`tous les candidats sauf ${good[0]} créent immédiatement une impossibilité.`:`every candidate except ${good[0]} immediately creates an impossibility.`,
        conclusion:lang()==='fr'?`${cellName(r,c)} doit donc contenir ${good[0]}.`:`${cellName(r,c)} must therefore contain ${good[0]}.`,
        why:null}
    }
  }return null
}

// ===== Rank-2 inference =====
// A candidate that survived direct rules and rank 1 is simulated. The engine
// then looks one level deeper: if some required next decision has no
// rank-1-viable reply, the initial candidate is impossible.
// Functions return a witness so the hint can explain the chain:
// hypothesis -> consequence -> dead end -> conclusion.

function cellName(r,c){return lang()==='fr'?`L${r+1}C${c+1}`:`R${r+1}C${c+1}`}
function pieceName(kind,v){return gamePedagogy(kind).pieceName(v)}
function rank1Why(h){
  return `<span class="reason-step"><b>1. ${lang()==='fr'?'Essai':'Try'} :</b> ${h.hypothesis}</span>`+
         `<span class="reason-step"><b>2. ${lang()==='fr'?'Ce que cela provoque':'What happens'} :</b> ${h.consequence}</span>`+
         `<span class="reason-step dead"><b>3. ${lang()==='fr'?'Pourquoi ça bloque':'Why it fails'} :</b> ${h.deadend}</span>`+
         `<span class="reason-step conclusion"><b>4. ${tr('conclusion')} :</b> ${h.conclusion}</span>`
}
function rank2Why(h){
  return `<span class="reason-step"><b>1. ${tr('hypothesis')} :</b> ${h.hypothesis}</span>`+
         `<span class="reason-step"><b>2. ${tr('consequence')} :</b> ${h.consequence}</span>`+
         `<span class="reason-step dead"><b>3. ${tr('deadend')} :</b> ${h.deadend}</span>`+
         `<span class="reason-step conclusion"><b>4. ${tr('conclusion')} :</b> ${h.conclusion}</span>`
}
function rank3Why(h){
  return `<span class="reason-step"><b>1. ${tr('hypothesis')} :</b> ${h.hypothesis}</span>`+
         `<span class="reason-step"><b>2. ${lang()==='fr'?'Première conséquence':'First consequence'} :</b> ${h.consequence}</span>`+
         `<span class="reason-step"><b>3. ${lang()==='fr'?'Deuxième vérification':'Second check'} :</b> ${h.secondStep}</span>`+
         `<span class="reason-step dead"><b>4. ${tr('deadend')} :</b> ${h.deadend}</span>`+
         `<span class="reason-step conclusion"><b>5. ${tr('conclusion')} :</b> ${h.conclusion}</span>`
}


// TANGO rank 2

function tangoRejectReason(r,c,v){
  let s=current.state,n=6,name=pieceName('tango',v),opp=pieceName('tango',1-v);
  // three consecutive
  let line=s[r].slice();line[c]=v;
  for(let i=Math.max(0,c-2);i<=Math.min(c,3);i++)if(line[i]===v&&line[i+1]===v&&line[i+2]===v)
    return lang()==='fr'?`${name} formerait trois ${v===1?'soleils':'lunes'} consécutifs sur la ligne ${r+1}.`:`${name} would create three consecutive ${v===1?'suns':'moons'} in row ${r+1}.`;
  let col=Array.from({length:n},(_,rr)=>rr===r?v:s[rr][c]);
  for(let i=Math.max(0,r-2);i<=Math.min(r,3);i++)if(col[i]===v&&col[i+1]===v&&col[i+2]===v)
    return lang()==='fr'?`${name} formerait trois ${v===1?'soleils':'lunes'} consécutifs dans la colonne ${c+1}.`:`${name} would create three consecutive ${v===1?'suns':'moons'} in column ${c+1}.`;
  // balance
  if(line.filter(x=>x===v).length>3)return lang()==='fr'?`il y aurait plus de 3 ${v===1?'soleils':'lunes'} sur la ligne ${r+1}.`:`row ${r+1} would contain more than 3 ${v===1?'suns':'moons'}.`;
  if(col.filter(x=>x===v).length>3)return lang()==='fr'?`il y aurait plus de 3 ${v===1?'soleils':'lunes'} dans la colonne ${c+1}.`:`column ${c+1} would contain more than 3 ${v===1?'suns':'moons'}.`;
  // equality / opposite relation
  for(let [er,ec,d,rel] of current.edges){
    let r2=d==='r'?er:er+1,c2=d==='r'?ec+1:ec;
    if(!((er===r&&ec===c)||(r2===r&&c2===c)))continue;
    let or=er===r&&ec===c?r2:er,oc=er===r&&ec===c?c2:ec,ov=s[or][oc];
    if(ov===-1)continue;
    let ok=rel==='='?v===ov:v!==ov;
    if(!ok)return lang()==='fr'
      ?`${name} ne respecterait pas la relation « ${rel} » avec ${cellName(or,oc)} (${pieceName('tango',ov)}).`
      :`${name} would violate the “${rel}” relation with ${cellName(or,oc)} (${pieceName('tango',ov)}).`;
  }
  return lang()==='fr'?`${name} rendrait immédiatement les contraintes de cette ligne ou colonne impossibles.`:`${name} would immediately make the row or column constraints impossible.`
}

function tangoRank1ContradictionDetail(){
  if(tangoImmediateContradiction())return {text:lang()==='fr'?'les règles sont déjà violées immédiatement.':'the rules are already violated immediately.'};
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]===-1){
    let ok0=tangoCandidateLocallyLegal(r,c,0),ok1=tangoCandidateLocallyLegal(r,c,1);
    if(!ok0&&!ok1)return {r,c,text:lang()==='fr'
      ?`${cellName(r,c)} devient impossible :<br>&nbsp;&nbsp;– lune ☾ : ${tangoRejectReason(r,c,0)}<br>&nbsp;&nbsp;– soleil ☀ : ${tangoRejectReason(r,c,1)}`
      :`${cellName(r,c)} becomes impossible:<br>&nbsp;&nbsp;– moon ☾: ${tangoRejectReason(r,c,0)}<br>&nbsp;&nbsp;– sun ☀: ${tangoRejectReason(r,c,1)}`}
  }
  return null
}
function tangoRank2WitnessAfterAssumption(){
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]===-1){
    let viable=[],reasons={};
    for(let v=0;v<=1;v++){
      if(!tangoCandidateLocallyLegal(r,c,v)){reasons[v]=tangoRejectReason(r,c,v);continue}
      let bad=withTempCurrent(x=>{x.state[r][c]=v},()=>tangoStateContradiction());
      if(!bad)viable.push(v);else{
        let d=withTempCurrent(x=>{x.state[r][c]=v},()=>tangoRank1ContradictionDetail());
        reasons[v]=d&&d.text?d.text:(lang()==='fr'?`${pieceName('tango',v)} conduit à une contradiction.`:`${pieceName('tango',v)} leads to a contradiction.`)
      }
    }
    if(!viable.length)return {r,c,reasons,detail:lang()==='fr'
      ?`${cellName(r,c)} ne peut plus recevoir aucun symbole.`
      :`${cellName(r,c)} can no longer take either symbol.`}
  }
  return null
}
function findTangoRank2Hint(){
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]===-1){
    let surviving=[];
    for(let v=0;v<=1;v++){
      if(!tangoCandidateLocallyLegal(r,c,v))continue;
      let rank1Bad=withTempCurrent(x=>{x.state[r][c]=v},()=>tangoStateContradiction());
      if(!rank1Bad)surviving.push(v)
    }
    if(surviving.length<2)continue;
    let bad=[],witness={};
    for(let v of surviving){
      let w=withTempCurrent(x=>{x.state[r][c]=v},()=>tangoRank2WitnessAfterAssumption());
      if(w){bad.push(v);witness[v]=w}
    }
    let good=surviving.filter(v=>!bad.includes(v));
    if(good.length===1&&bad.length){
      let v=good[0],rej=bad[0],w=witness[rej];
      return {r,c,v,rank:2,
        hypothesis:lang()==='fr'?`supposons ${cellName(r,c)} = ${pieceName('tango',rej)}.`:`suppose ${cellName(r,c)} = ${pieceName('tango',rej)}.`,
        consequence:lang()==='fr'
          ?`regardons alors ${cellName(w.r,w.c)} :<br>• si on y place une lune ☾ : ${w.reasons[0]||'ce choix conduit à une contradiction.'}<br>• si on y place un soleil ☀ : ${w.reasons[1]||'ce choix conduit à une contradiction.'}`
          :`now look at ${cellName(w.r,w.c)}:<br>• if we place a moon ☾: ${w.reasons[0]||'this choice leads to a contradiction.'}<br>• if we place a sun ☀: ${w.reasons[1]||'this choice leads to a contradiction.'}`,
        deadend:lang()==='fr'?`${cellName(w.r,w.c)} n'a donc plus aucune valeur possible. Notre hypothèse de départ est impossible.`:`${cellName(w.r,w.c)} therefore has no possible value. Our initial assumption is impossible.`,
        conclusion:lang()==='fr'?`${pieceName('tango',rej)} est donc impossible en ${cellName(r,c)} ; il faut placer ${pieceName('tango',v)}.`:`${pieceName('tango',rej)} is therefore impossible at ${cellName(r,c)}; place ${pieceName('tango',v)}.`,
        why:null}
    }
  }
  return null
}

// SUDOKU rank 2
function sudokuRank2WitnessAfterAssumption(){
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]===0){
    let cand=sudokuCandidatesAt(r,c),viable=[];
    for(let v of cand){
      let bad=withTempCurrent(x=>{x.state[r][c]=v},()=>sudokuImmediateContradiction());
      if(!bad)viable.push(v)
    }
    if(!viable.length)return {r,c,detail:lang()==='fr'
      ?`${cellName(r,c)} n'a plus aucun chiffre possible.`
      :`${cellName(r,c)} has no possible digit left.`}
  }
  return null
}
function findSudokuRank2Hint(){
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]===0&&current.empty.has(r*6+c)){
    let cand=sudokuCandidatesAt(r,c);if(cand.length<2)continue;
    let surviving=cand.filter(v=>!withTempCurrent(x=>{x.state[r][c]=v},()=>sudokuImmediateContradiction()));
    if(surviving.length<2)continue;
    let bad=[],witness={};
    for(let v of surviving){
      let w=withTempCurrent(x=>{x.state[r][c]=v},()=>sudokuRank2WitnessAfterAssumption());
      if(w){bad.push(v);witness[v]=w}
    }
    let good=surviving.filter(v=>!bad.includes(v));
    if(good.length===1&&bad.length){
      let v=good[0],rej=bad[0],w=witness[rej];
      return {r,c,v,rank:2,
        hypothesis:lang()==='fr'?`supposons ${cellName(r,c)} = ${rej}.`:`suppose ${cellName(r,c)} = ${rej}.`,
        consequence:lang()==='fr'?`on recalcule les candidats des cases voisines et des unités concernées.`:`we recompute candidates in the affected cells and units.`,
        deadend:w.detail,
        conclusion:lang()==='fr'?`${rej} est impossible en ${cellName(r,c)} ; le chiffre ${v} est imposé.`:`${rej} is impossible at ${cellName(r,c)}; digit ${v} is forced.`,
        why:null}
    }
  }
  return null
}

// QUEENS rank 2

function queenPlacementRejectReason(r,c){
  if(current.state[r][c]===1)return lang()==='fr'?`${cellName(r,c)} est déjà barrée par X.`:`${cellName(r,c)} is already marked X.`;
  for(let rr=0;rr<current.n;rr++)for(let cc=0;cc<current.n;cc++)if(current.state[rr][cc]===2){
    if(rr===r)return lang()==='fr'?`la ligne ${r+1} contient déjà une reine en ${cellName(rr,cc)}.`:`row ${r+1} already contains a queen at ${cellName(rr,cc)}.`;
    if(cc===c)return lang()==='fr'?`la colonne ${c+1} contient déjà une reine en ${cellName(rr,cc)}.`:`column ${c+1} already contains a queen at ${cellName(rr,cc)}.`;
    if(current.reg[rr][cc]===current.reg[r][c])return lang()==='fr'?`${queenZoneBadge(current.reg[r][c])} contient déjà une reine en ${cellName(rr,cc)}.`:`${queenZoneBadge(current.reg[r][c])} already contains a queen at ${cellName(rr,cc)}.`;
    if(Math.abs(rr-r)<=1&&Math.abs(cc-c)<=1)return lang()==='fr'?`${cellName(r,c)} touche diagonalement la reine de ${cellName(rr,cc)}.`:`${cellName(r,c)} touches the queen at ${cellName(rr,cc)} diagonally.`;
  }
  return null
}
function queenRank1PlacementFailure(r,c){
  // Called while testing a queen in r,c. Explain the first unit that becomes impossible.
  return withTempCurrent(x=>{x.state[r][c]=2},()=>{
    if(queenIllegalCells().size)return {text:queenPlacementRejectReason(r,c)|| (lang()==='fr'?'ce placement crée un conflit de reines.':'this placement creates a queen conflict.')};
    let n=current.n;
    for(let rr=0;rr<n;rr++){
      if(current.state[rr].some(v=>v===2))continue;
      let possible=[];
      for(let cc=0;cc<n;cc++)if(current.state[rr][cc]===0&&queenCellAllowed(rr,cc))possible.push([rr,cc]);
      if(!possible.length)return {type:'row',i:rr,text:lang()==='fr'?`la ligne ${rr+1} n'aurait alors plus aucune case où placer sa reine.`:`row ${rr+1} would then have no cell left for its queen.`}
    }
    for(let cc=0;cc<n;cc++){
      let has=false;for(let rr=0;rr<n;rr++)if(current.state[rr][cc]===2)has=true;if(has)continue;
      let possible=[];for(let rr=0;rr<n;rr++)if(current.state[rr][cc]===0&&queenCellAllowed(rr,cc))possible.push([rr,cc]);
      if(!possible.length)return {type:'col',i:cc,text:lang()==='fr'?`la colonne ${cc+1} n'aurait alors plus aucune case où placer sa reine.`:`column ${cc+1} would then have no cell left for its queen.`}
    }
    for(let id of [...new Set(current.reg.flat())]){
      let has=false,cells=[];for(let rr=0;rr<n;rr++)for(let cc=0;cc<n;cc++)if(current.reg[rr][cc]===id){if(current.state[rr][cc]===2)has=true;else if(current.state[rr][cc]===0&&queenCellAllowed(rr,cc))cells.push([rr,cc])}
      if(!has&&!cells.length)return {type:'region',i:id,text:lang()==='fr'?`${queenZoneBadge(id)} n'aurait alors plus aucune case où placer sa reine.`:`${queenZoneBadge(id)} would then have no cell left for its queen.`}
    }
    return null
  })
}
function queenUnitViableWithRank1(){
  let n=current.n;
  function inspect(cells,type,i){
    let candidates=cells.filter(([r,c])=>current.state[r][c]===0&&queenCellAllowed(r,c));
    let failures=[];
    for(let [r,c] of candidates){
      let failure=queenRank1PlacementFailure(r,c);
      if(!failure)return null; // at least one continuation survives
      failures.push({r,c,text:failure.text});
    }
    if(!candidates.length||failures.length===candidates.length)return {type,i,candidates,failures}
    return null
  }
  for(let r=0;r<n;r++){
    if(current.state[r].some(v=>v===2))continue;
    let w=inspect(Array.from({length:n},(_,c)=>[r,c]),'row',r);if(w)return w
  }
  for(let c=0;c<n;c++){
    let has=false;for(let r=0;r<n;r++)if(current.state[r][c]===2)has=true;if(has)continue;
    let w=inspect(Array.from({length:n},(_,r)=>[r,c]),'col',c);if(w)return w
  }
  for(let id of [...new Set(current.reg.flat())]){
    let cells=[],has=false;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.reg[r][c]===id){cells.push([r,c]);if(current.state[r][c]===2)has=true}
    if(has)continue;let w=inspect(cells,'region',id);if(w)return w
  }
  return null
}

function queenUnitName(u){
  return lang()==='fr'
    ?(u.type==='row'?`la ligne ${u.i+1}`:u.type==='col'?`la colonne ${u.i+1}`:`la ${queenZoneBadge(u.i)}`)
    :(u.type==='row'?`row ${u.i+1}`:u.type==='col'?`column ${u.i+1}`:`the ${queenZoneBadge(u.i)}`)
}
function queenUnresolvedUnits(){
  let n=current.n,out=[];
  for(let r=0;r<n;r++)if(!current.state[r].some(v=>v===2)){let cells=[];for(let c=0;c<n;c++)if(current.state[r][c]===0&&queenCellAllowed(r,c))cells.push([r,c]);out.push({type:'row',i:r,cells})}
  for(let c=0;c<n;c++){let has=false,cells=[];for(let r=0;r<n;r++){if(current.state[r][c]===2)has=true;else if(current.state[r][c]===0&&queenCellAllowed(r,c))cells.push([r,c])}if(!has)out.push({type:'col',i:c,cells})}
  for(let id of [...new Set(current.reg.flat())]){let has=false,cells=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.reg[r][c]===id){if(current.state[r][c]===2)has=true;else if(current.state[r][c]===0&&queenCellAllowed(r,c))cells.push([r,c])}if(!has)out.push({type:'region',i:id,cells})}
  out.sort((a,b)=>a.cells.length-b.cells.length);return out
}
function queenImmediateContradictionDetail(){
  if(queenIllegalCells().size)return lang()==='fr'?'deux reines entrent immédiatement en conflit.':'two queens immediately conflict.';
  for(let u of queenUnresolvedUnits())if(!u.cells.length)return lang()==='fr'?`${queenUnitName(u)} n’a plus aucune case disponible pour sa reine.`:`${queenUnitName(u)} has no cell left for its queen.`;
  return lang()==='fr'?'les contraintes deviennent immédiatement impossibles.':'the constraints immediately become impossible.';
}
function queenBoundedContradiction(depth,deadline){
  if(hintBudgetExpired(deadline))return queenHintTimeout();
  if(queenStateContradiction())return {bad:true,reason:queenImmediateContradictionDetail()};
  if(depth<=0)return null;
  let units=queenUnresolvedUnits().filter(u=>u.cells.length);
  // Most-constrained units first. Testing at most the first 4 keeps the proof bounded and responsive.
  for(let u of units.slice(0,4)){
    if(hintBudgetExpired(deadline))return queenHintTimeout();
    let failures=[],allBad=true;
    for(let [r,c] of u.cells){
      if(hintBudgetExpired(deadline))return queenHintTimeout();
      let child=withTempCurrent(x=>{x.state[r][c]=2},()=>queenBoundedContradiction(depth-1,deadline));
      if(child?.timeout)return child;
      if(!child?.bad){allBad=false;break}
      failures.push({r,c,child})
    }
    if(allBad&&failures.length===u.cells.length)return {bad:true,unit:u,failures}
  }
  return null
}
function queenRank3BranchSummary(w){
  if(!w)return '';
  if(w.reason)return w.reason;
  let unit=queenUnitName(w.unit),items=(w.failures||[]).slice(0,5).map(f=>{
    let child=f.child,why=child?.reason||(child?.unit?(lang()==='fr'?`${queenUnitName(child.unit)} devient à son tour impossible.`:`${queenUnitName(child.unit)} then becomes impossible.`):(lang()==='fr'?'la branche conduit à une impasse.':'the branch reaches a dead end.'));
    return `• ${cellName(f.r,f.c)} : ${why}`
  });
  return (lang()==='fr'?`${unit} doit recevoir une reine. Testons ses positions possibles :`:`${unit} must receive a queen. Test its possible positions:`)+`<br>${items.join('<br>')}`
}
function findQueenRank3Hint(deadline=Infinity){
  let n=current.n;
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    if(hintBudgetExpired(deadline))return queenHintTimeout();
    if(current.state[r][c]!==0||!queenCellAllowed(r,c))continue;
    let candidates=[1,2],results={};
    for(let v of candidates){
      if(hintBudgetExpired(deadline))return queenHintTimeout();
      let w=withTempCurrent(x=>{x.state[r][c]=v},()=>queenBoundedContradiction(2,deadline));
      if(w?.timeout)return w;results[v]=w
    }
    let bad=candidates.filter(v=>results[v]?.bad),good=candidates.filter(v=>!results[v]?.bad);
    if(good.length===1&&bad.length===1){
      let v=good[0],rej=bad[0],w=results[rej],first=w.unit?queenUnitName(w.unit):(lang()==='fr'?'une contrainte obligatoire':'a required constraint');
      return {r,c,v,rank:3,
        hypothesis:lang()==='fr'?`essayons ${rej===2?'une reine ♛':'un X'} en ${cellName(r,c)}.`:`try ${rej===2?'a queen ♛':'an X'} at ${cellName(r,c)}.`,
        consequence:lang()==='fr'?`cette hypothèse oblige ensuite à résoudre ${first}.`:`this assumption then forces us to resolve ${first}.`,
        secondStep:queenRank3BranchSummary(w),
        deadend:lang()==='fr'?`toutes les continuations testées à ce niveau conduisent à une impasse. L’hypothèse de départ est donc impossible.`:`every continuation tested at this level reaches a dead end. The initial assumption is impossible.`,
        conclusion:lang()==='fr'?`${cellName(r,c)} doit donc contenir ${v===2?'une reine ♛':'un X'}.`:`${cellName(r,c)} must therefore contain ${v===2?'a queen ♛':'an X'}.`,
        why:null}
    }
  }
  return null
}
function findQueenRank2Hint(deadline=Infinity){
  let n=current.n;
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(hintBudgetExpired(deadline))return queenHintTimeout();else if(current.state[r][c]===0&&queenCellAllowed(r,c)){
    let opts=[1,2],surviving=opts.filter(v=>!withTempCurrent(x=>{x.state[r][c]=v},()=>queenStateContradiction()));
    if(surviving.length<2)continue;
    let bad=[],witness={};
    for(let v of surviving){
      let w=withTempCurrent(x=>{x.state[r][c]=v},()=>queenUnitViableWithRank1());
      if(hintBudgetExpired(deadline))return queenHintTimeout();
      if(w){bad.push(v);witness[v]=w}
    }
    let good=surviving.filter(v=>!bad.includes(v));
    if(good.length===1&&bad.length){
      let v=good[0],rej=bad[0],w=witness[rej],unit=queenUnitName(w);
      let details=(w.failures||[]).map(f=>`• ${cellName(f.r,f.c)} : ${f.text}`).join('<br>');
      if(!details)details=lang()==='fr'?`aucune case n'y reste disponible pour une reine.`:`no cell remains available there for a queen.`;
      return {r,c,v,rank:2,
        hypothesis:lang()==='fr'?`essayons ${rej===2?'une reine ♛':'un X'} en ${cellName(r,c)}.`:`try ${rej===2?'a queen ♛':'an X'} at ${cellName(r,c)}.`,
        consequence:lang()==='fr'?`avec cette hypothèse, regardons ${unit}. Les emplacements de reine qui restent apparemment possibles sont testés un par un :<br>${details}`:`with that assumption, look at ${unit}. Each apparently possible queen position is tested:<br>${details}`,
        deadend:lang()==='fr'?`aucun de ces emplacements ne permet de continuer. ${unit} finirait donc sans aucune position possible pour sa reine.`:`none of these positions allows the puzzle to continue. ${unit} would therefore be left with no possible queen position.`,
        conclusion:lang()==='fr'?`${pieceName('queens',rej)} est impossible en ${cellName(r,c)} ; il faut ${v===2?'y placer une reine ♛':'barrer cette case par X'}.`:`${pieceName('queens',rej)} is impossible at ${cellName(r,c)}; ${v===2?'place a queen ♛ there':'mark that cell X'}.`,
        why:null}
    }
  }
  return null
}

function coachLookText(kind,target,message={}){return gamePedagogy(kind).coachLookText({target,message,current})}
function coachRuleText(message={}){
  let id=message?.reasoning?.technique;
  if(id&&PEDAGOGY_TECHNIQUES[id])return `<span class="coach-technique-title">${techniqueTitle(id)}</span><code class="coach-technique-id">${id}</code><span class="coach-technique-summary">${techniqueSummary(id)}</span>`;
  let rank=Math.max(0,Math.min(3,Number(message.rank)||0));
  return rank===0?tr('directReason'):tr(`rank${rank}`)
}
function coachUsage(stage,technique=null){
  if(!current)return;
  let u=current.coachUsage||(current.coachUsage={where:0,rule:0,why:0,reveal:0,maxStage:0,techniques:{},flowVersion:2});
  if(!u.techniques)u.techniques={};u.flowVersion=2;
  let k=['','where','why','reveal'][stage];if(k)u[k]=(u[k]||0)+1;
  u.maxStage=Math.max(u.maxStage||0,stage);
  if(technique&&PEDAGOGY_TECHNIQUES[technique]){
    let t=u.techniques[technique]||(u.techniques[technique]={where:0,rule:0,why:0,reveal:0});
    if(k)t[k]=(t[k]||0)+1;
    if(k)masteryRecord(technique,{where:'where3',why:'why3',reveal:'reveal3'}[k]||k)
  }
}
function hintStage(kind,target,message,apply){
  if(!DETAILED_HINT_LANGS.has(lang())&&message.rank!=null&&message?.reasoning?.source!=='sudoku-inference-engine'){let g=genericLocalizedHint(kind,target,message.rank,message.value);message={...message,...g}}
  if(message.reasoning)current.lastReasoning=message.reasoning;
  let technique=message?.reasoning?.technique||null,isNew=!current.hintFlow||current.hintFlow.kind!==kind||current.hintFlow.key!==target.join(',')||current.hintFlow.plan?.flowVersion!==2;
  if(isNew){
    let plan=adaptiveCoachPlan(technique);
    current.hintFlow={kind,key:target.join(','),stage:0,plan};
  }
  let h=current.hintFlow,previous=h.stage||0,next=isNew?Math.max(1,Math.min(2,h.plan?.entryStage||1)):Math.min(3,previous+1);
  h.stage=next;
  for(let s=previous+1;s<=next;s++)coachUsage(s,technique);
  if(technique)current.masteryPendingAid={technique,stage:h.stage,target:[...target]};
  clearHintFocus();
  if(h.stage===1)focusHintContext(kind,target,message);else focusHint(target);
  let progress=`<span class="coach-progress">${h.stage}/3</span>`,note=adaptiveCoachNote(h.plan),blocks=[];
  // If adaptation jumps on the first request, show every level actually delivered.
  for(let s=(isNew?1:h.stage);s<=h.stage;s++)blocks.push(coachStageBlock(s,kind,target,message));
  if(h.stage<3){
    showHintNotice(`${progress}${blocks.join('<br>')}${note}`)
  }else{
    let before=historySnapshotKey();markHintUsed();updateScoreFlags();apply();
    historyRecord({type:'COACH_APPLY',reasoning:message.reasoning||null,coachStage:3,coachFlowVersion:2,adaptivePlan:h.plan||null},before);
    current.hintFlow=null;
    showHintNotice(`${progress}${coachStageBlock(3,kind,target,message)}${note}`);
    haptic(12)
  }
  saveCurrent();if(current?.trainingPendingComplete){current.trainingPendingComplete=false;finishTrainingExercise()}
}
function focusHint([r,c]){let board=document.querySelector('.board');if(!board)return;let n=current.n||6,d=board.children[r*n+c];if(d)d.classList.add('hint-focus')}
function focusHintContext(kind,[r,c],message={}){
  let board=document.querySelector('.board');if(!board)return;let n=current.n||6,cells=[...board.children],add=(rr,cc)=>{let d=cells[rr*n+cc];if(d)d.classList.add('hint-context')};
  for(let i=0;i<n;i++){add(r,i);add(i,c)}
  for(let cell of gamePedagogy(kind).coachContextCells({target:[r,c],message,current})||[])add(cell[0],cell[1])
}
function clearHintFocus(){document.querySelectorAll('.hint-focus,.hint-context').forEach(x=>{x.classList.remove('hint-focus');x.classList.remove('hint-context')})}
function touchSave(fn,action='MOVE'){return()=>{if(paused)return;let before=historySnapshotKey();closeHintNotice();current.hintFlow=null;clearHintFocus();fn();historyRecord(action,before);saveCurrent()}}
// QUEENS


function maybeAutoFinish(){
  if(!current||current.completed||paused||current.training)return false;
  let result=validateRegisteredVictory(current,{strictGeneratedSolution:true});
  if(result.solved){finish(`${tr('congrats')} ${gameLabel(current.game)}`);return true}
  return false
}
function celebrateBoard(){
  let board=document.querySelector('.board');if(!board)return;
  board.classList.add('board-complete');
  if(current?.game==='queens'||board.id==='qboard')board.classList.add('queens-win');
  [...board.children].forEach((cell,i)=>{cell.style.setProperty('--win-delay',`${Math.min(i,80)*16}ms`);cell.classList.add('win-pop')});
  let layer=document.createElement('div');layer.className='celebration-layer';layer.setAttribute('aria-hidden','true');
  for(let i=0;i<22;i++){let p=document.createElement('i');p.style.setProperty('--x',`${8+Math.random()*84}%`);p.style.setProperty('--dx',`${-55+Math.random()*110}px`);p.style.setProperty('--delay',`${Math.random()*220}ms`);p.style.setProperty('--rot',`${Math.random()*500-250}deg`);layer.appendChild(p)}
  document.body.appendChild(layer);
  setTimeout(()=>{layer.remove();board?.classList.remove('board-complete');board?.querySelectorAll('.win-pop').forEach(x=>{x.classList.remove('win-pop');x.style.removeProperty('--win-delay')})},1700)
}
// 27.3 — registry-driven Web UI lifecycle. Game-specific renderer factories are resolved lazily through GameRegistry.
let webGameUiAdapterCollection=null;
function pedagogicalHintForGame(game){return gamePedagogy(game).runCoachHint()}
function webGameUiDependencies(game){
  return {
    document,window:typeof window!=='undefined'?window:{addEventListener(){},matchMedia:null},query:$,getApp:()=>app,shell,gameLabel,
    difficultyLabel:diff=>DIFF[diff],tr,gameRules,regionColors:QUEEN_REGION_COLORS,getCurrent:()=>current,getWalkthroughSession:()=>walkthroughSession,
    isPaused:()=>paused,getPrefs:prefs,savePrefs,touchSave,historySnapshotKey,historyRecord,saveCurrent,closeHintNotice,clearHintFocus,
    captureRejectedPatchError,markBacktrack,haptic,maybeAutoFinish,a11ySetupGrid,a11yAnnounce,a11yCoord,a11ySetCell,keyCell,
    queenIllegalCells,tangoIllegalCells,sudokuIllegalCells,patchIllegalCells,applyIllegalClasses,applyConfiguredIllegalClasses,
    applyUnjustifiedHighlights,updateScoreFlags,coarsePointer,patchEmptyEvidence,checkVictory:checkRegisteredVictory,
    hint:()=>pedagogicalHintForGame(game),finish,showToast,requestFrame:cb=>requestAnimationFrame(cb),cancelFrame:id=>cancelAnimationFrame(id),
    setTimer:(cb,ms)=>setTimeout(cb,ms),getResizeObserver:()=>typeof ResizeObserver==='function'?ResizeObserver:null
  }
}
function createWebGameUiAdapter(game){
  const lifecycle=GameRegistry.requireCapability(game,'uiLifecycle');
  return lifecycle.createAdapter(webGameUiDependencies(game))
}
function webGameUiAdapters(){
  if(webGameUiAdapterCollection)return webGameUiAdapterCollection;
  if(typeof QuadludGameUiAdapters==='undefined')throw new Error('QUADLUD Web UI adapter collection unavailable');
  webGameUiAdapterCollection=QuadludGameUiAdapters.createCollection(GameRegistry.IDS,createWebGameUiAdapter);
  return webGameUiAdapterCollection
}
function gameWebUi(game=current?.game){
  if(!game)throw new Error('QUADLUD Web UI game unavailable');
  return webGameUiAdapters().require(game)
}
function renderGameUi(session=current){if(!session?.game)return false;return gameWebUi(session.game).render(session)}
function drawGameUi(session=current){if(!session?.game)return false;return gameWebUi(session.game).draw()}
function resetGameUi(session=current){if(!session?.game)return false;return gameWebUi(session.game).reset(session)}
// COURONNES — Web renderer/input implementation lives in queens-ui.js (v2.27 migration 27.1C).
function queenHintNoResultMessage(elapsedMs){
  if(!DETAILED_HINT_LANGS.has(lang()))return `<b>${tr('noLogicalHint')}</b><br>${tr('hintNoR0')}<br>${tr('hintNoR1')}<br>${tr('hintNoR2')}<br>${tr('hintNoR3')}`;
  let e=(elapsedMs/1000).toFixed(2).replace('.',lang()==='fr'?',':'.');
  return lang()==='fr'
    ?`<b>Aucun indice trouvé jusqu’au rang 3.</b><br>${tr('hintNoR0')}<br>${tr('hintNoR1')}<br>${tr('hintNoR2')}<br>${tr('hintNoR3')}<br><small>Recherche terminée en ${e} s. Cela ne signifie pas que la grille est bloquée : seulement qu’aucun coup n’est forcé à cette profondeur.</small>`
    :`<b>No hint found through rank 3.</b><br>${tr('hintNoR0')}<br>${tr('hintNoR1')}<br>${tr('hintNoR2')}<br>${tr('hintNoR3')}<br><small>Search completed in ${e} s. This does not mean the puzzle is stuck; only that no move is forced at this depth.</small>`
}
function queenHintTimeoutMessage(stage,elapsedMs){
  if(!DETAILED_HINT_LANGS.has(lang()))return `<b>${tr('hintTimeout')}</b>`;
  let e=(elapsedMs/1000).toFixed(2).replace('.',lang()==='fr'?',':'.');
  return lang()==='fr'
    ?`<b>Recherche arrêtée après ${e} s.</b><br>Les rangs précédents ont été testés sans trouver d’indice. La limite de 5 secondes a été atteinte pendant le <b>rang ${stage}</b> ; ce niveau n’a donc pas été exploré complètement. Aucun indice non démontré n’est affiché.`
    :`<b>Search stopped after ${e} s.</b><br>Earlier ranks were tested without finding a hint. The 5-second limit was reached during <b>rank ${stage}</b>, so that level was not fully explored. No unproved hint is shown.`
}
let queenHintSearchToken=0;
function hintQ(){
  if(current?.training)return trainingCoach();
  if(paused){showHintNotice(tr('hintPaused'));return}
  if(!current||current.game!=='queens'){showHintNotice(tr('noLogicalHint'));return}
  if(showVisibleErrorsBeforeHint())return;
  if(showExplorationContradictionBeforeHint())return;
  let token=++queenHintSearchToken;showHintNotice(tr('hintSearching'));
  setTimeout(()=>{
    if(token!==queenHintSearchToken||!current||current.game!=='queens')return;
    try{
      let result=queenCurrentLogicResult();
      if(result.contradiction){queenShowLogicalContradiction(result.contradiction);return}
      if(!result.deduction){showHintNotice(`<b>${tr('noLogicalHint')}</b><br>${tr('qlNoDeduction')}`);return}
      queenCoachHandleDeduction(result.deduction)
    }catch(err){console.error('Queens proof engine failed',err);showHintNotice(`<b>${tr('hintError')}</b>`)}
  },0)
}

// TANGO — Web renderer/input implementation lives in tango-ui.js (v2.27 migration 27.1A).
function hintT(){if(current?.training)return trainingCoach();if(paused)return;if(showVisibleErrorsBeforeHint())return;if(showExplorationContradictionBeforeHint())return;current.tangoPendingCell=null;try{let result=tangoCurrentLogicResult();if(result.contradiction){current.hintFlow=null;clearHintFocus();let cells=result.contradiction.cells||[];let b=$('#tboard');if(b)for(let [r,c] of cells){let el=b.children[r*6+c];if(el)el.classList.add('error-focus')}showHintNotice(`<b>⚠ ${tr('contradictionFound')}</b><br>${tangoReasoningPresenter().contradictionText(result.contradiction)}`);return}if(!result.deduction)return showHintNotice(`<b>${tr('noLogicalHint')}</b><br>${tr('tlgNoDeduction')}`);tangoCoachHandleDeduction(result.deduction)}catch(err){console.error('Soleil/Lune proof engine failed',err);showHintNotice(`<b>${tr('hintError')}</b>`)}}

// MINI SUDOKU 6x6 regions 2x3
// GRILLE 6 — Web renderer/input implementation lives in sudoku-ui.js (v2.27 migration 27.1B).
function hintS(){if(current?.training)return trainingCoach();if(paused)return;if(showVisibleErrorsBeforeHint())return;if(showExplorationContradictionBeforeHint())return;try{let result=sudokuCurrentValueStep();if(result.contradiction)return sudokuShowLogicalContradiction(result.contradiction);let presenter=sudokuReasoningPresenter(),view=presenter.presentValueStep(result,current.state);if(!view)return showHintNotice(`<b>${tr('noLogicalHint')}</b><br>${tr('slgNoDeduction')}`);let target=view.action.target,[r,c]=[target.row,target.column],reasoning=presenter.legacyValueStepReasoning(result);hintStage('sudoku',[r,c],{move:view.explanation.move,look:view.explanation.where,why:view.explanation.why,reveal:tr('digitRevealed'),rank:view.metadata.coachRank,value:view.action.value,reasoning},()=>{current.state[r][c]=view.action.value;current.sel=[r,c];drawGameUi();maybeAutoFinish()})}catch(err){console.error('Grille 6 proof engine failed',err);showHintNotice(`<b>${tr('hintError')}</b>`)}}

// PATCHES — Web renderer/input implementation lives in patches-ui.js (v2.27 migration 27.1D).
function hintP(){
  if(current?.training)return trainingCoach();if(paused)return;if(showVisibleErrorsBeforeHint())return;if(showExplorationContradictionBeforeHint())return;
  if(!patchesLogicAvailable()){showHintNotice(tr('hintError'));return}
  let result;try{result=patchCurrentLogicResult()}catch(_){showHintNotice(tr('hintError'));return}
  if(result.contradiction){current.hintFlow=null;clearHintFocus();showHintNotice(`<b>⚠ ${tr('errorDetected')}</b><br>${patchesReasoningPresenter().contradictionText(result.contradiction)}`);return}
  if(!result.deduction){current.hintFlow=null;clearHintFocus();showHintNotice(tr('plNoDeduction'));return}
  patchCoachHandleDeduction(result.deduction)
}




function keyboardInput(e){if(!current?.game)return false;let handler=gameWebUi(current.game).keyboardInput;return typeof handler==='function'?handler(e):false}
document.addEventListener('keydown',keyboardInput);
function status(t,ok){let s=$('#status');if(!s)return;s.textContent=t;s.className='status '+(ok?'ok':'bad');if(!ok)playTone('error')}
function finish(t,outcome='solved'){let total=timerSeconds(),snapshot=current?{...current}:null;stopTimer(false);elapsedBase=total;startedAt=0;paused=true;if(current){statsFinish(current,total,outcome);markDaily(current,outcome,total);current.completed=true;gamePedagogy(current.game).afterFinish({current})}clearSaved();renderTimer();status(`${t} — ${fmt(elapsedBase)}`,true);updatePauseButton();if(outcome==='solved'&&snapshot)requestAnimationFrame(()=>{celebrateBoard();setTimeout(()=>victoryOverlay(snapshot,total),2100)})}
WebPlatform.lifecycle.onVisibilityChange(()=>{if(WebPlatform.lifecycle.isHidden()&&current&&!current.completed)saveCurrent()});WebPlatform.lifecycle.onPageHide(()=>{if(current&&!current.completed)saveCurrent()});if(WebPlatform.serviceWorker.supported())WebPlatform.lifecycle.onLoad(()=>WebPlatform.serviceWorker.register('./sw.js').catch(()=>{}));
discardLegacyPersistence();applyPrefs();try{window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(prefs().theme==='auto')applyPrefs()})}catch(_){}initialView();


// ===== v2.23 — shared helpers still used by current logic/generation =====
function queenLogicalComplete(){
  if(!current||current.game!=='queens')return false;
  let n=current.n,queens=[];
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.state[r][c]===2)queens.push([r,c]);
  if(queens.length!==n)return false;
  if(new Set(queens.map(x=>x[0])).size!==n||new Set(queens.map(x=>x[1])).size!==n)return false;
  if(new Set(queens.map(([r,c])=>current.reg[r][c])).size!==n)return false;
  return !queenStateContradiction()
}

// v2.6.2 — generation identity session anti-repeat.
// Only games declaring the optional generationIdentity capability participate.
// Kept deliberately in memory only: restarting/reloading the application clears it.
const generatedIdentitySessionByDay=new Map();

function generationSessionSet(game,day=localDay()){
  for(let d of [...generatedIdentitySessionByDay.keys()])if(d!==day)generatedIdentitySessionByDay.delete(d);
  if(!generatedIdentitySessionByDay.has(day))generatedIdentitySessionByDay.set(day,new Map());
  let perGame=generatedIdentitySessionByDay.get(day);
  if(!perGame.has(game))perGame.set(game,new Set());
  return perGame.get(game)
}
function rememberGeneratedCandidateThisSession(game,candidate,day=localDay()){
  let identity=generatedCandidateIdentity(game,candidate);if(identity!=null)generationSessionSet(game,day).add(identity);return identity
}
function normalLaunchCandidate(game,diff,day=localDay()){
  let candidate=takePrecomputed(game,diff,day);if(candidate)return candidate;
  if(!GameRegistry.hasCapability(game,'generationIdentity'))return generateRegisteredCandidate(game,diff);
  let seen=generationSessionSet(game,day);
  for(let tries=0;tries<40;tries++){
    let next=generateRegisteredCandidate(game,diff),identity=generatedCandidateIdentity(game,next);
    if(seen.has(identity))continue;rememberGeneratedCandidateThisSession(game,next,day);return next
  }
  throw new Error(lang()==='fr'?'Aucune nouvelle grille Couronnes conforme au profil logique n’a pu être générée.':'No fresh Crowns grid matching the logical profile could be generated.')
}
