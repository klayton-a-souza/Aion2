const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const run=(code,c)=>require('./helpers/runtime.cjs')(vm,fs,code,c);
const memory=new Map(),ctx=vm.createContext({Date,Math,Set,Map,Intl,console,document:{addEventListener(){},getElementById(){return null}},localStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},setTimeout(){}});
for(const m of fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g))run(fs.readFileSync(m[1],'utf8'),ctx);
run('renderApp=function(){};showToast=function(){};loadState();',ctx);
const assessment=ctx.AION_STATE.data.cpAssessment;
assert.equal(assessment.references.length,8);
const c={id:'main',className:'Assassino',ilevel:1400,combatPower:0,progressHistory:[]};
for(const [min,max,median,n] of ctx.CP_COMMUNITY_STUDY.bands){
  for(const level of [min,max]){
    c.ilevel=level;const result=ctx.compareCombatPower(c,assessment);
    assert.equal(result.reference.medianCP,median);assert.equal(result.reference.sampleSize,n);
    assert.equal(result.reference.collectedOn,null);assert.equal(result.reference.collectedMonth,'2026-10');
    assert.equal(result.reference.compiledOn,'2026-10-31');assert.equal(result.reference.totalReports,62);
    assert(result.provisional&&result.mixed&&result.reference.sourcePending);
    assert.equal(result.small,n!==null);
  }
  c.ilevel=min;
  for(const [cp,label] of [[median*90/100-0.000001,'Abaixo da referência'],[median*90/100,'Na faixa da referência'],[median*110/100,'Na faixa da referência'],[median*110/100+0.000001,'Acima da referência']]){
    c.combatPower=cp;assert.equal(ctx.compareCombatPower(c,assessment).label,label,min+' / '+cp);
  }
  c.combatPower=median;assert.equal(ctx.compareCombatPower(c,assessment).percentDifference,0);
}
c.ilevel=1399;assert.equal(ctx.compareCombatPower(c,assessment).label,'Referência indisponível');
c.ilevel=2000;c.combatPower=null;assert.equal(ctx.compareCombatPower(c,assessment).label,'CP não informado');
assert.equal(ctx.cpHistory(c,'combatPower').length,0);
assert.match(ctx.cpComparisonHtml(c),/Não informada nesta faixa/);
assert.match(ctx.cpComparisonHtml(c),/Fonte primária pendente/);
assert.equal(ctx.compareCombatPower(c,{...assessment,references:[]}).label,'Referência indisponível');
const frozen=JSON.stringify(ctx.AION_STATE.data.characters),original=assessment.references[3];
ctx.saveCPReference({...original,medianCP:93000},original.id);
assert.equal(JSON.stringify(ctx.AION_STATE.data.characters),frozen);
for(let i=0;i<3;i++)ctx.AION_STATE.data=ctx.prepareState(ctx.AION_STATE.data);
assert.equal(ctx.AION_STATE.data.cpAssessment.references.length,8);
assert.equal(ctx.AION_STATE.data.cpAssessment.references[3].medianCP,93000);
assert(ctx.saveState());ctx.loadState();assert.equal(ctx.AION_STATE.data.cpAssessment.references[3].medianCP,93000);
const backup=ctx.backupPayload();ctx.restoreBackup(backup);assert.equal(ctx.AION_STATE.data.cpAssessment.references.length,8);
const legacy=JSON.parse(JSON.stringify(backup));delete legacy.data.cpAssessment.communityStudyVersion;legacy.data.cpAssessment.references=[];
legacy.data.cpAssessment.extra={keep:true};const migrated=ctx.validateBackup(legacy);
assert.equal(migrated.cpAssessment.references.length,8);assert.equal(migrated.cpAssessment.extra.keep,true);
const manual={...original,id:'manual',preliminary:false,sourcePending:false,collectedOn:'2026-11-01',sampleSize:40,medianCP:123456};
ctx.saveCPReference(manual);c.combatPower=123456;
assert.equal(ctx.compareCombatPower(c,ctx.AION_STATE.data.cpAssessment).reference.id,ctx.AION_STATE.data.cpAssessment.references.at(-1).id);
const snapshot=JSON.stringify(ctx.AION_STATE.data);
assert.throws(()=>ctx.saveCPReference({...manual,medianCP:-1}));assert.equal(JSON.stringify(ctx.AION_STATE.data),snapshot);
console.log('PASS CP comunitário: oito faixas/extremos, fronteiras 90/110 inclusivas sem arredondamento, amostras desconhecidas/pequenas, origem, ausências, edição, migração idempotente, reload/backup e prioridade manual.');
