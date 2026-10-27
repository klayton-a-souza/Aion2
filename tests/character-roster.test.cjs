const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();
function element(id){if(!elements.has(id))elements.set(id,{hidden:false,textContent:'',innerHTML:'',querySelectorAll(){return []}});return elements.get(id)}
const characters=[
  {id:'char-l0rdfuria-inicial',name:'L0rdFuria',className:'Assassino',ilevel:1755,type:'main',server:'Triniel',faction:'Asmodianos',ilevelUpdatedAt:null},
  {id:'alt',name:'LadyFuria',className:'Clériga',ilevel:1324,type:'alt',server:'',faction:'',ilevelUpdatedAt:null}
];
const ctx=vm.createContext({console,Date,AION_STATE:{data:{characters,preferences:{activeCharacterId:characters[0].id}}},document:{getElementById:element,addEventListener(){}}});
for(const file of ['data/character-guides.js','js/app.js','js/characters.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const initial=JSON.stringify(ctx.AION_STATE.data);
assert.equal(ctx.rosterCharacter(characters).id,characters[0].id);
ctx.renderCharacterRoster(characters);
assert.equal((element('character-list').innerHTML.match(/data-roster-character=/g)||[]).length,2);
assert.equal((element('character-list').innerHTML.match(/class="character-card /g)||[]).length,1);
assert(element('character-list').innerHTML.includes('id="character-detail-title">L0rdFuria'));
ctx.rosterSelectedCharacterId='alt';ctx.renderCharacterRoster(characters);
assert(element('character-list').innerHTML.includes('id="character-detail-title">LadyFuria'));
assert.equal(JSON.stringify(ctx.AION_STATE.data),initial);
assert.equal(ctx.rosterCharacter([characters[0]]).id,characters[0].id);
assert.equal(ctx.rosterCharacter([]),null);
assert(ctx.characterPortrait({...characters[0],name:'Renomeado'}).includes('assets/images/l0rdfuria.png'));
assert(!ctx.characterPortrait({...characters[0],id:'different'}).includes('<img'));
assert(!ctx.characterPortrait({...characters[0],id:'constructor'}).includes('<img'));
for(const [className,icon] of [['Assassino','assassin'],['Assassin','assassin'],['Templário','templar'],['Clériga','cleric'],['Feiticeiro','sorcerer']]){
  const html=ctx.characterClassIcon({...characters[0],className});
  assert(html.includes('assets/icons/classes/'+icon+'.svg'));
  assert(fs.existsSync('assets/icons/classes/'+icon+'.svg'));
}
assert(!ctx.characterClassIcon({...characters[0],className:'constructor'}).includes('<img'));
const unsafe={...characters[0],id:'"><script>',name:'<img onerror=alert(1)>',className:'<script>',server:'<script>',faction:'<script>'};
assert(!ctx.card(unsafe).includes('<script>'));
assert(!ctx.card(unsafe).includes('<img onerror'));
ctx.renderCharacterRoster([]);
assert(element('character-list').innerHTML.includes('data-action="new"'));
assert(fs.existsSync('assets/images/l0rdfuria.png'));
console.log('PASS lista e ficha: seleção sem gravação, fallback, uma ficha por vez, retrato por ID, renomeação, símbolos por classe, escape, assets locais e estado vazio.');
