var ABYSS_COMMANDS = 'abyss-commands';
var ABYSS_SIEGE = 'abyss-siege';
var ABYSS_CORRIDOR = 'abyss-corridor';
var ABYSS_TACTICS = 'abyss-tactics';
var ABYSS_ARTIFACTS = ['Raiz de Reshanta', 'Ilha da Árvore de Enxofre', 'Arquipélago das Asas de Siel'];
var ABYSS_FACTIONS = ['Indefinido', 'Asmodianos', 'Elyos'];
var ABYSS_TIERS = ['Básico', 'Veterano', 'Elite', 'Especial'];
var ABYSS_DEFAULT_RULES = {
  'abyss-commands': {total:20, limit0:5, limit1:5, limit2:5, limit3:5, cost0:15000, cost1:37500, cost2:75000, cost3:150000},
  'abyss-solitude': {participation:10, wins:30, apParticipation:300, apWin:500},
  'abyss-cooperation': {participation:10, wins:30, apParticipation:300, apWin:500, teamSize:5},
  'abyss-tactics': {participation:3, wins:3, apParticipation:1000, apWin:3000, medalParticipation:1, medalWin:2}
};
var ABYSS_RULE_LABELS = {
  total:'Cota de compras do servidor', participation:'Cota de participação', wins:'Cota de vitória',
  apParticipation:'AP por participação', apWin:'AP por vitória', teamSize:'Jogadores por equipe',
  medalParticipation:'Medalhas por participação', medalWin:'Medalhas por vitória'
};

function abyssNumber(value) {
  return Number.isSafeInteger(value) && value >= 0 && value <= 1000000000;
}

function abyssValidate(progress) {
  if (!progress || !progress.rules || typeof progress.rules !== 'object' || Array.isArray(progress.rules) || !Array.isArray(progress.records)) throw Error('Progresso do Abismo inválido.');
  Object.keys(progress.rules).forEach(function(id) {
    var defaults = ABYSS_DEFAULT_RULES[id], rules = progress.rules[id];
    if (!defaults || !rules || Object.keys(defaults).some(function(key) {
      return typeof defaults[key] === 'number' ? !abyssNumber(rules[key]) : !eventValidTime(rules[key]);
    })) throw Error('Regras do Abismo inválidas.');
  });
  var ids = new Set();
  progress.records.forEach(function(row) {
    if (!row || typeof row.id !== 'string' || ids.has(row.id) ||
        typeof row.model !== 'string' || !/^abyss-/.test(row.model) ||
        typeof row.character !== 'string' || typeof row.server !== 'string' ||
        typeof row.week !== 'string' || !Number.isFinite(Date.parse(row.at)) ||
        !abyssNumber(row.ap) || !abyssNumber(row.medals)) throw Error('Registro do Abismo inválido.');
    var actions = row.model===ABYSS_COMMANDS ? ['purchase','complete'] :
      row.model===ABYSS_SIEGE ? ['control','participate'] :
      row.model===ABYSS_CORRIDOR ? ['availability','run'] :
      Object.hasOwn(ABYSS_DEFAULT_RULES,row.model) ? ['win','loss','rank'] : [];
    if (!actions.includes(row.action)) throw Error('Ação inválida no histórico do Abismo.');
    if (row.action==='purchase' && (!ABYSS_TIERS[row.tier] || !abyssNumber(row.cost) ||
        !['stored','active','completed'].includes(row.status))) throw Error('Pergaminho inválido.');
    if (['control','availability','participate','run'].includes(row.action) &&
        (typeof row.occurrence!=='string' || !row.occurrence)) throw Error('Ocorrência inválida.');
    if (['control','availability'].includes(row.action) && (!Array.isArray(row.artifacts) ||
        row.artifacts.length!==ABYSS_ARTIFACTS.length || row.artifacts.some(function(value){
          return !Number.isInteger(value) || value<0 || value>(row.action==='control'?2:1);
        }))) throw Error('Estado de artefato inválido.');
    if (row.action==='run' && !ABYSS_ARTIFACTS[row.artifact]) throw Error('Corredor inválido.');
    if (row.action==='rank' && (typeof row.season!=='string' || !row.season ||
        typeof row.rank!=='string')) throw Error('Ranking inválido.');
    ids.add(row.id);
  });
}

