# Refinamento de interface e usabilidade

## Estado inicial e escopo

Antes das alterações, o repositório estava limpo em `main`, dois commits à frente de `origin/main`. A revisão com a skill `frontend-polish` cobriu Visão Geral, Personagens, Progressão, Atividades e Eventos e Horários.

A aplicação continua sendo HTML, CSS e scripts clássicos, com módulos organizados por funcionalidade e compostos em `js/bootstrap.js`. Permanecem as cinco rotas, a persistência local, o backup JSON e o funcionamento direto de `index.html` via `file://`. Não houve alteração do esquema de dados, dos horários cadastrados ou dos cálculos de agenda e reset.

## Alterações

- **Visão Geral:** as próximas ações aparecem logo após o resumo da conta, antes do detalhamento dos personagens. O foco por teclado é preservado ao concluir uma ação.
- **Personagens:** ficha e avaliação de CP acompanham a mesma seleção. Consultar outro personagem não troca o personagem ativo da Home. No celular, a lista usa duas colunas compactas.
- **Progressão:** mensagens de etapas vazias ou finalizadas não são usadas para jornadas com marcos pendentes. Estados são apresentados em português; planejamentos adicionais ficam em uma seção recolhível. Planos antigos continuam acessíveis e suas conclusões são preservadas.
- **Atividades:** as diárias começam visíveis. O seletor de personagem permanece acessível; filtros administrativos e as opções de cada atividade ficam recolhíveis. Os checklists e os ciclos continuam usando o mesmo estado.
- **Eventos:** a lista inicial mostra até dez aberturas atuais/futuras de hoje. As demais e as anteriores ficam em grupos expansíveis. A edição de janelas passa a usar campos de horário, duração e inscrição; metadados e opções avançadas ficam recolhíveis. Inscrições desconhecidas permanecem sem informação, sem assumir uma janela de entrada.
- **Interface móvel:** menu inicialmente recolhido, botões de backup com largura distribuída e controles de expansão com área mínima de 44 px. O menu pode ser expandido normalmente.

## Arquivos

- `js/shared/usability.js` e `css/usability.css`: refinamentos de apresentação e composição com as extensões existentes.
- `index.html` e `js/bootstrap.js`: carregamento e inicialização do refinamento.
- `js/characters/roster.js`, `js/cp/view.js` e `js/dashboard/account-dashboard.js`: sincronização do contexto da ficha e da avaliação.
- `js/progression/plans.js` e `js/progression/milestones.js`: mensagens e compatibilidade entre planos tradicionais e marcos.
- `js/events/view.js`: apresentação progressiva da lista de hoje, reutilizando os cálculos existentes.
- `tests/usability.browser.cjs`: regressão dos novos fluxos e capturas.
- `tests/events.browser.cjs` e `tests/events-community.browser.cjs`: adaptação às opções avançadas e à edição visual.

## Comparação visual

Medições aproximadas em uma conta de teste com quatro personagens, tarefas e programação comunitária. Não representam alterações nos dados reais do usuário.

| Indicador | Antes | Depois |
| --- | ---: | ---: |
| Início das próximas ações, desktop | 1.568 px | 407 px |
| Início das próximas ações, celular | 3.420 px | 634 px |
| Altura inicial de Eventos, desktop | 15.873 px | 3.341 px |
| Altura inicial de Eventos, celular | 17.245 px | 4.110 px |

A redução ocorre pela hierarquia e pelos grupos recolhíveis; nenhuma abertura foi excluída. Expandi-los aumenta novamente a altura da página.

## Validação

- 21 arquivos de testes Node aprovados: arquitetura, cadastro, CP decimal, marcos, planos antigos, atividades, catálogo, migração, importação/exportação, agenda e resets.
- Oito suítes Playwright/Chromium via `file://`: dashboard, personagens, marcos, avaliação de CP, CP decimal, eventos, programação comunitária e usabilidade.
- Capturas das cinco páginas em desktop (1440 × 1000), tablet (820 × 1180) e celular (390 × 844), com dados isolados.
- Ausência de scroll horizontal nas três larguras; texto ampliado para 200% no celular; nenhuma exceção JavaScript ou erro de console no cenário de usabilidade.
- Verificadas ações por teclado, foco após atualização, fechamento de modal com Escape, seleção compartilhada sem mudar o ativo e preservação dos dados ao expandir ferramentas.
- Edição visual de janela de evento validada, incluindo a preservação de inscrição desconhecida.

Para os testes de navegador, use uma instalação existente do Playwright em `PLAYWRIGHT_MODULE`. `A2_EVIDENCE_DIR` define o destino das capturas, sem exigir dependências para executar a aplicação.

As evidências locais desta revisão ficam em `C:/Users/Klayton/.codex/visualizations/2026/11/01/01a1965b-2141-77d3-82df-ac136d76ecf9`: `audit-*.png` (antes) e `final-*.png` (depois). Não são necessárias ao funcionamento do projeto e não são incluídas no repositório.

## Limitações

### Ajuste posterior da ficha de personagem

Corrigida a sobreposição de iLvl e CP: as duas métricas recebiam a mesma área `level` do CSS Grid. CP e sua data de atualização agora têm áreas próprias em desktop e celular. Removidos o histórico duplicado no card e o botão redundante de avaliação; a seção CP e histórico permanece sincronizada com a seleção, preservando os registros armazenados.

Arquivos deste ajuste: `css/characters.css`, `js/characters/history.js`, `js/cp/view.js` e `tests/character-layout.browser.cjs`. Capturas comparáveis `character-layout-before-*.png` e `character-layout-after-*.png` na pasta de evidências acima, nas mesmas três larguras. Testes: 21 arquivos Node, cadastro/histórico, avaliação de CP e novo teste de layout aprovados via `file://`. O novo teste verifica separação geométrica das métricas, seleção automática sem mutação de dados, histórico centralizado e ausência de overflow, inclusive com texto ampliado.

A validação automatizada foi executada em Chromium com dados de teste; não inclui uma avaliação com leitores de tela ou uma matriz de navegadores. Referências comunitárias e horários mantêm as limitações de confiabilidade já documentadas. Nenhum commit foi criado nesta entrega.

[Voltar à documentação](README.md)
