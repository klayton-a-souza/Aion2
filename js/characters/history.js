// Schema 1.5: type remains the single source of truth for Main.

A2.extensions.register("character-progress","prepareState",function(prepareLegacyState){return function(data){
  var input=cloneData(data);
  if(input&&input.schemaVersion==='1.5.0')input.schemaVersion='1.4.0';
  var next=prepareLegacyState(input);
  next.characters.forEach(function(c){
    if(c.combatPower===undefined)c.combatPower=null;
    if(c.combatPowerUpdatedAt===undefined)c.combatPowerUpdatedAt=null;
    if(c.progressHistory===undefined)c.progressHistory=[];
    function cp(v){return v===null||isValidCombatPower(v)}
    function stamp(v){return typeof v==='string'&&Number.isFinite(Date.parse(v))}
    if(!cp(c.combatPower)||c.combatPowerUpdatedAt!==null&&!stamp(c.combatPowerUpdatedAt)||!Array.isArray(c.progressHistory))throw new Error('CP ou histórico inválido.');
    c.progressHistory.forEach(function(h){
      if(!h||!stamp(h.recordedAt)||typeof h.source!=='string'||!h.source.trim()||!h.changes||typeof h.changes!=='object'||Array.isArray(h.changes)||!Object.keys(h.changes).length)throw new Error('Histórico de progressão inválido.');
      Object.keys(h.changes).forEach(function(key){var change=h.changes[key];function valid(v){return key==='combatPower'?cp(v):v===null||Number.isFinite(v)&&v>=0}
        if(['ilevel','combatPower'].indexOf(key)<0||!change||!valid(change.from)||!valid(change.to)||change.from===change.to)throw new Error('Alteração de progressão inválida.');
      });
    });
  });
  next.schemaVersion='1.5.0';return next;
};});


A2.extensions.register("character-progress","createInitialState",function(createLegacyInitialState){return function(){return prepareState(createLegacyInitialState())};});

function recordCharacterProgress(character,previous,now){
  var changes={};
  ['ilevel','combatPower'].forEach(function(key){var before=previous&&previous[key]!==undefined?previous[key]:null,after=character[key];if(before!==after)changes[key]={from:before,to:after}});
  character.progressHistory=previous&&previous.progressHistory?cloneData(previous.progressHistory):[];
  character.combatPowerUpdatedAt=changes.combatPower?now:previous&&previous.combatPowerUpdatedAt||null;
  if(Object.keys(changes).length)character.progressHistory.push({recordedAt:now,source:previous?'manual-edit':'manual-create',changes:changes});
}
function characterProgressMarkup(c){
  return '<div class="ilevel character-cp"><span>Poder de Combate (CP)</span><strong>'+formatCombatPower(c.combatPower)+'</strong></div><p class="character-cp-updated">CP atualizado: '+date(c.combatPowerUpdatedAt)+'</p>';
}
// Extend the existing form and card without changing routes or their handlers.

A2.extensions.register("character-progress","openModal",function(openLegacyCharacterModal){return function(id){openLegacyCharacterModal(id);var c=AION_STATE.data.characters.find(function(x){return x.id===id});document.getElementById('character-cp').value=combatPowerInputValue(c?c.combatPower:null)};});

A2.extensions.register("character-progress","card",function(legacyCharacterCard){return function(c){return legacyCharacterCard(c).replace('<dl class="character-detail-meta">',characterProgressMarkup(c)+'<dl class="character-detail-meta">')};});
A2.lifecycle.register("character-progress",function(){
  var label=document.createElement('label');label.textContent='Poder de Combate (CP) — opcional';
  var input=document.createElement('input');input.id='character-cp';input.type='text';input.inputMode='decimal';input.placeholder='Ex.: 98,30 (sem separador de milhar)';label.appendChild(input);
  document.getElementById('character-ilevel').parentElement.insertAdjacentElement('afterend',label);
});
