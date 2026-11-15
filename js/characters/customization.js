// Optional personal fields. Missing fields keep the existing built-in defaults.
var CHARACTER_ICON_CHOICES=['auto','initial','assassin','templar','cleric','sorcerer'];
var characterCustomizationDraft=null;
function characterWebLink(value){
  if(typeof value!=='string'||value.length>2048)return false;
  if(value==='')return true;
  if(!/^https?:\/\/[^\s<>"\\]+$/i.test(value))return false;
  try{var parsed=new URL(value);return (parsed.protocol==='https:'||parsed.protocol==='http:')&&!!parsed.hostname}catch(error){return false}
}
function characterImageValue(value,limit){return value===null||value===''||typeof value==='string'&&value.length<=limit&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)}
function validateCharacterCustomization(c){
  ['guideUrl','profileUrl','kiskUrl'].forEach(function(key){if(c[key]!==undefined&&!characterWebLink(c[key]))throw Error('Use um link completo http:// ou https:// para Guia, Perfil e Kisk.');});
  if(c.portraitData!==undefined&&!characterImageValue(c.portraitData,250000))throw Error('Retrato do personagem inválido.');
  if(c.classIconData!==undefined&&!characterImageValue(c.classIconData,40000))throw Error('Imagem do ícone inválida.');
  if(c.classIcon!==undefined&&CHARACTER_ICON_CHOICES.indexOf(c.classIcon)<0)throw Error('Ícone da classe inválido.');
}
A2.extensions.register('character-customization','prepareState',function(previous){return function(data){var next=previous(data);next.characters.forEach(validateCharacterCustomization);return next};});
function characterCustomizationPreview(){
  var draft=characterCustomizationDraft;if(!draft)return;
  var c=Object.assign({},draft.character,{name:document.getElementById('character-name').value.trim()||'Personagem',className:document.getElementById('character-class').value,portraitData:draft.portraitData,classIcon:draft.classIcon,classIconData:draft.classIconData});
  document.getElementById('character-portrait-preview').innerHTML=characterPortrait(c);
  document.getElementById('character-icon-preview').innerHTML=characterClassIcon(c);
}
function characterCustomizationError(message){var error=document.getElementById('character-custom-error');error.textContent=message;if(message)error.focus()}
async function characterReadImage(file,size){
  if(!file||!/^image\/(png|jpeg|webp)$/.test(file.type))throw Error('Escolha uma imagem PNG, JPG ou WebP.');
  if(file.size>8*1024*1024)throw Error('Escolha uma imagem de até 8 MB.');
  var data=await new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(reader.result)};reader.onerror=function(){reject(Error('Não foi possível ler a imagem.'))};reader.readAsDataURL(file)});
  var img=await new Promise(function(resolve,reject){var image=new Image();image.onload=function(){resolve(image)};image.onerror=function(){reject(Error('Não foi possível abrir a imagem.'))};image.src=data});
  var canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;var context=canvas.getContext('2d'),side=Math.min(img.naturalWidth,img.naturalHeight);
  context.drawImage(img,(img.naturalWidth-side)/2,(img.naturalHeight-side)/2,side,side,0,0,size,size);
  var result=canvas.toDataURL('image/webp',0.82);if(result.length>(size===512?250000:40000))throw Error('A imagem ficou grande demais. Escolha uma imagem mais simples.');return result;
}
function characterUploadCustomization(kind,input){
  if(!input.files[0])return;var draft=characterCustomizationDraft,request={};draft.requests[kind]=request;draft.pending++;
  document.querySelector('#character-form button[type=submit]').disabled=true;characterCustomizationError('');
  document.getElementById('character-image-status').textContent='Preparando imagem…';
  characterReadImage(input.files[0],kind==='portraitData'?512:96).then(function(data){if(characterCustomizationDraft!==draft||draft.requests[kind]!==request)return;draft[kind]=data;characterCustomizationPreview()}).catch(function(error){if(characterCustomizationDraft===draft&&draft.requests[kind]===request)characterCustomizationError(error.message)}).finally(function(){draft.pending--;if(characterCustomizationDraft===draft){document.querySelector('#character-form button[type=submit]').disabled=draft.pending>0;document.getElementById('character-image-status').textContent=draft.pending?'Preparando imagem…':'Salve o personagem para aplicar as alterações.'}});
}
function readCharacterCustomization(c){
  var draft=characterCustomizationDraft;if(!draft)return;
  if(draft.pending)throw Error('Aguarde a preparação da imagem antes de salvar.');
  var guide=document.getElementById('character-guide-url'),profile=document.getElementById('character-profile-url'),kisk=document.getElementById('character-kisk-url');
  c.guideUrl=guide.value.trim();c.profileUrl=profile.value.trim();c.kiskUrl=kisk.value.trim();c.portraitData=draft.portraitData;c.classIcon=draft.classIcon;c.classIconData=draft.classIconData;
  [guide,profile,kisk].forEach(function(field){field.removeAttribute('aria-invalid');field.removeAttribute('aria-describedby')});
  [guide,profile,kisk].forEach(function(field){if(!characterWebLink(field.value.trim())){field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby','character-custom-error');throw Error('Use um link completo http:// ou https:// em '+(field===guide?'Guia':field===profile?'Perfil':'Kisk')+'.')}});
  validateCharacterCustomization(c);
}
A2.extensions.register('character-customization','openModal',function(previous){return function(id){
  previous(id);var customization=document.getElementById('character-customization');if(!customization||!customization.ownerDocument)return;
  var c=AION_STATE.data.characters.find(function(x){return x.id===id})||{id:'',name:'Personagem',className:''};
  characterCustomizationDraft={character:c,portraitData:c.portraitData===undefined?null:c.portraitData,classIcon:c.classIcon||'auto',classIconData:c.classIconData||null,pending:0,requests:{}};
  document.getElementById('character-guide-url').value=c.guideUrl!==undefined?c.guideUrl:characterGuideUrl(c.name)||'';
  document.getElementById('character-profile-url').value=c.profileUrl!==undefined?c.profileUrl:characterProfileUrl(c,AION_STATE.data.characters)||'';
  document.getElementById('character-kisk-url').value=c.kiskUrl!==undefined?c.kiskUrl:characterProfileUrl(c,AION_STATE.data.characters)||'https://kisk.app/';
  document.getElementById('character-class-icon').value=characterCustomizationDraft.classIcon;
  document.getElementById('character-customization').open=false;characterCustomizationError('');
  document.getElementById('character-image-status').textContent='';document.querySelector('#character-form button[type=submit]').disabled=false;
  ['character-guide-url','character-profile-url','character-kisk-url'].forEach(function(id){document.getElementById(id).removeAttribute('aria-invalid');document.getElementById(id).removeAttribute('aria-describedby')});
  characterCustomizationPreview();
};});
A2.lifecycle.register('character-customization',function(){
  var details=document.createElement('details');details.id='character-customization';details.className='character-customization';
  details.innerHTML='<summary>Imagem, links e ícone</summary><fieldset><legend>Imagem do personagem</legend><div id="character-portrait-preview" class="character-image-preview"></div><label>Enviar retrato<input id="character-portrait-file" type="file" accept="image/png,image/jpeg,image/webp"></label><p>PNG, JPG ou WebP de até 8 MB. O recorte quadrado é centralizado e a imagem é reduzida para salvar no navegador e no backup.</p><div class="plan-toolbar"><button type="button" id="character-portrait-remove" class="button button-ghost">Remover imagem</button><button type="button" id="character-portrait-default" class="button button-ghost">Usar imagem padrão</button></div></fieldset><fieldset><legend>Guia, Perfil e Kisk</legend><label>Link do Guia<input id="character-guide-url" type="text" inputmode="url" placeholder="https://…" maxlength="2048"></label><label>Link do Perfil<input id="character-profile-url" type="text" inputmode="url" placeholder="https://…" maxlength="2048"></label><label>Link do Kisk<input id="character-kisk-url" type="text" inputmode="url" placeholder="https://kisk.app/…" maxlength="2048"></label><p>Deixe vazio para ocultar o botão. Os links abrem em uma nova aba.</p><button type="button" id="character-links-default" class="button button-ghost">Restaurar links padrão</button></fieldset><fieldset><legend>Ícone na listagem</legend><div id="character-icon-preview"></div><label>Ícone da classe<select id="character-class-icon"><option value="auto">Automático pela classe</option><option value="initial">Inicial do nome</option><option value="assassin">Assassino</option><option value="templar">Templário</option><option value="cleric">Clérigo</option><option value="sorcerer">Feiticeiro</option></select></label><label>Ou enviar ícone personalizado<input id="character-icon-file" type="file" accept="image/png,image/jpeg,image/webp"></label><button type="button" id="character-icon-remove" class="button button-ghost">Remover ícone enviado</button></fieldset><p id="character-image-status" role="status"></p><p id="character-custom-error" class="form-error" role="alert" tabindex="-1"></p>';
  document.getElementById('character-form').insertBefore(details,document.getElementById('form-error'));
  ['character-name','character-class'].forEach(function(id){document.getElementById(id).addEventListener('input',characterCustomizationPreview)});
  document.getElementById('character-portrait-file').onchange=function(){characterUploadCustomization('portraitData',this)};
  document.getElementById('character-icon-file').onchange=function(){characterUploadCustomization('classIconData',this)};
  function setImage(key,value){var draft=characterCustomizationDraft;draft.requests[key]={};draft[key]=value;characterCustomizationPreview()}
  document.getElementById('character-portrait-remove').onclick=function(){setImage('portraitData','')};
  document.getElementById('character-portrait-default').onclick=function(){setImage('portraitData',null)};
  document.getElementById('character-icon-remove').onclick=function(){setImage('classIconData',null)};
  document.getElementById('character-class-icon').onchange=function(){characterCustomizationDraft.classIcon=this.value;setImage('classIconData',null)};
  document.getElementById('character-links-default').onclick=function(){var c=characterCustomizationDraft.character;document.getElementById('character-guide-url').value=characterGuideUrl(c.name)||'';document.getElementById('character-profile-url').value=characterProfileUrl(c,AION_STATE.data.characters)||'';document.getElementById('character-kisk-url').value=characterProfileUrl(c,AION_STATE.data.characters)||'https://kisk.app/'};
});
