# QUADLUD — v2.21.13

Application web statique mobile-first regroupant **Couronnes**, **Soleil-Lune**, **Grille 6** et **Rectangles**.

## v2.21.13 — Rectangles : manipulation directe et interface tactile

Cette version affine l’interface de **Rectangles** sans modifier son moteur logique ni son générateur. L’objectif est de rapprocher le geste de jeu d’une manipulation directe de rectangles, avec une grille plus lisible et plus prioritaire sur mobile.

### Interaction
- Suppression de la palette « Zone 1 / Zone 2… » : la zone est déterminée automatiquement par l’unique indice contenu dans le rectangle.
- **Drag élastique** : le rectangle suit le pointeur en temps réel et peut grandir ou rétrécir avant le relâchement.
- **Tap sur un rectangle = suppression** ; un tap sur une case vide ne crée rien.
- **Drag sur un rectangle existant = redimensionnement** : le coin le plus proche du point de départ devient le coin mobile et le coin opposé reste fixe.
- Seuil en pixels pour distinguer tap et drag, avec **hystérésis de franchissement des cases** afin de stabiliser les gestes sur les grilles denses, notamment 10×10.
- Un `pointercancel` annule la preview sans modifier la partie.

### Prévisualisation et lisibilité
- Badge flottant pendant le drag : `hauteur × largeur · aire`.
- Preview **verte** lorsqu’elle respecte les contraintes explicites de l’indice, **orange** pour une surface/forme incorrecte mais encore enregistrable afin que le Coach puisse expliquer l’erreur, et **rouge** lorsqu’elle est structurellement impossible (aucun/deux indices ou chevauchement).
- Pour une surface incorrecte, le badge affiche aussi l’aire attendue (`aire / attendu`).
- Lors d’un chevauchement, les seules cases réellement conflictuelles sont accentuées.
- Pendant un redimensionnement, l’ancien rectangle est atténué sans être modifié avant le relâchement.
- Les glyphes Unicode `□ / ▯ / ▭` sont remplacés par de vrais pictogrammes CSS carré/vertical/horizontal, indépendants de la police.
- Les cases-indices n’ont plus de fond beige ; les indices apparaissent comme de petits badges au-dessus d’une grille uniforme.
- Les lignes internes sont allégées et le périmètre des rectangles est plus marqué, avec coins visuellement adoucis.

### Mobile / iPhone
- Sur écran étroit, la **grille passe avant la barre d’actions** afin de rester l’élément dominant.
- La première rangée d’actions sous la grille est `Annuler / Refaire / Logic Coach / Tuteur`.
- `Règles` reste directement accessible ; les règles détaillées permanentes sous la grille sont retirées pour Rectangles.
- Les autres jeux conservent leur disposition actuelle.
- Le moteur Rectangles reste générique 5×5–10×10 ; le générateur reste inchangé en 5×5/6×6/7×7.

### Validation v2.21.13
- Suites moteur Rectangles : **6/6 OK**.
- Test statique d’intégration UI : **OK** (palette absente, pictogrammes CSS, redimensionnement par coin, hystérésis, preview surface/forme, layout mobile board-first).
- Smoke Chromium Rectangles : **OK**, y compris drag 2×2, tap vide, tap suppression, redimensionnement 2×2→3×3, hystérésis, avertissements surface/forme, Coach, Undo/Redo, Tuteur, FR/EN et grille synthétique 10×10 sur viewport tactile 390×844.
- Safari/iPhone physique : **non exécuté** dans cet environnement.

## v2.21.12 — moteur d’inférences Rectangles explicable partagé par le Coach et le Tuteur

Cette version reconstruit **Rectangles** autour d’un moteur d’inférences pur et explicable, commun au Logic Coach, au Tuteur et à l’audit logique des coups. Le moteur raisonne uniquement depuis les indices, l’état visible du joueur et les faits déjà démontrés ; il ne lit pas la solution finale pour fabriquer une justification.

### Architecture et domaines
- Nouveau fichier pur **`patches-logic.js`**, sans DOM et sans accès à la solution finale cachée.
- Un indice est normalisé en contraintes indépendantes `area` et `shape` : surface+forme, surface seule, forme seule, ou `?` avec `area=null` et `shape=null`.
- Chaque indice possède un domaine de rectangles candidats : dans la grille, contenant son propre indice, sans autre indice, compatible avec surface, forme et faits logiques courants.
- Les formes restent strictement celles des règles : carré `height == width`, vertical `height > width`, horizontal `width > height`. Ainsi `6 ▭` accepte 1×6 et 2×3, et `6 ▯` accepte 6×1 et 3×2.
- Le cœur est générique pour les grilles carrées **5×5 à 10×10**. Le générateur existant reste volontairement inchangé et continue d’exposer Easy=5×5, Medium=6×6, Hard=7×7.
- Les faits structurés incluent `SELECTED_RECT`, `OWNER`, `NOT_OWNER`, candidats actifs et candidats éliminés. Un `OWNER(cell, clue)` peut donc être démontré avant que le rectangle complet soit connu.
- Les déductions conservent règle, rang, niveau de technique, prémisses, dépendances, cellules/indices/rectangles de focus, conclusions et données d’explication.

### Fermeture logique — coût 0 / T0
- `RECTANGLE_DOMAIN` : filtrage mécanique du domaine avec raisons d’élimination conservées.
- `CLUE_SINGLETON` et `CELL_SINGLETON`.
- `RECTANGLE_PROPAGATION` et `OWNERSHIP_PROPAGATION`.
- `RECTANGULAR_CLOSURE` : les `OWNER` d’une même zone imposent toute leur boîte englobante.
- `AREA_COMPLETION` lorsque la surface connue est exactement celle de la boîte englobante.
- Les conséquences coût 0 sont fermées jusqu’au point fixe sans augmenter artificiellement le rang.

### Inférences directes — coût +1
- `COMMON_COVERAGE` (T1) : une case présente dans tous les rectangles encore possibles d’un indice devient `OWNER`.
- `CELL_LOCKED_TO_CLUE` (T1) : si toutes les couvertures possibles d’une case appartiennent au même indice, cette case devient `OWNER` de cet indice.
- `COVERAGE_LOCKED_SET` (T2) : réserve un ensemble de cases lorsque la somme des aires minimales des domaines atteint exactement la taille de leur union, y compris sans surfaces imprimées.
- `NO_SUPPORT_CLUE` et `NO_SUPPORT_CELL` (T2) : éliminent un candidat qui supprimerait tout support à un autre indice ou laisserait une case sans couverture.
- `LOCAL_DOMAIN_SUPPORT` (T2) : filet local borné, utilisé seulement après les techniques plus simples.

### Hypothèses — coût +2 / T3
- `ASSUMPTION_CONTRADICTION` applique réellement une hypothèse dans une branche, ferme les conséquences et n’élimine le candidat que si une contradiction structurée est atteinte.
- `COMMON_CONSEQUENCE` retient un fait commun à toutes les alternatives testées lorsque cette conséquence est réellement démontrée dans chaque branche.
- Les contradictions reconnues incluent notamment absence de candidat pour un indice, absence de couverture d’une case, chevauchement sélectionné, conflit de propriétaire, autre indice inclus, débordement de surface, forme impossible, déficit de couverture et absence de complétion locale.

### Rang, technique et métriques
- `rank(conclusion) = max(rank(premises)) + ruleCost` ; le rang dépend de la preuve, jamais du nombre de passages d’une boucle.
- `techniqueLevel` T0–T3 reste indépendant du rang.
- Le sélecteur pédagogique privilégie rang minimal, niveau minimal, règle la plus simple et preuve locale.
- Métriques internes exposées : `maxRank`, `maxTechniqueLevel`, `countCommonCoverage`, `countCellLocked`, `countCoverageLockedSet`, `countNoSupport`, `countLocalDomain`, `countContradiction` et compteur de conséquences communes.
- Les recherches avancées sont volontairement **bornées** (petits groupes, nombre de candidats et profondeur d’hypothèse). La correction des déductions produites est préservée, mais ces bornes peuvent rendre le moteur incomplet sur certains puzzles complexes : le Tuteur peut alors s’arrêter plutôt que recourir à une solution cachée.

### Logic Coach Rectangles
- Le Coach travaille sur l’état réel courant du joueur et reconstruit les domaines depuis les zones visibles et les preuves persistées.
- Deux appuis : d’abord **où regarder**, puis **explication + conséquence** issue de la déduction structurée.
- Les faits logiques qui n’impliquent pas immédiatement une case peinte (par exemple une élimination de candidat) sont persistés avec rang/provenance afin que Coach, Undo et Redo restent cohérents.
- L’audit distingue `proven`, `incorrect`, `contradictory` et `not-yet-proven` : un rectangle correspondant à la solution finale mais non encore démontré reste `not-yet-proven`.
- Les erreurs immédiates restent distinguées : autre indice inclus, mauvaise surface, mauvaise forme, chevauchement et contradictions de couverture.

### Tuteur Rectangles
- Le Tuteur utilise le **même `PatchesLogic.Session`** que le Coach ; le fallback historique Rectangles fondé sur les complétions exhaustives a été retiré.
- Chaque étape conserve l’état avant, la preuve principale, la fermeture coût 0, les faits logiques, l’état après et les métriques.
- Navigation précédente/suivante restaure exactement les snapshots pédagogiques sans modifier la partie réelle.
- Une étape peut sélectionner un rectangle, attribuer des cases, éliminer des candidats ou expliquer une contradiction, mais jamais rejouer silencieusement la solution finale.

### Undo/Redo, i18n et mobile
- Les snapshots Rectangles incluent désormais les rectangles sélectionnés et les preuves logiques persistées en plus de `paint` ; Undo/Redo et changement de branche restaurent ou invalident ces faits correctement.
- **30 langues conservées.** Les explications détaillées FR/EN sont rendues depuis les preuves ; les autres langues conservent les gabarits localisés génériques existants, toujours pilotés par la même déduction structurée.
- Le nouveau moteur est ajouté au précache du service worker pour préserver le fonctionnement hors ligne.
- Aucune difficulté Expert n’est ajoutée à Rectangles et le générateur n’est pas modifié.

### Validation v2.21.12
- Six suites moteur Node réellement exécutées : domaines, fermeture coût 0, règles directes, règles avancées/rangs/persistance, contradictions et résolution complète — **toutes OK**.
- Tests explicites : surface seule, forme seule, surface+forme, `?`, carré/vertical/horizontal, cas `6 ▭`/`6 ▯`, bords/autre indice, 5×5 et 10×10, cas positifs et négatifs des singletons, ownership, fermeture rectangulaire, saturation N=2/N=3, NO_SUPPORT, LOCAL_DOMAIN_SUPPORT, hypothèse et conséquence commune.
- Tests de rang : R0 initial et singletons coût 0, OWNER R1 après règle +1, propagation/singleton restant R1, nouvelle règle +1 donnant R2, hypothèse coût +2 depuis R0 donnant R2.
- Deux fixtures Rectangles existantes sont résolues complètement depuis une grille vide uniquement par déductions structurées ; partition finale validée sans chevauchement ni case libre.
- Test statique d’intégration : même moteur Coach/Tuteur, ancien moteur d’indices Rectangles retiré, fallback exhaustif Tuteur Rectangles absent, 30 langues conservées, moteur sans DOM ni solution finale.
- **Chromium réel** : parcours Rectangles FR/EN, Coach deux appuis, erreurs surface/forme, `not-yet-proven`, Undo/Redo/branche, reset, Tuteur complet par preuves et génération 5×5/6×6/7×7 — **OK**.
- **Viewport tactile Chromium 390×844** : grille synthétique 10×10, Coach et Tuteur, grille contenue dans la largeur et bouton de navigation Tuteur visible sans scroll obligatoire — **OK**.
- Régression Chromium réelle sur **Couronnes, Soleil-Lune et Grille 6** : démarrage, Coach et Tuteur sans erreur console/page — **OK**.
- Syntaxe de `app.js`, des trois moteurs logiques, du service worker et du worker vérifiée par Node ; manifeste et build-info parsés comme JSON — **OK**.
- **Safari/iPhone réel non exécuté** : le contrôle mobile est un navigateur Chromium avec viewport/tactile simulé, pas un E2E Safari/iOS matériel.
- **Installation/offline PWA réelle non exécutée** dans cet environnement ; le précache est vérifié statiquement.

## v2.21.11 — moteur d’inférences Soleil/Lune explicable partagé par le Coach et le Tuteur

Cette version reconstruit **Soleil/Lune** autour d’un moteur de preuves explicites suivant le même principe architectural que le moteur Queens de v2.21.10. L’évolution a été réalisée et stabilisée en **8 étapes** : modèle de faits, fermeture coût 0, règles simples, raisonnement relationnel, rangs/hypothèses, Coach, Tuteur, puis i18n/mobile/non-régression.

### Architecture
- Nouveau fichier pur **`tango-logic.js`**, sans DOM, sans accès à `current` et sans lecture de la solution finale.
- Le même `TangoLogic.Session` alimente le Logic Coach, le Tuteur et la justification logique des coups.
- Les faits logiques distinguent :
  - `VALUE(cell,SUN|MOON)` ;
  - `SAME(A,B)` ;
  - `OPPOSITE(A,B)`.
- Les relations `SAME/OPPOSITE` sont représentées par un graphe de parité et peuvent être déduites même sans signe `=` ou `×` dessiné dans la grille.
- Une déduction structurée contient notamment `id`, `rule`, `ruleCost`, `rank`, `techniqueLevel`, `premises`, `dependencies`, `focusCells`, `focusRelations`, `focusUnits`, `conclusions` et `explanationData`.
- Les IDs de déduction appliquée sont stables (`D…`) et continuent après restauration de relations virtuelles persistées ; les dépendances publiques ne pointent que vers des déductions réelles antérieures.
- Le rang est calculé comme **max(rang des prémisses) + coût de règle**. Le niveau de technique T0–T3 reste une dimension indépendante.

### Fermeture logique — coût 0
- `GIVEN_VALUE` : valeurs initiales R0.
- `EXPLICIT_RELATION` : relations `=` / `×` initiales R0.
- `RELATION_PROPAGATION` : une valeur connue traverse une relation sans augmenter le rang.
- `RELATION_CLOSURE` : fermeture de parité `same+same`, `same+opposite`, `opposite+same`, `opposite+opposite`, également sans hausse artificielle du rang.
- Les conséquences mécaniques sont regroupées dans la même étape pédagogique du Tuteur.

### Déductions directes — coût +1
- `TRIPLE_CONSTRAINT` : règle générale sur les trois positions `AA?`, `?AA`, `A?A`, horizontalement et verticalement ; elle fonctionne aussi avec une relation déduite entre les extrémités.
- `BALANCE_QUOTA` : équilibre calculé depuis `n/2`, sans quota `3` codé en dur dans le moteur.
- `BALANCE_RELATION` : les deux dernières cases devant contenir un Soleil et une Lune deviennent `OPPOSITE` sans imposer arbitrairement leur orientation.
- `RELATION_BALANCE` : exploite les paires `SAME/OPPOSITE` dans les quotas.
- `RELATION_BALANCE_COMPONENT` : oriente une composante relationnelle lorsque seule une des deux orientations respecte les contraintes.
- `LINE_DOMAIN_SUPPORT` : domaine des complétions valides d’une ligne/colonne pour produire une valeur ou une relation forcée ; cette règle reste derrière Triple/Balance dans l’ordre pédagogique.

### Raisonnements hypothétiques — coût +2
- `ASSUMPTION_CONTRADICTION` : teste SUN/MOON, propage les conséquences logiques et conclut uniquement lorsqu’une contradiction structurée est réellement atteinte.
- `COMMON_CONSEQUENCE` : si les deux orientations d’une hypothèse démontrent la même conséquence ailleurs, cette conséquence devient prouvée.
- Les contradictions structurées couvrent notamment `TRIPLE_OVERFLOW`, `BALANCE_OVERFLOW`, `BALANCE_DEFICIT`, `RELATION_CONFLICT`, `VALUE_CONFLICT` et `NO_LINE_COMPLETION`.
- Les faits créés uniquement dans une branche hypothétique restent confinés à `explanationData`; ils ne deviennent jamais de fausses prémisses publiques.

### Sélection pédagogique et métriques
- Ordre de choix : rang minimal, `techniqueLevel` minimal, priorité pédagogique, clarté/stabilité.
- À état comparable, Triple et Balance sont préférés à Relation Component / Domain Support, eux-mêmes préférés aux hypothèses.
- Métriques internes disponibles : `maxRank`, `maxTechniqueLevel`, `deductionsByRule`, `countTriple`, `countBalance`, `countRelationBalance`, `countDomainSupport`, `countContradictions`, `countCommonConsequences`.
- Ces métriques ne changent pas encore automatiquement les niveaux Easy/Medium/Hard.

### Logic Coach Soleil/Lune
- Le Coach analyse uniquement l’état réel courant : symboles posés, relations initiales et relations virtuelles déjà démontrées.
- Deux appuis visibles :
  1. **orientation** et surbrillance des cellules/relations réellement impliquées ;
  2. **preuve humaine + conclusion**, puis application de la déduction et de sa fermeture coût 0.
- Les textes sont produits par la couche UI depuis la déduction structurée ; le moteur logique ne contient aucun texte français/anglais.
- L’audit distingue `proven`, `incorrect`, `contradictory` et `not-yet-proven`.
- Une valeur qui correspond à `sol` mais qui n’est pas démontrable dans l’état courant reste `not-yet-proven`.

### Tuteur Soleil/Lune
- Le Tuteur utilise exactement la même session logique persistante que le Coach et ne fait plus appel à la recherche exhaustive historique de complétions Tango.
- Chaque étape conserve l’état avant, la preuve, les conséquences automatiques coût 0, les relations virtuelles, l’état après et les métriques.
- La navigation précédente/suivante repose sur ces snapshots déterministes et ne modifie jamais la partie réelle du joueur.
- Les relations virtuelles sont surlignées temporairement mais ne sont pas dessinées comme de nouveaux signes permanents du puzzle.
- Ordre UX : **grille → navigation → explication défilante**. Le mécanisme générique du Tuteur conserve priorité à la grille sur petits écrans.

