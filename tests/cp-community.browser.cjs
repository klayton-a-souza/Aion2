const expandCPAnalysis=require('./helpers/cp-panels.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),{seedDashboard}=require('./dashboard-account.fixture.cjs');
(async()=>{const browser=await chromium.launch();try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#characters');await seedDashboard(page);await expandCPAnalysis(page);await page.evaluate(()=>navigateTo('characters'));
  for(const [id,median] of [['main',92],['templar',88],['cleric',88],['sorcerer',72]]){
    await page.locator('[data-roster-character='+id+']').click();await expandCPAnalysis(page);
    assert.equal(await page.evaluate(()=>compareCombatPower(cpSelectedCharacter(),AION_STATE.data.cpAssessment).reference.medianCP),median);
    assert.match(await page.locator('#cp-community').innerText(),/Referência comunitária preliminar/);
    assert.match(await page.locator('#cp-community').innerText(),/Fonte primária pendente/);
  }
  await page.locator('[data-roster-character=main]').click();await expandCPAnalysis(page);
  await page.locator('[data-action=edit]').click();await page.locator('#character-cp').fill('98078');await page.locator('#character-form button[type=submit]').click();
  const recordedHistory=await page.evaluate(()=>JSON.stringify(cpSelectedCharacter().progressHistory));
  assert.equal(await page.evaluate(()=>cpSelectedCharacter().progressHistory.length),1);
  for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]]){
    await page.setViewportSize({width,height});await page.locator('#cp-assessment').scrollIntoViewIfNeeded();
    await page.locator('#cp-assessment').screenshot({path:path.join(process.env.A2_EVIDENCE_DIR||os.tmpdir(),'cp-community-'+name+'.png')});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  await page.locator('#cp-community [data-cp-reference]').click();
  await page.locator('#cp-ref-median').fill('93');await page.locator('#cp-ref-source-documented').check();
  await page.locator('#cp-dialog button[type=submit]').click();assert.match(await page.locator('#cp-form-error').innerText(),/endereço/);
  await page.locator('#cp-ref-source-documented').uncheck();await page.locator('#cp-dialog button[type=submit]').click();
  assert.equal(await page.evaluate(()=>AION_STATE.data.cpAssessment.references.length),8);
  assert.equal(await page.evaluate(()=>compareCombatPower(cpSelectedCharacter(),AION_STATE.data.cpAssessment).reference.medianCP),93);
  assert.equal(await page.evaluate(()=>JSON.stringify(cpSelectedCharacter().progressHistory)),recordedHistory);
  await page.reload();await expandCPAnalysis(page);assert.equal(await page.evaluate(()=>compareCombatPower(cpSelectedCharacter(),AION_STATE.data.cpAssessment).reference.medianCP),93);
  assert.equal(await page.evaluate(()=>JSON.stringify(cpSelectedCharacter().progressHistory)),recordedHistory);
  assert(await page.evaluate(()=>{const before=JSON.stringify(AION_STATE.data.characters),goals=JSON.stringify(AION_STATE.data.plans);const b=backupPayload();restoreBackup(b);return AION_STATE.data.cpAssessment.references.length===8&&AION_STATE.data.cpAssessment.references[3].medianCP===93&&JSON.stringify(AION_STATE.data.characters)===before&&JSON.stringify(AION_STATE.data.plans)===goals}));
  await page.evaluate(()=>{AION_STATE.data.characters[0].combatPower=null;renderApp()});assert.match(await page.locator('#cp-community').innerText(),/CP não informado/);
  await page.evaluate(()=>{AION_STATE.data.characters[0].ilevel=1300;renderApp()});assert.match(await page.locator('#cp-community').innerText(),/Referência indisponível/);
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);console.log('PASS CP comunitário file://: quatro personagens, origem/amostras, edição, fonte pendente, reload/backup, metas preservadas, ausências, três capturas e texto 200%.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
