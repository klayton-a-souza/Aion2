const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    page.setDefaultTimeout(8000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve('index.html')).href);
    await page.evaluate(() => {
      AION_STATE.data.characters = [
        {id:'main',name:'Principal',className:'Templário',ilevel:100,type:'main',server:'Triniel',faction:'Elyos'},
        {id:'alt',name:'Alternativo',className:'Clérigo',ilevel:100,type:'alt',server:'Triniel',faction:'Elyos'}
      ];
      activityVisibility.management.weekly = false;
      navigateTo('activities');
      renderActivities();
    });
    await page.locator('#activity-character').selectOption('main');
    await page.getByRole('button',{name:'Adicionar a Principal',exact:true}).click();
    assert.equal(await page.locator('[data-model=stigma-shards]').count(),0);
    assert.equal(await page.locator('[data-model=abyss-corridor]').count(),1);
    for (const [id,name] of [
      ['abyss-commands','Missões de Comando do Abismo'],['abyss-siege','Cerco de Artefatos'],
      ['abyss-solitude','Arena da Solidão'],['abyss-cooperation','Arena da Cooperação'],['abyss-tactics','Arena da Tática']
    ]) {
      await page.locator('#catalog-search').fill(name);
      await page.locator('#catalog-frequency').selectOption('daily');
      assert.equal(await page.locator('.catalog-item:visible').count(),0);
      await page.locator('#catalog-frequency').selectOption('weekly');
      assert.equal(await page.locator('.catalog-item:visible').count(),1);
      const model = page.locator('[data-model='+id+']');
      assert.equal(await model.locator('.catalog-character').inputValue(),'main');
      await model.locator('.catalog-picked').check();
    }
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button',{name:'Adicionar selecionadas'}).click();
    assert.equal(await page.locator('#catalog-error').isVisible(),false,await page.locator('#catalog-error').textContent());
    assert.deepEqual(await page.evaluate(()=>AION_STATE.data.activities.map(a=>a.catalogId)),
      ['abyss-commands','abyss-siege','abyss-solitude','abyss-cooperation','abyss-tactics']);
    const commands = page.locator('#management-activity-list-weekly .objective').filter({hasText:'Missões de Comando do Abismo'});
    await commands.locator('summary').click();
    await commands.getByRole('button',{name:'Informações'}).click();
    const modal = page.locator('#activity-dialog .modal');
    await modal.getByRole('button',{name:'Registrar compra'}).click();
    await modal.getByRole('button',{name:'Ativar pergaminho'}).click();
    await modal.getByLabel('AP obtidos').fill('300');
    await modal.getByRole('button',{name:'Concluir missão'}).click();
    assert.match(await modal.innerText(),/Missões concluídas: 1 · AP obtidos: 300/);
    assert.equal(await modal.evaluate(node => node.scrollWidth <= node.clientWidth + 1),true);
    await modal.getByRole('button',{name:'Fechar informações da atividade'}).click();
    const siege = page.locator('#management-activity-list-weekly .objective').filter({hasText:'Cerco de Artefatos'});
    await siege.locator('summary').click();
    await siege.getByRole('button',{name:'Informações'}).click();
    assert.match(await modal.innerText(),/Próximo cerco/);
    await modal.getByLabel('Raiz de Reshanta').selectOption('2');
    await modal.getByRole('button',{name:'Salvar controle dos artefatos'}).click();
    assert.equal(await modal.getByLabel('Raiz de Reshanta').inputValue(),'2');
    await modal.getByLabel('Medalhas obtidas').fill('2');
    await modal.getByRole('button',{name:'Registrar participação'}).click();
    assert.match(await modal.innerText(),/Participação nesta ocorrência: registrada/);
    await modal.getByRole('button',{name:'Fechar informações da atividade'}).click();
    const arena = page.locator('#management-activity-list-weekly .objective').filter({hasText:'Arena da Solidão'});
    await arena.locator('summary').click();
    await arena.getByRole('button',{name:'Informações'}).click();
    await modal.getByRole('button',{name:'Registrar vitória'}).click();
    await modal.getByRole('button',{name:'Registrar derrota'}).click();
    assert.match(await modal.innerText(),/Partidas: 2 · Vitórias: 1 · Derrotas: 1/);
    await modal.getByRole('button',{name:'Fechar informações da atividade'}).click();
    await arena.locator('.activity-row-tools').getByRole('button',{name:'Gerenciar vínculos'}).click();
    await modal.getByLabel('Alternativo').check();
    await modal.getByLabel('Conta compartilhada').check();
    await modal.getByRole('button',{name:'Salvar vínculos'}).click();
    await arena.locator('.activity-row-tools').getByRole('button',{name:'Gerenciar vínculos'}).click();
    await modal.getByLabel('Conta compartilhada').uncheck();
    await modal.getByRole('button',{name:'Salvar vínculos'}).click();
    assert.deepEqual(await page.evaluate(()=>AION_STATE.data.activities.filter(a=>a.catalogId==='abyss-solitude').map(a=>a.characterId)),['main','alt']);
    page.once('dialog', dialog => dialog.accept());
    await arena.getByRole('button',{name:'Remover de Principal'}).click();
    assert.equal(await arena.count(),0);
    await page.reload();
    assert.equal(await page.evaluate(() => AION_STATE.data.abyss.records.filter(row=>row.action==='complete').length),1);
    assert.deepEqual(errors,[]);
    console.log('PASS Abismo no celular: busca, filtros, personagens, registro, remoção, recarga, layout e console.');
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error);process.exitCode=1;});
