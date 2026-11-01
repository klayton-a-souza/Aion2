# Programação comunitária — Global LA / Triniel

[Índice da documentação](README.md)

Atualização solicitada pelo usuário com o anexo “Preenchimento da programação de eventos do Global LA”. Data da pesquisa informada: 01/11/2026. Facção: Asmodianos. Estes dados são referências comunitárias, não calendário oficial integral da NCSOFT.

## Programação inicial

Todos os horários abaixo usam America/Sao_Paulo, exceto os resets, que têm referência fixa UTC.

| Evento | Aberturas | Entrada/inscrição | Encerramento utilizado |
| --- | --- | --- | --- |
| Festival Shugo | Diário, 00:00–23:00, a cada 60 min | 00–03 de cada hora | Janela aproximada de 10 min; partida de aproximadamente 3–5 min após entrada |
| Invasão Dimensional | Diário, 00:30–23:30, a cada 60 min | 30–33 de cada hora | Janela total aproximada de 13 min; referência alternativa de 15 min registrada na observação |
| Fenda Espaço-Temporal | Diário: 02, 05, 08, 11, 14, 17, 20 e 23h | Primeiros 10 min | Aproximadamente 60 min |
| Kaira, a Vigilante | Diário: 01, 04, 07, 10, 13, 16, 19 e 22h | Não confirmada/não cadastrada | Até 30 min ou derrota |
| Cerco de Artefatos | Seg/qui/sáb, base 21:00 | Não confirmada/não cadastrada | Referência aproximada de 30 min |
| Executores do Abismo | Seg/qui/sáb, base 21:30 | Não cadastrada | Até 30 min ou derrota |
| Guardião Nahma | Sex/dom, base 21:00 | Não cadastrada | Até 30 min ou derrota |
| Arena de Táticas | Diário: 11:00–14:00 e 19:00–21:00 | Pareamento nas próprias janelas | 180 e 120 min de pareamento; não duração de cada partida |
| Reset diário do Global | Diário, 07:00 UTC / 04:00 São Paulo | Não se aplica | Marco instantâneo |
| Reset semanal do Global | Quarta, 07:00 UTC / 04:00 São Paulo | Não se aplica | Marco instantâneo |

Há dez conteúdos programados e o modelo “Outros eventos Global LA” ainda pendente. O ID original chefes-mundiais foi reaproveitado para Kaira quando o registro era apenas o modelo original vazio; não há um segundo cadastro de Kaira criado sobre esse modelo.

## Grupos e pendências

Cerco: variantes 21:00, 21:05 e 21:10. Executores: 21:30, 21:35 e 21:40. Nahma: 21:00, 21:05 e 21:10.

Cada evento guarda três alternativas, mas selectedGroup começa null. Somente o horário-base gera a abertura enquanto o grupo for desconhecido. Escolher um grupo no editor substitui o horário efetivo, não acrescenta três ocorrências. A interface avisa “Horário comunitário — sujeito a confirmação” e “Horário-base; grupo de Triniel não identificado”. Nenhum número de pares/pareamento da NCSOFT foi convertido em grupo de horário.

Continuam pendentes: grupo de horário de Triniel e confirmação Global dos chefes Executioner Dramos, Ravager Marakha e Turncoat Ducal, do Abismo médio. Eles aparecem apenas como nomes cuja confirmação está pendente, não como novos eventos fixos separados. Os nomes comunitários do Abismo inferior foram mantidos na descrição dos Executores.

Chefes comuns de Altgard/Verteron não receberam cronômetros artificiais. Acompanhamento de último abate/respawn permanece fora desta atualização.

## Fontes e confiabilidade

Os URLs, datas de consulta e datas de atualização fornecidos foram preservados em cada evento. A fonte/data atuais continuam editáveis; as referências originais ficam em community.sources para rastreabilidade. Confiabilidade comunitária e sua observação também são editáveis. Os eventos permanecem com validation manual, inclusive os de alta confiança comunitária; não foram marcados como oficiais.

Além do anexo, foi possível conferir nesta atualização:

- https://aion2.gg/tools/event-timer/shugo-festival — abertura horária e inscrição curta, com seleção de região e aviso de relógio provisório.
- https://aion2classes.com/shugo-festival — abertura e inscrição de três minutos; atualização indicada em 24/10/2026; duração de partidas varia.
- https://6sword.com/es/aion2/timers — possui seção específica Latin America, distinguindo região de idioma e indicando programação regional para Shugo/Fendas.

O endpoint https://aion2tierlist.com/pt/dimensional-invasion-timer retornou falha de recuperação na consulta automatizada. Ele foi preservado como fonte fornecida pelo usuário, sem alegar verificação independente. Não se alega confirmação independente de todos os outros URLs: a programação solicitada é a pesquisa comunitária entregue pelo usuário, com suas ressalvas.

