const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx=vm.createContext({AION_STATE:{data:{characters:[]}},document:{addEventListener(){}},esc:String,date(){return ''}});
vm.runInContext(fs.readFileSync('data/character-guides.js','utf8'),ctx);vm.runInContext(fs.readFileSync('js/app.js','utf8'),ctx);
for(const [name,url] of [
  ['L0rdFuria','https://aion2.gaming.tools/pt-br/builds/assassin/pve'],
  ['WarriorL0rd','https://aion2.gaming.tools/pt-br/builds/templar/pve'],
  ['Warri0rLord','https://aion2.gaming.tools/pt-br/builds/templar/pve'],
  ['LadyFuria','https://aion2index.com/c/la/triniel/LadyFuria'],
  ['MästerFuria','https://aion2.gaming.tools/pt-br/builds/sorcerer/pve']
]){
  const c={id:'stable',name,className:'Classe',type:'alt',ilevel:0};ctx.AION_STATE.data.characters=[c];const before=JSON.stringify(ctx.AION_STATE.data);
  assert.equal(ctx.characterGuideUrl(name),url);const html=ctx.card(c);assert(html.includes('href="'+url+'" target="_blank" rel="noopener noreferrer">Guia <'));assert(!html.includes('Guia PvE'));assert(!html.includes('Guia de evolução'));assert(html.includes('>Perfil <'));assert.equal((html.match(/target="_blank"/g)||[]).length,2);assert.equal(JSON.stringify(ctx.AION_STATE.data),before);
}
assert.equal(ctx.characterGuideUrl('Outro'),null);assert.equal(ctx.characterGuideUrl('WarriorLord'),null);assert.equal(ctx.characterGuideUrl('MasterFuria'),null);
assert.equal(ctx.characterGuideUrl(' MA\u0308STERFURIA '),'https://aion2.gaming.tools/pt-br/builds/sorcerer/pve');
console.log('PASS Guia: quatro destinos literais, alias explícito, Unicode, duas ações seguras e dados inalterados.');
