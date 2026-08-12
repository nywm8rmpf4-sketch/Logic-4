# Logic 4 — v2.1.0

Site statique mobile-first regroupant Queens, Tango, Mini Sudoku 6×6 et Patches.

## Évolution v2.1.0 — Queens Difficile renforcé + Expert
- Le niveau **Difficile** de Queens reste en 8×8 mais sa génération a été profondément recalibrée.
- Les régions d’une seule case, qui rendaient trop de reines immédiatement évidentes, passent d’environ cinq à seulement deux.
- Le générateur produit plusieurs grilles uniques puis conserve les candidates ayant le score de recherche le plus élevé.
- Lors de la campagne de calibration, les grilles Difficile effectivement sélectionnées ont obtenu des scores d’environ **912 à 2140**, contre des scores souvent inférieurs à 100 pour les anciennes grilles faciles.
- Nouveau niveau **Expert**, uniquement pour Queens, en **9×9**.
- Expert utilise très peu de régions triviales et sélectionne les grilles les plus complexes parmi davantage de candidates ; pendant la calibration, les scores sélectionnés étaient d’environ **1721 à 5489**.
- Une neuvième couleur de région a été ajoutée pour que les 9 régions d’une grille Expert restent visuellement distinctes.
- Facile et Moyen restent disponibles et leurs dimensions restent 6×6 et 7×7.
- Les autres jeux conservent uniquement Facile / Moyen / Difficile.

## Amélioration v2.0.4 — victoire automatique
- La réussite est maintenant détectée automatiquement dès le dernier coup correct, sans appuyer sur `Vérifier`.
- Le comportement est actif sur Queens, Tango, Mini Sudoku et Patches.
- Le bouton `Vérifier` reste disponible pour contrôler une grille incomplète ou incorrecte.
- Une vraie réussite déclenche une animation en deux temps : propagation sur les cases du plateau, puis particules et écran de victoire.
- L’affichage volontaire de la `Solution` reste distingué d’une victoire et ne déclenche pas la réussite automatique.
- L’animation respecte `prefers-reduced-motion`.

## Amélioration v2.0.3 — interaction Queens
- Glisser le doigt horizontalement ou verticalement sur la grille Queens pose désormais des `X` en continu.
- Le geste se verrouille automatiquement sur la ligne ou la colonne dominante afin d’éviter les marquages accidentels en diagonale.
- Un simple toucher conserve le cycle habituel : vide → `X` → reine → vide.
- Nouvelle option **Croix automatiques quand je place une reine**, désactivée par défaut et mémorisée sur l’appareil.
- Lorsque l’option est activée, placer une reine marque automatiquement d’un `X` toutes les cases incompatibles : même ligne, même colonne, même région et cases adjacentes.
- Le glissement ne remplace jamais une reine déjà posée par un `X`.

## Correctif v2.0.2 — taille fixe des grilles
- Les quatre plateaux définissent maintenant explicitement un nombre identique de lignes et de colonnes en fractions fixes.
- Dans Queens, l’ajout d’une reine ou d’une croix ne peut plus modifier la hauteur d’une ligne ni redimensionner le plateau.
- Le correctif est appliqué de manière préventive à Tango, Mini Sudoku et Patches afin que leur géométrie reste également indépendante du contenu des cases.

## Propriété intellectuelle et licence
Copyright © 2026 Serge Benoliel. All rights reserved.

Logic 4 est un logiciel propriétaire. Toute copie, modification, redistribution, publication, sous-licence, vente, mise à disposition de tiers ou exploitation, totale ou partielle, est interdite sans l’autorisation écrite préalable de Serge Benoliel.

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
- Queens : orientation vers ligne/région puis croisement des contraintes de colonnes et régions.
- Tango : orientation vers une case puis rappel ciblé relations =/×, équilibre 3/3 et règle des trois.
- Mini Sudoku : orientation puis élimination ligne/colonne/bloc 2×3.
- Patches : orientation vers une zone puis raisonnement sur taille/forme et rectangles compatibles.
- Le troisième appel sur le même indice révèle seulement une case/reine/chiffre ; la sauvegarde reste cohérente.
- Les animations d’aide respectent `prefers-reduced-motion`.