### Règles du jeu et génération
- Les règles effectives restent : quota Soleil/Lune, interdiction des triples horizontaux/verticaux, `=` identique, `×` opposé.
- **Aucune unicité de ligne/colonne n’a été ajoutée. Aucune règle diagonale n’a été ajoutée.**
- **Le générateur Soleil/Lune n’a pas été modifié.** Sa source et ses sorties déterministes ont été comparées à v2.21.10 sur des seeds fixes, le Daily et les défis `QL14`.

### Internationalisation
- 30 langues conservées.
- Les noms courts/localisés des nouvelles familles logiques et les messages nécessaires au Coach sont ajoutés au mécanisme I18N.
- Les explications détaillées FR/EN sont rendues depuis la preuve ; les autres langues utilisent les gabarits localisés génériques existants, toujours à partir de la même preuve structurée.

### Validation v2.21.11
- Tests unitaires positifs et négatifs : valeurs initiales, relations explicites, propagation `=`/`×`, quatre compositions de fermeture, Triple dans les trois formes et deux orientations, quota ligne/colonne SUN/MOON, Balance Relation, Relation Balance, composantes, Domain Support VALUE/SAME/OPPOSITE, contradiction, Common Consequence.
- Tests explicites de rang : R0 initial, propagation/fermeture R0, règle +1 → R1, relation R1 → propagation R1, nouvelle règle +1 sur faits R1 → rang supérieur, contradiction +2 depuis R0 → R2.
- Tests de sécurité : pas de triple diagonal, quota non atteint sans propagation abusive, relation `=` insuffisante sans valeur arbitraire, domaine non forcé sans conclusion, hypothèse non contradictoire sans conclusion.
- Test fondamental : **valeur correcte dans la solution ≠ valeur démontrable maintenant**.
- Coach : deux appuis, état courant, relation virtuelle, Undo/Redo, erreur et `not-yet-proven`.
- Tuteur : Easy/Medium/Hard résolus entièrement par `TangoLogic`, preuves structurées, IDs/dépendances stables, snapshots exacts et aucune recherche exhaustive Tango.
- **13/13 parcours Tuteur** des quatre jeux terminent ; toutes les étapes Soleil/Lune proviennent de `tango-inference-engine`.
- **13/13 générateurs Worker** conservent unicité et contrats existants ; profils Queens inchangés.
- Compatibilité générateur Soleil/Lune : candidats, Daily fixe et empreintes `QL14` identiques à v2.21.10 ; fonctions de génération comparées source-à-source sans modification.
- Test fonctionnel Soleil/Lune normal : nouvelle partie, niveaux disponibles, saisie Soleil/Lune, violations Triple/quota/`=`/`×`, reset, victoire, Undo/Redo et branche après Undo.
- Vérification i18n : 30 langues et nouvelles clés présentes ; moteur pur sans DOM/current/solution finale.
- **Chromium headless réel** : rendu final testé en 390×844, 375×667 et 1280×800 via `page.set_content`; grille dans le viewport, navigation sous la grille et avant l’explication, page globale verrouillée et seule la zone d’explication défilante. La navigation directe `localhost/file://` est bloquée par la politique de l’environnement, d’où l’utilisation de `set_content`.
- **Safari/iPhone réel non exécuté** ; le contrôle iPhone reste donc un rendu Chromium aux dimensions mobiles, pas un E2E Safari/iOS.

## v2.21.10 — moteur d’inférences Queens explicable partagé par le Coach et le Tuteur

Cette version reconstruit le raisonnement **Queens/Couronnes** autour d’un moteur de preuves explicites, indépendant du DOM et de la solution finale.

### Architecture
- Nouveau fichier pur **`queens-logic.js`** : moteur de règles, candidats, preuves, rangs, dépendances, contradictions et métriques.
- `app.js` devient la couche d’adaptation/presentation pour Queens :
  - rendu humain/localisé des preuves ;
  - surbrillances ;
  - intégration Logic Coach ;
  - intégration Tuteur ;
  - audit des coups du joueur.
- Le moteur reçoit uniquement `n`, `reg` et l’état visible `state`. Il ne reçoit ni `current`, ni DOM, ni `sol`.
- Les objets de déduction structurés contiennent : `rule`, `rank`, `techniqueLevel`, `premises`, `dependencies`, `focusCells`, `focusUnits`, `conclusions`, `explanationData`.
- Le rang et le niveau de technique sont indépendants. Le rang est calculé depuis le rang des prémisses + le coût de règle, jamais depuis le nombre d’itérations d’une boucle.
- Métriques internes exposées : `maxRank`, `maxTechniqueLevel`, `deductionsByRule`, `contradictions`.

### Fermeture mécanique — coût 0
- `QUEEN_PROPAGATION` : une reine impose immédiatement les croix de sa ligne, colonne, zone et des diagonales adjacentes ; les croix héritent du rang de la reine.
- `SINGLETON` : ligne, colonne ou zone à une seule candidate ⇒ reine au même rang que les prémisses.
- Le moteur recherche toujours ces conséquences de rang inférieur avant une technique de coût supérieur.

### Déductions directes — coût +1
- `LOCKED_UNIT` : zone→ligne, zone→colonne, ligne→zone, colonne→zone.
- `COMMON_CONFLICT` : élimination d’une case incompatible avec toutes les positions restantes de la reine obligatoire d’une unité ; preuve détaillée candidat par candidat.
- `HALL_SET` : groupes réservés génériques N unités ↔ N unités, sans hypothèse de contiguïté ; paires puis triples puis N supérieur ; symétries zones/lignes/colonnes.
- `LOCAL_CAPACITY` : bloc 2×2 de capacité 1 et bloc 3×3 de capacité 2.
- `NO_SUPPORT` : élimination d’une candidate qui supprimerait immédiatement tout support d’une autre unité obligatoire.
- `MIXED_HALL` : saturation de zones par un mélange de lignes et colonnes, limitée à de petits groupes pédagogiquement explicables.

### Raisonnement par contradiction — coût +2
- `ASSUMPTION_CONTRADICTION` teste une hypothèse uniquement par règles visibles et inférences explicables.
- Les témoins distinguent notamment : absence de candidat, contradiction de Hall, capacité locale dépassée et violation directe.
- Aucun solveur de complétion finale n’est utilisé pour fabriquer un indice Queens.
- La recherche hypothétique est bornée par un nombre d’étapes logiques et ordonnée paresseusement afin d’éviter les blocages de latence sur Expert.

### Logic Coach Queens
- Le Coach reconstruit les candidats depuis **l’état courant réel du joueur**.
- Il distingue les situations : violation directe, contradiction logique, coup démontré et coup pas encore justifiable.
- Deux appuis visibles seulement :
  1. **où regarder**, sans révéler la conclusion ;
  2. **preuve complète + conséquence**, puis application de la déduction et de sa fermeture mécanique.
- L’ancienne étape intermédiaire ne réapparaît pas.
- Une croix qui coïncide avec la solution finale mais n’est pas démontrable maintenant reste `not-yet-proven`, jamais « fausse ».

### Tuteur Queens
- Le Tuteur utilise **exactement le même moteur** et conserve une session logique persistante afin de préserver rangs et dépendances entre étapes.
- Chaque étape stocke l’état avant, la déduction structurée, la fermeture automatique et l’état après.
- Les croix induites par une reine apparaissent dans le même instantané et ne deviennent pas des étapes séparées.
- Le recours Queens à la recherche exhaustive de complétions et l’ancien auto-croisement spécifique au Tuteur ont été retirés.
- Les explications et surbrillances sont calculées à partir de la preuve structurée.
- Le `techniqueLevel` T0–T3 reste une donnée interne de la preuve et des métriques ; le Tuteur n’affiche pas ce code comme explication principale.
- Ordre UX validé : **plateau → navigation → explication défilante** ; le plateau et la navigation restent prioritaires sur petits écrans.

### Internationalisation et compatibilité
- Le moteur `queens-logic.js` ne contient aucun texte UI.
- La terminologie des nouvelles règles et le message « aucune déduction démontrable » sont intégrés au mécanisme `I18N` dans les 30 langues. Les gabarits détaillés FR/EN passent également par `I18N` ; les 28 autres langues utilisent le mécanisme générique localisé déjà en place dans le Logic Coach, toujours à partir de la déduction structurée réelle.
- Les 27 IDs historiques de techniques restent inchangés afin de ne pas casser Maîtrise / Apprendre / S’entraîner ; les nouvelles règles explicites ne créent pas artificiellement de faux IDs historiques.
- Undo/Redo normal reste indépendant ; la navigation du Tuteur reste locale au Tuteur.
- Après Undo puis nouveau coup, l’ancienne branche reste disponible pour Exploration mais le Redo normal préfère la nouvelle branche.

### Génération et difficulté
- **Aucun changement volontaire du générateur Queens ni des critères Easy/Medium/Hard/Expert.**
- Les tailles restent 7×7 / 8×8 / 9×9 / 9×9 et les contraintes de v2.21.9 restent inchangées.
- Les défis `QL11`, `QL12`, `QL13`, `QL14` et le Daily conservent leurs sorties déterministes de v2.21.9.
- Les nouvelles métriques du moteur sont disponibles pour une future classification de difficulté mais ne sont pas utilisées pour reclasser les puzzles dans cette version.

### Validation v2.21.10
- Tests unitaires ciblés : singleton zone/ligne/colonne, propagation, Locked Unit 4 sens, Common Conflict plusieurs formes, Hall N=2/N=3 non contigus et cas négatif N→N+1, capacités 2×2/3×3, No Support, Mixed Hall, contradiction, rangs et dépendances.
- Test fondamental : **case correcte dans la solution finale ≠ case actuellement démontrable**.
- Test de sûreté `proveAction()` : une action ne peut pas être certifiée si sa propre hypothèse conduit à une contradiction ; le cas limite où les deux hypothèses échouent est couvert.
- Test de traçabilité : les dépendances publiques d’une contradiction ne référencent que des déductions réelles antérieures ; les déductions temporaires d’une branche hypothétique restent confinées à `explanationData.trace`.
- 18 grilles Queens générées (5 Easy, 5 Medium, 5 Hard, 3 Expert) entièrement résolues par le moteur de preuves sans solution cachée.
- Coach : deux appuis, état courant, Undo/Redo, erreurs, coup pas encore justifiable.
- Tuteur : chaîne complète, snapshots avant/après exacts, fermeture automatique, navigation et explication cohérentes.
- Tous les 13 parcours Tuteur jeu/difficulté terminent sur une grille valide ; les trois autres jeux conservent leur chemin historique.
- Tous les 13 générateurs Worker conservent unicité et contrats de difficulté existants.
- Compatibilité déterministe du générateur Queens, du Daily et des défis comparée à v2.21.9.
- Test de branche historique Undo → nouveau coup → Redo.
- Test fonctionnel Queens normal : lancement/nouvelle partie, quatre niveaux, saisie, auto-cross, coup illégal, reset et victoire.
- Vérification i18n/pureté : 30 langues, 27 techniques historiques, moteur sans DOM/current/solution finale.
- Responsive/Tuteur vérifié structurellement : ordre **plateau → navigation → explication**, zone d’explication seule défilante, contraintes `svh` mobiles et priorité au plateau ; le test automatisé du Tuteur valide également cet ordre.
- Un essai de rendu Chromium headless réel a été tenté, mais la politique de l’environnement bloque les URLs `localhost` et `file://` ; **aucun test navigateur réel ne peut donc être revendiqué pour cette livraison**. Safari/iPhone réel reste non exécuté.

## v2.21.9 — Couronnes Difficile/Expert : au plus trois zones de taille 2
- Les difficultés **Difficile** et **Expert** de Couronnes ajoutent une contrainte structurelle :
  - aucune zone singleton, comme auparavant ;
  - **au plus 3 zones contenant exactement 2 cases**.
- Les contraintes logiques validées précédemment restent inchangées :
  - Difficile 9×9 : au moins 3 inférences R1, au plus 1 R2, aucune R3 ;
  - Expert 9×9 : au moins 1 R2, aucune R3.
- Le générateur Difficile a été adapté structurellement plutôt que de simplement rejeter presque toutes les grilles :
  - après suppression des singletons, `growQueenTwoCellRegions()` agrandit certaines zones de taille 2 ;
  - une case n’est transférée que depuis une zone donneuse restant valide et connectée ;
  - la case contenant la reine de la zone donneuse n’est jamais déplacée ;
  - la grille est ensuite revalidée pour l’unicité et le profil logique.
- La règle de taille utilise les fonctions partagées `queenRegionSizeCount()`, `queenSingletonRegions()` et `queenTwoCellRegions()`.
- `logicProfile` conserve maintenant aussi `twoCellRegions` pour audit et tests.
- Un nouveau fallback Difficile 9×9 a été prévalidé avec 0 singleton, 3 zones de taille 2 et le profil logique Difficile.
- Le fallback Expert respecte déjà la nouvelle contrainte avec 0 zone de taille 2.
- Compatibilité des défis :
  - `QL11`, `QL12` et `QL13` restent interprétés avec leurs générateurs historiques ;
  - les nouveaux défis utilisent **`QL14`** et appliquent la nouvelle contrainte structurelle.
- Les tailles Couronnes restent **7×7 / 8×8 / 9×9 / 9×9**.

### Validation spécifique v2.21.9
- Lot réellement généré :
  - **20 grilles Difficile** : 20/20 avec ≤ 3 zones de taille 2, 0 singleton, unicité et profil logique conformes ;
  - **6 grilles Expert** : 6/6 avec ≤ 3 zones de taille 2, 0 singleton, unicité et profil logique conformes.
- Vérification des fallbacks Difficile et Expert.
- Vérification de compatibilité des anciens défis `QL11`, `QL12` et `QL13` par comparaison avec v2.21.8.
- Vérification déterministe des nouveaux défis `QL14`.
- Non-régression du Tuteur, du Logic Coach, des 27 techniques, des alertes configurables, de l’Exploration, de l’historique et des trois autres jeux.

## v2.21.8 — Tuteur Couronnes : croix automatiques après une reine
- Dans le **Tuteur Couronnes**, lorsqu’une étape pose une reine, toutes les cases vides immédiatement interdites sont désormais barrées automatiquement par `×`.
- Les exclusions automatiques couvrent exactement les règles Couronnes visibles :
  - même ligne ;
  - même colonne ;
  - même zone ;
  - cases diagonalement adjacentes à une reine.
- Ces croix sont une **propagation automatique du coup expliqué** : elles apparaissent dans le même instantané que la reine et ne créent pas de nouvelles étapes de navigation.
- Le Tuteur passe donc directement à la prochaine déduction réelle au lieu de présenter une succession de coups R0 « placer un X » qui découlent mécaniquement de la reine déjà posée.
- La propagation est implémentée uniquement dans le moteur du Tuteur (`walkthroughQueenAutoCross`) ; elle ne modifie pas le comportement normal de Couronnes ni la préférence historique d’auto-croisement.
- Le moteur utilise `queenCellAllowed()` comme source de vérité pour éviter de dupliquer les règles d’exclusion.

### Validation spécifique v2.21.8
- Vérification qu’une reine posée dans le Tuteur génère immédiatement les croix de sa ligne, colonne, zone et de ses diagonales adjacentes.
- Vérification qu’aucune case encore autorisée n’est barrée.
- Vérification que les croix automatiques sont incluses dans le même snapshot que la reine et ne sont pas ajoutées comme étapes séparées.
- Vérification que la propagation n’est jamais appelée pour Soleil-Lune, Grille 6 ou Rectangles.
- Non-régression complète du Tuteur sur les 13 combinaisons jeu/difficulté.
- Non-régression du jeu Couronnes normal, du Logic Coach, des 27 techniques, des défis partageables et des générateurs.

## v2.21.7 — Tuteur : plateau et navigation toujours visibles
- Le Tuteur utilise désormais une mise en page dédiée à la hauteur réellement visible de l’écran (`100svh`).
- La zone supérieure est stable et conserve ensemble :
  - l’en-tête du Tuteur ;
  - les boutons **Étape précédente / Recommencer / Étape suivante** ;
  - le **plateau entièrement visible**.
- La note d’aide, l’explication logique et le message de fin sont placés dans une zone `.walkthrough-scroll` indépendante.
- **Seule cette zone d’explication défile** lorsque son contenu est plus long que l’espace restant.
- Sur petits écrans en portrait, le plateau est automatiquement réduit en fonction de la hauteur disponible au lieu d’être repoussé sous l’écran.
- Une règle plus compacte est appliquée aux écrans de hauteur ≤ 700 px.
- En paysage de faible hauteur, le Tuteur passe à deux colonnes : commandes/explications à gauche et plateau entièrement visible à droite.
- La classe `tutor-active` désactive le défilement général de la page uniquement pendant le Tuteur ; elle est retirée au retour à la partie.
- Aucun changement du moteur logique, de la résolution, des règles, du scoring ou de l’état réel de la partie.

### Validation spécifique v2.21.7
- Vérification structurelle de l’ordre : **en-tête → navigation → plateau → zone d’explication défilante**.
- Vérification que `body.tutor-active` verrouille le défilement global.
- Vérification que le plateau est borné à la fois par la largeur disponible et par `100svh`.
- Simulation mathématique des contraintes pour plusieurs dimensions de viewport mobiles afin de vérifier que le plateau ne dépasse pas la hauteur réservée.
- Non-régression complète du Tuteur sur les 13 combinaisons jeu/difficulté.
- Non-régression du Logic Coach, des 27 techniques, des défis partageables, des générateurs et des tailles Couronnes 7/8/9/9.

