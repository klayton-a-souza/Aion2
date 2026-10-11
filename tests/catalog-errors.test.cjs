const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map(),rows=[];let submit;
function element(id){if(!elements.has(id))elements.set(id,{innerHTML:'',hidden:false,textContent:'',focus(options){this.focused=true;this.options=options},querySelectorAll(selector){return selector==='.catalog-item'?rows:[]},querySelector(){return {set onsubmit(fn){submit=fn}}}});return elements.get(id)}
const ctx=vm.createContext({document:{getElementById:element},AION_STATE:{data:{characters:[{id:'c',name:'Teste'}],activities:[]}},activityAction(){},renderActivities(){},esc:String,window:{confirm(){return true}}});
vm.runInContext(fs.readFileSync('data/activities-catalog.js','utf8'),ctx);vm.runInContext(fs.readFileSync('js/catalog.js','utf8'),ctx);
ctx.openCatalog();const markup=element('activity-dialog').innerHTML;assert(markup.indexOf('catalog-actions')<markup.indexOf('id="catalog-error"'));assert(markup.includes('tabindex="-1" hidden'));
submit({preventDefault(){}});let error=element('catalog-error');assert.equal(error.textContent,'Selecione ao menos um modelo.');assert(!error.hidden&&error.focused);assert(error.options.preventScroll);
const picked={checked:true},scope={value:'character'},character={value:''};rows.push({dataset:{model:'nightmare'},querySelector(selector){return selector==='.catalog-picked'?picked:selector==='.catalog-scope'?scope:character}});
submit({preventDefault(){}});assert(error.textContent.includes('Escolha o personagem'));
character.value='c';ctx.AION_STATE.data.activities=[{catalogId:'nightmare',scope:'character',characterId:'c'}];submit({preventDefault(){}});assert(error.textContent.includes('Todos os modelos'));
picked.checked=false;submit({preventDefault(){}});assert.equal(error.textContent,'Selecione ao menos um modelo.');
console.log('PASS erros do catálogo: aviso no rodapé fixo, seleção vazia, personagem ausente, duplicatas e foco sem deslocar a lista, em DOM simulado.');
