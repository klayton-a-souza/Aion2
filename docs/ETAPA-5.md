# Etapa 5 — Eventos e Horários

Relatório histórico · [Índice da documentação](README.md).

Atualização posterior: o usuário forneceu uma pesquisa comunitária para preencher a programação. A implementação e as pendências atuais estão no [guia de eventos Global LA](EVENTOS-GLOBAL-LA.md). O texto abaixo registra a entrega original, na qual os modelos ainda estavam pendentes.

## Estado inicial e preservação

Projeto C:/Users/Klayton/Documents/Repositorios/A2. Antes das edições, `git status --short --branch` mostrou main acompanhando origin/main, com as mudanças das Etapas 1–4 ainda não commitadas. Elas foram preservadas. O calendário continua local, sem build, backend, API, sincronização obrigatória ou dependência de internet em execução.

Arquivos desta etapa: index.html, js/events-data.js, js/events.js, css/events.css, tests/events.test.cjs, tests/events.browser.cjs e ETAPA-5.md. O novo módulo registra a rota #events e o botão de navegação sem substituir as rotas anteriores. Não houve alteração em js/cycles.js ou js/activities.js; o diff desses arquivos está vazio.

## Eventos cadastrados e validação Global LA

Seis modelos com IDs estáveis, todos sem horários, duração, inscrição ou fuso oficial presumidos:

| ID | Nome | Programação |
| --- | --- | --- |
| festival-shugo | Festival Shugo | Pendente |
| invasao-dimensional | Invasão Dimensional | Pendente |
| fenda-espaco-temporal | Fenda Espaço-Temporal | Pendente |
| chefes-mundiais | Chefes mundiais com horários fixos | Pendente |
| cerco-artefatos | Cerco de Artefatos | Pendente |
| outros-global-la | Outros eventos Global LA | Pendente |

Pesquisa realizada em 01/11/2026. Nenhum horário foi classificado como confirmado nem incorporado à programação padrão. Não foram copiados horários KR/TW, EU, NA ou de uma tabela Global genérica para LA.

Fontes consultadas:

- Portal oficial: https://aion2.plaync.com/en-us/index — a página acessível não forneceu uma tabela de eventos LA legível que permitisse concluir a validação.
- Shugo.GG: https://shugo.gg/timers — possui seção South America, mas ressalva que os horários Global não foram publicados pela NCSOFT e admite correções por servidor. Suas tabelas de Fenda/Cerco e conversões regionais diferem das do Aion2Classes.
- Aion2Classes: https://aion2classes.com/timers — tabela identificada como Global, baseada em UTC, com outra programação para Fendas/Cerco, também ressalvando ausência de publicação oficial completa. Não permite resolver sozinho o horário atual específico LA.
- Aion2.cl: https://aion2.cl/ — agenda comunitária SA, declara usar outras fontes comunitárias e não programação oficial. Também há diferenças de duração em relação às outras páginas.

Conclusão da pesquisa: não houve confirmação suficientemente consistente da programação atual LA. A ausência de padrão confirmado é explícita na interface. O usuário pode cadastrar horários observados no seu servidor com fonte/data e indicar qualidade “Manual” ou “Validada por mim para Global LA”. Essa última é declaração do usuário, não validação automática ou oficial do aplicativo.

## Estrutura e compatibilidade

eventCalendar é uma extensão opcional, version 1, do estado existente. Contém settings, events e alertHistory. Ao importar um estado antigo sem a extensão, os seis modelos pendentes são adicionados uma vez. Repetir a migração não acrescenta eventos. Uma extensão presente, inclusive com events vazio, é preservada; a migração não repõe modelos apagados nem sobrescreve programações existentes. IDs duplicados e dados inválidos são rejeitados antes de restaurar o backup.

Cada evento contém id, nome/descrição/categoria, timezone da programação, frequency diária/semanal, days, times, repeatMinutes, durationMinutes OU endTime, registration com offsets relativos à abertura, active, favorite, source, validatedOn, validation e activityId opcional. A atualização preserva o ID. Os horários podem ser editados sem recriar o registro. A atividade relacionada é uma referência ao cadastro existente; a agenda não marca conclusão, não renova entradas e não altera recompensas.

Preferências: displayTimezone inicia em America/Sao_Paulo; favoritesOnly é filtro da visualização; alertMinutes aceita desligado, 5 ou 10; alertsFavoritesOnly é independente do filtro de tela; browserNotifications inicia desativado. A chave local e o esquema principal 1.5.0 continuam existentes; backups incluem o calendário e as chaves de avisos.

## Cálculo da agenda

