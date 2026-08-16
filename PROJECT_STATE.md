# QUADLUD — PROJECT_STATE

**Version :** 2.21.12  
**Date :** 2026-08-16  
**Dernière étape validée :** étape 9/9 — validation globale et préparation de la source officielle  
**Prochain jalon roadmap :** v2.22 — Accessibilité

## État synthétique

v2.21.12 reconstruit le Logic Coach et le mode Tuteur de **Rectangles** autour d'un moteur d'inférences explicables pur, partagé et indépendant du DOM et de la solution finale cachée.

Le moteur repose sur les **domaines de rectangles candidats** de chaque indice, et non sur la seule surface de l'indice. Les quatre types d'indices sont normalisés par deux contraintes indépendantes :

- surface + forme ;
- surface seule ;
- forme seule ;
- `?` = `area=null`, `shape=null`.

Les formes conservent strictement les règles du jeu :

- carré : `height == width` ;
- vertical : `height > width` ;
- horizontal : `width > height`.

Le cœur logique accepte les grilles carrées de **5×5 à 10×10**. Le générateur actuel n'a pas été étendu : Easy/Medium/Hard restent respectivement 5×5, 6×6 et 7×7.

## Architecture principale

### Nouveau cœur logique

`patches-logic.js` fournit une session pure `PatchesLogic.Session` avec :

- domaines candidats par indice ;
- faits `OWNER`, `NOT_OWNER`, `SELECTED_RECT` ;
- candidats actifs et éliminés avec provenance ;
- déductions structurées avec règle, coût, rang, `techniqueLevel`, prémisses, dépendances, focus, conclusions et `explanationData` ;
- fermeture coût 0 jusqu'au point fixe ;
- contradictions structurées ;
- recherche pédagogique de la prochaine déduction ;
- sérialisation/restauration des preuves logiques pour Undo/Redo ;
- métriques de raisonnement.

### Règles coût 0 / T0

- `RECTANGLE_DOMAIN`
- `CLUE_SINGLETON`
- `CELL_SINGLETON`
- `RECTANGLE_PROPAGATION`
- `OWNERSHIP_PROPAGATION`
- `RECTANGULAR_CLOSURE`
- `AREA_COMPLETION`

Les conséquences coût 0 gardent le rang de leurs prémisses.

### Règles coût +1

T1 :

- `COMMON_COVERAGE`
- `CELL_LOCKED_TO_CLUE`

T2 :

- `COVERAGE_LOCKED_SET`
- `NO_SUPPORT_CLUE`
- `NO_SUPPORT_CELL`
- `LOCAL_DOMAIN_SUPPORT`

`COVERAGE_LOCKED_SET` utilise `minArea` issu des domaines courants et fonctionne donc également lorsque la surface n'est pas imprimée.

### Règles coût +2 / T3

- `ASSUMPTION_CONTRADICTION`
- `COMMON_CONSEQUENCE`

Les hypothèses sont propagées dans des branches réelles. Elles ne sont recherchées qu'après épuisement des techniques directes.

### Rang et niveau de technique

Le rang suit :

`rank(conclusion) = max(rank(premises)) + ruleCost`

`rank` et `techniqueLevel` sont indépendants. Une fermeture coût 0 ne fait pas monter artificiellement le rang.

### Contradictions prises en charge

- `NO_CANDIDATE_FOR_CLUE`
- `NO_COVER_FOR_CELL`
- `SELECTED_OVERLAP`
- `OWNER_CONFLICT`
- `OTHER_CLUE_INSIDE`
- `AREA_OVERFLOW`
- `SHAPE_IMPOSSIBLE`
- `COVERAGE_DEFICIT`
- `NO_LOCAL_COMPLETION`

## Logic Coach Rectangles

- travaille sur l'état réel courant du joueur ;
- n'utilise pas la solution finale comme preuve ;
- premier appui : orientation / zone à observer ;
- deuxième appui : explication structurée + conséquence ;
- les surbrillances proviennent des `focusCells`, `focusClues` et rectangles de la preuve ;
- l'audit distingue `proven`, `incorrect`, `contradictory` et `not-yet-proven` ;
- un rectangle correspondant à la solution mais non démontré reste `not-yet-proven` ;
- les preuves sans effet visible immédiat sont persistées avec rang/provenance afin de rester cohérentes après Undo/Redo.

## Tuteur Rectangles

