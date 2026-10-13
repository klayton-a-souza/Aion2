const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx=vm.createContext({AION_STATE:{data:{characters:[]}},document:{addEventListener(){}},esc:String,date(){return ''}});
vm.runInContext(fs.readFileSync('data/character-guides.js','utf8'),ctx);vm.runInContext(fs.readFileSync('js/app.js','utf8'),ctx);
for(const [name,className,slug] of [['L0rdFuria','Assassino','assassin'],['WarriorL0rd','Templário','templar'],['Warri0rLord','Templário','templar'],['LadyFuria','Clériga','cleric']]){
  const c={id:'stable',name,className,type:'alt',ilevel:0};ctx.AION_STATE.data.characters=[c];const before=JSON.stringify(ctx.AION_STATE.data),url='https://aion2.gaming.tools/pt-br/builds/'+slug+'/pve';
  assert.equal(ctx.characterPveGuideUrl(c),url);const html=ctx.card(c);assert(html.includes('href="'+url+'" target="_blank" rel="noopener noreferrer"'));assert(html.includes('Guia PvE — Nível 45+'));assert(html.includes('Guia de evolução'));assert(html.includes('>Perfil <'));assert.equal((html.match(/target="_blank"/g)||[]).length,3);assert.equal(JSON.stringify(ctx.AION_STATE.data),before);
}
assert.equal(ctx.characterPveGuideUrl({name:'Outro',className:'Assassino'}),null);assert.equal(ctx.characterPveGuideUrl({name:'L0rdFuria',className:'Clériga'}),null);assert.equal(ctx.characterPveGuideUrl({name:'WarriorLord',className:'Templário'}),null);
assert.equal(ctx.characterPveGuideUrl({name:' ladyfuria ',className:'Clérigo'}),'https://aion2.gaming.tools/pt-br/builds/cleric/pve');
console.log('PASS guias PvE: URLs das três classes, alias explícito, classe incompatível bloqueada, sem limite de iLvl, três ações seguras e estado inalterado. Sem navegador real.');
