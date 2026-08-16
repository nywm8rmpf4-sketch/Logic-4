# QUADLUD — PROJECT_STATE

**Version :** 2.21.18  
**Date :** 2026-08-16  
**Dernière étape validée :** reconstruction Grille 6 — moteur d’inférences explicable partagé Coach/Tuteur, étapes 0 à 9  
**Prochain jalon roadmap :** v2.22 — Accessibilité

## État synthétique

v2.21.18 reconstruit le raisonnement pédagogique de **Grille 6** autour du moteur autonome `sudoku-logic.js`. Le moteur travaille uniquement à partir de l’état visible de la grille et de faits/preuves structurés. Il devient la source de vérité commune pour le Logic Coach, le Tuteur, `proveValue()` et le diagnostic des branches Exploration.

Le solveur exhaustif historique reste séparé et conservé pour les usages techniques de génération, unicité et validation. Il n’est plus utilisé pour produire une étape Tuteur Grille 6.

## Architecture du moteur Grille 6

### État logique et preuves
- faits `VALUE(cell,value)` ;
- faits `NOT_CANDIDATE(cell,value)` ;
- prémisses, dépendances, unités/cellules focales et chaînes de preuve structurées ;
- session pure sans DOM, `current` ni `current.sol` ;
- reconstruction déterministe depuis `current.state` après restauration ;
- `clone()` / `snapshot()` ;
- `diagnose()` ;
- `nextDeduction()` / `applyDeduction()` ;
- `nextValueStep()` ;
- `proveValue()` ;
- `solveLogically()` ;
- `metrics()`.

### Règles implémentées
- R0 — propagation des valeurs visibles en ligne, colonne et bloc 2×3 ;
- R1 — Naked Single ;
- R2a/R2b/R2c — Hidden Single ligne / colonne / bloc ;
- R3 — candidat verrouillé bloc→ligne/colonne et ligne/colonne→bloc ;
- R4 — paires/triplets nus et cachés ;
- R5 — contradiction niveau 1 ;
- R6 — conséquence commune de branches ;
- R7 — contradiction imbriquée niveau 2 ;
- C1 — doublon ; C2 — zéro candidat ; C3 — chiffre sans position ; C4 — valeur incompatible.

### Bornes du raisonnement avancé
- fermeture déterministe : 32 déductions par branche ;
- R5 : 72 hypothèses ;
- R6 : 12 cellules, toutes les valeurs candidates (jusqu’à 6) ;
- R7 : 24 hypothèses primaires, 12 cellules secondaires, 3 candidats secondaires au plus, 240 évaluations secondaires, profondeur maximale 2 ;
- recherche d’un `VALUE` : 64 déductions logiques intermédiaires au plus.

Ces bornes peuvent conduire à `blocked` / `not-yet-proven`. Elles ne permettent jamais d’inventer une conclusion.

## Intégration Logic Coach
- `hintS()` utilise `SudokuLogic` depuis l’état réel visible ;
- aucune utilisation de `current.sol` pour choisir ou justifier l’indice ;
- parcours conservé en 3 affichages : où regarder → technique + justification → chiffre ;
- une séquence complète révèle au maximum un chiffre ;
- après le coup, la prochaine demande repart du nouvel état ;
- les éliminations R3–R7 restent internes à la preuve jusqu’à l’unique conclusion `VALUE`.

## Intégration Tuteur
- le Tuteur utilise le même `SudokuLogic` ;
- une étape ajoute au maximum un chiffre ;
- une nouvelle session est créée depuis l’état visible du Tuteur à chaque étape ;
- aucune session logique Sudoku n’est persistée dans `walkthroughSession` ;
- le Tuteur reste non destructif pour la partie du joueur ;
- le fallback exhaustif Grille 6 est neutralisé pour le parcours pédagogique ;
- après Undo/Redo, le Tuteur démarre depuis l’état courant restauré.

## Audit des coups / Exploration
`proveValue(cell,value)` distingue :
- `proven` ;
- `incorrect` ;
- `not-yet-proven` ;
- `contradictory`.

Un coup compatible mais non démontré n’est pas assimilé à faux. Un coup `incorrect` ne peut pas être promu en hypothèse. Le prochain coup logique de l’audit et le diagnostic de branche Exploration utilisent également `SudokuLogic`.

## Undo/Redo et persistance
- saisie tactile et saisie clavier Grille 6 enregistrées dans le même historique ;
- Undo 1/N et Redo 1/N ;
- changement de branche après Undo ;
- invalidation du Redo sur une nouvelle branche ;
- Coach/Tuteur recalculés après restauration ;
- sauvegarde `logic4-*` inchangée ;
- aucune structure de session logique persistée ; candidats et preuves reconstruits depuis la grille.

