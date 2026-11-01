function runArchitectureScript(code,context){return require("./helpers/runtime.cjs")(vm,fs,code,context)}
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const memory=new Map(),ctx=vm.createContext({Date,Math,Set,Map,Intl,console,document:{addEventListener(){},getElementById(){return null}},localStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},setTimeout(){}});
for(const m of fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g))runArchitectureScript(fs.readFileSync(m[1],'utf8'),ctx);
runArchitectureScript(`renderApp=function(){};showToast=function(){};loadState();
var c={id:'main',name:'L0rdFuria',className:'Assassino',type:'main',ilevel:2100,combatPower:null,progressHistory:[]};AION_STATE.data.characters=[c];AION_STATE.data=prepareState(AION_STATE.data);c=AION_STATE.data.characters[0];
function reference(extra){return Object.assign({className:'Assassino',role:'damage',minIlevel:2000,maxIlevel:2200,medianCP:100000,sampleSize:100,source:'FONTE SINTÉTICA DE TESTE',collectedOn:'2026-10-01',confidence:'documented',notes:'Não usar como dado real.'},extra||{})}
`,ctx);
assert.equal(ctx.compareCombatPower(ctx.c,ctx.AION_STATE.data.cpAssessment).label,'Referência indisponível');
let ref=ctx.saveCPReference(ctx.reference());let result=ctx.compareCombatPower(ctx.c,ctx.AION_STATE.data.cpAssessment);assert.equal(result.label,'CP não informado');assert.equal(result.provisional,false);
for(const [cp,label] of [[0,'Abaixo da referência'],[89999,'Abaixo da referência'],[90000,'Na faixa da referência'],[110000,'Na faixa da referência'],[110001,'Acima da referência'],[Number.MAX_SAFE_INTEGER,'Acima da referência']]){ctx.c.combatPower=cp;assert.equal(ctx.compareCombatPower(ctx.c,ctx.AION_STATE.data.cpAssessment).label,label)}
ctx.saveCPReference(ctx.reference({sampleSize:5}),ref.id);assert.equal(ctx.compareCombatPower(ctx.c,ctx.AION_STATE.data.cpAssessment).provisional,true);
ctx.saveCPReference(ctx.reference({sampleSize:0}),ref.id);assert.equal(ctx.compareCombatPower(ctx.c,ctx.AION_STATE.data.cpAssessment).label,'Dados insuficientes');
ctx.saveCPReference(ctx.reference({minIlevel:2500,maxIlevel:3000}),ref.id);assert.equal(ctx.compareCombatPower(ctx.c,ctx.AION_STATE.data.cpAssessment).label,'Referência indisponível');
ctx.saveCPReference(ctx.reference({className:'Feiticeiro'}),ref.id);result=ctx.compareCombatPower(ctx.c,ctx.AION_STATE.data.cpAssessment);assert(result.mixed&&result.provisional);
ctx.saveCPReference(ctx.reference({className:'Clériga',role:'healer'}),ref.id);assert.equal(ctx.compareCombatPower(ctx.c,ctx.AION_STATE.data.cpAssessment).label,'Referência indisponível');
ctx.saveCPReference(ctx.reference({className:'',role:''}),ref.id);assert(ctx.compareCombatPower(ctx.c,ctx.AION_STATE.data.cpAssessment).mixed);
let exact=ctx.saveCPReference(ctx.reference());assert.equal(ctx.compareCombatPower(ctx.c,ctx.AION_STATE.data.cpAssessment).reference.id,exact.id);
ctx.c.combatPower=98077;ctx.AION_STATE.data.cpAssessment.settings.lowerRatio=.99;assert.equal(ctx.compareCombatPower(ctx.c,ctx.AION_STATE.data.cpAssessment).label,'Abaixo da referência');ctx.AION_STATE.data.cpAssessment.settings.lowerRatio=.9;assert.equal(ctx.cpClass('constructor'),'constructor');
for(const extra of [{medianCP:0},{medianCP:-1},{medianCP:Infinity},{medianCP:Number.MAX_SAFE_INTEGER+1},{sampleSize:-1},{sampleSize:2.5},{maxIlevel:100},{minIlevel:-1},{collectedOn:'2026-02-30'},{maxIlevel:1e100}])assert.throws(()=>ctx.saveCPReference(ctx.reference(extra)));
const before=JSON.stringify(ctx.AION_STATE.data.cpAssessment);assert.throws(()=>ctx.saveCPReference(ctx.reference({medianCP:-1}),exact.id));assert.equal(JSON.stringify(ctx.AION_STATE.data.cpAssessment),before);
assert(ctx.cpChartHtml(ctx.c,'combatPower','CP').includes('Sem registros'));assert.equal(ctx.cpHistory(ctx.c,'combatPower').length,0);
runArchitectureScript(`c.combatPower=98077;c.progressHistory=[
{recordedAt:'2026-10-01T10:00:00Z',source:'manual-edit',changes:{combatPower:{from:90000,to:95000},ilevel:{from:2000,to:2033}}},
{recordedAt:'2026-10-02T10:00:00Z',source:'manual-edit',changes:{combatPower:{from:95000,to:null}}},
{recordedAt:'2026-10-03T10:00:00Z',source:'manual-edit',changes:{combatPower:{from:null,to:98077}}}];`,ctx);
let chart=ctx.cpChartHtml(ctx.c,'combatPower','CP');assert.equal((chart.match(/<circle /g)||[]).length,2);assert(!chart.includes('<polyline'));assert.equal(ctx.cpHistory(ctx.c,'ilevel').length,1);assert(!chart.includes('NaN'));
runArchitectureScript(`var plan=initializeMilestones(c.id),s=currentMilestone(plan);`,ctx);assert.equal(ctx.cpPersonalTarget(ctx.c).difference,11923);
const cpBefore=JSON.stringify({cp:ctx.c.combatPower,goal:ctx.cpPersonalTarget(ctx.c).target,history:ctx.c.progressHistory});
for(const role of ['damage','tank','healer'])ctx.saveCPObservation(ctx.c.id,{role,dps:role==='damage'?12345.6:null,content:'SINTÉTICO',survival:'Teste',aggro:'Teste',healing:'Teste',notes:'<script>alert(1)</script>'});
assert.equal(JSON.stringify({cp:ctx.c.combatPower,goal:ctx.cpPersonalTarget(ctx.c).target,history:ctx.c.progressHistory}),cpBefore);assert(!ctx.cpNotesHtml(ctx.c).includes('<script>'));
assert.throws(()=>ctx.saveCPObservation(ctx.c.id,{role:'damage',dps:-1,content:'',survival:'',aggro:'',healing:'',notes:''}));
ctx.saveState();ctx.loadState();assert.equal(ctx.AION_STATE.data.cpAssessment.performanceNotes.length,3);assert.equal(ctx.AION_STATE.data.characters[0].progressHistory.length,3);
const backup=ctx.backupPayload(),snap=JSON.stringify(backup.data.cpAssessment);ctx.restoreBackup(backup);assert.equal(JSON.stringify(ctx.AION_STATE.data.cpAssessment),snap);
const legacy=JSON.parse(JSON.stringify(backup));delete legacy.data.cpAssessment;const migrated=ctx.validateBackup(legacy);assert.equal(migrated.cpAssessment.references.length,0);assert.equal(migrated.characters[0].progressHistory.length,3);assert.equal(JSON.stringify(ctx.prepareState(migrated)),JSON.stringify(migrated));
const invalid=JSON.parse(JSON.stringify(backup));invalid.data.cpAssessment.settings.lowerRatio=2;const stable=JSON.stringify(ctx.AION_STATE.data);assert.throws(()=>ctx.restoreBackup(invalid));assert.equal(JSON.stringify(ctx.AION_STATE.data),stable);
console.log('PASS CP: ausências, limites 90/110 inclusivos, zero/extremos, amostras pequenas/insuficientes, intervalos/classes/funções, validação, gráficos sem medições inventadas, observações independentes, persistência, backup atômico e migração idempotente.');
