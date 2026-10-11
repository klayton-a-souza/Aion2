const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx=vm.createContext({AION_STATE:{data:{characters:[]}},document:{addEventListener(){}},esc:String,date(){return ''}});
vm.runInContext(fs.readFileSync('data/character-guides.js','utf8'),ctx);vm.runInContext(fs.readFileSync('js/app.js','utf8'),ctx);
for(const [name,path] of [['L0rdFuria','L0rdFuria'],['Warri0rLord','WarriorL0rd'],['WarriorL0rd','WarriorL0rd'],['LadyFuria','LadyFuria']]){
  const c={id:'stable',name,className:'Classe',type:'alt',ilevel:1300};ctx.AION_STATE.data.characters=[c];const before=JSON.stringify(c),url='https://shugo.gg/character/global/la-triniel/'+path;
  assert.equal(ctx.characterShugoUrl(c,[c]),url);const html=ctx.card(c);assert(html.includes('href="'+url+'" target="_blank" rel="noopener noreferrer"'));assert(html.includes('>Perfil <'));assert(!html.includes('Perfil Shugo.gg'));assert(html.includes('Guia de evolução'));assert.equal(JSON.stringify(c),before);
}
for(const name of ['WarriorLord','LordFuria','Outro','constructor','__proto__'])assert.equal(ctx.characterShugoUrl({name},[]),null);
const ambiguous=[{name:'Warri0rLord'},{name:'WarriorL0rd'}];for(const c of ambiguous)assert.equal(ctx.characterShugoUrl(c,ambiguous),null);
assert.equal(ctx.characterShugoUrl({name:' ladyfuria '},[]),'https://shugo.gg/character/global/la-triniel/LadyFuria');
console.log('PASS Shugo.gg: três URLs, aliases exatos, conflito omitido, guias preservados, nova aba segura e dados inalterados; sem navegação externa real.');
