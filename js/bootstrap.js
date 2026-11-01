// The composition root: all feature definitions are available before wiring.
A2.moduleOrder=['app','characters','plan-context','progression','activities','catalog','ui','navigation','dashboard','character-progress','milestones','account-dashboard','cp-data','cp-assessment','events-data','events-community','events','events-community-ui'];
A2.moduleOrder.push('usability');
A2.extensions.composePending(A2.moduleOrder);
A2.Characters={save:saveCharacter,remove:deleteCharacter,render:renderCharacterRoster};
A2.Progression={create:createPlan,setObjective:setObjectiveDone,confirm:confirmMilestone};
A2.CP={parse:parseCombatPower,compare:compareCombatPower,history:cpHistory};
A2.Events={agenda:eventAgendaSnapshot,occurrences:eventOccurrences,save:saveCalendarEvent};
A2.Activities={toggle:toggleActivity,cycle:cycleId};
A2.Persistence={load:loadState,save:saveState,exportData:backupPayload,restore:restoreBackup};
document.addEventListener('DOMContentLoaded',function(){A2.lifecycle.start(A2.moduleOrder)});
