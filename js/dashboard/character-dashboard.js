function renderCharacterDashboard(){var root=document.getElementById('character-summary');if(root)root.hidden=true;}
function dashboardActivityHtml(c){
  if(!c)return '<h3>Atividades recorrentes</h3><p>Cadastre um personagem para acompanhar suas atividades.</p>';
  var all=AION_STATE.data.activities.filter(function(a){return a.active&&(a.scope==='account'||a.characterId===c.id)}),html='<h3>Atividades de '+esc(c.name)+'</h3>';
  if(!all.length)html+='<p>Não existem atividades recorrentes configuradas para este personagem.</p>';
  ['daily','weekly'].forEach(function(f){
    html+='<section class="dashboard-activity-group" aria-labelledby="dashboard-frequency-'+f+'"><div class="dashboard-activity-heading"><h4 id="dashboard-frequency-'+f+'">'+(f==='daily'?'Diárias':'Semanais')+'</h4>'+activityVisibilityButton('dashboard',f)+'</div>'+progressBar(activityStats(f,c.id))+'<div id="dashboard-activity-list-'+f+'"'+(activityVisibility.dashboard[f]?' hidden':'')+'>';
    var items=characterActivitiesFirst(all.filter(function(a){return a.frequency===f}));
    items.forEach(function(a,index){if(index===0||items[index-1].scope!==a.scope)html+='<h5 class="activity-scope-heading">'+(a.scope==='character'?'Por personagem':'Conta compartilhada')+'</h5>';html+='<label class="dashboard-check"><input type="checkbox" data-dashboard-activity="'+esc(a.id)+'"'+(activityDone(a)?' checked':'')+'><span>'+esc(a.name)+'<small>'+esc(a.scope==='account'?'Conta compartilhada':c.name)+(a.category?' · '+esc(a.category):'')+'</small>'+(a.description?'<small>'+esc(a.description)+'</small>':'')+'</span></label>'});
    if(!items.length)html+='<p>Nenhuma atividade ativa nesta frequência.</p>';
    html+='</div></section>';
  });
  return html+'<div class="plan-toolbar"><button type="button" id="dashboard-open-activities">Acessar Atividades</button><button type="button" id="dashboard-open-catalog">Adicionar do catálogo</button></div>';
}
// These regions are replaced on updates. Restore the same logical control so
// keyboard users can continue through the checklist after changing an item.
function rememberDashboardFocus(){
  var focused=document.activeElement;
  if(!focused||!focused.closest||!focused.closest('#character-summary,#progress-summary,#activities-summary'))return null;
  if(focused.id)return {id:focused.id};
  if(focused.tagName==='SUMMARY'&&focused.parentElement.dataset.expansionId)return {attribute:'data-expansion-id',value:focused.parentElement.dataset.expansionId,summary:true};
  if(focused.dataset.dashboardObjective)return {attribute:'data-dashboard-objective',value:focused.dataset.dashboardObjective};
  if(focused.dataset.dashboardActivity)return {attribute:'data-dashboard-activity',value:focused.dataset.dashboardActivity};
  return null;
}
function restoreDashboardFocus(target){
  if(!target)return;
  // A newly opened dialog owns focus until it closes.
  if(document.querySelector('.modal-backdrop:not([hidden])'))return;
  var control=target.id?document.getElementById(target.id):Array.from(document.querySelectorAll('['+target.attribute+']')).find(function(input){return input.getAttribute(target.attribute)===target.value});
  if(!control&&target.id==='dashboard-next-objective')control=document.getElementById('dashboard-next-status');
  if(control&&target.summary)control=control.querySelector('summary');
  if(control&&!control.disabled&&control.getClientRects().length)control.focus({preventScroll:true});
}
function renderDashboard(){
 var root=document.getElementById('activities-summary');if(!root)return;
 var focus=rememberDashboardFocus(),c=interfaceCharacter();renderCharacterDashboard();
 var legacy=document.getElementById('progress-summary');if(legacy){legacy.hidden=true;legacy.innerHTML=""}
 root.innerHTML=dashboardActivityHtml(c);
 var activities=document.getElementById('dashboard-open-activities');if(activities)activities.onclick=function(){activityFilters.character=c.id;showActivities();renderActivities()};
 var catalog=document.getElementById('dashboard-open-catalog');if(catalog)catalog.onclick=openCatalog;
 bindActivityVisibility('dashboard');root.querySelectorAll('[data-dashboard-activity]').forEach(function(input){input.onchange=function(){activityMutation(function(){toggleActivity(input.dataset.dashboardActivity,input.checked)})}});restoreDashboardFocus(focus);
}
A2.extensions.register("dashboard","renderApp",function(dashboardPreviousRender){return function(){var focus=rememberDashboardFocus();rememberSectionExpansion('character-dashboard',document.getElementById('character-summary'));if(AION_STATE.data&&syncActiveCharacter())saveState();dashboardPreviousRender();renderDashboard();restoreDashboardFocus(focus)};});
A2.lifecycle.register("dashboard",renderDashboard);
