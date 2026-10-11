var AION_STORAGE_KEY="aion-2-personal-progress-v1";
function storageProblem(message){AION_STATE.storageError=message;if(typeof updateStorageNotice==="function")updateStorageNotice()}
function checkStorage(){try{var key="__aion_test_"+makeId();localStorage.setItem(key,"1");localStorage.removeItem(key);return true}catch(e){return false}}
function loadState(){
  AION_STATE.storageBlocked=false;AION_STATE.storageError="";AION_STATE.data=createInitialState();
  var raw;try{raw=localStorage.getItem(AION_STORAGE_KEY)}catch(e){AION_STATE.storageAvailable=false;storageProblem("Armazenamento indisponível. Alterações ficarão nesta sessão; exporte um backup antes de fechar.");return {ok:false,reason:"unavailable"}}
  // Read first: full storage can still contain valid, readable user data.
  AION_STATE.storageAvailable=true;
  if(raw!==null){try{AION_STATE.data=prepareState(JSON.parse(raw))}catch(e){AION_STATE.storageBlocked=true;storageProblem("Dados locais incompatíveis foram preservados. A gravação está bloqueada; restaure um backup válido. "+e.message);return {ok:false,reason:"invalid",message:e.message}}}
  if(!checkStorage())storageProblem("Não foi possível confirmar a escrita local. Dados existentes foram carregados; exporte um backup das alterações.");
  if(raw===null)saveState();return {ok:true,reason:raw===null?"new":"loaded"};
}
function persistState(candidate){var validated=prepareState(candidate);validated.updatedAt=new Date().toISOString();localStorage.setItem(AION_STORAGE_KEY,JSON.stringify(validated));return validated}
function saveState(){AION_STATE.lastSaveOk=false;if(!AION_STATE.storageAvailable||AION_STATE.storageBlocked)return false;try{var saved=persistState(AION_STATE.data);AION_STATE.data.updatedAt=saved.updatedAt;AION_STATE.lastSaveOk=true;AION_STATE.storageError="";if(typeof updateStorageNotice==="function")updateStorageNotice();return true}catch(e){storageProblem("Não foi possível salvar (armazenamento bloqueado, cheio ou dados inválidos). Alterações estão nesta sessão: exporte um backup antes de fechar. "+e.message);return false}}
