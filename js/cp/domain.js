// Community observations are supplied manually, never derived from personal goals.
function initialCPAssessment(){return {version:1,settings:{lowerRatio:0.9,upperRatio:1.1,smallSampleSize:30},references:[],performanceNotes:[]}}
function cpText(value){return typeof value==='string'}
function cpStamp(value){return typeof value==='string'&&Number.isFinite(Date.parse(value))}
function cpDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value}
function validateCPAssessment(data){
  if(!data||data.version!==1||!data.settings||!Array.isArray(data.references)||!Array.isArray(data.performanceNotes))throw Error('Estrutura de avaliação de CP inválida.');
  var settings=data.settings;if(!Number.isFinite(settings.lowerRatio)||!Number.isFinite(settings.upperRatio)||settings.lowerRatio<0||settings.lowerRatio>1||settings.upperRatio<1||settings.upperRatio>10||settings.lowerRatio>=settings.upperRatio||!Number.isSafeInteger(settings.smallSampleSize)||settings.smallSampleSize<2)throw Error('Limites internos de comparação inválidos.');
  var ids=new Set();function unique(id){if(!cpText(id)||!id||ids.has(id))throw Error('ID de avaliação ausente ou duplicado.');ids.add(id)}
  data.references.forEach(function(r){if(!r)throw Error('Referência inválida.');unique(r.id);if(!cpText(r.className)||['','damage','tank','healer'].indexOf(r.role)<0||!Number.isFinite(r.minIlevel)||!Number.isFinite(r.maxIlevel)||r.minIlevel<0||r.maxIlevel<r.minIlevel||r.maxIlevel>Number.MAX_SAFE_INTEGER||r.medianCP!==null&&(!isValidCombatPower(r.medianCP)||r.medianCP<=0)||r.sampleSize!==null&&(!Number.isSafeInteger(r.sampleSize)||r.sampleSize<0)||!cpText(r.source)||r.collectedOn!==null&&!cpDate(r.collectedOn)||['insufficient','limited','documented'].indexOf(r.confidence)<0||!cpText(r.notes)||!cpStamp(r.createdAt)||!cpStamp(r.updatedAt))throw Error('Campos da referência inválidos.')});
  data.performanceNotes.forEach(function(n){if(!n)throw Error('Observação inválida.');unique(n.id);if(!cpText(n.characterId)||!n.characterId||['damage','tank','healer'].indexOf(n.role)<0||!cpStamp(n.recordedAt)||n.dps!==null&&(!Number.isFinite(n.dps)||n.dps<0||n.dps>Number.MAX_SAFE_INTEGER)||!cpText(n.content)||!cpText(n.survival)||!cpText(n.aggro)||!cpText(n.healing)||!cpText(n.notes))throw Error('Observação de desempenho inválida.')});
  return data;
}