A2.extensions.register('abyss', 'prepareState', function(previous) {
  return function(input) {
    var data = previous(input);
    if (data.abyss === undefined) data.abyss = {rules:{}, records:[]};
    abyssValidate(data.abyss);
    return data;
  };
});

function abyssContext(character, now) {
  var data = AION_STATE.data;
  var person = data.characters.find(function(c) {return c.id === character;});
  if (!person) throw Error('Selecione um personagem cadastrado.');
  return {
    person:person, server:person.server.trim().toLocaleLowerCase('pt-BR'),
    week:cycleId('weekly', data.resetSettings, now), progress:data.abyss,
    records:data.abyss.records, now:now
  };
}

function abyssCalendarEvent(id) {
  var events = AION_STATE.data.eventCalendar.events;
  var configured = events.find(function(event){return event.id===id;}) ||
    events.find(function(event){return event.community && event.community.preset===id;});
  if (configured) return configured;
  var aliases = eventPresetAliases({id:id,name:id==='cerco-artefatos'?'Cerco de Artefatos':'Arena de Táticas'});
  return events.find(function(event){return aliases.includes(cpNormalize(event.name));});
}

function abyssSiegeOccurrences(now) {
  var event = abyssCalendarEvent('cerco-artefatos');
  if (!event) return [];
  // On a Wednesday, the latest Saturday is outside the calendar's two-day lookback.
  var earlier = new Date(+now - 7 * 86400000);
  var rows = new Map();
  eventOccurrences(event, earlier).concat(eventOccurrences(event, now)).forEach(function(row) {rows.set(row.key,row);});
  return Array.from(rows.values()).sort(function(a,b) {return a.start-b.start;});
}

function abyssRules(model) {
  return AION_STATE.data.abyss.rules[model] || ABYSS_DEFAULT_RULES[model];
}

