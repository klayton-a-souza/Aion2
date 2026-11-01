# Etapa 2 — Progressão escalonada

Relatório histórico · [Índice da documentação](README.md).

## Estado inicial

Antes das edições, `git status --short --branch` mostrou main acompanhando origin/main e as alterações da Etapa 1: index.html, js/app.js, tests/context-dashboard.test.cjs, ETAPA-1.md, js/character-progress.js e tests/character-progress.browser.cjs. Foram preservadas. A arquitetura continua estática, sem build, backend, fetch ou servidor obrigatório, com rotas por hash, armazenamento local e backup integral JSON.

## Dados e integração

Marcos são etapas reais de plans, e tarefas são objectives existentes. O módulo js/milestones.js adiciona metadados opcionais: plan.milestoneTrack; stage.milestone com confirmedAt, dependsOn e events; objective com kind, target e required. Os planos anteriores não são convertidos nem recriados. O esquema permanece 1.5.0, com validação da extensão opcional; versões anteriores continuam passando pelas migrações existentes. Marcadores e tarefas entram no mesmo backup e na mesma chave local.

A preparação é explícita no botão por personagem. Reutiliza o plano ativo desse personagem, preservando suas etapas/checklists; se não houver plano ativo, cria um plano e o ativa. Não anexa automaticamente a rascunhos antigos, nem resolve conflitos substituindo planos. Uma segunda jornada para o mesmo personagem é rejeitada, inclusive ao importar. Não há criação automática no carregamento.

São criados sete marcos com as metas solicitadas, incluindo a repetição de 1900 nas duas primeiras etapas dos alts. MästerFuria recebe uma preparação individual de 1600, identificada pelo nome normalizado no momento da preparação. Não se duplicam personagens nem se preenchem seus atributos. A classificação Main/alt existente determina o modelo inicial; mudar o Main depois não reescreve metas já configuradas. Alts começam sem meta de CP.

## Estados e confirmação

Um marco depende dos marcos anteriores do mesmo personagem. Valores numéricos são calculados a partir de ilevel/combatPower, sem gravar conclusões automáticas. Progresso numérico parcial indica Em andamento. Requisitos numéricos alcançados indicam Requisitos atingidos, inclusive quando ainda há tarefas obrigatórias pendentes. Conclusão exige todos os obrigatórios e clique de confirmação; recomendações ficam fora desse bloqueio. Os objetivos exibem seus estados e se são obrigatórios ou recomendados.

Reabrir um marco preserva tarefas, metas e eventos anteriores, acrescenta um evento de reabertura e volta a bloquear os marcos futuros ainda não confirmados. Marcos já confirmados continuam no histórico. O encerramento do plano também é manual. Planos encerrados mantêm a regra anterior de somente leitura.

Visão Geral e Progressão leem e alteram os mesmos objetos e usam o mesmo setter. Objetivos numéricos não aceitam marcação manual. Planos mistos conservam tarefas legadas nas duas telas. A Visão Geral não foi redesenhada.

## Configuração

O editor permite metas de iLvl e CP, CP obrigatório ou recomendado, tarefas de equipamento/aprimoramento/Arcanas/conteúdo/revisão e tarefas gerais. Tarefas já cadastradas mantêm seus IDs e conclusões. Metas já atingidas não podem ser reduzidas ou removidas pelo editor. Marcos confirmados precisam ser reabertos antes de editar. Novos marcos não possuem limite de iLvl. Os controles de ordem movem marcos não confirmados; IDs e histórico permanecem estáveis.

Um marco pode ser marcado como marco da conta pelo botão “+ Marco da conta”. Ele permanece dentro da jornada de um personagem, e outros personagens podem selecioná-lo como dependência explícita. Não foi inventada uma trava obrigatória Main→alts, pois o pedido não define esses vínculos. O editor aceita um gate da conta por marco, pertencente a outra jornada e sem dependência explícita própria; o formato de dados aceita uma lista. Ciclos, inclusive os formados pela ordem das etapas, são rejeitados. Se um plano referenciado for removido, o dependente fica bloqueado com indicação de vínculo pendente; não se perde o vínculo silenciosamente.

## Verificação

- `node --test tests/*.test.cjs`: regressão e teste de domínio dos novos marcos.
- `node tests/milestones.browser.cjs`: Chromium via file://; preparação explícita, edição de tarefa por categoria, iLvl/CP manual, checklist compartilhado, confirmação, reabertura, recarga, CP individual de alt, nova meta 4000, backup sem duplicação e largura móvel 390px sem overflow horizontal.
- `node tests/character-progress.browser.cjs`: regressão da Etapa 1 no navegador.
- Revisão visual de captura desktop da página de Progressão: Main destacado, checklist atual, futuros e histórico recolhidos, reaproveitando o CSS existente.
- Playwright reutilizado do ambiente Aion2-Analyzer; informe PLAYWRIGHT_MODULE para repetir. Não é dependência da aplicação.

## Limites

Não houve acesso ao armazenamento real do navegador do usuário. Os testes usam perfis isolados. Os equipamentos, Arcanas e conteúdos são tarefas descritivas manuais: não há catálogo de regras oficiais, API ou sincronização com o jogo. Dependências da conta devem ser configuradas pelo usuário. Importação continua sendo restauração integral com confirmação, sem mesclar dois backups. A sugestão inicial de CP do Main pode ser editada ou classificada como recomendação. Não há calendário ou novo dashboard.
