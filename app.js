/*
 * Logic 4
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation without prior written authorization is prohibited.
 */
'use strict';
const $=s=>document.querySelector(s), app=$('#app'), toast=$('#toast'), timerEl=$('#timer');
const VERSION='2.8.1', SAVE_KEY='logic4-save-v1';
let current=null, tick=null, startedAt=0, elapsedBase=0, paused=false;
const I18N={
fr:{
 easy:'Facile',medium:'Moyen',hard:'Difficile',expert:'Expert',gameQueens:'Couronnes',gameTango:'Équilibre',gameSudoku:'Mini 6',gamePatches:'Mosaïque',
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
 patchesLegend:'Fais glisser le doigt d’un coin à l’autre pour dessiner ou redimensionner un rectangle. La zone est choisie automatiquement quand le rectangle contient un seul indice. Un tap sur un rectangle existant le supprime.',zone:'Zone',
 aboutTitle:'À propos de Logic 4',version:'Version',copyright:'Copyright',license:'Licence',proprietary:'Logiciel propriétaire — All rights reserved.',legal:'Toute copie, modification, redistribution et exploitation sans autorisation écrite préalable de Serge Benoliel est interdite.',
 restored:'Partie restaurée',generating:'Génération…',rulesTitle:'Règles',where:'Où regarder',logic:'Logique',solutionShown:'Solution affichée',congrats:'Bravo !',gridIncomplete:'Il reste une erreur ou une case à résoudre.',tangoIncomplete:'La grille ne respecte pas encore toutes les règles.',sudokuIncomplete:'Il reste une erreur ou une case vide.',autoCrossOn:'Croix automatiques activées',autoCrossOff:'Croix automatiques désactivées',queenPlaced:'Une reine a été placée.',cellRevealed:'Une case a été révélée.',digitRevealed:'Un chiffre a été révélé.',patchRevealed:'Une case de la zone a été révélée.',finishedShare:'Terminé',dailyLabel:'Défi quotidien',backtrackFlag:'retour en arrière',hintFlag:'indice utilisé',closeHint:'Fermer',hintMove:'Coup conseillé',hintWhy:'Pourquoi',noLogicalHint:'Aucun coup directement déductible avec l’état actuel.',hintTimeout:'La recherche d’indice a atteint la limite de 5 secondes. Aucun indice fiable n’a été trouvé dans ce délai.',hintSearching:'Recherche d’un indice…',hintPaused:'Reprenez la partie pour demander un indice.',hintError:'La recherche d’indice n’a pas pu aboutir. Réessayez après votre prochain coup.',dragHint:'Déplacer',rank1:'inférence de rang 1',rank2:'inférence de rang 2',rank3:'inférence de rang 3',hintNoR0:'Rang 0 : aucune déduction directe.',hintNoR1:'Rang 1 : aucune hypothèse n’aboutit immédiatement à une impasse.',hintNoR2:'Rang 2 : aucune hypothèse n’aboutit à une impasse au niveau suivant.',hintNoR3:'Rang 3 : aucune contradiction forcée n’a été démontrée à trois niveaux.',hypothesis:'Hypothèse',consequence:'Conséquence',deadend:'Impasse',conclusion:'Conclusion',themeLabel:'Thème',soundsOn:'Sons activés',soundsOff:'Sons désactivés',resetDone:'Grille réinitialisée.',patchAll:'Toutes les cases doivent appartenir à une zone.',patchEach:'Chaque indice doit avoir une zone.',patchOwn:'Chaque zone doit contenir son propre indice.',patchTwo:'Une zone ne peut pas contenir deux indices.',patchConnected:'Chaque zone doit être d’un seul tenant.',patchRect:'Chaque zone doit former un rectangle.',patchSize:'La taille d’une zone ne correspond pas à son indice.',patchShape:'La forme d’une zone ne correspond pas à son indice.',
},
en:{
 easy:'Easy',medium:'Medium',hard:'Hard',expert:'Expert',gameQueens:'Crowns',gameTango:'Balance',gameSudoku:'Mini 6',gamePatches:'Mosaic',
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
 patchesLegend:'Drag from one corner to the opposite corner to draw or resize a rectangle. The region is selected automatically when the rectangle contains one clue. Tap an existing rectangle to remove it.',zone:'Region',
 aboutTitle:'About Logic 4',version:'Version',copyright:'Copyright',license:'License',proprietary:'Proprietary software — All rights reserved.',legal:'Copying, modification, redistribution and exploitation without prior written permission from Serge Benoliel are prohibited.',
 restored:'Game restored',generating:'Generating…',rulesTitle:'Rules',where:'Where to look',logic:'Logic',solutionShown:'Solution shown',congrats:'Well done!',gridIncomplete:'There is still an error or an unresolved cell.',tangoIncomplete:'The grid does not yet satisfy all rules.',sudokuIncomplete:'There is still an error or an empty cell.',autoCrossOn:'Auto-crosses enabled',autoCrossOff:'Auto-crosses disabled',queenPlaced:'A queen was placed.',cellRevealed:'A cell was revealed.',digitRevealed:'A digit was revealed.',patchRevealed:'A region cell was revealed.',finishedShare:'Finished',dailyLabel:'Daily challenge',backtrackFlag:'backtracked',hintFlag:'hint used',closeHint:'Close',hintMove:'Suggested move',hintWhy:'Why',noLogicalHint:'No move can be directly deduced from the current state.',hintTimeout:'The hint search reached the 5-second limit. No reliable hint was found within that time.',hintSearching:'Searching for a hint…',hintPaused:'Resume the game to request a hint.',hintError:'The hint search could not complete. Try again after your next move.',dragHint:'Move',rank1:'rank-1 inference',rank2:'rank-2 inference',rank3:'rank-3 inference',hintNoR0:'Rank 0: no direct deduction.',hintNoR1:'Rank 1: no assumption immediately leads to a dead end.',hintNoR2:'Rank 2: no assumption leads to a dead end on the next level.',hintNoR3:'Rank 3: no forced contradiction was proved within three levels.',hypothesis:'Assumption',consequence:'Consequence',deadend:'Dead end',conclusion:'Conclusion',themeLabel:'Theme',soundsOn:'Sounds enabled',soundsOff:'Sounds disabled',resetDone:'Grid reset.',patchAll:'Every cell must belong to a region.',patchEach:'Every clue must have a region.',patchOwn:'Each region must contain its own clue.',patchTwo:'A region cannot contain two clues.',patchConnected:'Each region must be connected.',patchRect:'Each region must form a rectangle.',patchSize:'A region size does not match its clue.',patchShape:'A region shape does not match its clue.',
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
 patches:{fr:`<b>But :</b> découper toute la grille en rectangles ou carrés sans chevauchement.<br><br><b>Interaction :</b> fais glisser le doigt d’un coin à l’autre pour dessiner le rectangle. Fais glisser à nouveau depuis un rectangle existant pour le redimensionner. Un simple tap sur un rectangle le supprime.<br><br><b>Indices :</b> chaque zone contient exactement une case-indice. Un indice peut préciser la surface, la forme (carré, vertical ou horizontal), les deux, ou parfois ne donner qu'une information minimale.<br><br><b>Validité :</b> chaque case appartient à une seule zone, chaque zone est d'un seul tenant et forme un rectangle, et aucune zone ne peut contenir deux indices.`,
 en:`<b>Goal:</b> partition the entire grid into non-overlapping rectangles or squares.<br><br><b>Interaction:</b> drag from one corner to the opposite corner to draw a rectangle. Drag again from an existing patch to resize it. Tap an existing patch to remove it.<br><br><b>Clues:</b> each region contains exactly one clue cell. A clue may specify area, shape (square, vertical or horizontal), both, or sometimes only minimal information.<br><br><b>Validity:</b> every cell belongs to exactly one region, each region is connected and rectangular, and no region may contain two clues.`}
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
  requestAnimationFrame(()=>{try{withSeed(`logic4-v1.6:${day}:${game}`,()=>{if(game==='queens')queens('medium');if(game==='tango')tango('medium');if(game==='sudoku')sudoku('medium');if(game==='patches')patches('medium')});current.daily=true;current.dailyDay=day;statsStart(current);startTimer(true,0,false);saveCurrent();haptic(8)}finally{setBusy(false);startBackgroundPrecompute(game,'medium')}})
}
const coarsePointer=()=>window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;
function haptic(ms=12){try{if(navigator.vibrate)navigator.vibrate(ms)}catch(_){}}
function setBusy(on,label=null){label=label||tr('generating');document.body.classList.toggle('busy',!!on);let x=$('#busyOverlay');if(x){x.hidden=!on;let s=x.querySelector('span');if(s)s.textContent=label}}
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
<button class="game-card" data-g="queens"><span class="game-icon">♛</span><span><h2>${gameLabel('queens')}</h2><p>${tr('queensSub')}</p></span></button>
<button class="game-card" data-g="tango"><span class="game-icon">☀︎</span><span><h2>${gameLabel('tango')}</h2><p>${tr('tangoSub')}</p></span></button>
<button class="game-card" data-g="sudoku"><span class="game-icon">✎</span><span><h2>${gameLabel('sudoku')}</h2><p>${tr('sudokuSub')}</p></span></button>
<button class="game-card" data-g="patches"><span class="game-icon">▦</span><span><h2>${gameLabel('patches')}</h2><p>${tr('patchesSub')}</p></span></button>
</section><button class="daily-card" id="dailyBtn"><span>◆</span><b>${tr('daily')}</b><small>${dailyProgress()}/4 ${tr('dailySub')}</small></button><button class="stats-card" id="statsBtn"><span>▥</span><b>${tr('stats')}</b><small>${tr('statsSub')}</small></button><button class="settings-card" id="settingsBtn"><span>⚙︎</span><b>${tr('prefs')}</b><small>${tr('prefsSub')}</small></button><button class="settings-card" id="aboutBtn"><span>ⓘ</span><b>${tr('about')}</b><small>${tr('aboutSub')}</small></button><div class="footer-note">Logic 4 v${VERSION} · © 2026 Serge Benoliel</div>`;
if(saved)$('#resumeBtn').onclick=resumeSaved;$('#dailyBtn').onclick=dailyView;$('#statsBtn').onclick=statsView;$('#settingsBtn').onclick=settingsView;$('#aboutBtn').onclick=aboutView;app.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>launch(b.dataset.g,'easy'));app.querySelectorAll('button').forEach(pressFeedback)}
function gameLabel(g){return {queens:tr('gameQueens'),tango:tr('gameTango'),sudoku:tr('gameSudoku'),patches:tr('gamePatches')}[g]||g}
function shell(name,subtitle,diff,content,rules){app.innerHTML=`<section class="panel"><div class="game-head"><div><h1>${name}</h1><p>${subtitle}${current&&current.rating?` · <span class="difficulty-meter">${tr('score')} ${current.rating.score} · ${current.rating.technique}<span class="live-aids">${aidBadges(current,true)}</span></span>`:''}</p></div><select class="difficulty" id="difficulty" aria-label="${tr('rulesTitle')}">${Object.entries(DIFF).filter(([k])=>current?.game==='queens'||k!=='expert').map(([k,v])=>`<option value="${k}" ${k===diff?'selected':''}>${v}</option>`).join('')}</select></div><div class="toolbar" aria-label="Actions"><button class="btn primary" id="newBtn">${tr('newGame')}</button><button class="btn" id="resetBtn">${tr('reset')}</button><button class="btn" id="pauseBtn">${tr('pause')}</button><button class="btn" id="checkBtn">${tr('check')}</button><button class="btn" id="hintBtn">${tr('hint')}</button><button class="btn secondary-action" id="solutionBtn">${tr('solution')}</button><button class="btn secondary-action" id="rulesBtn">${tr('rules')}</button></div><div id="status" class="status" aria-live="polite"></div>${content}<div class="rules">${rules}</div></section>`;
$('#difficulty').onchange=e=>launch(current.game,e.target.value);$('#newBtn').onclick=()=>launch(current.game,current.diff);$('#resetBtn').onclick=resetCurrent;$('#pauseBtn').onclick=togglePause;$('#rulesBtn').onclick=()=>modal(`${tr('rules')} — ${name}`,rules);app.querySelectorAll('button').forEach(pressFeedback);updatePauseButton()}

function resetCurrent(){
  if(!current)return;
  let hadProgress=current.game==='queens'?current.state.flat().some(v=>v!==0):current.game==='tango'?current.state.some((row,r)=>row.some((v,c)=>!current.givens.has(r*6+c)&&v!==-1)):current.game==='sudoku'?current.state.some((row,r)=>row.some((v,c)=>current.empty.has(r*6+c)&&v!==0)):current.game==='patches'?current.paint.flat().some(v=>v!==null):false;
  if(hadProgress)markBacktrack();
  $('#victory')?.remove();
  closeHintNotice();
  clearHintFocus();
  current.hintFlow=null;
  if(current.game==='queens'){
    $('#qboard')?.classList.remove('queens-win');
    current.state=Array.from({length:current.n},()=>Array(current.n).fill(0));
    drawQ();
  }else if(current.game==='tango'){
    current.tangoPendingCell=null;current.state=Array.from({length:6},()=>Array(6).fill(-1));
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

// ===== v2.7.0 — background precomputation =====
const PRECOMPUTE_TARGET=2;
const PRECOMPUTE_COMBOS=[
  ['queens','easy'],['queens','medium'],['queens','hard'],['queens','expert'],
  ['tango','easy'],['tango','medium'],['tango','hard'],
  ['sudoku','easy'],['sudoku','medium'],['sudoku','hard'],
  ['patches','easy'],['patches','medium'],['patches','hard']
];
const precomputeCache=new Map();
const precomputeReservedQueens=new Set();
let precomputeWorker=null,precomputeBusy=false,precomputeRequestId=0,precomputeDay=null,precomputePreferred=null,precomputeStarted=false;

function precomputeKey(game,diff){return `${game}:${diff}`}
function precomputeBucket(game,diff){
  let k=precomputeKey(game,diff);if(!precomputeCache.has(k))precomputeCache.set(k,[]);return precomputeCache.get(k)
}
function resetPrecomputeDay(day=localDay()){
  if(precomputeDay===day)return;
  precomputeDay=day;precomputeCache.clear();precomputeReservedQueens.clear()
}
function precomputeForbiddenQueens(day=localDay()){
  resetPrecomputeDay(day);
  let out=new Set(precomputeReservedQueens);
  try{for(let sig of queenSessionSet(day))out.add(sig)}catch(_){}
  return [...out]
}
function ensurePrecomputeWorker(){
  if(precomputeWorker)return precomputeWorker;
  if(typeof Worker==='undefined')return null;
  try{
    let w=new Worker('./precompute-worker.js?v=2.8.1');
    w.onmessage=e=>{
      let m=e.data||{};precomputeBusy=false;
      if(m.ok&&m.day===precomputeDay&&m.candidate){
        let bucket=precomputeBucket(m.game,m.diff);
        if(bucket.length<PRECOMPUTE_TARGET){
          if(m.game==='queens'){
            let sig=m.candidate.__queenSignature||queenCanonicalSignature(m.candidate.reg);
            let displayed=false;try{displayed=queenSessionSet(m.day).has(sig)}catch(_){}
            if(!displayed&&!precomputeReservedQueens.has(sig)){m.candidate.__queenSignature=sig;precomputeReservedQueens.add(sig);bucket.push(m.candidate)}
          }else bucket.push(m.candidate)
        }
      }
      setTimeout(()=>schedulePrecompute(),80)
    };
    w.onerror=()=>{precomputeBusy=false;try{w.terminate()}catch(_){};precomputeWorker=null};
    precomputeWorker=w;return w
  }catch(_){return null}
}
function precomputeOrder(){
  let preferred=precomputePreferred,all=PRECOMPUTE_COMBOS.slice();
  if(!preferred)return all.filter(x=>!(x[0]==='queens'&&x[1]==='expert')).concat(all.filter(x=>x[0]==='queens'&&x[1]==='expert'));
  let exact=[],same=[],medium=[],rest=[],deferredExpert=[];
  for(let x of all){
    if(x[0]===preferred.game&&x[1]===preferred.diff)exact.push(x);
    else if(x[0]==='queens'&&x[1]==='expert')deferredExpert.push(x);
    else if(x[0]===preferred.game)same.push(x);
    else if(x[1]==='medium')medium.push(x);
    else rest.push(x)
  }
  return exact.concat(same,medium,rest,deferredExpert)
}
function schedulePrecompute(game=null,diff=null){
  if(game&&diff)precomputePreferred={game,diff};
  if(!precomputeStarted||document.hidden||precomputeBusy)return;
  let day=localDay();resetPrecomputeDay(day);
  let w=ensurePrecomputeWorker();if(!w)return;
  for(let [g,d] of precomputeOrder()){
    if(precomputeBucket(g,d).length>=PRECOMPUTE_TARGET)continue;
    precomputeBusy=true;
    let id=++precomputeRequestId;
    w.postMessage({cmd:'generate',id,game:g,diff:d,day,forbiddenQueens:g==='queens'?precomputeForbiddenQueens(day):[]});
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
    let g=bucket.shift();
    if(game==='queens'){
      let sig=g.__queenSignature||queenCanonicalSignature(g.reg);
      precomputeReservedQueens.delete(sig);
      let already=false;try{already=queenSessionSet(day).has(sig)}catch(_){}
      if(already)continue;
      rememberQueenGeneratedThisSession(g.reg,day)
    }
    return g
  }
  return null
}
function precomputeStatus(){
  let out={};for(let [g,d] of PRECOMPUTE_COMBOS)out[precomputeKey(g,d)]=precomputeBucket(g,d).length;return out
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&precomputeStarted)setTimeout(()=>schedulePrecompute(),150)});

function launch(game,diff){if(game!=='queens'&&diff==='expert')diff='hard';closePreviousAttempt();clearSaved();stopTimer();paused=false;setBusy(true);current={game,diff};requestAnimationFrame(()=>{try{if(game==='queens')queens(diff);if(game==='tango')tango(diff);if(game==='sudoku')sudoku(diff);if(game==='patches')patches(diff);statsStart(current);startTimer(true,0,false);saveCurrent();haptic(8)}finally{setBusy(false);startBackgroundPrecompute(game,diff)}})}
function resumeSaved(){let s=getSaved();if(!s)return home();stopTimer();let c=s.current;c.givens=c.givens?new Set(c.givens):c.givens;c.empty=c.empty?new Set(c.empty):c.empty;current=c;if(c.game==='queens')renderQueens(c);if(c.game==='tango')renderTango(c);if(c.game==='sudoku')renderSudoku(c);if(c.game==='patches')renderPatches(c);startTimer(true,s.elapsed||0,!!s.paused);updatePauseButton();showToast(tr('restored'));startBackgroundPrecompute(c.game,c.diff)}


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

const QUEEN_REGION_COLORS=['#f6d68a','#c9dca5','#b9d8e9','#d9c4e8','#f3b8ad','#b5dbc9','#e7c9a3','#c6c7e9','#c4dfd7'];
function queenZoneBadge(id){
  let color=QUEEN_REGION_COLORS[id%QUEEN_REGION_COLORS.length],label=lang()==='fr'?'zone':'region';
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
    if(rr===r)return lang()==='fr'?`la ligne ${r+1} contient déjà une reine en ${cellName(rr,cc)}.`:`row ${r+1} already contains a queen at ${cellName(rr,cc)}.`;
    if(cc===c)return lang()==='fr'?`la colonne ${c+1} contient déjà une reine en ${cellName(rr,cc)}.`:`column ${c+1} already contains a queen at ${cellName(rr,cc)}.`;
    if(current.reg[rr][cc]===current.reg[r][c])return lang()==='fr'?`${queenZoneBadge(current.reg[r][c])} contient déjà une reine en ${cellName(rr,cc)}.`:`${queenZoneBadge(current.reg[r][c])} already contains a queen at ${cellName(rr,cc)}.`;
    if(Math.abs(rr-r)<=1&&Math.abs(cc-c)<=1)return lang()==='fr'?`${cellName(r,c)} est adjacente à la reine de ${cellName(rr,cc)}.`:`${cellName(r,c)} is adjacent to the queen at ${cellName(rr,cc)}.`;
  }
  return null
}
function findQueenLogicalHint(){
  let n=current.n,cands=Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>queenCellAllowed(r,c)));
  // First expose direct X deductions if auto-cross is disabled or some X is missing.
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.state[r][c]===0&&!cands[r][c]){
    let why=queenDirectExclusionReason(r,c);if(why)return {r,c,v:1,rank:0,why}
  }
  function forcedFrom(cells,reasonFr,reasonEn){
    let open=cells.filter(([r,c])=>cands[r][c]&&current.state[r][c]!==2),q=cells.filter(([r,c])=>current.state[r][c]===2);
    if(!q.length&&open.length===1)return {r:open[0][0],c:open[0][1],v:2,rank:0,why:lang()==='fr'?reasonFr:reasonEn}
    return null
  }
  for(let r=0;r<n;r++){let h=forcedFrom(Array.from({length:n},(_,c)=>[r,c]),`toutes les autres cases de la ligne ${r+1} sont exclues`,`all other cells in row ${r+1} are excluded; only one queen position remains.`);if(h)return h}
  for(let c=0;c<n;c++){let h=forcedFrom(Array.from({length:n},(_,r)=>[r,c]),`toutes les autres cases de la colonne ${c+1} sont exclues.`,`all other cells in column ${c+1} are excluded.`);if(h)return h}
  let ids=[...new Set(current.reg.flat())];
  for(let id of ids){let cells=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.reg[r][c]===id)cells.push([r,c]);let h=forcedFrom(cells,`toutes les autres cases de ${queenZoneBadge(id)} sont exclues : cette zone n’a plus qu’une seule place possible pour sa reine.`,`all other cells in ${queenZoneBadge(id)} are excluded; only one queen position remains.`);if(h)return h}
  return null
}

function findTangoLogicalHint(){
  let s=current.state,n=6;
  function out(r,c,v,whyFr,whyEn){if(r>=0&&r<n&&c>=0&&c<n&&s[r][c]===-1)return {r,c,v,why:lang()==='fr'?whyFr:whyEn};return null}
  // 3/3 balance
  for(let r=0;r<n;r++){for(let v=0;v<=1;v++){let count=s[r].filter(x=>x===v).length;if(count===3)for(let c=0;c<n;c++){let h=out(r,c,1-v,`la ligne contient déjà 3 ${v===1?'soleils':'lunes'} ; les cases restantes doivent être des ${v===1?'lunes':'soleils'}.`,`the row already has 3 ${v===1?'suns':'moons'}; remaining cells must be ${v===1?'moons':'suns'}.`);if(h)return h}}}
  for(let c=0;c<n;c++){for(let v=0;v<=1;v++){let count=0;for(let r=0;r<n;r++)if(s[r][c]===v)count++;if(count===3)for(let r=0;r<n;r++){let h=out(r,c,1-v,`la colonne contient déjà 3 ${v===1?'soleils':'lunes'} ; les cases restantes doivent être des ${v===1?'lunes':'soleils'}.`,`the column already has 3 ${v===1?'suns':'moons'}; remaining cells must be ${v===1?'moons':'suns'}.`);if(h)return h}}}
  // no three: XX_ _XX X_X
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(s[r][c]===-1){
    let pairs=[[[r,c-2],[r,c-1]],[[r,c-1],[r,c+1]],[[r,c+1],[r,c+2]],[[r-2,c],[r-1,c]],[[r-1,c],[r+1,c]],[[r+1,c],[r+2,c]]];
    for(let pair of pairs){let a=pair[0],b=pair[1];if(a[0]>=0&&a[0]<n&&a[1]>=0&&a[1]<n&&b[0]>=0&&b[0]<n&&b[1]>=0&&b[1]<n){let va=s[a[0]][a[1]],vb=s[b[0]][b[1]];if(va!==-1&&va===vb)return {r,c,v:1-va,why:lang()==='fr'?`deux symboles identiques encadrent ou précèdent cette case ; un troisième identique est interdit.`:`two identical symbols surround or precede this cell; a third identical symbol is forbidden.`}}}
  }
  // relation with known neighbor
  for(let [r,c,d,rel] of current.edges){let r2=d==='r'?r:r+1,c2=d==='r'?c+1:c,a=s[r][c],b=s[r2][c2];
    if(a===-1&&b!==-1)return {r,c,v:rel==='='?b:1-b,why:lang()==='fr'?`la relation ${rel} avec la case voisine impose ce symbole.`:`the ${rel} relation with the adjacent cell forces this symbol.`};
    if(b===-1&&a!==-1)return {r:r2,c:c2,v:rel==='='?a:1-a,why:lang()==='fr'?`la relation ${rel} avec la case voisine impose ce symbole.`:`the ${rel} relation with the adjacent cell forces this symbol.`}
  }
  return null
}

function findSudokuLogicalHint(){
  let empties=[];for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(current.empty.has(r*6+c)&&current.state[r][c]===0)empties.push([r,c]);
  for(let [r,c] of empties){let cand=sudokuCandidatesAt(r,c);if(cand.length===1)return {r,c,v:cand[0],why:lang()==='fr'?`après élimination par la ligne, la colonne et le bloc 2×3, seul ${cand[0]} reste possible.`:`after elimination by the row, column and 2×3 box, only ${cand[0]} remains possible.`}}
  let units=[];for(let r=0;r<6;r++)units.push({cells:Array.from({length:6},(_,c)=>[r,c]),nameFr:`la ligne ${r+1}`,nameEn:`row ${r+1}`});for(let c=0;c<6;c++)units.push({cells:Array.from({length:6},(_,r)=>[r,c]),nameFr:`la colonne ${c+1}`,nameEn:`column ${c+1}`});
  for(let br=0;br<6;br+=2)for(let bc=0;bc<6;bc+=3){let cells=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)cells.push([r,c]);units.push({cells,nameFr:`le bloc ${Math.floor(br/2)+1}-${Math.floor(bc/3)+1}`,nameEn:`the 2×3 box at rows ${br+1}-${br+2}, columns ${bc+1}-${bc+3}`})}
  for(let u of units)for(let v=1;v<=6;v++){let places=u.cells.filter(([r,c])=>current.state[r][c]===0&&sudokuCandidatesAt(r,c).includes(v));if(places.length===1){let [r,c]=places[0];return {r,c,v,why:lang()==='fr'?`${v} n’a qu’une seule position possible dans ${u.nameFr}.`:`${v} has only one possible position in ${u.nameEn}.`}}}
  return null
}

function patchRectCandidates(id){
  let n=current.n,cl=current.clues[id],cr=cl.pos[0],cc=cl.pos[1],out=[];
  for(let r1=0;r1<n;r1++)for(let r2=r1;r2<n;r2++)for(let c1=0;c1<n;c1++)for(let c2=c1;c2<n;c2++){
    if(!(r1<=cr&&cr<=r2&&c1<=cc&&cc<=c2))continue;
    let h=r2-r1+1,w=c2-c1+1,area=h*w,shape=h===w?'carré':h>w?'vertical':'horizontal';
    if((cl.mode==='size'||cl.mode==='both')&&area!==cl.size)continue;
    if((cl.mode==='shape'||cl.mode==='both')&&shape!==cl.shape)continue;
    let cells=[],bad=false;
    for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++){for(let other of current.ids){if(other!==id){let p=current.clues[other].pos;if(p[0]===r&&p[1]===c)bad=true}}if(current.paint[r][c]!=null&&current.paint[r][c]!==id)bad=true;cells.push([r,c])}
    if(bad)continue;
    let painted=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.paint[r][c]===id)painted.push([r,c]);
    if(painted.some(([r,c])=>r<r1||r>r2||c<c1||c>c2))continue;
    out.push(cells)
  }
  return out
}
function findPatchLogicalHint(){
  for(let id of current.ids){let cands=patchRectCandidates(id);if(!cands.length)continue;let common=new Set(cands[0].map(x=>keyCell(...x)));for(let k of [...common])if(!cands.every(cs=>cs.some(x=>keyCell(...x)===k)))common.delete(k);
    for(let k of common){let [r,c]=k.split(',').map(Number);if(current.paint[r][c]!==id){return {r,c,id,why:lang()==='fr'?`cette case appartient à tous les rectangles encore compatibles avec l’indice de la zone ${id+1}.`:`this cell belongs to every rectangle still compatible with region ${id+1}'s clue.`}}}
    if(cands.length===1){for(let [r,c] of cands[0])if(current.paint[r][c]!==id)return {r,c,id,why:lang()==='fr'?`il ne reste qu’un seul rectangle compatible avec l’indice de la zone ${id+1}.`:`only one rectangle remains compatible with region ${id+1}'s clue.`}}
  }
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
function hintBudgetExpired(deadline){return Number.isFinite(deadline)&&Date.now()>=deadline}
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