function abyssRecord(model, character, action, values, now) {
  var ctx = abyssContext(character, now || new Date()), rules = abyssRules(model);
  var own = ctx.records.filter(function(row) {return row.model === model && row.character === character;});
  var weekly = own.filter(function(row) {return row.week === ctx.week;});
  var row = {id:makeId(), model:model, character:character, server:ctx.server, week:ctx.week,
    action:action, at:ctx.now.toISOString(), ap:0, medals:0};
  if (model === ABYSS_COMMANDS) {
    if (action === 'purchase') {
      var tier = Number(values.tier);
      var purchases = ctx.records.filter(function(item) {
        return item.model === model && item.action === 'purchase' && item.server === ctx.server && item.week === ctx.week;
      });
      if (!ABYSS_TIERS[tier] || purchases.length >= rules.total ||
          purchases.filter(function(item) {return item.tier === tier;}).length >= rules['limit'+tier]) throw Error('Cota semanal indisponível para esta categoria.');
      Object.assign(row,{tier:tier, cost:rules['cost'+tier], status:'stored'});
    } else {
      var scroll = own.find(function(item) {return item.id === values.scroll && item.action === 'purchase';});
      if (!scroll || action === 'activate' && scroll.status !== 'stored' ||
          action === 'complete' && scroll.status !== 'active' || !['activate','complete'].includes(action)) throw Error('Selecione um pergaminho na etapa correta.');
      if (action === 'activate') {
        scroll.status = 'active';
        return scroll;
      }
      row.ap = Number(values.ap || 0);
      if (!abyssNumber(row.ap)) throw Error('Informe AP em número inteiro.');
      scroll.status = 'completed';
      row.scroll = scroll.id;
    }
  } else if (model === ABYSS_SIEGE || model === ABYSS_CORRIDOR) {
    var occurrence = abyssSiegeOccurrences(ctx.now).find(function(item) {return item.key === values.occurrence && item.start <= +ctx.now;});
    if (!occurrence) throw Error('Selecione uma ocorrência de cerco já iniciada.');
    row.occurrence = occurrence.key;
    row.week = cycleId('weekly', AION_STATE.data.resetSettings, new Date(occurrence.start));
    if (action === (model === ABYSS_SIEGE ? 'control' : 'availability')) {
      var setting = ctx.records.find(function(item) {
        return item.model === model && item.server === ctx.server && item.occurrence === row.occurrence &&
          item.action === action && (action === 'control' || item.faction === ctx.person.faction);
      });
      row.artifacts = ABYSS_ARTIFACTS.map(function(_, index) {
        var value = Number(values['artifact'+index] || 0);
        if (!Number.isInteger(value) || value < 0 || value > (action === 'control' ? 2 : 1)) throw Error('Estado de artefato inválido.');
        return value;
      });
      row.faction = ctx.person.faction;
      if (setting) {
        Object.assign(setting,{artifacts:row.artifacts, at:row.at});
        return setting;
      }
    } else {
      if (action !== (model === ABYSS_SIEGE ? 'participate' : 'run')) throw Error('Ação inválida.');
      row.artifact = Number(values.artifact);
      if (model === ABYSS_CORRIDOR && !ABYSS_ARTIFACTS[row.artifact]) throw Error('Selecione o artefato.');
      if (own.some(function(item) {
        return item.action === action && item.occurrence === row.occurrence &&
          (model === ABYSS_SIEGE || item.artifact === row.artifact);
      })) throw Error('Esta execução já foi registrada para o personagem.');
      row.ap = Number(values.ap || 0);
      row.medals = model === ABYSS_SIEGE ? Number(values.medals || 0) : 0;
      if (model === ABYSS_SIEGE) delete row.artifact;
    }
  } else if (rules) {
    if (action === 'rank') {
      row.rank = String(values.rank || '').trim().slice(0,80);
      row.season = String(values.season || '').trim().slice(0,80);
      if (!row.season) throw Error('Informe a temporada.');
    } else {
      if (!['win','loss'].includes(action)) throw Error('Resultado inválido.');
      row.participationPaid = weekly.filter(function(item) {return item.participationPaid;}).length < rules.participation;
      row.winPaid = action === 'win' && weekly.filter(function(item) {return item.winPaid;}).length < rules.wins;
      row.ap = (row.participationPaid ? rules.apParticipation : 0) + (row.winPaid ? rules.apWin : 0);
      row.medals = (row.participationPaid ? rules.medalParticipation || 0 : 0) + (row.winPaid ? rules.medalWin || 0 : 0);
    }
  } else {
    throw Error('Conteúdo indisponível.');
  }
  if (!abyssNumber(row.ap) || !abyssNumber(row.medals)) throw Error('Informe valores inteiros válidos para AP e medalhas.');
  ctx.records.push(row);
  return row;
}
function abyssSelect(name, label, options) {
  return '<label>'+esc(label)+'<select name="'+name+'" required>'+options.map(function(option) {
    return '<option value="'+esc(String(option[0]))+'"'+(option[2]?' selected':'')+'>'+esc(option[1])+'</option>';
  }).join('')+'</select></label>';
}
function abyssInput(name, label, type, value) {
  return '<label>'+esc(label)+'<input name="'+name+'" type="'+type+'" value="'+esc(String(value))+'"'+
    (type==='number'?' min="0" max="1000000000" step="1"':'')+(name==='ap'||name==='medals'?'':' required')+'></label>';
}
function abyssForm(action, fields, label) {
  return '<form data-abyss-action="'+action+'"><div class="form-grid">'+fields+'</div><button type="submit">'+label+'</button></form>';
}
function abyssSum(rows, field) {
  return rows.reduce(function(total,row) {return total+(row[field]||0);},0).toLocaleString('pt-BR');
}
function abyssFormat(instant, zone) {
  return new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:zone}).format(instant);
}

