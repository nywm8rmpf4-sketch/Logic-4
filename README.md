# Logic 4 — v2.5.4

Site statique mobile-first regroupant Queens, Tango, Mini Sudoku 6×6 et Patches.

## Correctif v2.5.4 — réponse du bouton Indice Queens et fenêtre mobile
- Queens dispose maintenant d’un budget explicite de **5 000 ms** pour la recherche d’un indice.
- Dès l’appui sur `Indice`, un message `Recherche d’un indice…` est affiché avant de lancer le calcul, afin que l’action soit toujours visible.
- La recherche distingue les issues et affiche un message dans tous les cas : **indice trouvé**, **aucun indice déductible**, **limite de 5 secondes atteinte**, **partie en pause**, ou **erreur interne de recherche**.
- Les recherches de rang 1 et de rang 2 contrôlent le budget pendant leur parcours et abandonnent proprement si le délai est dépassé.
- `Aucun indice` et `Délai dépassé` ne déclenchent plus le marqueur `💡`, puisque aucun indice n’a effectivement été donné.
- La fenêtre d’indice possède désormais une poignée `Déplacer / Move` et peut être déplacée au doigt ou à la souris.
- Son déplacement est limité à l’intérieur de la fenêtre visible afin qu’elle ne puisse pas être perdue hors écran.
- Le bouton `Fermer / Close` reste disponible après déplacement.

## Correctif v2.5.3 — explications pédagogiques de rang 1
- Les quatre jeux présentent désormais les inférences de rang 1 sous forme de démonstration : **1. Essai → 2. Ce que cela provoque → 3. Pourquoi ça bloque → 4. Conclusion**.
- Queens nomme la case testée puis la ligne, colonne ou zone précise qui perdrait toute possibilité de reine.
- Tango nomme la case qui devient impossible et explique pourquoi lune et soleil y sont rejetés lorsque cette information est disponible.
- Mini Sudoku liste les candidats éliminés et précise la case qui resterait sans candidat ou le chiffre qui n'aurait plus de place dans une ligne, colonne ou bloc.
- Patches liste les zones alternatives rejetées et précise la zone sans rectangle valide ou la case qui ne pourrait plus être couverte.
- Le moteur logique n'utilise toujours pas la solution cachée pour produire l'indice.

## Correctif v2.5.2 — explications Queens de rang 2
- Les explications Queens de rang 2 suivent maintenant concrètement la grille.
- L'indice commence par tester explicitement `reine ♛` ou `X` dans la case étudiée.
- Il nomme ensuite la **ligne, colonne ou zone précise** qui devient problématique.
- Les emplacements de reine encore apparemment possibles dans cette unité sont listés un par un.
- Pour chacun, l'application indique la conséquence concrète : quelle autre ligne, colonne ou zone se retrouverait sans emplacement pour sa reine.
- La conclusion explique ensuite pourquoi l'hypothèse de départ doit être rejetée.
- Le moteur de décision reste indépendant de la solution cachée.

## Correctif v2.5.1 — explications de rang 2 plus lisibles
- Le raisonnement de rang 2 est présenté comme une démonstration numérotée : **1. Hypothèse → 2. Conséquence → 3. Impasse → 4. Conclusion**.
- Tango nomme désormais la case précise qui devient impossible et teste explicitement les deux symboles sur cette case.
- Pour chaque symbole rejeté, l’explication cherche à citer la règle concrète : trois symboles consécutifs, dépassement de l’équilibre 3/3, ou relation `=` / `×` avec une case voisine.
- La formulation abstraite « on poursuit les possibilités légales » a été supprimée des explications Tango de rang 2.
- Quand une branche de rang 2 échoue au contrôle suivant, l'explication descend jusqu'à la **case réellement bloquée** et détaille séparément pourquoi `☾` et `☀` y sont impossibles, avec la règle concrète et les coordonnées concernées.
- Le moteur logique n’est pas modifié : ce correctif améliore la trace pédagogique sans changer la décision produite.