A2.extensions.register("cp-data","prepareState",function(cpPreviousPrepare){return function(data){var next=cpPreviousPrepare(data);if(next.cpAssessment===undefined)next.cpAssessment=initialCPAssessment();validateCPAssessment(next.cpAssessment);return next};});
function cpNormalize(text){return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()}
function cpClass(text){var value=cpNormalize(text),aliases={assassino:'assassin',assassina:'assassin',assassin:'assassin',feiticeiro:'sorcerer',feiticeira:'sorcerer',sorcerer:'sorcerer',templario:'templar',templaria:'templar',templar:'templar',clerigo:'cleric',cleriga:'cleric',cleric:'cleric'};return Object.prototype.hasOwnProperty.call(aliases,value)?aliases[value]:value}
function cpRole(c){return {assassin:'damage',sorcerer:'damage',templar:'tank',cleric:'healer'}[cpClass(c.className)]||''}
function cpUsableReference(r){return r.confidence!=='insufficient'&&r.medianCP>0&&r.sampleSize>0&&!!r.source.trim()&&cpDate(r.collectedOn)}
function compareCombatPower(c,assessment){
  var matching=assessment.references.filter(function(r){return c.ilevel>=r.minIlevel&&c.ilevel<=r.maxIlevel&&(!r.role||r.role===cpRole(c))});
  function rank(r){if(r.className&&cpClass(r.className)===cpClass(c.className))return 0;if(!r.className&&r.role&&r.role===cpRole(c))return 1;return 2}
  var usable=matching.filter(cpUsableReference).sort(function(a,b){return rank(a)-rank(b)||(a.maxIlevel-a.minIlevel)-(b.maxIlevel-b.minIlevel)||b.collectedOn.localeCompare(a.collectedOn)||b.sampleSize-a.sampleSize||a.id.localeCompare(b.id)}),r=usable[0];
  if(!r)return {label:matching.length?'Dados insuficientes':'Referência indisponível',quality:'Sem amostra utilizável para este intervalo de iLvl.',reference:null,provisional:false,mixed:false,ratio:null};
  var mixed=!r.className||cpClass(r.className)!==cpClass(c.className),small=r.sampleSize<assessment.settings.smallSampleSize,provisional=small||mixed||r.confidence!=='documented';
  var ratio=c.combatPower==null?null:c.combatPower/r.medianCP;
  return {reference:r,ratio:ratio,mixed:mixed,small:small,provisional:provisional,
    label:ratio===null?'CP não informado':compareCombatPowerRatio(ratio,assessment.settings.lowerRatio)<0?'Abaixo da referência':compareCombatPowerRatio(ratio,assessment.settings.upperRatio)>0?'Acima da referência':'Na faixa da referência',
    quality:small?'Amostra pequena — classificação provisória':provisional?'Comparação provisória — limitações de comparabilidade':'Origem documentada pelo usuário — representatividade não verificada'};
}
function cpPersonalTarget(c){var p=activePlan('character',c.id),s=p&&(p.milestoneTrack?currentMilestone(p):p.stages.find(function(s){return s.objectives.some(function(o){return !o.done})})),o=s&&s.objectives.find(function(o){return o.kind==='combatPower'});return {plan:p,stage:s,objective:o||null,target:o?o.target:null,difference:o&&c.combatPower!=null?combatPowerDifference(o.target,c.combatPower):null}}
function cpHistory(c,key){return (c.progressHistory||[]).filter(function(h){return !!h.changes[key]}).map(function(h,i){return {at:h.recordedAt,time:Date.parse(h.recordedAt),value:h.changes[key].to,source:h.source,order:i}}).sort(function(a,b){return a.time-b.time||a.order-b.order})}
function saveCPReference(input,id){var data=AION_STATE.data.cpAssessment,old=id&&data.references.find(function(r){return r.id===id});if(id&&!old)throw Error('Referência removida. Atualize a tela.');var now=new Date().toISOString(),r=Object.assign({},old||{},input,{id:old?old.id:makeId(),createdAt:old?old.createdAt:now,updatedAt:now}),candidate=cloneData(data);if(old)candidate.references[candidate.references.findIndex(function(x){return x.id===id})]=r;else candidate.references.push(r);validateCPAssessment(candidate);AION_STATE.data.cpAssessment=candidate;return r}
function saveCPObservation(characterId,input){if(!AION_STATE.data.characters.some(function(c){return c.id===characterId}))throw Error('Personagem indisponível.');var data=cloneData(AION_STATE.data.cpAssessment),n=Object.assign({},input,{id:makeId(),characterId:characterId,recordedAt:new Date().toISOString()});data.performanceNotes.push(n);validateCPAssessment(data);AION_STATE.data.cpAssessment=data;return n}
function cpMutation(action){var result=A2.store.transact(action);if(!result.ok){showToast(result.error.message,true);return false}showToast(result.saved?'Avaliação de CP salva.':'Alteração nesta sessão. Exporte um backup antes de fechar.',!result.saved);return true}