## v2.21.6 — navigation du Tuteur en haut
- Dans le mode **Tuteur**, les commandes **Étape précédente**, **Recommencer** et **Étape suivante** sont déplacées immédiatement sous l’en-tête.
- L’ordre devient : **en-tête → navigation → note d’aide → plateau → explication**.
- Le joueur peut ainsi avancer ou reculer rapidement sans devoir faire défiler l’écran jusqu’au-dessous du message explicatif.
- Aucun changement du moteur de résolution, des explications, du comptage d’aide, du chronomètre ou de l’état réel de la partie.
- Le bouton **Tuteur** reste visible sur mobile comme en v2.21.5.

### Validation spécifique v2.21.6
- Vérification structurelle que `walkthrough-actions` précède `walkthrough-help-note`, le plateau et `walkthroughExplanationHtml`.
- Vérification que les trois identifiants de navigation restent uniques et correctement reliés à leurs gestionnaires.
- Non-régression du Tuteur sur les 13 combinaisons jeu/difficulté.
- Non-régression du Logic Coach, des 27 techniques, des défis partageables et des générateurs.

## v2.21.5 — Tuteur visible sur mobile
- Le mode précédemment nommé **« Résolution pas à pas »** est renommé **« Tuteur »**.
- Le fonctionnement interne reste identique : le Tuteur montre la résolution logique du puzzle étape par étape avec l’explication de chaque déduction.
- Correction de la régression mobile de v2.21.4 :
  - le bouton Tuteur n’est plus classé `secondary-action` ;
  - il n’est donc plus masqué par la règle mobile `.toolbar .secondary-action { display:none; }` ;
  - il reste explicitement visible dans la barre d’actions sur iPhone et autres petits écrans.
- Le bouton apparaît sous la forme **`▹ Tuteur`** dans une partie normale.
- Le mode reste masqué dans **Apprendre** et **S’entraîner**, où la trajectoire pédagogique spécifique reste prioritaire.
- Aucun changement du moteur de résolution, de la logique des quatre jeux, du scoring, de l’historique ou des défis partageables.
- Le nom du mode est localisé dans les **30 langues** sans changer le nombre de clés i18n.

### Validation spécifique v2.21.5
- Vérification que le bouton `walkthroughBtn` ne porte plus la classe `secondary-action`.
- Vérification CSS que `.tutor-action` reste affiché sous 620 px.
- Vérification du libellé français **Tuteur** et des 30 traductions non vides.
- Non-régression syntaxique et structurelle des fonctions de résolution pas à pas.
- Non-régression des versions, références PWA, README, ROADMAP et licence.

## v2.21.4 — Logic Coach en 3 étapes + résolution logique pas à pas
- Le parcours courant du **Logic Coach** passe de quatre à **trois étapes explicites** :
  1. **Où regarder** ;
  2. **Pourquoi** la déduction s’applique ;
  3. **Montrer le coup**.
- L’ancienne étape intermédiaire « règle/technique » n’est plus affichée : à l’usage elle répétait une information moins utile que l’explication causale de l’ancienne étape 3.
- Le nom de la technique reste disponible dans la bibliothèque pédagogique, la maîtrise, les exercices ciblés et les données structurées ; il n’occupe simplement plus une étape séparée du Coach.
- Le Coach adaptatif est recalibré sur trois étapes :
  - Minimal démarre à « Où regarder » ;
  - Normal peut démarrer directement à « Pourquoi » pour un joueur encore en apprentissage ;
  - Pédagogique peut également fournir « Où + Pourquoi » dès la première demande ;
  - aucune adaptation ne révèle automatiquement le coup : la révélation reste la troisième action explicite.
- Compatibilité des statistiques : les anciens compteurs `rule` restent lisibles ; le nouveau flux utilise des compteurs de maîtrise `where3` / `why3` / `reveal3` afin de ne pas déformer les scores historiques.
- Le score quotidien s’appuie désormais sur la **nature de l’aide** et non sur le numéro brut de l’étape, ce qui maintient la compatibilité avec les anciennes parties à quatre étapes.

### Nouveau mode « Résolution pas à pas »
- Un bouton **▹ Résolution pas à pas** est disponible dans les parties normales, quotidiennes et les défis partageables.
- Le mode part de la **position initiale du puzzle** enregistrée dans l’historique, même si le joueur a déjà effectué des coups.
- La grille réelle du joueur n’est jamais modifiée : la résolution s’exécute dans une copie visible indépendante.
- Chaque pression sur **Étape suivante** calcule une seule déduction puis affiche :
  - la case concernée ;
  - la technique/rang lorsqu’elle appartient aux 27 techniques connues ;
  - **où regarder** ;
  - **pourquoi** le coup est imposé ;
  - **quel coup** effectuer.
- **Étape précédente** et **Recommencer** permettent de revoir librement les étapes déjà calculées.
- Le mode utilise d’abord exactement les moteurs logiques du Logic Coach (R0/R1/R2 et R3 Couronnes).
- Si ces techniques nommées ne suffisent pas sur une grille pourtant unique, la résolution peut utiliser une preuve **R+ par contradiction exhaustive** : elle teste toutes les complétions compatibles avec l’état visible et les règles, puis rejette les choix qui ne conduisent à aucune grille complète valide.
- Cette preuve R+ n’est volontairement pas enregistrée comme une nouvelle technique pédagogique : les **27 IDs stables restent inchangés**.
- Le moteur de résolution pas à pas ne reçoit pas `current.sol` et ne consulte jamais la solution cachée. Les complétions sont calculées exclusivement à partir des contraintes visibles.
- Le mode est testé jusqu’à une fin valide sur les **13 combinaisons jeu/difficulté** actuellement supportées.
- Consulter la résolution pas à pas marque la tentative courante comme ayant reçu une **aide de type solution**. La grille n’est pas changée, mais la partie ne peut donc pas être comptée ensuite comme « sans aide ».
- Le chronomètre de jeu est suspendu pendant la consultation puis reprend à son retour, afin que le temps passé à lire l’explication ne soit pas ajouté artificiellement au temps de résolution.
- Le mode est masqué dans **Apprendre** et **S’entraîner**, où les trajectoires pédagogiques propres à ces modes restent prioritaires.
- 12 nouveaux libellés sont disponibles dans les **30 langues**.

### Validation spécifique v2.21.4
- Vérification du nouveau flux Coach **1 → 2 → 3** sans étape « règle » affichée.
- Vérification que l’étape 2 explique bien le **pourquoi** et que l’étape 3 applique le coup.
- Vérification qu’aucun mode adaptatif ne démarre directement par la révélation.
- Vérification de la compatibilité du score quotidien ancien/nouveau.
- Vérification de la compatibilité du profil de maîtrise ancien/nouveau.
- Vérification que la résolution part du nœud racine de l’historique et ne modifie jamais la grille réelle du joueur.
- Vérification que le moteur de résolution ne consulte pas la solution cachée.
- Résolution complète testée sur les 13 combinaisons jeu/difficulté.
- Non-régression des tailles/profils Couronnes v2.21.3, des alertes v2.21.1, des défis QL11/QL12/QL13, du Mode Exploration, de l’audit, du Défi quotidien et des 27 techniques/leçons.

## v2.21.3 — Couronnes : tailles 7×7 / 8×8 / 9×9 / 9×9
- Les tailles Couronnes deviennent :
  - **Facile : 7×7** ;
  - **Moyen : 8×8** ;
  - **Difficile : 9×9** ;
  - **Expert : 9×9** (inchangé).
- Les critères logiques validés en v2.21.2 sont conservés sans modification :
  - Facile : R1 ≤ 1, R2 = 0, R3 = 0 ;
  - Moyen : R1 ≥ 2, R2 = 0, R3 = 0 ;
  - Difficile : aucune zone singleton, R1 ≥ 3, R2 ≤ 1, R3 = 0 ;
  - Expert : aucune zone singleton, R2 ≥ 1, R3 = 0.
- Difficile et Expert ont donc désormais la même dimension 9×9, mais restent distingués par la profondeur logique requise.
- Le générateur Difficile 9×9 utilise une stratégie sans singleton adaptée et un fallback 9×9 prévalidé.
- Compatibilité des défis partageables :
  - les codes **QL11** restent liés au générateur v1 historique ;
  - les codes **QL12** restent liés au générateur v2.21.2 (tailles 6×6 / 7×7 / 8×8 / 9×9) ;
  - les nouveaux défis utilisent **QL13** et les tailles 7×7 / 8×8 / 9×9 / 9×9.
- Le seed du Défi quotidien reste historique, mais la grille Couronnes quotidienne peut changer par rapport à v2.21.2 puisque la dimension Moyen passe de 7×7 à 8×8.
- Aucun changement aux règles, aux profils R1/R2, aux IDs de techniques, au Logic Coach, à l’historique ou aux trois autres jeux.

### Validation spécifique v2.21.3
- Génération et certification sur les quatre nouvelles dimensions.
- Unicité contrôlée sur chaque niveau.
- Vérification que Difficile 9×9 reste sans singleton et respecte R1 ≥ 3, R2 ≤ 1.
- Vérification qu’Expert reste 9×9 avec R2 ≥ 1.
- Vérification des anciens défis QL11 et QL12, et des nouveaux défis QL13.
- Non-régression des alertes configurables, du Mode Exploration, de l’audit, du Défi quotidien, des 27 techniques/leçons et des générateurs des trois autres jeux.

## v2.21.2 — Couronnes : difficultés fondées sur les inférences nécessaires
- La difficulté **Couronnes** n’est plus définie principalement par le score heuristique de recherche. Chaque grille candidate est désormais parcourue par le moteur logique réel de QUADLUD.
- Le classificateur applique systématiquement toutes les déductions **R0** disponibles. Lorsqu’il est bloqué, il applique une seule inférence de rang supérieur, puis recommence par R0. Ainsi, une inférence R1 qui débloque plusieurs déductions simples ne compte que pour **une R1**.
- Profils imposés :
  - **Facile 6×6** : au plus **1 R1**, **0 R2**, **0 R3** ;
  - **Moyen 7×7** : au moins **2 R1**, **0 R2**, **0 R3** ;
  - **Difficile 8×8** : **0 zone singleton**, au moins **3 R1**, au plus **1 R2**, **0 R3** ;
  - **Expert 9×9** : **0 zone singleton**, au moins **1 R2**, **0 R3**.
- Toutes les grilles acceptées doivent en outre :
  - conserver une solution unique ;
  - être résolues complètement par cette trajectoire logique ;
  - respecter la taille historique du niveau.
- Le générateur Difficile a été adapté : il part de davantage de régions initialement contraintes puis supprime les singletons jusqu’à zéro avant certification. Cette stratégie produit beaucoup plus efficacement des 8×8 nécessitant plusieurs R1 mais au plus une R2.
- Une grille de secours Difficile a été remplacée par une grille prévalidée conforme au nouveau profil. La grille de secours Expert reste conforme (aucun singleton, au moins une R2, aucune R3).
- Le score heuristique historique `analyzeQueens()` est conservé uniquement comme information secondaire d’affichage/statistique ; **il ne décide plus de la difficulté Couronnes**.
- `rating.logicProfile` conserve désormais `rank0`, `rank1`, `rank2`, `rank3`, `singletonRegions`, `solvedLogically` et `maxRank`.
- Le pré-calcul en Worker utilise le même générateur certifié ; aucune logique de difficulté n’est dupliquée.
- Compatibilité des défis partageables :
  - les anciens codes **`QL11`** restent interprétés avec un générateur Couronnes v1 figé et recréent exactement leurs anciennes grilles ;
  - les nouveaux codes utilisent **`QL12`** et suivent le nouveau classificateur logique.
- La génération quotidienne Couronnes continue d’utiliser le seed quotidien historique, mais le générateur Couronnes ayant changé, une grille quotidienne régénérée sous v2.21.2 peut différer de celle produite par une version antérieure pour la même date. Ce changement est explicitement lié à la nouvelle définition validée des difficultés.
- Aucun changement n’est apporté aux règles de Couronnes, au Logic Coach, aux 27 IDs de techniques, à l’historique, à la maîtrise ni aux trois autres jeux.

### Validation spécifique v2.21.2
- Lot statistique réellement exécuté de **39 grilles Couronnes** :
  - 12 Facile ;
  - 12 Moyen ;
  - 10 Difficile ;
  - 5 Expert.
- **39/39** respectent leur profil logique et ont une solution unique.
- Dans le lot :
  - Facile : 0 R2/R3 et R1 ≤ 1 ;
  - Moyen : R1 ≥ 2 et 0 R2/R3 ;
  - Difficile : 0 singleton, R1 ≥ 3, R2 ≤ 1, 0 R3 ;
  - Expert : 0 singleton, R2 ≥ 1, 0 R3.
- Revalidation des empreintes historiques des défis Couronnes `QL11` : Facile, Moyen, Difficile et Expert reproduisent exactement les empreintes v2.21 attendues.
- Vérification déterministe des nouveaux défis Couronnes `QL12` et de leur conformité logique.
- Non-régression des alertes configurables v2.21.1, des défis partageables, du Mode Exploration, de l’audit des coups, du Défi quotidien, des 27 techniques/leçons et des générateurs des autres jeux.

## v2.21.1 — alertes configurables et plateau stable
- Deux préférences indépendantes sont ajoutées dans **Préférences** :
  - **Alertes de coups interdits** ;
  - **Alertes de coups non justifiés**.
- Les deux préférences sont **activées par défaut** afin de préserver le comportement des installations existantes.
- Désactiver une alerte ne désactive jamais le moteur d’analyse : les erreurs, justifications, statistiques, Logic Coach et Mode Exploration continuent à fonctionner.
- Lorsque **Alertes de coups interdits** est activé :
  - les conflits visibles restent marqués en rouge ;
  - l’alerte « Explique mon erreur » reste disponible.
- Lorsque cette préférence est désactivée :
  - aucun marquage rouge automatique n’est affiché ;
  - le bandeau automatique d’erreur est masqué ;
  - une demande explicite au Logic Coach continue malgré tout à détecter et expliquer les conflits réels.
- Pour un **coup légal mais non justifié**, le bandeau automatique v2.19.1 est supprimé :
  - la pièce, le symbole ou le chiffre concerné est simplement affiché en **orange** ;
  - pour Rectangles, la case concernée reçoit un contour orange afin de ne pas remplacer la couleur de sa zone.
- Si les alertes de coups non justifiés sont désactivées, cette coloration orange disparaît, mais le statut logique du coup reste conservé dans l’historique.
- Le mécanisme `acceptLastMoveAsHypothesis()` et les statuts `unjustified` / `hypothesis` restent présents dans le moteur ; le Mode Exploration continue à exploiter ces statuts.
- Les notifications automatiques ne participent plus au flux vertical de la page :
  - le bandeau de coup interdit est désormais une **surcouche fixe** ;
  - le panneau automatique des coups non justifiés n’occupe plus de hauteur ;
  - l’apparition ou la disparition d’une alerte ne décale donc plus le plateau.
- Sur petit écran, le plateau conserve également une limite liée à la hauteur visuelle `svh` pour éviter qu’une notification ou une barre du navigateur mobile ne provoque un redimensionnement brutal.
- Les quatre nouveaux libellés de préférences sont disponibles dans les **30 langues**.

### Validation spécifique v2.21.1
- Migration des anciennes préférences : les deux alertes sont activées par défaut.
- Activation/désactivation indépendante des deux familles d’alertes.
- Vérification qu’une alerte de coup interdit désactivée ne supprime ni `lastError` ni la détection du Logic Coach.
- Vérification du marquage orange d’un coup non justifié, sans bandeau de notification.
- Vérification de la disparition du marquage orange lorsque l’option correspondante est désactivée.
- Vérification que les notifications automatiques sont hors flux et ne peuvent plus déplacer le plateau.
- Vérification des 30 langues et des 286 clés de traduction.
- Non-régression des défis partageables v2.21, du Mode Exploration v2.20, de l’audit logique v2.19.1, du Défi quotidien, des 27 techniques/leçons et des générateurs.

## v2.21.0 — défis partageables entre joueurs
- Nouvelle entrée **Défi entre amis** depuis l’accueil.
- Un défi contient uniquement :
  - schéma de code ;
  - version du générateur de défi ;
  - jeu ;
  - difficulté ;
  - seed aléatoire de 8 caractères ;
  - checksum de contrôle.
- Format v1 : `QL11-QM-XXXXXXXX-XX` (exemple de structure, pas une grille prédéfinie).
- Le code **ne contient ni solution, ni état caché, ni identifiant personnel**.
- Le checksum rejette les fautes de frappe ou les codes altérés.
- Les quatre jeux sont partageables ; Couronnes accepte également la difficulté Expert.
- Le **générateur de défi v1** est isolé du cache de pré-génération afin qu’un code donné reproduise exactement la même grille publique.
- Un même code peut être :
  - copié/collé manuellement ;
  - partagé par la feuille de partage native quand disponible ;
  - transmis comme lien `#challenge=...`.
- Ouvrir un lien partagé affiche d’abord une fiche de défi (jeu, difficulté, code, version du générateur), puis le joueur choisit explicitement de lancer la partie.
- Aucun compte, serveur, connexion sociale ou tracking n’est requis.
- Pendant une partie issue d’un défi :
  - le code est visible dans l’en-tête ;
  - un bouton **Partager le défi** reste disponible ;
  - **Nouvelle partie** rejoue exactement le même défi ;
  - le sélecteur de difficulté est verrouillé afin de ne pas transformer silencieusement le défi.
- L’écran de victoire permet de repartager le défi ; le texte de résultat inclut le code et le lien, jamais la solution.
- Les entrées statistiques conservent `challengeCode`, `challengeGenerator` et une empreinte de la grille publique pour audit local.
- Les sauvegardes `logic4-save-v1` conservent les métadonnées du défi et permettent une reprise normale.
- Le contrat `CHALLENGE_GENERATOR=1` doit être conservé dans les versions futures pour que les anciens codes restent interprétables ; toute évolution incompatible devra utiliser une nouvelle version de générateur.
- 18 nouveaux libellés sont disponibles dans les **30 langues**.