// PATCHES
function patchStateContradiction(){
  let all={};for(let id of current.ids){all[id]=patchRectCandidates(id);if(!all[id].length)return true}
  // Every already-painted cell must be supported by at least one remaining rectangle for its region.
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]!=null){
    let id=current.paint[r][c];if(!all[id].some(rect=>rect.some(x=>x[0]===r&&x[1]===c)))return true
  }
  // Every unpainted non-clue cell must remain coverable by at least one region.
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]==null){
    let covered=false;for(let id of current.ids)if(all[id].some(rect=>rect.some(x=>x[0]===r&&x[1]===c))){covered=true;break}
    if(!covered)return true
  }
  return false
}
function patchPossibleIdsAt(r,c){
  let out=[];for(let id of current.ids){let cands=patchRectCandidates(id);if(cands.some(rect=>rect.some(x=>x[0]===r&&x[1]===c)))out.push(id)}return out
}

function patchContradictionDetail(){
  let all={};for(let id of current.ids){all[id]=patchRectCandidates(id);if(!all[id].length)return lang()==='fr'?`la zone ${id+1} n'aurait plus aucun rectangle possible.`:`region ${id+1} would have no possible rectangle left.`}
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]!=null){let id=current.paint[r][c];if(!all[id].some(rect=>rect.some(x=>x[0]===r&&x[1]===c)))return lang()==='fr'?`${cellName(r,c)}, déjà attribuée à la zone ${id+1}, ne pourrait plus appartenir à aucun rectangle valide de cette zone.`:`${cellName(r,c)}, assigned to region ${id+1}, would no longer fit any valid rectangle for that region.`}
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]==null){let covered=false;for(let id of current.ids)if(all[id].some(rect=>rect.some(x=>x[0]===r&&x[1]===c))){covered=true;break}if(!covered)return lang()==='fr'?`${cellName(r,c)} ne pourrait plus être couverte par aucune zone.`:`${cellName(r,c)} could no longer be covered by any region.`}
  return lang()==='fr'?'le découpage en rectangles deviendrait impossible.':'the rectangle partition would become impossible.';
}
function findPatchRank1Hint(){
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]==null){
    let ids=patchPossibleIdsAt(r,c);if(ids.length<2)continue;
    let good=[],bad=[],details={};
    for(let id of ids){let contradiction=withTempCurrent(x=>{x.paint[r][c]=id},()=>patchStateContradiction());(contradiction?bad:good).push(id);if(contradiction)details[id]=withTempCurrent(x=>{x.paint[r][c]=id},()=>patchContradictionDetail())}
    if(good.length===1&&bad.length){
      let lines=bad.map(id=>`• ${lang()==='fr'?'zone':'region'} ${id+1} : ${details[id]}`).join('<br>');
      return {r,c,id:good[0],rank:1,
        hypothesis:lang()==='fr'?`${cellName(r,c)} pourrait a priori appartenir aux zones ${ids.map(x=>x+1).join(', ')}. Testons les alternatives.`:`${cellName(r,c)} could initially belong to regions ${ids.map(x=>x+1).join(', ')}. Test the alternatives.`,
        consequence:lines,
        deadend:lang()==='fr'?`toutes les zones sauf la zone ${good[0]+1} rendent le pavage impossible.`:`every region except region ${good[0]+1} makes the partition impossible.`,
        conclusion:lang()==='fr'?`${cellName(r,c)} doit donc appartenir à la zone ${good[0]+1}.`:`${cellName(r,c)} must therefore belong to region ${good[0]+1}.`,
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
function pieceName(kind,v){
  if(kind==='tango')return v===1?(lang()==='fr'?'soleil ☀':'sun ☀'):(lang()==='fr'?'lune ☾':'moon ☾');
  if(kind==='sudoku')return String(v);
  if(kind==='queens')return v===2?(lang()==='fr'?'reine ♛':'queen ♛'):'X';
  return lang()==='fr'?`zone ${v+1}`:`region ${v+1}`
}
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

// PATCHES rank 2
function patchRank2WitnessAfterAssumption(){
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]==null){
    let ids=patchPossibleIdsAt(r,c),viable=[];
    for(let id of ids){
      let bad=withTempCurrent(x=>{x.paint[r][c]=id},()=>patchStateContradiction());
      if(!bad)viable.push(id)
    }
    if(!viable.length)return {r,c,detail:lang()==='fr'
      ?`${cellName(r,c)} ne peut plus appartenir à aucune zone sans rendre le pavage impossible.`
      :`${cellName(r,c)} can no longer belong to any region without making the partition impossible.`}
  }
  return null
}
function findPatchRank2Hint(){
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]==null){
    let ids=patchPossibleIdsAt(r,c);if(ids.length<2)continue;
    let surviving=ids.filter(id=>!withTempCurrent(x=>{x.paint[r][c]=id},()=>patchStateContradiction()));
    if(surviving.length<2)continue;
    let bad=[],witness={};
    for(let id of surviving){
      let w=withTempCurrent(x=>{x.paint[r][c]=id},()=>patchRank2WitnessAfterAssumption());
      if(w){bad.push(id);witness[id]=w}
    }
    let good=surviving.filter(id=>!bad.includes(id));
    if(good.length===1&&bad.length){
      let id=good[0],rej=bad[0],w=witness[rej];
      return {r,c,id,rank:2,
        hypothesis:lang()==='fr'?`supposons que ${cellName(r,c)} appartienne à la zone ${rej+1}.`:`suppose ${cellName(r,c)} belongs to region ${rej+1}.`,
        consequence:lang()==='fr'?`on recalcule alors les rectangles et les affectations encore possibles.`:`we then recompute the remaining rectangles and cell assignments.`,
        deadend:w.detail,
        conclusion:lang()==='fr'?`la zone ${rej+1} est impossible ici ; ${cellName(r,c)} doit appartenir à la zone ${id+1}.`:`region ${rej+1} is impossible here; ${cellName(r,c)} must belong to region ${id+1}.`,
        why:null}
    }
  }
  return null
}
function hintStage(kind,target,message,apply){
  markHintUsed();updateScoreFlags();
  if(!current.hintFlow||current.hintFlow.kind!==kind||current.hintFlow.key!==target.join(','))current.hintFlow={kind,key:target.join(','),stage:0};
  let h=current.hintFlow;h.stage++;
  clearHintFocus();focusHint(target);
  if(h.stage===1)showHintNotice(`<b>${tr('hintMove')} :</b> ${message.move}<br><span class="hint-secondary">${message.where}</span>`);
  else if(h.stage===2)showHintNotice(`<b>${tr('hintMove')} :</b> ${message.move}<br><b>${tr('hintWhy')} :</b> ${message.why}`);
  else{apply();current.hintFlow=null;showHintNotice(`<b>${tr('hintMove')} :</b> ${message.move}<br><b>${tr('hintWhy')} :</b> ${message.why}<br><span class="hint-applied">${message.reveal}</span>`);haptic(12)}
  saveCurrent()
}
function focusHint([r,c]){let board=document.querySelector('.board');if(!board)return;let n=current.n||6,d=board.children[r*n+c];if(d)d.classList.add('hint-focus')}
function clearHintFocus(){document.querySelectorAll('.hint-focus').forEach(x=>x.classList.remove('hint-focus'))}
function touchSave(fn){return()=>{if(paused)return;closeHintNotice();current.hintFlow=null;clearHintFocus();fn();saveCurrent()}}
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
function renderQueens(c){const colors=QUEEN_REGION_COLORS;shell(gameLabel('queens'),`${c.n}×${c.n} · ${DIFF[c.diff]} · ${tr('generated')}`,c.diff,`<div class="queen-options"><label class="switch-row"><input type="checkbox" id="queenAutoCross" ${queenAutoCrossEnabled()?'checked':''}><span>${tr('autoCross')}</span></label></div><div class="board-wrap"><div class="board" id="qboard" style="grid-template-columns:repeat(${c.n},minmax(0,1fr));grid-template-rows:repeat(${c.n},minmax(0,1fr))"></div></div><div class="legend">${tr('queensLegend')}</div>`,gameRules('queens'));let b=$('#qboard'),dragging=false,pointerId=null,startCell=null,dragAxis=null,dragged=false,dragMode='add',visited=new Set();
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
function checkQ(){if(solvedQ())finish(`${tr('congrats')} ${gameLabel('queens')}`);else status(tr('gridIncomplete'),false)}

function queenHintNoResultMessage(elapsedMs){
  let e=(elapsedMs/1000).toFixed(2).replace('.',lang()==='fr'?',':'.');
  return lang()==='fr'
    ?`<b>Aucun indice trouvé jusqu’au rang 3.</b><br>${tr('hintNoR0')}<br>${tr('hintNoR1')}<br>${tr('hintNoR2')}<br>${tr('hintNoR3')}<br><small>Recherche terminée en ${e} s. Cela ne signifie pas que la grille est bloquée : seulement qu’aucun coup n’est forcé à cette profondeur.</small>`
    :`<b>No hint found through rank 3.</b><br>${tr('hintNoR0')}<br>${tr('hintNoR1')}<br>${tr('hintNoR2')}<br>${tr('hintNoR3')}<br><small>Search completed in ${e} s. This does not mean the puzzle is stuck; only that no move is forced at this depth.</small>`
}
function queenHintTimeoutMessage(stage,elapsedMs){
  let e=(elapsedMs/1000).toFixed(2).replace('.',lang()==='fr'?',':'.');
  return lang()==='fr'
    ?`<b>Recherche arrêtée après ${e} s.</b><br>Les rangs précédents ont été testés sans trouver d’indice. La limite de 5 secondes a été atteinte pendant le <b>rang ${stage}</b> ; ce niveau n’a donc pas été exploré complètement. Aucun indice non démontré n’est affiché.`
    :`<b>Search stopped after ${e} s.</b><br>Earlier ranks were tested without finding a hint. The 5-second limit was reached during <b>rank ${stage}</b>, so that level was not fully explored. No unproved hint is shown.`
}
let queenHintSearchToken=0;
function hintQ(){
  if(paused){showHintNotice(tr('hintPaused'));return}
  if(!current||current.game!=='queens'){showHintNotice(tr('noLogicalHint'));return}
  let token=++queenHintSearchToken;
  showHintNotice(tr('hintSearching'));
  setTimeout(()=>{
    if(token!==queenHintSearchToken||!current||current.game!=='queens')return;
    let started=Date.now(),stage=0;
    try{
      let deadline=started+QUEEN_HINT_BUDGET_MS,h=findQueenLogicalHint();
      if(!h){stage=1;h=findQueenRank1Hint(deadline)}
      if(h?.timeout||hintBudgetExpired(deadline)){showHintNotice(queenHintTimeoutMessage(stage||1,Date.now()-started));return}
      if(!h){stage=2;h=findQueenRank2Hint(deadline)}
      if(h?.timeout||hintBudgetExpired(deadline)){showHintNotice(queenHintTimeoutMessage(stage,Date.now()-started));return}
      if(!h){stage=3;h=findQueenRank3Hint(deadline)}
      if(h?.timeout||hintBudgetExpired(deadline)){showHintNotice(queenHintTimeoutMessage(stage,Date.now()-started));return}
      if(!h){showHintNotice(queenHintNoResultMessage(Date.now()-started));return}
      let isX=h.v===1,move=lang()==='fr'?(isX?`Place un X en ligne ${h.r+1}, colonne ${h.c+1}.`:`Place une reine ♛ en ligne ${h.r+1}, colonne ${h.c+1}.`):(isX?`Mark X at row ${h.r+1}, column ${h.c+1}.`:`Place a queen ♛ at row ${h.r+1}, column ${h.c+1}.`);
      let why=h.rank===3?rank3Why(h):h.rank===2?rank2Why(h):h.rank===1?rank1Why(h):h.why;
      hintStage('queens',[h.r,h.c],{move,where:lang()==='fr'?`Indice de rang ${h.rank||0}, déduit uniquement de l’état visible.`:`Rank ${h.rank||0} hint, deduced only from the visible state.`,why,reveal:tr('queenPlaced')},()=>{setQueenCell(h.r,h.c,h.v===1?1:2);drawQ();maybeAutoFinish()})
    }catch(err){
      console.error('Queens hint search failed',err);
      let detail=String(err?.message||err||'').slice(0,120);
      showHintNotice(lang()==='fr'?`<b>Erreur pendant la recherche d’indice${stage?` (rang ${stage})`:''}.</b><br>${detail||'Le calcul n’a pas pu être terminé.'}<br>Aucun indice non vérifié n’est affiché.`:`<b>Error during hint search${stage?` (rank ${stage})`:''}.</b><br>${detail||'The calculation could not be completed.'}<br>No unverified hint is shown.`)
    }
  },0)
}

// TANGO
const tangoSolutions={easy:[[0,1,0,1,0,1],[1,0,1,0,1,0],[1,1,0,0,1,0],[0,0,1,1,0,1],[1,0,0,1,0,1],[0,1,1,0,1,0]],medium:[[0,1,0,0,1,1],[1,0,1,1,0,0],[0,0,1,0,1,1],[1,1,0,1,0,0],[0,1,1,0,0,1],[1,0,0,1,1,0]],hard:[[1,0,1,0,0,1],[0,1,0,1,1,0],[1,1,0,0,1,0],[0,0,1,1,0,1],[1,0,1,0,1,0],[0,1,0,1,0,1]]};
function tango(diff){let sol=transformGrid(tangoSolutions[diff],Math.floor(Math.random()*8)),n=6,givenCount={easy:12,medium:8,hard:5}[diff],relCount={easy:8,medium:10,hard:11}[diff],positions=shuffle(Array.from({length:36},(_,i)=>i)),givens=new Set(positions.slice(0,givenCount)),edges=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(c<n-1)edges.push([r,c,'r',sol[r][c]===sol[r][c+1]?'=':'×']);if(r<n-1)edges.push([r,c,'d',sol[r][c]===sol[r+1][c]?'=':'×'])}edges=shuffle(edges).slice(0,relCount);let state=Array.from({length:n},()=>Array(n).fill(-1));for(let i of givens){let r=Math.floor(i/6),c=i%6;state[r][c]=sol[r][c]}current={game:'tango',diff,n,sol,givens,edges,state,completed:false};renderTango(current)}
function renderTango(c){shell(gameLabel('tango'),lang()==='fr'?'6×6 · Soleil & Lune · générée':'6×6 · Sun & Moon · generated',c.diff,`<div class="board-wrap"><div class="board" id="tboard" style="grid-template-columns:repeat(6,minmax(0,1fr));grid-template-rows:repeat(6,minmax(0,1fr))"></div></div>`,gameRules('tango'));let b=$('#tboard');for(let r=0;r<6;r++)for(let col=0;col<6;col++){let d=document.createElement('div');d.className='cell'+(c.givens.has(r*6+col)?' fixed':'');d.dataset.r=r;d.dataset.c=col;if(!c.givens.has(r*6+col))d.onclick=touchSave(()=>{
  let prev=current.state[r][col],next=(prev+2)%3-1;
  current.tangoPendingCell=null;
  if(prev===1&&next===-1)markBacktrack();
  current.state[r][col]=next;
  if(next===0)current.tangoPendingCell=[r,col];
  haptic(8);drawT();updateScoreFlags();maybeAutoFinish()
});b.appendChild(d)}drawT();$('#checkBtn').onclick=checkT;$('#hintBtn').onclick=hintT;$('#solutionBtn').onclick=()=>{if(paused)return;current.tangoPendingCell=null;current.state=current.sol.map(r=>[...r]);drawT();finish(tr('solutionShown'),'revealed')}}
function drawT(){let b=$('#tboard');[...b.children].forEach((d,i)=>{let r=Math.floor(i/6),c=i%6,v=current.state[r][c];d.innerHTML=v===0?'<span class="tango-symbol">☾</span>':v===1?'<span class="tango-symbol">☀</span>':''});current.edges.forEach(([r,c,dir,s])=>{let d=b.children[r*6+c];let e=document.createElement('span');e.className='relation '+dir;e.textContent=s;d.appendChild(e)});let ignore=current.tangoPendingCell?keyCell(...current.tangoPendingCell):null;applyIllegalClasses(b,tangoIllegalCells(ignore),6);updateScoreFlags()}
function checkT(){if(solvedT())finish(`${tr('congrats')} ${gameLabel('tango')}`);else status(tr('tangoIncomplete'),false)}
function hintT(){if(paused)return;current.tangoPendingCell=null;let h=findTangoLogicalHint()||findTangoRank1Hint()||findTangoRank2Hint();if(!h)return showNoLogicalHint();let name=h.v===1?(lang()==='fr'?'un soleil ☀':'a sun ☀'):(lang()==='fr'?'une lune ☾':'a moon ☾'),move=lang()==='fr'?`Place ${name} en ligne ${h.r+1}, colonne ${h.c+1}.`:`Place ${name} at row ${h.r+1}, column ${h.c+1}.`;hintStage('tango',[h.r,h.c],{move,where:lang()==='fr'?`Le coup est déduit uniquement des symboles et relations déjà affichés.`:`The move is deduced only from the symbols and relations already displayed.`,why:h.rank===2?rank2Why(h):h.rank===1?rank1Why(h):h.why,reveal:tr('cellRevealed')},()=>{current.state[h.r][h.c]=h.v;drawT();maybeAutoFinish()})}

