/*
 * QUADLUD — shared reasoning presentation contract
 * Copyright © 2026 Serge Benoliel. All rights reserved.
 * Proprietary software. Copying, modification, redistribution or exploitation
 * without prior written authorization is prohibited.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.QuadludReasoningPresentation=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const VERSION=2;
  const EVIDENCE_SCHEMA=1;
  const PRESENTATION_SCHEMA=1;
  const EVIDENCE_KIND='engine-deduction';
  const DERIVED_FIELDS=Object.freeze(['technique','focus','explanation','action']);
  const FORBIDDEN_EVIDENCE_KEYS=Object.freeze(new Set(['sol','solution','hiddenSolution','solutionGrid','answerGrid','hiddenState','validationState']));

  function fail(message){throw new TypeError(`Invalid QUADLUD reasoning presentation: ${message}`)}
  function isPlainObject(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return false;
    const proto=Object.getPrototypeOf(value);
    return proto===Object.prototype||proto===null;
  }
  function assertNonEmptyString(value,path){if(typeof value!=='string'||!value.trim())fail(`${path} must be a non-empty string`)}
  function assertSafeJson(value,path='value',seen=new Set()){
    if(value===null||typeof value==='string'||typeof value==='boolean')return;
    if(typeof value==='number'){
      if(!Number.isFinite(value))fail(`${path} must contain only finite numbers`);
      return;
    }
    if(typeof value==='undefined'||typeof value==='function'||typeof value==='symbol'||typeof value==='bigint')fail(`${path} must be JSON-serializable`);
    if(typeof value!=='object')fail(`${path} must be JSON-serializable`);
    if(seen.has(value))fail(`${path} must not contain cycles`);
    seen.add(value);
    if(Array.isArray(value)){
      for(let i=0;i<value.length;i++)assertSafeJson(value[i],`${path}[${i}]`,seen);
    }else{
      if(!isPlainObject(value))fail(`${path} must contain only plain objects and arrays`);
      for(const [key,item] of Object.entries(value)){
        if(FORBIDDEN_EVIDENCE_KEYS.has(key))fail(`${path}.${key} is forbidden in visible-state evidence`);
        assertSafeJson(item,`${path}.${key}`,seen);
      }
    }
    seen.delete(value);
  }
  function cloneJson(value){
    assertSafeJson(value);
    if(value===undefined)return undefined;
    return JSON.parse(JSON.stringify(value));
  }
  function deepFreeze(value){
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);
    for(const child of Object.values(value))deepFreeze(child);
    return value;
  }
  function frozenClone(value){return deepFreeze(cloneJson(value))}

  function normalizeDeduction(source,path){
    if(!isPlainObject(source))fail(`${path} must be a plain engine deduction object`);
    assertSafeJson(source,path);
    assertNonEmptyString(source.rule,`${path}.rule`);
    if(Object.prototype.hasOwnProperty.call(source,'premises')&&!Array.isArray(source.premises))fail(`${path}.premises must be an array when present`);
    if(Object.prototype.hasOwnProperty.call(source,'conclusions')&&!Array.isArray(source.conclusions))fail(`${path}.conclusions must be an array when present`);
    return frozenClone(source);
  }
  function normalizeEntityRef(source,path){
    if(!isPlainObject(source))fail(`${path} must be an EntityRef object`);
    const keys=Object.keys(source);if(keys.some(key=>key!=='kind'&&key!=='id'))fail(`${path} may contain only kind and id`);
    assertNonEmptyString(source.kind,`${path}.kind`);assertNonEmptyString(source.id,`${path}.id`);
    return deepFreeze({kind:source.kind.trim(),id:source.id.trim()})
  }
  function normalizeGenericFocus(source,path='focus'){
    if(!Array.isArray(source))fail(`${path} must be an array`);
    return deepFreeze(source.map((item,index)=>{
      if(!isPlainObject(item))fail(`${path}[${index}] must be a plain object`);
      const keys=Object.keys(item);if(keys.some(key=>key!=='entity'&&key!=='role'))fail(`${path}[${index}] may contain only entity and role`);
      assertNonEmptyString(item.role,`${path}[${index}].role`);
      return deepFreeze({entity:normalizeEntityRef(item.entity,`${path}[${index}].entity`),role:item.role.trim()})
    }))
  }
  function normalizedFocus(primary){
    if(Object.prototype.hasOwnProperty.call(primary,'focus'))return normalizeGenericFocus(primary.focus,'primary.focus');
    const out={};
    for(const field of ['focusCells','focusUnits','focusRelations','focusClues','focusRectangles']){
      if(Object.prototype.hasOwnProperty.call(primary,field))out[field]=primary[field];
    }
    return deepFreeze(out);
  }
  function captureEngineEvidence(source){
    if(!isPlainObject(source))fail('engine evidence input must be a plain object');
    const allowed=new Set(['game','source','primary','supports','final','automatic','metadata']);
    for(const key of Object.keys(source))if(!allowed.has(key))fail(`unknown engine evidence field "${key}"`);
    assertNonEmptyString(source.game,'game');
    assertNonEmptyString(source.source,'source');
    const primary=normalizeDeduction(source.primary,'primary');
    const supports=source.supports==null?[]:source.supports;
    if(!Array.isArray(supports))fail('supports must be an array');
    const normalizedSupports=supports.map((item,index)=>normalizeDeduction(item,`supports[${index}]`));
    const final=source.final==null?primary:normalizeDeduction(source.final,'final');
    const automatic=source.automatic==null?[]:source.automatic;
    if(!Array.isArray(automatic))fail('automatic must be an array');
    assertSafeJson(automatic,'automatic');
    const metadata=source.metadata==null?{}:source.metadata;
    if(!isPlainObject(metadata))fail('metadata must be a plain object');
    assertSafeJson(metadata,'metadata');
    const evidence={
      schema:EVIDENCE_SCHEMA,
      kind:EVIDENCE_KIND,
      game:source.game.trim(),
      source:source.source.trim(),
      primary,
      supports:deepFreeze(normalizedSupports),
      final,
      automatic:frozenClone(automatic),
      metadata:frozenClone(metadata)
    };
    return deepFreeze(evidence);
  }

  function splitPath(path){
    assertNonEmptyString(path,'derivation path');
    const parts=path.split('.');
    if(parts.some(part=>!part||!/^([A-Za-z_$][A-Za-z0-9_$]*|\d+)$/.test(part)))fail(`invalid derivation path "${path}"`);
    return parts;
  }
  function evidencePathValue(evidence,path){
    let value=evidence;
    for(const part of splitPath(path)){
      if(value==null||typeof value!=='object'||!Object.prototype.hasOwnProperty.call(value,part))return {exists:false,value:undefined};
      value=value[part];
    }
    return {exists:true,value};
  }
  function normalizeDerivation(evidence,field,refs){
    if(!Array.isArray(refs)||refs.length===0)fail(`derivation.${field} must contain at least one evidence path`);
    const out=[];
    for(const ref of refs){
      const path=String(ref);
      const resolved=evidencePathValue(evidence,path);
      if(!resolved.exists)fail(`derivation.${field} references missing evidence path "${path}"`);
      out.push(path);
    }
    return deepFreeze([...new Set(out)]);
  }
  function defaultFocusDerivation(primary){
    const refs=[];
    if(Object.prototype.hasOwnProperty.call(primary,'focus'))refs.push('primary.focus');
    else for(const field of ['focusCells','focusUnits','focusRelations','focusClues','focusRectangles'])if(Object.prototype.hasOwnProperty.call(primary,field))refs.push(`primary.${field}`);
    return refs.length?refs:['primary.rule'];
  }
  function defineReasoningPresentation(source){
    if(!isPlainObject(source))fail('presentation input must be a plain object');
    const allowed=new Set(['evidence','technique','focus','explanation','action','derivation','metadata']);
    for(const key of Object.keys(source))if(!allowed.has(key))fail(`unknown presentation field "${key}"`);
    const evidence=source.evidence;
    if(!isPlainObject(evidence)||evidence.schema!==EVIDENCE_SCHEMA||evidence.kind!==EVIDENCE_KIND)fail('evidence must come from captureEngineEvidence()');
    assertNonEmptyString(evidence.game,'evidence.game');
    assertNonEmptyString(evidence.primary?.rule,'evidence.primary.rule');
    const derivation=source.derivation==null?{}:source.derivation;
    if(!isPlainObject(derivation))fail('derivation must be a plain object');
    for(const key of Object.keys(derivation))if(!DERIVED_FIELDS.includes(key))fail(`unknown derivation field "${key}"`);

    const supplied={
      technique:Object.prototype.hasOwnProperty.call(source,'technique')?source.technique:null,
      focus:Object.prototype.hasOwnProperty.call(source,'focus')?source.focus:normalizedFocus(evidence.primary),
      explanation:Object.prototype.hasOwnProperty.call(source,'explanation')?source.explanation:null,
      action:Object.prototype.hasOwnProperty.call(source,'action')?source.action:null
    };
    for(const field of DERIVED_FIELDS){
      assertSafeJson(supplied[field],field);
      if(field==='focus'&&Array.isArray(supplied[field]))supplied.focus=normalizeGenericFocus(supplied.focus,'focus');
      const explicitlySupplied=Object.prototype.hasOwnProperty.call(source,field);
      if(explicitlySupplied&&supplied[field]!==null&&!Object.prototype.hasOwnProperty.call(derivation,field))fail(`${field} requires explicit evidence derivation paths`);
    }
    const normalizedDerivation={};
    for(const field of DERIVED_FIELDS){
      if(Object.prototype.hasOwnProperty.call(derivation,field))normalizedDerivation[field]=normalizeDerivation(evidence,field,derivation[field]);
      else if(field==='focus')normalizedDerivation.focus=deepFreeze(defaultFocusDerivation(evidence.primary));
      else normalizedDerivation[field]=deepFreeze([]);
    }
    const metadata=source.metadata==null?{}:source.metadata;
    if(!isPlainObject(metadata))fail('presentation metadata must be a plain object');
    assertSafeJson(metadata,'presentation metadata');

    const output={
      schema:PRESENTATION_SCHEMA,
      game:evidence.game,
      rule:evidence.primary.rule,
      technique:frozenClone(supplied.technique),
      focus:frozenClone(supplied.focus),
      premises:frozenClone(evidence.primary.premises||[]),
      explanation:frozenClone(supplied.explanation),
      action:frozenClone(supplied.action),
      proofDetails:deepFreeze({
        source:evidence.source,
        primary:evidence.primary,
        supports:evidence.supports,
        final:evidence.final,
        automatic:evidence.automatic,
        evidenceMetadata:evidence.metadata
      }),
      rank:Number.isFinite(Number(evidence.primary.rank))?Number(evidence.primary.rank):0,
      techniqueLevel:Number.isFinite(Number(evidence.primary.techniqueLevel))?Number(evidence.primary.techniqueLevel):0,
      provenance:deepFreeze({kind:EVIDENCE_KIND,source:evidence.source,derivation:deepFreeze(normalizedDerivation)}),
      metadata:frozenClone(metadata)
    };
    return deepFreeze(output);
  }

  function isReasoningPresentation(value){
    try{
      if(!isPlainObject(value)||value.schema!==PRESENTATION_SCHEMA||typeof value.game!=='string'||typeof value.rule!=='string')return false;
      assertSafeJson(value,'presentation');
      return isPlainObject(value.proofDetails)&&isPlainObject(value.provenance)&&value.provenance.kind===EVIDENCE_KIND;
    }catch(_){return false}
  }

  return Object.freeze({
    VERSION,EVIDENCE_SCHEMA,PRESENTATION_SCHEMA,EVIDENCE_KIND,DERIVED_FIELDS,
    captureEngineEvidence,defineReasoningPresentation,evidencePathValue,isReasoningPresentation
  });
});
