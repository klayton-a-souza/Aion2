// Configuração visual: não é persistida nem cria personagens.
var CHARACTER_GUIDES={
  l0rdfuria:"https://aion2.gaming.tools/pt-br/builds/assassin/leveling",
  warri0rlord:"https://aion2.gaming.tools/pt-br/builds/templar/leveling",
  warriorl0rd:"https://aion2.gaming.tools/pt-br/builds/templar/leveling",
  ladyfuria:"https://aion2.gaming.tools/pt-br/builds/cleric/leveling"
};
function characterGuideUrl(name){var key=String(name||"").trim().toLowerCase();return Object.prototype.hasOwnProperty.call(CHARACTER_GUIDES,key)?CHARACTER_GUIDES[key]:null}
// Aliases explícitos fornecidos para o mesmo perfil; nunca usa busca aproximada.
var CHARACTER_SHUGO_PROFILES=[
  {names:["l0rdfuria"],url:"https://shugo.gg/character/global/la-triniel/L0rdFuria"},
  {names:["warri0rlord","warriorl0rd"],url:"https://shugo.gg/character/global/la-triniel/WarriorL0rd"},
  {names:["ladyfuria"],url:"https://shugo.gg/character/global/la-triniel/LadyFuria"}
];
function characterShugoUrl(c,characters){function key(name){return String(name||"").trim().toLowerCase()}var profile=CHARACTER_SHUGO_PROFILES.find(function(p){return p.names.indexOf(key(c.name))>=0});if(!profile)return null;if((characters||[]).filter(function(x){return profile.names.indexOf(key(x.name))>=0}).length>1)return null;return profile.url}