### Validation spécifique v2.21.0
- Round-trip création → parsing sur les **13 combinaisons** jeu/difficulté.
- Rejet d’un code dont le checksum est modifié.
- Rejet de la difficulté Expert hors Couronnes.
- Reproduction déterministe du même puzzle public pour un même code, répétée sur les 13 combinaisons.
- Vérification que des seeds différentes produisent des puzzles différents sur des cas représentatifs.
- Vérification d’un lien `#challenge=...` et de la fiche d’atterrissage sans lancement automatique.
- Vérification du lancement, de la sauvegarde et des statistiques d’un défi.
- Vérification qu’aucune solution n’est présente dans le code ou le lien.
- Vérification des 30 langues et des 282 clés de traduction.
- Non-régression du Mode Exploration v2.20, de l’audit des coups v2.19.1, du Défi quotidien v2.19, de la priorité « erreurs d’abord », des 27 techniques/leçons, de l’entraînement ciblé, de l’historique et des générateurs.

## v2.20.0 — Mode Exploration
- Nouveau bouton **◇ Exploration** dans chaque partie normale.
- **Tester une hypothèse** mémorise la position courante comme **point de branchement** sans écraser l’historique existant.
- Tous les coups joués ensuite restent dans l’arbre d’historique v2.11.
- Si le joueur effectue un coup **légal mais non démontré** dans cette exploration, le premier coup de ce type sur le chemin est automatiquement marqué `hypothesis`.
- Des coups logiquement justifiés peuvent précéder l’hypothèse : QUADLUD attend alors le premier véritable saut non démontré avant d’étiqueter la branche.
- Le panneau Exploration affiche les branches issues du point de branchement avec :
  - action de départ de la branche ;
  - statut logique : déduction, hypothèse, coup non justifié ou erreur ;
  - branche courante ;
  - branche préférée.
- Une branche peut être sélectionnée à tout moment. QUADLUD rejoint son chemin préféré sans supprimer les autres branches.
- **↶ Revenir au point de branchement** restaure exactement la position de départ de l’exploration, sans supprimer la branche testée et sans compter ce déplacement comme un Undo classique.
- Le joueur peut alors tester une autre hypothèse ; la nouvelle trajectoire devient une véritable branche sœur dans l’historique.
- **✓ Conserver cette branche** marque le chemin courant comme chemin préféré et ferme le mode Exploration. Les autres branches restent néanmoins conservées pour l’historique.
- **Analyser la branche** recherche une contradiction uniquement avec les règles, l’état visible et les moteurs de preuve existants :
  - Couronnes : conflits visibles et contradictions bornées jusqu’au niveau utilisé par le moteur ;
  - Soleil-Lune : contradictions directes, rang 1 et témoin rang 2 ;
  - Grille 6 : candidats impossibles, unités impossibles et témoin rang 2 ;
  - Rectangles : zones/rectangles impossibles et témoin rang 2.
- Le message **« Aucune contradiction n’est encore démontrable »** ne signifie pas que l’hypothèse est vraie : seulement que le moteur n’a pas trouvé de contradiction avec sa profondeur de preuve actuelle.
- Logic Coach est intégré au mode Exploration : si la branche courante est déjà démontrablement contradictoire, une demande de Coach explique d’abord cette contradiction et propose un retour au point de branchement, avant tout nouvel indice.
- Les violations immédiates de règles restent prioritaires grâce à la logique **« erreurs d’abord »** de v2.18.1.
- Le statut des hypothèses, l’arbre, le point de branchement et l’état du mode Exploration sont sauvegardés dans `logic4-save-v1`.
- Undo/Redo classiques continuent à fonctionner pendant l’exploration et le panneau se synchronise avec le curseur d’historique.
- Les informations d’Exploration sont ajoutées à l’entrée d’historique statistique de la partie pour préparer les analyses futures.
- Le mode Exploration est volontairement désactivé dans **Apprendre** et **S’entraîner**, où une trajectoire pédagogique précise doit rester identifiable.
- Le moteur Exploration n’accède jamais à `current.sol` ni à la solution cachée.
- 17 nouveaux libellés du mode Exploration sont disponibles dans les **30 langues**.

### Validation spécifique v2.20.0
- Test de création d’un point de branchement.
- Test d’une hypothèse automatique à partir d’un coup légal non justifié.
- Test d’un ou plusieurs coups justifiés avant l’apparition de l’hypothèse.
- Test de deux branches sœurs conservées simultanément.
- Test du retour au point de branchement sans suppression de branche ni incrément artificiel d’Undo.
- Test de navigation vers une branche existante et son dernier nœud préféré.
- Test de **Conserver cette branche** et du pointeur `preferred`.
- Test de persistance après sauvegarde des branches et statuts `hypothesis`.
- Test d’analyse d’une branche propre et d’une contradiction logique sans violation directe de règle.
- Test de l’interception de cette contradiction par Logic Coach sans consommation d’indice.
- Vérification que le moteur Exploration ne consulte pas la solution cachée.
- Vérification des 30 langues et des 264 clés de traduction.
- Non-régression de l’audit v2.19.1, du Défi quotidien v2.19, de la priorité « erreurs d’abord », des 27 techniques et leçons, de l’entraînement ciblé, du profil de maîtrise et des générateurs.

## v2.19.1 — détection des coups non justifiés
- Chaque **nouveau coup constructif** d’une partie normale est maintenant audité à partir de la position qui existait juste avant le coup.
- QUADLUD distingue trois situations :
  1. **Coup justifié** : une preuve logique est trouvée avec les règles et techniques connues.
  2. **Coup erroné** : le coup viole une règle visible ; il reste traité par « Explique mon erreur ».
  3. **Coup légal, mais non justifié** : le coup ne viole aucune règle, mais aucune preuve logique n’est trouvée ; QUADLUD le présente comme une **hypothèse** potentielle.
- Un coup non justifié n’est **pas interdit**. Un bandeau explique qu’il est légal mais non démontré et propose :
  - **Traiter comme hypothèse** ;
  - **Annuler ce coup**.
- Lorsqu’une hypothèse est acceptée, le nœud correspondant de l’arbre d’historique reçoit explicitement le statut `hypothesis`. Ce statut survit à Undo/Redo et prépare directement le mode Exploration v2.20.
- Quand le moteur connaît déjà un autre coup démontrable dans la position précédente, le bandeau peut l’indiquer comme **coup actuellement démontrable**.
- Le vocabulaire est volontairement prudent : « non justifié » signifie **« non démontré par les techniques actuellement connues de QUADLUD »**, et non « faux ».
- Le contrôle utilise uniquement la position précédente, les règles et les moteurs de preuve. **La solution cachée n’est jamais consultée.**
- Couronnes vérifie :
  - exclusions et positions uniques directes ;
  - contradictions de rang 1, 2 et 3 avec budget borné.
- Soleil-Lune vérifie :
  - équilibre 3/3 ;
  - règle des trois ;
  - relations `=` / `×` ;
  - contradictions de rang 1 et 2.
- Grille 6 vérifie :
  - candidat unique ;
  - unique caché ligne/colonne/bloc ;
  - contradictions de rang 1 et 2.
- Rectangles vérifie :
  - rectangle unique ;
  - case obligatoire ;
  - contradictions de rang 1 et 2 ;
  - création complète d’un rectangle lorsqu’elle correspond à l’unique rectangle compatible.
- Les opérations de suppression/effacement, auto-croix dérivées, gestes complexes non auditables avec certitude et coups du Coach ne sont pas faussement signalés comme hypothèses.
- Le profil de maîtrise peut désormais créditer comme « résolu seul » un coup que ce nouvel audit a effectivement **prouvé**, même s’il n’était pas le premier indice que le moteur aurait choisi.
- Chaque partie conserve un `reasoningAudit` avec compteurs `justified`, `unjustified`, `hypotheses` et `unknown`; ces données sont ajoutées à l’historique statistique sans changer le schéma global v4.
- Neuf nouveaux libellés sont disponibles dans les **30 langues**.

### Validation spécifique v2.19.1
- Test d’un candidat unique Grille 6 classé **justifié**.
- Test d’un coup arbitraire légal classé **non justifié**.
- Test d’acceptation explicite comme **hypothèse**.
- Test Undo/Redo : le statut hypothèse est conservé dans la branche.
- Test qu’un coup erroné reste une erreur et n’est jamais classé hypothèse.
- Test d’une exclusion Couronnes justifiée.
- Test d’un équilibre Soleil-Lune justifié.
- Test d’un rectangle unique justifié.
- Test qu’un effacement n’est pas faussement signalé.
- Test d’un coup démontrable alternatif proposé depuis l’état visible.
- Vérification de la persistance `reasoningAudit`.
- Vérification des 30 langues et des 247 clés de traduction.
- Non-régression du Défi quotidien v2.19, de la priorité « erreurs d’abord », du parcours Apprendre, de l’entraînement ciblé, de l’historique arborescent et des générateurs.

## v2.19.0 — Défi QUADLUD quotidien 4 jeux + score logique
- Le défi quotidien devient un **circuit QUADLUD complet** composé, dans l’ordre, de :
  1. Couronnes ;
  2. Soleil-Lune ;
  3. Grille 6 ;
  4. Rectangles.
- Un bouton **Commencer/Reprendre le circuit** lance automatiquement le premier jeu du jour qui n’a pas encore été résolu.
- Après chaque victoire quotidienne, l’écran de victoire propose directement **Jeu suivant** ; après le quatrième jeu, il mène au **Bilan du jour**.
- Le seed quotidien historique reste inchangé : `logic4-v1.6:${day}:${game}`. Les grilles quotidiennes restent donc déterministes et compatibles avec les versions antérieures.
- Nouveau **score logique officiel sur 400 points**, soit 100 points maximum par jeu.
- Barème par jeu, fondé sur le niveau d’aide le plus profond réellement reçu :
  - **100/100** : sans aide ;
  - **90/100** : orientation seulement ;
  - **75/100** : règle demandée ;
  - **55/100** : explication demandée ;
  - **25/100** : coup révélé.
- Le score mesure volontairement **l’autonomie logique**, pas la vitesse.
- Les **erreurs** et les **Undo/Redo / retours arrière** sont affichés dans le bilan mais ne retirent aucun point.
- Le score officiel de chaque jeu est **figé lors de la première résolution réussie**. Rejouer une grille déjà connue peut améliorer le meilleur temps, mais ne peut pas améliorer le score logique officiel.
- Une partie quotidienne révélée par le bouton Solution n’est pas considérée comme résolue et ne verrouille pas le score ; une résolution ultérieure peut encore établir le score officiel.
- Le bilan quotidien indique, pour chacun des quatre jeux :
  - score sur 100 ;
  - niveau d’aide atteint ;
  - temps ;
  - nombre d’erreurs ;
  - nombre de coups annulés.
- Le total quotidien est affiché sur **400 points**.
- Les anciens défis quotidiens déjà terminés avant v2.19 restent reconnus comme terminés mais sont signalés **non scorés**, car leur historique d’aide n’est pas disponible.
- Le calendrier quotidien conserve l’indicateur 0/4 à 4/4 et ajoute le score sur 400 lorsque celui-ci est connu.
- La carte Défi quotidien de l’accueil affiche désormais progression et score.
- `logic4-daily-v1` reste la clé de stockage : les anciennes données sont conservées et enrichies sans migration destructive.
- 18 nouveaux libellés du Défi QUADLUD et du score logique sont disponibles dans les **30 langues**.

### Philosophie du score
Le score v2.19 ne doit pas récompenser la précipitation. Un joueur qui réfléchit longtemps mais résout seul obtient 100/100. Un Undo n’est pas assimilé à une erreur et une erreur expliquée n’est pas sanctionnée par des points : ces informations servent au bilan pédagogique, tandis que le score mesure uniquement la profondeur d’aide demandée au Logic Coach.

### Validation spécifique v2.19.0
- Vérification du barème exact 100 / 90 / 75 / 55 / 25.
- Vérification qu’erreurs, temps et retours arrière n’affectent pas le score.
- Vérification du verrouillage du score à la première résolution.
- Vérification qu’un replay peut améliorer le meilleur temps sans modifier le score logique.
- Vérification qu’une partie révélée peut ensuite être réellement résolue et scorée.
- Vérification de l’ordre des quatre jeux et du passage automatique au prochain jeu non terminé.
- Vérification du total sur 400 et du bilan par jeu.
- Vérification de la compatibilité des anciennes entrées `logic4-daily-v1`.
- Vérification des 30 langues et des 238 clés de traduction.
- Non-régression de la priorité « erreurs d’abord », du parcours Apprendre, de l’entraînement ciblé, du Logic Coach adaptatif, du profil de maîtrise, de l’historique arborescent, des générateurs et de la PWA.

## v2.18.1 — Logic Coach : erreurs d’abord
- Lorsqu’un joueur demande **Logic Coach**, QUADLUD recherche désormais **avant tout indice logique** les violations de règles actuellement visibles dans la grille.
- Cette vérification porte sur **l’état courant complet**, pas seulement sur le dernier coup enregistré. Elle fonctionne donc également après une restauration, des Undo/Redo ou plusieurs coups successifs.
- Si une ou plusieurs erreurs sont présentes :
  - aucun nouvel indice de résolution n’est proposé ;
  - aucune case correcte n’est révélée ;
  - `hintUsed` reste inchangé ;
  - les cellules en conflit sont mises en évidence ;
  - chaque conflit est accompagné de la **règle concernée** et de son explication.
- Logic Coach ne reprend la recherche du prochain coup logique qu’après correction des conflits visibles.
- **Couronnes** : conflits ligne, colonne, zone et adjacence.
- **Soleil-Lune** : dépassement 3/3, trois symboles identiques consécutifs et relations `=` / `×`.
- **Grille 6** : doublons ligne, colonne et bloc 2×3.
- **Rectangles** : deuxième indice dans une zone, taille devenue impossible et forme devenue impossible.
- Plusieurs conflits simultanés peuvent être signalés dans une même demande de Coach.
- Les gestes Rectangles rejetés avant modification de la grille restent également expliqués en priorité ; après cette explication ponctuelle, ils ne bloquent pas indéfiniment les demandes suivantes.
- Le même comportement s’applique dans **S’entraîner** et dans le parcours **Apprendre** lorsqu’une véritable violation de règle est présente.
- La détection et l’explication utilisent uniquement les **règles et l’état visible** ; elles ne consultent jamais la solution cachée.
- Cette évolution ne modifie ni les générateurs, ni les 27 techniques, ni le scoring de maîtrise, ni le schéma statistique v2.18.

### Validation spécifique v2.18.1
- Test d’erreur prioritaire sur les quatre jeux.
- Test de plusieurs conflits simultanés.
- Vérification qu’aucun nœud historique et aucun `hintUsed` ne sont créés lors de l’explication.
- Vérification qu’une grille propre laisse ensuite fonctionner normalement l’algorithme d’indice.
- Test du comportement dans l’entraînement ciblé / parcours Apprendre.
- Test du cas Rectangles rejeté : explication prioritaire mais non bloquante après acquittement.
- Non-régression du parcours Apprendre, de l’entraînement ciblé, du Coach adaptatif, du profil de maîtrise, de l’historique et des générateurs.

## v2.18.0 — parcours « Apprendre »
- Nouvelle entrée **Apprendre** depuis l’accueil, distincte de **S’entraîner**.
- QUADLUD propose désormais **27 leçons interactives**, soit une leçon pour chacune des 27 techniques pédagogiques de v2.13.
- Chaque leçon suit quatre étapes :
  1. **Explication** — nom de la technique, jeu, rang, zone d’observation, objectif et méthode.
  2. **Exemple guidé** — une situation réellement générée/validée pour la technique ; le contexte, la règle et le raisonnement sont affichés avant que le joueur ne demande « Montrer le coup ».
  3. **Exercice accompagné** — nouvelle situation ciblée avec Logic Coach forcé en mode pédagogique.
  4. **Exercice autonome** — nouvelle situation ciblée avec Coach minimal ; la leçon n’est validée que si le joueur termine cette étape sans utiliser Logic Coach.
- Les leçons réutilisent le moteur d’exercices ciblés v2.17 : la logique de la technique n’est donc pas dupliquée.
- Le moteur peut utiliser la solution d’un générateur pour **construire** une position d’exercice, mais la technique affichée et la déduction attendue sont toujours **revalidées depuis l’état visible** avant présentation au joueur.
- L’exemple guidé ne crédite jamais une résolution autonome.
- L’exercice accompagné peut enrichir les statistiques d’aide du profil de maîtrise, mais ne valide pas l’autonomie.
- L’exercice autonome réussi sans Coach crédite la technique comme résolue seul et valide la leçon.
- Si Logic Coach est utilisé pendant l’étape autonome, l’exercice peut être terminé mais la leçon reste à refaire sans aide.
- La progression pédagogique est séparée des statistiques d’entraînement libre : suivre une leçon ne gonfle pas artificiellement le nombre d’exercices d’entraînement.
- Nouveau stockage `learning` dans `logic4-stats-v1` ; schéma statistique porté à **4**, avec migration automatique des schémas précédents.
- Progression conservée par technique : explication, exemple guidé, exercice accompagné, exercice autonome, leçon terminée et meilleur temps autonome.
- Les pages **Maîtrise** et **S’entraîner** proposent maintenant également un accès direct à **Apprendre** pour chaque technique.
- Reprise de partie compatible : une étape de leçon sauvegardée reste identifiable comme leçon lors de la restauration.
- Les 20 nouveaux textes du parcours sont disponibles dans les **30 langues**.