## Internationalisation / mobile
- nouvelles techniques Grille 6 nommées dans les 30 langues ;
- FR/EN : explications détaillées en prose ;
- autres langues : intitulés localisés + preuve symbolique neutre, sans fallback anglais ;
- RTL arabe contrôlé ;
- viewport Chromium 390×844 : grille, pavé, Coach et Tuteur sans débordement horizontal.

## Tests de puzzles complets
Résultats enregistrés dans `tests/sudoku-complete-puzzles-results.json` :

- easy, seed `10101` : 16 cases vides, unicité = 1, 16 étapes, 16 `NAKED_SINGLE`, technique maximale T1, résolu ;
- medium, seed `20202` : 22 cases vides, unicité = 1, 22 étapes, 22 `NAKED_SINGLE`, technique maximale T1, résolu ;
- hard, seed `123456789` : 25 cases vides, unicité = 1, 25 étapes, 21 `NAKED_SINGLE` + 4 `HIDDEN_SINGLE_ROW`, technique maximale T2, résolu ;
- contradictoire : 0 étape, contradiction C1 détectée.

Pour ces trois seeds générés : 0 hypothèse avancée, profondeur 0, 0 budget atteint. Le résultat logique correspond à `current.sol`, utilisé uniquement comme oracle QA après résolution et jamais comme entrée du moteur.

## Tests réellement exécutés et réussis

### Syntaxe
- `node --check` sur `app.js`, `queens-logic.js`, `tango-logic.js`, `patches-logic.js`, `sudoku-logic.js`, `precompute-worker.js`, `sw.js` et les tests JS — OK.

### Grille 6 — Node
- `sudoku-logic-core.test.js` — OK ;
- `sudoku-logic-direct.test.js` — OK ;
- `sudoku-logic-intermediate.test.js` — OK ;
- `sudoku-logic-advanced.test.js` — OK ;
- `sudoku-logic-prove-value.test.js` — OK ;
- `sudoku-logic-value-step.test.js` — OK ;
- `sudoku-logic-solve.test.js` — OK.

### Grille 6 — Chromium
- `sudoku-coach-browser.test.py` — OK ;
- `sudoku-tutor-browser.test.py` — OK ;
- `sudoku-audit-browser.test.py` — OK ;
- `sudoku-state-i18n-browser.test.py` — OK ;
- `sudoku-complete-puzzles-browser.test.py` — OK.

### Non-régression
- 6 suites moteur Rectangles — OK ;
- `patches-ui-integration.test.js` — OK ;
- `patches-browser-smoke.py` — OK ;
- `global-browser-regression.py` — OK.

## Tests non exécutés
- Safari réel sur iPhone/iPad physique ;
- gestes tactiles/multi-touch sur matériel réel ;
- relecture linguistique native des 28 traductions hors FR/EN ;
- persistance `localStorage` entre deux navigations HTTP réelles : l’environnement Playwright bloquait `localhost`/`file://`; le test exécuté couvre sérialisation → nouveau contexte JavaScript → `resumeSaved()` avec un stockage compatible injecté.

## Problèmes / risques connus
- `TRAINING_ADVANCED_FIXTURES.S_CONTRADICTION_R2` est historiquement déclaré `unique:true`, mais un recomptage autonome trouve 6 solutions. Cette fixture n’est pas utilisée comme test de résolution complète v2.21.18 et reste une dette QA.
- R5–R7 sont volontairement bornés pour garantir une exécution prévisible, notamment sur mobile ; certaines grilles compatibles peuvent donc rester bloquées au niveau logique disponible.
- Les anciens helpers Sudoku subsistent pour certains parcours Apprendre/S’entraîner historiques ; ils ne sont plus la source de vérité du Coach, du Tuteur, de l’audit normal ou du diagnostic Exploration.

## Décisions d’architecture importantes
- `sudoku-logic.js` reste autonome, au même niveau que `queens-logic.js`, `tango-logic.js` et `patches-logic.js` ; aucun framework logique générique artificiel n’a été introduit.
- Solveur de complétion/génération et moteur pédagogique restent séparés.
- Une étape pédagogique visible correspond à un seul placement de chiffre ; les éliminations intermédiaires restent dans la preuve.
- Les sessions logiques sont reconstructibles et ne sont pas stockées dans l’historique/persistance.

## Prochaine étape
**v2.22 — Accessibilité**, conformément à `ROADMAP.md`.

## Propriété intellectuelle
Copyright © 2026 Serge Benoliel  
All rights reserved.