## Évolution v2.5.0 — inférence de rang 2 pédagogique
- Le moteur d’indices suit désormais l’ordre : **règles directes → rang 1 → rang 2 → aucun indice**.
- Le rang 2 ne s’exécute qu’après échec des niveaux précédents.
- Un candidat survivant au rang 1 est simulé ; le moteur examine ensuite les décisions encore possibles au coup suivant. Si une décision obligatoire se retrouve sans aucune réponse viable, l’hypothèse initiale est éliminée.
- L’algorithme utilise l’arrêt anticipé : dès qu’une branche viable est trouvée, l’exploration inutile de cette branche s’arrête.
- L’explication n’emploie pas seulement « contradiction de rang 2 » : elle présente une démonstration pédagogique en quatre étapes **Hypothèse → Conséquence → Impasse → Conclusion**, avec les coordonnées des cases concernées.
- Tango : le moteur peut éliminer un soleil ou une lune qui est légal immédiatement mais qui rend, au niveau suivant, une case sans symbole légal ou l’équilibre 3/3 impossible.
- Mini Sudoku : un candidat peut être éliminé s’il laisse ensuite une case sans candidat ou une unité sans emplacement viable.
- Queens : une hypothèse `reine` ou `X` peut être éliminée si elle conduit au niveau suivant à une ligne ou une zone sans position de reine viable.
- Patches : une affectation de zone peut être éliminée si elle conduit au niveau suivant à une case sans zone possible ou à un ensemble de rectangles incompatible.
- Aucun moteur d’indice de rang 2 n’utilise la solution cachée pour choisir le coup.
- Les explications restent bilingues et persistantes jusqu’au bouton `Fermer / Close`.

## Évolution v2.4.0 — inférence logique de rang 1
- Le moteur d’indices comporte maintenant deux étages : déduction directe, puis **inférence de rang 1** si aucune règle immédiate ne suffit.
- Une inférence de rang 1 simule chaque candidat encore légal **sans modifier le plateau**. Un candidat est éliminé s’il crée immédiatement une contradiction ou s’il laisse, au coup suivant, une contrainte obligatoire sans aucun candidat légal.
- Cette analyse n’utilise jamais la solution cachée pour sélectionner l’indice.
- **Tango** : après simulation d’un soleil ou d’une lune, le moteur vérifie les limites 3/3, les suites de trois, les relations `=` / `×`, puis vérifie que chaque case encore vide conserve au moins un symbole légal. Un coup légal à l’instant T mais qui rend le coup suivant impossible est donc éliminé.
- **Mini Sudoku** : chaque candidat d’une case est simulé. Il est rejeté s’il crée un doublon, une case sans candidat, ou si un chiffre manquant n’a plus aucune position possible dans une ligne, colonne ou bloc 2×3.
- **Queens** : pour chaque case encore possible, le moteur compare `reine` et `X`. Il rejette un choix s’il crée un conflit ou laisse une ligne, colonne ou zone sans aucune position possible pour sa reine.
- **Patches** : une attribution de zone est rejetée si elle laisse une zone sans rectangle compatible, un marquage déjà posé sans rectangle possible, ou une case restante qui ne peut plus être couverte par aucune zone.
- Si un seul candidat survit, l’indice explique quel candidat opposé conduit à l’impasse et pourquoi le coup conseillé est forcé.
- Si plusieurs candidats restent compatibles après cette profondeur d’analyse, aucun coup n’est révélé.
- Les indices restent persistants, bilingues, et le troisième appui applique uniquement le coup déjà démontré.

## Correctif v2.3.3 — indices déductibles depuis l’état affiché
- Le moteur d’indices ne consulte plus la solution cachée pour choisir un coup.
- Un indice n’est proposé que s’il peut être déduit des éléments actuellement visibles sur le plateau.
- Si aucun coup n’est logiquement forcé à cet instant, l’application affiche `Aucun coup directement déductible avec l’état actuel / No move can be directly deduced from the current state` au lieu de révéler la solution.
- Queens : recherche d’une ligne, colonne ou zone n’ayant plus qu’une seule case possible, compte tenu des reines et `X` déjà posés.
- Tango : déductions par équilibre 3/3, règle des trois symboles, ou relation `=` / `×` avec un voisin connu.
- Mini Sudoku : candidats uniques puis singles cachés dans une ligne, colonne ou bloc 2×3, calculés uniquement à partir des chiffres visibles.
- Patches : génération des rectangles encore compatibles avec chaque indice et les cases déjà peintes ; une case n’est proposée que si elle appartient à tous les rectangles possibles d’une zone, ou si un seul rectangle reste possible.
- Le troisième niveau d’aide applique uniquement le coup déjà démontré par les deux premiers niveaux.
- Les textes d’explication restent persistants et bilingues.

