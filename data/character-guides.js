// Links fornecidos pelo usuário: não são persistidos nem criam personagens.
// Os destinos de Guia e Perfil de LadyFuria seguem literalmente a solicitação.
var CHARACTER_LINKS=[
  {names:["l0rdfuria"],guide:"https://aion2.gaming.tools/pt-br/builds/assassin/pve",profile:"https://aion2index.com/c/la/triniel/L0rdFuria"},
  {names:["warriorl0rd","warri0rlord"],guide:"https://aion2.gaming.tools/pt-br/builds/templar/pve",profile:"https://aion2index.com/c/la/triniel/WarriorL0rd"},
  {names:["ladyfuria"],guide:"https://aion2index.com/c/la/triniel/LadyFuria",profile:"https://aion2.gaming.tools/pt-br/builds/cleric/pve"},
  {names:["mästerfuria"],guide:"https://aion2.gaming.tools/pt-br/builds/sorcerer/pve",profile:"https://aion2index.com/c/la/triniel/M%C3%A4sterFuria"}
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
