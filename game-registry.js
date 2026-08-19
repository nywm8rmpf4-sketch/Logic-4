/*
 * QUADLUD — static game registry
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation
 * without prior written authorization is prohibited.
 */
(function(root,factory){
  const isNode=typeof module!=='undefined'&&module.exports;
  const contract=isNode?require('./game-contract.js'):root.QuadludGameContract;
  const api=factory(root,contract,isNode?require:null);
  if(isNode)module.exports=api;
  if(root)root.QuadludGameRegistry=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root,contract,nodeRequire){
  'use strict';

  if(!contract)throw new Error('QUADLUD game contract unavailable');

  const VERSION=2;
  function moduleCapability(globalName,nodePath,property=null){
    return ()=>{let module=resolveModule(globalName,nodePath);return property==null?module:module[property]};
  }
  function lazyModuleObjectCapability(globalName,nodePath,methods){
    const proxy={};
    for(const method of methods)proxy[method]=(...args)=>{
      const module=resolveModule(globalName,nodePath),fn=module?.[method];
      if(typeof fn!=='function')throw new Error(`QUADLUD game capability dependency unavailable: ${globalName}.${method}`);
      return fn(...args)
    };
    const frozen=Object.freeze(proxy);return ()=>frozen
  }
  const CATALOG=Object.freeze([
    Object.freeze({
      id:'queens',metadata:Object.freeze({labelKey:'gameQueens',descriptionKey:'queensSub',challengeCode:'Q'}),
      capabilities:Object.freeze({
        logic:moduleCapability('QueensLogic','./queens-logic.js'),
        difficulty:moduleCapability('QueensDifficulty','./queens-difficulty.js'),
        generatePuzzle:moduleCapability('QuadludQueensGenerator','./queens-generator.js','generateQueensPuzzle'),
        canonicalizePublicPuzzle:moduleCapability('QueensDifficulty','./queens-difficulty.js','canonicalizePublicPuzzle'),
        publicPuzzleFromCandidate:moduleCapability('QuadludQueensGenerator','./queens-generator.js','publicPuzzleFromCandidate'),
        publicPuzzleFromSession:moduleCapability('QuadludQueensGenerator','./queens-generator.js','publicPuzzleFromSession'),
        sessionLifecycle:moduleCapability('QuadludGameSessionAdapters','./game-session-adapters.js','queens'),
        uiLifecycle:lazyModuleObjectCapability('QuadludQueensUI','./queens-ui.js',['createAdapter']),
        pedagogyLifecycle:lazyModuleObjectCapability('QuadludQueensPedagogy','./queens-pedagogy.js',['createAdapter','dependencyNames']),
        generationIdentity:moduleCapability('QuadludQueensGenerator','./queens-generator.js','generationIdentity')
      })
    }),
    Object.freeze({
      id:'tango',metadata:Object.freeze({labelKey:'gameTango',descriptionKey:'tangoSub',challengeCode:'T'}),
      capabilities:Object.freeze({
        logic:moduleCapability('TangoLogic','./tango-logic.js'),
        difficulty:moduleCapability('TangoDifficulty','./tango-difficulty.js'),
        generatePuzzle:moduleCapability('QuadludTangoGenerator','./tango-generator.js','generateTangoPuzzle'),
        canonicalizePublicPuzzle:moduleCapability('TangoDifficulty','./tango-difficulty.js','canonicalizePublicPuzzle'),
        publicPuzzleFromCandidate:moduleCapability('QuadludTangoGenerator','./tango-generator.js','publicPuzzleFromCandidate'),
        publicPuzzleFromSession:moduleCapability('QuadludTangoGenerator','./tango-generator.js','publicPuzzleFromSession'),
        sessionLifecycle:moduleCapability('QuadludGameSessionAdapters','./game-session-adapters.js','tango'),
        uiLifecycle:lazyModuleObjectCapability('QuadludTangoUI','./tango-ui.js',['createAdapter']),
        pedagogyLifecycle:lazyModuleObjectCapability('QuadludTangoPedagogy','./tango-pedagogy.js',['createAdapter','dependencyNames'])
      })
    }),
    Object.freeze({
      id:'sudoku',metadata:Object.freeze({labelKey:'gameSudoku',descriptionKey:'sudokuSub',challengeCode:'S'}),
      capabilities:Object.freeze({
        logic:moduleCapability('SudokuLogic','./sudoku-logic.js'),
        difficulty:moduleCapability('SudokuDifficulty','./sudoku-difficulty.js'),
        generatePuzzle:moduleCapability('QuadludSudokuGenerator','./sudoku-generator.js','generateSudokuPuzzle'),
        canonicalizePublicPuzzle:moduleCapability('SudokuDifficulty','./sudoku-difficulty.js','canonicalizePublicPuzzle'),
        publicPuzzleFromCandidate:moduleCapability('QuadludSudokuGenerator','./sudoku-generator.js','publicPuzzleFromCandidate'),
        publicPuzzleFromSession:moduleCapability('QuadludSudokuGenerator','./sudoku-generator.js','publicPuzzleFromSession'),
        sessionLifecycle:moduleCapability('QuadludGameSessionAdapters','./game-session-adapters.js','sudoku'),
        uiLifecycle:lazyModuleObjectCapability('QuadludSudokuUI','./sudoku-ui.js',['createAdapter']),
        pedagogyLifecycle:lazyModuleObjectCapability('QuadludSudokuPedagogy','./sudoku-pedagogy.js',['createAdapter','dependencyNames'])
      })
    }),
    Object.freeze({
      id:'patches',metadata:Object.freeze({labelKey:'gamePatches',descriptionKey:'patchesSub',challengeCode:'P'}),
      capabilities:Object.freeze({
        logic:moduleCapability('PatchesLogic','./patches-logic.js'),
        difficulty:moduleCapability('PatchesDifficulty','./patches-difficulty.js'),
        generatePuzzle:moduleCapability('QuadludPatchesGenerator','./patches-generator.js','generatePatchesPuzzle'),
        canonicalizePublicPuzzle:moduleCapability('PatchesDifficulty','./patches-difficulty.js','canonicalizePublicPuzzle'),
        publicPuzzleFromCandidate:moduleCapability('QuadludPatchesGenerator','./patches-generator.js','publicPuzzleFromCandidate'),
        publicPuzzleFromSession:moduleCapability('QuadludPatchesGenerator','./patches-generator.js','publicPuzzleFromSession'),
        sessionLifecycle:moduleCapability('QuadludGameSessionAdapters','./game-session-adapters.js','patches'),
        uiLifecycle:lazyModuleObjectCapability('QuadludPatchesUI','./patches-ui.js',['createAdapter']),
        pedagogyLifecycle:lazyModuleObjectCapability('QuadludPatchesPedagogy','./patches-pedagogy.js',['createAdapter','dependencyNames'])
      })
    })
  ]);
  const IDS=Object.freeze(CATALOG.map(entry=>entry.id));
  const CATALOG_BY_ID=new Map(CATALOG.map(entry=>[entry.id,entry]));

  function resolveModule(globalName,nodePath){
    const value=nodeRequire?nodeRequire(nodePath):root?.[globalName];
    if(!value)throw new Error(`QUADLUD game capability dependency unavailable: ${globalName}`);
    return value;
  }
  function assertCapabilityName(name){if(!Object.prototype.hasOwnProperty.call(contract.CAPABILITY_FIELDS,name))throw new Error(`Unknown QUADLUD game capability: ${name}`)}
  function catalogEntry(id){return CATALOG_BY_ID.get(String(id||''))||null}
  function hasGame(id){return CATALOG_BY_ID.has(String(id||''))}
  function getMetadata(id){return catalogEntry(id)?.metadata||null}
  function requireCatalogEntry(id){
    const entry=catalogEntry(id);
    if(!entry)throw new Error(`Unknown QUADLUD game: ${id}`);
    return entry;
  }
  function resolveCapability(entry,name){
    assertCapabilityName(name);
    const resolver=entry.capabilities[name];
    if(typeof resolver!=='function')throw new Error(`QUADLUD game "${entry.id}" does not provide capability "${name}"`);
    const value=resolver();
    if(typeof contract.validateCapability==='function')contract.validateCapability(name,value);
    return value;
  }
  function materialize(entry){
    const capabilities={};for(const name of Object.keys(entry.capabilities))capabilities[name]=resolveCapability(entry,name);
    return contract.defineGameDefinition({id:entry.id,metadata:entry.metadata,capabilities});
  }
  function listGames(){return contract.defineGameDefinitions(CATALOG.map(materialize))}
  function getGame(id){const entry=catalogEntry(id);return entry?materialize(entry):null}
  function requireGame(id){return materialize(requireCatalogEntry(id))}
  function hasCapability(id,name){assertCapabilityName(name);const entry=catalogEntry(id);return !!entry&&typeof entry.capabilities[name]==='function'}
  function requireCapability(id,name){return resolveCapability(requireCatalogEntry(id),name)}

  return Object.freeze({VERSION,IDS,listGames,getGame,requireGame,hasGame,getMetadata,hasCapability,requireCapability});
});
