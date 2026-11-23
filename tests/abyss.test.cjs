const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const run = require('./helpers/runtime.cjs');
const ctx = vm.createContext({Date, Math, Intl, console, document:{addEventListener(){}}});
for (const [, path] of fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g)) {
  run(vm,fs,fs.readFileSync(path,'utf8'),ctx);
}
const data = ctx.AION_STATE.data = ctx.prepareState(ctx.createInitialState());
data.characters = [
  {id:'main',name:'Principal',className:'Templário',ilevel:100,type:'main',server:'Triniel',faction:'Elyos'},
  {id:'alt',name:'Alternativo',className:'Clérigo',ilevel:100,type:'alt',server:' triniel ',faction:'Elyos'},
  {id:'other',name:'Outro servidor',className:'Clérigo',ilevel:100,type:'alt',server:'Yustiel',faction:'Elyos'}
];
const now = new Date('2026-11-22T03:00:00Z');
const next = new Date('2026-11-29T03:00:00Z');
const catalog = ctx.ACTIVITIES_CATALOG;
const models = ['abyss-commands','abyss-siege','abyss-solitude','abyss-cooperation','abyss-tactics','abyss-corridor','supply-requests'];
assert.equal(catalog.filter(m=>m.id==='abyss-corridor').length,1);
assert(!catalog.some(m=>m.id==='stigma-shards'));
assert.equal(catalog.filter(m=>models.includes(m.id)&&m.frequency==='weekly').length,7);
const selection = models.map(modelId=>({modelId,scope:'character',characterId:'main'}));
assert.equal(ctx.addCatalogSelection(selection,true,now).added,7);
assert.equal(ctx.addCatalogSelection(selection,true,now).skipped,7);
assert.equal(ctx.addCatalogSelection([{modelId:'abyss-corridor',scope:'character',characterId:'alt'}],true,now).added,1);
const supplies = data.activities.find(a=>a.catalogId==='supply-requests');
const corridor = data.activities.find(a=>a.catalogId==='abyss-corridor');
for (const activity of [supplies,corridor])ctx.toggleActivity(activity.id,true,now);
const retired = ctx.saveActivity({name:'Loja personalizada',frequency:'weekly',scope:'character',characterId:'main'},null,now);
retired.catalogId = 'stigma-shards';
data.eventCalendar.events[0].activityId = retired.id;
const legacy = ctx.backupPayload();
delete legacy.data.abyss;
const migrated = ctx.validateBackup(legacy);
assert(!migrated.activities.some(a=>a.id===retired.id));
assert(!migrated.activityCycles.weekly.items.some(a=>a.activityId===retired.id));
assert.equal(migrated.eventCalendar.events[0].activityId,null);
for (const activity of [supplies,corridor]) {
  assert(migrated.activityCycles.weekly.items.some(a=>a.activityId===activity.id&&a.done));
}
assert.equal(JSON.stringify(ctx.prepareState(migrated)),JSON.stringify(migrated));
ctx.AION_STATE.data = migrated;
const record = (model, character, action, values={}, at=now)=>ctx.abyssRecord(model,character,action,values,at);
const purchase = (character,at)=>record('abyss-commands',character,'purchase',{tier:0},at);
const scroll = purchase('main');
for(let i=0;i<4;i++)purchase('alt');
assert.throws(()=>purchase('alt'),/Cota semanal/);
assert.equal(purchase('other').cost,15000);
assert.equal(purchase('main',next).status,'stored');
assert.equal(scroll.status,'stored');
assert.throws(()=>record('abyss-commands','alt','activate',{scroll:scroll.id},next));
record('abyss-commands','main','activate',{scroll:scroll.id},next);
assert.equal(scroll.status,'active');
record('abyss-commands','main','complete',{scroll:scroll.id,ap:1540},next);
assert.equal(scroll.status,'completed');
const occurrences = ctx.abyssSiegeOccurrences(now);
const week = ctx.cycleId('weekly',data.resetSettings,now);
assert.equal(occurrences.filter(o=>ctx.cycleId('weekly',data.resetSettings,new Date(o.start))===week).length,2);
const occurrence = occurrences.filter(o=>o.start < +now).at(-1).key;
record('abyss-siege','main','control',{occurrence,artifact0:2});
record('abyss-corridor','main','availability',{occurrence,artifact0:1});
record('abyss-corridor','main','run',{occurrence,artifact:0,ap:500});
record('abyss-corridor','alt','run',{occurrence,artifact:0,ap:600});
assert.throws(()=>record('abyss-corridor','main','run',{occurrence,artifact:0}),/já foi registrada/);
record('abyss-siege','main','participate',{occurrence,ap:100,medals:2});
assert.throws(()=>record('abyss-siege','main','participate',{occurrence}),/já foi registrada/);
for(let i=0;i<3;i++)assert.equal(record('abyss-tactics','main','loss').ap,1000);
for(let i=0;i<3;i++)assert.equal(record('abyss-tactics','main','win').ap,3000);
assert.equal(record('abyss-tactics','main','win').ap,0);
assert.equal(record('abyss-tactics','alt','win').medals,3);
assert.equal(record('abyss-tactics','main','win',{},next).ap,4000);
record('abyss-solitude','main','rank',{season:'1',rank:'Ouro'});
record('abyss-solitude','main','win',{},next);
assert.equal(record('abyss-cooperation','main','win').ap,800);
assert.equal(migrated.abyss.records.find(r=>r.action==='rank').rank,'Ouro');
const backup = ctx.backupPayload();
assert.equal(JSON.stringify(ctx.validateBackup(backup).abyss),JSON.stringify(backup.data.abyss));
const arena = migrated.eventCalendar.events.find(e=>e.id==='arena-taticas');
const opening = ctx.eventOccurrences(arena,now).find(o=>o.start>+now);
migrated.eventCalendar.settings.alertMinutes = 5;
assert.equal(ctx.pendingEventAlerts(migrated.eventCalendar,[opening],new Date(opening.start-1000)).length,0);
arena.validation = 'verified';
assert.equal(ctx.pendingEventAlerts(migrated.eventCalendar,[opening],new Date(opening.start-1000)).length,1);
console.log('PASS Abismo: catálogo, migração, escopos, cota e estoque, cercos, corredores, arenas, ranking, alertas e backup.');