// MINI SUDOKU 6x6 regions 2x3
const sudBase=[[1,2,3,4,5,6],[4,5,6,1,2,3],[2,3,4,5,6,1],[5,6,1,2,3,4],[3,4,5,6,1,2],[6,1,2,3,4,5]];
function countMiniSudoku(grid,limit=2){let n=6,count=0;function valid(r,c,v){for(let i=0;i<n;i++)if(grid[r][i]===v||grid[i][c]===v)return false;let br=Math.floor(r/2)*2,bc=Math.floor(c/3)*3;for(let rr=br;rr<br+2;rr++)for(let cc=bc;cc<bc+3;cc++)if(grid[rr][cc]===v)return false;return true}function bt(){if(count>=limit)return;let best=null,bestCand=null;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(grid[r][c]===0){let cand=[];for(let v=1;v<=6;v++)if(valid(r,c,v))cand.push(v);if(!cand.length)return;if(!best||cand.length<bestCand.length){best=[r,c];bestCand=cand;if(cand.length===1)break}}if(!best){count++;return}let [r,c]=best;for(let v of bestCand){grid[r][c]=v;bt();grid[r][c]=0;if(count>=limit)return}}bt();return count}
function makeSudokuHoles(sol,target){let puzzle=sol.map(r=>[...r]),order=shuffle(Array.from({length:36},(_,i)=>i)),holes=[];for(let i of order){if(holes.length>=target)break;let r=Math.floor(i/6),c=i%6,old=puzzle[r][c];puzzle[r][c]=0;if(countMiniSudoku(puzzle.map(x=>[...x]),2)===1)holes.push(i);else puzzle[r][c]=old}return new Set(holes)}
function sudoku(diff){let map=shuffle([1,2,3,4,5,6]),sol=sudBase.map(r=>r.map(v=>map[v-1]));if(Math.random()<.5)sol=sol.map(r=>[...r].reverse());if(Math.random()<.5)sol=[...sol].reverse();let holes={easy:16,medium:22,hard:27}[diff],empty=makeSudokuHoles(sol,holes);current={game:'sudoku',diff,n:6,sol,empty,state:sol.map((r,ri)=>r.map((v,c)=>empty.has(ri*6+c)?0:v)),sel:null,completed:false};renderSudoku(current)}
function renderSudoku(c){shell(gameLabel('sudoku'),lang()==='fr'?'6×6 · chiffres 1 à 6 · générée':'6×6 · digits 1 to 6 · generated',c.diff,`<div class="board-wrap"><div class="board sudoku" id="sboard" style="grid-template-columns:repeat(6,minmax(0,1fr));grid-template-rows:repeat(6,minmax(0,1fr))"></div></div><div class="numpad" id="numpad">${[1,2,3,4,5,6].map(n=>`<button data-n="${n}">${n}</button>`).join('')}<button data-n="0" aria-label="${lang()==='fr'?'Effacer':'Erase'}">⌫</button></div>`,gameRules('sudoku'));let b=$('#sboard');for(let r=0;r<6;r++)for(let col=0;col<6;col++){let fixed=!c.empty.has(r*6+col),d=document.createElement('div');d.className='cell '+(fixed?'fixed ':'')+((col===2)?'boxR ':'')+((r===1||r===3)?'boxB ':'');if(!fixed)d.onclick=touchSave(()=>{current.sel=[r,col];drawS()});b.appendChild(d)}$('#numpad').querySelectorAll('button').forEach(bt=>bt.onclick=touchSave(()=>{if(current.sel){let [r,col]=current.sel,prev=current.state[r][col],next=+bt.dataset.n;if(prev!==0&&prev!==next)markBacktrack();current.state[r][col]=next;haptic(8);drawS();updateScoreFlags();maybeAutoFinish()}}));drawS();$('#checkBtn').onclick=checkS;$('#hintBtn').onclick=hintS;$('#solutionBtn').onclick=()=>{if(paused)return;current.state=current.sol.map(r=>[...r]);drawS();finish(tr('solutionShown'),'revealed')}}
function drawS(){let sel=current.sel,sv=sel?current.state[sel[0]][sel[1]]:0;[...$('#sboard').children].forEach((d,i)=>{let r=Math.floor(i/6),c=i%6,v=current.state[r][c];d.textContent=v||'';let sameUnit=!!sel&&(r===sel[0]||c===sel[1]||(Math.floor(r/2)===Math.floor(sel[0]/2)&&Math.floor(c/3)===Math.floor(sel[1]/3)));d.classList.toggle('peer',sameUnit&&!(r===sel[0]&&c===sel[1]));d.classList.toggle('same-value',!!sv&&v===sv&&!(r===sel[0]&&c===sel[1]));d.classList.toggle('selected',!!sel&&sel[0]===r&&sel[1]===c);d.classList.remove('error')});applyIllegalClasses($('#sboard'),sudokuIllegalCells(),6);updateScoreFlags()}
function checkS(){if(solvedS())finish(`${tr('congrats')} ${gameLabel('sudoku')}`);else status(tr('sudokuIncomplete'),false)}
function hintS(){if(paused)return;let h=findSudokuLogicalHint()||findSudokuRank1Hint()||findSudokuRank2Hint();if(!h)return showNoLogicalHint();let move=lang()==='fr'?`Place le chiffre ${h.v} en ligne ${h.r+1}, colonne ${h.c+1}.`:`Place digit ${h.v} at row ${h.r+1}, column ${h.c+1}.`;hintStage('sudoku',[h.r,h.c],{move,where:lang()==='fr'?`Le coup est déduit uniquement des chiffres actuellement visibles.`:`The move is deduced only from the digits currently visible.`,why:h.rank===2?rank2Why(h):h.rank===1?rank1Why(h):h.why,reveal:tr('digitRevealed')},()=>{current.state[h.r][h.c]=h.v;current.sel=[h.r,h.c];drawS();maybeAutoFinish()})}

