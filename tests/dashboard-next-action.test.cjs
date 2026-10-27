const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const memory = new Map();
const ctx = vm.createContext({
  console, Date, Math, Set, Intl,
  document: { addEventListener() {}, getElementById() { return null; } },
  localStorage: {
    getItem(key) { return memory.get(key) ?? null; },
    setItem(key, value) { memory.set(key, value); },
    removeItem(key) { memory.delete(key); }
  },
  setTimeout() {}
});
for (const match of fs.readFileSync('index.html', 'utf8').matchAll(/<script src="([^"]+)"/g)) {
  vm.runInContext(fs.readFileSync(match[1], 'utf8'), ctx);
}
vm.runInContext(`
  renderApp=function(){};showToast=function(){};loadState();
  AION_STATE.data.characters=[
    {id:makeId(),name:'Principal',className:'Classe',ilevel:100,type:'main',server:'',faction:'',ilevelUpdatedAt:null},
    {id:makeId(),name:'Alternativo',className:'Classe',ilevel:90,type:'alt',server:'',faction:'',ilevelUpdatedAt:null}
  ];
  var main=AION_STATE.data.characters[0],alt=AION_STATE.data.characters[1];
  AION_STATE.data.preferences.activeCharacterId=main.id;
  function withObjectives(c,title){
    var p=createPlan(title,'','character',c.id);
    function objective(title){return {id:makeId(),description:title,details:'',done:false,completedAt:null,position:0}}
    p.stages=[
      {id:makeId(),title:'Vazia',description:'',position:0,objectives:[]},
      {id:makeId(),title:'Primeira',description:'',position:1,objectives:[objective('Primeiro'),objective('Segundo')]},
      {id:makeId(),title:'Seguinte',description:'',position:2,objectives:[objective('Terceiro')]}
    ];
    p.stages[1].objectives[1].position=1;
    setPlanStatus(p,'active');return p;
  }
  var p=withObjectives(main,'Plano principal'),other=withObjectives(alt,'Outro plano');
  var account=createPlan('Conta','');setPlanStatus(account,'active');
  var first=p.stages[1].objectives[0],second=p.stages[1].objectives[1],last=p.stages[2].objectives[0];
  var unrelated=JSON.stringify({other:other,account:account,characters:AION_STATE.data.characters,activities:AION_STATE.data.activities,cycles:AION_STATE.data.activityCycles});
`, ctx);
assert.equal(ctx.completeNextDashboardObjective(ctx.other.id, ctx.first.id), false);
assert.equal(ctx.completeNextDashboardObjective(ctx.p.id, ctx.second.id), false);
assert.equal(ctx.completeNextDashboardObjective(ctx.p.id, ctx.first.id), true);
assert.equal(ctx.first.done, true);
assert.ok(ctx.first.completedAt);
assert.equal(ctx.planStats(ctx.p.stages).percent, 33);
assert.equal(JSON.parse(memory.get(ctx.AION_STORAGE_KEY)).plans.find(p => p.id === ctx.p.id).stages[1].objectives[0].done, true);
const afterFirst = JSON.stringify(ctx.AION_STATE.data);
assert.equal(ctx.completeNextDashboardObjective(ctx.p.id, ctx.first.id), false);
assert.equal(JSON.stringify(ctx.AION_STATE.data), afterFirst);
ctx.selectInterfaceCharacter(ctx.alt.id);
assert.equal(ctx.completeNextDashboardObjective(ctx.p.id, ctx.second.id), false);
ctx.selectInterfaceCharacter(ctx.main.id);
assert.equal(ctx.completeNextDashboardObjective(ctx.p.id, ctx.second.id), true);
assert.equal(ctx.nextPlanObjective(ctx.p).objective.id, ctx.last.id);
assert.equal(ctx.completeNextDashboardObjective(ctx.p.id, ctx.last.id), true);
assert.equal(ctx.planStats(ctx.p.stages).percent, 100);
assert.equal(ctx.p.status, 'active');
assert.equal(ctx.completeNextDashboardObjective(ctx.p.id, ctx.last.id), false);
assert.equal(vm.runInContext('JSON.stringify({other:other,account:account,characters:AION_STATE.data.characters,activities:AION_STATE.data.activities,cycles:AION_STATE.data.activityCycles})', ctx), ctx.unrelated);
ctx.setObjectiveDone(ctx.p.id, ctx.first.id, false);
assert.equal(ctx.nextPlanObjective(ctx.p).objective.id, ctx.first.id);
assert.equal(ctx.first.completedAt, null);
ctx.AION_STATE.data.characters = [];
assert.equal(ctx.completeNextDashboardObjective(ctx.p.id, ctx.first.id), false);
console.log('PASS próxima ação: ordem entre etapas, salvamento, rejeição de ação obsoleta/outro personagem, sincronização, 100% sem encerramento automático e preservação de conta/atividades/cadastros.');