### Validation spécifique v2.18.0
- Vérification des **27/27 leçons**, une par technique.
- Vérification de la progression 0/4 → 4/4 et des conditions de déverrouillage.
- Vérification de l’exemple guidé et de son coup révélé.
- Vérification que l’exemple guidé ne produit pas de crédit « résolu seul ».
- Vérification de l’exercice accompagné avec Coach pédagogique.
- Vérification qu’un exercice autonome utilisant Logic Coach ne valide pas la leçon.
- Vérification qu’un exercice autonome sans Coach valide la leçon et crédite la maîtrise.
- Vérification de la séparation entre statistiques `learning` et `training`.
- Vérification de la migration du schéma `logic4-stats-v1` 3 → 4.
- Vérification des 30 langues et des 220 clés de traduction.
- Non-régression du Logic Coach adaptatif, du profil de maîtrise, d’« Explique mon erreur », de l’historique Annuler/Refaire/branches, des générateurs, de l’unicité et de la PWA.

## v2.17.0 — entraînement ciblé par technique
- Nouvelle entrée **Entraînement** sur l’accueil, avec un catalogue des **27 techniques** de Logic Coach regroupées par jeu.
- Chaque technique peut lancer un **micro-exercice ciblé** : QUADLUD prépare une position où la technique choisie est effectivement applicable, puis le moteur logique revalide la déduction à partir de l’état visible.
- Les **27/27 techniques** disposent d’un générateur d’exercice validé :
  - Couronnes : 10/10, y compris contradictions rangs 1, 2 et 3 ;
  - Soleil-Lune : 7/7 ;
  - Grille 6 : 6/6 ;
  - Rectangles : 4/4.
- Les techniques directes utilisent des situations construites ou recherchées spécifiquement ; les 9 techniques par contradiction disposent de positions de référence prévalidées et revalidées au lancement par le moteur courant, avec une recherche bornée de position cohérente en secours si une évolution invalide une référence.
- Le moteur peut utiliser la solution générée **uniquement pour fabriquer une position cohérente d’exercice** ; l’identification de la technique cible, les explications et Logic Coach restent fondés exclusivement sur l’**état visible**.
- Le catalogue met en avant une technique **Recommandée** selon le profil de maîtrise : manque de données, score, erreurs observées et rang.
- Chaque carte affiche le niveau de maîtrise, le nombre de tentatives et le nombre d’exercices réussis.
- La page **Maîtrise** permet également de lancer directement un entraînement sur n’importe quelle technique.
- En exercice :
  - **Nouvel exercice** régénère une autre position de la même technique ;
  - **Réinitialiser** revient exactement à la position de départ ;
  - **Annuler / Refaire** restent disponibles ;
  - **Logic Coach** reste disponible et suit le mode Minimal / Normal / Pédagogique de v2.16 ;
  - la solution complète n’est pas proposée, afin de conserver l’objectif pédagogique ciblé.
- Un coup différent de la déduction ciblée place l’exercice « hors trajectoire » ; le joueur peut utiliser Annuler ou Réinitialiser pour reprendre l’exercice.
- Un coup correct termine immédiatement l’exercice. Sans recours au Coach, il est crédité comme **résolu seul** dans le profil de maîtrise ; avec le Coach, le niveau d’aide réellement reçu reste enregistré.
- Les statistiques d’entraînement sont ajoutées à `logic4-stats-v1` : tentatives, réussites, réussites avec Coach et meilleur temps par technique. Le schéma passe à 3 tout en migrant les données antérieures.
- Les exercices terminés ne restent pas artificiellement proposés comme parties « à reprendre ».
- Correction de la bibliothèque Rectangles : **`P_SINGLE_RECTANGLE` / Rectangle unique** est désormais réellement atteignable ; auparavant la détection « Case obligatoire » interceptait toujours cette situation avant elle.
- Les 12 nouveaux libellés de l’entraînement sont disponibles dans les **30 langues**.

### Validation spécifique v2.17.0
- Génération et revalidation automatique de **27/27 techniques**.
- Vérification que l’identifiant retrouvé par le moteur est exactement celui demandé.
- Test d’un exercice résolu sans Coach : réussite, crédit « seul », fusion dans le profil et statistiques d’entraînement.
- Test d’un exercice résolu avec Logic Coach : aucune réussite automatique avant la révélation explicite et comptage `withCoach`.
- Test d’un coup hors trajectoire puis Annuler jusqu’à la position initiale.
- Test de la persistance du schéma de statistiques v3 et absence de sauvegarde « Reprendre » après exercice terminé.
- Test spécifique de `P_SINGLE_RECTANGLE` désormais atteignable.
- Vérification des 30 langues et des 200 clés de traduction.
- Non-régression du Coach adaptatif, du profil de maîtrise, d’« Explique mon erreur », de l’historique arborescent, des générateurs, de l’unicité et de la PWA.

## v2.16.0 — Logic Coach adaptatif
- Logic Coach exploite désormais le **profil de maîtrise v2.15** pour adapter la profondeur de la première aide à la technique rencontrée.
- Trois modes sont disponibles dans **Préférences** :
  - **Minimal** : conserve systématiquement le parcours historique 1/4 → 2/4 → 3/4 → 4/4, une information par demande.
  - **Normal** *(recommandé)* : une technique solide/excellente commence par une simple orientation ; une technique peu maîtrisée ou encore peu observée peut fournir directement **orientation + règle**.
  - **Pédagogique** : une technique fragile ou nouvelle peut fournir dès la première demande **orientation + règle + explication**.
- L’adaptation ne révèle **jamais automatiquement le coup** : l’étape 4/4 nécessite toujours une nouvelle action explicite du joueur.
- Le choix manuel du joueur est prioritaire sur le profil : le mode Minimal désactive tout saut adaptatif.
- Pour chaque technique, le plan adaptatif utilise :
  - score de maîtrise ;
  - nombre d’observations ;
  - confiance ;
  - niveau `Données insuffisantes / En développement / Acquis / Solide / Excellent`.
- Le Coach prend également en compte les observations de la **session en cours**, sans attendre la fermeture de la partie.
- En mode Normal :
  - `Solide` ou `Excellent` → départ 1/4 ;
  - maîtrise plus fragile ou données insuffisantes → départ 2/4.
- En mode Pédagogique :
  - `Excellent` → départ 1/4 ;
  - `Acquis` ou `Solide` → départ 2/4 ;
  - `En développement` ou données insuffisantes → départ 3/4.
- Quand plusieurs niveaux sont délivrés lors d’une seule demande, `coachUsage` et le profil de maîtrise comptabilisent **exactement les informations réellement reçues**.
- La décision adaptative est enregistrée avec le coup révélé (`adaptivePlan`) afin de préparer les futures analyses et l’entraînement ciblé.
- Le réglage `coachMode` est ajouté à la clé historique `logic4-prefs-v1` ; les anciennes préférences sont migrées automatiquement vers **Normal**.
- Dix nouveaux libellés d’interface sont disponibles dans les **30 langues**.

### Validation spécifique v2.16.0
- Vérification des trois modes Minimal / Normal / Pédagogique.
- Vérification des profondeurs initiales 1/4, 2/4 ou 3/4 selon le profil.
- Vérification qu’une technique fortement maîtrisée reçoit une aide légère.
- Vérification qu’une technique fragile reçoit une aide renforcée.
- Vérification qu’un profil sans assez de données déclenche le comportement d’apprentissage prévu.
- Vérification qu’aucun mode ne peut atteindre automatiquement 4/4.
- Vérification que la grille et `hintUsed` restent inchangés tant que le joueur ne demande pas explicitement la révélation.
- Vérification du comptage correct des niveaux effectivement délivrés.
- Vérification de la persistance du mode dans `logic4-prefs-v1`.
- Vérification des 30 langues et des 188 clés de traduction.
- Non-régression du profil de maîtrise, d’« Explique mon erreur », des 27 techniques, de l’historique arborescent, des générateurs et de la PWA.

## v2.15.0 — profil de maîtrise logique
- Nouvelle vue **Maîtrise** accessible depuis l’accueil.
- Le profil est calculé **par technique** sur les 27 techniques pédagogiques de v2.13, puis agrégé par jeu et globalement.
- Pour chaque technique, QUADLUD conserve :
  - situations observées ;
  - déductions directes reconnues comme **résolues seul** ;
  - recours à **Où regarder ?** ;
  - recours à la **règle** ;
  - recours à l’**explication** ;
  - coups **révélés** par Logic Coach ;
  - erreurs directement rattachables à cette technique.
- La reconnaissance « résolu seul » est volontairement **conservatrice** : elle ne crédite le joueur que lorsqu’une déduction directe identifiable depuis l’état visible correspond exactement au coup joué. Elle ne lit jamais la solution cachée et ne prétend pas détecter toutes les déductions avancées.
- Les actions Couronnes avec auto-croix utilisent la cellule principale du geste afin d’éviter de créditer à tort une croix ajoutée automatiquement.
- Une aide Logic Coach en cours empêche le même coup d’être compté comme « résolu seul ».
- Les techniques avancées sans assez d’observations restent affichées **Données insuffisantes**, au lieu de recevoir un score artificiel.
- Le score de maîtrise 0–100 privilégie :
  - résolution autonome ;
  - puis orientation seule ;
  - puis règle ;
  - puis explication ;
  - puis révélation ;
  - les erreurs liées réduisent le score.
- Un indicateur de **confiance** augmente avec le nombre de situations réellement observées.
- Niveaux affichés : **En développement · Acquis · Solide · Excellent**.
- Le détail de l’aide est visible par technique avec les quatre niveaux du Coach.
- Les données de maîtrise sont stockées dans la clé historique `logic4-stats-v1`, avec un schéma étendu compatible avec les anciennes statistiques.
- Les anciennes parties v2.13/v2.14 présentes dans l’historique peuvent contribuer au profil via leurs données Logic Coach, sans double comptage des nouvelles parties v2.15.
- Les sessions v2.15 stockent un `masterySession` et le fusionnent dans le profil persistant à la clôture de la partie.
- Les 12 nouveaux libellés du profil sont disponibles dans les **30 langues**.

### Validation spécifique v2.15.0
- Test de reconnaissance autonome d’un candidat unique Grille 6.
- Test qu’un coup précédé d’une aide Logic Coach n’est pas crédité comme autonome.
- Test de comptage par technique des quatre niveaux d’aide.
- Test d’une erreur Couronnes rattachée à la technique concernée.
- Test du calcul score/confiance et du seuil « Données insuffisantes ».
- Test de fusion persistante dans `logic4-stats-v1`.
- Test de reprise des données historiques v2.13/v2.14 sans double comptage.
- Vérification des 30 langues et des 178 clés de traduction.
- Non-régression de **Explique mon erreur**, Logic Coach 4 étapes, des 27 techniques, Undo/Redo/branches, des générateurs, de l’unicité et de la PWA.

## v2.14.0 — « Explique mon erreur »
- QUADLUD détecte maintenant les **nouvelles violations de règle créées par le dernier coup**, uniquement à partir de l’état visible.
- Lorsqu’une erreur est détectée, la grille conserve son affichage rouge et un bandeau **« Explique mon erreur »** apparaît.
- L’explication indique la **règle concernée**, met en évidence les cellules en conflit et n’utilise jamais la solution cachée.
- **Couronnes** : deux couronnes sur la même ligne, colonne ou zone ; couronnes adjacentes, y compris en diagonale.
- **Soleil-Lune** : dépassement de l’équilibre 3/3, trois symboles identiques consécutifs, violation des relations `=` ou `×`.
- **Grille 6** : chiffre en double dans une ligne, une colonne ou un bloc 2×3.
- **Rectangles** : présence de deux indices dans une zone, dépassement impossible de la taille, incompatibilité de forme ; les rectangles rejetés avant validation peuvent également être expliqués (absence/multiplicité d’indice ou chevauchement).
- Le bouton **« Revenir avant cette erreur »** repositionne directement la partie sur le nœud historique précédant le coup fautif.
- Le coup erroné n’est pas détruit : il reste dans sa branche et peut être rejoué avec **Refaire**, conformément au modèle d’historique v2.11.
- Demander l’explication d’une erreur **ne compte pas comme un indice révélant la solution** et ne positionne pas `hintUsed`.
- Chaque nœud fautif de l’arbre peut conserver son objet d’erreur (`source: visible-state`) ; après un Redo vers ce nœud, l’explication redevient disponible.
- Les statistiques mémorisent séparément `errorCoachUsage` : erreurs détectées, explications demandées, retours avant erreur et gestes Rectangles rejetés.
- Les neuf nouveaux textes d’interface sont disponibles dans les **30 langues**.

### Validation spécifique v2.14.0
- Test d’une erreur Couronnes et identification de la règle exacte.
- Test d’un doublon Grille 6.
- Test d’un dépassement 3/3 Soleil-Lune.
- Test d’une zone Rectangles devenue définitivement trop grande.
- Test d’un rectangle rejeté sans création de coup historique.
- Vérification que l’explication ne modifie pas la grille et ne déclenche pas `hintUsed`.
- Vérification de **« Revenir avant cette erreur »**, puis de **Refaire** qui restaure le coup fautif et son explication.
- Vérification que les objets d’erreur sont marqués `visible-state` et ne contiennent aucune solution cachée.
- Vérification des nouveaux libellés dans les 30 langues.
- Non-régression du Logic Coach 4 étapes, des 27 techniques, de l’historique arborescent, des générateurs et de la PWA.

## v2.13.0 — bibliothèque pédagogique des techniques
- Logic Coach s’appuie désormais sur une **bibliothèque de 27 techniques stables** réparties entre les quatre jeux.
- Chaque technique possède un identifiant pérenne utilisable par le Coach, l’historique et les futurs profils de maîtrise.
- **Couronnes (10 techniques)** : exclusions par ligne, colonne, zone et adjacence ; positions uniques par ligne, colonne et zone ; contradictions de rang 1 à 3.
- **Soleil-Lune (7 techniques)** : équilibre 3/3 par ligne ou colonne ; règle des trois symboles ; relations `=` et `×` ; contradictions de rang 1 et 2.
- **Grille 6 (6 techniques)** : candidat unique ; unique caché en ligne, colonne ou bloc 2×3 ; contradictions de rang 1 et 2.
- **Rectangles (4 techniques)** : case obligatoire commune à tous les rectangles compatibles ; rectangle unique ; contradictions de rang 1 et 2.
- Les déductions directes des moteurs portent maintenant explicitement leur identifiant de technique.
- Les déductions par contradiction reçoivent automatiquement un identifiant stable selon le jeu et le rang.
- L’étape **2/4** de Logic Coach affiche désormais le **nom pédagogique de la technique**, son identifiant stable et son niveau d’inférence.
- Un nouveau bouton **Techniques** ouvre la bibliothèque du jeu courant et permet de voir toutes les techniques disponibles.
- Les noms de techniques sont construits avec une terminologie localisée dans les **30 langues** de QUADLUD.
- `coachUsage` mémorise désormais l’usage du Coach **par technique** (`where`, `rule`, `why`, `reveal`), ce qui prépare directement le futur profil de maîtrise v2.15.
- Le moteur conserve la règle fondamentale : une technique et son explication sont déduites uniquement de l’**état visible**, jamais de la solution cachée.

### Identifiants principaux v2.13
- Couronnes : `Q_EXCLUSION_ROW`, `Q_EXCLUSION_COLUMN`, `Q_EXCLUSION_REGION`, `Q_EXCLUSION_ADJACENCY`, `Q_UNIQUE_ROW`, `Q_UNIQUE_COLUMN`, `Q_UNIQUE_REGION`, `Q_CONTRADICTION_R1..R3`.
- Soleil-Lune : `T_BALANCE_ROW`, `T_BALANCE_COLUMN`, `T_NO_THREE`, `T_RELATION_EQUAL`, `T_RELATION_OPPOSITE`, `T_CONTRADICTION_R1..R2`.
- Grille 6 : `S_NAKED_SINGLE`, `S_HIDDEN_ROW`, `S_HIDDEN_COLUMN`, `S_HIDDEN_BOX`, `S_CONTRADICTION_R1..R2`.
- Rectangles : `P_MANDATORY_CELL`, `P_SINGLE_RECTANGLE`, `P_CONTRADICTION_R1..R2`.

### Validation spécifique v2.13.0
- Vérification des **27 identifiants uniques** et de leur rattachement au bon jeu/rang.
- Vérification de la disponibilité d’un titre de technique dans les 30 langues.
- Vérification de la classification directe Couronnes/Soleil-Lune/Grille 6/Rectangles.
- Vérification du mapping automatique des contradictions de rang 1 à 3.
- Vérification que chaque technique affichée dans la bibliothèque correspond à une entrée réelle du catalogue.
- Vérification du suivi `coachUsage` par technique.
- Non-régression du Coach en 4 étapes : aucune modification avant l’étape 4.
- Non-régression de l’historique Annuler/Refaire/branches, des générateurs, de l’unicité, du Worker et de la PWA.

## v2.12.0 — Logic Coach progressif en 4 étapes
- Logic Coach suit désormais exactement quatre niveaux d’aide successifs :
  1. **Où regarder ?** — met en évidence le contexte logique pertinent sans jouer le coup.
  2. **Quelle règle ?** — indique la règle ou le niveau d’inférence à appliquer.
  3. **Pourquoi ?** — expose la justification logique.
  4. **Montrer le coup** — révèle et applique seulement alors le coup conseillé.
- Les étapes 1 à 3 sont **non destructives** : elles ne modifient aucune case et ne créent aucun nœud dans l’historique.
- Seule l’étape 4 est considérée comme un coup réellement révélé (`hintUsed`) et s’inscrit dans l’arbre Annuler/Refaire comme `COACH_APPLY`.
- Un indicateur **1/4 → 4/4** est affiché dans la fenêtre du Coach.
- L’orientation visuelle est progressive :
  - étapes 1–2 : contexte de ligne/colonne, avec région/bloc lorsque pertinent ;
  - étapes 3–4 : focalisation sur la case cible.
