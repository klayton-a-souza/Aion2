const assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),{seedDashboard}=require('./dashboard-account.fixture.cjs');
(async()=>{const browser=await chromium.launch();try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#characters');await seedDashboard(page);await page.evaluate(()=>navigateTo('characters'));
  assert.equal(await page.locator('#cp-character').count(),0);
  const buttons=page.locator('.cp-panel-toggle');assert.equal(await buttons.count(),4);
  assert.equal(await page.locator('.cp-panel-toggle[aria-expanded=false]').count(),4);
  const state=await page.evaluate(()=>JSON.stringify(AION_STATE.data));
  for(let i=0;i<4;i++){await buttons.nth(i).focus();await page.keyboard.press('Enter');assert.equal(await buttons.nth(i).getAttribute('aria-expanded'),'true');assert.equal(await page.locator('.cp-panel-toggle[aria-expanded=true]').count(),1);await buttons.nth(i).click()}
  assert.equal(await page.evaluate(()=>JSON.stringify(AION_STATE.data)),state);
  for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]]){
    await page.setViewportSize({width,height});await page.locator('#cp-assessment').screenshot({path:path.join(process.env.A2_EVIDENCE_DIR||os.tmpdir(),'cp-panels-collapsed-'+name+'.png')});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  await buttons.first().click();await page.evaluate(()=>renderApp());assert.equal(await buttons.first().getAttribute('aria-expanded'),'true');
  await page.locator('[data-roster-character=cleric]').click();assert.equal(await page.locator('.cp-panel-toggle[aria-expanded=false]').count(),4);assert.match(await page.locator('#cp-assessment').innerText(),/LadyFuria/);
  await page.locator('[data-roster-character=main]').click();assert.equal(await buttons.first().getAttribute('aria-expanded'),'true');
  await page.evaluate(()=>{const p=activePlan('character','main');delete p.milestoneTrack;p.stages=[{id:'legacy-stage',title:'Preparação e marco de 1.900 iLvl',description:'',position:0,objectives:[{id:'legacy-task',description:'Tarefa preservada',details:'',position:0,done:false,completedAt:null}]}];saveState();renderApp()});
  assert.equal(await page.locator('#cp-desired-target').textContent(),'101,21');await page.locator('[data-expansion-id=cp-plan-target]>summary').click();
  const preserved=await page.evaluate(()=>JSON.stringify({characters:AION_STATE.data.characters,objectives:activePlan('character','main').stages[0].objectives,references:AION_STATE.data.cpAssessment.references}));
  await page.locator('#cp-edit-target').click();await page.locator('#cp-target').fill('110000');await page.locator('#cp-dialog button[type=submit]').click();
  assert.equal(await page.evaluate(()=>cpPersonalTarget(cpSelectedCharacter()).target),110000);
  assert.equal(await page.evaluate(()=>accountCharacterProgress(cpSelectedCharacter()).combatPower.target),101.21);
  assert.equal(await page.evaluate(()=>JSON.stringify({characters:AION_STATE.data.characters,objectives:activePlan('character','main').stages[0].objectives,references:AION_STATE.data.cpAssessment.references})),preserved);
  await page.reload();assert.equal(await page.locator('.cp-panel-toggle[aria-expanded=false]').count(),4);
  assert.equal(await page.evaluate(()=>cpPersonalTarget(cpSelectedCharacter()).target),110000);
  assert(await page.evaluate(()=>{const b=backupPayload();restoreBackup(b);return cpPersonalTarget(cpSelectedCharacter()).target===110000}));
  assert(await page.evaluate(()=>{const p=activePlan('character','cleric'),s=currentMilestone(p);saveCPPersonalTarget(p.id,s.id,90000,true);saveState();loadState();const c=AION_STATE.data.characters.find(c=>c.id==='cleric');return cpPersonalTarget(c).target===90000}));
  await page.locator('.cp-panel-toggle').first().click();await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);console.log('PASS painéis CP: seletor único, quatro painéis recolhidos, teclado/expansão independente por personagem, meta legada editável, checklists/referências/histórico preservados, Home, reload/backup e três capturas.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