function abyssCommandPanel(ctx, own, weekly, rules) {
  var purchases = ctx.records.filter(function(row) {
    return row.model===ABYSS_COMMANDS && row.server===ctx.server && row.week===ctx.week && row.action==='purchase';
  });
  var counts = ABYSS_TIERS.map(function(label,i) {
    return label+' '+purchases.filter(function(row){return row.tier===i;}).length+'/'+rules['limit'+i];
  });
  var html = '<p>Pergaminhos comprados no servidor '+purchases.length+'/'+rules.total+' · '+counts.join(' · ')+'</p>'+
    '<p>Kinah gasta no servidor: '+abyssSum(purchases,'cost')+' · Missões concluídas: '+weekly.filter(function(row){return row.action==='complete';}).length+
    ' · AP obtidos: '+abyssSum(weekly,'ap')+'</p>';
  html += abyssForm('purchase',abyssSelect('tier','Categoria',ABYSS_TIERS.map(function(label,i){
    return [i,label+' · '+rules['cost'+i].toLocaleString('pt-BR')+' Kinah'];
  })),'Registrar compra');
  [['stored','activate','Ativar pergaminho'],['active','complete','Concluir missão']].forEach(function(step){
    var stock = own.filter(function(row){return row.status===step[0];});
    html += '<p>'+(step[0]==='stored'?'Pergaminhos em estoque':'Missões ativadas')+': '+stock.length+'</p>';
    if(stock.length) html += abyssForm(step[1],abyssSelect('scroll','Pergaminho',stock.map(function(row,i){
      return [row.id,ABYSS_TIERS[row.tier]+' · '+(i+1)];
    }))+(step[1]==='complete'?abyssInput('ap','AP obtidos','number',0):''),step[2]);
  });
  return html;
}

function abyssSiegePanel(ctx, model, own, weekly, selected) {
  var siege = model===ABYSS_SIEGE, occurrences = abyssSiegeOccurrences(ctx.now);
  var next = occurrences.find(function(row){return row.start>+ctx.now;});
  var past = occurrences.filter(function(row){return row.start<=+ctx.now;}).reverse();
  var current = past.find(function(row){return row.key===selected;}) || past[0];
  var html = next ? '<p>Próximo cerco: '+esc(abyssFormat(next.start,next.event.timezone))+' · '+esc(next.event.timezone)+' · <span data-abyss-countdown="'+next.start+'"></span></p>' : '<p>Configure o Cerco de Artefatos nos timers.</p>';
  if(siege) {
    var expected = occurrences.filter(function(row){return cycleId('weekly',AION_STATE.data.resetSettings,new Date(row.start))===ctx.week;}).length;
    html += '<p>Participações na semana: '+weekly.filter(function(row){return row.action==='participate';}).length+'/'+expected+
      ' · AP: '+abyssSum(weekly,'ap')+' · Medalhas: '+abyssSum(weekly,'medals')+'</p>';
  }
  if(!current)return html;
  html += abyssSelect('occurrence','Ocorrência do cerco',past.map(function(row){
    return [row.key,abyssFormat(row.start,row.event.timezone),row.key===current.key];
  }));
  var cycle = own.filter(function(row){return row.occurrence===current.key;});
  var setting = ctx.records.find(function(row){
    return row.model===model && row.occurrence===current.key && row.server===ctx.server &&
      row.action===(siege?'control':'availability') && (siege||row.faction===ctx.person.faction);
  });
  var artifacts = setting ? setting.artifacts : [0,0,0];
  var stateOptions = siege ? ABYSS_FACTIONS : ['Indisponível','Disponível'];
  if(!siege) html += '<p>Corredores disponíveis: '+artifacts.filter(Boolean).length+' · Concluídos: '+cycle.filter(function(row){return row.action==='run';}).length+
    ' · AP: '+abyssSum(cycle,'ap')+'</p>';
  else html += '<p>Participação nesta ocorrência: '+(cycle.some(function(row){return row.action==='participate';})?'registrada':'pendente')+'</p>';
  html += abyssForm(siege?'control':'availability',ABYSS_ARTIFACTS.map(function(name,i){
    return abyssSelect('artifact'+i,name,stateOptions.map(function(label,j){return [j,label,artifacts[i]===j];}));
  }).join(''),siege?'Salvar controle dos artefatos':'Salvar disponibilidade');
  if(!siege || !cycle.some(function(row){return row.action==='participate';})) {
    html += abyssForm(siege?'participate':'run',(siege?abyssInput('medals','Medalhas obtidas','number',0):
      abyssSelect('artifact','Artefato da execução',ABYSS_ARTIFACTS.map(function(name,i){return [i,name];})))+
      abyssInput('ap','AP obtidos','number',0),siege?'Registrar participação':'Registrar execução');
  }
  return html;
}

