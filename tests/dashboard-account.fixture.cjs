exports.seedDashboard=async function(page){await page.evaluate(()=>{
  AION_STATE.data=createInitialState();
  // This fixture isolates progression; calendar behavior has its own browser tests.
  AION_STATE.data.eventCalendar.events=[];
  AION_STATE.data.characters=[['main','L0rdFuria','Assassino',2033,98077,'main'],['templar','WarriorL0rd','Templário',1644,79213,'alt'],['cleric','LadyFuria','Clériga',1637,75480,'alt'],['sorcerer','MästerFuria','Feiticeiro',1430,71723,'alt']].map(x=>({id:x[0],name:x[1],className:x[2],ilevel:x[3],combatPower:x[4],type:x[5]}));
  AION_STATE.data=prepareState(AION_STATE.data);
  AION_STATE.data.characters.forEach(c=>initializeMilestones(c.id));
  function task(characterId,kind,description,required){var s=currentMilestone(activePlan('character',characterId));s.objectives.push({id:makeId(),kind,description,required,target:null,details:'Tarefa cadastrada para validar a apresentação.',done:false,completedAt:null,position:s.objectives.length})}
  task('main','arcana','Completar Arcanas do Assassino',true);task('main','content','Primeira conclusão — conteúdo de teste',true);task('main','upgrade','Revisar aprimoramento da arma',false);task('cleric','equipment','Melhorar equipamentos da Clériga',true);
  saveActivity({name:'Atividade de teste da conta',frequency:'daily',scope:'account'});
  AION_STATE.data.preferences.activeCharacterId='main';saveState();renderApp();
})};
