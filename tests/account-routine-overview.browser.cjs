const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

async function checkOverview(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.setFixedTime(new Date('2026-11-24T15:00:00Z'));
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '#home');
  const panel = page.getByRole('region', {name: 'Visão geral da conta'});
  const rows = panel.getByRole('listitem');
  const daily = panel.getByRole('button', {name: /Diárias/});
  const weekly = panel.getByRole('button', {name: /Semanais/});
  const pending = panel.getByLabel('Só pendentes');
  assert.match(await panel.innerText(), /Nenhuma atividade ativa/);

  await page.evaluate(() => {
    AION_STATE.data.characters = ['Lyra', 'Vega'].map((name, i) => ({
      name, id: name, className: 'Clériga', ilevel: 1200, type: i ? 'alt' : 'main'
    }));
    addCatalogSelection(['Lyra', 'Vega'].map(characterId => ({
      modelId: 'nightmare', scope: 'character', characterId
    })), true);
    toggleActivity(AION_STATE.data.activities.find(a => a.characterId === 'Lyra').id, true);
    saveActivity({name: 'Presença', scope: 'account', frequency: 'daily'});
    const raid = saveActivity({name: 'Raide', scope: 'account', frequency: 'weekly'});
    toggleActivity(raid.id, true);
    saveActivity({name: 'Pausada', scope: 'account', frequency: 'daily'}).active = false;
    renderApp();
  });
  const stored = await page.evaluate(() => JSON.stringify(AION_STATE.data));
  await page.getByRole('button', {name: 'Ver progresso da conta'}).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('id'), 'account-routine-title');
  assert.match(await daily.innerText(), /1 de 3/);
  assert.match(await weekly.innerText(), /1 de 1/);
  assert.match(await panel.locator('.routine-totals').innerText(), /2 de 4/);
  assert.equal(await rows.count(), 2);
  const nightmare = rows.filter({hasText: 'Pesadelo'});
  assert.match(await nightmare.innerText(), /Pendente · Vega/);
  assert.match(await nightmare.innerText(), /Concluído · Lyra/);
  assert.match(await rows.filter({hasText: 'Presença'}).innerText(), /Pendente · Conta/);
  await pending.check();
  assert.doesNotMatch(await nightmare.innerText(), /Lyra/);
  await weekly.focus();
  await page.keyboard.press('Enter');
  assert.equal(await weekly.getAttribute('aria-pressed'), 'true');
  assert.match(await panel.innerText(), /Todas as atividades deste ciclo foram concluídas/);
  assert.equal(await page.evaluate(() => JSON.stringify(AION_STATE.data)), stored);

  await page.locator('#account-character').selectOption('Vega');
  assert.equal(await weekly.getAttribute('aria-pressed'), 'true');
  await page.locator('#account-open-checklists').click();
  await page.locator('#activities-summary').getByRole('checkbox', {name: /Pesadelo/}).check();
  await daily.click();
  assert.equal(await pending.isChecked(), true);
  assert.match(await daily.innerText(), /2 de 3/);
  assert.equal(await nightmare.count(), 0);
  await page.reload();
  assert.match(await nightmare.innerText(), /Concluído · Lyra, Vega/);

  await page.clock.setFixedTime(new Date('2026-11-25T15:00:00Z'));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  assert.match(await daily.innerText(), /0 de 3/);
  assert.match(await weekly.innerText(), /1 de 1/);
  for (const width of [320, 820, 1440]) {
    await page.setViewportSize({width, height: 900});
    assert.equal(await panel.evaluate(el => el.scrollWidth <= el.clientWidth), true);
  }
  assert.deepEqual(errors, []);
}

(async () => {
  const browser = await chromium.launch();
  try {
    await checkOverview(await browser.newPage());
    console.log('PASS visão geral da conta: contagem por rotina, filtro, teclado, checklist individual, persistência e reset diário.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
