/*
 * Logic 4
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation without prior written authorization is prohibited.
 */
'use strict';
const $=s=>document.querySelector(s), app=$('#app'), toast=$('#toast'), timerEl=$('#timer');
const VERSION='2.3.0', SAVE_KEY='logic4-save-v1';
let current=null, tick=null, startedAt=0, elapsedBase=0, paused=false;
const I18N={
fr:{
 easy:'Facile',medium:'Moyen',hard:'Difficile',expert:'Expert',
 newGame:'Nouvelle',reset:'Réinitialiser',pause:'Pause',resume:'Reprendre',check:'Vérifier',hint:'Indice',solution:'Solution',rules:'Règles',
 back:'Retour',play:'Jouer',generated:'générée',score:'score',
 homeTitle:'Quatre jeux.<br>Une pause logique.',homeSub:'Quatre jeux de logique, avec génération, chronomètre, défis et progression. Fonctionne hors ligne après le premier chargement.',
 queensSub:'Une reine par ligne, colonne et zone.',tangoSub:'Équilibre Soleil/Lune et relations.',sudokuSub:'6×6, lignes, colonnes et régions.',patchesSub:'Reconstitue toutes les zones.',
 daily:'Défi quotidien',dailySub:'terminés aujourd’hui',stats:'Statistiques & progression',statsSub:'Historique, records et séries',prefs:'Préférences',prefsSub:'Langue, thème, sons et données locales',about:'À propos',aboutSub:'Version, copyright et licence',
 settingsSaved:'Réglages enregistrés sur cet appareil.',language:'Langue',languageSub:'Français ou English',theme:'Thème',themeSub:'Automatique, clair ou sombre',auto:'Automatique',light:'Clair',dark:'Sombre',
 sounds:'Sons discrets',soundsSub:'Victoire et retours ponctuels',on:'Activés',off:'Désactivés',data:'Données',dataSub:'Statistiques, défis et préférences restent locales.',info:'Info',
 localDataTitle:'Données locales',localData:'Logic 4 ne nécessite aucun compte. Les parties, statistiques, défis quotidiens et préférences sont stockés dans le navigateur de cet appareil.',
 dailyLast:'28 derniers jours',dailyNote:'Chaque date produit les mêmes quatre grilles sur tous les appareils utilisant cette version. Difficulté quotidienne : Moyen.',finished:'terminés',
 statsLocal:'Progression enregistrée uniquement sur cet appareil.',solved:'résolues',success:'réussite',avgTime:'temps moyen',streak:'série de jours',byGame:'Par jeu',history:'Historique récent',record:'record',average:'moyen',none:'Aucune partie terminée pour le moment.',
 solvedStatus:'Résolu',revealedStatus:'Solution vue',abandonedStatus:'Abandonné',finishedStatus:'Terminé',
 autoCross:'Croix automatiques quand je place une reine',queensLegend:'Touchez une case pour faire vide → X → reine. Faites glisser le doigt sur une ligne ou une colonne pour ajouter des X ; commencez sur un X pour les effacer.',
 patchesLegend:'Choisis un indice, puis touche les cases de sa zone. Tu peux aussi faire glisser le doigt pour peindre plusieurs cases.',zone:'Zone',
 aboutTitle:'À propos de Logic 4',version:'Version',copyright:'Copyright',license:'Licence',proprietary:'Logiciel propriétaire — All rights reserved.',legal:'Toute copie, modification, redistribution et exploitation sans autorisation écrite préalable de Serge Benoliel est interdite.',
 restored:'Partie restaurée',generating:'Génération…',rulesTitle:'Règles',where:'Où regarder',logic:'Logique',solutionShown:'Solution affichée',congrats:'Bravo !',gridIncomplete:'Il reste une erreur ou une case à résoudre.',tangoIncomplete:'La grille ne respecte pas encore toutes les règles.',sudokuIncomplete:'Il reste une erreur ou une case vide.',autoCrossOn:'Croix automatiques activées',autoCrossOff:'Croix automatiques désactivées',queenPlaced:'Une reine a été placée.',cellRevealed:'Une case a été révélée.',digitRevealed:'Un chiffre a été révélé.',patchRevealed:'Une case de la zone a été révélée.',finishedShare:'Terminé',dailyLabel:'Défi quotidien',backtrackFlag:'retour en arrière',hintFlag:'indice utilisé',themeLabel:'Thème',soundsOn:'Sons activés',soundsOff:'Sons désactivés',resetDone:'Grille réinitialisée.',patchAll:'Toutes les cases doivent appartenir à une zone.',patchEach:'Chaque indice doit avoir une zone.',patchOwn:'Chaque zone doit contenir son propre indice.',patchTwo:'Une zone ne peut pas contenir deux indices.',patchConnected:'Chaque zone doit être d’un seul tenant.',patchRect:'Chaque zone doit former un rectangle.',patchSize:'La taille d’une zone ne correspond pas à son indice.',patchShape:'La forme d’une zone ne correspond pas à son indice.',
},
en:{
 easy:'Easy',medium:'Medium',hard:'Hard',expert:'Expert',
 newGame:'New',reset:'Reset',pause:'Pause',resume:'Resume',check:'Check',hint:'Hint',solution:'Solution',rules:'Rules',
 back:'Back',play:'Play',generated:'generated',score:'score',
 homeTitle:'Four games.<br>One logic break.',homeSub:'Four logic games with generation, timer, daily challenges and progress tracking. Works offline after the first load.',
 queensSub:'One queen per row, column and region.',tangoSub:'Balance Sun/Moon and relations.',sudokuSub:'6×6, rows, columns and regions.',patchesSub:'Rebuild all rectangular regions.',
 daily:'Daily challenge',dailySub:'completed today',stats:'Statistics & progress',statsSub:'History, records and streaks',prefs:'Preferences',prefsSub:'Language, theme, sounds and local data',about:'About',aboutSub:'Version, copyright and license',
 settingsSaved:'Settings saved on this device.',language:'Language',languageSub:'Français or English',theme:'Theme',themeSub:'Automatic, light or dark',auto:'Automatic',light:'Light',dark:'Dark',
 sounds:'Subtle sounds',soundsSub:'Victory and occasional feedback',on:'On',off:'Off',data:'Data',dataSub:'Statistics, challenges and preferences stay local.',info:'Info',
 localDataTitle:'Local data',localData:'Logic 4 requires no account. Games, statistics, daily challenges and preferences are stored in this device browser.',
 dailyLast:'Last 28 days',dailyNote:'Each date produces the same four grids on all devices using this version. Daily difficulty: Medium.',finished:'completed',
 statsLocal:'Progress is stored only on this device.',solved:'solved',success:'success',avgTime:'average time',streak:'day streak',byGame:'By game',history:'Recent history',record:'record',average:'average',none:'No completed game yet.',
 solvedStatus:'Solved',revealedStatus:'Solution viewed',abandonedStatus:'Abandoned',finishedStatus:'Finished',
 autoCross:'Auto-mark crosses when I place a queen',queensLegend:'Tap a cell to cycle empty → X → queen. Drag along a row or column to add X marks; start on an X to erase them.',
 patchesLegend:'Choose a clue, then tap the cells in its region. You can also drag to paint several cells.',zone:'Region',
 aboutTitle:'About Logic 4',version:'Version',copyright:'Copyright',license:'License',proprietary:'Proprietary software — All rights reserved.',legal:'Copying, modification, redistribution and exploitation without prior written permission from Serge Benoliel are prohibited.',
 restored:'Game restored',generating:'Generating…',rulesTitle:'Rules',where:'Where to look',logic:'Logic',solutionShown:'Solution shown',congrats:'Well done!',gridIncomplete:'There is still an error or an unresolved cell.',tangoIncomplete:'The grid does not yet satisfy all rules.',sudokuIncomplete:'There is still an error or an empty cell.',autoCrossOn:'Auto-crosses enabled',autoCrossOff:'Auto-crosses disabled',queenPlaced:'A queen was placed.',cellRevealed:'A cell was revealed.',digitRevealed:'A digit was revealed.',patchRevealed:'A region cell was revealed.',finishedShare:'Finished',dailyLabel:'Daily challenge',backtrackFlag:'backtracked',hintFlag:'hint used',themeLabel:'Theme',soundsOn:'Sounds enabled',soundsOff:'Sounds disabled',resetDone:'Grid reset.',patchAll:'Every cell must belong to a region.',patchEach:'Every clue must have a region.',patchOwn:'Each region must contain its own clue.',patchTwo:'A region cannot contain two clues.',patchConnected:'Each region must be connected.',patchRect:'Each region must form a rectangle.',patchSize:'A region size does not match its clue.',patchShape:'A region shape does not match its clue.',
}};
let DIFF={};
function lang(){return prefs().lang==='en'?'en':'fr'}
function tr(k){return I18N[lang()][k]??I18N.fr[k]??k}
function updateI18n(){Object.assign(DIFF,{easy:tr('easy'),medium:tr('medium'),hard:tr('hard'),expert:tr('expert')});document.documentElement.lang=lang()}
const GAME_RULES={
 queens:{fr:`<b>But :</b> placer exactement une reine dans chaque ligne, chaque colonne et chaque zone colorée.<br><br><b>Contraintes :</b> deux reines ne peuvent jamais partager une ligne, une colonne ou une zone. Deux reines ne peuvent pas non plus se toucher, y compris en diagonale. Les diagonales éloignées sont autorisées.<br><br><b>Commandes :</b> un toucher fait vide → X → reine. Un glissement horizontal ou vertical permet d'ajouter ou d'effacer rapidement des X. L'option de croix automatiques marque les cases rendues impossibles par une reine.`,
 en:`<b>Goal:</b> place exactly one queen in every row, every column and every colored region.<br><br><b>Constraints:</b> two queens may never share a row, column or region. Queens may not touch, including diagonally. Distant diagonal alignment is allowed.<br><br><b>Controls:</b> tap cycles empty → X → queen. Drag horizontally or vertically to quickly add or erase X marks. Auto-crosses mark cells made impossible by a queen.`},
 tango:{fr:`<b>But :</b> remplir les 36 cases avec des soleils ☀ et des lunes ☾.<br><br><b>Équilibre :</b> chaque ligne et chaque colonne contient exactement 3 soleils et 3 lunes.<br><br><b>Suites :</b> il est interdit d'avoir trois symboles identiques consécutifs horizontalement ou verticalement.<br><br><b>Relations :</b> « = » signifie que les deux cases voisines sont identiques ; « × » signifie qu'elles sont différentes.`,
 en:`<b>Goal:</b> fill all 36 cells with suns ☀ and moons ☾.<br><br><b>Balance:</b> every row and column contains exactly 3 suns and 3 moons.<br><br><b>Runs:</b> three identical consecutive symbols are forbidden horizontally and vertically.<br><br><b>Relations:</b> “=” means the two adjacent cells are identical; “×” means they are different.`},
 sudoku:{fr:`<b>But :</b> compléter la grille 6×6 avec les chiffres 1 à 6.<br><br><b>Lignes :</b> chaque chiffre apparaît exactement une fois dans chaque ligne.<br><br><b>Colonnes :</b> chaque chiffre apparaît exactement une fois dans chaque colonne.<br><br><b>Blocs :</b> chaque région 2×3 contient également une fois chacun des chiffres 1 à 6. Les chiffres donnés au départ ne peuvent pas être modifiés.`,
 en:`<b>Goal:</b> complete the 6×6 grid using digits 1 to 6.<br><br><b>Rows:</b> each digit appears exactly once in every row.<br><br><b>Columns:</b> each digit appears exactly once in every column.<br><br><b>Boxes:</b> every 2×3 region also contains digits 1 to 6 exactly once. Starting clues cannot be changed.`},
 patches:{fr:`<b>But :</b> découper toute la grille en rectangles ou carrés sans chevauchement.<br><br><b>Indices :</b> chaque zone contient exactement une case-indice. Un indice peut préciser la surface, la forme (carré, vertical ou horizontal), les deux, ou parfois ne donner qu'une information minimale.<br><br><b>Validité :</b> chaque case appartient à une seule zone, chaque zone est d'un seul tenant et forme un rectangle, et aucune zone ne peut contenir deux indices.`,
 en:`<b>Goal:</b> partition the entire grid into non-overlapping rectangles or squares.<br><br><b>Clues:</b> each region contains exactly one clue cell. A clue may specify area, shape (square, vertical or horizontal), both, or sometimes only minimal information.<br><br><b>Validity:</b> every cell belongs to exactly one region, each region is connected and rectangular, and no region may contain two clues.`}
};
function gameRules(g){return GAME_RULES[g]?.[lang()]||''}