- utilise le même `PatchesLogic.Session` que le Coach ;
- l'ancien fallback Rectangles fondé sur les complétions exhaustives finales a été supprimé ;
- chaque étape contient l'état avant, la déduction, la fermeture coût 0, l'état après et les métriques ;
- navigation arrière/avant par snapshots déterministes ;
- la partie réelle du joueur n'est pas modifiée par la navigation Tuteur ;
- une résolution ne peut avancer que par preuves structurées ; si les recherches avancées bornées ne trouvent plus de preuve, le Tuteur s'arrête plutôt que de rejouer la solution finale.

## Undo/Redo

Les snapshots Rectangles incluent désormais :

- `paint` ;
- rectangles sélectionnés ;
- preuves logiques persistées (OWNER/NOT_OWNER/sélections/éliminations et provenance).

Undo, Redo et changement de branche ont été testés. Un nouveau coup après Undo invalide le Redo et les faits logiques dérivés incompatibles.

## Générateur et difficultés

Aucune modification algorithmique volontaire du générateur Rectangles.

Comparaison source-à-source avec v2.21.11 : les fonctions suivantes sont strictement inchangées :

- `makeRectTiling`
- `possiblePatchRects`
- `countPatchSolutions`
- `generatePatchesPuzzle`
- `analyzePatches`
- `patchesCandidate`

Easy/Medium/Hard restent 5×5/6×6/7×7. Aucun Expert Rectangles n'a été ajouté.

## Internationalisation et mobile

- 30 langues conservées ;
- moteur logique sans texte français/anglais ;
- explications détaillées FR/EN rendues par la couche UI depuis la preuve ;
- autres langues : gabarits localisés génériques existants, toujours pilotés par une preuve structurée ;
- moteur Rectangles ajouté au précache du service worker ;
- test mobile réel dans Chromium avec viewport tactile 390×844 et grille synthétique 10×10.

## Contrôle de complexité

Les techniques combinatoires avancées sont volontairement bornées : petits groupes, nombre maximal de candidats et profondeur limitée des hypothèses/conséquences communes.

**Conséquence connue :** les déductions produites restent logiquement correctes, mais le moteur peut être incomplet sur certains puzzles complexes, particulièrement 10×10. Dans ce cas il peut ne pas trouver de prochaine preuve alors qu'une preuve plus coûteuse existe. Il ne bascule pas sur la solution finale.

## Métriques internes exposées

- `maxRank`
- `maxTechniqueLevel`
- `deductionsByRule`
- `countCommonCoverage`
- `countCellLocked`
- `countCoverageLockedSet`
- `countNoSupport`
- `countLocalDomain`
- `countContradiction`
- compteur de `COMMON_CONSEQUENCE`

Ces métriques ne modifient pas automatiquement les difficultés.

## Fichiers créés

- `patches-logic.js`
- `tests/patches-logic-domain.test.js`
- `tests/patches-logic-closure.test.js`
- `tests/patches-logic-direct.test.js`
- `tests/patches-logic-advanced.test.js`
- `tests/patches-logic-contradictions.test.js`
- `tests/patches-logic-solve.test.js`
- `tests/patches-ui-integration.test.js`
- `tests/patches-browser-smoke.py`
- `tests/global-browser-regression.py`
- `PROJECT_STATE.md`

## Fichiers modifiés

- `app.js`
- `index.html`
- `sw.js`
- `precompute-worker.js`
- `manifest.webmanifest`
- `build-info.json`
- `README.md`
- `ROADMAP.md`

Fichiers vérifiés mais inchangés : `queens-logic.js`, `tango-logic.js`, `styles.css`, `LICENSE`, icônes.

## Tests réellement exécutés et réussis

### Node — moteur Rectangles

- `node tests/patches-logic-domain.test.js` — OK
- `node tests/patches-logic-closure.test.js` — OK
- `node tests/patches-logic-direct.test.js` — OK
- `node tests/patches-logic-advanced.test.js` — OK
- `node tests/patches-logic-contradictions.test.js` — OK
- `node tests/patches-logic-solve.test.js` — OK

Couverture notamment : surface seule, forme seule, surface+forme, `?`, trois formes, `6 ▭`, `6 ▯`, 5×5, 10×10, singletons, OWNER/NOT_OWNER, propagation, fermeture rectangulaire, AREA_COMPLETION, règles T1/T2/T3, cas négatifs, rangs, persistance des preuves, contradictions et résolutions complètes par preuves.

### Intégration statique