## Amélioration v2.3.2 — indices explicatifs
- Chaque indice indique maintenant explicitement **la pièce, le symbole, le chiffre ou la zone à poser**, ainsi que sa position.
- Le premier niveau d’aide affiche le **coup conseillé** et la zone à observer.
- Le deuxième niveau conserve le coup conseillé et ajoute **Pourquoi**, avec une justification logique.
- Le troisième niveau applique le coup tout en conservant l’explication à l’écran jusqu’au bouton `Fermer / Close`.
- Queens : l’indice indique la reine à placer et rappelle les contraintes de ligne, colonne, zone et non-adjacence ; lorsqu’une zone n’a plus qu’une case non barrée, cette raison est explicitement signalée.
- Tango : l’indice indique `☀` ou `☾` et explique, lorsque c’est déductible, l’équilibre 3/3, une relation `=`/`×` ou la règle interdisant trois symboles identiques.
- Mini Sudoku : l’indice donne le chiffre exact ; lorsqu’il s’agit d’un candidat unique, il précise que les autres chiffres sont éliminés par la ligne, la colonne et le bloc 2×3.
- Patches : l’indice donne la zone à attribuer à une case et explique la contrainte de taille et/ou de forme portée par l’indice.
- Les textes restent bilingues français / anglais et les indices restent persistants jusqu’à fermeture.

## Correctif v2.3.1 — indices persistants et saisie Tango
- Les indices ne disparaissent plus automatiquement après 1,4 seconde.
- Chaque niveau d’indice est maintenant affiché dans une carte persistante avec bouton `Fermer / Close`.
- La carte reste visible aussi longtemps que nécessaire et ne bloque pas le plateau.
- Une nouvelle action de jeu ferme automatiquement l’ancien indice afin d’éviter d’encombrer l’écran.
- Tango : lorsqu’une lune est posée au premier tap, cette case est temporairement exclue de la colorisation rouge.
- La lune provisoire reste visible, mais aucune violation impliquant cette case n’est signalée avant l’action suivante.
- Au tap suivant, l’ancienne saisie devient définitive ; si la case est transformée en soleil, les règles sont alors évaluées normalement.
- Le comportement évite les faux signaux rouges liés au cycle de saisie vide → lune → soleil.

## Évolution v2.3.0 — coups illégaux et score d’assistance
- Les quatre jeux signalent désormais immédiatement les **coups illégaux** en colorant en rouge toutes les cases directement concernées par la violation.
- Queens : conflits entre reines sur une même ligne, colonne, zone ou cases adjacentes.
- Tango : plus de 3 symboles identiques dans une ligne/colonne, trois symboles identiques consécutifs ou relation `=` / `×` violée.
- Mini Sudoku : doublons dans une ligne, une colonne ou un bloc 2×3.
- Patches : occupation d’un autre indice, dépassement de taille impossible ou violation immédiate d’une contrainte de forme. Les situations encore réparables sans violer une règle ne sont pas signalées comme illégales.
- Deux marqueurs d’assistance sont suivis par tentative : `↶` pour un **retour en arrière/correction**, `💡` pour **indice utilisé**.
- Les marqueurs apparaissent immédiatement à côté du score de difficulté pendant la partie puis sont enregistrés dans l’historique des scores.
- Le cycle nécessaire de Queens `vide → X → reine` n’est pas considéré comme un retour en arrière. En revanche, retirer une reine ou effacer des X par drag l’est.
- Pour Tango, un cycle normal nécessaire pour choisir le symbole n’est pas pénalisé ; revenir d’un symbole posé vers vide est enregistré.
- Pour Sudoku, remplacer ou effacer une valeur déjà saisie est un retour en arrière.
- Pour Patches, effacer ou repeindre une case déjà attribuée est un retour en arrière.
- Réinitialiser une partie en cours après avoir joué est enregistré comme retour en arrière. Une nouvelle tentative créée après réinitialisation d’une partie déjà terminée repart avec des indicateurs vierges.

## Ajustement v2.2.6 — Queens Difficile / Expert
- Queens **Difficile** : au maximum **une seule** région de surface 1.
- Queens **Expert** : les régions de surface 1 sont désormais **interdites**.
- Le générateur rejette explicitement toute grille qui ne respecte pas ces limites, même si la construction interne produit accidentellement davantage de singletons.
- Les contrôles d’unicité et la sélection par score de difficulté restent inchangés.

## Ajustement v2.2.5 — reines dorées persistantes
- Après une victoire Queens, les reines restent dorées tant que la grille réussie est affichée.
- Le doré devient un marqueur visuel permanent de réussite du plateau, et non plus un simple effet d’animation.
- La fermeture du pop-up de félicitations ne retire pas le doré.
- Une réinitialisation du plateau retire le doré, puisque la grille n’est alors plus terminée.
- Si un plateau Queens déjà terminé est re-rendu dans la même session, le style doré est restauré automatiquement.

## Amélioration v2.2.4 — reines dorées à la victoire
- Lorsqu’une grille Queens est résolue correctement, toutes les reines passent temporairement en doré pendant l’animation de victoire.
- La couleur normale des reines reste inchangée pendant la partie.
- Le rendu doré est adapté aux thèmes clair et sombre.
- La couleur de victoire disparaît automatiquement à la fin de l’animation du plateau, avant le pop-up de félicitations.