const PREF_KEY='logic4-prefs-v1';
function prefs(){try{let p=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');return {theme:['auto','light','dark'].includes(p.theme)?p.theme:'auto',sound:p.sound!==false,queenAutoCross:p.queenAutoCross===true,lang:p.lang==='en'?'en':'fr'}}catch(_){return {theme:'auto',sound:true,queenAutoCross:false,lang:'fr'}}}
function savePrefs(p){try{localStorage.setItem(PREF_KEY,JSON.stringify(p))}catch(_){}applyPrefs()}
function resolvedTheme(){let p=prefs();return p.theme==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):p.theme}
function applyPrefs(){let p=prefs(),theme=resolvedTheme();document.documentElement.dataset.theme=theme;document.documentElement.dataset.themeMode=p.theme;let meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='dark'?'#171916':'#f4f1e9';let b=$('#themeBtn');if(b){b.textContent=theme==='dark'?'☾':'☀︎';b.setAttribute('aria-label',`Thème : ${p.theme}`)}}
function cycleTheme(){let p=prefs(),m={auto:'light',light:'dark',dark:'auto'};p.theme=m[p.theme];savePrefs(p);showToast(`${tr('themeLabel')} : ${{auto:tr('auto'),light:tr('light'),dark:tr('dark')}[p.theme]}`)}
function toggleSound(){let p=prefs();p.sound=!p.sound;savePrefs(p);showToast(p.sound?tr('soundsOn'):tr('soundsOff'));return p.sound}
function playTone(kind='tap'){if(!prefs().sound)return;try{let A=window.AudioContext||window.webkitAudioContext;if(!A)return;let c=new A(),o=c.createOscillator(),g=c.createGain(),now=c.currentTime;o.type='sine';o.frequency.value=kind==='win'?659:kind==='error'?180:420;g.gain.setValueAtTime(kind==='win'?.06:.025,now);g.gain.exponentialRampToValueAtTime(.001,now+(kind==='win'?.38:.12));o.connect(g);g.connect(c.destination);o.start(now);o.stop(now+(kind==='win'?.4:.13));setTimeout(()=>c.close().catch(()=>{}),600)}catch(_){}}
function settingsView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;let p=prefs();
  app.innerHTML=`<section class="panel settings-panel"><div class="stats-head"><div><h1>${tr('prefs')}</h1><p>${tr('settingsSaved')}</p></div><button class="btn" id="settingsBack">${tr('back')}</button></div>
  <div class="setting-row"><span><b>${tr('language')}</b><small>${tr('languageSub')}</small></span><select id="langSelect" class="difficulty"><option value="fr" ${p.lang!=='en'?'selected':''}>Français</option><option value="en" ${p.lang==='en'?'selected':''}>English</option></select></div>
  <div class="setting-row"><span><b>${tr('theme')}</b><small>${tr('themeSub')}</small></span><select id="themeSelect" class="difficulty"><option value="auto" ${p.theme==='auto'?'selected':''}>${tr('auto')}</option><option value="light" ${p.theme==='light'?'selected':''}>${tr('light')}</option><option value="dark" ${p.theme==='dark'?'selected':''}>${tr('dark')}</option></select></div>
  <div class="setting-row"><span><b>${tr('sounds')}</b><small>${tr('soundsSub')}</small></span><button class="btn" id="soundToggle">${p.sound?tr('on'):tr('off')}</button></div>
  <div class="setting-row"><span><b>${tr('data')}</b><small>${tr('dataSub')}</small></span><button class="btn" id="storageInfo">${tr('info')}</button></div></section>`;
  $('#settingsBack').onclick=home;$('#langSelect').onchange=e=>{let q=prefs();q.lang=e.target.value;savePrefs(q);updateI18n();settingsView()};$('#themeSelect').onchange=e=>{let q=prefs();q.theme=e.target.value;savePrefs(q)};$('#soundToggle').onclick=()=>{let on=toggleSound();$('#soundToggle').textContent=on?tr('on'):tr('off')};$('#storageInfo').onclick=()=>modal(tr('localDataTitle'),tr('localData'));app.querySelectorAll('button').forEach(pressFeedback)
}
function aboutView(){
 if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;
 app.innerHTML=`<section class="panel about-panel"><div class="stats-head"><div><h1>${tr('aboutTitle')}</h1><p>Logic 4</p></div><button class="btn" id="aboutBack">${tr('back')}</button></div>
 <div class="about-grid"><div><span>${tr('version')}</span><b>${VERSION}</b></div><div><span>${tr('copyright')}</span><b>© 2026 Serge Benoliel</b></div><div><span>${tr('license')}</span><b>${tr('proprietary')}</b></div></div>
 <p class="legal-text">${tr('legal')}</p></section>`;
 $('#aboutBack').onclick=home;app.querySelectorAll('button').forEach(pressFeedback)
}
function resultText(c,seconds){let daily=c?.daily?` · ${tr('dailyLabel')}`:'';return `Logic 4 — ${gameLabel(c.game)}${daily}\n${DIFF[c.diff]} · ${fmt(seconds)}${c.rating?` · ${tr('score')} ${c.rating.score}`:''}\n✓ ${tr('finishedShare')}`}
function resultSvg(c,seconds){
  let bg=resolvedTheme()==='dark'?'#171916':'#f4f1e9',ink=resolvedTheme()==='dark'?'#f2efe7':'#22231f',muted=resolvedTheme()==='dark'?'#b8b5ad':'#6b6a64',accent='#397466',title=gameLabel(c.game).replace(/&/g,'&amp;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><rect width="1080" height="1080" rx="80" fill="${bg}"/><circle cx="110" cy="112" r="22" fill="${accent}"/><text x="155" y="130" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="54" font-weight="700" fill="${ink}">Logic 4</text><text x="90" y="410" font-family="Georgia,serif" font-size="112" font-weight="700" fill="${ink}">${title}</text><text x="90" y="520" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="48" fill="${muted}">${DIFF[c.diff]}${c.daily?` · ${tr('dailyLabel')}`:''}</text><text x="90" y="720" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="132" font-weight="800" fill="${ink}">${fmt(seconds)}</text><text x="90" y="820" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="42" fill="${accent}">✓ ${tr('finishedShare')}</text><text x="90" y="965" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="32" fill="${muted}">logic 4 · v${VERSION}</text></svg>`
}
async function shareResult(c,seconds){
  let text=resultText(c,seconds);
  try{
    if(typeof Blob!=='undefined'&&typeof File!=='undefined'&&navigator.share){
      let blob=new Blob([resultSvg(c,seconds)],{type:'image/svg+xml'}),file=new File([blob],`logic4-${c.game}-${localDay()}.svg`,{type:'image/svg+xml'});
      let fileOK=!navigator.canShare||navigator.canShare({files:[file]});
      if(fileOK){await navigator.share({title:'Logic 4',text,files:[file]});return}
    }
    if(navigator.share){await navigator.share({title:'Logic 4',text});return}
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);showToast('Résultat copié');return}
  }catch(e){
    if(e?.name==='AbortError')return;
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);showToast('Résultat copié');return}}catch(_){}
  }
  showToast('Partage non disponible')
}
function victoryOverlay(c,seconds){
  let old=$('#victory');if(old)old.remove();
  document.body.insertAdjacentHTML('beforeend',`<div class="victory" id="victory" role="dialog" aria-modal="true"><div class="victory-card"><div class="victory-burst" aria-hidden="true">✦</div><small>${lang()==='fr'?'BRAVO':'WELL DONE'}</small><h2>${gameLabel(c.game)}</h2><div class="victory-time">${fmt(seconds)}</div><p>${DIFF[c.diff]}${c.daily?` · ${tr('dailyLabel')}`:''}${c.rating?` · score ${c.rating.score}`:''}</p><div class="victory-actions"><button class="btn primary" id="shareResult">Partager</button><button class="btn" id="closeVictory">Continuer</button></div></div></div>`);
  $('#shareResult').onclick=()=>shareResult(c,seconds);$('#closeVictory').onclick=()=>$('#victory')?.remove();$('#victory').onclick=e=>{if(e.target.id==='victory')e.currentTarget.remove()};playTone('win');haptic(28)
}

const STATS_KEY='logic4-stats-v1', HISTORY_LIMIT=200;
function blankStats(){return {schema:1,started:0,solved:0,revealed:0,totalSolvedSeconds:0,byGame:{},history:[]}}
function safeStats(){
  let s=blankStats();
  try{
    let raw=JSON.parse(localStorage.getItem(STATS_KEY)||'null');
    if(raw&&typeof raw==='object'){
      s.started=Math.max(0,Number(raw.started)||0);s.solved=Math.max(0,Number(raw.solved)||0);
      s.revealed=Math.max(0,Number(raw.revealed)||0);s.totalSolvedSeconds=Math.max(0,Number(raw.totalSolvedSeconds)||0);
      s.byGame=raw.byGame&&typeof raw.byGame==='object'?raw.byGame:{};
      s.history=Array.isArray(raw.history)?raw.history.filter(x=>x&&['queens','tango','sudoku','patches'].includes(x.game)&&['easy','medium','hard','expert'].includes(x.diff)).slice(0,HISTORY_LIMIT):[];
    }
  }catch(_){}
  return s
}
function writeStats(s){try{localStorage.setItem(STATS_KEY,JSON.stringify(s))}catch(_){}}
function statBucket(s,g,d){
  if(!s.byGame||typeof s.byGame!=='object')s.byGame={};
  if(!s.byGame[g]||typeof s.byGame[g]!=='object')s.byGame[g]={};
  if(!s.byGame[g][d]||typeof s.byGame[g][d]!=='object')s.byGame[g][d]={started:0,solved:0,revealed:0,totalSeconds:0,best:null};
  let b=s.byGame[g][d];b.started=Math.max(0,Number(b.started)||0);b.solved=Math.max(0,Number(b.solved)||0);b.revealed=Math.max(0,Number(b.revealed)||0);b.totalSeconds=Math.max(0,Number(b.totalSeconds)||0);b.best=b.best==null?null:Math.max(0,Number(b.best)||0);return b
}
function localDay(ts=Date.now()){let d=new Date(ts),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function statsStart(c){
  if(!c||c.attemptId)return;
  c.attemptId=`${Date.now()}-${Math.random().toString(36).slice(2,9)}`;c.startedAt=Date.now();c.statsClosed=false;
  let s=safeStats(),b=statBucket(s,c.game,c.diff);s.started++;b.started++;writeStats(s)
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
function tangoIllegalCells(){
  let bad=new Set(),n=6,s=current.state;
  for(let r=0;r<n;r++){for(let v=0;v<=1;v++){let cells=[];for(let c=0;c<n;c++)if(s[r][c]===v)cells.push([r,c]);if(cells.length>3)cells.forEach(x=>bad.add(keyCell(...x)))}for(let c=0;c<n-2;c++)if(s[r][c]!==-1&&s[r][c]===s[r][c+1]&&s[r][c]===s[r][c+2])for(let k=0;k<3;k++)bad.add(keyCell(r,c+k))}
  for(let c=0;c<n;c++){for(let v=0;v<=1;v++){let cells=[];for(let r=0;r<n;r++)if(s[r][c]===v)cells.push([r,c]);if(cells.length>3)cells.forEach(x=>bad.add(keyCell(...x)))}for(let r=0;r<n-2;r++)if(s[r][c]!==-1&&s[r][c]===s[r+1][c]&&s[r][c]===s[r+2][c])for(let k=0;k<3;k++)bad.add(keyCell(r+k,c))}
  for(let [r,c,d,rel] of current.edges){let r2=d==='r'?r:r+1,c2=d==='r'?c+1:c,a=s[r][c],b=s[r2][c2];if(a!==-1&&b!==-1&&((rel==='='&&a!==b)||(rel==='×'&&a===b))){bad.add(keyCell(r,c));bad.add(keyCell(r2,c2))}}
  return bad
}
function sudokuIllegalCells(){
  let bad=new Set(),s=current.state;
  function dup(cells){let by={};for(let [r,c] of cells){let v=s[r][c];if(!v)continue;(by[v]??=[]).push([r,c])}for(let a of Object.values(by))if(a.length>1)a.forEach(x=>bad.add(keyCell(...x)))}
  for(let r=0;r<6;r++)dup(Array.from({length:6},(_,c)=>[r,c]));for(let c=0;c<6;c++)dup(Array.from({length:6},(_,r)=>[r,c]));
  for(let br=0;br<6;br+=2)for(let bc=0;bc<6;bc+=3){let a=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)a.push([r,c]);dup(a)}
  return bad
}
function patchIllegalCells(){
  let bad=new Set(),n=current.n;
  for(let id of current.ids){
    let cells=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.paint[r][c]===id)cells.push([r,c]);if(!cells.length)continue;
    let own=current.clues[id].pos,cl=current.clues[id];
    for(let [r,c] of cells){for(let other of current.ids){let p=current.clues[other].pos;if(other!==id&&p[0]===r&&p[1]===c){bad.add(keyCell(r,c));bad.add(keyCell(...own))}}}
    let rs=cells.map(x=>x[0]),cs=cells.map(x=>x[1]),h=Math.max(...rs)-Math.min(...rs)+1,w=Math.max(...cs)-Math.min(...cs)+1;
    let impossible=false;if((cl.mode==='size'||cl.mode==='both')&&(cells.length>cl.size||h*w>cl.size))impossible=true;
    if((cl.mode==='shape'||cl.mode==='both')&&((cl.shape==='vertical'&&w>1)||(cl.shape==='horizontal'&&h>1)))impossible=true;
    if(impossible){cells.forEach(x=>bad.add(keyCell(...x)));bad.add(keyCell(...own))}
  }
  return bad
}
function applyIllegalClasses(board,bad,n){if(!board)return;[...board.children].forEach((d,i)=>d.classList.toggle('illegal',bad.has(keyCell(Math.floor(i/n),i%n))))}
function statsFinish(c,seconds,outcome){
  if(!c||c.statsClosed)return;c.statsClosed=true;
  let s=safeStats(),b=statBucket(s,c.game,c.diff),rec={id:c.attemptId||`${Date.now()}`,ts:Date.now(),day:localDay(),game:c.game,diff:c.diff,seconds:Math.max(0,Math.round(seconds)),outcome,score:c.rating?.score??null,backtrackUsed:!!c.backtrackUsed,hintUsed:!!c.hintUsed};
  if(outcome==='solved'){s.solved++;s.totalSolvedSeconds+=rec.seconds;b.solved++;b.totalSeconds+=rec.seconds;b.best=b.best==null?rec.seconds:Math.min(b.best,rec.seconds)}
  if(outcome==='revealed'){s.revealed++;b.revealed++}
  s.history.unshift(rec);s.history=s.history.slice(0,HISTORY_LIMIT);writeStats(s)
}
function closePreviousAttempt(){
  let c=current&&current.attemptId&&!current.completed?current:null,saved=!c?getSaved():null;
  if(!c&&saved?.current?.attemptId&&!saved.current.completed)c=saved.current;
  if(c&&!c.statsClosed)statsFinish(c,c===current?timerSeconds():(saved?.elapsed||0),'abandoned')
}
function statsSummary(){
  let s=safeStats(),success=s.started?Math.round(100*s.solved/s.started):0,avg=s.solved?Math.round(s.totalSolvedSeconds/s.solved):0;
  let days=[...new Set(s.history.filter(x=>x.outcome==='solved').map(x=>x.day))].sort().reverse(),streak=0;
  if(days.length){
    let cur=new Date();cur.setHours(0,0,0,0);let yday=new Date(cur);yday.setDate(yday.getDate()-1);
    if(days[0]===localDay(cur.getTime())||days[0]===localDay(yday.getTime())){
      let d=new Date(days[0]+'T12:00:00');for(let day of days){if(day!==localDay(d.getTime()))break;streak++;d.setDate(d.getDate()-1)}
    }
  }
  return {s,success,avg,streak}
}