function abyssArenaPanel(ctx, model, own, weekly, rules) {
  var matches = weekly.filter(function(row){return row.action==='win'||row.action==='loss';});
  var html = '<p>Partidas: '+matches.length+' · Vitórias: '+matches.filter(function(row){return row.action==='win';}).length+
    ' · Derrotas: '+matches.filter(function(row){return row.action==='loss';}).length+'</p><p>Participação premiada: '+
    matches.filter(function(row){return row.participationPaid;}).length+'/'+rules.participation+' · Vitórias premiadas: '+
    matches.filter(function(row){return row.winPaid;}).length+'/'+rules.wins+' · AP: '+abyssSum(matches,'ap')+
    (model===ABYSS_TACTICS?' · Medalhas: '+abyssSum(matches,'medals'):'')+'</p>';
  if(model===ABYSS_TACTICS) {
    var event = abyssCalendarEvent('arena-taticas');
    var next = event && eventOccurrences(event,ctx.now).find(function(row){return row.start>+ctx.now;});
    if(next)html += '<p>Próxima janela: '+esc(abyssFormat(next.start,event.timezone))+(next.end?' até '+esc(abyssFormat(next.end,event.timezone)):'')+
      ' ('+esc(event.timezone)+'). '+(event.validation==='verified'?'':'Referência pendente de validação Global/LA. ')+'Ajuste os horários nos timers.</p>';
  }
  html += '<div class="plan-toolbar">'+abyssForm('win','','Registrar vitória')+abyssForm('loss','','Registrar derrota')+'</div>';
  var rank = own.filter(function(row){return row.action==='rank';}).slice(-1)[0];
  if(model!==ABYSS_TACTICS) html += abyssForm('rank',abyssInput('season','Temporada','text',rank?rank.season:'')+
    '<label>Ranking opcional<input name="rank" maxlength="80" value="'+esc(rank?rank.rank:'')+'"></label>','Salvar ranking');
  return html;
}

