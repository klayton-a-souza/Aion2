// Overview uses character attributes and automatic CP targets; legacy plans remain in backups.
function accountCharacterProgress(c){var goal=cpDesiredTarget(c);return {character:c,ilevel:null,combatPower:goal.target===null?null:{target:goal.target}}}
function accountNumber(value){return formatCombatPower(value)}
function accountMetric(v,key,label){var actual=v.character[key],objective=v[key],target=objective?objective.target:null,percent=actual!=null&&target!=null?Math.max(0,Math.min(actual<target?99:100,target===0?100:Math.round(actual/target*100))):null;
  return '<div class="account-metric" data-account-metric="'+key+'"><div class="account-metric-label"><span>'+label+'</span><span>'+(target===null?(key==='ilevel'?'Atributo atual':'Referência indisponível'):'Meta '+accountNumber(target))+'</span></div><strong>'+accountNumber(actual)+'</strong>'+(percent===null?'<p class="account-no-target">'+(actual==null?'Preencha em Personagens.':'Acompanhe a evolução em Personagens.')+'</p>':'<div class="account-meter" role="progressbar" aria-label="'+esc(label+' de '+v.character.name+' em relação à meta')+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'" aria-valuetext="'+esc(accountNumber(actual)+' de '+accountNumber(target))+'"><span style="width:'+percent+'%"></span></div><small>'+percent+'% da meta'+(actual>=target?' · Valor atingido':'')+'</small>')+'</div>';
}

function accountCharacterCard(v){var c=v.character,comparison=compareCombatPower(c,AION_STATE.data.cpAssessment);return '<article class="account-character '+(c.type==='main'?'account-main':'account-alt')+'" data-account-character="'+esc(c.id)+'"><header><div><p class="eyebrow">'+(c.type==='main'?'PERSONAGEM PRINCIPAL':'PERSONAGEM ALTERNATIVO')+'</p><h3>'+esc(c.name)+'</h3><p class="account-class">'+esc(c.className)+'</p></div><span class="account-state">'+esc(comparison.label)+'</span></header><div class="account-metrics">'+accountMetric(v,'ilevel','iLvl')+accountMetric(v,'combatPower','Poder de Combate')+'</div><p class="account-cp-note">Meta de CP automática conforme a referência da faixa de iLvl. Consulte os critérios na análise.</p><footer><a class="button button-ghost" href="#characters" data-account-detail="'+esc(c.id)+'">Analisar personagem<span class="visually-hidden"> '+esc(c.name)+'</span></a></footer></article>'}
const accountRoutineView = {frequency: 'daily', pendingOnly: false};

function accountRoutineRows(frequency, pendingOnly) {
  const groups = new Map();
  for (const activity of AION_STATE.data.activities) {
    if (!activity.active || activity.frequency !== frequency) continue;
    // Linked copies can be renamed individually. Keep each saved label visible.
    const identity = activity.catalogId || activity.routineGroup || activity.id;
    const key = JSON.stringify([activity.catalogId ? 'catalog' : 'custom', identity, activity.name]);
    if (!groups.has(key)) groups.set(key, {name: activity.name, pending: [], done: []});
    const group = groups.get(key);
    const owners = activityDone(activity) ? group.done : group.pending;
    owners.push(activityOwner(activity));
  }
  return Array.from(groups.values()).filter(group => !pendingOnly || group.pending.length);
}

function accountRoutineRow(group) {
  const total = group.done.length + group.pending.length;
  const pending = group.pending.length
    ? `<span><b class="routine-pending"><span aria-hidden="true">◷</span> Pendente</b> · ${esc(group.pending.join(', '))}</span>` : '';
  const done = group.done.length && !accountRoutineView.pendingOnly
    ? `<span><b class="routine-done"><span aria-hidden="true">✓</span> Concluído</b> · ${esc(group.done.join(', '))}</span>` : '';
  return `<li>
    <div class="routine-row-heading"><strong>${esc(group.name)}</strong><span class="routine-count">${group.done.length}/${total}<span class="visually-hidden"> concluídas</span></span></div>
    <div class="routine-owners">${pending}${done}</div>
  </li>`;
}

function renderAccountRoutineList(panel, stats) {
  const {frequency, pendingOnly} = accountRoutineView;
  const rows = accountRoutineRows(frequency, pendingOnly);
  const empty = stats[frequency].total ? 'Todas as atividades deste ciclo foram concluídas.' : 'Nenhuma atividade ativa nesta frequência.';
  panel.querySelectorAll('[data-routine-frequency]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.routineFrequency === frequency));
  });
  panel.querySelector('h3').textContent = frequency === 'daily' ? 'Atividades diárias' : 'Atividades semanais';
  panel.querySelector('#account-routine-results').innerHTML = rows.length
    ? `<ul>${rows.map(accountRoutineRow).join('')}</ul>` : `<p class="account-empty">${empty}</p>`;
}