const DAILY_KEY='logic4-daily-v1';
function hash32(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function withSeed(seed,fn){let old=Math.random;Math.random=mulberry32(hash32(seed));try{return fn()}finally{Math.random=old}}
function dailyState(){try{let x=JSON.parse(localStorage.getItem(DAILY_KEY)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}}
function saveDailyState(x){try{localStorage.setItem(DAILY_KEY,JSON.stringify(x))}catch(_){}}
function dailyKey(day,game){return `${day}:${game}`}
function markDaily(c,outcome,seconds){if(!c?.daily)return;let s=dailyState(),k=dailyKey(c.dailyDay,c.game),old=s[k]||{};s[k]={day:c.dailyDay,game:c.game,outcome,seconds:Math.round(seconds),completedAt:Date.now(),best:outcome==='solved'?(old.best==null?Math.round(seconds):Math.min(old.best,Math.round(seconds))):old.best??null};saveDailyState(s)}
function dailyProgress(day=localDay()){let s=dailyState(),games=['queens','tango','sudoku','patches'];return games.map(g=>s[dailyKey(day,g)]).filter(x=>x?.outcome==='solved').length}
function dailyCalendar(days=28){let s=dailyState(),out=[],d=new Date();d.setHours(12,0,0,0);for(let i=0;i<days;i++){let day=localDay(d.getTime()),n=['queens','tango','sudoku','patches'].filter(g=>s[dailyKey(day,g)]?.outcome==='solved').length;out.push({day,n});d.setDate(d.getDate()-1)}return out}
function dailyView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let day=localDay(),s=dailyState(),games=['queens','tango','sudoku','patches'],cards=games.map(g=>{let r=s[dailyKey(day,g)],done=r?.outcome==='solved';return `<button class="daily-game ${done?'done':''}" data-daily="${g}"><span>${{queens:'♛',tango:'☀︎',sudoku:'✎',patches:'▦'}[g]}</span><b>${gameLabel(g)}</b><small>${done?`✓ ${fmt(r.best??r.seconds)}`:tr('play')}</small></button>`}).join('');
  let cal=dailyCalendar().reverse().map(x=>`<div class="day-dot level-${x.n}" title="${x.day} · ${x.n}/4"><span>${new Date(x.day+'T12:00:00').getDate()}</span></div>`).join('');
  app.innerHTML=`<section class="panel daily-panel"><div class="stats-head"><div><h1>${tr('daily')}</h1><p>${new Date().toLocaleDateString(lang()==='fr'?'fr-FR':'en-US',{weekday:'long',day:'numeric',month:'long'})} · ${dailyProgress(day)}/4 ${tr('finished')}</p></div><button class="btn" id="dailyBack">${tr('back')}</button></div><div class="daily-games">${cards}</div><h2>${tr('dailyLast')}</h2><div class="daily-calendar">${cal}</div><p class="daily-note">${tr('dailyNote')}</p></section>`;
  $('#dailyBack').onclick=home;app.querySelectorAll('[data-daily]').forEach(b=>b.onclick=()=>launchDaily(b.dataset.daily,day));app.querySelectorAll('button').forEach(pressFeedback)
}
function launchDaily(game,day=localDay()){
  closePreviousAttempt();clearSaved();stopTimer();paused=false;setBusy(true);current={game,diff:'medium',daily:true,dailyDay:day};
  requestAnimationFrame(()=>{try{withSeed(`logic4-v1.6:${day}:${game}`,()=>{if(game==='queens')queens('medium');if(game==='tango')tango('medium');if(game==='sudoku')sudoku('medium');if(game==='patches')patches('medium')});current.daily=true;current.dailyDay=day;statsStart(current);startTimer(true,0,false);saveCurrent();haptic(8)}finally{setBusy(false)}})
}
const coarsePointer=()=>window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;
function haptic(ms=12){try{if(navigator.vibrate)navigator.vibrate(ms)}catch(_){}}
function setBusy(on,label=null){label=label||tr('generating');document.body.classList.toggle('busy',!!on);let x=$('#busyOverlay');if(x){x.hidden=!on;let s=x.querySelector('span');if(s)s.textContent=label}}
function pressFeedback(el){if(!el)return;el.addEventListener('pointerdown',()=>el.classList.add('pressed'),{passive:true});for(let ev of ['pointerup','pointercancel','pointerleave'])el.addEventListener(ev,()=>el.classList.remove('pressed'),{passive:true})}

function showToast(t){toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1400)}
function timerSeconds(){return elapsedBase+(!paused&&startedAt?Math.floor((Date.now()-startedAt)/1000):0)}
function renderTimer(){timerEl.textContent=fmt(timerSeconds())}
function startTimer(reset=true,initial=0,isPaused=false){stopTimer(false);elapsedBase=reset?initial:timerSeconds();paused=isPaused;startedAt=paused?0:Date.now();renderTimer();if(!paused)tick=setInterval(()=>{renderTimer();if(current)saveCurrent()},1000)}
function stopTimer(commit=true){if(commit&&!paused&&startedAt){elapsedBase=timerSeconds();startedAt=0}if(tick)clearInterval(tick);tick=null}
function togglePause(){if(!current||current.completed)return;if(paused){paused=false;startedAt=Date.now();tick=setInterval(()=>{renderTimer();if(current)saveCurrent()},1000);showToast('Chrono repris')}else{elapsedBase=timerSeconds();startedAt=0;paused=true;if(tick)clearInterval(tick);tick=null;showToast('Chrono en pause')}updatePauseButton();saveCurrent()}
function updatePauseButton(){let b=$('#pauseBtn');if(b)b.textContent=paused?tr('resume'):tr('pause')}
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function shuffle(a){a=[...a];for(let i=a.length-1;i;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function rotGrid(grid){const n=grid.length;return Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>grid[n-1-c][r]))}
function flipGrid(grid){return grid.map(r=>[...r].reverse())}
function transformGrid(grid,k){let g=grid.map(r=>[...r]);for(let i=0;i<k%4;i++)g=rotGrid(g);if(k>=4)g=flipGrid(g);return g}
function modal(title,html){document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="modal"><div class="sheet"><h2>${title}</h2>${html}<button class="btn primary" onclick="document.querySelector('#modal').remove()">Fermer</button></div></div>`)}
function plainCurrent(){if(!current)return null;let o={...current};for(let k of ['givens','empty'])if(o[k] instanceof Set)o[k]=[...o[k]];return o}
function saveCurrent(){if(!current||current.completed)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:VERSION,current:plainCurrent(),elapsed:timerSeconds(),paused,savedAt:Date.now()}))}catch(_){}}
function getSaved(){try{let x=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');return x&&x.current?x:null}catch(_){return null}}
function clearSaved(){try{localStorage.removeItem(SAVE_KEY)}catch(_){}}
$('#homeBtn').onclick=home;$('#themeBtn').onclick=cycleTheme;

function statsView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let {s,success,avg,streak}=statsSummary(),games=['queens','tango','sudoku','patches'];
  let rows=games.map(g=>{let bs=(g==='queens'?['easy','medium','hard','expert']:['easy','medium','hard']).map(d=>s.byGame?.[g]?.[d]).filter(Boolean),started=bs.reduce((a,b)=>a+(b.started||0),0),solved=bs.reduce((a,b)=>a+(b.solved||0),0),total=bs.reduce((a,b)=>a+(b.totalSeconds||0),0),best=bs.map(b=>b.best).filter(v=>v!=null);return `<div class="stat-game"><b>${gameLabel(g)}</b><span>${solved}/${started} ${tr('solved')}</span><span>${solved?fmt(Math.round(total/solved)):'—'} ${tr('average')}</span><span>${best.length?fmt(Math.min(...best)):'—'} ${tr('record')}</span></div>`}).join('');
  let hist=s.history.slice(0,20).map(x=>`<div class="history-row"><span><b>${gameLabel(x.game)}</b> · ${DIFF[x.diff]}</span><span>${x.outcome==='solved'?tr('solvedStatus'):x.outcome==='revealed'?tr('revealedStatus'):x.outcome==='abandoned'?tr('abandonedStatus'):tr('finishedStatus')} · ${fmt(x.seconds)}${x.score!=null?` · ${tr('score')} ${x.score}`:''} ${aidBadges(x,true)}</span><small>${new Date(x.ts).toLocaleDateString(lang()==='fr'?'fr-FR':'en-US')}</small></div>`).join('')||`<p class="empty-state">${tr('none')}</p>`;
  app.innerHTML=`<section class="panel stats-panel"><div class="stats-head"><div><h1>${tr('stats')}</h1><p>${tr('statsLocal')}</p></div><button class="btn" id="statsBack">${tr('back')}</button></div>
  <div class="stat-kpis"><div><strong>${s.solved}</strong><span>${tr('solved')}</span></div><div><strong>${success}%</strong><span>${tr('success')}</span></div><div><strong>${avg?fmt(avg):'—'}</strong><span>${tr('avgTime')}</span></div><div><strong>${streak}</strong><span>${tr('streak')}</span></div></div>
  <h2>${tr('byGame')}</h2><div class="stat-games">${rows}</div><h2>${tr('history')}</h2><div class="history-list">${hist}</div></section>`;
  $('#statsBack').onclick=home;app.querySelectorAll('button').forEach(pressFeedback)
}
function home(){if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();let saved=getSaved();app.innerHTML=`<section class="hero"><h1>${tr('homeTitle')}</h1><p>${tr('homeSub')}</p></section>${saved?`<button class="resume-card" id="resumeBtn"><b>${tr('resume')} ${gameLabel(saved.current.game)}</b><span>${DIFF[saved.current.diff]} · ${fmt(saved.elapsed||0)}</span></button>`:''}<section class="cards">
<button class="game-card" data-g="queens"><span class="game-icon">♛</span><span><h2>Queens</h2><p>${tr('queensSub')}</p></span></button>
<button class="game-card" data-g="tango"><span class="game-icon">☀︎</span><span><h2>Tango</h2><p>${tr('tangoSub')}</p></span></button>
<button class="game-card" data-g="sudoku"><span class="game-icon">✎</span><span><h2>Mini Sudoku</h2><p>${tr('sudokuSub')}</p></span></button>
<button class="game-card" data-g="patches"><span class="game-icon">▦</span><span><h2>Patches</h2><p>${tr('patchesSub')}</p></span></button>
</section><button class="daily-card" id="dailyBtn"><span>◆</span><b>${tr('daily')}</b><small>${dailyProgress()}/4 ${tr('dailySub')}</small></button><button class="stats-card" id="statsBtn"><span>▥</span><b>${tr('stats')}</b><small>${tr('statsSub')}</small></button><button class="settings-card" id="settingsBtn"><span>⚙︎</span><b>${tr('prefs')}</b><small>${tr('prefsSub')}</small></button><button class="settings-card" id="aboutBtn"><span>ⓘ</span><b>${tr('about')}</b><small>${tr('aboutSub')}</small></button><div class="footer-note">Logic 4 v${VERSION} · © 2026 Serge Benoliel</div>`;
if(saved)$('#resumeBtn').onclick=resumeSaved;$('#dailyBtn').onclick=dailyView;$('#statsBtn').onclick=statsView;$('#settingsBtn').onclick=settingsView;$('#aboutBtn').onclick=aboutView;app.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>launch(b.dataset.g,'easy'));app.querySelectorAll('button').forEach(pressFeedback)}
function gameLabel(g){return {queens:'Queens',tango:'Tango',sudoku:'Mini Sudoku',patches:'Patches'}[g]||g}
function shell(name,subtitle,diff,content,rules){app.innerHTML=`<section class="panel"><div class="game-head"><div><h1>${name}</h1><p>${subtitle}${current&&current.rating?` · <span class="difficulty-meter">${tr('score')} ${current.rating.score} · ${current.rating.technique}<span class="live-aids">${aidBadges(current,true)}</span></span>`:''}</p></div><select class="difficulty" id="difficulty" aria-label="${tr('rulesTitle')}">${Object.entries(DIFF).filter(([k])=>current?.game==='queens'||k!=='expert').map(([k,v])=>`<option value="${k}" ${k===diff?'selected':''}>${v}</option>`).join('')}</select></div><div class="toolbar" aria-label="Actions"><button class="btn primary" id="newBtn">${tr('newGame')}</button><button class="btn" id="resetBtn">${tr('reset')}</button><button class="btn" id="pauseBtn">${tr('pause')}</button><button class="btn" id="checkBtn">${tr('check')}</button><button class="btn" id="hintBtn">${tr('hint')}</button><button class="btn secondary-action" id="solutionBtn">${tr('solution')}</button><button class="btn secondary-action" id="rulesBtn">${tr('rules')}</button></div><div id="status" class="status" aria-live="polite"></div>${content}<div class="rules">${rules}</div></section>`;
$('#difficulty').onchange=e=>launch(current.game,e.target.value);$('#newBtn').onclick=()=>launch(current.game,current.diff);$('#resetBtn').onclick=resetCurrent;$('#pauseBtn').onclick=togglePause;$('#rulesBtn').onclick=()=>modal(`${tr('rules')} — ${name}`,rules);app.querySelectorAll('button').forEach(pressFeedback);updatePauseButton()}

function resetCurrent(){
  if(!current)return;
  let hadProgress=current.game==='queens'?current.state.flat().some(v=>v!==0):current.game==='tango'?current.state.some((row,r)=>row.some((v,c)=>!current.givens.has(r*6+c)&&v!==-1)):current.game==='sudoku'?current.state.some((row,r)=>row.some((v,c)=>current.empty.has(r*6+c)&&v!==0)):current.game==='patches'?current.paint.flat().some(v=>v!==null):false;
  if(hadProgress)markBacktrack();
  $('#victory')?.remove();
  clearHintFocus();
  current.hintFlow=null;
  if(current.game==='queens'){
    $('#qboard')?.classList.remove('queens-win');
    current.state=Array.from({length:current.n},()=>Array(current.n).fill(0));
    drawQ();
  }else if(current.game==='tango'){
    current.state=Array.from({length:6},()=>Array(6).fill(-1));
    for(let i of current.givens)current.state[Math.floor(i/6)][i%6]=current.sol[Math.floor(i/6)][i%6];
    drawT();
  }else if(current.game==='sudoku'){
    current.state=current.sol.map((r,ri)=>r.map((v,c)=>current.empty.has(ri*6+c)?0:v));
    current.sel=null;drawS();
  }else if(current.game==='patches'){
    current.paint=Array.from({length:current.n},()=>Array(current.n).fill(null));
    current.active=current.ids[0];drawP();
  }
  let wasCompleted=!!current.completed;
  current.completed=false;
  if(wasCompleted||current.statsClosed){current.backtrackUsed=false;current.hintUsed=false;current.attemptId=null;current.statsClosed=false;statsStart(current)}
  stopTimer(false);elapsedBase=0;startedAt=0;paused=false;startTimer(true,0,false);
  saveCurrent();updatePauseButton();status('',true);showToast(tr('resetDone'));haptic(8)
}
function launch(game,diff){if(game!=='queens'&&diff==='expert')diff='hard';closePreviousAttempt();clearSaved();stopTimer();paused=false;setBusy(true);current={game,diff};requestAnimationFrame(()=>{try{if(game==='queens')queens(diff);if(game==='tango')tango(diff);if(game==='sudoku')sudoku(diff);if(game==='patches')patches(diff);statsStart(current);startTimer(true,0,false);saveCurrent();haptic(8)}finally{setBusy(false)}})}
function resumeSaved(){let s=getSaved();if(!s)return home();stopTimer();let c=s.current;c.givens=c.givens?new Set(c.givens):c.givens;c.empty=c.empty?new Set(c.empty):c.empty;current=c;if(c.game==='queens')renderQueens(c);if(c.game==='tango')renderTango(c);if(c.game==='sudoku')renderSudoku(c);if(c.game==='patches')renderPatches(c);startTimer(true,s.elapsed||0,!!s.paused);updatePauseButton();showToast(tr('restored'))}

function hintStage(kind,target,message,apply){
  markHintUsed();updateScoreFlags();
  if(!current.hintFlow||current.hintFlow.kind!==kind||current.hintFlow.key!==target.join(','))current.hintFlow={kind,key:target.join(','),stage:0};
  let h=current.hintFlow;h.stage++;
  clearHintFocus();
  if(h.stage===1){focusHint(target);showToast(`${tr('where')} : ${message.where}`)}
  else if(h.stage===2){focusHint(target);showToast(`${tr('logic')} : ${message.logic}`)}
  else{apply();current.hintFlow=null;showToast(message.reveal);haptic(12)}
  saveCurrent()
}
function focusHint([r,c]){let board=document.querySelector('.board');if(!board)return;let n=current.n||6,d=board.children[r*n+c];if(d)d.classList.add('hint-focus')}
function clearHintFocus(){document.querySelectorAll('.hint-focus').forEach(x=>x.classList.remove('hint-focus'))}
function touchSave(fn){return()=>{if(paused)return;current.hintFlow=null;clearHintFocus();fn();saveCurrent()}}
// QUEENS
const queenBases={easy:{sol:[1,3,5,0,2,4],reg:[[0,0,1,1,1,1],[0,1,1,1,1,1],[0,0,0,0,2,2],[3,4,4,4,2,2],[4,4,4,4,2,2],[4,4,4,4,5,2]]},medium:{sol:[2,5,1,4,0,3,6],reg:[[0,0,0,0,0,1,1],[2,0,6,6,6,1,6],[2,2,6,3,3,1,6],[2,2,6,5,3,1,6],[4,2,6,5,3,3,6],[4,2,6,5,5,5,6],[6,6,6,6,6,6,6]]},hard:{sol:[2,5,0,3,6,1,4,7],reg:[[0,0,0,0,0,4,4,4],[2,2,0,0,0,1,4,4],[2,7,7,4,4,4,4,4],[2,2,7,3,3,4,4,4],[5,2,7,6,3,4,4,7],[5,5,7,6,6,6,6,7],[7,7,7,7,6,6,7,7],[7,7,7,7,7,7,7,7]]}};
function queens(diff){let base=queenBases[diff],k=Math.floor(Math.random()*8),reg=transformGrid(base.reg,k),n=reg.length,queensSol=Array(n).fill(-1);let mask=base.sol.map((c,r)=>Array.from({length:n},(_,j)=>j===c?1:0));mask=transformGrid(mask,k);for(let r=0;r<n;r++)queensSol[r]=mask[r].indexOf(1);current={game:'queens',diff,n,reg,sol:queensSol,state:Array.from({length:n},()=>Array(n).fill(0)),completed:false};renderQueens(current)}


function solvedQ(){return !!current&&current.game==='queens'&&current.state.every((row,r)=>row[current.sol[r]]===2)&&current.state.flat().filter(v=>v===2).length===current.n}
function solvedT(){return !!current&&current.game==='tango'&&current.state.every((row,r)=>row.every((v,c)=>v===current.sol[r][c]))}
function solvedS(){return !!current&&current.game==='sudoku'&&current.state.every((row,r)=>row.every((v,c)=>v===current.sol[r][c]))}
function solvedP(){return !!current&&current.game==='patches'&&current.paint.every((row,r)=>row.every((v,c)=>v===current.reg[r][c]))}
function maybeAutoFinish(){
  if(!current||current.completed||paused)return false;
  let ok=current.game==='queens'?solvedQ():current.game==='tango'?solvedT():current.game==='sudoku'?solvedS():current.game==='patches'?solvedP():false;
  if(ok){finish(`${tr('congrats')} ${gameLabel(current.game)}`);return true}
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
function queenAutoCrossEnabled(){return prefs().queenAutoCross===true}
function setQueenAutoCross(v){let p=prefs();p.queenAutoCross=!!v;savePrefs(p)}
function queenCrossCellsFor(r,c){
  let out=[],seen=new Set(),n=current.n,z=current.reg[r][c];
  function add(rr,cc){if(rr<0||cc<0||rr>=n||cc>=n||(rr===r&&cc===c))return;let k=rr+','+cc;if(!seen.has(k)){seen.add(k);out.push([rr,cc])}}
  for(let i=0;i<n;i++){add(r,i);add(i,c)}
  for(let rr=0;rr<n;rr++)for(let cc=0;cc<n;cc++)if(current.reg[rr][cc]===z)add(rr,cc)
  for(let rr=r-1;rr<=r+1;rr++)for(let cc=c-1;cc<=c+1;cc++)add(rr,cc)
  return out
}
function applyQueenAutoCross(r,c){
  if(!queenAutoCrossEnabled())return;
  for(let [rr,cc] of queenCrossCellsFor(r,c))if(current.state[rr][cc]!==2)current.state[rr][cc]=1
}
function setQueenCell(r,c,v){
  current.state[r][c]=v;
  if(v===2)applyQueenAutoCross(r,c)
}

function queenDragRange(sr,sc,er,ec,axis){
  let out=[];
  if(axis==='row'){
    let a=Math.min(sc,ec),b=Math.max(sc,ec);for(let c=a;c<=b;c++)out.push([sr,c])
  }else if(axis==='col'){
    let a=Math.min(sr,er),b=Math.max(sr,er);for(let r=a;r<=b;r++)out.push([r,sc])
  }
  return out
}
function renderQueens(c){const colors=['#f6d68a','#c9dca5','#b9d8e9','#d9c4e8','#f3b8ad','#b5dbc9','#e7c9a3','#c6c7e9','#c4dfd7'];shell('Queens',`${c.n}×${c.n} · ${DIFF[c.diff]} · ${tr('generated')}`,c.diff,`<div class="queen-options"><label class="switch-row"><input type="checkbox" id="queenAutoCross" ${queenAutoCrossEnabled()?'checked':''}><span>${tr('autoCross')}</span></label></div><div class="board-wrap"><div class="board" id="qboard" style="grid-template-columns:repeat(${c.n},minmax(0,1fr));grid-template-rows:repeat(${c.n},minmax(0,1fr))"></div></div><div class="legend">${tr('queensLegend')}</div>`,gameRules('queens'));let b=$('#qboard'),dragging=false,pointerId=null,startCell=null,dragAxis=null,dragged=false,dragMode='add',visited=new Set();
function boardCellAt(x,y){let rect=b.getBoundingClientRect(),rx=x-rect.left,ry=y-rect.top;if(rx<0||ry<0||rx>=rect.width||ry>=rect.height)return null;let col=Math.min(c.n-1,Math.max(0,Math.floor(rx/rect.width*c.n))),r=Math.min(c.n-1,Math.max(0,Math.floor(ry/rect.height*c.n)));return b.children[r*c.n+col]||null}
function applyDragCell(r,col){let k=r+','+col;if(visited.has(k)||current.state[r][col]===2)return;visited.add(k);current.hintFlow=null;clearHintFocus();let v=dragMode==='remove'?0:1;if(current.state[r][col]!==v){if(current.state[r][col]===1&&v===0)markBacktrack();current.state[r][col]=v;dragged=true}}
function applyDragTo(hit){if(!startCell||!hit)return;let sr=+startCell.dataset.r,sc=+startCell.dataset.c,hr=+hit.dataset.r,hc=+hit.dataset.c;if(!dragAxis&&(hr!==sr||hc!==sc))dragAxis=Math.abs(hc-sc)>=Math.abs(hr-sr)?'row':'col';if(!dragAxis)return;let er=dragAxis==='row'?sr:hr,ec=dragAxis==='col'?sc:hc;for(let [r,col] of queenDragRange(sr,sc,er,ec,dragAxis))applyDragCell(r,col);drawQ()}
for(let r=0;r<c.n;r++)for(let col=0;col<c.n;col++){let d=document.createElement('div');d.className='cell';d.style.background=colors[c.reg[r][col]%colors.length];d.dataset.r=r;d.dataset.c=col;b.appendChild(d)}
b.ondblclick=e=>{e.preventDefault();e.stopPropagation()};
b.addEventListener('contextmenu',e=>e.preventDefault());
b.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
b.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});
b.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
b.addEventListener('touchend',e=>e.preventDefault(),{passive:false});
b.onpointerdown=e=>{if(paused)return;let d=boardCellAt(e.clientX,e.clientY);if(!d)return;e.preventDefault();dragging=true;pointerId=e.pointerId;startCell=d;dragAxis=null;dragged=false;visited.clear();let r=+d.dataset.r,col=+d.dataset.c;dragMode=current.state[r][col]===1?'remove':'add';try{b.setPointerCapture(pointerId)}catch(_){}};
b.onpointermove=e=>{if(!dragging||e.pointerId!==pointerId)return;e.preventDefault();let hit=boardCellAt(e.clientX,e.clientY);if(hit)applyDragTo(hit)};
let endDrag=e=>{if(!dragging||e.pointerId!==pointerId)return;e.preventDefault();let finalHit=boardCellAt(e.clientX,e.clientY);if(finalHit)applyDragTo(finalHit);try{b.releasePointerCapture(pointerId)}catch(_){};let d=startCell;dragging=false;pointerId=null;if(!dragged&&d){let r=+d.dataset.r,col=+d.dataset.c;current.hintFlow=null;clearHintFocus();let prev=current.state[r][col],next=(prev+1)%3;if(prev===2&&next===0)markBacktrack();setQueenCell(r,col,next);haptic(next===2?16:7);drawQ()}else if(dragged){haptic(7)}saveCurrent();maybeAutoFinish();startCell=null;dragAxis=null;visited.clear()};
b.onpointerup=endDrag;b.onpointercancel=e=>{if(!dragging||e.pointerId!==pointerId)return;try{b.releasePointerCapture(pointerId)}catch(_){};dragging=false;pointerId=null;startCell=null;dragAxis=null;visited.clear();drawQ()};
drawQ();$('#queenAutoCross').onchange=e=>{setQueenAutoCross(e.target.checked);if(e.target.checked){for(let r=0;r<current.n;r++)for(let col=0;col<current.n;col++)if(current.state[r][col]===2)applyQueenAutoCross(r,col);drawQ();saveCurrent();showToast(tr('autoCrossOn'))}else showToast(tr('autoCrossOff'))};$('#checkBtn').onclick=checkQ;$('#hintBtn').onclick=hintQ;$('#solutionBtn').onclick=()=>{if(paused)return;current.state=current.state.map((row,r)=>row.map((_,col)=>col===current.sol[r]?2:1));drawQ();finish(tr('solutionShown'),'revealed')}}
function drawQ(){let b=$('#qboard');if(current?.game==='queens'&&current.completed&&solvedQ())b.classList.add('queens-win');[...b.children].forEach((d,i)=>{let r=Math.floor(i/current.n),c=i%current.n,v=current.state[r][c];d.innerHTML=v===2?'<span class="queen">♛</span>':v===1?'<span class="mark">×</span>':'';d.classList.remove('error')});applyIllegalClasses(b,queenIllegalCells(),current.n);updateScoreFlags()}
function checkQ(){if(solvedQ())finish(`${tr('congrats')} Queens`);else status(tr('gridIncomplete'),false)}
function hintQ(){if(paused)return;let a=[];for(let r=0;r<current.n;r++){let c=current.sol[r];if(current.state[r][c]!==2)a.push([r,c])}if(!a.length)return;let t=a[0],z=current.reg[t[0]][t[1]];hintStage('queens',t,{where:lang()==='fr'?`observe la région ${z+1} et la ligne ${t[0]+1}.`:`look at region ${z+1} and row ${t[0]+1}.`,logic:lang()==='fr'?'croise les cases encore possibles avec les colonnes et les régions déjà occupées.':'cross-check remaining cells against occupied columns and regions.',reveal:tr('queenPlaced')},()=>{setQueenCell(t[0],t[1],2);drawQ();maybeAutoFinish()})}

// TANGO
const tangoSolutions={easy:[[0,1,0,1,0,1],[1,0,1,0,1,0],[1,1,0,0,1,0],[0,0,1,1,0,1],[1,0,0,1,0,1],[0,1,1,0,1,0]],medium:[[0,1,0,0,1,1],[1,0,1,1,0,0],[0,0,1,0,1,1],[1,1,0,1,0,0],[0,1,1,0,0,1],[1,0,0,1,1,0]],hard:[[1,0,1,0,0,1],[0,1,0,1,1,0],[1,1,0,0,1,0],[0,0,1,1,0,1],[1,0,1,0,1,0],[0,1,0,1,0,1]]};
function tango(diff){let sol=transformGrid(tangoSolutions[diff],Math.floor(Math.random()*8)),n=6,givenCount={easy:12,medium:8,hard:5}[diff],relCount={easy:8,medium:10,hard:11}[diff],positions=shuffle(Array.from({length:36},(_,i)=>i)),givens=new Set(positions.slice(0,givenCount)),edges=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(c<n-1)edges.push([r,c,'r',sol[r][c]===sol[r][c+1]?'=':'×']);if(r<n-1)edges.push([r,c,'d',sol[r][c]===sol[r+1][c]?'=':'×'])}edges=shuffle(edges).slice(0,relCount);let state=Array.from({length:n},()=>Array(n).fill(-1));for(let i of givens){let r=Math.floor(i/6),c=i%6;state[r][c]=sol[r][c]}current={game:'tango',diff,n,sol,givens,edges,state,completed:false};renderTango(current)}
function renderTango(c){shell('Tango',lang()==='fr'?'6×6 · Soleil & Lune · générée':'6×6 · Sun & Moon · generated',c.diff,`<div class="board-wrap"><div class="board" id="tboard" style="grid-template-columns:repeat(6,minmax(0,1fr));grid-template-rows:repeat(6,minmax(0,1fr))"></div></div>`,gameRules('tango'));let b=$('#tboard');for(let r=0;r<6;r++)for(let col=0;col<6;col++){let d=document.createElement('div');d.className='cell'+(c.givens.has(r*6+col)?' fixed':'');d.dataset.r=r;d.dataset.c=col;if(!c.givens.has(r*6+col))d.onclick=touchSave(()=>{let prev=current.state[r][col],next=(prev+2)%3-1;if(prev===1&&next===-1)markBacktrack();current.state[r][col]=next;haptic(8);drawT();updateScoreFlags();maybeAutoFinish()});b.appendChild(d)}drawT();$('#checkBtn').onclick=checkT;$('#hintBtn').onclick=hintT;$('#solutionBtn').onclick=()=>{if(paused)return;current.state=current.sol.map(r=>[...r]);drawT();finish(tr('solutionShown'),'revealed')}}
function drawT(){let b=$('#tboard');[...b.children].forEach((d,i)=>{let r=Math.floor(i/6),c=i%6,v=current.state[r][c];d.innerHTML=v===0?'<span class="tango-symbol">☾</span>':v===1?'<span class="tango-symbol">☀</span>':''});current.edges.forEach(([r,c,dir,s])=>{let d=b.children[r*6+c];let e=document.createElement('span');e.className='relation '+dir;e.textContent=s;d.appendChild(e)});applyIllegalClasses(b,tangoIllegalCells(),6);updateScoreFlags()}
function checkT(){if(solvedT())finish(`${tr('congrats')} Tango`);else status(tr('tangoIncomplete'),false)}
function hintT(){if(paused)return;let a=[];for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]!==current.sol[r][c]&&!current.givens.has(r*6+c))a.push([r,c]);if(!a.length)return;let t=a[0];hintStage('tango',t,{where:lang()==='fr'?`regarde la case ligne ${t[0]+1}, colonne ${t[1]+1} et ses voisines.`:`look at row ${t[0]+1}, column ${t[1]+1} and its neighbors.`,logic:lang()==='fr'?'utilise d’abord une relation =/× éventuelle, puis la règle 3/3 et l’interdiction de trois symboles identiques.':'use any =/× relation first, then the 3/3 balance and the no-three-identical rule.',reveal:tr('cellRevealed')},()=>{current.state[t[0]][t[1]]=current.sol[t[0]][t[1]];drawT();maybeAutoFinish()})}

// MINI SUDOKU 6x6 regions 2x3
const sudBase=[[1,2,3,4,5,6],[4,5,6,1,2,3],[2,3,4,5,6,1],[5,6,1,2,3,4],[3,4,5,6,1,2],[6,1,2,3,4,5]];
function countMiniSudoku(grid,limit=2){let n=6,count=0;function valid(r,c,v){for(let i=0;i<n;i++)if(grid[r][i]===v||grid[i][c]===v)return false;let br=Math.floor(r/2)*2,bc=Math.floor(c/3)*3;for(let rr=br;rr<br+2;rr++)for(let cc=bc;cc<bc+3;cc++)if(grid[rr][cc]===v)return false;return true}function bt(){if(count>=limit)return;let best=null,bestCand=null;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(grid[r][c]===0){let cand=[];for(let v=1;v<=6;v++)if(valid(r,c,v))cand.push(v);if(!cand.length)return;if(!best||cand.length<bestCand.length){best=[r,c];bestCand=cand;if(cand.length===1)break}}if(!best){count++;return}let [r,c]=best;for(let v of bestCand){grid[r][c]=v;bt();grid[r][c]=0;if(count>=limit)return}}bt();return count}
function makeSudokuHoles(sol,target){let puzzle=sol.map(r=>[...r]),order=shuffle(Array.from({length:36},(_,i)=>i)),holes=[];for(let i of order){if(holes.length>=target)break;let r=Math.floor(i/6),c=i%6,old=puzzle[r][c];puzzle[r][c]=0;if(countMiniSudoku(puzzle.map(x=>[...x]),2)===1)holes.push(i);else puzzle[r][c]=old}return new Set(holes)}
function sudoku(diff){let map=shuffle([1,2,3,4,5,6]),sol=sudBase.map(r=>r.map(v=>map[v-1]));if(Math.random()<.5)sol=sol.map(r=>[...r].reverse());if(Math.random()<.5)sol=[...sol].reverse();let holes={easy:16,medium:22,hard:27}[diff],empty=makeSudokuHoles(sol,holes);current={game:'sudoku',diff,n:6,sol,empty,state:sol.map((r,ri)=>r.map((v,c)=>empty.has(ri*6+c)?0:v)),sel:null,completed:false};renderSudoku(current)}
function renderSudoku(c){shell('Mini Sudoku',lang()==='fr'?'6×6 · chiffres 1 à 6 · générée':'6×6 · digits 1 to 6 · generated',c.diff,`<div class="board-wrap"><div class="board sudoku" id="sboard" style="grid-template-columns:repeat(6,minmax(0,1fr));grid-template-rows:repeat(6,minmax(0,1fr))"></div></div><div class="numpad" id="numpad">${[1,2,3,4,5,6].map(n=>`<button data-n="${n}">${n}</button>`).join('')}<button data-n="0" aria-label="${lang()==='fr'?'Effacer':'Erase'}">⌫</button></div>`,gameRules('sudoku'));let b=$('#sboard');for(let r=0;r<6;r++)for(let col=0;col<6;col++){let fixed=!c.empty.has(r*6+col),d=document.createElement('div');d.className='cell '+(fixed?'fixed ':'')+((col===2)?'boxR ':'')+((r===1||r===3)?'boxB ':'');if(!fixed)d.onclick=touchSave(()=>{current.sel=[r,col];drawS()});b.appendChild(d)}$('#numpad').querySelectorAll('button').forEach(bt=>bt.onclick=touchSave(()=>{if(current.sel){let [r,col]=current.sel,prev=current.state[r][col],next=+bt.dataset.n;if(prev!==0&&prev!==next)markBacktrack();current.state[r][col]=next;haptic(8);drawS();updateScoreFlags();maybeAutoFinish()}}));drawS();$('#checkBtn').onclick=checkS;$('#hintBtn').onclick=hintS;$('#solutionBtn').onclick=()=>{if(paused)return;current.state=current.sol.map(r=>[...r]);drawS();finish(tr('solutionShown'),'revealed')}}
function drawS(){let sel=current.sel,sv=sel?current.state[sel[0]][sel[1]]:0;[...$('#sboard').children].forEach((d,i)=>{let r=Math.floor(i/6),c=i%6,v=current.state[r][c];d.textContent=v||'';let sameUnit=!!sel&&(r===sel[0]||c===sel[1]||(Math.floor(r/2)===Math.floor(sel[0]/2)&&Math.floor(c/3)===Math.floor(sel[1]/3)));d.classList.toggle('peer',sameUnit&&!(r===sel[0]&&c===sel[1]));d.classList.toggle('same-value',!!sv&&v===sv&&!(r===sel[0]&&c===sel[1]));d.classList.toggle('selected',!!sel&&sel[0]===r&&sel[1]===c);d.classList.remove('error')});applyIllegalClasses($('#sboard'),sudokuIllegalCells(),6);updateScoreFlags()}
function checkS(){if(solvedS())finish(`${tr('congrats')} Mini Sudoku`);else status(tr('sudokuIncomplete'),false)}
function hintS(){if(paused)return;let a=[];for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.state[r][c]!==current.sol[r][c]&&current.empty.has(r*6+c))a.push([r,c]);if(!a.length)return;let t=a[0];hintStage('sudoku',t,{where:lang()==='fr'?`étudie la case ligne ${t[0]+1}, colonne ${t[1]+1}.`:`study the cell at row ${t[0]+1}, column ${t[1]+1}.`,logic:lang()==='fr'?'élimine les chiffres déjà présents dans sa ligne, sa colonne et son bloc 2×3.':'eliminate digits already present in its row, column and 2×3 box.',reveal:tr('digitRevealed')},()=>{current.state[t[0]][t[1]]=current.sol[t[0]][t[1]];current.sel=t;drawS();maybeAutoFinish()})}

// PATCHES — connected target regions; player paints each clue region.
const patchDefs={
easy:{n:5,reg:[[0,0,1,1,1],[0,0,1,2,2],[3,3,3,2,2],[3,4,4,4,5],[3,4,5,5,5]]},
medium:{n:6,reg:[[0,0,1,1,1,2],[0,3,3,1,2,2],[0,3,4,4,4,2],[5,3,4,6,6,6],[5,5,7,7,6,8],[5,7,7,8,8,8]]},
hard:{n:7,reg:[[0,0,1,1,1,2,2],[0,3,3,1,2,2,4],[0,3,5,5,5,4,4],[6,3,5,7,7,7,4],[6,6,5,8,7,9,9],[6,10,10,8,8,9,11],[10,10,8,8,11,11,11]]}};
function patchShape(cells){let rs=cells.map(x=>x[0]),cs=cells.map(x=>x[1]),h=Math.max(...rs)-Math.min(...rs)+1,w=Math.max(...cs)-Math.min(...cs)+1,rect=h*w===cells.length;if(!rect)return 'libre';if(h===w)return 'carré';return h>w?'vertical':'horizontal'}
function patches(diff){let def=patchDefs[diff],reg=transformGrid(def.reg,Math.floor(Math.random()*8)),n=reg.length,ids=[...new Set(reg.flat())],cellsBy={};ids.forEach(id=>cellsBy[id]=[]);for(let r=0;r<n;r++)for(let c=0;c<n;c++)cellsBy[reg[r][c]].push([r,c]);let clues={};ids.forEach(id=>{let cells=cellsBy[id],p=cells[Math.floor(cells.length/2)],mode=diff==='easy'?'both':diff==='medium'?(Math.random()<.5?'size':'shape'):(Math.random()<.45?'shape':Math.random()<.8?'size':'none');clues[id]={pos:p,size:cells.length,shape:patchShape(cells),mode}});const pal=['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1'];current={game:'patches',diff,n,reg,ids,cellsBy,clues,pal,active:ids[0],paint:Array.from({length:n},()=>Array(n).fill(null)),completed:false};renderPatches(current)}
function renderPatches(c){shell('Patches',lang()==='fr'?`${c.n}×${c.n} · générée · reconstruis les zones`:`${c.n}×${c.n} · generated · rebuild regions`,c.diff,`<div class="patch-palette" id="patchPalette"></div><div class="board-wrap"><div class="board" id="pboard" style="grid-template-columns:repeat(${c.n},minmax(0,1fr));grid-template-rows:repeat(${c.n},minmax(0,1fr))"></div></div><div class="legend">${tr('patchesLegend')}</div>`,gameRules('patches'));let pp=$('#patchPalette');c.ids.forEach(id=>{let bt=document.createElement('button');bt.className='patch-chip';bt.style.background=c.pal[id%c.pal.length];bt.dataset.id=id;bt.textContent=`${tr('zone')} ${id+1}`;bt.onclick=touchSave(()=>{current.active=+bt.dataset.id;drawP()});pp.appendChild(bt)});let b=$('#pboard'),painting=false,paintValue=true,pointerId=null;function paintCell(r,col){if(paused)return;let target=paintValue?current.active:null;if(current.paint[r][col]!==target){if(current.paint[r][col]!==null&&(target===null||target!==current.paint[r][col]))markBacktrack();current.paint[r][col]=target;drawP();saveCurrent();updateScoreFlags();maybeAutoFinish()}}function paintAtPoint(x,y){let el=document.elementFromPoint(x,y)?.closest('.patch-cell');if(el&&b.contains(el))paintCell(+el.dataset.r,+el.dataset.c)}for(let r=0;r<c.n;r++)for(let col=0;col<c.n;col++){let d=document.createElement('div');d.className='cell patch-cell';d.dataset.r=r;d.dataset.c=col;d.onpointerdown=e=>{if(paused)return;e.preventDefault();painting=true;pointerId=e.pointerId;paintValue=current.paint[r][col]!==current.active;haptic(7);try{b.setPointerCapture(pointerId)}catch(_){}paintCell(r,col)};b.appendChild(d)}b.onpointermove=e=>{if(painting&&e.pointerId===pointerId){e.preventDefault();paintAtPoint(e.clientX,e.clientY)}};let endPaint=e=>{if(e.pointerId===pointerId){painting=false;try{b.releasePointerCapture(pointerId)}catch(_){}pointerId=null}};b.onpointerup=endPaint;b.onpointercancel=endPaint;drawP();$('#checkBtn').onclick=checkP;$('#hintBtn').onclick=hintP;$('#solutionBtn').onclick=()=>{if(paused)return;current.paint=current.reg.map(r=>[...r]);drawP();finish(tr('solutionShown'),'revealed')}}
function clueHTML(cl){let parts=[];if(cl.mode==='both'||cl.mode==='size')parts.push(`<b>${cl.size}</b>`);if(cl.mode==='both'||cl.mode==='shape')parts.push(`<span>${cl.shape==='carré'?'□':cl.shape==='vertical'?'▯':cl.shape==='horizontal'?'▭':'✣'}</span>`);if(cl.mode==='none')parts.push('<b>?</b>');return `<span class="patch-clue">${parts.join('')}</span>`}
function drawP(){let b=$('#pboard');[...b.children].forEach((d,i)=>{let r=Math.floor(i/current.n),c=i%current.n,p=current.paint[r][c];d.style.background=p===null?'#fff':current.pal[p%current.pal.length];d.classList.toggle('paint',p!==null);d.innerHTML='';d.classList.remove('clue');for(let id of current.ids){let [rr,cc]=current.clues[id].pos;if(rr===r&&cc===c){d.classList.add('clue');d.innerHTML=clueHTML(current.clues[id]);break}}});$('#patchPalette').querySelectorAll('.patch-chip').forEach(x=>x.classList.toggle('active',+x.dataset.id===current.active));applyIllegalClasses(b,patchIllegalCells(),current.n);updateScoreFlags()}
function checkP(){let n=current.n,all=current.paint.every(row=>row.every(v=>v!==null));if(!all){status(tr('patchAll'),false);return}let cluePositions=new Map(current.ids.map(id=>[current.clues[id].pos.join(','),id]));for(let id of current.ids){let cells=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.paint[r][c]===id)cells.push([r,c]);if(!cells.length){status(tr('patchEach'),false);return}let own=current.clues[id].pos;if(!cells.some(([r,c])=>r===own[0]&&c===own[1])){status(tr('patchOwn'),false);return}let other=cells.some(([r,c])=>cluePositions.has(r+','+c)&&cluePositions.get(r+','+c)!==id);if(other){status(tr('patchTwo'),false);return}let seen=new Set([cells[0].join(',')]),q=[cells[0]],set=new Set(cells.map(x=>x.join(',')));while(q.length){let [r,c]=q.pop();for(let [rr,cc] of [[r+1,c],[r-1,c],[r,c+1],[r,c-1]]){let k=rr+','+cc;if(set.has(k)&&!seen.has(k)){seen.add(k);q.push([rr,cc])}}}if(seen.size!==cells.length){status(tr('patchConnected'),false);return}let cl=current.clues[id],sh=patchShape(cells);if(sh==='libre'){status(tr('patchRect'),false);return}if((cl.mode==='both'||cl.mode==='size')&&cells.length!==cl.size){status(tr('patchSize'),false);return}if((cl.mode==='both'||cl.mode==='shape')&&sh!==cl.shape){status(tr('patchShape'),false);return}}finish(`${tr('congrats')} Patches`)}
function hintP(){if(paused)return;let bad=[];for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]!==current.reg[r][c])bad.push([r,c]);if(!bad.length)return;let t=bad[0],id=current.reg[t[0]][t[1]],cl=current.clues[id];hintStage('patches',t,{where:lang()==='fr'?`observe l’indice de la zone ${id+1} et les cases autour.`:`look at region ${id+1}'s clue and nearby cells.`,logic:lang()==='fr'?`teste les rectangles compatibles avec ${cl.mode==='size'||cl.mode==='both'?'la taille '+cl.size:'sa forme'} sans recouvrir un autre indice.`:`test rectangles compatible with ${cl.mode==='size'||cl.mode==='both'?'area '+cl.size:'its shape'} without covering another clue.`,reveal:tr('patchRevealed')},()=>{current.paint[t[0]][t[1]]=id;drawP();maybeAutoFinish()})}
// ===== v1.2 generators: generated puzzles + uniqueness checks =====
function countQueensGenerated(reg,limit=2){const n=reg.length;let count=0,usedC=new Set(),usedR=new Set();function bt(r,prev){if(count>=limit)return;if(r===n){count++;return}for(let c=0;c<n;c++){let z=reg[r][c];if(usedC.has(c)||usedR.has(z))continue;if(r>0&&Math.abs(c-prev)===1)continue;usedC.add(c);usedR.add(z);bt(r+1,c);usedC.delete(c);usedR.delete(z);if(count>=limit)return}}bt(0,-99);return count}
function randomQueenSolution(n){for(let t=0;t<3000;t++){let p=shuffle(Array.from({length:n},(_,i)=>i));if(p.every((c,r)=>r===0||Math.abs(c-p[r-1])!==1))return p}return null}
function queenRegionsFromSolution(sol,singleCount){const n=sol.length,singleRows=new Set(shuffle(Array.from({length:n},(_,i)=>i)).slice(0,singleCount)),reg=Array.from({length:n},()=>Array(n).fill(-1));for(let r=0;r<n;r++)reg[r][sol[r]]=r;let left=n*n-n;while(left){let options=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(reg[r][c]===-1){let ids=[];for(let [rr,cc] of [[r+1,c],[r-1,c],[r,c+1],[r,c-1]])if(rr>=0&&rr<n&&cc>=0&&cc<n&&reg[rr][cc]>=0&&!singleRows.has(reg[rr][cc])&&!ids.includes(reg[rr][cc]))ids.push(reg[rr][cc]);if(ids.length)options.push([r,c,ids])}if(!options.length)return null;let [r,c,ids]=options[Math.floor(Math.random()*options.length)],sizes=Array(n).fill(0);for(let row of reg)for(let x of row)if(x>=0)sizes[x]++;ids.sort((a,b)=>sizes[a]-sizes[b]);let pool=ids.slice(0,Math.min(2,ids.length)),id=pool[Math.floor(Math.random()*pool.length)];reg[r][c]=id;left--}return reg}

function queenRegionConnectedAfterMove(reg,id,rr,cc){
  let cells=[];for(let r=0;r<reg.length;r++)for(let c=0;c<reg.length;c++)if(reg[r][c]===id&&!(r===rr&&c===cc))cells.push([r,c]);
  if(!cells.length)return false;
  let set=new Set(cells.map(x=>x.join(','))),seen=new Set([cells[0].join(',')]),q=[cells[0]];
  while(q.length){let [r,c]=q.pop();for(let [r2,c2] of [[r+1,c],[r-1,c],[r,c+1],[r,c-1]]){let k=r2+','+c2;if(set.has(k)&&!seen.has(k)){seen.add(k);q.push([r2,c2])}}}
  return seen.size===cells.length
}
function reduceQueenSingletons(reg,sol,maxSingles){
  reg=reg.map(r=>[...r]);let n=reg.length;
  for(let pass=0;pass<n*3;pass++){
    let sizes=Array(n).fill(0);for(let row of reg)for(let id of row)sizes[id]++;
    let singles=[];for(let id=0;id<n;id++)if(sizes[id]===1)singles.push(id);
    if(singles.length<=maxSingles)return reg;
    let changed=false;
    for(let id of shuffle(singles.slice(maxSingles))){
      let qr=id,qc=sol[id],cands=[];
      for(let [rr,cc] of shuffle([[qr+1,qc],[qr-1,qc],[qr,qc+1],[qr,qc-1]])){
        if(rr<0||rr>=n||cc<0||cc>=n)continue;
        let donor=reg[rr][cc];
        if(donor===id||sizes[donor]<3)continue;
        if(rr===donor&&cc===sol[donor])continue; // never steal donor queen
        if(!queenRegionConnectedAfterMove(reg,donor,rr,cc))continue;
        cands.push([rr,cc,donor])
      }
      if(cands.length){
        let [rr,cc,donor]=cands[Math.floor(Math.random()*cands.length)];
        reg[rr][cc]=id;sizes[id]++;sizes[donor]--;changed=true
      }
    }
    if(!changed)break
  }
  let sizes=Array(n).fill(0);for(let row of reg)for(let id of row)sizes[id]++;
  return sizes.filter(x=>x===1).length<=maxSingles?reg:null
}


const queenStrictFallback={
 hard:{sol:[1,5,3,7,4,6,0,2],reg:[[0,0,2,2,2,1,1,1],[0,2,2,2,2,1,2,1],[6,6,6,2,2,2,2,2],[6,6,2,2,2,5,5,3],[6,6,7,4,4,4,5,3],[6,7,7,4,5,5,5,5],[6,7,7,5,5,7,7,5],[7,7,7,7,7,7,7,7]]},
 expert:{sol:[6,2,0,7,3,8,4,1,5],reg:[[1,1,1,0,0,0,0,3,5],[2,1,1,1,4,0,3,3,5],[2,2,2,4,4,0,4,3,5],[7,6,6,4,4,4,4,3,5],[7,7,6,4,6,6,6,6,5],[7,6,6,6,6,5,5,6,5],[7,7,7,6,6,5,5,6,5],[7,7,8,6,6,6,5,6,5],[7,8,8,8,8,8,5,5,5]]}
};
function transformedQueenFallback(diff){
  let base=queenStrictFallback[diff],k=Math.floor(Math.random()*8),reg=transformGrid(base.reg,k),n=reg.length,mask=base.sol.map((c,r)=>Array.from({length:n},(_,j)=>j===c?1:0));
  mask=transformGrid(mask,k);let sol=Array(n).fill(-1);for(let r=0;r<n;r++)sol[r]=mask[r].indexOf(1);
  return {n,sol,reg}
}
function generateQueensPuzzle(diff){
  const n={easy:6,medium:7,hard:8,expert:9}[diff],single={easy:4,medium:3,hard:2,expert:3}[diff],maxSingles={easy:99,medium:99,hard:1,expert:0}[diff];
  for(let t=0;t<(diff==='expert'?260:diff==='hard'?180:240);t++){
    let sol=randomQueenSolution(n);if(!sol)continue;
    let reg=queenRegionsFromSolution(sol,single);if(!reg)continue;
    if(diff==='hard'||diff==='expert'){reg=reduceQueenSingletons(reg,sol,maxSingles);if(!reg)continue}
    if(countQueensGenerated(reg,2)===1)return {n,sol,reg}
  }
  if(diff==='hard'||diff==='expert')return transformedQueenFallback(diff);
  throw new Error('Queens generation failed')
}
function queens(diff){let g=generateQueensPuzzle(diff);current={game:'queens',diff,n:g.n,reg:g.reg,sol:g.sol,state:Array.from({length:g.n},()=>Array(g.n).fill(0)),generated:true,unique:true,completed:false};renderQueens(current)}

const tangoValidRows=(()=>{let rows=[];for(let m=0;m<64;m++){let a=Array.from({length:6},(_,i)=>(m>>(5-i))&1);if(a.reduce((x,y)=>x+y,0)!==3)continue;if([0,1,2,3].some(i=>a[i]===a[i+1]&&a[i]===a[i+2]))continue;rows.push(a)}return rows})();
function generateTangoSolution(){let grid=[];function partialOK(row){for(let c=0;c<6;c++){let col=grid.map(r=>r[c]).concat(row[c]);let ones=col.reduce((a,b)=>a+b,0);if(ones>3||col.length-ones>3)return false;let L=col.length;if(L>=3&&col[L-1]===col[L-2]&&col[L-1]===col[L-3])return false}return true}function bt(r){if(r===6)return true;for(let row of shuffle(tangoValidRows)){if(!partialOK(row))continue;grid.push(row);if(bt(r+1))return true;grid.pop()}return false}bt(0);return grid.map(r=>[...r])}
function tangoEdgeValue(sol,r,c,d){let a=sol[r][c],b=d==='r'?sol[r][c+1]:sol[r+1][c];return a===b?'=':'×'}
function countTangoSolutions(givens,edges,limit=2){let grid=Array.from({length:6},()=>Array(6).fill(-1)),count=0;for(let i of givens.keys()){let r=Math.floor(i/6),c=i%6;grid[r][c]=givens.get(i)}function partial(r,c,v){for(let [rr,cc,d,s] of edges){let r2=d==='r'?rr:rr+1,c2=d==='r'?cc+1:cc;if((rr===r&&cc===c)||(r2===r&&c2===c)){let other=(rr===r&&cc===c)?grid[r2][c2]:grid[rr][cc];if(other!==-1&&((s==='='&&v!==other)||(s==='×'&&v===other)))return false}}let row=grid[r].slice();row[c]=v;let ones=row.filter(x=>x===1).length,zeros=row.filter(x=>x===0).length;if(ones>3||zeros>3)return false;for(let i=0;i<4;i++)if(row[i]!==-1&&row[i]===row[i+1]&&row[i]===row[i+2])return false;let col=grid.map((x,rr)=>rr===r?v:x[c]),co=col.filter(x=>x===1).length,cz=col.filter(x=>x===0).length;if(co>3||cz>3)return false;for(let i=0;i<4;i++)if(col[i]!==-1&&col[i]===col[i+1]&&col[i]===col[i+2])return false;return true}function bt(){if(count>=limit)return;let best=null,bestVals=null;for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(grid[r][c]===-1){let vals=[0,1].filter(v=>partial(r,c,v));if(!vals.length)return;if(!best||vals.length<bestVals.length){best=[r,c];bestVals=vals;if(vals.length===1)break}}if(!best){count++;return}let [r,c]=best;for(let v of bestVals){grid[r][c]=v;bt();grid[r][c]=-1;if(count>=limit)return}}bt();return count}
function generateTangoPuzzle(diff){for(let attempt=0;attempt<80;attempt++){let sol=generateTangoSolution(),all=[];for(let i=0;i<36;i++)all.push({t:'g',i,v:sol[Math.floor(i/6)][i%6]});for(let r=0;r<6;r++)for(let c=0;c<6;c++){if(c<5)all.push({t:'e',e:[r,c,'r',tangoEdgeValue(sol,r,c,'r')]});if(r<5)all.push({t:'e',e:[r,c,'d',tangoEdgeValue(sol,r,c,'d')]})}let giv=new Map(),edges=[],order=shuffle(all),minClues={easy:15,medium:12,hard:10}[diff];for(let clue of order){if(clue.t==='g')giv.set(clue.i,clue.v);else edges.push(clue.e);if(giv.size+edges.length>=minClues&&countTangoSolutions(giv,edges,2)===1)break}if(countTangoSolutions(giv,edges,2)!==1)continue;let removals=shuffle([...giv.keys()].map(i=>({t:'g',i})).concat(edges.map((e,i)=>({t:'e',e,i}))));for(let rm of removals){if(giv.size+edges.length<=minClues)break;if(rm.t==='g'){let v=giv.get(rm.i);giv.delete(rm.i);if(countTangoSolutions(giv,edges,2)!==1)giv.set(rm.i,v)}else{let idx=edges.findIndex(e=>e.join('|')===rm.e.join('|'));if(idx<0)continue;let old=edges.splice(idx,1)[0];if(countTangoSolutions(giv,edges,2)!==1)edges.splice(idx,0,old)}}return {sol,givens:new Set(giv.keys()),edges}}throw new Error('Tango generation failed')}
function tango(diff){let g=generateTangoPuzzle(diff),state=Array.from({length:6},()=>Array(6).fill(-1));for(let i of g.givens){let r=Math.floor(i/6),c=i%6;state[r][c]=g.sol[r][c]}current={game:'tango',diff,n:6,sol:g.sol,givens:g.givens,edges:g.edges,state,generated:true,unique:true,completed:false};renderTango(current)}

function randomSudokuSolution(){let bands=shuffle([[0,1],[2,3],[4,5]]),rows=bands.flatMap(b=>shuffle(b)),stacks=shuffle([[0,1,2],[3,4,5]]),cols=stacks.flatMap(s=>shuffle(s)),map=shuffle([1,2,3,4,5,6]);return rows.map(r=>cols.map(c=>map[sudBase[r][c]-1]))}
function sudoku(diff){let sol=randomSudokuSolution(),holes={easy:16,medium:22,hard:27}[diff],empty=makeSudokuHoles(sol,holes),actual=empty.size;if(actual<Math.min(holes-2,20)){sol=randomSudokuSolution();empty=makeSudokuHoles(sol,holes);actual=empty.size}current={game:'sudoku',diff,n:6,sol,empty,state:sol.map((r,ri)=>r.map((v,c)=>empty.has(ri*6+c)?0:v)),sel:null,generated:true,unique:countMiniSudoku(sol.map((r,ri)=>r.map((v,c)=>empty.has(ri*6+c)?0:v)),2)===1,completed:false};renderSudoku(current)}

function makeRectTiling(n,target){let targetCount=target[0]+Math.floor(Math.random()*(target[1]-target[0]+1)),rects=[{r:0,c:0,h:n,w:n}];let guard=0;while(rects.length<targetCount&&guard++<300){let candidates=rects.map((x,i)=>[x,i]).filter(([x])=>x.h>1||x.w>1);if(!candidates.length)break;let [rect,idx]=candidates[Math.floor(Math.random()*candidates.length)],splits=[];if(rect.h>1)for(let k=1;k<rect.h;k++)splits.push(['h',k]);if(rect.w>1)for(let k=1;k<rect.w;k++)splits.push(['w',k]);let [dir,k]=splits[Math.floor(Math.random()*splits.length)],a,b;if(dir==='h'){a={r:rect.r,c:rect.c,h:k,w:rect.w};b={r:rect.r+k,c:rect.c,h:rect.h-k,w:rect.w}}else{a={r:rect.r,c:rect.c,h:rect.h,w:k};b={r:rect.r,c:rect.c+k,h:rect.h,w:rect.w-k}}rects.splice(idx,1,a,b)}if(rects.length!==targetCount)return null;let reg=Array.from({length:n},()=>Array(n).fill(-1));rects.forEach((x,id)=>{x.id=id;for(let r=x.r;r<x.r+x.h;r++)for(let c=x.c;c<x.c+x.w;c++)reg[r][c]=id});return {reg,rects}}
function rectShape(h,w){return h===w?'carré':h>w?'vertical':'horizontal'}
function possiblePatchRects(n,clue,allCluePos){let out=[];for(let r0=0;r0<n;r0++)for(let r1=r0;r1<n;r1++)for(let c0=0;c0<n;c0++)for(let c1=c0;c1<n;c1++){if(clue.pos[0]<r0||clue.pos[0]>r1||clue.pos[1]<c0||clue.pos[1]>c1)continue;let h=r1-r0+1,w=c1-c0+1,area=h*w,shape=rectShape(h,w);if((clue.mode==='both'||clue.mode==='size')&&area!==clue.size)continue;if((clue.mode==='both'||clue.mode==='shape')&&shape!==clue.shape)continue;let containsOther=false;for(let p of allCluePos)if(p!==clue.pos&&p[0]>=r0&&p[0]<=r1&&p[1]>=c0&&p[1]<=c1){containsOther=true;break}if(!containsOther){let cells=[];for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)cells.push(r*n+c);out.push(cells)}}return out}
function countPatchSolutions(n,ids,clues,limit=2){let positions=ids.map(id=>clues[id].pos),opts={};for(let id of ids){opts[id]=possiblePatchRects(n,clues[id],positions);if(!opts[id].length)return 0}let count=0,covered=new Set();function bt(done){if(count>=limit)return;if(done.size===ids.length){if(covered.size===n*n)count++;return}let best=null,bestOpts=null;for(let id of ids)if(!done.has(id)){let avail=opts[id].filter(cells=>cells.every(x=>!covered.has(x)));if(!avail.length)return;if(!best||avail.length<bestOpts.length){best=id;bestOpts=avail;if(avail.length===1)break}}done.add(best);for(let cells of bestOpts){cells.forEach(x=>covered.add(x));bt(done);cells.forEach(x=>covered.delete(x));if(count>=limit)break}done.delete(best)}bt(new Set());return count}
function generatePatchesPuzzle(diff){let n={easy:5,medium:6,hard:7}[diff],range={easy:[6,8],medium:[8,10],hard:[10,12]}[diff];for(let attempt=0;attempt<160;attempt++){let til=makeRectTiling(n,range);if(!til)continue;let ids=til.rects.map(x=>x.id),clues={};for(let rect of til.rects){let cells=[];for(let r=rect.r;r<rect.r+rect.h;r++)for(let c=rect.c;c<rect.c+rect.w;c++)cells.push([r,c]);let pos=cells[Math.floor(Math.random()*cells.length)];clues[rect.id]={pos,size:rect.h*rect.w,shape:rectShape(rect.h,rect.w),mode:'both'}}if(countPatchSolutions(n,ids,clues,2)!==1)continue;let order=shuffle(ids),choices=diff==='easy'?['size','shape']:diff==='medium'?['size','shape','none']:['none','shape','size'];for(let id of order){let old=clues[id].mode;for(let mode of shuffle(choices)){clues[id].mode=mode;if(countPatchSolutions(n,ids,clues,2)===1)break;clues[id].mode=old}}if(countPatchSolutions(n,ids,clues,2)===1){let cellsBy={};for(let id of ids)cellsBy[id]=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)cellsBy[til.reg[r][c]].push([r,c]);return {n,reg:til.reg,ids,cellsBy,clues}}}throw new Error('Patches generation failed')}
function patches(diff){let g=generatePatchesPuzzle(diff);const pal=['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1'];current={game:'patches',diff,n:g.n,reg:g.reg,ids:g.ids,cellsBy:g.cellsBy,clues:g.clues,pal,active:g.ids[0],paint:Array.from({length:g.n},()=>Array(g.n).fill(null)),generated:true,unique:true,completed:false};renderPatches(current)}