- Um único motor eventAgendaSnapshot alimenta Eventos, Home e avisos, sem calendário paralelo na Home.
- Converte datas civis no fuso de cada evento para instantes UTC, usando Intl.DateTimeFormat e conferência de ida/volta. A exibição usa o fuso configurado pelo usuário, independentemente do fuso do navegador.
- Dias da semana pertencem ao fuso da programação. A lista de hoje e o agrupamento dos próximos sete dias pertencem ao fuso de exibição.
- Aceita múltiplos inícios diários e semanais. Repetição opcional de 5 a 1440 minutos exige um único início e expande aberturas até 23:59 de cada dia selecionado; não é um intervalo contínuo entre dias. A interface explica essa regra.
- Busca as ocorrências desde dois dias anteriores até oito dias posteriores, suficiente para as recorrências semanais e encerramentos aceitos. Duração conhecida aceita 1 a 1440 minutos. Encerramento em hora igual/anterior ao início é no dia seguinte, no fuso do evento.
- Horário civil inexistente na transição de horário de verão é ignorado. Horário repetido gera apenas a primeira ocorrência. Fusos fracionários também são suportados. As regras vêm da base de fusos do navegador.
- Estados: Programado, Abre em breve (até dez minutos), Aberto, Inscrição encerrada, Encerrado e Horário não configurado. Quando a abertura passou e o fim não é conhecido, mostra “Encerramento não informado”, sem inventar duração. Eventos inativos ficam fora da agenda, mas continuam editáveis.
- Inscrição usa offsets em minutos em relação ao início. Pode começar antes ou depois da abertura. O horário de fechamento, quando informado, determina o aviso de inscrição encerrada independentemente da recompensa.
- Próximo destaque prioriza evento conhecido ainda em andamento; caso contrário, a próxima abertura. Home mostra as três próximas aberturas em ordem, inclusive múltiplas aberturas do mesmo conteúdo. O filtro de favoritos também se aplica à Home.
- Contagens atualizam a cada segundo com o aplicativo aberto. O conteúdo da página se atualiza quando muda minuto/estado ou configuração; campos de preferências em edição são preservados. Eventos encerrados mostram a data de encerramento, sem cronômetro zero enganoso.

## Avisos

Avisos são opt-in: inicialmente desligados. Com antecedência de cinco ou dez minutos, são elegíveis apenas aberturas futuras dentro da janela. Ao retomar a aba dentro da janela, o aviso pode ser mostrado imediatamente. Não são emitidos retroativamente depois do início. Cada chave é id + instante UTC de abertura: mudar o aviso de cinco para dez minutos, re-renderizar, recarregar ou restaurar o mesmo backup não cria um segundo aviso para a mesma abertura.

As chaves são preservadas em alertHistory; registros de mais de 14 dias são removidos quando há novos avisos. Sem armazenamento gravável, a deduplicação funciona na sessão, mas não se garante entre recargas. Há mesclagem das chaves locais antes de emitir, como mitigação entre abas; operações localStorage não são uma transação entre abas, portanto disparos rigorosamente simultâneos em abas distintas não têm garantia absoluta de exclusão mútua.

Avisos visuais aparecem na área global do aplicativo e expiram quando a abertura chega. Notificação do navegador só é solicitada pelo botão explícito “Autorizar notificações do navegador”. Se a API estiver ausente, a permissão for negada ou a emissão falhar, os avisos visuais permanecem. Notificações podem ser desativadas na interface. Não há service worker, push, backend ou promessa de aviso com a página fechada. Abas em segundo plano podem sofrer limitação de timers do navegador/SO.

## Testes e evidências

- `node --test tests/*.test.cjs`: 18 testes/arquivos aprovados, incluindo regressões anteriores.
- tests/events.test.cjs: próxima abertura, hora/dia/mês/ano/ano bissexto, semanal, repetição, fuso UTC/São Paulo/Kathmandu, horário de verão inexistente/duplicado em Nova York, encerramento cruzando meia-noite, inscrição, fim desconhecido, favorito/inativo, avisos únicos mesmo ao mudar antecedência, validação, migração idempotente, persistência/backup atômico e ausência de mudanças nos resets/atividades.
- tests/events.browser.cjs: Chromium file:// com rede offline, relógio controlado e notificações simuladas. Rota #events inicial, modelos pendentes, edição manual/ID estável, erro de fuso, semanal, favoritos, fuso de exibição, Home usando as mesmas ocorrências, atualização de contagem/estados, autorização somente após clique, ausência de duplicação após reload, fallback sem Notification, download/importação de arquivo real, persistência e resets inalterados.
- Regressões de navegador de Dashboard, CP, Personagens e Marcos aprovadas.
- Capturas/overflow em 1440×1000, 820×1180 e 390×844; teste de texto a 200%, modal/Escape e restauração de foco aprovados. Sem pageerror ou console.error. Inspeção visual desktop/mobile identificou apenas um ajuste: apresentar horário de encerramento, em vez de contagem zerada, em eventos passados.
- `git diff --check`: aprovado; avisos LF/CRLF do Windows não representam erro de validação.

Capturas em C:/Users/Klayton/.codex/visualizations/2026/11/01/01a1965b-2141-77d3-82df-ac136d76ecf9/: a2-events-pending.png, a2-events-desktop.png, a2-events-tablet.png e a2-events-mobile.png. Horários exibidos nas capturas programadas são explicitamente SINTÉTICOS, exclusivos dos testes, e não são valores padrão do aplicativo.

Para repetir: configure PLAYWRIGHT_MODULE=C:/Users/Klayton/Documents/Repositorios/Aion2-Analyzer/node_modules/playwright e A2_EVIDENCE_DIR para as capturas; execute node tests/events.browser.cjs. Nenhuma dependência foi instalada.

## Pendências e limites

É necessário obter/validar a programação do servidor Global LA do usuário antes de preencher os modelos reais. Programação, duração, inscrições e vínculos de atividades permanecem manuais. O relógio e a base de fusos do dispositivo precisam estar corretos. Não há calendário de manutenção ou atualização automática por patch. Não houve acesso ao armazenamento real do usuário, teste de notificações nativas no sistema operacional, Firefox/Safari ou auditoria com leitor de tela. Atividades e seus resets permaneceram independentes e inalterados.