## Semântica das fases

A abertura, janela de entrada e limite de permanência são campos separados. O início da atividade fica explicitamente desconhecido quando não foi confirmado separadamente; nenhum horário adicional foi inferido apenas a partir do fechamento da inscrição. É possível registrar um offset de início conhecido no editor.

durationKind diferencia duração cadastrada, aproximada, permanência máxima, pareamento, marco instantâneo e encerramento desconhecido. Contagens e estados deixam claro quando o fim é estimado ou apenas limite previsto. Uma derrota antecipada de chefe não pode ser detectada automaticamente. Os resets são instantes sem duração fictícia. Arena usa openingWindows, com duas durações próprias e duas janelas de entrada; a duração da partida não é calculada a partir dessas janelas.

Os avisos de aberturas comunitárias também identificam sua natureza comunitária/provisória. A chave de deduplicação por ID e instante de abertura continua igual.

## Migração conservadora

Versão do pacote: global-la-triniel-2026-11-01-v1. O calendário continua version 1 dentro do esquema principal 1.5.0, com novos campos opcionais validados.

- Só preenche automaticamente os modelos originais realmente vazios, sem horários/fuso/fonte, com nome e descrição originais.
- Preserva favoritos, estado ativo/inativo, vínculo de atividade, propriedades adicionais e todas as preferências.
- Cadastros personalizados já configurados, renomeados ou anotados não são substituídos.
- Antes de adicionar um evento ausente, procura ID e nomes equivalentes em português/inglês. Cadastros equivalentes existentes são mantidos com seu ID.
- Múltiplos candidatos geram um registro de conflito e aviso para revisão, sem consolidação destrutiva nem preenchimento automático daquele modelo.
- Uma biblioteca explicitamente vazia continua vazia. Eventos que o usuário limpar/remover depois de instalar o pacote não são recriados a cada abertura.
- O marcador do pacote impede reaplicação repetida. A migração efetiva é salva localmente quando o armazenamento permite escrita.
- Backups antigos continuam importáveis. Bibliotecas antigas recebem a migração apenas uma vez; personalizações continuam prevalecendo. Backups novos preservam fontes, grupos, janelas, metadados e avisos.

## Resets existentes

Nenhuma regra de reset foi alterada. O editor informa os resets atuais persistidos em Atividades, para comparação com os marcos informativos da agenda. js/cycles.js e js/activities.js permanecem sem alterações. O usuário pode ter resets diferentes e eles são preservados; configurar eventos de reset não modifica dias, horários ou conclusões de atividades.

## Arquivos e verificação

Implementação: index.html, js/events-data.js, js/events.js, css/events.css, js/events-community.js e js/events-community-ui.js. O cache de formatação de datas evita recriar formatadores para centenas de ocorrências da programação horária.

Testes novos: tests/events-community.test.cjs e tests/events-community.browser.cjs. Os testes anteriores de agenda foram atualizados para reconhecer os novos padrões; a fixture de dashboard isola o calendário para manter seus testes de ausência de programação, sem alterar os dados da aplicação.

- node --test tests/*.test.cjs: 19 testes/arquivos aprovados.
- Seis fluxos de navegador aprovados: programação comunitária, agenda anterior, Home, CP, Personagens e Marcos.
- Testados 24 Shugo/24 invasões diárias, Fenda/Kaira, alternativa de grupo única, Arena 180/120 min, resets instantâneos UTC, metadados, aliases/conflitos, dados personalizados, favoritos/inativas, edição após migração, reload, exportação/importação e ausência de duplicação.
- Chromium via file:// com rede offline e relógio controlado. Sem erros de console ou pageerror; sem overflow horizontal em desktop/mobile, inclusive no editor. Notificações nativas seguem simuladas nos testes, sem emissão real no sistema operacional.
- git diff --check aprovado; diff de js/cycles.js e js/activities.js vazio.

Capturas: a2-community-events-desktop.png e a2-community-events-mobile.png em C:/Users/Klayton/.codex/visualizations/2026/11/01/01a1965b-2141-77d3-82df-ac136d76ecf9/. O teste preserva um fuso de exibição UTC personalizado; por isso a captura mostra a conversão das horas da programação São Paulo, não troca do fuso dos eventos.

As verificações usaram perfis isolados; não houve acesso ao localStorage real do usuário. Recarregar o aplicativo aplica a migração aos modelos elegíveis. Não há sincronização com o jogo, API obrigatória, calendário oficial presumido ou alterações automáticas por patch.