## Correctif v2.2.3 — suppression définitive de l’effet de zoom Queens
- Le correctif traite désormais aussi la géométrie du plateau, pas seulement les gestes Safari.
- `#qboard` utilise `contain:size layout paint` : son contenu ne peut plus modifier ses dimensions.
- Chaque cellule Queens est confinée avec `min-width:0`, `min-height:0` et `overflow:hidden`.
- Les symboles reine `♛` et croix `×` sont positionnés en absolu dans leur case : ils ne participent plus au calcul de taille du grid.
- Le verrouillage tactile Safari de v2.2.2 (`touchstart`, `touchmove`, `touchend`, `dblclick`, `gesturestart`) est conservé.
- Ainsi, deux taps rapides produisent uniquement les deux actions du jeu, sans agrandissement du plateau lié au symbole affiché.

## Correctif v2.2.2 — double-tap zoom Safari sur Queens
- Le plateau Queens intercepte maintenant directement les événements tactiles natifs Safari `touchstart`, `touchmove` et `touchend` avec `preventDefault()` en mode non-passif.
- Ce correctif vient en complément de `touch-action:none`, du blocage `dblclick`, de `gesturestart`, du menu contextuel et du verrouillage du viewport déjà utilisé par l’application.
- Les deux taps rapides restent traités par les `pointer events` du jeu et doivent donc produire vide → `X` → reine, sans déclencher le zoom Safari.
- Le correctif est limité au plateau Queens afin de ne pas désactiver le zoom de la page entière.

## Correctif v2.2.1 — réinitialisation et double-tap Queens
- Ajout d’un bouton `Réinitialiser / Reset` dans chacun des quatre jeux.
- La réinitialisation conserve la même grille et la même difficulté, restaure uniquement les indices de départ et remet le chronomètre à `00:00`.
- Queens : toutes les reines et tous les `X` sont effacés.
- Tango : seules les cases données au départ sont restaurées.
- Mini Sudoku : seuls les chiffres initiaux sont conservés.
- Patches : toutes les zones peintes sont effacées et la première zone redevient active.
- Si une partie déjà terminée est réinitialisée, une nouvelle tentative statistique est démarrée ; une partie en cours réinitialisée reste la même tentative.
- Le plateau Queens neutralise explicitement le double-clic, le geste de zoom et le menu contextuel du navigateur.
- Deux taps rapides restent interprétés par le jeu comme deux actions successives : vide → `X` → reine, sans agrandissement du plateau.
- La non-régression Queens Difficile rejette aussi les grilles générées avec trop de régions singleton accidentelles, afin de préserver le niveau de difficulté calibré.

## Évolution v2.2.0 — français / anglais, règles et À propos
- Interface bilingue **Français / English**, avec langue mémorisée localement.
- Le changement de langue est disponible dans `Préférences / Preferences` et s’applique immédiatement aux écrans principaux, commandes, difficultés, statistiques, défi quotidien, messages de jeu, aides et résultats partagés.
- Chaque jeu possède désormais une explication complète de ses règles, disponible dans le panneau de jeu et via le bouton `Règles / Rules`.
- Ajout d’un écran `À propos / About` accessible depuis l’accueil.
- L’écran À propos affiche la version courante, `© 2026 Serge Benoliel`, la nature propriétaire du logiciel et l’interdiction de copie, modification, redistribution et exploitation sans autorisation écrite préalable.
- L’attribut de langue du document HTML est mis à jour dynamiquement (`fr` / `en`) pour l’accessibilité.
- Les réglages de langue utilisent la même persistance locale que les autres préférences.

## Correctif v2.1.1 — drag Queens et tempo de victoire
- Le drag Queens est refait au niveau du plateau : le gestionnaire `pointermove` est maintenant attaché au même élément qui capture le pointeur, ce qui corrige le comportement tactile sur iPhone/iPad.
- Le calcul de la cellule sous le doigt utilise directement les coordonnées du plateau, sans dépendre de `elementFromPoint` pendant la capture.
- Le drag interpole toutes les cases entre la case de départ et la position courante : un mouvement rapide ne saute plus de cases.
- Départ sur une case vide : glisser ajoute des `X`.
- Départ sur une case contenant `X` : glisser efface les `X`.
- Une reine existante n’est jamais écrasée par le drag.
- Un toucher simple conserve le cycle vide → `X` → reine → vide.
- Après la fin de l’animation de victoire, une pause supplémentaire de **0,4 seconde** est désormais respectée avant l’affichage du pop-up de félicitations.

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