## Nouveautés v1.6.0 — défi quotidien
- Quatre défis quotidiens : Queens, Tango, Mini Sudoku et Patches.
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
- Mini Sudoku : surbrillance de la ligne, colonne et région de la case sélectionnée, ainsi que des chiffres identiques ; pavé numérique collant en bas de l’écran.
- Patches : peinture au doigt conservée et renforcée avec `touch-action:none` sur le plateau pour limiter le défilement involontaire pendant un glissement.
- Adaptation portrait, petits écrans, faible hauteur et paysage.
- Respect de `prefers-reduced-motion`.
- Overlay « Génération… » pendant la création/sélection d’une nouvelle grille.
- Navigation clavier ajoutée au Mini Sudoku sur iPad avec clavier ou ordinateur.
- Aucune dépendance supplémentaire : le site reste statique, PWA et à plat pour GitHub Pages.

## Nouveautés v1.3.0 — difficulté mesurée
- Chaque grille générée reçoit désormais un score de difficulté calculé après génération.
- Plusieurs candidats uniques sont générés ; le moteur retient le plus accessible pour Facile, un candidat médian pour Moyen et le plus exigeant pour Difficile.
- Le score et la technique dominante sont visibles directement sous le titre du jeu.
- Mini Sudoku : analyse logique par singles nus et singles cachés ; les blocages non résolus par ces techniques ajoutent une pénalité de complexité.
- Tango : propagation des relations `=` / `×`, règles d’équilibrage 3/3 et interdiction de trois symboles identiques consécutifs ; les cellules non résolues augmentent le score.
- Patches : analyse des rectangles candidats, rectangles forcés et couvertures forcées ; les ambiguïtés restantes augmentent le score.
- Queens : analyseur de contraintes mesurant les embranchements et le nombre de nœuds nécessaires. Cette mesure est un indicateur de difficulté de résolution, mais ne prétend pas reproduire exactement toutes les stratégies humaines de Queens.
- Les grilles restent acceptées uniquement si elles possèdent exactement une solution.

## Fonctions conservées
- Générateurs réels v1.2 pour les 4 jeux
- 3 difficultés : facile, moyen, difficile
- chronomètre avec pause/reprise
- sauvegarde automatique et reprise de partie
- nouvelle partie, vérification, indice et solution
- interactions tactiles iPhone/iPad
- Patches par toucher/glissement
- PWA installable et fonctionnement hors ligne après premier chargement
- aucune dépendance serveur, aucun framework, aucun CDN

## Méthode de calibration
La difficulté ne dépend plus seulement du nombre d’indices. Pour chaque nouvelle partie, plusieurs puzzles valides et uniques sont générés puis analysés. Le moteur sélectionne un puzzle dans la distribution obtenue selon le niveau demandé. Le score reste continu afin d’éviter de présenter comme identiques deux grilles de complexité sensiblement différente.

Les analyseurs logiques de Sudoku, Tango et Patches utilisent des règles explicites et déterministes. Queens utilise actuellement un analyseur de contraintes avec mesure de recherche ; une simulation plus complète des techniques humaines de Queens pourra être enrichie ultérieurement.

## Déploiement GitHub Pages sur iPhone
Tous les fichiers sont à la racine : aucun sous-répertoire. Envoyer directement les fichiers du ZIP dans le dépôt GitHub puis publier la branche principale depuis la racine.

## Processus de validation
Avant livraison :
1. contrôle de syntaxe JavaScript avec Node ;
2. tests répétés des générateurs sur les trois difficultés ;
3. recomptage des solutions Queens, Tango, Mini Sudoku et Patches ;
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

Projet indépendant. Les mécaniques suivent les règles publiques des jeux correspondants ; l’interface et le code sont originaux et sans affiliation à LinkedIn.