- Pour Couronnes, le contexte inclut la zone colorée correspondante.
- Pour Grille 6, le contexte inclut aussi le bloc 2×3.
- Pour Rectangles, le Coach peut mettre en évidence le repère de la zone concernée.
- Le niveau d’aide utilisé est conservé dans `coachUsage` (`where`, `rule`, `why`, `reveal`, `maxStage`) afin de préparer le futur profil de maîtrise.
- Les statistiques de partie enregistrent désormais ce détail pédagogique en plus du simple indicateur `hintUsed`.
- Les textes des quatre étapes réutilisent les ressources localisées existantes ; le fonctionnement reste disponible dans les **30 langues** sans ajouter de texte anglais de secours.
- Les objets de raisonnement structurés v2.11 restent la source du Coach et restent limités à l’**état visible**.

### Validation spécifique v2.12.0
- Vérification qu’aucune des trois premières étapes ne modifie la grille.
- Vérification qu’aucun nœud d’historique n’est créé avant l’étape 4.
- Vérification que `hintUsed` reste faux aux étapes 1–3 et devient vrai uniquement lors de la révélation.
- Vérification de `coachUsage` et de son niveau maximal.
- Vérification que le coup appliqué au stade 4 reste compatible avec Annuler/Refaire.
- Vérification des libellés nécessaires aux quatre étapes dans les 30 langues.
- Non-régression de l’historique arborescent, des quatre moteurs, des générateurs, de l’unicité, du Worker et de la PWA.

## v2.11.0 — socle Logic Coach + historique Annuler/Refaire
- Le bouton d’aide est désormais présenté comme **Logic Coach**.
- Le moteur d’indices produit maintenant un objet de raisonnement structuré séparé du texte affiché : jeu, technique, rang, cible, action et éléments de preuve.
- Les objets Logic Coach déclarent explicitement `source: visible-state` et ne contiennent aucun champ de solution cachée.
- Chaque coup modifiant effectivement la grille est enregistré dans un **arbre d’historique** persistant dans la sauvegarde locale existante.
- **Annuler** permet de revenir jusqu’au début de la partie, y compris de plusieurs coups via la fonction interne `undoMoves(N)`.
- **Refaire** rejoue les coups annulés dans l’ordre jusqu’au dernier état quitté.
- Si le joueur revient en arrière puis choisit un autre coup, l’ancienne suite est conservée comme **branche alternative interne** au lieu d’être détruite ; l’interface d’arbre viendra dans le futur mode Exploration.
- Les gestes complexes sont atomiques : un drag Couronnes compte comme une action, et la création/redimensionnement/suppression d’un rectangle dans Rectangles compte comme une seule action.
- Les actions enregistrent aussi les cellules réellement modifiées (`changes`) afin de préparer les futures analyses pédagogiques.
- `Cmd/Ctrl+Z` annule un coup et `Cmd/Ctrl+Shift+Z` le refait sur clavier.
- Annuler/Refaire est désactivé pendant la pause et après la fin d’une partie.
- Les 30 langues disposent des nouveaux libellés Annuler, Refaire et Logic Coach.
- Les anciennes sauvegardes v2.10 sans historique sont migrées automatiquement : leur état courant devient la racine du nouvel historique.
- Les identifiants internes, clés `logic4-*`, générateurs, défis quotidiens et statistiques existantes restent compatibles.

### Validation spécifique v2.11.0
- Test de retour de **N coups** en une seule opération jusqu’à la racine.
- Test de Refaire sur plusieurs niveaux.
- Test de branchement : une nouvelle décision après Annuler conserve l’ancienne branche et devient la branche préférée.
- Test de sérialisation de l’arbre d’historique dans `logic4-save-v1`.
- Test de migration d’une partie sans historique vers une racine v2.11.
- Test des objets Logic Coach structurés et absence de champ de solution cachée.
- Vérification des nouveaux libellés dans les 30 langues.
- Non-régression des quatre moteurs de jeu, de la génération unique, du Worker, du RTL et de la géométrie Rectangles.

## v2.10.0 — 30 langues, dont les 24 langues officielles de l’Union européenne
- QUADLUD prend désormais en charge **30 langues au total**.
- Les **24 langues officielles de l’Union européenne** sont toutes disponibles : allemand, anglais, bulgare, croate, danois, espagnol, estonien, finnois, français, grec, hongrois, irlandais, italien, letton, lituanien, maltais, néerlandais, polonais, portugais, roumain, slovaque, slovène, suédois et tchèque.
- Les six autres langues déjà présentes sont conservées : chinois simplifié, hindi, arabe, bengali, indonésien et ourdou.
- Les 20 nouvelles langues européennes disposent chacune des **153 clés d’interface** et des **règles complètes des quatre jeux**.
- La détection automatique de la langue du navigateur couvre désormais les 30 langues, avec formatage de date adapté à chaque locale.
- Les langues existantes restent compatibles avec les préférences sauvegardées ; les clés historiques `logic4-*` ne changent pas.
- Le comportement RTL de l’arabe et de l’ourdou est conservé, tandis que les plateaux restent LTR pour préserver la géométrie des interactions.

### Validation spécifique v2.10.0
- Vérification des 30 codes de langue, des 30 options du sélecteur et de la détection navigateur.
- Vérification des **153 clés non vides** pour chacune des 30 langues.
- Vérification que les 20 nouvelles langues européennes possèdent bien une traduction propre des 153 clés, sans simple absence de clé.
- Vérification des règles de **Couronnes, Soleil-Lune, Grille 6 et Rectangles** dans les 30 langues.
- Vérification de la syntaxe JavaScript, des références de version, du Service Worker et des ressources PWA.
- Réexécution des tests de génération/unicité et de non-régression des quatre jeux avant empaquetage final.

## v2.9.0 — internationalisation 10 langues
- QUADLUD prend désormais en charge les 10 langues les plus parlées par nombre total de locuteurs selon le classement Ethnologue 2026 : **anglais, mandarin, hindi, espagnol, arabe standard, français, bengali, portugais, indonésien et ourdou**.
- Le sélecteur de langue affiche chaque langue dans son écriture native : English, 简体中文, हिन्दी, Español, العربية, Français, বাংলা, Português, Bahasa Indonesia, اردو.
- Les interfaces principales, règles des quatre jeux, statistiques, états de partie, messages d’erreur, commandes, partage et libellés d’indices sont localisés dans les 10 langues.
- Les libellés de difficulté/technique sont également localisés.
- L’arabe et l’ourdou utilisent une interface **RTL** ; les plateaux de jeu restent volontairement LTR afin de préserver la correspondance exacte entre coordonnées visuelles et logique interne.
- Pour les huit nouvelles langues, les indices logiques complexes utilisent une explication localisée synthétique (rang 0 à 3) afin d’éviter l’affichage de fragments anglais issus du moteur de preuve détaillé. Le français et l’anglais conservent les explications de preuve détaillées existantes.
- Sur une nouvelle installation, la langue du navigateur est détectée si elle fait partie des 10 langues prises en charge. Les préférences existantes restent compatibles grâce à la clé historique `logic4-prefs-v1`.
- Les règles complètes de Couronnes, Soleil-Lune, Grille 6 et Rectangles sont disponibles dans les 10 langues.
- Les identifiants internes, sauvegardes, statistiques et graines de défi quotidien sont inchangés afin d’assurer la non-régression.

### Validation spécifique v2.9.0
- Vérification automatisée des **153 clés de traduction** (130 clés historiques + 23 clés d’interface/indices ajoutées) pour chacune des 10 langues : aucune clé absente ou vide.
- Vérification des règles complètes des 4 jeux dans les 10 langues.
- Vérification des libellés de techniques/difficulté dans les 10 langues.
- Vérification LTR/RTL : arabe et ourdou passent le document en RTL, tandis que les plateaux, le pavé numérique et la palette Rectangles restent LTR pour conserver la géométrie des coordonnées.
- Vérification de la détection automatique des langues du navigateur prises en charge et du fallback français.
- Non-régression Couronnes : invariance canonique sous les 8 rotations/miroirs et anti-répétition de session/jour.
- Non-régression Rectangles : géométrie du rectangle dynamique conservée.
- Web Worker : les 13 combinaisons jeu/difficulté ont été régénérées et leur unicité revalidée.
- Syntaxe `app.js`, `precompute-worker.js` et `sw.js` vérifiée avec Node.

## v2.8.2 — identité publique QUADLUD
- Le nom public de l’application devient **QUADLUD**.
- Les quatre jeux sont désormais présentés comme :
  - **Couronnes** / **Crowns** ;
  - **Soleil-Lune** / **Sun-Moon** ;
  - **Grille 6** / **Grid 6** ;
  - **Rectangles** / **Rectangles**.
- Les identifiants techniques historiques (`queens`, `tango`, `sudoku`, `patches`) restent inchangés afin de préserver les sauvegardes, statistiques, défis quotidiens et le cache de pré-génération.
- Les clés de stockage locales historiques commençant par `logic4-` sont également conservées pour assurer une migration transparente des données déjà présentes sur l’appareil.
- Le nom QUADLUD est utilisé dans l’interface, la PWA, le partage des résultats, la page « À propos », la licence et les métadonnées.
- Les règles, générateurs et solutions ne changent pas dans cette version.

## Évolution v2.8.0 — Rectangles : geste rectangle dynamique
- Le geste Rectangles est entièrement changé : le glissé ne peint plus les cases traversées une à une.
- Un `tap & drag` utilise la cellule de départ comme **premier coin** et la cellule courante comme **coin opposé** ; le rectangle complet se redimensionne en direct pendant le mouvement.
- Le calcul de la cellule sous le doigt utilise la géométrie du plateau, avec clamp aux bords : le rectangle continue donc à se redimensionner proprement même si le doigt déborde légèrement du plateau.
- L'aperçu est calculé via `requestAnimationFrame` et au maximum une fois par frame, pour éviter les mises à jour DOM inutiles pendant un glissement rapide.
- Le rectangle d'aperçu possède un contour continu sur ses quatre côtés et la couleur de la zone concernée.
- Si le rectangle contient **exactement un indice**, cette zone est sélectionnée automatiquement.
- Si le rectangle ne contient aucun indice, en contient plusieurs, ou chevauche une autre zone déjà dessinée, l'aperçu devient rouge et le rectangle n'est pas validé au relâchement.
- Redimensionner une zone remplace son ancien rectangle par le nouveau : les anciennes cases de cette même zone situées hors du nouveau rectangle sont effacées automatiquement.
- Si le drag commence dans un rectangle existant, le redimensionnement reste **verrouillé sur cette zone** : croiser l'indice d'une autre zone ne peut pas changer silencieusement l'identité du rectangle.
- Un simple **tap sur un rectangle existant supprime le rectangle entier**.
- Un tap sur une cellule vide contenant un indice permet toujours de créer un rectangle 1×1 ; les règles de taille/forme peuvent ensuite le signaler comme incorrect si nécessaire.
- Les changements de rectangle conservent la détection de retour arrière/statistiques.
- Une courte animation de validation accompagne le rectangle au relâchement, désactivée avec `prefers-reduced-motion`.
- La légende Rectangles FR/EN a été réécrite pour décrire le nouveau geste.

### Validation spécifique v2.8.0
- Test d'un glissé `[L1C1 → L2C3]` : création d'un rectangle 2×3 complet, avec sélection automatique de l'indice contenu.
- Test de redimensionnement : un rectangle existant est remplacé par la nouvelle géométrie et ne laisse aucune case résiduelle.
- Test de chevauchement : une tentative recouvrant une autre zone est refusée.
- Test de conversion coordonnées écran → cellule : la sélection suit correctement le doigt et se bloque sur les cellules de bord lorsque le doigt dépasse légèrement.
- Test du tap : le rectangle existant complet est supprimé, pas seulement la cellule touchée.
- Test du rendu d'aperçu : les quatre côtés du rectangle sont correctement identifiés, y compris dans les glissements en sens inverse.
- La mécanique repose sur un geste de glissement permettant de dessiner un rectangle contenant exactement une cellule-indice ; les rectangles couvrent la grille sans chevauchement.
- Les tests d'unicité Rectangles et les tests du Web Worker/cache de pré-génération sont rejoués avant empaquetage final.

## Correctif v2.7.1 — Rectangles : affichage et fluidité
- Le moteur d'affichage de Rectangles ne redessine plus toute la grille à chaque case peinte pendant un glissé.
- Lorsqu'une case change, seules **cette case et ses quatre voisines** sont rafraîchies immédiatement ; le contrôle des erreurs, la sauvegarde et la détection de victoire sont regroupés sur la prochaine frame via `requestAnimationFrame`.
- Les indices de zones sont créés une seule fois lors du rendu de la grille. `drawP()` ne détruit/recrée plus leur `innerHTML`, ce qui évite scintillements et micro-décalages.
- Les anciennes bordures épaisses autour de **chaque case peinte** sont supprimées. Rectangles dessine désormais un contour uniquement sur le **périmètre extérieur réel de chaque zone peinte**, rendant les rectangles plus lisibles.
- Les indices restent lisibles sur toutes les couleurs grâce à un petit fond translucide stable au-dessus de la couleur de zone.
- La couleur d'une case change avec une transition courte et progressive afin que le remplissage au doigt soit plus fluide.
- La palette des zones reste sur **une seule ligne horizontale**, sans défilement vertical ni écrasement ; la zone active est signalée par une transition plus douce.
- Les animations respectent toujours `prefers-reduced-motion`.
- Les erreurs restent prioritaires visuellement : une case illégale conserve le surlignage rouge et n'est pas masquée par le contour de zone.

### Validation spécifique v2.7.1
- Test du rafraîchissement local : les contours haut/droite/bas/gauche sont recalculés correctement quand une case change de zone ou est effacée.
- Vérification statique : `paintCell()` n'appelle plus `drawP()` ; les changements pendant le glissé passent par `refreshPatchNeighborhood()` et `schedulePatchAfterPaint()`.
- Vérification que `drawP()` ne recrée plus les indices.
- Tests de syntaxe de `app.js`, `precompute-worker.js` et `sw.js`.
- Réexécution des tests du Web Worker et du cache de pré-génération pour vérifier que la modification de Rectangles n'introduit pas de régression sur v2.7.0.
- Un test navigateur réel Chromium n'a pas pu être exécuté dans cet environnement car l'accès local HTTP du navigateur est bloqué par l'administration ; la validation visuelle est donc fondée sur les tests DOM/structure et devra être confirmée sur Safari/iPhone.

## Évolution v2.7.0 — pré-génération des grilles en arrière-plan
- Après l'affichage de la première grille, QUADLUD démarre un **Web Worker dédié** qui prépare silencieusement les prochaines grilles sans bloquer l'interface.
- La réserve cible est de **2 grilles prêtes par jeu et par niveau de difficulté** :
  - Couronnes : Facile, Moyen, Difficile, Expert ;
  - Soleil-Lune : Facile, Moyen, Difficile ;
  - Grille 6 : Facile, Moyen, Difficile ;
  - Rectangles : Facile, Moyen, Difficile.
- La grille du **jeu et niveau actuellement utilisés** est prioritaire. Les autres niveaux du même jeu suivent, puis les niveaux moyens des autres jeux, puis le reste.
- Couronnes Expert, nettement plus coûteux à générer, est préparé en dernier sauf si le joueur est actuellement en mode Expert.
- Lors d'un appui sur `Nouvelle` ou d'un changement de difficulté, QUADLUD consomme d'abord une grille déjà prête. Si le cache correspondant est vide, le générateur synchrone historique reste le **fallback**, donc la fonctionnalité n'introduit aucun blocage fonctionnel.
- Une grille consommée est immédiatement retirée du cache et le worker prépare son remplacement.
- Le worker est **sériel (un seul calcul à la fois)** afin de ne pas multiplier les pics CPU et de conserver la fluidité tactile.
- Lorsque l'application est masquée, aucun nouveau calcul de fond n'est lancé ; la file reprend quand elle redevient visible.
- Le worker réutilise **les mêmes fonctions de génération et d'analyse que `app.js`** via `importScripts`, ce qui évite une seconde implémentation divergente des règles et niveaux de difficulté.
- Le défi quotidien reste déterministe et **n'utilise pas** le cache ordinaire.
- Pour Couronnes, les grilles pré-générées respectent le mécanisme anti-répétition v2.6.2 : une signature canonique est réservée dans le cache, puis transférée vers l'historique de la journée au moment où la grille est réellement affichée. Une grille déjà vue, ou équivalente par rotation/miroir, n'est jamais mise en cache.
- Le cache de pré-génération est en mémoire uniquement : il est naturellement vidé au redémarrage/rechargement de l'application et au changement de date.
- `precompute-worker.js` est ajouté au cache du Service Worker pour que la pré-génération fonctionne aussi hors ligne après le premier chargement.

### Validation spécifique v2.7.0
- Le worker a généré avec succès les **13 combinaisons jeu/niveau**, et chaque grille produite a été revalidée pour l'unicité de sa solution.
- Test spécifique Couronnes : le worker refuse correctement une signature déjà interdite et produit une grille non équivalente.
- Test du gestionnaire de cache : priorité `jeu/niveau courant`, stockage, consommation, transfert anti-répétition Couronnes et remise à zéro au changement de date.
- Test d'intégration : les quatre fonctions de jeu consomment une grille précalculée avant d'appeler le générateur synchrone.
- Le défi quotidien a été vérifié pour ignorer le cache ordinaire.
- Politique Expert vérifiée : Couronnes Expert est différé en temps normal et devient prioritaire lorsque le joueur joue en Expert.
- Mesures indicatives dans l'environnement de test pour une grille préparée : Sudoku/Rectangles quelques millisecondes à quelques dizaines de ms, Soleil-Lune de quelques dizaines à quelques centaines de ms, Couronnes Difficile autour de la seconde dans certains cas ; Couronnes Expert peut être beaucoup plus coûteux, d'où sa priorité adaptée. Ces calculs ont lieu dans le worker et ne bloquent pas le thread d'interface.

