# Etapa 3 — Dashboard da conta

Relatório histórico · [Índice da documentação](README.md).

## Estado inicial e arquitetura

Diretório: C:/Users/Klayton/Documents/Repositorios/A2. Antes das alterações, Git estava em main acompanhando origin/main, com as alterações das Etapas 1 e 2 ainda não commitadas. Foram preservadas: index.html, js/app.js, tests/context-dashboard.test.cjs, ETAPA-1.md, ETAPA-2.md, js/character-progress.js, js/milestones.js e os testes de navegador/domínio correspondentes. Não havia AGENTS.md ou package.json no projeto. Aplicação convencional, scripts globais, CSS, hash routes, localStorage e JSON; sem build ou servidor.

## Implementação

- index.html carrega css/account-dashboard.css e js/account-dashboard.js após os módulos existentes.
- js/account-dashboard.js deriva resumo e cards dos mesmos characters/plans/stages/objectives utilizados em Personagens e Progressão. Não migra, cria ou reescreve dados ao renderizar.
- Resumo: quantidade de personagens, Main definido pelo type existente, marco atual do Main e marcos confirmados/total das jornadas permanentes de personagens presentes, excluindo planos cancelados. Não mistura iLvl e CP numa nota de desempenho nem apresenta uma etapa global fictícia quando os personagens estão em etapas diferentes.
- Card do Main: classe, iLvl e CP atuais/metas, barras separadas, situação do marco, próximo objetivo de conteúdo cadastrado e melhoria/tarefa pendente. Na ausência de metas ou conteúdos, mostra ausência explícita; não estima requisitos oficiais.
- Alts: cards dinâmicos com métricas compactas, CP conhecido mesmo sem meta, situação e requisitos atingidos do marco, principal pendência e links reais para planejamento/ficha. Main é dinâmico: mudar o personagem ativo não muda o Main.
- Próximas ações: até três, primeiro o Main e uma por personagem antes de preencher vagas adicionais. Requisitos obrigatórios precedem recomendações; tarefas concretas precedem metas numéricas dentro de cada grupo. Marcos bloqueados não geram ações executáveis. Ações manuais usam setObjectiveDone/changePlans; valores numéricos levam ao planejamento. Finalizar uma tarefa não confirma o marco automaticamente.
- Eventos: estado vazio, sem dados de calendário, horários ou contadores inventados. O espaço anuncia que apresentará até três eventos quando houver programação válida; integração pertence à Etapa 5.
- Seleção/contexto e checklists anteriores continuam disponíveis em uma área details, recolhida inicialmente, acessível por botão. Os nós foram movidos, preservando handlers e IDs. Não foram substituídos formulários, atividades, resets, rotas ou backups.
- CSS usa os tokens existentes, borda discreta para o Main, grade responsiva, alvos com ao menos 44px e foco visível. A correção do menu com texto ampliado apenas permite quebra das palavras, sem ocultar overflow.

## Evidências visuais e frontend-polish

Skill utilizada: C:/Users/Klayton/.agents/skills/frontend-polish/SKILL.md. Orientou a matriz comparável, as verificações de foco/tamanho de toque e o encerramento em três rodadas.

Capturas via file:///C:/Users/Klayton/Documents/Repositorios/A2/index.html#home, Chromium isolado, mesmos quatro personagens e mesmos planos/tarefas da fixture tests/dashboard-account.fixture.cjs. A fixture é exclusiva de testes e não é carregada pela aplicação. Referências e conteúdo de teste não alteram o perfil real do usuário.

Dimensões: desktop 1440×1000, tablet 820×1180, mobile 390×844. Capturas de página inteira, portanto o PNG pode ter altura superior ao viewport. Diretório de evidências: C:/Users/Klayton/.codex/visualizations/2026/11/01/01a1965b-2141-77d3-82df-ac136d76ecf9/.

1. Linha de base: a2-home-before-desktop.png, a2-home-before-tablet.png e a2-home-before-mobile.png. O personagem ativo dominava a página e o plano aparecia novamente abaixo; não havia visão conjunta dos alts.
2. Rodada 1: a2-home-after-r1-desktop.png, a2-home-after-r1-tablet.png e a2-home-after-r1-mobile.png. Hierarquia da conta, Main e alts implementada; regressão unitária aprovada. Inspeção revelou espaço excessivo nas métricas dos alts e prioridade excessiva para metas numéricas.
3. Rodada 2: cards de alts compactados e tarefas concretas priorizadas. Interações reais aprovadas, mas teste combinado de texto a 200% e nome importado longo revelou overflow.
4. Rodada 3: colunas minmax(0,1fr), larguras mínimas e quebra de texto corrigidas. Capturas finais: a2-home-after-desktop.png, a2-home-after-tablet.png, a2-home-after-mobile.png e a2-home-empty-mobile.png. Sem overflow nas três larguras e no cenário com texto ampliado/nome longo. Estado vazio e capturas desktop/tablet inspecionados visualmente. Não houve quarta rodada de refinamento.

## Testes

- node --test tests/*.test.cjs: 16 testes/arquivos aprovados, preservando testes de planos, migração, ciclos, resets, navegação, personagem ativo e checklists.
- node tests/dashboard-account.browser.cjs: aprovado via file://. Barras iLvl/CP independentes, limite de três ações, conteúdo derivado dos objetivos, ausência de mutação na renderização, conclusão por Enter e foco visível/restaurado, propagação para Progressão, Main independente do personagem ativo, rota/ficha correta, edição manual e reload, seleção persistida, atividade compartilhada, fechamento de modal com Escape e restauração do foco, roundtrip de backup, viewports, alvos de toque, texto 200%, nomes longos, reduced motion e estado vazio. Sem pageerror ou console.error.
- node tests/character-progress.browser.cjs: aprovado, regressão da Etapa 1.
- node tests/milestones.browser.cjs: aprovado. O teste passou a abrir a nova área de checklists antes de interagir com os controles; as verificações anteriores foram mantidas.
- git diff --check: aprovado (avisos habituais de conversão LF/CRLF no Windows).

Reprodução: disponibilize Playwright no ambiente ou configure PLAYWRIGHT_MODULE=C:/Users/Klayton/Documents/Repositorios/Aion2-Analyzer/node_modules/playwright. Para screenshots, A2_EVIDENCE_DIR define o destino. tests/dashboard-account.capture.cjs aceita A2_CAPTURE_STAGE para nomear as capturas. Nenhuma dependência foi instalada.

## Limites

Calendário e programação de eventos não foram implementados. Próximo conteúdo depende de tarefa content cadastrada no marco atual. Metas de CP continuam sugestões internas. Testes foram executados em Chromium isolado, sem examinar ou modificar o localStorage real do usuário. Não houve teste com leitor de tela, auditoria WCAG completa ou execução em Firefox/Safari. Não há estatísticas de combate, previsão de tempo, sincronização com jogo ou dados inventados na aplicação.
