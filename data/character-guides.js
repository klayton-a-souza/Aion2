// Links fornecidos pelo usuário: não são persistidos nem criam personagens.
// Guia aponta para a build; Perfil aponta para a página do personagem.
var CHARACTER_LINKS=[
  {names:["l0rdfuria"],guide:"https://aion2.gaming.tools/pt-br/builds/assassin/pve",profile:"https://kisk.app/c/la/triniel/L0rdFuria/gear"},
  {names:["warriorl0rd","warri0rlord"],guide:"https://aion2.gaming.tools/pt-br/builds/templar/pve",profile:"https://kisk.app/c/la/triniel/WarriorL0rd/gear"},
  {names:["ladyfuria"],guide:"https://aion2.gaming.tools/pt-br/builds/cleric/pve",profile:"https://kisk.app/c/la/triniel/LadyFuria/gear"},
  {names:["mästerfuria"],guide:"https://aion2.gaming.tools/pt-br/builds/sorcerer/pve",profile:"https://kisk.app/c/la/triniel/M%C3%A4sterFuria/gear"}
];
function characterLinkKey(name){return String(name||"").trim().toLowerCase().normalize("NFC")}
function characterLinkConfig(name){var key=characterLinkKey(name);return CHARACTER_LINKS.find(function(link){return link.names.indexOf(key)>=0})||null}
function characterGuideUrl(name){var link=characterLinkConfig(name);return link?link.guide:null}
function characterProfileUrl(c,characters){
  var link=characterLinkConfig(c.name);
  if(!link)return null;
  if((characters||[]).filter(function(x){return link.names.indexOf(characterLinkKey(x.name))>=0}).length>1)return null;
  return link.profile;
}
