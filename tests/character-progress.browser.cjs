const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(path.resolve('index.html')).href+'#characters');
    await page.locator('#add-character').click();
    await page.locator('#character-name').fill('Teste CP');await page.locator('#character-class').fill('Assassino');await page.locator('#character-ilevel').fill('2033');await page.locator('#character-cp').fill('98077');
    await page.locator('#character-form button[type=submit]').click();
    let c=await page.evaluate(()=>AION_STATE.data.characters[0]);assert.equal(c.combatPower,98077);assert.equal(c.progressHistory.length,1);assert.equal(c.type,'main');
    await page.reload();assert.equal(await page.locator('#character-detail').getByText('98.077',{exact:true}).count(),1);
    await page.locator('[data-action=edit]').click();await page.locator('#character-form button[type=submit]').click();
    assert.equal(await page.evaluate(()=>AION_STATE.data.characters[0].progressHistory.length),1);
    await page.locator('[data-action=edit]').click();await page.locator('#character-cp').fill('-1');await page.locator('#character-form button[type=submit]').click();assert.match(await page.locator('#form-error').textContent(),/CP numérico/);
    await page.locator('#character-cp').fill('abc');await page.locator('#character-form button[type=submit]').click();assert.match(await page.locator('#form-error').textContent(),/CP numérico/);
    await page.locator('#character-cp').fill('99000');await page.locator('#character-ilevel').fill('2040');await page.locator('#character-form button[type=submit]').click();
    await page.evaluate(()=>{
      var c=AION_STATE.data.characters[0];if(c.progressHistory.length!==2||!c.progressHistory[1].changes.ilevel||!c.progressHistory[1].changes.combatPower)throw Error('Histórico');
      c.extra={preserved:true};openModal(c.id);
    });
    await page.locator('#character-form button[type=submit]').click();assert.equal(await page.evaluate(()=>AION_STATE.data.characters[0].extra.preserved),true);
    const checks=await page.evaluate(()=>{
      function check(ok,label){if(!ok)throw Error(label)}
      var original=cloneData(AION_STATE.data),legacy=cloneData(original);legacy.schemaVersion='1.4.0';legacy.extra={keep:1};legacy.preferences.extra='keep';legacy.characters.forEach(c=>{delete c.combatPower;delete c.combatPowerUpdatedAt;delete c.progressHistory});
      var migrated=prepareState(legacy);check(JSON.stringify(prepareState(migrated))===JSON.stringify(migrated),'Idempotência');check(migrated.characters[0].combatPower===null&&migrated.characters[0].progressHistory.length===0,'Migração sem inventar dados');check(migrated.extra.keep===1&&migrated.preferences.extra==='keep','Campos extras');
      var before=JSON.stringify(AION_STATE.data);var bad=backupPayload();bad.data.characters[0].combatPower=-1;try{restoreBackup(bad);throw Error('Aceitou CP inválido')}catch(e){if(e.message==='Aceitou CP inválido')throw e}check(JSON.stringify(AION_STATE.data)===before,'Importação atômica');
      restoreBackup({project:'aion-2',schemaVersion:'1.4.0',data:legacy});check(AION_STATE.data.schemaVersion==='1.5.0','Backup antigo');
      restoreBackup({project:'aion-2',schemaVersion:original.schemaVersion,data:original});var payload=backupPayload();restoreBackup(payload);check(JSON.stringify(AION_STATE.data.characters)===JSON.stringify(original.characters),'Roundtrip');return true;
    });assert(checks);
    await page.locator('#add-character').click();await page.locator('#character-name').fill('Alt teste');await page.locator('#character-class').fill('Templário');await page.locator('#character-ilevel').fill('1644');await page.locator('#character-main').check();await page.locator('#character-form button[type=submit]').click();
    await page.evaluate(()=>{var cs=AION_STATE.data.characters;if(cs.filter(c=>c.type==='main').length!==1||cs[1].combatPower!==null)throw Error('Main/CP opcional');selectInterfaceCharacter(cs[1].id)});
    await page.reload();assert.equal(await page.evaluate(()=>AION_STATE.data.preferences.activeCharacterId===AION_STATE.data.characters[1].id),true);
    const download=page.waitForEvent('download');await page.evaluate(()=>exportBackup());assert.match((await download).suggestedFilename(),/aion-2-backup/);
    assert.deepEqual(errors,[]);console.log('PASS Chromium file://: cadastro, CP inválido/vazio, edição, Main único, histórico sem duplicação, reload, ativo, migração idempotente, extras, importação atômica, roundtrip e download JSON.');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