## Correctif v2.6.2 — pas de répétition des grilles Couronnes dans la session
- Lorsqu'une grille Couronnes ordinaire est affichée, l'application mémorise sa **signature canonique** en mémoire pour la journée courante.
- Une nouvelle grille Couronnes ne peut plus être sélectionnée si elle est identique à une grille déjà affichée dans la même session et le même jour.
- L'équivalence prend en compte les **8 symétries du carré** : rotations 0°, 90°, 180°, 270° et les quatre variantes obtenues par miroir.
- La comparaison est également indépendante des numéros internes de zones : deux partitions identiques dont les identifiants de zones ont simplement été renommés sont reconnues comme la même grille.
- L'historique est volontairement **en mémoire uniquement** : il disparaît au redémarrage/rechargement de l'application, conformément au comportement demandé.
- Si l'application reste ouverte après minuit, l'historique repart automatiquement pour la nouvelle date.
- Le défi quotidien Couronnes reste volontairement déterministe : le rouvrir le même jour redonne la même grille quotidienne. En revanche, cette grille est mémorisée afin qu'une partie Couronnes ordinaire créée ensuite ne puisse pas reproduire cette grille ni une de ses rotations/miroirs.
- La sélection de difficulté est conservée : plusieurs candidats non équivalents sont générés puis classés avant de choisir celui correspondant au niveau demandé.

### Validation spécifique v2.6.2
- Vérification de la signature canonique sur les **8 transformations** d'une même grille : toutes produisent la même signature.
- Vérification après renommage arbitraire des identifiants de zones : même signature.
- Test de **30 générations successives le même jour** (18 Moyen + 12 Difficile) : 30 signatures canoniques distinctes, aucune répétition ni équivalence par rotation/miroir.
- Toutes les grilles de ce test conservent une solution unique.
- Vérification du changement de date : une grille de la veille n'est pas considérée comme déjà produite le lendemain.
- Vérification du défi quotidien : déterminisme conservé, puis génération ordinaire différente de la grille quotidienne déjà affichée.

## Correctif v2.6.1 — repère couleur des zones dans les indices Couronnes
- Dans toutes les explications Couronnes, lorsqu'une **zone numérotée** est citée, son numéro est désormais précédé d'un petit rectangle portant **exactement la même couleur que la zone sur le plateau**.
- Le repère est utilisé pour les déductions directes (rang 0) ainsi que pour les explications de rang 1, 2 et 3 lorsqu'une zone intervient dans le raisonnement.
- La palette Couronnes a été centralisée dans une constante unique : le plateau et les repères des explications utilisent donc la même source de couleurs, évitant toute divergence.
- Le numéro de zone reste affiché à côté du rectangle, afin de conserver une référence textuelle en plus du repère visuel.
- Le repère possède un contour discret pour rester identifiable en thème clair comme sombre.

## Évolution v2.6.0 — diagnostic d’indices Couronnes et rang 3
- Le moteur Couronnes suit maintenant explicitement : **rang 0 → rang 1 → rang 2 → rang 3** dans un budget global maximum de **5 secondes**.
- Rang 0 renforcé : il détecte non seulement une ligne/colonne/zone avec une seule position de reine, mais aussi les `X` directement imposés par une reine déjà visible.
- Correction d’une régression d’affichage : le moteur pouvait trouver correctement un indice de rang 1 puis échouer lors de sa mise en forme (`rank1Why` absent), donnant l’impression que le bouton Indice ne réagissait pas. Le renderer rang 1 est restauré et couvert par un test d’intégration du bouton.
- Les indices de rang 0 portent désormais explicitement `rank: 0` et la pièce (`reine` ou `X`) à poser.
- Le rang 3 effectue une recherche bornée supplémentaire : après une hypothèse, il teste une première unité contrainte puis un niveau supplémentaire de continuations. Une hypothèse n’est éliminée que si toutes les branches testées conduisent à une contradiction démontrée.
- Les explications de rang 3 utilisent cinq étapes : **Hypothèse → Première conséquence → Deuxième vérification → Impasse → Conclusion**.
- Si aucun indice n’est trouvé, le message indique précisément que les rangs 0, 1, 2 et 3 ont été testés et explique qu’aucun coup n’est forcé à cette profondeur.
- Si le budget de 5 secondes est dépassé, le message indique **le rang pendant lequel la recherche a été interrompue** et précise que ce rang n’a pas été exploré complètement.
- En cas d’exception interne, le message indique le rang concerné et la raison technique disponible ; aucun indice non vérifié n’est affiché.
- La fenêtre d’indice reste déplaçable au doigt grâce à la poignée `Déplacer / Move`.

### Validation spécifique v2.6.0
- 120 grilles Couronnes **Difficile** testées au tout premier coup : **120/120** ont produit un indice correct, dont 50 de rang 0 et 70 de rang 1 ; 0 absence de réponse, 0 timeout, 0 faux indice.
- Vérification particulière des zones singleton : toutes les grilles Difficile testées contenant une zone de surface 1 ont été détectées correctement au rang 0.
- 800 états Couronnes Difficile/Expert testés directement avec le moteur rang 2 : **800/800 indices corrects**, 0 faux indice.
- Les mêmes 800 états testés directement avec le moteur rang 3 : **800/800 indices corrects**, 0 faux indice, 0 timeout ; temps maximal observé ≈ 60 ms dans l’environnement de test.
- La chaîne normale conserve l’arrêt anticipé : si un rang inférieur trouve un indice, les rangs supérieurs ne sont pas exécutés.

## Correctif v2.5.4 — réponse du bouton Indice Couronnes et fenêtre mobile
- Couronnes dispose maintenant d’un budget explicite de **5 000 ms** pour la recherche d’un indice.
- Dès l’appui sur `Indice`, un message `Recherche d’un indice…` est affiché avant de lancer le calcul, afin que l’action soit toujours visible.
- La recherche distingue les issues et affiche un message dans tous les cas : **indice trouvé**, **aucun indice déductible**, **limite de 5 secondes atteinte**, **partie en pause**, ou **erreur interne de recherche**.
- Les recherches de rang 1 et de rang 2 contrôlent le budget pendant leur parcours et abandonnent proprement si le délai est dépassé.
- `Aucun indice` et `Délai dépassé` ne déclenchent plus le marqueur `💡`, puisque aucun indice n’a effectivement été donné.
- La fenêtre d’indice possède désormais une poignée `Déplacer / Move` et peut être déplacée au doigt ou à la souris.
- Son déplacement est limité à l’intérieur de la fenêtre visible afin qu’elle ne puisse pas être perdue hors écran.
- Le bouton `Fermer / Close` reste disponible après déplacement.

## Correctif v2.5.3 — explications pédagogiques de rang 1
- Les quatre jeux présentent désormais les inférences de rang 1 sous forme de démonstration : **1. Essai → 2. Ce que cela provoque → 3. Pourquoi ça bloque → 4. Conclusion**.
- Couronnes nomme la case testée puis la ligne, colonne ou zone précise qui perdrait toute possibilité de reine.
- Soleil-Lune nomme la case qui devient impossible et explique pourquoi lune et soleil y sont rejetés lorsque cette information est disponible.
- Grille 6 liste les candidats éliminés et précise la case qui resterait sans candidat ou le chiffre qui n'aurait plus de place dans une ligne, colonne ou bloc.
- Rectangles liste les zones alternatives rejetées et précise la zone sans rectangle valide ou la case qui ne pourrait plus être couverte.
- Le moteur logique n'utilise toujours pas la solution cachée pour produire l'indice.

## Correctif v2.5.2 — explications Couronnes de rang 2
- Les explications Couronnes de rang 2 suivent maintenant concrètement la grille.
- L'indice commence par tester explicitement `reine ♛` ou `X` dans la case étudiée.
- Il nomme ensuite la **ligne, colonne ou zone précise** qui devient problématique.
- Les emplacements de reine encore apparemment possibles dans cette unité sont listés un par un.
- Pour chacun, l'application indique la conséquence concrète : quelle autre ligne, colonne ou zone se retrouverait sans emplacement pour sa reine.
- La conclusion explique ensuite pourquoi l'hypothèse de départ doit être rejetée.
- Le moteur de décision reste indépendant de la solution cachée.

## Correctif v2.5.1 — explications de rang 2 plus lisibles
- Le raisonnement de rang 2 est présenté comme une démonstration numérotée : **1. Hypothèse → 2. Conséquence → 3. Impasse → 4. Conclusion**.
- Soleil-Lune nomme désormais la case précise qui devient impossible et teste explicitement les deux symboles sur cette case.
- Pour chaque symbole rejeté, l’explication cherche à citer la règle concrète : trois symboles consécutifs, dépassement de l’équilibre 3/3, ou relation `=` / `×` avec une case voisine.
- La formulation abstraite « on poursuit les possibilités légales » a été supprimée des explications Soleil-Lune de rang 2.
- Quand une branche de rang 2 échoue au contrôle suivant, l'explication descend jusqu'à la **case réellement bloquée** et détaille séparément pourquoi `☾` et `☀` y sont impossibles, avec la règle concrète et les coordonnées concernées.
- Le moteur logique n’est pas modifié : ce correctif améliore la trace pédagogique sans changer la décision produite.

## Évolution v2.5.0 — inférence de rang 2 pédagogique
- Le moteur d’indices suit désormais l’ordre : **règles directes → rang 1 → rang 2 → aucun indice**.
- Le rang 2 ne s’exécute qu’après échec des niveaux précédents.
- Un candidat survivant au rang 1 est simulé ; le moteur examine ensuite les décisions encore possibles au coup suivant. Si une décision obligatoire se retrouve sans aucune réponse viable, l’hypothèse initiale est éliminée.
- L’algorithme utilise l’arrêt anticipé : dès qu’une branche viable est trouvée, l’exploration inutile de cette branche s’arrête.
- L’explication n’emploie pas seulement « contradiction de rang 2 » : elle présente une démonstration pédagogique en quatre étapes **Hypothèse → Conséquence → Impasse → Conclusion**, avec les coordonnées des cases concernées.
- Soleil-Lune : le moteur peut éliminer un soleil ou une lune qui est légal immédiatement mais qui rend, au niveau suivant, une case sans symbole légal ou l’équilibre 3/3 impossible.
- Grille 6 : un candidat peut être éliminé s’il laisse ensuite une case sans candidat ou une unité sans emplacement viable.
- Couronnes : une hypothèse `reine` ou `X` peut être éliminée si elle conduit au niveau suivant à une ligne ou une zone sans position de reine viable.
- Rectangles : une affectation de zone peut être éliminée si elle conduit au niveau suivant à une case sans zone possible ou à un ensemble de rectangles incompatible.
- Aucun moteur d’indice de rang 2 n’utilise la solution cachée pour choisir le coup.
- Les explications restent bilingues et persistantes jusqu’au bouton `Fermer / Close`.

## Évolution v2.4.0 — inférence logique de rang 1
- Le moteur d’indices comporte maintenant deux étages : déduction directe, puis **inférence de rang 1** si aucune règle immédiate ne suffit.
- Une inférence de rang 1 simule chaque candidat encore légal **sans modifier le plateau**. Un candidat est éliminé s’il crée immédiatement une contradiction ou s’il laisse, au coup suivant, une contrainte obligatoire sans aucun candidat légal.
- Cette analyse n’utilise jamais la solution cachée pour sélectionner l’indice.
- **Soleil-Lune** : après simulation d’un soleil ou d’une lune, le moteur vérifie les limites 3/3, les suites de trois, les relations `=` / `×`, puis vérifie que chaque case encore vide conserve au moins un symbole légal. Un coup légal à l’instant T mais qui rend le coup suivant impossible est donc éliminé.
- **Grille 6** : chaque candidat d’une case est simulé. Il est rejeté s’il crée un doublon, une case sans candidat, ou si un chiffre manquant n’a plus aucune position possible dans une ligne, colonne ou bloc 2×3.
- **Couronnes** : pour chaque case encore possible, le moteur compare `reine` et `X`. Il rejette un choix s’il crée un conflit ou laisse une ligne, colonne ou zone sans aucune position possible pour sa reine.
- **Rectangles** : une attribution de zone est rejetée si elle laisse une zone sans rectangle compatible, un marquage déjà posé sans rectangle possible, ou une case restante qui ne peut plus être couverte par aucune zone.
- Si un seul candidat survit, l’indice explique quel candidat opposé conduit à l’impasse et pourquoi le coup conseillé est forcé.
- Si plusieurs candidats restent compatibles après cette profondeur d’analyse, aucun coup n’est révélé.
- Les indices restent persistants, bilingues, et le troisième appui applique uniquement le coup déjà démontré.

## Correctif v2.3.3 — indices déductibles depuis l’état affiché
- Le moteur d’indices ne consulte plus la solution cachée pour choisir un coup.
- Un indice n’est proposé que s’il peut être déduit des éléments actuellement visibles sur le plateau.
- Si aucun coup n’est logiquement forcé à cet instant, l’application affiche `Aucun coup directement déductible avec l’état actuel / No move can be directly deduced from the current state` au lieu de révéler la solution.
- Couronnes : recherche d’une ligne, colonne ou zone n’ayant plus qu’une seule case possible, compte tenu des reines et `X` déjà posés.
- Soleil-Lune : déductions par équilibre 3/3, règle des trois symboles, ou relation `=` / `×` avec un voisin connu.
- Grille 6 : candidats uniques puis singles cachés dans une ligne, colonne ou bloc 2×3, calculés uniquement à partir des chiffres visibles.
- Rectangles : génération des rectangles encore compatibles avec chaque indice et les cases déjà peintes ; une case n’est proposée que si elle appartient à tous les rectangles possibles d’une zone, ou si un seul rectangle reste possible.
- Le troisième niveau d’aide applique uniquement le coup déjà démontré par les deux premiers niveaux.
- Les textes d’explication restent persistants et bilingues.

## Amélioration v2.3.2 — indices explicatifs
- Chaque indice indique maintenant explicitement **la pièce, le symbole, le chiffre ou la zone à poser**, ainsi que sa position.
- Le premier niveau d’aide affiche le **coup conseillé** et la zone à observer.
- Le deuxième niveau conserve le coup conseillé et ajoute **Pourquoi**, avec une justification logique.
- Le troisième niveau applique le coup tout en conservant l’explication à l’écran jusqu’au bouton `Fermer / Close`.
- Couronnes : l’indice indique la reine à placer et rappelle les contraintes de ligne, colonne, zone et non-adjacence ; lorsqu’une zone n’a plus qu’une case non barrée, cette raison est explicitement signalée.
- Soleil-Lune : l’indice indique `☀` ou `☾` et explique, lorsque c’est déductible, l’équilibre 3/3, une relation `=`/`×` ou la règle interdisant trois symboles identiques.
- Grille 6 : l’indice donne le chiffre exact ; lorsqu’il s’agit d’un candidat unique, il précise que les autres chiffres sont éliminés par la ligne, la colonne et le bloc 2×3.
- Rectangles : l’indice donne la zone à attribuer à une case et explique la contrainte de taille et/ou de forme portée par l’indice.
- Les textes restent bilingues français / anglais et les indices restent persistants jusqu’à fermeture.

## Correctif v2.3.1 — indices persistants et saisie Soleil-Lune
- Les indices ne disparaissent plus automatiquement après 1,4 seconde.
- Chaque niveau d’indice est maintenant affiché dans une carte persistante avec bouton `Fermer / Close`.
- La carte reste visible aussi longtemps que nécessaire et ne bloque pas le plateau.
- Une nouvelle action de jeu ferme automatiquement l’ancien indice afin d’éviter d’encombrer l’écran.
- Soleil-Lune : lorsqu’une lune est posée au premier tap, cette case est temporairement exclue de la colorisation rouge.
- La lune provisoire reste visible, mais aucune violation impliquant cette case n’est signalée avant l’action suivante.
- Au tap suivant, l’ancienne saisie devient définitive ; si la case est transformée en soleil, les règles sont alors évaluées normalement.
- Le comportement évite les faux signaux rouges liés au cycle de saisie vide → lune → soleil.

## Évolution v2.3.0 — coups illégaux et score d’assistance
- Les quatre jeux signalent désormais immédiatement les **coups illégaux** en colorant en rouge toutes les cases directement concernées par la violation.
- Couronnes : conflits entre reines sur une même ligne, colonne, zone ou cases adjacentes.
- Soleil-Lune : plus de 3 symboles identiques dans une ligne/colonne, trois symboles identiques consécutifs ou relation `=` / `×` violée.
- Grille 6 : doublons dans une ligne, une colonne ou un bloc 2×3.
- Rectangles : occupation d’un autre indice, dépassement de taille impossible ou violation immédiate d’une contrainte de forme. Les situations encore réparables sans violer une règle ne sont pas signalées comme illégales.
- Deux marqueurs d’assistance sont suivis par tentative : `↶` pour un **retour en arrière/correction**, `💡` pour **indice utilisé**.
- Les marqueurs apparaissent immédiatement à côté du score de difficulté pendant la partie puis sont enregistrés dans l’historique des scores.
- Le cycle nécessaire de Couronnes `vide → X → reine` n’est pas considéré comme un retour en arrière. En revanche, retirer une reine ou effacer des X par drag l’est.
- Pour Soleil-Lune, un cycle normal nécessaire pour choisir le symbole n’est pas pénalisé ; revenir d’un symbole posé vers vide est enregistré.
- Pour Sudoku, remplacer ou effacer une valeur déjà saisie est un retour en arrière.
- Pour Rectangles, effacer ou repeindre une case déjà attribuée est un retour en arrière.
- Réinitialiser une partie en cours après avoir joué est enregistré comme retour en arrière. Une nouvelle tentative créée après réinitialisation d’une partie déjà terminée repart avec des indicateurs vierges.

