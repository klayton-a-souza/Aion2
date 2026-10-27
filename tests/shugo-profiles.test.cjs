const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx=vm.createContext({AION_STATE:{data:{characters:[]}},document:{addEventListener(){}},esc:String,date(){return ''}});
vm.runInContext(fs.readFileSync('data/character-guides.js','utf8'),ctx);vm.runInContext(fs.readFileSync('js/app.js','utf8'),ctx);
for(const [name,url] of [
  ['L0rdFuria','https://aion2index.com/c/la/triniel/L0rdFuria'],
  ['Warri0rLord','https://aion2index.com/c/la/triniel/WarriorL0rd'],
  ['WarriorL0rd','https://aion2index.com/c/la/triniel/WarriorL0rd'],
  ['LadyFuria','https://aion2.gaming.tools/pt-br/builds/cleric/pve'],
  ['MästerFuria','https://aion2index.com/c/la/triniel/M%C3%A4sterFuria']
]){
  const c={id:'stable',name,className:'Classe',type:'alt',ilevel:1300};ctx.AION_STATE.data.characters=[c];const before=JSON.stringify(c);
  assert.equal(ctx.characterProfileUrl(c,[c]),url);const html=ctx.card(c);assert(html.includes('href="'+url+'" target="_blank" rel="noopener noreferrer">Perfil <'));assert(!html.includes('shugo.gg'));assert(html.includes('>Guia <'));assert.equal(JSON.stringify(c),before);
}
for(const name of ['WarriorLord','LordFuria','Outro','constructor','__proto__'])assert.equal(ctx.characterProfileUrl({name},[]),null);
const ambiguous=[{name:'Warri0rLord'},{name:'WarriorL0rd'}];for(const c of ambiguous)assert.equal(ctx.characterProfileUrl(c,ambiguous),null);
assert.equal(ctx.characterProfileUrl({name:' ladyfuria '},[]),'https://aion2.gaming.tools/pt-br/builds/cleric/pve');
assert.equal(ctx.characterProfileUrl({name:' MÄSTERFURIA '},[]),'https://aion2index.com/c/la/triniel/M%C3%A4sterFuria');
console.log('PASS Perfil: quatro destinos literais, aliases e acentos corretos, conflito omitido, nova aba segura e dados inalterados.');