function keyboardInput(e){if(!current||paused||current.completed)return;if(current.game==='sudoku'&&current.sel){let n=Number(e.key);if(n>=1&&n<=6){let [r,c]=current.sel;if(current.empty.has(r*6+c)){let prev=current.state[r][c];if(prev!==0&&prev!==n)markBacktrack();current.state[r][c]=n;haptic(6);drawS();saveCurrent();updateScoreFlags();maybeAutoFinish();e.preventDefault()}}else if(e.key==='Backspace'||e.key==='Delete'||e.key==='0'){let [r,c]=current.sel;if(current.empty.has(r*6+c)){if(current.state[r][c]!==0)markBacktrack();current.state[r][c]=0;drawS();saveCurrent();updateScoreFlags();e.preventDefault()}}}}
document.addEventListener('keydown',keyboardInput);
function status(t,ok){let s=$('#status');if(!s)return;s.textContent=t;s.className='status '+(ok?'ok':'bad');if(!ok)playTone('error')}
function finish(t,outcome='solved'){let total=timerSeconds(),snapshot=current?{...current}:null;stopTimer(false);elapsedBase=total;startedAt=0;paused=true;if(current){statsFinish(current,total,outcome);markDaily(current,outcome,total);current.completed=true}clearSaved();renderTimer();status(`${t} — ${fmt(elapsedBase)}`,true);updatePauseButton();if(outcome==='solved'&&snapshot)requestAnimationFrame(()=>{celebrateBoard();setTimeout(()=>victoryOverlay(snapshot,total),2100)})}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&current&&!current.completed)saveCurrent()});window.addEventListener('pagehide',()=>{if(current&&!current.completed)saveCurrent()});if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
applyPrefs();try{window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(prefs().theme==='auto')applyPrefs()})}catch(_){}home();