// PATCHES — connected target regions; player paints each clue region.
const patchDefs={
easy:{n:5,reg:[[0,0,1,1,1],[0,0,1,2,2],[3,3,3,2,2],[3,4,4,4,5],[3,4,5,5,5]]},
medium:{n:6,reg:[[0,0,1,1,1,2],[0,3,3,1,2,2],[0,3,4,4,4,2],[5,3,4,6,6,6],[5,5,7,7,6,8],[5,7,7,8,8,8]]},
hard:{n:7,reg:[[0,0,1,1,1,2,2],[0,3,3,1,2,2,4],[0,3,5,5,5,4,4],[6,3,5,7,7,7,4],[6,6,5,8,7,9,9],[6,10,10,8,8,9,11],[10,10,8,8,11,11,11]]}};
function patchShape(cells){let rs=cells.map(x=>x[0]),cs=cells.map(x=>x[1]),h=Math.max(...rs)-Math.min(...rs)+1,w=Math.max(...cs)-Math.min(...cs)+1,rect=h*w===cells.length;if(!rect)return 'libre';if(h===w)return 'carré';return h>w?'vertical':'horizontal'}
function patches(diff){let def=patchDefs[diff],reg=transformGrid(def.reg,Math.floor(Math.random()*8)),n=reg.length,ids=[...new Set(reg.flat())],cellsBy={};ids.forEach(id=>cellsBy[id]=[]);for(let r=0;r<n;r++)for(let c=0;c<n;c++)cellsBy[reg[r][c]].push([r,c]);let clues={};ids.forEach(id=>{let cells=cellsBy[id],p=cells[Math.floor(cells.length/2)],mode=diff==='easy'?'both':diff==='medium'?(Math.random()<.5?'size':'shape'):(Math.random()<.45?'shape':Math.random()<.8?'size':'none');clues[id]={pos:p,size:cells.length,shape:patchShape(cells),mode}});const pal=['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1'];current={game:'patches',diff,n,reg,ids,cellsBy,clues,pal,active:ids[0],paint:Array.from({length:n},()=>Array(n).fill(null)),completed:false};renderPatches(current)}
let patchPaintFrame=0,patchDragFrame=0,patchDragPending=null;
function patchClueIdAt(r,c){
  if(!current?.clues||!current?.ids)return null;
  for(let id of current.ids){let pos=current.clues[id]?.pos;if(pos&&pos[0]===r&&pos[1]===c)return id}
  return null
}
function patchCellEl(r,c){let b=$('#pboard');return b?.children?.[r*current.n+c]||null}
function patchRect(a,b){
  let r0=Math.min(a[0],b[0]),r1=Math.max(a[0],b[0]),c0=Math.min(a[1],b[1]),c1=Math.max(a[1],b[1]),cells=[];
  for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)cells.push([r,c]);
  return {r0,r1,c0,c1,cells}
}
function patchRectClues(rect){
  let out=[];
  for(let id of current.ids){let [r,c]=current.clues[id].pos;if(r>=rect.r0&&r<=rect.r1&&c>=rect.c0&&c<=rect.c1)out.push(id)}
  return out
}
function patchRectOverlapsOther(rect,id){
  return rect.cells.some(([r,c])=>current.paint[r][c]!=null&&current.paint[r][c]!==id)
}
function patchPointToCell(x,y,b=$('#pboard')){
  if(!b||!current)return null;
  let q=b.getBoundingClientRect(),n=current.n;
  if(!q.width||!q.height)return null;
  let xx=Math.max(q.left,Math.min(x,q.right-0.01)),yy=Math.max(q.top,Math.min(y,q.bottom-0.01));
  let c=Math.max(0,Math.min(n-1,Math.floor((xx-q.left)/q.width*n)));
  let r=Math.max(0,Math.min(n-1,Math.floor((yy-q.top)/q.height*n)));
  return [r,c]
}
function updatePatchCellVisual(r,c){
  if(!current||current.game!=='patches'||r<0||c<0||r>=current.n||c>=current.n)return;
  let d=patchCellEl(r,c);if(!d)return;
  let id=current.paint[r][c],clueId=d.dataset.clueId===''||d.dataset.clueId==null?null:+d.dataset.clueId;
  let fill=id==null?(clueId==null?'#fff':'#f7f1e5'):current.pal[id%current.pal.length];
  d.style.setProperty('--patch-fill',fill);
  d.classList.toggle('paint',id!=null);
  d.classList.remove('patch-edge-t','patch-edge-r','patch-edge-b','patch-edge-l');
  if(id!=null){
    if(r===0||current.paint[r-1][c]!==id)d.classList.add('patch-edge-t');
    if(c===current.n-1||current.paint[r][c+1]!==id)d.classList.add('patch-edge-r');
    if(r===current.n-1||current.paint[r+1][c]!==id)d.classList.add('patch-edge-b');
    if(c===0||current.paint[r][c-1]!==id)d.classList.add('patch-edge-l')
  }
}
function drawPatchPalette(){
  let pp=$('#patchPalette');if(!pp)return;
  pp.querySelectorAll('.patch-chip').forEach(x=>{
    let active=+x.dataset.id===current.active;
    x.classList.toggle('active',active);
    x.setAttribute('aria-pressed',active?'true':'false')
  })
}
function clearPatchPreview(){
  let b=$('#pboard');if(!b)return;
  b.classList.remove('patch-rect-dragging','patch-preview-invalid');
  for(let d of b.children){
    d.classList.remove('patch-preview','patch-preview-t','patch-preview-r','patch-preview-b','patch-preview-l','patch-preview-invalid-cell');
    d.style.removeProperty('--patch-preview-fill')
  }
}
function patchPreviewInfo(anchor,end,fallbackId,lockedId=null){
  let rect=patchRect(anchor,end),clues=patchRectClues(rect);
  let id=lockedId!=null?lockedId:(clues.length===1?clues[0]:fallbackId);
  let clueOK=clues.length===1&&(lockedId==null||clues[0]===lockedId);
  let valid=clueOK&&!patchRectOverlapsOther(rect,id);
  return {rect,clues,id,valid,lockedId}
}
function renderPatchPreview(anchor,end,fallbackId,lockedId=null){
  let b=$('#pboard');if(!b)return null;
  clearPatchPreview();
  let info=patchPreviewInfo(anchor,end,fallbackId,lockedId),color=current.pal[info.id%current.pal.length];
  b.classList.add('patch-rect-dragging');
  if(!info.valid)b.classList.add('patch-preview-invalid');
  if(info.clues.length===1&&current.active!==info.id){current.active=info.id;drawPatchPalette()}
  for(let [r,c] of info.rect.cells){
    let d=patchCellEl(r,c);if(!d)continue;
    d.classList.add('patch-preview');d.style.setProperty('--patch-preview-fill',color);
    if(r===info.rect.r0)d.classList.add('patch-preview-t');
    if(r===info.rect.r1)d.classList.add('patch-preview-b');
    if(c===info.rect.c0)d.classList.add('patch-preview-l');
    if(c===info.rect.c1)d.classList.add('patch-preview-r');
    if(!info.valid)d.classList.add('patch-preview-invalid-cell')
  }
  return info
}
function schedulePatchDragPreview(anchor,end,fallbackId,lockedId=null){
  patchDragPending={anchor:[...anchor],end:[...end],fallbackId,lockedId};
  if(patchDragFrame)return;
  patchDragFrame=requestAnimationFrame(()=>{
    patchDragFrame=0;
    let p=patchDragPending;patchDragPending=null;
    if(p)renderPatchPreview(p.anchor,p.end,p.fallbackId,p.lockedId)
  })
}
function commitPatchRectangle(anchor,end,fallbackId,lockedId=null){
  let info=patchPreviewInfo(anchor,end,fallbackId,lockedId);
  clearPatchPreview();
  if(!info.valid){haptic(18);return false}
  let id=info.id,hadOld=current.paint.some(row=>row.some(v=>v===id));
  let rectKeys=new Set(info.rect.cells.map(([r,c])=>r+','+c));
  let overwrite=info.rect.cells.some(([r,c])=>current.paint[r][c]!=null&&current.paint[r][c]!==id);
  if(hadOld||overwrite)markBacktrack();
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]===id&&!rectKeys.has(r+','+c))current.paint[r][c]=null;
  for(let [r,c] of info.rect.cells)current.paint[r][c]=id;
  current.active=id;drawP();saveCurrent();updateScoreFlags();maybeAutoFinish();haptic(8);
  let b=$('#pboard');if(b&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
    for(let [r,c] of info.rect.cells){let d=patchCellEl(r,c);d?.classList.add('patch-commit')}
    setTimeout(()=>{for(let [r,c] of info.rect.cells)patchCellEl(r,c)?.classList.remove('patch-commit')},180)
  }
  return true
}
function removePatchRectangle(id){
  let changed=false;
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]===id){current.paint[r][c]=null;changed=true}
  if(!changed)return false;
  markBacktrack();current.active=id;drawP();saveCurrent();updateScoreFlags();haptic(7);return true
}
function schedulePatchAfterPaint(){
  if(patchPaintFrame)return;
  patchPaintFrame=requestAnimationFrame(()=>{
    patchPaintFrame=0;
    let b=$('#pboard');if(!b||!current||current.game!=='patches')return;
    applyIllegalClasses(b,patchIllegalCells(),current.n);
    updateScoreFlags();saveCurrent();maybeAutoFinish()
  })
}
function renderPatches(c){
  shell(gameLabel('patches'),lang()==='fr'?`${c.n}×${c.n} · générée · reconstruis les zones`:`${c.n}×${c.n} · generated · rebuild regions`,c.diff,
    `<div class="patch-palette" id="patchPalette" role="toolbar" aria-label="${lang()==='fr'?'Choix de la zone':'Region selection'}"></div><div class="board-wrap patch-board-wrap"><div class="board" id="pboard" style="grid-template-columns:repeat(${c.n},minmax(0,1fr));grid-template-rows:repeat(${c.n},minmax(0,1fr))"></div></div><div class="legend">${tr('patchesLegend')}</div>`,
    gameRules('patches'));
  let pp=$('#patchPalette');
  c.ids.forEach(id=>{
    let bt=document.createElement('button');
    bt.className='patch-chip';bt.style.setProperty('--chip-color',c.pal[id%c.pal.length]);
    bt.style.background=c.pal[id%c.pal.length];bt.dataset.id=id;
    bt.textContent=`${tr('zone')} ${id+1}`;bt.setAttribute('aria-pressed','false');
    bt.onclick=touchSave(()=>{current.active=+bt.dataset.id;drawPatchPalette();haptic(5)});
    pp.appendChild(bt)
  });
  let clueAt=new Map(c.ids.map(id=>[c.clues[id].pos.join(','),id]));
  let b=$('#pboard'),drag=null;
  for(let r=0;r<c.n;r++)for(let col=0;col<c.n;col++){
    let d=document.createElement('div');d.className='cell patch-cell';d.dataset.r=r;d.dataset.c=col;
    let clueId=clueAt.get(r+','+col);
    if(clueId!=null){d.classList.add('clue');d.dataset.clueId=clueId;d.innerHTML=clueHTML(c.clues[clueId])}
    else d.dataset.clueId='';
    d.onpointerdown=e=>{
      if(paused)return;e.preventDefault();
      let existing=current.paint[r][col],startClue=patchClueIdAt(r,col),fallback=startClue??existing??current.active;
      if(startClue!=null&&current.active!==startClue){current.active=startClue;drawPatchPalette()}
      drag={pointerId:e.pointerId,anchor:[r,col],end:[r,col],fallbackId:fallback,lockedId:existing,startExisting:existing,moved:false};
      try{b.setPointerCapture(e.pointerId)}catch(_){}
      if(existing==null)renderPatchPreview(drag.anchor,drag.end,drag.fallbackId,drag.lockedId);haptic(5)
    };
    b.appendChild(d)
  }
  b.onpointermove=e=>{
    if(!drag||e.pointerId!==drag.pointerId)return;e.preventDefault();
    let cell=patchPointToCell(e.clientX,e.clientY,b);if(!cell)return;
    if(cell[0]===drag.end[0]&&cell[1]===drag.end[1])return;
    drag.end=cell;drag.moved=drag.moved||cell[0]!==drag.anchor[0]||cell[1]!==drag.anchor[1];
    schedulePatchDragPreview(drag.anchor,drag.end,drag.fallbackId,drag.lockedId)
  };
  let finishDrag=(e,cancel=false)=>{
    if(!drag||e.pointerId!==drag.pointerId)return;
    try{b.releasePointerCapture(drag.pointerId)}catch(_){}
    let done=drag;drag=null;
    if(cancel){clearPatchPreview();return}
    let finalCell=patchPointToCell(e.clientX,e.clientY,b);if(finalCell){done.end=finalCell;done.moved=done.moved||finalCell[0]!==done.anchor[0]||finalCell[1]!==done.anchor[1]};
    if(patchDragPending){patchDragPending=null}
    if(patchDragFrame){try{cancelAnimationFrame(patchDragFrame)}catch(_){};patchDragFrame=0}
    if(!done.moved&&done.startExisting!=null){clearPatchPreview();removePatchRectangle(done.startExisting);return}
    commitPatchRectangle(done.anchor,done.end,done.fallbackId,done.lockedId)
  };
  b.onpointerup=e=>finishDrag(e,false);
  b.onpointercancel=e=>finishDrag(e,true);
  drawP();
  $('#checkBtn').onclick=checkP;$('#hintBtn').onclick=hintP;
  $('#solutionBtn').onclick=()=>{if(paused)return;clearPatchPreview();current.paint=current.reg.map(r=>[...r]);drawP();finish(tr('solutionShown'),'revealed')}
}
function clueHTML(cl){
  let parts=[];
  if(cl.mode==='both'||cl.mode==='size')parts.push(`<b>${cl.size}</b>`);
  if(cl.mode==='both'||cl.mode==='shape')parts.push(`<span>${cl.shape==='carré'?'□':cl.shape==='vertical'?'▯':cl.shape==='horizontal'?'▭':'✣'}</span>`);
  if(cl.mode==='none')parts.push('<b>?</b>');
  return `<span class="patch-clue">${parts.join('')}</span>`
}
function drawP(){
  let b=$('#pboard');if(!b||!current||current.game!=='patches')return;
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)updatePatchCellVisual(r,c);
  drawPatchPalette();
  applyIllegalClasses(b,patchIllegalCells(),current.n);
  updateScoreFlags()
}
function checkP(){let n=current.n,all=current.paint.every(row=>row.every(v=>v!==null));if(!all){status(tr('patchAll'),false);return}let cluePositions=new Map(current.ids.map(id=>[current.clues[id].pos.join(','),id]));for(let id of current.ids){let cells=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.paint[r][c]===id)cells.push([r,c]);if(!cells.length){status(tr('patchEach'),false);return}let own=current.clues[id].pos;if(!cells.some(([r,c])=>r===own[0]&&c===own[1])){status(tr('patchOwn'),false);return}let other=cells.some(([r,c])=>cluePositions.has(r+','+c)&&cluePositions.get(r+','+c)!==id);if(other){status(tr('patchTwo'),false);return}let seen=new Set([cells[0].join(',')]),q=[cells[0]],set=new Set(cells.map(x=>x.join(',')));while(q.length){let [r,c]=q.pop();for(let [rr,cc] of [[r+1,c],[r-1,c],[r,c+1],[r,c-1]]){let k=rr+','+cc;if(set.has(k)&&!seen.has(k)){seen.add(k);q.push([rr,cc])}}}if(seen.size!==cells.length){status(tr('patchConnected'),false);return}let cl=current.clues[id],sh=patchShape(cells);if(sh==='libre'){status(tr('patchRect'),false);return}if((cl.mode==='both'||cl.mode==='size')&&cells.length!==cl.size){status(tr('patchSize'),false);return}if((cl.mode==='both'||cl.mode==='shape')&&sh!==cl.shape){status(tr('patchShape'),false);return}}finish(`${tr('congrats')} ${gameLabel('patches')}`)}
function hintP(){if(paused)return;let h=findPatchLogicalHint()||findPatchRank1Hint()||findPatchRank2Hint();if(!h)return showNoLogicalHint();let move=lang()==='fr'?`Attribue la case ligne ${h.r+1}, colonne ${h.c+1} à la zone ${h.id+1}.`:`Assign row ${h.r+1}, column ${h.c+1} to region ${h.id+1}.`;hintStage('patches',[h.r,h.c],{move,where:lang()==='fr'?`Le coup est déduit uniquement des indices et cases déjà peintes.`:`The move is deduced only from the clues and cells already painted.`,why:h.rank===2?rank2Why(h):h.rank===1?rank1Why(h):h.why,reveal:tr('patchRevealed')},()=>{current.paint[h.r][h.c]=h.id;drawP();maybeAutoFinish()})}
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

