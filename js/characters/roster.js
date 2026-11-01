// Presentation-only state. Selecting a roster entry never changes Main or the dashboard.
var rosterSelectedCharacterId=null;
var CHARACTER_PORTRAITS={
  "char-l0rdfuria-inicial":"assets/images/l0rdfuria.png",
  "char-warriorl0rd-inicial":"assets/images/warriorl0rd.png",
  "char-masterfuria-20261025":"assets/images/masterfuria.png",
  "char-ladyfuria-inicial":"assets/images/ladyfuria.png"
};
var CHARACTER_CLASS_ICONS={
  assassino:"assassin",assassina:"assassin",assassin:"assassin",
  templario:"templar",templaria:"templar",templar:"templar",
  clerigo:"cleric",cleriga:"cleric",cleric:"cleric",
  feiticeiro:"sorcerer",feiticeira:"sorcerer",sorcerer:"sorcerer"
};
function rosterCharacter(characters){return characters.find(function(c){return c.id===rosterSelectedCharacterId})||characters.find(function(c){return c.type==='main'})||characters[0]||null}
function characterClassIcon(c){
  var key=String(c.className||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''),icon=Object.prototype.hasOwnProperty.call(CHARACTER_CLASS_ICONS,key)?CHARACTER_CLASS_ICONS[key]:null;
  return '<span class="avatar character-class-icon" aria-hidden="true" title="Símbolo ilustrativo da classe">'+(icon?'<img src="assets/icons/classes/'+icon+'.svg" width="24" height="24" alt="">':esc(c.name.charAt(0).toUpperCase()))+'</span>';
}
function characterPortrait(c){
  var src=Object.prototype.hasOwnProperty.call(CHARACTER_PORTRAITS,c.id)?CHARACTER_PORTRAITS[c.id]:null;
  return src?'<img class="character-portrait" src="'+src+'" width="512" height="512" alt="Retrato de '+esc(c.name)+'">':'<div class="character-portrait-placeholder">Retrato ainda não adicionado</div>';
}
function focusRosterAction(action,id){
  var root=document.getElementById('character-list');
  if(!root||document.getElementById('characters-page').hidden)return;
  // Closing a modal clears the background's inert state in the UI observer.
  if(root.closest&&root.closest('[inert]')){queueMicrotask(function(){focusRosterAction(action,id)});return}
  var button=Array.from(root.querySelectorAll('[data-action]')).find(function(b){return b.dataset.action===action&&b.dataset.id===id});
  if(button)button.focus({preventScroll:true});
}
function renderCharacterRoster(characters){
  var root=document.getElementById('character-list'),focused=document.activeElement,target=null;
  if(!root)return;
  if(focused&&root.contains&&root.contains(focused))target={character:focused.dataset.rosterCharacter,action:focused.dataset.action,id:focused.dataset.id};
  if(typeof rememberSectionExpansion==='function')rememberSectionExpansion('characters',root);
  var selected=rosterCharacter(characters);
  rosterSelectedCharacterId=selected?selected.id:null;
  var count=document.getElementById('character-roster-count');
  if(count)count.textContent=characters.length+' '+(characters.length===1?'personagem':'personagens')+' · '+characters.filter(function(c){return c.type==='main'}).length+' principal';
  if(!selected){
    root.innerHTML='<div class="empty-state"><div class="empty-icon" aria-hidden="true">♙</div><h3>Nenhum personagem ainda</h3><p>Cadastre seu primeiro personagem para começar a acompanhar sua progressão.</p><button class="button button-primary" type="button" data-action="new">Cadastrar primeiro personagem</button></div>';
    return;
  }
  root.innerHTML='<div class="character-roster-layout"><nav class="character-roster-list" aria-label="Selecionar personagem para consultar a ficha">'+characters.map(function(c){return '<button class="character-roster-choice" type="button" data-roster-character="'+esc(c.id)+'" aria-controls="character-detail" aria-pressed="'+(c.id===selected.id)+'">'+characterClassIcon(c)+'<span class="character-roster-name"><strong>'+esc(c.name)+'</strong><small>'+esc(c.className)+'</small>'+(c.type==='main'?'<span class="main-badge">Principal</span>':'')+'</span></button>'}).join('')+'</nav><div id="character-detail" role="region" aria-labelledby="character-detail-title">'+card(selected)+'</div></div>';
  if(typeof restoreSectionExpansion==='function')restoreSectionExpansion('characters',root);
  root.querySelectorAll('[data-roster-character]').forEach(function(button){button.onclick=function(){rosterSelectedCharacterId=button.dataset.rosterCharacter;renderApp()}});
  if(target){
    var buttons=Array.from(root.querySelectorAll('[data-roster-character],[data-action]'));
    var replacement=buttons.find(function(b){return target.character?b.dataset.rosterCharacter===target.character:b.dataset.action===target.action&&b.dataset.id===target.id});
    if(!replacement)replacement=buttons.find(function(b){return b.dataset.rosterCharacter===selected.id});
    if(replacement)replacement.focus({preventScroll:true});
  }
}