// ===== v1.3 — analyseurs de difficulté =====
function collectCandidates(factory,count){let out=[],guard=0;while(out.length<count&&guard++<count*4){try{out.push(factory())}catch(_){}}if(!out.length)throw new Error('generation failed');return out}
function targetPick(items,diff){items=items.filter(x=>x&&x.rating&&Number.isFinite(x.rating.score)).sort((a,b)=>a.rating.score-b.rating.score);if(!items.length)throw new Error('difficulty analysis failed');return diff==='easy'?items[0]:(diff==='hard'||diff==='expert')?items[items.length-1]:items[Math.floor((items.length-1)/2)]}
function labelTechnique(kind,level){const maps={fr:{sudoku:['single nu','single caché','blocage logique'],tango:['équilibrage / trio','relation = / ×','chaîne de contraintes'],patches:['rectangle forcé','couverture forcée','enchaînement spatial'],queens:['contrainte ligne/zone','propagation croisée','recherche contrainte']},en:{sudoku:['naked single','hidden single','logical stall'],tango:['balance / triple','relation = / ×','constraint chain'],patches:['forced rectangle','forced coverage','spatial chain'],queens:['row/region constraint','cross propagation','constraint search']}};return maps[lang()][kind][Math.min(level,2)]}
function analyzeSudoku(sol,empty){let g=sol.map((r,ri)=>r.map((v,c)=>empty.has(ri*6+c)?0:v)),steps=0,hidden=0;function cand(r,c){let s=new Set([1,2,3,4,5,6]);for(let i=0;i<6;i++){s.delete(g[r][i]);s.delete(g[i][c])}let br=Math.floor(r/2)*2,bc=Math.floor(c/3)*3;for(let rr=br;rr<br+2;rr++)for(let cc=bc;cc<bc+3;cc++)s.delete(g[rr][cc]);return [...s]}let guard=0;while(g.some(r=>r.includes(0))&&guard++<100){let progress=false;for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(!g[r][c]){let a=cand(r,c);if(a.length===1){g[r][c]=a[0];steps++;progress=true}}if(progress)continue;let units=[];for(let r=0;r<6;r++)units.push(Array.from({length:6},(_,c)=>[r,c]));for(let c=0;c<6;c++)units.push(Array.from({length:6},(_,r)=>[r,c]));for(let br=0;br<6;br+=2)for(let bc=0;bc<6;bc+=3){let u=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)u.push([r,c]);units.push(u)}outer:for(let u of units)for(let v=1;v<=6;v++){let ps=u.filter(([r,c])=>!g[r][c]&&cand(r,c).includes(v));if(ps.length===1){g[ps[0][0]][ps[0][1]]=v;steps++;hidden++;progress=true;break outer}}if(!progress)break}let remain=g.flat().filter(x=>!x).length,level=remain?2:hidden?1:0,score=Math.round(steps+hidden*2+remain*5);return {score,technique:labelTechnique('sudoku',level),solved:remain===0,remain,level}}
function tangoLocalVals(grid,edges,r,c){let vals=[];for(let v of [0,1]){let row=grid[r].slice();row[c]=v;let ones=row.filter(x=>x===1).length,zeros=row.filter(x=>x===0).length;if(ones>3||zeros>3)continue;let bad=false;for(let i=0;i<4;i++)if(row[i]!==-1&&row[i]===row[i+1]&&row[i]===row[i+2])bad=true;let col=grid.map((x,rr)=>rr===r?v:x[c]),co=col.filter(x=>x===1).length,cz=col.filter(x=>x===0).length;if(co>3||cz>3)bad=true;for(let i=0;i<4;i++)if(col[i]!==-1&&col[i]===col[i+1]&&col[i]===col[i+2])bad=true;for(let [rr,cc,d,s] of edges){let r2=d==='r'?rr:rr+1,c2=d==='r'?cc+1:cc;if((rr===r&&cc===c)||(r2===r&&c2===c)){let other=(rr===r&&cc===c)?grid[r2][c2]:grid[rr][cc];if(other!==-1&&((s==='='&&v!==other)||(s==='×'&&v===other)))bad=true}}if(!bad)vals.push(v)}return vals}
function analyzeTango(sol,givens,edges){let g=Array.from({length:6},()=>Array(6).fill(-1));for(let i of givens)g[Math.floor(i/6)][i%6]=sol[Math.floor(i/6)][i%6];let steps=0,rel=0,guard=0;while(g.flat().includes(-1)&&guard++<100){let progress=false;for(let [r,c,d,s] of edges){let r2=d==='r'?r:r+1,c2=d==='r'?c+1:c,a=g[r][c],b=g[r2][c2];if(a!==-1&&b===-1){g[r2][c2]=s==='='?a:1-a;steps++;rel++;progress=true}else if(b!==-1&&a===-1){g[r][c]=s==='='?b:1-b;steps++;rel++;progress=true}}for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(g[r][c]===-1){let vals=tangoLocalVals(g,edges,r,c);if(vals.length===1){g[r][c]=vals[0];steps++;progress=true}}if(!progress)break}let remain=g.flat().filter(x=>x===-1).length,level=remain?2:rel?1:0,score=Math.round(steps+rel*1.5+remain*3);return {score,technique:labelTechnique('tango',level),solved:remain===0,remain,level}}
function analyzePatches(n,ids,clues){let positions=ids.map(id=>clues[id].pos),opts={};for(let id of ids)opts[id]=possiblePatchRects(n,clues[id],positions);let chosen=new Map(),covered=new Set(),steps=0,coverForced=0,guard=0;while(chosen.size<ids.length&&guard++<100){let progress=false;for(let id of ids)if(!chosen.has(id)){let a=opts[id].filter(c=>c.every(x=>!covered.has(x)));if(a.length===1){chosen.set(id,a[0]);a[0].forEach(x=>covered.add(x));steps++;progress=true}}if(progress)continue;for(let cell=0;cell<n*n;cell++)if(!covered.has(cell)){let owners=[];for(let id of ids)if(!chosen.has(id))for(let cells of opts[id])if(cells.includes(cell)&&cells.every(x=>!covered.has(x)))owners.push([id,cells]);let uniq=[...new Set(owners.map(x=>x[0]))];if(uniq.length===1){let id=uniq[0],arr=owners.filter(x=>x[0]===id);if(arr.length===1){chosen.set(id,arr[0][1]);arr[0][1].forEach(x=>covered.add(x));steps++;coverForced++;progress=true;break}}}if(!progress)break}let remain=ids.length-chosen.size,level=remain?2:coverForced?1:0,branch=ids.reduce((s,id)=>s+Math.max(0,opts[id].length-1),0),score=Math.round(steps+coverForced*2+remain*5+branch*.25);return {score,technique:labelTechnique('patches',level),solved:remain===0,remain,level}}
function queenSearchStats(reg){let n=reg.length,nodes=0,maxBranch=0;function bt(r,cols,zones,prev){nodes++;if(r===n)return true;let cand=[];for(let c=0;c<n;c++){let z=reg[r][c];if(cols.has(c)||zones.has(z)||(r>0&&Math.abs(c-prev)===1))continue;cand.push(c)}maxBranch=Math.max(maxBranch,cand.length);for(let c of cand){let z=reg[r][c];cols.add(c);zones.add(z);if(bt(r+1,cols,zones,c))return true;cols.delete(c);zones.delete(z)}return false}bt(0,new Set(),new Set(),-99);return {nodes,maxBranch}}
function analyzeQueens(reg){let n=reg.length,regionSizes={};for(let x of reg.flat())regionSizes[x]=(regionSizes[x]||0)+1;let singles=Object.values(regionSizes).filter(x=>x===1).length,stats=queenSearchStats(reg),score=Math.round((stats.nodes-n-1)*2+stats.maxBranch*3+(n-singles)*2);let level=score>220?2:score>70?1:0;return {score,technique:labelTechnique('queens',level),solved:true,remain:0,level,nodes:stats.nodes,singles}}
function queenCandidate(diff){let g=generateQueensPuzzle(diff);g.rating=analyzeQueens(g.reg);return g}
function tangoCandidate(diff){let g=generateTangoPuzzle(diff);g.rating=analyzeTango(g.sol,g.givens,g.edges);return g}
function sudokuCandidate(diff){let sol=randomSudokuSolution(),holes={easy:16,medium:22,hard:27}[diff],empty=makeSudokuHoles(sol,holes);return {sol,empty,rating:analyzeSudoku(sol,empty)}}
function patchesCandidate(diff){let g=generatePatchesPuzzle(diff);g.rating=analyzePatches(g.n,g.ids,g.clues);return g}
function queens(diff){let g=targetPick(collectCandidates(()=>queenCandidate(diff),diff==='expert'?16:diff==='hard'?14:6),diff);current={game:'queens',diff,n:g.n,reg:g.reg,sol:g.sol,rating:g.rating,state:Array.from({length:g.n},()=>Array(g.n).fill(0)),generated:true,unique:true,completed:false};renderQueens(current)}
function tango(diff){let g=targetPick(collectCandidates(()=>tangoCandidate(diff),6),diff),state=Array.from({length:6},()=>Array(6).fill(-1));for(let i of g.givens)state[Math.floor(i/6)][i%6]=g.sol[Math.floor(i/6)][i%6];current={game:'tango',diff,n:6,sol:g.sol,givens:g.givens,edges:g.edges,rating:g.rating,state,generated:true,unique:true,completed:false};renderTango(current)}
function sudoku(diff){let g=targetPick(collectCandidates(()=>sudokuCandidate(diff),8),diff),sol=g.sol,empty=g.empty;current={game:'sudoku',diff,n:6,sol,empty,rating:g.rating,state:sol.map((r,ri)=>r.map((v,c)=>empty.has(ri*6+c)?0:v)),sel:null,generated:true,unique:true,completed:false};renderSudoku(current)}
function patches(diff){let g=targetPick(collectCandidates(()=>patchesCandidate(diff),diff==='hard'?5:4),diff);const pal=['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1'];current={game:'patches',diff,n:g.n,reg:g.reg,ids:g.ids,cellsBy:g.cellsBy,clues:g.clues,rating:g.rating,pal,active:g.ids[0],paint:Array.from({length:g.n},()=>Array(g.n).fill(null)),generated:true,unique:true,completed:false};renderPatches(current)}