// v2.6.2 — Queens session anti-repeat.
// Kept deliberately in memory only: restarting/reloading the application clears it.
const queenGeneratedSessionByDay=new Map();

function normalizeQueenRegionIds(reg){
  let ids=new Map(),next=0;
  return reg.map(row=>row.map(id=>{
    if(!ids.has(id))ids.set(id,next++);
    return ids.get(id)
  }))
}
function queenRegionSignature(reg){
  let g=normalizeQueenRegionIds(reg);
  return `${g.length}|${g.map(row=>row.join(',')).join(';')}`
}
function queenCanonicalSignature(reg){
  // The 8 symmetries of a square: 4 rotations + their mirrored forms.
  let signatures=[];
  for(let k=0;k<8;k++)signatures.push(queenRegionSignature(transformGrid(reg,k)));
  signatures.sort();
  return signatures[0]
}
function queenSessionSet(day=localDay()){
  // The requirement is per day; if the app remains open across midnight,
  // yesterday's set is no longer useful and can be released.
  for(let d of [...queenGeneratedSessionByDay.keys()])if(d!==day)queenGeneratedSessionByDay.delete(d);
  if(!queenGeneratedSessionByDay.has(day))queenGeneratedSessionByDay.set(day,new Set());
  return queenGeneratedSessionByDay.get(day)
}
function queenWasGeneratedThisSession(reg,day=localDay()){
  return queenSessionSet(day).has(queenCanonicalSignature(reg))
}
function rememberQueenGeneratedThisSession(reg,day=localDay()){
  queenSessionSet(day).add(queenCanonicalSignature(reg))
}
function collectFreshQueenCandidates(diff,count,day=localDay()){
  let out=[],batch=new Set(),guard=0,maxTries=Math.max(48,count*12),seen=queenSessionSet(day);
  while(out.length<count&&guard++<maxTries){
    try{
      let g=queenCandidate(diff),sig=queenCanonicalSignature(g.reg);
      if(seen.has(sig)||batch.has(sig))continue;
      batch.add(sig);out.push(g)
    }catch(_){}
  }
  if(!out.length)throw new Error(lang()==='fr'
    ?'Aucune nouvelle grille Queens non équivalente n’a pu être générée dans cette session.'
    :'No new non-equivalent Queens grid could be generated in this session.');
  return out
}
function queenCandidateForDisplay(diff,dailyRequest=false,day=localDay()){
  let count=diff==='expert'?16:diff==='hard'?14:6,g;
  if(dailyRequest){
    // Daily challenge must remain deterministic for a given date/version.
    g=targetPick(collectCandidates(()=>queenCandidate(diff),count),diff)
  }else{
    g=targetPick(collectFreshQueenCandidates(diff,count,day),diff)
  }
  rememberQueenGeneratedThisSession(g.reg,day);
  return g
}

