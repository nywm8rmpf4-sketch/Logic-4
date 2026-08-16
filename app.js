/*
 * QUADLUD
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation without prior written authorization is prohibited.
 */
'use strict';
const $=s=>document.querySelector(s), app=$('#app'), toast=$('#toast'), timerEl=$('#timer');
const VERSION='2.21.18', SAVE_KEY='logic4-save-v1';
let current=null, tick=null, startedAt=0, elapsedBase=0, paused=false;
const I18N={
fr:{
 easy:'Facile',medium:'Moyen',hard:'Difficile',expert:'Expert',gameQueens:'Couronnes',gameTango:'Soleil-Lune',gameSudoku:'Grille 6',gamePatches:'Rectangles',
 newGame:'Nouvelle',reset:'Réinitialiser',pause:'Pause',resume:'Reprendre',check:'Vérifier',hint:'Indice',solution:'Solution',rules:'Règles',
 back:'Retour',play:'Jouer',generated:'générée',score:'score',
 homeTitle:'Quatre jeux.<br>Une pause logique.',homeSub:'Quatre jeux de logique, avec génération, chronomètre, défis et progression. Fonctionne hors ligne après le premier chargement.',
 queensSub:'Une reine par ligne, colonne et zone.',tangoSub:'Équilibre Soleil/Lune et relations.',sudokuSub:'6×6, lignes, colonnes et régions.',patchesSub:'Reconstitue toutes les zones.',
 daily:'Défi quotidien',dailySub:'terminés aujourd’hui',stats:'Statistiques & progression',statsSub:'Historique, records et séries',prefs:'Préférences',prefsSub:'Langue, thème, sons et données locales',about:'À propos',aboutSub:'Version, copyright et licence',
 settingsSaved:'Réglages enregistrés sur cet appareil.',language:'Langue',languageSub:'Français ou English',theme:'Thème',themeSub:'Automatique, clair ou sombre',auto:'Automatique',light:'Clair',dark:'Sombre',
 sounds:'Sons discrets',soundsSub:'Victoire et retours ponctuels',on:'Activés',off:'Désactivés',data:'Données',dataSub:'Statistiques, défis et préférences restent locales.',info:'Info',
 localDataTitle:'Données locales',localData:'QUADLUD ne nécessite aucun compte. Les parties, statistiques, défis quotidiens et préférences sont stockés dans le navigateur de cet appareil.',
 dailyLast:'28 derniers jours',dailyNote:'Chaque date produit les mêmes quatre grilles sur tous les appareils utilisant cette version. Difficulté quotidienne : Moyen.',finished:'terminés',
 statsLocal:'Progression enregistrée uniquement sur cet appareil.',solved:'résolues',success:'réussite',avgTime:'temps moyen',streak:'série de jours',byGame:'Par jeu',history:'Historique récent',record:'record',average:'moyen',none:'Aucune partie terminée pour le moment.',
 solvedStatus:'Résolu',revealedStatus:'Solution vue',abandonedStatus:'Abandonné',finishedStatus:'Terminé',
 autoCross:'Croix automatiques quand je place une reine',queensLegend:'Touchez une case pour faire vide → X → reine. Faites glisser le doigt sur une ligne ou une colonne pour ajouter des X ; commencez sur un X pour les effacer.',
 patchesLegend:'Fais glisser le doigt d’un coin à l’autre pour dessiner ou redimensionner un rectangle. La zone est choisie automatiquement quand le rectangle contient un seul indice. Un tap sur un rectangle existant le supprime.',zone:'Zone',
 aboutTitle:'À propos de QUADLUD',version:'Version',copyright:'Copyright',license:'Licence',proprietary:'Logiciel propriétaire — All rights reserved.',legal:'Toute copie, modification, redistribution et exploitation sans autorisation écrite préalable de Serge Benoliel est interdite.',
 restored:'Partie restaurée',generating:'Génération…',rulesTitle:'Règles',where:'Où regarder',logic:'Logique',solutionShown:'Solution affichée',congrats:'Bravo !',gridIncomplete:'Il reste une erreur ou une case à résoudre.',tangoIncomplete:'La grille ne respecte pas encore toutes les règles.',sudokuIncomplete:'Il reste une erreur ou une case vide.',autoCrossOn:'Croix automatiques activées',autoCrossOff:'Croix automatiques désactivées',queenPlaced:'Une reine a été placée.',cellRevealed:'Une case a été révélée.',digitRevealed:'Un chiffre a été révélé.',patchRevealed:'Une case de la zone a été révélée.',finishedShare:'Terminé',dailyLabel:'Défi quotidien',backtrackFlag:'retour en arrière',hintFlag:'indice utilisé',closeHint:'Fermer',hintMove:'Coup conseillé',hintWhy:'Pourquoi',noLogicalHint:'Aucun coup directement déductible avec l’état actuel.',hintTimeout:'La recherche d’indice a atteint la limite de 5 secondes. Aucun indice fiable n’a été trouvé dans ce délai.',hintSearching:'Recherche d’un indice…',hintPaused:'Reprenez la partie pour demander un indice.',hintError:'La recherche d’indice n’a pas pu aboutir. Réessayez après votre prochain coup.',dragHint:'Déplacer',rank1:'inférence de rang 1',rank2:'inférence de rang 2',rank3:'inférence de rang 3',hintNoR0:'Rang 0 : aucune déduction directe.',hintNoR1:'Rang 1 : aucune hypothèse n’aboutit immédiatement à une impasse.',hintNoR2:'Rang 2 : aucune hypothèse n’aboutit à une impasse au niveau suivant.',hintNoR3:'Rang 3 : aucune contradiction forcée n’a été démontrée à trois niveaux.',hypothesis:'Hypothèse',consequence:'Conséquence',deadend:'Impasse',conclusion:'Conclusion',themeLabel:'Thème',soundsOn:'Sons activés',soundsOff:'Sons désactivés',resetDone:'Grille réinitialisée.',patchAll:'Toutes les cases doivent appartenir à une zone.',patchEach:'Chaque indice doit avoir une zone.',patchOwn:'Chaque zone doit contenir son propre indice.',patchTwo:'Une zone ne peut pas contenir deux indices.',patchConnected:'Chaque zone doit être d’un seul tenant.',patchRect:'Chaque zone doit former un rectangle.',patchSize:'La taille d’une zone ne correspond pas à son indice.',patchShape:'La forme d’une zone ne correspond pas à son indice.',
},
en:{
 easy:'Easy',medium:'Medium',hard:'Hard',expert:'Expert',gameQueens:'Crowns',gameTango:'Sun-Moon',gameSudoku:'Grid 6',gamePatches:'Rectangles',
 newGame:'New',reset:'Reset',pause:'Pause',resume:'Resume',check:'Check',hint:'Hint',solution:'Solution',rules:'Rules',
 back:'Back',play:'Play',generated:'generated',score:'score',
 homeTitle:'Four games.<br>One logic break.',homeSub:'Four logic games with generation, timer, daily challenges and progress tracking. Works offline after the first load.',
 queensSub:'One queen per row, column and region.',tangoSub:'Balance Sun/Moon and relations.',sudokuSub:'6×6, rows, columns and regions.',patchesSub:'Rebuild all rectangular regions.',
 daily:'Daily challenge',dailySub:'completed today',stats:'Statistics & progress',statsSub:'History, records and streaks',prefs:'Preferences',prefsSub:'Language, theme, sounds and local data',about:'About',aboutSub:'Version, copyright and license',
 settingsSaved:'Settings saved on this device.',language:'Language',languageSub:'Français or English',theme:'Theme',themeSub:'Automatic, light or dark',auto:'Automatic',light:'Light',dark:'Dark',
 sounds:'Subtle sounds',soundsSub:'Victory and occasional feedback',on:'On',off:'Off',data:'Data',dataSub:'Statistics, challenges and preferences stay local.',info:'Info',
 localDataTitle:'Local data',localData:'QUADLUD requires no account. Games, statistics, daily challenges and preferences are stored in this device browser.',
 dailyLast:'Last 28 days',dailyNote:'Each date produces the same four grids on all devices using this version. Daily difficulty: Medium.',finished:'completed',
 statsLocal:'Progress is stored only on this device.',solved:'solved',success:'success',avgTime:'average time',streak:'day streak',byGame:'By game',history:'Recent history',record:'record',average:'average',none:'No completed game yet.',
 solvedStatus:'Solved',revealedStatus:'Solution viewed',abandonedStatus:'Abandoned',finishedStatus:'Finished',
 autoCross:'Auto-mark crosses when I place a queen',queensLegend:'Tap a cell to cycle empty → X → queen. Drag along a row or column to add X marks; start on an X to erase them.',
 patchesLegend:'Drag from one corner to the opposite corner to draw or resize a rectangle. The region is selected automatically when the rectangle contains one clue. Tap an existing rectangle to remove it.',zone:'Region',
 aboutTitle:'About QUADLUD',version:'Version',copyright:'Copyright',license:'License',proprietary:'Proprietary software — All rights reserved.',legal:'Copying, modification, redistribution and exploitation without prior written permission from Serge Benoliel are prohibited.',
 restored:'Game restored',generating:'Generating…',rulesTitle:'Rules',where:'Where to look',logic:'Logic',solutionShown:'Solution shown',congrats:'Well done!',gridIncomplete:'There is still an error or an unresolved cell.',tangoIncomplete:'The grid does not yet satisfy all rules.',sudokuIncomplete:'There is still an error or an empty cell.',autoCrossOn:'Auto-crosses enabled',autoCrossOff:'Auto-crosses disabled',queenPlaced:'A queen was placed.',cellRevealed:'A cell was revealed.',digitRevealed:'A digit was revealed.',patchRevealed:'A region cell was revealed.',finishedShare:'Finished',dailyLabel:'Daily challenge',backtrackFlag:'backtracked',hintFlag:'hint used',closeHint:'Close',hintMove:'Suggested move',hintWhy:'Why',noLogicalHint:'No move can be directly deduced from the current state.',hintTimeout:'The hint search reached the 5-second limit. No reliable hint was found within that time.',hintSearching:'Searching for a hint…',hintPaused:'Resume the game to request a hint.',hintError:'The hint search could not complete. Try again after your next move.',dragHint:'Move',rank1:'rank-1 inference',rank2:'rank-2 inference',rank3:'rank-3 inference',hintNoR0:'Rank 0: no direct deduction.',hintNoR1:'Rank 1: no assumption immediately leads to a dead end.',hintNoR2:'Rank 2: no assumption leads to a dead end on the next level.',hintNoR3:'Rank 3: no forced contradiction was proved within three levels.',hypothesis:'Assumption',consequence:'Consequence',deadend:'Dead end',conclusion:'Conclusion',themeLabel:'Theme',soundsOn:'Sounds enabled',soundsOff:'Sounds disabled',resetDone:'Grid reset.',patchAll:'Every cell must belong to a region.',patchEach:'Every clue must have a region.',patchOwn:'Each region must contain its own clue.',patchTwo:'A region cannot contain two clues.',patchConnected:'Each region must be connected.',patchRect:'Each region must form a rectangle.',patchSize:'A region size does not match its clue.',patchShape:'A region shape does not match its clue.',
}};
const SUPPORTED_LANGS=["en","zh","hi","es","ar","fr","bn","pt","id","ur","bg","hr","cs","da","nl","et","fi","de","el","hu","ga","it","lv","lt","mt","pl","ro","sk","sl","sv"];
const RTL_LANGS=new Set(['ar','ur']);
const LANGUAGE_OPTIONS=[["en","English"],["zh","简体中文"],["hi","हिन्दी"],["es","Español"],["ar","العربية"],["fr","Français"],["bn","বাংলা"],["pt","Português"],["id","Bahasa Indonesia"],["ur","اردو"],["bg","Български"],["hr","Hrvatski"],["cs","Čeština"],["da","Dansk"],["nl","Nederlands"],["et","Eesti"],["fi","Suomi"],["de","Deutsch"],["el","Ελληνικά"],["hu","Magyar"],["ga","Gaeilge"],["it","Italiano"],["lv","Latviešu"],["lt","Lietuvių"],["mt","Malti"],["pl","Polski"],["ro","Română"],["sk","Slovenčina"],["sl","Slovenščina"],["sv","Svenska"]];
Object.assign(I18N.fr,{"erase":"Effacer","regionSelection":"Choix de la zone","share":"Partager","continue":"Continuer","resultCopied":"Résultat copié","shareUnavailable":"Partage non disponible","victoryKicker":"BRAVO","actions":"Actions","homeAria":"Accueil","changeTheme":"Changer le thème","visibleOnly":"Déduit uniquement de l’état visible.","directReason":"Ce coup découle directement des contraintes visibles.","rank1Reason":"Les autres possibilités mènent immédiatement à une contradiction.","rank2Reason":"Les autres possibilités échouent au niveau logique suivant.","rank3Reason":"Une vérification limitée à trois niveaux impose ce coup.","placeQueen":"Place une reine","markX":"Marque X","placeSun":"Place un soleil","placeMoon":"Place une lune","placeDigit":"Place le chiffre","assignRegion":"Attribue à la zone","rowLabel":"ligne","columnLabel":"colonne","languageSub":"10 langues disponibles"});
Object.assign(I18N.en,{"erase":"Erase","regionSelection":"Region selection","share":"Share","continue":"Continue","resultCopied":"Result copied","shareUnavailable":"Sharing unavailable","victoryKicker":"WELL DONE","actions":"Actions","homeAria":"Home","changeTheme":"Change theme","visibleOnly":"Deduced only from the visible state.","directReason":"This move follows directly from the visible constraints.","rank1Reason":"The alternatives immediately lead to a contradiction.","rank2Reason":"The alternatives fail one logical level deeper.","rank3Reason":"A bounded three-level check forces this move.","placeQueen":"Place a queen","markX":"Mark X","placeSun":"Place a sun","placeMoon":"Place a moon","placeDigit":"Place digit","assignRegion":"Assign to region","rowLabel":"row","columnLabel":"column","languageSub":"10 languages available"});
I18N.zh={...I18N.en,...{"easy":"简单","medium":"中等","hard":"困难","expert":"专家","gameQueens":"王冠","gameTango":"日月","gameSudoku":"六格","gamePatches":"矩形","newGame":"新局","reset":"重置","pause":"暂停","resume":"继续","check":"检查","hint":"提示","solution":"答案","rules":"规则","back":"返回","play":"开始","generated":"已生成","score":"分数","homeTitle":"四个游戏。<br>一次逻辑小憩。","homeSub":"四个逻辑游戏，支持自动生成、计时、每日挑战和进度记录。首次加载后可离线使用。","queensSub":"每行、每列、每个区域各放一枚皇后。","tangoSub":"平衡太阳/月亮并满足关系条件。","sudokuSub":"6×6，行、列和宫。","patchesSub":"重建所有矩形区域。","daily":"每日挑战","dailySub":"今日已完成","stats":"统计与进度","statsSub":"历史、纪录和连续天数","prefs":"设置","prefsSub":"语言、主题、声音和本地数据","about":"关于","aboutSub":"版本、版权和许可","settingsSaved":"设置已保存在此设备。","language":"语言","languageSub":"提供 10 种语言","theme":"主题","themeSub":"自动、浅色或深色","auto":"自动","light":"浅色","dark":"深色","sounds":"轻提示音","soundsSub":"胜利和偶尔的反馈音","on":"开启","off":"关闭","data":"数据","dataSub":"统计、挑战和设置仅保存在本地。","info":"信息","localDataTitle":"本地数据","localData":"QUADLUD 无需账户。游戏、统计、每日挑战和设置均保存在此设备的浏览器中。","dailyLast":"最近 28 天","dailyNote":"同一日期在使用此版本的所有设备上都会生成相同的四个谜题。每日难度：中等。","finished":"已完成","statsLocal":"进度仅保存在此设备。","solved":"已解","success":"成功率","avgTime":"平均时间","streak":"连续天数","byGame":"按游戏","history":"最近记录","record":"纪录","average":"平均","none":"尚无已完成的游戏。","solvedStatus":"已解","revealedStatus":"已查看答案","abandonedStatus":"已放弃","finishedStatus":"已完成","autoCross":"放置皇后时自动标记 X","queensLegend":"点按格子可在 空白 → X → 皇后 之间切换。沿行或列拖动可添加 X；从 X 开始拖动可擦除。","patchesLegend":"从一个角拖到对角以绘制或调整矩形。矩形只包含一个提示时会自动选择对应区域。点按已有矩形可删除。","zone":"区域","aboutTitle":"关于 QUADLUD","version":"版本","copyright":"版权","license":"许可","proprietary":"专有软件 — 保留所有权利。","legal":"未经 Serge Benoliel 事先书面许可，禁止复制、修改、再分发或利用本软件。","restored":"游戏已恢复","generating":"生成中…","rulesTitle":"规则","where":"观察位置","logic":"逻辑","solutionShown":"答案已显示","congrats":"做得好！","gridIncomplete":"仍有错误或未解决的格子。","tangoIncomplete":"棋盘尚未满足所有规则。","sudokuIncomplete":"仍有错误或空格。","autoCrossOn":"自动 X 已开启","autoCrossOff":"自动 X 已关闭","queenPlaced":"已放置一枚皇后。","cellRevealed":"已揭示一个格子。","digitRevealed":"已揭示一个数字。","patchRevealed":"已揭示一个区域格。","finishedShare":"已完成","dailyLabel":"每日挑战","backtrackFlag":"有回退","hintFlag":"使用了提示","closeHint":"关闭","hintMove":"建议走法","hintWhy":"原因","noLogicalHint":"根据当前状态无法直接推出下一步。","hintTimeout":"提示搜索已达到 5 秒上限。在此时间内未找到可靠提示。","hintSearching":"正在寻找提示…","hintPaused":"请继续游戏后再请求提示。","hintError":"提示搜索未能完成。请在下一步之后重试。","dragHint":"移动","rank1":"一级推理","rank2":"二级推理","rank3":"三级推理","hintNoR0":"第 0 级：没有直接推导。","hintNoR1":"第 1 级：没有任何假设会立即导致死路。","hintNoR2":"第 2 级：没有任何假设会在下一层导致死路。","hintNoR3":"第 3 级：在三层内未证明必然矛盾。","hypothesis":"假设","consequence":"结果","deadend":"死路","conclusion":"结论","themeLabel":"主题","soundsOn":"声音已开启","soundsOff":"声音已关闭","resetDone":"棋盘已重置。","patchAll":"每个格子都必须属于一个区域。","patchEach":"每个提示都必须对应一个区域。","patchOwn":"每个区域必须包含自己的提示。","patchTwo":"一个区域不能包含两个提示。","patchConnected":"每个区域必须连通。","patchRect":"每个区域必须形成矩形。","patchSize":"区域大小与提示不符。","patchShape":"区域形状与提示不符。","erase":"清除","regionSelection":"区域选择","share":"分享","continue":"继续","resultCopied":"结果已复制","shareUnavailable":"无法分享","victoryKicker":"太棒了！","actions":"操作","homeAria":"主页","changeTheme":"切换主题","visibleOnly":"仅根据当前可见状态推导。","directReason":"这一步可由当前可见约束直接推出。","rank1Reason":"其他选择会立即导致矛盾。","rank2Reason":"其他选择会在下一层逻辑中失败。","rank3Reason":"三层以内的有限检查强制得到这一步。","placeQueen":"放置皇后","markX":"标记 X","placeSun":"放置太阳","placeMoon":"放置月亮","placeDigit":"填入数字","assignRegion":"分配到区域","rowLabel":"行","columnLabel":"列"}};
I18N.hi={...I18N.en,...{"easy":"आसान","medium":"मध्यम","hard":"कठिन","expert":"विशेषज्ञ","gameQueens":"मुकुट","gameTango":"सूर्य-चंद्र","gameSudoku":"ग्रिड 6","gamePatches":"आयत","newGame":"नया","reset":"रीसेट","pause":"विराम","resume":"जारी रखें","check":"जाँचें","hint":"संकेत","solution":"समाधान","rules":"नियम","back":"वापस","play":"खेलें","generated":"बनाया गया","score":"स्कोर","homeTitle":"चार खेल।<br>एक तार्किक विराम।","homeSub":"चार लॉजिक खेल, स्वतः निर्माण, टाइमर, दैनिक चुनौतियों और प्रगति रिकॉर्ड के साथ। पहली लोडिंग के बाद ऑफलाइन चलता है।","queensSub":"हर पंक्ति, स्तंभ और क्षेत्र में एक रानी।","tangoSub":"सूर्य/चंद्र संतुलन और संबंध।","sudokuSub":"6×6, पंक्तियाँ, स्तंभ और क्षेत्र।","patchesSub":"सभी आयताकार क्षेत्रों को फिर बनाएं।","daily":"दैनिक चुनौती","dailySub":"आज पूरे","stats":"आँकड़े और प्रगति","statsSub":"इतिहास, रिकॉर्ड और लगातार दिन","prefs":"प्राथमिकताएँ","prefsSub":"भाषा, थीम, ध्वनि और स्थानीय डेटा","about":"परिचय","aboutSub":"संस्करण, कॉपीराइट और लाइसेंस","settingsSaved":"सेटिंग्स इस डिवाइस पर सहेजी गई हैं।","language":"भाषा","languageSub":"10 भाषाएँ उपलब्ध","theme":"थीम","themeSub":"स्वचालित, हल्का या गहरा","auto":"स्वचालित","light":"हल्का","dark":"गहरा","sounds":"हल्की ध्वनियाँ","soundsSub":"जीत और कभी-कभी प्रतिक्रिया","on":"चालू","off":"बंद","data":"डेटा","dataSub":"आँकड़े, चुनौतियाँ और प्राथमिकताएँ स्थानीय रहती हैं।","info":"जानकारी","localDataTitle":"स्थानीय डेटा","localData":"QUADLUD के लिए खाते की आवश्यकता नहीं है। खेल, आँकड़े, दैनिक चुनौतियाँ और प्राथमिकताएँ इस डिवाइस के ब्राउज़र में सहेजी जाती हैं।","dailyLast":"पिछले 28 दिन","dailyNote":"हर तारीख इस संस्करण वाले सभी डिवाइस पर वही चार ग्रिड बनाती है। दैनिक कठिनाई: मध्यम।","finished":"पूरे","statsLocal":"प्रगति केवल इस डिवाइस पर सहेजी जाती है।","solved":"हल किए","success":"सफलता","avgTime":"औसत समय","streak":"लगातार दिन","byGame":"खेल के अनुसार","history":"हाल का इतिहास","record":"रिकॉर्ड","average":"औसत","none":"अभी कोई खेल पूरा नहीं हुआ।","solvedStatus":"हल","revealedStatus":"समाधान देखा","abandonedStatus":"छोड़ा गया","finishedStatus":"पूरा","autoCross":"रानी रखने पर X अपने-आप लगाएँ","queensLegend":"खाने पर टैप करके खाली → X → रानी बदलें। X जोड़ने के लिए पंक्ति या स्तंभ में खींचें; मिटाने के लिए X से शुरू करें।","patchesLegend":"आयत बनाने या उसका आकार बदलने के लिए एक कोने से विपरीत कोने तक खींचें। आयत में एक ही संकेत होने पर क्षेत्र अपने-आप चुना जाता है। मौजूदा आयत पर टैप करके उसे हटाएँ।","zone":"क्षेत्र","aboutTitle":"QUADLUD के बारे में","version":"संस्करण","copyright":"कॉपीराइट","license":"लाइसेंस","proprietary":"स्वामित्व वाला सॉफ़्टवेयर — सभी अधिकार सुरक्षित।","legal":"Serge Benoliel की पूर्व लिखित अनुमति के बिना प्रतिलिपि, संशोधन, पुनर्वितरण या उपयोग निषिद्ध है।","restored":"खेल पुनर्स्थापित","generating":"बन रहा है…","rulesTitle":"नियम","where":"कहाँ देखें","logic":"तर्क","solutionShown":"समाधान दिखाया गया","congrats":"बहुत बढ़िया!","gridIncomplete":"अभी भी कोई त्रुटि या अनसुलझा खाना है।","tangoIncomplete":"ग्रिड अभी सभी नियमों को पूरा नहीं करता।","sudokuIncomplete":"अभी भी कोई त्रुटि या खाली खाना है।","autoCrossOn":"स्वचालित X चालू","autoCrossOff":"स्वचालित X बंद","queenPlaced":"एक रानी रखी गई।","cellRevealed":"एक खाना दिखाया गया।","digitRevealed":"एक अंक दिखाया गया।","patchRevealed":"एक क्षेत्र का खाना दिखाया गया।","finishedShare":"पूरा","dailyLabel":"दैनिक चुनौती","backtrackFlag":"पीछे गए","hintFlag":"संकेत लिया","closeHint":"बंद करें","hintMove":"सुझाई गई चाल","hintWhy":"क्यों","noLogicalHint":"वर्तमान स्थिति से कोई चाल सीधे निष्कर्षित नहीं की जा सकती।","hintTimeout":"संकेत खोज 5 सेकंड की सीमा तक पहुँच गई। इस समय में कोई भरोसेमंद संकेत नहीं मिला।","hintSearching":"संकेत खोज रहे हैं…","hintPaused":"संकेत माँगने के लिए खेल जारी रखें।","hintError":"संकेत खोज पूरी नहीं हो सकी। अगली चाल के बाद फिर प्रयास करें।","dragHint":"स्थानांतरित करें","rank1":"स्तर-1 अनुमान","rank2":"स्तर-2 अनुमान","rank3":"स्तर-3 अनुमान","hintNoR0":"स्तर 0: कोई सीधा निष्कर्ष नहीं।","hintNoR1":"स्तर 1: कोई धारणा तुरंत बंद रास्ते तक नहीं ले जाती।","hintNoR2":"स्तर 2: कोई धारणा अगले स्तर पर बंद रास्ते तक नहीं ले जाती।","hintNoR3":"स्तर 3: तीन स्तरों में कोई अनिवार्य विरोधाभास सिद्ध नहीं हुआ।","hypothesis":"धारणा","consequence":"परिणाम","deadend":"बंद रास्ता","conclusion":"निष्कर्ष","themeLabel":"थीम","soundsOn":"ध्वनि चालू","soundsOff":"ध्वनि बंद","resetDone":"ग्रिड रीसेट किया गया।","patchAll":"हर खाना किसी क्षेत्र में होना चाहिए।","patchEach":"हर संकेत का एक क्षेत्र होना चाहिए।","patchOwn":"हर क्षेत्र में उसका अपना संकेत होना चाहिए।","patchTwo":"एक क्षेत्र में दो संकेत नहीं हो सकते।","patchConnected":"हर क्षेत्र जुड़ा हुआ होना चाहिए।","patchRect":"हर क्षेत्र आयत होना चाहिए।","patchSize":"क्षेत्र का आकार संकेत से मेल नहीं खाता।","patchShape":"क्षेत्र का रूप संकेत से मेल नहीं खाता।","erase":"मिटाएँ","regionSelection":"क्षेत्र चयन","share":"साझा करें","continue":"जारी रखें","resultCopied":"परिणाम कॉपी हुआ","shareUnavailable":"साझा करना उपलब्ध नहीं","victoryKicker":"बहुत बढ़िया!","actions":"क्रियाएँ","homeAria":"मुखपृष्ठ","changeTheme":"थीम बदलें","visibleOnly":"केवल दिखाई दे रही स्थिति से निष्कर्षित।","directReason":"यह चाल दिखाई दे रही बाधाओं से सीधे निकलती है।","rank1Reason":"अन्य विकल्प तुरंत विरोधाभास पैदा करते हैं।","rank2Reason":"अन्य विकल्प अगले तार्किक स्तर पर विफल होते हैं।","rank3Reason":"तीन स्तर तक की सीमित जाँच इस चाल को अनिवार्य बनाती है।","placeQueen":"रानी रखें","markX":"X लगाएँ","placeSun":"सूर्य रखें","placeMoon":"चंद्र रखें","placeDigit":"अंक रखें","assignRegion":"क्षेत्र में दें","rowLabel":"पंक्ति","columnLabel":"स्तंभ"}};
I18N.es={...I18N.en,...{"easy":"Fácil","medium":"Medio","hard":"Difícil","expert":"Experto","gameQueens":"Coronas","gameTango":"Sol-Luna","gameSudoku":"Cuadrícula 6","gamePatches":"Rectángulos","newGame":"Nueva","reset":"Reiniciar","pause":"Pausa","resume":"Reanudar","check":"Comprobar","hint":"Pista","solution":"Solución","rules":"Reglas","back":"Atrás","play":"Jugar","generated":"generada","score":"puntuación","homeTitle":"Cuatro juegos.<br>Una pausa de lógica.","homeSub":"Cuatro juegos de lógica con generación, cronómetro, retos diarios y seguimiento del progreso. Funciona sin conexión tras la primera carga.","queensSub":"Una reina por fila, columna y región.","tangoSub":"Equilibrio Sol/Luna y relaciones.","sudokuSub":"6×6, filas, columnas y regiones.","patchesSub":"Reconstruye todas las regiones rectangulares.","daily":"Reto diario","dailySub":"completados hoy","stats":"Estadísticas y progreso","statsSub":"Historial, récords y rachas","prefs":"Preferencias","prefsSub":"Idioma, tema, sonidos y datos locales","about":"Acerca de","aboutSub":"Versión, copyright y licencia","settingsSaved":"Ajustes guardados en este dispositivo.","language":"Idioma","languageSub":"10 idiomas disponibles","theme":"Tema","themeSub":"Automático, claro u oscuro","auto":"Automático","light":"Claro","dark":"Oscuro","sounds":"Sonidos discretos","soundsSub":"Victoria y avisos ocasionales","on":"Activados","off":"Desactivados","data":"Datos","dataSub":"Estadísticas, retos y preferencias permanecen locales.","info":"Info","localDataTitle":"Datos locales","localData":"QUADLUD no requiere cuenta. Las partidas, estadísticas, retos diarios y preferencias se guardan en el navegador de este dispositivo.","dailyLast":"Últimos 28 días","dailyNote":"Cada fecha produce las mismas cuatro cuadrículas en todos los dispositivos que usan esta versión. Dificultad diaria: Medio.","finished":"completados","statsLocal":"El progreso se guarda solo en este dispositivo.","solved":"resueltas","success":"éxito","avgTime":"tiempo medio","streak":"racha de días","byGame":"Por juego","history":"Historial reciente","record":"récord","average":"media","none":"Aún no hay partidas completadas.","solvedStatus":"Resuelto","revealedStatus":"Solución vista","abandonedStatus":"Abandonado","finishedStatus":"Terminado","autoCross":"Marcar cruces automáticamente al colocar una reina","queensLegend":"Toca una casilla para alternar vacía → X → reina. Arrastra por una fila o columna para añadir X; empieza sobre una X para borrarlas.","patchesLegend":"Arrastra de una esquina a la opuesta para dibujar o redimensionar un rectángulo. La región se selecciona automáticamente cuando contiene una sola pista. Toca un rectángulo existente para eliminarlo.","zone":"Región","aboutTitle":"Acerca de QUADLUD","version":"Versión","copyright":"Copyright","license":"Licencia","proprietary":"Software propietario — Todos los derechos reservados.","legal":"Se prohíben la copia, modificación, redistribución y explotación sin autorización previa por escrito de Serge Benoliel.","restored":"Partida restaurada","generating":"Generando…","rulesTitle":"Reglas","where":"Dónde mirar","logic":"Lógica","solutionShown":"Solución mostrada","congrats":"¡Bien hecho!","gridIncomplete":"Todavía hay un error o una casilla sin resolver.","tangoIncomplete":"La cuadrícula aún no cumple todas las reglas.","sudokuIncomplete":"Todavía hay un error o una casilla vacía.","autoCrossOn":"Cruces automáticas activadas","autoCrossOff":"Cruces automáticas desactivadas","queenPlaced":"Se colocó una reina.","cellRevealed":"Se reveló una casilla.","digitRevealed":"Se reveló un dígito.","patchRevealed":"Se reveló una casilla de región.","finishedShare":"Terminado","dailyLabel":"Reto diario","backtrackFlag":"retroceso","hintFlag":"pista usada","closeHint":"Cerrar","hintMove":"Movimiento sugerido","hintWhy":"Por qué","noLogicalHint":"No se puede deducir directamente ningún movimiento del estado actual.","hintTimeout":"La búsqueda de pista alcanzó el límite de 5 segundos. No se encontró una pista fiable en ese tiempo.","hintSearching":"Buscando una pista…","hintPaused":"Reanuda la partida para pedir una pista.","hintError":"La búsqueda de pista no pudo completarse. Inténtalo de nuevo tras tu próximo movimiento.","dragHint":"Mover","rank1":"inferencia de rango 1","rank2":"inferencia de rango 2","rank3":"inferencia de rango 3","hintNoR0":"Rango 0: sin deducción directa.","hintNoR1":"Rango 1: ninguna suposición lleva inmediatamente a un callejón sin salida.","hintNoR2":"Rango 2: ninguna suposición lleva a un callejón sin salida en el nivel siguiente.","hintNoR3":"Rango 3: no se demostró ninguna contradicción forzada en tres niveles.","hypothesis":"Hipótesis","consequence":"Consecuencia","deadend":"Callejón sin salida","conclusion":"Conclusión","themeLabel":"Tema","soundsOn":"Sonidos activados","soundsOff":"Sonidos desactivados","resetDone":"Cuadrícula reiniciada.","patchAll":"Cada casilla debe pertenecer a una región.","patchEach":"Cada pista debe tener una región.","patchOwn":"Cada región debe contener su propia pista.","patchTwo":"Una región no puede contener dos pistas.","patchConnected":"Cada región debe ser contigua.","patchRect":"Cada región debe formar un rectángulo.","patchSize":"El tamaño de una región no coincide con su pista.","patchShape":"La forma de una región no coincide con su pista.","erase":"Borrar","regionSelection":"Selección de región","share":"Compartir","continue":"Continuar","resultCopied":"Resultado copiado","shareUnavailable":"Compartir no disponible","victoryKicker":"¡MUY BIEN!","actions":"Acciones","homeAria":"Inicio","changeTheme":"Cambiar tema","visibleOnly":"Deducido únicamente del estado visible.","directReason":"Este movimiento se deduce directamente de las restricciones visibles.","rank1Reason":"Las alternativas llevan inmediatamente a una contradicción.","rank2Reason":"Las alternativas fallan un nivel lógico más adelante.","rank3Reason":"Una comprobación limitada a tres niveles obliga a este movimiento.","placeQueen":"Coloca una reina","markX":"Marca X","placeSun":"Coloca un sol","placeMoon":"Coloca una luna","placeDigit":"Coloca el dígito","assignRegion":"Asigna a la región","rowLabel":"fila","columnLabel":"columna"}};
I18N.ar={...I18N.en,...{"easy":"سهل","medium":"متوسط","hard":"صعب","expert":"خبير","gameQueens":"تيجان","gameTango":"شمس-قمر","gameSudoku":"شبكة 6","gamePatches":"مستطيلات","newGame":"جديد","reset":"إعادة ضبط","pause":"إيقاف مؤقت","resume":"متابعة","check":"تحقق","hint":"تلميح","solution":"الحل","rules":"القواعد","back":"رجوع","play":"العب","generated":"مولّدة","score":"النتيجة","homeTitle":"أربع ألعاب.<br>استراحة منطقية واحدة.","homeSub":"أربع ألعاب منطقية مع توليد تلقائي ومؤقت وتحديات يومية وتتبع للتقدم. تعمل دون اتصال بعد التحميل الأول.","queensSub":"ملكة واحدة في كل صف وعمود ومنطقة.","tangoSub":"توازن الشمس/القمر والعلاقات.","sudokuSub":"6×6، صفوف وأعمدة ومناطق.","patchesSub":"أعد بناء جميع المناطق المستطيلة.","daily":"التحدي اليومي","dailySub":"مكتملة اليوم","stats":"الإحصاءات والتقدم","statsSub":"السجل والأرقام القياسية والسلاسل","prefs":"التفضيلات","prefsSub":"اللغة والمظهر والأصوات والبيانات المحلية","about":"حول","aboutSub":"الإصدار وحقوق النشر والترخيص","settingsSaved":"تم حفظ الإعدادات على هذا الجهاز.","language":"اللغة","languageSub":"10 لغات متاحة","theme":"المظهر","themeSub":"تلقائي أو فاتح أو داكن","auto":"تلقائي","light":"فاتح","dark":"داكن","sounds":"أصوات خفيفة","soundsSub":"الفوز وتنبيهات متفرقة","on":"مفعّلة","off":"معطّلة","data":"البيانات","dataSub":"تبقى الإحصاءات والتحديات والتفضيلات محلية.","info":"معلومات","localDataTitle":"البيانات المحلية","localData":"لا يتطلب QUADLUD حسابًا. تُحفظ الألعاب والإحصاءات والتحديات اليومية والتفضيلات في متصفح هذا الجهاز.","dailyLast":"آخر 28 يومًا","dailyNote":"ينتج كل تاريخ الألغاز الأربعة نفسها على جميع الأجهزة التي تستخدم هذا الإصدار. الصعوبة اليومية: متوسط.","finished":"مكتملة","statsLocal":"يُحفظ التقدم على هذا الجهاز فقط.","solved":"محلولة","success":"النجاح","avgTime":"متوسط الوقت","streak":"سلسلة الأيام","byGame":"حسب اللعبة","history":"السجل الأخير","record":"رقم قياسي","average":"متوسط","none":"لا توجد لعبة مكتملة بعد.","solvedStatus":"محلول","revealedStatus":"تم عرض الحل","abandonedStatus":"متروك","finishedStatus":"مكتمل","autoCross":"ضع علامات X تلقائيًا عند وضع ملكة","queensLegend":"انقر على الخلية للتبديل: فارغة ← X ← ملكة. اسحب على صف أو عمود لإضافة X؛ وابدأ من X لمسحها.","patchesLegend":"اسحب من زاوية إلى الزاوية المقابلة لرسم مستطيل أو تغيير حجمه. تُحدد المنطقة تلقائيًا عندما يحتوي المستطيل على تلميح واحد فقط. انقر على مستطيل موجود لحذفه.","zone":"منطقة","aboutTitle":"حول QUADLUD","version":"الإصدار","copyright":"حقوق النشر","license":"الترخيص","proprietary":"برنامج مملوك — جميع الحقوق محفوظة.","legal":"يُحظر النسخ أو التعديل أو إعادة التوزيع أو الاستغلال دون إذن كتابي مسبق من Serge Benoliel.","restored":"تمت استعادة اللعبة","generating":"جارٍ التوليد…","rulesTitle":"القواعد","where":"أين تنظر","logic":"المنطق","solutionShown":"تم عرض الحل","congrats":"أحسنت!","gridIncomplete":"لا يزال هناك خطأ أو خلية غير محلولة.","tangoIncomplete":"لا تزال الشبكة لا تحقق جميع القواعد.","sudokuIncomplete":"لا يزال هناك خطأ أو خلية فارغة.","autoCrossOn":"علامات X التلقائية مفعّلة","autoCrossOff":"علامات X التلقائية معطّلة","queenPlaced":"تم وضع ملكة.","cellRevealed":"تم كشف خلية.","digitRevealed":"تم كشف رقم.","patchRevealed":"تم كشف خلية من المنطقة.","finishedShare":"مكتمل","dailyLabel":"التحدي اليومي","backtrackFlag":"تراجع","hintFlag":"استُخدم تلميح","closeHint":"إغلاق","hintMove":"الحركة المقترحة","hintWhy":"لماذا","noLogicalHint":"لا يمكن استنتاج حركة مباشرة من الحالة الحالية.","hintTimeout":"بلغ البحث عن تلميح حد 5 ثوانٍ. لم يُعثر على تلميح موثوق خلال هذه المدة.","hintSearching":"جارٍ البحث عن تلميح…","hintPaused":"استأنف اللعبة لطلب تلميح.","hintError":"تعذر إكمال البحث عن تلميح. حاول مجددًا بعد حركتك التالية.","dragHint":"تحريك","rank1":"استدلال من المستوى 1","rank2":"استدلال من المستوى 2","rank3":"استدلال من المستوى 3","hintNoR0":"المستوى 0: لا يوجد استنتاج مباشر.","hintNoR1":"المستوى 1: لا يؤدي أي افتراض مباشرةً إلى طريق مسدود.","hintNoR2":"المستوى 2: لا يؤدي أي افتراض إلى طريق مسدود في المستوى التالي.","hintNoR3":"المستوى 3: لم يُثبت أي تناقض حتمي خلال ثلاثة مستويات.","hypothesis":"افتراض","consequence":"نتيجة","deadend":"طريق مسدود","conclusion":"خلاصة","themeLabel":"المظهر","soundsOn":"الأصوات مفعّلة","soundsOff":"الأصوات معطّلة","resetDone":"تمت إعادة ضبط الشبكة.","patchAll":"يجب أن تنتمي كل خلية إلى منطقة.","patchEach":"يجب أن يكون لكل تلميح منطقة.","patchOwn":"يجب أن تحتوي كل منطقة على تلميحها الخاص.","patchTwo":"لا يمكن أن تحتوي المنطقة على تلميحين.","patchConnected":"يجب أن تكون كل منطقة متصلة.","patchRect":"يجب أن تشكل كل منطقة مستطيلاً.","patchSize":"حجم المنطقة لا يطابق تلميحها.","patchShape":"شكل المنطقة لا يطابق تلميحها.","erase":"مسح","regionSelection":"اختيار المنطقة","share":"مشاركة","continue":"متابعة","resultCopied":"تم نسخ النتيجة","shareUnavailable":"المشاركة غير متاحة","victoryKicker":"أحسنت!","actions":"إجراءات","homeAria":"الرئيسية","changeTheme":"تغيير المظهر","visibleOnly":"مستنتج من الحالة الظاهرة فقط.","directReason":"تنتج هذه الحركة مباشرةً من القيود الظاهرة.","rank1Reason":"تؤدي البدائل فورًا إلى تناقض.","rank2Reason":"تفشل البدائل في المستوى المنطقي التالي.","rank3Reason":"يفرض فحص محدود إلى ثلاثة مستويات هذه الحركة.","placeQueen":"ضع ملكة","markX":"ضع علامة X","placeSun":"ضع شمسًا","placeMoon":"ضع قمرًا","placeDigit":"ضع الرقم","assignRegion":"أسند إلى المنطقة","rowLabel":"الصف","columnLabel":"العمود"}};
I18N.bn={...I18N.en,...{"easy":"সহজ","medium":"মাঝারি","hard":"কঠিন","expert":"বিশেষজ্ঞ","gameQueens":"মুকুট","gameTango":"সূর্য-চাঁদ","gameSudoku":"গ্রিড ৬","gamePatches":"আয়তক্ষেত্র","newGame":"নতুন","reset":"রিসেট","pause":"বিরতি","resume":"চালিয়ে যান","check":"যাচাই","hint":"ইঙ্গিত","solution":"সমাধান","rules":"নিয়ম","back":"ফিরুন","play":"খেলুন","generated":"তৈরি হয়েছে","score":"স্কোর","homeTitle":"চারটি খেলা।<br>একটি যুক্তির বিরতি।","homeSub":"স্বয়ংক্রিয় তৈরি, টাইমার, দৈনিক চ্যালেঞ্জ ও অগ্রগতি ট্র্যাকিংসহ চারটি যুক্তির খেলা। প্রথমবার লোডের পর অফলাইনে চলে।","queensSub":"প্রতি সারি, কলাম ও অঞ্চলে একটি রানি।","tangoSub":"সূর্য/চাঁদের ভারসাম্য ও সম্পর্ক।","sudokuSub":"৬×৬, সারি, কলাম ও অঞ্চল।","patchesSub":"সব আয়তাকার অঞ্চল পুনর্গঠন করুন।","daily":"দৈনিক চ্যালেঞ্জ","dailySub":"আজ সম্পন্ন","stats":"পরিসংখ্যান ও অগ্রগতি","statsSub":"ইতিহাস, রেকর্ড ও ধারাবাহিকতা","prefs":"পছন্দসমূহ","prefsSub":"ভাষা, থিম, শব্দ ও স্থানীয় ডেটা","about":"সম্পর্কে","aboutSub":"সংস্করণ, কপিরাইট ও লাইসেন্স","settingsSaved":"সেটিংস এই ডিভাইসে সংরক্ষিত হয়েছে।","language":"ভাষা","languageSub":"১০টি ভাষা উপলভ্য","theme":"থিম","themeSub":"স্বয়ংক্রিয়, হালকা বা গাঢ়","auto":"স্বয়ংক্রিয়","light":"হালকা","dark":"গাঢ়","sounds":"হালকা শব্দ","soundsSub":"জয় ও মাঝে মাঝে প্রতিক্রিয়া","on":"চালু","off":"বন্ধ","data":"ডেটা","dataSub":"পরিসংখ্যান, চ্যালেঞ্জ ও পছন্দ স্থানীয়ভাবেই থাকে।","info":"তথ্য","localDataTitle":"স্থানীয় ডেটা","localData":"QUADLUD-এর জন্য কোনো অ্যাকাউন্ট দরকার নেই। খেলা, পরিসংখ্যান, দৈনিক চ্যালেঞ্জ ও পছন্দ এই ডিভাইসের ব্রাউজারে সংরক্ষিত হয়।","dailyLast":"শেষ ২৮ দিন","dailyNote":"প্রতিটি তারিখে এই সংস্করণ ব্যবহারকারী সব ডিভাইসে একই চারটি গ্রিড তৈরি হয়। দৈনিক কঠিনতা: মাঝারি।","finished":"সম্পন্ন","statsLocal":"অগ্রগতি শুধু এই ডিভাইসে সংরক্ষিত হয়।","solved":"সমাধান করা","success":"সাফল্য","avgTime":"গড় সময়","streak":"দিনের ধারাবাহিকতা","byGame":"খেলা অনুযায়ী","history":"সাম্প্রতিক ইতিহাস","record":"রেকর্ড","average":"গড়","none":"এখনও কোনো খেলা সম্পন্ন হয়নি।","solvedStatus":"সমাধান","revealedStatus":"সমাধান দেখা হয়েছে","abandonedStatus":"ত্যাগ করা","finishedStatus":"সম্পন্ন","autoCross":"রানি বসালে স্বয়ংক্রিয়ভাবে X দিন","queensLegend":"ঘরে ট্যাপ করে খালি → X → রানি পরিবর্তন করুন। X যোগ করতে সারি বা কলাম বরাবর টানুন; মুছতে X থেকে শুরু করুন।","patchesLegend":"আয়তক্ষেত্র আঁকতে বা আকার বদলাতে এক কোণ থেকে বিপরীত কোণে টানুন। আয়তক্ষেত্রে একটি মাত্র ইঙ্গিত থাকলে অঞ্চলটি স্বয়ংক্রিয়ভাবে বেছে নেওয়া হয়। বিদ্যমান আয়তক্ষেত্রে ট্যাপ করে মুছুন।","zone":"অঞ্চল","aboutTitle":"QUADLUD সম্পর্কে","version":"সংস্করণ","copyright":"কপিরাইট","license":"লাইসেন্স","proprietary":"মালিকানাধীন সফটওয়্যার — সর্বস্বত্ব সংরক্ষিত।","legal":"Serge Benoliel-এর পূর্ব লিখিত অনুমতি ছাড়া কপি, পরিবর্তন, পুনর্বিতরণ বা ব্যবহার নিষিদ্ধ।","restored":"খেলা পুনরুদ্ধার হয়েছে","generating":"তৈরি হচ্ছে…","rulesTitle":"নিয়ম","where":"কোথায় দেখবেন","logic":"যুক্তি","solutionShown":"সমাধান দেখানো হয়েছে","congrats":"দারুণ!","gridIncomplete":"এখনও একটি ভুল বা অসমাধিত ঘর আছে।","tangoIncomplete":"গ্রিডটি এখনও সব নিয়ম পূরণ করছে না।","sudokuIncomplete":"এখনও একটি ভুল বা খালি ঘর আছে।","autoCrossOn":"স্বয়ংক্রিয় X চালু","autoCrossOff":"স্বয়ংক্রিয় X বন্ধ","queenPlaced":"একটি রানি বসানো হয়েছে।","cellRevealed":"একটি ঘর দেখানো হয়েছে।","digitRevealed":"একটি অঙ্ক দেখানো হয়েছে।","patchRevealed":"একটি অঞ্চলের ঘর দেখানো হয়েছে।","finishedShare":"সম্পন্ন","dailyLabel":"দৈনিক চ্যালেঞ্জ","backtrackFlag":"পিছিয়েছেন","hintFlag":"ইঙ্গিত ব্যবহার","closeHint":"বন্ধ","hintMove":"প্রস্তাবিত চাল","hintWhy":"কেন","noLogicalHint":"বর্তমান অবস্থা থেকে সরাসরি কোনো চাল নির্ণয় করা যাচ্ছে না।","hintTimeout":"ইঙ্গিত খোঁজা ৫ সেকেন্ডের সীমায় পৌঁছেছে। এই সময়ে নির্ভরযোগ্য ইঙ্গিত পাওয়া যায়নি।","hintSearching":"ইঙ্গিত খোঁজা হচ্ছে…","hintPaused":"ইঙ্গিত চাইতে খেলা চালিয়ে যান।","hintError":"ইঙ্গিত খোঁজা সম্পন্ন হয়নি। পরের চালের পর আবার চেষ্টা করুন।","dragHint":"সরান","rank1":"স্তর-১ অনুমান","rank2":"স্তর-২ অনুমান","rank3":"স্তর-৩ অনুমান","hintNoR0":"স্তর ০: সরাসরি কোনো সিদ্ধান্ত নেই।","hintNoR1":"স্তর ১: কোনো অনুমান সঙ্গে সঙ্গে অচল অবস্থায় নিয়ে যায় না।","hintNoR2":"স্তর ২: কোনো অনুমান পরের স্তরে অচল অবস্থায় নিয়ে যায় না।","hintNoR3":"স্তর ৩: তিন স্তরের মধ্যে কোনো বাধ্যতামূলক বিরোধ প্রমাণিত হয়নি।","hypothesis":"অনুমান","consequence":"ফলাফল","deadend":"অচল অবস্থা","conclusion":"উপসংহার","themeLabel":"থিম","soundsOn":"শব্দ চালু","soundsOff":"শব্দ বন্ধ","resetDone":"গ্রিড রিসেট হয়েছে।","patchAll":"প্রতিটি ঘরকে একটি অঞ্চলের অংশ হতে হবে।","patchEach":"প্রতিটি ইঙ্গিতের একটি অঞ্চল থাকতে হবে।","patchOwn":"প্রতিটি অঞ্চলে তার নিজস্ব ইঙ্গিত থাকতে হবে।","patchTwo":"একটি অঞ্চলে দুটি ইঙ্গিত থাকতে পারে না।","patchConnected":"প্রতিটি অঞ্চল সংযুক্ত হতে হবে।","patchRect":"প্রতিটি অঞ্চল আয়তক্ষেত্র হতে হবে।","patchSize":"অঞ্চলের আকার ইঙ্গিতের সঙ্গে মেলে না।","patchShape":"অঞ্চলের আকৃতি ইঙ্গিতের সঙ্গে মেলে না।","erase":"মুছুন","regionSelection":"অঞ্চল নির্বাচন","share":"শেয়ার","continue":"চালিয়ে যান","resultCopied":"ফলাফল কপি হয়েছে","shareUnavailable":"শেয়ার করা সম্ভব নয়","victoryKicker":"দারুণ!","actions":"কাজ","homeAria":"হোম","changeTheme":"থিম পরিবর্তন","visibleOnly":"শুধু দৃশ্যমান অবস্থা থেকে নির্ণীত।","directReason":"এই চালটি দৃশ্যমান নিয়ম থেকেই সরাসরি পাওয়া যায়।","rank1Reason":"অন্য বিকল্পগুলো সঙ্গে সঙ্গে বিরোধ তৈরি করে।","rank2Reason":"অন্য বিকল্পগুলো পরের যুক্তির স্তরে ব্যর্থ হয়।","rank3Reason":"তিন স্তর পর্যন্ত সীমিত পরীক্ষা এই চালটিকে বাধ্যতামূলক করে।","placeQueen":"রানি বসান","markX":"X দিন","placeSun":"সূর্য বসান","placeMoon":"চাঁদ বসান","placeDigit":"অঙ্ক বসান","assignRegion":"অঞ্চলে দিন","rowLabel":"সারি","columnLabel":"কলাম"}};
I18N.pt={...I18N.en,...{"easy":"Fácil","medium":"Médio","hard":"Difícil","expert":"Especialista","gameQueens":"Coroas","gameTango":"Sol-Lua","gameSudoku":"Grade 6","gamePatches":"Retângulos","newGame":"Novo","reset":"Reiniciar","pause":"Pausa","resume":"Retomar","check":"Verificar","hint":"Dica","solution":"Solução","rules":"Regras","back":"Voltar","play":"Jogar","generated":"gerado","score":"pontuação","homeTitle":"Quatro jogos.<br>Uma pausa de lógica.","homeSub":"Quatro jogos de lógica com geração, cronômetro, desafios diários e acompanhamento do progresso. Funciona offline após o primeiro carregamento.","queensSub":"Uma rainha por linha, coluna e região.","tangoSub":"Equilíbrio Sol/Lua e relações.","sudokuSub":"6×6, linhas, colunas e regiões.","patchesSub":"Reconstrua todas as regiões retangulares.","daily":"Desafio diário","dailySub":"concluídos hoje","stats":"Estatísticas e progresso","statsSub":"Histórico, recordes e sequências","prefs":"Preferências","prefsSub":"Idioma, tema, sons e dados locais","about":"Sobre","aboutSub":"Versão, copyright e licença","settingsSaved":"Configurações salvas neste dispositivo.","language":"Idioma","languageSub":"10 idiomas disponíveis","theme":"Tema","themeSub":"Automático, claro ou escuro","auto":"Automático","light":"Claro","dark":"Escuro","sounds":"Sons discretos","soundsSub":"Vitória e avisos ocasionais","on":"Ativados","off":"Desativados","data":"Dados","dataSub":"Estatísticas, desafios e preferências permanecem locais.","info":"Info","localDataTitle":"Dados locais","localData":"QUADLUD não exige conta. Jogos, estatísticas, desafios diários e preferências são armazenados no navegador deste dispositivo.","dailyLast":"Últimos 28 dias","dailyNote":"Cada data produz as mesmas quatro grades em todos os dispositivos que usam esta versão. Dificuldade diária: Médio.","finished":"concluídos","statsLocal":"O progresso é armazenado apenas neste dispositivo.","solved":"resolvidos","success":"sucesso","avgTime":"tempo médio","streak":"sequência de dias","byGame":"Por jogo","history":"Histórico recente","record":"recorde","average":"média","none":"Nenhum jogo concluído ainda.","solvedStatus":"Resolvido","revealedStatus":"Solução vista","abandonedStatus":"Abandonado","finishedStatus":"Concluído","autoCross":"Marcar X automaticamente ao colocar uma rainha","queensLegend":"Toque numa célula para alternar vazia → X → rainha. Arraste por uma linha ou coluna para adicionar X; comece sobre um X para apagar.","patchesLegend":"Arraste de um canto ao canto oposto para desenhar ou redimensionar um retângulo. A região é selecionada automaticamente quando contém uma única pista. Toque num retângulo existente para removê-lo.","zone":"Região","aboutTitle":"Sobre o QUADLUD","version":"Versão","copyright":"Copyright","license":"Licença","proprietary":"Software proprietário — Todos os direitos reservados.","legal":"É proibida a cópia, modificação, redistribuição ou exploração sem autorização prévia por escrito de Serge Benoliel.","restored":"Jogo restaurado","generating":"Gerando…","rulesTitle":"Regras","where":"Onde olhar","logic":"Lógica","solutionShown":"Solução exibida","congrats":"Muito bem!","gridIncomplete":"Ainda há um erro ou uma célula não resolvida.","tangoIncomplete":"A grade ainda não cumpre todas as regras.","sudokuIncomplete":"Ainda há um erro ou uma célula vazia.","autoCrossOn":"X automáticos ativados","autoCrossOff":"X automáticos desativados","queenPlaced":"Uma rainha foi colocada.","cellRevealed":"Uma célula foi revelada.","digitRevealed":"Um dígito foi revelado.","patchRevealed":"Uma célula da região foi revelada.","finishedShare":"Concluído","dailyLabel":"Desafio diário","backtrackFlag":"retrocesso","hintFlag":"dica usada","closeHint":"Fechar","hintMove":"Jogada sugerida","hintWhy":"Por quê","noLogicalHint":"Nenhuma jogada pode ser deduzida diretamente do estado atual.","hintTimeout":"A busca de dica atingiu o limite de 5 segundos. Nenhuma dica confiável foi encontrada nesse tempo.","hintSearching":"Procurando uma dica…","hintPaused":"Retome o jogo para pedir uma dica.","hintError":"A busca de dica não pôde ser concluída. Tente novamente após sua próxima jogada.","dragHint":"Mover","rank1":"inferência de nível 1","rank2":"inferência de nível 2","rank3":"inferência de nível 3","hintNoR0":"Nível 0: nenhuma dedução direta.","hintNoR1":"Nível 1: nenhuma hipótese leva imediatamente a um impasse.","hintNoR2":"Nível 2: nenhuma hipótese leva a um impasse no nível seguinte.","hintNoR3":"Nível 3: nenhuma contradição forçada foi provada em três níveis.","hypothesis":"Hipótese","consequence":"Consequência","deadend":"Impasse","conclusion":"Conclusão","themeLabel":"Tema","soundsOn":"Sons ativados","soundsOff":"Sons desativados","resetDone":"Grade reiniciada.","patchAll":"Toda célula deve pertencer a uma região.","patchEach":"Toda pista deve ter uma região.","patchOwn":"Cada região deve conter sua própria pista.","patchTwo":"Uma região não pode conter duas pistas.","patchConnected":"Cada região deve ser conectada.","patchRect":"Cada região deve formar um retângulo.","patchSize":"O tamanho de uma região não corresponde à pista.","patchShape":"A forma de uma região não corresponde à pista.","erase":"Apagar","regionSelection":"Seleção de região","share":"Compartilhar","continue":"Continuar","resultCopied":"Resultado copiado","shareUnavailable":"Compartilhamento indisponível","victoryKicker":"MUITO BEM!","actions":"Ações","homeAria":"Início","changeTheme":"Mudar tema","visibleOnly":"Deducido apenas do estado visível.","directReason":"Esta jogada decorre diretamente das restrições visíveis.","rank1Reason":"As alternativas levam imediatamente a uma contradição.","rank2Reason":"As alternativas falham um nível lógico adiante.","rank3Reason":"Uma verificação limitada a três níveis força esta jogada.","placeQueen":"Coloque uma rainha","markX":"Marque X","placeSun":"Coloque um sol","placeMoon":"Coloque uma lua","placeDigit":"Coloque o dígito","assignRegion":"Atribua à região","rowLabel":"linha","columnLabel":"coluna"}};
I18N.id={...I18N.en,...{"easy":"Mudah","medium":"Sedang","hard":"Sulit","expert":"Ahli","gameQueens":"Mahkota","gameTango":"Matahari-Bulan","gameSudoku":"Grid 6","gamePatches":"Persegi Panjang","newGame":"Baru","reset":"Atur ulang","pause":"Jeda","resume":"Lanjutkan","check":"Periksa","hint":"Petunjuk","solution":"Solusi","rules":"Aturan","back":"Kembali","play":"Main","generated":"dibuat","score":"skor","homeTitle":"Empat permainan.<br>Satu jeda logika.","homeSub":"Empat permainan logika dengan pembuatan otomatis, timer, tantangan harian, dan pelacakan progres. Dapat digunakan offline setelah pemuatan pertama.","queensSub":"Satu ratu per baris, kolom, dan wilayah.","tangoSub":"Keseimbangan Matahari/Bulan dan relasi.","sudokuSub":"6×6, baris, kolom, dan wilayah.","patchesSub":"Bangun kembali semua wilayah persegi panjang.","daily":"Tantangan harian","dailySub":"selesai hari ini","stats":"Statistik & progres","statsSub":"Riwayat, rekor, dan rentetan","prefs":"Preferensi","prefsSub":"Bahasa, tema, suara, dan data lokal","about":"Tentang","aboutSub":"Versi, hak cipta, dan lisensi","settingsSaved":"Pengaturan disimpan di perangkat ini.","language":"Bahasa","languageSub":"10 bahasa tersedia","theme":"Tema","themeSub":"Otomatis, terang, atau gelap","auto":"Otomatis","light":"Terang","dark":"Gelap","sounds":"Suara halus","soundsSub":"Kemenangan dan umpan balik sesekali","on":"Aktif","off":"Nonaktif","data":"Data","dataSub":"Statistik, tantangan, dan preferensi tetap tersimpan lokal.","info":"Info","localDataTitle":"Data lokal","localData":"QUADLUD tidak memerlukan akun. Permainan, statistik, tantangan harian, dan preferensi disimpan di browser perangkat ini.","dailyLast":"28 hari terakhir","dailyNote":"Setiap tanggal menghasilkan empat grid yang sama pada semua perangkat dengan versi ini. Tingkat kesulitan harian: Sedang.","finished":"selesai","statsLocal":"Progres hanya disimpan di perangkat ini.","solved":"terselesaikan","success":"keberhasilan","avgTime":"waktu rata-rata","streak":"rentetan hari","byGame":"Per permainan","history":"Riwayat terbaru","record":"rekor","average":"rata-rata","none":"Belum ada permainan yang selesai.","solvedStatus":"Selesai","revealedStatus":"Solusi dilihat","abandonedStatus":"Ditinggalkan","finishedStatus":"Selesai","autoCross":"Tandai X otomatis saat menempatkan ratu","queensLegend":"Ketuk sel untuk berganti kosong → X → ratu. Seret sepanjang baris atau kolom untuk menambah X; mulai dari X untuk menghapusnya.","patchesLegend":"Seret dari satu sudut ke sudut berlawanan untuk menggambar atau mengubah ukuran persegi panjang. Wilayah dipilih otomatis bila persegi panjang berisi satu petunjuk. Ketuk persegi panjang yang ada untuk menghapusnya.","zone":"Wilayah","aboutTitle":"Tentang QUADLUD","version":"Versi","copyright":"Hak cipta","license":"Lisensi","proprietary":"Perangkat lunak proprietari — Semua hak dilindungi.","legal":"Penyalinan, modifikasi, redistribusi, dan eksploitasi tanpa izin tertulis sebelumnya dari Serge Benoliel dilarang.","restored":"Permainan dipulihkan","generating":"Membuat…","rulesTitle":"Aturan","where":"Di mana melihat","logic":"Logika","solutionShown":"Solusi ditampilkan","congrats":"Bagus!","gridIncomplete":"Masih ada kesalahan atau sel yang belum diselesaikan.","tangoIncomplete":"Grid belum memenuhi semua aturan.","sudokuIncomplete":"Masih ada kesalahan atau sel kosong.","autoCrossOn":"X otomatis aktif","autoCrossOff":"X otomatis nonaktif","queenPlaced":"Ratu ditempatkan.","cellRevealed":"Sebuah sel dibuka.","digitRevealed":"Sebuah angka dibuka.","patchRevealed":"Sebuah sel wilayah dibuka.","finishedShare":"Selesai","dailyLabel":"Tantangan harian","backtrackFlag":"mundur","hintFlag":"petunjuk digunakan","closeHint":"Tutup","hintMove":"Langkah yang disarankan","hintWhy":"Mengapa","noLogicalHint":"Tidak ada langkah yang dapat disimpulkan langsung dari keadaan saat ini.","hintTimeout":"Pencarian petunjuk mencapai batas 5 detik. Tidak ada petunjuk andal yang ditemukan dalam waktu tersebut.","hintSearching":"Mencari petunjuk…","hintPaused":"Lanjutkan permainan untuk meminta petunjuk.","hintError":"Pencarian petunjuk tidak dapat diselesaikan. Coba lagi setelah langkah berikutnya.","dragHint":"Pindah","rank1":"inferensi tingkat 1","rank2":"inferensi tingkat 2","rank3":"inferensi tingkat 3","hintNoR0":"Tingkat 0: tidak ada deduksi langsung.","hintNoR1":"Tingkat 1: tidak ada asumsi yang langsung berujung buntu.","hintNoR2":"Tingkat 2: tidak ada asumsi yang berujung buntu pada tingkat berikutnya.","hintNoR3":"Tingkat 3: tidak ada kontradiksi paksa yang terbukti dalam tiga tingkat.","hypothesis":"Hipotesis","consequence":"Konsekuensi","deadend":"Jalan buntu","conclusion":"Kesimpulan","themeLabel":"Tema","soundsOn":"Suara aktif","soundsOff":"Suara nonaktif","resetDone":"Grid diatur ulang.","patchAll":"Setiap sel harus termasuk dalam suatu wilayah.","patchEach":"Setiap petunjuk harus memiliki wilayah.","patchOwn":"Setiap wilayah harus berisi petunjuknya sendiri.","patchTwo":"Satu wilayah tidak boleh berisi dua petunjuk.","patchConnected":"Setiap wilayah harus tersambung.","patchRect":"Setiap wilayah harus berbentuk persegi panjang.","patchSize":"Ukuran wilayah tidak sesuai dengan petunjuk.","patchShape":"Bentuk wilayah tidak sesuai dengan petunjuk.","erase":"Hapus","regionSelection":"Pemilihan wilayah","share":"Bagikan","continue":"Lanjutkan","resultCopied":"Hasil disalin","shareUnavailable":"Berbagi tidak tersedia","victoryKicker":"BAGUS!","actions":"Tindakan","homeAria":"Beranda","changeTheme":"Ubah tema","visibleOnly":"Disimpulkan hanya dari keadaan yang terlihat.","directReason":"Langkah ini langsung mengikuti batasan yang terlihat.","rank1Reason":"Alternatif langsung menghasilkan kontradiksi.","rank2Reason":"Alternatif gagal satu tingkat logika lebih dalam.","rank3Reason":"Pemeriksaan terbatas tiga tingkat memaksa langkah ini.","placeQueen":"Tempatkan ratu","markX":"Tandai X","placeSun":"Tempatkan matahari","placeMoon":"Tempatkan bulan","placeDigit":"Tempatkan angka","assignRegion":"Tetapkan ke wilayah","rowLabel":"baris","columnLabel":"kolom"}};
I18N.ur={...I18N.en,...{"easy":"آسان","medium":"درمیانہ","hard":"مشکل","expert":"ماہر","gameQueens":"تاج","gameTango":"سورج-چاند","gameSudoku":"گرڈ 6","gamePatches":"مستطیل","newGame":"نیا","reset":"ری سیٹ","pause":"وقفہ","resume":"جاری رکھیں","check":"جانچیں","hint":"اشارہ","solution":"حل","rules":"قواعد","back":"واپس","play":"کھیلیں","generated":"تیار شدہ","score":"اسکور","homeTitle":"چار کھیل۔<br>ایک منطقی وقفہ۔","homeSub":"خودکار تیاری، ٹائمر، روزانہ چیلنجز اور پیش رفت کے ریکارڈ کے ساتھ چار منطقی کھیل۔ پہلی بار لوڈ ہونے کے بعد آف لائن بھی چلتا ہے۔","queensSub":"ہر قطار، کالم اور علاقے میں ایک ملکہ۔","tangoSub":"سورج/چاند کا توازن اور تعلقات۔","sudokuSub":"6×6، قطاریں، کالم اور علاقے۔","patchesSub":"تمام مستطیل علاقوں کو دوبارہ بنائیں۔","daily":"روزانہ چیلنج","dailySub":"آج مکمل","stats":"اعداد و شمار اور پیش رفت","statsSub":"تاریخ، ریکارڈ اور سلسلے","prefs":"ترجیحات","prefsSub":"زبان، تھیم، آوازیں اور مقامی ڈیٹا","about":"متعلق","aboutSub":"ورژن، کاپی رائٹ اور لائسنس","settingsSaved":"ترتیبات اس ڈیوائس پر محفوظ ہو گئی ہیں۔","language":"زبان","languageSub":"10 زبانیں دستیاب","theme":"تھیم","themeSub":"خودکار، روشن یا تاریک","auto":"خودکار","light":"روشن","dark":"تاریک","sounds":"ہلکی آوازیں","soundsSub":"جیت اور کبھی کبھار فیڈبیک","on":"چالو","off":"بند","data":"ڈیٹا","dataSub":"اعداد و شمار، چیلنجز اور ترجیحات مقامی رہتی ہیں۔","info":"معلومات","localDataTitle":"مقامی ڈیٹا","localData":"QUADLUD کے لیے اکاؤنٹ درکار نہیں۔ کھیل، اعداد و شمار، روزانہ چیلنجز اور ترجیحات اسی ڈیوائس کے براؤزر میں محفوظ ہوتے ہیں۔","dailyLast":"گزشتہ 28 دن","dailyNote":"ہر تاریخ اس ورژن والے تمام ڈیوائسز پر وہی چار گرڈ بناتی ہے۔ روزانہ مشکل: درمیانہ۔","finished":"مکمل","statsLocal":"پیش رفت صرف اسی ڈیوائس پر محفوظ ہوتی ہے۔","solved":"حل شدہ","success":"کامیابی","avgTime":"اوسط وقت","streak":"مسلسل دن","byGame":"کھیل کے لحاظ سے","history":"حالیہ تاریخ","record":"ریکارڈ","average":"اوسط","none":"ابھی کوئی کھیل مکمل نہیں ہوا۔","solvedStatus":"حل شدہ","revealedStatus":"حل دیکھا گیا","abandonedStatus":"چھوڑ دیا","finishedStatus":"مکمل","autoCross":"ملکہ رکھنے پر X خودکار لگائیں","queensLegend":"خانے پر ٹیپ کرکے خالی → X → ملکہ تبدیل کریں۔ X شامل کرنے کے لیے قطار یا کالم میں ڈریگ کریں؛ مٹانے کے لیے X سے شروع کریں۔","patchesLegend":"مستطیل بنانے یا اس کا سائز بدلنے کے لیے ایک کونے سے مخالف کونے تک ڈریگ کریں۔ مستطیل میں صرف ایک اشارہ ہو تو علاقہ خودکار منتخب ہوتا ہے۔ موجودہ مستطیل پر ٹیپ کرکے اسے حذف کریں۔","zone":"علاقہ","aboutTitle":"QUADLUD کے بارے میں","version":"ورژن","copyright":"کاپی رائٹ","license":"لائسنس","proprietary":"ملکیتی سافٹ ویئر — تمام حقوق محفوظ ہیں۔","legal":"Serge Benoliel کی پیشگی تحریری اجازت کے بغیر نقل، ترمیم، دوبارہ تقسیم یا استعمال ممنوع ہے۔","restored":"کھیل بحال ہو گیا","generating":"تیار ہو رہا ہے…","rulesTitle":"قواعد","where":"کہاں دیکھیں","logic":"منطق","solutionShown":"حل دکھایا گیا","congrats":"شاباش!","gridIncomplete":"ابھی بھی کوئی غلطی یا حل نہ ہوا خانہ موجود ہے۔","tangoIncomplete":"گرڈ ابھی تمام قواعد پورے نہیں کرتا۔","sudokuIncomplete":"ابھی بھی کوئی غلطی یا خالی خانہ موجود ہے۔","autoCrossOn":"خودکار X چالو","autoCrossOff":"خودکار X بند","queenPlaced":"ایک ملکہ رکھی گئی۔","cellRevealed":"ایک خانہ دکھایا گیا۔","digitRevealed":"ایک ہندسہ دکھایا گیا۔","patchRevealed":"علاقے کا ایک خانہ دکھایا گیا۔","finishedShare":"مکمل","dailyLabel":"روزانہ چیلنج","backtrackFlag":"واپسی کی","hintFlag":"اشارہ استعمال ہوا","closeHint":"بند کریں","hintMove":"تجویز کردہ چال","hintWhy":"کیوں","noLogicalHint":"موجودہ حالت سے براہ راست کوئی چال اخذ نہیں کی جا سکتی۔","hintTimeout":"اشارہ تلاش 5 سیکنڈ کی حد تک پہنچ گئی۔ اس وقت میں قابل اعتماد اشارہ نہیں ملا۔","hintSearching":"اشارہ تلاش کیا جا رہا ہے…","hintPaused":"اشارہ مانگنے کے لیے کھیل جاری رکھیں۔","hintError":"اشارہ تلاش مکمل نہیں ہو سکی۔ اگلی چال کے بعد دوبارہ کوشش کریں۔","dragHint":"منتقل کریں","rank1":"درجہ 1 استدلال","rank2":"درجہ 2 استدلال","rank3":"درجہ 3 استدلال","hintNoR0":"درجہ 0: کوئی براہ راست نتیجہ نہیں۔","hintNoR1":"درجہ 1: کوئی مفروضہ فوراً بند راستے تک نہیں لے جاتا۔","hintNoR2":"درجہ 2: کوئی مفروضہ اگلے درجے پر بند راستے تک نہیں لے جاتا۔","hintNoR3":"درجہ 3: تین درجوں میں کوئی لازمی تضاد ثابت نہیں ہوا۔","hypothesis":"مفروضہ","consequence":"نتیجہ","deadend":"بند راستہ","conclusion":"نتیجہ اخذ","themeLabel":"تھیم","soundsOn":"آوازیں چالو","soundsOff":"آوازیں بند","resetDone":"گرڈ ری سیٹ ہو گیا۔","patchAll":"ہر خانے کو کسی علاقے کا حصہ ہونا چاہیے۔","patchEach":"ہر اشارے کا ایک علاقہ ہونا چاہیے۔","patchOwn":"ہر علاقے میں اس کا اپنا اشارہ ہونا چاہیے۔","patchTwo":"ایک علاقے میں دو اشارے نہیں ہو سکتے۔","patchConnected":"ہر علاقہ جڑا ہوا ہونا چاہیے۔","patchRect":"ہر علاقہ مستطیل ہونا چاہیے۔","patchSize":"علاقے کا سائز اشارے سے میل نہیں کھاتا۔","patchShape":"علاقے کی شکل اشارے سے میل نہیں کھاتی۔","erase":"مٹائیں","regionSelection":"علاقہ منتخب کریں","share":"شیئر کریں","continue":"جاری رکھیں","resultCopied":"نتیجہ کاپی ہو گیا","shareUnavailable":"شیئرنگ دستیاب نہیں","victoryKicker":"شاباش!","actions":"اقدامات","homeAria":"ہوم","changeTheme":"تھیم بدلیں","visibleOnly":"صرف نظر آنے والی حالت سے اخذ کیا گیا۔","directReason":"یہ چال نظر آنے والی پابندیوں سے براہ راست نکلتی ہے۔","rank1Reason":"دوسرے امکانات فوراً تضاد پیدا کرتے ہیں۔","rank2Reason":"دوسرے امکانات اگلے منطقی درجے پر ناکام ہوتے ہیں۔","rank3Reason":"تین درجوں تک محدود جانچ اس چال کو لازم کرتی ہے۔","placeQueen":"ملکہ رکھیں","markX":"X لگائیں","placeSun":"سورج رکھیں","placeMoon":"چاند رکھیں","placeDigit":"ہندسہ رکھیں","assignRegion":"علاقے میں دیں","rowLabel":"قطار","columnLabel":"کالم"}};
/* v2.10.0 — 24 official EU languages / 30 total languages */
I18N.bg={...I18N.en,...{"easy":"Лесно","medium":"Средно","hard":"Трудно","expert":"Експерт","gameQueens":"Корони","gameTango":"Слънце-Луна","gameSudoku":"Мрежа 6","gamePatches":"Правоъгълници","newGame":"Нова","reset":"Нулирай","pause":"Пауза","resume":"Продължи","check":"Провери","hint":"Подсказка","solution":"Решение","rules":"Правила","back":"Назад","play":"Играй","generated":"генерирана","score":"точки","homeTitle":"Четири игри.<br>Логическа пауза.","homeSub":"Четири логически игри с генериране, таймер, дневни предизвикателства и прогрес. Работят офлайн след първото зареждане.","queensSub":"Една царица на всеки ред, колона и област.","tangoSub":"Балансирай Слънце/Луна и връзките.","sudokuSub":"6×6, редове, колони и области.","patchesSub":"Възстанови всички правоъгълни области.","daily":"Дневно предизвикателство","dailySub":"завършени днес","stats":"Статистика и прогрес","statsSub":"История, рекорди и серии","prefs":"Настройки","prefsSub":"Език, тема, звуци и локални данни","about":"За приложението","aboutSub":"Версия, авторски права и лиценз","settingsSaved":"Настройките са запазени на това устройство.","language":"Език","languageSub":"Налични са 30 езика","theme":"Тема","themeSub":"Автоматична, светла или тъмна","auto":"Автоматична","light":"Светла","dark":"Тъмна","sounds":"Ненатрапчиви звуци","soundsSub":"Победа и случайна обратна връзка","on":"Вкл.","off":"Изкл.","data":"Данни","dataSub":"Статистиката, предизвикателствата и настройките остават локални.","info":"Инфо","localDataTitle":"Локални данни","localData":"QUADLUD не изисква акаунт. Игрите, статистиката, дневните предизвикателства и настройките се съхраняват в браузъра на това устройство.","dailyLast":"Последните 28 дни","dailyNote":"Всяка дата създава едни и същи четири пъзела на всички устройства с тази версия. Дневна трудност: Средно.","finished":"завършени","statsLocal":"Прогресът се съхранява само на това устройство.","solved":"решени","success":"успех","avgTime":"средно време","streak":"серия от дни","byGame":"По игра","history":"Скорошна история","record":"рекорд","average":"средно","none":"Все още няма завършени игри.","solvedStatus":"Решено","revealedStatus":"Решението е показано","abandonedStatus":"Изоставено","finishedStatus":"Завършено","autoCross":"Автоматично отбелязвай X при поставяне на царица","queensLegend":"Докосни клетка за празно → X → царица. Плъзни по ред или колона, за да добавяш X; започни върху X, за да ги изтриваш.","patchesLegend":"Плъзни от единия ъгъл до противоположния, за да начертаеш или промениш правоъгълник. Ако съдържа точно една подсказка, областта се избира автоматично. Докосни съществуващ правоъгълник, за да го премахнеш.","zone":"Област","aboutTitle":"За QUADLUD","version":"Версия","copyright":"Авторски права","license":"Лиценз","proprietary":"Собственически софтуер — Всички права запазени.","legal":"Копиране, промяна, разпространение или използване без предварително писмено разрешение от Serge Benoliel е забранено.","restored":"Играта е възстановена","generating":"Генериране…","rulesTitle":"Правила","where":"Къде да гледаш","logic":"Логика","solutionShown":"Решението е показано","congrats":"Браво!","gridIncomplete":"Все още има грешка или нерешена клетка.","tangoIncomplete":"Мрежата все още не изпълнява всички правила.","sudokuIncomplete":"Все още има грешка или празна клетка.","autoCrossOn":"Автоматичните X са включени","autoCrossOff":"Автоматичните X са изключени","queenPlaced":"Поставена е царица.","cellRevealed":"Разкрита е клетка.","digitRevealed":"Разкрита е цифра.","patchRevealed":"Разкрита е клетка от област.","finishedShare":"Завършено","dailyLabel":"Дневно предизвикателство","backtrackFlag":"върнат ход","hintFlag":"използвана подсказка","closeHint":"Затвори","hintMove":"Предложен ход","hintWhy":"Защо","noLogicalHint":"От текущото състояние не може директно да се изведе ход.","hintTimeout":"Търсенето на подсказка достигна лимита от 5 секунди. Не бе намерена надеждна подсказка.","hintSearching":"Търсене на подсказка…","hintPaused":"Продължи играта, за да поискаш подсказка.","hintError":"Търсенето не можа да завърши. Опитай отново след следващия ход.","dragHint":"Премести","rank1":"извод ниво 1","rank2":"извод ниво 2","rank3":"извод ниво 3","hintNoR0":"Ниво 0: няма директен извод.","hintNoR1":"Ниво 1: никое предположение не води веднага до задънена улица.","hintNoR2":"Ниво 2: никое предположение не води до задънена улица на следващото ниво.","hintNoR3":"Ниво 3: в рамките на три нива не е доказано принудително противоречие.","hypothesis":"Предположение","consequence":"Последица","deadend":"Задънена улица","conclusion":"Заключение","themeLabel":"Тема","soundsOn":"Звуците са включени","soundsOff":"Звуците са изключени","resetDone":"Мрежата е нулирана.","patchAll":"Всяка клетка трябва да принадлежи на област.","patchEach":"Всяка подсказка трябва да има област.","patchOwn":"Всяка област трябва да съдържа собствената си подсказка.","patchTwo":"Една област не може да съдържа две подсказки.","patchConnected":"Всяка област трябва да е свързана.","patchRect":"Всяка област трябва да образува правоъгълник.","patchSize":"Размерът на областта не съответства на подсказката.","patchShape":"Формата на областта не съответства на подсказката.","erase":"Изтрий","regionSelection":"Избор на област","share":"Сподели","continue":"Продължи","resultCopied":"Резултатът е копиран","shareUnavailable":"Споделянето не е налично","victoryKicker":"БРАВО","actions":"Действия","homeAria":"Начало","changeTheme":"Смени темата","visibleOnly":"Изведено само от видимото състояние.","directReason":"Този ход следва директно от видимите ограничения.","rank1Reason":"Другите възможности веднага водят до противоречие.","rank2Reason":"Другите възможности се провалят едно логическо ниво по-дълбоко.","rank3Reason":"Ограничена проверка до три нива налага този ход.","placeQueen":"Постави царица","markX":"Отбележи X","placeSun":"Постави слънце","placeMoon":"Постави луна","placeDigit":"Въведи цифра","assignRegion":"Задай към област","rowLabel":"ред","columnLabel":"колона"}};
I18N.hr={...I18N.en,...{"easy":"Lako","medium":"Srednje","hard":"Teško","expert":"Stručnjak","gameQueens":"Krune","gameTango":"Sunce-Mjesec","gameSudoku":"Mreža 6","gamePatches":"Pravokutnici","newGame":"Nova","reset":"Ponovno postavi","pause":"Pauza","resume":"Nastavi","check":"Provjeri","hint":"Savjet","solution":"Rješenje","rules":"Pravila","back":"Natrag","play":"Igraj","generated":"generirana","score":"rezultat","homeTitle":"Četiri igre.<br>Logička pauza.","homeSub":"Četiri logičke igre s generiranjem, štopericom, dnevnim izazovima i napretkom. Nakon prvog učitavanja rade izvan mreže.","queensSub":"Jedna kraljica u svakom retku, stupcu i području.","tangoSub":"Uravnoteži Sunce/Mjesec i odnose.","sudokuSub":"6×6, retci, stupci i područja.","patchesSub":"Obnovi sva pravokutna područja.","daily":"Dnevni izazov","dailySub":"danas završeno","stats":"Statistika i napredak","statsSub":"Povijest, rekordi i nizovi","prefs":"Postavke","prefsSub":"Jezik, tema, zvukovi i lokalni podaci","about":"O aplikaciji","aboutSub":"Verzija, autorska prava i licenca","settingsSaved":"Postavke su spremljene na ovom uređaju.","language":"Jezik","languageSub":"Dostupno 30 jezika","theme":"Tema","themeSub":"Automatska, svijetla ili tamna","auto":"Automatska","light":"Svijetla","dark":"Tamna","sounds":"Diskretni zvukovi","soundsSub":"Pobjeda i povremena povratna informacija","on":"Uklj.","off":"Isklj.","data":"Podaci","dataSub":"Statistika, izazovi i postavke ostaju lokalni.","info":"Info","localDataTitle":"Lokalni podaci","localData":"QUADLUD ne zahtijeva račun. Igre, statistika, dnevni izazovi i postavke pohranjuju se u pregledniku ovog uređaja.","dailyLast":"Posljednjih 28 dana","dailyNote":"Svaki datum daje iste četiri zagonetke na svim uređajima s ovom verzijom. Dnevna težina: Srednje.","finished":"završeno","statsLocal":"Napredak se pohranjuje samo na ovom uređaju.","solved":"riješeno","success":"uspjeh","avgTime":"prosječno vrijeme","streak":"niz dana","byGame":"Po igri","history":"Nedavna povijest","record":"rekord","average":"prosjek","none":"Još nema završenih igara.","solvedStatus":"Riješeno","revealedStatus":"Rješenje prikazano","abandonedStatus":"Odustano","finishedStatus":"Završeno","autoCross":"Automatski označi X kad postavim kraljicu","queensLegend":"Dodirni polje za prazno → X → kraljica. Povuci po retku ili stupcu za dodavanje X; kreni s X za brisanje.","patchesLegend":"Povuci iz jednog kuta u suprotni da nacrtaš ili promijeniš pravokutnik. Ako sadrži točno jedan trag, područje se odabire automatski. Dodirni postojeći pravokutnik za brisanje.","zone":"Područje","aboutTitle":"O QUADLUD","version":"Verzija","copyright":"Autorska prava","license":"Licenca","proprietary":"Vlasnički softver — Sva prava pridržana.","legal":"Kopiranje, izmjena, daljnja distribucija ili iskorištavanje bez prethodnog pisanog dopuštenja Sergea Benoliela zabranjeni su.","restored":"Igra vraćena","generating":"Generiranje…","rulesTitle":"Pravila","where":"Gdje gledati","logic":"Logika","solutionShown":"Rješenje prikazano","congrats":"Bravo!","gridIncomplete":"Još postoji pogreška ili neriješeno polje.","tangoIncomplete":"Mreža još ne zadovoljava sva pravila.","sudokuIncomplete":"Još postoji pogreška ili prazno polje.","autoCrossOn":"Automatski X uključeni","autoCrossOff":"Automatski X isključeni","queenPlaced":"Kraljica je postavljena.","cellRevealed":"Polje je otkriveno.","digitRevealed":"Znamenka je otkrivena.","patchRevealed":"Polje područja je otkriveno.","finishedShare":"Završeno","dailyLabel":"Dnevni izazov","backtrackFlag":"vraćen potez","hintFlag":"savjet korišten","closeHint":"Zatvori","hintMove":"Predloženi potez","hintWhy":"Zašto","noLogicalHint":"Iz trenutačnog stanja nije moguće izravno zaključiti potez.","hintTimeout":"Traženje savjeta dosegnulo je ograničenje od 5 sekundi. Pouzdan savjet nije pronađen.","hintSearching":"Traženje savjeta…","hintPaused":"Nastavi igru kako bi zatražio savjet.","hintError":"Traženje savjeta nije uspjelo. Pokušaj ponovno nakon sljedećeg poteza.","dragHint":"Premjesti","rank1":"zaključak razine 1","rank2":"zaključak razine 2","rank3":"zaključak razine 3","hintNoR0":"Razina 0: nema izravnog zaključka.","hintNoR1":"Razina 1: nijedna pretpostavka ne vodi odmah u slijepu ulicu.","hintNoR2":"Razina 2: nijedna pretpostavka ne vodi u slijepu ulicu na sljedećoj razini.","hintNoR3":"Razina 3: unutar tri razine nije dokazana prisilna kontradikcija.","hypothesis":"Pretpostavka","consequence":"Posljedica","deadend":"Slijepa ulica","conclusion":"Zaključak","themeLabel":"Tema","soundsOn":"Zvukovi uključeni","soundsOff":"Zvukovi isključeni","resetDone":"Mreža ponovno postavljena.","patchAll":"Svako polje mora pripadati području.","patchEach":"Svaki trag mora imati područje.","patchOwn":"Svako područje mora sadržavati vlastiti trag.","patchTwo":"Područje ne smije sadržavati dva traga.","patchConnected":"Svako područje mora biti povezano.","patchRect":"Svako područje mora tvoriti pravokutnik.","patchSize":"Veličina područja ne odgovara tragu.","patchShape":"Oblik područja ne odgovara tragu.","erase":"Izbriši","regionSelection":"Odabir područja","share":"Podijeli","continue":"Nastavi","resultCopied":"Rezultat kopiran","shareUnavailable":"Dijeljenje nije dostupno","victoryKicker":"BRAVO","actions":"Radnje","homeAria":"Početna","changeTheme":"Promijeni temu","visibleOnly":"Zaključeno samo iz vidljivog stanja.","directReason":"Ovaj potez izravno slijedi iz vidljivih ograničenja.","rank1Reason":"Druge mogućnosti odmah vode u kontradikciju.","rank2Reason":"Druge mogućnosti ne uspijevaju jednu logičku razinu dublje.","rank3Reason":"Ograničena provjera do tri razine prisiljava ovaj potez.","placeQueen":"Postavi kraljicu","markX":"Označi X","placeSun":"Postavi sunce","placeMoon":"Postavi mjesec","placeDigit":"Upiši znamenku","assignRegion":"Dodijeli području","rowLabel":"redak","columnLabel":"stupac"}};
I18N.cs={...I18N.en,...{"easy":"Snadná","medium":"Střední","hard":"Těžká","expert":"Expert","gameQueens":"Koruny","gameTango":"Slunce-Měsíc","gameSudoku":"Mřížka 6","gamePatches":"Obdélníky","newGame":"Nová","reset":"Resetovat","pause":"Pauza","resume":"Pokračovat","check":"Zkontrolovat","hint":"Nápověda","solution":"Řešení","rules":"Pravidla","back":"Zpět","play":"Hrát","generated":"vygenerována","score":"skóre","homeTitle":"Čtyři hry.<br>Logická pauza.","homeSub":"Čtyři logické hry s generováním, časomírou, denními výzvami a postupem. Po prvním načtení fungují offline.","queensSub":"Jedna královna v každém řádku, sloupci a oblasti.","tangoSub":"Vyvaž Slunce/Měsíc a vztahy.","sudokuSub":"6×6, řádky, sloupce a oblasti.","patchesSub":"Obnov všechny obdélníkové oblasti.","daily":"Denní výzva","dailySub":"dnes dokončeno","stats":"Statistiky a postup","statsSub":"Historie, rekordy a série","prefs":"Nastavení","prefsSub":"Jazyk, motiv, zvuky a místní data","about":"O aplikaci","aboutSub":"Verze, copyright a licence","settingsSaved":"Nastavení uloženo na tomto zařízení.","language":"Jazyk","languageSub":"K dispozici 30 jazyků","theme":"Motiv","themeSub":"Automatický, světlý nebo tmavý","auto":"Automatický","light":"Světlý","dark":"Tmavý","sounds":"Jemné zvuky","soundsSub":"Výhra a občasná odezva","on":"Zap.","off":"Vyp.","data":"Data","dataSub":"Statistiky, výzvy a nastavení zůstávají místní.","info":"Info","localDataTitle":"Místní data","localData":"QUADLUD nevyžaduje účet. Hry, statistiky, denní výzvy a nastavení se ukládají v prohlížeči tohoto zařízení.","dailyLast":"Posledních 28 dní","dailyNote":"Každé datum vytváří stejné čtyři hlavolamy na všech zařízeních s touto verzí. Denní obtížnost: Střední.","finished":"dokončeno","statsLocal":"Postup je uložen pouze na tomto zařízení.","solved":"vyřešeno","success":"úspěšnost","avgTime":"průměrný čas","streak":"série dnů","byGame":"Podle hry","history":"Nedávná historie","record":"rekord","average":"průměr","none":"Zatím žádná dokončená hra.","solvedStatus":"Vyřešeno","revealedStatus":"Řešení zobrazeno","abandonedStatus":"Opuštěno","finishedStatus":"Dokončeno","autoCross":"Automaticky označit X při položení královny","queensLegend":"Klepnutím přepínáš prázdné → X → královna. Tažením po řádku nebo sloupci přidáš X; začni na X, chceš-li je mazat.","patchesLegend":"Táhni z jednoho rohu do protějšího a nakresli nebo změň obdélník. Obsahuje-li právě jednu nápovědu, oblast se vybere automaticky. Klepnutím na existující obdélník ho odstraníš.","zone":"Oblast","aboutTitle":"O QUADLUD","version":"Verze","copyright":"Copyright","license":"Licence","proprietary":"Proprietární software — Všechna práva vyhrazena.","legal":"Kopírování, úpravy, další šíření nebo využívání bez předchozího písemného souhlasu Serge Benoliela je zakázáno.","restored":"Hra obnovena","generating":"Generování…","rulesTitle":"Pravidla","where":"Kam se dívat","logic":"Logika","solutionShown":"Řešení zobrazeno","congrats":"Výborně!","gridIncomplete":"Zbývá chyba nebo nevyřešené pole.","tangoIncomplete":"Mřížka ještě nesplňuje všechna pravidla.","sudokuIncomplete":"Zbývá chyba nebo prázdné pole.","autoCrossOn":"Automatická X zapnuta","autoCrossOff":"Automatická X vypnuta","queenPlaced":"Královna byla položena.","cellRevealed":"Pole bylo odhaleno.","digitRevealed":"Číslice byla odhalena.","patchRevealed":"Pole oblasti bylo odhaleno.","finishedShare":"Dokončeno","dailyLabel":"Denní výzva","backtrackFlag":"vrácený tah","hintFlag":"použita nápověda","closeHint":"Zavřít","hintMove":"Doporučený tah","hintWhy":"Proč","noLogicalHint":"Z aktuálního stavu nelze přímo odvodit žádný tah.","hintTimeout":"Hledání nápovědy dosáhlo limitu 5 sekund. Spolehlivá nápověda nebyla nalezena.","hintSearching":"Hledání nápovědy…","hintPaused":"Pro nápovědu pokračuj ve hře.","hintError":"Hledání nápovědy nebylo možné dokončit. Zkus to po dalším tahu.","dragHint":"Přesunout","rank1":"odvození úrovně 1","rank2":"odvození úrovně 2","rank3":"odvození úrovně 3","hintNoR0":"Úroveň 0: žádné přímé odvození.","hintNoR1":"Úroveň 1: žádný předpoklad nevede okamžitě do slepé uličky.","hintNoR2":"Úroveň 2: žádný předpoklad nevede na další úrovni do slepé uličky.","hintNoR3":"Úroveň 3: během tří úrovní nebyl prokázán vynucený rozpor.","hypothesis":"Předpoklad","consequence":"Důsledek","deadend":"Slepá ulička","conclusion":"Závěr","themeLabel":"Motiv","soundsOn":"Zvuky zapnuty","soundsOff":"Zvuky vypnuty","resetDone":"Mřížka resetována.","patchAll":"Každé pole musí patřit do oblasti.","patchEach":"Každá nápověda musí mít oblast.","patchOwn":"Každá oblast musí obsahovat vlastní nápovědu.","patchTwo":"Oblast nesmí obsahovat dvě nápovědy.","patchConnected":"Každá oblast musí být souvislá.","patchRect":"Každá oblast musí tvořit obdélník.","patchSize":"Velikost oblasti neodpovídá nápovědě.","patchShape":"Tvar oblasti neodpovídá nápovědě.","erase":"Smazat","regionSelection":"Výběr oblasti","share":"Sdílet","continue":"Pokračovat","resultCopied":"Výsledek zkopírován","shareUnavailable":"Sdílení není dostupné","victoryKicker":"VÝBORNĚ","actions":"Akce","homeAria":"Domů","changeTheme":"Změnit motiv","visibleOnly":"Odvozeno pouze z viditelného stavu.","directReason":"Tento tah přímo vyplývá z viditelných omezení.","rank1Reason":"Ostatní možnosti vedou okamžitě k rozporu.","rank2Reason":"Ostatní možnosti selžou o jednu logickou úroveň hlouběji.","rank3Reason":"Omezená kontrola do tří úrovní vynucuje tento tah.","placeQueen":"Polož královnu","markX":"Označ X","placeSun":"Polož slunce","placeMoon":"Polož měsíc","placeDigit":"Vlož číslici","assignRegion":"Přiřaď oblasti","rowLabel":"řádek","columnLabel":"sloupec"}};
I18N.da={...I18N.en,...{"easy":"Let","medium":"Mellem","hard":"Svær","expert":"Ekspert","gameQueens":"Kroner","gameTango":"Sol-Måne","gameSudoku":"Gitter 6","gamePatches":"Rektangler","newGame":"Ny","reset":"Nulstil","pause":"Pause","resume":"Fortsæt","check":"Kontrollér","hint":"Hint","solution":"Løsning","rules":"Regler","back":"Tilbage","play":"Spil","generated":"genereret","score":"score","homeTitle":"Fire spil.<br>En logikpause.","homeSub":"Fire logikspil med generering, timer, daglige udfordringer og fremskridt. Virker offline efter første indlæsning.","queensSub":"Én dronning pr. række, kolonne og region.","tangoSub":"Balancér Sol/Måne og relationer.","sudokuSub":"6×6, rækker, kolonner og regioner.","patchesSub":"Genskab alle rektangulære regioner.","daily":"Daglig udfordring","dailySub":"fuldført i dag","stats":"Statistik & fremskridt","statsSub":"Historik, rekorder og serier","prefs":"Indstillinger","prefsSub":"Sprog, tema, lyde og lokale data","about":"Om","aboutSub":"Version, copyright og licens","settingsSaved":"Indstillinger gemt på denne enhed.","language":"Sprog","languageSub":"30 sprog tilgængelige","theme":"Tema","themeSub":"Automatisk, lyst eller mørkt","auto":"Automatisk","light":"Lyst","dark":"Mørkt","sounds":"Diskrete lyde","soundsSub":"Sejr og lejlighedsvis feedback","on":"Til","off":"Fra","data":"Data","dataSub":"Statistik, udfordringer og indstillinger forbliver lokale.","info":"Info","localDataTitle":"Lokale data","localData":"QUADLUD kræver ingen konto. Spil, statistik, daglige udfordringer og indstillinger gemmes i browseren på denne enhed.","dailyLast":"Seneste 28 dage","dailyNote":"Hver dato giver de samme fire puslespil på alle enheder med denne version. Daglig sværhedsgrad: Mellem.","finished":"fuldført","statsLocal":"Fremskridt gemmes kun på denne enhed.","solved":"løst","success":"succes","avgTime":"gennemsnitstid","streak":"dageserie","byGame":"Efter spil","history":"Seneste historik","record":"rekord","average":"gennemsnit","none":"Ingen fuldførte spil endnu.","solvedStatus":"Løst","revealedStatus":"Løsning vist","abandonedStatus":"Opgivet","finishedStatus":"Fuldført","autoCross":"Markér X automatisk, når jeg placerer en dronning","queensLegend":"Tryk på et felt for tom → X → dronning. Træk langs en række eller kolonne for at tilføje X; start på et X for at slette dem.","patchesLegend":"Træk fra et hjørne til det modsatte for at tegne eller ændre et rektangel. Indeholder det præcis ét hint, vælges regionen automatisk. Tryk på et eksisterende rektangel for at fjerne det.","zone":"Region","aboutTitle":"Om QUADLUD","version":"Version","copyright":"Copyright","license":"Licens","proprietary":"Proprietær software — Alle rettigheder forbeholdes.","legal":"Kopiering, ændring, videredistribution eller udnyttelse uden forudgående skriftlig tilladelse fra Serge Benoliel er forbudt.","restored":"Spil gendannet","generating":"Genererer…","rulesTitle":"Regler","where":"Hvor du skal se","logic":"Logik","solutionShown":"Løsning vist","congrats":"Godt klaret!","gridIncomplete":"Der er stadig en fejl eller et uløst felt.","tangoIncomplete":"Gitteret opfylder endnu ikke alle regler.","sudokuIncomplete":"Der er stadig en fejl eller et tomt felt.","autoCrossOn":"Automatiske X til","autoCrossOff":"Automatiske X fra","queenPlaced":"En dronning blev placeret.","cellRevealed":"Et felt blev afsløret.","digitRevealed":"Et tal blev afsløret.","patchRevealed":"Et regionsfelt blev afsløret.","finishedShare":"Fuldført","dailyLabel":"Daglig udfordring","backtrackFlag":"fortrudt","hintFlag":"hint brugt","closeHint":"Luk","hintMove":"Foreslået træk","hintWhy":"Hvorfor","noLogicalHint":"Intet træk kan udledes direkte af den aktuelle tilstand.","hintTimeout":"Hintsøgningen nåede grænsen på 5 sekunder. Intet pålideligt hint blev fundet.","hintSearching":"Søger efter hint…","hintPaused":"Fortsæt spillet for at bede om et hint.","hintError":"Hintsøgningen kunne ikke afsluttes. Prøv igen efter dit næste træk.","dragHint":"Flyt","rank1":"slutning niveau 1","rank2":"slutning niveau 2","rank3":"slutning niveau 3","hintNoR0":"Niveau 0: ingen direkte slutning.","hintNoR1":"Niveau 1: ingen antagelse fører straks til en blindgyde.","hintNoR2":"Niveau 2: ingen antagelse fører til en blindgyde på næste niveau.","hintNoR3":"Niveau 3: ingen tvungen modsigelse blev bevist inden for tre niveauer.","hypothesis":"Antagelse","consequence":"Konsekvens","deadend":"Blindgyde","conclusion":"Konklusion","themeLabel":"Tema","soundsOn":"Lyde til","soundsOff":"Lyde fra","resetDone":"Gitter nulstillet.","patchAll":"Hvert felt skal tilhøre en region.","patchEach":"Hvert hint skal have en region.","patchOwn":"Hver region skal indeholde sit eget hint.","patchTwo":"En region må ikke indeholde to hints.","patchConnected":"Hver region skal være sammenhængende.","patchRect":"Hver region skal danne et rektangel.","patchSize":"Regionens størrelse passer ikke til hintet.","patchShape":"Regionens form passer ikke til hintet.","erase":"Slet","regionSelection":"Vælg region","share":"Del","continue":"Fortsæt","resultCopied":"Resultat kopieret","shareUnavailable":"Deling ikke tilgængelig","victoryKicker":"GODT KLARET","actions":"Handlinger","homeAria":"Hjem","changeTheme":"Skift tema","visibleOnly":"Udledt kun fra den synlige tilstand.","directReason":"Dette træk følger direkte af de synlige begrænsninger.","rank1Reason":"De andre muligheder fører straks til en modsigelse.","rank2Reason":"De andre muligheder fejler ét logisk niveau dybere.","rank3Reason":"En afgrænset kontrol på tre niveauer tvinger dette træk.","placeQueen":"Placér en dronning","markX":"Markér X","placeSun":"Placér en sol","placeMoon":"Placér en måne","placeDigit":"Indtast tal","assignRegion":"Tildel region","rowLabel":"række","columnLabel":"kolonne"}};
I18N.nl={...I18N.en,...{"easy":"Makkelijk","medium":"Gemiddeld","hard":"Moeilijk","expert":"Expert","gameQueens":"Kronen","gameTango":"Zon-Maan","gameSudoku":"Raster 6","gamePatches":"Rechthoeken","newGame":"Nieuw","reset":"Reset","pause":"Pauze","resume":"Hervatten","check":"Controleren","hint":"Hint","solution":"Oplossing","rules":"Regels","back":"Terug","play":"Spelen","generated":"gegenereerd","score":"score","homeTitle":"Vier spellen.<br>Een logische pauze.","homeSub":"Vier logicaspellen met generatie, timer, dagelijkse uitdagingen en voortgang. Werkt offline na de eerste keer laden.","queensSub":"Eén koningin per rij, kolom en regio.","tangoSub":"Breng Zon/Maan en relaties in balans.","sudokuSub":"6×6, rijen, kolommen en regio's.","patchesSub":"Bouw alle rechthoekige regio's opnieuw.","daily":"Dagelijkse uitdaging","dailySub":"vandaag voltooid","stats":"Statistieken & voortgang","statsSub":"Geschiedenis, records en reeksen","prefs":"Voorkeuren","prefsSub":"Taal, thema, geluiden en lokale gegevens","about":"Over","aboutSub":"Versie, copyright en licentie","settingsSaved":"Instellingen opgeslagen op dit apparaat.","language":"Taal","languageSub":"30 talen beschikbaar","theme":"Thema","themeSub":"Automatisch, licht of donker","auto":"Automatisch","light":"Licht","dark":"Donker","sounds":"Subtiele geluiden","soundsSub":"Overwinning en af en toe feedback","on":"Aan","off":"Uit","data":"Gegevens","dataSub":"Statistieken, uitdagingen en voorkeuren blijven lokaal.","info":"Info","localDataTitle":"Lokale gegevens","localData":"QUADLUD vereist geen account. Spellen, statistieken, dagelijkse uitdagingen en voorkeuren worden opgeslagen in de browser van dit apparaat.","dailyLast":"Laatste 28 dagen","dailyNote":"Elke datum levert op alle apparaten met deze versie dezelfde vier puzzels. Dagelijkse moeilijkheid: Gemiddeld.","finished":"voltooid","statsLocal":"Voortgang wordt alleen op dit apparaat opgeslagen.","solved":"opgelost","success":"succes","avgTime":"gemiddelde tijd","streak":"dagenreeks","byGame":"Per spel","history":"Recente geschiedenis","record":"record","average":"gemiddelde","none":"Nog geen voltooid spel.","solvedStatus":"Opgelost","revealedStatus":"Oplossing bekeken","abandonedStatus":"Afgebroken","finishedStatus":"Voltooid","autoCross":"Automatisch X'en zetten wanneer ik een koningin plaats","queensLegend":"Tik op een vak om leeg → X → koningin te doorlopen. Sleep over een rij of kolom om X'en toe te voegen; begin op een X om ze te wissen.","patchesLegend":"Sleep van een hoek naar de tegenoverliggende hoek om een rechthoek te tekenen of te wijzigen. Bij precies één aanwijzing wordt de regio automatisch gekozen. Tik op een bestaande rechthoek om die te verwijderen.","zone":"Regio","aboutTitle":"Over QUADLUD","version":"Versie","copyright":"Copyright","license":"Licentie","proprietary":"Propriëtaire software — Alle rechten voorbehouden.","legal":"Kopiëren, wijzigen, herverdelen of exploiteren zonder voorafgaande schriftelijke toestemming van Serge Benoliel is verboden.","restored":"Spel hersteld","generating":"Genereren…","rulesTitle":"Regels","where":"Waar kijken","logic":"Logica","solutionShown":"Oplossing getoond","congrats":"Goed gedaan!","gridIncomplete":"Er is nog een fout of onopgelost vak.","tangoIncomplete":"Het raster voldoet nog niet aan alle regels.","sudokuIncomplete":"Er is nog een fout of leeg vak.","autoCrossOn":"Automatische X'en aan","autoCrossOff":"Automatische X'en uit","queenPlaced":"Er is een koningin geplaatst.","cellRevealed":"Er is een vak onthuld.","digitRevealed":"Er is een cijfer onthuld.","patchRevealed":"Er is een regiovak onthuld.","finishedShare":"Voltooid","dailyLabel":"Dagelijkse uitdaging","backtrackFlag":"teruggedraaid","hintFlag":"hint gebruikt","closeHint":"Sluiten","hintMove":"Aanbevolen zet","hintWhy":"Waarom","noLogicalHint":"Uit de huidige stand kan geen zet rechtstreeks worden afgeleid.","hintTimeout":"De hintzoeker bereikte de limiet van 5 seconden. Er werd geen betrouwbare hint gevonden.","hintSearching":"Hint zoeken…","hintPaused":"Hervat het spel om een hint te vragen.","hintError":"De hintzoeker kon niet afronden. Probeer opnieuw na je volgende zet.","dragHint":"Verplaatsen","rank1":"niveau-1-inferentie","rank2":"niveau-2-inferentie","rank3":"niveau-3-inferentie","hintNoR0":"Niveau 0: geen directe afleiding.","hintNoR1":"Niveau 1: geen aanname leidt direct tot een doodlopende weg.","hintNoR2":"Niveau 2: geen aanname loopt op het volgende niveau vast.","hintNoR3":"Niveau 3: binnen drie niveaus is geen gedwongen tegenspraak bewezen.","hypothesis":"Aanname","consequence":"Gevolg","deadend":"Doodlopende weg","conclusion":"Conclusie","themeLabel":"Thema","soundsOn":"Geluiden aan","soundsOff":"Geluiden uit","resetDone":"Raster gereset.","patchAll":"Elk vak moet bij een regio horen.","patchEach":"Elke aanwijzing moet een regio hebben.","patchOwn":"Elke regio moet zijn eigen aanwijzing bevatten.","patchTwo":"Een regio mag geen twee aanwijzingen bevatten.","patchConnected":"Elke regio moet aaneengesloten zijn.","patchRect":"Elke regio moet een rechthoek vormen.","patchSize":"De grootte van de regio past niet bij de aanwijzing.","patchShape":"De vorm van de regio past niet bij de aanwijzing.","erase":"Wissen","regionSelection":"Regioselectie","share":"Delen","continue":"Doorgaan","resultCopied":"Resultaat gekopieerd","shareUnavailable":"Delen niet beschikbaar","victoryKicker":"GOED GEDAAN","actions":"Acties","homeAria":"Start","changeTheme":"Thema wijzigen","visibleOnly":"Alleen afgeleid uit de zichtbare stand.","directReason":"Deze zet volgt rechtstreeks uit de zichtbare voorwaarden.","rank1Reason":"De andere mogelijkheden leiden meteen tot een tegenspraak.","rank2Reason":"De andere mogelijkheden mislukken één logisch niveau dieper.","rank3Reason":"Een begrensde controle van drie niveaus dwingt deze zet af.","placeQueen":"Plaats een koningin","markX":"Markeer X","placeSun":"Plaats een zon","placeMoon":"Plaats een maan","placeDigit":"Plaats cijfer","assignRegion":"Wijs toe aan regio","rowLabel":"rij","columnLabel":"kolom"}};
I18N.et={...I18N.en,...{"easy":"Lihtne","medium":"Keskmine","hard":"Raske","expert":"Ekspert","gameQueens":"Kroonid","gameTango":"Päike-Kuu","gameSudoku":"Ruudustik 6","gamePatches":"Ristkülikud","newGame":"Uus","reset":"Lähtesta","pause":"Paus","resume":"Jätka","check":"Kontrolli","hint":"Vihje","solution":"Lahendus","rules":"Reeglid","back":"Tagasi","play":"Mängi","generated":"loodud","score":"skoor","homeTitle":"Neli mängu.<br>Loogikapaus.","homeSub":"Neli loogikamängu genereerimise, taimeri, igapäevaste väljakutsete ja edenemisega. Pärast esimest laadimist töötab võrguühenduseta.","queensSub":"Üks kuninganna igas reas, veerus ja piirkonnas.","tangoSub":"Tasakaalusta Päike/Kuu ja seosed.","sudokuSub":"6×6, read, veerud ja piirkonnad.","patchesSub":"Taasta kõik ristkülikukujulised piirkonnad.","daily":"Päevane väljakutse","dailySub":"täna lõpetatud","stats":"Statistika ja edenemine","statsSub":"Ajalugu, rekordid ja seeriad","prefs":"Seaded","prefsSub":"Keel, teema, helid ja kohalikud andmed","about":"Teave","aboutSub":"Versioon, autoriõigus ja litsents","settingsSaved":"Seaded salvestati sellesse seadmesse.","language":"Keel","languageSub":"Saadaval 30 keelt","theme":"Teema","themeSub":"Automaatne, hele või tume","auto":"Automaatne","light":"Hele","dark":"Tume","sounds":"Vaiksed helid","soundsSub":"Võit ja aeg-ajalt tagasiside","on":"Sees","off":"Väljas","data":"Andmed","dataSub":"Statistika, väljakutsed ja seaded jäävad kohalikuks.","info":"Info","localDataTitle":"Kohalikud andmed","localData":"QUADLUD ei vaja kontot. Mängud, statistika, päevased väljakutsed ja seaded salvestatakse selle seadme brauserisse.","dailyLast":"Viimased 28 päeva","dailyNote":"Iga kuupäev loob kõigis seda versiooni kasutavates seadmetes samad neli mõistatust. Päevane raskus: Keskmine.","finished":"lõpetatud","statsLocal":"Edenemine salvestatakse ainult sellesse seadmesse.","solved":"lahendatud","success":"edu","avgTime":"keskmine aeg","streak":"päevaseeria","byGame":"Mängu kaupa","history":"Hiljutine ajalugu","record":"rekord","average":"keskmine","none":"Ühtegi mängu pole veel lõpetatud.","solvedStatus":"Lahendatud","revealedStatus":"Lahendus vaadatud","abandonedStatus":"Katkestatud","finishedStatus":"Lõpetatud","autoCross":"Märgi X automaatselt, kui asetan kuninganna","queensLegend":"Puuduta ruutu: tühi → X → kuninganna. Lohista mööda rida või veergu X-ide lisamiseks; kustutamiseks alusta X-ist.","patchesLegend":"Lohista ühest nurgast vastasnurka, et ristkülikut joonistada või muuta. Kui selles on täpselt üks vihje, valitakse piirkond automaatselt. Olemasoleva ristküliku eemaldamiseks puuduta seda.","zone":"Piirkond","aboutTitle":"QUADLUDi teave","version":"Versioon","copyright":"Autoriõigus","license":"Litsents","proprietary":"Omandiline tarkvara — Kõik õigused kaitstud.","legal":"Kopeerimine, muutmine, edasilevitamine või kasutamine ilma Serge Benolieli eelneva kirjaliku loata on keelatud.","restored":"Mäng taastatud","generating":"Loomine…","rulesTitle":"Reeglid","where":"Kuhu vaadata","logic":"Loogika","solutionShown":"Lahendus näidatud","congrats":"Tubli!","gridIncomplete":"Alles on viga või lahendamata ruut.","tangoIncomplete":"Ruudustik ei vasta veel kõigile reeglitele.","sudokuIncomplete":"Alles on viga või tühi ruut.","autoCrossOn":"Automaatsed X-id sees","autoCrossOff":"Automaatsed X-id väljas","queenPlaced":"Kuninganna asetati.","cellRevealed":"Ruut avaldati.","digitRevealed":"Number avaldati.","patchRevealed":"Piirkonna ruut avaldati.","finishedShare":"Lõpetatud","dailyLabel":"Päevane väljakutse","backtrackFlag":"tagasivõetud","hintFlag":"vihjet kasutatud","closeHint":"Sulge","hintMove":"Soovitatud käik","hintWhy":"Miks","noLogicalHint":"Praegusest seisust ei saa ühtegi käiku otse tuletada.","hintTimeout":"Vihjeotsing jõudis 5 sekundi piirini. Usaldusväärset vihjet ei leitud.","hintSearching":"Vihje otsimine…","hintPaused":"Vihje küsimiseks jätka mängu.","hintError":"Vihjeotsingut ei saanud lõpetada. Proovi pärast järgmist käiku uuesti.","dragHint":"Liiguta","rank1":"1. taseme järeldus","rank2":"2. taseme järeldus","rank3":"3. taseme järeldus","hintNoR0":"Tase 0: otsest järeldust pole.","hintNoR1":"Tase 1: ükski eeldus ei vii kohe ummikusse.","hintNoR2":"Tase 2: ükski eeldus ei vii järgmisel tasemel ummikusse.","hintNoR3":"Tase 3: kolme taseme jooksul ei tõestatud sunnitud vastuolu.","hypothesis":"Eeldus","consequence":"Tagajärg","deadend":"Ummik","conclusion":"Järeldus","themeLabel":"Teema","soundsOn":"Helid sees","soundsOff":"Helid väljas","resetDone":"Ruudustik lähtestatud.","patchAll":"Iga ruut peab kuuluma piirkonda.","patchEach":"Igal vihjel peab olema piirkond.","patchOwn":"Iga piirkond peab sisaldama oma vihjet.","patchTwo":"Piirkond ei tohi sisaldada kahte vihjet.","patchConnected":"Iga piirkond peab olema ühendatud.","patchRect":"Iga piirkond peab moodustama ristküliku.","patchSize":"Piirkonna suurus ei vasta vihjele.","patchShape":"Piirkonna kuju ei vasta vihjele.","erase":"Kustuta","regionSelection":"Piirkonna valik","share":"Jaga","continue":"Jätka","resultCopied":"Tulemus kopeeritud","shareUnavailable":"Jagamine pole saadaval","victoryKicker":"TUBLI","actions":"Toimingud","homeAria":"Avaleht","changeTheme":"Muuda teemat","visibleOnly":"Tuletatud ainult nähtavast seisust.","directReason":"See käik tuleneb otse nähtavatest piirangutest.","rank1Reason":"Teised võimalused viivad kohe vastuoluni.","rank2Reason":"Teised võimalused ebaõnnestuvad ühe loogikataseme võrra sügavamal.","rank3Reason":"Piiratud kolmetasandiline kontroll sunnib selle käigu.","placeQueen":"Aseta kuninganna","markX":"Märgi X","placeSun":"Aseta päike","placeMoon":"Aseta kuu","placeDigit":"Aseta number","assignRegion":"Määra piirkonda","rowLabel":"rida","columnLabel":"veerg"}};
I18N.fi={...I18N.en,...{"easy":"Helppo","medium":"Keskitaso","hard":"Vaikea","expert":"Asiantuntija","gameQueens":"Kruunut","gameTango":"Aurinko-Kuu","gameSudoku":"Ruudukko 6","gamePatches":"Suorakulmiot","newGame":"Uusi","reset":"Nollaa","pause":"Tauko","resume":"Jatka","check":"Tarkista","hint":"Vihje","solution":"Ratkaisu","rules":"Säännöt","back":"Takaisin","play":"Pelaa","generated":"luotu","score":"pisteet","homeTitle":"Neljä peliä.<br>Logiikkatauko.","homeSub":"Neljä logiikkapeliä, joissa on generointi, ajastin, päivittäiset haasteet ja edistyminen. Toimii offline ensimmäisen latauksen jälkeen.","queensSub":"Yksi kuningatar joka riville, sarakkeeseen ja alueelle.","tangoSub":"Tasapainota Aurinko/Kuu ja suhteet.","sudokuSub":"6×6, rivit, sarakkeet ja alueet.","patchesSub":"Rakenna kaikki suorakulmaiset alueet.","daily":"Päivittäinen haaste","dailySub":"valmiina tänään","stats":"Tilastot & edistyminen","statsSub":"Historia, ennätykset ja putket","prefs":"Asetukset","prefsSub":"Kieli, teema, äänet ja paikalliset tiedot","about":"Tietoja","aboutSub":"Versio, tekijänoikeus ja lisenssi","settingsSaved":"Asetukset tallennettu tälle laitteelle.","language":"Kieli","languageSub":"30 kieltä saatavilla","theme":"Teema","themeSub":"Automaattinen, vaalea tai tumma","auto":"Automaattinen","light":"Vaalea","dark":"Tumma","sounds":"Hillityt äänet","soundsSub":"Voitto ja satunnainen palaute","on":"Päällä","off":"Pois","data":"Tiedot","dataSub":"Tilastot, haasteet ja asetukset pysyvät paikallisina.","info":"Tiedot","localDataTitle":"Paikalliset tiedot","localData":"QUADLUD ei vaadi tiliä. Pelit, tilastot, päivittäiset haasteet ja asetukset tallennetaan tämän laitteen selaimeen.","dailyLast":"Viimeiset 28 päivää","dailyNote":"Jokainen päivämäärä tuottaa samat neljä pulmaa kaikilla tätä versiota käyttävillä laitteilla. Päivittäinen vaikeus: Keskitaso.","finished":"valmiit","statsLocal":"Edistyminen tallennetaan vain tälle laitteelle.","solved":"ratkaistu","success":"onnistuminen","avgTime":"keskiaika","streak":"päiväputki","byGame":"Peleittäin","history":"Viimeaikainen historia","record":"ennätys","average":"keskiarvo","none":"Ei vielä valmiita pelejä.","solvedStatus":"Ratkaistu","revealedStatus":"Ratkaisu näytetty","abandonedStatus":"Keskeytetty","finishedStatus":"Valmis","autoCross":"Merkitse X automaattisesti, kun asetan kuningattaren","queensLegend":"Napauta ruutua: tyhjä → X → kuningatar. Vedä riviä tai saraketta pitkin lisätäksesi X-merkkejä; aloita X:stä poistaaksesi niitä.","patchesLegend":"Vedä kulmasta vastakkaiseen kulmaan piirtääksesi tai muuttaaksesi suorakulmiota. Jos siinä on täsmälleen yksi vihje, alue valitaan automaattisesti. Napauta olemassa olevaa suorakulmiota poistaaksesi sen.","zone":"Alue","aboutTitle":"Tietoja QUADLUDista","version":"Versio","copyright":"Tekijänoikeus","license":"Lisenssi","proprietary":"Omisteinen ohjelmisto — Kaikki oikeudet pidätetään.","legal":"Kopiointi, muokkaus, edelleenjakelu tai hyödyntäminen ilman Serge Benolielin etukäteistä kirjallista lupaa on kielletty.","restored":"Peli palautettu","generating":"Luodaan…","rulesTitle":"Säännöt","where":"Mihin katsoa","logic":"Logiikka","solutionShown":"Ratkaisu näytetty","congrats":"Hyvin tehty!","gridIncomplete":"Jäljellä on virhe tai ratkaisematon ruutu.","tangoIncomplete":"Ruudukko ei vielä täytä kaikkia sääntöjä.","sudokuIncomplete":"Jäljellä on virhe tai tyhjä ruutu.","autoCrossOn":"Automaattiset X:t päällä","autoCrossOff":"Automaattiset X:t pois","queenPlaced":"Kuningatar asetettiin.","cellRevealed":"Ruutu paljastettiin.","digitRevealed":"Numero paljastettiin.","patchRevealed":"Alueen ruutu paljastettiin.","finishedShare":"Valmis","dailyLabel":"Päivittäinen haaste","backtrackFlag":"peruutettu","hintFlag":"vihjettä käytetty","closeHint":"Sulje","hintMove":"Ehdotettu siirto","hintWhy":"Miksi","noLogicalHint":"Nykytilasta ei voida päätellä suoraan mitään siirtoa.","hintTimeout":"Vihjehaku saavutti 5 sekunnin rajan. Luotettavaa vihjettä ei löytynyt.","hintSearching":"Etsitään vihjettä…","hintPaused":"Jatka peliä pyytääksesi vihjettä.","hintError":"Vihjehakua ei voitu suorittaa. Yritä uudelleen seuraavan siirron jälkeen.","dragHint":"Siirrä","rank1":"tason 1 päättely","rank2":"tason 2 päättely","rank3":"tason 3 päättely","hintNoR0":"Taso 0: ei suoraa päätelmää.","hintNoR1":"Taso 1: mikään oletus ei johda heti umpikujaan.","hintNoR2":"Taso 2: mikään oletus ei johda umpikujaan seuraavalla tasolla.","hintNoR3":"Taso 3: pakotettua ristiriitaa ei osoitettu kolmella tasolla.","hypothesis":"Oletus","consequence":"Seuraus","deadend":"Umpikuja","conclusion":"Johtopäätös","themeLabel":"Teema","soundsOn":"Äänet päällä","soundsOff":"Äänet pois","resetDone":"Ruudukko nollattu.","patchAll":"Jokaisen ruudun on kuuluttava alueeseen.","patchEach":"Jokaisella vihjeellä on oltava alue.","patchOwn":"Jokaisen alueen on sisällettävä oma vihjeensä.","patchTwo":"Alue ei saa sisältää kahta vihjettä.","patchConnected":"Jokaisen alueen on oltava yhtenäinen.","patchRect":"Jokaisen alueen on muodostettava suorakulmio.","patchSize":"Alueen koko ei vastaa vihjettä.","patchShape":"Alueen muoto ei vastaa vihjettä.","erase":"Poista","regionSelection":"Alueen valinta","share":"Jaa","continue":"Jatka","resultCopied":"Tulos kopioitu","shareUnavailable":"Jakaminen ei ole käytettävissä","victoryKicker":"HYVIN TEHTY","actions":"Toiminnot","homeAria":"Koti","changeTheme":"Vaihda teemaa","visibleOnly":"Päätelty vain näkyvästä tilanteesta.","directReason":"Tämä siirto seuraa suoraan näkyvistä rajoitteista.","rank1Reason":"Muut vaihtoehdot johtavat heti ristiriitaan.","rank2Reason":"Muut vaihtoehdot epäonnistuvat yhtä logiikkatasoa syvemmällä.","rank3Reason":"Rajattu kolmen tason tarkistus pakottaa tämän siirron.","placeQueen":"Aseta kuningatar","markX":"Merkitse X","placeSun":"Aseta aurinko","placeMoon":"Aseta kuu","placeDigit":"Aseta numero","assignRegion":"Määritä alueeseen","rowLabel":"rivi","columnLabel":"sarake"}};
I18N.de={...I18N.en,...{"easy":"Leicht","medium":"Mittel","hard":"Schwer","expert":"Experte","gameQueens":"Kronen","gameTango":"Sonne-Mond","gameSudoku":"Gitter 6","gamePatches":"Rechtecke","newGame":"Neu","reset":"Zurücksetzen","pause":"Pause","resume":"Fortsetzen","check":"Prüfen","hint":"Hinweis","solution":"Lösung","rules":"Regeln","back":"Zurück","play":"Spielen","generated":"generiert","score":"Punkte","homeTitle":"Vier Spiele.<br>Eine Logikpause.","homeSub":"Vier Logikspiele mit Generierung, Timer, täglichen Herausforderungen und Fortschritt. Nach dem ersten Laden offline nutzbar.","queensSub":"Eine Königin pro Zeile, Spalte und Region.","tangoSub":"Sonne/Mond und Beziehungen ausgleichen.","sudokuSub":"6×6, Zeilen, Spalten und Blöcke.","patchesSub":"Alle rechteckigen Regionen rekonstruieren.","daily":"Tägliche Herausforderung","dailySub":"heute abgeschlossen","stats":"Statistik & Fortschritt","statsSub":"Verlauf, Rekorde und Serien","prefs":"Einstellungen","prefsSub":"Sprache, Design, Töne und lokale Daten","about":"Über","aboutSub":"Version, Copyright und Lizenz","settingsSaved":"Einstellungen auf diesem Gerät gespeichert.","language":"Sprache","languageSub":"30 Sprachen verfügbar","theme":"Design","themeSub":"Automatisch, hell oder dunkel","auto":"Automatisch","light":"Hell","dark":"Dunkel","sounds":"Dezente Töne","soundsSub":"Sieg und gelegentliche Rückmeldung","on":"An","off":"Aus","data":"Daten","dataSub":"Statistiken, Herausforderungen und Einstellungen bleiben lokal.","info":"Info","localDataTitle":"Lokale Daten","localData":"QUADLUD benötigt kein Konto. Spiele, Statistiken, tägliche Herausforderungen und Einstellungen werden im Browser dieses Geräts gespeichert.","dailyLast":"Letzte 28 Tage","dailyNote":"Jedes Datum erzeugt auf allen Geräten mit dieser Version dieselben vier Rätsel. Täglicher Schwierigkeitsgrad: Mittel.","finished":"abgeschlossen","statsLocal":"Der Fortschritt wird nur auf diesem Gerät gespeichert.","solved":"gelöst","success":"Erfolg","avgTime":"Durchschnittszeit","streak":"Tagesserie","byGame":"Nach Spiel","history":"Letzter Verlauf","record":"Rekord","average":"Durchschnitt","none":"Noch kein Spiel abgeschlossen.","solvedStatus":"Gelöst","revealedStatus":"Lösung angesehen","abandonedStatus":"Abgebrochen","finishedStatus":"Beendet","autoCross":"X automatisch markieren, wenn ich eine Königin setze","queensLegend":"Tippe auf ein Feld: leer → X → Königin. Ziehe entlang einer Zeile oder Spalte, um X zu setzen; beginne auf einem X, um sie zu löschen.","patchesLegend":"Ziehe von einer Ecke zur gegenüberliegenden, um ein Rechteck zu zeichnen oder zu ändern. Enthält es genau einen Hinweis, wird die Region automatisch gewählt. Tippe auf ein vorhandenes Rechteck, um es zu löschen.","zone":"Region","aboutTitle":"Über QUADLUD","version":"Version","copyright":"Copyright","license":"Lizenz","proprietary":"Proprietäre Software — Alle Rechte vorbehalten.","legal":"Kopieren, Ändern, Weiterverbreiten oder Verwerten ohne vorherige schriftliche Genehmigung von Serge Benoliel ist untersagt.","restored":"Spiel wiederhergestellt","generating":"Wird generiert…","rulesTitle":"Regeln","where":"Wo schauen","logic":"Logik","solutionShown":"Lösung angezeigt","congrats":"Gut gemacht!","gridIncomplete":"Es gibt noch einen Fehler oder ein ungelöstes Feld.","tangoIncomplete":"Das Gitter erfüllt noch nicht alle Regeln.","sudokuIncomplete":"Es gibt noch einen Fehler oder ein leeres Feld.","autoCrossOn":"Automatische X aktiviert","autoCrossOff":"Automatische X deaktiviert","queenPlaced":"Eine Königin wurde gesetzt.","cellRevealed":"Ein Feld wurde aufgedeckt.","digitRevealed":"Eine Zahl wurde aufgedeckt.","patchRevealed":"Ein Regionsfeld wurde aufgedeckt.","finishedShare":"Beendet","dailyLabel":"Tägliche Herausforderung","backtrackFlag":"zurückgenommen","hintFlag":"Hinweis benutzt","closeHint":"Schließen","hintMove":"Empfohlener Zug","hintWhy":"Warum","noLogicalHint":"Aus dem aktuellen Zustand lässt sich kein Zug direkt ableiten.","hintTimeout":"Die Hinweissuche hat das 5-Sekunden-Limit erreicht. In dieser Zeit wurde kein verlässlicher Hinweis gefunden.","hintSearching":"Hinweis wird gesucht…","hintPaused":"Setze das Spiel fort, um einen Hinweis anzufordern.","hintError":"Die Hinweissuche konnte nicht abgeschlossen werden. Versuche es nach deinem nächsten Zug erneut.","dragHint":"Verschieben","rank1":"Schlussfolgerung Rang 1","rank2":"Schlussfolgerung Rang 2","rank3":"Schlussfolgerung Rang 3","hintNoR0":"Rang 0: keine direkte Ableitung.","hintNoR1":"Rang 1: keine Annahme führt sofort in eine Sackgasse.","hintNoR2":"Rang 2: keine Annahme führt auf der nächsten Ebene in eine Sackgasse.","hintNoR3":"Rang 3: innerhalb von drei Ebenen wurde kein erzwungener Widerspruch bewiesen.","hypothesis":"Annahme","consequence":"Folge","deadend":"Sackgasse","conclusion":"Schlussfolgerung","themeLabel":"Design","soundsOn":"Töne aktiviert","soundsOff":"Töne deaktiviert","resetDone":"Gitter zurückgesetzt.","patchAll":"Jedes Feld muss zu einer Region gehören.","patchEach":"Jeder Hinweis muss eine Region haben.","patchOwn":"Jede Region muss ihren eigenen Hinweis enthalten.","patchTwo":"Eine Region darf nicht zwei Hinweise enthalten.","patchConnected":"Jede Region muss zusammenhängend sein.","patchRect":"Jede Region muss ein Rechteck bilden.","patchSize":"Die Regionsgröße passt nicht zum Hinweis.","patchShape":"Die Form der Region passt nicht zum Hinweis.","erase":"Löschen","regionSelection":"Regionsauswahl","share":"Teilen","continue":"Weiter","resultCopied":"Ergebnis kopiert","shareUnavailable":"Teilen nicht verfügbar","victoryKicker":"GUT GEMACHT","actions":"Aktionen","homeAria":"Startseite","changeTheme":"Design ändern","visibleOnly":"Nur aus dem sichtbaren Zustand abgeleitet.","directReason":"Dieser Zug folgt direkt aus den sichtbaren Bedingungen.","rank1Reason":"Die anderen Möglichkeiten führen sofort zu einem Widerspruch.","rank2Reason":"Die anderen Möglichkeiten scheitern eine logische Ebene tiefer.","rank3Reason":"Eine begrenzte Prüfung über drei Ebenen erzwingt diesen Zug.","placeQueen":"Königin setzen","markX":"X markieren","placeSun":"Sonne setzen","placeMoon":"Mond setzen","placeDigit":"Zahl setzen","assignRegion":"Region zuweisen","rowLabel":"Zeile","columnLabel":"Spalte"}};
I18N.el={...I18N.en,...{"easy":"Εύκολο","medium":"Μεσαίο","hard":"Δύσκολο","expert":"Ειδικός","gameQueens":"Στέμματα","gameTango":"Ήλιος-Σελήνη","gameSudoku":"Πλέγμα 6","gamePatches":"Ορθογώνια","newGame":"Νέο","reset":"Επαναφορά","pause":"Παύση","resume":"Συνέχεια","check":"Έλεγχος","hint":"Υπόδειξη","solution":"Λύση","rules":"Κανόνες","back":"Πίσω","play":"Παίξε","generated":"δημιουργήθηκε","score":"σκορ","homeTitle":"Τέσσερα παιχνίδια.<br>Ένα διάλειμμα λογικής.","homeSub":"Τέσσερα παιχνίδια λογικής με δημιουργία, χρονόμετρο, ημερήσιες προκλήσεις και πρόοδο. Λειτουργούν εκτός σύνδεσης μετά την πρώτη φόρτωση.","queensSub":"Μία βασίλισσα ανά γραμμή, στήλη και περιοχή.","tangoSub":"Ισορρόπησε Ήλιο/Σελήνη και σχέσεις.","sudokuSub":"6×6, γραμμές, στήλες και περιοχές.","patchesSub":"Ανακατασκεύασε όλες τις ορθογώνιες περιοχές.","daily":"Ημερήσια πρόκληση","dailySub":"ολοκληρώθηκαν σήμερα","stats":"Στατιστικά & πρόοδος","statsSub":"Ιστορικό, ρεκόρ και σερί","prefs":"Ρυθμίσεις","prefsSub":"Γλώσσα, θέμα, ήχοι και τοπικά δεδομένα","about":"Σχετικά","aboutSub":"Έκδοση, πνευματικά δικαιώματα και άδεια","settingsSaved":"Οι ρυθμίσεις αποθηκεύτηκαν σε αυτή τη συσκευή.","language":"Γλώσσα","languageSub":"30 γλώσσες διαθέσιμες","theme":"Θέμα","themeSub":"Αυτόματο, φωτεινό ή σκοτεινό","auto":"Αυτόματο","light":"Φωτεινό","dark":"Σκοτεινό","sounds":"Διακριτικοί ήχοι","soundsSub":"Νίκη και περιστασιακή ανάδραση","on":"Ενεργό","off":"Ανενεργό","data":"Δεδομένα","dataSub":"Στατιστικά, προκλήσεις και ρυθμίσεις παραμένουν τοπικά.","info":"Πληροφορίες","localDataTitle":"Τοπικά δεδομένα","localData":"Το QUADLUD δεν απαιτεί λογαριασμό. Παιχνίδια, στατιστικά, ημερήσιες προκλήσεις και ρυθμίσεις αποθηκεύονται στον περιηγητή αυτής της συσκευής.","dailyLast":"Τελευταίες 28 ημέρες","dailyNote":"Κάθε ημερομηνία δημιουργεί τα ίδια τέσσερα παζλ σε όλες τις συσκευές με αυτή την έκδοση. Ημερήσια δυσκολία: Μεσαίο.","finished":"ολοκληρώθηκαν","statsLocal":"Η πρόοδος αποθηκεύεται μόνο σε αυτή τη συσκευή.","solved":"λυμένα","success":"επιτυχία","avgTime":"μέσος χρόνος","streak":"σερί ημερών","byGame":"Ανά παιχνίδι","history":"Πρόσφατο ιστορικό","record":"ρεκόρ","average":"μέσος όρος","none":"Δεν έχει ολοκληρωθεί ακόμη παιχνίδι.","solvedStatus":"Λύθηκε","revealedStatus":"Η λύση προβλήθηκε","abandonedStatus":"Εγκαταλείφθηκε","finishedStatus":"Ολοκληρώθηκε","autoCross":"Αυτόματη σήμανση X όταν τοποθετώ βασίλισσα","queensLegend":"Άγγιξε ένα κελί για κενό → X → βασίλισσα. Σύρε σε γραμμή ή στήλη για να προσθέσεις X· ξεκίνα από X για να τα σβήσεις.","patchesLegend":"Σύρε από μία γωνία στην απέναντι για να σχεδιάσεις ή να αλλάξεις ορθογώνιο. Αν περιέχει ακριβώς μία ένδειξη, η περιοχή επιλέγεται αυτόματα. Άγγιξε υπάρχον ορθογώνιο για να το αφαιρέσεις.","zone":"Περιοχή","aboutTitle":"Σχετικά με το QUADLUD","version":"Έκδοση","copyright":"Πνευματικά δικαιώματα","license":"Άδεια","proprietary":"Ιδιόκτητο λογισμικό — Με επιφύλαξη παντός δικαιώματος.","legal":"Απαγορεύονται η αντιγραφή, τροποποίηση, αναδιανομή ή εκμετάλλευση χωρίς προηγούμενη γραπτή άδεια του Serge Benoliel.","restored":"Το παιχνίδι επανήλθε","generating":"Δημιουργία…","rulesTitle":"Κανόνες","where":"Πού να κοιτάξεις","logic":"Λογική","solutionShown":"Η λύση εμφανίστηκε","congrats":"Μπράβο!","gridIncomplete":"Υπάρχει ακόμη λάθος ή άλυτο κελί.","tangoIncomplete":"Το πλέγμα δεν ικανοποιεί ακόμη όλους τους κανόνες.","sudokuIncomplete":"Υπάρχει ακόμη λάθος ή κενό κελί.","autoCrossOn":"Αυτόματα X ενεργά","autoCrossOff":"Αυτόματα X ανενεργά","queenPlaced":"Τοποθετήθηκε βασίλισσα.","cellRevealed":"Αποκαλύφθηκε κελί.","digitRevealed":"Αποκαλύφθηκε ψηφίο.","patchRevealed":"Αποκαλύφθηκε κελί περιοχής.","finishedShare":"Ολοκληρώθηκε","dailyLabel":"Ημερήσια πρόκληση","backtrackFlag":"αναίρεση","hintFlag":"χρησιμοποιήθηκε υπόδειξη","closeHint":"Κλείσιμο","hintMove":"Προτεινόμενη κίνηση","hintWhy":"Γιατί","noLogicalHint":"Δεν μπορεί να εξαχθεί άμεσα κίνηση από την τρέχουσα κατάσταση.","hintTimeout":"Η αναζήτηση υπόδειξης έφτασε το όριο των 5 δευτερολέπτων. Δεν βρέθηκε αξιόπιστη υπόδειξη.","hintSearching":"Αναζήτηση υπόδειξης…","hintPaused":"Συνέχισε το παιχνίδι για να ζητήσεις υπόδειξη.","hintError":"Η αναζήτηση δεν ολοκληρώθηκε. Δοκίμασε ξανά μετά την επόμενη κίνηση.","dragHint":"Μετακίνηση","rank1":"συμπέρασμα επιπέδου 1","rank2":"συμπέρασμα επιπέδου 2","rank3":"συμπέρασμα επιπέδου 3","hintNoR0":"Επίπεδο 0: καμία άμεση εξαγωγή.","hintNoR1":"Επίπεδο 1: καμία υπόθεση δεν οδηγεί άμεσα σε αδιέξοδο.","hintNoR2":"Επίπεδο 2: καμία υπόθεση δεν οδηγεί σε αδιέξοδο στο επόμενο επίπεδο.","hintNoR3":"Επίπεδο 3: δεν αποδείχθηκε αναγκαστική αντίφαση μέσα σε τρία επίπεδα.","hypothesis":"Υπόθεση","consequence":"Συνέπεια","deadend":"Αδιέξοδο","conclusion":"Συμπέρασμα","themeLabel":"Θέμα","soundsOn":"Ήχοι ενεργοί","soundsOff":"Ήχοι ανενεργοί","resetDone":"Το πλέγμα επαναφέρθηκε.","patchAll":"Κάθε κελί πρέπει να ανήκει σε περιοχή.","patchEach":"Κάθε ένδειξη πρέπει να έχει περιοχή.","patchOwn":"Κάθε περιοχή πρέπει να περιέχει τη δική της ένδειξη.","patchTwo":"Μια περιοχή δεν μπορεί να περιέχει δύο ενδείξεις.","patchConnected":"Κάθε περιοχή πρέπει να είναι συνδεδεμένη.","patchRect":"Κάθε περιοχή πρέπει να σχηματίζει ορθογώνιο.","patchSize":"Το μέγεθος της περιοχής δεν ταιριάζει με την ένδειξη.","patchShape":"Το σχήμα της περιοχής δεν ταιριάζει με την ένδειξη.","erase":"Διαγραφή","regionSelection":"Επιλογή περιοχής","share":"Κοινοποίηση","continue":"Συνέχεια","resultCopied":"Το αποτέλεσμα αντιγράφηκε","shareUnavailable":"Η κοινοποίηση δεν είναι διαθέσιμη","victoryKicker":"ΜΠΡΑΒΟ","actions":"Ενέργειες","homeAria":"Αρχική","changeTheme":"Αλλαγή θέματος","visibleOnly":"Εξήχθη μόνο από την ορατή κατάσταση.","directReason":"Αυτή η κίνηση προκύπτει άμεσα από τους ορατούς περιορισμούς.","rank1Reason":"Οι άλλες δυνατότητες οδηγούν αμέσως σε αντίφαση.","rank2Reason":"Οι άλλες δυνατότητες αποτυγχάνουν ένα λογικό επίπεδο βαθύτερα.","rank3Reason":"Έλεγχος περιορισμένος σε τρία επίπεδα επιβάλλει αυτή την κίνηση.","placeQueen":"Τοποθέτησε βασίλισσα","markX":"Σημείωσε X","placeSun":"Τοποθέτησε ήλιο","placeMoon":"Τοποθέτησε σελήνη","placeDigit":"Βάλε ψηφίο","assignRegion":"Ανάθεσε σε περιοχή","rowLabel":"γραμμή","columnLabel":"στήλη"}};
I18N.hu={...I18N.en,...{"easy":"Könnyű","medium":"Közepes","hard":"Nehéz","expert":"Szakértő","gameQueens":"Koronák","gameTango":"Nap-Hold","gameSudoku":"Rács 6","gamePatches":"Téglalapok","newGame":"Új","reset":"Alaphelyzet","pause":"Szünet","resume":"Folytatás","check":"Ellenőrzés","hint":"Tipp","solution":"Megoldás","rules":"Szabályok","back":"Vissza","play":"Játék","generated":"generálva","score":"pontszám","homeTitle":"Négy játék.<br>Egy logikai szünet.","homeSub":"Négy logikai játék generálással, időmérővel, napi kihívásokkal és fejlődéskövetéssel. Az első betöltés után offline is működik.","queensSub":"Egy királynő minden sorban, oszlopban és régióban.","tangoSub":"Egyensúlyozd a Nap/Hold jeleket és kapcsolatokat.","sudokuSub":"6×6, sorok, oszlopok és régiók.","patchesSub":"Építsd újra az összes téglalap alakú régiót.","daily":"Napi kihívás","dailySub":"ma teljesítve","stats":"Statisztika és fejlődés","statsSub":"Előzmények, rekordok és sorozatok","prefs":"Beállítások","prefsSub":"Nyelv, téma, hangok és helyi adatok","about":"Névjegy","aboutSub":"Verzió, szerzői jog és licenc","settingsSaved":"A beállítások elmentve ezen az eszközön.","language":"Nyelv","languageSub":"30 nyelv érhető el","theme":"Téma","themeSub":"Automatikus, világos vagy sötét","auto":"Automatikus","light":"Világos","dark":"Sötét","sounds":"Finom hangok","soundsSub":"Győzelem és alkalmi visszajelzés","on":"Be","off":"Ki","data":"Adatok","dataSub":"A statisztikák, kihívások és beállítások helyben maradnak.","info":"Infó","localDataTitle":"Helyi adatok","localData":"A QUADLUD nem igényel fiókot. A játékok, statisztikák, napi kihívások és beállítások az eszköz böngészőjében tárolódnak.","dailyLast":"Utolsó 28 nap","dailyNote":"Minden dátum ugyanazt a négy feladványt adja az ezt a verziót használó eszközökön. Napi nehézség: Közepes.","finished":"teljesítve","statsLocal":"A fejlődés csak ezen az eszközön tárolódik.","solved":"megoldva","success":"siker","avgTime":"átlagidő","streak":"napsorozat","byGame":"Játékonként","history":"Legutóbbi előzmények","record":"rekord","average":"átlag","none":"Még nincs befejezett játék.","solvedStatus":"Megoldva","revealedStatus":"Megoldás megtekintve","abandonedStatus":"Félbehagyva","finishedStatus":"Befejezve","autoCross":"Automatikusan jelölj X-et, amikor királynőt helyezek el","queensLegend":"Érints meg egy mezőt: üres → X → királynő. Húzd végig a sort vagy oszlopot X-ek hozzáadásához; X-ről indulva törölheted őket.","patchesLegend":"Húzd az egyik saroktól az átellenesig téglalap rajzolásához vagy átméretezéséhez. Ha pontosan egy nyomot tartalmaz, a régió automatikusan kiválasztódik. Érints meg egy meglévő téglalapot a törléshez.","zone":"Régió","aboutTitle":"A QUADLUD névjegye","version":"Verzió","copyright":"Szerzői jog","license":"Licenc","proprietary":"Tulajdonosi szoftver — Minden jog fenntartva.","legal":"A másolás, módosítás, újraterjesztés vagy felhasználás Serge Benoliel előzetes írásos engedélye nélkül tilos.","restored":"Játék visszaállítva","generating":"Generálás…","rulesTitle":"Szabályok","where":"Hol keresd","logic":"Logika","solutionShown":"Megoldás megjelenítve","congrats":"Szép munka!","gridIncomplete":"Még van hiba vagy megoldatlan mező.","tangoIncomplete":"A rács még nem felel meg minden szabálynak.","sudokuIncomplete":"Még van hiba vagy üres mező.","autoCrossOn":"Automatikus X bekapcsolva","autoCrossOff":"Automatikus X kikapcsolva","queenPlaced":"Egy királynő elhelyezve.","cellRevealed":"Egy mező felfedve.","digitRevealed":"Egy számjegy felfedve.","patchRevealed":"Egy régiómező felfedve.","finishedShare":"Befejezve","dailyLabel":"Napi kihívás","backtrackFlag":"visszalépés","hintFlag":"tipp használva","closeHint":"Bezárás","hintMove":"Javasolt lépés","hintWhy":"Miért","noLogicalHint":"A jelenlegi állapotból nem vezethető le közvetlenül lépés.","hintTimeout":"A tippkeresés elérte az 5 másodperces határt. Nem talált megbízható tippet.","hintSearching":"Tipp keresése…","hintPaused":"Folytasd a játékot tipp kéréséhez.","hintError":"A tippkeresés nem fejeződött be. Próbáld újra a következő lépés után.","dragHint":"Mozgatás","rank1":"1. szintű következtetés","rank2":"2. szintű következtetés","rank3":"3. szintű következtetés","hintNoR0":"0. szint: nincs közvetlen következtetés.","hintNoR1":"1. szint: egyik feltételezés sem vezet azonnal zsákutcába.","hintNoR2":"2. szint: egyik feltételezés sem vezet zsákutcába a következő szinten.","hintNoR3":"3. szint: három szinten belül nem bizonyítható kényszerített ellentmondás.","hypothesis":"Feltételezés","consequence":"Következmény","deadend":"Zsákutca","conclusion":"Következtetés","themeLabel":"Téma","soundsOn":"Hangok bekapcsolva","soundsOff":"Hangok kikapcsolva","resetDone":"Rács alaphelyzetbe állítva.","patchAll":"Minden mezőnek tartoznia kell egy régióhoz.","patchEach":"Minden nyomhoz tartoznia kell régiónak.","patchOwn":"Minden régiónak tartalmaznia kell a saját nyomát.","patchTwo":"Egy régió nem tartalmazhat két nyomot.","patchConnected":"Minden régiónak összefüggőnek kell lennie.","patchRect":"Minden régiónak téglalapot kell alkotnia.","patchSize":"A régió mérete nem egyezik a nyommal.","patchShape":"A régió alakja nem egyezik a nyommal.","erase":"Törlés","regionSelection":"Régió kiválasztása","share":"Megosztás","continue":"Folytatás","resultCopied":"Eredmény másolva","shareUnavailable":"Megosztás nem érhető el","victoryKicker":"SZÉP MUNKA","actions":"Műveletek","homeAria":"Kezdőlap","changeTheme":"Téma váltása","visibleOnly":"Csak a látható állapotból levezetve.","directReason":"Ez a lépés közvetlenül következik a látható korlátozásokból.","rank1Reason":"A többi lehetőség azonnal ellentmondáshoz vezet.","rank2Reason":"A többi lehetőség egy logikai szinttel mélyebben bukik el.","rank3Reason":"Egy háromszintű korlátozott ellenőrzés kikényszeríti ezt a lépést.","placeQueen":"Helyezz el királynőt","markX":"Jelölj X-et","placeSun":"Helyezz el napot","placeMoon":"Helyezz el holdat","placeDigit":"Írj be számjegyet","assignRegion":"Rendeld régióhoz","rowLabel":"sor","columnLabel":"oszlop"}};
I18N.ga={...I18N.en,...{"easy":"Éasca","medium":"Meánach","hard":"Deacair","expert":"Saineolaí","gameQueens":"Corónacha","gameTango":"Grian-Gealach","gameSudoku":"Greille 6","gamePatches":"Dronuilleoga","newGame":"Nua","reset":"Athshocraigh","pause":"Sos","resume":"Lean ar aghaidh","check":"Seiceáil","hint":"Leid","solution":"Réiteach","rules":"Rialacha","back":"Ar ais","play":"Imir","generated":"gineadh","score":"scór","homeTitle":"Ceithre chluiche.<br>Sos loighce.","homeSub":"Ceithre chluiche loighce le giniúint, amadóir, dúshláin laethúla agus rianú dul chun cinn. Oibríonn sé as líne tar éis an chéad lódála.","queensSub":"Banríon amháin i ngach ró, colún agus réigiún.","tangoSub":"Cothromaigh Grian/Gealach agus na caidrimh.","sudokuSub":"6×6, rónna, colúin agus réigiúin.","patchesSub":"Atóg na réigiúin dhronuilleogacha go léir.","daily":"Dúshlán laethúil","dailySub":"críochnaithe inniu","stats":"Staitisticí & dul chun cinn","statsSub":"Stair, taifid agus sraitheanna","prefs":"Socruithe","prefsSub":"Teanga, téama, fuaimeanna agus sonraí áitiúla","about":"Maidir","aboutSub":"Leagan, cóipcheart agus ceadúnas","settingsSaved":"Socruithe sábháilte ar an ngléas seo.","language":"Teanga","languageSub":"30 teanga ar fáil","theme":"Téama","themeSub":"Uathoibríoch, geal nó dorcha","auto":"Uathoibríoch","light":"Geal","dark":"Dorcha","sounds":"Fuaimeanna séimhe","soundsSub":"Bua agus aiseolas ó am go chéile","on":"Ar siúl","off":"As","data":"Sonraí","dataSub":"Fanann staitisticí, dúshláin agus socruithe go háitiúil.","info":"Eolas","localDataTitle":"Sonraí áitiúla","localData":"Ní theastaíonn cuntas ó QUADLUD. Stóráiltear cluichí, staitisticí, dúshláin laethúla agus socruithe i mbrabhsálaí an ghléis seo.","dailyLast":"Na 28 lá deireanacha","dailyNote":"Cruthaíonn gach dáta na ceithre phuzal céanna ar gach gléas leis an leagan seo. Deacracht laethúil: Meánach.","finished":"críochnaithe","statsLocal":"Stóráiltear dul chun cinn ar an ngléas seo amháin.","solved":"réitithe","success":"rath","avgTime":"meán-am","streak":"sraith laethanta","byGame":"De réir cluiche","history":"Stair le déanaí","record":"taifead","average":"meán","none":"Níl aon chluiche críochnaithe fós.","solvedStatus":"Réitithe","revealedStatus":"Réiteach feicthe","abandonedStatus":"Tréigthe","finishedStatus":"Críochnaithe","autoCross":"Marcáil X go huathoibríoch nuair a chuirim banríon","queensLegend":"Tapáil cill: folamh → X → banríon. Tarraing feadh ró nó colúin chun X a chur leis; tosaigh ar X chun iad a scriosadh.","patchesLegend":"Tarraing ó chúinne go dtí an cúinne os coinne chun dronuilleog a tharraingt nó a athrú. Má tá leid amháin inti, roghnaítear an réigiún go huathoibríoch. Tapáil dronuilleog atá ann chun í a bhaint.","zone":"Réigiún","aboutTitle":"Maidir le QUADLUD","version":"Leagan","copyright":"Cóipcheart","license":"Ceadúnas","proprietary":"Bogearraí dílseánaigh — Gach ceart ar cosaint.","legal":"Tá cosc ar chóipeáil, modhnú, athdháileadh nó saothrú gan cead scríofa roimh ré ó Serge Benoliel.","restored":"Cluiche athchóirithe","generating":"Á ghiniúint…","rulesTitle":"Rialacha","where":"Cá háit le breathnú","logic":"Loighic","solutionShown":"Réiteach léirithe","congrats":"Maith thú!","gridIncomplete":"Tá earráid nó cill gan réiteach fós ann.","tangoIncomplete":"Ní chomhlíonann an ghreille na rialacha go léir fós.","sudokuIncomplete":"Tá earráid nó cill fholamh fós ann.","autoCrossOn":"X uathoibríocha ar siúl","autoCrossOff":"X uathoibríocha as","queenPlaced":"Cuireadh banríon.","cellRevealed":"Nochtadh cill.","digitRevealed":"Nochtadh digit.","patchRevealed":"Nochtadh cill réigiúin.","finishedShare":"Críochnaithe","dailyLabel":"Dúshlán laethúil","backtrackFlag":"céim curtha ar ais","hintFlag":"leid úsáidte","closeHint":"Dún","hintMove":"Bogadh molta","hintWhy":"Cén fáth","noLogicalHint":"Ní féidir aon bhogadh a bhaint go díreach as an staid reatha.","hintTimeout":"Shroich cuardach na leide an teorainn 5 shoicind. Níor aimsíodh leid iontaofa.","hintSearching":"Ag lorg leide…","hintPaused":"Lean leis an gcluiche chun leid a iarraidh.","hintError":"Níorbh fhéidir cuardach na leide a chríochnú. Bain triail eile as tar éis do chéad bhogadh eile.","dragHint":"Bog","rank1":"tátal leibhéal 1","rank2":"tátal leibhéal 2","rank3":"tátal leibhéal 3","hintNoR0":"Leibhéal 0: gan tátal díreach.","hintNoR1":"Leibhéal 1: ní théann aon toimhde láithreach i sáinn.","hintNoR2":"Leibhéal 2: ní théann aon toimhde i sáinn ar an gcéad leibhéal eile.","hintNoR3":"Leibhéal 3: níor cruthaíodh contrárthacht éigeantach laistigh de thrí leibhéal.","hypothesis":"Toimhde","consequence":"Iarmhairt","deadend":"Sáinn","conclusion":"Conclúid","themeLabel":"Téama","soundsOn":"Fuaimeanna ar siúl","soundsOff":"Fuaimeanna as","resetDone":"Greille athshocraithe.","patchAll":"Caithfidh gach cill a bheith i réigiún.","patchEach":"Caithfidh réigiún a bheith ag gach leid.","patchOwn":"Caithfidh a leid féin a bheith i ngach réigiún.","patchTwo":"Ní féidir dhá leid a bheith i réigiún amháin.","patchConnected":"Caithfidh gach réigiún a bheith ceangailte.","patchRect":"Caithfidh gach réigiún dronuilleog a dhéanamh.","patchSize":"Ní oireann méid an réigiúin don leid.","patchShape":"Ní oireann cruth an réigiúin don leid.","erase":"Scrios","regionSelection":"Roghnú réigiúin","share":"Comhroinn","continue":"Lean ar aghaidh","resultCopied":"Toradh cóipeáilte","shareUnavailable":"Níl comhroinnt ar fáil","victoryKicker":"MAITH THÚ","actions":"Gníomhartha","homeAria":"Baile","changeTheme":"Athraigh téama","visibleOnly":"Bainte as an staid infheicthe amháin.","directReason":"Leanann an bogadh seo go díreach ó na srianta infheicthe.","rank1Reason":"Téann na roghanna eile láithreach i gcontrárthacht.","rank2Reason":"Teipeann ar na roghanna eile leibhéal loighce amháin níos doimhne.","rank3Reason":"Cuireann seiceáil theoranta trí leibhéal an bogadh seo i bhfeidhm.","placeQueen":"Cuir banríon","markX":"Marcáil X","placeSun":"Cuir grian","placeMoon":"Cuir gealach","placeDigit":"Cuir digit","assignRegion":"Sann do réigiún","rowLabel":"ró","columnLabel":"colún"}};
I18N.it={...I18N.en,...{"easy":"Facile","medium":"Medio","hard":"Difficile","expert":"Esperto","gameQueens":"Corone","gameTango":"Sole-Luna","gameSudoku":"Griglia 6","gamePatches":"Rettangoli","newGame":"Nuova","reset":"Reimposta","pause":"Pausa","resume":"Riprendi","check":"Verifica","hint":"Suggerimento","solution":"Soluzione","rules":"Regole","back":"Indietro","play":"Gioca","generated":"generata","score":"punteggio","homeTitle":"Quattro giochi.<br>Una pausa di logica.","homeSub":"Quattro giochi di logica con generazione, cronometro, sfide giornaliere e progressi. Funziona offline dopo il primo caricamento.","queensSub":"Una regina per riga, colonna e regione.","tangoSub":"Bilancia Sole/Luna e relazioni.","sudokuSub":"6×6, righe, colonne e regioni.","patchesSub":"Ricostruisci tutte le regioni rettangolari.","daily":"Sfida giornaliera","dailySub":"completate oggi","stats":"Statistiche e progressi","statsSub":"Cronologia, record e serie","prefs":"Preferenze","prefsSub":"Lingua, tema, suoni e dati locali","about":"Info","aboutSub":"Versione, copyright e licenza","settingsSaved":"Impostazioni salvate su questo dispositivo.","language":"Lingua","languageSub":"30 lingue disponibili","theme":"Tema","themeSub":"Automatico, chiaro o scuro","auto":"Automatico","light":"Chiaro","dark":"Scuro","sounds":"Suoni discreti","soundsSub":"Vittoria e feedback occasionali","on":"Attivi","off":"Disattivi","data":"Dati","dataSub":"Statistiche, sfide e preferenze restano locali.","info":"Info","localDataTitle":"Dati locali","localData":"QUADLUD non richiede un account. Partite, statistiche, sfide giornaliere e preferenze sono memorizzate nel browser di questo dispositivo.","dailyLast":"Ultimi 28 giorni","dailyNote":"Ogni data produce le stesse quattro griglie su tutti i dispositivi con questa versione. Difficoltà giornaliera: Media.","finished":"completate","statsLocal":"I progressi sono salvati solo su questo dispositivo.","solved":"risolte","success":"successo","avgTime":"tempo medio","streak":"serie di giorni","byGame":"Per gioco","history":"Cronologia recente","record":"record","average":"media","none":"Nessuna partita completata.","solvedStatus":"Risolto","revealedStatus":"Soluzione visualizzata","abandonedStatus":"Abbandonato","finishedStatus":"Terminato","autoCross":"Segna automaticamente le X quando posiziono una regina","queensLegend":"Tocca una casella per passare vuota → X → regina. Trascina su una riga o colonna per aggiungere X; parti da una X per cancellarle.","patchesLegend":"Trascina da un angolo a quello opposto per disegnare o ridimensionare un rettangolo. Se contiene un solo indizio, la regione viene selezionata automaticamente. Tocca un rettangolo esistente per eliminarlo.","zone":"Regione","aboutTitle":"Informazioni su QUADLUD","version":"Versione","copyright":"Copyright","license":"Licenza","proprietary":"Software proprietario — Tutti i diritti riservati.","legal":"Sono vietate copia, modifica, ridistribuzione e sfruttamento senza previa autorizzazione scritta di Serge Benoliel.","restored":"Partita ripristinata","generating":"Generazione…","rulesTitle":"Regole","where":"Dove guardare","logic":"Logica","solutionShown":"Soluzione mostrata","congrats":"Bravo!","gridIncomplete":"C'è ancora un errore o una casella irrisolta.","tangoIncomplete":"La griglia non rispetta ancora tutte le regole.","sudokuIncomplete":"C'è ancora un errore o una casella vuota.","autoCrossOn":"X automatiche attive","autoCrossOff":"X automatiche disattive","queenPlaced":"È stata posizionata una regina.","cellRevealed":"È stata rivelata una casella.","digitRevealed":"È stata rivelata una cifra.","patchRevealed":"È stata rivelata una casella della regione.","finishedShare":"Terminato","dailyLabel":"Sfida giornaliera","backtrackFlag":"mossa annullata","hintFlag":"suggerimento usato","closeHint":"Chiudi","hintMove":"Mossa consigliata","hintWhy":"Perché","noLogicalHint":"Nessuna mossa può essere dedotta direttamente dallo stato attuale.","hintTimeout":"La ricerca del suggerimento ha raggiunto il limite di 5 secondi. Nessun suggerimento affidabile è stato trovato.","hintSearching":"Ricerca di un suggerimento…","hintPaused":"Riprendi la partita per chiedere un suggerimento.","hintError":"La ricerca non è riuscita. Riprova dopo la prossima mossa.","dragHint":"Sposta","rank1":"inferenza di livello 1","rank2":"inferenza di livello 2","rank3":"inferenza di livello 3","hintNoR0":"Livello 0: nessuna deduzione diretta.","hintNoR1":"Livello 1: nessuna ipotesi porta subito a un vicolo cieco.","hintNoR2":"Livello 2: nessuna ipotesi porta a un vicolo cieco al livello successivo.","hintNoR3":"Livello 3: nessuna contraddizione forzata è stata dimostrata entro tre livelli.","hypothesis":"Ipotesi","consequence":"Conseguenza","deadend":"Vicolo cieco","conclusion":"Conclusione","themeLabel":"Tema","soundsOn":"Suoni attivi","soundsOff":"Suoni disattivi","resetDone":"Griglia reimpostata.","patchAll":"Ogni casella deve appartenere a una regione.","patchEach":"Ogni indizio deve avere una regione.","patchOwn":"Ogni regione deve contenere il proprio indizio.","patchTwo":"Una regione non può contenere due indizi.","patchConnected":"Ogni regione deve essere connessa.","patchRect":"Ogni regione deve formare un rettangolo.","patchSize":"La dimensione della regione non corrisponde all'indizio.","patchShape":"La forma della regione non corrisponde all'indizio.","erase":"Cancella","regionSelection":"Selezione regione","share":"Condividi","continue":"Continua","resultCopied":"Risultato copiato","shareUnavailable":"Condivisione non disponibile","victoryKicker":"BRAVO","actions":"Azioni","homeAria":"Home","changeTheme":"Cambia tema","visibleOnly":"Dedotto solo dallo stato visibile.","directReason":"Questa mossa deriva direttamente dai vincoli visibili.","rank1Reason":"Le altre possibilità portano subito a una contraddizione.","rank2Reason":"Le altre possibilità falliscono al livello logico successivo.","rank3Reason":"Un controllo limitato a tre livelli impone questa mossa.","placeQueen":"Posiziona una regina","markX":"Segna X","placeSun":"Posiziona un sole","placeMoon":"Posiziona una luna","placeDigit":"Inserisci cifra","assignRegion":"Assegna alla regione","rowLabel":"riga","columnLabel":"colonna"}};
I18N.lv={...I18N.en,...{"easy":"Viegli","medium":"Vidēji","hard":"Grūti","expert":"Eksperts","gameQueens":"Kroņi","gameTango":"Saule-Mēness","gameSudoku":"Režģis 6","gamePatches":"Taisnstūri","newGame":"Jauna","reset":"Atiestatīt","pause":"Pauze","resume":"Turpināt","check":"Pārbaudīt","hint":"Padoms","solution":"Risinājums","rules":"Noteikumi","back":"Atpakaļ","play":"Spēlēt","generated":"ģenerēts","score":"rezultāts","homeTitle":"Četras spēles.<br>Loģikas pauze.","homeSub":"Četras loģikas spēles ar ģenerēšanu, taimeri, dienas izaicinājumiem un progresa uzskaiti. Pēc pirmās ielādes darbojas bezsaistē.","queensSub":"Viena karaliene katrā rindā, kolonnā un reģionā.","tangoSub":"Līdzsvaro Sauli/Mēnesi un attiecības.","sudokuSub":"6×6, rindas, kolonnas un reģioni.","patchesSub":"Atjauno visus taisnstūrveida reģionus.","daily":"Dienas izaicinājums","dailySub":"šodien pabeigti","stats":"Statistika un progress","statsSub":"Vēsture, rekordi un sērijas","prefs":"Iestatījumi","prefsSub":"Valoda, tēma, skaņas un vietējie dati","about":"Par","aboutSub":"Versija, autortiesības un licence","settingsSaved":"Iestatījumi saglabāti šajā ierīcē.","language":"Valoda","languageSub":"Pieejamas 30 valodas","theme":"Tēma","themeSub":"Automātiska, gaiša vai tumša","auto":"Automātiska","light":"Gaiša","dark":"Tumša","sounds":"Klusi skaņu efekti","soundsSub":"Uzvara un reizēm atgriezeniskā saite","on":"Iesl.","off":"Izsl.","data":"Dati","dataSub":"Statistika, izaicinājumi un iestatījumi paliek lokāli.","info":"Info","localDataTitle":"Vietējie dati","localData":"QUADLUD nav nepieciešams konts. Spēles, statistika, dienas izaicinājumi un iestatījumi tiek glabāti šīs ierīces pārlūkā.","dailyLast":"Pēdējās 28 dienas","dailyNote":"Katrs datums rada tās pašas četras mīklas visās ierīcēs ar šo versiju. Dienas grūtība: Vidēji.","finished":"pabeigti","statsLocal":"Progress tiek glabāts tikai šajā ierīcē.","solved":"atrisināti","success":"panākumi","avgTime":"vidējais laiks","streak":"dienu sērija","byGame":"Pēc spēles","history":"Nesenā vēsture","record":"rekords","average":"vidēji","none":"Vēl nav pabeigtu spēļu.","solvedStatus":"Atrisināts","revealedStatus":"Risinājums apskatīts","abandonedStatus":"Pamests","finishedStatus":"Pabeigts","autoCross":"Automātiski atzīmēt X, kad novietoju karalieni","queensLegend":"Pieskaries lauciņam: tukšs → X → karaliene. Velc pa rindu vai kolonnu, lai pievienotu X; sāc uz X, lai tos dzēstu.","patchesLegend":"Velc no viena stūra uz pretējo, lai zīmētu vai mainītu taisnstūri. Ja tajā ir tieši viens pavediens, reģions tiek izvēlēts automātiski. Pieskaries esošam taisnstūrim, lai to noņemtu.","zone":"Reģions","aboutTitle":"Par QUADLUD","version":"Versija","copyright":"Autortiesības","license":"Licence","proprietary":"Īpašniekprogrammatūra — Visas tiesības aizsargātas.","legal":"Kopēšana, pārveidošana, tālāka izplatīšana vai izmantošana bez Serge Benoliel iepriekšējas rakstiskas atļaujas ir aizliegta.","restored":"Spēle atjaunota","generating":"Ģenerē…","rulesTitle":"Noteikumi","where":"Kur skatīties","logic":"Loģika","solutionShown":"Risinājums parādīts","congrats":"Lieliski!","gridIncomplete":"Vēl ir kļūda vai neatrisināts lauciņš.","tangoIncomplete":"Režģis vēl neatbilst visiem noteikumiem.","sudokuIncomplete":"Vēl ir kļūda vai tukšs lauciņš.","autoCrossOn":"Automātiskie X ieslēgti","autoCrossOff":"Automātiskie X izslēgti","queenPlaced":"Karaliene novietota.","cellRevealed":"Lauciņš atklāts.","digitRevealed":"Cipars atklāts.","patchRevealed":"Reģiona lauciņš atklāts.","finishedShare":"Pabeigts","dailyLabel":"Dienas izaicinājums","backtrackFlag":"atsaukts gājiens","hintFlag":"padoms izmantots","closeHint":"Aizvērt","hintMove":"Ieteiktais gājiens","hintWhy":"Kāpēc","noLogicalHint":"No pašreizējā stāvokļa nevar tieši izsecināt gājienu.","hintTimeout":"Padoma meklēšana sasniedza 5 sekunžu robežu. Uzticams padoms netika atrasts.","hintSearching":"Meklē padomu…","hintPaused":"Turpini spēli, lai pieprasītu padomu.","hintError":"Padoma meklēšanu neizdevās pabeigt. Mēģini vēlreiz pēc nākamā gājiena.","dragHint":"Pārvietot","rank1":"1. līmeņa secinājums","rank2":"2. līmeņa secinājums","rank3":"3. līmeņa secinājums","hintNoR0":"0. līmenis: nav tieša secinājuma.","hintNoR1":"1. līmenis: neviens pieņēmums uzreiz nenoved strupceļā.","hintNoR2":"2. līmenis: neviens pieņēmums nākamajā līmenī nenoved strupceļā.","hintNoR3":"3. līmenis: trīs līmeņos netika pierādīta piespiedu pretruna.","hypothesis":"Pieņēmums","consequence":"Sekas","deadend":"Strupceļš","conclusion":"Secinājums","themeLabel":"Tēma","soundsOn":"Skaņas ieslēgtas","soundsOff":"Skaņas izslēgtas","resetDone":"Režģis atiestatīts.","patchAll":"Katram lauciņam jāpieder reģionam.","patchEach":"Katram pavedienam jābūt reģionam.","patchOwn":"Katram reģionam jāsatur savs pavediens.","patchTwo":"Reģionā nedrīkst būt divi pavedieni.","patchConnected":"Katram reģionam jābūt savienotam.","patchRect":"Katram reģionam jāveido taisnstūris.","patchSize":"Reģiona izmērs neatbilst pavedienam.","patchShape":"Reģiona forma neatbilst pavedienam.","erase":"Dzēst","regionSelection":"Reģiona izvēle","share":"Kopīgot","continue":"Turpināt","resultCopied":"Rezultāts nokopēts","shareUnavailable":"Kopīgošana nav pieejama","victoryKicker":"LIELISKI","actions":"Darbības","homeAria":"Sākums","changeTheme":"Mainīt tēmu","visibleOnly":"Secināts tikai no redzamā stāvokļa.","directReason":"Šis gājiens tieši izriet no redzamajiem ierobežojumiem.","rank1Reason":"Pārējās iespējas uzreiz rada pretrunu.","rank2Reason":"Pārējās iespējas neizdodas vienu loģikas līmeni dziļāk.","rank3Reason":"Ierobežota trīs līmeņu pārbaude piespiež šo gājienu.","placeQueen":"Novieto karalieni","markX":"Atzīmē X","placeSun":"Novieto sauli","placeMoon":"Novieto mēnesi","placeDigit":"Ievadi ciparu","assignRegion":"Piešķir reģionam","rowLabel":"rinda","columnLabel":"kolonna"}};
I18N.lt={...I18N.en,...{"easy":"Lengva","medium":"Vidutinė","hard":"Sunki","expert":"Ekspertas","gameQueens":"Karūnos","gameTango":"Saulė-Mėnulis","gameSudoku":"Tinklelis 6","gamePatches":"Stačiakampiai","newGame":"Nauja","reset":"Atkurti","pause":"Pauzė","resume":"Tęsti","check":"Tikrinti","hint":"Užuomina","solution":"Sprendimas","rules":"Taisyklės","back":"Atgal","play":"Žaisti","generated":"sugeneruota","score":"taškai","homeTitle":"Keturi žaidimai.<br>Loginė pertrauka.","homeSub":"Keturi loginiai žaidimai su generavimu, laikmačiu, dienos iššūkiais ir pažangos sekimu. Po pirmo įkėlimo veikia neprisijungus.","queensSub":"Po vieną karalienę kiekvienoje eilutėje, stulpelyje ir srityje.","tangoSub":"Subalansuok Saulę/Mėnulį ir ryšius.","sudokuSub":"6×6, eilutės, stulpeliai ir sritys.","patchesSub":"Atkurk visas stačiakampes sritis.","daily":"Dienos iššūkis","dailySub":"šiandien baigta","stats":"Statistika ir pažanga","statsSub":"Istorija, rekordai ir serijos","prefs":"Nustatymai","prefsSub":"Kalba, tema, garsai ir vietiniai duomenys","about":"Apie","aboutSub":"Versija, autorių teisės ir licencija","settingsSaved":"Nustatymai išsaugoti šiame įrenginyje.","language":"Kalba","languageSub":"Galima 30 kalbų","theme":"Tema","themeSub":"Automatinė, šviesi arba tamsi","auto":"Automatinė","light":"Šviesi","dark":"Tamsi","sounds":"Subtilūs garsai","soundsSub":"Pergalė ir retkarčiais grįžtamasis ryšys","on":"Įjungta","off":"Išjungta","data":"Duomenys","dataSub":"Statistika, iššūkiai ir nustatymai lieka vietiniai.","info":"Info","localDataTitle":"Vietiniai duomenys","localData":"QUADLUD nereikalauja paskyros. Žaidimai, statistika, dienos iššūkiai ir nustatymai saugomi šio įrenginio naršyklėje.","dailyLast":"Paskutinės 28 dienos","dailyNote":"Kiekviena data sukuria tas pačias keturias dėliones visuose šios versijos įrenginiuose. Dienos sunkumas: Vidutinė.","finished":"baigta","statsLocal":"Pažanga saugoma tik šiame įrenginyje.","solved":"išspręsta","success":"sėkmė","avgTime":"vidutinis laikas","streak":"dienų serija","byGame":"Pagal žaidimą","history":"Naujausia istorija","record":"rekordas","average":"vidurkis","none":"Dar nėra baigtų žaidimų.","solvedStatus":"Išspręsta","revealedStatus":"Sprendimas parodytas","abandonedStatus":"Nutraukta","finishedStatus":"Baigta","autoCross":"Automatiškai žymėti X pastačius karalienę","queensLegend":"Bakstelėk langelį: tuščias → X → karalienė. Brauk per eilutę ar stulpelį, kad pridėtum X; pradėk nuo X, kad juos ištrintum.","patchesLegend":"Brauk nuo vieno kampo iki priešingo, kad nubrėžtum ar pakeistum stačiakampį. Jei jame tik viena užuomina, sritis parenkama automatiškai. Bakstelėk esamą stačiakampį, kad jį pašalintum.","zone":"Sritis","aboutTitle":"Apie QUADLUD","version":"Versija","copyright":"Autorių teisės","license":"Licencija","proprietary":"Nuosavybinė programinė įranga — Visos teisės saugomos.","legal":"Kopijuoti, keisti, platinti ar naudoti be išankstinio raštiško Serge Benoliel leidimo draudžiama.","restored":"Žaidimas atkurtas","generating":"Generuojama…","rulesTitle":"Taisyklės","where":"Kur žiūrėti","logic":"Logika","solutionShown":"Sprendimas parodytas","congrats":"Puiku!","gridIncomplete":"Dar yra klaida arba neišspręstas langelis.","tangoIncomplete":"Tinklelis dar neatitinka visų taisyklių.","sudokuIncomplete":"Dar yra klaida arba tuščias langelis.","autoCrossOn":"Automatiniai X įjungti","autoCrossOff":"Automatiniai X išjungti","queenPlaced":"Karalienė padėta.","cellRevealed":"Langelis atskleistas.","digitRevealed":"Skaitmuo atskleistas.","patchRevealed":"Srities langelis atskleistas.","finishedShare":"Baigta","dailyLabel":"Dienos iššūkis","backtrackFlag":"atšauktas ėjimas","hintFlag":"naudota užuomina","closeHint":"Uždaryti","hintMove":"Siūlomas ėjimas","hintWhy":"Kodėl","noLogicalHint":"Iš dabartinės būsenos negalima tiesiogiai išvesti ėjimo.","hintTimeout":"Užuominos paieška pasiekė 5 sekundžių ribą. Patikima užuomina nerasta.","hintSearching":"Ieškoma užuominos…","hintPaused":"Tęsk žaidimą, kad paprašytum užuominos.","hintError":"Užuominos paieškos nepavyko užbaigti. Bandyk dar kartą po kito ėjimo.","dragHint":"Perkelti","rank1":"1 lygio išvada","rank2":"2 lygio išvada","rank3":"3 lygio išvada","hintNoR0":"0 lygis: nėra tiesioginės išvados.","hintNoR1":"1 lygis: jokia prielaida iškart neveda į aklavietę.","hintNoR2":"2 lygis: jokia prielaida kitame lygyje neveda į aklavietę.","hintNoR3":"3 lygis: per tris lygius neįrodyta priverstinė prieštara.","hypothesis":"Prielaida","consequence":"Pasekmė","deadend":"Aklavietė","conclusion":"Išvada","themeLabel":"Tema","soundsOn":"Garsai įjungti","soundsOff":"Garsai išjungti","resetDone":"Tinklelis atkurtas.","patchAll":"Kiekvienas langelis turi priklausyti sričiai.","patchEach":"Kiekviena užuomina turi turėti sritį.","patchOwn":"Kiekvienoje srityje turi būti jos užuomina.","patchTwo":"Srityje negali būti dviejų užuominų.","patchConnected":"Kiekviena sritis turi būti vientisa.","patchRect":"Kiekviena sritis turi sudaryti stačiakampį.","patchSize":"Srities dydis neatitinka užuominos.","patchShape":"Srities forma neatitinka užuominos.","erase":"Ištrinti","regionSelection":"Srities pasirinkimas","share":"Dalintis","continue":"Tęsti","resultCopied":"Rezultatas nukopijuotas","shareUnavailable":"Dalijimasis nepasiekiamas","victoryKicker":"PUIKU","actions":"Veiksmai","homeAria":"Pradžia","changeTheme":"Keisti temą","visibleOnly":"Išvesta tik iš matomos būsenos.","directReason":"Šis ėjimas tiesiogiai kyla iš matomų apribojimų.","rank1Reason":"Kitos galimybės iškart sukelia prieštarą.","rank2Reason":"Kitos galimybės žlunga vienu logikos lygiu giliau.","rank3Reason":"Ribotas trijų lygių patikrinimas priverčia šį ėjimą.","placeQueen":"Padėk karalienę","markX":"Pažymėk X","placeSun":"Padėk saulę","placeMoon":"Padėk mėnulį","placeDigit":"Įrašyk skaitmenį","assignRegion":"Priskirk sričiai","rowLabel":"eilutė","columnLabel":"stulpelis"}};
I18N.mt={...I18N.en,...{"easy":"Faċli","medium":"Medju","hard":"Diffiċli","expert":"Espert","gameQueens":"Kuruni","gameTango":"Xemx-Qamar","gameSudoku":"Grilja 6","gamePatches":"Rettangoli","newGame":"Ġdida","reset":"Irrisettja","pause":"Pawża","resume":"Kompli","check":"Iċċekkja","hint":"Ħjiel","solution":"Soluzzjoni","rules":"Regoli","back":"Lura","play":"Ilgħab","generated":"iġġenerata","score":"punteġġ","homeTitle":"Erba’ logħob.<br>Waqfa ta’ loġika.","homeSub":"Erba’ logħob ta’ loġika b’ġenerazzjoni, tajmer, sfidi ta’ kuljum u progress. Jaħdem offline wara l-ewwel tagħbija.","queensSub":"Reġina waħda f’kull ringiela, kolonna u reġjun.","tangoSub":"Ibbilanċja Xemx/Qamar u r-relazzjonijiet.","sudokuSub":"6×6, ringieli, kolonni u reġjuni.","patchesSub":"Ibni mill-ġdid ir-reġjuni rettangolari kollha.","daily":"Sfida ta’ kuljum","dailySub":"lesti llum","stats":"Statistika u progress","statsSub":"Storja, rekords u serje","prefs":"Preferenzi","prefsSub":"Lingwa, tema, ħsejjes u data lokali","about":"Dwar","aboutSub":"Verżjoni, copyright u liċenzja","settingsSaved":"Is-settings ġew salvati fuq dan l-apparat.","language":"Lingwa","languageSub":"30 lingwa disponibbli","theme":"Tema","themeSub":"Awtomatika, ċara jew skura","auto":"Awtomatika","light":"Ċara","dark":"Skura","sounds":"Ħsejjes diskreti","soundsSub":"Rebħa u feedback okkażjonali","on":"Mixgħul","off":"Mitfi","data":"Data","dataSub":"Statistika, sfidi u preferenzi jibqgħu lokali.","info":"Info","localDataTitle":"Data lokali","localData":"QUADLUD ma jeħtieġx kont. Il-logħob, l-istatistika, l-isfidi ta’ kuljum u l-preferenzi jinħażnu fil-browser ta’ dan l-apparat.","dailyLast":"L-aħħar 28 jum","dailyNote":"Kull data tipproduċi l-istess erba’ puzzles fuq l-apparati kollha b’din il-verżjoni. Diffikultà ta’ kuljum: Medju.","finished":"lesti","statsLocal":"Il-progress jinħażen biss fuq dan l-apparat.","solved":"solvuti","success":"suċċess","avgTime":"ħin medju","streak":"serje ta’ jiem","byGame":"Skont il-logħba","history":"Storja riċenti","record":"rekord","average":"medja","none":"Għad m’hemm l-ebda logħba lesta.","solvedStatus":"Solvut","revealedStatus":"Soluzzjoni murija","abandonedStatus":"Abbandunat","finishedStatus":"Lest","autoCross":"Immarka X awtomatikament meta nqiegħed reġina","queensLegend":"Tektek ċella: vojta → X → reġina. Iġbed tul ringiela jew kolonna biex iżżid X; ibda fuq X biex tħassarhom.","patchesLegend":"Iġbed minn rokna għall-opposta biex tiġbed jew tbiddel rettangolu. Jekk fih ħjiel wieħed biss, ir-reġjun jintgħażel awtomatikament. Tektek rettangolu eżistenti biex tneħħih.","zone":"Reġjun","aboutTitle":"Dwar QUADLUD","version":"Verżjoni","copyright":"Copyright","license":"Liċenzja","proprietary":"Software proprjetarju — Id-drittijiet kollha riżervati.","legal":"Kopjar, modifika, ridistribuzzjoni jew sfruttament mingħajr permess bil-miktub minn qabel ta’ Serge Benoliel huma pprojbiti.","restored":"Logħba rrestawrata","generating":"Qed tiġġenera…","rulesTitle":"Regoli","where":"Fejn tħares","logic":"Loġika","solutionShown":"Soluzzjoni murija","congrats":"Prosit!","gridIncomplete":"Għad hemm żball jew ċella mhux solvuta.","tangoIncomplete":"Il-grilja għadha ma tissodisfax ir-regoli kollha.","sudokuIncomplete":"Għad hemm żball jew ċella vojta.","autoCrossOn":"X awtomatiċi mixgħula","autoCrossOff":"X awtomatiċi mitfija","queenPlaced":"Tqiegħdet reġina.","cellRevealed":"Ċella ġiet żvelata.","digitRevealed":"Ċifra ġiet żvelata.","patchRevealed":"Ċella tar-reġjun ġiet żvelata.","finishedShare":"Lest","dailyLabel":"Sfida ta’ kuljum","backtrackFlag":"pass lura","hintFlag":"ħjiel użat","closeHint":"Agħlaq","hintMove":"Mossa ssuġġerita","hintWhy":"Għaliex","noLogicalHint":"L-ebda mossa ma tista’ tiġi dedotta direttament mill-istat attwali.","hintTimeout":"It-tfittxija għall-ħjiel laħqet il-limitu ta’ 5 sekondi. Ma nstabx ħjiel affidabbli.","hintSearching":"Qed tfittex ħjiel…","hintPaused":"Kompli l-logħba biex titlob ħjiel.","hintError":"It-tfittxija għall-ħjiel ma setgħetx titlesta. Erġa’ pprova wara l-mossa li jmiss.","dragHint":"Mexxi","rank1":"inferenza livell 1","rank2":"inferenza livell 2","rank3":"inferenza livell 3","hintNoR0":"Livell 0: ebda deduzzjoni diretta.","hintNoR1":"Livell 1: l-ebda suppożizzjoni ma twassal minnufih għal triq magħluqa.","hintNoR2":"Livell 2: l-ebda suppożizzjoni ma twassal għal triq magħluqa fil-livell li jmiss.","hintNoR3":"Livell 3: ma ġietx ippruvata kontradizzjoni sfurzata fi tliet livelli.","hypothesis":"Suppożizzjoni","consequence":"Konsegwenza","deadend":"Triq magħluqa","conclusion":"Konklużjoni","themeLabel":"Tema","soundsOn":"Ħsejjes mixgħula","soundsOff":"Ħsejjes mitfija","resetDone":"Grilja rrisettjata.","patchAll":"Kull ċella trid tappartjeni għal reġjun.","patchEach":"Kull ħjiel irid ikollu reġjun.","patchOwn":"Kull reġjun irid ikun fih il-ħjiel tiegħu.","patchTwo":"Reġjun ma jistax ikun fih żewġ ħjiel.","patchConnected":"Kull reġjun irid ikun konness.","patchRect":"Kull reġjun irid jifforma rettangolu.","patchSize":"Id-daqs tar-reġjun ma jaqbilx mal-ħjiel.","patchShape":"Il-forma tar-reġjun ma taqbilx mal-ħjiel.","erase":"Ħassar","regionSelection":"Għażla tar-reġjun","share":"Aqsam","continue":"Kompli","resultCopied":"Riżultat ikkupjat","shareUnavailable":"Il-qsim mhux disponibbli","victoryKicker":"PROSIT","actions":"Azzjonijiet","homeAria":"Paġna ewlenija","changeTheme":"Ibdel it-tema","visibleOnly":"Dedott biss mill-istat viżibbli.","directReason":"Din il-mossa ssegwi direttament mir-restrizzjonijiet viżibbli.","rank1Reason":"L-għażliet l-oħra jwasslu minnufih għal kontradizzjoni.","rank2Reason":"L-għażliet l-oħra jfallu livell loġiku aktar fil-fond.","rank3Reason":"Kontroll limitat għal tliet livelli jisforza din il-mossa.","placeQueen":"Poġġi reġina","markX":"Immarka X","placeSun":"Poġġi xemx","placeMoon":"Poġġi qamar","placeDigit":"Poġġi ċifra","assignRegion":"Assenja lir-reġjun","rowLabel":"ringiela","columnLabel":"kolonna"}};
I18N.pl={...I18N.en,...{"easy":"Łatwy","medium":"Średni","hard":"Trudny","expert":"Ekspert","gameQueens":"Korony","gameTango":"Słońce-Księżyc","gameSudoku":"Siatka 6","gamePatches":"Prostokąty","newGame":"Nowa","reset":"Resetuj","pause":"Pauza","resume":"Wznów","check":"Sprawdź","hint":"Podpowiedź","solution":"Rozwiązanie","rules":"Zasady","back":"Wstecz","play":"Graj","generated":"wygenerowana","score":"wynik","homeTitle":"Cztery gry.<br>Przerwa na logikę.","homeSub":"Cztery gry logiczne z generowaniem, stoperem, codziennymi wyzwaniami i postępami. Po pierwszym uruchomieniu działa offline.","queensSub":"Jedna królowa w każdym wierszu, kolumnie i regionie.","tangoSub":"Równowaga Słońce/Księżyc i relacje.","sudokuSub":"6×6, wiersze, kolumny i regiony.","patchesSub":"Odtwórz wszystkie prostokątne regiony.","daily":"Codzienne wyzwanie","dailySub":"ukończone dzisiaj","stats":"Statystyki i postęp","statsSub":"Historia, rekordy i serie","prefs":"Ustawienia","prefsSub":"Język, motyw, dźwięki i dane lokalne","about":"O aplikacji","aboutSub":"Wersja, prawa autorskie i licencja","settingsSaved":"Ustawienia zapisano na tym urządzeniu.","language":"Język","languageSub":"Dostępnych 30 języków","theme":"Motyw","themeSub":"Automatyczny, jasny lub ciemny","auto":"Automatyczny","light":"Jasny","dark":"Ciemny","sounds":"Dyskretne dźwięki","soundsSub":"Wygrana i sporadyczne informacje zwrotne","on":"Wł.","off":"Wył.","data":"Dane","dataSub":"Statystyki, wyzwania i preferencje pozostają lokalne.","info":"Info","localDataTitle":"Dane lokalne","localData":"QUADLUD nie wymaga konta. Gry, statystyki, codzienne wyzwania i preferencje są zapisywane w przeglądarce tego urządzenia.","dailyLast":"Ostatnie 28 dni","dailyNote":"Każda data tworzy te same cztery plansze na wszystkich urządzeniach z tą wersją. Poziom dzienny: Średni.","finished":"ukończone","statsLocal":"Postęp jest zapisywany tylko na tym urządzeniu.","solved":"rozwiązane","success":"skuteczność","avgTime":"średni czas","streak":"seria dni","byGame":"Według gry","history":"Ostatnia historia","record":"rekord","average":"średnia","none":"Brak ukończonych gier.","solvedStatus":"Rozwiązano","revealedStatus":"Pokazano rozwiązanie","abandonedStatus":"Porzucono","finishedStatus":"Ukończono","autoCross":"Automatycznie zaznaczaj X po ustawieniu królowej","queensLegend":"Dotknij pola, aby przejść: puste → X → królowa. Przeciągnij po wierszu lub kolumnie, aby dodawać X; zacznij na X, aby je usuwać.","patchesLegend":"Przeciągnij od jednego rogu do przeciwnego, aby narysować lub zmienić prostokąt. Gdy zawiera jedną wskazówkę, region wybiera się automatycznie. Dotknij istniejącego prostokąta, aby go usunąć.","zone":"Region","aboutTitle":"O QUADLUD","version":"Wersja","copyright":"Prawa autorskie","license":"Licencja","proprietary":"Oprogramowanie własnościowe — Wszelkie prawa zastrzeżone.","legal":"Kopiowanie, modyfikowanie, redystrybucja i wykorzystywanie bez uprzedniej pisemnej zgody Serge'a Benoliela są zabronione.","restored":"Gra przywrócona","generating":"Generowanie…","rulesTitle":"Zasady","where":"Gdzie patrzeć","logic":"Logika","solutionShown":"Pokazano rozwiązanie","congrats":"Brawo!","gridIncomplete":"Pozostał błąd lub nierozwiązane pole.","tangoIncomplete":"Plansza nie spełnia jeszcze wszystkich zasad.","sudokuIncomplete":"Pozostał błąd lub puste pole.","autoCrossOn":"Automatyczne X włączone","autoCrossOff":"Automatyczne X wyłączone","queenPlaced":"Ustawiono królową.","cellRevealed":"Odsłonięto pole.","digitRevealed":"Odsłonięto cyfrę.","patchRevealed":"Odsłonięto pole regionu.","finishedShare":"Ukończono","dailyLabel":"Codzienne wyzwanie","backtrackFlag":"cofnięto ruch","hintFlag":"użyto podpowiedzi","closeHint":"Zamknij","hintMove":"Sugerowany ruch","hintWhy":"Dlaczego","noLogicalHint":"Z obecnego stanu nie da się bezpośrednio wywnioskować ruchu.","hintTimeout":"Wyszukiwanie podpowiedzi osiągnęło limit 5 sekund. Nie znaleziono wiarygodnej podpowiedzi.","hintSearching":"Szukanie podpowiedzi…","hintPaused":"Wznów grę, aby poprosić o podpowiedź.","hintError":"Nie udało się zakończyć wyszukiwania. Spróbuj ponownie po następnym ruchu.","dragHint":"Przenieś","rank1":"wnioskowanie poziomu 1","rank2":"wnioskowanie poziomu 2","rank3":"wnioskowanie poziomu 3","hintNoR0":"Poziom 0: brak bezpośredniego wniosku.","hintNoR1":"Poziom 1: żadne założenie nie prowadzi od razu do ślepej uliczki.","hintNoR2":"Poziom 2: żadne założenie nie prowadzi do ślepej uliczki na kolejnym poziomie.","hintNoR3":"Poziom 3: w trzech poziomach nie wykazano wymuszonej sprzeczności.","hypothesis":"Założenie","consequence":"Konsekwencja","deadend":"Ślepa uliczka","conclusion":"Wniosek","themeLabel":"Motyw","soundsOn":"Dźwięki włączone","soundsOff":"Dźwięki wyłączone","resetDone":"Plansza zresetowana.","patchAll":"Każde pole musi należeć do regionu.","patchEach":"Każda wskazówka musi mieć region.","patchOwn":"Każdy region musi zawierać własną wskazówkę.","patchTwo":"Region nie może zawierać dwóch wskazówek.","patchConnected":"Każdy region musi być spójny.","patchRect":"Każdy region musi tworzyć prostokąt.","patchSize":"Rozmiar regionu nie pasuje do wskazówki.","patchShape":"Kształt regionu nie pasuje do wskazówki.","erase":"Usuń","regionSelection":"Wybór regionu","share":"Udostępnij","continue":"Kontynuuj","resultCopied":"Wynik skopiowany","shareUnavailable":"Udostępnianie niedostępne","victoryKicker":"BRAWO","actions":"Akcje","homeAria":"Strona główna","changeTheme":"Zmień motyw","visibleOnly":"Wywnioskowano wyłącznie z widocznego stanu.","directReason":"Ten ruch wynika bezpośrednio z widocznych ograniczeń.","rank1Reason":"Pozostałe możliwości natychmiast prowadzą do sprzeczności.","rank2Reason":"Pozostałe możliwości zawodzą o jeden poziom logiczny głębiej.","rank3Reason":"Ograniczone sprawdzenie do trzech poziomów wymusza ten ruch.","placeQueen":"Ustaw królową","markX":"Zaznacz X","placeSun":"Ustaw słońce","placeMoon":"Ustaw księżyc","placeDigit":"Wpisz cyfrę","assignRegion":"Przypisz do regionu","rowLabel":"wiersz","columnLabel":"kolumna"}};
I18N.ro={...I18N.en,...{"easy":"Ușor","medium":"Mediu","hard":"Dificil","expert":"Expert","gameQueens":"Coroane","gameTango":"Soare-Lună","gameSudoku":"Grilă 6","gamePatches":"Dreptunghiuri","newGame":"Nou","reset":"Resetează","pause":"Pauză","resume":"Continuă","check":"Verifică","hint":"Indiciu","solution":"Soluție","rules":"Reguli","back":"Înapoi","play":"Joacă","generated":"generată","score":"scor","homeTitle":"Patru jocuri.<br>O pauză de logică.","homeSub":"Patru jocuri de logică cu generare, cronometru, provocări zilnice și progres. Funcționează offline după prima încărcare.","queensSub":"O regină pe fiecare rând, coloană și regiune.","tangoSub":"Echilibrează Soare/Lună și relațiile.","sudokuSub":"6×6, rânduri, coloane și regiuni.","patchesSub":"Reconstruiește toate regiunile dreptunghiulare.","daily":"Provocarea zilnică","dailySub":"finalizate azi","stats":"Statistici și progres","statsSub":"Istoric, recorduri și serii","prefs":"Preferințe","prefsSub":"Limbă, temă, sunete și date locale","about":"Despre","aboutSub":"Versiune, copyright și licență","settingsSaved":"Setările au fost salvate pe acest dispozitiv.","language":"Limbă","languageSub":"30 de limbi disponibile","theme":"Temă","themeSub":"Automată, deschisă sau închisă","auto":"Automată","light":"Deschisă","dark":"Închisă","sounds":"Sunete discrete","soundsSub":"Victorie și feedback ocazional","on":"Pornit","off":"Oprit","data":"Date","dataSub":"Statisticile, provocările și preferințele rămân locale.","info":"Info","localDataTitle":"Date locale","localData":"QUADLUD nu necesită cont. Jocurile, statisticile, provocările zilnice și preferințele sunt stocate în browserul acestui dispozitiv.","dailyLast":"Ultimele 28 de zile","dailyNote":"Fiecare dată produce aceleași patru grile pe toate dispozitivele cu această versiune. Dificultate zilnică: Mediu.","finished":"finalizate","statsLocal":"Progresul este stocat doar pe acest dispozitiv.","solved":"rezolvate","success":"succes","avgTime":"timp mediu","streak":"serie de zile","byGame":"Pe joc","history":"Istoric recent","record":"record","average":"medie","none":"Niciun joc finalizat încă.","solvedStatus":"Rezolvat","revealedStatus":"Soluție vizualizată","abandonedStatus":"Abandonat","finishedStatus":"Finalizat","autoCross":"Marchează automat X când așez o regină","queensLegend":"Atinge o celulă pentru gol → X → regină. Glisează pe un rând sau coloană pentru a adăuga X; pornește de pe un X pentru a le șterge.","patchesLegend":"Glisează dintr-un colț în cel opus pentru a desena sau redimensiona un dreptunghi. Dacă are un singur indiciu, regiunea se selectează automat. Atinge un dreptunghi existent pentru a-l șterge.","zone":"Regiune","aboutTitle":"Despre QUADLUD","version":"Versiune","copyright":"Copyright","license":"Licență","proprietary":"Software proprietar — Toate drepturile rezervate.","legal":"Copierea, modificarea, redistribuirea și exploatarea fără acordul scris prealabil al lui Serge Benoliel sunt interzise.","restored":"Joc restaurat","generating":"Se generează…","rulesTitle":"Reguli","where":"Unde să privești","logic":"Logică","solutionShown":"Soluție afișată","congrats":"Bravo!","gridIncomplete":"Mai există o eroare sau o celulă nerezolvată.","tangoIncomplete":"Grila nu respectă încă toate regulile.","sudokuIncomplete":"Mai există o eroare sau o celulă goală.","autoCrossOn":"X automate activate","autoCrossOff":"X automate dezactivate","queenPlaced":"A fost plasată o regină.","cellRevealed":"A fost dezvăluită o celulă.","digitRevealed":"A fost dezvăluită o cifră.","patchRevealed":"A fost dezvăluită o celulă de regiune.","finishedShare":"Finalizat","dailyLabel":"Provocarea zilnică","backtrackFlag":"revenire","hintFlag":"indiciu folosit","closeHint":"Închide","hintMove":"Mutare sugerată","hintWhy":"De ce","noLogicalHint":"Nicio mutare nu poate fi dedusă direct din starea curentă.","hintTimeout":"Căutarea indiciului a atins limita de 5 secunde. Nu s-a găsit un indiciu sigur.","hintSearching":"Se caută un indiciu…","hintPaused":"Continuă jocul pentru a cere un indiciu.","hintError":"Căutarea indiciului nu s-a putut încheia. Încearcă din nou după următoarea mutare.","dragHint":"Mută","rank1":"inferență de nivel 1","rank2":"inferență de nivel 2","rank3":"inferență de nivel 3","hintNoR0":"Nivel 0: nicio deducție directă.","hintNoR1":"Nivel 1: nicio ipoteză nu duce imediat la un impas.","hintNoR2":"Nivel 2: nicio ipoteză nu duce la un impas la nivelul următor.","hintNoR3":"Nivel 3: nu s-a demonstrat nicio contradicție forțată în trei niveluri.","hypothesis":"Ipoteză","consequence":"Consecință","deadend":"Impas","conclusion":"Concluzie","themeLabel":"Temă","soundsOn":"Sunete activate","soundsOff":"Sunete dezactivate","resetDone":"Grilă resetată.","patchAll":"Fiecare celulă trebuie să aparțină unei regiuni.","patchEach":"Fiecare indiciu trebuie să aibă o regiune.","patchOwn":"Fiecare regiune trebuie să conțină propriul indiciu.","patchTwo":"O regiune nu poate conține două indicii.","patchConnected":"Fiecare regiune trebuie să fie conectată.","patchRect":"Fiecare regiune trebuie să formeze un dreptunghi.","patchSize":"Dimensiunea regiunii nu corespunde indiciului.","patchShape":"Forma regiunii nu corespunde indiciului.","erase":"Șterge","regionSelection":"Selectarea regiunii","share":"Distribuie","continue":"Continuă","resultCopied":"Rezultat copiat","shareUnavailable":"Distribuirea nu este disponibilă","victoryKicker":"BRAVO","actions":"Acțiuni","homeAria":"Acasă","changeTheme":"Schimbă tema","visibleOnly":"Deducție doar din starea vizibilă.","directReason":"Această mutare rezultă direct din constrângerile vizibile.","rank1Reason":"Celelalte posibilități duc imediat la o contradicție.","rank2Reason":"Celelalte posibilități eșuează la următorul nivel logic.","rank3Reason":"O verificare limitată la trei niveluri impune această mutare.","placeQueen":"Plasează o regină","markX":"Marchează X","placeSun":"Plasează un soare","placeMoon":"Plasează o lună","placeDigit":"Introdu cifra","assignRegion":"Atribuie regiunii","rowLabel":"rând","columnLabel":"coloană"}};
I18N.sk={...I18N.en,...{"easy":"Ľahká","medium":"Stredná","hard":"Ťažká","expert":"Expert","gameQueens":"Koruny","gameTango":"Slnko-Mesiac","gameSudoku":"Mriežka 6","gamePatches":"Obdĺžniky","newGame":"Nová","reset":"Resetovať","pause":"Pauza","resume":"Pokračovať","check":"Skontrolovať","hint":"Pomôcka","solution":"Riešenie","rules":"Pravidlá","back":"Späť","play":"Hrať","generated":"vygenerovaná","score":"skóre","homeTitle":"Štyri hry.<br>Logická prestávka.","homeSub":"Štyri logické hry s generovaním, časovačom, dennými výzvami a sledovaním pokroku. Po prvom načítaní fungujú offline.","queensSub":"Jedna kráľovná v každom riadku, stĺpci a oblasti.","tangoSub":"Vyváž Slnko/Mesiac a vzťahy.","sudokuSub":"6×6, riadky, stĺpce a oblasti.","patchesSub":"Obnov všetky obdĺžnikové oblasti.","daily":"Denná výzva","dailySub":"dnes dokončené","stats":"Štatistiky a pokrok","statsSub":"História, rekordy a série","prefs":"Nastavenia","prefsSub":"Jazyk, motív, zvuky a lokálne dáta","about":"O aplikácii","aboutSub":"Verzia, autorské práva a licencia","settingsSaved":"Nastavenia boli uložené v tomto zariadení.","language":"Jazyk","languageSub":"K dispozícii je 30 jazykov","theme":"Motív","themeSub":"Automatický, svetlý alebo tmavý","auto":"Automatický","light":"Svetlý","dark":"Tmavý","sounds":"Jemné zvuky","soundsSub":"Výhra a občasná odozva","on":"Zap.","off":"Vyp.","data":"Dáta","dataSub":"Štatistiky, výzvy a nastavenia zostávajú lokálne.","info":"Info","localDataTitle":"Lokálne dáta","localData":"QUADLUD nevyžaduje účet. Hry, štatistiky, denné výzvy a nastavenia sa ukladajú v prehliadači tohto zariadenia.","dailyLast":"Posledných 28 dní","dailyNote":"Každý dátum vytvorí rovnaké štyri hlavolamy na všetkých zariadeniach s touto verziou. Denná obtiažnosť: Stredná.","finished":"dokončené","statsLocal":"Pokrok sa ukladá iba v tomto zariadení.","solved":"vyriešené","success":"úspešnosť","avgTime":"priemerný čas","streak":"séria dní","byGame":"Podľa hry","history":"Nedávna história","record":"rekord","average":"priemer","none":"Zatiaľ žiadna dokončená hra.","solvedStatus":"Vyriešené","revealedStatus":"Riešenie zobrazené","abandonedStatus":"Opustené","finishedStatus":"Dokončené","autoCross":"Automaticky označiť X po položení kráľovnej","queensLegend":"Ťuknutím prepínaš prázdne → X → kráľovná. Potiahnutím po riadku alebo stĺpci pridáš X; začni na X, ak ich chceš mazať.","patchesLegend":"Potiahni z jedného rohu do protiľahlého a nakresli alebo zmeň obdĺžnik. Ak obsahuje presne jednu pomôcku, oblasť sa vyberie automaticky. Ťuknutím na existujúci obdĺžnik ho odstrániš.","zone":"Oblasť","aboutTitle":"O QUADLUD","version":"Verzia","copyright":"Autorské práva","license":"Licencia","proprietary":"Proprietárny softvér — Všetky práva vyhradené.","legal":"Kopírovanie, úpravy, ďalšie šírenie alebo využívanie bez predchádzajúceho písomného súhlasu Sergea Benoliela je zakázané.","restored":"Hra obnovená","generating":"Generovanie…","rulesTitle":"Pravidlá","where":"Kam sa pozrieť","logic":"Logika","solutionShown":"Riešenie zobrazené","congrats":"Výborne!","gridIncomplete":"Zostáva chyba alebo nevyriešené políčko.","tangoIncomplete":"Mriežka ešte nespĺňa všetky pravidlá.","sudokuIncomplete":"Zostáva chyba alebo prázdne políčko.","autoCrossOn":"Automatické X zapnuté","autoCrossOff":"Automatické X vypnuté","queenPlaced":"Kráľovná bola položená.","cellRevealed":"Políčko bolo odhalené.","digitRevealed":"Číslica bola odhalená.","patchRevealed":"Políčko oblasti bolo odhalené.","finishedShare":"Dokončené","dailyLabel":"Denná výzva","backtrackFlag":"vrátený ťah","hintFlag":"použitá pomôcka","closeHint":"Zavrieť","hintMove":"Odporúčaný ťah","hintWhy":"Prečo","noLogicalHint":"Z aktuálneho stavu nemožno priamo odvodiť žiadny ťah.","hintTimeout":"Hľadanie pomôcky dosiahlo limit 5 sekúnd. Spoľahlivá pomôcka sa nenašla.","hintSearching":"Hľadanie pomôcky…","hintPaused":"Ak chceš pomôcku, pokračuj v hre.","hintError":"Hľadanie pomôcky sa nepodarilo dokončiť. Skús to po ďalšom ťahu.","dragHint":"Presunúť","rank1":"odvodenie úrovne 1","rank2":"odvodenie úrovne 2","rank3":"odvodenie úrovne 3","hintNoR0":"Úroveň 0: žiadne priame odvodenie.","hintNoR1":"Úroveň 1: žiadny predpoklad nevedie okamžite do slepej uličky.","hintNoR2":"Úroveň 2: žiadny predpoklad nevedie na ďalšej úrovni do slepej uličky.","hintNoR3":"Úroveň 3: v troch úrovniach sa nepreukázal vynútený rozpor.","hypothesis":"Predpoklad","consequence":"Dôsledok","deadend":"Slepá ulička","conclusion":"Záver","themeLabel":"Motív","soundsOn":"Zvuky zapnuté","soundsOff":"Zvuky vypnuté","resetDone":"Mriežka resetovaná.","patchAll":"Každé políčko musí patriť do oblasti.","patchEach":"Každá pomôcka musí mať oblasť.","patchOwn":"Každá oblasť musí obsahovať vlastnú pomôcku.","patchTwo":"Oblasť nesmie obsahovať dve pomôcky.","patchConnected":"Každá oblasť musí byť súvislá.","patchRect":"Každá oblasť musí tvoriť obdĺžnik.","patchSize":"Veľkosť oblasti nezodpovedá pomôcke.","patchShape":"Tvar oblasti nezodpovedá pomôcke.","erase":"Vymazať","regionSelection":"Výber oblasti","share":"Zdieľať","continue":"Pokračovať","resultCopied":"Výsledok skopírovaný","shareUnavailable":"Zdieľanie nie je dostupné","victoryKicker":"VÝBORNE","actions":"Akcie","homeAria":"Domov","changeTheme":"Zmeniť motív","visibleOnly":"Odvodené iba z viditeľného stavu.","directReason":"Tento ťah priamo vyplýva z viditeľných obmedzení.","rank1Reason":"Ostatné možnosti vedú okamžite k rozporu.","rank2Reason":"Ostatné možnosti zlyhajú o jednu logickú úroveň hlbšie.","rank3Reason":"Obmedzená kontrola do troch úrovní vynucuje tento ťah.","placeQueen":"Polož kráľovnú","markX":"Označ X","placeSun":"Polož slnko","placeMoon":"Polož mesiac","placeDigit":"Vlož číslicu","assignRegion":"Priraď oblasti","rowLabel":"riadok","columnLabel":"stĺpec"}};
I18N.sl={...I18N.en,...{"easy":"Lahko","medium":"Srednje","hard":"Težko","expert":"Strokovnjak","gameQueens":"Krone","gameTango":"Sonce-Luna","gameSudoku":"Mreža 6","gamePatches":"Pravokotniki","newGame":"Nova","reset":"Ponastavi","pause":"Premor","resume":"Nadaljuj","check":"Preveri","hint":"Namig","solution":"Rešitev","rules":"Pravila","back":"Nazaj","play":"Igraj","generated":"ustvarjena","score":"rezultat","homeTitle":"Štiri igre.<br>Logični odmor.","homeSub":"Štiri logične igre z ustvarjanjem, časovnikom, dnevnimi izzivi in napredkom. Po prvem nalaganju delujejo brez povezave.","queensSub":"Ena kraljica v vsaki vrstici, stolpcu in območju.","tangoSub":"Uravnoteži Sonce/Luno in odnose.","sudokuSub":"6×6, vrstice, stolpci in območja.","patchesSub":"Obnovi vsa pravokotna območja.","daily":"Dnevni izziv","dailySub":"danes končano","stats":"Statistika in napredek","statsSub":"Zgodovina, rekordi in nizi","prefs":"Nastavitve","prefsSub":"Jezik, tema, zvoki in lokalni podatki","about":"O aplikaciji","aboutSub":"Različica, avtorske pravice in licenca","settingsSaved":"Nastavitve so shranjene v tej napravi.","language":"Jezik","languageSub":"Na voljo 30 jezikov","theme":"Tema","themeSub":"Samodejno, svetlo ali temno","auto":"Samodejno","light":"Svetlo","dark":"Temno","sounds":"Nežni zvoki","soundsSub":"Zmaga in občasne povratne informacije","on":"Vklop","off":"Izklop","data":"Podatki","dataSub":"Statistika, izzivi in nastavitve ostanejo lokalni.","info":"Info","localDataTitle":"Lokalni podatki","localData":"QUADLUD ne zahteva računa. Igre, statistika, dnevni izzivi in nastavitve so shranjeni v brskalniku te naprave.","dailyLast":"Zadnjih 28 dni","dailyNote":"Vsak datum ustvari iste štiri uganke na vseh napravah s to različico. Dnevna težavnost: Srednje.","finished":"končano","statsLocal":"Napredek je shranjen samo v tej napravi.","solved":"rešeno","success":"uspeh","avgTime":"povprečni čas","streak":"niz dni","byGame":"Po igri","history":"Nedavna zgodovina","record":"rekord","average":"povprečje","none":"Ni še končanih iger.","solvedStatus":"Rešeno","revealedStatus":"Rešitev prikazana","abandonedStatus":"Opuščeno","finishedStatus":"Končano","autoCross":"Samodejno označi X, ko postavim kraljico","queensLegend":"Tapni polje za prazno → X → kraljica. Povleci po vrstici ali stolpcu za dodajanje X; začni na X, da jih izbrišeš.","patchesLegend":"Povleci iz enega kota v nasprotnega, da narišeš ali spremeniš pravokotnik. Če vsebuje natanko en namig, se območje izbere samodejno. Tapni obstoječi pravokotnik, da ga odstraniš.","zone":"Območje","aboutTitle":"O QUADLUD","version":"Različica","copyright":"Avtorske pravice","license":"Licenca","proprietary":"Lastniška programska oprema — Vse pravice pridržane.","legal":"Kopiranje, spreminjanje, nadaljnja distribucija ali uporaba brez predhodnega pisnega dovoljenja Sergea Benoliela so prepovedani.","restored":"Igra obnovljena","generating":"Ustvarjanje…","rulesTitle":"Pravila","where":"Kam pogledati","logic":"Logika","solutionShown":"Rešitev prikazana","congrats":"Odlično!","gridIncomplete":"Ostala je napaka ali nerešeno polje.","tangoIncomplete":"Mreža še ne izpolnjuje vseh pravil.","sudokuIncomplete":"Ostala je napaka ali prazno polje.","autoCrossOn":"Samodejni X vklopljeni","autoCrossOff":"Samodejni X izklopljeni","queenPlaced":"Kraljica je bila postavljena.","cellRevealed":"Polje je bilo razkrito.","digitRevealed":"Številka je bila razkrita.","patchRevealed":"Polje območja je bilo razkrito.","finishedShare":"Končano","dailyLabel":"Dnevni izziv","backtrackFlag":"razveljavljeno","hintFlag":"namig uporabljen","closeHint":"Zapri","hintMove":"Predlagana poteza","hintWhy":"Zakaj","noLogicalHint":"Iz trenutnega stanja ni mogoče neposredno izpeljati poteze.","hintTimeout":"Iskanje namiga je doseglo omejitev 5 sekund. Zanesljivega namiga ni bilo.","hintSearching":"Iskanje namiga…","hintPaused":"Nadaljuj igro, da zahtevaš namig.","hintError":"Iskanja namiga ni bilo mogoče dokončati. Poskusi po naslednji potezi.","dragHint":"Premakni","rank1":"sklep 1. stopnje","rank2":"sklep 2. stopnje","rank3":"sklep 3. stopnje","hintNoR0":"Stopnja 0: ni neposrednega sklepa.","hintNoR1":"Stopnja 1: nobena predpostavka ne vodi takoj v slepo ulico.","hintNoR2":"Stopnja 2: nobena predpostavka ne vodi v slepo ulico na naslednji stopnji.","hintNoR3":"Stopnja 3: v treh stopnjah ni bilo dokazanega prisilnega protislovja.","hypothesis":"Predpostavka","consequence":"Posledica","deadend":"Slepa ulica","conclusion":"Sklep","themeLabel":"Tema","soundsOn":"Zvoki vklopljeni","soundsOff":"Zvoki izklopljeni","resetDone":"Mreža ponastavljena.","patchAll":"Vsako polje mora pripadati območju.","patchEach":"Vsak namig mora imeti območje.","patchOwn":"Vsako območje mora vsebovati svoj namig.","patchTwo":"Območje ne sme vsebovati dveh namigov.","patchConnected":"Vsako območje mora biti povezano.","patchRect":"Vsako območje mora tvoriti pravokotnik.","patchSize":"Velikost območja se ne ujema z namigom.","patchShape":"Oblika območja se ne ujema z namigom.","erase":"Izbriši","regionSelection":"Izbira območja","share":"Deli","continue":"Nadaljuj","resultCopied":"Rezultat kopiran","shareUnavailable":"Deljenje ni na voljo","victoryKicker":"ODLIČNO","actions":"Dejanja","homeAria":"Domov","changeTheme":"Spremeni temo","visibleOnly":"Izpeljano samo iz vidnega stanja.","directReason":"Ta poteza neposredno sledi iz vidnih omejitev.","rank1Reason":"Druge možnosti takoj vodijo v protislovje.","rank2Reason":"Druge možnosti odpovejo eno logično stopnjo globlje.","rank3Reason":"Omejen pregled treh stopenj prisili to potezo.","placeQueen":"Postavi kraljico","markX":"Označi X","placeSun":"Postavi sonce","placeMoon":"Postavi luno","placeDigit":"Vnesi številko","assignRegion":"Dodeli območju","rowLabel":"vrstica","columnLabel":"stolpec"}};
I18N.sv={...I18N.en,...{"easy":"Lätt","medium":"Medel","hard":"Svår","expert":"Expert","gameQueens":"Kronor","gameTango":"Sol-Måne","gameSudoku":"Rutnät 6","gamePatches":"Rektanglar","newGame":"Ny","reset":"Återställ","pause":"Paus","resume":"Fortsätt","check":"Kontrollera","hint":"Ledtråd","solution":"Lösning","rules":"Regler","back":"Tillbaka","play":"Spela","generated":"genererad","score":"poäng","homeTitle":"Fyra spel.<br>En logikpaus.","homeSub":"Fyra logikspel med generering, timer, dagliga utmaningar och framsteg. Fungerar offline efter första laddningen.","queensSub":"En drottning per rad, kolumn och region.","tangoSub":"Balansera Sol/Måne och relationer.","sudokuSub":"6×6, rader, kolumner och regioner.","patchesSub":"Återskapa alla rektangulära regioner.","daily":"Daglig utmaning","dailySub":"klara idag","stats":"Statistik & framsteg","statsSub":"Historik, rekord och sviter","prefs":"Inställningar","prefsSub":"Språk, tema, ljud och lokal data","about":"Om","aboutSub":"Version, copyright och licens","settingsSaved":"Inställningar sparade på den här enheten.","language":"Språk","languageSub":"30 språk tillgängliga","theme":"Tema","themeSub":"Automatiskt, ljust eller mörkt","auto":"Automatiskt","light":"Ljust","dark":"Mörkt","sounds":"Diskreta ljud","soundsSub":"Vinst och tillfällig feedback","on":"På","off":"Av","data":"Data","dataSub":"Statistik, utmaningar och inställningar stannar lokalt.","info":"Info","localDataTitle":"Lokal data","localData":"QUADLUD kräver inget konto. Spel, statistik, dagliga utmaningar och inställningar lagras i webbläsaren på den här enheten.","dailyLast":"Senaste 28 dagarna","dailyNote":"Varje datum ger samma fyra pussel på alla enheter med denna version. Daglig svårighetsgrad: Medel.","finished":"klara","statsLocal":"Framsteg lagras endast på den här enheten.","solved":"lösta","success":"framgång","avgTime":"snittid","streak":"dagssvit","byGame":"Per spel","history":"Senaste historik","record":"rekord","average":"genomsnitt","none":"Inget spel har slutförts ännu.","solvedStatus":"Löst","revealedStatus":"Lösning visad","abandonedStatus":"Avbrutet","finishedStatus":"Slutfört","autoCross":"Markera X automatiskt när jag placerar en drottning","queensLegend":"Tryck på en ruta för tom → X → drottning. Dra längs en rad eller kolumn för att lägga till X; börja på ett X för att radera dem.","patchesLegend":"Dra från ett hörn till det motsatta för att rita eller ändra en rektangel. Om den innehåller exakt en ledtråd väljs regionen automatiskt. Tryck på en befintlig rektangel för att ta bort den.","zone":"Region","aboutTitle":"Om QUADLUD","version":"Version","copyright":"Copyright","license":"Licens","proprietary":"Proprietär programvara — Alla rättigheter förbehållna.","legal":"Kopiering, ändring, vidare spridning eller utnyttjande utan skriftligt förhandstillstånd från Serge Benoliel är förbjudet.","restored":"Spel återställt","generating":"Genererar…","rulesTitle":"Regler","where":"Var du ska titta","logic":"Logik","solutionShown":"Lösning visad","congrats":"Bra jobbat!","gridIncomplete":"Det finns fortfarande ett fel eller en olöst ruta.","tangoIncomplete":"Rutnätet uppfyller ännu inte alla regler.","sudokuIncomplete":"Det finns fortfarande ett fel eller en tom ruta.","autoCrossOn":"Automatiska X på","autoCrossOff":"Automatiska X av","queenPlaced":"En drottning placerades.","cellRevealed":"En ruta avslöjades.","digitRevealed":"En siffra avslöjades.","patchRevealed":"En regionruta avslöjades.","finishedShare":"Slutfört","dailyLabel":"Daglig utmaning","backtrackFlag":"ångrat","hintFlag":"ledtråd använd","closeHint":"Stäng","hintMove":"Föreslaget drag","hintWhy":"Varför","noLogicalHint":"Inget drag kan härledas direkt från det aktuella läget.","hintTimeout":"Ledtrådssökningen nådde gränsen på 5 sekunder. Ingen tillförlitlig ledtråd hittades.","hintSearching":"Söker efter ledtråd…","hintPaused":"Fortsätt spelet för att be om en ledtråd.","hintError":"Ledtrådssökningen kunde inte slutföras. Försök igen efter nästa drag.","dragHint":"Flytta","rank1":"slutledning nivå 1","rank2":"slutledning nivå 2","rank3":"slutledning nivå 3","hintNoR0":"Nivå 0: ingen direkt slutsats.","hintNoR1":"Nivå 1: inget antagande leder direkt till en återvändsgränd.","hintNoR2":"Nivå 2: inget antagande leder till en återvändsgränd på nästa nivå.","hintNoR3":"Nivå 3: ingen tvingad motsägelse bevisades inom tre nivåer.","hypothesis":"Antagande","consequence":"Konsekvens","deadend":"Återvändsgränd","conclusion":"Slutsats","themeLabel":"Tema","soundsOn":"Ljud på","soundsOff":"Ljud av","resetDone":"Rutnät återställt.","patchAll":"Varje ruta måste tillhöra en region.","patchEach":"Varje ledtråd måste ha en region.","patchOwn":"Varje region måste innehålla sin egen ledtråd.","patchTwo":"En region får inte innehålla två ledtrådar.","patchConnected":"Varje region måste vara sammanhängande.","patchRect":"Varje region måste bilda en rektangel.","patchSize":"Regionens storlek stämmer inte med ledtråden.","patchShape":"Regionens form stämmer inte med ledtråden.","erase":"Radera","regionSelection":"Välj region","share":"Dela","continue":"Fortsätt","resultCopied":"Resultat kopierat","shareUnavailable":"Delning inte tillgänglig","victoryKicker":"BRA JOBBAT","actions":"Åtgärder","homeAria":"Hem","changeTheme":"Byt tema","visibleOnly":"Härlett endast från det synliga läget.","directReason":"Draget följer direkt av de synliga begränsningarna.","rank1Reason":"De andra möjligheterna leder direkt till en motsägelse.","rank2Reason":"De andra möjligheterna misslyckas en logisk nivå djupare.","rank3Reason":"En begränsad kontroll på tre nivåer tvingar fram detta drag.","placeQueen":"Placera en drottning","markX":"Markera X","placeSun":"Placera en sol","placeMoon":"Placera en måne","placeDigit":"Placera siffra","assignRegion":"Tilldela region","rowLabel":"rad","columnLabel":"kolumn"}};
Object.assign(I18N.en,{languageSub:"30 languages available"});
Object.assign(I18N.zh,{languageSub:"提供 30 种语言"});
Object.assign(I18N.hi,{languageSub:"30 भाषाएँ उपलब्ध"});
Object.assign(I18N.es,{languageSub:"30 idiomas disponibles"});
Object.assign(I18N.ar,{languageSub:"30 لغة متاحة"});
Object.assign(I18N.fr,{languageSub:"30 langues disponibles"});
Object.assign(I18N.bn,{languageSub:"৩০টি ভাষা উপলব্ধ"});
Object.assign(I18N.pt,{languageSub:"30 idiomas disponíveis"});
Object.assign(I18N.id,{languageSub:"30 bahasa tersedia"});
Object.assign(I18N.ur,{languageSub:"30 زبانیں دستیاب"});

/* v2.11.0 — history + Logic Coach labels */
Object.assign(I18N.en,{"undo":"Undo","redo":"Redo","logicCoach":"Logic Coach"});
Object.assign(I18N.zh,{"undo":"撤销","redo":"重做","logicCoach":"Logic Coach"});
Object.assign(I18N.hi,{"undo":"पूर्ववत","redo":"फिर से","logicCoach":"Logic Coach"});
Object.assign(I18N.es,{"undo":"Deshacer","redo":"Rehacer","logicCoach":"Logic Coach"});
Object.assign(I18N.ar,{"undo":"تراجع","redo":"إعادة","logicCoach":"Logic Coach"});
Object.assign(I18N.fr,{"undo":"Annuler","redo":"Refaire","logicCoach":"Logic Coach"});
Object.assign(I18N.bn,{"undo":"পূর্বাবস্থা","redo":"পুনরায়","logicCoach":"Logic Coach"});
Object.assign(I18N.pt,{"undo":"Desfazer","redo":"Refazer","logicCoach":"Logic Coach"});
Object.assign(I18N.id,{"undo":"Urungkan","redo":"Ulangi","logicCoach":"Logic Coach"});
Object.assign(I18N.ur,{"undo":"واپس کریں","redo":"دوبارہ کریں","logicCoach":"Logic Coach"});
Object.assign(I18N.bg,{"undo":"Отмени","redo":"Повтори","logicCoach":"Logic Coach"});
Object.assign(I18N.hr,{"undo":"Poništi","redo":"Ponovi","logicCoach":"Logic Coach"});
Object.assign(I18N.cs,{"undo":"Zpět","redo":"Znovu","logicCoach":"Logic Coach"});
Object.assign(I18N.da,{"undo":"Fortryd","redo":"Gentag","logicCoach":"Logic Coach"});
Object.assign(I18N.nl,{"undo":"Ongedaan maken","redo":"Opnieuw","logicCoach":"Logic Coach"});
Object.assign(I18N.et,{"undo":"Võta tagasi","redo":"Tee uuesti","logicCoach":"Logic Coach"});
Object.assign(I18N.fi,{"undo":"Kumoa","redo":"Tee uudelleen","logicCoach":"Logic Coach"});
Object.assign(I18N.de,{"undo":"Rückgängig","redo":"Wiederholen","logicCoach":"Logic Coach"});
Object.assign(I18N.el,{"undo":"Αναίρεση","redo":"Επανάληψη","logicCoach":"Logic Coach"});
Object.assign(I18N.hu,{"undo":"Visszavonás","redo":"Újra","logicCoach":"Logic Coach"});
Object.assign(I18N.ga,{"undo":"Cealaigh","redo":"Athdhéan","logicCoach":"Logic Coach"});
Object.assign(I18N.it,{"undo":"Annulla","redo":"Ripeti","logicCoach":"Logic Coach"});
Object.assign(I18N.lv,{"undo":"Atsaukt","redo":"Atkārtot","logicCoach":"Logic Coach"});
Object.assign(I18N.lt,{"undo":"Anuliuoti","redo":"Pakartoti","logicCoach":"Logic Coach"});
Object.assign(I18N.mt,{"undo":"Ħoll","redo":"Erġa’ agħmel","logicCoach":"Logic Coach"});
Object.assign(I18N.pl,{"undo":"Cofnij","redo":"Ponów","logicCoach":"Logic Coach"});
Object.assign(I18N.ro,{"undo":"Anulează","redo":"Refă","logicCoach":"Logic Coach"});
Object.assign(I18N.sk,{"undo":"Späť","redo":"Znova","logicCoach":"Logic Coach"});
Object.assign(I18N.sl,{"undo":"Razveljavi","redo":"Ponovi","logicCoach":"Logic Coach"});
Object.assign(I18N.sv,{"undo":"Ångra","redo":"Gör om","logicCoach":"Logic Coach"});

/* v2.13.0 — technique library label */
Object.assign(I18N.en,{techniques:"Techniques"});
Object.assign(I18N.zh,{techniques:"技巧"});
Object.assign(I18N.hi,{techniques:"तकनीकें"});
Object.assign(I18N.es,{techniques:"Técnicas"});
Object.assign(I18N.ar,{techniques:"التقنيات"});
Object.assign(I18N.fr,{techniques:"Techniques"});
Object.assign(I18N.bn,{techniques:"কৌশল"});
Object.assign(I18N.pt,{techniques:"Técnicas"});
Object.assign(I18N.id,{techniques:"Teknik"});
Object.assign(I18N.ur,{techniques:"تکنیکیں"});
Object.assign(I18N.bg,{techniques:"Техники"});
Object.assign(I18N.hr,{techniques:"Tehnike"});
Object.assign(I18N.cs,{techniques:"Techniky"});
Object.assign(I18N.da,{techniques:"Teknikker"});
Object.assign(I18N.nl,{techniques:"Technieken"});
Object.assign(I18N.et,{techniques:"Tehnikad"});
Object.assign(I18N.fi,{techniques:"Tekniikat"});
Object.assign(I18N.de,{techniques:"Techniken"});
Object.assign(I18N.el,{techniques:"Τεχνικές"});
Object.assign(I18N.hu,{techniques:"Technikák"});
Object.assign(I18N.ga,{techniques:"Teicnící"});
Object.assign(I18N.it,{techniques:"Tecniche"});
Object.assign(I18N.lv,{techniques:"Paņēmieni"});
Object.assign(I18N.lt,{techniques:"Metodai"});
Object.assign(I18N.mt,{techniques:"Tekniki"});
Object.assign(I18N.pl,{techniques:"Techniki"});
Object.assign(I18N.ro,{techniques:"Tehnici"});
Object.assign(I18N.sk,{techniques:"Techniky"});
Object.assign(I18N.sl,{techniques:"Tehnike"});
Object.assign(I18N.sv,{techniques:"Tekniker"});

/* v2.14.0 — Explain my error */
Object.assign(I18N.en,{"explainError":"Explain my error","errorDetected":"Rule conflict detected","returnBeforeError":"Return before this error","errorRule":"Rule involved","errorConflict":"This move conflicts with the displayed rule. The highlighted cells cannot coexist in this state.","errorReturned":"Returned to the position before the error.","errorDuplicate":"Duplicate value","errorOverlap":"Overlapping regions","errorRejected":"This move was rejected."});
Object.assign(I18N.zh,{"explainError":"解释我的错误","errorDetected":"检测到规则冲突","returnBeforeError":"返回错误前","errorRule":"相关规则","errorConflict":"这一步与显示的规则冲突。高亮的格子在当前状态下不能同时存在。","errorReturned":"已返回到错误发生前的位置。","errorDuplicate":"重复数值","errorOverlap":"区域重叠","errorRejected":"此操作已被拒绝。"});
Object.assign(I18N.hi,{"explainError":"मेरी गलती समझाएँ","errorDetected":"नियम का टकराव मिला","returnBeforeError":"इस गलती से पहले लौटें","errorRule":"संबंधित नियम","errorConflict":"यह चाल दिखाए गए नियम से टकराती है। हाइलाइट किए गए खाने इस स्थिति में साथ नहीं रह सकते।","errorReturned":"गलती से पहले की स्थिति पर लौट आए।","errorDuplicate":"दोहराया मान","errorOverlap":"ओवरलैप क्षेत्र","errorRejected":"यह चाल अस्वीकार कर दी गई।"});
Object.assign(I18N.es,{"explainError":"Explicar mi error","errorDetected":"Conflicto de regla detectado","returnBeforeError":"Volver antes de este error","errorRule":"Regla implicada","errorConflict":"Esta jugada entra en conflicto con la regla mostrada. Las casillas resaltadas no pueden coexistir en este estado.","errorReturned":"Se ha vuelto a la posición anterior al error.","errorDuplicate":"Valor duplicado","errorOverlap":"Regiones superpuestas","errorRejected":"Esta jugada ha sido rechazada."});
Object.assign(I18N.ar,{"explainError":"اشرح خطئي","errorDetected":"تم اكتشاف تعارض مع قاعدة","returnBeforeError":"العودة إلى ما قبل هذا الخطأ","errorRule":"القاعدة المعنية","errorConflict":"تتعارض هذه النقلة مع القاعدة المعروضة. لا يمكن أن تتواجد الخلايا المميزة معًا في هذه الحالة.","errorReturned":"تم الرجوع إلى الوضع السابق للخطأ.","errorDuplicate":"قيمة مكررة","errorOverlap":"مناطق متداخلة","errorRejected":"تم رفض هذه النقلة."});
Object.assign(I18N.fr,{"explainError":"Explique mon erreur","errorDetected":"Conflit de règle détecté","returnBeforeError":"Revenir avant cette erreur","errorRule":"Règle concernée","errorConflict":"Ce coup entre en conflit avec la règle affichée. Les cases surlignées ne peuvent pas coexister dans cet état.","errorReturned":"Retour à la position précédant l’erreur.","errorDuplicate":"Valeur en double","errorOverlap":"Zones qui se chevauchent","errorRejected":"Ce coup a été refusé."});
Object.assign(I18N.bn,{"explainError":"আমার ভুল ব্যাখ্যা করুন","errorDetected":"নিয়মের সংঘাত ধরা পড়েছে","returnBeforeError":"এই ভুলের আগের অবস্থায় ফিরুন","errorRule":"সংশ্লিষ্ট নিয়ম","errorConflict":"এই চালটি দেখানো নিয়মের সঙ্গে সংঘর্ষ করে। হাইলাইট করা ঘরগুলো এই অবস্থায় একসঙ্গে থাকতে পারে না।","errorReturned":"ভুলের আগের অবস্থায় ফেরা হয়েছে।","errorDuplicate":"পুনরাবৃত্ত মান","errorOverlap":"ওভারল্যাপ অঞ্চল","errorRejected":"এই চালটি প্রত্যাখ্যাত হয়েছে।"});
Object.assign(I18N.pt,{"explainError":"Explicar o meu erro","errorDetected":"Conflito de regra detetado","returnBeforeError":"Voltar antes deste erro","errorRule":"Regra envolvida","errorConflict":"Esta jogada entra em conflito com a regra apresentada. As casas destacadas não podem coexistir neste estado.","errorReturned":"Regressou à posição anterior ao erro.","errorDuplicate":"Valor duplicado","errorOverlap":"Regiões sobrepostas","errorRejected":"Esta jogada foi rejeitada."});
Object.assign(I18N.id,{"explainError":"Jelaskan kesalahan saya","errorDetected":"Konflik aturan terdeteksi","returnBeforeError":"Kembali sebelum kesalahan ini","errorRule":"Aturan terkait","errorConflict":"Langkah ini bertentangan dengan aturan yang ditampilkan. Sel yang disorot tidak dapat berdampingan dalam keadaan ini.","errorReturned":"Kembali ke posisi sebelum kesalahan.","errorDuplicate":"Nilai ganda","errorOverlap":"Wilayah tumpang tindih","errorRejected":"Langkah ini ditolak."});
Object.assign(I18N.ur,{"explainError":"میری غلطی سمجھائیں","errorDetected":"قاعدے کا تضاد ملا","returnBeforeError":"اس غلطی سے پہلے واپس جائیں","errorRule":"متعلقہ قاعدہ","errorConflict":"یہ چال دکھائے گئے قاعدے سے متصادم ہے۔ نمایاں خانے اس حالت میں اکٹھے نہیں رہ سکتے۔","errorReturned":"غلطی سے پہلے کی حالت پر واپس آ گئے۔","errorDuplicate":"دہرائی گئی قدر","errorOverlap":"اوورلیپ علاقے","errorRejected":"یہ چال مسترد کر دی گئی۔"});
Object.assign(I18N.bg,{"explainError":"Обясни грешката ми","errorDetected":"Открит е конфликт с правило","returnBeforeError":"Върни преди тази грешка","errorRule":"Засегнато правило","errorConflict":"Този ход противоречи на показаното правило. Маркираните клетки не могат да съществуват заедно в това състояние.","errorReturned":"Върнато е до позицията преди грешката.","errorDuplicate":"Повтаряща се стойност","errorOverlap":"Припокриващи се области","errorRejected":"Този ход е отхвърлен."});
Object.assign(I18N.hr,{"explainError":"Objasni moju pogrešku","errorDetected":"Otkriven sukob s pravilom","returnBeforeError":"Vrati se prije ove pogreške","errorRule":"Povezano pravilo","errorConflict":"Ovaj potez krši prikazano pravilo. Istaknuta polja ne mogu zajedno postojati u ovom stanju.","errorReturned":"Vraćeno na položaj prije pogreške.","errorDuplicate":"Dvostruka vrijednost","errorOverlap":"Preklapajuća područja","errorRejected":"Ovaj potez je odbijen."});
Object.assign(I18N.cs,{"explainError":"Vysvětlit mou chybu","errorDetected":"Zjištěn konflikt pravidla","returnBeforeError":"Vrátit se před tuto chybu","errorRule":"Dotčené pravidlo","errorConflict":"Tento tah je v rozporu se zobrazeným pravidlem. Zvýrazněná pole v tomto stavu nemohou existovat současně.","errorReturned":"Návrat na pozici před chybou.","errorDuplicate":"Duplicitní hodnota","errorOverlap":"Překrývající se oblasti","errorRejected":"Tento tah byl odmítnut."});
Object.assign(I18N.da,{"explainError":"Forklar min fejl","errorDetected":"Regelkonflikt fundet","returnBeforeError":"Gå tilbage før denne fejl","errorRule":"Berørt regel","errorConflict":"Dette træk strider mod den viste regel. De fremhævede felter kan ikke eksistere sammen i denne tilstand.","errorReturned":"Tilbage til positionen før fejlen.","errorDuplicate":"Dubletværdi","errorOverlap":"Overlappende regioner","errorRejected":"Dette træk blev afvist."});
Object.assign(I18N.nl,{"explainError":"Leg mijn fout uit","errorDetected":"Regelconflict gedetecteerd","returnBeforeError":"Terug naar vóór deze fout","errorRule":"Betrokken regel","errorConflict":"Deze zet is in strijd met de getoonde regel. De gemarkeerde vakken kunnen in deze toestand niet samen bestaan.","errorReturned":"Teruggekeerd naar de positie vóór de fout.","errorDuplicate":"Dubbele waarde","errorOverlap":"Overlappende regio’s","errorRejected":"Deze zet is geweigerd."});
Object.assign(I18N.et,{"explainError":"Selgita mu viga","errorDetected":"Tuvastati reeglikonflikt","returnBeforeError":"Tagasi enne seda viga","errorRule":"Seotud reegel","errorConflict":"See käik on vastuolus näidatud reegliga. Esiletõstetud ruudud ei saa selles seisus koos eksisteerida.","errorReturned":"Naasti vea eelsesse seisu.","errorDuplicate":"Korduv väärtus","errorOverlap":"Kattuvad piirkonnad","errorRejected":"See käik lükati tagasi."});
Object.assign(I18N.fi,{"explainError":"Selitä virheeni","errorDetected":"Sääntöristiriita havaittu","returnBeforeError":"Palaa ennen tätä virhettä","errorRule":"Asiaan liittyvä sääntö","errorConflict":"Tämä siirto on ristiriidassa näytetyn säännön kanssa. Korostetut ruudut eivät voi olla yhdessä tässä tilanteessa.","errorReturned":"Palattiin virhettä edeltävään tilanteeseen.","errorDuplicate":"Kaksoisarvo","errorOverlap":"Päällekkäiset alueet","errorRejected":"Tämä siirto hylättiin."});
Object.assign(I18N.de,{"explainError":"Meinen Fehler erklären","errorDetected":"Regelkonflikt erkannt","returnBeforeError":"Vor diesen Fehler zurückkehren","errorRule":"Betroffene Regel","errorConflict":"Dieser Zug widerspricht der angezeigten Regel. Die markierten Felder können in diesem Zustand nicht gleichzeitig bestehen.","errorReturned":"Zur Position vor dem Fehler zurückgekehrt.","errorDuplicate":"Doppelter Wert","errorOverlap":"Überlappende Regionen","errorRejected":"Dieser Zug wurde abgelehnt."});
Object.assign(I18N.el,{"explainError":"Εξήγησε το λάθος μου","errorDetected":"Εντοπίστηκε σύγκρουση κανόνα","returnBeforeError":"Επιστροφή πριν από αυτό το λάθος","errorRule":"Σχετικός κανόνας","errorConflict":"Αυτή η κίνηση συγκρούεται με τον εμφανιζόμενο κανόνα. Τα επισημασμένα κελιά δεν μπορούν να συνυπάρχουν σε αυτή την κατάσταση.","errorReturned":"Επιστροφή στη θέση πριν από το λάθος.","errorDuplicate":"Διπλή τιμή","errorOverlap":"Επικαλυπτόμενες περιοχές","errorRejected":"Αυτή η κίνηση απορρίφθηκε."});
Object.assign(I18N.hu,{"explainError":"Magyarázd el a hibámat","errorDetected":"Szabályütközés észlelve","returnBeforeError":"Vissza a hiba elé","errorRule":"Érintett szabály","errorConflict":"Ez a lépés ütközik a megjelenített szabállyal. A kiemelt mezők ebben az állapotban nem lehetnek együtt.","errorReturned":"Visszatérés a hiba előtti állapothoz.","errorDuplicate":"Ismétlődő érték","errorOverlap":"Átfedő régiók","errorRejected":"Ez a lépés elutasítva."});
Object.assign(I18N.ga,{"explainError":"Mínigh mo bhotún","errorDetected":"Aimsíodh coinbhleacht rialach","returnBeforeError":"Fill roimh an mbotún seo","errorRule":"Riail lena mbaineann","errorConflict":"Tá an bogadh seo i gcoinbhleacht leis an riail atá ar taispeáint. Ní féidir leis na cealla aibhsithe a bheith le chéile sa staid seo.","errorReturned":"Fillte ar an suíomh roimh an mbotún.","errorDuplicate":"Luach dúblach","errorOverlap":"Réigiúin fhorluiteacha","errorRejected":"Diúltaíodh don bhogadh seo."});
Object.assign(I18N.it,{"explainError":"Spiega il mio errore","errorDetected":"Conflitto di regola rilevato","returnBeforeError":"Torna prima di questo errore","errorRule":"Regola coinvolta","errorConflict":"Questa mossa è in conflitto con la regola mostrata. Le caselle evidenziate non possono coesistere in questo stato.","errorReturned":"Ritorno alla posizione precedente all’errore.","errorDuplicate":"Valore duplicato","errorOverlap":"Regioni sovrapposte","errorRejected":"Questa mossa è stata rifiutata."});
Object.assign(I18N.lv,{"explainError":"Izskaidro manu kļūdu","errorDetected":"Konstatēts noteikuma konflikts","returnBeforeError":"Atgriezties pirms šīs kļūdas","errorRule":"Saistītais noteikums","errorConflict":"Šis gājiens ir pretrunā parādītajam noteikumam. Izceltās šūnas šajā stāvoklī nevar pastāvēt kopā.","errorReturned":"Atgriezts stāvoklis pirms kļūdas.","errorDuplicate":"Dublēta vērtība","errorOverlap":"Pārklājošies reģioni","errorRejected":"Šis gājiens tika noraidīts."});
Object.assign(I18N.lt,{"explainError":"Paaiškinti mano klaidą","errorDetected":"Aptiktas taisyklės konfliktas","returnBeforeError":"Grįžti prieš šią klaidą","errorRule":"Susijusi taisyklė","errorConflict":"Šis ėjimas prieštarauja parodytai taisyklei. Pažymėti langeliai šioje būsenoje negali egzistuoti kartu.","errorReturned":"Grįžta į padėtį prieš klaidą.","errorDuplicate":"Pasikartojanti reikšmė","errorOverlap":"Persidengiančios sritys","errorRejected":"Šis ėjimas atmestas."});
Object.assign(I18N.mt,{"explainError":"Spjega l-iżball tiegħi","errorDetected":"Instab kunflitt mar-regola","returnBeforeError":"Erġa’ lura qabel dan l-iżball","errorRule":"Regola involuta","errorConflict":"Din il-mossa tmur kontra r-regola murija. Iċ-ċelloli enfasizzati ma jistgħux jeżistu flimkien f’dan l-istat.","errorReturned":"Intbagħat lura għall-pożizzjoni qabel l-iżball.","errorDuplicate":"Valur duplikat","errorOverlap":"Reġjuni sovrapposti","errorRejected":"Din il-mossa ġiet miċħuda."});
Object.assign(I18N.pl,{"explainError":"Wyjaśnij mój błąd","errorDetected":"Wykryto konflikt z regułą","returnBeforeError":"Wróć przed ten błąd","errorRule":"Powiązana reguła","errorConflict":"Ten ruch jest sprzeczny z pokazaną regułą. Podświetlone pola nie mogą współistnieć w tym stanie.","errorReturned":"Powrót do pozycji sprzed błędu.","errorDuplicate":"Powtórzona wartość","errorOverlap":"Nakładające się regiony","errorRejected":"Ten ruch został odrzucony."});
Object.assign(I18N.ro,{"explainError":"Explică-mi greșeala","errorDetected":"Conflict de regulă detectat","returnBeforeError":"Revino înaintea acestei greșeli","errorRule":"Regula implicată","errorConflict":"Această mutare intră în conflict cu regula afișată. Celulele evidențiate nu pot coexista în această stare.","errorReturned":"Revenire la poziția dinaintea greșelii.","errorDuplicate":"Valoare duplicată","errorOverlap":"Regiuni suprapuse","errorRejected":"Această mutare a fost respinsă."});
Object.assign(I18N.sk,{"explainError":"Vysvetli moju chybu","errorDetected":"Zistený konflikt pravidla","returnBeforeError":"Vrátiť sa pred túto chybu","errorRule":"Dotknuté pravidlo","errorConflict":"Tento ťah je v rozpore so zobrazeným pravidlom. Zvýraznené políčka nemôžu v tomto stave existovať spolu.","errorReturned":"Návrat na pozíciu pred chybou.","errorDuplicate":"Duplicitná hodnota","errorOverlap":"Prekrývajúce sa oblasti","errorRejected":"Tento ťah bol odmietnutý."});
Object.assign(I18N.sl,{"explainError":"Pojasni mojo napako","errorDetected":"Zaznan konflikt s pravilom","returnBeforeError":"Vrni se pred to napako","errorRule":"Povezano pravilo","errorConflict":"Ta poteza je v nasprotju s prikazanim pravilom. Označena polja v tem stanju ne morejo obstajati skupaj.","errorReturned":"Vrnitev na položaj pred napako.","errorDuplicate":"Podvojena vrednost","errorOverlap":"Prekrivajoča območja","errorRejected":"Ta poteza je bila zavrnjena."});
Object.assign(I18N.sv,{"explainError":"Förklara mitt misstag","errorDetected":"Regelkonflikt upptäckt","returnBeforeError":"Gå tillbaka före misstaget","errorRule":"Berörd regel","errorConflict":"Det här draget strider mot den visade regeln. De markerade rutorna kan inte finnas samtidigt i detta läge.","errorReturned":"Tillbaka till positionen före misstaget.","errorDuplicate":"Dubblettvärde","errorOverlap":"Överlappande regioner","errorRejected":"Det här draget avvisades."});

/* v2.15.0 — mastery profile labels */
Object.assign(I18N.en,{"mastery":"Mastery","masterySub":"Your logical strengths and techniques to improve.","masteryOverall":"Overall mastery","masteryObserved":"Observed","masterySolo":"Solved alone","masteryErrors":"Related errors","masteryConfidence":"Confidence","masteryInsufficient":"Not enough data","masteryDeveloping":"Developing","masteryAcquired":"Acquired","masteryStrong":"Strong","masteryExcellent":"Excellent"});
Object.assign(I18N.zh,{"mastery":"掌握度","masterySub":"查看你的逻辑优势和需要提高的技巧。","masteryOverall":"总体掌握度","masteryObserved":"已观察","masterySolo":"独立解决","masteryErrors":"相关错误","masteryConfidence":"置信度","masteryInsufficient":"数据不足","masteryDeveloping":"发展中","masteryAcquired":"已掌握","masteryStrong":"熟练","masteryExcellent":"优秀"});
Object.assign(I18N.hi,{"mastery":"दक्षता","masterySub":"अपनी तार्किक ताकत और सुधार की तकनीकें देखें।","masteryOverall":"समग्र दक्षता","masteryObserved":"देखी गई स्थितियाँ","masterySolo":"स्वयं हल किया","masteryErrors":"संबंधित गलतियाँ","masteryConfidence":"विश्वसनीयता","masteryInsufficient":"पर्याप्त डेटा नहीं","masteryDeveloping":"विकासशील","masteryAcquired":"अर्जित","masteryStrong":"मजबूत","masteryExcellent":"उत्कृष्ट"});
Object.assign(I18N.es,{"mastery":"Dominio","masterySub":"Tus fortalezas lógicas y las técnicas a mejorar.","masteryOverall":"Dominio global","masteryObserved":"Observadas","masterySolo":"Resueltas solo","masteryErrors":"Errores relacionados","masteryConfidence":"Confianza","masteryInsufficient":"Datos insuficientes","masteryDeveloping":"En desarrollo","masteryAcquired":"Adquirido","masteryStrong":"Sólido","masteryExcellent":"Excelente"});
Object.assign(I18N.ar,{"mastery":"الإتقان","masterySub":"نقاط قوتك المنطقية والتقنيات التي تحتاج إلى تحسين.","masteryOverall":"الإتقان العام","masteryObserved":"تمت ملاحظتها","masterySolo":"حُلّت دون مساعدة","masteryErrors":"أخطاء مرتبطة","masteryConfidence":"الثقة","masteryInsufficient":"بيانات غير كافية","masteryDeveloping":"قيد التطور","masteryAcquired":"مكتسب","masteryStrong":"قوي","masteryExcellent":"ممتاز"});
Object.assign(I18N.fr,{"mastery":"Maîtrise","masterySub":"Tes points forts logiques et les techniques à travailler.","masteryOverall":"Maîtrise globale","masteryObserved":"Situations observées","masterySolo":"Résolues seul","masteryErrors":"Erreurs liées","masteryConfidence":"Confiance","masteryInsufficient":"Données insuffisantes","masteryDeveloping":"En développement","masteryAcquired":"Acquis","masteryStrong":"Solide","masteryExcellent":"Excellent"});
Object.assign(I18N.bn,{"mastery":"দক্ষতা","masterySub":"আপনার যৌক্তিক শক্তি ও উন্নতির কৌশলগুলো দেখুন।","masteryOverall":"সামগ্রিক দক্ষতা","masteryObserved":"পর্যবেক্ষিত","masterySolo":"নিজে সমাধান","masteryErrors":"সম্পর্কিত ভুল","masteryConfidence":"আস্থা","masteryInsufficient":"পর্যাপ্ত তথ্য নেই","masteryDeveloping":"উন্নয়নশীল","masteryAcquired":"অর্জিত","masteryStrong":"দৃঢ়","masteryExcellent":"চমৎকার"});
Object.assign(I18N.pt,{"mastery":"Domínio","masterySub":"Os teus pontos fortes lógicos e as técnicas a melhorar.","masteryOverall":"Domínio global","masteryObserved":"Observadas","masterySolo":"Resolvidas sozinho","masteryErrors":"Erros relacionados","masteryConfidence":"Confiança","masteryInsufficient":"Dados insuficientes","masteryDeveloping":"Em desenvolvimento","masteryAcquired":"Adquirido","masteryStrong":"Sólido","masteryExcellent":"Excelente"});
Object.assign(I18N.id,{"mastery":"Penguasaan","masterySub":"Kekuatan logika dan teknik yang perlu ditingkatkan.","masteryOverall":"Penguasaan keseluruhan","masteryObserved":"Diamati","masterySolo":"Diselesaikan sendiri","masteryErrors":"Kesalahan terkait","masteryConfidence":"Keyakinan","masteryInsufficient":"Data belum cukup","masteryDeveloping":"Berkembang","masteryAcquired":"Dikuasai","masteryStrong":"Kuat","masteryExcellent":"Sangat baik"});
Object.assign(I18N.ur,{"mastery":"مہارت","masterySub":"اپنی منطقی طاقت اور بہتر کرنے والی تکنیکیں دیکھیں۔","masteryOverall":"مجموعی مہارت","masteryObserved":"مشاہدہ شدہ","masterySolo":"خود حل کیا","masteryErrors":"متعلقہ غلطیاں","masteryConfidence":"اعتماد","masteryInsufficient":"ناکافی ڈیٹا","masteryDeveloping":"ترقی پذیر","masteryAcquired":"حاصل شدہ","masteryStrong":"مضبوط","masteryExcellent":"بہترین"});
Object.assign(I18N.bg,{"mastery":"Овладяване","masterySub":"Логическите ти силни страни и техниките за подобрение.","masteryOverall":"Общо овладяване","masteryObserved":"Наблюдавани","masterySolo":"Решени самостоятелно","masteryErrors":"Свързани грешки","masteryConfidence":"Надеждност","masteryInsufficient":"Недостатъчно данни","masteryDeveloping":"В развитие","masteryAcquired":"Усвоено","masteryStrong":"Стабилно","masteryExcellent":"Отлично"});
Object.assign(I18N.hr,{"mastery":"Ovladavanje","masterySub":"Tvoje logičke snage i tehnike za poboljšanje.","masteryOverall":"Ukupno ovladavanje","masteryObserved":"Promatrano","masterySolo":"Riješeno samostalno","masteryErrors":"Povezane pogreške","masteryConfidence":"Pouzdanost","masteryInsufficient":"Nedovoljno podataka","masteryDeveloping":"U razvoju","masteryAcquired":"Usvojeno","masteryStrong":"Snažno","masteryExcellent":"Izvrsno"});
Object.assign(I18N.cs,{"mastery":"Zvládnutí","masterySub":"Tvé logické silné stránky a techniky ke zlepšení.","masteryOverall":"Celkové zvládnutí","masteryObserved":"Pozorováno","masterySolo":"Vyřešeno samostatně","masteryErrors":"Související chyby","masteryConfidence":"Spolehlivost","masteryInsufficient":"Nedostatek dat","masteryDeveloping":"Ve vývoji","masteryAcquired":"Osvojeno","masteryStrong":"Silné","masteryExcellent":"Výborné"});
Object.assign(I18N.da,{"mastery":"Mestring","masterySub":"Dine logiske styrker og teknikker at forbedre.","masteryOverall":"Samlet mestring","masteryObserved":"Observeret","masterySolo":"Løst selv","masteryErrors":"Relaterede fejl","masteryConfidence":"Sikkerhed","masteryInsufficient":"Ikke nok data","masteryDeveloping":"Under udvikling","masteryAcquired":"Tilegnet","masteryStrong":"Stærk","masteryExcellent":"Fremragende"});
Object.assign(I18N.nl,{"mastery":"Beheersing","masterySub":"Je logische sterke punten en technieken om te verbeteren.","masteryOverall":"Totale beheersing","masteryObserved":"Geobserveerd","masterySolo":"Zelf opgelost","masteryErrors":"Gerelateerde fouten","masteryConfidence":"Betrouwbaarheid","masteryInsufficient":"Onvoldoende gegevens","masteryDeveloping":"In ontwikkeling","masteryAcquired":"Verworven","masteryStrong":"Sterk","masteryExcellent":"Uitstekend"});
Object.assign(I18N.et,{"mastery":"Valdamine","masterySub":"Sinu loogilised tugevused ja arendatavad tehnikad.","masteryOverall":"Üldine valdamine","masteryObserved":"Vaadeldud","masterySolo":"Iseseisvalt lahendatud","masteryErrors":"Seotud vead","masteryConfidence":"Usaldus","masteryInsufficient":"Andmeid pole piisavalt","masteryDeveloping":"Arenev","masteryAcquired":"Omandatud","masteryStrong":"Tugev","masteryExcellent":"Suurepärane"});
Object.assign(I18N.fi,{"mastery":"Hallinta","masterySub":"Loogiset vahvuutesi ja kehitettäviä tekniikoita.","masteryOverall":"Kokonaishallinta","masteryObserved":"Havaittu","masterySolo":"Ratkaistu itse","masteryErrors":"Liittyvät virheet","masteryConfidence":"Luotettavuus","masteryInsufficient":"Ei riittävästi tietoa","masteryDeveloping":"Kehittyvä","masteryAcquired":"Omaksuttu","masteryStrong":"Vahva","masteryExcellent":"Erinomainen"});
Object.assign(I18N.de,{"mastery":"Beherrschung","masterySub":"Deine logischen Stärken und Techniken mit Verbesserungspotenzial.","masteryOverall":"Gesamtbeherrschung","masteryObserved":"Beobachtet","masterySolo":"Allein gelöst","masteryErrors":"Zugehörige Fehler","masteryConfidence":"Sicherheit","masteryInsufficient":"Nicht genügend Daten","masteryDeveloping":"In Entwicklung","masteryAcquired":"Erworben","masteryStrong":"Stark","masteryExcellent":"Ausgezeichnet"});
Object.assign(I18N.el,{"mastery":"Κατάκτηση","masterySub":"Τα λογικά δυνατά σου σημεία και οι τεχνικές προς βελτίωση.","masteryOverall":"Συνολική κατάκτηση","masteryObserved":"Παρατηρήθηκαν","masterySolo":"Λύθηκαν χωρίς βοήθεια","masteryErrors":"Σχετικά λάθη","masteryConfidence":"Βεβαιότητα","masteryInsufficient":"Ανεπαρκή δεδομένα","masteryDeveloping":"Σε ανάπτυξη","masteryAcquired":"Κατακτημένο","masteryStrong":"Ισχυρό","masteryExcellent":"Εξαιρετικό"});
Object.assign(I18N.hu,{"mastery":"Elsajátítás","masterySub":"Logikai erősségeid és a fejlesztendő technikák.","masteryOverall":"Összesített elsajátítás","masteryObserved":"Megfigyelt","masterySolo":"Önállóan megoldott","masteryErrors":"Kapcsolódó hibák","masteryConfidence":"Biztonság","masteryInsufficient":"Nincs elég adat","masteryDeveloping":"Fejlődő","masteryAcquired":"Elsajátított","masteryStrong":"Erős","masteryExcellent":"Kiváló"});
Object.assign(I18N.ga,{"mastery":"Máistreacht","masterySub":"Do láidreachtaí loighciúla agus na teicnící le feabhsú.","masteryOverall":"Máistreacht iomlán","masteryObserved":"Breathnaithe","masterySolo":"Réitithe leat féin","masteryErrors":"Earráidí gaolmhara","masteryConfidence":"Muinín","masteryInsufficient":"Gan dóthain sonraí","masteryDeveloping":"Ag forbairt","masteryAcquired":"Sealbhaithe","masteryStrong":"Láidir","masteryExcellent":"Ar fheabhas"});
Object.assign(I18N.it,{"mastery":"Padronanza","masterySub":"I tuoi punti di forza logici e le tecniche da migliorare.","masteryOverall":"Padronanza complessiva","masteryObserved":"Osservate","masterySolo":"Risolte da solo","masteryErrors":"Errori correlati","masteryConfidence":"Affidabilità","masteryInsufficient":"Dati insufficienti","masteryDeveloping":"In sviluppo","masteryAcquired":"Acquisita","masteryStrong":"Solida","masteryExcellent":"Eccellente"});
Object.assign(I18N.lv,{"mastery":"Prasme","masterySub":"Tavas loģikas stiprās puses un pilnveidojamie paņēmieni.","masteryOverall":"Kopējā prasme","masteryObserved":"Novērotas","masterySolo":"Atrisinātas patstāvīgi","masteryErrors":"Saistītās kļūdas","masteryConfidence":"Pārliecība","masteryInsufficient":"Nepietiek datu","masteryDeveloping":"Attīstās","masteryAcquired":"Apgūts","masteryStrong":"Spēcīgs","masteryExcellent":"Izcili"});
Object.assign(I18N.lt,{"mastery":"Įvaldymas","masterySub":"Tavo loginės stiprybės ir tobulintini metodai.","masteryOverall":"Bendras įvaldymas","masteryObserved":"Stebėta","masterySolo":"Išspręsta savarankiškai","masteryErrors":"Susijusios klaidos","masteryConfidence":"Patikimumas","masteryInsufficient":"Nepakanka duomenų","masteryDeveloping":"Tobulėjama","masteryAcquired":"Įvaldyta","masteryStrong":"Stipru","masteryExcellent":"Puiku"});
Object.assign(I18N.mt,{"mastery":"Ħakma","masterySub":"Il-punti b’saħħithom loġiċi tiegħek u t-tekniki li għandek ittejjeb.","masteryOverall":"Ħakma ġenerali","masteryObserved":"Osservati","masterySolo":"Solvuti waħdek","masteryErrors":"Żbalji relatati","masteryConfidence":"Fiduċja","masteryInsufficient":"Mhux biżżejjed data","masteryDeveloping":"Qed tiżviluppa","masteryAcquired":"Miksuba","masteryStrong":"B’saħħitha","masteryExcellent":"Eċċellenti"});
Object.assign(I18N.pl,{"mastery":"Opanowanie","masterySub":"Twoje mocne strony logiczne i techniki do poprawy.","masteryOverall":"Ogólne opanowanie","masteryObserved":"Zaobserwowane","masterySolo":"Rozwiązane samodzielnie","masteryErrors":"Powiązane błędy","masteryConfidence":"Pewność","masteryInsufficient":"Za mało danych","masteryDeveloping":"W rozwoju","masteryAcquired":"Opanowane","masteryStrong":"Mocne","masteryExcellent":"Doskonałe"});
Object.assign(I18N.ro,{"mastery":"Stăpânire","masterySub":"Punctele tale forte logice și tehnicile de îmbunătățit.","masteryOverall":"Stăpânire generală","masteryObserved":"Observate","masterySolo":"Rezolvate singur","masteryErrors":"Erori asociate","masteryConfidence":"Încredere","masteryInsufficient":"Date insuficiente","masteryDeveloping":"În dezvoltare","masteryAcquired":"Dobândit","masteryStrong":"Solid","masteryExcellent":"Excelent"});
Object.assign(I18N.sk,{"mastery":"Zvládnutie","masterySub":"Tvoje logické silné stránky a techniky na zlepšenie.","masteryOverall":"Celkové zvládnutie","masteryObserved":"Pozorované","masterySolo":"Vyriešené samostatne","masteryErrors":"Súvisiace chyby","masteryConfidence":"Spoľahlivosť","masteryInsufficient":"Nedostatok údajov","masteryDeveloping":"Vo vývoji","masteryAcquired":"Osvojené","masteryStrong":"Silné","masteryExcellent":"Výborné"});
Object.assign(I18N.sl,{"mastery":"Obvladovanje","masterySub":"Tvoje logične prednosti in tehnike za izboljšanje.","masteryOverall":"Skupno obvladovanje","masteryObserved":"Opaženo","masterySolo":"Rešeno samostojno","masteryErrors":"Povezane napake","masteryConfidence":"Zanesljivost","masteryInsufficient":"Premalo podatkov","masteryDeveloping":"V razvoju","masteryAcquired":"Usvojeno","masteryStrong":"Močno","masteryExcellent":"Odlično"});
Object.assign(I18N.sv,{"mastery":"Bemästring","masterySub":"Dina logiska styrkor och tekniker att förbättra.","masteryOverall":"Total bemästring","masteryObserved":"Observerade","masterySolo":"Lösta själv","masteryErrors":"Relaterade fel","masteryConfidence":"Tillförlitlighet","masteryInsufficient":"Inte tillräckligt med data","masteryDeveloping":"Under utveckling","masteryAcquired":"Inlärt","masteryStrong":"Starkt","masteryExcellent":"Utmärkt"});

/* v2.16.0 — adaptive Coach labels */
Object.assign(I18N.en,{"coachMode":"Coach mode","coachModeSub":"Choose how much help Logic Coach gives automatically.","coachMinimal":"Minimal","coachNormal":"Normal","coachPedagogical":"Pedagogical","adaptiveHelp":"Adaptive help","adaptiveLight":"Light guidance","adaptiveReinforced":"Reinforced guidance","adaptiveLearning":"Learning mode","recommended":"Recommended"});
Object.assign(I18N.zh,{"coachMode":"教练模式","coachModeSub":"选择 Logic Coach 自动提供多少帮助。","coachMinimal":"最少","coachNormal":"正常","coachPedagogical":"教学","adaptiveHelp":"自适应帮助","adaptiveLight":"轻度提示","adaptiveReinforced":"加强提示","adaptiveLearning":"学习模式","recommended":"建议"});
Object.assign(I18N.hi,{"coachMode":"कोच मोड","coachModeSub":"Logic Coach अपने आप कितनी मदद दे, चुनें।","coachMinimal":"न्यूनतम","coachNormal":"सामान्य","coachPedagogical":"शैक्षिक","adaptiveHelp":"अनुकूली सहायता","adaptiveLight":"हल्का मार्गदर्शन","adaptiveReinforced":"अधिक मार्गदर्शन","adaptiveLearning":"सीखने का मोड","recommended":"अनुशंसित"});
Object.assign(I18N.es,{"coachMode":"Modo del Coach","coachModeSub":"Elige cuánta ayuda ofrece Logic Coach automáticamente.","coachMinimal":"Mínimo","coachNormal":"Normal","coachPedagogical":"Pedagógico","adaptiveHelp":"Ayuda adaptativa","adaptiveLight":"Orientación ligera","adaptiveReinforced":"Ayuda reforzada","adaptiveLearning":"Modo aprendizaje","recommended":"Recomendado"});
Object.assign(I18N.ar,{"coachMode":"وضع المدرب","coachModeSub":"اختر مقدار المساعدة التي يقدمها Logic Coach تلقائيًا.","coachMinimal":"الحد الأدنى","coachNormal":"عادي","coachPedagogical":"تعليمي","adaptiveHelp":"مساعدة تكيفية","adaptiveLight":"توجيه خفيف","adaptiveReinforced":"مساعدة معززة","adaptiveLearning":"وضع التعلم","recommended":"موصى به"});
Object.assign(I18N.fr,{"coachMode":"Mode du Coach","coachModeSub":"Choisis la quantité d’aide que Logic Coach peut fournir automatiquement.","coachMinimal":"Minimal","coachNormal":"Normal","coachPedagogical":"Pédagogique","adaptiveHelp":"Aide adaptative","adaptiveLight":"Orientation légère","adaptiveReinforced":"Aide renforcée","adaptiveLearning":"Mode apprentissage","recommended":"Recommandé"});
Object.assign(I18N.bn,{"coachMode":"কোচ মোড","coachModeSub":"Logic Coach স্বয়ংক্রিয়ভাবে কতটা সাহায্য দেবে তা বেছে নিন।","coachMinimal":"সর্বনিম্ন","coachNormal":"স্বাভাবিক","coachPedagogical":"শিক্ষামূলক","adaptiveHelp":"অভিযোজিত সহায়তা","adaptiveLight":"হালকা নির্দেশনা","adaptiveReinforced":"বর্ধিত সহায়তা","adaptiveLearning":"শেখার মোড","recommended":"প্রস্তাবিত"});
Object.assign(I18N.pt,{"coachMode":"Modo do Coach","coachModeSub":"Escolhe quanta ajuda o Logic Coach fornece automaticamente.","coachMinimal":"Mínimo","coachNormal":"Normal","coachPedagogical":"Pedagógico","adaptiveHelp":"Ajuda adaptativa","adaptiveLight":"Orientação ligeira","adaptiveReinforced":"Ajuda reforçada","adaptiveLearning":"Modo de aprendizagem","recommended":"Recomendado"});
Object.assign(I18N.id,{"coachMode":"Mode Coach","coachModeSub":"Pilih seberapa banyak bantuan yang diberikan Logic Coach secara otomatis.","coachMinimal":"Minimal","coachNormal":"Normal","coachPedagogical":"Pedagogis","adaptiveHelp":"Bantuan adaptif","adaptiveLight":"Panduan ringan","adaptiveReinforced":"Bantuan diperkuat","adaptiveLearning":"Mode belajar","recommended":"Direkomendasikan"});
Object.assign(I18N.ur,{"coachMode":"کوچ موڈ","coachModeSub":"منتخب کریں کہ Logic Coach خودکار طور پر کتنی مدد دے۔","coachMinimal":"کم سے کم","coachNormal":"عام","coachPedagogical":"تعلیمی","adaptiveHelp":"موافق مدد","adaptiveLight":"ہلکی رہنمائی","adaptiveReinforced":"زیادہ مدد","adaptiveLearning":"سیکھنے کا موڈ","recommended":"تجویز کردہ"});
Object.assign(I18N.bg,{"coachMode":"Режим на Coach","coachModeSub":"Избери колко помощ да дава Logic Coach автоматично.","coachMinimal":"Минимален","coachNormal":"Нормален","coachPedagogical":"Педагогически","adaptiveHelp":"Адаптивна помощ","adaptiveLight":"Леко насочване","adaptiveReinforced":"Засилена помощ","adaptiveLearning":"Режим обучение","recommended":"Препоръчано"});
Object.assign(I18N.hr,{"coachMode":"Način Coacha","coachModeSub":"Odaberi koliko pomoći Logic Coach daje automatski.","coachMinimal":"Minimalno","coachNormal":"Normalno","coachPedagogical":"Pedagoški","adaptiveHelp":"Prilagodljiva pomoć","adaptiveLight":"Lagana smjernica","adaptiveReinforced":"Pojačana pomoć","adaptiveLearning":"Način učenja","recommended":"Preporučeno"});
Object.assign(I18N.cs,{"coachMode":"Režim Coache","coachModeSub":"Zvolte, kolik pomoci má Logic Coach poskytovat automaticky.","coachMinimal":"Minimální","coachNormal":"Normální","coachPedagogical":"Pedagogický","adaptiveHelp":"Adaptivní pomoc","adaptiveLight":"Lehké vedení","adaptiveReinforced":"Posílená pomoc","adaptiveLearning":"Režim učení","recommended":"Doporučeno"});
Object.assign(I18N.da,{"coachMode":"Coach-tilstand","coachModeSub":"Vælg hvor meget hjælp Logic Coach automatisk giver.","coachMinimal":"Minimal","coachNormal":"Normal","coachPedagogical":"Pædagogisk","adaptiveHelp":"Adaptiv hjælp","adaptiveLight":"Let vejledning","adaptiveReinforced":"Forstærket hjælp","adaptiveLearning":"Læringstilstand","recommended":"Anbefalet"});
Object.assign(I18N.nl,{"coachMode":"Coach-modus","coachModeSub":"Kies hoeveel hulp Logic Coach automatisch geeft.","coachMinimal":"Minimaal","coachNormal":"Normaal","coachPedagogical":"Pedagogisch","adaptiveHelp":"Adaptieve hulp","adaptiveLight":"Lichte begeleiding","adaptiveReinforced":"Versterkte hulp","adaptiveLearning":"Leermodus","recommended":"Aanbevolen"});
Object.assign(I18N.et,{"coachMode":"Coach-režiim","coachModeSub":"Vali, kui palju abi Logic Coach automaatselt annab.","coachMinimal":"Minimaalne","coachNormal":"Tavaline","coachPedagogical":"Õpetav","adaptiveHelp":"Kohanduv abi","adaptiveLight":"Kerge suunamine","adaptiveReinforced":"Tugevdatud abi","adaptiveLearning":"Õpperežiim","recommended":"Soovitatud"});
Object.assign(I18N.fi,{"coachMode":"Coach-tila","coachModeSub":"Valitse, kuinka paljon apua Logic Coach antaa automaattisesti.","coachMinimal":"Minimaalinen","coachNormal":"Normaali","coachPedagogical":"Pedagoginen","adaptiveHelp":"Mukautuva apu","adaptiveLight":"Kevyt ohjaus","adaptiveReinforced":"Vahvistettu apu","adaptiveLearning":"Oppimistila","recommended":"Suositeltu"});
Object.assign(I18N.de,{"coachMode":"Coach-Modus","coachModeSub":"Wähle, wie viel Hilfe Logic Coach automatisch geben darf.","coachMinimal":"Minimal","coachNormal":"Normal","coachPedagogical":"Pädagogisch","adaptiveHelp":"Adaptive Hilfe","adaptiveLight":"Leichte Orientierung","adaptiveReinforced":"Verstärkte Hilfe","adaptiveLearning":"Lernmodus","recommended":"Empfohlen"});
Object.assign(I18N.el,{"coachMode":"Λειτουργία Coach","coachModeSub":"Επίλεξε πόση βοήθεια θα δίνει αυτόματα το Logic Coach.","coachMinimal":"Ελάχιστη","coachNormal":"Κανονική","coachPedagogical":"Παιδαγωγική","adaptiveHelp":"Προσαρμοστική βοήθεια","adaptiveLight":"Ελαφριά καθοδήγηση","adaptiveReinforced":"Ενισχυμένη βοήθεια","adaptiveLearning":"Λειτουργία μάθησης","recommended":"Προτεινόμενο"});
Object.assign(I18N.hu,{"coachMode":"Coach mód","coachModeSub":"Válaszd ki, mennyi segítséget adjon automatikusan a Logic Coach.","coachMinimal":"Minimális","coachNormal":"Normál","coachPedagogical":"Pedagógiai","adaptiveHelp":"Adaptív segítség","adaptiveLight":"Enyhe útmutatás","adaptiveReinforced":"Megerősített segítség","adaptiveLearning":"Tanulási mód","recommended":"Ajánlott"});
Object.assign(I18N.ga,{"coachMode":"Mód Coach","coachModeSub":"Roghnaigh cé mhéad cabhrach a thugann Logic Coach go huathoibríoch.","coachMinimal":"Íosta","coachNormal":"Gnáth","coachPedagogical":"Oideachasúil","adaptiveHelp":"Cabhair oiriúnaitheach","adaptiveLight":"Treoir éadrom","adaptiveReinforced":"Cabhair fheabhsaithe","adaptiveLearning":"Mód foghlama","recommended":"Molta"});
Object.assign(I18N.it,{"coachMode":"Modalità Coach","coachModeSub":"Scegli quanta assistenza Logic Coach può fornire automaticamente.","coachMinimal":"Minimo","coachNormal":"Normale","coachPedagogical":"Pedagogico","adaptiveHelp":"Aiuto adattivo","adaptiveLight":"Orientamento leggero","adaptiveReinforced":"Aiuto rinforzato","adaptiveLearning":"Modalità apprendimento","recommended":"Consigliato"});
Object.assign(I18N.lv,{"coachMode":"Coach režīms","coachModeSub":"Izvēlies, cik daudz palīdzības Logic Coach sniedz automātiski.","coachMinimal":"Minimāls","coachNormal":"Normāls","coachPedagogical":"Pedagoģisks","adaptiveHelp":"Adaptīva palīdzība","adaptiveLight":"Viegla norāde","adaptiveReinforced":"Pastiprināta palīdzība","adaptiveLearning":"Mācību režīms","recommended":"Ieteicams"});
Object.assign(I18N.lt,{"coachMode":"Coach režimas","coachModeSub":"Pasirink, kiek pagalbos Logic Coach teikia automatiškai.","coachMinimal":"Minimalus","coachNormal":"Normalus","coachPedagogical":"Pedagoginis","adaptiveHelp":"Prisitaikanti pagalba","adaptiveLight":"Lengvas nukreipimas","adaptiveReinforced":"Sustiprinta pagalba","adaptiveLearning":"Mokymosi režimas","recommended":"Rekomenduojama"});
Object.assign(I18N.mt,{"coachMode":"Modalità Coach","coachModeSub":"Agħżel kemm għajnuna jagħti Logic Coach awtomatikament.","coachMinimal":"Minimu","coachNormal":"Normali","coachPedagogical":"Pedagoġiku","adaptiveHelp":"Għajnuna adattiva","adaptiveLight":"Gwida ħafifa","adaptiveReinforced":"Għajnuna msaħħa","adaptiveLearning":"Modalità tagħlim","recommended":"Rakkomandat"});
Object.assign(I18N.pl,{"coachMode":"Tryb Coacha","coachModeSub":"Wybierz, ile pomocy Logic Coach ma udzielać automatycznie.","coachMinimal":"Minimalny","coachNormal":"Normalny","coachPedagogical":"Pedagogiczny","adaptiveHelp":"Pomoc adaptacyjna","adaptiveLight":"Lekka wskazówka","adaptiveReinforced":"Wzmocniona pomoc","adaptiveLearning":"Tryb nauki","recommended":"Zalecane"});
Object.assign(I18N.ro,{"coachMode":"Mod Coach","coachModeSub":"Alege cât ajutor oferă automat Logic Coach.","coachMinimal":"Minimal","coachNormal":"Normal","coachPedagogical":"Pedagogic","adaptiveHelp":"Ajutor adaptiv","adaptiveLight":"Ghidare ușoară","adaptiveReinforced":"Ajutor consolidat","adaptiveLearning":"Mod de învățare","recommended":"Recomandat"});
Object.assign(I18N.sk,{"coachMode":"Režim Coacha","coachModeSub":"Vyber, koľko pomoci má Logic Coach poskytovať automaticky.","coachMinimal":"Minimálny","coachNormal":"Normálny","coachPedagogical":"Pedagogický","adaptiveHelp":"Adaptívna pomoc","adaptiveLight":"Ľahké usmernenie","adaptiveReinforced":"Posilnená pomoc","adaptiveLearning":"Režim učenia","recommended":"Odporúčané"});
Object.assign(I18N.sl,{"coachMode":"Način Coacha","coachModeSub":"Izberi, koliko pomoči Logic Coach samodejno ponudi.","coachMinimal":"Minimalno","coachNormal":"Normalno","coachPedagogical":"Pedagoško","adaptiveHelp":"Prilagodljiva pomoč","adaptiveLight":"Lahka usmeritev","adaptiveReinforced":"Okrepljena pomoč","adaptiveLearning":"Način učenja","recommended":"Priporočeno"});
Object.assign(I18N.sv,{"coachMode":"Coach-läge","coachModeSub":"Välj hur mycket hjälp Logic Coach ger automatiskt.","coachMinimal":"Minimal","coachNormal":"Normal","coachPedagogical":"Pedagogiskt","adaptiveHelp":"Adaptiv hjälp","adaptiveLight":"Lätt vägledning","adaptiveReinforced":"Förstärkt hjälp","adaptiveLearning":"Inlärningsläge","recommended":"Rekommenderat"});

/* v2.17.0 — targeted training labels */
Object.assign(I18N.en,{"training":"Training","trainingSub":"Practice one logical technique at a time.","train":"Practice","trainTechnique":"Practice this technique","trainingTarget":"Target technique","newExercise":"New exercise","trainingComplete":"Exercise complete","trainingTryAgain":"This move does not solve the targeted deduction. Undo or reset to try again.","trainingUnavailable":"No validated exercise could be generated for this technique. Try again.","trainingCompleted":"Completed","trainingAttempts":"Attempts","trainingRecommended":"Recommended"});
Object.assign(I18N.zh,{"training":"训练","trainingSub":"一次练习一种逻辑技巧。","train":"练习","trainTechnique":"练习此技巧","trainingTarget":"目标技巧","newExercise":"新练习","trainingComplete":"练习完成","trainingTryAgain":"这一步没有解决目标推理。请撤销或重置后再试。","trainingUnavailable":"无法为此技巧生成已验证的练习，请重试。","trainingCompleted":"已完成","trainingAttempts":"尝试次数","trainingRecommended":"推荐"});
Object.assign(I18N.hi,{"training":"अभ्यास","trainingSub":"एक समय में एक तार्किक तकनीक का अभ्यास करें।","train":"अभ्यास करें","trainTechnique":"इस तकनीक का अभ्यास करें","trainingTarget":"लक्षित तकनीक","newExercise":"नया अभ्यास","trainingComplete":"अभ्यास पूरा","trainingTryAgain":"यह चाल लक्षित निष्कर्ष को हल नहीं करती। वापस जाएँ या रीसेट करके फिर प्रयास करें।","trainingUnavailable":"इस तकनीक के लिए सत्यापित अभ्यास नहीं बन सका। फिर प्रयास करें।","trainingCompleted":"पूर्ण","trainingAttempts":"प्रयास","trainingRecommended":"अनुशंसित"});
Object.assign(I18N.es,{"training":"Entrenamiento","trainingSub":"Practica una técnica lógica cada vez.","train":"Entrenar","trainTechnique":"Practicar esta técnica","trainingTarget":"Técnica objetivo","newExercise":"Nuevo ejercicio","trainingComplete":"Ejercicio completado","trainingTryAgain":"Esta jugada no resuelve la deducción objetivo. Deshaz o reinicia para intentarlo de nuevo.","trainingUnavailable":"No se pudo generar un ejercicio validado para esta técnica. Inténtalo de nuevo.","trainingCompleted":"Completados","trainingAttempts":"Intentos","trainingRecommended":"Recomendado"});
Object.assign(I18N.ar,{"training":"تدريب","trainingSub":"تدرّب على تقنية منطقية واحدة في كل مرة.","train":"تدرّب","trainTechnique":"تدرّب على هذه التقنية","trainingTarget":"التقنية المستهدفة","newExercise":"تمرين جديد","trainingComplete":"اكتمل التمرين","trainingTryAgain":"هذه النقلة لا تحل الاستنتاج المستهدف. تراجع أو أعد الضبط وحاول مجددًا.","trainingUnavailable":"تعذر إنشاء تمرين موثّق لهذه التقنية. حاول مرة أخرى.","trainingCompleted":"مكتمل","trainingAttempts":"محاولات","trainingRecommended":"موصى به"});
Object.assign(I18N.fr,{"training":"Entraînement","trainingSub":"Travaille une technique logique à la fois.","train":"S’entraîner","trainTechnique":"Travailler cette technique","trainingTarget":"Technique ciblée","newExercise":"Nouvel exercice","trainingComplete":"Exercice réussi","trainingTryAgain":"Ce coup ne résout pas la déduction ciblée. Annule ou réinitialise pour réessayer.","trainingUnavailable":"Impossible de générer une situation validée pour cette technique. Réessaie.","trainingCompleted":"Réussis","trainingAttempts":"Tentatives","trainingRecommended":"Recommandé"});
Object.assign(I18N.bn,{"training":"অনুশীলন","trainingSub":"একবারে একটি যৌক্তিক কৌশল অনুশীলন করুন।","train":"অনুশীলন","trainTechnique":"এই কৌশল অনুশীলন করুন","trainingTarget":"লক্ষ্য কৌশল","newExercise":"নতুন অনুশীলন","trainingComplete":"অনুশীলন সম্পন্ন","trainingTryAgain":"এই চালটি লক্ষ্যযুক্ত সিদ্ধান্ত সমাধান করে না। পূর্বাবস্থায় ফিরুন বা রিসেট করে আবার চেষ্টা করুন।","trainingUnavailable":"এই কৌশলের জন্য যাচাইকৃত অনুশীলন তৈরি করা যায়নি। আবার চেষ্টা করুন।","trainingCompleted":"সম্পন্ন","trainingAttempts":"চেষ্টা","trainingRecommended":"প্রস্তাবিত"});
Object.assign(I18N.pt,{"training":"Treino","trainingSub":"Pratica uma técnica lógica de cada vez.","train":"Treinar","trainTechnique":"Treinar esta técnica","trainingTarget":"Técnica-alvo","newExercise":"Novo exercício","trainingComplete":"Exercício concluído","trainingTryAgain":"Esta jogada não resolve a dedução alvo. Desfaz ou reinicia para tentar novamente.","trainingUnavailable":"Não foi possível gerar um exercício validado para esta técnica. Tenta novamente.","trainingCompleted":"Concluídos","trainingAttempts":"Tentativas","trainingRecommended":"Recomendado"});
Object.assign(I18N.id,{"training":"Latihan","trainingSub":"Latih satu teknik logika pada satu waktu.","train":"Berlatih","trainTechnique":"Latih teknik ini","trainingTarget":"Teknik target","newExercise":"Latihan baru","trainingComplete":"Latihan selesai","trainingTryAgain":"Langkah ini tidak menyelesaikan deduksi target. Urungkan atau reset lalu coba lagi.","trainingUnavailable":"Latihan tervalidasi untuk teknik ini tidak dapat dibuat. Coba lagi.","trainingCompleted":"Selesai","trainingAttempts":"Percobaan","trainingRecommended":"Direkomendasikan"});
Object.assign(I18N.ur,{"training":"مشق","trainingSub":"ایک وقت میں ایک منطقی تکنیک کی مشق کریں۔","train":"مشق","trainTechnique":"اس تکنیک کی مشق کریں","trainingTarget":"ہدف تکنیک","newExercise":"نئی مشق","trainingComplete":"مشق مکمل","trainingTryAgain":"یہ چال ہدف نتیجے کو حل نہیں کرتی۔ واپس کریں یا ری سیٹ کر کے دوبارہ کوشش کریں۔","trainingUnavailable":"اس تکنیک کے لیے تصدیق شدہ مشق نہیں بن سکی۔ دوبارہ کوشش کریں۔","trainingCompleted":"مکمل","trainingAttempts":"کوششیں","trainingRecommended":"تجویز کردہ"});
Object.assign(I18N.bg,{"training":"Тренировка","trainingSub":"Упражнявай по една логическа техника.","train":"Тренирай","trainTechnique":"Упражни тази техника","trainingTarget":"Целева техника","newExercise":"Ново упражнение","trainingComplete":"Упражнението е завършено","trainingTryAgain":"Този ход не решава целевото заключение. Отмени или нулирай и опитай пак.","trainingUnavailable":"Не можа да се генерира валидирано упражнение за тази техника. Опитай отново.","trainingCompleted":"Завършени","trainingAttempts":"Опити","trainingRecommended":"Препоръчано"});
Object.assign(I18N.hr,{"training":"Vježbanje","trainingSub":"Vježbaj jednu logičku tehniku odjednom.","train":"Vježbaj","trainTechnique":"Vježbaj ovu tehniku","trainingTarget":"Ciljana tehnika","newExercise":"Nova vježba","trainingComplete":"Vježba završena","trainingTryAgain":"Ovaj potez ne rješava ciljanu dedukciju. Poništi ili resetiraj i pokušaj ponovno.","trainingUnavailable":"Nije moguće generirati potvrđenu vježbu za ovu tehniku. Pokušaj ponovno.","trainingCompleted":"Završeno","trainingAttempts":"Pokušaji","trainingRecommended":"Preporučeno"});
Object.assign(I18N.cs,{"training":"Trénink","trainingSub":"Procvičuj jednu logickou techniku po druhé.","train":"Trénovat","trainTechnique":"Procvičit tuto techniku","trainingTarget":"Cílová technika","newExercise":"Nové cvičení","trainingComplete":"Cvičení dokončeno","trainingTryAgain":"Tento tah neřeší cílovou dedukci. Vrať tah nebo resetuj a zkus to znovu.","trainingUnavailable":"Pro tuto techniku se nepodařilo vytvořit ověřené cvičení. Zkus to znovu.","trainingCompleted":"Dokončeno","trainingAttempts":"Pokusy","trainingRecommended":"Doporučeno"});
Object.assign(I18N.da,{"training":"Træning","trainingSub":"Øv én logisk teknik ad gangen.","train":"Træn","trainTechnique":"Øv denne teknik","trainingTarget":"Målteknik","newExercise":"Ny øvelse","trainingComplete":"Øvelse gennemført","trainingTryAgain":"Dette træk løser ikke den målrettede deduktion. Fortryd eller nulstil og prøv igen.","trainingUnavailable":"Der kunne ikke genereres en valideret øvelse til denne teknik. Prøv igen.","trainingCompleted":"Gennemført","trainingAttempts":"Forsøg","trainingRecommended":"Anbefalet"});
Object.assign(I18N.nl,{"training":"Training","trainingSub":"Oefen één logische techniek tegelijk.","train":"Oefenen","trainTechnique":"Deze techniek oefenen","trainingTarget":"Doeltechniek","newExercise":"Nieuwe oefening","trainingComplete":"Oefening voltooid","trainingTryAgain":"Deze zet lost de beoogde deductie niet op. Maak ongedaan of reset en probeer opnieuw.","trainingUnavailable":"Er kon geen gevalideerde oefening voor deze techniek worden gemaakt. Probeer opnieuw.","trainingCompleted":"Voltooid","trainingAttempts":"Pogingen","trainingRecommended":"Aanbevolen"});
Object.assign(I18N.et,{"training":"Harjutamine","trainingSub":"Harjuta korraga üht loogikatehnikat.","train":"Harjuta","trainTechnique":"Harjuta seda tehnikat","trainingTarget":"Sihttehnika","newExercise":"Uus harjutus","trainingComplete":"Harjutus tehtud","trainingTryAgain":"See käik ei lahenda sihitud järeldust. Võta tagasi või lähtesta ja proovi uuesti.","trainingUnavailable":"Selle tehnika jaoks ei õnnestunud valideeritud harjutust luua. Proovi uuesti.","trainingCompleted":"Tehtud","trainingAttempts":"Katsed","trainingRecommended":"Soovitatud"});
Object.assign(I18N.fi,{"training":"Harjoittelu","trainingSub":"Harjoittele yhtä logiikkatekniikkaa kerrallaan.","train":"Harjoittele","trainTechnique":"Harjoittele tätä tekniikkaa","trainingTarget":"Kohdetekniikka","newExercise":"Uusi harjoitus","trainingComplete":"Harjoitus valmis","trainingTryAgain":"Tämä siirto ei ratkaise kohdededuktiota. Kumoa tai nollaa ja yritä uudelleen.","trainingUnavailable":"Tälle tekniikalle ei voitu luoda validoitua harjoitusta. Yritä uudelleen.","trainingCompleted":"Valmiit","trainingAttempts":"Yritykset","trainingRecommended":"Suositeltu"});
Object.assign(I18N.de,{"training":"Training","trainingSub":"Übe jeweils eine logische Technik.","train":"Trainieren","trainTechnique":"Diese Technik üben","trainingTarget":"Zieltechnik","newExercise":"Neue Übung","trainingComplete":"Übung abgeschlossen","trainingTryAgain":"Dieser Zug löst die Zieldeduktion nicht. Rückgängig machen oder zurücksetzen und erneut versuchen.","trainingUnavailable":"Für diese Technik konnte keine validierte Übung erzeugt werden. Bitte erneut versuchen.","trainingCompleted":"Abgeschlossen","trainingAttempts":"Versuche","trainingRecommended":"Empfohlen"});
Object.assign(I18N.el,{"training":"Εξάσκηση","trainingSub":"Εξασκήσου σε μία λογική τεχνική κάθε φορά.","train":"Εξάσκηση","trainTechnique":"Εξάσκηση αυτής της τεχνικής","trainingTarget":"Τεχνική στόχος","newExercise":"Νέα άσκηση","trainingComplete":"Η άσκηση ολοκληρώθηκε","trainingTryAgain":"Αυτή η κίνηση δεν λύνει τη στοχευμένη παραγωγή. Αναίρεσε ή επανάφερε και προσπάθησε ξανά.","trainingUnavailable":"Δεν δημιουργήθηκε επικυρωμένη άσκηση για αυτή την τεχνική. Δοκίμασε ξανά.","trainingCompleted":"Ολοκληρωμένα","trainingAttempts":"Προσπάθειες","trainingRecommended":"Προτεινόμενο"});
Object.assign(I18N.hu,{"training":"Gyakorlás","trainingSub":"Egyszerre egy logikai technikát gyakorolj.","train":"Gyakorlás","trainTechnique":"E technika gyakorlása","trainingTarget":"Céltechnika","newExercise":"Új gyakorlat","trainingComplete":"Gyakorlat teljesítve","trainingTryAgain":"Ez a lépés nem oldja meg a célzott következtetést. Vond vissza vagy állítsd vissza, majd próbáld újra.","trainingUnavailable":"Ehhez a technikához nem sikerült ellenőrzött gyakorlatot létrehozni. Próbáld újra.","trainingCompleted":"Teljesítve","trainingAttempts":"Próbálkozások","trainingRecommended":"Ajánlott"});
Object.assign(I18N.ga,{"training":"Cleachtadh","trainingSub":"Cleachtaigh teicníc loighciúil amháin ag an am.","train":"Cleachtadh","trainTechnique":"Cleachtaigh an teicníc seo","trainingTarget":"Sprioc-theicníc","newExercise":"Cleachtadh nua","trainingComplete":"Cleachtadh críochnaithe","trainingTryAgain":"Ní réitíonn an bogadh seo an tátal spriocdhírithe. Cealaigh nó athshocraigh agus bain triail eile as.","trainingUnavailable":"Níorbh fhéidir cleachtadh bailíochtaithe a chruthú don teicníc seo. Bain triail eile as.","trainingCompleted":"Críochnaithe","trainingAttempts":"Iarrachtaí","trainingRecommended":"Molta"});
Object.assign(I18N.it,{"training":"Allenamento","trainingSub":"Esercita una tecnica logica alla volta.","train":"Allenati","trainTechnique":"Esercita questa tecnica","trainingTarget":"Tecnica obiettivo","newExercise":"Nuovo esercizio","trainingComplete":"Esercizio completato","trainingTryAgain":"Questa mossa non risolve la deduzione obiettivo. Annulla o reimposta e riprova.","trainingUnavailable":"Non è stato possibile generare un esercizio validato per questa tecnica. Riprova.","trainingCompleted":"Completati","trainingAttempts":"Tentativi","trainingRecommended":"Consigliato"});
Object.assign(I18N.lv,{"training":"Treniņš","trainingSub":"Vienlaikus trenē vienu loģikas paņēmienu.","train":"Trenēties","trainTechnique":"Trenēt šo paņēmienu","trainingTarget":"Mērķa paņēmiens","newExercise":"Jauns uzdevums","trainingComplete":"Uzdevums pabeigts","trainingTryAgain":"Šis gājiens neatrisina mērķa secinājumu. Atsauc vai atiestati un mēģini vēlreiz.","trainingUnavailable":"Šim paņēmienam neizdevās izveidot validētu uzdevumu. Mēģini vēlreiz.","trainingCompleted":"Pabeigti","trainingAttempts":"Mēģinājumi","trainingRecommended":"Ieteicams"});
Object.assign(I18N.lt,{"training":"Treniruotė","trainingSub":"Vienu metu lavink vieną loginį metodą.","train":"Treniruotis","trainTechnique":"Lavinti šį metodą","trainingTarget":"Tikslinis metodas","newExercise":"Naujas pratimas","trainingComplete":"Pratimas baigtas","trainingTryAgain":"Šis ėjimas neišsprendžia tikslinės išvados. Anuliuok arba nustatyk iš naujo ir bandyk dar kartą.","trainingUnavailable":"Šiam metodui nepavyko sugeneruoti patvirtinto pratimo. Bandyk dar kartą.","trainingCompleted":"Baigta","trainingAttempts":"Bandymai","trainingRecommended":"Rekomenduojama"});
Object.assign(I18N.mt,{"training":"Taħriġ","trainingSub":"Ipprattika teknika loġika waħda kull darba.","train":"Tħarreġ","trainTechnique":"Ipprattika din it-teknika","trainingTarget":"Teknika fil-mira","newExercise":"Eżerċizzju ġdid","trainingComplete":"Eżerċizzju lest","trainingTryAgain":"Din il-mossa ma ssolvix id-deduzzjoni fil-mira. Ħoll jew irrisettja u erġa’ pprova.","trainingUnavailable":"Ma setax jinħoloq eżerċizzju validat għal din it-teknika. Erġa’ pprova.","trainingCompleted":"Lesti","trainingAttempts":"Tentattivi","trainingRecommended":"Rakkomandat"});
Object.assign(I18N.pl,{"training":"Trening","trainingSub":"Ćwicz po jednej technice logicznej.","train":"Trenuj","trainTechnique":"Ćwicz tę technikę","trainingTarget":"Technika docelowa","newExercise":"Nowe ćwiczenie","trainingComplete":"Ćwiczenie ukończone","trainingTryAgain":"Ten ruch nie rozwiązuje docelowej dedukcji. Cofnij lub zresetuj i spróbuj ponownie.","trainingUnavailable":"Nie udało się wygenerować zweryfikowanego ćwiczenia dla tej techniki. Spróbuj ponownie.","trainingCompleted":"Ukończone","trainingAttempts":"Próby","trainingRecommended":"Zalecane"});
Object.assign(I18N.ro,{"training":"Antrenament","trainingSub":"Exersează câte o tehnică logică.","train":"Exersează","trainTechnique":"Exersează această tehnică","trainingTarget":"Tehnică țintă","newExercise":"Exercițiu nou","trainingComplete":"Exercițiu finalizat","trainingTryAgain":"Această mutare nu rezolvă deducția țintă. Anulează sau resetează și încearcă din nou.","trainingUnavailable":"Nu s-a putut genera un exercițiu validat pentru această tehnică. Încearcă din nou.","trainingCompleted":"Finalizate","trainingAttempts":"Încercări","trainingRecommended":"Recomandat"});
Object.assign(I18N.sk,{"training":"Tréning","trainingSub":"Precvičuj jednu logickú techniku naraz.","train":"Trénovať","trainTechnique":"Precvičiť túto techniku","trainingTarget":"Cieľová technika","newExercise":"Nové cvičenie","trainingComplete":"Cvičenie dokončené","trainingTryAgain":"Tento ťah nerieši cieľovú dedukciu. Vráť ho alebo resetuj a skús znova.","trainingUnavailable":"Pre túto techniku sa nepodarilo vytvoriť overené cvičenie. Skús znova.","trainingCompleted":"Dokončené","trainingAttempts":"Pokusy","trainingRecommended":"Odporúčané"});
Object.assign(I18N.sl,{"training":"Vadba","trainingSub":"Vadi eno logično tehniko naenkrat.","train":"Vadi","trainTechnique":"Vadi to tehniko","trainingTarget":"Ciljna tehnika","newExercise":"Nova vaja","trainingComplete":"Vaja končana","trainingTryAgain":"Ta poteza ne reši ciljne dedukcije. Razveljavi ali ponastavi in poskusi znova.","trainingUnavailable":"Za to tehniko ni bilo mogoče ustvariti preverjene vaje. Poskusi znova.","trainingCompleted":"Končano","trainingAttempts":"Poskusi","trainingRecommended":"Priporočeno"});
Object.assign(I18N.sv,{"training":"Träning","trainingSub":"Öva en logisk teknik i taget.","train":"Träna","trainTechnique":"Öva denna teknik","trainingTarget":"Målteknik","newExercise":"Ny övning","trainingComplete":"Övningen klar","trainingTryAgain":"Det här draget löser inte måldeduktionen. Ångra eller återställ och försök igen.","trainingUnavailable":"Ingen validerad övning kunde skapas för denna teknik. Försök igen.","trainingCompleted":"Klara","trainingAttempts":"Försök","trainingRecommended":"Rekommenderat"});

/* v2.18.0 — interactive learning path */
Object.assign(I18N.en,{"learn":"Learn","learnSub":"Interactive lessons: understand, observe, practise with guidance, then solve alone.","lesson":"Lesson","lessonExplanation":"Explanation","lessonGuided":"Guided example","lessonAssisted":"Assisted exercise","lessonIndependent":"Independent exercise","lessonStartGuided":"Start guided example","lessonStartAssisted":"Start assisted exercise","lessonStartIndependent":"Start independent exercise","lessonComplete":"Lesson completed","lessonProgress":"Lesson progress","lessonObserve":"What to observe","lessonGoal":"Goal","lessonDirectMethod":"Use the visible constraints to eliminate impossible choices and identify the forced move.","lessonContradictionMethod":"Test a hypothesis, follow its visible consequences, and reject it when a rule becomes impossible.","lessonShowMove":"Show the move","lessonIndependentRetry":"Finish this step again without Logic Coach to validate the independent stage.","lessonContinue":"Continue","lessonCompletedCount":"Lessons completed"});
Object.assign(I18N.zh,{"learn":"学习","learnSub":"互动课程：理解、观察、在指导下练习，然后独立解决。","lesson":"课程","lessonExplanation":"讲解","lessonGuided":"引导示例","lessonAssisted":"辅助练习","lessonIndependent":"独立练习","lessonStartGuided":"开始引导示例","lessonStartAssisted":"开始辅助练习","lessonStartIndependent":"开始独立练习","lessonComplete":"课程完成","lessonProgress":"课程进度","lessonObserve":"观察什么","lessonGoal":"目标","lessonDirectMethod":"利用可见约束排除不可能的选择并找出必然的一步。","lessonContradictionMethod":"测试一个假设，追踪其可见后果，并在规则变得不可能时排除它。","lessonShowMove":"显示这一步","lessonIndependentRetry":"请在不使用 Logic Coach 的情况下再次完成此步骤，以验证独立阶段。","lessonContinue":"继续","lessonCompletedCount":"已完成课程"});
Object.assign(I18N.hi,{"learn":"सीखें","learnSub":"इंटरैक्टिव पाठ: समझें, देखें, मार्गदर्शन के साथ अभ्यास करें, फिर स्वयं हल करें।","lesson":"पाठ","lessonExplanation":"व्याख्या","lessonGuided":"मार्गदर्शित उदाहरण","lessonAssisted":"सहायता वाला अभ्यास","lessonIndependent":"स्वतंत्र अभ्यास","lessonStartGuided":"मार्गदर्शित उदाहरण शुरू करें","lessonStartAssisted":"सहायता वाला अभ्यास शुरू करें","lessonStartIndependent":"स्वतंत्र अभ्यास शुरू करें","lessonComplete":"पाठ पूरा","lessonProgress":"पाठ प्रगति","lessonObserve":"क्या देखें","lessonGoal":"लक्ष्य","lessonDirectMethod":"दिखाई देने वाली बाधाओं से असंभव विकल्प हटाएँ और अनिवार्य चाल पहचानें।","lessonContradictionMethod":"एक परिकल्पना जाँचें, उसके दिखाई देने वाले परिणामों का अनुसरण करें और नियम असंभव होने पर उसे अस्वीकार करें।","lessonShowMove":"चाल दिखाएँ","lessonIndependentRetry":"स्वतंत्र चरण मान्य करने के लिए इसे Logic Coach के बिना फिर पूरा करें।","lessonContinue":"जारी रखें","lessonCompletedCount":"पूरे पाठ"});
Object.assign(I18N.es,{"learn":"Aprender","learnSub":"Lecciones interactivas: comprender, observar, practicar con ayuda y después resolver solo.","lesson":"Lección","lessonExplanation":"Explicación","lessonGuided":"Ejemplo guiado","lessonAssisted":"Ejercicio acompañado","lessonIndependent":"Ejercicio autónomo","lessonStartGuided":"Iniciar ejemplo guiado","lessonStartAssisted":"Iniciar ejercicio acompañado","lessonStartIndependent":"Iniciar ejercicio autónomo","lessonComplete":"Lección completada","lessonProgress":"Progreso de la lección","lessonObserve":"Qué observar","lessonGoal":"Objetivo","lessonDirectMethod":"Usa las restricciones visibles para eliminar opciones imposibles e identificar la jugada forzada.","lessonContradictionMethod":"Prueba una hipótesis, sigue sus consecuencias visibles y descártala cuando una regla se vuelva imposible.","lessonShowMove":"Mostrar la jugada","lessonIndependentRetry":"Completa de nuevo este paso sin Logic Coach para validar la etapa autónoma.","lessonContinue":"Continuar","lessonCompletedCount":"Lecciones completadas"});
Object.assign(I18N.ar,{"learn":"تعلّم","learnSub":"دروس تفاعلية: افهم، راقب، تدرب مع التوجيه، ثم حل بمفردك.","lesson":"درس","lessonExplanation":"شرح","lessonGuided":"مثال موجّه","lessonAssisted":"تمرين بمساعدة","lessonIndependent":"تمرين مستقل","lessonStartGuided":"ابدأ المثال الموجّه","lessonStartAssisted":"ابدأ التمرين بمساعدة","lessonStartIndependent":"ابدأ التمرين المستقل","lessonComplete":"اكتمل الدرس","lessonProgress":"تقدم الدرس","lessonObserve":"ما الذي تراقبه","lessonGoal":"الهدف","lessonDirectMethod":"استخدم القيود الظاهرة لاستبعاد الخيارات المستحيلة وتحديد النقلة المفروضة.","lessonContradictionMethod":"اختبر فرضية، واتبع نتائجها الظاهرة، وارفضها عندما تجعل قاعدة ما مستحيلة.","lessonShowMove":"أظهر النقلة","lessonIndependentRetry":"أكمل هذه المرحلة مرة أخرى من دون Logic Coach لاعتماد المرحلة المستقلة.","lessonContinue":"متابعة","lessonCompletedCount":"الدروس المكتملة"});
Object.assign(I18N.fr,{"learn":"Apprendre","learnSub":"Des leçons interactives : comprendre, observer, pratiquer accompagné, puis résoudre seul.","lesson":"Leçon","lessonExplanation":"Explication","lessonGuided":"Exemple guidé","lessonAssisted":"Exercice accompagné","lessonIndependent":"Exercice autonome","lessonStartGuided":"Commencer l’exemple guidé","lessonStartAssisted":"Commencer l’exercice accompagné","lessonStartIndependent":"Commencer l’exercice autonome","lessonComplete":"Leçon terminée","lessonProgress":"Progression de la leçon","lessonObserve":"Ce qu’il faut observer","lessonGoal":"Objectif","lessonDirectMethod":"Utilise les contraintes visibles pour éliminer les choix impossibles et identifier le coup forcé.","lessonContradictionMethod":"Teste une hypothèse, suis ses conséquences visibles et rejette-la dès qu’une règle devient impossible.","lessonShowMove":"Montrer le coup","lessonIndependentRetry":"Termine à nouveau cette étape sans Logic Coach pour valider l’étape autonome.","lessonContinue":"Continuer","lessonCompletedCount":"Leçons terminées"});
Object.assign(I18N.bn,{"learn":"শিখুন","learnSub":"ইন্টার‌্যাক্টিভ পাঠ: বুঝুন, পর্যবেক্ষণ করুন, সহায়তায় অনুশীলন করুন, তারপর নিজে সমাধান করুন।","lesson":"পাঠ","lessonExplanation":"ব্যাখ্যা","lessonGuided":"নির্দেশিত উদাহরণ","lessonAssisted":"সহায়তাপূর্ণ অনুশীলন","lessonIndependent":"স্বাধীন অনুশীলন","lessonStartGuided":"নির্দেশিত উদাহরণ শুরু করুন","lessonStartAssisted":"সহায়তাপূর্ণ অনুশীলন শুরু করুন","lessonStartIndependent":"স্বাধীন অনুশীলন শুরু করুন","lessonComplete":"পাঠ সম্পূর্ণ","lessonProgress":"পাঠের অগ্রগতি","lessonObserve":"কী লক্ষ্য করবেন","lessonGoal":"লক্ষ্য","lessonDirectMethod":"দৃশ্যমান নিয়ম ব্যবহার করে অসম্ভব বিকল্প বাদ দিন এবং বাধ্যতামূলক চালটি শনাক্ত করুন।","lessonContradictionMethod":"একটি অনুমান পরীক্ষা করুন, তার দৃশ্যমান ফল অনুসরণ করুন এবং কোনো নিয়ম অসম্ভব হলে অনুমানটি বাদ দিন।","lessonShowMove":"চাল দেখান","lessonIndependentRetry":"স্বাধীন ধাপ যাচাই করতে Logic Coach ছাড়া ধাপটি আবার শেষ করুন।","lessonContinue":"চালিয়ে যান","lessonCompletedCount":"সম্পূর্ণ পাঠ"});
Object.assign(I18N.pt,{"learn":"Aprender","learnSub":"Lições interativas: compreender, observar, praticar com orientação e depois resolver sozinho.","lesson":"Lição","lessonExplanation":"Explicação","lessonGuided":"Exemplo guiado","lessonAssisted":"Exercício acompanhado","lessonIndependent":"Exercício autónomo","lessonStartGuided":"Iniciar exemplo guiado","lessonStartAssisted":"Iniciar exercício acompanhado","lessonStartIndependent":"Iniciar exercício autónomo","lessonComplete":"Lição concluída","lessonProgress":"Progresso da lição","lessonObserve":"O que observar","lessonGoal":"Objetivo","lessonDirectMethod":"Usa as restrições visíveis para eliminar escolhas impossíveis e identificar a jogada forçada.","lessonContradictionMethod":"Testa uma hipótese, segue as suas consequências visíveis e rejeita-a quando uma regra se torna impossível.","lessonShowMove":"Mostrar a jogada","lessonIndependentRetry":"Conclui novamente esta etapa sem Logic Coach para validar a fase autónoma.","lessonContinue":"Continuar","lessonCompletedCount":"Lições concluídas"});
Object.assign(I18N.id,{"learn":"Belajar","learnSub":"Pelajaran interaktif: pahami, amati, berlatih dengan panduan, lalu selesaikan sendiri.","lesson":"Pelajaran","lessonExplanation":"Penjelasan","lessonGuided":"Contoh terpandu","lessonAssisted":"Latihan terbimbing","lessonIndependent":"Latihan mandiri","lessonStartGuided":"Mulai contoh terpandu","lessonStartAssisted":"Mulai latihan terbimbing","lessonStartIndependent":"Mulai latihan mandiri","lessonComplete":"Pelajaran selesai","lessonProgress":"Progres pelajaran","lessonObserve":"Yang perlu diamati","lessonGoal":"Tujuan","lessonDirectMethod":"Gunakan batasan yang terlihat untuk menyingkirkan pilihan mustahil dan menemukan langkah yang dipaksa.","lessonContradictionMethod":"Uji sebuah hipotesis, ikuti konsekuensi yang terlihat, lalu tolak jika suatu aturan menjadi mustahil.","lessonShowMove":"Tampilkan langkah","lessonIndependentRetry":"Selesaikan tahap ini lagi tanpa Logic Coach untuk mengesahkan tahap mandiri.","lessonContinue":"Lanjutkan","lessonCompletedCount":"Pelajaran selesai"});
Object.assign(I18N.ur,{"learn":"سیکھیں","learnSub":"انٹرایکٹو اسباق: سمجھیں، مشاہدہ کریں، رہنمائی کے ساتھ مشق کریں، پھر خود حل کریں۔","lesson":"سبق","lessonExplanation":"وضاحت","lessonGuided":"رہنمائی والا نمونہ","lessonAssisted":"مدد والا مشق","lessonIndependent":"آزاد مشق","lessonStartGuided":"رہنمائی والا نمونہ شروع کریں","lessonStartAssisted":"مدد والا مشق شروع کریں","lessonStartIndependent":"آزاد مشق شروع کریں","lessonComplete":"سبق مکمل","lessonProgress":"سبق کی پیش رفت","lessonObserve":"کیا دیکھنا ہے","lessonGoal":"مقصد","lessonDirectMethod":"نظر آنے والی پابندیوں سے ناممکن انتخاب ختم کریں اور لازمی چال پہچانیں۔","lessonContradictionMethod":"ایک مفروضہ آزمائیں، اس کے نظر آنے والے نتائج کا پیچھا کریں اور جب کوئی قاعدہ ناممکن ہو جائے تو اسے رد کریں۔","lessonShowMove":"چال دکھائیں","lessonIndependentRetry":"آزاد مرحلہ منظور کرنے کے لیے یہ مرحلہ Logic Coach کے بغیر دوبارہ مکمل کریں۔","lessonContinue":"جاری رکھیں","lessonCompletedCount":"مکمل اسباق"});
Object.assign(I18N.bg,{"learn":"Учи","learnSub":"Интерактивни уроци: разбери, наблюдавай, упражнявай с помощ и после реши сам.","lesson":"Урок","lessonExplanation":"Обяснение","lessonGuided":"Воден пример","lessonAssisted":"Упражнение с помощ","lessonIndependent":"Самостоятелно упражнение","lessonStartGuided":"Започни водения пример","lessonStartAssisted":"Започни упражнението с помощ","lessonStartIndependent":"Започни самостоятелното упражнение","lessonComplete":"Урокът е завършен","lessonProgress":"Напредък на урока","lessonObserve":"Какво да наблюдаваш","lessonGoal":"Цел","lessonDirectMethod":"Използвай видимите ограничения, за да изключиш невъзможните избори и да намериш задължителния ход.","lessonContradictionMethod":"Провери хипотеза, проследи видимите ѝ последици и я отхвърли, когато правило стане невъзможно.","lessonShowMove":"Покажи хода","lessonIndependentRetry":"Завърши тази стъпка отново без Logic Coach, за да потвърдиш самостоятелния етап.","lessonContinue":"Продължи","lessonCompletedCount":"Завършени уроци"});
Object.assign(I18N.hr,{"learn":"Uči","learnSub":"Interaktivne lekcije: razumij, promatraj, vježbaj uz pomoć pa riješi samostalno.","lesson":"Lekcija","lessonExplanation":"Objašnjenje","lessonGuided":"Vođeni primjer","lessonAssisted":"Vježba uz pomoć","lessonIndependent":"Samostalna vježba","lessonStartGuided":"Pokreni vođeni primjer","lessonStartAssisted":"Pokreni vježbu uz pomoć","lessonStartIndependent":"Pokreni samostalnu vježbu","lessonComplete":"Lekcija završena","lessonProgress":"Napredak lekcije","lessonObserve":"Što promatrati","lessonGoal":"Cilj","lessonDirectMethod":"Koristi vidljiva ograničenja da ukloniš nemoguće izbore i prepoznaš prisilni potez.","lessonContradictionMethod":"Isprobaj hipotezu, slijedi njezine vidljive posljedice i odbaci je kada neko pravilo postane nemoguće.","lessonShowMove":"Prikaži potez","lessonIndependentRetry":"Ponovno završi ovaj korak bez Logic Coacha kako bi potvrdio samostalnu fazu.","lessonContinue":"Nastavi","lessonCompletedCount":"Završene lekcije"});
Object.assign(I18N.cs,{"learn":"Učit se","learnSub":"Interaktivní lekce: pochop, pozoruj, procvičuj s vedením a pak řeš samostatně.","lesson":"Lekce","lessonExplanation":"Vysvětlení","lessonGuided":"Vedený příklad","lessonAssisted":"Cvičení s pomocí","lessonIndependent":"Samostatné cvičení","lessonStartGuided":"Spustit vedený příklad","lessonStartAssisted":"Spustit cvičení s pomocí","lessonStartIndependent":"Spustit samostatné cvičení","lessonComplete":"Lekce dokončena","lessonProgress":"Postup lekcí","lessonObserve":"Co sledovat","lessonGoal":"Cíl","lessonDirectMethod":"Použij viditelná omezení k vyloučení nemožných možností a určení vynuceného tahu.","lessonContradictionMethod":"Otestuj hypotézu, sleduj její viditelné důsledky a zamítni ji, když některé pravidlo přestane být možné.","lessonShowMove":"Ukázat tah","lessonIndependentRetry":"Dokonči tento krok znovu bez Logic Coache pro potvrzení samostatné fáze.","lessonContinue":"Pokračovat","lessonCompletedCount":"Dokončené lekce"});
Object.assign(I18N.da,{"learn":"Lær","learnSub":"Interaktive lektioner: forstå, observer, øv med vejledning og løs derefter selv.","lesson":"Lektion","lessonExplanation":"Forklaring","lessonGuided":"Guidet eksempel","lessonAssisted":"Øvelse med hjælp","lessonIndependent":"Selvstændig øvelse","lessonStartGuided":"Start guidet eksempel","lessonStartAssisted":"Start øvelse med hjælp","lessonStartIndependent":"Start selvstændig øvelse","lessonComplete":"Lektion gennemført","lessonProgress":"Lektionsfremskridt","lessonObserve":"Hvad du skal se efter","lessonGoal":"Mål","lessonDirectMethod":"Brug de synlige begrænsninger til at udelukke umulige valg og finde det tvungne træk.","lessonContradictionMethod":"Test en hypotese, følg dens synlige konsekvenser, og forkast den når en regel bliver umulig.","lessonShowMove":"Vis trækket","lessonIndependentRetry":"Gennemfør dette trin igen uden Logic Coach for at godkende den selvstændige fase.","lessonContinue":"Fortsæt","lessonCompletedCount":"Gennemførte lektioner"});
Object.assign(I18N.nl,{"learn":"Leren","learnSub":"Interactieve lessen: begrijpen, observeren, oefenen met begeleiding en daarna zelfstandig oplossen.","lesson":"Les","lessonExplanation":"Uitleg","lessonGuided":"Begeleid voorbeeld","lessonAssisted":"Begeleide oefening","lessonIndependent":"Zelfstandige oefening","lessonStartGuided":"Start begeleid voorbeeld","lessonStartAssisted":"Start begeleide oefening","lessonStartIndependent":"Start zelfstandige oefening","lessonComplete":"Les voltooid","lessonProgress":"Lesvoortgang","lessonObserve":"Waarop letten","lessonGoal":"Doel","lessonDirectMethod":"Gebruik zichtbare beperkingen om onmogelijke keuzes uit te sluiten en de gedwongen zet te vinden.","lessonContradictionMethod":"Test een hypothese, volg de zichtbare gevolgen en verwerp haar zodra een regel onmogelijk wordt.","lessonShowMove":"Toon de zet","lessonIndependentRetry":"Voltooi deze stap opnieuw zonder Logic Coach om de zelfstandige fase te valideren.","lessonContinue":"Doorgaan","lessonCompletedCount":"Voltooide lessen"});
Object.assign(I18N.et,{"learn":"Õpi","learnSub":"Interaktiivsed õppetunnid: mõista, jälgi, harjuta juhendatult ja lahenda seejärel iseseisvalt.","lesson":"Õppetund","lessonExplanation":"Selgitus","lessonGuided":"Juhendatud näide","lessonAssisted":"Abistatud harjutus","lessonIndependent":"Iseseisev harjutus","lessonStartGuided":"Alusta juhendatud näidet","lessonStartAssisted":"Alusta abistatud harjutust","lessonStartIndependent":"Alusta iseseisvat harjutust","lessonComplete":"Õppetund lõpetatud","lessonProgress":"Õppetunni edenemine","lessonObserve":"Mida jälgida","lessonGoal":"Eesmärk","lessonDirectMethod":"Kasuta nähtavaid piiranguid võimatute valikute välistamiseks ja sundkäigu leidmiseks.","lessonContradictionMethod":"Kontrolli hüpoteesi, jälgi selle nähtavaid tagajärgi ja lükka see tagasi, kui mõni reegel muutub võimatuks.","lessonShowMove":"Näita käiku","lessonIndependentRetry":"Iseseisva etapi kinnitamiseks lõpeta see samm uuesti ilma Logic Coachita.","lessonContinue":"Jätka","lessonCompletedCount":"Lõpetatud õppetunnid"});
Object.assign(I18N.fi,{"learn":"Opi","learnSub":"Vuorovaikutteiset oppitunnit: ymmärrä, havainnoi, harjoittele ohjatusti ja ratkaise sitten itse.","lesson":"Oppitunti","lessonExplanation":"Selitys","lessonGuided":"Ohjattu esimerkki","lessonAssisted":"Avustettu harjoitus","lessonIndependent":"Itsenäinen harjoitus","lessonStartGuided":"Aloita ohjattu esimerkki","lessonStartAssisted":"Aloita avustettu harjoitus","lessonStartIndependent":"Aloita itsenäinen harjoitus","lessonComplete":"Oppitunti valmis","lessonProgress":"Oppitunnin eteneminen","lessonObserve":"Mitä tarkkailla","lessonGoal":"Tavoite","lessonDirectMethod":"Käytä näkyviä rajoitteita mahdottomien vaihtoehtojen poistamiseen ja pakotetun siirron tunnistamiseen.","lessonContradictionMethod":"Testaa oletus, seuraa sen näkyviä seurauksia ja hylkää se, kun jokin sääntö käy mahdottomaksi.","lessonShowMove":"Näytä siirto","lessonIndependentRetry":"Suorita tämä vaihe uudelleen ilman Logic Coachia vahvistaaksesi itsenäisen vaiheen.","lessonContinue":"Jatka","lessonCompletedCount":"Suoritetut oppitunnit"});
Object.assign(I18N.de,{"learn":"Lernen","learnSub":"Interaktive Lektionen: verstehen, beobachten, geführt üben und anschließend selbst lösen.","lesson":"Lektion","lessonExplanation":"Erklärung","lessonGuided":"Geführtes Beispiel","lessonAssisted":"Begleitete Übung","lessonIndependent":"Selbstständige Übung","lessonStartGuided":"Geführtes Beispiel starten","lessonStartAssisted":"Begleitete Übung starten","lessonStartIndependent":"Selbstständige Übung starten","lessonComplete":"Lektion abgeschlossen","lessonProgress":"Lektionsfortschritt","lessonObserve":"Worauf achten","lessonGoal":"Ziel","lessonDirectMethod":"Nutze die sichtbaren Einschränkungen, um unmögliche Optionen auszuschließen und den erzwungenen Zug zu erkennen.","lessonContradictionMethod":"Teste eine Hypothese, verfolge ihre sichtbaren Folgen und verwerfe sie, sobald eine Regel unmöglich wird.","lessonShowMove":"Zug zeigen","lessonIndependentRetry":"Schließe diesen Schritt erneut ohne Logic Coach ab, um die selbstständige Stufe zu bestätigen.","lessonContinue":"Weiter","lessonCompletedCount":"Abgeschlossene Lektionen"});
Object.assign(I18N.el,{"learn":"Μάθηση","learnSub":"Διαδραστικά μαθήματα: κατανόησε, παρατήρησε, εξασκήσου με καθοδήγηση και μετά λύσε μόνος σου.","lesson":"Μάθημα","lessonExplanation":"Εξήγηση","lessonGuided":"Καθοδηγούμενο παράδειγμα","lessonAssisted":"Υποστηριζόμενη άσκηση","lessonIndependent":"Αυτόνομη άσκηση","lessonStartGuided":"Έναρξη καθοδηγούμενου παραδείγματος","lessonStartAssisted":"Έναρξη υποστηριζόμενης άσκησης","lessonStartIndependent":"Έναρξη αυτόνομης άσκησης","lessonComplete":"Το μάθημα ολοκληρώθηκε","lessonProgress":"Πρόοδος μαθήματος","lessonObserve":"Τι να παρατηρήσεις","lessonGoal":"Στόχος","lessonDirectMethod":"Χρησιμοποίησε τους ορατούς περιορισμούς για να αποκλείσεις αδύνατες επιλογές και να εντοπίσεις την αναγκαστική κίνηση.","lessonContradictionMethod":"Δοκίμασε μια υπόθεση, ακολούθησε τις ορατές συνέπειές της και απέρριψέ την όταν ένας κανόνας γίνεται αδύνατος.","lessonShowMove":"Δείξε την κίνηση","lessonIndependentRetry":"Ολοκλήρωσε ξανά αυτό το βήμα χωρίς Logic Coach για να επικυρώσεις το αυτόνομο στάδιο.","lessonContinue":"Συνέχεια","lessonCompletedCount":"Ολοκληρωμένα μαθήματα"});
Object.assign(I18N.hu,{"learn":"Tanulás","learnSub":"Interaktív leckék: értsd meg, figyeld meg, gyakorolj segítséggel, majd oldd meg önállóan.","lesson":"Lecke","lessonExplanation":"Magyarázat","lessonGuided":"Vezetett példa","lessonAssisted":"Segített gyakorlat","lessonIndependent":"Önálló gyakorlat","lessonStartGuided":"Vezetett példa indítása","lessonStartAssisted":"Segített gyakorlat indítása","lessonStartIndependent":"Önálló gyakorlat indítása","lessonComplete":"Lecke befejezve","lessonProgress":"Lecke előrehaladása","lessonObserve":"Mit figyelj","lessonGoal":"Cél","lessonDirectMethod":"A látható korlátok segítségével zárd ki a lehetetlen választásokat és azonosítsd a kényszerített lépést.","lessonContradictionMethod":"Tesztelj egy feltevést, kövesd a látható következményeit, és vesd el, amikor egy szabály lehetetlenné válik.","lessonShowMove":"Lépés megmutatása","lessonIndependentRetry":"Az önálló szakasz igazolásához teljesítsd újra ezt a lépést Logic Coach nélkül.","lessonContinue":"Folytatás","lessonCompletedCount":"Befejezett leckék"});
Object.assign(I18N.ga,{"learn":"Foghlaim","learnSub":"Ceachtanna idirghníomhacha: tuig, breathnaigh, cleacht le treoir, ansin réitigh leat féin.","lesson":"Ceacht","lessonExplanation":"Míniú","lessonGuided":"Sampla treoraithe","lessonAssisted":"Cleachtadh le cúnamh","lessonIndependent":"Cleachtadh neamhspleách","lessonStartGuided":"Tosaigh an sampla treoraithe","lessonStartAssisted":"Tosaigh an cleachtadh le cúnamh","lessonStartIndependent":"Tosaigh an cleachtadh neamhspleách","lessonComplete":"Ceacht críochnaithe","lessonProgress":"Dul chun cinn an cheachta","lessonObserve":"Cad le breathnú air","lessonGoal":"Sprioc","lessonDirectMethod":"Úsáid na srianta infheicthe chun roghanna dodhéanta a chur as an áireamh agus an bogadh éigeantach a aithint.","lessonContradictionMethod":"Tástáil hipitéis, lean a hiarmhairtí infheicthe agus diúltaigh di nuair a éiríonn riail dodhéanta.","lessonShowMove":"Taispeáin an bogadh","lessonIndependentRetry":"Críochnaigh an chéim seo arís gan Logic Coach chun an chéim neamhspleách a dheimhniú.","lessonContinue":"Lean ar aghaidh","lessonCompletedCount":"Ceachtanna críochnaithe"});
Object.assign(I18N.it,{"learn":"Impara","learnSub":"Lezioni interattive: comprendi, osserva, esercitati con guida e poi risolvi da solo.","lesson":"Lezione","lessonExplanation":"Spiegazione","lessonGuided":"Esempio guidato","lessonAssisted":"Esercizio assistito","lessonIndependent":"Esercizio autonomo","lessonStartGuided":"Avvia esempio guidato","lessonStartAssisted":"Avvia esercizio assistito","lessonStartIndependent":"Avvia esercizio autonomo","lessonComplete":"Lezione completata","lessonProgress":"Progresso della lezione","lessonObserve":"Cosa osservare","lessonGoal":"Obiettivo","lessonDirectMethod":"Usa i vincoli visibili per eliminare le scelte impossibili e individuare la mossa forzata.","lessonContradictionMethod":"Prova un’ipotesi, segui le sue conseguenze visibili e scartala quando una regola diventa impossibile.","lessonShowMove":"Mostra la mossa","lessonIndependentRetry":"Completa di nuovo questo passaggio senza Logic Coach per convalidare la fase autonoma.","lessonContinue":"Continua","lessonCompletedCount":"Lezioni completate"});
Object.assign(I18N.lv,{"learn":"Mācies","learnSub":"Interaktīvas nodarbības: saproti, vēro, vingrinies ar vadību un pēc tam risini patstāvīgi.","lesson":"Nodarbība","lessonExplanation":"Skaidrojums","lessonGuided":"Vadīts piemērs","lessonAssisted":"Atbalstīts vingrinājums","lessonIndependent":"Patstāvīgs vingrinājums","lessonStartGuided":"Sākt vadīto piemēru","lessonStartAssisted":"Sākt atbalstīto vingrinājumu","lessonStartIndependent":"Sākt patstāvīgo vingrinājumu","lessonComplete":"Nodarbība pabeigta","lessonProgress":"Nodarbības progress","lessonObserve":"Ko vērot","lessonGoal":"Mērķis","lessonDirectMethod":"Izmanto redzamos ierobežojumus, lai izslēgtu neiespējamas izvēles un atrastu piespiedu gājienu.","lessonContradictionMethod":"Pārbaudi hipotēzi, seko tās redzamajām sekām un noraidi to, kad kāds noteikums kļūst neiespējams.","lessonShowMove":"Parādīt gājienu","lessonIndependentRetry":"Pabeidz šo soli vēlreiz bez Logic Coach, lai apstiprinātu patstāvīgo posmu.","lessonContinue":"Turpināt","lessonCompletedCount":"Pabeigtās nodarbības"});
Object.assign(I18N.lt,{"learn":"Mokykis","learnSub":"Interaktyvios pamokos: suprask, stebėk, praktikuokis su pagalba, tada spręsk savarankiškai.","lesson":"Pamoka","lessonExplanation":"Paaiškinimas","lessonGuided":"Vedamas pavyzdys","lessonAssisted":"Pratimas su pagalba","lessonIndependent":"Savarankiškas pratimas","lessonStartGuided":"Pradėti vedamą pavyzdį","lessonStartAssisted":"Pradėti pratimą su pagalba","lessonStartIndependent":"Pradėti savarankišką pratimą","lessonComplete":"Pamoka baigta","lessonProgress":"Pamokos pažanga","lessonObserve":"Ką stebėti","lessonGoal":"Tikslas","lessonDirectMethod":"Naudok matomus apribojimus, kad atmestum neįmanomus pasirinkimus ir rastum priverstinį ėjimą.","lessonContradictionMethod":"Patikrink hipotezę, sek jos matomas pasekmes ir atmesk ją, kai taisyklė tampa neįmanoma.","lessonShowMove":"Rodyti ėjimą","lessonIndependentRetry":"Užbaik šį žingsnį dar kartą be Logic Coach, kad patvirtintum savarankišką etapą.","lessonContinue":"Tęsti","lessonCompletedCount":"Baigtos pamokos"});
Object.assign(I18N.mt,{"learn":"Tgħallem","learnSub":"Lezzjonijiet interattivi: ifhem, osserva, ipprattika bi gwida u mbagħad solvi waħdek.","lesson":"Lezzjoni","lessonExplanation":"Spjegazzjoni","lessonGuided":"Eżempju mmexxi","lessonAssisted":"Eżerċizzju assistit","lessonIndependent":"Eżerċizzju indipendenti","lessonStartGuided":"Ibda l-eżempju mmexxi","lessonStartAssisted":"Ibda l-eżerċizzju assistit","lessonStartIndependent":"Ibda l-eżerċizzju indipendenti","lessonComplete":"Lezzjoni kompluta","lessonProgress":"Progress tal-lezzjoni","lessonObserve":"X’għandek tosserva","lessonGoal":"Għan","lessonDirectMethod":"Uża r-restrizzjonijiet viżibbli biex teskludi għażliet impossibbli u ssib il-mossa obbligatorja.","lessonContradictionMethod":"Ittestja ipoteżi, segwi l-konsegwenzi viżibbli tagħha u ċaħadha meta regola ssir impossibbli.","lessonShowMove":"Uri l-mossa","lessonIndependentRetry":"Erġa’ temm dan il-pass mingħajr Logic Coach biex tivvalida l-istadju indipendenti.","lessonContinue":"Kompli","lessonCompletedCount":"Lezzjonijiet kompluti"});
Object.assign(I18N.pl,{"learn":"Ucz się","learnSub":"Interaktywne lekcje: zrozum, obserwuj, ćwicz z pomocą, a potem rozwiązuj samodzielnie.","lesson":"Lekcja","lessonExplanation":"Wyjaśnienie","lessonGuided":"Przykład z prowadzeniem","lessonAssisted":"Ćwiczenie wspomagane","lessonIndependent":"Ćwiczenie samodzielne","lessonStartGuided":"Uruchom przykład z prowadzeniem","lessonStartAssisted":"Uruchom ćwiczenie wspomagane","lessonStartIndependent":"Uruchom ćwiczenie samodzielne","lessonComplete":"Lekcja ukończona","lessonProgress":"Postęp lekcji","lessonObserve":"Co obserwować","lessonGoal":"Cel","lessonDirectMethod":"Użyj widocznych ograniczeń, aby wykluczyć niemożliwe wybory i znaleźć wymuszony ruch.","lessonContradictionMethod":"Sprawdź hipotezę, śledź jej widoczne konsekwencje i odrzuć ją, gdy jakaś reguła stanie się niemożliwa.","lessonShowMove":"Pokaż ruch","lessonIndependentRetry":"Ukończ ten krok ponownie bez Logic Coach, aby zatwierdzić etap samodzielny.","lessonContinue":"Kontynuuj","lessonCompletedCount":"Ukończone lekcje"});
Object.assign(I18N.ro,{"learn":"Învață","learnSub":"Lecții interactive: înțelege, observă, exersează cu ghidare, apoi rezolvă singur.","lesson":"Lecție","lessonExplanation":"Explicație","lessonGuided":"Exemplu ghidat","lessonAssisted":"Exercițiu asistat","lessonIndependent":"Exercițiu autonom","lessonStartGuided":"Pornește exemplul ghidat","lessonStartAssisted":"Pornește exercițiul asistat","lessonStartIndependent":"Pornește exercițiul autonom","lessonComplete":"Lecție finalizată","lessonProgress":"Progresul lecției","lessonObserve":"Ce să observi","lessonGoal":"Obiectiv","lessonDirectMethod":"Folosește constrângerile vizibile pentru a elimina opțiunile imposibile și a identifica mutarea forțată.","lessonContradictionMethod":"Testează o ipoteză, urmărește consecințele ei vizibile și respinge-o când o regulă devine imposibilă.","lessonShowMove":"Arată mutarea","lessonIndependentRetry":"Finalizează din nou acest pas fără Logic Coach pentru a valida etapa autonomă.","lessonContinue":"Continuă","lessonCompletedCount":"Lecții finalizate"});
Object.assign(I18N.sk,{"learn":"Učiť sa","learnSub":"Interaktívne lekcie: pochop, pozoruj, cvič s vedením a potom rieš samostatne.","lesson":"Lekcia","lessonExplanation":"Vysvetlenie","lessonGuided":"Vedený príklad","lessonAssisted":"Cvičenie s pomocou","lessonIndependent":"Samostatné cvičenie","lessonStartGuided":"Spustiť vedený príklad","lessonStartAssisted":"Spustiť cvičenie s pomocou","lessonStartIndependent":"Spustiť samostatné cvičenie","lessonComplete":"Lekcia dokončená","lessonProgress":"Postup lekcie","lessonObserve":"Čo sledovať","lessonGoal":"Cieľ","lessonDirectMethod":"Použi viditeľné obmedzenia na vylúčenie nemožných možností a určenie vynúteného ťahu.","lessonContradictionMethod":"Otestuj hypotézu, sleduj jej viditeľné dôsledky a zamietni ju, keď sa pravidlo stane nemožným.","lessonShowMove":"Ukázať ťah","lessonIndependentRetry":"Dokonči tento krok znova bez Logic Coach, aby sa potvrdila samostatná fáza.","lessonContinue":"Pokračovať","lessonCompletedCount":"Dokončené lekcie"});
Object.assign(I18N.sl,{"learn":"Uči se","learnSub":"Interaktivne lekcije: razumi, opazuj, vadi z usmerjanjem in nato reši samostojno.","lesson":"Lekcija","lessonExplanation":"Razlaga","lessonGuided":"Voden primer","lessonAssisted":"Vodena vaja","lessonIndependent":"Samostojna vaja","lessonStartGuided":"Začni voden primer","lessonStartAssisted":"Začni vodeno vajo","lessonStartIndependent":"Začni samostojno vajo","lessonComplete":"Lekcija zaključena","lessonProgress":"Napredek lekcije","lessonObserve":"Kaj opazovati","lessonGoal":"Cilj","lessonDirectMethod":"Uporabi vidne omejitve za izločanje nemogočih možnosti in prepoznaj prisilno potezo.","lessonContradictionMethod":"Preizkusi hipotezo, sledi njenim vidnim posledicam in jo zavrni, ko pravilo postane nemogoče.","lessonShowMove":"Prikaži potezo","lessonIndependentRetry":"Ponovno dokončaj ta korak brez Logic Coach, da potrdiš samostojno stopnjo.","lessonContinue":"Nadaljuj","lessonCompletedCount":"Zaključene lekcije"});
Object.assign(I18N.sv,{"learn":"Lär dig","learnSub":"Interaktiva lektioner: förstå, observera, öva med vägledning och lös sedan själv.","lesson":"Lektion","lessonExplanation":"Förklaring","lessonGuided":"Guidat exempel","lessonAssisted":"Assisterad övning","lessonIndependent":"Självständig övning","lessonStartGuided":"Starta guidat exempel","lessonStartAssisted":"Starta assisterad övning","lessonStartIndependent":"Starta självständig övning","lessonComplete":"Lektion klar","lessonProgress":"Lektionsframsteg","lessonObserve":"Vad du ska observera","lessonGoal":"Mål","lessonDirectMethod":"Använd synliga begränsningar för att utesluta omöjliga val och hitta det tvingade draget.","lessonContradictionMethod":"Testa en hypotes, följ dess synliga konsekvenser och förkasta den när en regel blir omöjlig.","lessonShowMove":"Visa draget","lessonIndependentRetry":"Slutför detta steg igen utan Logic Coach för att validera den självständiga fasen.","lessonContinue":"Fortsätt","lessonCompletedCount":"Avslutade lektioner"});

/* v2.19.0 — Daily QUADLUD circuit */
Object.assign(I18N.en,{"dailyCircuit":"QUADLUD Circuit","dailyCircuitSub":"Complete the four daily games and measure how independently you reason.","dailyStartCircuit":"Start the circuit","dailyResumeCircuit":"Resume the circuit","dailyLogicScore":"Logic score","dailyNoHelp":"No help","dailyOrientation":"Orientation","dailyRuleHelp":"Rule help","dailyExplanationHelp":"Explanation","dailyRevealHelp":"Revealed move","dailyErrorsCount":"Errors","dailyBacktracksCount":"Backtracks","dailyNextGame":"Next game","dailyReport":"Daily report","dailyCompleteReport":"Circuit completed","dailyScoreNote":"100 points per game. The score measures assistance, not speed; errors and backtracks do not remove points.","dailyScoreLocked":"The official score is locked on the first solved attempt.","dailyUnscoredLegacy":"Completed before logic scoring was available"});
Object.assign(I18N.fr,{"dailyCircuit":"Circuit QUADLUD","dailyCircuitSub":"Résous les quatre jeux du jour et mesure ton autonomie logique.","dailyStartCircuit":"Commencer le circuit","dailyResumeCircuit":"Reprendre le circuit","dailyLogicScore":"Score logique","dailyNoHelp":"Sans aide","dailyOrientation":"Orientation","dailyRuleHelp":"Aide sur la règle","dailyExplanationHelp":"Explication","dailyRevealHelp":"Coup révélé","dailyErrorsCount":"Erreurs","dailyBacktracksCount":"Retours arrière","dailyNextGame":"Jeu suivant","dailyReport":"Bilan du jour","dailyCompleteReport":"Circuit terminé","dailyScoreNote":"100 points par jeu. Le score mesure l’aide reçue, pas la vitesse ; erreurs et retours arrière ne retirent pas de points.","dailyScoreLocked":"Le score officiel est figé à la première résolution réussie.","dailyUnscoredLegacy":"Terminé avant la disponibilité du score logique"});
Object.assign(I18N.es,{"dailyCircuit":"Circuito QUADLUD","dailyCircuitSub":"Completa los cuatro juegos diarios y mide tu autonomía lógica.","dailyStartCircuit":"Iniciar circuito","dailyResumeCircuit":"Reanudar circuito","dailyLogicScore":"Puntuación lógica","dailyNoHelp":"Sin ayuda","dailyOrientation":"Orientación","dailyRuleHelp":"Ayuda de regla","dailyExplanationHelp":"Explicación","dailyRevealHelp":"Jugada revelada","dailyErrorsCount":"Errores","dailyBacktracksCount":"Retrocesos","dailyNextGame":"Juego siguiente","dailyReport":"Informe diario","dailyCompleteReport":"Circuito completado","dailyScoreNote":"100 puntos por juego. La puntuación mide la ayuda, no la velocidad; errores y retrocesos no restan puntos.","dailyScoreLocked":"La puntuación oficial queda fijada en la primera resolución.","dailyUnscoredLegacy":"Completado antes de que existiera la puntuación lógica"});
Object.assign(I18N.pt,{"dailyCircuit":"Circuito QUADLUD","dailyCircuitSub":"Completa os quatro jogos diários e mede a tua autonomia lógica.","dailyStartCircuit":"Iniciar circuito","dailyResumeCircuit":"Retomar circuito","dailyLogicScore":"Pontuação lógica","dailyNoHelp":"Sem ajuda","dailyOrientation":"Orientação","dailyRuleHelp":"Ajuda de regra","dailyExplanationHelp":"Explicação","dailyRevealHelp":"Jogada revelada","dailyErrorsCount":"Erros","dailyBacktracksCount":"Retrocessos","dailyNextGame":"Jogo seguinte","dailyReport":"Relatório diário","dailyCompleteReport":"Circuito concluído","dailyScoreNote":"100 pontos por jogo. A pontuação mede a ajuda, não a velocidade; erros e retrocessos não retiram pontos.","dailyScoreLocked":"A pontuação oficial fica fixada na primeira resolução.","dailyUnscoredLegacy":"Concluído antes da pontuação lógica estar disponível"});
Object.assign(I18N.it,{"dailyCircuit":"Circuito QUADLUD","dailyCircuitSub":"Completa i quattro giochi giornalieri e misura la tua autonomia logica.","dailyStartCircuit":"Avvia il circuito","dailyResumeCircuit":"Riprendi il circuito","dailyLogicScore":"Punteggio logico","dailyNoHelp":"Senza aiuto","dailyOrientation":"Orientamento","dailyRuleHelp":"Aiuto sulla regola","dailyExplanationHelp":"Spiegazione","dailyRevealHelp":"Mossa rivelata","dailyErrorsCount":"Errori","dailyBacktracksCount":"Passi indietro","dailyNextGame":"Gioco successivo","dailyReport":"Resoconto giornaliero","dailyCompleteReport":"Circuito completato","dailyScoreNote":"100 punti per gioco. Il punteggio misura l’aiuto, non la velocità; errori e passi indietro non sottraggono punti.","dailyScoreLocked":"Il punteggio ufficiale viene fissato alla prima soluzione.","dailyUnscoredLegacy":"Completato prima della disponibilità del punteggio logico"});
Object.assign(I18N.de,{"dailyCircuit":"QUADLUD-Runde","dailyCircuitSub":"Löse die vier täglichen Spiele und miss deine logische Selbstständigkeit.","dailyStartCircuit":"Runde starten","dailyResumeCircuit":"Runde fortsetzen","dailyLogicScore":"Logikpunktzahl","dailyNoHelp":"Ohne Hilfe","dailyOrientation":"Orientierung","dailyRuleHelp":"Regelhilfe","dailyExplanationHelp":"Erklärung","dailyRevealHelp":"Aufgedeckter Zug","dailyErrorsCount":"Fehler","dailyBacktracksCount":"Rückschritte","dailyNextGame":"Nächstes Spiel","dailyReport":"Tagesbericht","dailyCompleteReport":"Runde abgeschlossen","dailyScoreNote":"100 Punkte pro Spiel. Gewertet wird die erhaltene Hilfe, nicht die Geschwindigkeit; Fehler und Rückschritte kosten keine Punkte.","dailyScoreLocked":"Die offizielle Punktzahl wird beim ersten erfolgreichen Lösen festgeschrieben.","dailyUnscoredLegacy":"Abgeschlossen, bevor die Logikwertung verfügbar war"});
Object.assign(I18N.nl,{"dailyCircuit":"QUADLUD-circuit","dailyCircuitSub":"Voltooi de vier dagelijkse spellen en meet je logische zelfstandigheid.","dailyStartCircuit":"Circuit starten","dailyResumeCircuit":"Circuit hervatten","dailyLogicScore":"Logicascore","dailyNoHelp":"Zonder hulp","dailyOrientation":"Oriëntatie","dailyRuleHelp":"Regelhulp","dailyExplanationHelp":"Uitleg","dailyRevealHelp":"Onthulde zet","dailyErrorsCount":"Fouten","dailyBacktracksCount":"Terugstappen","dailyNextGame":"Volgend spel","dailyReport":"Dagrapport","dailyCompleteReport":"Circuit voltooid","dailyScoreNote":"100 punten per spel. De score meet hulp, niet snelheid; fouten en terugstappen kosten geen punten.","dailyScoreLocked":"De officiële score wordt vastgezet bij de eerste oplossing.","dailyUnscoredLegacy":"Voltooid voordat logicascore beschikbaar was"});
Object.assign(I18N.zh,{"dailyCircuit":"QUADLUD 每日巡回","dailyCircuitSub":"完成四个每日游戏，衡量你的独立逻辑推理。","dailyStartCircuit":"开始巡回","dailyResumeCircuit":"继续巡回","dailyLogicScore":"逻辑得分","dailyNoHelp":"无帮助","dailyOrientation":"方向提示","dailyRuleHelp":"规则提示","dailyExplanationHelp":"解释","dailyRevealHelp":"揭示一步","dailyErrorsCount":"错误","dailyBacktracksCount":"回退","dailyNextGame":"下一个游戏","dailyReport":"每日报告","dailyCompleteReport":"巡回完成","dailyScoreNote":"每个游戏100分。得分衡量所获帮助而非速度；错误和回退不扣分。","dailyScoreLocked":"官方得分以首次成功完成为准。","dailyUnscoredLegacy":"在逻辑评分推出前已完成"});
Object.assign(I18N.hi,{"dailyCircuit":"QUADLUD सर्किट","dailyCircuitSub":"चारों दैनिक खेल पूरे करें और अपनी स्वतंत्र तार्किक क्षमता मापें।","dailyStartCircuit":"सर्किट शुरू करें","dailyResumeCircuit":"सर्किट जारी रखें","dailyLogicScore":"तार्किक स्कोर","dailyNoHelp":"बिना मदद","dailyOrientation":"दिशा संकेत","dailyRuleHelp":"नियम सहायता","dailyExplanationHelp":"व्याख्या","dailyRevealHelp":"चाल दिखाई गई","dailyErrorsCount":"गलतियाँ","dailyBacktracksCount":"वापसी","dailyNextGame":"अगला खेल","dailyReport":"दैनिक रिपोर्ट","dailyCompleteReport":"सर्किट पूरा","dailyScoreNote":"हर खेल 100 अंक। स्कोर मदद को मापता है, गति को नहीं; गलतियों और वापसी पर अंक नहीं कटते।","dailyScoreLocked":"आधिकारिक स्कोर पहली सफल पूर्णता पर तय होता है।","dailyUnscoredLegacy":"तार्किक स्कोर उपलब्ध होने से पहले पूरा किया गया"});
Object.assign(I18N.ar,{"dailyCircuit":"دورة QUADLUD","dailyCircuitSub":"أكمل الألعاب اليومية الأربع وقِس استقلالك المنطقي.","dailyStartCircuit":"ابدأ الدورة","dailyResumeCircuit":"استأنف الدورة","dailyLogicScore":"النتيجة المنطقية","dailyNoHelp":"بدون مساعدة","dailyOrientation":"توجيه","dailyRuleHelp":"مساعدة القاعدة","dailyExplanationHelp":"شرح","dailyRevealHelp":"نقلة مكشوفة","dailyErrorsCount":"أخطاء","dailyBacktracksCount":"تراجعات","dailyNextGame":"اللعبة التالية","dailyReport":"التقرير اليومي","dailyCompleteReport":"اكتملت الدورة","dailyScoreNote":"100 نقطة لكل لعبة. تقيس النتيجة مقدار المساعدة لا السرعة؛ الأخطاء والتراجع لا تخصم نقاطًا.","dailyScoreLocked":"تُثبّت النتيجة الرسمية عند أول حل ناجح.","dailyUnscoredLegacy":"أُنجز قبل توفر التقييم المنطقي"});
Object.assign(I18N.bn,{"dailyCircuit":"QUADLUD সার্কিট","dailyCircuitSub":"চারটি দৈনিক খেলা শেষ করে আপনার স্বাধীন যুক্তি পরিমাপ করুন।","dailyStartCircuit":"সার্কিট শুরু করুন","dailyResumeCircuit":"সার্কিট চালিয়ে যান","dailyLogicScore":"যুক্তি স্কোর","dailyNoHelp":"সহায়তা ছাড়া","dailyOrientation":"দিকনির্দেশ","dailyRuleHelp":"নিয়ম সহায়তা","dailyExplanationHelp":"ব্যাখ্যা","dailyRevealHelp":"চাল প্রকাশ","dailyErrorsCount":"ভুল","dailyBacktracksCount":"পিছিয়ে যাওয়া","dailyNextGame":"পরবর্তী খেলা","dailyReport":"দৈনিক প্রতিবেদন","dailyCompleteReport":"সার্কিট সম্পূর্ণ","dailyScoreNote":"প্রতি খেলায় ১০০ পয়েন্ট। স্কোর সাহায্যের মাত্রা মাপে, গতি নয়; ভুল বা পিছিয়ে যাওয়ায় পয়েন্ট কমে না।","dailyScoreLocked":"প্রথম সফল সমাধানেই সরকারি স্কোর স্থির হয়।","dailyUnscoredLegacy":"যুক্তি স্কোর চালুর আগে সম্পন্ন"});
Object.assign(I18N.id,{"dailyCircuit":"Sirkuit QUADLUD","dailyCircuitSub":"Selesaikan empat permainan harian dan ukur kemandirian logika Anda.","dailyStartCircuit":"Mulai sirkuit","dailyResumeCircuit":"Lanjutkan sirkuit","dailyLogicScore":"Skor logika","dailyNoHelp":"Tanpa bantuan","dailyOrientation":"Orientasi","dailyRuleHelp":"Bantuan aturan","dailyExplanationHelp":"Penjelasan","dailyRevealHelp":"Langkah dibuka","dailyErrorsCount":"Kesalahan","dailyBacktracksCount":"Mundur","dailyNextGame":"Permainan berikutnya","dailyReport":"Laporan harian","dailyCompleteReport":"Sirkuit selesai","dailyScoreNote":"100 poin per permainan. Skor mengukur bantuan, bukan kecepatan; kesalahan dan mundur tidak mengurangi poin.","dailyScoreLocked":"Skor resmi dikunci pada penyelesaian pertama.","dailyUnscoredLegacy":"Selesai sebelum skor logika tersedia"});
Object.assign(I18N.ur,{"dailyCircuit":"QUADLUD سرکٹ","dailyCircuitSub":"چاروں روزانہ کھیل مکمل کریں اور اپنی آزاد منطقی صلاحیت ناپیں۔","dailyStartCircuit":"سرکٹ شروع کریں","dailyResumeCircuit":"سرکٹ جاری رکھیں","dailyLogicScore":"منطقی اسکور","dailyNoHelp":"بغیر مدد","dailyOrientation":"رہنمائی","dailyRuleHelp":"قاعدے کی مدد","dailyExplanationHelp":"وضاحت","dailyRevealHelp":"چال ظاہر","dailyErrorsCount":"غلطیاں","dailyBacktracksCount":"واپسی","dailyNextGame":"اگلا کھیل","dailyReport":"روزانہ رپورٹ","dailyCompleteReport":"سرکٹ مکمل","dailyScoreNote":"ہر کھیل 100 پوائنٹس۔ اسکور مدد کو ناپتا ہے، رفتار کو نہیں؛ غلطیوں اور واپسی سے پوائنٹس کم نہیں ہوتے۔","dailyScoreLocked":"سرکاری اسکور پہلی کامیاب تکمیل پر لاک ہو جاتا ہے۔","dailyUnscoredLegacy":"منطقی اسکور سے پہلے مکمل کیا گیا"});
Object.assign(I18N.bg,{"dailyCircuit":"QUADLUD кръг","dailyCircuitSub":"Завърши четирите дневни игри и измери логическата си самостоятелност.","dailyStartCircuit":"Започни кръга","dailyResumeCircuit":"Продължи кръга","dailyLogicScore":"Логически резултат","dailyNoHelp":"Без помощ","dailyOrientation":"Насока","dailyRuleHelp":"Помощ с правило","dailyExplanationHelp":"Обяснение","dailyRevealHelp":"Разкрит ход","dailyErrorsCount":"Грешки","dailyBacktracksCount":"Връщания","dailyNextGame":"Следваща игра","dailyReport":"Дневен отчет","dailyCompleteReport":"Кръгът е завършен","dailyScoreNote":"100 точки на игра. Резултатът измерва помощта, не скоростта; грешките и връщанията не отнемат точки.","dailyScoreLocked":"Официалният резултат се фиксира при първото успешно решаване.","dailyUnscoredLegacy":"Завършено преди логическото оценяване"});
Object.assign(I18N.hr,{"dailyCircuit":"QUADLUD krug","dailyCircuitSub":"Dovrši četiri dnevne igre i izmjeri svoju logičku samostalnost.","dailyStartCircuit":"Pokreni krug","dailyResumeCircuit":"Nastavi krug","dailyLogicScore":"Logički rezultat","dailyNoHelp":"Bez pomoći","dailyOrientation":"Usmjerenje","dailyRuleHelp":"Pomoć pravilom","dailyExplanationHelp":"Objašnjenje","dailyRevealHelp":"Otkriven potez","dailyErrorsCount":"Pogreške","dailyBacktracksCount":"Povratci","dailyNextGame":"Sljedeća igra","dailyReport":"Dnevno izvješće","dailyCompleteReport":"Krug završen","dailyScoreNote":"100 bodova po igri. Rezultat mjeri pomoć, ne brzinu; pogreške i povratci ne oduzimaju bodove.","dailyScoreLocked":"Službeni rezultat zaključava se pri prvom uspješnom rješenju.","dailyUnscoredLegacy":"Završeno prije logičkog bodovanja"});
Object.assign(I18N.cs,{"dailyCircuit":"Okruh QUADLUD","dailyCircuitSub":"Dokonči čtyři denní hry a změř svou logickou samostatnost.","dailyStartCircuit":"Spustit okruh","dailyResumeCircuit":"Pokračovat v okruhu","dailyLogicScore":"Logické skóre","dailyNoHelp":"Bez pomoci","dailyOrientation":"Nasměrování","dailyRuleHelp":"Pomoc s pravidlem","dailyExplanationHelp":"Vysvětlení","dailyRevealHelp":"Odhalený tah","dailyErrorsCount":"Chyby","dailyBacktracksCount":"Návraty","dailyNextGame":"Další hra","dailyReport":"Denní přehled","dailyCompleteReport":"Okruh dokončen","dailyScoreNote":"100 bodů za hru. Skóre měří míru pomoci, ne rychlost; chyby a návraty body nesnižují.","dailyScoreLocked":"Oficiální skóre se uzamkne při prvním úspěšném vyřešení.","dailyUnscoredLegacy":"Dokončeno před zavedením logického skóre"});
Object.assign(I18N.da,{"dailyCircuit":"QUADLUD-runde","dailyCircuitSub":"Gennemfør de fire daglige spil og mål din logiske selvstændighed.","dailyStartCircuit":"Start runden","dailyResumeCircuit":"Fortsæt runden","dailyLogicScore":"Logikscore","dailyNoHelp":"Uden hjælp","dailyOrientation":"Orientering","dailyRuleHelp":"Regelhjælp","dailyExplanationHelp":"Forklaring","dailyRevealHelp":"Afsløret træk","dailyErrorsCount":"Fejl","dailyBacktracksCount":"Tilbagetrin","dailyNextGame":"Næste spil","dailyReport":"Dagsrapport","dailyCompleteReport":"Runden er gennemført","dailyScoreNote":"100 point pr. spil. Scoren måler hjælp, ikke hastighed; fejl og tilbagetrin koster ikke point.","dailyScoreLocked":"Den officielle score låses ved første gennemførte løsning.","dailyUnscoredLegacy":"Gennemført før logikscore var tilgængelig"});
Object.assign(I18N.et,{"dailyCircuit":"QUADLUD ring","dailyCircuitSub":"Lõpeta neli päevamängu ja mõõda oma loogilist iseseisvust.","dailyStartCircuit":"Alusta ringi","dailyResumeCircuit":"Jätka ringi","dailyLogicScore":"Loogikaskoor","dailyNoHelp":"Ilma abita","dailyOrientation":"Suunamine","dailyRuleHelp":"Reegliabi","dailyExplanationHelp":"Selgitus","dailyRevealHelp":"Näidatud käik","dailyErrorsCount":"Vead","dailyBacktracksCount":"Tagasikäigud","dailyNextGame":"Järgmine mäng","dailyReport":"Päevaraport","dailyCompleteReport":"Ring lõpetatud","dailyScoreNote":"100 punkti mängu kohta. Skoor mõõdab abi, mitte kiirust; vead ja tagasikäigud punkte ei vähenda.","dailyScoreLocked":"Ametlik skoor lukustub esimesel edukal lahendamisel.","dailyUnscoredLegacy":"Lõpetatud enne loogikaskoori kasutuselevõttu"});
Object.assign(I18N.fi,{"dailyCircuit":"QUADLUD-kierros","dailyCircuitSub":"Suorita neljä päivittäistä peliä ja mittaa loogista itsenäisyyttäsi.","dailyStartCircuit":"Aloita kierros","dailyResumeCircuit":"Jatka kierrosta","dailyLogicScore":"Logiikkapisteet","dailyNoHelp":"Ilman apua","dailyOrientation":"Suuntaus","dailyRuleHelp":"Sääntöapu","dailyExplanationHelp":"Selitys","dailyRevealHelp":"Paljastettu siirto","dailyErrorsCount":"Virheet","dailyBacktracksCount":"Takaisinpaluut","dailyNextGame":"Seuraava peli","dailyReport":"Päiväraportti","dailyCompleteReport":"Kierros valmis","dailyScoreNote":"100 pistettä peliä kohti. Pisteet mittaavat apua, eivät nopeutta; virheet ja takaisinpaluut eivät vähennä pisteitä.","dailyScoreLocked":"Virallinen pistemäärä lukitaan ensimmäisellä onnistuneella ratkaisulla.","dailyUnscoredLegacy":"Valmis ennen logiikkapisteiden käyttöönottoa"});
Object.assign(I18N.el,{"dailyCircuit":"Κύκλος QUADLUD","dailyCircuitSub":"Ολοκλήρωσε τα τέσσερα καθημερινά παιχνίδια και μέτρησε τη λογική σου αυτονομία.","dailyStartCircuit":"Έναρξη κύκλου","dailyResumeCircuit":"Συνέχιση κύκλου","dailyLogicScore":"Λογικό σκορ","dailyNoHelp":"Χωρίς βοήθεια","dailyOrientation":"Κατεύθυνση","dailyRuleHelp":"Βοήθεια κανόνα","dailyExplanationHelp":"Εξήγηση","dailyRevealHelp":"Αποκαλυμμένη κίνηση","dailyErrorsCount":"Λάθη","dailyBacktracksCount":"Επιστροφές","dailyNextGame":"Επόμενο παιχνίδι","dailyReport":"Ημερήσια αναφορά","dailyCompleteReport":"Ο κύκλος ολοκληρώθηκε","dailyScoreNote":"100 βαθμοί ανά παιχνίδι. Το σκορ μετρά τη βοήθεια, όχι την ταχύτητα· λάθη και επιστροφές δεν αφαιρούν βαθμούς.","dailyScoreLocked":"Το επίσημο σκορ κλειδώνει στην πρώτη επιτυχή λύση.","dailyUnscoredLegacy":"Ολοκληρώθηκε πριν διατεθεί το λογικό σκορ"});
Object.assign(I18N.hu,{"dailyCircuit":"QUADLUD kör","dailyCircuitSub":"Teljesítsd a négy napi játékot, és mérd a logikai önállóságodat.","dailyStartCircuit":"Kör indítása","dailyResumeCircuit":"Kör folytatása","dailyLogicScore":"Logikai pontszám","dailyNoHelp":"Segítség nélkül","dailyOrientation":"Irányítás","dailyRuleHelp":"Szabálysegítség","dailyExplanationHelp":"Magyarázat","dailyRevealHelp":"Felfedett lépés","dailyErrorsCount":"Hibák","dailyBacktracksCount":"Visszalépések","dailyNextGame":"Következő játék","dailyReport":"Napi jelentés","dailyCompleteReport":"Kör teljesítve","dailyScoreNote":"Játékonként 100 pont. A pontszám a segítséget méri, nem a sebességet; a hibák és visszalépések nem vonnak le pontot.","dailyScoreLocked":"A hivatalos pontszám az első sikeres megoldáskor rögzül.","dailyUnscoredLegacy":"A logikai pontozás előtt teljesítve"});
Object.assign(I18N.ga,{"dailyCircuit":"Ciorcad QUADLUD","dailyCircuitSub":"Críochnaigh na ceithre chluiche laethúla agus tomhais do neamhspleáchas loighciúil.","dailyStartCircuit":"Tosaigh an ciorcad","dailyResumeCircuit":"Lean leis an gciorcad","dailyLogicScore":"Scór loighce","dailyNoHelp":"Gan chabhair","dailyOrientation":"Treoshuíomh","dailyRuleHelp":"Cabhair rialach","dailyExplanationHelp":"Míniú","dailyRevealHelp":"Bogadh nochta","dailyErrorsCount":"Earráidí","dailyBacktracksCount":"Céimeanna siar","dailyNextGame":"An chéad chluiche eile","dailyReport":"Tuairisc laethúil","dailyCompleteReport":"Ciorcad críochnaithe","dailyScoreNote":"100 pointe in aghaidh an chluiche. Tomhaiseann an scór an chabhair, ní an luas; ní bhaintear pointí as earráidí ná céimeanna siar.","dailyScoreLocked":"Glasáiltear an scór oifigiúil ar an gcéad réiteach rathúil.","dailyUnscoredLegacy":"Críochnaithe sula raibh scór loighce ar fáil"});
Object.assign(I18N.lv,{"dailyCircuit":"QUADLUD aplis","dailyCircuitSub":"Pabeidz četras dienas spēles un novērtē savu loģisko patstāvību.","dailyStartCircuit":"Sākt apli","dailyResumeCircuit":"Turpināt apli","dailyLogicScore":"Loģikas rezultāts","dailyNoHelp":"Bez palīdzības","dailyOrientation":"Virziens","dailyRuleHelp":"Noteikuma palīdzība","dailyExplanationHelp":"Skaidrojums","dailyRevealHelp":"Atklāts gājiens","dailyErrorsCount":"Kļūdas","dailyBacktracksCount":"Atgriešanās","dailyNextGame":"Nākamā spēle","dailyReport":"Dienas pārskats","dailyCompleteReport":"Aplis pabeigts","dailyScoreNote":"100 punkti par spēli. Rezultāts mēra saņemto palīdzību, nevis ātrumu; kļūdas un atgriešanās punktus neatņem.","dailyScoreLocked":"Oficiālais rezultāts tiek fiksēts pirmajā veiksmīgajā atrisināšanā.","dailyUnscoredLegacy":"Pabeigts pirms loģikas rezultāta ieviešanas"});
Object.assign(I18N.lt,{"dailyCircuit":"QUADLUD ciklas","dailyCircuitSub":"Užbaik keturis dienos žaidimus ir įvertink savo loginį savarankiškumą.","dailyStartCircuit":"Pradėti ciklą","dailyResumeCircuit":"Tęsti ciklą","dailyLogicScore":"Loginis balas","dailyNoHelp":"Be pagalbos","dailyOrientation":"Kryptis","dailyRuleHelp":"Taisyklės pagalba","dailyExplanationHelp":"Paaiškinimas","dailyRevealHelp":"Parodytas ėjimas","dailyErrorsCount":"Klaidos","dailyBacktracksCount":"Grįžimai","dailyNextGame":"Kitas žaidimas","dailyReport":"Dienos ataskaita","dailyCompleteReport":"Ciklas baigtas","dailyScoreNote":"100 taškų už žaidimą. Balas vertina pagalbą, ne greitį; klaidos ir grįžimai taškų nemažina.","dailyScoreLocked":"Oficialus balas užfiksuojamas pirmą kartą sėkmingai išsprendus.","dailyUnscoredLegacy":"Baigta prieš įvedant loginį balą"});
Object.assign(I18N.mt,{"dailyCircuit":"Ċirkwit QUADLUD","dailyCircuitSub":"Imla l-erba’ logħob ta’ kuljum u kejjel l-indipendenza loġika tiegħek.","dailyStartCircuit":"Ibda ċ-ċirkwit","dailyResumeCircuit":"Kompli ċ-ċirkwit","dailyLogicScore":"Punteġġ loġiku","dailyNoHelp":"Mingħajr għajnuna","dailyOrientation":"Orjentazzjoni","dailyRuleHelp":"Għajnuna bir-regola","dailyExplanationHelp":"Spjegazzjoni","dailyRevealHelp":"Mossa murija","dailyErrorsCount":"Żbalji","dailyBacktracksCount":"Passi lura","dailyNextGame":"Logħba li jmiss","dailyReport":"Rapport ta’ kuljum","dailyCompleteReport":"Ċirkwit komplut","dailyScoreNote":"100 punt għal kull logħba. Il-punteġġ ikejjel l-għajnuna, mhux il-veloċità; żbalji u passi lura ma jneħħux punti.","dailyScoreLocked":"Il-punteġġ uffiċjali jissakkar mal-ewwel soluzzjoni b’suċċess.","dailyUnscoredLegacy":"Komplut qabel ma kien disponibbli l-punteġġ loġiku"});
Object.assign(I18N.pl,{"dailyCircuit":"Obwód QUADLUD","dailyCircuitSub":"Ukończ cztery gry dnia i zmierz swoją logiczną samodzielność.","dailyStartCircuit":"Rozpocznij obwód","dailyResumeCircuit":"Wznów obwód","dailyLogicScore":"Wynik logiczny","dailyNoHelp":"Bez pomocy","dailyOrientation":"Ukierunkowanie","dailyRuleHelp":"Pomoc z regułą","dailyExplanationHelp":"Wyjaśnienie","dailyRevealHelp":"Ujawniony ruch","dailyErrorsCount":"Błędy","dailyBacktracksCount":"Cofnięcia","dailyNextGame":"Następna gra","dailyReport":"Raport dnia","dailyCompleteReport":"Obwód ukończony","dailyScoreNote":"100 punktów za grę. Wynik mierzy poziom pomocy, nie szybkość; błędy i cofnięcia nie odejmują punktów.","dailyScoreLocked":"Oficjalny wynik jest blokowany przy pierwszym poprawnym rozwiązaniu.","dailyUnscoredLegacy":"Ukończono przed wprowadzeniem wyniku logicznego"});
Object.assign(I18N.ro,{"dailyCircuit":"Circuit QUADLUD","dailyCircuitSub":"Finalizează cele patru jocuri zilnice și măsoară-ți autonomia logică.","dailyStartCircuit":"Pornește circuitul","dailyResumeCircuit":"Reia circuitul","dailyLogicScore":"Scor logic","dailyNoHelp":"Fără ajutor","dailyOrientation":"Orientare","dailyRuleHelp":"Ajutor cu regula","dailyExplanationHelp":"Explicație","dailyRevealHelp":"Mutare dezvăluită","dailyErrorsCount":"Erori","dailyBacktracksCount":"Reveniri","dailyNextGame":"Jocul următor","dailyReport":"Raport zilnic","dailyCompleteReport":"Circuit finalizat","dailyScoreNote":"100 de puncte pe joc. Scorul măsoară ajutorul, nu viteza; erorile și revenirile nu scad puncte.","dailyScoreLocked":"Scorul oficial se fixează la prima rezolvare reușită.","dailyUnscoredLegacy":"Finalizat înainte de apariția scorului logic"});
Object.assign(I18N.sk,{"dailyCircuit":"Okruh QUADLUD","dailyCircuitSub":"Dokonči štyri denné hry a zmeraj svoju logickú samostatnosť.","dailyStartCircuit":"Spustiť okruh","dailyResumeCircuit":"Pokračovať v okruhu","dailyLogicScore":"Logické skóre","dailyNoHelp":"Bez pomoci","dailyOrientation":"Nasmerovanie","dailyRuleHelp":"Pomoc s pravidlom","dailyExplanationHelp":"Vysvetlenie","dailyRevealHelp":"Odhalený ťah","dailyErrorsCount":"Chyby","dailyBacktracksCount":"Návraty","dailyNextGame":"Ďalšia hra","dailyReport":"Denný prehľad","dailyCompleteReport":"Okruh dokončený","dailyScoreNote":"100 bodov za hru. Skóre meria pomoc, nie rýchlosť; chyby a návraty body neznižujú.","dailyScoreLocked":"Oficiálne skóre sa uzamkne pri prvom úspešnom vyriešení.","dailyUnscoredLegacy":"Dokončené pred zavedením logického skóre"});
Object.assign(I18N.sl,{"dailyCircuit":"Krog QUADLUD","dailyCircuitSub":"Dokončaj štiri dnevne igre in izmeri svojo logično samostojnost.","dailyStartCircuit":"Začni krog","dailyResumeCircuit":"Nadaljuj krog","dailyLogicScore":"Logični rezultat","dailyNoHelp":"Brez pomoči","dailyOrientation":"Usmeritev","dailyRuleHelp":"Pomoč pri pravilu","dailyExplanationHelp":"Razlaga","dailyRevealHelp":"Razkrita poteza","dailyErrorsCount":"Napake","dailyBacktracksCount":"Povratki","dailyNextGame":"Naslednja igra","dailyReport":"Dnevno poročilo","dailyCompleteReport":"Krog zaključen","dailyScoreNote":"100 točk na igro. Rezultat meri pomoč, ne hitrosti; napake in povratki ne odvzemajo točk.","dailyScoreLocked":"Uradni rezultat se zaklene ob prvi uspešni rešitvi.","dailyUnscoredLegacy":"Zaključeno pred uvedbo logičnega rezultata"});
Object.assign(I18N.sv,{"dailyCircuit":"QUADLUD-runda","dailyCircuitSub":"Slutför de fyra dagliga spelen och mät din logiska självständighet.","dailyStartCircuit":"Starta rundan","dailyResumeCircuit":"Fortsätt rundan","dailyLogicScore":"Logikpoäng","dailyNoHelp":"Utan hjälp","dailyOrientation":"Orientering","dailyRuleHelp":"Regelhjälp","dailyExplanationHelp":"Förklaring","dailyRevealHelp":"Avslöjat drag","dailyErrorsCount":"Fel","dailyBacktracksCount":"Tillbakagångar","dailyNextGame":"Nästa spel","dailyReport":"Dagsrapport","dailyCompleteReport":"Rundan slutförd","dailyScoreNote":"100 poäng per spel. Poängen mäter hjälp, inte hastighet; fel och tillbakagångar ger inget poängavdrag.","dailyScoreLocked":"Den officiella poängen låses vid första lyckade lösningen.","dailyUnscoredLegacy":"Slutfört innan logikpoäng fanns"});

/* v2.19.1 — move justification audit */
Object.assign(I18N.en,{"moveJustified":"Justified move","moveUnjustified":"Legal move, but not justified","moveHypothesis":"Hypothesis","treatAsHypothesis":"Treat as hypothesis","hypothesisAccepted":"Hypothesis accepted","unjustifiedExplain":"This move violates no rule, but QUADLUD cannot currently derive it from the visible constraints with its known techniques. It is therefore an assumption, not a certified deduction.","knownLogicalMove":"A currently demonstrable move is","undoThisMove":"Undo this move","reasoningAudit":"Reasoning audit"});
Object.assign(I18N.fr,{"moveJustified":"Coup justifié","moveUnjustified":"Coup légal, mais non justifié","moveHypothesis":"Hypothèse","treatAsHypothesis":"Traiter comme hypothèse","hypothesisAccepted":"Hypothèse acceptée","unjustifiedExplain":"Ce coup ne viole aucune règle, mais QUADLUD ne parvient pas actuellement à le déduire des contraintes visibles avec les techniques qu’il connaît. Il s’agit donc d’une hypothèse, et non d’une déduction certifiée.","knownLogicalMove":"Un coup actuellement démontrable est","undoThisMove":"Annuler ce coup","reasoningAudit":"Audit du raisonnement"});
Object.assign(I18N.es,{"moveJustified":"Jugada justificada","moveUnjustified":"Jugada legal, pero no justificada","moveHypothesis":"Hipótesis","treatAsHypothesis":"Tratar como hipótesis","hypothesisAccepted":"Hipótesis aceptada","unjustifiedExplain":"Esta jugada no viola ninguna regla, pero QUADLUD no puede deducirla actualmente a partir de las restricciones visibles con sus técnicas conocidas. Por tanto es una hipótesis, no una deducción certificada.","knownLogicalMove":"Una jugada demostrable ahora es","undoThisMove":"Deshacer esta jugada","reasoningAudit":"Auditoría del razonamiento"});
Object.assign(I18N.pt,{"moveJustified":"Jogada justificada","moveUnjustified":"Jogada legal, mas não justificada","moveHypothesis":"Hipótese","treatAsHypothesis":"Tratar como hipótese","hypothesisAccepted":"Hipótese aceite","unjustifiedExplain":"Esta jogada não viola nenhuma regra, mas QUADLUD não consegue atualmente deduzi-la das restrições visíveis com as técnicas conhecidas. É portanto uma hipótese, não uma dedução certificada.","knownLogicalMove":"Uma jogada demonstrável agora é","undoThisMove":"Desfazer esta jogada","reasoningAudit":"Auditoria do raciocínio"});
Object.assign(I18N.it,{"moveJustified":"Mossa giustificata","moveUnjustified":"Mossa legale, ma non giustificata","moveHypothesis":"Ipotesi","treatAsHypothesis":"Tratta come ipotesi","hypothesisAccepted":"Ipotesi accettata","unjustifiedExplain":"Questa mossa non viola alcuna regola, ma QUADLUD al momento non riesce a dedurla dai vincoli visibili con le tecniche conosciute. È quindi un’ipotesi, non una deduzione certificata.","knownLogicalMove":"Una mossa attualmente dimostrabile è","undoThisMove":"Annulla questa mossa","reasoningAudit":"Verifica del ragionamento"});
Object.assign(I18N.de,{"moveJustified":"Begründeter Zug","moveUnjustified":"Legal, aber nicht begründet","moveHypothesis":"Hypothese","treatAsHypothesis":"Als Hypothese behandeln","hypothesisAccepted":"Hypothese übernommen","unjustifiedExplain":"Dieser Zug verletzt keine Regel, lässt sich von QUADLUD mit den bekannten Techniken derzeit aber nicht aus den sichtbaren Einschränkungen ableiten. Er gilt daher als Annahme, nicht als bestätigte Schlussfolgerung.","knownLogicalMove":"Ein derzeit beweisbarer Zug ist","undoThisMove":"Diesen Zug rückgängig machen","reasoningAudit":"Logikprüfung"});
Object.assign(I18N.nl,{"moveJustified":"Gerechtvaardigde zet","moveUnjustified":"Legale maar niet gerechtvaardigde zet","moveHypothesis":"Hypothese","treatAsHypothesis":"Behandel als hypothese","hypothesisAccepted":"Hypothese geaccepteerd","unjustifiedExplain":"Deze zet overtreedt geen regel, maar QUADLUD kan hem momenteel niet afleiden uit de zichtbare beperkingen met de bekende technieken. Het is dus een aanname, geen gecertificeerde deductie.","knownLogicalMove":"Een momenteel aantoonbare zet is","undoThisMove":"Deze zet ongedaan maken","reasoningAudit":"Redeneeraudit"});
Object.assign(I18N.zh,{"moveJustified":"有依据的一步","moveUnjustified":"合法但尚无逻辑依据","moveHypothesis":"假设","treatAsHypothesis":"作为假设处理","hypothesisAccepted":"已接受为假设","unjustifiedExplain":"这一步没有违反规则，但 QUADLUD 目前无法用已知技巧从可见约束中推导出来。因此它属于假设，而不是已证明的推理。","knownLogicalMove":"当前可以证明的一步是","undoThisMove":"撤销这一步","reasoningAudit":"推理审计"});
Object.assign(I18N.hi,{"moveJustified":"तार्किक रूप से सिद्ध चाल","moveUnjustified":"वैध, पर सिद्ध नहीं","moveHypothesis":"परिकल्पना","treatAsHypothesis":"परिकल्पना मानें","hypothesisAccepted":"परिकल्पना स्वीकार की गई","unjustifiedExplain":"यह चाल किसी नियम का उल्लंघन नहीं करती, लेकिन QUADLUD ज्ञात तकनीकों से दिखाई देने वाली बाधाओं के आधार पर अभी इसे सिद्ध नहीं कर सकता। इसलिए यह प्रमाणित निष्कर्ष नहीं, एक परिकल्पना है।","knownLogicalMove":"अभी सिद्ध की जा सकने वाली चाल है","undoThisMove":"यह चाल पूर्ववत करें","reasoningAudit":"तर्क ऑडिट"});
Object.assign(I18N.ar,{"moveJustified":"نقلة مبررة","moveUnjustified":"نقلة قانونية لكنها غير مبررة","moveHypothesis":"فرضية","treatAsHypothesis":"اعتبرها فرضية","hypothesisAccepted":"تم قبول الفرضية","unjustifiedExplain":"لا تخالف هذه النقلة أي قاعدة، لكن QUADLUD لا يستطيع حاليًا استنتاجها من القيود الظاهرة بالتقنيات المعروفة لديه. لذلك فهي فرضية وليست استنتاجًا مثبتًا.","knownLogicalMove":"نقلة يمكن إثباتها الآن هي","undoThisMove":"تراجع عن هذه النقلة","reasoningAudit":"تدقيق الاستدلال"});
Object.assign(I18N.bn,{"moveJustified":"যুক্তিসিদ্ধ চাল","moveUnjustified":"বৈধ কিন্তু যুক্তিসিদ্ধ নয়","moveHypothesis":"অনুমান","treatAsHypothesis":"অনুমান হিসেবে নিন","hypothesisAccepted":"অনুমান গ্রহণ করা হয়েছে","unjustifiedExplain":"এই চালটি কোনো নিয়ম ভাঙে না, কিন্তু QUADLUD তার জানা কৌশল দিয়ে দৃশ্যমান শর্ত থেকে এখনই এটি প্রমাণ করতে পারে না। তাই এটি নিশ্চিত সিদ্ধান্ত নয়, একটি অনুমান।","knownLogicalMove":"এখন প্রমাণযোগ্য একটি চাল হলো","undoThisMove":"এই চালটি পূর্বাবস্থায় নিন","reasoningAudit":"যুক্তি নিরীক্ষা"});
Object.assign(I18N.id,{"moveJustified":"Langkah terjustifikasi","moveUnjustified":"Langkah legal, tetapi belum terjustifikasi","moveHypothesis":"Hipotesis","treatAsHypothesis":"Perlakukan sebagai hipotesis","hypothesisAccepted":"Hipotesis diterima","unjustifiedExplain":"Langkah ini tidak melanggar aturan, tetapi QUADLUD saat ini tidak dapat menurunkannya dari batasan yang terlihat dengan teknik yang dikenal. Jadi ini adalah asumsi, bukan deduksi yang telah terbukti.","knownLogicalMove":"Langkah yang saat ini dapat dibuktikan adalah","undoThisMove":"Urungkan langkah ini","reasoningAudit":"Audit penalaran"});
Object.assign(I18N.ur,{"moveJustified":"منطقی طور پر ثابت چال","moveUnjustified":"قانونی مگر غیر ثابت چال","moveHypothesis":"مفروضہ","treatAsHypothesis":"مفروضہ سمجھیں","hypothesisAccepted":"مفروضہ قبول ہوگیا","unjustifiedExplain":"یہ چال کسی اصول کی خلاف ورزی نہیں کرتی، لیکن QUADLUD معلوم تکنیکوں سے نظر آنے والی پابندیوں کی بنیاد پر اسے ابھی ثابت نہیں کر سکتا۔ اس لیے یہ ثابت شدہ نتیجہ نہیں بلکہ مفروضہ ہے۔","knownLogicalMove":"اس وقت ثابت کی جا سکنے والی چال ہے","undoThisMove":"یہ چال واپس کریں","reasoningAudit":"منطقی جائزہ"});
Object.assign(I18N.bg,{"moveJustified":"Обоснован ход","moveUnjustified":"Позволен, но необоснован ход","moveHypothesis":"Хипотеза","treatAsHypothesis":"Приеми като хипотеза","hypothesisAccepted":"Хипотезата е приета","unjustifiedExplain":"Този ход не нарушава правило, но QUADLUD в момента не може да го изведе от видимите ограничения с познатите техники. Затова той е хипотеза, а не доказано заключение.","knownLogicalMove":"Ход, който в момента може да се докаже, е","undoThisMove":"Отмени този ход","reasoningAudit":"Одит на разсъждението"});
Object.assign(I18N.hr,{"moveJustified":"Opravdan potez","moveUnjustified":"Dopušten, ali neopravdan potez","moveHypothesis":"Hipoteza","treatAsHypothesis":"Tretiraj kao hipotezu","hypothesisAccepted":"Hipoteza prihvaćena","unjustifiedExplain":"Ovaj potez ne krši nijedno pravilo, ali ga QUADLUD trenutačno ne može izvesti iz vidljivih ograničenja poznatim tehnikama. Zato je to hipoteza, a ne potvrđena dedukcija.","knownLogicalMove":"Potez koji se sada može dokazati je","undoThisMove":"Poništi ovaj potez","reasoningAudit":"Provjera zaključivanja"});
Object.assign(I18N.cs,{"moveJustified":"Odůvodněný tah","moveUnjustified":"Legální, ale neodůvodněný tah","moveHypothesis":"Hypotéza","treatAsHypothesis":"Považovat za hypotézu","hypothesisAccepted":"Hypotéza přijata","unjustifiedExplain":"Tento tah neporušuje žádné pravidlo, ale QUADLUD jej nyní nedokáže odvodit z viditelných omezení pomocí známých technik. Jde tedy o hypotézu, nikoli o potvrzenou dedukci.","knownLogicalMove":"Tah, který lze nyní dokázat, je","undoThisMove":"Vrátit tento tah","reasoningAudit":"Audit uvažování"});
Object.assign(I18N.da,{"moveJustified":"Begrundet træk","moveUnjustified":"Lovligt, men ikke begrundet træk","moveHypothesis":"Hypotese","treatAsHypothesis":"Behandl som hypotese","hypothesisAccepted":"Hypotese accepteret","unjustifiedExplain":"Trækket bryder ingen regel, men QUADLUD kan ikke på nuværende tidspunkt udlede det af de synlige begrænsninger med de kendte teknikker. Det er derfor en antagelse, ikke en dokumenteret slutning.","knownLogicalMove":"Et træk der kan bevises nu er","undoThisMove":"Fortryd dette træk","reasoningAudit":"Ræsonneringskontrol"});
Object.assign(I18N.et,{"moveJustified":"Põhjendatud käik","moveUnjustified":"Lubatud, kuid põhjendamata käik","moveHypothesis":"Hüpotees","treatAsHypothesis":"Käsitle hüpoteesina","hypothesisAccepted":"Hüpotees vastu võetud","unjustifiedExplain":"See käik ei riku ühtegi reeglit, kuid QUADLUD ei suuda seda praegu nähtavatest piirangutest tuntud tehnikatega tuletada. Seega on see hüpotees, mitte kinnitatud järeldus.","knownLogicalMove":"Praegu tõestatava käigu näide on","undoThisMove":"Võta see käik tagasi","reasoningAudit":"Arutluskontroll"});
Object.assign(I18N.fi,{"moveJustified":"Perusteltu siirto","moveUnjustified":"Laillinen mutta perustelematon siirto","moveHypothesis":"Hypoteesi","treatAsHypothesis":"Käsittele hypoteesina","hypothesisAccepted":"Hypoteesi hyväksytty","unjustifiedExplain":"Siirto ei riko sääntöjä, mutta QUADLUD ei tällä hetkellä pysty johtamaan sitä näkyvistä rajoitteista tuntemillaan tekniikoilla. Siksi se on oletus, ei vahvistettu päätelmä.","knownLogicalMove":"Tällä hetkellä todistettavissa oleva siirto on","undoThisMove":"Kumoa tämä siirto","reasoningAudit":"Päättelyn tarkistus"});
Object.assign(I18N.el,{"moveJustified":"Αιτιολογημένη κίνηση","moveUnjustified":"Νόμιμη αλλά μη αιτιολογημένη κίνηση","moveHypothesis":"Υπόθεση","treatAsHypothesis":"Θεώρησέ την υπόθεση","hypothesisAccepted":"Η υπόθεση έγινε αποδεκτή","unjustifiedExplain":"Η κίνηση δεν παραβιάζει κανόνα, αλλά το QUADLUD δεν μπορεί αυτή τη στιγμή να την εξαγάγει από τους ορατούς περιορισμούς με τις γνωστές τεχνικές. Είναι λοιπόν υπόθεση και όχι πιστοποιημένο συμπέρασμα.","knownLogicalMove":"Μια κίνηση που αποδεικνύεται τώρα είναι","undoThisMove":"Αναίρεσε αυτή την κίνηση","reasoningAudit":"Έλεγχος συλλογισμού"});
Object.assign(I18N.hu,{"moveJustified":"Indokolt lépés","moveUnjustified":"Szabályos, de nem indokolt lépés","moveHypothesis":"Hipotézis","treatAsHypothesis":"Kezeld hipotézisként","hypothesisAccepted":"Hipotézis elfogadva","unjustifiedExplain":"Ez a lépés nem sért szabályt, de a QUADLUD jelenleg nem tudja levezetni a látható korlátokból az ismert technikákkal. Ezért feltételezés, nem igazolt következtetés.","knownLogicalMove":"Egy jelenleg bizonyítható lépés","undoThisMove":"Vond vissza ezt a lépést","reasoningAudit":"Következtetési ellenőrzés"});
Object.assign(I18N.ga,{"moveJustified":"Bogadh a bhfuil údar leis","moveUnjustified":"Bogadh dleathach ach gan údar loighciúil","moveHypothesis":"Hipitéis","treatAsHypothesis":"Glac mar hipitéis","hypothesisAccepted":"Glacadh leis an hipitéis","unjustifiedExplain":"Ní sháraíonn an bogadh seo aon riail, ach ní féidir le QUADLUD é a bhaint as na srianta infheicthe faoi láthair leis na teicnící atá ar eolas aige. Mar sin is hipitéis é, ní asbhaint dheimhnithe.","knownLogicalMove":"Bogadh atá inchruthaithe anois ná","undoThisMove":"Cealaigh an bogadh seo","reasoningAudit":"Iniúchadh réasúnaíochta"});
Object.assign(I18N.lv,{"moveJustified":"Pamatots gājiens","moveUnjustified":"Atļauts, bet nepamatots gājiens","moveHypothesis":"Hipotēze","treatAsHypothesis":"Uzskatīt par hipotēzi","hypothesisAccepted":"Hipotēze pieņemta","unjustifiedExplain":"Šis gājiens nepārkāpj noteikumus, taču QUADLUD pašlaik nespēj to izsecināt no redzamajiem ierobežojumiem ar zināmajām metodēm. Tāpēc tā ir hipotēze, nevis pierādīts secinājums.","knownLogicalMove":"Pašlaik pierādāms gājiens ir","undoThisMove":"Atsaukt šo gājienu","reasoningAudit":"Spriešanas audits"});
Object.assign(I18N.lt,{"moveJustified":"Pagrįstas ėjimas","moveUnjustified":"Leistinas, bet nepagrįstas ėjimas","moveHypothesis":"Hipotezė","treatAsHypothesis":"Laikyti hipoteze","hypothesisAccepted":"Hipotezė priimta","unjustifiedExplain":"Šis ėjimas nepažeidžia taisyklių, tačiau QUADLUD šiuo metu negali jo išvesti iš matomų apribojimų naudodamas žinomus metodus. Todėl tai hipotezė, o ne patvirtinta išvada.","knownLogicalMove":"Šiuo metu įrodomas ėjimas yra","undoThisMove":"Atšaukti šį ėjimą","reasoningAudit":"Samprotavimo auditas"});
Object.assign(I18N.mt,{"moveJustified":"Mossa ġġustifikata","moveUnjustified":"Mossa legali iżda mhux iġġustifikata","moveHypothesis":"Ipoteżi","treatAsHypothesis":"Ittrattaha bħala ipoteżi","hypothesisAccepted":"Ipoteżi aċċettata","unjustifiedExplain":"Din il-mossa ma tikser l-ebda regola, iżda QUADLUD bħalissa ma jistax joħroġha mir-restrizzjonijiet viżibbli bit-tekniki magħrufa. Għalhekk hija ipoteżi, mhux deduzzjoni ċċertifikata.","knownLogicalMove":"Mossa li tista’ tiġi ppruvata issa hija","undoThisMove":"Ħoll din il-mossa","reasoningAudit":"Verifika tar-raġunament"});
Object.assign(I18N.pl,{"moveJustified":"Uzasadniony ruch","moveUnjustified":"Legalny, ale nieuzasadniony ruch","moveHypothesis":"Hipoteza","treatAsHypothesis":"Traktuj jako hipotezę","hypothesisAccepted":"Hipoteza zaakceptowana","unjustifiedExplain":"Ten ruch nie narusza żadnej reguły, ale QUADLUD nie potrafi obecnie wyprowadzić go z widocznych ograniczeń przy użyciu znanych technik. Jest więc hipotezą, a nie potwierdzoną dedukcją.","knownLogicalMove":"Ruch, który obecnie można udowodnić, to","undoThisMove":"Cofnij ten ruch","reasoningAudit":"Audyt rozumowania"});
Object.assign(I18N.ro,{"moveJustified":"Mutare justificată","moveUnjustified":"Mutare legală, dar nejustificată","moveHypothesis":"Ipoteză","treatAsHypothesis":"Tratează ca ipoteză","hypothesisAccepted":"Ipoteză acceptată","unjustifiedExplain":"Această mutare nu încalcă nicio regulă, dar QUADLUD nu o poate deduce în prezent din constrângerile vizibile cu tehnicile cunoscute. Este deci o ipoteză, nu o deducție certificată.","knownLogicalMove":"O mutare demonstrabilă acum este","undoThisMove":"Anulează această mutare","reasoningAudit":"Auditul raționamentului"});
Object.assign(I18N.sk,{"moveJustified":"Odôvodnený ťah","moveUnjustified":"Legálny, ale neodôvodnený ťah","moveHypothesis":"Hypotéza","treatAsHypothesis":"Považovať za hypotézu","hypothesisAccepted":"Hypotéza prijatá","unjustifiedExplain":"Tento ťah neporušuje žiadne pravidlo, ale QUADLUD ho momentálne nedokáže odvodiť z viditeľných obmedzení pomocou známych techník. Je to teda hypotéza, nie potvrdená dedukcia.","knownLogicalMove":"Ťah, ktorý možno teraz dokázať, je","undoThisMove":"Vrátiť tento ťah","reasoningAudit":"Audit uvažovania"});
Object.assign(I18N.sl,{"moveJustified":"Utemeljena poteza","moveUnjustified":"Dovoljena, vendar neutemeljena poteza","moveHypothesis":"Hipoteza","treatAsHypothesis":"Obravnavaj kot hipotezo","hypothesisAccepted":"Hipoteza sprejeta","unjustifiedExplain":"Ta poteza ne krši nobenega pravila, vendar je QUADLUD trenutno ne more izpeljati iz vidnih omejitev z znanimi tehnikami. Zato je hipoteza in ne potrjen sklep.","knownLogicalMove":"Poteza, ki jo je trenutno mogoče dokazati, je","undoThisMove":"Razveljavi to potezo","reasoningAudit":"Pregled sklepanja"});
Object.assign(I18N.sv,{"moveJustified":"Motiverat drag","moveUnjustified":"Lagligt men inte motiverat drag","moveHypothesis":"Hypotes","treatAsHypothesis":"Behandla som hypotes","hypothesisAccepted":"Hypotes accepterad","unjustifiedExplain":"Draget bryter ingen regel, men QUADLUD kan för närvarande inte härleda det från de synliga begränsningarna med sina kända tekniker. Det är därför en hypotes, inte en verifierad slutsats.","knownLogicalMove":"Ett drag som kan bevisas nu är","undoThisMove":"Ångra detta drag","reasoningAudit":"Resonemangsgranskning"});

/* v2.20.0 — Exploration mode */
Object.assign(I18N.en,{"exploration":"Exploration","explorationSub":"Test assumptions without losing your previous path.","testHypothesis":"Test a hypothesis","explorationActive":"Exploration active","branchPoint":"Branch point","currentBranch":"Current branch","keepBranch":"Keep this branch","returnBranchPoint":"Return to branch point","closeExploration":"Close exploration","analyzeBranch":"Analyze branch","noContradiction":"No contradiction is demonstrable yet at the current proof depth.","contradictionFound":"A contradiction is demonstrable on this branch.","branchTree":"Branches","branchHypothesisAuto":"This legal but unproved move is recorded as a hypothesis in the exploration branch.","branchKept":"Branch kept","branchReturned":"Returned to branch point","branchStart":"Start"});
Object.assign(I18N.fr,{"exploration":"Exploration","explorationSub":"Teste des hypothèses sans perdre le chemin précédent.","testHypothesis":"Tester une hypothèse","explorationActive":"Exploration active","branchPoint":"Point de branchement","currentBranch":"Branche courante","keepBranch":"Conserver cette branche","returnBranchPoint":"Revenir au point de branchement","closeExploration":"Fermer l’exploration","analyzeBranch":"Analyser la branche","noContradiction":"Aucune contradiction n’est encore démontrable avec la profondeur de preuve actuelle.","contradictionFound":"Une contradiction est démontrable dans cette branche.","branchTree":"Branches","branchHypothesisAuto":"Ce coup légal mais non démontré est enregistré comme hypothèse dans la branche d’exploration.","branchKept":"Branche conservée","branchReturned":"Retour au point de branchement","branchStart":"Départ"});
Object.assign(I18N.es,{"exploration":"Exploración","explorationSub":"Prueba hipótesis sin perder el camino anterior.","testHypothesis":"Probar una hipótesis","explorationActive":"Exploración activa","branchPoint":"Punto de ramificación","currentBranch":"Rama actual","keepBranch":"Conservar esta rama","returnBranchPoint":"Volver al punto de ramificación","closeExploration":"Cerrar exploración","analyzeBranch":"Analizar rama","noContradiction":"Aún no puede demostrarse ninguna contradicción con la profundidad de prueba actual.","contradictionFound":"Puede demostrarse una contradicción en esta rama.","branchTree":"Ramas","branchHypothesisAuto":"Esta jugada legal pero no demostrada se registra como hipótesis en la rama de exploración.","branchKept":"Rama conservada","branchReturned":"Vuelta al punto de ramificación","branchStart":"Inicio"});
Object.assign(I18N.pt,{"exploration":"Exploração","explorationSub":"Testa hipóteses sem perder o caminho anterior.","testHypothesis":"Testar uma hipótese","explorationActive":"Exploração ativa","branchPoint":"Ponto de ramificação","currentBranch":"Ramo atual","keepBranch":"Conservar este ramo","returnBranchPoint":"Voltar ao ponto de ramificação","closeExploration":"Fechar exploração","analyzeBranch":"Analisar ramo","noContradiction":"Ainda não é demonstrável nenhuma contradição com a profundidade de prova atual.","contradictionFound":"É demonstrável uma contradição neste ramo.","branchTree":"Ramos","branchHypothesisAuto":"Esta jogada legal mas não demonstrada é registada como hipótese no ramo de exploração.","branchKept":"Ramo conservado","branchReturned":"Regresso ao ponto de ramificação","branchStart":"Início"});
Object.assign(I18N.it,{"exploration":"Esplorazione","explorationSub":"Prova ipotesi senza perdere il percorso precedente.","testHypothesis":"Prova un’ipotesi","explorationActive":"Esplorazione attiva","branchPoint":"Punto di diramazione","currentBranch":"Ramo corrente","keepBranch":"Conserva questo ramo","returnBranchPoint":"Torna al punto di diramazione","closeExploration":"Chiudi esplorazione","analyzeBranch":"Analizza ramo","noContradiction":"Nessuna contraddizione è ancora dimostrabile con l’attuale profondità di prova.","contradictionFound":"In questo ramo è dimostrabile una contraddizione.","branchTree":"Rami","branchHypothesisAuto":"Questa mossa legale ma non dimostrata viene registrata come ipotesi nel ramo di esplorazione.","branchKept":"Ramo conservato","branchReturned":"Ritorno al punto di diramazione","branchStart":"Inizio"});
Object.assign(I18N.de,{"exploration":"Exploration","explorationSub":"Teste Hypothesen, ohne den bisherigen Weg zu verlieren.","testHypothesis":"Hypothese testen","explorationActive":"Exploration aktiv","branchPoint":"Verzweigungspunkt","currentBranch":"Aktueller Zweig","keepBranch":"Diesen Zweig behalten","returnBranchPoint":"Zum Verzweigungspunkt zurück","closeExploration":"Exploration schließen","analyzeBranch":"Zweig analysieren","noContradiction":"Mit der aktuellen Beweistiefe ist noch kein Widerspruch nachweisbar.","contradictionFound":"Auf diesem Zweig ist ein Widerspruch nachweisbar.","branchTree":"Zweige","branchHypothesisAuto":"Dieser legale, aber nicht bewiesene Zug wird als Hypothese im Explorationszweig gespeichert.","branchKept":"Zweig behalten","branchReturned":"Zum Verzweigungspunkt zurückgekehrt","branchStart":"Start"});
Object.assign(I18N.nl,{"exploration":"Exploratie","explorationSub":"Test hypothesen zonder je vorige pad te verliezen.","testHypothesis":"Test een hypothese","explorationActive":"Exploratie actief","branchPoint":"Vertakkingspunt","currentBranch":"Huidige tak","keepBranch":"Deze tak behouden","returnBranchPoint":"Terug naar vertakkingspunt","closeExploration":"Exploratie sluiten","analyzeBranch":"Tak analyseren","noContradiction":"Met de huidige bewijsdiepte is nog geen tegenspraak aantoonbaar.","contradictionFound":"In deze tak is een tegenspraak aantoonbaar.","branchTree":"Takken","branchHypothesisAuto":"Deze legale maar onbewezen zet wordt als hypothese in de exploratietak opgeslagen.","branchKept":"Tak behouden","branchReturned":"Terug naar vertakkingspunt","branchStart":"Start"});
Object.assign(I18N.zh,{"exploration":"探索","explorationSub":"测试假设而不丢失原来的路径。","testHypothesis":"测试假设","explorationActive":"探索中","branchPoint":"分支点","currentBranch":"当前分支","keepBranch":"保留此分支","returnBranchPoint":"返回分支点","closeExploration":"关闭探索","analyzeBranch":"分析分支","noContradiction":"在当前证明深度下尚未能证明矛盾。","contradictionFound":"此分支可以证明存在矛盾。","branchTree":"分支","branchHypothesisAuto":"这个合法但未证明的步骤被记录为探索分支中的假设。","branchKept":"已保留分支","branchReturned":"已返回分支点","branchStart":"开始"});
Object.assign(I18N.hi,{"exploration":"अन्वेषण","explorationSub":"पिछला रास्ता खोए बिना परिकल्पनाएँ जाँचें।","testHypothesis":"परिकल्पना जाँचें","explorationActive":"अन्वेषण सक्रिय","branchPoint":"शाखा बिंदु","currentBranch":"वर्तमान शाखा","keepBranch":"इस शाखा को रखें","returnBranchPoint":"शाखा बिंदु पर लौटें","closeExploration":"अन्वेषण बंद करें","analyzeBranch":"शाखा का विश्लेषण करें","noContradiction":"वर्तमान प्रमाण गहराई पर अभी कोई विरोधाभास सिद्ध नहीं है।","contradictionFound":"इस शाखा पर विरोधाभास सिद्ध किया जा सकता है।","branchTree":"शाखाएँ","branchHypothesisAuto":"यह वैध पर असिद्ध चाल अन्वेषण शाखा में परिकल्पना के रूप में दर्ज होती है।","branchKept":"शाखा रखी गई","branchReturned":"शाखा बिंदु पर लौटे","branchStart":"आरंभ"});
Object.assign(I18N.ar,{"exploration":"الاستكشاف","explorationSub":"اختبر الفرضيات من دون فقدان المسار السابق.","testHypothesis":"اختبر فرضية","explorationActive":"الاستكشاف نشط","branchPoint":"نقطة التفرع","currentBranch":"الفرع الحالي","keepBranch":"احتفظ بهذا الفرع","returnBranchPoint":"العودة إلى نقطة التفرع","closeExploration":"إغلاق الاستكشاف","analyzeBranch":"تحليل الفرع","noContradiction":"لا يمكن بعد إثبات تناقض بعمق البرهان الحالي.","contradictionFound":"يمكن إثبات تناقض في هذا الفرع.","branchTree":"الفروع","branchHypothesisAuto":"تُسجل هذه النقلة القانونية غير المثبتة كفرضية في فرع الاستكشاف.","branchKept":"تم الاحتفاظ بالفرع","branchReturned":"تمت العودة إلى نقطة التفرع","branchStart":"البداية"});
Object.assign(I18N.bn,{"exploration":"অন্বেষণ","explorationSub":"আগের পথ না হারিয়ে অনুমান পরীক্ষা করুন।","testHypothesis":"একটি অনুমান পরীক্ষা করুন","explorationActive":"অন্বেষণ সক্রিয়","branchPoint":"শাখা বিন্দু","currentBranch":"বর্তমান শাখা","keepBranch":"এই শাখা রাখুন","returnBranchPoint":"শাখা বিন্দুতে ফিরুন","closeExploration":"অন্বেষণ বন্ধ করুন","analyzeBranch":"শাখা বিশ্লেষণ করুন","noContradiction":"বর্তমান প্রমাণের গভীরতায় এখনও কোনো বিরোধ প্রমাণযোগ্য নয়।","contradictionFound":"এই শাখায় একটি বিরোধ প্রমাণযোগ্য।","branchTree":"শাখা","branchHypothesisAuto":"এই বৈধ কিন্তু অপ্রমাণিত চালটি অন্বেষণ শাখায় অনুমান হিসেবে সংরক্ষিত হয়।","branchKept":"শাখা রাখা হয়েছে","branchReturned":"শাখা বিন্দুতে ফেরা হয়েছে","branchStart":"শুরু"});
Object.assign(I18N.id,{"exploration":"Eksplorasi","explorationSub":"Uji hipotesis tanpa kehilangan jalur sebelumnya.","testHypothesis":"Uji hipotesis","explorationActive":"Eksplorasi aktif","branchPoint":"Titik cabang","currentBranch":"Cabang saat ini","keepBranch":"Pertahankan cabang ini","returnBranchPoint":"Kembali ke titik cabang","closeExploration":"Tutup eksplorasi","analyzeBranch":"Analisis cabang","noContradiction":"Belum ada kontradiksi yang dapat dibuktikan pada kedalaman bukti saat ini.","contradictionFound":"Kontradiksi dapat dibuktikan pada cabang ini.","branchTree":"Cabang","branchHypothesisAuto":"Langkah legal tetapi belum terbukti ini dicatat sebagai hipotesis pada cabang eksplorasi.","branchKept":"Cabang dipertahankan","branchReturned":"Kembali ke titik cabang","branchStart":"Mulai"});
Object.assign(I18N.ur,{"exploration":"کھوج","explorationSub":"پچھلا راستہ کھوئے بغیر مفروضے آزمائیں۔","testHypothesis":"مفروضہ آزمائیں","explorationActive":"کھوج فعال","branchPoint":"شاخ کا نقطہ","currentBranch":"موجودہ شاخ","keepBranch":"یہ شاخ رکھیں","returnBranchPoint":"شاخ کے نقطے پر واپس جائیں","closeExploration":"کھوج بند کریں","analyzeBranch":"شاخ کا تجزیہ کریں","noContradiction":"موجودہ ثبوت کی گہرائی پر ابھی کوئی تضاد ثابت نہیں۔","contradictionFound":"اس شاخ پر تضاد ثابت کیا جا سکتا ہے۔","branchTree":"شاخیں","branchHypothesisAuto":"یہ قانونی مگر غیر ثابت چال کھوج کی شاخ میں مفروضے کے طور پر محفوظ ہوتی ہے۔","branchKept":"شاخ محفوظ","branchReturned":"شاخ کے نقطے پر واپسی","branchStart":"آغاز"});
Object.assign(I18N.bg,{"exploration":"Изследване","explorationSub":"Проверявай хипотези, без да губиш предишния път.","testHypothesis":"Тествай хипотеза","explorationActive":"Изследването е активно","branchPoint":"Точка на разклонение","currentBranch":"Текущ клон","keepBranch":"Запази този клон","returnBranchPoint":"Върни се към точката на разклонение","closeExploration":"Затвори изследването","analyzeBranch":"Анализирай клона","noContradiction":"При текущата дълбочина на доказване още няма доказуемо противоречие.","contradictionFound":"В този клон може да се докаже противоречие.","branchTree":"Клонове","branchHypothesisAuto":"Този позволен, но недоказан ход се записва като хипотеза в клона за изследване.","branchKept":"Клонът е запазен","branchReturned":"Връщане към точката на разклонение","branchStart":"Начало"});
Object.assign(I18N.hr,{"exploration":"Istraživanje","explorationSub":"Ispituj hipoteze bez gubitka prethodnog puta.","testHypothesis":"Testiraj hipotezu","explorationActive":"Istraživanje aktivno","branchPoint":"Točka grananja","currentBranch":"Trenutna grana","keepBranch":"Zadrži ovu granu","returnBranchPoint":"Vrati se na točku grananja","closeExploration":"Zatvori istraživanje","analyzeBranch":"Analiziraj granu","noContradiction":"Na trenutačnoj dubini dokaza još se ne može dokazati proturječje.","contradictionFound":"Na ovoj grani može se dokazati proturječje.","branchTree":"Grane","branchHypothesisAuto":"Ovaj dopušten, ali nedokazan potez bilježi se kao hipoteza u istraživačkoj grani.","branchKept":"Grana zadržana","branchReturned":"Povratak na točku grananja","branchStart":"Početak"});
Object.assign(I18N.cs,{"exploration":"Průzkum","explorationSub":"Testuj hypotézy bez ztráty předchozí cesty.","testHypothesis":"Otestovat hypotézu","explorationActive":"Průzkum aktivní","branchPoint":"Bod větvení","currentBranch":"Aktuální větev","keepBranch":"Ponechat tuto větev","returnBranchPoint":"Vrátit se do bodu větvení","closeExploration":"Zavřít průzkum","analyzeBranch":"Analyzovat větev","noContradiction":"Při současné hloubce důkazu zatím nelze prokázat rozpor.","contradictionFound":"Na této větvi lze prokázat rozpor.","branchTree":"Větve","branchHypothesisAuto":"Tento legální, ale neprokázaný tah je zaznamenán jako hypotéza v průzkumné větvi.","branchKept":"Větev ponechána","branchReturned":"Návrat do bodu větvení","branchStart":"Start"});
Object.assign(I18N.da,{"exploration":"Udforskning","explorationSub":"Test hypoteser uden at miste din tidligere vej.","testHypothesis":"Test en hypotese","explorationActive":"Udforskning aktiv","branchPoint":"Forgreningspunkt","currentBranch":"Aktuel gren","keepBranch":"Behold denne gren","returnBranchPoint":"Tilbage til forgreningspunkt","closeExploration":"Luk udforskning","analyzeBranch":"Analyser gren","noContradiction":"Der kan endnu ikke påvises en modstrid med den aktuelle bevisdybde.","contradictionFound":"Der kan påvises en modstrid på denne gren.","branchTree":"Grene","branchHypothesisAuto":"Dette lovlige, men ikke beviste træk gemmes som en hypotese i udforskningsgrenen.","branchKept":"Gren beholdt","branchReturned":"Tilbage til forgreningspunkt","branchStart":"Start"});
Object.assign(I18N.et,{"exploration":"Uurimine","explorationSub":"Katseta hüpoteese ilma varasemat teed kaotamata.","testHypothesis":"Katseta hüpoteesi","explorationActive":"Uurimine aktiivne","branchPoint":"Hargnemispunkt","currentBranch":"Praegune haru","keepBranch":"Säilita see haru","returnBranchPoint":"Tagasi hargnemispunkti","closeExploration":"Sulge uurimine","analyzeBranch":"Analüüsi haru","noContradiction":"Praeguse tõestussügavusega pole veel vastuolu tõestatav.","contradictionFound":"Selles harus on vastuolu tõestatav.","branchTree":"Harud","branchHypothesisAuto":"See lubatud, kuid tõestamata käik salvestatakse uurimisharus hüpoteesina.","branchKept":"Haru säilitatud","branchReturned":"Tagasi hargnemispunktis","branchStart":"Algus"});
Object.assign(I18N.fi,{"exploration":"Tutkiminen","explorationSub":"Testaa hypoteeseja menettämättä aiempaa polkua.","testHypothesis":"Testaa hypoteesia","explorationActive":"Tutkiminen aktiivinen","branchPoint":"Haarautumispiste","currentBranch":"Nykyinen haara","keepBranch":"Säilytä tämä haara","returnBranchPoint":"Palaa haarautumispisteeseen","closeExploration":"Sulje tutkiminen","analyzeBranch":"Analysoi haara","noContradiction":"Nykyisellä todistussyvyydellä ristiriitaa ei vielä voida osoittaa.","contradictionFound":"Tällä haaralla voidaan osoittaa ristiriita.","branchTree":"Haarat","branchHypothesisAuto":"Tämä sallittu mutta todistamaton siirto tallennetaan hypoteesina tutkimushaaraan.","branchKept":"Haara säilytetty","branchReturned":"Palattu haarautumispisteeseen","branchStart":"Alku"});
Object.assign(I18N.el,{"exploration":"Εξερεύνηση","explorationSub":"Δοκίμασε υποθέσεις χωρίς να χάσεις την προηγούμενη διαδρομή.","testHypothesis":"Δοκίμασε υπόθεση","explorationActive":"Η εξερεύνηση είναι ενεργή","branchPoint":"Σημείο διακλάδωσης","currentBranch":"Τρέχων κλάδος","keepBranch":"Διατήρησε αυτόν τον κλάδο","returnBranchPoint":"Επιστροφή στο σημείο διακλάδωσης","closeExploration":"Κλείσιμο εξερεύνησης","analyzeBranch":"Ανάλυση κλάδου","noContradiction":"Με το τρέχον βάθος απόδειξης δεν αποδεικνύεται ακόμη αντίφαση.","contradictionFound":"Σε αυτόν τον κλάδο αποδεικνύεται αντίφαση.","branchTree":"Κλάδοι","branchHypothesisAuto":"Αυτή η νόμιμη αλλά μη αποδεδειγμένη κίνηση καταγράφεται ως υπόθεση στον κλάδο εξερεύνησης.","branchKept":"Ο κλάδος διατηρήθηκε","branchReturned":"Επιστροφή στο σημείο διακλάδωσης","branchStart":"Έναρξη"});
Object.assign(I18N.hu,{"exploration":"Felfedezés","explorationSub":"Tesztelj hipotéziseket a korábbi út elvesztése nélkül.","testHypothesis":"Hipotézis tesztelése","explorationActive":"Felfedezés aktív","branchPoint":"Elágazási pont","currentBranch":"Aktuális ág","keepBranch":"Tartsd meg ezt az ágat","returnBranchPoint":"Vissza az elágazási ponthoz","closeExploration":"Felfedezés bezárása","analyzeBranch":"Ág elemzése","noContradiction":"A jelenlegi bizonyítási mélységnél még nem igazolható ellentmondás.","contradictionFound":"Ezen az ágon ellentmondás igazolható.","branchTree":"Ágak","branchHypothesisAuto":"Ez a szabályos, de nem bizonyított lépés hipotézisként kerül az explorációs ágba.","branchKept":"Ág megtartva","branchReturned":"Visszatérés az elágazási ponthoz","branchStart":"Kezdés"});
Object.assign(I18N.ga,{"exploration":"Taiscéalaíocht","explorationSub":"Tástáil hipitéisí gan an cosán roimhe seo a chailleadh.","testHypothesis":"Tástáil hipitéis","explorationActive":"Taiscéalaíocht gníomhach","branchPoint":"Pointe brainse","currentBranch":"Brainse reatha","keepBranch":"Coinnigh an brainse seo","returnBranchPoint":"Fill ar phointe an bhrainse","closeExploration":"Dún an taiscéalaíocht","analyzeBranch":"Déan anailís ar an mbrainse","noContradiction":"Níl contrárthacht inchruthaithe fós ag an doimhneacht cruthúnais reatha.","contradictionFound":"Tá contrárthacht inchruthaithe ar an mbrainse seo.","branchTree":"Brainsí","branchHypothesisAuto":"Taifeadtar an bogadh dleathach ach neamhchruthaithe seo mar hipitéis sa bhrainse taiscéalaíochta.","branchKept":"Brainse coinnithe","branchReturned":"Fillte ar phointe an bhrainse","branchStart":"Tús"});
Object.assign(I18N.lv,{"exploration":"Izpēte","explorationSub":"Pārbaudi hipotēzes, nezaudējot iepriekšējo ceļu.","testHypothesis":"Pārbaudīt hipotēzi","explorationActive":"Izpēte aktīva","branchPoint":"Atzarošanās punkts","currentBranch":"Pašreizējais zars","keepBranch":"Saglabāt šo zaru","returnBranchPoint":"Atgriezties atzarošanās punktā","closeExploration":"Aizvērt izpēti","analyzeBranch":"Analizēt zaru","noContradiction":"Pie pašreizējā pierādījuma dziļuma pretruna vēl nav pierādāma.","contradictionFound":"Šajā zarā ir pierādāma pretruna.","branchTree":"Zari","branchHypothesisAuto":"Šis atļautais, bet nepierādītais gājiens tiek ierakstīts kā hipotēze izpētes zarā.","branchKept":"Zars saglabāts","branchReturned":"Atgriezts atzarošanās punktā","branchStart":"Sākums"});
Object.assign(I18N.lt,{"exploration":"Tyrinėjimas","explorationSub":"Tikrink hipotezes neprarasdamas ankstesnio kelio.","testHypothesis":"Tikrinti hipotezę","explorationActive":"Tyrinėjimas aktyvus","branchPoint":"Šakos taškas","currentBranch":"Dabartinė šaka","keepBranch":"Išsaugoti šią šaką","returnBranchPoint":"Grįžti į šakos tašką","closeExploration":"Uždaryti tyrinėjimą","analyzeBranch":"Analizuoti šaką","noContradiction":"Esamu įrodymo gyliu prieštaravimas dar neįrodomas.","contradictionFound":"Šioje šakoje galima įrodyti prieštaravimą.","branchTree":"Šakos","branchHypothesisAuto":"Šis leistinas, bet neįrodytas ėjimas įrašomas kaip hipotezė tyrinėjimo šakoje.","branchKept":"Šaka išsaugota","branchReturned":"Grįžta į šakos tašką","branchStart":"Pradžia"});
Object.assign(I18N.mt,{"exploration":"Esplorazzjoni","explorationSub":"Ittestja ipoteżijiet mingħajr ma titlef il-passaġġ ta’ qabel.","testHypothesis":"Ittestja ipoteżi","explorationActive":"Esplorazzjoni attiva","branchPoint":"Punt tal-fergħa","currentBranch":"Fergħa attwali","keepBranch":"Żomm din il-fergħa","returnBranchPoint":"Erġa’ lura għall-punt tal-fergħa","closeExploration":"Agħlaq l-esplorazzjoni","analyzeBranch":"Analizza l-fergħa","noContradiction":"Għadu ma jistax jintwera kuntradizzjoni fil-fond attwali tal-prova.","contradictionFound":"Tista’ tintwera kuntradizzjoni f’din il-fergħa.","branchTree":"Fergħat","branchHypothesisAuto":"Din il-mossa legali iżda mhux ippruvata tiġi rreġistrata bħala ipoteżi fil-fergħa tal-esplorazzjoni.","branchKept":"Fergħa miżmuma","branchReturned":"Ritorn għall-punt tal-fergħa","branchStart":"Bidu"});
Object.assign(I18N.pl,{"exploration":"Eksploracja","explorationSub":"Testuj hipotezy bez utraty poprzedniej ścieżki.","testHypothesis":"Testuj hipotezę","explorationActive":"Eksploracja aktywna","branchPoint":"Punkt rozgałęzienia","currentBranch":"Bieżąca gałąź","keepBranch":"Zachowaj tę gałąź","returnBranchPoint":"Wróć do punktu rozgałęzienia","closeExploration":"Zamknij eksplorację","analyzeBranch":"Analizuj gałąź","noContradiction":"Przy obecnej głębokości dowodu nie można jeszcze wykazać sprzeczności.","contradictionFound":"Na tej gałęzi można wykazać sprzeczność.","branchTree":"Gałęzie","branchHypothesisAuto":"Ten legalny, ale nieudowodniony ruch jest zapisywany jako hipoteza w gałęzi eksploracji.","branchKept":"Gałąź zachowana","branchReturned":"Powrót do punktu rozgałęzienia","branchStart":"Start"});
Object.assign(I18N.ro,{"exploration":"Explorare","explorationSub":"Testează ipoteze fără să pierzi traseul anterior.","testHypothesis":"Testează o ipoteză","explorationActive":"Explorare activă","branchPoint":"Punct de ramificare","currentBranch":"Ramura curentă","keepBranch":"Păstrează această ramură","returnBranchPoint":"Revino la punctul de ramificare","closeExploration":"Închide explorarea","analyzeBranch":"Analizează ramura","noContradiction":"La adâncimea actuală a demonstrației nu se poate demonstra încă o contradicție.","contradictionFound":"Pe această ramură se poate demonstra o contradicție.","branchTree":"Ramuri","branchHypothesisAuto":"Această mutare legală, dar nedemonstrată este înregistrată ca ipoteză în ramura de explorare.","branchKept":"Ramură păstrată","branchReturned":"Revenire la punctul de ramificare","branchStart":"Start"});
Object.assign(I18N.sk,{"exploration":"Prieskum","explorationSub":"Testuj hypotézy bez straty predchádzajúcej cesty.","testHypothesis":"Otestovať hypotézu","explorationActive":"Prieskum aktívny","branchPoint":"Bod vetvenia","currentBranch":"Aktuálna vetva","keepBranch":"Ponechať túto vetvu","returnBranchPoint":"Vrátiť sa do bodu vetvenia","closeExploration":"Zavrieť prieskum","analyzeBranch":"Analyzovať vetvu","noContradiction":"Pri aktuálnej hĺbke dôkazu zatiaľ nemožno preukázať rozpor.","contradictionFound":"Na tejto vetve možno preukázať rozpor.","branchTree":"Vetvy","branchHypothesisAuto":"Tento legálny, ale nedokázaný ťah sa zaznamená ako hypotéza v prieskumnej vetve.","branchKept":"Vetva ponechaná","branchReturned":"Návrat do bodu vetvenia","branchStart":"Štart"});
Object.assign(I18N.sl,{"exploration":"Raziskovanje","explorationSub":"Preizkušaj hipoteze, ne da bi izgubil prejšnjo pot.","testHypothesis":"Preizkusi hipotezo","explorationActive":"Raziskovanje aktivno","branchPoint":"Točka razvejitve","currentBranch":"Trenutna veja","keepBranch":"Ohrani to vejo","returnBranchPoint":"Vrni se na točko razvejitve","closeExploration":"Zapri raziskovanje","analyzeBranch":"Analiziraj vejo","noContradiction":"Pri trenutni globini dokaza še ni mogoče dokazati protislovja.","contradictionFound":"Na tej veji je mogoče dokazati protislovje.","branchTree":"Veje","branchHypothesisAuto":"Ta dovoljena, vendar nedokazana poteza se zabeleži kot hipoteza v raziskovalni veji.","branchKept":"Veja ohranjena","branchReturned":"Vrnitev na točko razvejitve","branchStart":"Začetek"});
Object.assign(I18N.sv,{"exploration":"Utforskning","explorationSub":"Testa hypoteser utan att förlora den tidigare vägen.","testHypothesis":"Testa en hypotes","explorationActive":"Utforskning aktiv","branchPoint":"Förgreningspunkt","currentBranch":"Aktuell gren","keepBranch":"Behåll denna gren","returnBranchPoint":"Tillbaka till förgreningspunkten","closeExploration":"Stäng utforskning","analyzeBranch":"Analysera gren","noContradiction":"Ingen motsägelse kan ännu bevisas med nuvarande bevisdjup.","contradictionFound":"En motsägelse kan bevisas på denna gren.","branchTree":"Grenar","branchHypothesisAuto":"Detta lagliga men obevisade drag registreras som en hypotes i utforskningsgrenen.","branchKept":"Gren behållen","branchReturned":"Tillbaka vid förgreningspunkten","branchStart":"Start"});

/* v2.21.0 — shareable friend challenges */
Object.assign(I18N.en,{"challenge":"Friend challenge","challengeSub":"Create or join the exact same logic puzzle with a short code.","createChallenge":"Create a challenge","joinChallenge":"Join a challenge","challengeCode":"Challenge code","generateChallenge":"Generate code","playChallenge":"Play this challenge","shareChallenge":"Share challenge","copyCode":"Copy code","codeCopied":"Code copied","enterChallengeCode":"Enter a challenge code","invalidChallengeCode":"Invalid or unsupported challenge code","challengeReady":"Challenge ready","challengeSamePuzzle":"The same code always recreates the same puzzle with this challenge generator.","challengeNoAccount":"No account or server is required.","challengeFromLink":"Challenge received from a shared link","challengeGenerator":"Generator","challengeResult":"Challenge result"});
Object.assign(I18N.fr,{"challenge":"Défi entre amis","challengeSub":"Crée ou rejoins exactement la même grille logique avec un code court.","createChallenge":"Créer un défi","joinChallenge":"Rejoindre un défi","challengeCode":"Code du défi","generateChallenge":"Générer le code","playChallenge":"Jouer ce défi","shareChallenge":"Partager le défi","copyCode":"Copier le code","codeCopied":"Code copié","enterChallengeCode":"Saisis un code de défi","invalidChallengeCode":"Code de défi invalide ou non pris en charge","challengeReady":"Défi prêt","challengeSamePuzzle":"Le même code recrée toujours la même grille avec ce générateur de défi.","challengeNoAccount":"Aucun compte ni serveur n’est nécessaire.","challengeFromLink":"Défi reçu depuis un lien partagé","challengeGenerator":"Générateur","challengeResult":"Résultat du défi"});
Object.assign(I18N.es,{"challenge":"Desafío entre amigos","challengeSub":"Crea o únete exactamente al mismo rompecabezas lógico con un código corto.","createChallenge":"Crear desafío","joinChallenge":"Unirse a un desafío","challengeCode":"Código del desafío","generateChallenge":"Generar código","playChallenge":"Jugar este desafío","shareChallenge":"Compartir desafío","copyCode":"Copiar código","codeCopied":"Código copiado","enterChallengeCode":"Introduce un código de desafío","invalidChallengeCode":"Código inválido o no compatible","challengeReady":"Desafío listo","challengeSamePuzzle":"El mismo código recrea siempre el mismo rompecabezas con este generador.","challengeNoAccount":"No se necesita cuenta ni servidor.","challengeFromLink":"Desafío recibido desde un enlace compartido","challengeGenerator":"Generador","challengeResult":"Resultado del desafío"});
Object.assign(I18N.pt,{"challenge":"Desafio entre amigos","challengeSub":"Cria ou entra exatamente no mesmo puzzle lógico com um código curto.","createChallenge":"Criar desafio","joinChallenge":"Entrar num desafio","challengeCode":"Código do desafio","generateChallenge":"Gerar código","playChallenge":"Jogar este desafio","shareChallenge":"Partilhar desafio","copyCode":"Copiar código","codeCopied":"Código copiado","enterChallengeCode":"Introduz um código de desafio","invalidChallengeCode":"Código inválido ou não suportado","challengeReady":"Desafio pronto","challengeSamePuzzle":"O mesmo código recria sempre o mesmo puzzle com este gerador.","challengeNoAccount":"Não é necessária conta nem servidor.","challengeFromLink":"Desafio recebido por uma ligação partilhada","challengeGenerator":"Gerador","challengeResult":"Resultado do desafio"});
Object.assign(I18N.it,{"challenge":"Sfida tra amici","challengeSub":"Crea o apri esattamente lo stesso puzzle logico con un codice breve.","createChallenge":"Crea sfida","joinChallenge":"Partecipa a una sfida","challengeCode":"Codice sfida","generateChallenge":"Genera codice","playChallenge":"Gioca questa sfida","shareChallenge":"Condividi sfida","copyCode":"Copia codice","codeCopied":"Codice copiato","enterChallengeCode":"Inserisci un codice sfida","invalidChallengeCode":"Codice non valido o non supportato","challengeReady":"Sfida pronta","challengeSamePuzzle":"Lo stesso codice ricrea sempre lo stesso puzzle con questo generatore.","challengeNoAccount":"Non servono account né server.","challengeFromLink":"Sfida ricevuta da un link condiviso","challengeGenerator":"Generatore","challengeResult":"Risultato della sfida"});
Object.assign(I18N.de,{"challenge":"Freundes-Challenge","challengeSub":"Erstelle oder öffne mit einem kurzen Code exakt dasselbe Logikrätsel.","createChallenge":"Challenge erstellen","joinChallenge":"Challenge beitreten","challengeCode":"Challenge-Code","generateChallenge":"Code erzeugen","playChallenge":"Diese Challenge spielen","shareChallenge":"Challenge teilen","copyCode":"Code kopieren","codeCopied":"Code kopiert","enterChallengeCode":"Challenge-Code eingeben","invalidChallengeCode":"Ungültiger oder nicht unterstützter Code","challengeReady":"Challenge bereit","challengeSamePuzzle":"Mit diesem Generator erzeugt derselbe Code immer dasselbe Rätsel.","challengeNoAccount":"Kein Konto und kein Server erforderlich.","challengeFromLink":"Challenge aus einem geteilten Link","challengeGenerator":"Generator","challengeResult":"Challenge-Ergebnis"});
Object.assign(I18N.nl,{"challenge":"Vriendenuitdaging","challengeSub":"Maak of open exact dezelfde logische puzzel met een korte code.","createChallenge":"Uitdaging maken","joinChallenge":"Meedoen aan uitdaging","challengeCode":"Uitdagingscode","generateChallenge":"Code genereren","playChallenge":"Speel deze uitdaging","shareChallenge":"Uitdaging delen","copyCode":"Code kopiëren","codeCopied":"Code gekopieerd","enterChallengeCode":"Voer een uitdagingscode in","invalidChallengeCode":"Ongeldige of niet-ondersteunde code","challengeReady":"Uitdaging klaar","challengeSamePuzzle":"Dezelfde code maakt met deze generator altijd dezelfde puzzel.","challengeNoAccount":"Geen account of server nodig.","challengeFromLink":"Uitdaging ontvangen via gedeelde link","challengeGenerator":"Generator","challengeResult":"Uitdagingsresultaat"});
Object.assign(I18N.zh,{"challenge":"好友挑战","challengeSub":"用短代码创建或加入完全相同的逻辑题。","createChallenge":"创建挑战","joinChallenge":"加入挑战","challengeCode":"挑战代码","generateChallenge":"生成代码","playChallenge":"开始此挑战","shareChallenge":"分享挑战","copyCode":"复制代码","codeCopied":"代码已复制","enterChallengeCode":"输入挑战代码","invalidChallengeCode":"挑战代码无效或不受支持","challengeReady":"挑战已准备","challengeSamePuzzle":"使用此挑战生成器时，相同代码始终重建相同题目。","challengeNoAccount":"无需账户或服务器。","challengeFromLink":"从共享链接收到的挑战","challengeGenerator":"生成器","challengeResult":"挑战结果"});
Object.assign(I18N.hi,{"challenge":"मित्र चुनौती","challengeSub":"एक छोटे कोड से बिल्कुल वही लॉजिक पहेली बनाएँ या खोलें।","createChallenge":"चुनौती बनाएँ","joinChallenge":"चुनौती में शामिल हों","challengeCode":"चुनौती कोड","generateChallenge":"कोड बनाएँ","playChallenge":"यह चुनौती खेलें","shareChallenge":"चुनौती साझा करें","copyCode":"कोड कॉपी करें","codeCopied":"कोड कॉपी हुआ","enterChallengeCode":"चुनौती कोड दर्ज करें","invalidChallengeCode":"अमान्य या असमर्थित चुनौती कोड","challengeReady":"चुनौती तैयार","challengeSamePuzzle":"इस जनरेटर में वही कोड हमेशा वही पहेली बनाता है।","challengeNoAccount":"किसी खाते या सर्वर की आवश्यकता नहीं।","challengeFromLink":"साझा लिंक से मिली चुनौती","challengeGenerator":"जनरेटर","challengeResult":"चुनौती परिणाम"});
Object.assign(I18N.ar,{"challenge":"تحدي الأصدقاء","challengeSub":"أنشئ أو افتح لغز المنطق نفسه تمامًا باستخدام رمز قصير.","createChallenge":"إنشاء تحدٍ","joinChallenge":"الانضمام إلى تحدٍ","challengeCode":"رمز التحدي","generateChallenge":"إنشاء الرمز","playChallenge":"العب هذا التحدي","shareChallenge":"مشاركة التحدي","copyCode":"نسخ الرمز","codeCopied":"تم نسخ الرمز","enterChallengeCode":"أدخل رمز تحدٍ","invalidChallengeCode":"رمز تحدٍ غير صالح أو غير مدعوم","challengeReady":"التحدي جاهز","challengeSamePuzzle":"يعيد الرمز نفسه إنشاء اللغز نفسه دائمًا مع هذا المولّد.","challengeNoAccount":"لا يلزم حساب أو خادم.","challengeFromLink":"تحدٍ وارد من رابط مشترك","challengeGenerator":"المولّد","challengeResult":"نتيجة التحدي"});
Object.assign(I18N.bn,{"challenge":"বন্ধু চ্যালেঞ্জ","challengeSub":"একটি ছোট কোড দিয়ে ঠিক একই যুক্তির ধাঁধা তৈরি বা খুলুন।","createChallenge":"চ্যালেঞ্জ তৈরি করুন","joinChallenge":"চ্যালেঞ্জে যোগ দিন","challengeCode":"চ্যালেঞ্জ কোড","generateChallenge":"কোড তৈরি করুন","playChallenge":"এই চ্যালেঞ্জ খেলুন","shareChallenge":"চ্যালেঞ্জ শেয়ার করুন","copyCode":"কোড কপি করুন","codeCopied":"কোড কপি হয়েছে","enterChallengeCode":"চ্যালেঞ্জ কোড লিখুন","invalidChallengeCode":"অবৈধ বা অসমর্থিত চ্যালেঞ্জ কোড","challengeReady":"চ্যালেঞ্জ প্রস্তুত","challengeSamePuzzle":"এই জেনারেটরে একই কোড সবসময় একই ধাঁধা তৈরি করে।","challengeNoAccount":"কোনো অ্যাকাউন্ট বা সার্ভার দরকার নেই।","challengeFromLink":"শেয়ার করা লিঙ্ক থেকে পাওয়া চ্যালেঞ্জ","challengeGenerator":"জেনারেটর","challengeResult":"চ্যালেঞ্জ ফলাফল"});
Object.assign(I18N.id,{"challenge":"Tantangan teman","challengeSub":"Buat atau buka teka-teki logika yang persis sama dengan kode singkat.","createChallenge":"Buat tantangan","joinChallenge":"Ikuti tantangan","challengeCode":"Kode tantangan","generateChallenge":"Buat kode","playChallenge":"Mainkan tantangan ini","shareChallenge":"Bagikan tantangan","copyCode":"Salin kode","codeCopied":"Kode disalin","enterChallengeCode":"Masukkan kode tantangan","invalidChallengeCode":"Kode tantangan tidak valid atau tidak didukung","challengeReady":"Tantangan siap","challengeSamePuzzle":"Kode yang sama selalu membuat teka-teki yang sama dengan generator ini.","challengeNoAccount":"Tidak perlu akun atau server.","challengeFromLink":"Tantangan dari tautan yang dibagikan","challengeGenerator":"Generator","challengeResult":"Hasil tantangan"});
Object.assign(I18N.ur,{"challenge":"دوستوں کا چیلنج","challengeSub":"مختصر کوڈ سے بالکل وہی منطقی پہیلی بنائیں یا کھولیں۔","createChallenge":"چیلنج بنائیں","joinChallenge":"چیلنج میں شامل ہوں","challengeCode":"چیلنج کوڈ","generateChallenge":"کوڈ بنائیں","playChallenge":"یہ چیلنج کھیلیں","shareChallenge":"چیلنج شیئر کریں","copyCode":"کوڈ کاپی کریں","codeCopied":"کوڈ کاپی ہوگیا","enterChallengeCode":"چیلنج کوڈ درج کریں","invalidChallengeCode":"غلط یا غیر معاون چیلنج کوڈ","challengeReady":"چیلنج تیار","challengeSamePuzzle":"اس جنریٹر کے ساتھ ایک ہی کوڈ ہمیشہ ایک ہی پہیلی بناتا ہے۔","challengeNoAccount":"کسی اکاؤنٹ یا سرور کی ضرورت نہیں۔","challengeFromLink":"مشترکہ لنک سے موصول چیلنج","challengeGenerator":"جنریٹر","challengeResult":"چیلنج نتیجہ"});
Object.assign(I18N.bg,{"challenge":"Предизвикателство с приятели","challengeSub":"Създай или отвори точно същия логически пъзел с кратък код.","createChallenge":"Създай предизвикателство","joinChallenge":"Присъедини се","challengeCode":"Код на предизвикателството","generateChallenge":"Генерирай код","playChallenge":"Играй това предизвикателство","shareChallenge":"Сподели предизвикателството","copyCode":"Копирай кода","codeCopied":"Кодът е копиран","enterChallengeCode":"Въведи код","invalidChallengeCode":"Невалиден или неподдържан код","challengeReady":"Предизвикателството е готово","challengeSamePuzzle":"Същият код винаги пресъздава същия пъзел с този генератор.","challengeNoAccount":"Не са нужни акаунт или сървър.","challengeFromLink":"Предизвикателство от споделен линк","challengeGenerator":"Генератор","challengeResult":"Резултат от предизвикателството"});
Object.assign(I18N.hr,{"challenge":"Izazov s prijateljima","challengeSub":"Izradi ili otvori potpuno istu logičku zagonetku kratkim kodom.","createChallenge":"Izradi izazov","joinChallenge":"Pridruži se izazovu","challengeCode":"Kod izazova","generateChallenge":"Generiraj kod","playChallenge":"Igraj ovaj izazov","shareChallenge":"Podijeli izazov","copyCode":"Kopiraj kod","codeCopied":"Kod kopiran","enterChallengeCode":"Unesi kod izazova","invalidChallengeCode":"Nevažeći ili nepodržani kod","challengeReady":"Izazov spreman","challengeSamePuzzle":"Isti kod uvijek stvara istu zagonetku s ovim generatorom.","challengeNoAccount":"Nisu potrebni račun ni poslužitelj.","challengeFromLink":"Izazov primljen putem dijeljene poveznice","challengeGenerator":"Generator","challengeResult":"Rezultat izazova"});
Object.assign(I18N.cs,{"challenge":"Výzva s přáteli","challengeSub":"Vytvoř nebo otevři přesně stejný logický hlavolam pomocí krátkého kódu.","createChallenge":"Vytvořit výzvu","joinChallenge":"Připojit se k výzvě","challengeCode":"Kód výzvy","generateChallenge":"Vygenerovat kód","playChallenge":"Hrát tuto výzvu","shareChallenge":"Sdílet výzvu","copyCode":"Kopírovat kód","codeCopied":"Kód zkopírován","enterChallengeCode":"Zadej kód výzvy","invalidChallengeCode":"Neplatný nebo nepodporovaný kód","challengeReady":"Výzva připravena","challengeSamePuzzle":"Stejný kód s tímto generátorem vždy vytvoří stejný hlavolam.","challengeNoAccount":"Není potřeba účet ani server.","challengeFromLink":"Výzva přijatá ze sdíleného odkazu","challengeGenerator":"Generátor","challengeResult":"Výsledek výzvy"});
Object.assign(I18N.da,{"challenge":"Venneudfordring","challengeSub":"Opret eller åbn præcis det samme logikpuslespil med en kort kode.","createChallenge":"Opret udfordring","joinChallenge":"Deltag i udfordring","challengeCode":"Udfordringskode","generateChallenge":"Generer kode","playChallenge":"Spil denne udfordring","shareChallenge":"Del udfordring","copyCode":"Kopiér kode","codeCopied":"Kode kopieret","enterChallengeCode":"Indtast udfordringskode","invalidChallengeCode":"Ugyldig eller ikke understøttet kode","challengeReady":"Udfordring klar","challengeSamePuzzle":"Den samme kode genskaber altid det samme puslespil med denne generator.","challengeNoAccount":"Ingen konto eller server er nødvendig.","challengeFromLink":"Udfordring fra et delt link","challengeGenerator":"Generator","challengeResult":"Udfordringsresultat"});
Object.assign(I18N.et,{"challenge":"Sõbraväljakutse","challengeSub":"Loo või ava lühikese koodiga täpselt sama loogikamõistatus.","createChallenge":"Loo väljakutse","joinChallenge":"Liitu väljakutsega","challengeCode":"Väljakutse kood","generateChallenge":"Loo kood","playChallenge":"Mängi seda väljakutset","shareChallenge":"Jaga väljakutset","copyCode":"Kopeeri kood","codeCopied":"Kood kopeeritud","enterChallengeCode":"Sisesta väljakutse kood","invalidChallengeCode":"Vigane või toetamata kood","challengeReady":"Väljakutse valmis","challengeSamePuzzle":"Sama kood loob selle generaatoriga alati sama mõistatuse.","challengeNoAccount":"Kontot ega serverit pole vaja.","challengeFromLink":"Jagatud lingilt saadud väljakutse","challengeGenerator":"Generaator","challengeResult":"Väljakutse tulemus"});
Object.assign(I18N.fi,{"challenge":"Kaverihaaste","challengeSub":"Luo tai avaa täsmälleen sama logiikkapulma lyhyellä koodilla.","createChallenge":"Luo haaste","joinChallenge":"Liity haasteeseen","challengeCode":"Haastekoodi","generateChallenge":"Luo koodi","playChallenge":"Pelaa tämä haaste","shareChallenge":"Jaa haaste","copyCode":"Kopioi koodi","codeCopied":"Koodi kopioitu","enterChallengeCode":"Syötä haastekoodi","invalidChallengeCode":"Virheellinen tai tukematon koodi","challengeReady":"Haaste valmis","challengeSamePuzzle":"Sama koodi luo tällä generaattorilla aina saman pulman.","challengeNoAccount":"Tiliä tai palvelinta ei tarvita.","challengeFromLink":"Jaetusta linkistä saatu haaste","challengeGenerator":"Generaattori","challengeResult":"Haasteen tulos"});
Object.assign(I18N.el,{"challenge":"Πρόκληση φίλων","challengeSub":"Δημιούργησε ή άνοιξε ακριβώς το ίδιο λογικό παζλ με έναν σύντομο κωδικό.","createChallenge":"Δημιουργία πρόκλησης","joinChallenge":"Συμμετοχή σε πρόκληση","challengeCode":"Κωδικός πρόκλησης","generateChallenge":"Δημιουργία κωδικού","playChallenge":"Παίξε αυτή την πρόκληση","shareChallenge":"Κοινοποίηση πρόκλησης","copyCode":"Αντιγραφή κωδικού","codeCopied":"Ο κωδικός αντιγράφηκε","enterChallengeCode":"Εισαγωγή κωδικού πρόκλησης","invalidChallengeCode":"Μη έγκυρος ή μη υποστηριζόμενος κωδικός","challengeReady":"Η πρόκληση είναι έτοιμη","challengeSamePuzzle":"Ο ίδιος κωδικός αναδημιουργεί πάντα το ίδιο παζλ με αυτή τη γεννήτρια.","challengeNoAccount":"Δεν απαιτείται λογαριασμός ή διακομιστής.","challengeFromLink":"Πρόκληση από κοινόχρηστο σύνδεσμο","challengeGenerator":"Γεννήτρια","challengeResult":"Αποτέλεσμα πρόκλησης"});
Object.assign(I18N.hu,{"challenge":"Baráti kihívás","challengeSub":"Hozd létre vagy nyisd meg pontosan ugyanazt a logikai feladványt egy rövid kóddal.","createChallenge":"Kihívás létrehozása","joinChallenge":"Csatlakozás kihíváshoz","challengeCode":"Kihíváskód","generateChallenge":"Kód létrehozása","playChallenge":"Kihívás indítása","shareChallenge":"Kihívás megosztása","copyCode":"Kód másolása","codeCopied":"Kód másolva","enterChallengeCode":"Add meg a kihíváskódot","invalidChallengeCode":"Érvénytelen vagy nem támogatott kód","challengeReady":"Kihívás kész","challengeSamePuzzle":"Ugyanaz a kód ezzel a generátorral mindig ugyanazt a feladványt hozza létre.","challengeNoAccount":"Nincs szükség fiókra vagy szerverre.","challengeFromLink":"Megosztott linkről érkezett kihívás","challengeGenerator":"Generátor","challengeResult":"Kihívás eredménye"});
Object.assign(I18N.ga,{"challenge":"Dúshlán cairde","challengeSub":"Cruthaigh nó oscail an puzal loighce céanna go díreach le cód gearr.","createChallenge":"Cruthaigh dúshlán","joinChallenge":"Glac páirt i ndúshlán","challengeCode":"Cód dúshláin","generateChallenge":"Gin cód","playChallenge":"Imir an dúshlán seo","shareChallenge":"Roinn an dúshlán","copyCode":"Cóipeáil an cód","codeCopied":"Cóipeáladh an cód","enterChallengeCode":"Cuir cód dúshláin isteach","invalidChallengeCode":"Cód neamhbhailí nó gan tacaíocht","challengeReady":"Dúshlán réidh","challengeSamePuzzle":"Cruthaíonn an cód céanna an puzal céanna i gcónaí leis an ngineadóir seo.","challengeNoAccount":"Ní gá cuntas ná freastalaí.","challengeFromLink":"Dúshlán ó nasc roinnte","challengeGenerator":"Gineadóir","challengeResult":"Toradh an dúshláin"});
Object.assign(I18N.lv,{"challenge":"Draugu izaicinājums","challengeSub":"Izveido vai atver tieši to pašu loģikas mīklu ar īsu kodu.","createChallenge":"Izveidot izaicinājumu","joinChallenge":"Pievienoties izaicinājumam","challengeCode":"Izaicinājuma kods","generateChallenge":"Ģenerēt kodu","playChallenge":"Spēlēt šo izaicinājumu","shareChallenge":"Kopīgot izaicinājumu","copyCode":"Kopēt kodu","codeCopied":"Kods nokopēts","enterChallengeCode":"Ievadi izaicinājuma kodu","invalidChallengeCode":"Nederīgs vai neatbalstīts kods","challengeReady":"Izaicinājums gatavs","challengeSamePuzzle":"Tas pats kods ar šo ģeneratoru vienmēr izveido to pašu mīklu.","challengeNoAccount":"Nav vajadzīgs konts vai serveris.","challengeFromLink":"Izaicinājums no kopīgotas saites","challengeGenerator":"Ģenerators","challengeResult":"Izaicinājuma rezultāts"});
Object.assign(I18N.lt,{"challenge":"Draugų iššūkis","challengeSub":"Sukurk arba atverk lygiai tą patį loginį galvosūkį trumpu kodu.","createChallenge":"Sukurti iššūkį","joinChallenge":"Prisijungti prie iššūkio","challengeCode":"Iššūkio kodas","generateChallenge":"Generuoti kodą","playChallenge":"Žaisti šį iššūkį","shareChallenge":"Dalintis iššūkiu","copyCode":"Kopijuoti kodą","codeCopied":"Kodas nukopijuotas","enterChallengeCode":"Įvesk iššūkio kodą","invalidChallengeCode":"Netinkamas arba nepalaikomas kodas","challengeReady":"Iššūkis paruoštas","challengeSamePuzzle":"Tas pats kodas su šiuo generatoriumi visada atkuria tą patį galvosūkį.","challengeNoAccount":"Nereikia paskyros ar serverio.","challengeFromLink":"Iššūkis iš bendrinamos nuorodos","challengeGenerator":"Generatorius","challengeResult":"Iššūkio rezultatas"});
Object.assign(I18N.mt,{"challenge":"Sfida mal-ħbieb","challengeSub":"Oħloq jew iftaħ eżatt l-istess puzzle loġiku b’kodiċi qasir.","createChallenge":"Oħloq sfida","joinChallenge":"Ingħaqad ma’ sfida","challengeCode":"Kodiċi tas-sfida","generateChallenge":"Iġġenera kodiċi","playChallenge":"Ilgħab din l-isfida","shareChallenge":"Aqsam is-sfida","copyCode":"Ikkopja l-kodiċi","codeCopied":"Kodiċi kkupjat","enterChallengeCode":"Daħħal kodiċi tas-sfida","invalidChallengeCode":"Kodiċi invalidu jew mhux appoġġjat","challengeReady":"Sfida lesta","challengeSamePuzzle":"L-istess kodiċi dejjem joħloq l-istess puzzle b’dan il-ġeneratur.","challengeNoAccount":"Ma hemmx bżonn ta’ kont jew server.","challengeFromLink":"Sfida minn link maqsum","challengeGenerator":"Ġeneratur","challengeResult":"Riżultat tas-sfida"});
Object.assign(I18N.pl,{"challenge":"Wyzwanie ze znajomymi","challengeSub":"Utwórz lub otwórz dokładnie tę samą łamigłówkę logiczną za pomocą krótkiego kodu.","createChallenge":"Utwórz wyzwanie","joinChallenge":"Dołącz do wyzwania","challengeCode":"Kod wyzwania","generateChallenge":"Wygeneruj kod","playChallenge":"Zagraj w to wyzwanie","shareChallenge":"Udostępnij wyzwanie","copyCode":"Kopiuj kod","codeCopied":"Kod skopiowany","enterChallengeCode":"Wpisz kod wyzwania","invalidChallengeCode":"Nieprawidłowy lub nieobsługiwany kod","challengeReady":"Wyzwanie gotowe","challengeSamePuzzle":"Ten sam kod zawsze odtwarza tę samą łamigłówkę z tym generatorem.","challengeNoAccount":"Nie jest potrzebne konto ani serwer.","challengeFromLink":"Wyzwanie z udostępnionego linku","challengeGenerator":"Generator","challengeResult":"Wynik wyzwania"});
Object.assign(I18N.ro,{"challenge":"Provocare între prieteni","challengeSub":"Creează sau deschide exact același puzzle logic cu un cod scurt.","createChallenge":"Creează provocare","joinChallenge":"Intră într-o provocare","challengeCode":"Codul provocării","generateChallenge":"Generează cod","playChallenge":"Joacă această provocare","shareChallenge":"Distribuie provocarea","copyCode":"Copiază codul","codeCopied":"Cod copiat","enterChallengeCode":"Introdu un cod de provocare","invalidChallengeCode":"Cod invalid sau neacceptat","challengeReady":"Provocare pregătită","challengeSamePuzzle":"Același cod recreează mereu același puzzle cu acest generator.","challengeNoAccount":"Nu este necesar cont sau server.","challengeFromLink":"Provocare primită dintr-un link distribuit","challengeGenerator":"Generator","challengeResult":"Rezultatul provocării"});
Object.assign(I18N.sk,{"challenge":"Výzva s priateľmi","challengeSub":"Vytvor alebo otvor presne rovnakú logickú hádanku pomocou krátkeho kódu.","createChallenge":"Vytvoriť výzvu","joinChallenge":"Pripojiť sa k výzve","challengeCode":"Kód výzvy","generateChallenge":"Vygenerovať kód","playChallenge":"Hrať túto výzvu","shareChallenge":"Zdieľať výzvu","copyCode":"Kopírovať kód","codeCopied":"Kód skopírovaný","enterChallengeCode":"Zadaj kód výzvy","invalidChallengeCode":"Neplatný alebo nepodporovaný kód","challengeReady":"Výzva pripravená","challengeSamePuzzle":"Rovnaký kód s týmto generátorom vždy vytvorí rovnakú hádanku.","challengeNoAccount":"Nie je potrebný účet ani server.","challengeFromLink":"Výzva zo zdieľaného odkazu","challengeGenerator":"Generátor","challengeResult":"Výsledok výzvy"});
Object.assign(I18N.sl,{"challenge":"Izziv s prijatelji","challengeSub":"Ustvari ali odpri popolnoma isto logično uganko s kratko kodo.","createChallenge":"Ustvari izziv","joinChallenge":"Pridruži se izzivu","challengeCode":"Koda izziva","generateChallenge":"Ustvari kodo","playChallenge":"Igraj ta izziv","shareChallenge":"Deli izziv","copyCode":"Kopiraj kodo","codeCopied":"Koda kopirana","enterChallengeCode":"Vnesi kodo izziva","invalidChallengeCode":"Neveljavna ali nepodprta koda","challengeReady":"Izziv pripravljen","challengeSamePuzzle":"Ista koda s tem generatorjem vedno ustvari isto uganko.","challengeNoAccount":"Račun ali strežnik nista potrebna.","challengeFromLink":"Izziv iz deljene povezave","challengeGenerator":"Generator","challengeResult":"Rezultat izziva"});
Object.assign(I18N.sv,{"challenge":"Vänutmaning","challengeSub":"Skapa eller öppna exakt samma logikpussel med en kort kod.","createChallenge":"Skapa utmaning","joinChallenge":"Gå med i utmaning","challengeCode":"Utmaningskod","generateChallenge":"Generera kod","playChallenge":"Spela denna utmaning","shareChallenge":"Dela utmaning","copyCode":"Kopiera kod","codeCopied":"Kod kopierad","enterChallengeCode":"Ange en utmaningskod","invalidChallengeCode":"Ogiltig eller ej stödd kod","challengeReady":"Utmaning klar","challengeSamePuzzle":"Samma kod återskapar alltid samma pussel med denna generator.","challengeNoAccount":"Inget konto eller server krävs.","challengeFromLink":"Utmaning från en delad länk","challengeGenerator":"Generator","challengeResult":"Utmaningsresultat"});

/* v2.21.1 — configurable move alerts */
Object.assign(I18N.en,{"illegalAlerts":"Forbidden-move alerts","illegalAlertsSub":"Automatically mark rule conflicts in red and show the error alert.","unjustifiedAlerts":"Unjustified-move alerts","unjustifiedAlertsSub":"Show a legal but unproved piece in orange, without opening a notification panel."});
Object.assign(I18N.fr,{"illegalAlerts":"Alertes de coups interdits","illegalAlertsSub":"Signaler automatiquement en rouge les conflits de règle et afficher l’alerte d’erreur.","unjustifiedAlerts":"Alertes de coups non justifiés","unjustifiedAlertsSub":"Afficher en orange une pièce légale mais non démontrée, sans ouvrir de panneau de notification."});
Object.assign(I18N.es,{"illegalAlerts":"Alertas de jugadas prohibidas","illegalAlertsSub":"Marcar automáticamente en rojo los conflictos de regla y mostrar la alerta de error.","unjustifiedAlerts":"Alertas de jugadas no justificadas","unjustifiedAlertsSub":"Mostrar en naranja una pieza legal pero no demostrada, sin abrir un panel de notificación."});
Object.assign(I18N.pt,{"illegalAlerts":"Alertas de jogadas proibidas","illegalAlertsSub":"Marcar automaticamente a vermelho os conflitos de regras e mostrar o alerta de erro.","unjustifiedAlerts":"Alertas de jogadas não justificadas","unjustifiedAlertsSub":"Mostrar a laranja uma peça legal mas não demonstrada, sem abrir um painel de notificação."});
Object.assign(I18N.it,{"illegalAlerts":"Avvisi per mosse vietate","illegalAlertsSub":"Segna automaticamente in rosso i conflitti con le regole e mostra l’avviso di errore.","unjustifiedAlerts":"Avvisi per mosse non giustificate","unjustifiedAlertsSub":"Mostra in arancione un pezzo legale ma non dimostrato, senza aprire un pannello di notifica."});
Object.assign(I18N.de,{"illegalAlerts":"Warnungen bei verbotenen Zügen","illegalAlertsSub":"Regelkonflikte automatisch rot markieren und die Fehlerwarnung anzeigen.","unjustifiedAlerts":"Warnungen bei unbegründeten Zügen","unjustifiedAlertsSub":"Eine legale, aber nicht bewiesene Figur orange anzeigen, ohne ein Benachrichtigungsfeld zu öffnen."});
Object.assign(I18N.nl,{"illegalAlerts":"Meldingen voor verboden zetten","illegalAlertsSub":"Regelconflicten automatisch rood markeren en de foutmelding tonen.","unjustifiedAlerts":"Meldingen voor niet-gerechtvaardigde zetten","unjustifiedAlertsSub":"Een legale maar onbewezen zet oranje tonen zonder een meldingspaneel te openen."});
Object.assign(I18N.zh,{"illegalAlerts":"禁止步骤提醒","illegalAlertsSub":"自动用红色标记规则冲突并显示错误提醒。","unjustifiedAlerts":"无依据步骤提醒","unjustifiedAlertsSub":"将合法但未证明的棋子显示为橙色，不打开通知面板。"});
Object.assign(I18N.hi,{"illegalAlerts":"निषिद्ध चाल अलर्ट","illegalAlertsSub":"नियम संघर्षों को अपने आप लाल रंग में दिखाएँ और त्रुटि अलर्ट प्रदर्शित करें।","unjustifiedAlerts":"असिद्ध चाल अलर्ट","unjustifiedAlertsSub":"वैध लेकिन असिद्ध मोहरे को नारंगी दिखाएँ, बिना सूचना पैनल खोले।"});
Object.assign(I18N.ar,{"illegalAlerts":"تنبيهات النقلات الممنوعة","illegalAlertsSub":"تمييز تعارضات القواعد تلقائيًا باللون الأحمر وإظهار تنبيه الخطأ.","unjustifiedAlerts":"تنبيهات النقلات غير المبررة","unjustifiedAlertsSub":"إظهار القطعة القانونية غير المثبتة باللون البرتقالي من دون فتح لوحة إشعار."});
Object.assign(I18N.bn,{"illegalAlerts":"নিষিদ্ধ চালের সতর্কতা","illegalAlertsSub":"নিয়মের সংঘাত স্বয়ংক্রিয়ভাবে লাল রঙে দেখান এবং ত্রুটি সতর্কতা প্রদর্শন করুন।","unjustifiedAlerts":"অযৌক্তিক চালের সতর্কতা","unjustifiedAlertsSub":"বৈধ কিন্তু অপ্রমাণিত ঘুঁটি কমলা রঙে দেখান, কোনো নোটিফিকেশন প্যানেল না খুলে।"});
Object.assign(I18N.id,{"illegalAlerts":"Peringatan langkah terlarang","illegalAlertsSub":"Tandai konflik aturan secara otomatis dengan warna merah dan tampilkan peringatan kesalahan.","unjustifiedAlerts":"Peringatan langkah belum terjustifikasi","unjustifiedAlertsSub":"Tampilkan bidak legal tetapi belum terbukti dengan warna oranye tanpa membuka panel notifikasi."});
Object.assign(I18N.ur,{"illegalAlerts":"ممنوع چال کی تنبیہات","illegalAlertsSub":"قواعد کے تضادات کو خودکار طور پر سرخ دکھائیں اور غلطی کی تنبیہ ظاہر کریں۔","unjustifiedAlerts":"غیر ثابت چال کی تنبیہات","unjustifiedAlertsSub":"قانونی مگر غیر ثابت مہرے کو نارنجی دکھائیں، اطلاع کا پینل کھولے بغیر۔"});
Object.assign(I18N.bg,{"illegalAlerts":"Сигнали за забранени ходове","illegalAlertsSub":"Автоматично маркирай конфликтите с правилата в червено и показвай сигнал за грешка.","unjustifiedAlerts":"Сигнали за необосновани ходове","unjustifiedAlertsSub":"Показвай позволена, но недоказана фигура в оранжево, без панел за известия."});
Object.assign(I18N.hr,{"illegalAlerts":"Upozorenja za zabranjene poteze","illegalAlertsSub":"Automatski označi sukobe s pravilima crveno i prikaži upozorenje o pogrešci.","unjustifiedAlerts":"Upozorenja za neopravdane poteze","unjustifiedAlertsSub":"Prikaži dopuštenu, ali nedokazanu figuru narančasto, bez otvaranja ploče obavijesti."});
Object.assign(I18N.cs,{"illegalAlerts":"Upozornění na zakázané tahy","illegalAlertsSub":"Automaticky označit konflikty s pravidly červeně a zobrazit upozornění na chybu.","unjustifiedAlerts":"Upozornění na neodůvodněné tahy","unjustifiedAlertsSub":"Zobrazit legální, ale neprokázaný prvek oranžově bez otevření panelu oznámení."});
Object.assign(I18N.da,{"illegalAlerts":"Advarsler om forbudte træk","illegalAlertsSub":"Markér automatisk regelkonflikter med rødt og vis fejladvarslen.","unjustifiedAlerts":"Advarsler om ikke-begrundede træk","unjustifiedAlertsSub":"Vis en lovlig, men ikke bevist brik med orange uden at åbne et meddelelsespanel."});
Object.assign(I18N.et,{"illegalAlerts":"Keelatud käikude hoiatused","illegalAlertsSub":"Märgi reeglikonfliktid automaatselt punaselt ja kuva veahoiatus.","unjustifiedAlerts":"Põhjendamata käikude hoiatused","unjustifiedAlertsSub":"Näita lubatud, kuid tõestamata nuppu oranžina ilma teavituspaneeli avamata."});
Object.assign(I18N.fi,{"illegalAlerts":"Kiellettyjen siirtojen ilmoitukset","illegalAlertsSub":"Merkitse sääntöristiriidat automaattisesti punaisella ja näytä virheilmoitus.","unjustifiedAlerts":"Perustelemattomien siirtojen ilmoitukset","unjustifiedAlertsSub":"Näytä sallittu mutta todistamaton pelimerkki oranssina avaamatta ilmoituspaneelia."});
Object.assign(I18N.el,{"illegalAlerts":"Ειδοποιήσεις απαγορευμένων κινήσεων","illegalAlertsSub":"Σήμανε αυτόματα τις συγκρούσεις κανόνων με κόκκινο και εμφάνισε την ειδοποίηση σφάλματος.","unjustifiedAlerts":"Ειδοποιήσεις μη αιτιολογημένων κινήσεων","unjustifiedAlertsSub":"Εμφάνισε ένα νόμιμο αλλά μη αποδεδειγμένο κομμάτι με πορτοκαλί χωρίς άνοιγμα πίνακα ειδοποίησης."});
Object.assign(I18N.hu,{"illegalAlerts":"Tiltott lépések jelzései","illegalAlertsSub":"A szabályütközéseket automatikusan pirossal jelöld, és jelenítsd meg a hibajelzést.","unjustifiedAlerts":"Nem indokolt lépések jelzései","unjustifiedAlertsSub":"A szabályos, de nem bizonyított elemet narancssárgával jelöld, értesítési panel nélkül."});
Object.assign(I18N.ga,{"illegalAlerts":"Foláirimh faoi bhogadh toirmiscthe","illegalAlertsSub":"Marcáil coinbhleachtaí rialacha go huathoibríoch i ndearg agus taispeáin an foláireamh earráide.","unjustifiedAlerts":"Foláirimh faoi bhogadh gan údar","unjustifiedAlertsSub":"Taispeáin píosa dleathach ach neamhchruthaithe in oráiste gan painéal fógra a oscailt."});
Object.assign(I18N.lv,{"illegalAlerts":"Aizliegto gājienu brīdinājumi","illegalAlertsSub":"Automātiski atzīmē noteikumu konfliktus sarkanā krāsā un parādi kļūdas brīdinājumu.","unjustifiedAlerts":"Nepamatotu gājienu brīdinājumi","unjustifiedAlertsSub":"Parādi atļautu, bet nepierādītu figūru oranžā krāsā bez paziņojumu paneļa."});
Object.assign(I18N.lt,{"illegalAlerts":"Draudžiamų ėjimų įspėjimai","illegalAlertsSub":"Automatiškai pažymėk taisyklių konfliktus raudonai ir rodyk klaidos įspėjimą.","unjustifiedAlerts":"Nepagrįstų ėjimų įspėjimai","unjustifiedAlertsSub":"Rodyk leistiną, bet neįrodytą figūrą oranžine spalva neatidarant pranešimų skydelio."});
Object.assign(I18N.mt,{"illegalAlerts":"Twissijiet għal mossi pprojbiti","illegalAlertsSub":"Immarka awtomatikament il-kunflitti mar-regoli bl-aħmar u uri t-twissija tal-iżball.","unjustifiedAlerts":"Twissijiet għal mossi mhux iġġustifikati","unjustifiedAlertsSub":"Uri biċċa legali iżda mhux ippruvata bl-oranġjo mingħajr ma tiftaħ pannell ta’ notifika."});
Object.assign(I18N.pl,{"illegalAlerts":"Alerty zakazanych ruchów","illegalAlertsSub":"Automatycznie oznaczaj konflikty reguł na czerwono i pokazuj alert błędu.","unjustifiedAlerts":"Alerty ruchów nieuzasadnionych","unjustifiedAlertsSub":"Pokazuj legalny, ale nieudowodniony element na pomarańczowo bez otwierania panelu powiadomienia."});
Object.assign(I18N.ro,{"illegalAlerts":"Alerte pentru mutări interzise","illegalAlertsSub":"Marchează automat conflictele de reguli cu roșu și afișează alerta de eroare.","unjustifiedAlerts":"Alerte pentru mutări nejustificate","unjustifiedAlertsSub":"Afișează cu portocaliu o piesă legală, dar nedemonstrată, fără a deschide un panou de notificare."});
Object.assign(I18N.sk,{"illegalAlerts":"Upozornenia na zakázané ťahy","illegalAlertsSub":"Automaticky označ konflikty pravidiel červenou a zobraz upozornenie na chybu.","unjustifiedAlerts":"Upozornenia na neodôvodnené ťahy","unjustifiedAlertsSub":"Zobraz legálny, ale nedokázaný prvok oranžovou bez otvorenia panela oznámení."});
Object.assign(I18N.sl,{"illegalAlerts":"Opozorila za prepovedane poteze","illegalAlertsSub":"Samodejno označi konflikte pravil rdeče in prikaži opozorilo o napaki.","unjustifiedAlerts":"Opozorila za neutemeljene poteze","unjustifiedAlertsSub":"Prikaži dovoljeno, vendar nedokazano figuro oranžno brez odpiranja plošče z obvestili."});
Object.assign(I18N.sv,{"illegalAlerts":"Varningar för förbjudna drag","illegalAlertsSub":"Markera automatiskt regelkonflikter med rött och visa felvarningen.","unjustifiedAlerts":"Varningar för omotiverade drag","unjustifiedAlertsSub":"Visa en laglig men obevisad pjäs i orange utan att öppna en meddelandepanel."});

/* v2.21.4 — 3-stage Coach + step-by-step solution */
Object.assign(I18N.en,{"walkthrough":"Step-by-step solution","walkthroughSub":"Follow the logical resolution of the puzzle without changing your grid.","walkthroughNext":"Next step","walkthroughPrevious":"Previous step","walkthroughRestart":"Restart","walkthroughClose":"Return to game","walkthroughStep":"Step","walkthroughStart":"Initial position","walkthroughComplete":"Resolution complete","walkthroughStalled":"QUADLUD cannot continue this resolution with its current logical techniques.","walkthroughWhy":"Why this move?","walkthroughCountsAsHelp":"Viewing this resolution counts as solution help for the current attempt."});
Object.assign(I18N.fr,{"walkthrough":"Résolution pas à pas","walkthroughSub":"Suis la résolution logique du puzzle sans modifier ta grille.","walkthroughNext":"Étape suivante","walkthroughPrevious":"Étape précédente","walkthroughRestart":"Recommencer","walkthroughClose":"Retour au jeu","walkthroughStep":"Étape","walkthroughStart":"Position initiale","walkthroughComplete":"Résolution terminée","walkthroughStalled":"QUADLUD ne peut pas poursuivre cette résolution avec ses techniques logiques actuelles.","walkthroughWhy":"Pourquoi ce coup ?","walkthroughCountsAsHelp":"Consulter cette résolution compte comme une aide de type solution pour la partie en cours."});
Object.assign(I18N.es,{"walkthrough":"Solución paso a paso","walkthroughSub":"Sigue la resolución lógica del puzzle sin modificar tu cuadrícula.","walkthroughNext":"Paso siguiente","walkthroughPrevious":"Paso anterior","walkthroughRestart":"Reiniciar","walkthroughClose":"Volver al juego","walkthroughStep":"Paso","walkthroughStart":"Posición inicial","walkthroughComplete":"Resolución completa","walkthroughStalled":"QUADLUD no puede continuar esta resolución con sus técnicas lógicas actuales.","walkthroughWhy":"¿Por qué esta jugada?","walkthroughCountsAsHelp":"Ver esta resolución cuenta como ayuda de solución para la partida actual."});
Object.assign(I18N.pt,{"walkthrough":"Resolução passo a passo","walkthroughSub":"Segue a resolução lógica do puzzle sem alterar a tua grelha.","walkthroughNext":"Passo seguinte","walkthroughPrevious":"Passo anterior","walkthroughRestart":"Recomeçar","walkthroughClose":"Voltar ao jogo","walkthroughStep":"Passo","walkthroughStart":"Posição inicial","walkthroughComplete":"Resolução concluída","walkthroughStalled":"QUADLUD não consegue continuar esta resolução com as técnicas lógicas atuais.","walkthroughWhy":"Porquê esta jogada?","walkthroughCountsAsHelp":"Ver esta resolução conta como ajuda de solução para a partida atual."});
Object.assign(I18N.it,{"walkthrough":"Soluzione passo passo","walkthroughSub":"Segui la risoluzione logica del puzzle senza modificare la tua griglia.","walkthroughNext":"Passo successivo","walkthroughPrevious":"Passo precedente","walkthroughRestart":"Ricomincia","walkthroughClose":"Torna al gioco","walkthroughStep":"Passo","walkthroughStart":"Posizione iniziale","walkthroughComplete":"Risoluzione completata","walkthroughStalled":"QUADLUD non può continuare questa risoluzione con le tecniche logiche attuali.","walkthroughWhy":"Perché questa mossa?","walkthroughCountsAsHelp":"Visualizzare questa risoluzione conta come aiuto di soluzione per la partita corrente."});
Object.assign(I18N.de,{"walkthrough":"Schritt-für-Schritt-Lösung","walkthroughSub":"Verfolge die logische Lösung, ohne dein Spielfeld zu verändern.","walkthroughNext":"Nächster Schritt","walkthroughPrevious":"Vorheriger Schritt","walkthroughRestart":"Neu starten","walkthroughClose":"Zurück zum Spiel","walkthroughStep":"Schritt","walkthroughStart":"Ausgangsposition","walkthroughComplete":"Lösung abgeschlossen","walkthroughStalled":"QUADLUD kann diese Lösung mit den aktuellen Logiktechniken nicht fortsetzen.","walkthroughWhy":"Warum dieser Zug?","walkthroughCountsAsHelp":"Das Anzeigen dieser Lösung zählt als Lösungshilfe für den aktuellen Versuch."});
Object.assign(I18N.nl,{"walkthrough":"Stap-voor-stapoplossing","walkthroughSub":"Volg de logische oplossing zonder je eigen bord te wijzigen.","walkthroughNext":"Volgende stap","walkthroughPrevious":"Vorige stap","walkthroughRestart":"Opnieuw beginnen","walkthroughClose":"Terug naar spel","walkthroughStep":"Stap","walkthroughStart":"Beginpositie","walkthroughComplete":"Oplossing voltooid","walkthroughStalled":"QUADLUD kan deze oplossing niet voortzetten met de huidige logische technieken.","walkthroughWhy":"Waarom deze zet?","walkthroughCountsAsHelp":"Deze oplossing bekijken telt als oplossingshulp voor de huidige poging."});
Object.assign(I18N.zh,{"walkthrough":"逐步解答","walkthroughSub":"查看逻辑解题过程，而不改变你的当前棋盘。","walkthroughNext":"下一步","walkthroughPrevious":"上一步","walkthroughRestart":"重新开始","walkthroughClose":"返回游戏","walkthroughStep":"步骤","walkthroughStart":"初始位置","walkthroughComplete":"解答完成","walkthroughStalled":"QUADLUD 无法使用当前逻辑技巧继续此解答。","walkthroughWhy":"为什么这样走？","walkthroughCountsAsHelp":"查看此解答会计为当前对局使用了答案帮助。"});
Object.assign(I18N.hi,{"walkthrough":"चरण-दर-चरण समाधान","walkthroughSub":"अपनी ग्रिड बदले बिना पहेली का तार्किक समाधान देखें।","walkthroughNext":"अगला चरण","walkthroughPrevious":"पिछला चरण","walkthroughRestart":"फिर से शुरू करें","walkthroughClose":"खेल पर लौटें","walkthroughStep":"चरण","walkthroughStart":"प्रारंभिक स्थिति","walkthroughComplete":"समाधान पूरा","walkthroughStalled":"QUADLUD अपनी वर्तमान तार्किक तकनीकों से इस समाधान को आगे नहीं बढ़ा सकता।","walkthroughWhy":"यह चाल क्यों?","walkthroughCountsAsHelp":"इस समाधान को देखना वर्तमान प्रयास में समाधान-सहायता माना जाएगा।"});
Object.assign(I18N.ar,{"walkthrough":"حل خطوة بخطوة","walkthroughSub":"تابع الحل المنطقي للغز من دون تغيير شبكتك.","walkthroughNext":"الخطوة التالية","walkthroughPrevious":"الخطوة السابقة","walkthroughRestart":"إعادة البدء","walkthroughClose":"العودة إلى اللعبة","walkthroughStep":"خطوة","walkthroughStart":"الوضع الابتدائي","walkthroughComplete":"اكتمل الحل","walkthroughStalled":"لا يستطيع QUADLUD متابعة هذا الحل بتقنياته المنطقية الحالية.","walkthroughWhy":"لماذا هذه النقلة؟","walkthroughCountsAsHelp":"عرض هذا الحل يُحتسب كمساعدة حل للمحاولة الحالية."});
Object.assign(I18N.bn,{"walkthrough":"ধাপে ধাপে সমাধান","walkthroughSub":"আপনার গ্রিড না বদলে ধাঁধার যৌক্তিক সমাধান অনুসরণ করুন।","walkthroughNext":"পরবর্তী ধাপ","walkthroughPrevious":"আগের ধাপ","walkthroughRestart":"আবার শুরু","walkthroughClose":"খেলায় ফিরুন","walkthroughStep":"ধাপ","walkthroughStart":"প্রাথমিক অবস্থা","walkthroughComplete":"সমাধান সম্পূর্ণ","walkthroughStalled":"QUADLUD বর্তমান যুক্তিগত কৌশল দিয়ে এই সমাধান আর এগিয়ে নিতে পারছে না।","walkthroughWhy":"এই চাল কেন?","walkthroughCountsAsHelp":"এই সমাধান দেখা বর্তমান প্রচেষ্টায় সমাধান-সহায়তা হিসেবে গণ্য হবে।"});
Object.assign(I18N.id,{"walkthrough":"Solusi langkah demi langkah","walkthroughSub":"Ikuti penyelesaian logis tanpa mengubah papan Anda.","walkthroughNext":"Langkah berikutnya","walkthroughPrevious":"Langkah sebelumnya","walkthroughRestart":"Mulai ulang","walkthroughClose":"Kembali ke permainan","walkthroughStep":"Langkah","walkthroughStart":"Posisi awal","walkthroughComplete":"Penyelesaian selesai","walkthroughStalled":"QUADLUD tidak dapat melanjutkan penyelesaian ini dengan teknik logika saat ini.","walkthroughWhy":"Mengapa langkah ini?","walkthroughCountsAsHelp":"Melihat penyelesaian ini dihitung sebagai bantuan solusi untuk percobaan saat ini."});
Object.assign(I18N.ur,{"walkthrough":"مرحلہ وار حل","walkthroughSub":"اپنی گرڈ بدلے بغیر پہیلی کا منطقی حل دیکھیں۔","walkthroughNext":"اگلا مرحلہ","walkthroughPrevious":"پچھلا مرحلہ","walkthroughRestart":"دوبارہ شروع کریں","walkthroughClose":"کھیل پر واپس جائیں","walkthroughStep":"مرحلہ","walkthroughStart":"ابتدائی حالت","walkthroughComplete":"حل مکمل","walkthroughStalled":"QUADLUD موجودہ منطقی تکنیکوں سے اس حل کو مزید آگے نہیں بڑھا سکتا۔","walkthroughWhy":"یہ چال کیوں؟","walkthroughCountsAsHelp":"یہ حل دیکھنا موجودہ کوشش میں حل کی مدد شمار ہوگا۔"});
Object.assign(I18N.bg,{"walkthrough":"Решение стъпка по стъпка","walkthroughSub":"Проследи логическото решение, без да променяш своята дъска.","walkthroughNext":"Следваща стъпка","walkthroughPrevious":"Предишна стъпка","walkthroughRestart":"Отначало","walkthroughClose":"Обратно към играта","walkthroughStep":"Стъпка","walkthroughStart":"Начална позиция","walkthroughComplete":"Решението е завършено","walkthroughStalled":"QUADLUD не може да продължи решението с текущите логически техники.","walkthroughWhy":"Защо този ход?","walkthroughCountsAsHelp":"Преглеждането на решението се брои като помощ с решение за текущия опит."});
Object.assign(I18N.hr,{"walkthrough":"Rješenje korak po korak","walkthroughSub":"Prati logičko rješenje bez mijenjanja svoje ploče.","walkthroughNext":"Sljedeći korak","walkthroughPrevious":"Prethodni korak","walkthroughRestart":"Ponovno pokreni","walkthroughClose":"Natrag u igru","walkthroughStep":"Korak","walkthroughStart":"Početni položaj","walkthroughComplete":"Rješenje završeno","walkthroughStalled":"QUADLUD ne može nastaviti ovo rješenje trenutačnim logičkim tehnikama.","walkthroughWhy":"Zašto ovaj potez?","walkthroughCountsAsHelp":"Pregled ovog rješenja računa se kao pomoć rješenjem za trenutačni pokušaj."});
Object.assign(I18N.cs,{"walkthrough":"Řešení krok za krokem","walkthroughSub":"Sleduj logické řešení bez změny své herní plochy.","walkthroughNext":"Další krok","walkthroughPrevious":"Předchozí krok","walkthroughRestart":"Začít znovu","walkthroughClose":"Zpět do hry","walkthroughStep":"Krok","walkthroughStart":"Výchozí pozice","walkthroughComplete":"Řešení dokončeno","walkthroughStalled":"QUADLUD nemůže pokračovat v řešení pomocí současných logických technik.","walkthroughWhy":"Proč tento tah?","walkthroughCountsAsHelp":"Zobrazení tohoto řešení se počítá jako pomoc s řešením pro aktuální pokus."});
Object.assign(I18N.da,{"walkthrough":"Trinvis løsning","walkthroughSub":"Følg den logiske løsning uden at ændre dit spillebræt.","walkthroughNext":"Næste trin","walkthroughPrevious":"Forrige trin","walkthroughRestart":"Start forfra","walkthroughClose":"Tilbage til spillet","walkthroughStep":"Trin","walkthroughStart":"Startposition","walkthroughComplete":"Løsning færdig","walkthroughStalled":"QUADLUD kan ikke fortsætte løsningen med de nuværende logiske teknikker.","walkthroughWhy":"Hvorfor dette træk?","walkthroughCountsAsHelp":"Visning af denne løsning tæller som løsningshjælp i det aktuelle forsøg."});
Object.assign(I18N.et,{"walkthrough":"Samm-sammuline lahendus","walkthroughSub":"Jälgi loogilist lahendust oma mängulauda muutmata.","walkthroughNext":"Järgmine samm","walkthroughPrevious":"Eelmine samm","walkthroughRestart":"Alusta uuesti","walkthroughClose":"Tagasi mängu","walkthroughStep":"Samm","walkthroughStart":"Algseis","walkthroughComplete":"Lahendus valmis","walkthroughStalled":"QUADLUD ei saa praeguste loogikatehnikatega seda lahendust jätkata.","walkthroughWhy":"Miks see käik?","walkthroughCountsAsHelp":"Selle lahenduse vaatamine loetakse praeguse katse lahendusabiks."});
Object.assign(I18N.fi,{"walkthrough":"Vaiheittainen ratkaisu","walkthroughSub":"Seuraa loogista ratkaisua muuttamatta omaa ruudukkoasi.","walkthroughNext":"Seuraava vaihe","walkthroughPrevious":"Edellinen vaihe","walkthroughRestart":"Aloita alusta","walkthroughClose":"Takaisin peliin","walkthroughStep":"Vaihe","walkthroughStart":"Alkutilanne","walkthroughComplete":"Ratkaisu valmis","walkthroughStalled":"QUADLUD ei pysty jatkamaan ratkaisua nykyisillä logiikkatekniikoillaan.","walkthroughWhy":"Miksi tämä siirto?","walkthroughCountsAsHelp":"Ratkaisun katsominen lasketaan ratkaisuavuksi nykyisessä yrityksessä."});
Object.assign(I18N.el,{"walkthrough":"Λύση βήμα προς βήμα","walkthroughSub":"Παρακολούθησε τη λογική λύση χωρίς να αλλάξεις το ταμπλό σου.","walkthroughNext":"Επόμενο βήμα","walkthroughPrevious":"Προηγούμενο βήμα","walkthroughRestart":"Επανεκκίνηση","walkthroughClose":"Επιστροφή στο παιχνίδι","walkthroughStep":"Βήμα","walkthroughStart":"Αρχική θέση","walkthroughComplete":"Η λύση ολοκληρώθηκε","walkthroughStalled":"Το QUADLUD δεν μπορεί να συνεχίσει τη λύση με τις τρέχουσες λογικές τεχνικές.","walkthroughWhy":"Γιατί αυτή η κίνηση;","walkthroughCountsAsHelp":"Η προβολή αυτής της λύσης μετρά ως βοήθεια λύσης για την τρέχουσα προσπάθεια."});
Object.assign(I18N.hu,{"walkthrough":"Lépésről lépésre megoldás","walkthroughSub":"Kövesd a logikai megoldást a saját táblád módosítása nélkül.","walkthroughNext":"Következő lépés","walkthroughPrevious":"Előző lépés","walkthroughRestart":"Újrakezdés","walkthroughClose":"Vissza a játékhoz","walkthroughStep":"Lépés","walkthroughStart":"Kezdőállás","walkthroughComplete":"Megoldás kész","walkthroughStalled":"A QUADLUD a jelenlegi logikai technikákkal nem tudja folytatni ezt a megoldást.","walkthroughWhy":"Miért ez a lépés?","walkthroughCountsAsHelp":"A megoldás megtekintése megoldási segítségnek számít az aktuális próbálkozásban."});
Object.assign(I18N.ga,{"walkthrough":"Réiteach céim ar chéim","walkthroughSub":"Lean an réiteach loighciúil gan do chlár féin a athrú.","walkthroughNext":"An chéad chéim eile","walkthroughPrevious":"An chéim roimhe","walkthroughRestart":"Atosaigh","walkthroughClose":"Ar ais chuig an gcluiche","walkthroughStep":"Céim","walkthroughStart":"Suíomh tosaigh","walkthroughComplete":"Réiteach críochnaithe","walkthroughStalled":"Ní féidir le QUADLUD leanúint leis an réiteach leis na teicnící loighciúla reatha.","walkthroughWhy":"Cén fáth an bogadh seo?","walkthroughCountsAsHelp":"Áirítear féachaint ar an réiteach seo mar chabhair réitigh don iarracht reatha."});
Object.assign(I18N.lv,{"walkthrough":"Risinājums soli pa solim","walkthroughSub":"Seko loģiskajam risinājumam, nemainot savu laukumu.","walkthroughNext":"Nākamais solis","walkthroughPrevious":"Iepriekšējais solis","walkthroughRestart":"Sākt no jauna","walkthroughClose":"Atpakaļ uz spēli","walkthroughStep":"Solis","walkthroughStart":"Sākuma pozīcija","walkthroughComplete":"Risinājums pabeigts","walkthroughStalled":"QUADLUD nevar turpināt risinājumu ar pašreizējām loģikas metodēm.","walkthroughWhy":"Kāpēc šis gājiens?","walkthroughCountsAsHelp":"Šī risinājuma skatīšana tiek uzskatīta par risinājuma palīdzību pašreizējā mēģinājumā."});
Object.assign(I18N.lt,{"walkthrough":"Sprendimas žingsnis po žingsnio","walkthroughSub":"Sek loginį sprendimą nekeisdamas savo lentos.","walkthroughNext":"Kitas žingsnis","walkthroughPrevious":"Ankstesnis žingsnis","walkthroughRestart":"Pradėti iš naujo","walkthroughClose":"Grįžti į žaidimą","walkthroughStep":"Žingsnis","walkthroughStart":"Pradinė padėtis","walkthroughComplete":"Sprendimas baigtas","walkthroughStalled":"QUADLUD negali tęsti sprendimo dabartinėmis loginėmis technikomis.","walkthroughWhy":"Kodėl šis ėjimas?","walkthroughCountsAsHelp":"Šio sprendimo peržiūra laikoma sprendimo pagalba dabartiniam bandymui."});
Object.assign(I18N.mt,{"walkthrough":"Soluzzjoni pass pass","walkthroughSub":"Segwi s-soluzzjoni loġika mingħajr ma tbiddel il-bord tiegħek.","walkthroughNext":"Pass li jmiss","walkthroughPrevious":"Pass ta’ qabel","walkthroughRestart":"Ibda mill-ġdid","walkthroughClose":"Lura għal-logħba","walkthroughStep":"Pass","walkthroughStart":"Pożizzjoni inizjali","walkthroughComplete":"Soluzzjoni kompluta","walkthroughStalled":"QUADLUD ma jistax ikompli din is-soluzzjoni bit-tekniki loġiċi attwali.","walkthroughWhy":"Għaliex din il-mossa?","walkthroughCountsAsHelp":"Li tara din is-soluzzjoni jgħodd bħala għajnuna tas-soluzzjoni għall-prova attwali."});
Object.assign(I18N.pl,{"walkthrough":"Rozwiązanie krok po kroku","walkthroughSub":"Śledź logiczne rozwiązanie bez zmiany swojej planszy.","walkthroughNext":"Następny krok","walkthroughPrevious":"Poprzedni krok","walkthroughRestart":"Zacznij od nowa","walkthroughClose":"Wróć do gry","walkthroughStep":"Krok","walkthroughStart":"Pozycja początkowa","walkthroughComplete":"Rozwiązanie zakończone","walkthroughStalled":"QUADLUD nie może kontynuować rozwiązania przy użyciu obecnych technik logicznych.","walkthroughWhy":"Dlaczego ten ruch?","walkthroughCountsAsHelp":"Wyświetlenie tego rozwiązania liczy się jako pomoc w rozwiązaniu bieżącej próby."});
Object.assign(I18N.ro,{"walkthrough":"Rezolvare pas cu pas","walkthroughSub":"Urmărește rezolvarea logică fără să modifici tabla ta.","walkthroughNext":"Pasul următor","walkthroughPrevious":"Pasul anterior","walkthroughRestart":"Reîncepe","walkthroughClose":"Înapoi la joc","walkthroughStep":"Pas","walkthroughStart":"Poziția inițială","walkthroughComplete":"Rezolvare completă","walkthroughStalled":"QUADLUD nu poate continua această rezolvare cu tehnicile logice actuale.","walkthroughWhy":"De ce această mutare?","walkthroughCountsAsHelp":"Vizualizarea acestei rezolvări contează ca ajutor de soluție pentru încercarea curentă."});
Object.assign(I18N.sk,{"walkthrough":"Riešenie krok za krokom","walkthroughSub":"Sleduj logické riešenie bez zmeny svojej hracej plochy.","walkthroughNext":"Ďalší krok","walkthroughPrevious":"Predchádzajúci krok","walkthroughRestart":"Začať znova","walkthroughClose":"Späť do hry","walkthroughStep":"Krok","walkthroughStart":"Východisková pozícia","walkthroughComplete":"Riešenie dokončené","walkthroughStalled":"QUADLUD nemôže pokračovať v riešení pomocou súčasných logických techník.","walkthroughWhy":"Prečo tento ťah?","walkthroughCountsAsHelp":"Zobrazenie tohto riešenia sa počíta ako pomoc s riešením pre aktuálny pokus."});
Object.assign(I18N.sl,{"walkthrough":"Rešitev korak za korakom","walkthroughSub":"Sledi logični rešitvi, ne da bi spremenil svojo ploščo.","walkthroughNext":"Naslednji korak","walkthroughPrevious":"Prejšnji korak","walkthroughRestart":"Začni znova","walkthroughClose":"Nazaj v igro","walkthroughStep":"Korak","walkthroughStart":"Začetni položaj","walkthroughComplete":"Rešitev končana","walkthroughStalled":"QUADLUD s trenutnimi logičnimi tehnikami ne more nadaljevati te rešitve.","walkthroughWhy":"Zakaj ta poteza?","walkthroughCountsAsHelp":"Ogled te rešitve šteje kot pomoč pri rešitvi za trenutni poskus."});
Object.assign(I18N.sv,{"walkthrough":"Steg-för-steg-lösning","walkthroughSub":"Följ den logiska lösningen utan att ändra ditt eget bräde.","walkthroughNext":"Nästa steg","walkthroughPrevious":"Föregående steg","walkthroughRestart":"Börja om","walkthroughClose":"Tillbaka till spelet","walkthroughStep":"Steg","walkthroughStart":"Startposition","walkthroughComplete":"Lösning klar","walkthroughStalled":"QUADLUD kan inte fortsätta lösningen med de nuvarande logiska teknikerna.","walkthroughWhy":"Varför detta drag?","walkthroughCountsAsHelp":"Att visa denna lösning räknas som lösningshjälp för det aktuella försöket."});

/* v2.21.5 — mobile-visible Tutor naming */
Object.assign(I18N.en,{walkthrough:"Tutor"});
Object.assign(I18N.zh,{walkthrough:"导师"});
Object.assign(I18N.hi,{walkthrough:"ट्यूटर"});
Object.assign(I18N.es,{walkthrough:"Tutor"});
Object.assign(I18N.ar,{walkthrough:"المعلّم"});
Object.assign(I18N.fr,{walkthrough:"Tuteur"});
Object.assign(I18N.bn,{walkthrough:"শিক্ষক"});
Object.assign(I18N.pt,{walkthrough:"Tutor"});
Object.assign(I18N.id,{walkthrough:"Tutor"});
Object.assign(I18N.ur,{walkthrough:"ٹیوٹر"});
Object.assign(I18N.bg,{walkthrough:"Наставник"});
Object.assign(I18N.hr,{walkthrough:"Tutor"});
Object.assign(I18N.cs,{walkthrough:"Tutor"});
Object.assign(I18N.da,{walkthrough:"Vejleder"});
Object.assign(I18N.nl,{walkthrough:"Tutor"});
Object.assign(I18N.et,{walkthrough:"Juhendaja"});
Object.assign(I18N.fi,{walkthrough:"Ohjaaja"});
Object.assign(I18N.de,{walkthrough:"Tutor"});
Object.assign(I18N.el,{walkthrough:"Καθοδηγητής"});
Object.assign(I18N.hu,{walkthrough:"Tutor"});
Object.assign(I18N.ga,{walkthrough:"Teagascóir"});
Object.assign(I18N.it,{walkthrough:"Tutor"});
Object.assign(I18N.lv,{walkthrough:"Padomdevējs"});
Object.assign(I18N.lt,{walkthrough:"Mokytojas"});
Object.assign(I18N.mt,{walkthrough:"Tutur"});
Object.assign(I18N.pl,{walkthrough:"Tutor"});
Object.assign(I18N.ro,{walkthrough:"Tutor"});
Object.assign(I18N.sk,{walkthrough:"Tútor"});
Object.assign(I18N.sl,{walkthrough:"Mentor"});
Object.assign(I18N.sv,{walkthrough:"Handledare"});

/* v2.21.10 — Queens proof-engine UI terminology */
Object.assign(I18N.en,{"qlSingleton":"Unique position","qlLocked":"Reserved unit","qlCommonConflict":"Common conflict","qlHallPair":"Reserved pair","qlHallTriple":"Reserved triple","qlHallGroup":"Reserved group","qlCapacity":"Local capacity","qlNoSupport":"No remaining support","qlMixedHall":"Mixed reserved group","qlContradiction":"Reasoning by contradiction","qlNoDeduction":"No demonstrable deduction is available from the current visible state. No move is taken from the final solution."});
Object.assign(I18N.zh,{"qlSingleton":"唯一位置","qlLocked":"保留单元","qlCommonConflict":"共同冲突","qlHallPair":"保留二组","qlHallTriple":"保留三组","qlHallGroup":"保留组","qlCapacity":"局部容量","qlNoSupport":"无可用支撑","qlMixedHall":"混合保留组","qlContradiction":"反证推理","qlNoDeduction":"在当前可见状态下没有可证明的推导。不会从最终答案中取用任何一步。"});
Object.assign(I18N.hi,{"qlSingleton":"एकमात्र स्थान","qlLocked":"आरक्षित इकाई","qlCommonConflict":"साझा टकराव","qlHallPair":"आरक्षित जोड़ी","qlHallTriple":"आरक्षित तिकड़ी","qlHallGroup":"आरक्षित समूह","qlCapacity":"स्थानीय क्षमता","qlNoSupport":"कोई शेष समर्थन नहीं","qlMixedHall":"मिश्रित आरक्षित समूह","qlContradiction":"विरोधाभास से तर्क","qlNoDeduction":"वर्तमान दिखाई देने वाली स्थिति से कोई सिद्ध निष्कर्ष उपलब्ध नहीं है। अंतिम समाधान से कोई चाल नहीं ली जाती।"});
Object.assign(I18N.es,{"qlSingleton":"Posición única","qlLocked":"Unidad reservada","qlCommonConflict":"Conflicto común","qlHallPair":"Pareja reservada","qlHallTriple":"Triple reservado","qlHallGroup":"Grupo reservado","qlCapacity":"Capacidad local","qlNoSupport":"Sin apoyo posible","qlMixedHall":"Grupo mixto reservado","qlContradiction":"Razonamiento por contradicción","qlNoDeduction":"No hay ninguna deducción demostrable disponible en el estado visible actual. No se toma ninguna jugada de la solución final."});
Object.assign(I18N.ar,{"qlSingleton":"موضع وحيد","qlLocked":"وحدة محجوزة","qlCommonConflict":"تعارض مشترك","qlHallPair":"زوج محجوز","qlHallTriple":"ثلاثي محجوز","qlHallGroup":"مجموعة محجوزة","qlCapacity":"سعة محلية","qlNoSupport":"لا يوجد دعم ممكن","qlMixedHall":"مجموعة مختلطة محجوزة","qlContradiction":"استدلال بالتناقض","qlNoDeduction":"لا يوجد استنتاج قابل للإثبات من الحالة الظاهرة الحالية. لا تؤخذ أي نقلة من الحل النهائي."});
Object.assign(I18N.fr,{"qlSingleton":"Position unique","qlLocked":"Unité réservée","qlCommonConflict":"Conflit commun","qlHallPair":"Paire réservée","qlHallTriple":"Triple réservé","qlHallGroup":"Groupe réservé","qlCapacity":"Capacité locale","qlNoSupport":"Aucun support possible","qlMixedHall":"Groupe mixte réservé","qlContradiction":"Raisonnement par contradiction","qlNoDeduction":"Aucune déduction démontrable n’est disponible dans l’état visible actuel. Aucun coup n’est tiré de la solution finale."});
Object.assign(I18N.bn,{"qlSingleton":"একমাত্র অবস্থান","qlLocked":"সংরক্ষিত একক","qlCommonConflict":"সাধারণ সংঘাত","qlHallPair":"সংরক্ষিত জোড়া","qlHallTriple":"সংরক্ষিত ত্রয়ী","qlHallGroup":"সংরক্ষিত দল","qlCapacity":"স্থানীয় ধারণক্ষমতা","qlNoSupport":"কোনো সমর্থন অবশিষ্ট নেই","qlMixedHall":"মিশ্র সংরক্ষিত দল","qlContradiction":"বিরোধাভাস দ্বারা যুক্তি","qlNoDeduction":"বর্তমান দৃশ্যমান অবস্থা থেকে কোনো প্রমাণযোগ্য সিদ্ধান্ত পাওয়া যাচ্ছে না। চূড়ান্ত সমাধান থেকে কোনো চাল নেওয়া হয় না।"});
Object.assign(I18N.pt,{"qlSingleton":"Posição única","qlLocked":"Unidade reservada","qlCommonConflict":"Conflito comum","qlHallPair":"Par reservado","qlHallTriple":"Trio reservado","qlHallGroup":"Grupo reservado","qlCapacity":"Capacidade local","qlNoSupport":"Sem suporte possível","qlMixedHall":"Grupo misto reservado","qlContradiction":"Raciocínio por contradição","qlNoDeduction":"Não há nenhuma dedução demonstrável disponível no estado visível atual. Nenhuma jogada é obtida da solução final."});
Object.assign(I18N.id,{"qlSingleton":"Posisi tunggal","qlLocked":"Unit yang dicadangkan","qlCommonConflict":"Konflik bersama","qlHallPair":"Pasangan cadangan","qlHallTriple":"Tiga serangkai cadangan","qlHallGroup":"Grup cadangan","qlCapacity":"Kapasitas lokal","qlNoSupport":"Tidak ada dukungan tersisa","qlMixedHall":"Grup campuran cadangan","qlContradiction":"Penalaran dengan kontradiksi","qlNoDeduction":"Tidak ada deduksi yang dapat dibuktikan dari keadaan yang terlihat saat ini. Tidak ada langkah yang diambil dari solusi akhir."});
Object.assign(I18N.ur,{"qlSingleton":"واحد مقام","qlLocked":"محفوظ اکائی","qlCommonConflict":"مشترک تصادم","qlHallPair":"محفوظ جوڑا","qlHallTriple":"محفوظ تگڑا","qlHallGroup":"محفوظ گروپ","qlCapacity":"مقامی گنجائش","qlNoSupport":"کوئی ممکن سہارا نہیں","qlMixedHall":"مخلوط محفوظ گروپ","qlContradiction":"تضاد کے ذریعے استدلال","qlNoDeduction":"موجودہ نظر آنے والی حالت سے کوئی قابلِ ثبوت نتیجہ دستیاب نہیں۔ آخری حل سے کوئی چال نہیں لی جاتی۔"});
Object.assign(I18N.bg,{"qlSingleton":"Единствена позиция","qlLocked":"Запазена единица","qlCommonConflict":"Общ конфликт","qlHallPair":"Запазена двойка","qlHallTriple":"Запазена тройка","qlHallGroup":"Запазена група","qlCapacity":"Локален капацитет","qlNoSupport":"Няма оставаща опора","qlMixedHall":"Смесена запазена група","qlContradiction":"Разсъждение чрез противоречие","qlNoDeduction":"В текущото видимо състояние няма доказуема дедукция. Не се взема ход от крайното решение."});
Object.assign(I18N.hr,{"qlSingleton":"Jedini položaj","qlLocked":"Rezervirana jedinica","qlCommonConflict":"Zajednički sukob","qlHallPair":"Rezervirani par","qlHallTriple":"Rezervirana trojka","qlHallGroup":"Rezervirana grupa","qlCapacity":"Lokalni kapacitet","qlNoSupport":"Nema preostale potpore","qlMixedHall":"Mješovita rezervirana grupa","qlContradiction":"Zaključivanje proturječjem","qlNoDeduction":"U trenutačno vidljivom stanju nema dokazive dedukcije. Nijedan potez ne uzima se iz konačnog rješenja."});
Object.assign(I18N.cs,{"qlSingleton":"Jediná pozice","qlLocked":"Vyhrazená jednotka","qlCommonConflict":"Společný konflikt","qlHallPair":"Vyhrazená dvojice","qlHallTriple":"Vyhrazená trojice","qlHallGroup":"Vyhrazená skupina","qlCapacity":"Místní kapacita","qlNoSupport":"Žádná zbývající podpora","qlMixedHall":"Smíšená vyhrazená skupina","qlContradiction":"Důkaz sporem","qlNoDeduction":"V aktuálně viditelném stavu není k dispozici žádná prokazatelná dedukce. Žádný tah se nebere z konečného řešení."});
Object.assign(I18N.da,{"qlSingleton":"Entydig placering","qlLocked":"Reserveret enhed","qlCommonConflict":"Fælles konflikt","qlHallPair":"Reserveret par","qlHallTriple":"Reserveret tregruppe","qlHallGroup":"Reserveret gruppe","qlCapacity":"Lokal kapacitet","qlNoSupport":"Ingen mulig støtte","qlMixedHall":"Blandet reserveret gruppe","qlContradiction":"Modstridsbevis","qlNoDeduction":"Der er ingen beviselig slutning i den aktuelle synlige tilstand. Intet træk hentes fra den endelige løsning."});
Object.assign(I18N.nl,{"qlSingleton":"Unieke positie","qlLocked":"Gereserveerde eenheid","qlCommonConflict":"Gemeenschappelijk conflict","qlHallPair":"Gereserveerd paar","qlHallTriple":"Gereserveerd drietal","qlHallGroup":"Gereserveerde groep","qlCapacity":"Lokale capaciteit","qlNoSupport":"Geen mogelijke ondersteuning","qlMixedHall":"Gemengd gereserveerde groep","qlContradiction":"Redeneren via tegenspraak","qlNoDeduction":"In de huidige zichtbare toestand is geen aantoonbare deductie beschikbaar. Er wordt geen zet uit de eindoplossing gehaald."});
Object.assign(I18N.et,{"qlSingleton":"Ainus asukoht","qlLocked":"Reserveeritud üksus","qlCommonConflict":"Ühine konflikt","qlHallPair":"Reserveeritud paar","qlHallTriple":"Reserveeritud kolmik","qlHallGroup":"Reserveeritud rühm","qlCapacity":"Kohalik maht","qlNoSupport":"Toetus puudub","qlMixedHall":"Segatud reserveeritud rühm","qlContradiction":"Vastuoluga tõestus","qlNoDeduction":"Praegusest nähtavast seisust ei leidu tõestatavat järeldust. Ühtegi käiku ei võeta lõplikust lahendusest."});
Object.assign(I18N.fi,{"qlSingleton":"Ainoa paikka","qlLocked":"Varattu yksikkö","qlCommonConflict":"Yhteinen ristiriita","qlHallPair":"Varattu pari","qlHallTriple":"Varattu kolmikko","qlHallGroup":"Varattu ryhmä","qlCapacity":"Paikallinen kapasiteetti","qlNoSupport":"Ei mahdollista tukea","qlMixedHall":"Sekoitettu varattu ryhmä","qlContradiction":"Ristiriitatodistus","qlNoDeduction":"Nykyisestä näkyvästä tilanteesta ei ole saatavilla todistettavaa päätelmää. Mitään siirtoa ei oteta lopullisesta ratkaisusta."});
Object.assign(I18N.de,{"qlSingleton":"Einzige Position","qlLocked":"Reservierte Einheit","qlCommonConflict":"Gemeinsamer Konflikt","qlHallPair":"Reserviertes Paar","qlHallTriple":"Reserviertes Tripel","qlHallGroup":"Reservierte Gruppe","qlCapacity":"Lokale Kapazität","qlNoSupport":"Keine mögliche Unterstützung","qlMixedHall":"Gemischt reservierte Gruppe","qlContradiction":"Widerspruchsbeweis","qlNoDeduction":"Im aktuell sichtbaren Zustand ist keine beweisbare Schlussfolgerung verfügbar. Es wird kein Zug aus der Endlösung übernommen."});
Object.assign(I18N.el,{"qlSingleton":"Μοναδική θέση","qlLocked":"Δεσμευμένη μονάδα","qlCommonConflict":"Κοινή σύγκρουση","qlHallPair":"Δεσμευμένο ζεύγος","qlHallTriple":"Δεσμευμένη τριάδα","qlHallGroup":"Δεσμευμένη ομάδα","qlCapacity":"Τοπική χωρητικότητα","qlNoSupport":"Καμία δυνατή υποστήριξη","qlMixedHall":"Μικτή δεσμευμένη ομάδα","qlContradiction":"Συλλογισμός με αντίφαση","qlNoDeduction":"Δεν υπάρχει αποδείξιμη παραγωγή από την τρέχουσα ορατή κατάσταση. Καμία κίνηση δεν λαμβάνεται από την τελική λύση."});
Object.assign(I18N.hu,{"qlSingleton":"Egyetlen hely","qlLocked":"Foglalt egység","qlCommonConflict":"Közös ütközés","qlHallPair":"Foglalt pár","qlHallTriple":"Foglalt hármas","qlHallGroup":"Foglalt csoport","qlCapacity":"Helyi kapacitás","qlNoSupport":"Nincs lehetséges támasz","qlMixedHall":"Vegyes foglalt csoport","qlContradiction":"Ellentmondásos bizonyítás","qlNoDeduction":"A jelenlegi látható állapotból nincs bizonyítható következtetés. A végső megoldásból nem veszünk át lépést."});
Object.assign(I18N.ga,{"qlSingleton":"Suíomh uathúil","qlLocked":"Aonad curtha in áirithe","qlCommonConflict":"Coimhlint choiteann","qlHallPair":"Péire curtha in áirithe","qlHallTriple":"Triúr curtha in áirithe","qlHallGroup":"Grúpa curtha in áirithe","qlCapacity":"Toilleadh áitiúil","qlNoSupport":"Gan tacaíocht fágtha","qlMixedHall":"Grúpa measctha curtha in áirithe","qlContradiction":"Réasúnaíocht trí bhréagnú","qlNoDeduction":"Níl aon asbhaint inchruthaithe ar fáil ón staid infheicthe reatha. Ní ghlactar aon bhogadh ón réiteach deiridh."});
Object.assign(I18N.it,{"qlSingleton":"Posizione unica","qlLocked":"Unità riservata","qlCommonConflict":"Conflitto comune","qlHallPair":"Coppia riservata","qlHallTriple":"Tripla riservata","qlHallGroup":"Gruppo riservato","qlCapacity":"Capacità locale","qlNoSupport":"Nessun supporto possibile","qlMixedHall":"Gruppo misto riservato","qlContradiction":"Ragionamento per contraddizione","qlNoDeduction":"Nello stato visibile attuale non è disponibile alcuna deduzione dimostrabile. Nessuna mossa viene ricavata dalla soluzione finale."});
Object.assign(I18N.lv,{"qlSingleton":"Vienīgā pozīcija","qlLocked":"Rezervēta vienība","qlCommonConflict":"Kopīgs konflikts","qlHallPair":"Rezervēts pāris","qlHallTriple":"Rezervēts trijnieks","qlHallGroup":"Rezervēta grupa","qlCapacity":"Lokālā ietilpība","qlNoSupport":"Nav iespējama atbalsta","qlMixedHall":"Jaukta rezervēta grupa","qlContradiction":"Pamatojums ar pretrunu","qlNoDeduction":"Pašreizējā redzamajā stāvoklī nav pierādāma secinājuma. Neviens gājiens netiek ņemts no gala risinājuma."});
Object.assign(I18N.lt,{"qlSingleton":"Vienintelė vieta","qlLocked":"Rezervuotas vienetas","qlCommonConflict":"Bendras konfliktas","qlHallPair":"Rezervuota pora","qlHallTriple":"Rezervuotas trejetas","qlHallGroup":"Rezervuota grupė","qlCapacity":"Vietinė talpa","qlNoSupport":"Nėra galimos atramos","qlMixedHall":"Mišri rezervuota grupė","qlContradiction":"Įrodymas prieštaravimu","qlNoDeduction":"Dabartinėje matomoje būsenoje nėra įrodomos išvados. Joks ėjimas neimamas iš galutinio sprendimo."});
Object.assign(I18N.mt,{"qlSingleton":"Pożizzjoni unika","qlLocked":"Unità riżervata","qlCommonConflict":"Kunflitt komuni","qlHallPair":"Par riżervat","qlHallTriple":"Tlieta riżervati","qlHallGroup":"Grupp riżervat","qlCapacity":"Kapaċità lokali","qlNoSupport":"Ebda appoġġ possibbli","qlMixedHall":"Grupp imħallat riżervat","qlContradiction":"Raġunament b’kontradizzjoni","qlNoDeduction":"M’hemm l-ebda deduzzjoni li tista’ tiġi ppruvata mill-istat viżibbli attwali. L-ebda mossa ma tittieħed mis-soluzzjoni finali."});
Object.assign(I18N.pl,{"qlSingleton":"Jedyna pozycja","qlLocked":"Zarezerwowana jednostka","qlCommonConflict":"Wspólny konflikt","qlHallPair":"Zarezerwowana para","qlHallTriple":"Zarezerwowana trójka","qlHallGroup":"Zarezerwowana grupa","qlCapacity":"Lokalna pojemność","qlNoSupport":"Brak możliwego wsparcia","qlMixedHall":"Mieszana grupa zarezerwowana","qlContradiction":"Rozumowanie przez sprzeczność","qlNoDeduction":"W obecnym widocznym stanie nie ma dostępnej dowodliwej dedukcji. Żaden ruch nie jest pobierany z końcowego rozwiązania."});
Object.assign(I18N.ro,{"qlSingleton":"Poziție unică","qlLocked":"Unitate rezervată","qlCommonConflict":"Conflict comun","qlHallPair":"Pereche rezervată","qlHallTriple":"Triplet rezervat","qlHallGroup":"Grup rezervat","qlCapacity":"Capacitate locală","qlNoSupport":"Fără suport posibil","qlMixedHall":"Grup mixt rezervat","qlContradiction":"Raționament prin contradicție","qlNoDeduction":"Nu există nicio deducție demonstrabilă din starea vizibilă curentă. Nicio mutare nu este luată din soluția finală."});
Object.assign(I18N.sk,{"qlSingleton":"Jediná pozícia","qlLocked":"Vyhradená jednotka","qlCommonConflict":"Spoločný konflikt","qlHallPair":"Vyhradená dvojica","qlHallTriple":"Vyhradená trojica","qlHallGroup":"Vyhradená skupina","qlCapacity":"Miestna kapacita","qlNoSupport":"Žiadna možná podpora","qlMixedHall":"Zmiešaná vyhradená skupina","qlContradiction":"Dôkaz sporom","qlNoDeduction":"V aktuálne viditeľnom stave nie je dostupná žiadna dokázateľná dedukcia. Žiadny ťah sa nepreberá z konečného riešenia."});
Object.assign(I18N.sl,{"qlSingleton":"Edini položaj","qlLocked":"Rezervirana enota","qlCommonConflict":"Skupni konflikt","qlHallPair":"Rezerviran par","qlHallTriple":"Rezervirana trojica","qlHallGroup":"Rezervirana skupina","qlCapacity":"Lokalna kapaciteta","qlNoSupport":"Ni možne podpore","qlMixedHall":"Mešana rezervirana skupina","qlContradiction":"Sklepanje s protislovjem","qlNoDeduction":"V trenutnem vidnem stanju ni dokazljive dedukcije. Nobena poteza ni vzeta iz končne rešitve."});
Object.assign(I18N.sv,{"qlSingleton":"Unik position","qlLocked":"Reserverad enhet","qlCommonConflict":"Gemensam konflikt","qlHallPair":"Reserverat par","qlHallTriple":"Reserverad trippel","qlHallGroup":"Reserverad grupp","qlCapacity":"Lokal kapacitet","qlNoSupport":"Inget möjligt stöd","qlMixedHall":"Blandad reserverad grupp","qlContradiction":"Motsägelsebevis","qlNoDeduction":"Det finns ingen bevisbar deduktion i det aktuella synliga läget. Inget drag hämtas från den slutliga lösningen."});

/* v2.21.18 — Grille 6 inference-engine Coach wording (FR/EN prose; 28 other locales use localized titles + symbolic proofs) */
Object.assign(I18N.en,{"slgBox":"2×3 block","slgNakedSingle":"Single candidate","slgHiddenRow":"Unique position in a row","slgHiddenColumn":"Unique position in a column","slgHiddenBox":"Unique position in a block","slgLockedCandidate":"Locked candidate","slgNakedPair":"Naked pair","slgHiddenPair":"Hidden pair","slgNakedTriple":"Naked triple","slgHiddenTriple":"Hidden triple","slgContradictionL1":"Contradiction — level 1","slgCommonConsequence":"Common consequence","slgContradictionL2":"Nested contradiction — level 2","slgNoDeduction":"No digit is currently demonstrable by the Grille 6 inference engine. No digit is taken from the final solution.","slgOrientCell":"Look at {cell} and its visible constraints.","slgOrientUnit":"Look at {unit}.","slgOrientLocked":"Compare {source} with {target}.","slgOrientContradiction":"Test the candidates of {cell}.","slgOrientCommon":"Compare every candidate branch of {cell}.","slgExplainNaked":"At {cell}, candidates {eliminated} are already excluded by demonstrated facts. Only {value} remains.","slgExplainHidden":"In {unit}, digit {value} has only one possible position: {cell}.","slgExplainLocked":"In {source}, candidate {value} is confined to {sourceCells}. It can therefore be removed from {targets} in {target}.","slgExplainNakedSubset":"In {unit}, cells {cells} are restricted to candidates {values}. Those candidates can therefore be removed from the other cells of the unit.","slgExplainHiddenSubset":"In {unit}, values {values} can occur only in {cells}. Every other candidate can therefore be removed from those cells.","slgExplainContradiction":"Assume {cell} = {value}. Deterministic propagation leads to {reason}. The assumption is impossible.","slgExplainNested":"Assume {cell} = {value}. After deterministic propagation, {nestedCell} must be tested: every remaining candidate there leads to a contradiction ({reasons}). The first assumption is therefore impossible.","slgExplainCommon":"Whatever candidate is chosen at {branchCell} ({values}), every compatible branch demonstrates {fact}.","slgSupportChain":"The proof then applies {count} further demonstrated elimination step(s): {rules}.","slgFinalSingle":"After these proven eliminations, {cell} is forced to {value}.","slgFactValue":"{cell} = {value}","slgFactNotCandidate":"{value} is impossible at {cell}","slgContrC1":"a duplicate {value} appears in {unit}","slgContrC2":"{cell} has no candidate left","slgContrC3":"digit {value} has no possible position in {unit}","slgContrC4":"the value {value} at {cell} conflicts with an already demonstrated elimination","slgPlaceDigitAt":"Place digit {value} at {cell}."});
Object.assign(I18N.fr,{"slgBox":"bloc 2×3","slgNakedSingle":"Candidat unique","slgHiddenRow":"Position unique dans une ligne","slgHiddenColumn":"Position unique dans une colonne","slgHiddenBox":"Position unique dans un bloc","slgLockedCandidate":"Candidat verrouillé","slgNakedPair":"Paire nue","slgHiddenPair":"Paire cachée","slgNakedTriple":"Triplet nu","slgHiddenTriple":"Triplet caché","slgContradictionL1":"Contradiction — niveau 1","slgCommonConsequence":"Conséquence commune","slgContradictionL2":"Contradiction imbriquée — niveau 2","slgNoDeduction":"Aucun chiffre n’est actuellement démontrable par le moteur d’inférences de Grille 6. Aucun chiffre n’est tiré de la solution finale.","slgOrientCell":"Regarde {cell} et ses contraintes visibles.","slgOrientUnit":"Regarde {unit}.","slgOrientLocked":"Compare {source} avec {target}.","slgOrientContradiction":"Teste les candidats de {cell}.","slgOrientCommon":"Compare toutes les branches candidates de {cell}.","slgExplainNaked":"En {cell}, les candidats {eliminated} sont déjà exclus par des faits démontrés. Il ne reste que {value}.","slgExplainHidden":"Dans {unit}, le chiffre {value} n’a plus qu’une seule position possible : {cell}.","slgExplainLocked":"Dans {source}, le candidat {value} est limité à {sourceCells}. Il peut donc être éliminé de {targets} dans {target}.","slgExplainNakedSubset":"Dans {unit}, les cases {cells} sont limitées aux candidats {values}. Ces candidats peuvent donc être éliminés des autres cases de l’unité.","slgExplainHiddenSubset":"Dans {unit}, les valeurs {values} ne peuvent apparaître que dans {cells}. Tous les autres candidats peuvent donc être éliminés de ces cases.","slgExplainContradiction":"Supposons {cell} = {value}. La propagation déterministe conduit à {reason}. L’hypothèse est impossible.","slgExplainNested":"Supposons {cell} = {value}. Après propagation déterministe, il faut tester {nestedCell} : chacun de ses candidats restants conduit à une contradiction ({reasons}). L’hypothèse de départ est donc impossible.","slgExplainCommon":"Quel que soit le candidat choisi en {branchCell} ({values}), chaque branche compatible démontre {fact}.","slgSupportChain":"La preuve applique ensuite {count} autre(s) étape(s) d’élimination démontrée(s) : {rules}.","slgFinalSingle":"Après ces éliminations démontrées, {cell} est imposée à {value}.","slgFactValue":"{cell} = {value}","slgFactNotCandidate":"{value} est impossible en {cell}","slgContrC1":"un doublon de {value} apparaît dans {unit}","slgContrC2":"{cell} n’a plus aucun candidat","slgContrC3":"le chiffre {value} n’a plus aucune position possible dans {unit}","slgContrC4":"la valeur {value} en {cell} contredit une élimination déjà démontrée","slgPlaceDigitAt":"Place le chiffre {value} en {cell}."});
const SUDOKU_LOGIC_SYMBOLIC_I18N={
 slgOrientCell:'{cell} · ⌖',slgOrientUnit:'{unit} · ⌖',slgOrientLocked:'{source} → {target}',slgOrientContradiction:'{cell} · ?',slgOrientCommon:'{cell} · ⇄',
 slgExplainNaked:'{cell}: ✕ {eliminated} ⇒ {value} ✓',slgExplainHidden:'{unit}: {value} ⇒ {cell} ✓',slgExplainLocked:'{source}: {value} ∈ {sourceCells} ⇒ {target}: ✕ {targets}',
 slgExplainNakedSubset:'{unit}: {cells} ⇔ {values}; {values} ✕ ∉ {cells}',slgExplainHiddenSubset:'{unit}: {values} ⇔ {cells}; {cells}: ∉ {values} ✕',
 slgExplainContradiction:'{cell}={value} ⇒ {reason} ⇒ ✕',slgExplainNested:'{cell}={value} ⇒ {nestedCell}? ⇒ {reasons} ⇒ ✕',slgExplainCommon:'{branchCell}∈{values} ⇒ {fact}',
 slgSupportChain:'+{count} ⇒ {rules}',slgFinalSingle:'{cell} ⇒ {value} ✓',slgFactValue:'{cell}={value}',slgFactNotCandidate:'{cell}≠{value}',
 slgContrC1:'{unit}: {value} ×2',slgContrC2:'{cell}: ∅',slgContrC3:'{unit}: {value} → ∅',slgContrC4:'{cell}: {value} ↯',slgPlaceDigitAt:'{value} → {cell} ✓'
};
const SUDOKU_LOGIC_TITLES={
 zh:{slgBox:'2×3 宫',slgNakedSingle:'唯一候选',slgHiddenRow:'行内唯一位置',slgHiddenColumn:'列内唯一位置',slgHiddenBox:'宫内唯一位置',slgLockedCandidate:'锁定候选',slgNakedPair:'显性数对',slgHiddenPair:'隐性数对',slgNakedTriple:'显性三数组',slgHiddenTriple:'隐性三数组',slgContradictionL1:'反证 — 第1层',slgCommonConsequence:'共同结论',slgContradictionL2:'嵌套反证 — 第2层',slgNoDeduction:'当前没有可由 Grille 6 推理引擎证明的数字；不会从最终答案中取值。'},
 hi:{slgBox:'2×3 खंड',slgNakedSingle:'एकमात्र उम्मीदवार',slgHiddenRow:'पंक्ति में एकमात्र स्थान',slgHiddenColumn:'स्तंभ में एकमात्र स्थान',slgHiddenBox:'खंड में एकमात्र स्थान',slgLockedCandidate:'बंद उम्मीदवार',slgNakedPair:'खुली जोड़ी',slgHiddenPair:'छिपी जोड़ी',slgNakedTriple:'खुला त्रिक',slgHiddenTriple:'छिपा त्रिक',slgContradictionL1:'विरोधाभास — स्तर 1',slgCommonConsequence:'साझा परिणाम',slgContradictionL2:'नेस्टेड विरोधाभास — स्तर 2',slgNoDeduction:'Grille 6 तर्क इंजन अभी कोई अंक सिद्ध नहीं कर सकता; अंतिम समाधान से कोई अंक नहीं लिया जाता।'},
 es:{slgBox:'bloque 2×3',slgNakedSingle:'Candidato único',slgHiddenRow:'Posición única en una fila',slgHiddenColumn:'Posición única en una columna',slgHiddenBox:'Posición única en un bloque',slgLockedCandidate:'Candidato bloqueado',slgNakedPair:'Pareja desnuda',slgHiddenPair:'Pareja oculta',slgNakedTriple:'Trío desnudo',slgHiddenTriple:'Trío oculto',slgContradictionL1:'Contradicción — nivel 1',slgCommonConsequence:'Consecuencia común',slgContradictionL2:'Contradicción anidada — nivel 2',slgNoDeduction:'El motor de inferencia de Grille 6 no puede demostrar ningún dígito ahora; no se toma ninguno de la solución final.'},
 ar:{slgBox:'كتلة 2×3',slgNakedSingle:'مرشح وحيد',slgHiddenRow:'موضع وحيد في صف',slgHiddenColumn:'موضع وحيد في عمود',slgHiddenBox:'موضع وحيد في كتلة',slgLockedCandidate:'مرشح مقفل',slgNakedPair:'زوج ظاهر',slgHiddenPair:'زوج مخفي',slgNakedTriple:'ثلاثي ظاهر',slgHiddenTriple:'ثلاثي مخفي',slgContradictionL1:'تناقض — المستوى 1',slgCommonConsequence:'نتيجة مشتركة',slgContradictionL2:'تناقض متداخل — المستوى 2',slgNoDeduction:'لا يستطيع محرك استدلال Grille 6 إثبات أي رقم الآن؛ ولا يُؤخذ أي رقم من الحل النهائي.'},
 bn:{slgBox:'2×3 ব্লক',slgNakedSingle:'একমাত্র প্রার্থী',slgHiddenRow:'সারিতে একমাত্র অবস্থান',slgHiddenColumn:'কলামে একমাত্র অবস্থান',slgHiddenBox:'ব্লকে একমাত্র অবস্থান',slgLockedCandidate:'লক করা প্রার্থী',slgNakedPair:'খোলা জোড়া',slgHiddenPair:'লুকানো জোড়া',slgNakedTriple:'খোলা ত্রয়ী',slgHiddenTriple:'লুকানো ত্রয়ী',slgContradictionL1:'বিরোধাভাস — স্তর 1',slgCommonConsequence:'সাধারণ পরিণতি',slgContradictionL2:'নেস্টেড বিরোধাভাস — স্তর 2',slgNoDeduction:'Grille 6 ইনফারেন্স ইঞ্জিন এখন কোনো সংখ্যা প্রমাণ করতে পারে না; চূড়ান্ত সমাধান থেকে কোনো সংখ্যা নেওয়া হয় না।'},
 pt:{slgBox:'bloco 2×3',slgNakedSingle:'Candidato único',slgHiddenRow:'Posição única numa linha',slgHiddenColumn:'Posição única numa coluna',slgHiddenBox:'Posição única num bloco',slgLockedCandidate:'Candidato bloqueado',slgNakedPair:'Par nu',slgHiddenPair:'Par oculto',slgNakedTriple:'Trio nu',slgHiddenTriple:'Trio oculto',slgContradictionL1:'Contradição — nível 1',slgCommonConsequence:'Consequência comum',slgContradictionL2:'Contradição aninhada — nível 2',slgNoDeduction:'O motor de inferência de Grille 6 não consegue demonstrar nenhum dígito agora; nenhum é retirado da solução final.'},
 id:{slgBox:'blok 2×3',slgNakedSingle:'Kandidat tunggal',slgHiddenRow:'Posisi tunggal pada baris',slgHiddenColumn:'Posisi tunggal pada kolom',slgHiddenBox:'Posisi tunggal pada blok',slgLockedCandidate:'Kandidat terkunci',slgNakedPair:'Pasangan telanjang',slgHiddenPair:'Pasangan tersembunyi',slgNakedTriple:'Tripel telanjang',slgHiddenTriple:'Tripel tersembunyi',slgContradictionL1:'Kontradiksi — tingkat 1',slgCommonConsequence:'Konsekuensi bersama',slgContradictionL2:'Kontradiksi bertingkat — tingkat 2',slgNoDeduction:'Mesin inferensi Grille 6 belum dapat membuktikan digit apa pun; tidak ada digit yang diambil dari solusi akhir.'},
 ur:{slgBox:'2×3 بلاک',slgNakedSingle:'واحد امیدوار',slgHiddenRow:'قطار میں واحد مقام',slgHiddenColumn:'کالم میں واحد مقام',slgHiddenBox:'بلاک میں واحد مقام',slgLockedCandidate:'مقفل امیدوار',slgNakedPair:'ظاہر جوڑا',slgHiddenPair:'پوشیدہ جوڑا',slgNakedTriple:'ظاہر سہ گانہ',slgHiddenTriple:'پوشیدہ سہ گانہ',slgContradictionL1:'تضاد — درجہ 1',slgCommonConsequence:'مشترک نتیجہ',slgContradictionL2:'داخلی تضاد — درجہ 2',slgNoDeduction:'Grille 6 استدلالی انجن ابھی کوئی ہندسہ ثابت نہیں کر سکتا؛ آخری حل سے کوئی ہندسہ نہیں لیا جاتا۔'},
 bg:{slgBox:'блок 2×3',slgNakedSingle:'Единствен кандидат',slgHiddenRow:'Единствена позиция в ред',slgHiddenColumn:'Единствена позиция в колона',slgHiddenBox:'Единствена позиция в блок',slgLockedCandidate:'Заключен кандидат',slgNakedPair:'Гола двойка',slgHiddenPair:'Скрита двойка',slgNakedTriple:'Гола тройка',slgHiddenTriple:'Скрита тройка',slgContradictionL1:'Противоречие — ниво 1',slgCommonConsequence:'Общо следствие',slgContradictionL2:'Вложено противоречие — ниво 2',slgNoDeduction:'Двигателят за изводи на Grille 6 в момента не може да докаже цифра; не се взема цифра от крайното решение.'},
 hr:{slgBox:'blok 2×3',slgNakedSingle:'Jedini kandidat',slgHiddenRow:'Jedina pozicija u retku',slgHiddenColumn:'Jedina pozicija u stupcu',slgHiddenBox:'Jedina pozicija u bloku',slgLockedCandidate:'Zaključani kandidat',slgNakedPair:'Goli par',slgHiddenPair:'Skriveni par',slgNakedTriple:'Gola trojka',slgHiddenTriple:'Skrivena trojka',slgContradictionL1:'Proturječje — razina 1',slgCommonConsequence:'Zajednička posljedica',slgContradictionL2:'Ugniježđeno proturječje — razina 2',slgNoDeduction:'Mehanizam zaključivanja Grille 6 trenutačno ne može dokazati nijednu znamenku; nijedna se ne uzima iz konačnog rješenja.'},
 cs:{slgBox:'blok 2×3',slgNakedSingle:'Jediný kandidát',slgHiddenRow:'Jediná pozice v řádku',slgHiddenColumn:'Jediná pozice ve sloupci',slgHiddenBox:'Jediná pozice v bloku',slgLockedCandidate:'Uzamčený kandidát',slgNakedPair:'Nahá dvojice',slgHiddenPair:'Skrytá dvojice',slgNakedTriple:'Nahá trojice',slgHiddenTriple:'Skrytá trojice',slgContradictionL1:'Spor — úroveň 1',slgCommonConsequence:'Společný důsledek',slgContradictionL2:'Vnořený spor — úroveň 2',slgNoDeduction:'Inferenční modul Grille 6 nyní nedokáže žádnou číslici; žádná se nebere z konečného řešení.'},
 da:{slgBox:'2×3-blok',slgNakedSingle:'Eneste kandidat',slgHiddenRow:'Eneste placering i en række',slgHiddenColumn:'Eneste placering i en kolonne',slgHiddenBox:'Eneste placering i en blok',slgLockedCandidate:'Låst kandidat',slgNakedPair:'Nøgent par',slgHiddenPair:'Skjult par',slgNakedTriple:'Nøgen tripel',slgHiddenTriple:'Skjult tripel',slgContradictionL1:'Modstrid — niveau 1',slgCommonConsequence:'Fælles konsekvens',slgContradictionL2:'Indlejret modstrid — niveau 2',slgNoDeduction:'Grille 6-inferensmotoren kan ikke bevise et ciffer lige nu; intet ciffer hentes fra den endelige løsning.'},
 nl:{slgBox:'2×3-blok',slgNakedSingle:'Enige kandidaat',slgHiddenRow:'Unieke positie in een rij',slgHiddenColumn:'Unieke positie in een kolom',slgHiddenBox:'Unieke positie in een blok',slgLockedCandidate:'Vergrendelde kandidaat',slgNakedPair:'Naakt paar',slgHiddenPair:'Verborgen paar',slgNakedTriple:'Naakt drietal',slgHiddenTriple:'Verborgen drietal',slgContradictionL1:'Tegenspraak — niveau 1',slgCommonConsequence:'Gemeenschappelijk gevolg',slgContradictionL2:'Geneste tegenspraak — niveau 2',slgNoDeduction:'De inferentiemotor van Grille 6 kan nu geen cijfer bewijzen; er wordt geen cijfer uit de eindoplossing gehaald.'},
 et:{slgBox:'2×3 plokk',slgNakedSingle:'Ainus kandidaat',slgHiddenRow:'Ainus koht reas',slgHiddenColumn:'Ainus koht veerus',slgHiddenBox:'Ainus koht plokis',slgLockedCandidate:'Lukustatud kandidaat',slgNakedPair:'Paljas paar',slgHiddenPair:'Peidetud paar',slgNakedTriple:'Paljas kolmik',slgHiddenTriple:'Peidetud kolmik',slgContradictionL1:'Vastuolu — tase 1',slgCommonConsequence:'Ühine järeldus',slgContradictionL2:'Pesastatud vastuolu — tase 2',slgNoDeduction:'Grille 6 järeldusmootor ei suuda praegu ühtegi numbrit tõestada; lõplikust lahendusest numbrit ei võeta.'},
 fi:{slgBox:'2×3-lohko',slgNakedSingle:'Ainoa ehdokas',slgHiddenRow:'Ainoa paikka rivillä',slgHiddenColumn:'Ainoa paikka sarakkeessa',slgHiddenBox:'Ainoa paikka lohkossa',slgLockedCandidate:'Lukittu ehdokas',slgNakedPair:'Paljas pari',slgHiddenPair:'Piilotettu pari',slgNakedTriple:'Paljas kolmikko',slgHiddenTriple:'Piilotettu kolmikko',slgContradictionL1:'Ristiriita — taso 1',slgCommonConsequence:'Yhteinen seuraus',slgContradictionL2:'Sisäkkäinen ristiriita — taso 2',slgNoDeduction:'Grille 6 -päättelymoottori ei nyt pysty todistamaan mitään numeroa; lopullisesta ratkaisusta ei oteta numeroita.'},
 de:{slgBox:'2×3-Block',slgNakedSingle:'Einzelkandidat',slgHiddenRow:'Einzige Position in einer Zeile',slgHiddenColumn:'Einzige Position in einer Spalte',slgHiddenBox:'Einzige Position in einem Block',slgLockedCandidate:'Gesperrter Kandidat',slgNakedPair:'Nacktes Paar',slgHiddenPair:'Verstecktes Paar',slgNakedTriple:'Nacktes Tripel',slgHiddenTriple:'Verstecktes Tripel',slgContradictionL1:'Widerspruch — Stufe 1',slgCommonConsequence:'Gemeinsame Folgerung',slgContradictionL2:'Verschachtelter Widerspruch — Stufe 2',slgNoDeduction:'Die Grille-6-Inferenz kann derzeit keine Ziffer beweisen; keine Ziffer wird aus der Endlösung übernommen.'},
 el:{slgBox:'μπλοκ 2×3',slgNakedSingle:'Μοναδικός υποψήφιος',slgHiddenRow:'Μοναδική θέση σε γραμμή',slgHiddenColumn:'Μοναδική θέση σε στήλη',slgHiddenBox:'Μοναδική θέση σε μπλοκ',slgLockedCandidate:'Κλειδωμένος υποψήφιος',slgNakedPair:'Γυμνό ζεύγος',slgHiddenPair:'Κρυφό ζεύγος',slgNakedTriple:'Γυμνή τριάδα',slgHiddenTriple:'Κρυφή τριάδα',slgContradictionL1:'Αντίφαση — επίπεδο 1',slgCommonConsequence:'Κοινό συμπέρασμα',slgContradictionL2:'Ένθετη αντίφαση — επίπεδο 2',slgNoDeduction:'Η μηχανή συμπερασμού Grille 6 δεν μπορεί τώρα να αποδείξει ψηφίο· κανένα ψηφίο δεν λαμβάνεται από την τελική λύση.'},
 hu:{slgBox:'2×3 blokk',slgNakedSingle:'Egyetlen jelölt',slgHiddenRow:'Egyetlen hely egy sorban',slgHiddenColumn:'Egyetlen hely egy oszlopban',slgHiddenBox:'Egyetlen hely egy blokkban',slgLockedCandidate:'Zárolt jelölt',slgNakedPair:'Nyílt pár',slgHiddenPair:'Rejtett pár',slgNakedTriple:'Nyílt hármas',slgHiddenTriple:'Rejtett hármas',slgContradictionL1:'Ellentmondás — 1. szint',slgCommonConsequence:'Közös következmény',slgContradictionL2:'Beágyazott ellentmondás — 2. szint',slgNoDeduction:'A Grille 6 következtetőmotor jelenleg nem tud számjegyet bizonyítani; a végső megoldásból nem vesz át számjegyet.'},
 ga:{slgBox:'bloc 2×3',slgNakedSingle:'Iarrthóir aonair',slgHiddenRow:'Aon suíomh amháin i ró',slgHiddenColumn:'Aon suíomh amháin i gcolún',slgHiddenBox:'Aon suíomh amháin i mbloc',slgLockedCandidate:'Iarrthóir faoi ghlas',slgNakedPair:'Péire nocht',slgHiddenPair:'Péire folaithe',slgNakedTriple:'Triúr nocht',slgHiddenTriple:'Triúr folaithe',slgContradictionL1:'Contrárthacht — leibhéal 1',slgCommonConsequence:'Iarmhairt choiteann',slgContradictionL2:'Contrárthacht neadaithe — leibhéal 2',slgNoDeduction:'Ní féidir le hinneall tátail Grille 6 aon digit a chruthú anois; ní thógtar digit ar bith ón réiteach deiridh.'},
 it:{slgBox:'blocco 2×3',slgNakedSingle:'Candidato unico',slgHiddenRow:'Posizione unica in una riga',slgHiddenColumn:'Posizione unica in una colonna',slgHiddenBox:'Posizione unica in un blocco',slgLockedCandidate:'Candidato bloccato',slgNakedPair:'Coppia nuda',slgHiddenPair:'Coppia nascosta',slgNakedTriple:'Terna nuda',slgHiddenTriple:'Terna nascosta',slgContradictionL1:'Contraddizione — livello 1',slgCommonConsequence:'Conseguenza comune',slgContradictionL2:'Contraddizione annidata — livello 2',slgNoDeduction:'Il motore di inferenza di Grille 6 non può dimostrare alcuna cifra al momento; nessuna cifra viene presa dalla soluzione finale.'},
 lv:{slgBox:'2×3 bloks',slgNakedSingle:'Vienīgais kandidāts',slgHiddenRow:'Vienīgā vieta rindā',slgHiddenColumn:'Vienīgā vieta kolonnā',slgHiddenBox:'Vienīgā vieta blokā',slgLockedCandidate:'Bloķēts kandidāts',slgNakedPair:'Atklāts pāris',slgHiddenPair:'Slēpts pāris',slgNakedTriple:'Atklāts trijnieks',slgHiddenTriple:'Slēpts trijnieks',slgContradictionL1:'Pretruna — 1. līmenis',slgCommonConsequence:'Kopīga sekas',slgContradictionL2:'Ligzdota pretruna — 2. līmenis',slgNoDeduction:'Grille 6 secināšanas dzinējs pašlaik nevar pierādīt nevienu ciparu; neviens cipars netiek ņemts no gala risinājuma.'},
 lt:{slgBox:'2×3 blokas',slgNakedSingle:'Vienintelis kandidatas',slgHiddenRow:'Vienintelė vieta eilutėje',slgHiddenColumn:'Vienintelė vieta stulpelyje',slgHiddenBox:'Vienintelė vieta bloke',slgLockedCandidate:'Užrakintas kandidatas',slgNakedPair:'Atvira pora',slgHiddenPair:'Paslėpta pora',slgNakedTriple:'Atviras trejetas',slgHiddenTriple:'Paslėptas trejetas',slgContradictionL1:'Prieštara — 1 lygis',slgCommonConsequence:'Bendra pasekmė',slgContradictionL2:'Įdėtinė prieštara — 2 lygis',slgNoDeduction:'Grille 6 išvedimo variklis šiuo metu negali įrodyti jokio skaitmens; iš galutinio sprendimo skaitmenys neimami.'},
 mt:{slgBox:'blokka 2×3',slgNakedSingle:'Kandidat uniku',slgHiddenRow:'Pożizzjoni unika f’ringiela',slgHiddenColumn:'Pożizzjoni unika f’kolonna',slgHiddenBox:'Pożizzjoni unika fi blokka',slgLockedCandidate:'Kandidat imsakkar',slgNakedPair:'Par miftuħ',slgHiddenPair:'Par moħbi',slgNakedTriple:'Tlieta miftuħa',slgHiddenTriple:'Tlieta moħbija',slgContradictionL1:'Kontradizzjoni — livell 1',slgCommonConsequence:'Konsegwenza komuni',slgContradictionL2:'Kontradizzjoni mdaħħla — livell 2',slgNoDeduction:'Il-magna ta’ inferenza ta’ Grille 6 bħalissa ma tistax tipprova ċifra; ebda ċifra ma tittieħed mis-soluzzjoni finali.'},
 pl:{slgBox:'blok 2×3',slgNakedSingle:'Jedyny kandydat',slgHiddenRow:'Jedyne miejsce w wierszu',slgHiddenColumn:'Jedyne miejsce w kolumnie',slgHiddenBox:'Jedyne miejsce w bloku',slgLockedCandidate:'Zablokowany kandydat',slgNakedPair:'Naga para',slgHiddenPair:'Ukryta para',slgNakedTriple:'Naga trójka',slgHiddenTriple:'Ukryta trójka',slgContradictionL1:'Sprzeczność — poziom 1',slgCommonConsequence:'Wspólna konsekwencja',slgContradictionL2:'Zagnieżdżona sprzeczność — poziom 2',slgNoDeduction:'Silnik wnioskowania Grille 6 nie może obecnie dowieść żadnej cyfry; żadna cyfra nie jest pobierana z końcowego rozwiązania.'},
 ro:{slgBox:'bloc 2×3',slgNakedSingle:'Candidat unic',slgHiddenRow:'Poziție unică pe un rând',slgHiddenColumn:'Poziție unică pe o coloană',slgHiddenBox:'Poziție unică într-un bloc',slgLockedCandidate:'Candidat blocat',slgNakedPair:'Pereche deschisă',slgHiddenPair:'Pereche ascunsă',slgNakedTriple:'Triplet deschis',slgHiddenTriple:'Triplet ascuns',slgContradictionL1:'Contradicție — nivel 1',slgCommonConsequence:'Consecință comună',slgContradictionL2:'Contradicție imbricată — nivel 2',slgNoDeduction:'Motorul de inferență Grille 6 nu poate demonstra momentan nicio cifră; nicio cifră nu este luată din soluția finală.'},
 sk:{slgBox:'blok 2×3',slgNakedSingle:'Jediný kandidát',slgHiddenRow:'Jediná pozícia v riadku',slgHiddenColumn:'Jediná pozícia v stĺpci',slgHiddenBox:'Jediná pozícia v bloku',slgLockedCandidate:'Uzamknutý kandidát',slgNakedPair:'Nahý pár',slgHiddenPair:'Skrytý pár',slgNakedTriple:'Nahá trojica',slgHiddenTriple:'Skrytá trojica',slgContradictionL1:'Spor — úroveň 1',slgCommonConsequence:'Spoločný dôsledok',slgContradictionL2:'Vnorený spor — úroveň 2',slgNoDeduction:'Inferenčný modul Grille 6 teraz nedokáže žiadnu číslicu; žiadna sa neberie z konečného riešenia.'},
 sl:{slgBox:'blok 2×3',slgNakedSingle:'Edini kandidat',slgHiddenRow:'Edini položaj v vrstici',slgHiddenColumn:'Edini položaj v stolpcu',slgHiddenBox:'Edini položaj v bloku',slgLockedCandidate:'Zaklenjeni kandidat',slgNakedPair:'Goli par',slgHiddenPair:'Skriti par',slgNakedTriple:'Gola trojica',slgHiddenTriple:'Skrita trojica',slgContradictionL1:'Protislovje — raven 1',slgCommonConsequence:'Skupna posledica',slgContradictionL2:'Gnezdeno protislovje — raven 2',slgNoDeduction:'Sklepalni mehanizem Grille 6 trenutno ne more dokazati nobene števke; nobena se ne vzame iz končne rešitve.'},
 sv:{slgBox:'2×3-block',slgNakedSingle:'Enda kandidat',slgHiddenRow:'Enda position i en rad',slgHiddenColumn:'Enda position i en kolumn',slgHiddenBox:'Enda position i ett block',slgLockedCandidate:'Låst kandidat',slgNakedPair:'Nakent par',slgHiddenPair:'Dolt par',slgNakedTriple:'Naken trippel',slgHiddenTriple:'Dold trippel',slgContradictionL1:'Motsägelse — nivå 1',slgCommonConsequence:'Gemensam konsekvens',slgContradictionL2:'Nästlad motsägelse — nivå 2',slgNoDeduction:'Grille 6:s inferensmotor kan inte bevisa någon siffra just nu; ingen siffra hämtas från den slutliga lösningen.'}
};
for(const code of SUPPORTED_LANGS)if(code!=='en'&&code!=='fr')Object.assign(I18N[code],SUDOKU_LOGIC_SYMBOLIC_I18N,SUDOKU_LOGIC_TITLES[code]||{});
/* v2.21.11 — Soleil/Lune proof-engine UI terminology */
Object.assign(I18N.en,{"tlgRelationPropagation":"Relation propagation","tlgTriple":"Rule of three","tlgBalanceQuota":"Row/column balance","tlgBalanceRelation":"Opposite pair","tlgRelationBalance":"Relation and balance","tlgRelationComponent":"Relation chain","tlgDomain":"Combined line constraints","tlgContradiction":"Reasoning by contradiction","tlgCommon":"Common consequence","tlgNoDeduction":"No demonstrable deduction is available from the current visible state. No move is taken from the final solution.","tlgSame":"same","tlgOpposite":"opposite","tlgRelations":"relations"});
Object.assign(I18N.fr,{"tlgRelationPropagation":"Propagation d’une relation","tlgTriple":"Règle des trois","tlgBalanceQuota":"Équilibre ligne/colonne","tlgBalanceRelation":"Paire opposée","tlgRelationBalance":"Relation et équilibre","tlgRelationComponent":"Chaîne de relations","tlgDomain":"Contraintes combinées de la ligne","tlgContradiction":"Raisonnement par contradiction","tlgCommon":"Conséquence commune","tlgNoDeduction":"Aucune déduction démontrable n’est disponible dans l’état visible actuel. Aucun coup n’est pris dans la solution finale.","tlgSame":"identiques","tlgOpposite":"opposées","tlgRelations":"relations"});
Object.assign(I18N.zh,{"tlgRelationPropagation":"关系传播","tlgTriple":"三连规则","tlgBalanceQuota":"行列平衡","tlgBalanceRelation":"相反配对","tlgRelationBalance":"关系与平衡","tlgRelationComponent":"关系链","tlgDomain":"行列综合约束","tlgContradiction":"反证推理","tlgCommon":"共同结论","tlgNoDeduction":"当前可见状态中没有可证明的推理。不会从最终答案中取用任何一步。","tlgSame":"相同","tlgOpposite":"相反","tlgRelations":"关系"});
Object.assign(I18N.hi,{"tlgRelationPropagation":"संबंध प्रसार","tlgTriple":"तीन की बाधा","tlgBalanceQuota":"पंक्ति/स्तंभ संतुलन","tlgBalanceRelation":"विपरीत जोड़ी","tlgRelationBalance":"संबंध और संतुलन","tlgRelationComponent":"संबंध शृंखला","tlgDomain":"संयुक्त पंक्ति बाधाएँ","tlgContradiction":"विरोधाभास से तर्क","tlgCommon":"साझा परिणाम","tlgNoDeduction":"वर्तमान दिखाई देने वाली स्थिति से कोई सिद्ध निष्कर्ष उपलब्ध नहीं है। अंतिम समाधान से कोई चाल नहीं ली जाती।","tlgSame":"समान","tlgOpposite":"विपरीत","tlgRelations":"संबंध"});
Object.assign(I18N.es,{"tlgRelationPropagation":"Propagación de relación","tlgTriple":"Regla de tres","tlgBalanceQuota":"Equilibrio fila/columna","tlgBalanceRelation":"Pareja opuesta","tlgRelationBalance":"Relación y equilibrio","tlgRelationComponent":"Cadena de relaciones","tlgDomain":"Restricciones combinadas","tlgContradiction":"Razonamiento por contradicción","tlgCommon":"Consecuencia común","tlgNoDeduction":"No hay ninguna deducción demostrable en el estado visible actual. No se toma ninguna jugada de la solución final.","tlgSame":"iguales","tlgOpposite":"opuestas","tlgRelations":"relaciones"});
Object.assign(I18N.ar,{"tlgRelationPropagation":"نشر العلاقة","tlgTriple":"قاعدة الثلاثة","tlgBalanceQuota":"توازن الصف/العمود","tlgBalanceRelation":"زوج متعاكس","tlgRelationBalance":"العلاقة والتوازن","tlgRelationComponent":"سلسلة علاقات","tlgDomain":"قيود مركبة للصف أو العمود","tlgContradiction":"استدلال بالتناقض","tlgCommon":"نتيجة مشتركة","tlgNoDeduction":"لا يوجد استنتاج قابل للإثبات من الحالة الظاهرة الحالية. لا تؤخذ أي نقلة من الحل النهائي.","tlgSame":"متطابقتان","tlgOpposite":"متعاكستان","tlgRelations":"العلاقات"});
Object.assign(I18N.bn,{"tlgRelationPropagation":"সম্পর্ক প্রচার","tlgTriple":"তিনটির নিয়ম","tlgBalanceQuota":"সারি/কলাম ভারসাম্য","tlgBalanceRelation":"বিপরীত জোড়া","tlgRelationBalance":"সম্পর্ক ও ভারসাম্য","tlgRelationComponent":"সম্পর্ক শৃঙ্খল","tlgDomain":"সমন্বিত সারি/কলাম শর্ত","tlgContradiction":"বিরোধাভাস দ্বারা যুক্তি","tlgCommon":"সাধারণ পরিণতি","tlgNoDeduction":"বর্তমান দৃশ্যমান অবস্থা থেকে কোনো প্রমাণযোগ্য সিদ্ধান্ত নেই। চূড়ান্ত সমাধান থেকে কোনো চাল নেওয়া হয় না।","tlgSame":"একই","tlgOpposite":"বিপরীত","tlgRelations":"সম্পর্ক"});
Object.assign(I18N.pt,{"tlgRelationPropagation":"Propagação de relação","tlgTriple":"Regra dos três","tlgBalanceQuota":"Equilíbrio linha/coluna","tlgBalanceRelation":"Par oposto","tlgRelationBalance":"Relação e equilíbrio","tlgRelationComponent":"Cadeia de relações","tlgDomain":"Restrições combinadas","tlgContradiction":"Raciocínio por contradição","tlgCommon":"Consequência comum","tlgNoDeduction":"Não existe dedução demonstrável no estado visível atual. Nenhuma jogada é retirada da solução final.","tlgSame":"iguais","tlgOpposite":"opostas","tlgRelations":"relações"});
Object.assign(I18N.id,{"tlgRelationPropagation":"Propagasi relasi","tlgTriple":"Aturan tiga","tlgBalanceQuota":"Keseimbangan baris/kolom","tlgBalanceRelation":"Pasangan berlawanan","tlgRelationBalance":"Relasi dan keseimbangan","tlgRelationComponent":"Rantai relasi","tlgDomain":"Kendala gabungan baris/kolom","tlgContradiction":"Penalaran kontradiksi","tlgCommon":"Konsekuensi bersama","tlgNoDeduction":"Tidak ada deduksi yang dapat dibuktikan dari keadaan yang terlihat saat ini. Tidak ada langkah yang diambil dari solusi akhir.","tlgSame":"sama","tlgOpposite":"berlawanan","tlgRelations":"relasi"});
Object.assign(I18N.ur,{"tlgRelationPropagation":"تعلق کی ترسیل","tlgTriple":"تین کی قاعدہ","tlgBalanceQuota":"قطار/کالم توازن","tlgBalanceRelation":"مخالف جوڑا","tlgRelationBalance":"تعلق اور توازن","tlgRelationComponent":"تعلقات کی زنجیر","tlgDomain":"مشترکہ قطار/کالم پابندیاں","tlgContradiction":"تضاد کے ذریعے استدلال","tlgCommon":"مشترک نتیجہ","tlgNoDeduction":"موجودہ نظر آنے والی حالت سے کوئی قابلِ ثبوت نتیجہ دستیاب نہیں۔ آخری حل سے کوئی چال نہیں لی جاتی۔","tlgSame":"یکساں","tlgOpposite":"مخالف","tlgRelations":"تعلقات"});
Object.assign(I18N.bg,{"tlgRelationPropagation":"Разпространение на връзка","tlgTriple":"Правило за три","tlgBalanceQuota":"Баланс ред/колона","tlgBalanceRelation":"Противоположна двойка","tlgRelationBalance":"Връзка и баланс","tlgRelationComponent":"Верига от връзки","tlgDomain":"Комбинирани ограничения","tlgContradiction":"Разсъждение чрез противоречие","tlgCommon":"Общо следствие","tlgNoDeduction":"В текущото видимо състояние няма доказуема дедукция. Не се взема ход от крайното решение.","tlgSame":"еднакви","tlgOpposite":"противоположни","tlgRelations":"връзки"});
Object.assign(I18N.hr,{"tlgRelationPropagation":"Širenje odnosa","tlgTriple":"Pravilo trojke","tlgBalanceQuota":"Ravnoteža retka/stupca","tlgBalanceRelation":"Suprotni par","tlgRelationBalance":"Odnos i ravnoteža","tlgRelationComponent":"Lanac odnosa","tlgDomain":"Kombinirana ograničenja","tlgContradiction":"Zaključivanje proturječjem","tlgCommon":"Zajednička posljedica","tlgNoDeduction":"U trenutačno vidljivom stanju nema dokazive dedukcije. Nijedan potez ne uzima se iz konačnog rješenja.","tlgSame":"jednake","tlgOpposite":"suprotne","tlgRelations":"odnosi"});
Object.assign(I18N.cs,{"tlgRelationPropagation":"Šíření vztahu","tlgTriple":"Pravidlo tří","tlgBalanceQuota":"Rovnováha řádku/sloupce","tlgBalanceRelation":"Opačná dvojice","tlgRelationBalance":"Vztah a rovnováha","tlgRelationComponent":"Řetězec vztahů","tlgDomain":"Kombinovaná omezení","tlgContradiction":"Důkaz sporem","tlgCommon":"Společný důsledek","tlgNoDeduction":"V aktuálně viditelném stavu není k dispozici žádná prokazatelná dedukce. Žádný tah se nebere z konečného řešení.","tlgSame":"stejné","tlgOpposite":"opačné","tlgRelations":"vztahy"});
Object.assign(I18N.da,{"tlgRelationPropagation":"Relationsudbredelse","tlgTriple":"Reglen om tre","tlgBalanceQuota":"Række/kolonne-balance","tlgBalanceRelation":"Modsat par","tlgRelationBalance":"Relation og balance","tlgRelationComponent":"Relationskæde","tlgDomain":"Kombinerede begrænsninger","tlgContradiction":"Modstridsbevis","tlgCommon":"Fælles konsekvens","tlgNoDeduction":"Der er ingen beviselig slutning i den aktuelle synlige tilstand. Intet træk hentes fra den endelige løsning.","tlgSame":"ens","tlgOpposite":"modsatte","tlgRelations":"relationer"});
Object.assign(I18N.nl,{"tlgRelationPropagation":"Relatiepropagatie","tlgTriple":"Regel van drie","tlgBalanceQuota":"Rij/kolom-balans","tlgBalanceRelation":"Tegengesteld paar","tlgRelationBalance":"Relatie en balans","tlgRelationComponent":"Relatieketen","tlgDomain":"Gecombineerde beperkingen","tlgContradiction":"Redeneren via tegenspraak","tlgCommon":"Gemeenschappelijk gevolg","tlgNoDeduction":"In de huidige zichtbare toestand is geen aantoonbare deductie beschikbaar. Er wordt geen zet uit de eindoplossing gehaald.","tlgSame":"gelijk","tlgOpposite":"tegengesteld","tlgRelations":"relaties"});
Object.assign(I18N.et,{"tlgRelationPropagation":"Seose levitamine","tlgTriple":"Kolme reegel","tlgBalanceQuota":"Rea/veeru tasakaal","tlgBalanceRelation":"Vastandpaar","tlgRelationBalance":"Seos ja tasakaal","tlgRelationComponent":"Seoste ahel","tlgDomain":"Kombineeritud piirangud","tlgContradiction":"Vastuoluga tõestus","tlgCommon":"Ühine tagajärg","tlgNoDeduction":"Praegusest nähtavast seisust ei leidu tõestatavat järeldust. Ühtegi käiku ei võeta lõplikust lahendusest.","tlgSame":"samad","tlgOpposite":"vastandid","tlgRelations":"seosed"});
Object.assign(I18N.fi,{"tlgRelationPropagation":"Suhteen eteneminen","tlgTriple":"Kolmen sääntö","tlgBalanceQuota":"Rivi/sarake-tasapaino","tlgBalanceRelation":"Vastakkainen pari","tlgRelationBalance":"Suhde ja tasapaino","tlgRelationComponent":"Suhdeketju","tlgDomain":"Yhdistetyt rajoitteet","tlgContradiction":"Ristiriitatodistus","tlgCommon":"Yhteinen seuraus","tlgNoDeduction":"Nykyisestä näkyvästä tilanteesta ei ole saatavilla todistettavaa päätelmää. Mitään siirtoa ei oteta lopullisesta ratkaisusta.","tlgSame":"samat","tlgOpposite":"vastakkaiset","tlgRelations":"suhteet"});
Object.assign(I18N.de,{"tlgRelationPropagation":"Relationsfortpflanzung","tlgTriple":"Dreierregel","tlgBalanceQuota":"Zeilen/Spalten-Balance","tlgBalanceRelation":"Gegensatzpaar","tlgRelationBalance":"Relation und Balance","tlgRelationComponent":"Relationskette","tlgDomain":"Kombinierte Zeilenbedingungen","tlgContradiction":"Widerspruchsbeweis","tlgCommon":"Gemeinsame Folgerung","tlgNoDeduction":"Im aktuell sichtbaren Zustand ist keine beweisbare Schlussfolgerung verfügbar. Es wird kein Zug aus der Endlösung übernommen.","tlgSame":"gleich","tlgOpposite":"entgegengesetzt","tlgRelations":"Relationen"});
Object.assign(I18N.el,{"tlgRelationPropagation":"Διάδοση σχέσης","tlgTriple":"Κανόνας των τριών","tlgBalanceQuota":"Ισορροπία γραμμής/στήλης","tlgBalanceRelation":"Αντίθετο ζεύγος","tlgRelationBalance":"Σχέση και ισορροπία","tlgRelationComponent":"Αλυσίδα σχέσεων","tlgDomain":"Συνδυασμένοι περιορισμοί","tlgContradiction":"Συλλογισμός με αντίφαση","tlgCommon":"Κοινό συμπέρασμα","tlgNoDeduction":"Δεν υπάρχει αποδείξιμη παραγωγή από την τρέχουσα ορατή κατάσταση. Καμία κίνηση δεν λαμβάνεται από την τελική λύση.","tlgSame":"ίδιες","tlgOpposite":"αντίθετες","tlgRelations":"σχέσεις"});
Object.assign(I18N.hu,{"tlgRelationPropagation":"Kapcsolat terjedése","tlgTriple":"Hármas szabály","tlgBalanceQuota":"Sor/oszlop egyensúly","tlgBalanceRelation":"Ellentétes pár","tlgRelationBalance":"Kapcsolat és egyensúly","tlgRelationComponent":"Kapcsolatlánc","tlgDomain":"Összetett korlátozások","tlgContradiction":"Ellentmondásos bizonyítás","tlgCommon":"Közös következmény","tlgNoDeduction":"A jelenlegi látható állapotból nincs bizonyítható következtetés. A végső megoldásból nem veszünk át lépést.","tlgSame":"azonosak","tlgOpposite":"ellentétesek","tlgRelations":"kapcsolatok"});
Object.assign(I18N.ga,{"tlgRelationPropagation":"Scaipeadh caidrimh","tlgTriple":"Riail na dtrí","tlgBalanceQuota":"Cothromaíocht ró/colúin","tlgBalanceRelation":"Péire contrártha","tlgRelationBalance":"Caidreamh agus cothromaíocht","tlgRelationComponent":"Slabhra caidrimh","tlgDomain":"Srianta comhcheangailte","tlgContradiction":"Réasúnaíocht trí bhréagnú","tlgCommon":"Iarmhairt choiteann","tlgNoDeduction":"Níl aon asbhaint inchruthaithe ar fáil ón staid infheicthe reatha. Ní ghlactar aon bhogadh ón réiteach deiridh.","tlgSame":"mar an gcéanna","tlgOpposite":"contrártha","tlgRelations":"caidrimh"});
Object.assign(I18N.it,{"tlgRelationPropagation":"Propagazione della relazione","tlgTriple":"Regola dei tre","tlgBalanceQuota":"Equilibrio riga/colonna","tlgBalanceRelation":"Coppia opposta","tlgRelationBalance":"Relazione ed equilibrio","tlgRelationComponent":"Catena di relazioni","tlgDomain":"Vincoli combinati","tlgContradiction":"Ragionamento per contraddizione","tlgCommon":"Conseguenza comune","tlgNoDeduction":"Nello stato visibile attuale non è disponibile alcuna deduzione dimostrabile. Nessuna mossa viene ricavata dalla soluzione finale.","tlgSame":"uguali","tlgOpposite":"opposte","tlgRelations":"relazioni"});
Object.assign(I18N.lv,{"tlgRelationPropagation":"Sakarības izplatīšana","tlgTriple":"Trijnieka noteikums","tlgBalanceQuota":"Rindas/kolonnas līdzsvars","tlgBalanceRelation":"Pretējs pāris","tlgRelationBalance":"Sakarība un līdzsvars","tlgRelationComponent":"Sakarību ķēde","tlgDomain":"Kombinēti ierobežojumi","tlgContradiction":"Pamatojums ar pretrunu","tlgCommon":"Kopīgas sekas","tlgNoDeduction":"Pašreizējā redzamajā stāvoklī nav pierādāma secinājuma. Neviens gājiens netiek ņemts no gala risinājuma.","tlgSame":"vienādi","tlgOpposite":"pretēji","tlgRelations":"sakarības"});
Object.assign(I18N.lt,{"tlgRelationPropagation":"Ryšio sklaida","tlgTriple":"Trejeto taisyklė","tlgBalanceQuota":"Eilutės/stulpelio balansas","tlgBalanceRelation":"Priešinga pora","tlgRelationBalance":"Ryšys ir balansas","tlgRelationComponent":"Ryšių grandinė","tlgDomain":"Kombinuoti apribojimai","tlgContradiction":"Įrodymas prieštaravimu","tlgCommon":"Bendra pasekmė","tlgNoDeduction":"Dabartinėje matomoje būsenoje nėra įrodomos išvados. Joks ėjimas neimamas iš galutinio sprendimo.","tlgSame":"vienodi","tlgOpposite":"priešingi","tlgRelations":"ryšiai"});
Object.assign(I18N.mt,{"tlgRelationPropagation":"Propagazzjoni tar-relazzjoni","tlgTriple":"Regola tat-tlieta","tlgBalanceQuota":"Bilanċ ringiela/kolonna","tlgBalanceRelation":"Par oppost","tlgRelationBalance":"Relazzjoni u bilanċ","tlgRelationComponent":"Katina ta’ relazzjonijiet","tlgDomain":"Restrizzjonijiet magħquda","tlgContradiction":"Raġunament b’kontradizzjoni","tlgCommon":"Konsegwenza komuni","tlgNoDeduction":"M’hemm l-ebda deduzzjoni li tista’ tiġi ppruvata mill-istat viżibbli attwali. L-ebda mossa ma tittieħed mis-soluzzjoni finali.","tlgSame":"l-istess","tlgOpposite":"opposti","tlgRelations":"relazzjonijiet"});
Object.assign(I18N.pl,{"tlgRelationPropagation":"Propagacja relacji","tlgTriple":"Reguła trzech","tlgBalanceQuota":"Równowaga wiersza/kolumny","tlgBalanceRelation":"Para przeciwna","tlgRelationBalance":"Relacja i równowaga","tlgRelationComponent":"Łańcuch relacji","tlgDomain":"Połączone ograniczenia","tlgContradiction":"Rozumowanie przez sprzeczność","tlgCommon":"Wspólna konsekwencja","tlgNoDeduction":"W obecnym widocznym stanie nie ma dostępnej dowodliwej dedukcji. Żaden ruch nie jest pobierany z końcowego rozwiązania.","tlgSame":"takie same","tlgOpposite":"przeciwne","tlgRelations":"relacje"});
Object.assign(I18N.ro,{"tlgRelationPropagation":"Propagarea relației","tlgTriple":"Regula celor trei","tlgBalanceQuota":"Echilibru linie/coloană","tlgBalanceRelation":"Pereche opusă","tlgRelationBalance":"Relație și echilibru","tlgRelationComponent":"Lanț de relații","tlgDomain":"Constrângeri combinate","tlgContradiction":"Raționament prin contradicție","tlgCommon":"Consecință comună","tlgNoDeduction":"Nu există nicio deducție demonstrabilă din starea vizibilă curentă. Nicio mutare nu este luată din soluția finală.","tlgSame":"identice","tlgOpposite":"opuse","tlgRelations":"relații"});
Object.assign(I18N.sk,{"tlgRelationPropagation":"Šírenie vzťahu","tlgTriple":"Pravidlo troch","tlgBalanceQuota":"Rovnováha riadka/stĺpca","tlgBalanceRelation":"Opačná dvojica","tlgRelationBalance":"Vzťah a rovnováha","tlgRelationComponent":"Reťazec vzťahov","tlgDomain":"Kombinované obmedzenia","tlgContradiction":"Dôkaz sporom","tlgCommon":"Spoločný dôsledok","tlgNoDeduction":"V aktuálne viditeľnom stave nie je dostupná žiadna dokázateľná dedukcia. Žiadny ťah sa nepreberá z konečného riešenia.","tlgSame":"rovnaké","tlgOpposite":"opačné","tlgRelations":"vzťahy"});
Object.assign(I18N.sl,{"tlgRelationPropagation":"Širjenje relacije","tlgTriple":"Pravilo treh","tlgBalanceQuota":"Ravnotežje vrstice/stolpca","tlgBalanceRelation":"Nasprotni par","tlgRelationBalance":"Relacija in ravnotežje","tlgRelationComponent":"Veriga relacij","tlgDomain":"Kombinirane omejitve","tlgContradiction":"Sklepanje s protislovjem","tlgCommon":"Skupna posledica","tlgNoDeduction":"V trenutnem vidnem stanju ni dokazljive dedukcije. Nobena poteza ni vzeta iz končne rešitve.","tlgSame":"enake","tlgOpposite":"nasprotne","tlgRelations":"relacije"});
Object.assign(I18N.sv,{"tlgRelationPropagation":"Relationsspridning","tlgTriple":"Treregeln","tlgBalanceQuota":"Rad/kolumn-balans","tlgBalanceRelation":"Motsatt par","tlgRelationBalance":"Relation och balans","tlgRelationComponent":"Relationskedja","tlgDomain":"Kombinerade begränsningar","tlgContradiction":"Motsägelsebevis","tlgCommon":"Gemensam följd","tlgNoDeduction":"Det finns ingen bevisbar deduktion i det aktuella synliga läget. Inget drag hämtas från den slutliga lösningen.","tlgSame":"lika","tlgOpposite":"motsatta","tlgRelations":"relationer"});
Object.assign(I18N.en,{"tlgOrientProp":"Look at {source}, {target}, and the relation between them.","tlgOrientTriple":"Look at these three consecutive cells in {unit}.","tlgOrientQuota":"Count the suns and moons already fixed in {unit}.","tlgOrientBalanceRelation":"Look at the two unresolved cells of {unit} and what is still missing for balance.","tlgOrientRelationBalance":"Look at the highlighted relation together with the balance of {unit}.","tlgOrientComponent":"Follow the highlighted relation chain and compare its two possible orientations.","tlgOrientDomain":"Look at {unit}: combine its balance, no-three rule, and known relations.","tlgOrientContradiction":"Try the other symbol mentally at {cell} and follow its forced consequences.","tlgOrientCommon":"Compare both possible symbols at {cell}; watch for a consequence that appears in both cases.","tlgExplainProp":"{source} is {sourceValue}. The relation says the two cells are {relation}, so {target} must be {targetValue}.","tlgExplainTripleValue":"In {unit}, the two highlighted cells are both {value}. A third {value} in the same three-cell window is forbidden, so {target} must be {opposite}.","tlgExplainTripleRelation":"In this group of three cells, two positions are known to be identical. The third must therefore be opposite to them. {conclusion}","tlgExplainQuota":"{unit} must contain {quota} suns and {quota} moons. With the values already fixed, the remaining highlighted cells are forced. {conclusion}","tlgExplainBalanceRelation":"Only two cells remain in {unit}. Exactly one sun and one moon are still missing, so these two cells must be opposite.","tlgExplainRelationBalance":"The highlighted relation contributes a fixed pattern to {unit}. Combining it with the values already present leaves only one possible balance. {conclusion}","tlgExplainComponent":"The highlighted cells form one relation component with only two global orientations. One orientation violates {reason}; the other is forced. {conclusion}","tlgExplainDomain":"In {unit}, test the opposite of the highlighted conclusion locally. No arrangement of the remaining cells can then satisfy balance, the no-three rule, and the known relations together. The highlighted conclusion is therefore forced. {conclusion}","tlgExplainContradiction":"Assume {assumed} at {cell}. Following only the visible rules leads to {reason}. That hypothesis is impossible. {conclusion}","tlgExplainCommon":"Whether {cell} is a sun or a moon, the same highlighted consequence follows after logical propagation. {conclusion}","tlgContrTriple":"three identical consecutive symbols","tlgContrOverflow":"too many copies of one symbol for the quota","tlgContrDeficit":"not enough remaining cells to reach the quota","tlgContrRelation":"an incompatible relation","tlgContrValue":"two incompatible values","tlgContrNoDomain":"no valid completion for the row or column"});
Object.assign(I18N.fr,{"tlgOrientProp":"Regarde {source}, {target} et la relation qui les relie.","tlgOrientTriple":"Regarde ces trois cases consécutives dans {unit}.","tlgOrientQuota":"Compte les Soleils et les Lunes déjà fixés dans {unit}.","tlgOrientBalanceRelation":"Regarde les deux cases non résolues de {unit} et ce qu’il manque encore pour l’équilibrer.","tlgOrientRelationBalance":"Regarde la relation surlignée avec l’équilibre de {unit}.","tlgOrientComponent":"Suis la chaîne de relations surlignée et compare ses deux orientations possibles.","tlgOrientDomain":"Regarde {unit} : combine son équilibre, la règle des trois et les relations connues.","tlgOrientContradiction":"Essaie mentalement l’autre symbole en {cell} et suis ses conséquences forcées.","tlgOrientCommon":"Compare les deux symboles possibles en {cell} et cherche une conséquence présente dans les deux cas.","tlgExplainProp":"{source} contient {sourceValue}. La relation impose que les deux cases soient {relation} ; {target} doit donc contenir {targetValue}.","tlgExplainTripleValue":"Dans {unit}, les deux cases surlignées contiennent toutes deux {value}. Un troisième {value} dans ce groupe de trois est interdit ; {target} doit donc contenir {opposite}.","tlgExplainTripleRelation":"Dans ce groupe de trois cases, deux positions sont démontrées identiques. La troisième doit donc leur être opposée. {conclusion}","tlgExplainQuota":"{unit} doit contenir {quota} Soleils et {quota} Lunes. Avec les valeurs déjà fixées, les cases restantes surlignées sont imposées. {conclusion}","tlgExplainBalanceRelation":"Il ne reste que deux cases dans {unit}. Il manque exactement un Soleil et une Lune : ces deux cases doivent donc être opposées.","tlgExplainRelationBalance":"La relation surlignée apporte une contribution déterminée à l’équilibre de {unit}. Avec les valeurs déjà présentes, une seule possibilité reste compatible. {conclusion}","tlgExplainComponent":"Les cases surlignées forment une même chaîne de relations qui n’a que deux orientations globales. L’une viole {reason} ; l’autre est donc imposée. {conclusion}","tlgExplainDomain":"Dans {unit}, teste localement l’opposé de la conclusion surlignée. Il ne reste alors aucune manière de remplir les autres cases qui respecte à la fois l’équilibre, la règle des trois et les relations connues. La conclusion surlignée est donc démontrée. {conclusion}","tlgExplainContradiction":"Supposons {assumed} en {cell}. En propageant uniquement les règles visibles, on obtient {reason}. Cette hypothèse est impossible. {conclusion}","tlgExplainCommon":"Que {cell} soit un Soleil ou une Lune, la même conséquence surlignée apparaît après propagation logique. {conclusion}","tlgContrTriple":"trois symboles identiques consécutifs","tlgContrOverflow":"trop d’exemplaires d’un symbole pour respecter le quota","tlgContrDeficit":"pas assez de cases restantes pour atteindre le quota","tlgContrRelation":"une relation incompatible","tlgContrValue":"deux valeurs incompatibles","tlgContrNoDomain":"aucune complétion valide pour la ligne ou la colonne"});

/* v2.21.12 — Rectangles proof-engine UI terminology */
Object.assign(I18N.en,{"plClueSingleton":"Unique rectangle","plCellSingleton":"Unique cell coverage","plRectClosure":"Rectangular closure","plAreaCompletion":"Area completion","plCommonCoverage":"Common coverage","plCellLocked":"Cell locked to one region","plLockedSet":"Reserved space","plNoSupportClue":"No support for another clue","plNoSupportCell":"No support for a cell","plLocalDomain":"Local domain support","plContradiction":"Reasoning by contradiction","plCommonConsequence":"Common consequence","plNoDeduction":"No demonstrable Rectangles deduction is available from the current visible state. No move is taken from the final solution.","plOrientClue":"Look at {zone} and all rectangles still compatible with its clue.","plOrientCell":"Look at {cell}. Which regions can still cover it?","plOrientCommon":"Compare all remaining rectangles for {zone}.","plOrientLocked":"Look at {cell} and the regions whose remaining rectangles can still reach it.","plOrientSet":"Look at regions {zones} and the space their remaining rectangles can reach.","plOrientNoSupportClue":"Test the highlighted rectangle for {zone} against {other}.","plOrientNoSupportCell":"Test the highlighted rectangle for {zone} and watch {cell}.","plOrientLocal":"Look only at the highlighted local group of regions {zones}.","plOrientContradiction":"Assume the highlighted rectangle for {zone}, then propagate the forced consequences.","plOrientCommonConsequence":"Compare every remaining rectangle for {zone} and look for a consequence shared by all branches.","plExplainClueSingleton":"Only one rectangle remains compatible with this clue and the facts already proved. {zone} must therefore use it. {conclusion}","plExplainCellSingleton":"This cell has only one remaining (region, rectangle) support. That rectangle is mandatory. {conclusion}","plExplainRectClosure":"These cells already belong to {zone}. Because a region is a full rectangle, every cell in their minimal bounding rectangle must belong to it too. {conclusion}","plExplainAreaCompletion":"The proved cells of {zone} already span a bounding rectangle of area {area}, exactly the required area. The rectangle is therefore fixed. {conclusion}","plExplainCommon":"{zone} still has several possible rectangles, but every one contains the highlighted cell(s). They therefore belong to that region. {conclusion}","plExplainLocked":"Every cell must belong to a region. For {cell}, all remaining covering rectangles belong to {zone}. That cell must therefore belong to it. {conclusion}","plExplainSet":"These regions need at least {required} cells in total, and all their remaining rectangles are confined to exactly {available} cells. That space is fully reserved for them. {conclusion}","plExplainNoSupportClue":"If {zone} used this rectangle, every remaining rectangle of {other} would overlap it. The other clue would have no possible region, so this rectangle is impossible. {conclusion}","plExplainNoSupportCell":"If {zone} used this rectangle, {cell} would have no remaining possible coverage. Every cell must be covered, so this rectangle is impossible. {conclusion}","plExplainLocal":"Among all compatible combinations for this small local group, the highlighted candidate never appears (or the highlighted ownership appears in every combination). The conclusion is therefore forced. {conclusion}","plExplainContradiction":"Assume this rectangle for {zone}. Logical propagation leads to: {reason}. The assumption is impossible, so that rectangle can be eliminated. {conclusion}","plExplainCommonConsequence":"Each remaining rectangle for {zone} was propagated separately. Every branch proves the same highlighted fact, so that fact is true without choosing between the alternatives. {conclusion}","plContrNoCandidate":"a clue has no rectangle left","plContrNoCover":"a cell has no possible region left","plContrOverlap":"two selected rectangles overlap","plContrOwner":"one cell would belong to two regions","plContrArea":"the proved cells require more area than the clue allows","plContrShape":"no rectangle can satisfy the clue shape","plContrCapacity":"the regions need more cells than they can reach","plContrLocal":"the local group has no compatible completion","plEliminated":"candidate eliminated","plGeometry":"For area {area}, the possible dimensions are {all}. The shape constraint keeps {kept}. The borders, other clues, and already proved facts then leave only the highlighted placement."});
Object.assign(I18N.fr,{"plClueSingleton":"Rectangle unique","plCellSingleton":"Couverture unique d’une case","plRectClosure":"Fermeture rectangulaire","plAreaCompletion":"Surface complétée","plCommonCoverage":"Case commune aux formes","plCellLocked":"Case réservée à une zone","plLockedSet":"Espace réservé","plNoSupportClue":"Plus de support pour un indice","plNoSupportCell":"Plus de couverture pour une case","plLocalDomain":"Support local des domaines","plContradiction":"Raisonnement par contradiction","plCommonConsequence":"Conséquence commune","plNoDeduction":"Aucune déduction Rectangles démontrable n’est disponible dans l’état visible actuel. Aucun coup n’est tiré de la solution finale.","plOrientClue":"Regarde {zone} et tous les rectangles encore compatibles avec son indice.","plOrientCell":"Regarde {cell}. Quelles zones peuvent encore la recouvrir ?","plOrientCommon":"Compare toutes les formes encore possibles de {zone}.","plOrientLocked":"Regarde {cell} et les zones dont les rectangles encore possibles peuvent l’atteindre.","plOrientSet":"Regarde les zones {zones} et l’espace que leurs rectangles encore possibles peuvent atteindre.","plOrientNoSupportClue":"Teste le rectangle surligné de {zone} par rapport à {other}.","plOrientNoSupportCell":"Teste le rectangle surligné de {zone} et observe {cell}.","plOrientLocal":"Regarde seulement le petit groupe local de zones {zones}.","plOrientContradiction":"Suppose le rectangle surligné pour {zone}, puis propage les conséquences forcées.","plOrientCommonConsequence":"Compare tous les rectangles encore possibles de {zone} et cherche une conséquence commune à toutes les branches.","plExplainClueSingleton":"Un seul rectangle reste compatible avec cet indice et les faits déjà démontrés. {zone} doit donc l’utiliser. {conclusion}","plExplainCellSingleton":"Cette case ne possède plus qu’un seul support (zone, rectangle). Ce rectangle est donc obligatoire. {conclusion}","plExplainRectClosure":"Ces cases appartiennent déjà à {zone}. Comme une zone doit former un rectangle plein, toutes les cases de leur rectangle englobant minimal appartiennent aussi à cette zone. {conclusion}","plExplainAreaCompletion":"Les cases démontrées de {zone} occupent déjà une boîte englobante d’aire {area}, exactement égale à la surface imposée. Le rectangle est donc déterminé. {conclusion}","plExplainCommon":"{zone} peut encore prendre plusieurs formes, mais toutes contiennent la ou les cases surlignées. Elles appartiennent donc forcément à cette zone. {conclusion}","plExplainLocked":"Chaque case doit appartenir à une zone. Pour {cell}, tous les rectangles qui peuvent encore la couvrir appartiennent à {zone}. Cette case lui appartient donc forcément. {conclusion}","plExplainSet":"Ces zones ont besoin d’au moins {required} cases au total, et toutes leurs formes encore possibles sont confinées dans exactement {available} cases. Cet espace leur est donc entièrement réservé. {conclusion}","plExplainNoSupportClue":"Si {zone} prenait ce rectangle, tous les rectangles encore possibles de {other} le chevaucheraient. L’autre indice n’aurait plus aucune zone possible : ce rectangle est donc impossible. {conclusion}","plExplainNoSupportCell":"Si {zone} prenait ce rectangle, {cell} ne pourrait plus appartenir à aucun rectangle. Toutes les cases doivent être recouvertes : ce rectangle est donc impossible. {conclusion}","plExplainLocal":"Parmi toutes les combinaisons compatibles de ce petit groupe local, le candidat surligné n’apparaît jamais (ou la propriété surlignée apparaît toujours). La conclusion est donc démontrée. {conclusion}","plExplainContradiction":"Supposons ce rectangle pour {zone}. La propagation logique conduit à : {reason}. L’hypothèse est impossible ; ce rectangle peut donc être éliminé. {conclusion}","plExplainCommonConsequence":"Chaque rectangle encore possible de {zone} a été propagé séparément. Toutes les branches démontrent le même fait surligné : ce fait est donc vrai sans choisir entre les alternatives. {conclusion}","plContrNoCandidate":"un indice n’a plus aucun rectangle possible","plContrNoCover":"une case ne peut plus appartenir à aucune zone","plContrOverlap":"deux rectangles sélectionnés se chevauchent","plContrOwner":"une case devrait appartenir à deux zones","plContrArea":"les cases démontrées imposent une aire trop grande","plContrShape":"aucun rectangle ne peut respecter la forme de l’indice","plContrCapacity":"les zones ont besoin de plus de cases qu’elles ne peuvent en atteindre","plContrLocal":"le sous-problème local n’a aucune complétion compatible","plEliminated":"candidat éliminé","plGeometry":"Pour une surface {area}, les dimensions possibles sont {all}. La contrainte de forme conserve {kept}. Les bords, les autres indices et les faits déjà démontrés ne laissent ensuite que le placement surligné."});

/* v2.21.10 — proof explanation templates live in I18N, never in the inference engine */
Object.assign(I18N.en,{
  "qlAnd":" and ","qlMore":" and {count} more","qlRowsPlural":"rows","qlColumnsPlural":"columns","qlRegionsPlural":"regions",
  "qlConflictRow":"same row","qlConflictColumn":"same column","qlConflictRegion":"same region","qlConflictAdjacency":"diagonal adjacency","qlConflictRule":"rule conflict",
  "qlOrientSingleton":"Look at {unit}. See where its queen can still be placed.",
  "qlOrientLocked":"Look at {source} and {target}. Where can the first unit's queen still go?",
  "qlOrientCommon":"Look at the remaining positions in {source}, then at {target}.",
  "qlOrientHall":"Look at {sources}. Which {targetFamily} can still contain their queens?",
  "qlOrientCapacity":"Look at this {size}×{size} block. How many queens can it hold at most, and which units must already place their queens there?",
  "qlOrientNoSupport":"Look at {target} and the possible positions in {support}. Would that cell leave any place for the required queen?",
  "qlOrientMixed":"Look at {sources} and the {rows} row(s) / {columns} column(s) covering all their possible positions.",
  "qlOrientContradiction":"Look at {cell}. Test the opposite assumption mentally before deciding.",
  "qlConclusionQueen":"A queen must therefore be placed at {cells}.","qlConclusionXs":"We can therefore mark X at {cells}.",
  "qlExplainSingleton":"Only one possible cell remains in {unit}. That unit must contain exactly one queen. {conclusion}",
  "qlExplainLocked":"Every remaining position of {source} lies in {target}. Its queen must therefore be somewhere in that second unit. Since it can contain only one queen, the indicated cells cannot be used by other units. {conclusion}",
  "qlExplainCommon":"The queen of {source} can still be placed at {candidates}. But {target} conflicts with every one of those possibilities ({conflicts}). Whichever position is chosen, that cell is forbidden. {conclusion}",
  "qlExplainHall":"{size} units must place {size} queens in total. All their possible positions lie in {targets}. Those {size} target units are therefore reserved for those queens, so no other unit can use them. {conclusion}",
  "qlExplainCapacity":"This {size}×{size} block can contain at most {capacity} queen(s). {sourcesCount} unit(s) already have to place their queens there, so its capacity is saturated. No other queen can enter it. {conclusion}",
  "qlExplainNoSupport":"If a queen were placed at {target}, every remaining position in {support} would be forbidden. That unit would have no place left for its required queen. {conclusion}",
  "qlExplainMixed":"{size} regions must place {size} queens. All their possible positions are covered by {rows} row(s) and {columns} column(s), exactly {size} capacity units. They are therefore fully reserved for that group. {conclusion}",
  "qlAssumeQueen":"a queen","qlAssumeX":"an X",
  "qlWitnessNoCandidate":"{unit} would have no possible place left for its queen.","qlWitnessHall":"a group of units would require more queens than the available units can hold.","qlWitnessCapacity":"a local capacity would be exceeded.","qlWitnessRule":"the Queens rules would be violated.",
  "qlExplainContradiction":"Suppose {assumed} were placed at {cell}. After the logical consequences of that assumption, {detail} The assumption is impossible. {conclusion}",
  "qlCurrentNoCandidate":"With the current marks, {unit} has no possible place left for its queen. At least one earlier decision must be revisited.",
  "qlCurrentHall":"The current marks create a capacity contradiction: several units must place their queens in too few {targetFamily}. An earlier decision must be revisited.",
  "qlCurrentCapacity":"The current marks would force too many queens into a {size}×{size} block whose maximum capacity is {capacity}. An earlier decision must be revisited.",
  "qlCurrentRule":"Two visible queens are incompatible ({reason}).","qlCurrentGeneric":"The current state contains a demonstrable logical contradiction.","qlLogicalDeduction":"Logical deduction"
});
Object.assign(I18N.fr,{
  "qlAnd":" et ","qlMore":" et {count} autre(s)","qlRowsPlural":"lignes","qlColumnsPlural":"colonnes","qlRegionsPlural":"zones",
  "qlConflictRow":"même ligne","qlConflictColumn":"même colonne","qlConflictRegion":"même zone","qlConflictAdjacency":"contact diagonal","qlConflictRule":"conflit de règle",
  "qlOrientSingleton":"Regarde {unit}. Observe où sa reine peut encore être placée.",
  "qlOrientLocked":"Regarde {source} et {target}. Où la reine de la première unité peut-elle encore se placer ?",
  "qlOrientCommon":"Regarde les positions encore possibles dans {source}, puis la case {target}.",
  "qlOrientHall":"Regarde {sources}. Dans quelles {targetFamily} leurs reines peuvent-elles encore aller ?",
  "qlOrientCapacity":"Regarde ce bloc {size}×{size}. Combien de reines peut-il contenir au maximum, et quelles unités doivent déjà y placer leurs reines ?",
  "qlOrientNoSupport":"Regarde {target} et les positions possibles dans {support}. Cette case laisserait-elle encore une place à la reine obligatoire ?",
  "qlOrientMixed":"Regarde {sources} et les {rows} ligne(s) / {columns} colonne(s) qui couvrent toutes leurs positions possibles.",
  "qlOrientContradiction":"Regarde {cell}. Testons mentalement l'hypothèse opposée avant de décider.",
  "qlConclusionQueen":"La reine doit donc être placée en {cells}.","qlConclusionXs":"On peut donc placer des croix en {cells}.",
  "qlExplainSingleton":"Il ne reste qu'une seule case possible dans {unit}. Cette unité doit contenir exactement une reine. {conclusion}",
  "qlExplainLocked":"Toutes les positions encore possibles de {source} sont dans {target}. Sa reine sera donc forcément quelque part dans cette seconde unité. Comme celle-ci ne peut contenir qu'une reine, les autres unités ne peuvent plus utiliser les cases indiquées. {conclusion}",
  "qlExplainCommon":"La reine de {source} peut encore être placée en {candidates}. Mais {target} est en conflit avec chacune de ces possibilités ({conflicts}). Quelle que soit la position choisie, cette case serait interdite. {conclusion}",
  "qlExplainHall":"{size} unités doivent placer {size} reines au total. Toutes leurs positions possibles sont contenues dans {targets}. Ces {size} unités cibles sont donc réservées à ces reines ; aucune autre unité ne peut les utiliser. {conclusion}",
  "qlExplainCapacity":"Ce bloc {size}×{size} ne peut contenir que {capacity} reine(s) au maximum. {sourcesCount} unité(s) doivent déjà y placer leurs reines : sa capacité est saturée. Aucune autre reine ne peut y entrer. {conclusion}",
  "qlExplainNoSupport":"Si une reine était placée en {target}, chacune des positions encore possibles de {support} serait interdite. Cette unité n'aurait alors plus aucun emplacement pour sa reine obligatoire. {conclusion}",
  "qlExplainMixed":"{size} zones doivent placer {size} reines. Toutes leurs positions possibles sont couvertes par {rows} ligne(s) et {columns} colonne(s), soit exactement {size} unités de capacité. Elles sont donc entièrement réservées à ce groupe. {conclusion}",
  "qlAssumeQueen":"une reine","qlAssumeX":"une croix",
  "qlWitnessNoCandidate":"{unit} n'aurait plus aucun emplacement possible pour sa reine.","qlWitnessHall":"un groupe d'unités demanderait plus de reines que les unités disponibles ne peuvent en accueillir.","qlWitnessCapacity":"une capacité locale serait dépassée.","qlWitnessRule":"les règles de Queens seraient violées.",
  "qlExplainContradiction":"Essayons {assumed} en {cell}. Après les conséquences logiques de cette hypothèse, {detail} L'hypothèse est donc impossible. {conclusion}",
  "qlCurrentNoCandidate":"Avec les marques actuelles, {unit} n'a plus aucun emplacement possible pour sa reine. Il faut revenir sur au moins une décision précédente.",
  "qlCurrentHall":"Les marques actuelles créent une contradiction de capacité : plusieurs unités doivent placer leurs reines dans trop peu de {targetFamily}. Il faut revenir sur une décision précédente.",
  "qlCurrentCapacity":"Les marques actuelles imposeraient trop de reines dans un bloc {size}×{size}, dont la capacité maximale est {capacity}. Il faut revenir sur une décision précédente.",
  "qlCurrentRule":"Deux reines visibles sont incompatibles ({reason}).","qlCurrentGeneric":"L'état actuel contient une contradiction logique démontrable.","qlLogicalDeduction":"Déduction logique"
});
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
}
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
Object.assign(GAME_RULES.queens,{"zh":"<b>目标：</b>每行、每列和每个彩色区域恰好放一枚皇后。<br><br><b>限制：</b>两枚皇后不能位于同一行、同一列或同一区域，也不能相邻（包括对角相邻）。较远的对角线可以共线。<br><br><b>操作：</b>点按在 空白 → X → 皇后 之间切换；横向或纵向拖动可快速添加或擦除 X。","hi":"<b>लक्ष्य:</b> हर पंक्ति, स्तंभ और रंगीन क्षेत्र में ठीक एक रानी रखें।<br><br><b>नियम:</b> दो रानियाँ एक ही पंक्ति, स्तंभ या क्षेत्र में नहीं हो सकतीं और वे एक-दूसरे को छू भी नहीं सकतीं, तिरछे भी नहीं।<br><br><b>नियंत्रण:</b> टैप से खाली → X → रानी बदलें; X जोड़ने या मिटाने के लिए पंक्ति/स्तंभ में खींचें।","es":"<b>Objetivo:</b> colocar exactamente una reina en cada fila, columna y región coloreada.<br><br><b>Restricciones:</b> dos reinas no pueden compartir fila, columna o región ni tocarse, tampoco en diagonal.<br><br><b>Controles:</b> toca para alternar vacío → X → reina; arrastra horizontal o verticalmente para añadir o borrar X.","ar":"<b>الهدف:</b> ضع ملكة واحدة تمامًا في كل صف وعمود ومنطقة ملوّنة.<br><br><b>القيود:</b> لا يمكن لملكتين مشاركة صف أو عمود أو منطقة، ولا يمكن أن تتلامسا حتى قطريًا.<br><br><b>التحكم:</b> انقر للتبديل بين فارغ ← X ← ملكة؛ واسحب أفقيًا أو عموديًا لإضافة X أو مسحها.","bn":"<b>লক্ষ্য:</b> প্রতিটি সারি, কলাম ও রঙিন অঞ্চলে ঠিক একটি রানি বসান।<br><br><b>নিয়ম:</b> দুটি রানি একই সারি, কলাম বা অঞ্চলে থাকতে পারে না এবং তির্যকভাবেও পাশাপাশি থাকতে পারে না।<br><br><b>নিয়ন্ত্রণ:</b> ট্যাপ করে খালি → X → রানি বদলান; X যোগ বা মুছতে সারি/কলাম বরাবর টানুন।","pt":"<b>Objetivo:</b> colocar exatamente uma rainha em cada linha, coluna e região colorida.<br><br><b>Restrições:</b> duas rainhas não podem compartilhar linha, coluna ou região nem se tocar, inclusive na diagonal.<br><br><b>Controles:</b> toque para alternar vazio → X → rainha; arraste horizontal ou verticalmente para adicionar ou apagar X.","id":"<b>Tujuan:</b> tempatkan tepat satu ratu di setiap baris, kolom, dan wilayah berwarna.<br><br><b>Batasan:</b> dua ratu tidak boleh berbagi baris, kolom, atau wilayah dan tidak boleh bersentuhan, termasuk diagonal.<br><br><b>Kontrol:</b> ketuk untuk beralih kosong → X → ratu; seret horizontal atau vertikal untuk menambah atau menghapus X.","ur":"<b>مقصد:</b> ہر قطار، کالم اور رنگین علاقے میں بالکل ایک ملکہ رکھیں۔<br><br><b>پابندیاں:</b> دو ملکائیں ایک قطار، کالم یا علاقے میں نہیں ہو سکتیں اور ایک دوسرے کو چھو بھی نہیں سکتیں، ترچھی سمت میں بھی نہیں۔<br><br><b>کنٹرول:</b> ٹیپ سے خالی → X → ملکہ بدلیں؛ X شامل یا مٹانے کے لیے قطار/کالم میں ڈریگ کریں۔"});
Object.assign(GAME_RULES.tango,{"zh":"<b>目标：</b>用太阳 ☀ 和月亮 ☾ 填满 36 个格子。<br><br><b>平衡：</b>每行和每列恰好有 3 个太阳和 3 个月亮。<br><br><b>连续：</b>横向或纵向都不能出现三个相同符号连续。<br><br><b>关系：</b>“=” 表示相邻两格相同；“×” 表示不同。","hi":"<b>लक्ष्य:</b> सभी 36 खाने सूर्य ☀ और चंद्र ☾ से भरें।<br><br><b>संतुलन:</b> हर पंक्ति और स्तंभ में ठीक 3 सूर्य और 3 चंद्र हों।<br><br><b>क्रम:</b> क्षैतिज या ऊर्ध्वाधर तीन समान चिन्ह लगातार नहीं हो सकते।<br><br><b>संबंध:</b> “=” का अर्थ समान और “×” का अर्थ अलग है।","es":"<b>Objetivo:</b> llenar las 36 casillas con soles ☀ y lunas ☾.<br><br><b>Equilibrio:</b> cada fila y columna contiene exactamente 3 soles y 3 lunas.<br><br><b>Secuencias:</b> no puede haber tres símbolos iguales consecutivos horizontal o verticalmente.<br><br><b>Relaciones:</b> “=” significa iguales y “×” diferentes.","ar":"<b>الهدف:</b> املأ الخلايا الـ36 بشموس ☀ وأقمار ☾.<br><br><b>التوازن:</b> يحتوي كل صف وعمود على 3 شموس و3 أقمار تمامًا.<br><br><b>التتابع:</b> يُمنع وجود ثلاثة رموز متطابقة متتالية أفقيًا أو عموديًا.<br><br><b>العلاقات:</b> “=” يعني متطابقين و“×” يعني مختلفين.","bn":"<b>লক্ষ্য:</b> ৩৬টি ঘর সূর্য ☀ ও চাঁদ ☾ দিয়ে পূরণ করুন।<br><br><b>ভারসাম্য:</b> প্রতিটি সারি ও কলামে ঠিক ৩টি সূর্য ও ৩টি চাঁদ থাকবে।<br><br><b>ধারা:</b> অনুভূমিক বা উল্লম্বভাবে তিনটি একই চিহ্ন পরপর থাকতে পারবে না।<br><br><b>সম্পর্ক:</b> “=” মানে একই, “×” মানে ভিন্ন।","pt":"<b>Objetivo:</b> preencher as 36 células com sóis ☀ e luas ☾.<br><br><b>Equilíbrio:</b> cada linha e coluna contém exatamente 3 sóis e 3 luas.<br><br><b>Sequências:</b> não pode haver três símbolos iguais consecutivos horizontal ou verticalmente.<br><br><b>Relações:</b> “=” significa iguais e “×” diferentes.","id":"<b>Tujuan:</b> isi 36 sel dengan matahari ☀ dan bulan ☾.<br><br><b>Keseimbangan:</b> setiap baris dan kolom berisi tepat 3 matahari dan 3 bulan.<br><br><b>Urutan:</b> tiga simbol sama berturut-turut dilarang secara horizontal maupun vertikal.<br><br><b>Relasi:</b> “=” berarti sama dan “×” berarti berbeda.","ur":"<b>مقصد:</b> تمام 36 خانے سورج ☀ اور چاند ☾ سے بھریں۔<br><br><b>توازن:</b> ہر قطار اور کالم میں بالکل 3 سورج اور 3 چاند ہوں۔<br><br><b>تسلسل:</b> افقی یا عمودی طور پر تین ایک جیسے نشانات مسلسل نہیں ہو سکتے۔<br><br><b>تعلقات:</b> “=” کا مطلب ایک جیسے اور “×” کا مطلب مختلف ہے۔"});
Object.assign(GAME_RULES.sudoku,{"zh":"<b>目标：</b>用数字 1 到 6 完成 6×6 网格。<br><br><b>行与列：</b>每个数字在每行、每列中恰好出现一次。<br><br><b>宫：</b>每个 2×3 区域也必须恰好包含 1 到 6。初始数字不能修改。","hi":"<b>लक्ष्य:</b> 6×6 ग्रिड को 1 से 6 तक अंकों से पूरा करें।<br><br><b>पंक्तियाँ/स्तंभ:</b> हर अंक हर पंक्ति और स्तंभ में ठीक एक बार आए।<br><br><b>ब्लॉक:</b> हर 2×3 क्षेत्र में भी 1 से 6 तक हर अंक एक बार आए। प्रारंभिक अंक बदले नहीं जा सकते।","es":"<b>Objetivo:</b> completar la cuadrícula 6×6 con los dígitos 1 a 6.<br><br><b>Filas y columnas:</b> cada dígito aparece exactamente una vez en cada una.<br><br><b>Bloques:</b> cada región 2×3 contiene también una vez los dígitos 1 a 6. Las pistas iniciales no se pueden cambiar.","ar":"<b>الهدف:</b> أكمل شبكة 6×6 بالأرقام من 1 إلى 6.<br><br><b>الصفوف والأعمدة:</b> يظهر كل رقم مرة واحدة تمامًا في كل صف وعمود.<br><br><b>المربعات:</b> تحتوي كل منطقة 2×3 أيضًا على الأرقام 1 إلى 6 مرة واحدة. لا يمكن تغيير الأرقام المعطاة.","bn":"<b>লক্ষ্য:</b> ১ থেকে ৬ অঙ্ক দিয়ে ৬×৬ গ্রিড পূরণ করুন।<br><br><b>সারি ও কলাম:</b> প্রতিটি অঙ্ক প্রতিটি সারি ও কলামে একবার থাকবে।<br><br><b>ব্লক:</b> প্রতিটি ২×৩ অঞ্চলেও ১ থেকে ৬ প্রতিটি অঙ্ক একবার থাকবে। শুরুতে দেওয়া অঙ্ক বদলানো যাবে না।","pt":"<b>Objetivo:</b> completar a grade 6×6 com os dígitos de 1 a 6.<br><br><b>Linhas e colunas:</b> cada dígito aparece exatamente uma vez em cada uma.<br><br><b>Blocos:</b> cada região 2×3 também contém os dígitos 1 a 6 uma vez. As pistas iniciais não podem ser alteradas.","id":"<b>Tujuan:</b> lengkapi grid 6×6 dengan angka 1 sampai 6.<br><br><b>Baris dan kolom:</b> setiap angka muncul tepat sekali di masing-masing.<br><br><b>Blok:</b> setiap wilayah 2×3 juga memuat angka 1 sampai 6 tepat sekali. Angka awal tidak dapat diubah.","ur":"<b>مقصد:</b> 6×6 گرڈ کو 1 سے 6 تک ہندسوں سے مکمل کریں۔<br><br><b>قطاریں اور کالم:</b> ہر ہندسہ ہر قطار اور کالم میں بالکل ایک بار آئے۔<br><br><b>بلاکس:</b> ہر 2×3 علاقے میں بھی 1 سے 6 تک ہر ہندسہ ایک بار آئے۔ شروع کے ہندسے بدلے نہیں جا سکتے۔"});
Object.assign(GAME_RULES.patches,{"zh":"<b>目标：</b>把整个网格划分为互不重叠的矩形或正方形。<br><br><b>操作：</b>从一个角拖到对角绘制矩形；从已有矩形再次拖动可调整大小；点按已有矩形可删除。<br><br><b>提示：</b>每个区域恰好包含一个提示格。<br><br><b>有效性：</b>每格只属于一个区域，每个区域必须连通且为矩形，且不能包含两个提示。","hi":"<b>लक्ष्य:</b> पूरी ग्रिड को बिना ओवरलैप वाले आयतों या वर्गों में बाँटें।<br><br><b>नियंत्रण:</b> एक कोने से विपरीत कोने तक खींचकर आयत बनाएँ; मौजूदा आयत से फिर खींचकर उसका आकार बदलें; टैप करके हटाएँ।<br><br><b>संकेत:</b> हर क्षेत्र में ठीक एक संकेत-खाना हो।<br><br><b>वैधता:</b> हर खाना एक ही क्षेत्र में हो, क्षेत्र जुड़ा और आयताकार हो, तथा दो संकेत न हों।","es":"<b>Objetivo:</b> dividir toda la cuadrícula en rectángulos o cuadrados sin solapamiento.<br><br><b>Interacción:</b> arrastra de una esquina a la opuesta para dibujar; vuelve a arrastrar desde un rectángulo para redimensionarlo; toca para eliminarlo.<br><br><b>Pistas:</b> cada región contiene exactamente una casilla-pista.<br><br><b>Validez:</b> cada casilla pertenece a una sola región, cada región es continua y rectangular y no puede contener dos pistas.","ar":"<b>الهدف:</b> قسّم الشبكة كلها إلى مستطيلات أو مربعات غير متداخلة.<br><br><b>التفاعل:</b> اسحب من زاوية إلى المقابلة لرسم مستطيل؛ اسحب مجددًا من مستطيل قائم لتغيير حجمه؛ وانقر عليه لحذفه.<br><br><b>التلميحات:</b> تحتوي كل منطقة على خلية تلميح واحدة تمامًا.<br><br><b>الصحة:</b> تنتمي كل خلية إلى منطقة واحدة، وكل منطقة متصلة ومستطيلة ولا تحتوي على تلميحين.","bn":"<b>লক্ষ্য:</b> পুরো গ্রিডকে ওভারল্যাপহীন আয়তক্ষেত্র বা বর্গে ভাগ করুন।<br><br><b>নিয়ন্ত্রণ:</b> এক কোণ থেকে বিপরীত কোণে টেনে আয়তক্ষেত্র আঁকুন; বিদ্যমান আয়তক্ষেত্র থেকে আবার টেনে আকার বদলান; ট্যাপ করে মুছুন।<br><br><b>ইঙ্গিত:</b> প্রতিটি অঞ্চলে ঠিক একটি ইঙ্গিত-ঘর থাকবে।<br><br><b>বৈধতা:</b> প্রতিটি ঘর একটি অঞ্চলে থাকবে, অঞ্চল সংযুক্ত ও আয়তাকার হবে এবং দুটি ইঙ্গিত থাকবে না।","pt":"<b>Objetivo:</b> dividir toda a grade em retângulos ou quadrados sem sobreposição.<br><br><b>Interação:</b> arraste de um canto ao oposto para desenhar; arraste novamente a partir de um retângulo para redimensionar; toque para remover.<br><br><b>Pistas:</b> cada região contém exatamente uma célula-pista.<br><br><b>Validade:</b> cada célula pertence a uma região, cada região é conectada e retangular e não pode conter duas pistas.","id":"<b>Tujuan:</b> bagi seluruh grid menjadi persegi panjang atau persegi tanpa tumpang tindih.<br><br><b>Interaksi:</b> seret dari satu sudut ke sudut berlawanan untuk menggambar; seret lagi dari persegi panjang yang ada untuk mengubah ukuran; ketuk untuk menghapus.<br><br><b>Petunjuk:</b> setiap wilayah berisi tepat satu sel petunjuk.<br><br><b>Validitas:</b> setiap sel berada di satu wilayah, setiap wilayah tersambung dan berbentuk persegi panjang, serta tidak boleh memiliki dua petunjuk.","ur":"<b>مقصد:</b> پوری گرڈ کو بغیر اوورلیپ کے مستطیلوں یا مربعوں میں تقسیم کریں۔<br><br><b>کنٹرول:</b> ایک کونے سے مخالف کونے تک ڈریگ کرکے مستطیل بنائیں؛ موجودہ مستطیل سے دوبارہ ڈریگ کرکے سائز بدلیں؛ ٹیپ کرکے حذف کریں۔<br><br><b>اشارے:</b> ہر علاقے میں بالکل ایک اشارہ خانہ ہو۔<br><br><b>درستگی:</b> ہر خانہ ایک علاقے کا ہو، ہر علاقہ جڑا اور مستطیل ہو اور دو اشارے نہ رکھے۔"});

/* v2.10.0 — EU game rules */
Object.assign(GAME_RULES.queens,{"bg":"<b>Цел:</b> постави точно една царица във всеки ред, колона и цветна област.<br><br><b>Правила:</b> две царици не могат да споделят ред, колона или област и не могат да се докосват, включително по диагонал.<br><br><b>Управление:</b> докосването сменя празно → X → царица. Плъзни по ред или колона за бързо добавяне или изтриване на X.","hr":"<b>Cilj:</b> postavi točno jednu kraljicu u svaki redak, stupac i obojeno područje.<br><br><b>Pravila:</b> dvije kraljice ne smiju dijeliti redak, stupac ni područje i ne smiju se dodirivati, ni dijagonalno.<br><br><b>Upravljanje:</b> dodir mijenja prazno → X → kraljica. Povuci po retku ili stupcu za brzo dodavanje ili brisanje X.","cs":"<b>Cíl:</b> umísti právě jednu královnu do každého řádku, sloupce a barevné oblasti.<br><br><b>Pravidla:</b> dvě královny nesmí sdílet řádek, sloupec ani oblast a nesmí se dotýkat ani diagonálně.<br><br><b>Ovládání:</b> klepnutí přepíná prázdné → X → královna. Tažením po řádku nebo sloupci rychle přidáš či smažeš X.","da":"<b>Mål:</b> placér præcis én dronning i hver række, kolonne og farvet region.<br><br><b>Regler:</b> to dronninger må ikke dele række, kolonne eller region og må heller ikke røre hinanden, heller ikke diagonalt.<br><br><b>Betjening:</b> tryk skifter tom → X → dronning. Træk langs en række eller kolonne for hurtigt at tilføje eller slette X.","nl":"<b>Doel:</b> plaats precies één koningin in elke rij, kolom en gekleurde regio.<br><br><b>Regels:</b> twee koninginnen mogen geen rij, kolom of regio delen en mogen elkaar ook diagonaal niet raken.<br><br><b>Bediening:</b> tik voor leeg → X → koningin. Sleep langs een rij of kolom om snel X'en toe te voegen of te wissen.","et":"<b>Eesmärk:</b> paiguta täpselt üks kuninganna igasse ritta, veergu ja värvilisse piirkonda.<br><br><b>Reeglid:</b> kaks kuningannat ei tohi olla samas reas, veerus või piirkonnas ega üksteist puudutada, ka diagonaalselt.<br><br><b>Juhtimine:</b> puudutus vahetab tühi → X → kuninganna. Lohista mööda rida või veergu X-ide kiireks lisamiseks või kustutamiseks.","fi":"<b>Tavoite:</b> sijoita täsmälleen yksi kuningatar jokaiselle riville, sarakkeeseen ja värilliselle alueelle.<br><br><b>Säännöt:</b> kaksi kuningatarta ei saa olla samalla rivillä, sarakkeessa tai alueella eikä koskettaa toisiaan edes vinottain.<br><br><b>Ohjaus:</b> napautus vaihtaa tyhjä → X → kuningatar. Vedä riviä tai saraketta pitkin lisätäksesi tai poistaaksesi X-merkkejä.","de":"<b>Ziel:</b> Setze genau eine Königin in jede Zeile, jede Spalte und jede farbige Region.<br><br><b>Regeln:</b> Zwei Königinnen dürfen weder dieselbe Zeile, Spalte oder Region teilen noch sich berühren, auch nicht diagonal.<br><br><b>Steuerung:</b> Tippen wechselt leer → X → Königin. Ziehen entlang einer Zeile oder Spalte setzt oder löscht schnell X.","el":"<b>Στόχος:</b> τοποθέτησε ακριβώς μία βασίλισσα σε κάθε γραμμή, στήλη και χρωματιστή περιοχή.<br><br><b>Κανόνες:</b> δύο βασίλισσες δεν μπορούν να μοιράζονται γραμμή, στήλη ή περιοχή και δεν μπορούν να αγγίζονται, ούτε διαγώνια.<br><br><b>Χειρισμός:</b> το άγγιγμα αλλάζει κενό → X → βασίλισσα. Σύρε σε γραμμή ή στήλη για γρήγορη προσθήκη ή διαγραφή X.","hu":"<b>Cél:</b> helyezz pontosan egy királynőt minden sorba, oszlopba és színes régióba.<br><br><b>Szabályok:</b> két királynő nem lehet ugyanabban a sorban, oszlopban vagy régióban, és nem érinthetik egymást átlósan sem.<br><br><b>Irányítás:</b> érintéssel: üres → X → királynő. Húzd végig a sort vagy oszlopot X-ek gyors hozzáadásához vagy törléséhez.","ga":"<b>Sprioc:</b> cuir banríon amháin go díreach i ngach ró, colún agus réigiún daite.<br><br><b>Rialacha:</b> ní féidir le dhá bhanríon ró, colún ná réigiún a roinnt agus ní féidir leo teagmháil a dhéanamh, fiú go trasnánach.<br><br><b>Rialú:</b> athraíonn tapáil folamh → X → banríon. Tarraing feadh ró nó colúin chun X a chur leis nó a scriosadh go tapa.","it":"<b>Obiettivo:</b> posiziona esattamente una regina in ogni riga, colonna e regione colorata.<br><br><b>Regole:</b> due regine non possono condividere riga, colonna o regione né toccarsi, neppure in diagonale.<br><br><b>Controlli:</b> un tocco alterna vuoto → X → regina. Trascina su riga o colonna per aggiungere o cancellare rapidamente le X.","lv":"<b>Mērķis:</b> ievieto tieši vienu karalieni katrā rindā, kolonnā un krāsainajā reģionā.<br><br><b>Noteikumi:</b> divas karalienes nedrīkst būt vienā rindā, kolonnā vai reģionā un nedrīkst saskarties arī pa diagonāli.<br><br><b>Vadība:</b> pieskāriens maina tukšs → X → karaliene. Velc pa rindu vai kolonnu, lai ātri pievienotu vai dzēstu X.","lt":"<b>Tikslas:</b> padėk po vieną karalienę kiekvienoje eilutėje, stulpelyje ir spalvotoje srityje.<br><br><b>Taisyklės:</b> dvi karalienės negali būti toje pačioje eilutėje, stulpelyje ar srityje ir negali liestis, net įstrižai.<br><br><b>Valdymas:</b> bakstelėjimas keičia tuščia → X → karalienė. Brauk per eilutę ar stulpelį, kad greitai pridėtum ar ištrintum X.","mt":"<b>Għan:</b> poġġi eżattament reġina waħda f’kull ringiela, kolonna u reġjun ikkulurit.<br><br><b>Regoli:</b> żewġ reġini ma jistgħux jaqsmu ringiela, kolonna jew reġjun u ma jistgħux imissu lil xulxin, lanqas dijagonalment.<br><br><b>Kontroll:</b> tektek biex tbiddel vojt → X → reġina. Iġbed tul ringiela jew kolonna biex iżżid jew tħassar X malajr.","pl":"<b>Cel:</b> umieść dokładnie jedną królową w każdym wierszu, kolumnie i kolorowym regionie.<br><br><b>Zasady:</b> dwie królowe nie mogą dzielić wiersza, kolumny ani regionu i nie mogą się stykać, także po przekątnej.<br><br><b>Sterowanie:</b> dotknięcie przełącza puste → X → królowa. Przeciągaj po wierszu lub kolumnie, aby szybko dodawać lub usuwać X.","ro":"<b>Scop:</b> plasează exact o regină în fiecare rând, coloană și regiune colorată.<br><br><b>Reguli:</b> două regine nu pot împărți același rând, coloană sau regiune și nu se pot atinge, nici pe diagonală.<br><br><b>Control:</b> atingerea schimbă gol → X → regină. Glisează pe un rând sau o coloană pentru a adăuga sau șterge rapid X.","sk":"<b>Cieľ:</b> umiestni presne jednu kráľovnú do každého riadku, stĺpca a farebnej oblasti.<br><br><b>Pravidlá:</b> dve kráľovné nesmú zdieľať riadok, stĺpec ani oblasť a nesmú sa dotýkať ani diagonálne.<br><br><b>Ovládanie:</b> ťuknutie prepína prázdne → X → kráľovná. Potiahnutím po riadku alebo stĺpci rýchlo pridáš alebo zmažeš X.","sl":"<b>Cilj:</b> postavi natanko eno kraljico v vsako vrstico, stolpec in barvno območje.<br><br><b>Pravila:</b> dve kraljici ne smeta biti v isti vrstici, stolpcu ali območju in se ne smeta dotikati niti diagonalno.<br><br><b>Upravljanje:</b> tap preklaplja prazno → X → kraljica. Povleci po vrstici ali stolpcu za hitro dodajanje ali brisanje X.","sv":"<b>Mål:</b> placera exakt en drottning i varje rad, kolumn och färgad region.<br><br><b>Regler:</b> två drottningar får inte dela rad, kolumn eller region och får inte röra varandra, inte ens diagonalt.<br><br><b>Kontroller:</b> tryck för tom → X → drottning. Dra längs en rad eller kolumn för att snabbt lägga till eller ta bort X."});
Object.assign(GAME_RULES.tango,{"bg":"<b>Цел:</b> запълни всичките 36 клетки със слънца ☀ и луни ☾.<br><br><b>Баланс:</b> всеки ред и колона съдържа точно 3 слънца и 3 луни.<br><br><b>Поредици:</b> три еднакви последователни символа са забранени хоризонтално и вертикално.<br><br><b>Връзки:</b> „=“ означава еднакви, „×“ различни.","hr":"<b>Cilj:</b> ispuni svih 36 polja suncima ☀ i mjesecima ☾.<br><br><b>Ravnoteža:</b> svaki redak i stupac sadrži točno 3 sunca i 3 mjeseca.<br><br><b>Nizovi:</b> tri ista uzastopna simbola zabranjena su vodoravno i okomito.<br><br><b>Odnosi:</b> “=” znači jednako, “×” različito.","cs":"<b>Cíl:</b> vyplň všech 36 polí slunci ☀ a měsíci ☾.<br><br><b>Rovnováha:</b> každý řádek a sloupec obsahuje přesně 3 slunce a 3 měsíce.<br><br><b>Řady:</b> tři stejné symboly za sebou jsou vodorovně i svisle zakázány.<br><br><b>Vztahy:</b> „=“ znamená stejné, „×“ různé.","da":"<b>Mål:</b> fyld alle 36 felter med sole ☀ og måner ☾.<br><br><b>Balance:</b> hver række og kolonne indeholder præcis 3 sole og 3 måner.<br><br><b>Følger:</b> tre ens symboler i træk er forbudt vandret og lodret.<br><br><b>Relationer:</b> “=” betyder ens, “×” forskellige.","nl":"<b>Doel:</b> vul alle 36 vakken met zonnen ☀ en manen ☾.<br><br><b>Balans:</b> elke rij en kolom bevat precies 3 zonnen en 3 manen.<br><br><b>Reeksen:</b> drie gelijke opeenvolgende symbolen zijn horizontaal en verticaal verboden.<br><br><b>Relaties:</b> “=” betekent gelijk, “×” verschillend.","et":"<b>Eesmärk:</b> täida kõik 36 ruutu päikeste ☀ ja kuudega ☾.<br><br><b>Tasakaal:</b> igas reas ja veerus on täpselt 3 päikest ja 3 kuud.<br><br><b>Jadad:</b> kolm ühesugust sümbolit järjest on horisontaalselt ja vertikaalselt keelatud.<br><br><b>Seosed:</b> “=” tähendab sama, “×” erinevat.","fi":"<b>Tavoite:</b> täytä kaikki 36 ruutua auringoilla ☀ ja kuilla ☾.<br><br><b>Tasapaino:</b> jokaisella rivillä ja sarakkeessa on täsmälleen 3 aurinkoa ja 3 kuuta.<br><br><b>Jonot:</b> kolme samaa symbolia peräkkäin on kielletty vaaka- ja pystysuunnassa.<br><br><b>Suhteet:</b> “=” tarkoittaa samaa, “×” eri.","de":"<b>Ziel:</b> Fülle alle 36 Felder mit Sonnen ☀ und Monden ☾.<br><br><b>Balance:</b> Jede Zeile und Spalte enthält genau 3 Sonnen und 3 Monde.<br><br><b>Folgen:</b> Drei gleiche Symbole hintereinander sind waagerecht und senkrecht verboten.<br><br><b>Beziehungen:</b> „=“ bedeutet gleich, „×“ verschieden.","el":"<b>Στόχος:</b> γέμισε και τα 36 κελιά με ήλιους ☀ και σελήνες ☾.<br><br><b>Ισορροπία:</b> κάθε γραμμή και στήλη έχει ακριβώς 3 ήλιους και 3 σελήνες.<br><br><b>Ακολουθίες:</b> απαγορεύονται τρία ίδια συνεχόμενα σύμβολα οριζόντια ή κάθετα.<br><br><b>Σχέσεις:</b> “=” σημαίνει ίδια, “×” διαφορετικά.","hu":"<b>Cél:</b> töltsd ki mind a 36 mezőt napokkal ☀ és holdakkal ☾.<br><br><b>Egyensúly:</b> minden sorban és oszlopban pontosan 3 nap és 3 hold van.<br><br><b>Sorozatok:</b> három azonos egymást követő szimbólum vízszintesen és függőlegesen tilos.<br><br><b>Kapcsolatok:</b> “=” azonosat, “×” különbözőt jelent.","ga":"<b>Sprioc:</b> líon na 36 cill le grian ☀ agus gealach ☾.<br><br><b>Cothromaíocht:</b> tá 3 ghrian agus 3 ghealach go díreach i ngach ró agus colún.<br><br><b>Seichimh:</b> tá trí shiombail chomhionanna as a chéile toirmiscthe go cothrománach agus go hingearach.<br><br><b>Caidrimh:</b> ciallaíonn “=” mar an gcéanna agus “×” difriúil.","it":"<b>Obiettivo:</b> riempi tutte le 36 caselle con soli ☀ e lune ☾.<br><br><b>Equilibrio:</b> ogni riga e colonna contiene esattamente 3 soli e 3 lune.<br><br><b>Sequenze:</b> sono vietati tre simboli identici consecutivi in orizzontale o verticale.<br><br><b>Relazioni:</b> “=” significa uguali, “×” diversi.","lv":"<b>Mērķis:</b> aizpildi visas 36 šūnas ar saulēm ☀ un mēnešiem ☾.<br><br><b>Līdzsvars:</b> katrā rindā un kolonnā ir tieši 3 saules un 3 mēneši.<br><br><b>Secības:</b> trīs vienādi simboli pēc kārtas ir aizliegti horizontāli un vertikāli.<br><br><b>Attiecības:</b> “=” nozīmē vienādi, “×” atšķirīgi.","lt":"<b>Tikslas:</b> užpildyk visus 36 langelius saulėmis ☀ ir mėnuliais ☾.<br><br><b>Pusiausvyra:</b> kiekvienoje eilutėje ir stulpelyje yra tiksliai 3 saulės ir 3 mėnuliai.<br><br><b>Sekos:</b> trys vienodi simboliai iš eilės draudžiami horizontaliai ir vertikaliai.<br><br><b>Ryšiai:</b> “=” reiškia vienodi, “×” skirtingi.","mt":"<b>Għan:</b> imla s-36 ċella kollha bix-xemx ☀ u l-qamar ☾.<br><br><b>Bilanċ:</b> kull ringiela u kolonna fiha eżattament 3 xemxijiet u 3 qamriet.<br><br><b>Sekwenzi:</b> tliet simboli identiċi wara xulxin huma pprojbiti orizzontalment u vertikalment.<br><br><b>Relazzjonijiet:</b> “=” tfisser l-istess, “×” differenti.","pl":"<b>Cel:</b> wypełnij 36 pól słońcami ☀ i księżycami ☾.<br><br><b>Równowaga:</b> każdy wiersz i kolumna ma dokładnie 3 słońca i 3 księżyce.<br><br><b>Sekwencje:</b> trzy identyczne symbole z rzędu są zabronione poziomo i pionowo.<br><br><b>Relacje:</b> „=” oznacza takie same, „×” różne.","ro":"<b>Scop:</b> umple toate cele 36 de celule cu sori ☀ și luni ☾.<br><br><b>Echilibru:</b> fiecare rând și coloană conține exact 3 sori și 3 luni.<br><br><b>Șiruri:</b> trei simboluri identice consecutive sunt interzise orizontal și vertical.<br><br><b>Relații:</b> „=” înseamnă identice, „×” diferite.","sk":"<b>Cieľ:</b> vyplň všetkých 36 polí slnkami ☀ a mesiacmi ☾.<br><br><b>Rovnováha:</b> každý riadok a stĺpec obsahuje presne 3 slnká a 3 mesiace.<br><br><b>Postupnosti:</b> tri rovnaké symboly za sebou sú vodorovne aj zvisle zakázané.<br><br><b>Vzťahy:</b> „=“ znamená rovnaké, „×“ rôzne.","sl":"<b>Cilj:</b> zapolni vseh 36 polj s sonci ☀ in lunami ☾.<br><br><b>Ravnovesje:</b> vsaka vrstica in stolpec vsebuje natanko 3 sonca in 3 lune.<br><br><b>Zaporedja:</b> trije enaki zaporedni simboli so prepovedani vodoravno in navpično.<br><br><b>Odnosi:</b> “=” pomeni enako, “×” različno.","sv":"<b>Mål:</b> fyll alla 36 rutor med solar ☀ och månar ☾.<br><br><b>Balans:</b> varje rad och kolumn innehåller exakt 3 solar och 3 månar.<br><br><b>Följder:</b> tre likadana symboler i rad är förbjudna vågrätt och lodrätt.<br><br><b>Relationer:</b> “=” betyder lika, “×” olika."});
Object.assign(GAME_RULES.sudoku,{"bg":"<b>Цел:</b> попълни мрежата 6×6 с цифрите 1–6.<br><br><b>Редове и колони:</b> всяка цифра се среща точно веднъж.<br><br><b>Блокове:</b> всяка област 2×3 също съдържа 1–6 по веднъж. Началните цифри не могат да се променят.","hr":"<b>Cilj:</b> popuni mrežu 6×6 znamenkama 1–6.<br><br><b>Retci i stupci:</b> svaka znamenka pojavljuje se točno jednom.<br><br><b>Blokovi:</b> svako područje 2×3 također sadrži 1–6 po jednom. Početne znamenke ne mogu se mijenjati.","cs":"<b>Cíl:</b> doplň mřížku 6×6 číslicemi 1–6.<br><br><b>Řádky a sloupce:</b> každá číslice se objeví právě jednou.<br><br><b>Bloky:</b> každá oblast 2×3 obsahuje také 1–6 právě jednou. Počáteční čísla nelze měnit.","da":"<b>Mål:</b> udfyld 6×6-gitteret med cifrene 1–6.<br><br><b>Rækker og kolonner:</b> hvert ciffer forekommer præcis én gang.<br><br><b>Blokke:</b> hver 2×3-region indeholder også 1–6 én gang. Starttal kan ikke ændres.","nl":"<b>Doel:</b> vul het 6×6-raster met de cijfers 1 t/m 6.<br><br><b>Rijen en kolommen:</b> elk cijfer komt precies één keer voor.<br><br><b>Blokken:</b> elk 2×3-blok bevat ook 1 t/m 6 precies één keer. Startcijfers kunnen niet worden gewijzigd.","et":"<b>Eesmärk:</b> täida 6×6 ruudustik numbritega 1–6.<br><br><b>Read ja veerud:</b> iga number esineb täpselt üks kord.<br><br><b>Plokid:</b> iga 2×3 piirkond sisaldab samuti 1–6 üks kord. Algseid vihjeid ei saa muuta.","fi":"<b>Tavoite:</b> täytä 6×6-ruudukko numeroilla 1–6.<br><br><b>Rivit ja sarakkeet:</b> jokainen numero esiintyy täsmälleen kerran.<br><br><b>Alueet:</b> jokainen 2×3-alue sisältää myös 1–6 kerran. Alkuvihjeitä ei voi muuttaa.","de":"<b>Ziel:</b> Fülle das 6×6-Gitter mit den Ziffern 1 bis 6.<br><br><b>Zeilen und Spalten:</b> Jede Ziffer erscheint genau einmal.<br><br><b>Blöcke:</b> Auch jeder 2×3-Block enthält 1 bis 6 genau einmal. Vorgegebene Zahlen können nicht geändert werden.","el":"<b>Στόχος:</b> συμπλήρωσε το πλέγμα 6×6 με τα ψηφία 1–6.<br><br><b>Γραμμές και στήλες:</b> κάθε ψηφίο εμφανίζεται ακριβώς μία φορά.<br><br><b>Μπλοκ:</b> κάθε περιοχή 2×3 περιέχει επίσης τα 1–6 μία φορά. Τα αρχικά ψηφία δεν αλλάζουν.","hu":"<b>Cél:</b> töltsd ki a 6×6 rácsot az 1–6 számjegyekkel.<br><br><b>Sorok és oszlopok:</b> minden számjegy pontosan egyszer szerepel.<br><br><b>Blokkok:</b> minden 2×3 régió is egyszer tartalmazza az 1–6 számokat. A kezdő számok nem módosíthatók.","ga":"<b>Sprioc:</b> líon an ghreille 6×6 leis na digití 1–6.<br><br><b>Rónna agus colúin:</b> tagann gach digit chun cinn uair amháin go díreach.<br><br><b>Bloic:</b> tá 1–6 uair amháin i ngach réigiún 2×3 freisin. Ní féidir na digití tosaigh a athrú.","it":"<b>Obiettivo:</b> completa la griglia 6×6 con le cifre da 1 a 6.<br><br><b>Righe e colonne:</b> ogni cifra compare una sola volta.<br><br><b>Blocchi:</b> anche ogni regione 2×3 contiene una sola volta le cifre 1–6. Gli indizi iniziali non possono essere modificati.","lv":"<b>Mērķis:</b> aizpildi 6×6 režģi ar cipariem 1–6.<br><br><b>Rindas un kolonnas:</b> katrs cipars parādās tieši vienreiz.<br><br><b>Bloki:</b> katrs 2×3 reģions arī satur 1–6 pa vienai reizei. Sākuma ciparus nevar mainīt.","lt":"<b>Tikslas:</b> užpildyk 6×6 tinklelį skaitmenimis 1–6.<br><br><b>Eilutės ir stulpeliai:</b> kiekvienas skaitmuo pasirodo tiksliai vieną kartą.<br><br><b>Blokai:</b> kiekvienoje 2×3 srityje taip pat yra 1–6 po vieną kartą. Pradinių skaitmenų keisti negalima.","mt":"<b>Għan:</b> imla l-grilja 6×6 biċ-ċifri 1–6.<br><br><b>Ringieli u kolonni:</b> kull ċifra tidher eżattament darba.<br><br><b>Blokki:</b> kull reġjun 2×3 fih ukoll 1–6 darba kull wieħed. Iċ-ċifri inizjali ma jistgħux jinbidlu.","pl":"<b>Cel:</b> uzupełnij siatkę 6×6 cyframi 1–6.<br><br><b>Wiersze i kolumny:</b> każda cyfra występuje dokładnie raz.<br><br><b>Bloki:</b> każdy blok 2×3 również zawiera cyfry 1–6 po jednym razie. Początkowych cyfr nie można zmieniać.","ro":"<b>Scop:</b> completează grila 6×6 cu cifrele 1–6.<br><br><b>Rânduri și coloane:</b> fiecare cifră apare exact o dată.<br><br><b>Blocuri:</b> fiecare regiune 2×3 conține de asemenea cifrele 1–6 o singură dată. Indiciile inițiale nu pot fi schimbate.","sk":"<b>Cieľ:</b> doplň mriežku 6×6 číslicami 1–6.<br><br><b>Riadky a stĺpce:</b> každá číslica sa objaví presne raz.<br><br><b>Bloky:</b> každá oblasť 2×3 obsahuje tiež 1–6 presne raz. Počiatočné čísla nemožno meniť.","sl":"<b>Cilj:</b> dopolni mrežo 6×6 s števkami 1–6.<br><br><b>Vrstice in stolpci:</b> vsaka števka se pojavi natanko enkrat.<br><br><b>Bloki:</b> vsako območje 2×3 prav tako vsebuje 1–6 po enkrat. Začetnih števil ni mogoče spreminjati.","sv":"<b>Mål:</b> fyll 6×6-rutnätet med siffrorna 1–6.<br><br><b>Rader och kolumner:</b> varje siffra förekommer exakt en gång.<br><br><b>Block:</b> varje 2×3-region innehåller också 1–6 exakt en gång. Startvärden kan inte ändras."});
Object.assign(GAME_RULES.patches,{"bg":"<b>Цел:</b> раздели цялата мрежа на неприпокриващи се правоъгълници или квадрати.<br><br><b>Управление:</b> плъзни от единия ъгъл до противоположния, за да начертаеш или промениш правоъгълник; докосни го за изтриване.<br><br><b>Подсказки:</b> всяка област съдържа точно една клетка-подсказка.<br><br><b>Валидност:</b> всяка клетка принадлежи на една свързана правоъгълна област и никоя област не може да съдържа две подсказки.","hr":"<b>Cilj:</b> podijeli cijelu mrežu u pravokutnike ili kvadrate bez preklapanja.<br><br><b>Upravljanje:</b> povuci iz jednog kuta u suprotni za crtanje ili promjenu pravokutnika; dodirni ga za uklanjanje.<br><br><b>Tragovi:</b> svako područje sadrži točno jedno polje s tragom.<br><br><b>Valjanost:</b> svako polje pripada jednom povezanom pravokutnom području i nijedno područje ne smije sadržavati dva traga.","cs":"<b>Cíl:</b> rozděl celou mřížku na nepřekrývající se obdélníky nebo čtverce.<br><br><b>Ovládání:</b> táhni z jednoho rohu do protějšího pro nakreslení nebo změnu obdélníku; klepnutím ho odstraníš.<br><br><b>Nápovědy:</b> každá oblast obsahuje právě jedno pole s nápovědou.<br><br><b>Platnost:</b> každé pole patří právě do jedné souvislé obdélníkové oblasti a oblast nesmí obsahovat dvě nápovědy.","da":"<b>Mål:</b> opdel hele gitteret i rektangler eller kvadrater uden overlap.<br><br><b>Betjening:</b> træk fra et hjørne til det modsatte for at tegne eller ændre et rektangel; tryk for at fjerne det.<br><br><b>Hints:</b> hver region indeholder præcis ét hintfelt.<br><br><b>Gyldighed:</b> hvert felt tilhører præcis én sammenhængende rektangulær region, og ingen region må indeholde to hints.","nl":"<b>Doel:</b> verdeel het hele raster zonder overlap in rechthoeken of vierkanten.<br><br><b>Bediening:</b> sleep van een hoek naar de tegenoverliggende om een rechthoek te tekenen of te wijzigen; tik erop om hem te verwijderen.<br><br><b>Aanwijzingen:</b> elke regio bevat precies één aanwijzingsvak.<br><br><b>Geldigheid:</b> elk vak hoort bij precies één aaneengesloten rechthoekige regio en een regio mag geen twee aanwijzingen bevatten.","et":"<b>Eesmärk:</b> jaga kogu ruudustik kattumatuteks ristkülikuteks või ruutudeks.<br><br><b>Juhtimine:</b> lohista ühest nurgast vastasnurka, et ristkülikut joonistada või muuta; eemaldamiseks puuduta seda.<br><br><b>Vihjed:</b> igas piirkonnas on täpselt üks vihjeruut.<br><br><b>Kehtivus:</b> iga ruut kuulub täpselt ühte ühendatud ristkülikukujulisse piirkonda ja piirkonnas ei tohi olla kahte vihjet.","fi":"<b>Tavoite:</b> jaa koko ruudukko päällekkäisyydettömiin suorakulmioihin tai neliöihin.<br><br><b>Ohjaus:</b> vedä kulmasta vastakkaiseen kulmaan piirtääksesi tai muuttaaksesi suorakulmiota; poista se napauttamalla.<br><br><b>Vihjeet:</b> jokaisella alueella on täsmälleen yksi vihjeruutu.<br><br><b>Kelvollisuus:</b> jokainen ruutu kuuluu yhteen yhtenäiseen suorakulmaiseen alueeseen eikä alueella saa olla kahta vihjettä.","de":"<b>Ziel:</b> Teile das gesamte Gitter ohne Überlappung in Rechtecke oder Quadrate.<br><br><b>Steuerung:</b> Ziehe von einer Ecke zur gegenüberliegenden, um ein Rechteck zu zeichnen oder zu ändern; tippe darauf, um es zu löschen.<br><br><b>Hinweise:</b> Jede Region enthält genau ein Hinweisfeld.<br><br><b>Gültigkeit:</b> Jedes Feld gehört zu genau einer zusammenhängenden rechteckigen Region, und keine Region darf zwei Hinweise enthalten.","el":"<b>Στόχος:</b> χώρισε όλο το πλέγμα σε μη επικαλυπτόμενα ορθογώνια ή τετράγωνα.<br><br><b>Χειρισμός:</b> σύρε από μία γωνία στην απέναντι για να σχεδιάσεις ή να αλλάξεις ορθογώνιο· άγγιξέ το για διαγραφή.<br><br><b>Ενδείξεις:</b> κάθε περιοχή περιέχει ακριβώς ένα κελί-ένδειξη.<br><br><b>Εγκυρότητα:</b> κάθε κελί ανήκει σε μία συνδεδεμένη ορθογώνια περιοχή και καμία περιοχή δεν μπορεί να περιέχει δύο ενδείξεις.","hu":"<b>Cél:</b> oszd fel az egész rácsot átfedés nélküli téglalapokra vagy négyzetekre.<br><br><b>Irányítás:</b> húzd az egyik saroktól az átellenesig téglalap rajzolásához vagy módosításához; érintsd meg a törléshez.<br><br><b>Nyomok:</b> minden régió pontosan egy nyommezőt tartalmaz.<br><br><b>Érvényesség:</b> minden mező egy összefüggő téglalap alakú régióhoz tartozik, és egy régió nem tartalmazhat két nyomot.","ga":"<b>Sprioc:</b> roinn an ghreille iomlán ina dhronuilleoga nó cearnóga gan forluí.<br><br><b>Rialú:</b> tarraing ó chúinne go dtí an cúinne os coinne chun dronuilleog a tharraingt nó a athrú; tapáil í chun í a bhaint.<br><br><b>Leideanna:</b> tá cill leide amháin go díreach i ngach réigiún.<br><br><b>Bailíocht:</b> baineann gach cill le réigiún dronuilleogach ceangailte amháin agus ní féidir dhá leid a bheith in aon réigiún.","it":"<b>Obiettivo:</b> dividi tutta la griglia in rettangoli o quadrati senza sovrapposizioni.<br><br><b>Controlli:</b> trascina da un angolo a quello opposto per disegnare o ridimensionare un rettangolo; toccalo per eliminarlo.<br><br><b>Indizi:</b> ogni regione contiene esattamente una casella-indizio.<br><br><b>Validità:</b> ogni casella appartiene a una sola regione connessa e rettangolare e nessuna regione può contenere due indizi.","lv":"<b>Mērķis:</b> sadali visu režģi nepārklājošos taisnstūros vai kvadrātos.<br><br><b>Vadība:</b> velc no viena stūra uz pretējo, lai zīmētu vai mainītu taisnstūri; pieskaries, lai to dzēstu.<br><br><b>Pavedieni:</b> katrā reģionā ir tieši viena pavediena šūna.<br><br><b>Derīgums:</b> katra šūna pieder vienam savienotam taisnstūrveida reģionam, un reģionā nedrīkst būt divi pavedieni.","lt":"<b>Tikslas:</b> padalink visą tinklelį į nepersidengiančius stačiakampius ar kvadratus.<br><br><b>Valdymas:</b> brauk nuo vieno kampo iki priešingo, kad nubrėžtum ar pakeistum stačiakampį; bakstelėk, kad jį pašalintum.<br><br><b>Užuominos:</b> kiekvienoje srityje yra tiksliai vienas užuominos langelis.<br><br><b>Teisingumas:</b> kiekvienas langelis priklauso vienai vientisai stačiakampei sričiai, o srityje negali būti dviejų užuominų.","mt":"<b>Għan:</b> aqsam il-grilja kollha f’rettangoli jew kwadri mingħajr sovrappożizzjoni.<br><br><b>Kontroll:</b> iġbed minn rokna għall-opposta biex tiġbed jew tbiddel rettangolu; tektek biex tneħħih.<br><br><b>Ħjiel:</b> kull reġjun fih eżattament ċella waħda tal-ħjiel.<br><br><b>Validità:</b> kull ċella tappartjeni għal reġjun rettangolari konness wieħed u l-ebda reġjun ma jista’ jkollu żewġ ħjiel.","pl":"<b>Cel:</b> podziel całą siatkę na niepokrywające się prostokąty lub kwadraty.<br><br><b>Sterowanie:</b> przeciągnij od rogu do przeciwnego, aby narysować lub zmienić prostokąt; dotknij go, aby usunąć.<br><br><b>Wskazówki:</b> każdy region zawiera dokładnie jedno pole ze wskazówką.<br><br><b>Poprawność:</b> każde pole należy do jednego spójnego prostokątnego regionu, a region nie może mieć dwóch wskazówek.","ro":"<b>Scop:</b> împarte întreaga grilă în dreptunghiuri sau pătrate fără suprapunere.<br><br><b>Control:</b> glisează dintr-un colț în cel opus pentru a desena sau redimensiona un dreptunghi; atinge-l pentru a-l șterge.<br><br><b>Indicii:</b> fiecare regiune conține exact o celulă-indiciu.<br><br><b>Validitate:</b> fiecare celulă aparține unei singure regiuni conectate și dreptunghiulare, iar o regiune nu poate conține două indicii.","sk":"<b>Cieľ:</b> rozdeľ celú mriežku na neprekrývajúce sa obdĺžniky alebo štvorce.<br><br><b>Ovládanie:</b> potiahni z jedného rohu do protiľahlého, aby si obdĺžnik nakreslil alebo zmenil; ťuknutím ho odstrániš.<br><br><b>Pomôcky:</b> každá oblasť obsahuje presne jedno políčko s pomôckou.<br><br><b>Platnosť:</b> každé políčko patrí presne do jednej súvislej obdĺžnikovej oblasti a oblasť nesmie obsahovať dve pomôcky.","sl":"<b>Cilj:</b> razdeli celotno mrežo na pravokotnike ali kvadrate brez prekrivanja.<br><br><b>Upravljanje:</b> povleci iz kota v nasprotni kot za risanje ali spreminjanje pravokotnika; tapni ga za odstranitev.<br><br><b>Namigi:</b> vsako območje vsebuje natanko eno polje z namigom.<br><br><b>Veljavnost:</b> vsako polje pripada natanko enemu povezanemu pravokotnemu območju in območje ne sme vsebovati dveh namigov.","sv":"<b>Mål:</b> dela hela rutnätet i rektanglar eller kvadrater utan överlappning.<br><br><b>Kontroller:</b> dra från ett hörn till det motsatta för att rita eller ändra en rektangel; tryck för att ta bort den.<br><br><b>Ledtrådar:</b> varje region innehåller exakt en ledtrådsruta.<br><br><b>Giltighet:</b> varje ruta tillhör exakt en sammanhängande rektangulär region och ingen region får innehålla två ledtrådar."});
function gameRules(g){return GAME_RULES[g]?.[lang()]||GAME_RULES[g]?.en||''}

const PREF_KEY='logic4-prefs-v1';
function detectedLang(){try{let xs=[...(navigator.languages||[]),navigator.language].filter(Boolean);for(let x of xs){let c=String(x).toLowerCase().split('-')[0];if(c==='zh')return 'zh';if(SUPPORTED_LANGS.includes(c))return c}}catch(_){}return 'fr'}
function prefs(){try{let p=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');return {theme:['auto','light','dark'].includes(p.theme)?p.theme:'auto',sound:p.sound!==false,queenAutoCross:p.queenAutoCross===true,lang:SUPPORTED_LANGS.includes(p.lang)?p.lang:detectedLang(),coachMode:['minimal','normal','pedagogical'].includes(p.coachMode)?p.coachMode:'normal',notifyIllegal:p.notifyIllegal!==false,notifyUnjustified:p.notifyUnjustified!==false}}catch(_){return {theme:'auto',sound:true,queenAutoCross:false,lang:detectedLang(),coachMode:'normal',notifyIllegal:true,notifyUnjustified:true}}}
function languageOptionsHtml(selected){return LANGUAGE_OPTIONS.map(([code,name])=>`<option value="${code}" ${selected===code?'selected':''}>${name}</option>`).join('')}
function savePrefs(p){try{localStorage.setItem(PREF_KEY,JSON.stringify(p))}catch(_){}applyPrefs()}
function resolvedTheme(){let p=prefs();return p.theme==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):p.theme}
function applyPrefs(){let p=prefs(),theme=resolvedTheme();document.documentElement.dataset.theme=theme;document.documentElement.dataset.themeMode=p.theme;let meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='dark'?'#171916':'#f4f1e9';let b=$('#themeBtn');if(b){b.textContent=theme==='dark'?'☾':'☀︎';b.setAttribute('aria-label',`${tr('themeLabel')} : ${p.theme}`)}}
function cycleTheme(){let p=prefs(),m={auto:'light',light:'dark',dark:'auto'};p.theme=m[p.theme];savePrefs(p);showToast(`${tr('themeLabel')} : ${{auto:tr('auto'),light:tr('light'),dark:tr('dark')}[p.theme]}`)}
function toggleSound(){let p=prefs();p.sound=!p.sound;savePrefs(p);showToast(p.sound?tr('soundsOn'):tr('soundsOff'));return p.sound}
function playTone(kind='tap'){if(!prefs().sound)return;try{let A=window.AudioContext||window.webkitAudioContext;if(!A)return;let c=new A(),o=c.createOscillator(),g=c.createGain(),now=c.currentTime;o.type='sine';o.frequency.value=kind==='win'?659:kind==='error'?180:420;g.gain.setValueAtTime(kind==='win'?.06:.025,now);g.gain.exponentialRampToValueAtTime(.001,now+(kind==='win'?.38:.12));o.connect(g);g.connect(c.destination);o.start(now);o.stop(now+(kind==='win'?.4:.13));setTimeout(()=>c.close().catch(()=>{}),600)}catch(_){}}
function settingsView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;let p=prefs();
  app.innerHTML=`<section class="panel settings-panel"><div class="stats-head"><div><h1>${tr('prefs')}</h1><p>${tr('settingsSaved')}</p></div><button class="btn" id="settingsBack">${tr('back')}</button></div>
  <div class="setting-row"><span><b>${tr('language')}</b><small>${tr('languageSub')}</small></span><select id="langSelect" class="difficulty">${languageOptionsHtml(p.lang)}</select></div>
  <div class="setting-row"><span><b>${tr('theme')}</b><small>${tr('themeSub')}</small></span><select id="themeSelect" class="difficulty"><option value="auto" ${p.theme==='auto'?'selected':''}>${tr('auto')}</option><option value="light" ${p.theme==='light'?'selected':''}>${tr('light')}</option><option value="dark" ${p.theme==='dark'?'selected':''}>${tr('dark')}</option></select></div>
  <div class="setting-row"><span><b>${tr('sounds')}</b><small>${tr('soundsSub')}</small></span><button class="btn" id="soundToggle">${p.sound?tr('on'):tr('off')}</button></div>
  <div class="setting-row"><span><b>${tr('coachMode')}</b><small>${tr('coachModeSub')}</small></span><select id="coachModeSelect" class="difficulty"><option value="minimal" ${p.coachMode==='minimal'?'selected':''}>${tr('coachMinimal')}</option><option value="normal" ${p.coachMode==='normal'?'selected':''}>${tr('coachNormal')} · ${tr('recommended')}</option><option value="pedagogical" ${p.coachMode==='pedagogical'?'selected':''}>${tr('coachPedagogical')}</option></select></div>
  <div class="setting-row"><span><b>${tr('illegalAlerts')}</b><small>${tr('illegalAlertsSub')}</small></span><button class="btn" id="illegalAlertsToggle">${p.notifyIllegal?tr('on'):tr('off')}</button></div>
  <div class="setting-row"><span><b>${tr('unjustifiedAlerts')}</b><small>${tr('unjustifiedAlertsSub')}</small></span><button class="btn" id="unjustifiedAlertsToggle">${p.notifyUnjustified?tr('on'):tr('off')}</button></div>
  <div class="setting-row"><span><b>${tr('data')}</b><small>${tr('dataSub')}</small></span><button class="btn" id="storageInfo">${tr('info')}</button></div></section>`;
  $('#settingsBack').onclick=home;$('#langSelect').onchange=e=>{let q=prefs();q.lang=e.target.value;savePrefs(q);updateI18n();settingsView()};$('#themeSelect').onchange=e=>{let q=prefs();q.theme=e.target.value;savePrefs(q)};$('#soundToggle').onclick=()=>{let on=toggleSound();$('#soundToggle').textContent=on?tr('on'):tr('off')};$('#coachModeSelect').onchange=e=>{let q=prefs();q.coachMode=e.target.value;savePrefs(q)};$('#illegalAlertsToggle').onclick=()=>{let q=prefs();q.notifyIllegal=!q.notifyIllegal;savePrefs(q);$('#illegalAlertsToggle').textContent=q.notifyIllegal?tr('on'):tr('off')};$('#unjustifiedAlertsToggle').onclick=()=>{let q=prefs();q.notifyUnjustified=!q.notifyUnjustified;savePrefs(q);$('#unjustifiedAlertsToggle').textContent=q.notifyUnjustified?tr('on'):tr('off')};$('#storageInfo').onclick=()=>modal(tr('localDataTitle'),tr('localData'));app.querySelectorAll('button').forEach(pressFeedback)
}
function aboutView(){
 if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;
 app.innerHTML=`<section class="panel about-panel"><div class="stats-head"><div><h1>${tr('aboutTitle')}</h1><p>QUADLUD</p></div><button class="btn" id="aboutBack">${tr('back')}</button></div>
 <div class="about-grid"><div><span>${tr('version')}</span><b>${VERSION}</b></div><div><span>${tr('copyright')}</span><b>© 2026 Serge Benoliel</b></div><div><span>${tr('license')}</span><b>${tr('proprietary')}</b></div></div>
 <p class="legal-text">${tr('legal')}</p></section>`;
 $('#aboutBack').onclick=home;app.querySelectorAll('button').forEach(pressFeedback)
}
function resultText(c,seconds){let daily=c?.daily?` · ${tr('dailyLabel')}`:'',challenge=c?.challengeCode?`\n${tr('challengeCode')}: ${c.challengeCode}\n${challengeLink(c.challengeCode)}`:'';return `QUADLUD — ${gameLabel(c.game)}${daily}\n${DIFF[c.diff]} · ${fmt(seconds)}${c.rating?` · ${tr('score')} ${c.rating.score}`:''}\n✓ ${tr('finishedShare')}${challenge}`}
function resultSvg(c,seconds){
  let bg=resolvedTheme()==='dark'?'#171916':'#f4f1e9',ink=resolvedTheme()==='dark'?'#f2efe7':'#22231f',muted=resolvedTheme()==='dark'?'#b8b5ad':'#6b6a64',accent='#397466',title=gameLabel(c.game).replace(/&/g,'&amp;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><rect width="1080" height="1080" rx="80" fill="${bg}"/><circle cx="110" cy="112" r="22" fill="${accent}"/><text x="155" y="130" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="54" font-weight="700" fill="${ink}">QUADLUD</text><text x="90" y="410" font-family="Georgia,serif" font-size="112" font-weight="700" fill="${ink}">${title}</text><text x="90" y="520" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="48" fill="${muted}">${DIFF[c.diff]}${c.daily?` · ${tr('dailyLabel')}`:''}</text><text x="90" y="720" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="132" font-weight="800" fill="${ink}">${fmt(seconds)}</text><text x="90" y="820" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="42" fill="${accent}">✓ ${tr('finishedShare')}</text><text x="90" y="965" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="32" fill="${muted}">QUADLUD · v${VERSION}</text></svg>`
}
async function shareResult(c,seconds){
  let text=resultText(c,seconds);
  try{
    if(typeof Blob!=='undefined'&&typeof File!=='undefined'&&navigator.share){
      let blob=new Blob([resultSvg(c,seconds)],{type:'image/svg+xml'}),file=new File([blob],`quadlud-${c.game}-${localDay()}.svg`,{type:'image/svg+xml'});
      let fileOK=!navigator.canShare||navigator.canShare({files:[file]});
      if(fileOK){await navigator.share({title:'QUADLUD',text,files:[file]});return}
    }
    if(navigator.share){await navigator.share({title:'QUADLUD',text});return}
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);showToast(tr('resultCopied'));return}
  }catch(e){
    if(e?.name==='AbortError')return;
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);showToast(tr('resultCopied'));return}}catch(_){}
  }
  showToast(tr('shareUnavailable'))
}
function victoryOverlay(c,seconds){
  let old=$('#victory');if(old)old.remove(),dailyRec=c.daily?dailyRecord(c.dailyDay,c.game):null,next=c.daily?dailyNextGame(c.dailyDay):null;
  let dailyScore=c.daily?`<div class="victory-daily-score"><span>${tr('dailyLogicScore')}</span><strong>${dailyRec?.logicScore??'—'}/100</strong><small>${dailyRec?.logicScore!=null?dailyHelpLabel(dailyRec.helpStage):tr('dailyUnscoredLegacy')}</small></div>`:'';
  let dailyAction=c.daily?`<button class="btn primary" id="dailyVictoryNext">${next?tr('dailyNextGame'):tr('dailyReport')}</button>`:'',challengeAction=c.challengeCode?`<button class="btn primary" id="victoryShareChallenge">↗ ${tr('shareChallenge')}</button>`:'';
  document.body.insertAdjacentHTML('beforeend',`<div class="victory" id="victory" role="dialog" aria-modal="true"><div class="victory-card"><div class="victory-burst" aria-hidden="true">✦</div><small>${tr('victoryKicker')}</small><h2>${gameLabel(c.game)}</h2><div class="victory-time">${fmt(seconds)}</div>${dailyScore}<p>${DIFF[c.diff]}${c.daily?` · ${tr('dailyLabel')}`:''}${c.rating?` · ${tr('score')} ${c.rating.score}`:''}</p><div class="victory-actions">${dailyAction}${challengeAction}<button class="btn" id="shareResult">${tr('share')}</button><button class="btn" id="closeVictory">${tr('continue')}</button></div></div></div>`);
  $('#shareResult').onclick=()=>shareResult(c,seconds);$('#closeVictory').onclick=()=>$('#victory')?.remove();
  let dn=$('#dailyVictoryNext');if(dn)dn.onclick=()=>{let d=c.dailyDay;$('#victory')?.remove();next?launchDailyCircuit(d):dailyView()};let vc=$('#victoryShareChallenge');if(vc)vc.onclick=()=>shareChallenge(challengeParse(c.challengeCode));
  $('#victory').onclick=e=>{if(e.target.id==='victory')e.currentTarget.remove()};playTone('win');haptic(28)
}

const STATS_KEY='logic4-stats-v1', HISTORY_LIMIT=200;
function blankStats(){return {schema:4,started:0,solved:0,revealed:0,totalSolvedSeconds:0,byGame:{},history:[],mastery:{schema:1,byTechnique:{},updatedAt:null},training:{schema:1,byTechnique:{}},learning:{schema:1,byTechnique:{}}}}
function safeStats(){
  let s=blankStats();
  try{
    let raw=JSON.parse(localStorage.getItem(STATS_KEY)||'null');
    if(raw&&typeof raw==='object'){
      s.started=Math.max(0,Number(raw.started)||0);s.solved=Math.max(0,Number(raw.solved)||0);
      s.revealed=Math.max(0,Number(raw.revealed)||0);s.totalSolvedSeconds=Math.max(0,Number(raw.totalSolvedSeconds)||0);
      s.byGame=raw.byGame&&typeof raw.byGame==='object'?raw.byGame:{};
      s.history=Array.isArray(raw.history)?raw.history.filter(x=>x&&['queens','tango','sudoku','patches'].includes(x.game)&&['easy','medium','hard','expert'].includes(x.diff)).slice(0,HISTORY_LIMIT):[];
      if(raw.mastery&&typeof raw.mastery==='object'){
        s.mastery={schema:1,byTechnique:raw.mastery.byTechnique&&typeof raw.mastery.byTechnique==='object'?raw.mastery.byTechnique:{},updatedAt:raw.mastery.updatedAt||null}
      }
      if(raw.training&&typeof raw.training==='object')s.training={schema:1,byTechnique:raw.training.byTechnique&&typeof raw.training.byTechnique==='object'?raw.training.byTechnique:{}}
      if(raw.learning&&typeof raw.learning==='object')s.learning={schema:1,byTechnique:raw.learning.byTechnique&&typeof raw.learning.byTechnique==='object'?raw.learning.byTechnique:{}}
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
  if(kind==='detected'&&technique&&TECHNIQUE_LIBRARY[technique])masteryRecord(technique,'errors')
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

// ===== v2.18.1 — Logic Coach always explains visible errors before suggesting a move =====
function errorSignature(e){
  let cells=(e?.cells||[]).map(([r,c])=>`${r},${c}`).sort().join('|');
  return `${e?.rule||''}:${cells}`
}
function normalizeVisibleError(e){
  return e?{...e,schema:1,source:'visible-state',game:current?.game||e.game,at:Date.now(),canReturn:false}:null
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
  let list=current.game==='queens'?queenVisibleErrors():current.game==='tango'?tangoVisibleErrors():current.game==='sudoku'?sudokuVisibleErrors():current.game==='patches'?patchVisibleErrors():[];
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
  let e=current.game==='queens'?queenErrorFromAction(action):current.game==='tango'?tangoErrorFromAction(action):current.game==='sudoku'?sudokuErrorFromAction(action):current.game==='patches'?patchErrorFromAction(action):null;
  if(!e)return null;
  return {...e,schema:1,source:'visible-state',game:current.game,at:Date.now(),canReturn:true}
}
function errorRuleTitle(e){
  if(!e)return '';
  if(e.technique&&TECHNIQUE_LIBRARY[e.technique])return techniqueTitle(e.technique);
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
  let e={schema:1,source:'visible-state',game:'patches',rule,at:Date.now(),canReturn:false,cells:info.rect?.cells||[],target:info.rect?.cells?.[0]||null,region:info.id};
  current.lastError=e;errorUsage('rejected');clearErrorFocus();refreshErrorCoach();return e
}

function statsFinish(c,seconds,outcome){
  if(!c||c.statsClosed)return;c.statsClosed=true;
  let s=safeStats(),b=statBucket(s,c.game,c.diff),rec={id:c.attemptId||`${Date.now()}`,ts:Date.now(),day:localDay(),game:c.game,diff:c.diff,seconds:Math.max(0,Math.round(seconds)),outcome,score:c.rating?.score??null,backtrackUsed:!!c.backtrackUsed,hintUsed:!!c.hintUsed,walkthroughUsed:!!c.walkthroughUsed,coachUsage:c.coachUsage?{...c.coachUsage}:null,errorCoachUsage:c.errorCoachUsage?{...c.errorCoachUsage}:null,reasoningAudit:c.reasoningAudit?{...c.reasoningAudit}:null,exploration:c.exploration?{...c.exploration}:null,challengeCode:c.challengeCode||null,challengeGenerator:c.challengeGenerator||null,challengeFingerprint:c.challengeFingerprint||null,masterySession:cloneMasterySession(c.masterySession),masteryMerged:true};
  if(outcome==='solved'){s.solved++;s.totalSolvedSeconds+=rec.seconds;b.solved++;b.totalSeconds+=rec.seconds;b.best=b.best==null?rec.seconds:Math.min(b.best,rec.seconds)}
  if(outcome==='revealed'){s.revealed++;b.revealed++}
  masteryMergeIntoStats(s,c.masterySession);
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



// ===== v2.21.0 — shareable friend challenges =====
const CHALLENGE_SCHEMA=1,CHALLENGE_GENERATOR=4;
const CHALLENGE_ALPHABET='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CHALLENGE_GAME_TO_CODE={queens:'Q',tango:'T',sudoku:'S',patches:'P'};
const CHALLENGE_CODE_TO_GAME={Q:'queens',T:'tango',S:'sudoku',P:'patches'};
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
  if(!CHALLENGE_GAME_TO_CODE[game])return null;if(game!=='queens'&&diff==='expert')return null;if(!CHALLENGE_DIFF_TO_CODE[diff])return null;
  seed=challengeNormalizeCode(seed).slice(0,8);if(seed.length!==8||[...seed].some(c=>!CHALLENGE_ALPHABET.includes(c)))return null;
  if(![1,2,3,4].includes(Number(generator)))return null;generator=Number(generator);let payload=`QL${CHALLENGE_SCHEMA}${generator}${CHALLENGE_GAME_TO_CODE[game]}${CHALLENGE_DIFF_TO_CODE[diff]}${seed}`,check=challengeChecksum(payload);
  return {schema:CHALLENGE_SCHEMA,generator,game,diff,seed,code:`QL${CHALLENGE_SCHEMA}${generator}-${CHALLENGE_GAME_TO_CODE[game]}${CHALLENGE_DIFF_TO_CODE[diff]}-${seed}-${check}`}
}
function challengeParse(raw){
  let n=challengeNormalizeCode(raw);
  // QL + schema + generator + game + difficulty + 8 seed chars + 2 checksum chars.
  if(n.length!==16||n.slice(0,2)!=='QL')return null;
  let schema=Number(n[2]),generator=Number(n[3]),game=CHALLENGE_CODE_TO_GAME[n[4]],diff=CHALLENGE_CODE_TO_DIFF[n[5]],seed=n.slice(6,14),check=n.slice(14);
  if(schema!==CHALLENGE_SCHEMA||![1,2,3,4].includes(generator)||!game||!diff||(game!=='queens'&&diff==='expert'))return null;
  if([...seed].some(c=>!CHALLENGE_ALPHABET.includes(c)))return null;
  let payload=n.slice(0,14);if(challengeChecksum(payload)!==check)return null;
  return challengeMake(game,diff,seed,generator)
}
function challengeSeedString(ch){return `quadlud-challenge-v${ch.generator}:${ch.game}:${ch.diff}:${ch.seed}`}
function challengeBuildCandidateV1(ch){
  if(!ch||ch.generator!==1)return null;
  return withSeed(challengeSeedString(ch),()=>{
    if(ch.game==='queens'){let count=ch.diff==='expert'?16:ch.diff==='hard'?14:6;return targetPick(collectCandidates(()=>legacyQueenCandidateV1(ch.diff),count),ch.diff)}
    if(ch.game==='tango')return targetPick(collectCandidates(()=>tangoCandidate(ch.diff),6),ch.diff);
    if(ch.game==='sudoku')return targetPick(collectCandidates(()=>sudokuCandidate(ch.diff),8),ch.diff);
    if(ch.game==='patches')return targetPick(collectCandidates(()=>patchesCandidate(ch.diff),ch.diff==='hard'?5:4),ch.diff);
    return null
  })
}
function challengeFingerprintFromCandidate(ch,g){
  let pub=null;if(!g)return null;
  if(ch.game==='queens')pub={reg:g.reg};
  else if(ch.game==='tango')pub={givens:[...g.givens].sort((a,b)=>a-b).map(i=>[i,g.sol[Math.floor(i/6)][i%6]]),edges:g.edges};
  else if(ch.game==='sudoku')pub={state:g.sol.map((r,ri)=>r.map((v,c)=>g.empty.has(ri*6+c)?0:v))};
  else pub={n:g.n,clues:Object.fromEntries(g.ids.map(id=>[id,g.clues[id]]))};
  return hash32(JSON.stringify(pub)).toString(36).toUpperCase()
}
function challengeBuildCandidateV2(ch){
  if(!ch||ch.generator!==2)return null;
  return withSeed(challengeSeedString(ch),()=>{
    if(ch.game==='queens')return legacyQueenCandidateV2(ch.diff);
    if(ch.game==='tango')return targetPick(collectCandidates(()=>tangoCandidate(ch.diff),6),ch.diff);
    if(ch.game==='sudoku')return targetPick(collectCandidates(()=>sudokuCandidate(ch.diff),8),ch.diff);
    if(ch.game==='patches')return targetPick(collectCandidates(()=>patchesCandidate(ch.diff),ch.diff==='hard'?5:4),ch.diff);
    return null
  })
}
function challengeBuildCandidateV3(ch){
  if(!ch||ch.generator!==3)return null;
  return withSeed(challengeSeedString(ch),()=>{
    if(ch.game==='queens')return legacyQueenCandidateV3(ch.diff);
    if(ch.game==='tango')return targetPick(collectCandidates(()=>tangoCandidate(ch.diff),6),ch.diff);
    if(ch.game==='sudoku')return targetPick(collectCandidates(()=>sudokuCandidate(ch.diff),8),ch.diff);
    if(ch.game==='patches')return targetPick(collectCandidates(()=>patchesCandidate(ch.diff),ch.diff==='hard'?5:4),ch.diff);
    return null
  })
}
function challengeBuildCandidateV4(ch){
  if(!ch||ch.generator!==4)return null;
  return withSeed(challengeSeedString(ch),()=>{
    if(ch.game==='queens')return queenCandidate(ch.diff);
    if(ch.game==='tango')return targetPick(collectCandidates(()=>tangoCandidate(ch.diff),6),ch.diff);
    if(ch.game==='sudoku')return targetPick(collectCandidates(()=>sudokuCandidate(ch.diff),8),ch.diff);
    if(ch.game==='patches')return targetPick(collectCandidates(()=>patchesCandidate(ch.diff),ch.diff==='hard'?5:4),ch.diff);
    return null
  })
}
function challengeBuildCandidate(ch){return ch?.generator===1?challengeBuildCandidateV1(ch):ch?.generator===2?challengeBuildCandidateV2(ch):ch?.generator===3?challengeBuildCandidateV3(ch):ch?.generator===4?challengeBuildCandidateV4(ch):null}

function challengePublicFingerprint(ch){return challengeFingerprintFromCandidate(ch,challengeBuildCandidate(ch))}
function challengeInstall(ch,g){
  if(ch.game==='queens')current={game:'queens',diff:ch.diff,n:g.n,reg:g.reg,sol:g.sol,rating:g.rating,state:Array.from({length:g.n},()=>Array(g.n).fill(0)),generated:true,unique:true,completed:false};
  else if(ch.game==='tango'){let state=Array.from({length:6},()=>Array(6).fill(-1));for(let i of g.givens)state[Math.floor(i/6)][i%6]=g.sol[Math.floor(i/6)][i%6];current={game:'tango',diff:ch.diff,n:6,sol:g.sol,givens:g.givens,edges:g.edges,rating:g.rating,state,generated:true,unique:true,completed:false}}
  else if(ch.game==='sudoku'){current={game:'sudoku',diff:ch.diff,n:6,sol:g.sol,empty:g.empty,rating:g.rating,state:g.sol.map((r,ri)=>r.map((v,c)=>g.empty.has(ri*6+c)?0:v)),sel:null,generated:true,unique:true,completed:false}}
  else if(ch.game==='patches'){const pal=['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1'];current={game:'patches',diff:ch.diff,n:g.n,reg:g.reg,ids:g.ids,cellsBy:g.cellsBy,clues:g.clues,rating:g.rating,pal,active:g.ids[0],paint:Array.from({length:g.n},()=>Array(g.n).fill(null)),patchSelectedRects:{},patchLogicEvidence:patchEmptyEvidence(),generated:true,unique:true,completed:false}}
  current.challenge=true;current.challengeCode=ch.code;current.challengeSeed=ch.seed;current.challengeGenerator=ch.generator;current.challengeFingerprint=challengeFingerprintFromCandidate(ch,g);
  if(ch.game==='queens')renderQueens(current);else if(ch.game==='tango')renderTango(current);else if(ch.game==='sudoku')renderSudoku(current);else renderPatches(current)
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
  let ds=game==='queens'?['easy','medium','hard','expert']:['easy','medium','hard'];
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
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(code);showToast(tr('codeCopied'));return true}}catch(_){}
  showToast(tr('shareUnavailable'));return false
}
async function shareChallenge(ch){
  let text=challengeShareText(ch),url=challengeLink(ch.code);
  try{
    if(navigator.share){await navigator.share({title:`QUADLUD — ${tr('challenge')}`,text,url});return true}
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(`${text}`);showToast(tr('codeCopied'));return true}
  }catch(e){if(e?.name==='AbortError')return false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);showToast(tr('codeCopied'));return true}}catch(_){}}
  showToast(tr('shareUnavailable'));return false
}
function challengeReadyHtml(ch,fromLink=false){
  return `<div class="challenge-ready"><small>${fromLink?tr('challengeFromLink'):tr('challengeReady')}</small><div class="challenge-code">${ch.code}</div><div class="challenge-meta"><b>${gameLabel(ch.game)}</b><span>${DIFF[ch.diff]}</span><span>${tr('challengeGenerator')} v${ch.generator}</span></div><p>${tr('challengeSamePuzzle')} ${tr('challengeNoAccount')}</p><div class="challenge-actions"><button class="btn primary" id="challengePlay">${tr('playChallenge')}</button><button class="btn" id="challengeShare">${tr('shareChallenge')}</button><button class="btn" id="challengeCopy">${tr('copyCode')}</button></div></div>`
}
function challengeView(prefill=null,fromLink=false){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let ch=typeof prefill==='string'?challengeParse(prefill):prefill,game=ch?.game||'queens',diff=ch?.diff||'medium';
  app.innerHTML=`<section class="panel challenge-panel"><div class="stats-head"><div><h1>${tr('challenge')}</h1><p>${tr('challengeSub')}</p></div><button class="btn" id="challengeBack">${tr('back')}</button></div>
    <div class="challenge-columns">
      <section class="challenge-box"><h2>${tr('createChallenge')}</h2><label>${tr('game')}<select class="difficulty" id="challengeGame">${['queens','tango','sudoku','patches'].map(g=>`<option value="${g}" ${g===game?'selected':''}>${gameLabel(g)}</option>`).join('')}</select></label><label>${tr('difficulty')}<select class="difficulty" id="challengeDiff">${challengeDiffOptions(game,diff)}</select></label><button class="btn primary" id="challengeGenerate">${tr('generateChallenge')}</button></section>
      <section class="challenge-box"><h2>${tr('joinChallenge')}</h2><label>${tr('challengeCode')}<input id="challengeInput" class="challenge-input" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="QL11-QM-XXXXXXXX-XX" value="${ch?.code||''}"></label><button class="btn" id="challengeJoin">${tr('joinChallenge')}</button></section>
    </div>
    <div id="challengeReady">${ch?challengeReadyHtml(ch,fromLink):`<p class="challenge-note">${tr('challengeNoAccount')}</p>`}</div></section>`;
  $('#challengeBack').onclick=home;
  $('#challengeGame').onchange=e=>{let d=$('#challengeDiff');d.innerHTML=challengeDiffOptions(e.target.value,d.value==='expert'?'hard':d.value)};
  $('#challengeGenerate').onclick=()=>challengeView(challengeMake($('#challengeGame').value,$('#challengeDiff').value),false);
  $('#challengeJoin').onclick=()=>{let parsed=challengeParse($('#challengeInput').value);if(!parsed)return showToast(tr('invalidChallengeCode'));challengeView(parsed,false)};
  if(ch){$('#challengePlay').onclick=()=>launchChallenge(ch);$('#challengeShare').onclick=()=>shareChallenge(ch);$('#challengeCopy').onclick=()=>copyChallengeCode(ch.code)}
  app.querySelectorAll('button').forEach(pressFeedback)
}
function challengeFromHash(){
  try{if(typeof location==='undefined')return null;let m=String(location.hash||'').match(/^#challenge=([^&]+)/i);return m?challengeParse(decodeURIComponent(m[1])):null}catch(_){return null}
}
function initialView(){let ch=challengeFromHash();if(ch)return challengeView(ch,true);home()}

const DAILY_KEY='logic4-daily-v1';
const DAILY_GAMES=['queens','tango','sudoku','patches'];
const DAILY_LOGIC_POINTS={0:100,1:90,2:75,3:55,4:25};
function hash32(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function withSeed(seed,fn){let old=Math.random;Math.random=mulberry32(hash32(seed));try{return fn()}finally{Math.random=old}}
function dailyState(){try{let x=JSON.parse(localStorage.getItem(DAILY_KEY)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}}
function saveDailyState(x){try{localStorage.setItem(DAILY_KEY,JSON.stringify(x))}catch(_){}}
function dailyKey(day,game){return `${day}:${game}`}
function dailyRecord(day,game,state=dailyState()){return state[dailyKey(day,game)]||null}
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
    old.best=old.best==null?sec:Math.min(old.best,sec);old.lastSeconds=sec;old.lastOutcome=outcome;old.lastCompletedAt=Date.now();s[k]=old;saveDailyState(s);return
  }
  let rec={day:c.dailyDay,game:c.game,outcome,seconds:sec,completedAt:Date.now(),best:outcome==='solved'?sec:old.best??null};
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
  let s=dailyState(),out=[],d=new Date();d.setHours(12,0,0,0);
  for(let i=0;i<days;i++){let day=localDay(d.getTime()),sum=dailyCircuitSummary(day,s);out.push({day,n:sum.completed,score:sum.scoreKnown?sum.totalScore:null});d.setDate(d.getDate()-1)}
  return out
}
function dailyCardHtml(g,r){
  let done=r?.outcome==='solved',score=done&&Number.isFinite(Number(r.logicScore))?`${r.logicScore}/100`:done?'—/100':'',help=done&&r.logicScore!=null?dailyHelpLabel(r.helpStage):done?tr('dailyUnscoredLegacy'):'';
  return `<button class="daily-game ${done?'done':''}" data-daily="${g}"><span>${{queens:'♛',tango:'☀︎',sudoku:'✎',patches:'▦'}[g]}</span><b>${gameLabel(g)}</b><small>${done?`✓ ${score} · ${help} · ${fmt(r.best??r.seconds)}`:tr('play')}</small></button>`
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
  closePreviousAttempt();clearSaved();stopTimer();paused=false;setBusy(true);current={game,diff:'medium',daily:true,dailyDay:day};
  requestAnimationFrame(()=>{try{
    withSeed(`logic4-v1.6:${day}:${game}`,()=>{if(game==='queens')queens('medium');if(game==='tango')tango('medium');if(game==='sudoku')sudoku('medium');if(game==='patches')patches('medium')});
    current.daily=true;current.dailyDay=day;current.dailyCircuit=true;historyInit(true);updateHistoryButtons();statsStart(current);startTimer(true,0,false);saveCurrent();haptic(8)
  }finally{setBusy(false);startBackgroundPrecompute(game,'medium')}})
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
function updatePauseButton(){let b=$('#pauseBtn');if(b)b.textContent=paused?tr('resume'):tr('pause');updateHistoryButtons()}
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function shuffle(a){a=[...a];for(let i=a.length-1;i;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function rotGrid(grid){const n=grid.length;return Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>grid[n-1-c][r]))}
function flipGrid(grid){return grid.map(r=>[...r].reverse())}
function transformGrid(grid,k){let g=grid.map(r=>[...r]);for(let i=0;i<k%4;i++)g=rotGrid(g);if(k>=4)g=flipGrid(g);return g}
function modal(title,html){document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="modal"><div class="sheet"><h2>${title}</h2>${html}<button class="btn primary" onclick="document.querySelector('#modal').remove()">Fermer</button></div></div>`)}

// ===== v2.11.0 — structured Logic Coach reasoning + branching move history =====

// ===== v2.13.0 — pedagogical technique library =====
const TECHNIQUE_TERMS={"en":{"exclusion":"Exclusion","adjacency":"Adjacency","uniquePosition":"Unique position","balance":"Balance","noThree":"No three identical","relation":"Relation","singleCandidate":"Single candidate","hiddenSingle":"Hidden single","mandatoryCell":"Mandatory cell","singleRectangle":"Single rectangle","contradiction":"Contradiction","technique":"Technique"},"zh":{"exclusion":"排除","adjacency":"相邻限制","uniquePosition":"唯一位置","balance":"平衡","noThree":"禁止三个相同","relation":"关系","singleCandidate":"唯一候选","hiddenSingle":"隐藏唯一","mandatoryCell":"必选格","singleRectangle":"唯一矩形","contradiction":"矛盾","technique":"技巧"},"hi":{"exclusion":"बहिष्करण","adjacency":"सन्निकटता","uniquePosition":"एकमात्र स्थान","balance":"संतुलन","noThree":"तीन समान नहीं","relation":"संबंध","singleCandidate":"एकल प्रत्याशी","hiddenSingle":"छिपा एकल","mandatoryCell":"अनिवार्य खाना","singleRectangle":"एकमात्र आयत","contradiction":"विरोधाभास","technique":"तकनीक"},"es":{"exclusion":"Exclusión","adjacency":"Adyacencia","uniquePosition":"Posición única","balance":"Equilibrio","noThree":"Sin tres iguales","relation":"Relación","singleCandidate":"Candidato único","hiddenSingle":"Único oculto","mandatoryCell":"Casilla obligatoria","singleRectangle":"Rectángulo único","contradiction":"Contradicción","technique":"Técnica"},"ar":{"exclusion":"استبعاد","adjacency":"تجاور","uniquePosition":"موضع وحيد","balance":"توازن","noThree":"منع ثلاثة متطابقة","relation":"علاقة","singleCandidate":"مرشح وحيد","hiddenSingle":"وحيد مخفي","mandatoryCell":"خلية إلزامية","singleRectangle":"مستطيل وحيد","contradiction":"تناقض","technique":"تقنية"},"fr":{"exclusion":"Exclusion","adjacency":"Adjacence","uniquePosition":"Position unique","balance":"Équilibre","noThree":"Pas trois identiques","relation":"Relation","singleCandidate":"Candidat unique","hiddenSingle":"Unique caché","mandatoryCell":"Case obligatoire","singleRectangle":"Rectangle unique","contradiction":"Contradiction","technique":"Technique"},"bn":{"exclusion":"বর্জন","adjacency":"সংলগ্নতা","uniquePosition":"একমাত্র অবস্থান","balance":"ভারসাম্য","noThree":"তিনটি এক নয়","relation":"সম্পর্ক","singleCandidate":"একমাত্র প্রার্থী","hiddenSingle":"গোপন একক","mandatoryCell":"বাধ্যতামূলক ঘর","singleRectangle":"একমাত্র আয়তক্ষেত্র","contradiction":"বিরোধ","technique":"কৌশল"},"pt":{"exclusion":"Exclusão","adjacency":"Adjacência","uniquePosition":"Posição única","balance":"Equilíbrio","noThree":"Sem três iguais","relation":"Relação","singleCandidate":"Candidato único","hiddenSingle":"Único oculto","mandatoryCell":"Casa obrigatória","singleRectangle":"Retângulo único","contradiction":"Contradição","technique":"Técnica"},"id":{"exclusion":"Eliminasi","adjacency":"Kedekatan","uniquePosition":"Posisi tunggal","balance":"Keseimbangan","noThree":"Tanpa tiga sama","relation":"Relasi","singleCandidate":"Kandidat tunggal","hiddenSingle":"Tunggal tersembunyi","mandatoryCell":"Sel wajib","singleRectangle":"Persegi panjang tunggal","contradiction":"Kontradiksi","technique":"Teknik"},"ur":{"exclusion":"اخراج","adjacency":"قربت","uniquePosition":"واحد مقام","balance":"توازن","noThree":"تین یکساں نہیں","relation":"تعلق","singleCandidate":"واحد امیدوار","hiddenSingle":"پوشیدہ واحد","mandatoryCell":"لازمی خانہ","singleRectangle":"واحد مستطیل","contradiction":"تضاد","technique":"تکنیک"},"bg":{"exclusion":"Изключване","adjacency":"Съседство","uniquePosition":"Единствена позиция","balance":"Баланс","noThree":"Без три еднакви","relation":"Връзка","singleCandidate":"Единствен кандидат","hiddenSingle":"Скрит единичен","mandatoryCell":"Задължителна клетка","singleRectangle":"Единствен правоъгълник","contradiction":"Противоречие","technique":"Техника"},"hr":{"exclusion":"Isključivanje","adjacency":"Susjedstvo","uniquePosition":"Jedini položaj","balance":"Ravnoteža","noThree":"Bez tri ista","relation":"Odnos","singleCandidate":"Jedini kandidat","hiddenSingle":"Skriveni jedini","mandatoryCell":"Obavezno polje","singleRectangle":"Jedini pravokutnik","contradiction":"Kontradikcija","technique":"Tehnika"},"cs":{"exclusion":"Vyloučení","adjacency":"Sousednost","uniquePosition":"Jediná pozice","balance":"Rovnováha","noThree":"Bez tří stejných","relation":"Vztah","singleCandidate":"Jediný kandidát","hiddenSingle":"Skrytý jediný","mandatoryCell":"Povinné pole","singleRectangle":"Jediný obdélník","contradiction":"Rozpor","technique":"Technika"},"da":{"exclusion":"Udelukkelse","adjacency":"Naboskab","uniquePosition":"Unik position","balance":"Balance","noThree":"Ingen tre ens","relation":"Relation","singleCandidate":"Enkelt kandidat","hiddenSingle":"Skjult enkelt","mandatoryCell":"Obligatorisk felt","singleRectangle":"Enkelt rektangel","contradiction":"Modsigelse","technique":"Teknik"},"nl":{"exclusion":"Uitsluiting","adjacency":"Aangrenzing","uniquePosition":"Unieke positie","balance":"Balans","noThree":"Geen drie gelijke","relation":"Relatie","singleCandidate":"Enige kandidaat","hiddenSingle":"Verborgen enkele","mandatoryCell":"Verplicht vak","singleRectangle":"Unieke rechthoek","contradiction":"Tegenspraak","technique":"Techniek"},"et":{"exclusion":"Välistamine","adjacency":"Naabrus","uniquePosition":"Ainus asukoht","balance":"Tasakaal","noThree":"Mitte kolm ühesugust","relation":"Seos","singleCandidate":"Ainus kandidaat","hiddenSingle":"Peidetud ainus","mandatoryCell":"Kohustuslik ruut","singleRectangle":"Ainus ristkülik","contradiction":"Vastuolu","technique":"Tehnika"},"fi":{"exclusion":"Poissulku","adjacency":"Vierekkäisyys","uniquePosition":"Ainoa paikka","balance":"Tasapaino","noThree":"Ei kolmea samaa","relation":"Suhde","singleCandidate":"Ainoa ehdokas","hiddenSingle":"Piilotettu ainoa","mandatoryCell":"Pakollinen ruutu","singleRectangle":"Ainoa suorakulmio","contradiction":"Ristiriita","technique":"Tekniikka"},"de":{"exclusion":"Ausschluss","adjacency":"Nachbarschaft","uniquePosition":"Einzige Position","balance":"Gleichgewicht","noThree":"Keine drei gleichen","relation":"Beziehung","singleCandidate":"Einziger Kandidat","hiddenSingle":"Versteckter Einzelwert","mandatoryCell":"Pflichtfeld","singleRectangle":"Einziges Rechteck","contradiction":"Widerspruch","technique":"Technik"},"el":{"exclusion":"Αποκλεισμός","adjacency":"Γειτνίαση","uniquePosition":"Μοναδική θέση","balance":"Ισορροπία","noThree":"Όχι τρία ίδια","relation":"Σχέση","singleCandidate":"Μοναδικός υποψήφιος","hiddenSingle":"Κρυφό μοναδικό","mandatoryCell":"Υποχρεωτικό κελί","singleRectangle":"Μοναδικό ορθογώνιο","contradiction":"Αντίφαση","technique":"Τεχνική"},"hu":{"exclusion":"Kizárás","adjacency":"Szomszédosság","uniquePosition":"Egyetlen hely","balance":"Egyensúly","noThree":"Nincs három azonos","relation":"Kapcsolat","singleCandidate":"Egyetlen jelölt","hiddenSingle":"Rejtett egyedi","mandatoryCell":"Kötelező mező","singleRectangle":"Egyetlen téglalap","contradiction":"Ellentmondás","technique":"Technika"},"ga":{"exclusion":"Eisiamh","adjacency":"Cóngaracht","uniquePosition":"Suíomh aonair","balance":"Cothromaíocht","noThree":"Gan trí cinn mar an gcéanna","relation":"Gaol","singleCandidate":"Iarrthóir aonair","hiddenSingle":"Aonair folaithe","mandatoryCell":"Cill éigeantach","singleRectangle":"Dronuilleog aonair","contradiction":"Contrárthacht","technique":"Teicníc"},"it":{"exclusion":"Esclusione","adjacency":"Adiacenza","uniquePosition":"Posizione unica","balance":"Equilibrio","noThree":"Niente tre uguali","relation":"Relazione","singleCandidate":"Candidato unico","hiddenSingle":"Singolo nascosto","mandatoryCell":"Casella obbligatoria","singleRectangle":"Rettangolo unico","contradiction":"Contraddizione","technique":"Tecnica"},"lv":{"exclusion":"Izslēgšana","adjacency":"Blakus stāvoklis","uniquePosition":"Vienīgā pozīcija","balance":"Līdzsvars","noThree":"Ne trīs vienādi","relation":"Attiecība","singleCandidate":"Vienīgais kandidāts","hiddenSingle":"Slēptais vienīgais","mandatoryCell":"Obligāta šūna","singleRectangle":"Vienīgais taisnstūris","contradiction":"Pretruna","technique":"Paņēmiens"},"lt":{"exclusion":"Atmetimas","adjacency":"Gretimumas","uniquePosition":"Vienintelė vieta","balance":"Pusiausvyra","noThree":"Ne trys vienodi","relation":"Ryšys","singleCandidate":"Vienintelis kandidatas","hiddenSingle":"Paslėptas vienintelis","mandatoryCell":"Privalomas langelis","singleRectangle":"Vienintelis stačiakampis","contradiction":"Prieštara","technique":"Metodas"},"mt":{"exclusion":"Esklużjoni","adjacency":"Viċinanza","uniquePosition":"Pożizzjoni unika","balance":"Bilanċ","noThree":"Ebda tlieta l-istess","relation":"Relazzjoni","singleCandidate":"Kandidat uniku","hiddenSingle":"Uniku moħbi","mandatoryCell":"Ċella obbligatorja","singleRectangle":"Rettangolu uniku","contradiction":"Kontradizzjoni","technique":"Teknika"},"pl":{"exclusion":"Wykluczenie","adjacency":"Sąsiedztwo","uniquePosition":"Jedyna pozycja","balance":"Równowaga","noThree":"Bez trzech identycznych","relation":"Relacja","singleCandidate":"Jedyny kandydat","hiddenSingle":"Ukryty singiel","mandatoryCell":"Pole obowiązkowe","singleRectangle":"Jedyny prostokąt","contradiction":"Sprzeczność","technique":"Technika"},"ro":{"exclusion":"Excludere","adjacency":"Adiacență","uniquePosition":"Poziție unică","balance":"Echilibru","noThree":"Fără trei identice","relation":"Relație","singleCandidate":"Candidat unic","hiddenSingle":"Unic ascuns","mandatoryCell":"Celulă obligatorie","singleRectangle":"Dreptunghi unic","contradiction":"Contradicție","technique":"Tehnică"},"sk":{"exclusion":"Vylúčenie","adjacency":"Susednosť","uniquePosition":"Jediná pozícia","balance":"Rovnováha","noThree":"Bez troch rovnakých","relation":"Vzťah","singleCandidate":"Jediný kandidát","hiddenSingle":"Skrytý jediný","mandatoryCell":"Povinné políčko","singleRectangle":"Jediný obdĺžnik","contradiction":"Rozpor","technique":"Technika"},"sl":{"exclusion":"Izključitev","adjacency":"Sosednost","uniquePosition":"Edini položaj","balance":"Ravnovesje","noThree":"Brez treh enakih","relation":"Odnos","singleCandidate":"Edini kandidat","hiddenSingle":"Skriti edini","mandatoryCell":"Obvezno polje","singleRectangle":"Edini pravokotnik","contradiction":"Protislovje","technique":"Tehnika"},"sv":{"exclusion":"Uteslutning","adjacency":"Närhet","uniquePosition":"Unik position","balance":"Balans","noThree":"Inga tre lika","relation":"Relation","singleCandidate":"Enda kandidat","hiddenSingle":"Dold singel","mandatoryCell":"Obligatorisk ruta","singleRectangle":"Unik rektangel","contradiction":"Motsägelse","technique":"Teknik"}};
const TECHNIQUE_LIBRARY={
  Q_EXCLUSION_ROW:{game:'queens',rank:0,kind:'exclusion',scope:'row'},
  Q_EXCLUSION_COLUMN:{game:'queens',rank:0,kind:'exclusion',scope:'column'},
  Q_EXCLUSION_REGION:{game:'queens',rank:0,kind:'exclusion',scope:'region'},
  Q_EXCLUSION_ADJACENCY:{game:'queens',rank:0,kind:'adjacency'},
  Q_UNIQUE_ROW:{game:'queens',rank:0,kind:'uniquePosition',scope:'row'},
  Q_UNIQUE_COLUMN:{game:'queens',rank:0,kind:'uniquePosition',scope:'column'},
  Q_UNIQUE_REGION:{game:'queens',rank:0,kind:'uniquePosition',scope:'region'},
  Q_CONTRADICTION_R1:{game:'queens',rank:1,kind:'contradiction'},
  Q_CONTRADICTION_R2:{game:'queens',rank:2,kind:'contradiction'},
  Q_CONTRADICTION_R3:{game:'queens',rank:3,kind:'contradiction'},

  T_BALANCE_ROW:{game:'tango',rank:0,kind:'balance',scope:'row'},
  T_BALANCE_COLUMN:{game:'tango',rank:0,kind:'balance',scope:'column'},
  T_NO_THREE:{game:'tango',rank:0,kind:'noThree'},
  T_RELATION_EQUAL:{game:'tango',rank:0,kind:'relation',symbol:'='},
  T_RELATION_OPPOSITE:{game:'tango',rank:0,kind:'relation',symbol:'×'},
  T_CONTRADICTION_R1:{game:'tango',rank:1,kind:'contradiction'},
  T_CONTRADICTION_R2:{game:'tango',rank:2,kind:'contradiction'},

  S_NAKED_SINGLE:{game:'sudoku',rank:0,kind:'singleCandidate'},
  S_HIDDEN_ROW:{game:'sudoku',rank:0,kind:'hiddenSingle',scope:'row'},
  S_HIDDEN_COLUMN:{game:'sudoku',rank:0,kind:'hiddenSingle',scope:'column'},
  S_HIDDEN_BOX:{game:'sudoku',rank:0,kind:'hiddenSingle',scope:'box'},
  S_CONTRADICTION_R1:{game:'sudoku',rank:1,kind:'contradiction'},
  S_CONTRADICTION_R2:{game:'sudoku',rank:2,kind:'contradiction'},

  P_MANDATORY_CELL:{game:'patches',rank:0,kind:'mandatoryCell'},
  P_SINGLE_RECTANGLE:{game:'patches',rank:0,kind:'singleRectangle'},
  P_CONTRADICTION_R1:{game:'patches',rank:1,kind:'contradiction'},
  P_CONTRADICTION_R2:{game:'patches',rank:2,kind:'contradiction'}
};
function techniqueTerm(k){let t=TECHNIQUE_TERMS[lang()]||TECHNIQUE_TERMS.en;return t[k]||TECHNIQUE_TERMS.en[k]||k}
function techniqueScope(scope){
  if(scope==='row')return tr('rowLabel');
  if(scope==='column')return tr('columnLabel');
  if(scope==='region')return tr('zone');
  if(scope==='box')return '2×3';
  return ''
}
function techniqueTitle(id){
  let x=TECHNIQUE_LIBRARY[id];if(!x)return id||techniqueTerm('technique');
  let title=techniqueTerm(x.kind);
  if(x.scope)title+=` · ${techniqueScope(x.scope)}`;
  if(x.symbol)title+=` ${x.symbol}`;
  if(x.kind==='balance')title+=' 3/3';
  if(x.kind==='contradiction')title+=` · R${x.rank}`;
  return title
}
function techniqueSummary(id){
  let x=TECHNIQUE_LIBRARY[id];if(!x)return tr('directReason');
  if(x.rank===1)return tr('rank1Reason');
  if(x.rank===2)return tr('rank2Reason');
  if(x.rank===3)return tr('rank3Reason');
  return tr('directReason')
}
function techniqueIdsForGame(game){return Object.keys(TECHNIQUE_LIBRARY).filter(id=>TECHNIQUE_LIBRARY[id].game===game).sort((a,b)=>TECHNIQUE_LIBRARY[a].rank-TECHNIQUE_LIBRARY[b].rank||a.localeCompare(b))}
function techniqueLibraryHtml(game){
  let ids=techniqueIdsForGame(game);
  return `<div class="technique-library">${ids.map(id=>{let x=TECHNIQUE_LIBRARY[id];return `<article class="technique-card"><div class="technique-card-head"><b>${techniqueTitle(id)}</b><code>${id}</code></div><small>R${x.rank}</small><p>${techniqueSummary(id)}</p></article>`}).join('')}</div>`
}


// ===== v2.15.0 — logical mastery profile =====
const MASTERY_KINDS=['encountered','solo','where','rule','why','reveal','where3','why3','reveal3','errors'];
function emptyMasteryCounts(){return {encountered:0,solo:0,where:0,rule:0,why:0,reveal:0,where3:0,why3:0,reveal3:0,errors:0}}
function normalizeMasteryCounts(x={}){
  let o=emptyMasteryCounts();for(let k of MASTERY_KINDS)o[k]=Math.max(0,Number(x?.[k])||0);return o
}
function masterySessionBucket(id){
  if(!current||!TECHNIQUE_LIBRARY[id])return null;
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
    if(!TECHNIQUE_LIBRARY[id])continue;
    stats.mastery.byTechnique[id]=masteryMergeCounts(stats.mastery.byTechnique[id],c)
  }
  if(session?.techniques&&Object.keys(session.techniques).length)stats.mastery.updatedAt=Date.now()
}
function masteryLegacyFromHistory(history=[]){
  let out={};
  for(let rec of history){
    if(rec?.masteryMerged)continue;
    for(let [id,t] of Object.entries(rec?.coachUsage?.techniques||{})){
      if(!TECHNIQUE_LIBRARY[id])continue;
      let b=out[id]||(out[id]=emptyMasteryCounts()),where=Math.max(0,Number(t.where)||0);
      if(rec?.coachUsage?.flowVersion===2){b.encountered+=where;b.where3+=where;b.why3+=Math.max(0,Number(t.why)||0);b.reveal3+=Math.max(0,Number(t.reveal)||0)}
      else{b.encountered+=where;b.where+=where;b.rule+=Math.max(0,Number(t.rule)||0);b.why+=Math.max(0,Number(t.why)||0);b.reveal+=Math.max(0,Number(t.reveal)||0)}
    }
  }
  return out
}
function effectiveMasteryByTechnique(stats=safeStats()){
  let out={};
  for(let id of Object.keys(TECHNIQUE_LIBRARY))out[id]=normalizeMasteryCounts(stats?.mastery?.byTechnique?.[id]);
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
  if(!TECHNIQUE_LIBRARY[id])return masteryMetrics(emptyMasteryCounts());
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
    let h=null;if(clone.game==='queens')h=findQueenLogicalHint();else if(clone.game==='tango')h=findTangoLogicalHint();else if(clone.game==='sudoku'){let step=sudokuLogicSession(clone).nextValueStep(),value=sudokuValueStepConclusion(step),primary=step?.primaryDeduction||step?.deduction,technique=sudokuLegacyTechniqueForDeduction(primary);if(value&&technique)h={r:value.cell[0],c:value.cell[1],v:value.value,technique,rank:sudokuCoachRankForDeduction(primary)}}else if(clone.game==='patches')h=patchLegacyHintFromEngine();
    return h&&h.technique&&TECHNIQUE_LIBRARY[h.technique]?h:null
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
  let s=safeStats(),all=effectiveMasteryByTechnique(s),games=['queens','tango','sudoku','patches'];
  let gm=games.map(g=>[g,masteryGameMetrics(g,all)]),globalCounts=emptyMasteryCounts();
  for(let [,m] of gm)globalCounts=masteryMergeCounts(globalCounts,m);
  let global=masteryMetrics(globalCounts),globalLv=masteryLevel(global),overall=global.score==null?'—':`${global.score}%`;
  let gameNav=gm.map(([g,m])=>{let lv=masteryLevel(m),score=m.score==null?'—':`${m.score}%`;return `<a class="mastery-game-summary level-${lv.level}" href="#mastery-${g}"><span>${{queens:'♛',tango:'☀︎',sudoku:'✎',patches:'▦'}[g]}</span><b>${gameLabel(g)}</b><strong>${score}</strong><small>${tr(lv.key)} · ${m.samples} ${tr('masteryObserved').toLowerCase()}</small></a>`}).join('');
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
  return Object.keys(TECHNIQUE_LIBRARY).filter(id=>learningBucket(stats,id).completed>0).length
}
function lessonMethodText(id){
  let x=TECHNIQUE_LIBRARY[id];return x?.kind==='contradiction'?tr('lessonContradictionMethod'):tr('lessonDirectMethod')
}
function lessonExplanationHtml(id){
  let x=TECHNIQUE_LIBRARY[id];if(!x)return '';
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
  let b=learningBucket(stats,id),p=learningProgressValue(b),x=TECHNIQUE_LIBRARY[id];
  return `<article class="learning-card ${b.completed?'completed':''}">
    <div class="learning-card-head"><div><b>${techniqueTitle(id)}</b><code>${id}</code></div><strong>${p}/4</strong></div>
    <small>${gameLabel(x.game)} · R${x.rank}</small>
    <div class="learning-mini-bar"><i style="width:${p*25}%"></i></div>
    <button class="btn ${b.completed?'':'primary'}" data-lesson="${id}">${b.completed?tr('lessonComplete'):tr('lesson')}</button>
  </article>`
}
function learningView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let s=safeStats(),games=['queens','tango','sudoku','patches'],done=learningCompletedCount(s);
  let sections=games.map(g=>`<section class="learning-game"><h2>${gameLabel(g)}</h2><div class="learning-grid">${techniqueIdsForGame(g).map(id=>learningCard(id,s)).join('')}</div></section>`).join('');
  app.innerHTML=`<section class="panel learning-panel"><div class="stats-head"><div><h1>${tr('learn')}</h1><p>${tr('learnSub')}</p></div><button class="btn" id="learningBack">${tr('back')}</button></div>
    <div class="learning-overall"><b>${done}/27</b><span>${tr('lessonCompletedCount')}</span><div class="learning-mini-bar"><i style="width:${done/27*100}%"></i></div></div>${sections}</section>`;
  $('#learningBack').onclick=home;app.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>lessonView(b.dataset.lesson));app.querySelectorAll('button').forEach(pressFeedback)
}
function lessonView(id){
  if(!TECHNIQUE_LIBRARY[id])return learningView();if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let s=safeStats(),b=learningBucket(s,id),p=learningProgressValue(b);
  app.innerHTML=`<section class="panel lesson-panel"><div class="stats-head"><div><h1>${tr('lesson')} — ${techniqueTitle(id)}</h1><p>${gameLabel(TECHNIQUE_LIBRARY[id].game)}</p></div><button class="btn" id="lessonBack">${tr('back')}</button></div>
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
  if(!TECHNIQUE_LIBRARY[id]||![2,3,4].includes(phase))return lessonView(id);
  let s=safeStats(),b=learningBucket(s,id);if(phase===3&&!b.guided)return lessonView(id);if(phase===4&&!b.assisted)return lessonView(id);
  if(current&&!current.completed)clearSaved();stopTimer();paused=false;setBusy(true);
  requestAnimationFrame(()=>{try{
    if(!buildTrainingExercise(id)){showToast(tr('trainingUnavailable'));lessonView(id);return}
    current.learning=true;current.learningTechnique=id;current.learningPhase=phase;current.learningStatsClosed=false;current.learningMasteryMerged=false;
    current.coachModeOverride=phase===4?'minimal':'pedagogical';learningStatsStart(id,phase);
    trainingRender();historyInit(true);updateHistoryButtons();startTimer(true,0,false);saveCurrent();haptic(8)
  }finally{setBusy(false)}})
}
function learningHintWhy(h){return h.rank===3?rank3Why(h):h.rank===2?rank2Why(h):h.rank===1?rank1Why(h):h.why}
function learningMoveText(h){
  let g=current.game;
  if(g==='queens')return lang()==='fr'?`${h.v===2?'Place une reine':'Place un X'} en ligne ${h.r+1}, colonne ${h.c+1}.`:`${h.v===2?'Place a queen':'Place an X'} at row ${h.r+1}, column ${h.c+1}.`;
  if(g==='tango'){let name=h.v===1?(lang()==='fr'?'un soleil ☀':'a sun ☀'):(lang()==='fr'?'une lune ☾':'a moon ☾');return lang()==='fr'?`Place ${name} en ligne ${h.r+1}, colonne ${h.c+1}.`:`Place ${name} at row ${h.r+1}, column ${h.c+1}.`}
  if(g==='sudoku')return lang()==='fr'?`Place le chiffre ${h.v} en ligne ${h.r+1}, colonne ${h.c+1}.`:`Place digit ${h.v} at row ${h.r+1}, column ${h.c+1}.`;
  return lang()==='fr'?`Attribue la case ligne ${h.r+1}, colonne ${h.c+1} à la zone ${h.id+1}.`:`Assign row ${h.r+1}, column ${h.c+1} to region ${h.id+1}.`
}
function learningApplyExpectedMove(actionType='LEARNING_GUIDED'){
  if(!current?.learning||!current.trainingTargetHint)return false;let h=current.trainingTargetHint,before=historySnapshotKey(),g=current.game;
  if(g==='patches'){current.paint[h.r][h.c]=h.id;drawP()}else{current.state[h.r][h.c]=h.v;if(g==='queens')drawQ();else if(g==='tango')drawT();else{current.sel=[h.r,h.c];drawS()}}
  historyRecord({type:actionType,reasoning:structuredReasoning(g,h),primaryTarget:[h.r,h.c]},before);saveCurrent();return true
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
  let ids=Object.keys(TECHNIQUE_LIBRARY),best=null,bestKey=Infinity;
  for(let id of ids){let m=masteryMetrics(all[id]),rank=TECHNIQUE_LIBRARY[id].rank,key=(m.samples<3?35:(m.score??50))-Math.min(5,m.errors)*4+rank*2;if(key<bestKey){bestKey=key;best=id}}
  return best||ids[0]
}
function trainingCard(id,all,stats,recommended){
  let x=TECHNIQUE_LIBRARY[id],m=masteryMetrics(all[id]),b=trainingBucket(stats,id),score=m.score==null?'—':`${m.score}%`,rec=id===recommended?`<span class="training-rec">★ ${tr('trainingRecommended')}</span>`:'';
  return `<article class="training-card ${id===recommended?'recommended':''}"><div class="training-card-head"><div><b>${techniqueTitle(id)}</b><code>${id}</code></div><strong>${score}</strong></div><small>R${x.rank} · ${tr(masteryLevel(m).key)}</small>${rec}<div class="training-card-stats"><span>${tr('trainingCompleted')} <b>${b.completed}</b></span><span>${tr('trainingAttempts')} <b>${b.attempts}</b></span></div><div class="training-card-actions"><button class="btn" data-learn-from-training="${id}">${tr('learn')}</button><button class="btn primary training-start" data-tech="${id}">${tr('trainTechnique')}</button></div></article>`
}
function trainingView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let s=safeStats(),all=effectiveMasteryByTechnique(s),recommended=trainingRecommendedId(all),games=['queens','tango','sudoku','patches'];
  let sections=games.map(g=>`<section class="training-game"><h2>${gameLabel(g)}</h2><div class="training-grid">${techniqueIdsForGame(g).map(id=>trainingCard(id,all,s,recommended)).join('')}</div></section>`).join('');
  app.innerHTML=`<section class="panel training-panel"><div class="stats-head"><div><h1>${tr('training')}</h1><p>${tr('trainingSub')}</p></div><button class="btn" id="trainingBack">${tr('back')}</button></div>${sections}</section>`;
  $('#trainingBack').onclick=home;app.querySelectorAll('[data-learn-from-training]').forEach(b=>b.onclick=()=>lessonView(b.dataset.learnFromTraining));app.querySelectorAll('[data-tech]').forEach(b=>b.onclick=()=>launchTraining(b.dataset.tech));app.querySelectorAll('button').forEach(pressFeedback)
}
function trainingDifficulty(id){let x=TECHNIQUE_LIBRARY[id];if(!x)return 'easy';if(x.game==='queens'&&x.rank>=3)return 'hard';return x.rank>=2?'hard':x.rank===1?'medium':'easy'}
function trainingSetQueenBase(g,diff){current={game:'queens',diff,n:g.n,reg:g.reg,sol:g.sol,rating:g.rating,state:Array.from({length:g.n},()=>Array(g.n).fill(0)),generated:true,unique:true,completed:false,training:true}}
function trainingSetTangoBase(g,diff,blank=true){let state=Array.from({length:6},()=>Array(6).fill(-1));if(!blank)for(let i of g.givens)state[Math.floor(i/6)][i%6]=g.sol[Math.floor(i/6)][i%6];current={game:'tango',diff,n:6,sol:g.sol,givens:new Set(blank?[]:g.givens),edges:blank?[]:g.edges,rating:g.rating,state,generated:true,unique:true,completed:false,training:true,tangoPendingCell:null}}
function trainingSetSudokuBase(g,diff){current={game:'sudoku',diff,n:6,sol:g.sol,empty:new Set(Array.from({length:36},(_,i)=>i)),rating:g.rating,state:Array.from({length:6},()=>Array(6).fill(0)),sel:null,generated:true,unique:true,completed:false,training:true}}
function trainingSetPatchBase(g,diff){const pal=['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1'];current={game:'patches',diff,n:g.n,reg:g.reg,ids:g.ids,cellsBy:g.cellsBy,clues:g.clues,rating:g.rating,pal,active:g.ids[0],paint:Array.from({length:g.n},()=>Array(g.n).fill(null)),patchSelectedRects:{},patchLogicEvidence:patchEmptyEvidence(),generated:true,unique:true,completed:false,training:true}}
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
function trainingHintForId(id,deadline=Date.now()+1800){
  let x=TECHNIQUE_LIBRARY[id];if(!x||!current||current.game!==x.game)return null;let h=null,r=x.rank;
  if(x.game==='queens')h=r===0?findQueenLogicalHint():r===1?findQueenRank1Hint(deadline):r===2?findQueenRank2Hint(deadline):findQueenRank3Hint(deadline);
  else if(x.game==='tango')h=r===0?findTangoLogicalHint():r===1?findTangoRank1Hint():findTangoRank2Hint();
  else if(x.game==='sudoku')h=r===0?trainingSudokuDirectHint(id):r===1?findSudokuRank1Hint():findSudokuRank2Hint();
  else if(x.game==='patches')h=patchLegacyHintFromEngine(id);
  if(!h||h.timeout||coachTechniqueId(x.game,h)!==id)return null;h.technique=id;return h
}
function trainingBuildQueensDirect(id,deadline){
  for(let attempt=0;attempt<5&&Date.now()<deadline;attempt++){
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
  for(let a=0;a<4&&Date.now()<deadline;a++){
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
  for(let a=0;a<4&&Date.now()<deadline;a++){
    let g=sudokuCandidate('medium');
    if(id==='S_NAKED_SINGLE'){
      for(let r=0;r<6;r++)for(let target=0;target<6;target++){trainingSetSudokuBase(g,'medium');current.empty=new Set();for(let rr=0;rr<6;rr++)for(let c=0;c<6;c++)if(rr!==r||c===target)current.empty.add(rr*6+c);current.state=Array.from({length:6},()=>Array(6).fill(0));for(let c=0;c<6;c++)if(c!==target)current.state[r][c]=g.sol[r][c];let h=trainingHintForId(id,deadline);if(h)return h}
    }else{
      for(let k=0;k<500&&Date.now()<deadline;k++){
        trainingSetSudokuBase(g,'medium');let holes=12+Math.floor(Math.random()*16),idx=shuffle(Array.from({length:36},(_,i)=>i)).slice(0,holes);current.empty=new Set(idx);current.state=g.sol.map((row,r)=>row.map((v,c)=>current.empty.has(r*6+c)?0:v));let h=trainingHintForId(id,deadline);if(h)return h
      }
    }
  }
  return null
}
function trainingBuildPatchDirect(id,deadline){
  for(let a=0;a<8&&Date.now()<deadline;a++){
    let g=patchesCandidate(id==='P_SINGLE_RECTANGLE'?'easy':'medium');trainingSetPatchBase(g,id==='P_SINGLE_RECTANGLE'?'easy':'medium');
    for(let k=0;k<100&&Date.now()<deadline;k++){
      current.paint=Array.from({length:g.n},()=>Array(g.n).fill(null));let p=id==='P_MANDATORY_CELL'?Math.random()*.42:Math.random()*.18;for(let r=0;r<g.n;r++)for(let c=0;c<g.n;c++)if(Math.random()<p)current.paint[r][c]=g.reg[r][c];let h=trainingHintForId(id,deadline);if(h)return h
    }
  }
  return null
}
function trainingRandomProgress(game,base,p){
  if(game==='queens'){current.state=Array.from({length:current.n},()=>Array(current.n).fill(0));for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++){if(c===current.sol[r]){if(Math.random()<p*.55)current.state[r][c]=2}else if(Math.random()<p*.42)current.state[r][c]=1}}
  else if(game==='tango'){current.state=Array.from({length:6},()=>Array(6).fill(-1));current.givens=new Set();for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(Math.random()<p){current.state[r][c]=current.sol[r][c];current.givens.add(r*6+c)}}
  else if(game==='sudoku'){current.empty=new Set();current.state=current.sol.map(r=>[...r]);for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(Math.random()>p){current.empty.add(r*6+c);current.state[r][c]=0}}
  else if(game==='patches'){current.paint=Array.from({length:current.n},()=>Array(current.n).fill(null));current.patchSelectedRects={};current.patchLogicEvidence=patchEmptyEvidence();for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(Math.random()<p)current.paint[r][c]=current.reg[r][c]}
}
const TRAINING_ADVANCED_FIXTURES={"Q_CONTRADICTION_R1":{"game":"queens","diff":"medium","n":7,"reg":[[2,2,2,0,0,0,0],[2,2,1,1,0,0,0],[2,2,2,1,1,1,0],[4,4,4,4,3,1,0],[4,4,4,4,4,1,0],[4,4,4,4,4,4,5],[6,4,4,4,4,4,4]],"sol":[5,3,1,4,2,6,0],"rating":{"score":259,"technique":"recherche contrainte","solved":true,"remain":0,"level":2,"nodes":123,"singles":3},"state":[[0,1,0,1,0,0,0],[0,0,0,2,0,0,1],[1,0,0,0,1,0,0],[0,0,0,0,0,0,0],[0,0,0,1,0,0,1],[0,1,0,1,0,0,2],[2,0,1,0,1,0,0]],"generated":true,"unique":true,"completed":false},"Q_CONTRADICTION_R2":{"game":"queens","diff":"hard","n":8,"reg":[[7,7,7,7,7,7,7,7],[6,7,7,5,5,7,7,5],[6,7,7,4,5,5,5,5],[6,6,7,4,4,4,5,3],[6,6,2,2,2,5,5,3],[6,6,6,2,2,2,2,2],[0,2,2,2,2,1,2,1],[0,0,2,2,2,1,1,1]],"sol":[2,0,6,4,7,3,5,1],"rating":{"score":172,"technique":"propagation croisée","solved":true,"remain":0,"level":1,"nodes":75,"singles":0},"state":[[0,0,2,0,0,0,0,0],[2,1,1,1,0,0,0,0],[0,0,1,0,0,0,2,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0],[0,0,1,0,0,0,0,1],[0,0,1,1,1,0,0,0],[0,0,0,1,1,0,0,0]],"generated":true,"unique":true,"completed":false},"Q_CONTRADICTION_R3":{"game":"queens","diff":"hard","n":8,"reg":[[0,0,0,0,0,0,1,1],[2,0,0,3,0,1,1,1],[2,3,3,3,0,1,1,1],[2,3,3,3,3,3,1,1],[3,3,4,3,3,7,1,1],[3,4,4,4,7,7,7,5],[4,4,4,7,7,6,6,7],[4,4,7,7,7,7,7,7]],"sol":[1,6,0,4,2,7,5,3],"rating":{"score":228,"technique":"recherche contrainte","solved":true,"remain":0,"level":2,"nodes":104,"singles":1},"state":[[0,0,1,0,1,0,1,0],[0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],"generated":true,"unique":true,"completed":false},"T_CONTRADICTION_R1":{"game":"tango","diff":"medium","n":6,"sol":[[0,1,1,0,0,1],[0,1,1,0,1,0],[1,0,0,1,0,1],[1,0,1,1,0,0],[0,1,0,0,1,1],[1,0,0,1,1,0]],"givens":[3,4,7,8,21,22,31],"edges":[[2,1,"d","="],[1,1,"r","="],[4,0,"r","×"],[4,1,"r","×"],[1,0,"d","×"]],"rating":{"score":68,"technique":"chaîne de contraintes","solved":false,"remain":18,"level":2},"state":[[-1,-1,-1,0,0,-1],[-1,1,1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,1,0,-1],[-1,-1,-1,-1,-1,-1],[-1,0,-1,-1,-1,-1]],"generated":true,"unique":true,"completed":false,"tangoPendingCell":null},"T_CONTRADICTION_R2":{"game":"tango","diff":"hard","n":6,"sol":[[0,1,0,1,1,0],[0,1,1,0,0,1],[1,0,1,1,0,0],[0,1,0,0,1,1],[1,0,0,1,0,1],[1,0,1,0,1,0]],"givens":[1,4,5,6,7,8,9,10,13,16,17,18,19,22,29,30,31,32,33,35],"edges":[[3,2,"r","="],[2,0,"d","×"],[0,1,"d","="],[1,3,"r","="],[3,3,"r","×"],[4,1,"r","="],[1,1,"r","="]],"rating":{"score":99,"technique":"chaîne de contraintes","solved":false,"remain":33,"level":2},"state":[[-1,1,-1,-1,1,0],[0,1,1,0,0,-1],[-1,0,-1,-1,0,0],[0,1,-1,-1,1,-1],[-1,-1,-1,-1,-1,1],[1,0,1,0,-1,0]],"generated":true,"unique":true,"completed":false,"tangoPendingCell":null},"S_CONTRADICTION_R1":{"game":"sudoku","diff":"medium","n":6,"sol":[[6,2,1,5,4,3],[5,4,3,6,2,1],[2,1,5,4,3,6],[4,3,6,2,1,5],[1,5,4,3,6,2],[3,6,2,1,5,4]],"empty":[2,3,4,5,6,7,11,13,16,18,20,21,28,29,30,31,33],"rating":{"score":22,"technique":"single nu","solved":true,"remain":0,"level":0},"state":[[6,2,0,0,0,0],[0,0,3,6,2,0],[2,0,5,4,0,6],[0,3,0,0,1,5],[1,5,4,3,0,0],[0,0,2,0,5,4]],"sel":null,"generated":true,"unique":true,"completed":false},"S_CONTRADICTION_R2":{"game":"sudoku","diff":"hard","n":6,"sol":[[2,3,4,1,5,6],[5,6,1,4,2,3],[6,4,5,2,3,1],[3,1,2,5,6,4],[4,2,6,3,1,5],[1,5,3,6,4,2]],"empty":[1,3,4,5,6,7,8,9,11,13,15,16,19,20,21,22,24,25,26,27,28,30,34,35],"rating":{"score":26,"technique":"single nu","solved":true,"remain":0,"level":0},"state":[[2,0,4,0,0,0],[0,0,0,0,2,0],[6,0,5,0,0,1],[3,0,0,0,0,4],[0,0,0,0,0,5],[0,5,3,6,0,0]],"sel":null,"generated":true,"unique":true,"completed":false},"P_CONTRADICTION_R1":{"game":"patches","diff":"medium","n":6,"reg":[[0,2,2,2,4,4],[1,3,3,3,4,4],[5,6,7,7,7,7],[8,8,8,8,8,8],[9,9,9,9,9,9],[9,9,9,9,9,9]],"ids":[0,1,2,3,4,5,6,7,8,9],"cellsBy":{"0":[[0,0]],"1":[[1,0]],"2":[[0,1],[0,2],[0,3]],"3":[[1,1],[1,2],[1,3]],"4":[[0,4],[0,5],[1,4],[1,5]],"5":[[2,0]],"6":[[2,1]],"7":[[2,2],[2,3],[2,4],[2,5]],"8":[[3,0],[3,1],[3,2],[3,3],[3,4],[3,5]],"9":[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[5,0],[5,1],[5,2],[5,3],[5,4],[5,5]]},"clues":{"0":{"pos":[0,0],"size":1,"shape":"carré","mode":"size"},"1":{"pos":[1,0],"size":1,"shape":"carré","mode":"shape"},"2":{"pos":[0,2],"size":3,"shape":"horizontal","mode":"size"},"3":{"pos":[1,1],"size":3,"shape":"horizontal","mode":"size"},"4":{"pos":[1,5],"size":4,"shape":"carré","mode":"none"},"5":{"pos":[2,0],"size":1,"shape":"carré","mode":"size"},"6":{"pos":[2,1],"size":1,"shape":"carré","mode":"shape"},"7":{"pos":[2,5],"size":4,"shape":"horizontal","mode":"size"},"8":{"pos":[3,0],"size":6,"shape":"horizontal","mode":"shape"},"9":{"pos":[5,0],"size":12,"shape":"horizontal","mode":"size"}},"rating":{"score":23,"technique":"couverture forcée","solved":true,"remain":0,"level":1},"pal":["#f3c6a8","#b9d9c1","#c6d4ed","#e2c3df","#f0dc9d","#c7e0e3","#d5ceb8","#d4e3b4","#edbfc1","#c8c4e8","#e5d0a4","#b7d7d1"],"active":0,"paint":[[0,null,null,null,null,null],[null,null,null,null,null,null],[null,null,null,null,null,null],[null,8,null,null,null,null],[null,null,null,null,null,null],[9,9,9,null,9,9]],"generated":true,"unique":true,"completed":false},"P_CONTRADICTION_R2":{"game":"patches","diff":"hard","n":7,"reg":[[0,0,0,0,1,1,2],[0,0,0,0,1,1,2],[3,3,3,3,3,3,3],[4,4,4,4,4,5,7],[4,4,4,4,4,6,7],[8,8,8,8,8,8,8],[9,9,9,9,9,9,9]],"ids":[0,1,2,3,4,5,6,7,8,9],"cellsBy":{"0":[[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3]],"1":[[0,4],[0,5],[1,4],[1,5]],"2":[[0,6],[1,6]],"3":[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6]],"4":[[3,0],[3,1],[3,2],[3,3],[3,4],[4,0],[4,1],[4,2],[4,3],[4,4]],"5":[[3,5]],"6":[[4,5]],"7":[[3,6],[4,6]],"8":[[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6]],"9":[[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6]]},"clues":{"0":{"pos":[1,3],"size":8,"shape":"horizontal","mode":"size"},"1":{"pos":[1,5],"size":4,"shape":"carré","mode":"shape"},"2":{"pos":[0,6],"size":2,"shape":"vertical","mode":"size"},"3":{"pos":[2,4],"size":7,"shape":"horizontal","mode":"shape"},"4":{"pos":[4,0],"size":10,"shape":"horizontal","mode":"size"},"5":{"pos":[3,5],"size":1,"shape":"carré","mode":"size"},"6":{"pos":[4,5],"size":1,"shape":"carré","mode":"none"},"7":{"pos":[4,6],"size":2,"shape":"vertical","mode":"size"},"8":{"pos":[5,2],"size":7,"shape":"horizontal","mode":"size"},"9":{"pos":[6,4],"size":7,"shape":"horizontal","mode":"none"}},"rating":{"score":59,"technique":"enchaînement spatial","solved":false,"remain":8,"level":2},"pal":["#f3c6a8","#b9d9c1","#c6d4ed","#e2c3df","#f0dc9d","#c7e0e3","#d5ceb8","#d4e3b4","#edbfc1","#c8c4e8","#e5d0a4","#b7d7d1"],"active":0,"paint":[[null,null,null,0,null,null,null],[null,0,null,null,null,1,null],[null,null,null,null,3,null,null],[null,4,4,null,null,null,null],[null,4,null,null,4,null,7],[null,8,8,8,8,8,8],[null,9,9,9,null,9,9]],"generated":true,"unique":true,"completed":false}};
function trainingLoadAdvancedFixture(id,deadline){
  let raw=TRAINING_ADVANCED_FIXTURES[id];if(!raw)return null;let c=JSON.parse(JSON.stringify(raw));if(Array.isArray(c.givens))c.givens=new Set(c.givens);if(Array.isArray(c.empty))c.empty=new Set(c.empty);current=c;current.training=true;let h=trainingHintForId(id,deadline);if(!h){current=null;return null}return h
}
function trainingBuildAdvanced(id,deadline){
  let fixture=trainingLoadAdvancedFixture(id,deadline);if(fixture)return fixture;let x=TECHNIQUE_LIBRARY[id],diff=trainingDifficulty(id);
  for(let b=0;b<4&&Date.now()<deadline;b++){
    if(x.game==='queens')trainingSetQueenBase(queenCandidate(diff),diff);
    else if(x.game==='tango'){let g=tangoCandidate(diff);trainingSetTangoBase(g,diff,true);current.edges=g.edges}
    else if(x.game==='sudoku')trainingSetSudokuBase(sudokuCandidate(diff),diff);
    else if(x.game==='patches')trainingSetPatchBase(patchesCandidate(diff),diff);
    let base=current;
    for(let k=0;k<90&&Date.now()<deadline;k++){
      let p=.12+Math.random()*.72;trainingRandomProgress(x.game,base,p);let h=trainingHintForId(id,deadline);if(h)return h
    }
  }
  return null
}
function buildTrainingExercise(id){
  let x=TECHNIQUE_LIBRARY[id];if(!x)return null;let deadline=Date.now()+5500,h=null;
  if(x.rank===0){if(x.game==='queens')h=trainingBuildQueensDirect(id,deadline);else if(x.game==='tango')h=trainingBuildTangoDirect(id,deadline);else if(x.game==='sudoku')h=trainingBuildSudokuDirect(id,deadline);else h=trainingBuildPatchDirect(id,deadline)}
  else h=trainingBuildAdvanced(id,deadline);
  if(!h)return null;
  current.training=true;current.trainingTechnique=id;current.trainingTargetHint={...h,technique:id};current.trainingCompleted=false;current.trainingOffPath=false;current.trainingStatsClosed=false;current.trainingMasteryMerged=false;current.coachUsage=null;current.masterySession=null;current.errorCoachUsage=null;current.lastError=null;current.hintFlow=null;current.lastReasoning=null;
  current.trainingStartSnapshot=puzzleSnapshot();return current
}
function trainingHintExpectedValue(h){return h?.id!=null?h.id:h?.v}
function trainingActionMatchesHint(h,action){if(!h||!action)return false;let expected=trainingHintExpectedValue(h);return (action.changes||[]).some(ch=>ch.row===h.r&&ch.column===h.c&&ch.to===expected)}
function trainingRender(){
  if(!current?.training)return;
  if(current.game==='queens')renderQueens(current);else if(current.game==='tango')renderTango(current);else if(current.game==='sudoku')renderSudoku(current);else renderPatches(current);
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
  if(!TECHNIQUE_LIBRARY[id])return trainingView();if(current&&!current.completed)clearSaved();stopTimer();paused=false;setBusy(true);requestAnimationFrame(()=>{let ok=false;try{ok=!!buildTrainingExercise(id);if(!ok){showToast(tr('trainingUnavailable'));trainingView();return}trainingStatsStart(id);trainingRender();historyInit(true);updateHistoryButtons();startTimer(true,0,false);saveCurrent();haptic(8)}finally{setBusy(false)}})
}
function resetTrainingExercise(){
  if(!current?.training||!current.trainingStartSnapshot)return;paused=false;current.trainingCompleted=false;current.trainingOffPath=false;current.hintFlow=null;current.lastError=null;current.masteryPendingAid=null;restorePuzzleSnapshot(current.trainingStartSnapshot);historyInit(true);updateHistoryButtons();stopTimer(false);elapsedBase=0;startedAt=0;startTimer(true,0,false);decorateTrainingShell();saveCurrent();status('',true)
}
function trainingTargetStillCorrect(){let h=current?.trainingTargetHint;if(!h)return false;let expected=trainingHintExpectedValue(h);return current.game==='patches'?current.paint[h.r][h.c]===expected:current.state[h.r][h.c]===expected}
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
  if(!current?.training||paused&&current.trainingCompleted)return;if(showVisibleErrorsBeforeHint())return;if(current.trainingOffPath)return showToast(tr('trainingTryAgain'));let h=current.trainingTargetHint;if(!h)return showToast(tr('trainingUnavailable'));let g=current.game,move='';
  if(g==='queens')move=lang()==='fr'?`${h.v===2?'Place une reine':'Place un X'} en ligne ${h.r+1}, colonne ${h.c+1}.`:`${h.v===2?'Place a queen':'Place an X'} at row ${h.r+1}, column ${h.c+1}.`;
  else if(g==='tango'){let name=h.v===1?(lang()==='fr'?'un soleil ☀':'a sun ☀'):(lang()==='fr'?'une lune ☾':'a moon ☾');move=lang()==='fr'?`Place ${name} en ligne ${h.r+1}, colonne ${h.c+1}.`:`Place ${name} at row ${h.r+1}, column ${h.c+1}.`}
  else if(g==='sudoku')move=lang()==='fr'?`Place le chiffre ${h.v} en ligne ${h.r+1}, colonne ${h.c+1}.`:`Place digit ${h.v} at row ${h.r+1}, column ${h.c+1}.`;
  else move=lang()==='fr'?`Attribue la case ligne ${h.r+1}, colonne ${h.c+1} à la zone ${h.id+1}.`:`Assign row ${h.r+1}, column ${h.c+1} to region ${h.id+1}.`;
  let why=h.rank===3?rank3Why(h):h.rank===2?rank2Why(h):h.rank===1?rank1Why(h):h.why,reasoning=structuredReasoning(g,h),reveal=g==='queens'?tr('queenPlaced'):g==='tango'?tr('cellRevealed'):g==='sudoku'?tr('digitRevealed'):tr('patchRevealed');
  hintStage(g,[h.r,h.c],{move,where:tr('trainingTarget')+` : ${techniqueTitle(current.trainingTechnique)}`,why,reveal,rank:h.rank||0,value:trainingHintExpectedValue(h),reasoning},()=>{if(g==='patches'){current.paint[h.r][h.c]=h.id;drawP()}else{current.state[h.r][h.c]=h.v;if(g==='queens')drawQ();else if(g==='tango')drawT();else{current.sel=[h.r,h.c];drawS()}}})
}

function coachActionFor(game,h){
  if(game==='queens')return {type:h.v===1?'MARK_X':'PLACE_QUEEN',value:h.v===1?1:2};
  if(game==='tango')return {type:h.v===1?'PLACE_SUN':'PLACE_MOON',value:h.v};
  if(game==='sudoku')return {type:'PLACE_DIGIT',value:h.v};
  if(game==='patches')return {type:'ASSIGN_REGION',value:h.id};
  return {type:'MOVE',value:h.v??h.id??null}
}
function coachTechniqueId(game,h){
  if(h?.technique&&TECHNIQUE_LIBRARY[h.technique]?.game===game)return h.technique;
  let rank=Math.max(0,Number(h?.rank)||0),prefix={queens:'Q',tango:'T',sudoku:'S',patches:'P'}[game];
  if(prefix&&rank>0){
    let id=`${prefix}_CONTRADICTION_R${rank}`;if(TECHNIQUE_LIBRARY[id])return id
  }
  // Defensive fallback for older/migrated hint objects: choose a valid direct technique per game.
  return {queens:'Q_UNIQUE_REGION',tango:'T_NO_THREE',sudoku:'S_NAKED_SINGLE',patches:'P_MANDATORY_CELL'}[game]||null
}
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

// ===== v2.21.18 — Grille 6 explicit proof engine adapter =====
function sudokuLogicAvailable(){return typeof SudokuLogic!=='undefined'&&SudokuLogic?.createSession}
function sudokuLogicBoard(c=current,state=null){return {state:cloneGrid(state||c.state)}}
function sudokuLogicSession(c=current,state=null){if(!sudokuLogicAvailable())throw new Error('Grille 6 inference engine unavailable');return SudokuLogic.createSession(sudokuLogicBoard(c,state))}
function sudokuFormat(key,vars={}){return String(tr(key)||key).replace(/\{([A-Za-z0-9_]+)\}/g,(_,k)=>vars[k]??'')}
function sudokuUnitHuman(ref){if(!ref)return '';if(ref.family==='row')return `${tr('rowLabel')} ${Number(ref.id)+1}`;if(ref.family==='column')return `${tr('columnLabel')} ${Number(ref.id)+1}`;return `${tr('slgBox')} ${Number(ref.id)+1}`}
function sudokuUnitCells(ref){if(!ref)return [];if(ref.family==='row')return Array.from({length:6},(_,c)=>[Number(ref.id),c]);if(ref.family==='column')return Array.from({length:6},(_,r)=>[r,Number(ref.id)]);let br=Math.floor(Number(ref.id)/2)*2,bc=(Number(ref.id)%2)*3,out=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)out.push([r,c]);return out}
function sudokuCellListHuman(cells,limit=8){let names=(cells||[]).map(c=>cellName(...c));return names.length<=limit?names.join(', '):names.slice(0,limit).join(', ')+` (+${names.length-limit})`}
function sudokuLegacyTechniqueForDeduction(d){return {NAKED_SINGLE:'S_NAKED_SINGLE',HIDDEN_SINGLE_ROW:'S_HIDDEN_ROW',HIDDEN_SINGLE_COLUMN:'S_HIDDEN_COLUMN',HIDDEN_SINGLE_BOX:'S_HIDDEN_BOX',LOCKED_CANDIDATE:'S_LOCKED_CANDIDATE',NAKED_SUBSET_2:'S_NAKED_PAIR',HIDDEN_SUBSET_2:'S_HIDDEN_PAIR',NAKED_SUBSET_3:'S_NAKED_TRIPLE',HIDDEN_SUBSET_3:'S_HIDDEN_TRIPLE',CONTRADICTION_L1:'S_CONTRADICTION_R1',COMMON_BRANCH_CONSEQUENCE:'S_COMMON_CONSEQUENCE',CONTRADICTION_L2:'S_CONTRADICTION_R2'}[d?.rule]||null}
function sudokuCoachRankForDeduction(d){return d?.rule==='CONTRADICTION_L1'?1:(d?.rule==='COMMON_BRANCH_CONSEQUENCE'||d?.rule==='CONTRADICTION_L2'?2:0)}
function sudokuRuleHumanTitle(d){let key={NAKED_SINGLE:'slgNakedSingle',HIDDEN_SINGLE_ROW:'slgHiddenRow',HIDDEN_SINGLE_COLUMN:'slgHiddenColumn',HIDDEN_SINGLE_BOX:'slgHiddenBox',LOCKED_CANDIDATE:'slgLockedCandidate',NAKED_SUBSET_2:'slgNakedPair',HIDDEN_SUBSET_2:'slgHiddenPair',NAKED_SUBSET_3:'slgNakedTriple',HIDDEN_SUBSET_3:'slgHiddenTriple',CONTRADICTION_L1:'slgContradictionL1',COMMON_BRANCH_CONSEQUENCE:'slgCommonConsequence',CONTRADICTION_L2:'slgContradictionL2'}[d?.rule];return key?tr(key):tr('logic')}
function sudokuContradictionText(w){if(!w)return tr('contradictionFound');if(w.code==='C1')return sudokuFormat('slgContrC1',{value:w.value,unit:sudokuUnitHuman(w.unit)});if(w.code==='C2')return sudokuFormat('slgContrC2',{cell:cellName(...w.cell)});if(w.code==='C3')return sudokuFormat('slgContrC3',{value:w.value,unit:sudokuUnitHuman(w.unit)});if(w.code==='C4')return sudokuFormat('slgContrC4',{value:w.value,cell:cellName(...w.cell)});return tr('contradictionFound')}
function sudokuFactHuman(f){if(!f)return '';return f.type==='VALUE'?sudokuFormat('slgFactValue',{cell:cellName(...f.cell),value:f.value}):sudokuFormat('slgFactNotCandidate',{cell:cellName(...f.cell),value:f.value})}
function sudokuDeductionOrientation(d){let x=d?.explanationData||{};if(d?.rule==='NAKED_SINGLE')return sudokuFormat('slgOrientCell',{cell:cellName(...(x.cell||d.conclusions?.[0]?.cell||[0,0]))});if(/^HIDDEN_SINGLE_/.test(d?.rule||''))return sudokuFormat('slgOrientUnit',{unit:sudokuUnitHuman(x.unit||d.focusUnits?.[0])});if(d?.rule==='LOCKED_CANDIDATE')return sudokuFormat('slgOrientLocked',{source:sudokuUnitHuman(x.sourceUnit),target:sudokuUnitHuman(x.targetUnit)});if(/SUBSET_/.test(d?.rule||''))return sudokuFormat('slgOrientUnit',{unit:sudokuUnitHuman(x.unit||d.focusUnits?.[0])});if(d?.rule==='COMMON_BRANCH_CONSEQUENCE')return sudokuFormat('slgOrientCommon',{cell:cellName(...x.branchCell)});if(d?.rule==='CONTRADICTION_L1'||d?.rule==='CONTRADICTION_L2')return sudokuFormat('slgOrientContradiction',{cell:cellName(...(x.cell||d.focusCells?.[0]||[0,0]))});return tr('visibleOnly')}
function sudokuDeductionExplanation(d){let x=d?.explanationData||{};if(d?.rule==='NAKED_SINGLE'){let vals=(x.eliminated||[]).map(e=>e.value).sort((a,b)=>a-b);return sudokuFormat('slgExplainNaked',{cell:cellName(...x.cell),eliminated:vals.join(', '),value:x.candidate})}if(/^HIDDEN_SINGLE_/.test(d?.rule||''))return sudokuFormat('slgExplainHidden',{unit:sudokuUnitHuman(x.unit),value:x.value,cell:cellName(...x.cell)});if(d?.rule==='LOCKED_CANDIDATE')return sudokuFormat('slgExplainLocked',{source:sudokuUnitHuman(x.sourceUnit),target:sudokuUnitHuman(x.targetUnit),value:x.value,sourceCells:sudokuCellListHuman(x.sourceCells),targets:sudokuCellListHuman(x.eliminatedCells)});if(d?.rule==='NAKED_SUBSET_2'||d?.rule==='NAKED_SUBSET_3')return sudokuFormat('slgExplainNakedSubset',{unit:sudokuUnitHuman(x.unit),cells:sudokuCellListHuman(x.cells),values:(x.values||[]).join(', ')});if(d?.rule==='HIDDEN_SUBSET_2'||d?.rule==='HIDDEN_SUBSET_3')return sudokuFormat('slgExplainHiddenSubset',{unit:sudokuUnitHuman(x.unit),cells:sudokuCellListHuman(x.cells),values:(x.values||[]).join(', ')});if(d?.rule==='CONTRADICTION_L1'){let branch=x.branches?.[0]||d.premises?.[0],value=x.rejected?.[0]??branch?.assumption?.value,cell=x.cell||branch?.assumption?.cell||d.focusCells?.[0];return sudokuFormat('slgExplainContradiction',{cell:cellName(...cell),value,reason:sudokuContradictionText(branch?.contradiction)})}if(d?.rule==='COMMON_BRANCH_CONSEQUENCE'){let fact=x.commonFact||d.conclusions?.[0];return sudokuFormat('slgExplainCommon',{branchCell:cellName(...x.branchCell),values:(x.candidateValues||[]).join(', '),fact:sudokuFactHuman(fact)})}if(d?.rule==='CONTRADICTION_L2'){let primary=x.branches?.[0]||d.premises?.[0],nested=primary?.nestedWitness,value=x.rejected?.[0]??primary?.assumption?.value,cell=x.cell||primary?.assumption?.cell||d.focusCells?.[0],nestedCell=nested?.cell||d.focusCells?.[1]||cell,reasons=(nested?.branches||[]).map(b=>sudokuContradictionText(b.contradiction)).join(' ; ');return sudokuFormat('slgExplainNested',{cell:cellName(...cell),value,nestedCell:cellName(...nestedCell),reasons:reasons||tr('contradictionFound')})}return sudokuRuleHumanTitle(d)}
function sudokuValueStepConclusion(step){let cs=step?.deduction?.conclusions?.filter(c=>c.type==='VALUE')||[];return cs.length===1?cs[0]:null}
function sudokuValueStepExplanation(step){let primary=step?.primaryDeduction||step?.deduction,final=step?.deduction;if(!primary||!final)return '';let parts=[`<b>${sudokuRuleHumanTitle(primary)}</b> — ${sudokuDeductionExplanation(primary)}`],supports=step.supportingDeductions||[];if(supports.length>1){let rules=supports.slice(1).map(sudokuRuleHumanTitle);parts.push(sudokuFormat('slgSupportChain',{count:supports.length-1,rules:rules.join(' → ')}))}let value=sudokuValueStepConclusion(step);if(value&&primary.signature!==final.signature)parts.push(sudokuFormat('slgFinalSingle',{cell:cellName(...value.cell),value:value.value}));return parts.join('<br>')}
function sudokuValueStepReasoning(step){let primary=step?.primaryDeduction||step?.deduction,final=step?.deduction,value=sudokuValueStepConclusion(step),technique=sudokuLegacyTechniqueForDeduction(primary);if(!primary||!final||!value)return null;return {schema:2,source:'sudoku-inference-engine',game:'sudoku',rule:primary.rule,finalRule:final.rule,technique,rank:sudokuCoachRankForDeduction(primary),engineRank:primary.rank,techniqueLevel:primary.techniqueLevel,premises:JSON.parse(JSON.stringify(primary.premises||[])),dependencies:[...(primary.dependencies||[])],focusCells:(primary.focusCells||[]).map(c=>[...c]),focusUnits:JSON.parse(JSON.stringify(primary.focusUnits||[])),conclusions:JSON.parse(JSON.stringify(final.conclusions||[])),supportingDeductions:JSON.parse(JSON.stringify(step.supportingDeductions||[])),finalDeduction:JSON.parse(JSON.stringify(final)),explanationData:JSON.parse(JSON.stringify(primary.explanationData||{})),target:{row:value.cell[0],column:value.cell[1]},action:{type:'PLACE_DIGIT',value:value.value}}}
function sudokuProofReasoning(proof){let d=proof?.deduction;if(!d)return null;let technique=sudokuLegacyTechniqueForDeduction(d),cell=proof.cell||d.conclusions?.[0]?.cell||[0,0];return {schema:2,source:'sudoku-inference-engine',game:'sudoku',rule:d.rule,finalRule:d.rule,technique,rank:sudokuCoachRankForDeduction(d),engineRank:d.rank,techniqueLevel:d.techniqueLevel,premises:JSON.parse(JSON.stringify(d.premises||[])),dependencies:[...(d.dependencies||[])],focusCells:(d.focusCells||[]).map(c=>[...c]),focusUnits:JSON.parse(JSON.stringify(d.focusUnits||[])),conclusions:JSON.parse(JSON.stringify(d.conclusions||[])),supportingDeductions:JSON.parse(JSON.stringify(proof.supportingDeductions||[])),finalDeduction:JSON.parse(JSON.stringify(d)),explanationData:JSON.parse(JSON.stringify(d.explanationData||{})),target:{row:cell[0],column:cell[1]},action:{type:'PLACE_DIGIT',value:proof.value}}}
function sudokuCurrentValueStep(){let session=sudokuLogicSession();return {session,...session.nextValueStep()}}
function sudokuShowLogicalContradiction(w){current.hintFlow=null;clearHintFocus();let b=$('#sboard');if(b)for(let cell of w?.cells||[]){let el=b.children[cell[0]*6+cell[1]];if(el)el.classList.add('error-focus')}showHintNotice(`<b>⚠ ${tr('contradictionFound')}</b><br>${sudokuContradictionText(w)}`);return true}

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
function queenRuleHumanTitle(d){
  let N=d?.explanationData?.size,key=d?.rule==='SINGLETON'?'qlSingleton':d?.rule==='LOCKED_UNIT'?'qlLocked':d?.rule==='COMMON_CONFLICT'?'qlCommonConflict':d?.rule==='HALL_SET'?(N===2?'qlHallPair':N===3?'qlHallTriple':'qlHallGroup'):d?.rule==='LOCAL_CAPACITY'?'qlCapacity':d?.rule==='NO_SUPPORT'?'qlNoSupport':d?.rule==='MIXED_HALL'?'qlMixedHall':d?.rule==='ASSUMPTION_CONTRADICTION'?'qlContradiction':null;
  return key?tr(key):tr('qlLogicalDeduction')
}
function queenDeductionPremiseCells(d,c=current){
  if(!d)return [];let x=d.explanationData||{},cells=[];
  if(Array.isArray(x.sourceCandidates))cells.push(...x.sourceCandidates);
  if(Array.isArray(x.supportCandidates))cells.push(...x.supportCandidates);
  if(Array.isArray(x.target))cells.push(x.target);
  if(x.block)cells.push(...x.block);
  if(x.sourceCandidates&&typeof x.sourceCandidates==='object'&&!Array.isArray(x.sourceCandidates))for(let a of Object.values(x.sourceCandidates))cells.push(...a);
  for(let u of d.focusUnits||[])cells.push(...queenUnitCells(u,c));
  if(x.assumption?.cell)cells.push(x.assumption.cell);
  if(x.witness?.cells)cells.push(...x.witness.cells);
  let seen=new Set(),out=[];for(let cell of cells){if(!Array.isArray(cell))continue;let k=cell.join(',');if(!seen.has(k)){seen.add(k);out.push(cell)}}return out
}
function queenTargetFamilyHuman(f){return tr(f==='row'?'qlRowsPlural':f==='column'?'qlColumnsPlural':'qlRegionsPlural')}
function queenDeductionOrientation(d){
  let x=d.explanationData||{};if(!DETAILED_HINT_LANGS.has(lang())){let c=d.conclusions?.[0],g=c?genericLocalizedHint('queens',c.cell,d.rank,c.value):{where:tr('visibleOnly')};return `${queenRuleHumanTitle(d)} · ${g.where}`}
  if(d.rule==='SINGLETON')return queenFormat('qlOrientSingleton',{unit:queenUnitHuman(x.unit)});
  if(d.rule==='LOCKED_UNIT')return queenFormat('qlOrientLocked',{source:queenUnitHuman(x.sourceUnit),target:queenUnitHuman(x.targetUnit)});
  if(d.rule==='COMMON_CONFLICT')return queenFormat('qlOrientCommon',{source:queenUnitHuman(x.sourceUnit),target:cellName(...x.target)});
  if(d.rule==='HALL_SET')return queenFormat('qlOrientHall',{sources:queenUnitListHuman(x.sourceUnits),targetFamily:queenTargetFamilyHuman(x.targetFamily)});
  if(d.rule==='LOCAL_CAPACITY')return queenFormat('qlOrientCapacity',{size:x.size});
  if(d.rule==='NO_SUPPORT')return queenFormat('qlOrientNoSupport',{target:cellName(...x.target),support:queenUnitHuman(x.supportUnit)});
  if(d.rule==='MIXED_HALL')return queenFormat('qlOrientMixed',{sources:queenUnitListHuman(x.sourceUnits),rows:x.rows.length,columns:x.columns.length});
  if(d.rule==='ASSUMPTION_CONTRADICTION')return queenFormat('qlOrientContradiction',{cell:cellName(...x.assumption.cell)});
  return tr('visibleOnly')
}
function queenDeductionConclusionText(d){
  let cs=d.conclusions||[],queens=cs.filter(x=>x.value===2).map(x=>x.cell),xs=cs.filter(x=>x.value===1).map(x=>x.cell),parts=[];
  if(queens.length)parts.push(queenFormat('qlConclusionQueen',{cells:queenCellListHuman(queens)}));
  if(xs.length)parts.push(queenFormat('qlConclusionXs',{cells:queenCellListHuman(xs)}));
  return parts.join(' ')
}
function queenDeductionExplanation(d){
  let x=d.explanationData||{},conclusion=queenDeductionConclusionText(d);if(!DETAILED_HINT_LANGS.has(lang())){let c=d.conclusions?.[0];if(!c)return queenRuleHumanTitle(d);let g=genericLocalizedHint('queens',c.cell,d.rank,c.value);return `${queenRuleHumanTitle(d)}. ${g.why} ${g.move}`}
  if(d.rule==='SINGLETON')return queenFormat('qlExplainSingleton',{unit:queenUnitHuman(x.unit),conclusion});
  if(d.rule==='LOCKED_UNIT')return queenFormat('qlExplainLocked',{source:queenUnitHuman(x.sourceUnit),target:queenUnitHuman(x.targetUnit),conclusion});
  if(d.rule==='COMMON_CONFLICT'){let conflicts=(x.conflicts||[]).map(z=>`${cellName(...z.candidate)} → ${queenConflictReasonHuman(z.reasons)}`).join('; ');return queenFormat('qlExplainCommon',{source:queenUnitHuman(x.sourceUnit),candidates:queenCellListHuman(x.sourceCandidates),target:cellName(...x.target),conflicts,conclusion})}
  if(d.rule==='HALL_SET')return queenFormat('qlExplainHall',{size:x.size,targets:queenUnitListHuman(x.targetUnits),conclusion});
  if(d.rule==='LOCAL_CAPACITY')return queenFormat('qlExplainCapacity',{size:x.size,capacity:x.capacity,sourcesCount:x.sourceUnits.length,conclusion});
  if(d.rule==='NO_SUPPORT')return queenFormat('qlExplainNoSupport',{target:cellName(...x.target),support:queenUnitHuman(x.supportUnit),conclusion});
  if(d.rule==='MIXED_HALL')return queenFormat('qlExplainMixed',{size:x.size,rows:x.rows.length,columns:x.columns.length,conclusion});
  if(d.rule==='ASSUMPTION_CONTRADICTION'){
    let a=x.assumption,w=x.witness||{},detail=w.kind==='no_candidate'?queenFormat('qlWitnessNoCandidate',{unit:queenUnitHuman(w.unit)}):w.kind==='hall_contradiction'?tr('qlWitnessHall'):w.kind==='capacity_contradiction'?tr('qlWitnessCapacity'):tr('qlWitnessRule');
    return queenFormat('qlExplainContradiction',{assumed:tr(a.value===2?'qlAssumeQueen':'qlAssumeX'),cell:cellName(...a.cell),detail,conclusion})
  }
  return conclusion
}
function queenLegacyTechniqueForDeduction(d){
  if(!d)return null;if(d.rule==='SINGLETON'){let f=d.explanationData?.unit?.family;return f==='row'?'Q_UNIQUE_ROW':f==='column'?'Q_UNIQUE_COLUMN':'Q_UNIQUE_REGION'}
  if(d.rule==='ASSUMPTION_CONTRADICTION')return 'Q_CONTRADICTION_R2';return null
}
function queenDeductionReasoning(d,automatic=[]){
  return {schema:2,source:'queens-inference-engine',game:'queens',rule:d.rule,technique:queenLegacyTechniqueForDeduction(d),rank:d.rank,techniqueLevel:d.techniqueLevel,premises:JSON.parse(JSON.stringify(d.premises||[])),dependencies:[...(d.dependencies||[])],focusCells:(d.focusCells||[]).map(x=>[...x]),focusUnits:JSON.parse(JSON.stringify(d.focusUnits||[])),conclusions:JSON.parse(JSON.stringify(d.conclusions||[])),automatic:JSON.parse(JSON.stringify(automatic||[])),explanationData:JSON.parse(JSON.stringify(d.explanationData||{}))}
}
function queenLogicContradictionText(w){
  if(!w)return '';
  if(w.kind==='no_candidate')return queenFormat('qlCurrentNoCandidate',{unit:queenUnitHuman(w.unit)});
  if(w.kind==='hall_contradiction')return queenFormat('qlCurrentHall',{targetFamily:queenTargetFamilyHuman(w.targetFamily)});
  if(w.kind==='capacity_contradiction')return queenFormat('qlCurrentCapacity',{size:w.size,capacity:w.capacity});
  if(w.kind==='rule_violation')return queenFormat('qlCurrentRule',{reason:queenConflictReasonHuman(w.reasons)});
  return tr('qlCurrentGeneric')
}
function queenFocusDeduction(d,reveal=false){
  clearHintFocus();let board=$('#qboard')||document.querySelector('.board');if(!board||!current||!d)return;let n=current.n,ctx=queenDeductionPremiseCells(d,current),conclusions=(d.conclusions||[]).map(x=>x.cell),mark=(cell,cls)=>{let x=board.children[cell[0]*n+cell[1]];if(x)x.classList.add(cls)};
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
  showHintNotice(`<b>⚠ ${tr('contradictionFound')}</b><br>${queenLogicContradictionText(w)}`);return true
}
function queenCoachHandleDeduction(d){
  let boardKey=historySnapshotKey(),sig=d.id+'|'+d.rank,flow=current.hintFlow,isSame=flow?.kind==='queens-proof'&&flow.boardKey===boardKey&&flow.signature===sig;
  if(!isSame){current.hintFlow={kind:'queens-proof',boardKey,signature:sig,stage:1,deduction:JSON.parse(JSON.stringify(d))};coachUsage(1,queenLegacyTechniqueForDeduction(d));queenFocusDeduction(d,false);showHintNotice(`<span class="coach-progress">1/2</span><b>${tr('where')} :</b> ${queenDeductionOrientation(d)}`);saveCurrent();return}
  let proof=flow.deduction||d,technique=queenLegacyTechniqueForDeduction(proof),before=historySnapshotKey();coachUsage(2,technique);coachUsage(3,technique);markHintUsed();updateScoreFlags();queenFocusDeduction(proof,true);let application=queenApplyDeductionToCurrent(proof);if(!application){current.hintFlow=null;showHintNotice(tr('hintError'));return}drawQ();historyRecord({type:'COACH_APPLY',reasoning:queenDeductionReasoning(proof,application.automatic),coachStage:2,coachFlowVersion:3},before);current.hintFlow=null;
  showHintNotice(`<span class="coach-progress">2/2</span><b>${queenRuleHumanTitle(proof)}</b><br>${queenDeductionExplanation(proof)}`);maybeAutoFinish();saveCurrent();haptic(12)
}
// ===== v2.21.11 — Soleil/Lune explicit proof engine adapter =====
function tangoLogicAvailable(){return typeof TangoLogic!=='undefined'&&TangoLogic?.createSession}
function tangoLogicBoard(c=current,state=null,derived=null){return {n:c.n||6,state:cloneGrid(state||c.state),edges:JSON.parse(JSON.stringify(c.edges||[])),givens:c.givens||[],derivedRelations:JSON.parse(JSON.stringify(derived??c.tangoDerivedRelations??[]))}}
function tangoLogicSession(c=current,state=null,derived=null){if(!tangoLogicAvailable())throw new Error('Soleil/Lune inference engine unavailable');return TangoLogic.createSession(tangoLogicBoard(c,state,derived))}
function tangoUnitHuman(ref){if(!ref)return '';return `${tr(ref.family==='row'?'rowLabel':'columnLabel')} ${Number(ref.id)+1}`}
function tangoFormat(key,vars={}){return String(tr(key)||key).replace(/\{([A-Za-z0-9_]+)\}/g,(_,k)=>vars[k]??'')}
function tangoValueHuman(v){return pieceName('tango',Number(v))}
function tangoRelationHuman(p){return tr(Number(p)===0?'tlgSame':'tlgOpposite')}
function tangoRuleHumanTitle(d){let k=d?.rule==='RELATION_PROPAGATION'?'tlgRelationPropagation':d?.rule==='TRIPLE_CONSTRAINT'?'tlgTriple':d?.rule==='BALANCE_QUOTA'?'tlgBalanceQuota':d?.rule==='BALANCE_RELATION'?'tlgBalanceRelation':d?.rule==='RELATION_BALANCE'?'tlgRelationBalance':d?.rule==='RELATION_BALANCE_COMPONENT'?'tlgRelationComponent':d?.rule==='LINE_DOMAIN_SUPPORT'?'tlgDomain':d?.rule==='ASSUMPTION_CONTRADICTION'?'tlgContradiction':d?.rule==='COMMON_CONSEQUENCE'?'tlgCommon':null;return k?tr(k):tr('logicalDeduction')}
function tangoLegacyTechniqueForDeduction(d){if(!d)return null;if(d.rule==='TRIPLE_CONSTRAINT')return 'T_NO_THREE';if(d.rule==='BALANCE_QUOTA')return d.explanationData?.family==='column'?'T_BALANCE_COLUMN':'T_BALANCE_ROW';if(d.rule==='RELATION_PROPAGATION'){let p=d.explanationData?.parity;return p===0?'T_RELATION_EQUAL':'T_RELATION_OPPOSITE'}if(d.rule==='ASSUMPTION_CONTRADICTION')return 'T_CONTRADICTION_R2';return null}
function tangoDeductionConclusionText(d){let parts=[];for(const c of d?.conclusions||[]){if(c.type==='VALUE')parts.push(`${cellName(...c.cell)} = ${tangoValueHuman(c.value)}`);else parts.push(`${cellName(...c.a)} ↔ ${cellName(...c.b)} : ${tangoRelationHuman(c.parity)}`)}return parts.join(' · ')}
function tangoContradictionReason(w){if(!DETAILED_HINT_LANGS.has(lang()))return tr('contradictionFound');let k=w?.kind==='TRIPLE_OVERFLOW'?'tlgContrTriple':w?.kind==='BALANCE_OVERFLOW'?'tlgContrOverflow':w?.kind==='BALANCE_DEFICIT'?'tlgContrDeficit':w?.kind==='RELATION_CONFLICT'?'tlgContrRelation':w?.kind==='VALUE_CONFLICT'?'tlgContrValue':'tlgContrNoDomain';return tr(k)}
function tangoDeductionOrientation(d){let x=d?.explanationData||{},unit=d?.focusUnits?.[0];if(!DETAILED_HINT_LANGS.has(lang())){let cells=[...(d?.focusCells||[])];for(const r of d?.focusRelations||[])cells.push(r.a,r.b);let seen=new Set(),names=[];for(const c of cells){let k=c.join(',');if(!seen.has(k)){seen.add(k);names.push(cellName(...c))}}return `${tr('visibleOnly')}${names.length?' '+names.join(' · '):''}`;}if(d.rule==='RELATION_PROPAGATION')return tangoFormat('tlgOrientProp',{source:cellName(...x.source),target:cellName(...x.target)});if(d.rule==='TRIPLE_CONSTRAINT')return tangoFormat('tlgOrientTriple',{unit:tangoUnitHuman(unit)});if(d.rule==='BALANCE_QUOTA')return tangoFormat('tlgOrientQuota',{unit:tangoUnitHuman(unit)});if(d.rule==='BALANCE_RELATION')return tangoFormat('tlgOrientBalanceRelation',{unit:tangoUnitHuman(unit)});if(d.rule==='RELATION_BALANCE')return tangoFormat('tlgOrientRelationBalance',{unit:tangoUnitHuman(unit)||tangoUnitHuman({family:x.family,id:x.id})});if(d.rule==='RELATION_BALANCE_COMPONENT')return tr('tlgOrientComponent');if(d.rule==='LINE_DOMAIN_SUPPORT')return tangoFormat('tlgOrientDomain',{unit:tangoUnitHuman(unit)});if(d.rule==='ASSUMPTION_CONTRADICTION')return tangoFormat('tlgOrientContradiction',{cell:cellName(...x.assumption.cell)});if(d.rule==='COMMON_CONSEQUENCE')return tangoFormat('tlgOrientCommon',{cell:cellName(...x.branchCell)});return tr('visibleOnly')}
function tangoDeductionExplanation(d){let x=d?.explanationData||{},conclusion=tangoDeductionConclusionText(d),unit=tangoUnitHuman(d?.focusUnits?.[0]);if(!DETAILED_HINT_LANGS.has(lang())){let v=(d?.conclusions||[]).find(c=>c.type==='VALUE');if(v){let g=genericLocalizedHint('tango',v.cell,d.rank,v.value);return `${tangoRuleHumanTitle(d)}. ${g.why} ${g.move}`}let rel=(d?.conclusions||[]).find(c=>c.type==='RELATION');return rel?`${tangoRuleHumanTitle(d)}. ${cellName(...rel.a)} ↔ ${cellName(...rel.b)} : ${tangoRelationHuman(rel.parity)}.`:tangoRuleHumanTitle(d);}if(d.rule==='RELATION_PROPAGATION')return tangoFormat('tlgExplainProp',{source:cellName(...x.source),target:cellName(...x.target),sourceValue:tangoValueHuman(x.sourceValue),targetValue:tangoValueHuman(d.conclusions[0].value),relation:tangoRelationHuman(x.parity)});if(d.rule==='TRIPLE_CONSTRAINT'){if(x.mode==='RELATION')return tangoFormat('tlgExplainTripleRelation',{conclusion});let pair=d.premises?.filter(p=>p.kind==='VALUE')||[],v=pair[0]?.value??x.value,target=d.conclusions?.[0]?.cell;return tangoFormat('tlgExplainTripleValue',{unit,value:tangoValueHuman(v),target:cellName(...target),opposite:tangoValueHuman(1-v)})}if(d.rule==='BALANCE_QUOTA')return tangoFormat('tlgExplainQuota',{unit,quota:x.quota,conclusion});if(d.rule==='BALANCE_RELATION')return tangoFormat('tlgExplainBalanceRelation',{unit});if(d.rule==='RELATION_BALANCE')return tangoFormat('tlgExplainRelationBalance',{unit:unit||tangoUnitHuman({family:x.family,id:x.id}),conclusion});if(d.rule==='RELATION_BALANCE_COMPONENT')return tangoFormat('tlgExplainComponent',{reason:tangoContradictionReason(x.rejected),conclusion});if(d.rule==='LINE_DOMAIN_SUPPORT')return tangoFormat('tlgExplainDomain',{unit,count:x.domainCount,conclusion});if(d.rule==='ASSUMPTION_CONTRADICTION')return tangoFormat('tlgExplainContradiction',{assumed:tangoValueHuman(x.assumption.value),cell:cellName(...x.assumption.cell),reason:tangoContradictionReason(x.witness),conclusion});if(d.rule==='COMMON_CONSEQUENCE')return tangoFormat('tlgExplainCommon',{cell:cellName(...x.branchCell),conclusion});return conclusion}
function tangoDeductionReasoning(d,automatic=[]){return {schema:2,source:'tango-inference-engine',game:'tango',id:d.id||null,signature:d.signature||null,rule:d.rule,ruleCost:d.ruleCost,technique:tangoLegacyTechniqueForDeduction(d),rank:d.rank,techniqueLevel:d.techniqueLevel,premises:JSON.parse(JSON.stringify(d.premises||[])),dependencies:[...(d.dependencies||[])],focusCells:(d.focusCells||[]).map(x=>[...x]),focusRelations:JSON.parse(JSON.stringify(d.focusRelations||[])),focusUnits:JSON.parse(JSON.stringify(d.focusUnits||[])),conclusions:JSON.parse(JSON.stringify(d.conclusions||[])),automatic:JSON.parse(JSON.stringify(automatic||[])),explanationData:JSON.parse(JSON.stringify(d.explanationData||{}))}}
function tangoFocusDeduction(d,reveal=false){clearHintFocus();let board=$('#tboard')||document.querySelector('.board');if(!board||!current||!d)return;let cells=[...(d.focusCells||[])];for(const r of d.focusRelations||[])cells.push(r.a,r.b);if(reveal)for(const c of d.conclusions||[])cells.push(...(c.type==='VALUE'?[c.cell]:[c.a,c.b]));let seen=new Set();for(const cell of cells){let k=cell.join(',');if(seen.has(k))continue;seen.add(k);let el=board.children[cell[0]*(current.n||6)+cell[1]];if(el)el.classList.add(reveal&&(d.conclusions||[]).some(c=>c.type==='VALUE'?c.cell[0]===cell[0]&&c.cell[1]===cell[1]:(c.a[0]===cell[0]&&c.a[1]===cell[1])||(c.b[0]===cell[0]&&c.b[1]===cell[1]))?'hint-focus':'hint-context')}}
function tangoApplyDeductionToCurrent(d){if(!d||!current||current.game!=='tango')return null;let engine=tangoLogicSession(),applied=engine.applyDeduction(d);if(!applied?.deduction)return null;current.state=cloneGrid(engine.state);current.tangoDerivedRelations=engine.exportDerivedRelations();return applied}
function tangoCurrentLogicResult(){let engine=tangoLogicSession(),result=engine.nextDeduction();return {...result,engine}}
function tangoLogicContradictionText(w){if(!w)return '';let unit=w.family!=null?tangoUnitHuman({family:w.family,id:w.id}):'';return `${unit?unit+' : ':''}${tangoContradictionReason(w)}.`}
function tangoCoachHandleDeduction(d){let boardKey=historySnapshotKey(),sig=d.signature||d.id,flow=current.hintFlow,isSame=flow?.kind==='tango-proof'&&flow.boardKey===boardKey&&flow.signature===sig;if(!isSame){current.hintFlow={kind:'tango-proof',boardKey,signature:sig,stage:1,deduction:JSON.parse(JSON.stringify(d))};coachUsage(1,tangoLegacyTechniqueForDeduction(d));tangoFocusDeduction(d,false);showHintNotice(`<span class="coach-progress">1/2</span><b>${tr('where')} :</b> ${tangoDeductionOrientation(d)}`);saveCurrent();return}let proof=flow.deduction||d,before=historySnapshotKey();coachUsage(2,tangoLegacyTechniqueForDeduction(proof));coachUsage(3,tangoLegacyTechniqueForDeduction(proof));markHintUsed();updateScoreFlags();tangoFocusDeduction(proof,true);let application=tangoApplyDeductionToCurrent(proof);if(!application){current.hintFlow=null;showHintNotice(tr('hintError'));return}drawT();historyRecord({type:'COACH_APPLY',reasoning:tangoDeductionReasoning(application.deduction,application.automatic),coachStage:2,coachFlowVersion:3},before);current.hintFlow=null;showHintNotice(`<span class="coach-progress">2/2</span><b>${tangoRuleHumanTitle(proof)}</b><br>${tangoDeductionExplanation(proof)}`);maybeAutoFinish();saveCurrent();haptic(12)}

// ===== v2.21.12 — Rectangles explicit proof engine adapter =====
function patchesLogicAvailable(){return typeof globalThis!=='undefined'&&globalThis.PatchesLogic&&typeof globalThis.PatchesLogic.createSession==='function'}
function patchEmptyEvidence(){return {schema:1,owners:[],notOwners:[],selected:[],eliminated:[]}}
function patchesLogicSession(c=current,paint=null,selectedRects=null,logicEvidence=null){if(!patchesLogicAvailable()||!c||c.game!=='patches')throw new Error('Rectangles logic engine unavailable');return PatchesLogic.createSession({n:c.n,ids:[...(c.ids||[])],clues:JSON.parse(JSON.stringify(c.clues||{})),paint:cloneGrid(paint||c.paint),selectedRects:JSON.parse(JSON.stringify(selectedRects||c.patchSelectedRects||{})),logicEvidence:JSON.parse(JSON.stringify(logicEvidence||c.patchLogicEvidence||patchEmptyEvidence()))})}
function patchFormat(k,vars={}){return String(tr(k)).replace(/\{(\w+)\}/g,(_,x)=>vars[x]??'')}
function patchZoneName(id){return `${tr('zone')} ${Number(id)+1}`}
function patchZonesName(ids){return (ids||[]).map(patchZoneName).join(lang()==='fr'?' et ':' and ')}
function patchLegacyTechniqueForDeduction(d){if(!d)return null;if(d.rule==='CLUE_SINGLETON'||d.rule==='CELL_SINGLETON'||d.rule==='AREA_COMPLETION')return 'P_SINGLE_RECTANGLE';if(d.rule==='COMMON_COVERAGE'||d.rule==='CELL_LOCKED_TO_CLUE'||d.rule==='RECTANGULAR_CLOSURE')return 'P_MANDATORY_CELL';if(d.rule==='COVERAGE_LOCKED_SET'||d.rule==='NO_SUPPORT_CLUE'||d.rule==='NO_SUPPORT_CELL'||d.rule==='LOCAL_DOMAIN_SUPPORT')return 'P_CONTRADICTION_R1';if(d.rule==='ASSUMPTION_CONTRADICTION'||d.rule==='COMMON_CONSEQUENCE')return 'P_CONTRADICTION_R2';return null}
function patchLegacyHintFromEngine(expectedTechnique=null){if(!current||current.game!=='patches'||!patchesLogicAvailable())return null;let engine,result;try{engine=patchesLogicSession();result=engine.nextDeduction()}catch(_){return null}let d=result?.deduction;if(!d)return null;let technique=patchLegacyTechniqueForDeduction(d);if(!technique||(expectedTechnique&&technique!==expectedTechnique))return null;let owner=(d.conclusions||[]).find(c=>c.type==='OWNER'&&current.paint?.[c.cell?.[0]]?.[c.cell?.[1]]!==c.clue),selected=(d.conclusions||[]).find(c=>c.type==='SELECTED_RECT'),cell=owner?.cell,id=owner?.clue;if(!cell&&selected){id=selected.clue;let cells=selected.rectangle?.cells||PatchesLogic.helpers.rectCells(selected.rectangle||{});cell=cells.find(x=>current.paint?.[x[0]]?.[x[1]]!==id)||cells[0]}if(!cell)return null;return {r:cell[0],c:cell[1],id,rank:d.rank,technique,why:patchDeductionExplanation(d),structuredDeduction:JSON.parse(JSON.stringify(d)),reasoning:patchDeductionReasoning(d)}}
function patchRuleHumanTitle(d){if(!d)return tr('logic');if(!DETAILED_HINT_LANGS.has(lang()))return `${tr('logic')} · T${d.techniqueLevel??0}`;let k={CLUE_SINGLETON:'plClueSingleton',CELL_SINGLETON:'plCellSingleton',RECTANGULAR_CLOSURE:'plRectClosure',AREA_COMPLETION:'plAreaCompletion',COMMON_COVERAGE:'plCommonCoverage',CELL_LOCKED_TO_CLUE:'plCellLocked',COVERAGE_LOCKED_SET:'plLockedSet',NO_SUPPORT_CLUE:'plNoSupportClue',NO_SUPPORT_CELL:'plNoSupportCell',LOCAL_DOMAIN_SUPPORT:'plLocalDomain',ASSUMPTION_CONTRADICTION:'plContradiction',COMMON_CONSEQUENCE:'plCommonConsequence'}[d.rule];return k?tr(k):d.rule}
function patchRectHuman(r){if(!r)return '';let h=r.r1-r.r0+1,w=r.c1-r.c0+1;return `${h}×${w} · ${cellName(r.r0,r.c0)}–${cellName(r.r1,r.c1)}`}
function patchDeductionConclusionText(d){let out=[];for(const c of d?.conclusions||[]){if(c.type==='OWNER')out.push(`${cellName(...c.cell)} → ${patchZoneName(c.clue)}`);else if(c.type==='SELECTED_RECT')out.push(`${patchZoneName(c.clue)} → ${patchRectHuman(c.rectangle)}`);else if(c.type==='ELIMINATED_CANDIDATE')out.push(`${patchZoneName(c.clue)} · ${tr('plEliminated')}`);else if(c.type==='NOT_OWNER')out.push(`${cellName(...c.cell)} ≠ ${patchZoneName(c.clue)}`)}return out.join(' · ')}
function patchDeductionPrimaryCell(d){let c=(d?.conclusions||[]).find(x=>x.type==='OWNER');if(c)return c.cell.slice();c=(d?.conclusions||[]).find(x=>x.type==='SELECTED_RECT');if(c)return (c.rectangle.cells?.[0]||[c.rectangle.r0,c.rectangle.c0]).slice();return d?.focusCells?.[0]?.slice?.()||null}
function patchContradictionReason(w){if(!DETAILED_HINT_LANGS.has(lang()))return tr('contradictionFound');let k={NO_CANDIDATE_FOR_CLUE:'plContrNoCandidate',NO_COVER_FOR_CELL:'plContrNoCover',SELECTED_OVERLAP:'plContrOverlap',OWNER_CONFLICT:'plContrOwner',OTHER_CLUE_INSIDE:'patchTwo',AREA_OVERFLOW:'plContrArea',WRONG_AREA:'patchSize',WRONG_SHAPE:'patchShape',SHAPE_IMPOSSIBLE:'plContrShape',COVERAGE_DEFICIT:'plContrCapacity',NO_LOCAL_COMPLETION:'plContrLocal'}[w?.kind]||'plContrNoCandidate';return tr(k)}
function patchDeductionOrientation(d){let x=d?.explanationData||{},cell=(x.cell||x.unsupportedCell||d?.focusCells?.[0]);if(!DETAILED_HINT_LANGS.has(lang()))return `${tr('visibleOnly')}${cell?' '+cellName(...cell):''}`;if(d.rule==='CLUE_SINGLETON'||d.rule==='AREA_COMPLETION'||d.rule==='RECTANGULAR_CLOSURE')return patchFormat('plOrientClue',{zone:patchZoneName(d.focusClues?.[0])});if(d.rule==='CELL_SINGLETON')return patchFormat('plOrientCell',{cell:cellName(...(x.cell||d.focusCells[0]))});if(d.rule==='COMMON_COVERAGE')return patchFormat('plOrientCommon',{zone:patchZoneName(d.focusClues?.[0])});if(d.rule==='CELL_LOCKED_TO_CLUE')return patchFormat('plOrientLocked',{cell:cellName(...x.cell)});if(d.rule==='COVERAGE_LOCKED_SET')return patchFormat('plOrientSet',{zones:patchZonesName(x.group)});if(d.rule==='NO_SUPPORT_CLUE')return patchFormat('plOrientNoSupportClue',{zone:patchZoneName(x.clue),other:patchZoneName(x.blockedClue)});if(d.rule==='NO_SUPPORT_CELL')return patchFormat('plOrientNoSupportCell',{zone:patchZoneName(x.clue),cell:cellName(...x.unsupportedCell)});if(d.rule==='LOCAL_DOMAIN_SUPPORT')return patchFormat('plOrientLocal',{zones:patchZonesName(x.group)});if(d.rule==='ASSUMPTION_CONTRADICTION')return patchFormat('plOrientContradiction',{zone:patchZoneName(x.assumption?.clue)});if(d.rule==='COMMON_CONSEQUENCE')return patchFormat('plOrientCommonConsequence',{zone:patchZoneName(x.branchClue)});return tr('visibleOnly')}
function patchDeductionExplanation(d){let x=d?.explanationData||{},conclusion=patchDeductionConclusionText(d),zone=patchZoneName(d?.focusClues?.[0]);if(!DETAILED_HINT_LANGS.has(lang())){let cell=patchDeductionPrimaryCell(d),g=cell?genericLocalizedHint('patches',cell,d.rank,d.focusClues?.[0]):{why:tr('directReason'),move:conclusion};return `${patchRuleHumanTitle(d)}. ${g.why} ${conclusion||g.move||''}`}
  if(d.rule==='CLUE_SINGLETON'){let base=patchFormat('plExplainClueSingleton',{zone,conclusion});if(x.constraints?.area&&x.areaDimensions?.length){let fmt=a=>a.map(z=>z[0]+'×'+z[1]).join(', '),kept=x.shapeDimensions?.length?fmt(x.shapeDimensions):fmt(x.areaDimensions);return patchFormat('plGeometry',{area:x.constraints.area,all:fmt(x.areaDimensions),kept})+' '+base}return base;}if(d.rule==='CELL_SINGLETON')return patchFormat('plExplainCellSingleton',{conclusion});if(d.rule==='RECTANGULAR_CLOSURE')return patchFormat('plExplainRectClosure',{zone,conclusion});if(d.rule==='AREA_COMPLETION')return patchFormat('plExplainAreaCompletion',{zone,area:x.area,conclusion});if(d.rule==='COMMON_COVERAGE')return patchFormat('plExplainCommon',{zone,conclusion});if(d.rule==='CELL_LOCKED_TO_CLUE')return patchFormat('plExplainLocked',{cell:cellName(...x.cell),zone:patchZoneName(x.clue),conclusion});if(d.rule==='COVERAGE_LOCKED_SET')return patchFormat('plExplainSet',{required:x.requiredMinimum,available:x.unionSize,conclusion});if(d.rule==='NO_SUPPORT_CLUE')return patchFormat('plExplainNoSupportClue',{zone:patchZoneName(x.clue),other:patchZoneName(x.blockedClue),conclusion});if(d.rule==='NO_SUPPORT_CELL')return patchFormat('plExplainNoSupportCell',{zone:patchZoneName(x.clue),cell:cellName(...x.unsupportedCell),conclusion});if(d.rule==='LOCAL_DOMAIN_SUPPORT')return patchFormat('plExplainLocal',{conclusion});if(d.rule==='ASSUMPTION_CONTRADICTION')return patchFormat('plExplainContradiction',{zone:patchZoneName(x.assumption?.clue),reason:patchContradictionReason(x.witness),conclusion});if(d.rule==='COMMON_CONSEQUENCE')return patchFormat('plExplainCommonConsequence',{zone:patchZoneName(x.branchClue),conclusion});return conclusion}
function patchDeductionReasoning(d,automatic=[]){return {schema:2,source:'patches-inference-engine',game:'patches',id:d.id||null,signature:d.signature||null,rule:d.rule,ruleCost:d.ruleCost,technique:patchLegacyTechniqueForDeduction(d),rank:d.rank,techniqueLevel:d.techniqueLevel,premises:JSON.parse(JSON.stringify(d.premises||[])),dependencies:[...(d.dependencies||[])],focusCells:(d.focusCells||[]).map(x=>[...x]),focusClues:[...(d.focusClues||[])],focusRectangles:JSON.parse(JSON.stringify(d.focusRectangles||[])),conclusions:JSON.parse(JSON.stringify(d.conclusions||[])),automatic:JSON.parse(JSON.stringify(automatic||[])),explanationData:JSON.parse(JSON.stringify(d.explanationData||{}))}}
function patchFocusDeduction(d,reveal=false){clearHintFocus();let board=$('#pboard')||document.querySelector('.board');if(!board||!current||!d)return;let focus=[...(d.focusCells||[])],targets=[];for(const c of d.conclusions||[]){if(c.type==='OWNER')targets.push(c.cell);else if(c.type==='SELECTED_RECT')targets.push(...(c.rectangle.cells||[]));else if(c.type==='ELIMINATED_CANDIDATE'){let rr=(d.focusRectangles||[]).find(x=>(x.key||PatchesLogic.helpers.rectKey(x))===c.rectangleKey);if(rr)targets.push(...(rr.cells||PatchesLogic.helpers.rectCells(rr)))}}let targetKeys=new Set(targets.map(x=>x.join(','))),seen=new Set();for(const cell of focus.concat(reveal?targets:[])){let k=cell.join(',');if(seen.has(k))continue;seen.add(k);let el=board.children[cell[0]*current.n+cell[1]];if(el)el.classList.add(reveal&&targetKeys.has(k)?'hint-focus':'hint-context')}}
function patchSyncEngineToVisible(c,engine){c.patchLogicEvidence=engine.exportEvidence();c.patchSelectedRects=c.patchSelectedRects||{};for(const f of c.patchLogicEvidence.owners||[])c.paint[f.cell[0]][f.cell[1]]=f.clue;for(const f of c.patchLogicEvidence.selected||[]){let cand=engine.candidate(Number(f.clue),f.rectangleKey);if(!cand)continue;c.patchSelectedRects[f.clue]={r0:cand.r0,r1:cand.r1,c0:cand.c0,c1:cand.c1};for(const [r,col] of cand.cells)c.paint[r][col]=Number(f.clue)}}
function patchSyncEngineEvidence(c,engine){c.patchLogicEvidence=engine.exportEvidence()}
function patchApplyDeductionToState(c,d,engine=null){engine=engine||patchesLogicSession(c);let applied=engine.applyDeduction(d);if(!applied?.deduction)return null;patchSyncEngineToVisible(c,engine);return {...applied,engine}}
function patchApplyDeductionToCurrent(d){if(!current||current.game!=='patches')return null;return patchApplyDeductionToState(current,d)}
function patchCurrentLogicResult(){let engine=patchesLogicSession(),result=engine.nextDeduction();return {...result,engine}}
function patchLogicContradictionText(w){if(!w)return '';let prefix=w.clue!=null?`${patchZoneName(w.clue)} : `:'';return `${prefix}${patchContradictionReason(w)}.`}
function patchCoachHandleDeduction(d){let boardKey=historySnapshotKey(),sig=d.signature||d.id,flow=current.hintFlow,isSame=flow?.kind==='patches-proof'&&flow.boardKey===boardKey&&flow.signature===sig;if(!isSame){current.hintFlow={kind:'patches-proof',boardKey,signature:sig,stage:1,deduction:JSON.parse(JSON.stringify(d))};coachUsage(1,patchLegacyTechniqueForDeduction(d));patchFocusDeduction(d,false);showHintNotice(`<span class="coach-progress">1/2</span><b>${tr('where')} :</b> ${patchDeductionOrientation(d)}`);saveCurrent();return}let proof=flow.deduction||d,before=historySnapshotKey();coachUsage(2,patchLegacyTechniqueForDeduction(proof));coachUsage(3,patchLegacyTechniqueForDeduction(proof));markHintUsed();updateScoreFlags();patchFocusDeduction(proof,true);let application=patchApplyDeductionToCurrent(proof);if(!application){current.hintFlow=null;showHintNotice(tr('hintError'));return}drawP();historyRecord({type:'COACH_APPLY',reasoning:patchDeductionReasoning(application.deduction,application.automatic),coachStage:2,coachFlowVersion:4},before);current.hintFlow=null;showHintNotice(`<span class="coach-progress">2/2</span><b>${patchRuleHumanTitle(proof)}</b><br>${patchDeductionExplanation(proof)}`);maybeAutoFinish();saveCurrent();haptic(12)}

function cloneGrid(x){return Array.isArray(x)?x.map(r=>Array.isArray(r)?[...r]:r):x}
function puzzleSnapshot(){
  if(!current)return null;
  if(current.game==='queens')return {game:'queens',state:cloneGrid(current.state)};
  if(current.game==='tango')return {game:'tango',state:cloneGrid(current.state),tangoPendingCell:current.tangoPendingCell?[...current.tangoPendingCell]:null,tangoDerivedRelations:JSON.parse(JSON.stringify(current.tangoDerivedRelations||[]))};
  if(current.game==='sudoku')return {game:'sudoku',state:cloneGrid(current.state)};
  if(current.game==='patches')return {game:'patches',paint:cloneGrid(current.paint),patchSelectedRects:JSON.parse(JSON.stringify(current.patchSelectedRects||{})),patchLogicEvidence:JSON.parse(JSON.stringify(current.patchLogicEvidence||patchEmptyEvidence()))};
  return {game:current.game}
}
function historySnapshotKey(s=puzzleSnapshot()){return JSON.stringify(s)}
function historyInit(force=false){
  if(!current)return null;
  let h=current.moveHistory;
  if(!force&&h&&h.schema===1&&h.nodes&&h.cursor&&h.nodes[h.cursor])return h;
  let root={id:'h0',parent:null,children:[],preferred:null,action:{type:'START',game:current.game,at:Date.now()},snapshot:puzzleSnapshot()};
  current.moveHistory={schema:1,nextId:1,cursor:'h0',nodes:{h0:root},stats:{undos:0,redos:0,branches:0}};
  return current.moveHistory
}
function historyNode(){let h=current?.moveHistory;return h?.nodes?.[h.cursor]||null}
function historyCanUndo(){let n=historyNode();return !!(current&&!current.completed&&n?.parent&&current.moveHistory.nodes[n.parent])}
function historyRedoTarget(){
  let h=current?.moveHistory,n=h?.nodes?.[h.cursor];if(!n||!n.children?.length)return null;
  let id=n.preferred&&n.children.includes(n.preferred)?n.preferred:n.children[n.children.length-1];
  return h.nodes[id]||null
}
function historyCanRedo(){return !!(current&&!current.completed&&historyRedoTarget())}

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
function auditNeutralValue(game){return game==='queens'?0:game==='tango'?-1:game==='sudoku'?0:null}
function auditConstructiveChange(action){
  let ch=auditPrimaryChange(action),neutral=auditNeutralValue(current?.game);
  if(!ch||ch.from!==neutral)return null;
  if(current.game==='queens'&&![1,2].includes(ch.to))return null;
  if(current.game==='tango'&&![0,1].includes(ch.to))return null;
  if(current.game==='sudoku'&&!(ch.to>=1&&ch.to<=6))return null;
  if(current.game==='patches'&&ch.to==null)return null;
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
  return {schema:1,status,source:'visible-state',technique,rank,target,detail,at:Date.now()}
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
  if(Date.now()>=deadline)return proofResult('unknown',null,null,[r,c],'timeout');
  let opp2=withTempCurrent(x=>{x.state[r][c]=opp},()=>queenBoundedContradiction(1,deadline));if(opp2?.timeout)return proofResult('unknown',null,null,[r,c],'timeout');
  let chosen2=withTempCurrent(x=>{x.state[r][c]=v},()=>queenBoundedContradiction(1,deadline));if(chosen2?.timeout)return proofResult('unknown',null,null,[r,c],'timeout');
  if(opp2?.bad&&!chosen2?.bad)return proofResult('justified','Q_CONTRADICTION_R2',2,[r,c],null);
  if(Date.now()>=deadline)return proofResult('unknown',null,null,[r,c],'timeout');
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
  let p=sudokuLogicSession().proveValue([r,c],v),d=p.deduction||null,reasoning=d?sudokuProofReasoning(p):null,detail={logicalStatus:p.status,reason:p.reason||null,provenValue:p.provenValue??null,fact:p.fact?JSON.parse(JSON.stringify(p.fact)):null,contradiction:p.contradiction?JSON.parse(JSON.stringify(p.contradiction)):null,deduction:reasoning,metrics:p.metrics?JSON.parse(JSON.stringify(p.metrics)):null};
  if(p.status==='proven'){let x=proofResult('justified',d?sudokuLegacyTechniqueForDeduction(d):null,d?sudokuCoachRankForDeduction(d):0,[r,c],detail);x.logicalStatus='proven';return x}
  let outer=p.status==='contradictory'?'unknown':'unjustified',x=proofResult(outer,d?sudokuLegacyTechniqueForDeduction(d):null,d?sudokuCoachRankForDeduction(d):null,[r,c],detail);x.logicalStatus=p.status;return x
}

function justifyPatchCellAt(r,c,id){
  if(!patchesLogicAvailable())return proofResult('unknown',null,null,[r,c],'engine-unavailable');
  let p=patchesLogicSession().proveOwner([r,c],Number(id));
  if(p.status==='proven'){let d=p.deduction||null,x=proofResult('justified',patchLegacyTechniqueForDeduction(d),d?.rank??p.fact?.rank??0,[r,c],{logicalStatus:'proven',deduction:d?patchDeductionReasoning(d):null});x.logicalStatus='proven';return x}
  let x=proofResult('unjustified',null,null,[r,c],{logicalStatus:p.status,contradiction:p.contradiction||null});x.logicalStatus=p.status;return x
}
function patchRectangleJustification(action){
  if(action.type!=='PATCH_RECTANGLE'||action.region==null||!action.rectangle)return null;
  if(!patchesLogicAvailable())return proofResult('unknown',null,null,null,'engine-unavailable');
  let id=Number(action.region),p=patchesLogicSession().proveRectangle(id,action.rectangle),target=PatchesLogic.helpers.rectCells(action.rectangle);
  if(p.status==='proven'){let d=p.deduction||null,x=proofResult('justified',patchLegacyTechniqueForDeduction(d),d?.rank??p.fact?.rank??0,target,{logicalStatus:'proven',deduction:d?patchDeductionReasoning(d):null});x.logicalStatus='proven';return x}
  let x=proofResult('unjustified',null,null,target,{logicalStatus:p.status,contradiction:p.contradiction||null});x.logicalStatus=p.status;return x
}
function firstKnownLogicalMoveFromSnapshot(beforeKey,deadline=Date.now()+250){
  return withAuditSnapshot(beforeKey,()=>{
    let h=null,g=current.game;
    if(g==='queens'){let q=queenLogicSession(),r=q.nextDeduction();return r.deduction?queenDeductionReasoning(r.deduction):null}
    else if(g==='tango'){let t=tangoLogicSession(),r=t.nextDeduction();return r.deduction?tangoDeductionReasoning(r.deduction):null}
    else if(g==='sudoku'){let step=sudokuLogicSession().nextValueStep();return step?.deduction?sudokuValueStepReasoning(step):null}
    else if(g==='patches'){let p=patchesLogicSession(),r=p.nextDeduction();return r.deduction?patchDeductionReasoning(r.deduction):null}
    return h&&!h.timeout?structuredReasoning(g,h):null
  })
}
function evaluateMoveJustification(beforeKey,action,error=null){
  if(!current||current.training||error||!action||['COACH_APPLY','AUTO_CROSS_ENABLE','PATCH_REMOVE','LEARNING_GUIDED'].includes(action.type))return null;
  if(current.game==='patches'&&action.type==='PATCH_RECTANGLE')return withAuditSnapshot(beforeKey,()=>patchRectangleJustification(action));
  let ch=auditConstructiveChange(action);if(!ch)return null;let deadline=Date.now()+350;
  let result=withAuditSnapshot(beforeKey,()=>{
    if(current.game==='queens'){
      let q=queenLogicSession(),p=q.proveAction([ch.row,ch.column],ch.to);
      if(p.status==='proven'){let d=p.deduction,t=queenLegacyTechniqueForDeduction(d),x=proofResult('justified',t,d.rank,[ch.row,ch.column],{logicalStatus:'proven',deduction:queenDeductionReasoning(d)});x.logicalStatus='proven';return x}
      let x=proofResult('unjustified',null,null,[ch.row,ch.column],{logicalStatus:p.status,contradiction:p.contradiction||null});x.logicalStatus=p.status;return x
    }
    if(current.game==='tango'){let t=tangoLogicSession(),p=t.proveAction([ch.row,ch.column],ch.to);if(p.status==='proven'){let d=p.deduction,x=proofResult('justified',tangoLegacyTechniqueForDeduction(d),d?.rank??0,[ch.row,ch.column],{logicalStatus:'proven',deduction:d?tangoDeductionReasoning(d):null});x.logicalStatus='proven';return x}let x=proofResult('unjustified',null,null,[ch.row,ch.column],{logicalStatus:p.status,contradiction:p.contradiction||null});x.logicalStatus=p.status;return x}
    if(current.game==='sudoku')return justifySudokuAt(ch.row,ch.column,ch.to);
    if(current.game==='patches')return justifyPatchCellAt(ch.row,ch.column,ch.to);
    return null
  });
  if(result?.status==='unjustified')result.knownMove=firstKnownLogicalMoveFromSnapshot(beforeKey,deadline);
  return result
}
function auditMoveText(reasoning){
  if(!reasoning?.target)return '';
  let r=reasoning.target.row,c=reasoning.target.column,v=reasoning.action?.value,g=reasoning.game;
  if(g==='queens')return `${pieceName('queens',v)} · ${cellName(r,c)}`;
  if(g==='tango')return `${pieceName('tango',v)} · ${cellName(r,c)}`;
  if(g==='sudoku')return `${v} · ${cellName(r,c)}`;
  if(g==='patches')return `${pieceName('patches',v)} · ${cellName(r,c)}`;
  return cellName(r,c)
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
  if(current.game==='patches'&&current.completed)return;
  if(!unjustifiedAlertsEnabled())return;
  let n=current.n||6;for(let [r,c] of unjustifiedCellsOnCurrentPath()){let d=board.children[r*n+c];if(d)d.classList.add('unjustified-piece')}
}
function refreshReasoningAudit(){
  let box=$('#reasoningAudit');if(box){box.hidden=true;box.innerHTML=''}
  applyUnjustifiedHighlights()
}
function acceptLastMoveAsHypothesis(){
  let h=current?.moveHistory,a=current?.lastMoveAudit;if(!h||!a?.historyNode)return false;let n=h.nodes[a.historyNode];if(!n?.justification||n.justification.status!=='unjustified')return false;if(current.game==='sudoku'&&n.justification.logicalStatus&&n.justification.logicalStatus!=='not-yet-proven')return false;
  n.justification.status='hypothesis';n.justification.acceptedAt=Date.now();let b=reasoningAuditBucket();b.hypotheses++;current.lastMoveAudit={...n.justification,historyNode:n.id,parentNode:n.parent};refreshReasoningAudit();saveCurrent();showToast(tr('hypothesisAccepted'));return true
}


// ===== v2.20.0 — visual Exploration mode on top of branching history =====
function explorationState(){
  if(!current)return null;
  let e=current.exploration;
  if(!e||typeof e!=='object')return null;
  return e
}
function historyNodeDepth(id){
  let h=current?.moveHistory,d=0,n=h?.nodes?.[id],guard=0;
  while(n?.parent&&guard++<10000){d++;n=h.nodes[n.parent]}return d
}
function historyIsDescendant(id,ancestor){
  let h=current?.moveHistory,n=h?.nodes?.[id],guard=0;
  while(n&&guard++<10000){if(n.id===ancestor)return true;n=n.parent?h.nodes[n.parent]:null}return false
}
function historyPathFrom(ancestor,id){
  if(!historyIsDescendant(id,ancestor))return [];
  let h=current.moveHistory,out=[],n=h.nodes[id],guard=0;
  while(n&&n.id!==ancestor&&guard++<10000){out.push(n.id);n=h.nodes[n.parent]}
  return out.reverse()
}
function historyActionShort(node){
  if(!node)return tr('branchStart');
  let a=node.action||{};if(a.type==='START')return tr('branchStart');let j=node.justification,e=node.error,ch=(a.changes||[])[0];
  if(e)return `⚠ ${errorRuleTitle(e)}`;
  if(ch){
    let cell=cellName(ch.row,ch.column),val=ch.to;
    if(a.game==='queens')return `${pieceName('queens',val)} · ${cell}`;
    if(a.game==='tango')return `${pieceName('tango',val)} · ${cell}`;
    if(a.game==='sudoku')return `${val} · ${cell}`;
    if(a.game==='patches')return `${pieceName('patches',val)} · ${cell}`;
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
  current.exploration={schema:1,active:true,branchPoint:cursor,startedAt:Date.now(),returns:0,analyses:0,kept:0};
  closeHintNotice();refreshExplorationPanel();saveCurrent();showToast(tr('testHypothesis'));return true
}
function closeExploration(){
  let e=explorationState();if(!e)return false;e.active=false;e.closedAt=Date.now();refreshExplorationPanel();saveCurrent();return true
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
  e.kept=(e.kept||0)+1;e.keptNode=h.cursor;e.active=false;e.closedAt=Date.now();refreshExplorationPanel();saveCurrent();showToast(tr('branchKept'));return true
}
function explorationContradiction(){
  let errors=currentVisibleErrors();if(errors.length)return {bad:true,kind:'rules',html:errors.map(e=>`<b>${errorRuleTitle(e)}</b><br>${errorDetailedMessage(e)}`).join('<hr>')};
  if(current.game==='queens'){
    if(queenStateContradiction())return {bad:true,kind:'logic',html:queenImmediateContradictionDetail()};
    let d=queenBoundedContradiction(2,Date.now()+700);if(d?.bad)return {bad:true,kind:'logic',html:d.reason||queenRank3BranchSummary(d)}
  }else if(current.game==='tango'){
    let t=tangoLogicSession(),w=t.diagnose();if(w)return {bad:true,kind:'logic',html:tangoLogicContradictionText(w)}
  }else if(current.game==='sudoku'){
    try{let session=sudokuLogicSession(),w=session.diagnose();if(w)return {bad:true,kind:'logic',html:sudokuContradictionText(w)};let step=session.nextValueStep();if(step.status==='contradiction'&&step.contradiction)return {bad:true,kind:'logic',html:sudokuContradictionText(step.contradiction)}}catch(_){return {bad:true,kind:'logic',html:tr('hintError')}}
  }else if(current.game==='patches'){
    try{let w=patchesLogicSession().diagnoseBasic();if(w)return {bad:true,kind:'logic',html:patchLogicContradictionText(w)}}catch(_){return {bad:true,kind:'logic',html:tr('hintError')}}
  }
  return {bad:false,kind:'none',html:tr('noContradiction')}
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
  if(!priorHypothesis&&node.justification?.status==='unjustified'&&!(current.game==='sudoku'&&node.justification.logicalStatus&&node.justification.logicalStatus!=='not-yet-proven')){
    node.justification.status='hypothesis';node.justification.acceptedAt=Date.now();node.justification.exploration=true;
    let b=reasoningAuditBucket();b.hypotheses++;current.lastMoveAudit={...node.justification,historyNode:node.id,parentNode:node.parent};showToast(tr('branchHypothesisAuto'))
  }
  refreshReasoningAudit();refreshExplorationPanel()
}

function historyChanges(beforeKey,after){
  if(!beforeKey||!after)return [];
  try{
    let before=JSON.parse(beforeKey),a=before.state||before.paint,b=after.state||after.paint;if(!Array.isArray(a)||!Array.isArray(b))return [];
    let out=[];for(let r=0;r<Math.min(a.length,b.length);r++)for(let c=0;c<Math.min(a[r]?.length||0,b[r]?.length||0);c++)if(a[r][c]!==b[r][c])out.push({row:r,column:c,from:a[r][c],to:b[r][c]});
    return out
  }catch(_){return []}
}
function normalizeHistoryAction(action,beforeKey=null,after=null){
  let a=typeof action==='string'?{type:action}:(action&&typeof action==='object'?{...action}:{type:'MOVE'});
  a.type=a.type||'MOVE';a.game=current?.game||a.game||null;a.at=Date.now();a.changes=historyChanges(beforeKey,after);
  if(a.type==='MOVE'&&a.changes.length===1){
    let ch=a.changes[0];a.target={row:ch.row,column:ch.column};
    if(a.game==='tango')a.type='SET_SYMBOL';
    else if(a.game==='sudoku')a.type='SET_DIGIT';
    else if(a.game==='queens')a.type='SET_QUEEN_CELL';
    else if(a.game==='patches')a.type='SET_REGION_CELL'
  }
  return a
}
function historyRecord(action='MOVE',beforeKey=null){
  if(!current)return false;
  let h=historyInit(),snap=puzzleSnapshot(),key=historySnapshotKey(snap);
  if(beforeKey!=null&&beforeKey===key){updateHistoryButtons();return false}
  let parent=h.nodes[h.cursor];if(!parent)return false;
  let normalized=normalizeHistoryAction(action,beforeKey,snap);
  let existing=(parent.children||[]).map(id=>h.nodes[id]).find(n=>n&&historySnapshotKey(n.snapshot)===key);
  if(existing){
    parent.preferred=existing.id;h.cursor=existing.id;existing.action=normalized;
    let err=analyzeCurrentError(normalized);existing.error=err?{...err,historyNode:existing.id,parentNode:parent.id}:null;
    current.lastError=existing.error?{...existing.error}:null;if(existing.error)errorUsage('detected',existing.error.technique||null);
    let audit=evaluateMoveJustification(beforeKey,normalized,existing.error);applyAuditResult(existing,audit);explorationOnRecordedNode(existing);
    masteryRecognizePlayerMove(beforeKey,normalized,existing.error,audit);if(current.training&&!existing.error)trainingMoveCompleted(normalized);refreshErrorCoach();updateHistoryButtons();return true
  }
  let id=`h${h.nextId++}`,hadAlternative=(parent.children||[]).length>0;
  let node={id,parent:parent.id,children:[],preferred:null,action:normalized,snapshot:snap};
  let err=analyzeCurrentError(normalized);node.error=err?{...err,historyNode:id,parentNode:parent.id}:null;
  parent.children=parent.children||[];parent.children.push(id);parent.preferred=id;h.nodes[id]=node;h.cursor=id;
  current.lastError=node.error?{...node.error}:null;if(node.error)errorUsage('detected',node.error.technique||null);
  let audit=evaluateMoveJustification(beforeKey,normalized,node.error);applyAuditResult(node,audit);explorationOnRecordedNode(node);
  masteryRecognizePlayerMove(beforeKey,normalized,node.error,audit);if(current.training&&!node.error)trainingMoveCompleted(normalized);refreshErrorCoach();
  if(hadAlternative)h.stats.branches=(h.stats.branches||0)+1;
  updateHistoryButtons();return true
}
function restorePuzzleSnapshot(s){
  if(!current||!s||s.game!==current.game)return false;
  current.hintFlow=null;current.lastReasoning=null;current.lastError=null;current.lastMoveAudit=null;current.masteryPendingAid=null;clearHintFocus();clearErrorFocus();closeHintNotice();$('#victory')?.remove();
  if(s.game==='queens'){current.state=cloneGrid(s.state);drawQ()}
  else if(s.game==='tango'){current.state=cloneGrid(s.state);current.tangoPendingCell=s.tangoPendingCell?[...s.tangoPendingCell]:null;current.tangoDerivedRelations=JSON.parse(JSON.stringify(s.tangoDerivedRelations||[]));drawT()}
  else if(s.game==='sudoku'){current.state=cloneGrid(s.state);drawS()}
  else if(s.game==='patches'){current.paint=cloneGrid(s.paint);current.patchSelectedRects=JSON.parse(JSON.stringify(s.patchSelectedRects||{}));current.patchLogicEvidence=JSON.parse(JSON.stringify(s.patchLogicEvidence||patchEmptyEvidence()));drawP()}
  status('',true);updateScoreFlags();return true
}
function undoMoves(count=1){
  if(!current||current.completed||paused)return 0;
  let h=historyInit(),moved=0,countN=Math.max(1,Math.floor(Number(count)||1));
  while(moved<countN){
    let n=h.nodes[h.cursor];if(!n?.parent)break;
    let parent=h.nodes[n.parent];if(!parent)break;
    parent.preferred=n.id;h.cursor=parent.id;moved++
  }
  if(!moved){updateHistoryButtons();return 0}
  h.stats.undos=(h.stats.undos||0)+moved;markBacktrack();restorePuzzleSnapshot(h.nodes[h.cursor].snapshot);syncErrorFromHistory();syncReasoningAuditFromHistory();trainingSyncPath();updateHistoryButtons();refreshExplorationPanel();saveCurrent();haptic(7);return moved
}
function redoMoves(count=1){
  if(!current||current.completed||paused)return 0;
  let h=historyInit(),moved=0,countN=Math.max(1,Math.floor(Number(count)||1));
  while(moved<countN){
    let n=h.nodes[h.cursor];if(!n?.children?.length)break;
    let id=n.preferred&&n.children.includes(n.preferred)?n.preferred:n.children[n.children.length-1],next=h.nodes[id];if(!next)break;
    h.cursor=id;moved++
  }
  if(!moved){updateHistoryButtons();return 0}
  h.stats.redos=(h.stats.redos||0)+moved;restorePuzzleSnapshot(h.nodes[h.cursor].snapshot);syncErrorFromHistory();syncReasoningAuditFromHistory();trainingSyncPath();updateHistoryButtons();refreshExplorationPanel();saveCurrent();haptic(7);return moved
}
function updateHistoryButtons(){
  let u=$('#undoBtn'),r=$('#redoBtn');
  if(u)u.disabled=!current||current.completed||paused||!historyCanUndo();
  if(r)r.disabled=!current||current.completed||paused||!historyCanRedo()
}
function historySummary(){
  let h=current?.moveHistory;if(!h)return {nodes:0,branches:0,undos:0,redos:0};
  return {nodes:Object.keys(h.nodes||{}).length,branches:h.stats?.branches||0,undos:h.stats?.undos||0,redos:h.stats?.redos||0}
}
document.addEventListener('keydown',e=>{
  if(!(e.ctrlKey||e.metaKey)||String(e.key).toLowerCase()!=='z')return;
  if(!current||paused||current.completed)return;e.preventDefault();
  if(e.shiftKey)redoMoves(1);else undoMoves(1)
});

function plainCurrent(){if(!current)return null;let o={...current};for(let k of ['givens','empty'])if(o[k] instanceof Set)o[k]=[...o[k]];return o}
function saveCurrent(){if(!current||current.completed||current.trainingCompleted)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:VERSION,current:plainCurrent(),elapsed:timerSeconds(),paused,savedAt:Date.now()}))}catch(_){}}
function getSaved(){try{let x=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');return x&&x.current?x:null}catch(_){return null}}
function clearSaved(){try{localStorage.removeItem(SAVE_KEY)}catch(_){}}
$('#homeBtn').onclick=home;$('#themeBtn').onclick=cycleTheme;

function statsView(){
  if(current&&!current.completed)saveCurrent();stopTimer();timerEl.textContent='00:00';current=null;updateI18n();
  let {s,success,avg,streak}=statsSummary(),games=['queens','tango','sudoku','patches'];
  let rows=games.map(g=>{let bs=(g==='queens'?['easy','medium','hard','expert']:['easy','medium','hard']).map(d=>s.byGame?.[g]?.[d]).filter(Boolean),started=bs.reduce((a,b)=>a+(b.started||0),0),solved=bs.reduce((a,b)=>a+(b.solved||0),0),total=bs.reduce((a,b)=>a+(b.totalSeconds||0),0),best=bs.map(b=>b.best).filter(v=>v!=null);return `<div class="stat-game"><b>${gameLabel(g)}</b><span>${solved}/${started} ${tr('solved')}</span><span>${solved?fmt(Math.round(total/solved)):'—'} ${tr('average')}</span><span>${best.length?fmt(Math.min(...best)):'—'} ${tr('record')}</span></div>`}).join('');
  let hist=s.history.slice(0,20).map(x=>`<div class="history-row"><span><b>${gameLabel(x.game)}</b> · ${DIFF[x.diff]}</span><span>${x.outcome==='solved'?tr('solvedStatus'):x.outcome==='revealed'?tr('revealedStatus'):x.outcome==='abandoned'?tr('abandonedStatus'):tr('finishedStatus')} · ${fmt(x.seconds)}${x.score!=null?` · ${tr('score')} ${x.score}`:''} ${aidBadges(x,true)}</span><small>${new Date(x.ts).toLocaleDateString(dateLocale())}</small></div>`).join('')||`<p class="empty-state">${tr('none')}</p>`;
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
</section><button class="daily-card" id="dailyBtn"><span>◆</span><b>${tr('daily')}</b><small>${dailyHomeLine()}</small></button><button class="stats-card challenge-home-card" id="challengeBtn"><span>↗</span><b>${tr('challenge')}</b><small>${tr('challengeSub')}</small></button><button class="stats-card" id="statsBtn"><span>▥</span><b>${tr('stats')}</b><small>${tr('statsSub')}</small></button><button class="stats-card mastery-home-card" id="masteryBtn"><span>◎</span><b>${tr('mastery')}</b><small>${tr('masterySub')}</small></button><button class="stats-card learning-home-card" id="learnBtn"><span>◉</span><b>${tr('learn')}</b><small>${tr('learnSub')}</small></button><button class="stats-card training-home-card" id="trainingBtn"><span>◇</span><b>${tr('training')}</b><small>${tr('trainingSub')}</small></button><button class="settings-card" id="settingsBtn"><span>⚙︎</span><b>${tr('prefs')}</b><small>${tr('prefsSub')}</small></button><button class="settings-card" id="aboutBtn"><span>ⓘ</span><b>${tr('about')}</b><small>${tr('aboutSub')}</small></button><div class="footer-note">QUADLUD v${VERSION} · © 2026 Serge Benoliel</div>`;
if(saved)$('#resumeBtn').onclick=resumeSaved;$('#dailyBtn').onclick=dailyView;$('#challengeBtn').onclick=()=>challengeView();$('#statsBtn').onclick=statsView;$('#masteryBtn').onclick=masteryView;$('#learnBtn').onclick=learningView;$('#trainingBtn').onclick=trainingView;$('#settingsBtn').onclick=settingsView;$('#aboutBtn').onclick=aboutView;app.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>launch(b.dataset.g,'easy'));app.querySelectorAll('button').forEach(pressFeedback)}
function gameLabel(g){return {queens:tr('gameQueens'),tango:tr('gameTango'),sudoku:tr('gameSudoku'),patches:tr('gamePatches')}[g]||g}

// ===== v2.21.4 — non-destructive logical walkthrough =====
let walkthroughSession=null;
function walkthroughRootSnapshot(){
  let h=current?.moveHistory,root=h?.nodes?.h0?.snapshot;
  return root?JSON.parse(JSON.stringify(root)):puzzleSnapshot()
}
function walkthroughVisibleClone(c,root){
  if(!c||!root)return null;
  if(c.game==='queens')return {game:'queens',diff:c.diff,n:c.n,reg:cloneGrid(c.reg),state:cloneGrid(root.state||c.state),completed:false};
  if(c.game==='tango')return {game:'tango',diff:c.diff,n:6,state:cloneGrid(root.state||c.state),givens:new Set(c.givens||[]),edges:(c.edges||[]).map(x=>[...x]),tangoDerivedRelations:JSON.parse(JSON.stringify(root.tangoDerivedRelations||[])),tangoPendingCell:null,completed:false};
  if(c.game==='sudoku')return {game:'sudoku',diff:c.diff,n:6,state:cloneGrid(root.state||c.state),empty:new Set(c.empty||[]),sel:null,completed:false};
  if(c.game==='patches')return {game:'patches',diff:c.diff,n:c.n,ids:[...(c.ids||[])],clues:JSON.parse(JSON.stringify(c.clues||{})),pal:[...(c.pal||[])],paint:cloneGrid(root.paint||c.paint),patchSelectedRects:JSON.parse(JSON.stringify(root.patchSelectedRects||{})),patchLogicEvidence:JSON.parse(JSON.stringify(root.patchLogicEvidence||patchEmptyEvidence())),active:c.ids?.[0]??0,completed:false};
  return null
}
function walkthroughSnapshot(c){if(c.game==='patches')return {paint:cloneGrid(c.paint),patchSelectedRects:JSON.parse(JSON.stringify(c.patchSelectedRects||{})),patchLogicEvidence:JSON.parse(JSON.stringify(c.patchLogicEvidence||patchEmptyEvidence()))};if(c.game==='tango')return {state:cloneGrid(c.state),tangoDerivedRelations:JSON.parse(JSON.stringify(c.tangoDerivedRelations||[]))};return {state:cloneGrid(c.state)}}
function withWalkthroughCurrent(fn){let saved=current;current=walkthroughSession?.work||saved;try{return fn(current)}finally{current=saved}}
function walkthroughComplete(){return withWalkthroughCurrent(()=>{
  if(current.game==='queens')return queenLogicalComplete();
  if(current.game==='tango')return current.state.every(row=>row.every(v=>v===0||v===1))&&!tangoLogicSession(current,current.state,current.tangoDerivedRelations||[]).diagnose();
  if(current.game==='sudoku')return current.state.every(row=>row.every(v=>v>=1&&v<=6))&&!sudokuLogicSession(current,current.state).diagnose();
  if(current.game==='patches'){
    if(!current.paint.every(row=>row.every(v=>v!=null)))return false;
    let clueAt=new Map(current.ids.map(id=>[current.clues[id].pos.join(','),id]));
    for(let id of current.ids){
      let cells=[];for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]===id)cells.push([r,c]);
      if(!cells.length)return false;let cl=current.clues[id],own=cl.pos;
      if(!cells.some(([r,c])=>r===own[0]&&c===own[1]))return false;
      if(cells.some(([r,c])=>clueAt.has(r+','+c)&&clueAt.get(r+','+c)!==id))return false;
      let sh=patchShape(cells);if(sh==='libre')return false;
      if((cl.mode==='both'||cl.mode==='size')&&cells.length!==cl.size)return false;
      if((cl.mode==='both'||cl.mode==='shape')&&sh!==cl.shape)return false
    }
    return true
  }
  return false
})}
function walkthroughExhaustiveHint(){return null}

function walkthroughFindHint(){return withWalkthroughCurrent(()=>{
  if(current.game==='queens')return null;
  if(current.game==='tango')return null;
  if(current.game==='sudoku')return null;
  if(current.game==='patches')return null;
  return null
})}
function walkthroughWhyText(h){return h.walkthroughWhy|| (h.rank===3?rank3Why(h):h.rank===2?rank2Why(h):h.rank===1?rank1Why(h):h.why)}
function walkthroughMoveText(game,h){
  if(game==='queens')return `${h.v===2?pieceName('queens',2):pieceName('queens',1)} · ${cellName(h.r,h.c)}`;
  if(game==='tango')return `${pieceName('tango',h.v)} · ${cellName(h.r,h.c)}`;
  if(game==='sudoku')return `${h.v} · ${cellName(h.r,h.c)}`;
  return `${pieceName('patches',h.id)} · ${cellName(h.r,h.c)}`
}
function walkthroughApplyHint(h){return withWalkthroughCurrent(()=>{
  if(current.game==='patches')current.paint[h.r][h.c]=h.id;
  else current.state[h.r][h.c]=h.v;
  return true
})}
function walkthroughGenerateQueensNext(){
  let s=walkthroughSession;if(!s||s.base.game!=='queens'||s.done||s.stalled)return false;
  if(!s.queenLogic)s.queenLogic=queenLogicSession(s.work,s.work.state);
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length;return false}
  let result=s.queenLogic.nextDeduction();
  if(result.contradiction){s.stalled=true;s.logicContradiction=result.contradiction;return false}
  if(!result.deduction){s.stalled=true;return false}
  let beforeSnapshot=walkthroughSnapshot(s.work),applied=s.queenLogic.applyDeduction(result.deduction),d=applied.deduction;if(!d){s.stalled=true;return false}
  s.work.state=cloneGrid(s.queenLogic.state);
  let reasoning=queenDeductionReasoning(d,applied.automatic),info={
    rule:d.rule,technique:queenLegacyTechniqueForDeduction(d),rank:d.rank,techniqueLevel:d.techniqueLevel,target:d.conclusions?.[0]?.cell?[...d.conclusions[0].cell]:null,
    deduction:reasoning,where:queenDeductionOrientation(d),why:queenDeductionExplanation(d),move:queenDeductionConclusionText(d),automatic:JSON.parse(JSON.stringify(applied.automatic||[])),metrics:s.queenLogic.metrics(),beforeSnapshot
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
  let reasoning=tangoDeductionReasoning(d,applied.automatic),firstValue=(d.conclusions||[]).find(c=>c.type==='VALUE'),info={
    rule:d.rule,technique:tangoLegacyTechniqueForDeduction(d),rank:d.rank,techniqueLevel:d.techniqueLevel,target:firstValue?firstValue.cell.slice():null,
    deduction:reasoning,where:tangoDeductionOrientation(d),why:tangoDeductionExplanation(d),move:tangoDeductionConclusionText(d),automatic:JSON.parse(JSON.stringify(applied.automatic||[])),metrics:s.tangoLogic.metrics(),beforeSnapshot
  };
  info.snapshot=walkthroughSnapshot(s.work);s.moves.push(info);
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length;s.metrics=s.tangoLogic.metrics()}
  return true
}
function patchTutorSelectedIds(engine,ids){return new Set((ids||[]).filter(id=>engine.selectedRect(id)!=null))}
function patchTutorQueueSelections(s,beforeSelected,primary,automatic){let sequence=[primary,...(automatic||[])].filter(Boolean),afterSelected=patchTutorSelectedIds(s.patchLogic,s.base.ids),pending=new Set([...afterSelected].filter(id=>!beforeSelected.has(id)));s.patchRevealQueue=s.patchRevealQueue||[];let enqueue=(id,deduction)=>{id=Number(id);if(!pending.has(id))return;let rect=s.patchLogic.selectedRect(id)?.rect;if(!rect)return;s.patchRevealQueue.push({clue:id,rectangle:JSON.parse(JSON.stringify(rect)),deduction:JSON.parse(JSON.stringify(deduction||primary)),batchPrimaryId:primary?.id||null});pending.delete(id)};for(const d of sequence)for(const c of d?.conclusions||[])if(c.type==='SELECTED_RECT')enqueue(c.clue,d);for(const id of s.base.ids)if(pending.has(Number(id)))enqueue(id,primary)}
function patchTutorRevealNext(s){let item=s.patchRevealQueue?.shift();if(!item)return false;let id=item.clue,rect=item.rectangle,d=item.deduction,beforeSnapshot=walkthroughSnapshot(s.work);s.work.patchSelectedRects=s.work.patchSelectedRects||{};s.work.patchSelectedRects[id]={r0:rect.r0,r1:rect.r1,c0:rect.c0,c1:rect.c1};for(const [r,col] of rect.cells||PatchesLogic.helpers.rectCells(rect))s.work.paint[r][col]=id;let reasoning=patchDeductionReasoning(d,[]),info={
    rule:d.rule,technique:patchLegacyTechniqueForDeduction(d),rank:d.rank,techniqueLevel:d.techniqueLevel,target:patchDeductionPrimaryCell(d),deduction:reasoning,
    where:patchDeductionOrientation(d),why:patchDeductionExplanation(d),move:patchDeductionConclusionText(d),automatic:[],metrics:s.patchLogic.metrics(),beforeSnapshot,revealedClue:id,revealedRectangle:{r0:rect.r0,r1:rect.r1,c0:rect.c0,c1:rect.c1}
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
  let value=sudokuValueStepConclusion(result);
  if(!value){s.stalled=true;s.sudokuStatus=result.status||'blocked';s.metrics=result.metrics;return false}
  let [r,c]=value.cell;if(s.work.state[r][c]!==0){s.stalled=true;s.sudokuStatus='invalid-value-target';return false}
  let beforeSnapshot=walkthroughSnapshot(s.work),primary=result.primaryDeduction||result.deduction,reasoning=sudokuValueStepReasoning(result),valueStep={status:result.status,contradiction:null,deduction:JSON.parse(JSON.stringify(result.deduction)),primaryDeduction:JSON.parse(JSON.stringify(primary)),supportingDeductions:JSON.parse(JSON.stringify(result.supportingDeductions||[])),logicalSteps:result.logicalSteps,metrics:JSON.parse(JSON.stringify(result.metrics||{}))};
  s.work.state[r][c]=value.value;
  let info={
    rule:primary.rule,technique:sudokuLegacyTechniqueForDeduction(primary),rank:sudokuCoachRankForDeduction(primary),techniqueLevel:primary.techniqueLevel,target:[r,c],
    deduction:reasoning,logicDeduction:JSON.parse(JSON.stringify(primary)),finalDeduction:JSON.parse(JSON.stringify(result.deduction)),supportingDeductions:JSON.parse(JSON.stringify(result.supportingDeductions||[])),valueStep,
    where:sudokuDeductionOrientation(primary),why:sudokuValueStepExplanation(result),move:`${value.value} · ${cellName(r,c)}`,automatic:[],metrics:JSON.parse(JSON.stringify(result.metrics||{})),beforeSnapshot
  };
  info.snapshot=walkthroughSnapshot(s.work);s.moves.push(info);s.sudokuStatus='value';s.metrics=info.metrics;
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length}
  return true
}
function walkthroughGenerateNext(){
  let s=walkthroughSession;if(!s||s.done||s.stalled)return false;if(s.base.game==='queens')return walkthroughGenerateQueensNext();if(s.base.game==='tango')return walkthroughGenerateTangoNext();if(s.base.game==='patches')return walkthroughGeneratePatchesNext();if(s.base.game==='sudoku')return walkthroughGenerateSudokuNext();
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length;return false}
  let h=walkthroughFindHint();
  if(!h||h.timeout){s.stalled=true;s.timeout=!!h?.timeout;return false}
  let info=withWalkthroughCurrent(()=>{let reasoning=h.walkthroughExhaustive?{schema:1,source:'visible-state',game:current.game,technique:null,rank:3,target:{row:h.r,column:h.c},action:coachActionFor(current.game,h),proof:{direct:h.walkthroughWhy,exhaustive:true}}:structuredReasoning(current.game,h);return {
    technique:h.walkthroughExhaustive?null:coachTechniqueId(current.game,h),rank:Math.max(0,Number(h.rank)||0),exhaustive:!!h.walkthroughExhaustive,target:[h.r,h.c],
    where:coachLookText(current.game,[h.r,h.c],{reasoning}),why:walkthroughWhyText(h),move:walkthroughMoveText(current.game,h),reasoning
  }});
  walkthroughApplyHint(h);info.snapshot=walkthroughSnapshot(s.work);s.moves.push(info);
  if(walkthroughComplete()){s.done=true;s.total=s.moves.length}
  return true
}
function walkthroughTarget(index){return index>0?walkthroughSession?.moves?.[index-1]?.target:null}
function walkthroughBoardHtml(snapshot,target=null,deduction=null){
  let s=walkthroughSession,c=s.base,n=c.n||6,initial=s.initial,targetKey=target?target.join(','):null,cells=[];
  if(c.game==='queens'){
    let context=new Set(queenDeductionPremiseCells(deduction,c).map(x=>x.join(','))),conclusions=new Set((deduction?.conclusions||[]).map(x=>x.cell.join(',')));
    for(let r=0;r<n;r++)for(let col=0;col<n;col++){let k=`${r},${col}`,v=snapshot.state[r][col],cls='cell walkthrough-cell'+(context.has(k)?' walkthrough-context':'')+(conclusions.has(k)?' walkthrough-target':''),body=v===2?'<span class="queen">♛</span>':v===1?'<span class="mark">×</span>':'';cells.push(`<div class="${cls}" style="background:${QUEEN_REGION_COLORS[c.reg[r][col]%QUEEN_REGION_COLORS.length]}">${body}</div>`)}
  }else if(c.game==='tango'){
    let rel=new Map();for(let [r,col,d,x] of c.edges||[]){let k=r+','+col,a=rel.get(k)||[];a.push(`<span class="relation ${d}">${x}</span>`);rel.set(k,a)}
    let context=new Set((deduction?.focusCells||[]).map(x=>x.join(','))),conclusions=new Set();for(let rr of deduction?.focusRelations||[]){context.add(rr.a.join(','));context.add(rr.b.join(','))}for(let x of deduction?.conclusions||[]){if(x.type==='VALUE')conclusions.add(x.cell.join(','));else{conclusions.add(x.a.join(','));conclusions.add(x.b.join(','))}}
    for(let r=0;r<6;r++)for(let col=0;col<6;col++){let k=`${r},${col}`,v=snapshot.state[r][col],fixed=initial.state[r][col]!==-1,body=v===0?'<span class="tango-symbol">☾</span>':v===1?'<span class="tango-symbol">☀</span>':'',cls='cell walkthrough-cell'+(fixed?' fixed':'')+(context.has(k)?' walkthrough-context':'')+(conclusions.has(k)?' walkthrough-target':'');cells.push(`<div class="${cls}">${body}${(rel.get(r+','+col)||[]).join('')}</div>`)}
  }else if(c.game==='sudoku'){
    let context=new Set((deduction?.focusCells||[]).map(x=>x.join(',')));
    for(let r=0;r<6;r++)for(let col=0;col<6;col++){let k=`${r},${col}`,v=snapshot.state[r][col],fixed=initial.state[r][col]!==0,cls='cell walkthrough-cell '+(fixed?'fixed ':'')+(col===2?'boxR ':'')+((r===1||r===3)?'boxB ':'')+(context.has(k)&&targetKey!==k?'walkthrough-context ':'')+(targetKey===k?'walkthrough-target':'');cells.push(`<div class="${cls}">${v||''}</div>`)}
  }else{
    let clueAt=new Map(c.ids.map(id=>[c.clues[id].pos.join(','),id])),context=new Set((deduction?.focusCells||[]).map(x=>x.join(','))),conclusions=new Set();
    for(const x of deduction?.conclusions||[]){if(x.type==='OWNER')conclusions.add(x.cell.join(','));else if(x.type==='SELECTED_RECT')for(const cc of x.rectangle?.cells||[])conclusions.add(cc.join(','))}
    for(let r=0;r<n;r++)for(let col=0;col<n;col++){let k=`${r},${col}`,id=snapshot.paint[r][col],clue=clueAt.get(k),style=id!=null?`background:${c.pal[id%c.pal.length]}`:'',cls='cell patch-cell walkthrough-cell'+(clue!=null?' clue':'')+(context.has(k)?' walkthrough-context':'')+(conclusions.has(k)||targetKey===k?' walkthrough-target':''),body=clue!=null?clueHTML(c.clues[clue]):'';cells.push(`<div class="${cls}" style="${style}">${body}</div>`)}
  }
  return `<div class="walkthrough-board-wrap"><div class="board ${c.game==='sudoku'?'sudoku ':''}walkthrough-board" style="grid-template-columns:repeat(${n},minmax(0,1fr));grid-template-rows:repeat(${n},minmax(0,1fr))">${cells.join('')}</div></div>`
}
function walkthroughExplanationHtml(index){
  let s=walkthroughSession;if(index===0)return `<div class="walkthrough-explanation start"><b>${tr('walkthroughStart')}</b><p>${tr('walkthroughSub')}</p></div>`;
  let m=s.moves[index-1];
  if(s.base.game==='queens'&&m?.deduction){let d=m.deduction;return `<div class="walkthrough-explanation"><div class="walkthrough-tech"><b>${queenRuleHumanTitle(d)}</b><span>R${d.rank}</span></div><p><b>${tr('where')} :</b> ${queenDeductionOrientation(d)}</p><p><b>${tr('walkthroughWhy')}</b><br>${queenDeductionExplanation(d)}</p></div>`}
  if(s.base.game==='tango'&&m?.deduction){let d=m.deduction;return `<div class="walkthrough-explanation"><div class="walkthrough-tech"><b>${tangoRuleHumanTitle(d)}</b><span>R${d.rank}</span></div><p><b>${tr('where')} :</b> ${tangoDeductionOrientation(d)}</p><p><b>${tr('walkthroughWhy')}</b><br>${tangoDeductionExplanation(d)}</p></div>`}
  if(s.base.game==='patches'&&m?.deduction){let d=m.deduction;return `<div class="walkthrough-explanation"><div class="walkthrough-tech"><b>${patchRuleHumanTitle(d)}</b><span>R${d.rank} · T${d.techniqueLevel}</span></div><p><b>${tr('where')} :</b> ${patchDeductionOrientation(d)}</p><p><b>${tr('walkthroughWhy')}</b><br>${patchDeductionExplanation(d)}</p>${m.move?`<p class="walkthrough-move"><b>${tr('hintMove')} :</b> ${m.move}</p>`:''}</div>`}
  if(s.base.game==='sudoku'&&m?.logicDeduction){let d=m.logicDeduction;return `<div class="walkthrough-explanation"><div class="walkthrough-tech"><b>${sudokuRuleHumanTitle(d)}</b><span>T${d.techniqueLevel}</span></div><p><b>${tr('where')} :</b> ${m.where||sudokuDeductionOrientation(d)}</p><p><b>${tr('walkthroughWhy')}</b><br>${m.why||sudokuDeductionExplanation(d)}</p><p class="walkthrough-move"><b>${tr('hintMove')} :</b> ${m.move}</p></div>`}
  let tech=m.technique?techniqueTitle(m.technique):techniqueTerm('contradiction'),rank=m.exhaustive?'R+':`R${m.rank}`;
  return `<div class="walkthrough-explanation"><div class="walkthrough-tech"><b>${tech}</b><span>${rank}</span></div><p><b>${tr('where')} :</b> ${m.where}</p><p><b>${tr('walkthroughWhy')}</b><br>${m.why||''}</p><p class="walkthrough-move"><b>${tr('hintMove')} :</b> ${m.move}</p></div>`
}
function renderWalkthrough(){
  let s=walkthroughSession;if(!s)return;let i=s.index,snap=i===0?s.initial:s.moves[i-1].snapshot,target=walkthroughTarget(i),deduction=i>0?s.moves[i-1]?.deduction:null;
  let stateNote=s.done&&i===s.moves.length?`<div class="walkthrough-complete">✓ ${tr('walkthroughComplete')}</div>`:s.stalled&&i===s.moves.length?`<div class="walkthrough-stalled">⚠ ${s.logicContradiction?(s.base.game==='queens'?queenLogicContradictionText(s.logicContradiction):s.base.game==='tango'?tangoLogicContradictionText(s.logicContradiction):s.base.game==='patches'?patchLogicContradictionText(s.logicContradiction):tr('walkthroughStalled')):tr('walkthroughStalled')}</div>`:'';
  let total=s.done?s.moves.length:'…',progress=`${i}/${total}`;document.body.classList.add('tutor-active');
  app.innerHTML=`<section class="panel walkthrough-panel"><div class="stats-head walkthrough-head"><div><h1>${tr('walkthrough')}</h1><p>${gameLabel(s.base.game)} · ${DIFF[s.base.diff]}</p></div><button class="btn" id="walkthroughClose">${tr('walkthroughClose')}</button></div>${walkthroughBoardHtml(snap,target,deduction)}<div class="walkthrough-actions walkthrough-actions-top"><button class="btn" id="walkthroughPrev" ${i===0?'disabled':''}>← ${tr('walkthroughPrevious')}</button><button class="btn walkthrough-step-counter" id="walkthroughRestart" ${i===0?'disabled':''} title="${tr('walkthroughRestart')}">${tr('walkthroughStep')} ${progress} · ↺</button><button class="btn primary" id="walkthroughNext" ${(s.done||s.stalled)&&i===s.moves.length?'disabled':''}>${tr('walkthroughNext')} →</button></div><div class="walkthrough-scroll"><p class="walkthrough-help-note">💡 ${tr('walkthroughCountsAsHelp')}</p>${walkthroughExplanationHtml(i)}${stateNote}</div></section>`;
  if(s.base.game==='patches')patchObserveResponsiveClues(app.querySelector('.walkthrough-board'),s.base.n);
  $('#walkthroughClose').onclick=closeWalkthrough;$('#walkthroughPrev').onclick=()=>{if(s.index>0){s.index--;renderWalkthrough()}};$('#walkthroughRestart').onclick=()=>{s.index=0;renderWalkthrough()};$('#walkthroughNext').onclick=()=>{if(s.index<s.moves.length)s.index++;else if(walkthroughGenerateNext())s.index++;renderWalkthrough()};app.querySelectorAll('button').forEach(pressFeedback)
}
function openWalkthrough(){
  if(!current||current.training)return false;let root=current.game==='sudoku'?puzzleSnapshot():walkthroughRootSnapshot(),work=walkthroughVisibleClone(current,root);if(!work)return false;
  let elapsed=timerSeconds(),wasPaused=paused;stopTimer(true);current.walkthroughUsed=true;markHintUsed();updateScoreFlags();saveCurrent();
  walkthroughSession={schema:2,base:work,work,initial:walkthroughSnapshot(work),moves:[],index:0,done:false,stalled:false,elapsed,wasPaused};
  if(work.game==='queens'){walkthroughSession.queenLogic=queenLogicSession(work,work.state);work.state=cloneGrid(walkthroughSession.queenLogic.state);walkthroughSession.initial=walkthroughSnapshot(work)}else if(work.game==='tango'){walkthroughSession.tangoLogic=tangoLogicSession(work,work.state,work.tangoDerivedRelations||[]);walkthroughSession.initial=walkthroughSnapshot(work)}else if(work.game==='patches'){walkthroughSession.patchLogic=patchesLogicSession(work,work.paint,work.patchSelectedRects,work.patchLogicEvidence);walkthroughSession.initial=walkthroughSnapshot(work)}
  renderWalkthrough();return true
}
function closeWalkthrough(){
  let s=walkthroughSession;if(!s||!current)return false;let elapsed=s.elapsed,wasPaused=s.wasPaused;walkthroughSession=null;document.body.classList.remove('tutor-active');
  if(current.game==='queens')renderQueens(current);else if(current.game==='tango')renderTango(current);else if(current.game==='sudoku')renderSudoku(current);else renderPatches(current);
  startTimer(true,elapsed,wasPaused);updatePauseButton();saveCurrent();return true
}

function shell(name,subtitle,diff,content,rules){let challengeTag=current?.challenge?` · <span class="challenge-shell-tag">↗ <b>${current.challengeCode}</b></span>`:'';let trainingTag=current?.learning?` · <span class="training-shell-tag">${tr('lesson')} ${current.learningPhase}/4 : <b>${techniqueTitle(current.learningTechnique)}</b></span>`:current?.training?` · <span class="training-shell-tag">${tr('trainingTarget')} : <b>${techniqueTitle(current.trainingTechnique)}</b></span>`:'';app.innerHTML=`<section class="panel"><div class="game-head"><div><h1>${name}</h1><p>${subtitle}${trainingTag}${challengeTag}${current&&current.rating?` · <span class="difficulty-meter">${tr('score')} ${current.rating.score} · ${current.rating.technique}<span class="live-aids">${aidBadges(current,true)}</span></span>`:''}</p></div><select class="difficulty" id="difficulty" aria-label="${tr('rulesTitle')}">${Object.entries(DIFF).filter(([k])=>current?.game==='queens'||k!=='expert').map(([k,v])=>`<option value="${k}" ${k===diff?'selected':''}>${v}</option>`).join('')}</select></div><div class="toolbar" aria-label="${tr('actions')}"><button class="btn primary" id="newBtn">${tr('newGame')}</button><button class="btn" id="resetBtn">${tr('reset')}</button><button class="btn history-action" id="undoBtn" title="${tr('undo')}" aria-label="${tr('undo')}">↶ ${tr('undo')}</button><button class="btn history-action" id="redoBtn" title="${tr('redo')}" aria-label="${tr('redo')}">↷ ${tr('redo')}</button><button class="btn" id="pauseBtn">${tr('pause')}</button><button class="btn" id="checkBtn">${tr('check')}</button><button class="btn" id="hintBtn">${tr('logicCoach')}</button><button class="btn" id="exploreBtn">◇ ${tr('exploration')}</button><button class="btn secondary-action" id="shareChallengeBtn" style="${current?.challenge?'':'display:none'}">↗ ${tr('shareChallenge')}</button><button class="btn tutor-action" id="walkthroughBtn">▹ ${tr('walkthrough')}</button><button class="btn secondary-action" id="solutionBtn">${tr('solution')}</button><button class="btn secondary-action" id="rulesBtn">${tr('rules')}</button><button class="btn secondary-action" id="techniquesBtn">${tr('techniques')}</button></div><div id="status" class="status" aria-live="polite"></div><div id="errorCoach" class="error-coach" hidden aria-live="polite"></div><div id="reasoningAudit" class="reasoning-audit" hidden aria-live="polite"></div><div id="explorationPanel" class="exploration-panel" hidden aria-live="polite"></div><div id="learningGuide" class="learning-guide" hidden aria-live="polite"></div>${content}<div class="rules">${rules}</div></section>`;
$('#difficulty').onchange=e=>launch(current.game,e.target.value);$('#newBtn').onclick=()=>current?.challengeCode?launchChallenge(current.challengeCode):launch(current.game,current.diff);if(current?.challenge){$('#difficulty').disabled=true}$('#resetBtn').onclick=resetCurrent;$('#undoBtn').onclick=()=>undoMoves(1);$('#redoBtn').onclick=()=>redoMoves(1);$('#pauseBtn').onclick=togglePause;$('#exploreBtn').onclick=()=>explorationState()?.active?refreshExplorationPanel():startExploration();let scb=$('#shareChallengeBtn');if(scb&&current?.challenge)scb.onclick=()=>shareChallenge(challengeParse(current.challengeCode));let wb=$('#walkthroughBtn');if(wb)wb.onclick=openWalkthrough;$('#rulesBtn').onclick=()=>modal(`${tr('rules')} — ${name}`,rules);$('#techniquesBtn').onclick=()=>modal(`${tr('techniques')} — ${name}`,techniqueLibraryHtml(current.game));app.querySelectorAll('button').forEach(pressFeedback);updatePauseButton();updateHistoryButtons();refreshErrorCoach();refreshReasoningAudit();refreshExplorationPanel();if(current?.training)decorateTrainingShell()}

function resetCurrent(){
  if(!current)return;
  if(current.training)return resetTrainingExercise();
  let hadProgress=current.game==='queens'?current.state.flat().some(v=>v!==0):current.game==='tango'?current.state.some((row,r)=>row.some((v,c)=>!current.givens.has(r*6+c)&&v!==-1)):current.game==='sudoku'?current.state.some((row,r)=>row.some((v,c)=>current.empty.has(r*6+c)&&v!==0)):current.game==='patches'?current.paint.flat().some(v=>v!==null):false;
  if(hadProgress)markBacktrack();
  $('#victory')?.remove();
  closeHintNotice();
  clearHintFocus();
  current.hintFlow=null;current.lastError=null;current.lastMoveAudit=null;current.exploration=null;clearErrorFocus();
  if(current.game==='queens'){
    $('#qboard')?.classList.remove('queens-win');
    current.state=Array.from({length:current.n},()=>Array(current.n).fill(0));
    drawQ();
  }else if(current.game==='tango'){
    current.tangoPendingCell=null;current.tangoDerivedRelations=[];current.state=Array.from({length:6},()=>Array(6).fill(-1));
    for(let i of current.givens)current.state[Math.floor(i/6)][i%6]=current.sol[Math.floor(i/6)][i%6];
    drawT();
  }else if(current.game==='sudoku'){
    current.state=current.sol.map((r,ri)=>r.map((v,c)=>current.empty.has(ri*6+c)?0:v));
    current.sel=null;drawS();
  }else if(current.game==='patches'){
    current.paint=Array.from({length:current.n},()=>Array(current.n).fill(null));
    current.patchSelectedRects={};current.patchLogicEvidence=patchEmptyEvidence();
    current.active=current.ids[0];drawP();
  }
  let wasCompleted=!!current.completed;
  current.completed=false;
  if(wasCompleted||current.statsClosed){current.backtrackUsed=false;current.hintUsed=false;current.attemptId=null;current.statsClosed=false;statsStart(current)}
  stopTimer(false);elapsedBase=0;startedAt=0;paused=false;startTimer(true,0,false);historyInit(true);updateHistoryButtons();
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
    let w=new Worker('./precompute-worker.js?v=2.21.18');
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

function launch(game,diff){if(game!=='queens'&&diff==='expert')diff='hard';closePreviousAttempt();clearSaved();stopTimer();paused=false;setBusy(true);current={game,diff};requestAnimationFrame(()=>{try{if(game==='queens')queens(diff);if(game==='tango')tango(diff);if(game==='sudoku')sudoku(diff);if(game==='patches')patches(diff);historyInit(true);updateHistoryButtons();statsStart(current);startTimer(true,0,false);saveCurrent();haptic(8)}finally{setBusy(false);startBackgroundPrecompute(game,diff)}})}
function resumeSaved(){let s=getSaved();if(!s)return home();stopTimer();let c=s.current;c.givens=c.givens?new Set(c.givens):c.givens;c.empty=c.empty?new Set(c.empty):c.empty;current=c;historyInit(false);if(c.game==='queens')renderQueens(c);if(c.game==='tango')renderTango(c);if(c.game==='sudoku')renderSudoku(c);if(c.game==='patches')renderPatches(c);startTimer(true,s.elapsed||0,!!s.paused);updatePauseButton();refreshExplorationPanel();showToast(tr('restored'));if(!c.training)startBackgroundPrecompute(c.game,c.diff)}


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
function genericLocalizedHint(kind,target,rank,value){
  let [r,c]=target,loc=`${tr('rowLabel')} ${r+1}, ${tr('columnLabel')} ${c+1}`,action='';
  if(kind==='queens')action=value===1?tr('markX'):tr('placeQueen');
  else if(kind==='tango')action=value===1?tr('placeSun'):tr('placeMoon');
  else if(kind==='sudoku')action=`${tr('placeDigit')} ${value}`;
  else if(kind==='patches')action=`${tr('assignRegion')} ${Number(value)+1}`;
  let reasons=[tr('directReason'),tr('rank1Reason'),tr('rank2Reason'),tr('rank3Reason')];
  return {move:`${action} — ${loc}.`,where:tr('visibleOnly'),why:reasons[Math.max(0,Math.min(3,Number(rank)||0))]}
}


const QUEEN_REGION_COLORS=['#f6d68a','#c9dca5','#b9d8e9','#d9c4e8','#f3b8ad','#b5dbc9','#e7c9a3','#c6c7e9','#c4dfd7'];
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

function coachLookText(kind,[r,c],message={}){
  let row=`${tr('rowLabel')} ${r+1}`,col=`${tr('columnLabel')} ${c+1}`;
  if(kind==='queens'&&current?.reg?.[r])return `${tr('zone')} ${current.reg[r][c]+1} · ${row} · ${col}`;
  if(kind==='patches'&&message?.reasoning?.action?.value!=null)return `${tr('zone')} ${Number(message.reasoning.action.value)+1} · ${row} · ${col}`;
  return `${row} · ${col}`
}
function coachRuleText(message={}){
  let id=message?.reasoning?.technique;
  if(id&&TECHNIQUE_LIBRARY[id])return `<span class="coach-technique-title">${techniqueTitle(id)}</span><code class="coach-technique-id">${id}</code><span class="coach-technique-summary">${techniqueSummary(id)}</span>`;
  let rank=Math.max(0,Math.min(3,Number(message.rank)||0));
  return rank===0?tr('directReason'):tr(`rank${rank}`)
}
function coachUsage(stage,technique=null){
  if(!current)return;
  let u=current.coachUsage||(current.coachUsage={where:0,rule:0,why:0,reveal:0,maxStage:0,techniques:{},flowVersion:2});
  if(!u.techniques)u.techniques={};u.flowVersion=2;
  let k=['','where','why','reveal'][stage];if(k)u[k]=(u[k]||0)+1;
  u.maxStage=Math.max(u.maxStage||0,stage);
  if(technique&&TECHNIQUE_LIBRARY[technique]){
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
  if(kind==='sudoku'&&message?.reasoning?.source==='sudoku-inference-engine'){let used=false;for(let cell of message.reasoning.focusCells||[]){add(cell[0],cell[1]);used=true}for(let unit of message.reasoning.focusUnits||[])for(let cell of sudokuUnitCells(unit)){add(cell[0],cell[1]);used=true}if(used)return}
  if(kind==='sudoku'){let br=Math.floor(r/2)*2,bc=Math.floor(c/3)*3;for(let rr=br;rr<br+2;rr++)for(let cc=bc;cc<bc+3;cc++)add(rr,cc)}
  if(kind==='queens'&&current?.reg?.[r]){let z=current.reg[r][c];for(let rr=0;rr<n;rr++)for(let cc=0;cc<n;cc++)if(current.reg[rr][cc]===z)add(rr,cc)}
  if(kind==='patches'&&message?.reasoning?.action?.value!=null){let id=Number(message.reasoning.action.value),pos=current?.clues?.[id]?.pos;if(pos)add(pos[0],pos[1])}
}
function clearHintFocus(){document.querySelectorAll('.hint-focus,.hint-context').forEach(x=>{x.classList.remove('hint-focus');x.classList.remove('hint-context')})}
function touchSave(fn,action='MOVE'){return()=>{if(paused)return;let before=historySnapshotKey();closeHintNotice();current.hintFlow=null;clearHintFocus();fn();historyRecord(action,before);saveCurrent()}}
// QUEENS
const queenBases={easy:{sol:[1,3,5,0,2,4],reg:[[0,0,1,1,1,1],[0,1,1,1,1,1],[0,0,0,0,2,2],[3,4,4,4,2,2],[4,4,4,4,2,2],[4,4,4,4,5,2]]},medium:{sol:[2,5,1,4,0,3,6],reg:[[0,0,0,0,0,1,1],[2,0,6,6,6,1,6],[2,2,6,3,3,1,6],[2,2,6,5,3,1,6],[4,2,6,5,3,3,6],[4,2,6,5,5,5,6],[6,6,6,6,6,6,6]]},hard:{sol:[2,5,0,3,6,1,4,7],reg:[[0,0,0,0,0,4,4,4],[2,2,0,0,0,1,4,4],[2,7,7,4,4,4,4,4],[2,2,7,3,3,4,4,4],[5,2,7,6,3,4,4,7],[5,5,7,6,6,6,6,7],[7,7,7,7,6,6,7,7],[7,7,7,7,7,7,7,7]]}};
function queens(diff){let base=queenBases[diff],k=Math.floor(Math.random()*8),reg=transformGrid(base.reg,k),n=reg.length,queensSol=Array(n).fill(-1);let mask=base.sol.map((c,r)=>Array.from({length:n},(_,j)=>j===c?1:0));mask=transformGrid(mask,k);for(let r=0;r<n;r++)queensSol[r]=mask[r].indexOf(1);current={game:'queens',diff,n,reg,sol:queensSol,state:Array.from({length:n},()=>Array(n).fill(0)),completed:false};renderQueens(current)}


function solvedQ(){return !!current&&current.game==='queens'&&current.state.every((row,r)=>row[current.sol[r]]===2)&&current.state.flat().filter(v=>v===2).length===current.n}
function solvedT(){return !!current&&current.game==='tango'&&current.state.every((row,r)=>row.every((v,c)=>v===current.sol[r][c]))}
function solvedS(){return !!current&&current.game==='sudoku'&&current.state.every((row,r)=>row.every((v,c)=>v===current.sol[r][c]))}
function solvedP(){return !!current&&current.game==='patches'&&current.paint.every((row,r)=>row.every((v,c)=>v===current.reg[r][c]))}
function maybeAutoFinish(){
  if(!current||current.completed||paused||current.training)return false;
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
function renderQueens(c){const colors=QUEEN_REGION_COLORS;shell(gameLabel('queens'),`${c.n}×${c.n} · ${DIFF[c.diff]} · ${tr('generated')}`,c.diff,`<div class="queen-options"><label class="switch-row"><input type="checkbox" id="queenAutoCross" ${queenAutoCrossEnabled()?'checked':''}><span>${tr('autoCross')}</span></label></div><div class="board-wrap"><div class="board" id="qboard" style="grid-template-columns:repeat(${c.n},minmax(0,1fr));grid-template-rows:repeat(${c.n},minmax(0,1fr))"></div></div><div class="legend">${tr('queensLegend')}</div>`,gameRules('queens'));let b=$('#qboard'),dragging=false,pointerId=null,startCell=null,dragAxis=null,dragged=false,dragMode='add',visited=new Set(),historyBefore=null;
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
b.onpointerdown=e=>{if(paused)return;let d=boardCellAt(e.clientX,e.clientY);if(!d)return;e.preventDefault();historyBefore=historySnapshotKey();dragging=true;pointerId=e.pointerId;startCell=d;dragAxis=null;dragged=false;visited.clear();let r=+d.dataset.r,col=+d.dataset.c;dragMode=current.state[r][col]===1?'remove':'add';try{b.setPointerCapture(pointerId)}catch(_){}};
b.onpointermove=e=>{if(!dragging||e.pointerId!==pointerId)return;e.preventDefault();let hit=boardCellAt(e.clientX,e.clientY);if(hit)applyDragTo(hit)};
let endDrag=e=>{if(!dragging||e.pointerId!==pointerId)return;e.preventDefault();let finalHit=boardCellAt(e.clientX,e.clientY);if(finalHit)applyDragTo(finalHit);try{b.releasePointerCapture(pointerId)}catch(_){};let d=startCell;dragging=false;pointerId=null;if(!dragged&&d){let r=+d.dataset.r,col=+d.dataset.c;current.hintFlow=null;clearHintFocus();let prev=current.state[r][col],next=(prev+1)%3;if(prev===2&&next===0)markBacktrack();setQueenCell(r,col,next);haptic(next===2?16:7);drawQ()}else if(dragged){haptic(7)}historyRecord({type:dragged?'QUEEN_DRAG':'QUEEN_CYCLE',primaryTarget:(!dragged&&d)?[+d.dataset.r,+d.dataset.c]:null},historyBefore);saveCurrent();maybeAutoFinish();historyBefore=null;startCell=null;dragAxis=null;visited.clear()};
b.onpointerup=endDrag;b.onpointercancel=e=>{if(!dragging||e.pointerId!==pointerId)return;try{b.releasePointerCapture(pointerId)}catch(_){};dragging=false;pointerId=null;startCell=null;dragAxis=null;visited.clear();drawQ()};
drawQ();$('#queenAutoCross').onchange=e=>{let before=historySnapshotKey();setQueenAutoCross(e.target.checked);if(e.target.checked){for(let r=0;r<current.n;r++)for(let col=0;col<current.n;col++)if(current.state[r][col]===2)applyQueenAutoCross(r,col);drawQ();historyRecord({type:'AUTO_CROSS_ENABLE'},before);saveCurrent();showToast(tr('autoCrossOn'))}else showToast(tr('autoCrossOff'))};$('#checkBtn').onclick=checkQ;$('#hintBtn').onclick=hintQ;$('#solutionBtn').onclick=()=>{if(paused)return;current.state=current.state.map((row,r)=>row.map((_,col)=>col===current.sol[r]?2:1));drawQ();finish(tr('solutionShown'),'revealed')}}
function drawQ(){let b=$('#qboard');if(current?.game==='queens'&&current.completed&&solvedQ())b.classList.add('queens-win');[...b.children].forEach((d,i)=>{let r=Math.floor(i/current.n),c=i%current.n,v=current.state[r][c];d.innerHTML=v===2?'<span class="queen">♛</span>':v===1?'<span class="mark">×</span>':'';d.classList.remove('error')});applyConfiguredIllegalClasses(b,queenIllegalCells(),current.n);applyUnjustifiedHighlights();updateScoreFlags()}
function checkQ(){if(solvedQ())finish(`${tr('congrats')} ${gameLabel('queens')}`);else status(tr('gridIncomplete'),false)}

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

// TANGO
const tangoSolutions={easy:[[0,1,0,1,0,1],[1,0,1,0,1,0],[1,1,0,0,1,0],[0,0,1,1,0,1],[1,0,0,1,0,1],[0,1,1,0,1,0]],medium:[[0,1,0,0,1,1],[1,0,1,1,0,0],[0,0,1,0,1,1],[1,1,0,1,0,0],[0,1,1,0,0,1],[1,0,0,1,1,0]],hard:[[1,0,1,0,0,1],[0,1,0,1,1,0],[1,1,0,0,1,0],[0,0,1,1,0,1],[1,0,1,0,1,0],[0,1,0,1,0,1]]};
function tango(diff){let sol=transformGrid(tangoSolutions[diff],Math.floor(Math.random()*8)),n=6,givenCount={easy:12,medium:8,hard:5}[diff],relCount={easy:8,medium:10,hard:11}[diff],positions=shuffle(Array.from({length:36},(_,i)=>i)),givens=new Set(positions.slice(0,givenCount)),edges=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(c<n-1)edges.push([r,c,'r',sol[r][c]===sol[r][c+1]?'=':'×']);if(r<n-1)edges.push([r,c,'d',sol[r][c]===sol[r+1][c]?'=':'×'])}edges=shuffle(edges).slice(0,relCount);let state=Array.from({length:n},()=>Array(n).fill(-1));for(let i of givens){let r=Math.floor(i/6),c=i%6;state[r][c]=sol[r][c]}current={game:'tango',diff,n,sol,givens,edges,state,tangoDerivedRelations:[],completed:false};renderTango(current)}
function renderTango(c){shell(gameLabel('tango'),`6×6 · ${tr('generated')}`,c.diff,`<div class="board-wrap"><div class="board" id="tboard" style="grid-template-columns:repeat(6,minmax(0,1fr));grid-template-rows:repeat(6,minmax(0,1fr))"></div></div>`,gameRules('tango'));let b=$('#tboard');for(let r=0;r<6;r++)for(let col=0;col<6;col++){let d=document.createElement('div');d.className='cell'+(c.givens.has(r*6+col)?' fixed':'');d.dataset.r=r;d.dataset.c=col;if(!c.givens.has(r*6+col))d.onclick=touchSave(()=>{
  let prev=current.state[r][col],next=(prev+2)%3-1;
  current.tangoPendingCell=null;current.tangoDerivedRelations=[];
  if(prev===1&&next===-1)markBacktrack();
  current.state[r][col]=next;
  if(next===0)current.tangoPendingCell=[r,col];
  haptic(8);drawT();updateScoreFlags();maybeAutoFinish()
});b.appendChild(d)}drawT();$('#checkBtn').onclick=checkT;$('#hintBtn').onclick=hintT;$('#solutionBtn').onclick=()=>{if(paused)return;current.tangoPendingCell=null;current.state=current.sol.map(r=>[...r]);drawT();finish(tr('solutionShown'),'revealed')}}
function drawT(){let b=$('#tboard');[...b.children].forEach((d,i)=>{let r=Math.floor(i/6),c=i%6,v=current.state[r][c];d.innerHTML=v===0?'<span class="tango-symbol">☾</span>':v===1?'<span class="tango-symbol">☀</span>':''});current.edges.forEach(([r,c,dir,s])=>{let d=b.children[r*6+c];let e=document.createElement('span');e.className='relation '+dir;e.textContent=s;d.appendChild(e)});let ignore=current.tangoPendingCell?keyCell(...current.tangoPendingCell):null;applyConfiguredIllegalClasses(b,tangoIllegalCells(ignore),6);applyUnjustifiedHighlights();updateScoreFlags()}
function checkT(){if(solvedT())finish(`${tr('congrats')} ${gameLabel('tango')}`);else status(tr('tangoIncomplete'),false)}
function hintT(){if(current?.training)return trainingCoach();if(paused)return;if(showVisibleErrorsBeforeHint())return;if(showExplorationContradictionBeforeHint())return;current.tangoPendingCell=null;try{let result=tangoCurrentLogicResult();if(result.contradiction){current.hintFlow=null;clearHintFocus();let cells=result.contradiction.cells||[];let b=$('#tboard');if(b)for(let [r,c] of cells){let el=b.children[r*6+c];if(el)el.classList.add('error-focus')}showHintNotice(`<b>⚠ ${tr('contradictionFound')}</b><br>${tangoLogicContradictionText(result.contradiction)}`);return}if(!result.deduction)return showHintNotice(`<b>${tr('noLogicalHint')}</b><br>${tr('tlgNoDeduction')}`);tangoCoachHandleDeduction(result.deduction)}catch(err){console.error('Soleil/Lune proof engine failed',err);showHintNotice(`<b>${tr('hintError')}</b>`)}}

// MINI SUDOKU 6x6 regions 2x3
const sudBase=[[1,2,3,4,5,6],[4,5,6,1,2,3],[2,3,4,5,6,1],[5,6,1,2,3,4],[3,4,5,6,1,2],[6,1,2,3,4,5]];
function countMiniSudoku(grid,limit=2){let n=6,count=0;function valid(r,c,v){for(let i=0;i<n;i++)if(grid[r][i]===v||grid[i][c]===v)return false;let br=Math.floor(r/2)*2,bc=Math.floor(c/3)*3;for(let rr=br;rr<br+2;rr++)for(let cc=bc;cc<bc+3;cc++)if(grid[rr][cc]===v)return false;return true}function bt(){if(count>=limit)return;let best=null,bestCand=null;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(grid[r][c]===0){let cand=[];for(let v=1;v<=6;v++)if(valid(r,c,v))cand.push(v);if(!cand.length)return;if(!best||cand.length<bestCand.length){best=[r,c];bestCand=cand;if(cand.length===1)break}}if(!best){count++;return}let [r,c]=best;for(let v of bestCand){grid[r][c]=v;bt();grid[r][c]=0;if(count>=limit)return}}bt();return count}
function makeSudokuHoles(sol,target){let puzzle=sol.map(r=>[...r]),order=shuffle(Array.from({length:36},(_,i)=>i)),holes=[];for(let i of order){if(holes.length>=target)break;let r=Math.floor(i/6),c=i%6,old=puzzle[r][c];puzzle[r][c]=0;if(countMiniSudoku(puzzle.map(x=>[...x]),2)===1)holes.push(i);else puzzle[r][c]=old}return new Set(holes)}
function sudoku(diff){let map=shuffle([1,2,3,4,5,6]),sol=sudBase.map(r=>r.map(v=>map[v-1]));if(Math.random()<.5)sol=sol.map(r=>[...r].reverse());if(Math.random()<.5)sol=[...sol].reverse();let holes={easy:16,medium:22,hard:27}[diff],empty=makeSudokuHoles(sol,holes);current={game:'sudoku',diff,n:6,sol,empty,state:sol.map((r,ri)=>r.map((v,c)=>empty.has(ri*6+c)?0:v)),sel:null,completed:false};renderSudoku(current)}
function renderSudoku(c){shell(gameLabel('sudoku'),`6×6 · 1–6 · ${tr('generated')}`,c.diff,`<div class="board-wrap"><div class="board sudoku" id="sboard" style="grid-template-columns:repeat(6,minmax(0,1fr));grid-template-rows:repeat(6,minmax(0,1fr))"></div></div><div class="numpad" id="numpad">${[1,2,3,4,5,6].map(n=>`<button data-n="${n}">${n}</button>`).join('')}<button data-n="0" aria-label="${tr('erase')}">⌫</button></div>`,gameRules('sudoku'));let b=$('#sboard');for(let r=0;r<6;r++)for(let col=0;col<6;col++){let fixed=!c.empty.has(r*6+col),d=document.createElement('div');d.className='cell '+(fixed?'fixed ':'')+((col===2)?'boxR ':'')+((r===1||r===3)?'boxB ':'');if(!fixed)d.onclick=touchSave(()=>{current.sel=[r,col];drawS()});b.appendChild(d)}$('#numpad').querySelectorAll('button').forEach(bt=>bt.onclick=touchSave(()=>{if(current.sel){let [r,col]=current.sel,prev=current.state[r][col],next=+bt.dataset.n;if(prev!==0&&prev!==next)markBacktrack();current.state[r][col]=next;haptic(8);drawS();updateScoreFlags();maybeAutoFinish()}}));drawS();$('#checkBtn').onclick=checkS;$('#hintBtn').onclick=hintS;$('#solutionBtn').onclick=()=>{if(paused)return;current.state=current.sol.map(r=>[...r]);drawS();finish(tr('solutionShown'),'revealed')}}
function drawS(){let sel=current.sel,sv=sel?current.state[sel[0]][sel[1]]:0;[...$('#sboard').children].forEach((d,i)=>{let r=Math.floor(i/6),c=i%6,v=current.state[r][c];d.textContent=v||'';let sameUnit=!!sel&&(r===sel[0]||c===sel[1]||(Math.floor(r/2)===Math.floor(sel[0]/2)&&Math.floor(c/3)===Math.floor(sel[1]/3)));d.classList.toggle('peer',sameUnit&&!(r===sel[0]&&c===sel[1]));d.classList.toggle('same-value',!!sv&&v===sv&&!(r===sel[0]&&c===sel[1]));d.classList.toggle('selected',!!sel&&sel[0]===r&&sel[1]===c);d.classList.remove('error')});applyConfiguredIllegalClasses($('#sboard'),sudokuIllegalCells(),6);applyUnjustifiedHighlights();updateScoreFlags()}
function checkS(){if(solvedS())finish(`${tr('congrats')} ${gameLabel('sudoku')}`);else status(tr('sudokuIncomplete'),false)}
function hintS(){if(current?.training)return trainingCoach();if(paused)return;if(showVisibleErrorsBeforeHint())return;if(showExplorationContradictionBeforeHint())return;try{let result=sudokuCurrentValueStep();if(result.contradiction)return sudokuShowLogicalContradiction(result.contradiction);let value=sudokuValueStepConclusion(result);if(!value)return showHintNotice(`<b>${tr('noLogicalHint')}</b><br>${tr('slgNoDeduction')}`);let primary=result.primaryDeduction||result.deduction,technique=sudokuLegacyTechniqueForDeduction(primary),rank=sudokuCoachRankForDeduction(primary),[r,c]=value.cell,move=sudokuFormat('slgPlaceDigitAt',{value:value.value,cell:cellName(r,c)}),reasoning=sudokuValueStepReasoning(result);hintStage('sudoku',[r,c],{move,look:sudokuDeductionOrientation(primary),why:sudokuValueStepExplanation(result),reveal:tr('digitRevealed'),rank,value:value.value,reasoning},()=>{current.state[r][c]=value.value;current.sel=[r,c];drawS();maybeAutoFinish()})}catch(err){console.error('Grille 6 proof engine failed',err);showHintNotice(`<b>${tr('hintError')}</b>`)}}

// PATCHES — connected target regions; player paints each clue region.
const patchDefs={
easy:{n:5,reg:[[0,0,1,1,1],[0,0,1,2,2],[3,3,3,2,2],[3,4,4,4,5],[3,4,5,5,5]]},
medium:{n:6,reg:[[0,0,1,1,1,2],[0,3,3,1,2,2],[0,3,4,4,4,2],[5,3,4,6,6,6],[5,5,7,7,6,8],[5,7,7,8,8,8]]},
hard:{n:7,reg:[[0,0,1,1,1,2,2],[0,3,3,1,2,2,4],[0,3,5,5,5,4,4],[6,3,5,7,7,7,4],[6,6,5,8,7,9,9],[6,10,10,8,8,9,11],[10,10,8,8,11,11,11]]}};
function patchShape(cells){let rs=cells.map(x=>x[0]),cs=cells.map(x=>x[1]),h=Math.max(...rs)-Math.min(...rs)+1,w=Math.max(...cs)-Math.min(...cs)+1,rect=h*w===cells.length;if(!rect)return 'libre';if(h===w)return 'carré';return h>w?'vertical':'horizontal'}
function patches(diff){let def=patchDefs[diff],reg=transformGrid(def.reg,Math.floor(Math.random()*8)),n=reg.length,ids=[...new Set(reg.flat())],cellsBy={};ids.forEach(id=>cellsBy[id]=[]);for(let r=0;r<n;r++)for(let c=0;c<n;c++)cellsBy[reg[r][c]].push([r,c]);let clues={};ids.forEach(id=>{let cells=cellsBy[id],p=cells[Math.floor(cells.length/2)],mode=diff==='easy'?'both':diff==='medium'?(Math.random()<.5?'size':'shape'):(Math.random()<.45?'shape':Math.random()<.8?'size':'none');clues[id]={pos:p,size:cells.length,shape:patchShape(cells),mode}});const pal=['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1'];current={game:'patches',diff,n,reg,ids,cellsBy,clues,pal,active:ids[0],paint:Array.from({length:n},()=>Array(n).fill(null)),patchSelectedRects:{},patchLogicEvidence:patchEmptyEvidence(),completed:false};renderPatches(current)}
let patchPaintFrame=0,patchDragFrame=0,patchDragPending=null,patchClueResizeObserver=null;
const PATCH_DRAG_THRESHOLD_FINE=5,PATCH_DRAG_THRESHOLD_COARSE=9,PATCH_HYSTERESIS=.18;
function patchUpdateResponsiveClues(board,n){
  if(!board||!n)return;
  let q=board.getBoundingClientRect(),cell=Math.min(q.width,q.height)/Number(n);
  if(Number.isFinite(cell)&&cell>0)board.style.setProperty('--patch-cell-size',`${cell.toFixed(2)}px`)
}
function patchObserveResponsiveClues(board,n){
  if(patchClueResizeObserver){try{patchClueResizeObserver.disconnect()}catch(_){};patchClueResizeObserver=null}
  if(!board||!n)return;
  board.dataset.patchN=String(n);board.classList.add('patch-responsive-clues');patchUpdateResponsiveClues(board,n);
  if(typeof ResizeObserver==='function'){
    patchClueResizeObserver=new ResizeObserver(entries=>{for(const entry of entries){let target=entry.target,nn=Number(target.dataset.patchN)||n;if(target.isConnected)patchUpdateResponsiveClues(target,nn)}});
    patchClueResizeObserver.observe(board)
  }
}
function patchRefreshResponsiveClues(){
  if(current?.game!=='patches'&&walkthroughSession?.base?.game!=='patches')return;
  let board=$('#pboard')||app?.querySelector?.('.walkthrough-board.patch-responsive-clues');
  if(board)patchUpdateResponsiveClues(board,Number(board.dataset.patchN)||current?.n||walkthroughSession?.base?.n)
}
if(typeof window!=='undefined')window.addEventListener('resize',patchRefreshResponsiveClues,{passive:true});
function patchClueIdAt(r,c){
  if(!current?.clues||!current?.ids)return null;
  for(let id of current.ids){let pos=current.clues[id]?.pos;if(pos&&pos[0]===r&&pos[1]===c)return id}
  return null
}
function patchCellEl(r,c){let b=$('#pboard');return b?.children?.[r*current.n+c]||null}
function patchRect(a,b){
  let r0=Math.min(a[0],b[0]),r1=Math.max(a[0],b[0]),c0=Math.min(a[1],b[1]),c1=Math.max(a[1],b[1]),cells=[];
  for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)cells.push([r,c]);
  return {r0,r1,c0,c1,h:r1-r0+1,w:c1-c0+1,area:(r1-r0+1)*(c1-c0+1),cells}
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
function patchPointToCellHysteresis(x,y,previous,b=$('#pboard'),margin=PATCH_HYSTERESIS){
  let raw=patchPointToCell(x,y,b);if(!raw||!previous||!b||!current)return raw;
  let q=b.getBoundingClientRect(),n=current.n,cw=q.width/n,ch=q.height/n;
  let ux=(Math.max(q.left,Math.min(x,q.right-0.01))-q.left)/cw,uy=(Math.max(q.top,Math.min(y,q.bottom-0.01))-q.top)/ch;
  let r=raw[0],c=raw[1],pr=previous[0],pc=previous[1];
  if(Math.abs(c-pc)===1){if(c>pc&&ux<pc+1+margin)c=pc;else if(c<pc&&ux>pc-margin)c=pc}
  if(Math.abs(r-pr)===1){if(r>pr&&uy<pr+1+margin)r=pr;else if(r<pr&&uy>pr-margin)r=pr}
  return [Math.max(0,Math.min(n-1,r)),Math.max(0,Math.min(n-1,c))]
}
function updatePatchCellVisual(r,c){
  if(!current||current.game!=='patches'||r<0||c<0||r>=current.n||c>=current.n)return;
  let d=patchCellEl(r,c);if(!d)return;
  let id=current.paint[r][c];
  let fill=id==null?'#fff':current.pal[id%current.pal.length];
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
function patchRectForRegion(id){
  let known=current.patchSelectedRects?.[id];if(known)return {r0:known.r0,r1:known.r1,c0:known.c0,c1:known.c1};
  let cells=[];for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]===id)cells.push([r,c]);
  if(!cells.length)return null;let rs=cells.map(x=>x[0]),cs=cells.map(x=>x[1]);return {r0:Math.min(...rs),r1:Math.max(...rs),c0:Math.min(...cs),c1:Math.max(...cs)}
}
function patchResizeStart(id,x,y,b=$('#pboard')){
  let rect=patchRectForRegion(id);if(!rect||!b)return null;
  let q=b.getBoundingClientRect(),cw=q.width/current.n,ch=q.height/current.n;
  let corners=[
    {end:[rect.r0,rect.c0],anchor:[rect.r1,rect.c1]},
    {end:[rect.r0,rect.c1],anchor:[rect.r1,rect.c0]},
    {end:[rect.r1,rect.c0],anchor:[rect.r0,rect.c1]},
    {end:[rect.r1,rect.c1],anchor:[rect.r0,rect.c0]}
  ];
  for(let k of corners){k.x=q.left+(k.end[1]+.5)*cw;k.y=q.top+(k.end[0]+.5)*ch;k.d=(k.x-x)**2+(k.y-y)**2}
  let moving=corners.sort((a,b)=>a.d-b.d)[0];
  return {anchor:moving.anchor,end:moving.end,offsetX:moving.x-x,offsetY:moving.y-y}
}
function patchShapeForRect(rect){return rect.h===rect.w?'carré':rect.h>rect.w?'vertical':'horizontal'}
function patchPreviewInfo(anchor,end,lockedId=null){
  let rect=patchRect(anchor,end),clues=patchRectClues(rect),id=lockedId!=null?lockedId:(clues.length===1?clues[0]:null);
  let clueOK=clues.length===1&&(lockedId==null||clues[0]===lockedId);
  let overlap=clueOK&&patchRectOverlapsOther(rect,id),cl=id!=null?current.clues[id]:null;
  let areaOK=true,shapeOK=true;
  if(clueOK&&cl){
    if(cl.mode==='both'||cl.mode==='size')areaOK=rect.area===cl.size;
    if(cl.mode==='both'||cl.mode==='shape')shapeOK=patchShapeForRect(rect)===cl.shape
  }
  let reason=clues.length===0?'NO_CLUE':clues.length>1?'MULTIPLE_CLUES':lockedId!=null&&clues[0]!==lockedId?'WRONG_CLUE':overlap?'OVERLAP':!areaOK?'WRONG_AREA':!shapeOK?'WRONG_SHAPE':'VALID';
  let commitAllowed=clueOK&&!overlap,valid=commitAllowed&&areaOK&&shapeOK,warning=commitAllowed&&!valid;
  return {rect,clues,id,cl,clueOK,overlap,areaOK,shapeOK,commitAllowed,valid,warning,reason,lockedId}
}
function patchDragBadge(info){
  let badge=$('#patchDragBadge');if(!badge||!info)return;
  let n=current.n,r=info.rect,above=r.r0>0;
  badge.textContent=`${r.h} × ${r.w} · ${r.area}${!info.areaOK&&info.cl?.size!=null?` / ${info.cl.size}`:''} ${info.valid?'✓':info.warning?'!':'×'}`;
  badge.className='patch-drag-badge '+(info.valid?'valid':info.warning?'warning':'invalid')+(above?' above':' below');
  badge.style.left=`${((r.c0+r.c1+1)/(2*n))*100}%`;
  badge.style.top=above?`${(r.r0/n)*100}%`:`${((r.r1+1)/n)*100}%`;
  badge.hidden=false
}
function clearPatchPreview(){
  let b=$('#pboard');if(!b)return;
  b.classList.remove('patch-rect-dragging','patch-preview-invalid','patch-preview-warning','patch-preview-overlap-mode');
  for(let d of b.querySelectorAll('.patch-cell')){
    d.classList.remove('patch-preview','patch-preview-t','patch-preview-r','patch-preview-b','patch-preview-l','patch-preview-invalid-cell','patch-preview-overlap','patch-preview-clue-active','patch-preview-clue-conflict','patch-resize-source');
    d.style.removeProperty('--patch-preview-fill')
  }
  let badge=$('#patchDragBadge');if(badge)badge.hidden=true
}
function renderPatchPreview(anchor,end,lockedId=null){
  let b=$('#pboard');if(!b)return null;
  clearPatchPreview();
  let info=patchPreviewInfo(anchor,end,lockedId),color=info.id==null?'#d7d7d2':current.pal[info.id%current.pal.length];
  b.classList.add('patch-rect-dragging');
  if(info.warning)b.classList.add('patch-preview-warning');
  if(!info.commitAllowed)b.classList.add('patch-preview-invalid');
  if(info.reason==='OVERLAP')b.classList.add('patch-preview-overlap-mode');
  if(lockedId!=null)for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]===lockedId)patchCellEl(r,c)?.classList.add('patch-resize-source');
  for(let [r,c] of info.rect.cells){
    let d=patchCellEl(r,c);if(!d)continue;
    d.classList.add('patch-preview');d.style.setProperty('--patch-preview-fill',color);
    if(r===info.rect.r0)d.classList.add('patch-preview-t');
    if(r===info.rect.r1)d.classList.add('patch-preview-b');
    if(c===info.rect.c0)d.classList.add('patch-preview-l');
    if(c===info.rect.c1)d.classList.add('patch-preview-r');
    if(!info.commitAllowed)d.classList.add('patch-preview-invalid-cell');
    if(info.reason==='OVERLAP'&&current.paint[r][c]!=null&&current.paint[r][c]!==info.id)d.classList.add('patch-preview-overlap')
  }
  for(let clueId of info.clues){let pos=current.clues[clueId]?.pos,d=pos?patchCellEl(pos[0],pos[1]):null;if(d)d.classList.add(info.clues.length===1&&clueId===info.id?'patch-preview-clue-active':'patch-preview-clue-conflict')}
  patchDragBadge(info);return info
}
function schedulePatchDragPreview(anchor,end,lockedId=null){
  patchDragPending={anchor:[...anchor],end:[...end],lockedId};
  if(patchDragFrame)return;
  patchDragFrame=requestAnimationFrame(()=>{
    patchDragFrame=0;
    let p=patchDragPending;patchDragPending=null;
    if(p)renderPatchPreview(p.anchor,p.end,p.lockedId)
  })
}
function commitPatchRectangle(anchor,end,legacyId=null,lockedId=null){
  // legacyId is intentionally accepted for compatibility with existing tests/callers;
  // ownership is now always inferred from the single clue, or locked while resizing.
  if(lockedId==null&&legacyId!=null&&patchClueIdAt(anchor[0],anchor[1])===legacyId)lockedId=null;
  let before=historySnapshotKey(),info=patchPreviewInfo(anchor,end,lockedId);
  clearPatchPreview();
  if(!info.commitAllowed){captureRejectedPatchError(info);haptic(18);return false}
  let id=info.id,hadOld=current.paint.some(row=>row.some(v=>v===id));
  let rectKeys=new Set(info.rect.cells.map(([r,c])=>r+','+c));
  let overwrite=info.rect.cells.some(([r,c])=>current.paint[r][c]!=null&&current.paint[r][c]!==id);
  if(hadOld||overwrite)markBacktrack();
  current.patchLogicEvidence=patchEmptyEvidence();current.patchSelectedRects=current.patchSelectedRects||{};
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]===id&&!rectKeys.has(r+','+c))current.paint[r][c]=null;
  for(let [r,c] of info.rect.cells)current.paint[r][c]=id;
  current.patchSelectedRects[id]={r0:info.rect.r0,r1:info.rect.r1,c0:info.rect.c0,c1:info.rect.c1};
  current.active=id;drawP();historyRecord({type:'PATCH_RECTANGLE',region:id,rectangle:{r0:info.rect.r0,r1:info.rect.r1,c0:info.rect.c0,c1:info.rect.c1}},before);saveCurrent();updateScoreFlags();maybeAutoFinish();haptic(info.warning?12:8);
  let b=$('#pboard');if(b&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
    for(let [r,c] of info.rect.cells){let d=patchCellEl(r,c);d?.classList.add('patch-commit')}
    setTimeout(()=>{for(let [r,c] of info.rect.cells)patchCellEl(r,c)?.classList.remove('patch-commit')},180)
  }
  return true
}
function seedPatchClueCell(id,r,c){
  if(id==null||current.paint[r][c]!=null)return false;
  let before=historySnapshotKey();
  current.patchLogicEvidence=patchEmptyEvidence();current.patchSelectedRects=current.patchSelectedRects||{};delete current.patchSelectedRects[id];
  current.paint[r][c]=id;current.active=id;drawP();
  historyRecord({type:'PATCH_SEED',region:id,cell:[r,c]},before);saveCurrent();updateScoreFlags();maybeAutoFinish();haptic(6);return true
}
function removePatchRectangle(id){
  let before=historySnapshotKey(),changed=false;
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)if(current.paint[r][c]===id){current.paint[r][c]=null;changed=true}
  if(!changed)return false;
  current.patchLogicEvidence=patchEmptyEvidence();current.patchSelectedRects=current.patchSelectedRects||{};delete current.patchSelectedRects[id];
  markBacktrack();current.active=id;drawP();historyRecord({type:'PATCH_REMOVE',region:id},before);saveCurrent();updateScoreFlags();haptic(7);return true
}
function schedulePatchAfterPaint(){
  if(patchPaintFrame)return;
  patchPaintFrame=requestAnimationFrame(()=>{
    patchPaintFrame=0;
    let b=$('#pboard');if(!b||!current||current.game!=='patches')return;
    applyConfiguredIllegalClasses(b,patchIllegalCells(),current.n);
    updateScoreFlags();saveCurrent();maybeAutoFinish()
  })
}
function renderPatches(c){
  c.patchSelectedRects=c.patchSelectedRects||{};c.patchLogicEvidence=c.patchLogicEvidence||patchEmptyEvidence();
  shell(gameLabel('patches'),`${c.n}×${c.n} · ${tr('generated')}`,c.diff,
    `<div class="board-wrap patch-board-wrap"><div class="board" id="pboard" style="grid-template-columns:repeat(${c.n},minmax(0,1fr));grid-template-rows:repeat(${c.n},minmax(0,1fr))"></div><div class="patch-drag-badge" id="patchDragBadge" hidden aria-live="polite"></div></div><div class="legend patch-gesture-legend">↘︎ ${tr('patchesLegend')}</div>`,
    gameRules('patches'));
  app.querySelector('.panel')?.classList.add('patch-game-panel');
  let clueAt=new Map(c.ids.map(id=>[c.clues[id].pos.join(','),id]));
  let b=$('#pboard'),drag=null;
  for(let r=0;r<c.n;r++)for(let col=0;col<c.n;col++){
    let d=document.createElement('div');d.className='cell patch-cell';d.dataset.r=r;d.dataset.c=col;
    let clueId=clueAt.get(r+','+col);
    if(clueId!=null){d.classList.add('clue');d.dataset.clueId=clueId;d.innerHTML=clueHTML(c.clues[clueId])}
    else d.dataset.clueId='';
    b.appendChild(d)
  }
  patchObserveResponsiveClues(b,c.n);
  b.onpointerdown=e=>{
    if(paused||drag)return;e.preventDefault();
    // Resolve the cell from pointer coordinates instead of event.target. This keeps
    // taps/drags reliable when the pointer lands on the visual clue badge itself.
    let start=patchPointToCell(e.clientX,e.clientY,b);if(!start)return;
    let r=start[0],col=start[1],existing=current.paint[r][col],resize=existing!=null?patchResizeStart(existing,e.clientX,e.clientY,b):null;
    drag={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,threshold:coarsePointer()?PATCH_DRAG_THRESHOLD_COARSE:PATCH_DRAG_THRESHOLD_FINE,startExisting:existing,lockedId:existing,moved:false,offsetX:resize?.offsetX||0,offsetY:resize?.offsetY||0,anchor:resize?.anchor||start,end:resize?.end||start};
    try{b.setPointerCapture(e.pointerId)}catch(_){}haptic(4)
  };
  b.onpointermove=e=>{
    if(!drag||e.pointerId!==drag.pointerId)return;e.preventDefault();drag.lastX=e.clientX;drag.lastY=e.clientY;
    if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<drag.threshold)return;
    drag.moved=true;
    let px=e.clientX+drag.offsetX,py=e.clientY+drag.offsetY,cell=patchPointToCellHysteresis(px,py,drag.end,b);if(!cell)return;
    if(cell[0]===drag.end[0]&&cell[1]===drag.end[1]&&$('#patchDragBadge')&&!$('#patchDragBadge').hidden)return;
    drag.end=cell;schedulePatchDragPreview(drag.anchor,drag.end,drag.lockedId)
  };
  let finishDrag=(e,cancel=false)=>{
    if(!drag||e.pointerId!==drag.pointerId)return;
    try{b.releasePointerCapture(drag.pointerId)}catch(_){}
    let done=drag;drag=null;
    if(cancel){clearPatchPreview();return}
    if(!done.moved){
      clearPatchPreview();
      if(done.startExisting!=null)removePatchRectangle(done.startExisting);
      else {let clueId=patchClueIdAt(done.anchor[0],done.anchor[1]);if(clueId!=null)seedPatchClueCell(clueId,done.anchor[0],done.anchor[1])}
      return
    }
    let finalCell=patchPointToCellHysteresis(e.clientX+done.offsetX,e.clientY+done.offsetY,done.end,b);if(finalCell)done.end=finalCell;
    if(patchDragPending){patchDragPending=null}
    if(patchDragFrame){try{cancelAnimationFrame(patchDragFrame)}catch(_){};patchDragFrame=0}
    commitPatchRectangle(done.anchor,done.end,null,done.lockedId)
  };
  b.onpointerup=e=>finishDrag(e,false);
  b.onpointercancel=e=>finishDrag(e,true);
  drawP();
  $('#checkBtn').onclick=checkP;$('#hintBtn').onclick=hintP;
  $('#solutionBtn').onclick=()=>{if(paused)return;clearPatchPreview();current.paint=current.reg.map(r=>[...r]);current.patchSelectedRects={};for(const id of current.ids){let cells=current.cellsBy?.[id]||[],rs=cells.map(x=>x[0]),cs=cells.map(x=>x[1]);if(cells.length)current.patchSelectedRects[id]={r0:Math.min(...rs),r1:Math.max(...rs),c0:Math.min(...cs),c1:Math.max(...cs)}}current.patchLogicEvidence=patchEmptyEvidence();drawP();finish(tr('solutionShown'),'revealed')}
}
function clueHTML(cl){
  let parts=[];
  if(cl.mode==='both'||cl.mode==='size')parts.push(`<b>${cl.size}</b>`);
  if(cl.mode==='both'||cl.mode==='shape')parts.push(`<span class="patch-shape-icon ${cl.shape==='carré'?'square':cl.shape==='vertical'?'vertical':'horizontal'}" aria-hidden="true"></span>`);
  if(cl.mode==='none')parts.push('<b class="patch-question">?</b>');
  return `<span class="patch-clue${parts.length>1?' combined':''}">${parts.join('')}</span>`
}
function drawP(){
  let b=$('#pboard');if(!b||!current||current.game!=='patches')return;
  for(let r=0;r<current.n;r++)for(let c=0;c<current.n;c++)updatePatchCellVisual(r,c);
  applyIllegalClasses(b,patchIllegalCells(),current.n);
  updateScoreFlags()
}
function checkP(){let n=current.n,all=current.paint.every(row=>row.every(v=>v!==null));if(!all){status(tr('patchAll'),false);return}let cluePositions=new Map(current.ids.map(id=>[current.clues[id].pos.join(','),id]));for(let id of current.ids){let cells=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.paint[r][c]===id)cells.push([r,c]);if(!cells.length){status(tr('patchEach'),false);return}let own=current.clues[id].pos;if(!cells.some(([r,c])=>r===own[0]&&c===own[1])){status(tr('patchOwn'),false);return}let other=cells.some(([r,c])=>cluePositions.has(r+','+c)&&cluePositions.get(r+','+c)!==id);if(other){status(tr('patchTwo'),false);return}let seen=new Set([cells[0].join(',')]),q=[cells[0]],set=new Set(cells.map(x=>x.join(',')));while(q.length){let [r,c]=q.pop();for(let [rr,cc] of [[r+1,c],[r-1,c],[r,c+1],[r,c-1]]){let k=rr+','+cc;if(set.has(k)&&!seen.has(k)){seen.add(k);q.push([rr,cc])}}}if(seen.size!==cells.length){status(tr('patchConnected'),false);return}let cl=current.clues[id],sh=patchShape(cells);if(sh==='libre'){status(tr('patchRect'),false);return}if((cl.mode==='both'||cl.mode==='size')&&cells.length!==cl.size){status(tr('patchSize'),false);return}if((cl.mode==='both'||cl.mode==='shape')&&sh!==cl.shape){status(tr('patchShape'),false);return}}finish(`${tr('congrats')} ${gameLabel('patches')}`)}
function hintP(){
  if(current?.training)return trainingCoach();if(paused)return;if(showVisibleErrorsBeforeHint())return;if(showExplorationContradictionBeforeHint())return;
  if(!patchesLogicAvailable()){showHintNotice(tr('hintError'));return}
  let result;try{result=patchCurrentLogicResult()}catch(_){showHintNotice(tr('hintError'));return}
  if(result.contradiction){current.hintFlow=null;clearHintFocus();showHintNotice(`<b>⚠ ${tr('errorDetected')}</b><br>${patchLogicContradictionText(result.contradiction)}`);return}
  if(!result.deduction){current.hintFlow=null;clearHintFocus();showHintNotice(tr('plNoDeduction'));return}
  patchCoachHandleDeduction(result.deduction)
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



function growQueenTwoCellRegions(reg,sol,maxTwos=3){
  reg=reg.map(row=>[...row]);let n=reg.length,guard=0;
  while(queenTwoCellRegions(reg)>maxTwos&&guard++<n*n*4){
    let sizes=Array(n).fill(0);for(let row of reg)for(let id of row)sizes[id]++;
    let targets=shuffle(Array.from({length:n},(_,id)=>id).filter(id=>sizes[id]===2)),changed=false;
    for(let id of targets){
      let candidates=[];
      for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(reg[r][c]===id){
        for(let [rr,cc] of shuffle([[r+1,c],[r-1,c],[r,c+1],[r,c-1]])){
          if(rr<0||rr>=n||cc<0||cc>=n)continue;
          let donor=reg[rr][cc];
          if(donor===id||sizes[donor]<=3)continue;
          if(rr===donor&&cc===sol[donor])continue;
          if(!queenRegionConnectedAfterMove(reg,donor,rr,cc))continue;
          candidates.push([rr,cc,donor])
        }
      }
      if(candidates.length){
        let [rr,cc,donor]=candidates[Math.floor(Math.random()*candidates.length)];
        reg[rr][cc]=id;sizes[id]++;sizes[donor]--;changed=true;
        if(queenTwoCellRegions(reg)<=maxTwos)return reg
      }
    }
    if(!changed)break
  }
  return queenTwoCellRegions(reg)<=maxTwos?reg:null
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

// Frozen Queens generator used only to reproduce v2.21 friend-challenge generator V1 codes.
function generateQueensPuzzleLegacyV1(diff){
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
function legacyQueenCandidateV1(diff){let g=generateQueensPuzzleLegacyV1(diff);g.rating=analyzeQueens(g.reg);return g}

// Frozen Queens generator used only to reproduce v2.21.2 friend-challenge generator V2 codes.
function generateQueensPuzzleLegacyV2(diff){
  const cfg={
    easy:{n:6,single:4,maxSingles:99,attempts:260},
    medium:{n:7,single:3,maxSingles:99,attempts:520},
    hard:{n:8,single:6,maxSingles:0,attempts:520},
    expert:{n:9,single:3,maxSingles:0,attempts:320}
  }[diff];
  if(!cfg)throw new Error('Unknown Queens difficulty');
  for(let t=0;t<cfg.attempts;t++){
    let sol=randomQueenSolution(cfg.n);if(!sol)continue;
    let reg=queenRegionsFromSolution(sol,cfg.single);if(!reg)continue;
    if(cfg.maxSingles===0){reg=reduceQueenSingletons(reg,sol,0);if(!reg)continue}
    if(countQueensGenerated(reg,2)!==1)continue;
    let profile=analyzeQueensLogicProfile(reg,{diff,budgetMs:Infinity});
    if(queenProfileMatchesDifficulty(profile,diff))return {n:cfg.n,sol,reg,logicProfile:queenCompactProfile(profile)}
  }
  if(diff==='hard'||diff==='expert')return transformedQueenFallbackV2(diff);
  throw new Error('Queens generation failed for requested logical profile')
}
function legacyQueenCandidateV2(diff){let g=generateQueensPuzzleLegacyV2(diff);g.rating=queenProfileRating(g.reg,g.logicProfile);return g}

const queenStrictFallbackV2={
  hard:{sol:[7,0,6,4,2,5,3,1],reg:[[2,2,2,2,2,2,2,0],[1,2,2,2,2,2,2,0],[1,2,2,2,2,2,2,2],[2,2,2,3,3,2,2,2],[2,6,4,6,2,2,2,2],[6,6,4,6,5,5,2,2],[6,6,6,6,6,2,2,2],[6,7,7,6,6,6,2,2]]}
};
function transformedQueenFallbackV2(diff){
  let base=diff==='hard'?queenStrictFallbackV2.hard:queenStrictFallback.expert,k=Math.floor(Math.random()*8),reg=transformGrid(base.reg,k),n=reg.length,mask=base.sol.map((c,r)=>Array.from({length:n},(_,j)=>j===c?1:0));
  mask=transformGrid(mask,k);let sol=Array(n).fill(-1);for(let r=0;r<n;r++)sol[r]=mask[r].indexOf(1);
  let profile=analyzeQueensLogicProfile(reg,{diff,budgetMs:Infinity});
  if(!queenProfileMatchesDifficulty(profile,diff))throw new Error('Queens strict fallback profile mismatch');
  return {n,sol,reg,logicProfile:queenCompactProfile(profile)}
}
const queenStrictFallbackV3={
  hard:{sol:[5,0,4,6,3,8,2,7,1],reg:[[5,5,5,5,5,0,5,5,5],[1,5,5,5,5,0,5,5,5],[1,5,5,5,2,5,5,5,5],[5,5,5,5,2,3,3,5,5],[5,5,4,4,5,5,5,5,5],[5,5,6,5,5,5,5,5,5],[5,5,6,5,5,5,5,5,5],[5,5,5,5,5,5,7,7,5],[8,8,5,5,5,5,5,5,5]]}
};
function transformedQueenFallbackV3(diff){
  let base=diff==='hard'?queenStrictFallbackV3.hard:queenStrictFallback.expert,k=Math.floor(Math.random()*8),reg=transformGrid(base.reg,k),n=reg.length,mask=base.sol.map((c,r)=>Array.from({length:n},(_,j)=>j===c?1:0));
  mask=transformGrid(mask,k);let sol=Array(n).fill(-1);for(let r=0;r<n;r++)sol[r]=mask[r].indexOf(1);
  let profile=analyzeQueensLogicProfile(reg,{diff,budgetMs:Infinity});
  if(!queenProfileMatchesDifficulty(profile,diff))throw new Error('Queens strict fallback profile mismatch');
  return {n,sol,reg,logicProfile:queenCompactProfile(profile)}
}


// Frozen Queens generator used only to reproduce v2.21.3–v2.21.8 friend-challenge generator V3 codes.

const queenStrictFallbackV4={
  hard:{sol:[4,0,3,8,2,7,5,1,6],reg:[[4,4,4,4,0,0,0,4,4],[1,1,1,4,4,4,4,4,4],[4,4,4,2,2,4,4,4,3],[4,4,4,4,4,4,4,4,3],[4,4,4,4,4,4,4,4,4],[4,4,4,4,4,4,5,5,4],[7,7,4,4,4,6,6,5,4],[4,7,4,4,4,4,8,4,4],[4,4,4,4,4,4,8,8,4]]}
};
function transformedQueenFallbackV4(diff){
  let base=diff==='hard'?queenStrictFallbackV4.hard:queenStrictFallback.expert,k=Math.floor(Math.random()*8),reg=transformGrid(base.reg,k),n=reg.length,mask=base.sol.map((c,r)=>Array.from({length:n},(_,j)=>j===c?1:0));
  mask=transformGrid(mask,k);let sol=Array(n).fill(-1);for(let r=0;r<n;r++)sol[r]=mask[r].indexOf(1);
  if(countQueensGenerated(reg,2)!==1)throw new Error('Queens strict fallback uniqueness mismatch');
  let profile=analyzeQueensLogicProfile(reg,{diff,budgetMs:Infinity});
  if(!queenGenerationMatchesDifficulty(reg,profile,diff))throw new Error('Queens strict fallback profile mismatch');
  return {n,sol,reg,logicProfile:queenCompactProfile(profile)}
}

function generateQueensPuzzleLegacyV3(diff){
  const cfg={
    easy:{n:7,single:4,maxSingles:99,attempts:320},
    medium:{n:8,single:3,maxSingles:99,attempts:620},
    hard:{n:9,single:8,maxSingles:0,attempts:620},
    expert:{n:9,single:3,maxSingles:0,attempts:320}
  }[diff];
  if(!cfg)throw new Error('Unknown Queens difficulty');
  for(let t=0;t<cfg.attempts;t++){
    let sol=randomQueenSolution(cfg.n);if(!sol)continue;
    let reg=queenRegionsFromSolution(sol,cfg.single);if(!reg)continue;
    if(cfg.maxSingles===0){reg=reduceQueenSingletons(reg,sol,0);if(!reg)continue}
    if(countQueensGenerated(reg,2)!==1)continue;
    let profile=analyzeQueensLogicProfile(reg,{diff,budgetMs:Infinity});
    if(queenProfileMatchesDifficulty(profile,diff))return {n:cfg.n,sol,reg,logicProfile:queenCompactProfile(profile)}
  }
  if(diff==='hard'||diff==='expert')return transformedQueenFallbackV3(diff);
  throw new Error('Queens generation failed for requested logical profile')
}
function legacyQueenCandidateV3(diff){let g=generateQueensPuzzleLegacyV3(diff);g.rating=queenProfileRating(g.reg,g.logicProfile);return g}

function generateQueensPuzzle(diff){
  const cfg={
    easy:{n:7,single:4,maxSingles:99,maxTwos:99,attempts:320},
    medium:{n:8,single:3,maxSingles:99,maxTwos:99,attempts:620},
    hard:{n:9,single:8,maxSingles:0,maxTwos:3,attempts:900},
    expert:{n:9,single:3,maxSingles:0,maxTwos:3,attempts:520}
  }[diff];
  if(!cfg)throw new Error('Unknown Queens difficulty');
  for(let t=0;t<cfg.attempts;t++){
    let sol=randomQueenSolution(cfg.n);if(!sol)continue;
    let reg=queenRegionsFromSolution(sol,cfg.single);if(!reg)continue;
    if(cfg.maxSingles===0){reg=reduceQueenSingletons(reg,sol,0);if(!reg)continue}
    if(cfg.maxTwos<99){reg=growQueenTwoCellRegions(reg,sol,cfg.maxTwos);if(!reg)continue}
    if(countQueensGenerated(reg,2)!==1)continue;
    let profile=analyzeQueensLogicProfile(reg,{diff,budgetMs:Infinity});
    if(queenGenerationMatchesDifficulty(reg,profile,diff))return {n:cfg.n,sol,reg,logicProfile:queenCompactProfile(profile)}
  }
  if(diff==='hard'||diff==='expert')return transformedQueenFallbackV4(diff);
  throw new Error('Queens generation failed for requested logical/region profile')
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
function patches(diff){let g=generatePatchesPuzzle(diff);const pal=['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1'];current={game:'patches',diff,n:g.n,reg:g.reg,ids:g.ids,cellsBy:g.cellsBy,clues:g.clues,pal,active:g.ids[0],paint:Array.from({length:g.n},()=>Array(g.n).fill(null)),patchSelectedRects:{},patchLogicEvidence:patchEmptyEvidence(),generated:true,unique:true,completed:false};renderPatches(current)}

function keyboardInput(e){if(!current||paused||current.completed)return;if(current.game==='sudoku'&&current.sel){let next=null,n=Number(e.key);if(n>=1&&n<=6)next=n;else if(e.key==='Backspace'||e.key==='Delete'||e.key==='0')next=0;if(next==null)return;let [r,c]=current.sel;if(!current.empty.has(r*6+c))return;e.preventDefault();let prev=current.state[r][c];if(prev===next)return;let before=historySnapshotKey();closeHintNotice();current.hintFlow=null;clearHintFocus();if(prev!==0&&prev!==next)markBacktrack();current.state[r][c]=next;haptic(next?6:5);drawS();historyRecord({type:'SET_DIGIT',primaryTarget:[r,c],input:'keyboard'},before);saveCurrent();updateScoreFlags();maybeAutoFinish()}}
document.addEventListener('keydown',keyboardInput);
function status(t,ok){let s=$('#status');if(!s)return;s.textContent=t;s.className='status '+(ok?'ok':'bad');if(!ok)playTone('error')}
function finish(t,outcome='solved'){let total=timerSeconds(),snapshot=current?{...current}:null;stopTimer(false);elapsedBase=total;startedAt=0;paused=true;if(current){statsFinish(current,total,outcome);markDaily(current,outcome,total);current.completed=true;if(current.game==='patches')applyUnjustifiedHighlights()}clearSaved();renderTimer();status(`${t} — ${fmt(elapsedBase)}`,true);updatePauseButton();if(outcome==='solved'&&snapshot)requestAnimationFrame(()=>{celebrateBoard();setTimeout(()=>victoryOverlay(snapshot,total),2100)})}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&current&&!current.completed)saveCurrent()});window.addEventListener('pagehide',()=>{if(current&&!current.completed)saveCurrent()});if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
applyPrefs();try{window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(prefs().theme==='auto')applyPrefs()})}catch(_){}initialView();


// ===== v1.3 — analyseurs de difficulté =====
function collectCandidates(factory,count){let out=[],guard=0;while(out.length<count&&guard++<count*4){try{out.push(factory())}catch(_){}}if(!out.length)throw new Error('generation failed');return out}
function targetPick(items,diff){items=items.filter(x=>x&&x.rating&&Number.isFinite(x.rating.score)).sort((a,b)=>a.rating.score-b.rating.score);if(!items.length)throw new Error('difficulty analysis failed');return diff==='easy'?items[0]:(diff==='hard'||diff==='expert')?items[items.length-1]:items[Math.floor((items.length-1)/2)]}
function labelTechnique(kind,level){const maps={"fr":{"sudoku":["single nu","single caché","blocage logique"],"tango":["équilibrage / trio","relation = / ×","chaîne de contraintes"],"patches":["rectangle forcé","couverture forcée","enchaînement spatial"],"queens":["contrainte ligne/zone","propagation croisée","recherche contrainte"]},"en":{"sudoku":["naked single","hidden single","logical stall"],"tango":["balance / triple","relation = / ×","constraint chain"],"patches":["forced rectangle","forced coverage","spatial chain"],"queens":["row/region constraint","cross propagation","constraint search"]},"zh":{"sudoku":["显性唯一","隐性唯一","逻辑阻塞"],"tango":["平衡 / 三连","关系 = / ×","约束链"],"patches":["强制矩形","强制覆盖","空间链"],"queens":["行/区域约束","交叉传播","约束搜索"]},"hi":{"sudoku":["प्रत्यक्ष एकल","छिपा एकल","तार्किक अवरोध"],"tango":["संतुलन / तिकड़ी","संबंध = / ×","बाधा श्रृंखला"],"patches":["अनिवार्य आयत","अनिवार्य आवरण","स्थानिक श्रृंखला"],"queens":["पंक्ति/क्षेत्र बाधा","क्रॉस प्रसार","बाधा खोज"]},"es":{"sudoku":["único desnudo","único oculto","bloqueo lógico"],"tango":["equilibrio / triple","relación = / ×","cadena de restricciones"],"patches":["rectángulo forzado","cobertura forzada","cadena espacial"],"queens":["restricción fila/región","propagación cruzada","búsqueda de restricciones"]},"ar":{"sudoku":["مفرد ظاهر","مفرد مخفي","توقف منطقي"],"tango":["توازن / ثلاثي","علاقة = / ×","سلسلة قيود"],"patches":["مستطيل مفروض","تغطية مفروضة","سلسلة مكانية"],"queens":["قيد صف/منطقة","انتشار متقاطع","بحث بالقيود"]},"bn":{"sudoku":["প্রকাশ্য একক","গোপন একক","যুক্তিগত বাধা"],"tango":["ভারসাম্য / তিনটি","সম্পর্ক = / ×","নিয়মের শৃঙ্খল"],"patches":["বাধ্যতামূলক আয়তক্ষেত্র","বাধ্যতামূলক আবরণ","স্থানিক শৃঙ্খল"],"queens":["সারি/অঞ্চল নিয়ম","ক্রস প্রসারণ","নিয়ম অনুসন্ধান"]},"pt":{"sudoku":["único nu","único oculto","bloqueio lógico"],"tango":["equilíbrio / trio","relação = / ×","cadeia de restrições"],"patches":["retângulo forçado","cobertura forçada","cadeia espacial"],"queens":["restrição linha/região","propagação cruzada","busca por restrições"]},"id":{"sudoku":["tunggal langsung","tunggal tersembunyi","hambatan logis"],"tango":["keseimbangan / tiga","relasi = / ×","rantai batasan"],"patches":["persegi panjang wajib","cakupan wajib","rantai spasial"],"queens":["batasan baris/wilayah","propagasi silang","pencarian batasan"]},"ur":{"sudoku":["ظاہری واحد","پوشیدہ واحد","منطقی رکاوٹ"],"tango":["توازن / تین","تعلق = / ×","پابندیوں کی زنجیر"],"patches":["لازمی مستطیل","لازمی کوریج","مکانی زنجیر"],"queens":["قطار/علاقہ پابندی","کراس پھیلاؤ","پابندی تلاش"]}},m=maps[lang()]||maps.en;return m[kind][Math.min(level,2)]}
function analyzeSudoku(sol,empty){let g=sol.map((r,ri)=>r.map((v,c)=>empty.has(ri*6+c)?0:v)),steps=0,hidden=0;function cand(r,c){let s=new Set([1,2,3,4,5,6]);for(let i=0;i<6;i++){s.delete(g[r][i]);s.delete(g[i][c])}let br=Math.floor(r/2)*2,bc=Math.floor(c/3)*3;for(let rr=br;rr<br+2;rr++)for(let cc=bc;cc<bc+3;cc++)s.delete(g[rr][cc]);return [...s]}let guard=0;while(g.some(r=>r.includes(0))&&guard++<100){let progress=false;for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(!g[r][c]){let a=cand(r,c);if(a.length===1){g[r][c]=a[0];steps++;progress=true}}if(progress)continue;let units=[];for(let r=0;r<6;r++)units.push(Array.from({length:6},(_,c)=>[r,c]));for(let c=0;c<6;c++)units.push(Array.from({length:6},(_,r)=>[r,c]));for(let br=0;br<6;br+=2)for(let bc=0;bc<6;bc+=3){let u=[];for(let r=br;r<br+2;r++)for(let c=bc;c<bc+3;c++)u.push([r,c]);units.push(u)}outer:for(let u of units)for(let v=1;v<=6;v++){let ps=u.filter(([r,c])=>!g[r][c]&&cand(r,c).includes(v));if(ps.length===1){g[ps[0][0]][ps[0][1]]=v;steps++;hidden++;progress=true;break outer}}if(!progress)break}let remain=g.flat().filter(x=>!x).length,level=remain?2:hidden?1:0,score=Math.round(steps+hidden*2+remain*5);return {score,technique:labelTechnique('sudoku',level),solved:remain===0,remain,level}}
function tangoLocalVals(grid,edges,r,c){let vals=[];for(let v of [0,1]){let row=grid[r].slice();row[c]=v;let ones=row.filter(x=>x===1).length,zeros=row.filter(x=>x===0).length;if(ones>3||zeros>3)continue;let bad=false;for(let i=0;i<4;i++)if(row[i]!==-1&&row[i]===row[i+1]&&row[i]===row[i+2])bad=true;let col=grid.map((x,rr)=>rr===r?v:x[c]),co=col.filter(x=>x===1).length,cz=col.filter(x=>x===0).length;if(co>3||cz>3)bad=true;for(let i=0;i<4;i++)if(col[i]!==-1&&col[i]===col[i+1]&&col[i]===col[i+2])bad=true;for(let [rr,cc,d,s] of edges){let r2=d==='r'?rr:rr+1,c2=d==='r'?cc+1:cc;if((rr===r&&cc===c)||(r2===r&&c2===c)){let other=(rr===r&&cc===c)?grid[r2][c2]:grid[rr][cc];if(other!==-1&&((s==='='&&v!==other)||(s==='×'&&v===other)))bad=true}}if(!bad)vals.push(v)}return vals}
function analyzeTango(sol,givens,edges){let g=Array.from({length:6},()=>Array(6).fill(-1));for(let i of givens)g[Math.floor(i/6)][i%6]=sol[Math.floor(i/6)][i%6];let steps=0,rel=0,guard=0;while(g.flat().includes(-1)&&guard++<100){let progress=false;for(let [r,c,d,s] of edges){let r2=d==='r'?r:r+1,c2=d==='r'?c+1:c,a=g[r][c],b=g[r2][c2];if(a!==-1&&b===-1){g[r2][c2]=s==='='?a:1-a;steps++;rel++;progress=true}else if(b!==-1&&a===-1){g[r][c]=s==='='?b:1-b;steps++;rel++;progress=true}}for(let r=0;r<6;r++)for(let c=0;c<6;c++)if(g[r][c]===-1){let vals=tangoLocalVals(g,edges,r,c);if(vals.length===1){g[r][c]=vals[0];steps++;progress=true}}if(!progress)break}let remain=g.flat().filter(x=>x===-1).length,level=remain?2:rel?1:0,score=Math.round(steps+rel*1.5+remain*3);return {score,technique:labelTechnique('tango',level),solved:remain===0,remain,level}}
function analyzePatches(n,ids,clues){let positions=ids.map(id=>clues[id].pos),opts={};for(let id of ids)opts[id]=possiblePatchRects(n,clues[id],positions);let chosen=new Map(),covered=new Set(),steps=0,coverForced=0,guard=0;while(chosen.size<ids.length&&guard++<100){let progress=false;for(let id of ids)if(!chosen.has(id)){let a=opts[id].filter(c=>c.every(x=>!covered.has(x)));if(a.length===1){chosen.set(id,a[0]);a[0].forEach(x=>covered.add(x));steps++;progress=true}}if(progress)continue;for(let cell=0;cell<n*n;cell++)if(!covered.has(cell)){let owners=[];for(let id of ids)if(!chosen.has(id))for(let cells of opts[id])if(cells.includes(cell)&&cells.every(x=>!covered.has(x)))owners.push([id,cells]);let uniq=[...new Set(owners.map(x=>x[0]))];if(uniq.length===1){let id=uniq[0],arr=owners.filter(x=>x[0]===id);if(arr.length===1){chosen.set(id,arr[0][1]);arr[0][1].forEach(x=>covered.add(x));steps++;coverForced++;progress=true;break}}}if(!progress)break}let remain=ids.length-chosen.size,level=remain?2:coverForced?1:0,branch=ids.reduce((s,id)=>s+Math.max(0,opts[id].length-1),0),score=Math.round(steps+coverForced*2+remain*5+branch*.25);return {score,technique:labelTechnique('patches',level),solved:remain===0,remain,level}}

// v2.21.2 — measured Queens logical difficulty profile.
function queenLogicalComplete(){
  if(!current||current.game!=='queens')return false;
  let n=current.n,queens=[];
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(current.state[r][c]===2)queens.push([r,c]);
  if(queens.length!==n)return false;
  if(new Set(queens.map(x=>x[0])).size!==n||new Set(queens.map(x=>x[1])).size!==n)return false;
  if(new Set(queens.map(([r,c])=>current.reg[r][c])).size!==n)return false;
  return !queenStateContradiction()
}
function applyQueenProfileHint(h){
  if(!h||h.timeout||!Number.isInteger(h.r)||!Number.isInteger(h.c)||![1,2].includes(h.v))return false;
  if(current.state[h.r][h.c]!==0)return false;
  current.state[h.r][h.c]=h.v;return true
}
function queenRegionSizeCount(reg,size){
  let sizes={};for(let id of reg.flat())sizes[id]=(sizes[id]||0)+1;
  return Object.values(sizes).filter(x=>x===size).length
}
function queenSingletonRegions(reg){return queenRegionSizeCount(reg,1)}
function queenTwoCellRegions(reg){return queenRegionSizeCount(reg,2)}
function analyzeQueensLogicProfile(reg,options={}){
  let n=reg.length,previous=current,deadline=Date.now()+(options.budgetMs||2500),profile={
    rank0:0,rank1:0,rank2:0,rank3:0,singletonRegions:queenSingletonRegions(reg),twoCellRegions:queenTwoCellRegions(reg),
    solvedLogically:false,timeout:false,stalled:false,sequence:[]
  };
  current={game:'queens',diff:options.diff||'medium',n,reg:reg.map(r=>[...r]),state:Array.from({length:n},()=>Array(n).fill(0)),completed:false};
  try{
    let guard=0,maxSteps=n*n*5;
    while(!queenLogicalComplete()&&guard++<maxSteps){
      if(Date.now()>=deadline){profile.timeout=true;break}
      let direct=findQueenLogicalHint();
      if(direct){
        if(!applyQueenProfileHint(direct)){profile.stalled=true;break}
        profile.rank0++;profile.sequence.push({rank:0,technique:direct.technique||null,r:direct.r,c:direct.c,v:direct.v});continue
      }
      let h=findQueenRank1Hint(deadline);
      if(h?.timeout){profile.timeout=true;break}
      if(h){
        if(!applyQueenProfileHint(h)){profile.stalled=true;break}
        profile.rank1++;profile.sequence.push({rank:1,technique:h.technique||'Q_CONTRADICTION_R1',r:h.r,c:h.c,v:h.v});continue
      }
      h=findQueenRank2Hint(deadline);
      if(h?.timeout){profile.timeout=true;break}
      if(h){
        if(!applyQueenProfileHint(h)){profile.stalled=true;break}
        profile.rank2++;profile.sequence.push({rank:2,technique:h.technique||'Q_CONTRADICTION_R2',r:h.r,c:h.c,v:h.v});continue
      }
      h=findQueenRank3Hint(deadline);
      if(h?.timeout){profile.timeout=true;break}
      if(h){
        if(!applyQueenProfileHint(h)){profile.stalled=true;break}
        profile.rank3++;profile.sequence.push({rank:3,technique:h.technique||'Q_CONTRADICTION_R3',r:h.r,c:h.c,v:h.v});continue
      }
      profile.stalled=true;break
    }
    profile.solvedLogically=queenLogicalComplete();
    profile.maxRank=profile.rank3?3:profile.rank2?2:profile.rank1?1:0;
    return profile
  }finally{current=previous}
}


function queenProfileMatchesDifficulty(profile,diff){
  if(!profile||!profile.solvedLogically||profile.timeout||profile.stalled||profile.rank3!==0)return false;
  if(diff==='easy')return profile.rank1<=1&&profile.rank2===0;
  if(diff==='medium')return profile.rank1>=2&&profile.rank2===0;
  if(diff==='hard')return profile.singletonRegions===0&&profile.rank1>=3&&profile.rank2<=1;
  if(diff==='expert')return profile.singletonRegions===0&&profile.rank2>=1;
  return false
}
function queenRegionStructureMatchesDifficulty(reg,diff){
  if(diff==='hard'||diff==='expert')return queenSingletonRegions(reg)===0&&queenTwoCellRegions(reg)<=3;
  return true
}
function queenGenerationMatchesDifficulty(reg,profile,diff){
  return queenProfileMatchesDifficulty(profile,diff)&&queenRegionStructureMatchesDifficulty(reg,diff)
}
function queenCompactProfile(profile){
  return {rank0:profile.rank0,rank1:profile.rank1,rank2:profile.rank2,rank3:profile.rank3,
    singletonRegions:profile.singletonRegions,twoCellRegions:profile.twoCellRegions,solvedLogically:profile.solvedLogically,
    timeout:!!profile.timeout,stalled:!!profile.stalled,maxRank:profile.maxRank};
}
function queenProfileSummary(profile){
  return `R0 ${profile.rank0} · R1 ${profile.rank1} · R2 ${profile.rank2} · R3 ${profile.rank3}`;
}
function queenProfileRating(reg,profile){
  let legacy=analyzeQueens(reg),level=profile.rank2?2:profile.rank1?1:0;
  return {...legacy,technique:labelTechnique('queens',level),logicProfile:{
    rank0:profile.rank0,rank1:profile.rank1,rank2:profile.rank2,rank3:profile.rank3,
    singletonRegions:profile.singletonRegions,twoCellRegions:profile.twoCellRegions,solvedLogically:profile.solvedLogically,maxRank:profile.maxRank
  }}
}

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
  let g=null;
  if(dailyRequest)g=queenCandidate(diff);
  else{
    let seen=queenSessionSet(day);
    for(let tries=0;tries<40;tries++){
      let x=queenCandidate(diff),sig=queenCanonicalSignature(x.reg);
      if(seen.has(sig))continue;g=x;break
    }
    if(!g)throw new Error(lang()==='fr'?'Aucune nouvelle grille Couronnes conforme au profil logique n’a pu être générée.':'No fresh Crowns grid matching the logical profile could be generated.')
  }
  rememberQueenGeneratedThisSession(g.reg,day);return g
}

function queenCandidate(diff){let g=generateQueensPuzzle(diff);g.rating=queenProfileRating(g.reg,g.logicProfile);return g}
function tangoCandidate(diff){let g=generateTangoPuzzle(diff);g.rating=analyzeTango(g.sol,g.givens,g.edges);return g}
function sudokuCandidate(diff){let sol=randomSudokuSolution(),holes={easy:16,medium:22,hard:27}[diff],empty=makeSudokuHoles(sol,holes);return {sol,empty,rating:analyzeSudoku(sol,empty)}}
function patchesCandidate(diff){let g=generatePatchesPuzzle(diff);g.rating=analyzePatches(g.n,g.ids,g.clues);return g}
function queens(diff){let dailyRequest=!!current?.daily,day=current?.dailyDay||localDay(),g=!dailyRequest?takePrecomputed('queens',diff,day):null;if(!g)g=queenCandidateForDisplay(diff,dailyRequest,day);current={game:'queens',diff,n:g.n,reg:g.reg,sol:g.sol,rating:g.rating,state:Array.from({length:g.n},()=>Array(g.n).fill(0)),generated:true,unique:true,completed:false};renderQueens(current)}
function tango(diff){let dailyRequest=!!current?.daily,g=!dailyRequest?takePrecomputed('tango',diff):null;if(!g)g=targetPick(collectCandidates(()=>tangoCandidate(diff),6),diff);let state=Array.from({length:6},()=>Array(6).fill(-1));for(let i of g.givens)state[Math.floor(i/6)][i%6]=g.sol[Math.floor(i/6)][i%6];current={game:'tango',diff,n:6,sol:g.sol,givens:g.givens,edges:g.edges,rating:g.rating,state,tangoDerivedRelations:[],generated:true,unique:true,completed:false};renderTango(current)}
function sudoku(diff){let dailyRequest=!!current?.daily,g=!dailyRequest?takePrecomputed('sudoku',diff):null;if(!g)g=targetPick(collectCandidates(()=>sudokuCandidate(diff),8),diff);let sol=g.sol,empty=g.empty;current={game:'sudoku',diff,n:6,sol,empty,rating:g.rating,state:sol.map((r,ri)=>r.map((v,c)=>empty.has(ri*6+c)?0:v)),sel:null,generated:true,unique:true,completed:false};renderSudoku(current)}
function patches(diff){let dailyRequest=!!current?.daily,g=!dailyRequest?takePrecomputed('patches',diff):null;if(!g)g=targetPick(collectCandidates(()=>patchesCandidate(diff),diff==='hard'?5:4),diff);const pal=['#f3c6a8','#b9d9c1','#c6d4ed','#e2c3df','#f0dc9d','#c7e0e3','#d5ceb8','#d4e3b4','#edbfc1','#c8c4e8','#e5d0a4','#b7d7d1'];current={game:'patches',diff,n:g.n,reg:g.reg,ids:g.ids,cellsBy:g.cellsBy,clues:g.clues,rating:g.rating,pal,active:g.ids[0],paint:Array.from({length:g.n},()=>Array(g.n).fill(null)),patchSelectedRects:{},patchLogicEvidence:patchEmptyEvidence(),generated:true,unique:true,completed:false};renderPatches(current)}
