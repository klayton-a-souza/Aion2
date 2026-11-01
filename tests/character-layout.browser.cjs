const expandCPAnalysis=require('./helpers/cp-panels.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {seedDashboard}=require('./dashboard-account.fixture.cjs');
(async()=>{const browser=await chromium.launch();try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#characters');
  await seedDashboard(page);await expandCPAnalysis(page);await page.evaluate(()=>navigateTo('characters'));
  const before=process.env.A2_LAYOUT_BEFORE==='1';
  for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]]){
    await page.setViewportSize({width,height});
    await page.screenshot({path:path.join(process.env.A2_EVIDENCE_DIR||os.tmpdir(),'character-layout-'+(before?'before-':'after-')+name+'.png')});
    if(!before){
      const level=await page.locator('.character-detail-card>.ilevel').first().boundingBox(),cp=await page.locator('.character-cp').boundingBox();
      assert(level.y+level.height<=cp.y,'iLvl e CP não devem se sobrepor');
      assert.equal(await page.locator('[data-cp-open]').count(),0);
      assert(!await page.locator('#character-detail').innerText().then(t=>t.includes('Histórico de evolução')));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    }
  }
  if(!before){
    const state=await page.evaluate(()=>JSON.stringify(AION_STATE.data));
    await page.locator('[data-roster-character=cleric]').click();
    assert.equal(await page.evaluate(()=>cpSelectedCharacter().id),'cleric');
    assert.match(await page.locator('#cp-assessment').innerText(),/LadyFuria/);
    assert.equal(await page.evaluate(()=>JSON.stringify(AION_STATE.data)),state);
    assert.equal(await page.locator('#cp-assessment summary').filter({hasText:'Atualizações recentes'}).count(),1);
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.deepEqual(errors,[]);
  }
  console.log('PASS layout personagens: '+(before?'capturas iniciais':'métricas separadas, histórico centralizado, avaliação automática, dados preservados, três larguras e texto 200%'));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