function queenCandidate(diff){let g=generateQueensPuzzle(diff);g.rating=analyzeQueens(g.reg);return g}
function tangoCandidate(diff){let g=generateTangoPuzzle(diff);g.rating=analyzeTango(g.sol,g.givens,g.edges);return g}
function sudokuCandidate(diff){let sol=randomSudokuSolution(),holes={easy:16,medium:22,hard:27}[diff],empty=makeSudokuHoles(sol,holes);return {sol,empty,rating:analyzeSudoku(sol,empty)}}
function patchesCandidate(diff){let g=generatePatchesPuzzle(diff);g.rating=analyzePatches(g.n,g.ids,g.clues);return g}
function queens(diff){let dailyRequest=!!current?.daily,day=current?.dailyDay||localDay(),g=!dailyRequest?takePrecomputed('queens',diff,day):null;if(!g)g=queenCandidateForDisplay(diff,dailyRequest,day);current={game:'queens',diff,n:g.n,reg:g.reg,sol:g.sol,rating:g.rating,state:Array.from({length:g.n},()=>Array(g.n).fill(0)),generated:true,unique:true,completed:false};renderQueens(current)}
function tango(diff){let dailyRequest=!!current?.daily,g=!dailyRequest?takePrecomputed('tango',diff):null;if(!g)g=targetPick(collectCandidates(()=>tangoCandidate(diff),6),diff);let state=Array.from({length:6},()=>Array(6).fill(-1));for(let i of g.givens)state[Math.floor(i/6)][i%6]=g.sol[Math.floor(i/6)][i%6];current={game:'tango',diff,n:6,sol:g.sol,givens:g.givens,edges:g.edges,rating:g.rating,state,generated:true,unique:true,completed:false};renderTango(current)}
function sudoku(diff){let dailyRequest=!!current?.daily,g=!dailyRequest?takePrecomputed('sudoku',diff):null;if(!g)g=targetPick(collectCandidates(()=>sudokuCandidate(diff),8),diff);let sol=g.sol,empty=g.empty;current={game:'sudoku',diff,n:6,sol,empty,rating:g.rating,state:sol.map((r,ri)=>r.map((v,c)=>empty.has(ri*6+c)?0:v)),sel:null,generated:true,unique:true,completed:false};renderSudoku(current)}
function patches(diff){let dailyRequest=!!current?.daily,g=!dailyRequest?takePrecomputed('patches',diff):null;if(!g)g=targetPick(collectCandidates(()=>patchesCandidate(diff),diff==='hard'?5:4),diff);const pal=['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1'];current={game:'patches',diff,n:g.n,reg:g.reg,ids:g.ids,cellsBy:g.cellsBy,clues:g.clues,rating:g.rating,pal,active:g.ids[0],paint:Array.from({length:g.n},()=>Array(g.n).fill(null)),generated:true,unique:true,completed:false};renderPatches(current)}