- `node tests/patches-ui-integration.test.js` — OK

Vérifie notamment : chargement du moteur avant `app.js`, même moteur Coach/Tuteur, absence du fallback exhaustif Rectangles, persistance logique, retrait des anciens moteurs d'indices Rectangles parallèles, tailles du générateur inchangées, absence d'Expert Rectangles, 30 langues, moteur sans DOM/solution finale, copyright conservé.

### Chromium réel — Rectangles

- `python tests/patches-browser-smoke.py` — OK

Couvre : FR/EN, Coach deux appuis, application des preuves, Undo/Redo, nouvelle branche, reset, rectangle correct dans la solution mais `not-yet-proven`, erreurs forme/surface, Tuteur avec preuves structurées, navigation arrière/avant, résolution complète d'une fixture, génération Easy/Medium/Hard 5/6/7, viewport tactile 390×844 et grille synthétique 10×10.

### Chromium réel — non-régression autres jeux

- `python tests/global-browser-regression.py` — OK

Couronnes, Soleil-Lune et Grille 6 : rendu, ouverture du Coach, ouverture/avance du Tuteur, aucune erreur console/page dans ces parcours.

### Structure / syntaxe / cohérence

- `node -c` : `app.js`, `patches-logic.js`, `queens-logic.js`, `tango-logic.js`, `sw.js`, `precompute-worker.js` — OK
- parsing JSON : `manifest.webmanifest`, `build-info.json` — OK
- comparaison source-à-source du générateur Rectangles avec v2.21.11 — fonctions algorithmiques listées ci-dessus inchangées
- cohérence des URLs versionnées des assets/worker : v2.21.12
- présence de `patches-logic.js?v=2.21.12` dans le précache service worker

## Tests exécutés et échoués pendant le développement

Tous les problèmes détectés ont été corrigés puis les suites concernées ont été réexécutées avec succès. Principaux incidents de développement :

- faux `OWNER_CONFLICT` lors d'une dérivation mécanique de `NOT_OWNER` — corrigé ;
- deux fixtures de tests négatifs/saturation mal construites — corrigées ;
- classement `SHAPE_IMPOSSIBLE` insuffisamment précis pour une combinaison surface+forme impossible — corrigé ;
- premier scénario navigateur Undo/Redo contournait l'initialisation normale de l'historique — banc de test corrigé, application non fautive ;
- URL active du worker restée cache-bustée en v2.21.10 — corrigée en v2.21.12.

Aucun échec bloquant connu ne subsiste dans les tests exécutés.

## Tests non exécutés

- Safari réel / iPhone physique : non exécuté ;
- E2E PWA d'installation puis fonctionnement réellement hors ligne via service worker : non exécuté dans cet environnement ; précache vérifié statiquement ;
- campagne exhaustive sur tous les puzzles 10×10 possibles : non exécutée et non réaliste ; moteur avancé volontairement borné.

## Risques résiduels connus

1. Les bornes des techniques T2/T3 peuvent rendre le moteur incomplet sur certains puzzles complexes ; correction logique préservée, complétude non garantie.
2. L'UI/générateur actuel ne propose que 5×5–7×7 malgré le support moteur 5×5–10×10 ; 10×10 a été validé sur fixture synthétique, pas comme difficulté générée.
3. Les explications les plus détaillées sont FR/EN ; les 28 autres langues utilisent le fallback pédagogique localisé générique existant.
4. Safari/iOS matériel et offline PWA réel restent à valider sur environnement cible.

## Décisions d'architecture importantes

- un seul moteur de preuves pour Coach, Tuteur et audit Rectangles ;
- pas d'explication sans `Deduction` structurée ;
- `OWNER` est un fait de premier ordre, indépendant d'un rectangle déjà sélectionné ;
- `?` n'a aucune branche solveur spéciale : absence de contrainte de surface et de forme ;
- fermeture coût 0 au point fixe ;
- rang fondé sur les prémisses, techniqueLevel indépendant ;
- faits logiques persistés dans l'historique lorsque nécessaire ;
- aucune lecture de la solution finale dans le moteur logique ;
- pas de fallback exhaustif final pour le Tuteur Rectangles ;
- algorithmes avancés bornés et préférence stricte aux règles simples ;
- générateur et difficultés conservés.

## Prochaine étape

**v2.22 — Accessibilité**, conformément à `ROADMAP.md`.

---

Copyright © 2026 Serge Benoliel  
All rights reserved.
