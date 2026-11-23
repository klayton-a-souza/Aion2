function runArchitectureScript(code,context){return require("./helpers/runtime.cjs")(vm,fs,code,context)}
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const memory=new Map();const ctx=vm.createContext({Date,Math,Set,Intl,console,document:{addEventListener(){},getElementById(){return null}},localStorage:{setItem(k,v){memory.set(k,v)},getItem(k){return memory.has(k)?memory.get(k):null},removeItem(k){memory.delete(k)}},setTimeout(){}});
['data/defaults.js','data/activities-catalog.js','js/core/state.js','js/activities/cycles.js','js/core/storage.js','js/core/backup.js','js/characters/controller.js','js/progression/context.js','js/progression/plans.js','js/activities/controller.js','js/activities/catalog.js'].forEach(f=>runArchitectureScript(fs.readFileSync(f,'utf8'),ctx));
runArchitectureScript(`
loadState();var now=new Date();var c1={id:makeId(),name:'Um',className:'Classe',ilevel:10,type:'main'},c2={id:makeId(),name:'Dois',className:'Classe',ilevel:20,type:'alt'};AION_STATE.data.characters.push(c1,c2);var plan=createPlan('Plano preservado','');
var custom=saveActivity({name:'Minha atividade',scope:'account',frequency:'daily'},null,now);toggleActivity(custom.id,true,now);var customBefore=JSON.stringify(custom),plansBefore=JSON.stringify(AION_STATE.data.plans),charactersBefore=JSON.stringify(AION_STATE.data.characters);
if(ACTIVITIES_CATALOG.length!==28||new Set(ACTIVITIES_CATALOG.map(m=>m.id)).size!==28||CATALOG_RESOURCES.length!==3)throw Error('Contagem catálogo');if(ACTIVITIES_CATALOG.filter(m=>m.frequency==='daily').length!==7||ACTIVITIES_CATALOG.filter(m=>m.frequency==='weekly').length!==21)throw Error('Frequências');
ACTIVITIES_CATALOG.forEach(m=>{['name','englishName','description','objective','limits','unlock','guidance','kind'].forEach(k=>{if(!m[k])throw Error('Campo ausente '+k)});if(!catalogDetails(m).includes(m.name==='x'?'x':'Dicas importantes'))throw Error('Detalhes');if(m.sources.length!==2)throw Error('Fontes')});
var selection=ACTIVITIES_CATALOG.map(m=>({modelId:m.id,scope:m.scope,characterId:m.scope==='character'?c1.id:null}));var result=addCatalogSelection(selection,true,now);if(result.added!==28||result.skipped)throw Error('Inclusão');if(JSON.stringify(custom)!==customBefore||!activityDone(custom)||JSON.stringify(AION_STATE.data.plans)!==plansBefore||JSON.stringify(AION_STATE.data.characters)!==charactersBefore)throw Error('Dados anteriores alterados');
result=addCatalogSelection(selection,true,now);if(result.added||result.skipped!==28)throw Error('Idempotência');
result=addCatalogSelection([{modelId:'nightmare',scope:'character',characterId:c2.id}],false,now);if(result.added!==1)throw Error('Segundo personagem');var second=AION_STATE.data.activities.find(a=>a.catalogId==='nightmare'&&a.characterId===c2.id);if(second.active)throw Error('Inativa');
var duty=AION_STATE.data.activities.find(a=>a.catalogId==='journal-duties');toggleActivity(duty.id,true,now);duty=saveActivity({name:'Meu diário',description:'Minha descrição',scope:'account',frequency:'daily'},duty.id,now);if(duty.catalogId!=='journal-duties'||!activityDone(duty))throw Error('Edição perde metadados/conclusão');duty.active=false;syncActivityCycles(now);if(addCatalogSelection([selection[0]],true,now).added)throw Error('Duplicação inativa');
saveState();loadState();if(!AION_STATE.data.activities.some(a=>a.catalogId==='journal-duties'&&a.name==='Meu diário'&&!a.active))throw Error('Persistência');var restored=validateBackup(backupPayload());if(restored.activities.length!==30)throw Error('Backup');
var before=JSON.stringify(AION_STATE.data);var failed=false;try{addCatalogSelection([{modelId:'attendance',scope:'character',characterId:'inexistente'}],true,now)}catch(e){failed=true}if(!failed||JSON.stringify(AION_STATE.data)!==before)throw Error('Validação atômica');
var duplicate=cloneData(restored),copy=cloneData(duplicate.activities.find(a=>a.catalogId));copy.id=makeId();copy.position=duplicate.activities.length;duplicate.activities.push(copy);if(isValidState(duplicate))throw Error('Backup duplicado aceito');
var page={querySelectorAll(){return []},children:[],appendChild(x){this.children.push(x)}};document.getElementById=function(id){return id==='activities-page'?page:{value:'',querySelectorAll(){return []}}};document.createElement=function(){return {}};renderActivities();if(page.children.length!==1||CATALOG_RESOURCES.some(r=>!page.children[0].innerHTML.includes(r.name)))throw Error('Painel recursos');
var dialog={querySelectorAll(){return []},querySelector(){return {}}},controls={};document.getElementById=function(id){if(id==='activity-dialog')return dialog;return controls[id]||(controls[id]={focus(){}})};openCatalog();if((dialog.innerHTML.match(/data-model=/g)||[]).length!==28||ACTIVITIES_CATALOG.some(m=>!dialog.innerHTML.includes(m.name)))throw Error('Exibição dos modelos');
`,ctx);
const html=fs.readFileSync('index.html','utf8');for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(!match[1].startsWith('#'))assert(fs.existsSync(match[1]),match[1]);assert(!/^https?:/.test(match[1]))}assert(!/fetch\s*\(/.test(fs.readFileSync('js/activities/catalog.js','utf8')));
console.log('PASS catálogo: 28 modelos (7/21), 3 recursos, informações/fontes, inclusão por conta e por personagem, duplicatas/inativas, edição/conclusão, persistência, backup, rejeição atômica, preservação de planos/personagens/personalizadas e referências locais. Renderização dos recursos verificada com DOM simulado.');

runArchitectureScript(`
var legacy=cloneData(AION_STATE.data);delete legacy.preferences.abyssCorridorWeeklyChecklist;
var corridor=legacy.activities.find(a=>a.catalogId==='abyss-corridor');corridor.frequency='daily';
var stampNow=new Date().toISOString(),weeklyKey=cycleId('weekly',legacy.resetSettings,new Date());
legacy.activityCycles.daily={id:cycleId('daily',legacy.resetSettings,new Date()),frequency:'daily',openedAt:stampNow,items:[Object.assign(activitySnapshot(corridor),{done:true,completedAt:stampNow})]};
legacy.activityCycles.weekly=null;
var historyBefore=JSON.stringify(legacy.activityHistory),migrated=prepareState(legacy),converted=migrated.activities.find(a=>a.id===corridor.id);
if(converted.frequency!=='weekly'||!migrated.activityCycles.weekly.items.find(i=>i.activityId===corridor.id&&i.done))throw Error('Migração perde conclusão de hoje');
if(migrated.activityCycles.daily.items.some(i=>i.activityId===corridor.id)||JSON.stringify(migrated.activityHistory)!==historyBefore)throw Error('Ciclos/histórico divergentes');
if(JSON.stringify(prepareState(migrated))!==JSON.stringify(migrated))throw Error('Migração não idempotente');
AION_STATE.data=migrated;syncActivityCycles(new Date());if(!activityDone(converted))throw Error('Conclusão perdida ao sincronizar');
var nextDay=new Date(Date.now()+7*86400000);syncActivityCycles(nextDay);if(activityDone(converted))throw Error('Reset semanal não aplicado');
saveActivity(Object.assign({},converted,{frequency:'daily'}),converted.id,nextDay);if(prepareState(AION_STATE.data).activities.find(a=>a.id===corridor.id).frequency!=='daily')throw Error('Edição posterior sobrescrita');
var earlier=cloneData(legacy);earlier.activityCycles.daily.items[0].completedAt=new Date(Date.now()-7*86400000).toISOString();if(prepareState(earlier).activityCycles.weekly.items.find(i=>i.activityId===corridor.id).done)throw Error('Conclusão antiga marcada hoje');
`,ctx);
console.log('PASS Corredor semanal: conversão única, conclusão de hoje, histórico preservado, reset seguinte e edição posterior.');

const breeze=ctx.ACTIVITIES_CATALOG.filter(m=>m.id.startsWith('breeze-'));assert.equal(breeze.length,7);assert.equal(breeze.filter(m=>m.scope==='account').length,5);assert.equal(breeze.filter(m=>m.scope==='character').length,2);assert(breeze.every(m=>m.frequency==='weekly'&&m.category==='Compras — Associação Brisa'));assert(!breeze.some(m=>/auto.?loot|autocoleta/i.test(m.name)));console.log('PASS Brisa: sete modelos opcionais, cinco compartilhados e dois individuais, sem autocoleta.');

runArchitectureScript(`
var tm=catalogModel('transcendence-weekly-mission');if(!tm||tm.frequency!=='weekly'||tm.scope!=='character'||!tm.description.includes('Não é necessário gastar'))throw Error('Modelo de Transcendência incorreto');
var people=AION_STATE.data.characters;addCatalogSelection(people.map(c=>({modelId:tm.id,scope:'character',characterId:c.id})),true);
var individual=AION_STATE.data.activities.filter(a=>a.catalogId===tm.id);if(individual.length!==people.length)throw Error('Vínculos individuais');
toggleActivity(individual[0].id,true);if(!activityDone(individual[0])||activityDone(individual[1]))throw Error('Conclusão compartilhada indevidamente');
var count=AION_STATE.data.activities.length;addCatalogSelection([{modelId:tm.id,scope:'character',characterId:people[0].id}],true);if(AION_STATE.data.activities.length!==count)throw Error('Duplicata de Transcendência');
var weeklyBackup=validateBackup(backupPayload());if(weeklyBackup.activities.filter(a=>a.catalogId===tm.id).length!==people.length)throw Error('Backup de Transcendência');
syncActivityCycles(new Date(Date.now()+8*86400000));if(activityDone(individual[0]))throw Error('Reset semanal de Transcendência');
`,ctx);console.log('PASS Transcendência: semanal individual, instrução sem gasto de energia, conclusões independentes, duplicatas, backup e reset.');
