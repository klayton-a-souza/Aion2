function runArchitectureScript(code,context){return require("./helpers/runtime.cjs")(vm,fs,code,context)}
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx=vm.createContext({AION_STATE:{data:{characters:[]}},document:{addEventListener(){}},esc:String,date(){return ''}});
runArchitectureScript(fs.readFileSync('data/character-guides.js','utf8'),ctx);runArchitectureScript(fs.readFileSync('js/characters/controller.js','utf8'),ctx);
for(const [name,url] of [
  ['L0rdFuria','https://kisk.app/c/la/triniel/L0rdFuria/gear'],
  ['Warri0rLord','https://kisk.app/c/la/triniel/WarriorL0rd/gear'],
  ['WarriorL0rd','https://kisk.app/c/la/triniel/WarriorL0rd/gear'],
  ['LadyFuria','https://kisk.app/c/la/triniel/LadyFuria/gear'],
  ['MästerFuria','https://kisk.app/c/la/triniel/M%C3%A4sterFuria/gear']
]){
  const c={id:'stable',name,className:'Classe',type:'alt',ilevel:1300};ctx.AION_STATE.data.characters=[c];const before=JSON.stringify(c);
  assert.equal(ctx.characterProfileUrl(c,[c]),url);const html=ctx.card(c);assert(html.includes('href="'+url+'" target="_blank" rel="noopener noreferrer">Perfil <'));assert(!html.includes('shugo.gg'));assert(html.includes('>Guia <'));assert.equal(JSON.stringify(c),before);
}
for(const name of ['WarriorLord','LordFuria','Outro','constructor','__proto__'])assert.equal(ctx.characterProfileUrl({name},[]),null);
const ambiguous=[{name:'Warri0rLord'},{name:'WarriorL0rd'}];for(const c of ambiguous)assert.equal(ctx.characterProfileUrl(c,ambiguous),null);
assert.equal(ctx.characterProfileUrl({name:' ladyfuria '},[]),'https://kisk.app/c/la/triniel/LadyFuria/gear');
assert.equal(ctx.characterProfileUrl({name:' MÄSTERFURIA '},[]),'https://kisk.app/c/la/triniel/M%C3%A4sterFuria/gear');
console.log('PASS Perfil: quatro destinos literais, aliases e acentos corretos, conflito omitido, nova aba segura e dados inalterados.');