function mountAccountRoutineOverview(panel) {
  const stats = {daily: activityStats('daily'), weekly: activityStats('weekly')};
  const completed = stats.daily.done + stats.weekly.done;
  const total = stats.daily.total + stats.weekly.total;
  const characters = AION_STATE.data.characters.length;
  const choices = Object.entries(stats).map(([frequency, cycle]) => {
    const daily = frequency === 'daily';
    return `<button type="button" class="routine-cycle" id="account-routine-${frequency}" data-routine-frequency="${frequency}" aria-controls="account-routine-results">
      <span class="routine-cycle-name"><span aria-hidden="true">${daily ? '☼' : '▦'}</span> ${daily ? 'Diárias' : 'Semanais'}</span>
      <span class="routine-cycle-count"><strong>${cycle.done}</strong> de ${cycle.total} concluídas</span>
      <span class="account-meter" aria-hidden="true"><span style="width:${cycle.percent}%"></span></span>
    </button>`;
  }).join('');
  panel.innerHTML = `
      <p class="eyebrow">ATIVIDADES RECORRENTES</p>
      <h2 id="account-routine-title" tabindex="-1">Visão geral da conta</h2>
      <p class="routine-totals"><strong>${completed} de ${total}</strong> concluídas nos ciclos atuais · ${characters} ${characters === 1 ? 'personagem' : 'personagens'}</p>
      <div class="routine-cycles" role="group" aria-label="Escolher frequência">${choices}</div>
      <div class="routine-toolbar"><h3></h3><label><input type="checkbox" id="account-routine-pending" ${accountRoutineView.pendingOnly ? 'checked' : ''}> Só pendentes</label></div>
      <div id="account-routine-results" aria-live="polite"></div>`;
  panel.querySelectorAll('[data-routine-frequency]').forEach(button => {
    button.onclick = () => {
      accountRoutineView.frequency = button.dataset.routineFrequency;
      renderAccountRoutineList(panel, stats);
    };
  });
  panel.querySelector('input').onchange = event => {
    accountRoutineView.pendingOnly = event.target.checked;
    renderAccountRoutineList(panel, stats);
  };
  renderAccountRoutineList(panel, stats);
}

function renderAccountDashboard(){var root=document.getElementById('account-dashboard');if(!root)return;var focusId=root.contains&&root.contains(document.activeElement)?document.activeElement.id:null;
var chars=AION_STATE.data.characters,main=chars.find(c=>c.type==='main'),alts=chars.filter(c=>c!==main),active=interfaceCharacter();
root.innerHTML='<section class="account-summary"><div class="account-summary-heading"><div><p class="eyebrow">SUA CONTA</p><h2>Seus personagens em foco</h2><p>Acompanhe os atributos, a análise de CP e as atividades.</p><div class="account-routine-shortcuts"><button type="button" class="button button-ghost" id="account-show-routine">Ver progresso da conta</button><button type="button" class="button button-ghost" id="account-quick-activities">Abrir atividades diárias</button></div></div><a class="account-text-link" href="#characters">Gerenciar personagens ↗</a></div><dl class="account-totals"><div><dt>Personagens</dt><dd>'+chars.length+'</dd></div><div><dt>Principal</dt><dd>'+esc(main?main.name:'Não definido')+'</dd></div></dl></section>'+(main?'<section><h2 class="account-section-title">Personagem principal</h2>'+accountCharacterCard(accountCharacterProgress(main))+'</section>':'<section class="account-panel"><h2>Principal não definido</h2><p>Cadastre um personagem ou defina o principal em Personagens.</p></section>')+'<section><h2 class="account-section-title">Personagens secundários</h2>'+(alts.length?'<div class="account-alt-grid">'+alts.map(c=>accountCharacterCard(accountCharacterProgress(c))).join('')+'</div>':'<p class="account-empty">Nenhum personagem secundário cadastrado.</p>')+'</section><section class="account-panel account-events"><h2>Próximos eventos</h2></section><section class="account-panel" id="account-routine-overview" aria-labelledby="account-routine-title"></section><section class="account-context"><label for="account-character">Personagem ativo das atividades</label><select id="account-character"'+(!chars.length?' disabled':'')+'>'+(!chars.length?'<option>Nenhum personagem cadastrado</option>':chars.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join(''))+'</select><button type="button" class="button button-ghost" id="account-open-checklists">Abrir atividades</button></section>';
mountAccountRoutineOverview(document.getElementById('account-routine-overview'));
const routineShortcut = document.getElementById('account-show-routine');
routineShortcut.onclick = () => {
  document.getElementById('account-routine-title').focus({preventScroll:true});
  document.getElementById('account-routine-overview').scrollIntoView({block:'start'});
};
if(active)document.getElementById('account-character').value=active.id;
document.getElementById('account-character').onchange=function(e){selectInterfaceCharacter(e.target.value)};
root.querySelectorAll('[data-account-detail]').forEach(function(a){a.onclick=function(e){e.preventDefault();rosterSelectedCharacterId=a.dataset.accountDetail;cpSelectedCharacterId=rosterSelectedCharacterId;renderApp();navigateTo('characters');var title=document.getElementById('cp-assessment-title');if(title){title.focus();title.scrollIntoView({block:'start'})}}});
document.getElementById('account-open-checklists').onclick=function(){activityVisibility.dashboard.daily=false;renderDashboard();var panel=document.getElementById('account-checklists');panel.open=true;panel.querySelector('summary').focus();panel.scrollIntoView({block:'start'})};var quick=document.getElementById('account-quick-activities');if(quick)quick.onclick=document.getElementById('account-open-checklists').onclick;if(focusId){var control=document.getElementById(focusId);if(control)control.focus({preventScroll:true})}
}
A2.extensions.register("account-dashboard","renderDashboard",function(previous){return function(){previous();renderAccountDashboard()};});
A2.lifecycle.register("account-dashboard",function(){var page=document.getElementById('dashboard-page'),overview=document.createElement('div'),details=document.createElement('details');overview.id='account-dashboard';details.id='account-checklists';details.className='account-checklists';var summary=document.createElement('summary');summary.textContent='Atividades do personagem ativo';details.appendChild(summary);while(page.firstChild)details.appendChild(page.firstChild);page.appendChild(overview);page.appendChild(details);renderAccountDashboard()});