## Ajustement v2.2.6 — Couronnes Difficile / Expert
- Couronnes **Difficile** : au maximum **une seule** région de surface 1.
- Couronnes **Expert** : les régions de surface 1 sont désormais **interdites**.
- Le générateur rejette explicitement toute grille qui ne respecte pas ces limites, même si la construction interne produit accidentellement davantage de singletons.
- Les contrôles d’unicité et la sélection par score de difficulté restent inchangés.

## Ajustement v2.2.5 — reines dorées persistantes
- Après une victoire Couronnes, les reines restent dorées tant que la grille réussie est affichée.
- Le doré devient un marqueur visuel permanent de réussite du plateau, et non plus un simple effet d’animation.
- La fermeture du pop-up de félicitations ne retire pas le doré.
- Une réinitialisation du plateau retire le doré, puisque la grille n’est alors plus terminée.
- Si un plateau Couronnes déjà terminé est re-rendu dans la même session, le style doré est restauré automatiquement.

## Amélioration v2.2.4 — reines dorées à la victoire
- Lorsqu’une grille Couronnes est résolue correctement, toutes les reines passent temporairement en doré pendant l’animation de victoire.
- La couleur normale des reines reste inchangée pendant la partie.
- Le rendu doré est adapté aux thèmes clair et sombre.
- La couleur de victoire disparaît automatiquement à la fin de l’animation du plateau, avant le pop-up de félicitations.

## Correctif v2.2.3 — suppression définitive de l’effet de zoom Couronnes
- Le correctif traite désormais aussi la géométrie du plateau, pas seulement les gestes Safari.
- `#qboard` utilise `contain:size layout paint` : son contenu ne peut plus modifier ses dimensions.
- Chaque cellule Couronnes est confinée avec `min-width:0`, `min-height:0` et `overflow:hidden`.
- Les symboles reine `♛` et croix `×` sont positionnés en absolu dans leur case : ils ne participent plus au calcul de taille du grid.
- Le verrouillage tactile Safari de v2.2.2 (`touchstart`, `touchmove`, `touchend`, `dblclick`, `gesturestart`) est conservé.
- Ainsi, deux taps rapides produisent uniquement les deux actions du jeu, sans agrandissement du plateau lié au symbole affiché.

## Correctif v2.2.2 — double-tap zoom Safari sur Couronnes
- Le plateau Couronnes intercepte maintenant directement les événements tactiles natifs Safari `touchstart`, `touchmove` et `touchend` avec `preventDefault()` en mode non-passif.
- Ce correctif vient en complément de `touch-action:none`, du blocage `dblclick`, de `gesturestart`, du menu contextuel et du verrouillage du viewport déjà utilisé par l’application.
- Les deux taps rapides restent traités par les `pointer events` du jeu et doivent donc produire vide → `X` → reine, sans déclencher le zoom Safari.
- Le correctif est limité au plateau Couronnes afin de ne pas désactiver le zoom de la page entière.

## Correctif v2.2.1 — réinitialisation et double-tap Couronnes
- Ajout d’un bouton `Réinitialiser / Reset` dans chacun des quatre jeux.
- La réinitialisation conserve la même grille et la même difficulté, restaure uniquement les indices de départ et remet le chronomètre à `00:00`.
- Couronnes : toutes les reines et tous les `X` sont effacés.
- Soleil-Lune : seules les cases données au départ sont restaurées.
- Grille 6 : seuls les chiffres initiaux sont conservés.
- Rectangles : toutes les zones peintes sont effacées et la première zone redevient active.
- Si une partie déjà terminée est réinitialisée, une nouvelle tentative statistique est démarrée ; une partie en cours réinitialisée reste la même tentative.
- Le plateau Couronnes neutralise explicitement le double-clic, le geste de zoom et le menu contextuel du navigateur.
- Deux taps rapides restent interprétés par le jeu comme deux actions successives : vide → `X` → reine, sans agrandissement du plateau.
- La non-régression Couronnes Difficile rejette aussi les grilles générées avec trop de régions singleton accidentelles, afin de préserver le niveau de difficulté calibré.

## Évolution v2.2.0 — français / anglais, règles et À propos
- Interface bilingue **Français / English**, avec langue mémorisée localement.
- Le changement de langue est disponible dans `Préférences / Preferences` et s’applique immédiatement aux écrans principaux, commandes, difficultés, statistiques, défi quotidien, messages de jeu, aides et résultats partagés.
- Chaque jeu possède désormais une explication complète de ses règles, disponible dans le panneau de jeu et via le bouton `Règles / Rules`.
- Ajout d’un écran `À propos / About` accessible depuis l’accueil.
- L’écran À propos affiche la version courante, `© 2026 Serge Benoliel`, la nature propriétaire du logiciel et l’interdiction de copie, modification, redistribution et exploitation sans autorisation écrite préalable.
- L’attribut de langue du document HTML est mis à jour dynamiquement (`fr` / `en`) pour l’accessibilité.
- Les réglages de langue utilisent la même persistance locale que les autres préférences.

## Correctif v2.1.1 — drag Couronnes et tempo de victoire
- Le drag Couronnes est refait au niveau du plateau : le gestionnaire `pointermove` est maintenant attaché au même élément qui capture le pointeur, ce qui corrige le comportement tactile sur iPhone/iPad.
- Le calcul de la cellule sous le doigt utilise directement les coordonnées du plateau, sans dépendre de `elementFromPoint` pendant la capture.
- Le drag interpole toutes les cases entre la case de départ et la position courante : un mouvement rapide ne saute plus de cases.
- Départ sur une case vide : glisser ajoute des `X`.
- Départ sur une case contenant `X` : glisser efface les `X`.
- Une reine existante n’est jamais écrasée par le drag.
- Un toucher simple conserve le cycle vide → `X` → reine → vide.
- Après la fin de l’animation de victoire, une pause supplémentaire de **0,4 seconde** est désormais respectée avant l’affichage du pop-up de félicitations.

## Évolution v2.1.0 — Couronnes Difficile renforcé + Expert
- Le niveau **Difficile** de Couronnes reste en 8×8 mais sa génération a été profondément recalibrée.
- Les régions d’une seule case, qui rendaient trop de reines immédiatement évidentes, passent d’environ cinq à seulement deux.
- Le générateur produit plusieurs grilles uniques puis conserve les candidates ayant le score de recherche le plus élevé.
- Lors de la campagne de calibration, les grilles Difficile effectivement sélectionnées ont obtenu des scores d’environ **912 à 2140**, contre des scores souvent inférieurs à 100 pour les anciennes grilles faciles.
- Nouveau niveau **Expert**, uniquement pour Couronnes, en **9×9**.
- Expert utilise très peu de régions triviales et sélectionne les grilles les plus complexes parmi davantage de candidates ; pendant la calibration, les scores sélectionnés étaient d’environ **1721 à 5489**.
- Une neuvième couleur de région a été ajoutée pour que les 9 régions d’une grille Expert restent visuellement distinctes.
- Facile et Moyen restent disponibles et leurs dimensions restent 6×6 et 7×7.
- Les autres jeux conservent uniquement Facile / Moyen / Difficile.

## Amélioration v2.0.4 — victoire automatique
- La réussite est maintenant détectée automatiquement dès le dernier coup correct, sans appuyer sur `Vérifier`.
- Le comportement est actif sur Couronnes, Soleil-Lune, Grille 6 et Rectangles.
- Le bouton `Vérifier` reste disponible pour contrôler une grille incomplète ou incorrecte.
- Une vraie réussite déclenche une animation en deux temps : propagation sur les cases du plateau, puis particules et écran de victoire.
- L’affichage volontaire de la `Solution` reste distingué d’une victoire et ne déclenche pas la réussite automatique.
- L’animation respecte `prefers-reduced-motion`.

## Amélioration v2.0.3 — interaction Couronnes
- Glisser le doigt horizontalement ou verticalement sur la grille Couronnes pose désormais des `X` en continu.
- Le geste se verrouille automatiquement sur la ligne ou la colonne dominante afin d’éviter les marquages accidentels en diagonale.
- Un simple toucher conserve le cycle habituel : vide → `X` → reine → vide.
- Nouvelle option **Croix automatiques quand je place une reine**, désactivée par défaut et mémorisée sur l’appareil.
- Lorsque l’option est activée, placer une reine marque automatiquement d’un `X` toutes les cases incompatibles : même ligne, même colonne, même région et cases adjacentes.
- Le glissement ne remplace jamais une reine déjà posée par un `X`.

## Correctif v2.0.2 — taille fixe des grilles
- Les quatre plateaux définissent maintenant explicitement un nombre identique de lignes et de colonnes en fractions fixes.
- Dans Couronnes, l’ajout d’une reine ou d’une croix ne peut plus modifier la hauteur d’une ligne ni redimensionner le plateau.
- Le correctif est appliqué de manière préventive à Soleil-Lune, Grille 6 et Rectangles afin que leur géométrie reste également indépendante du contenu des cases.

## Propriété intellectuelle et licence
Copyright © 2026 Serge Benoliel. All rights reserved.

QUADLUD est un logiciel propriétaire. Toute copie, modification, redistribution, publication, sous-licence, vente, mise à disposition de tiers ou exploitation, totale ou partielle, est interdite sans l’autorisation écrite préalable de Serge Benoliel.

Les conditions détaillées figurent dans le fichier `LICENSE`.

## Nouveautés v2.0.0 — finition générale
- Identité visuelle harmonisée et interface affinée sans modifier les règles des quatre jeux.
- Thèmes Automatique / Clair / Sombre avec suivi du thème système et mémorisation locale.
- Sons discrets optionnels, désactivables depuis l’écran Préférences.
- Écran de victoire avec temps, difficulté, score éventuel et statut Défi quotidien.
- Partage du résultat via la feuille de partage native quand elle est disponible ; export visuel SVG lorsque le navigateur accepte le partage de fichiers, avec repli vers partage texte ou presse-papiers.
- Nouvelles icônes PWA PNG 180, 192 et 512 px pour une meilleure installation sur iPhone/iPad et autres appareils.
- Manifest PWA enrichi (id, scope, description, catégories, orientation).
- Service worker v2 : activation immédiate, nettoyage des anciens caches, navigation avec repli hors ligne et stratégie cache/réseau pour les ressources.
- Respect de `prefers-reduced-motion` conservé pour les animations.
- Aucune dépendance externe : fonctionnement statique et hors ligne conservé.

## Stratégie de compatibilité v2.0
La v2.0 conserve les clés de stockage des sauvegardes, statistiques, défis et préférences afin de préserver les données des versions précédentes. Les générateurs, solveurs, analyseurs de difficulté et seeds des défis quotidiens ne sont pas modifiés par la couche de finition v2.0.

## Nouveautés v1.7.0 — aides intelligentes
- Le bouton Indice devient progressif en trois niveaux : (1) où regarder, (2) quelle logique appliquer, (3) révélation minimale.
- La case concernée est mise en évidence sans modifier la grille aux deux premiers niveaux.
- Couronnes : orientation vers ligne/région puis croisement des contraintes de colonnes et régions.
- Soleil-Lune : orientation vers une case puis rappel ciblé relations =/×, équilibre 3/3 et règle des trois.
- Grille 6 : orientation puis élimination ligne/colonne/bloc 2×3.
- Rectangles : orientation vers une zone puis raisonnement sur taille/forme et rectangles compatibles.
- Le troisième appel sur le même indice révèle seulement une case/reine/chiffre ; la sauvegarde reste cohérente.
- Les animations d’aide respectent `prefers-reduced-motion`.

## Nouveautés v1.6.0 — défi quotidien
- Quatre défis quotidiens : Couronnes, Soleil-Lune, Grille 6 et Rectangles.
- Grilles quotidiennes déterministes : une date + un jeu + la version produisent la même grille sur tous les appareils.
- Difficulté quotidienne fixée à Moyen afin de rendre les temps comparables.
- Chronomètre et statistiques habituels conservés pour les défis.
- Suivi spécifique de la réussite quotidienne et du meilleur temps du jour.
- Calendrier visuel des 28 derniers jours, avec intensité de 0 à 4 jeux terminés.
- Reprise d’un défi en cours via la sauvegarde existante.
- Fonctionnement entièrement local et hors ligne ; la date civile de l’appareil sert de référence.
- Le seed inclut la version majeure de génération (`v1.6`) : cela garantit la reproductibilité dans cette version, sans prétendre qu’une future modification du générateur conservera exactement les anciennes grilles.

## Nouveautés v1.5.0 — progression et statistiques
- Historique local des 200 dernières parties terminées ou abandonnées.
- Comptage séparé des parties démarrées, résolues, abandonnées et des solutions affichées.
- Taux de réussite = parties résolues / parties démarrées.
- Meilleur temps et temps moyen par jeu et difficulté.
- Série de jours consécutifs calculée sur les jours comportant au moins une partie résolue.
- Écran Statistiques accessible depuis l’accueil.
- Les statistiques restent uniquement sur l’appareil, sans serveur ni compte.
- Une simple sortie vers l’accueil n’est pas considérée comme un abandon si la partie reste sauvegardée et peut être reprise.
- Une nouvelle partie qui remplace une partie non terminée clôt l’ancienne comme abandonnée.

## Nouveautés v1.4.0 — expérience mobile et tactile
- Interface resserrée pour iPhone : plateau plus grand, commandes prioritaires accessibles sans défilement inutile et respect des safe areas.
- Cibles tactiles d’au moins ~44 px pour les commandes principales.
- Retour haptique léger lorsque le navigateur/appareil l’autorise (API Vibration ; absence de vibration sans impact fonctionnel).
- Retour visuel immédiat à l’appui sur les boutons.
- Grille 6 : surbrillance de la ligne, colonne et région de la case sélectionnée, ainsi que des chiffres identiques ; pavé numérique collant en bas de l’écran.
- Rectangles : peinture au doigt conservée et renforcée avec `touch-action:none` sur le plateau pour limiter le défilement involontaire pendant un glissement.
- Adaptation portrait, petits écrans, faible hauteur et paysage.
- Respect de `prefers-reduced-motion`.
- Overlay « Génération… » pendant la création/sélection d’une nouvelle grille.
- Navigation clavier ajoutée au Grille 6 sur iPad avec clavier ou ordinateur.
- Aucune dépendance supplémentaire : le site reste statique, PWA et à plat pour GitHub Pages.

## Nouveautés v1.3.0 — difficulté mesurée
- Chaque grille générée reçoit désormais un score de difficulté calculé après génération.
- Plusieurs candidats uniques sont générés ; le moteur retient le plus accessible pour Facile, un candidat médian pour Moyen et le plus exigeant pour Difficile.
- Le score et la technique dominante sont visibles directement sous le titre du jeu.
- Grille 6 : analyse logique par singles nus et singles cachés ; les blocages non résolus par ces techniques ajoutent une pénalité de complexité.
- Soleil-Lune : propagation des relations `=` / `×`, règles d’équilibrage 3/3 et interdiction de trois symboles identiques consécutifs ; les cellules non résolues augmentent le score.
- Rectangles : analyse des rectangles candidats, rectangles forcés et couvertures forcées ; les ambiguïtés restantes augmentent le score.
- Couronnes : analyseur de contraintes mesurant les embranchements et le nombre de nœuds nécessaires. Cette mesure est un indicateur de difficulté de résolution, mais ne prétend pas reproduire exactement toutes les stratégies humaines de Couronnes.
- Les grilles restent acceptées uniquement si elles possèdent exactement une solution.

## Fonctions conservées
- Générateurs réels v1.2 pour les 4 jeux
- 3 difficultés : facile, moyen, difficile
- chronomètre avec pause/reprise
- sauvegarde automatique et reprise de partie
- nouvelle partie, vérification, indice et solution
- interactions tactiles iPhone/iPad
- Rectangles par toucher/glissement
- PWA installable et fonctionnement hors ligne après premier chargement
- aucune dépendance serveur, aucun framework, aucun CDN

## Méthode de calibration
La difficulté ne dépend plus seulement du nombre d’indices. Pour chaque nouvelle partie, plusieurs puzzles valides et uniques sont générés puis analysés. Le moteur sélectionne un puzzle dans la distribution obtenue selon le niveau demandé. Le score reste continu afin d’éviter de présenter comme identiques deux grilles de complexité sensiblement différente.

Les analyseurs logiques de Sudoku, Soleil-Lune et Rectangles utilisent des règles explicites et déterministes. Couronnes utilise actuellement un analyseur de contraintes avec mesure de recherche ; une simulation plus complète des techniques humaines de Couronnes pourra être enrichie ultérieurement.

## Déploiement GitHub Pages sur iPhone
Tous les fichiers sont à la racine : aucun sous-répertoire. Envoyer directement les fichiers du ZIP dans le dépôt GitHub puis publier la branche principale depuis la racine.

## Processus de validation
Avant livraison :
1. contrôle de syntaxe JavaScript avec Node ;
2. tests répétés des générateurs sur les trois difficultés ;
3. recomptage des solutions Couronnes, Soleil-Lune, Grille 6 et Rectangles ;
4. validation structurelle des régions, rectangles et contraintes de chaque jeu ;
5. tests des analyseurs de difficulté et comparaison des distributions de scores ;
6. vérification des références HTML/CSS/JS/PWA et du numéro de version ;
7. création d’un ZIP strictement à plat ;
8. réextraction dans un répertoire distinct ;
9. comparaison SHA-256 de chaque fichier source et réextrait ;
10. contrôle final de `build-info.json` et du README.

## Roadmap
- v1.4 : UX mobile/tactile avancée
- v1.5 : progression et statistiques
- v1.6 : défi quotidien
- v1.7 : aides intelligentes
- v2.0 : finition complète
- v2.1 optionnelle : éditeur de puzzles

Projet indépendant. L’interface, le code, les générateurs et les grilles sont propres à QUADLUD.
