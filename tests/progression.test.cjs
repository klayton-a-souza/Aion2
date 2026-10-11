const fs=require('fs'),vm=require('vm'),assert=require('assert');
const memory=new Map();const ctx=vm.createContext({console,Date,Math,Set,document:{addEventListener(){},getElementById(){return null}},localStorage:{setItem(k,v){memory.set(k,v)},getItem(k){return memory.has(k)?memory.get(k):null},removeItem(k){memory.delete(k)}},setTimeout(){}});
['data/defaults.js','js/state.js','js/cycles.js','js/storage.js','js/backup.js','js/app.js','js/progression.js'].forEach(f=>vm.runInContext(fs.readFileSync(f,'utf8'),ctx));
vm.runInContext(`
loadState();
var p=createPlan('Primeiro','');
for(var i=0;i<3;i++)p.stages.push({id:makeId(),title:'Etapa '+i,description:'',position:i,objectives:[{id:makeId(),description:'Objetivo '+i,position:0,done:false,completedAt:null}]});
setPlanStatus(p,'active');
var q=createPlan('Próximo','');
var blocked=false;try{setPlanStatus(q,'active')}catch(e){blocked=true}if(!blocked)throw Error('Dois ativos');
p.stages[0].objectives[0].done=true;p.stages[0].objectives[0].completedAt=new Date().toISOString();
if(planStats(p.stages).percent!==33)throw Error('Percentual');
p.stages[0].objectives[0].done=false;p.stages[0].objectives[0].completedAt=null;
if(planStats(p.stages).percent!==0)throw Error('Desmarcação');
p.stages.reverse();renumber(p.stages);p.stages[0].objectives[0].description='Editado';
saveState();loadState();p=activePlan();if(p.stages[0].objectives[0].description!=='Editado')throw Error('Persistência');
p.stages.forEach(s=>s.objectives.forEach(o=>{o.done=true;o.completedAt=new Date().toISOString()}));setPlanStatus(p,'completed');
if(editable(p)||planStats(p.stages).percent!==100)throw Error('Histórico');
q=planById(q.id);setPlanStatus(q,'active');setPlanStatus(q,'cancelled');
var empty=createPlan('Vazio','');setPlanStatus(empty,'active');blocked=false;try{setPlanStatus(empty,'completed')}catch(e){blocked=true}if(!blocked)throw Error('Vazio concluído');
AION_STATE.data.characters.push({id:makeId(),name:'Teste',className:'Classe',ilevel:100,type:'main',server:'',faction:'',ilevelUpdatedAt:null});
var restored=validateBackup(backupPayload());if(restored.characters.length!==1||restored.plans.length!==3)throw Error('Backup');
var duplicate=cloneData(restored);duplicate.plans[1].id=duplicate.plans[0].id;if(isValidState(duplicate))throw Error('ID duplicado aceito');
var two=cloneData(restored);two.plans[1].status='active';two.plans[1].closedAt=null;if(isValidState(two))throw Error('Ativos duplicados aceitos');
var old=cloneData(restored);old.schemaVersion='1.1.0';delete old.plans;delete old.nextPlanNumber;if(prepareState(old).characters[0].id!==old.characters[0].id)throw Error('Migração');
localStorage.setItem(AION_STORAGE_KEY,'inválido');loadState();if(!AION_STATE.storageBlocked||saveState()||localStorage.getItem(AION_STORAGE_KEY)!=='inválido')throw Error('Sobrescrita');
localStorage.getItem=function(){throw Error('bloqueado')};if(loadState().reason!=='unavailable')throw Error('Indisponível');
`,ctx);
const html=fs.readFileSync('index.html','utf8');for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){assert(fs.existsSync(match[1]),match[1]);assert(!/^https?:/.test(match[1]))}
vm.runInContext(`
AION_STATE.data=createInitialState();AION_STATE.storageAvailable=true;AION_STATE.storageBlocked=false;
var deletionStorage=new Map();localStorage.setItem=function(k,v){deletionStorage.set(k,v)};localStorage.getItem=function(k){return deletionStorage.has(k)?deletionStorage.get(k):null};localStorage.removeItem=function(k){deletionStorage.delete(k)};
AION_STATE.data.characters.push({id:makeId(),name:'Preservado',className:'Classe',ilevel:100,type:'main',server:'',faction:'',ilevelUpdatedAt:null});
var keep=createPlan('Preservar',''),characterSnapshot=JSON.stringify(AION_STATE.data.characters),keepSnapshot=JSON.stringify(keep);
renderApp=function(){this.renderCount=(this.renderCount||0)+1};showToast=function(){};
var messages=[];window={confirm:function(message){messages.push(message);return false}};
var d=createPlan('Confirmação','');var before=JSON.stringify(AION_STATE.data);handlePlanAction('delete-plan',d.id);if(JSON.stringify(AION_STATE.data)!==before)throw Error('Cancelamento da confirmação');
window.confirm=function(message){messages.push(message);return true};
['draft','active','completed','cancelled'].forEach(function(status){
  var victim=createPlan('Excluir '+status,'');victim.stages=[{id:makeId(),title:'Etapa',description:'',position:0,objectives:[{id:makeId(),description:'Objetivo',position:0,done:false,completedAt:null}]}];
  if(status!=='draft')setPlanStatus(victim,'active');
  if(status==='completed'){victim.stages[0].objectives[0].done=true;victim.stages[0].objectives[0].completedAt=new Date().toISOString();setPlanStatus(victim,'completed')}
  if(status==='cancelled')setPlanStatus(victim,'cancelled');
  var number=victim.number,id=victim.id,sequence=AION_STATE.data.nextPlanNumber;selectedPlanId=id;
  handlePlanAction('delete-plan',id);
  if(planById(id)||selectedPlanId!==null||AION_STATE.data.nextPlanNumber!==sequence)throw Error('Exclusão '+status);
  if(messages[messages.length-1].indexOf(victim.title)<0||messages[messages.length-1].indexOf('permanentemente')<0)throw Error('Aviso incompleto');
  if(JSON.stringify(keep)!==keepSnapshot||JSON.stringify(AION_STATE.data.characters)!==characterSnapshot)throw Error('Dados alheios alterados');
  if(validateBackup(backupPayload()).plans.some(p=>p.id===id))throw Error('Backup contém excluído');
  loadState();if(planById(id))throw Error('Persistência da exclusão');
  var successor=createPlan('Sucessor','');if(successor.number<=number||successor.id===id)throw Error('Identificação reutilizada');
  if(status==='active'){setPlanStatus(successor,'active');setPlanStatus(successor,'cancelled')}
});
if(renderCount<4)throw Error('Interface não atualizada');
`,ctx);
console.log('PASS: exclusão nos quatro estados, confirmação recusada/aceita, aviso nominal, recálculo da interface, liberação do ativo, persistência, backup e preservação de personagens/planos/contador.');
console.log('PASS: criação, 3 etapas, edição/ordem, ativação exclusiva, percentuais, desmarcação, persistência simulada, conclusão, planos sucessivos, cancelamento, vazio, histórico, backup, IDs, migração, personagens, proteção local, indisponibilidade e referências.');
