function renderCharacterDashboard(){
  var summary=document.getElementById('character-summary');
  if(!summary)return;
  rememberSectionExpansion('character-dashboard',summary);
  var c=interfaceCharacter(),chars=AION_STATE.data.characters,p=c?activePlan('character',c.id):null;
  var html='<article class="summary-card active-character-panel"><label class="dashboard-selector">Personagem ativo<select id="dashboard-character"'+(!chars.length?' disabled':'')+'>'+(!chars.length?'<option>Nenhum personagem cadastrado</option>':chars.map(function(x){return '<option value="'+esc(x.id)+'">'+esc(x.name)+' · '+esc(x.className)+' · iLvl '+(Number.isFinite(x.ilevel)?x.ilevel:'—')+'</option>'}).join(''))+'</select></label>';
  html+=c?'<div class="active-character-heading"><div><h2>'+esc(c.name||'Personagem')+'</h2><p>'+esc(c.className||'Classe não informada')+' · '+(c.type==='main'?'Principal':'Alternativo')+'</p></div><div class="active-character-level"><span>ITEM LEVEL</span><strong>'+(Number.isFinite(c.ilevel)?c.ilevel:'—')+'</strong></div></div>':'<p>Cadastre seu primeiro personagem para começar.</p>';
  if(c){
    html+='<section class="active-character-plan">';
    if(p){
      var stats=planStats(p.stages),next=nextPlanObjective(p);
      if(next){
        html+='<div class="current-stage-highlight next-action-panel" aria-labelledby="dashboard-next-title"><p class="eyebrow">PRÓXIMO OBJETIVO</p><h3 id="dashboard-next-title" class="current-stage-next" aria-label="Próximo objetivo: '+esc(next.objective.description)+'">'+esc(next.objective.description)+'</h3><p class="current-stage-title">Etapa atual: '+esc(next.stage.title)+'</p><button id="dashboard-next-objective" class="button button-primary" type="button" data-plan="'+esc(p.id)+'" data-next-objective="'+esc(next.objective.id)+'" aria-describedby="dashboard-next-title">Marcar como concluído</button>';
        if(next.stage.description||next.objective.details){
          html+='<details class="dashboard-guidance" data-expansion-id="guidance-'+esc(p.id)+'-'+esc(next.stage.id)+'-'+esc(next.objective.id)+'"><summary>Detalhes e orientações</summary>';
          if(next.stage.description)html+='<p>'+esc(next.stage.description)+'</p>';
          if(next.objective.details)html+='<p>'+esc(next.objective.details)+'</p>';
          html+='</details>';
        }
        html+='</div>';
      }else html+='<p id="dashboard-next-status" class="next-action-status" tabindex="-1">'+(stats.total?'Todos os objetivos concluídos. Finalize explicitamente o plano na área de Progressão.':'Adicione etapas e objetivos na página de Progressão.')+'</p>';
      html+='<div class="active-plan-context"><h3>Plano de evolução</h3><h4>'+esc(p.title)+'</h4>'+progressBar(stats);
      if(p.description)html+='<details class="dashboard-description" data-expansion-id="description-'+esc(p.id)+'"><summary>Descrição do plano</summary><p>'+esc(p.description)+'</p></details>';
      html+='</div>';
    }else html+='<p>Este personagem ainda não possui um plano de evolução ativo.</p>';
    html+='</section>';
  }
  html+='<div class="active-character-actions">'+(c?'<a href="#progression" id="character-panel-progress" class="button button-ghost">Acessar Progressão</a>':'')+'<a href="#characters" class="button button-ghost">Ver personagens</a></div></article>';
  summary.innerHTML=html;
  restoreSectionExpansion('character-dashboard',summary);
  var selector=document.getElementById('dashboard-character');selector.value=c?c.id:'';
  selector.onchange=function(){selectInterfaceCharacter(selector.value)};
  var progress=document.getElementById('character-panel-progress');
  if(progress)progress.onclick=function(){progressionFilter='active-character';selectedPlanId=null;renderProgress()};
  var nextButton=document.getElementById('dashboard-next-objective');
  if(nextButton)nextButton.onclick=function(){completeNextDashboardObjective(nextButton.dataset.plan,nextButton.dataset.nextObjective)};
}
function completeNextDashboardObjective(planId,objectiveId){
  var c=interfaceCharacter(),p=c?activePlan('character',c.id):null,next=p?nextPlanObjective(p):null;
  if(!next||p.id!==planId||next.objective.id!==objectiveId)return false;
  return changePlans(function(){setObjectiveDone(planId,objectiveId,true)});
}
function dashboardPlanHtml(c){if(!c)return '<h3>Progressão</h3><p>Cadastre um personagem para acompanhar sua progressão.</p>';var p=activePlan('character',c.id);if(!p)return '<h3>Progressão de '+esc(c.name)+'</h3><p>Este personagem ainda não possui um plano de progressão ativo.</p><div class="plan-toolbar"><button type="button" id="dashboard-create-plan">Criar plano</button><button type="button" id="dashboard-manage-plan">Ativar rascunho existente</button><button type="button" id="dashboard-link-plan">Vincular plano existente</button></div>';var stats=planStats(p.stages),next=nextPlanObjective(p);var html='<h3>Checklist de progressão</h3>';p.stages.forEach(function(s){html+='<details class="stage-panel" data-expansion-id="'+esc(s.id)+'"><summary>'+esc(s.title)+' · '+planStats([s]).percent+'%</summary>';s.objectives.forEach(function(o){html+='<label class="dashboard-check"><input type="checkbox" data-dashboard-objective="'+esc(o.id)+'" data-plan="'+esc(p.id)+'"'+(o.done?' checked':'')+'><span>'+esc(o.description)+(o.details?'<small>'+esc(o.details)+'</small>':'')+'</span></label>'});html+='</details>'});html+='<div class="plan-toolbar"><button type="button" id="dashboard-manage-plan">Acessar Progressão</button>'+(stats.total&&stats.done===stats.total?'<button type="button" id="dashboard-complete-plan" data-id="'+esc(p.id)+'">Concluir planejamento</button>':'')+'</div>';return html}
function dashboardActivityHtml(c){
  if(!c)return '<h3>Atividades recorrentes</h3><p>Cadastre um personagem para acompanhar suas atividades.</p>';
  var all=AION_STATE.data.activities.filter(function(a){return a.active&&(a.scope==='account'||a.characterId===c.id)}),html='<h3>Atividades de '+esc(c.name)+'</h3>';
  if(!all.length)html+='<p>Não existem atividades recorrentes configuradas para este personagem.</p>';
  ['daily','weekly'].forEach(function(f){
    html+='<section class="dashboard-activity-group" aria-labelledby="dashboard-frequency-'+f+'"><div class="dashboard-activity-heading"><h4 id="dashboard-frequency-'+f+'">'+(f==='daily'?'Diárias':'Semanais')+'</h4>'+activityVisibilityButton('dashboard',f)+'</div>'+progressBar(activityStats(f,c.id))+'<div id="dashboard-activity-list-'+f+'"'+(activityVisibility.dashboard[f]?' hidden':'')+'>';
    var items=all.filter(function(a){return a.frequency===f});
    items.forEach(function(a){html+='<label class="dashboard-check"><input type="checkbox" data-dashboard-activity="'+esc(a.id)+'"'+(activityDone(a)?' checked':'')+'><span>'+esc(a.name)+'<small>'+esc(a.scope==='account'?'Conta compartilhada':c.name)+(a.category?' · '+esc(a.category):'')+'</small>'+(a.description?'<small>'+esc(a.description)+'</small>':'')+'</span></label>'});
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
function renderDashboard(){if(!document.getElementById('progress-summary'))return;var focus=rememberDashboardFocus();rememberSectionExpansion('dashboard',document.getElementById('progress-summary'));renderCharacterDashboard();var c=interfaceCharacter();document.getElementById('progress-summary').innerHTML=dashboardPlanHtml(c);restoreSectionExpansion('dashboard',document.getElementById('progress-summary'));document.getElementById('activities-summary').innerHTML=dashboardActivityHtml(c);var manage=document.getElementById('dashboard-manage-plan');if(manage)manage.onclick=function(){progressionFilter='active-character';selectedPlanId=null;renderProgress();showPage(true)};var create=document.getElementById('dashboard-create-plan');if(create)create.onclick=function(){progressionFilter='active-character';planForm(null,false)};var complete=document.getElementById('dashboard-complete-plan');if(complete)complete.onclick=function(){handlePlanAction('complete',complete.dataset.id)};var activities=document.getElementById('dashboard-open-activities');if(activities)activities.onclick=function(){activityFilters.character=c.id;showActivities();renderActivities()};var catalog=document.getElementById('dashboard-open-catalog');if(catalog)catalog.onclick=openCatalog;
bindActivityVisibility('dashboard');
var link=document.getElementById("dashboard-link-plan");if(link)link.onclick=function(){progressionFilter="all";selectedPlanId=null;renderProgress();showPage(true)};
document.querySelectorAll('[data-dashboard-objective]').forEach(function(input){input.onchange=function(){changePlans(function(){setObjectiveDone(input.dataset.plan,input.dataset.dashboardObjective,input.checked)})}});document.querySelectorAll('[data-dashboard-activity]').forEach(function(input){input.onchange=function(){activityMutation(function(){toggleActivity(input.dataset.dashboardActivity,input.checked)})}});restoreDashboardFocus(focus)}
var dashboardPreviousRender=renderApp;renderApp=function(){var focus=rememberDashboardFocus();rememberSectionExpansion('character-dashboard',document.getElementById('character-summary'));if(AION_STATE.data&&syncActiveCharacter())saveState();dashboardPreviousRender();renderDashboard();restoreDashboardFocus(focus)};
document.addEventListener('DOMContentLoaded',renderDashboard);