function renderAbyssTracking(panel, activity, character, occurrence) {
  var model = activity.catalogId, rules = abyssRules(model);
  var chars = AION_STATE.data.characters.filter(function(person){return activity.scope==='account'||person.id===activity.characterId;});
  panel.innerHTML = '<h3>Acompanhamento do Abismo</h3>';
  if(!chars.length) {
    panel.innerHTML += '<p>Vincule um personagem cadastrado para registrar progresso.</p>';
    return;
  }
  var person = chars.find(function(item){return item.id===character;})||chars[0];
  var ctx = abyssContext(person.id,new Date());
  var own = ctx.records.filter(function(row){return row.model===model&&row.character===person.id;});
  var weekly = own.filter(function(row){return row.week===ctx.week;});
  panel.innerHTML += (chars.length>1?abyssSelect('character','Personagem',chars.map(function(item){
    return [item.id,item.name,item.id===person.id];
  })):'<p>'+esc(person.name)+'</p>')+'<p>Servidor: '+esc(person.server||'Sem servidor definido')+'</p>';
  var config = AION_STATE.data.resetSettings;
  var nextReset = eventWallInstant(eventShiftDay(ctx.week.split('|').pop(),7),config.weeklyTime,config.timezone);
  if(nextReset!==null && model!==ABYSS_CORRIDOR)panel.innerHTML += '<p>Próximo reset: '+esc(abyssFormat(nextReset,config.timezone))+' · '+esc(config.timezone)+'</p>';
  if(model===ABYSS_COMMANDS)panel.innerHTML += abyssCommandPanel(ctx,own,weekly,rules);
  else if(model===ABYSS_SIEGE||model===ABYSS_CORRIDOR)panel.innerHTML += abyssSiegePanel(ctx,model,own,weekly,occurrence);
  else panel.innerHTML += abyssArenaPanel(ctx,model,own,weekly,rules);
  var history = own.filter(function(row){return ['complete','participate','run','win','loss'].includes(row.action);});
  if(history.length)panel.innerHTML += '<details><summary>Histórico de execuções ('+history.length+')</summary><ul>'+
    history.slice().reverse().map(function(row){
      var label = {complete:'Missão concluída',participate:'Participação no cerco',run:'Corredor: '+ABYSS_ARTIFACTS[row.artifact],win:'Vitória',loss:'Derrota'}[row.action];
      return '<li>'+esc(abyssFormat(Date.parse(row.at),AION_STATE.data.resetSettings.timezone))+' · '+esc(label)+
        (row.ap?' · '+row.ap.toLocaleString('pt-BR')+' AP':'')+(row.medals?' · '+row.medals+' medalhas':'')+'</li>';
    }).join('')+'</ul></details>';
  if(rules)panel.innerHTML += '<details><summary>Configurar regras de referência</summary>'+abyssForm('rules',Object.keys(rules).filter(function(key){
    return Object.hasOwn(ABYSS_DEFAULT_RULES[model],key);
  }).map(function(key){
    var label = ABYSS_RULE_LABELS[key] || ABYSS_TIERS[Number(key.slice(-1))]+' — '+(key.startsWith('cost')?'Kinah por compra':'cota semanal');
    return abyssInput(key,label,typeof rules[key]==='number'?'number':'time',rules[key]);
  }).join(''),'Salvar regras')+'</details>';
  panel.innerHTML += '<p role="alert" class="form-error"></p>';
  var countdown = panel.querySelector('[data-abyss-countdown]');
  if(countdown){
    function updateCountdown(){
      var remaining = Math.max(0,Number(countdown.dataset.abyssCountdown)-Date.now());
      countdown.textContent = remaining ? 'em '+Math.ceil(remaining/60000).toLocaleString('pt-BR')+' min' : 'Horário de início atingido';
      if(remaining && countdown.isConnected && !panel.closest('#activity-dialog').hidden)setTimeout(updateCountdown,1000);
    }
    updateCountdown();
  }
  var choice = panel.querySelector('[name="occurrence"]'), owner = panel.querySelector('[name="character"]');
  if(choice)choice.onchange = function(){renderAbyssTracking(panel,activity,person.id,choice.value);panel.querySelector('[name="occurrence"]').focus();};
  if(owner)owner.onchange = function(){renderAbyssTracking(panel,activity,owner.value,choice&&choice.value);panel.querySelector('[name="character"]').focus();};
  panel.querySelectorAll('form').forEach(function(form){
    form.onsubmit = function(event){
      event.preventDefault();
      var action = form.dataset.abyssAction, values = Object.fromEntries(new FormData(form));
      if(choice)values.occurrence = choice.value;
      var result = A2.store.transact(function(){
        if(action==='rules'){
          var updated = {};
          Object.keys(ABYSS_DEFAULT_RULES[model]).forEach(function(key){
            updated[key] = typeof ABYSS_DEFAULT_RULES[model][key]==='number'?Number(values[key]):values[key];
          });
          AION_STATE.data.abyss.rules[model] = updated;
        }else abyssRecord(model,person.id,action,values,new Date());
      });
      if(!result.ok){panel.querySelector('[role="alert"]').textContent=result.error.message;return;}
      renderAbyssTracking(panel,activity,person.id,choice&&choice.value);
      showToast(result.saved?'Progresso do Abismo salvo.':'Progresso nesta sessão. Exporte um backup antes de fechar.',!result.saved);
      var button = panel.querySelector('[data-abyss-action="'+action+'"] button') || panel.closest('.modal').querySelector('button');
      if(action==='rules'){
        var details = button.closest('details');
        details.open = true;
        details.querySelector('summary').focus();
      }else if(button)button.focus();
    };
  });
}

A2.extensions.register('abyss','activityAction',function(previous){
  return function(action,id){
    previous(action,id);
    if(action!=='info')return;
    var activity = AION_STATE.data.activities.find(function(row){return row.id===id;});
    if(!activity || ![ABYSS_SIEGE,ABYSS_CORRIDOR].includes(activity.catalogId) && !Object.hasOwn(ABYSS_DEFAULT_RULES,activity.catalogId))return;
    var panel = document.createElement('section');
    panel.className = 'information-section';
    document.querySelector('#activity-dialog .activity-information-modal').appendChild(panel);
    renderAbyssTracking(panel,activity,activity.characterId||AION_STATE.data.preferences.activeCharacterId);
  };
});
