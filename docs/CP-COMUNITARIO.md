# Referências comunitárias de CP — outubro de 2026

## Origem e qualidade

Dados fornecidos pelo usuário no complemento da Etapa 4, referentes ao levantamento discutido em 31/10/2026. A fonte primária não foi disponibilizada nem validada; seu endereço permanece pendente de documentação. A coleta é registrada como **outubro de 2026**, sem inventar um dia. A compilação é de **31/10/2026**.

As medianas são aproximadas, comunitárias, preliminares e sem segmentação por classe. Não são médias oficiais do servidor Global LA nem requisitos de conteúdos. CP isolado não mede desempenho em combate.

| iLvl inclusivo | Mediana de CP | Relatos da faixa |
| --- | ---: | ---: |
| 1400–1599 | 72,00 | Não informado |
| 1600–1799 | 88,00 | 4 |
| 1800–1999 | 90,00 | Não informado |
| 2000–2199 | 92,00 | Não informado |
| 2200–2399 | 107,00 | Não informado |
| 2400–2599 | 120,00 | Não informado |
| 2600–2799 | 131,00 | 2 |
| 2800+ | 158,00 | 2 |

Os **62 relatos** representam o levantamento completo. Eles não são atribuídos individualmente às faixas sem documentação. Amostras conhecidas pequenas recebem alerta; amostras desconhecidas ficam explicitamente não informadas. Todas as classificações deste levantamento são provisórias.

## Modelo e compatibilidade

`js/cp/references.js` concentra o cadastro inicial, com IDs estáveis, datas e proveniência. `js/cp/domain.js` integra as referências ao modelo configurável já existente em `cpAssessment.references`.

O cadastro usa `communityStudyVersion: 2`. A migração de escala, autorizada pelo usuário, converte somente referências iniciais identificadas por ID, intervalo, marca preliminar e mediana original na escala antiga (por exemplo, 92000 → 92). A mediana anterior fica em `scaleMigrationFrom`. Valores personalizados e referências manuais são preservados. A migração é idempotente; recargas e importações não dividem os valores novamente nem recriam referências removidas de um cadastro já versionado. A estrutura continua aceitando backups anteriores sem os campos novos. Campos não relacionados, históricos, planos, metas e resets não são modificados.

O intervalo 2800+ usa `Number.MAX_SAFE_INTEGER` internamente, coerente com os limites numéricos do modelo; a interface mostra “sem limite superior”. No formulário, deixar o máximo vazio mantém esse significado.

As referências podem ser atualizadas pelo botão “Atualizar esta referência”, ou adicionadas em “Gerenciar referências e critérios internos”. Referências manuais utilizáveis têm prioridade sobre as preliminares. Entre referências da mesma categoria, continuam valendo os critérios existentes de classe/função, intervalo, data e amostra. Uma referência marcada como insuficiente não participa da classificação. A fonte permanece pendente até o usuário informar um endereço e confirmar manualmente sua documentação; o aplicativo não verifica páginas externas automaticamente.

A tabela acima já usa a escala decimal autorizada pelo usuário. A tabela original do levantamento foi dividida por mil somente no cadastro inicial de referências; personagens, históricos e metas gravadas não são convertidos. O suporte a CP decimal permanece: `98,30` equivale a `98.30`, e não a `98300`. Para uma comparação significativa, personagem e referência precisam usar a mesma unidade.

## Fórmulas e interface

- Razão: `CP atual / mediana`.
- Diferença percentual: `(razão - 1) × 100`.
- Limite inferior: `mediana × lowerRatio`, inicialmente 0,9.
- Limite superior: `mediana × upperRatio`, inicialmente 1,1.
- Abaixo: CP estritamente inferior ao limite; acima: estritamente superior. Os dois extremos pertencem à faixa.

A classificação interpreta os números decimais armazenados como coeficientes e expoentes, compara `CP` contra `mediana × ratio` usando produtos inteiros `BigInt`, sem arredondamento nas fronteiras. A representação persistida continua sendo `Number`; nenhum BigInt é exportado para o JSON. Medianas, limites e percentuais são arredondados apenas para apresentação, com até duas casas decimais.

A avaliação mostra iLvl e CP atuais, mediana aplicável, classificação, diferença percentual e origem/qualidade. A meta automática da faixa permanece em painel separado da mediana. Atualizar uma mediana recalcula a comparação e a meta automática, sem criar medições ou reescrever o histórico.

## Meta automática da faixa atual

O CP desejado passa a ser o primeiro número com duas casas decimais **estritamente acima** do limite superior configurado. Conceitualmente: `(floor(mediana × upperRatio × 100) + 1) / 100`. O produto e a divisão inteira são calculados em decimal exato com BigInt; não se arredonda o limite antes de decidir o próximo centésimo.

Exemplo: iLvl 2006, CP 98,30, mediana 92,00, limite superior de 110% = 101,20. A meta é **101,21**, faltando **2,91**. CP 101,20 continua na faixa; 101,21 está acima. A meta acompanha alterações de iLvl, da referência selecionada e do limite superior. Sem referência utilizável, fica indisponível; sem CP atual, a meta pode ser exibida, mas a diferença fica desconhecida.

`cpDesiredTarget` é a fonte compartilhada da análise e da Home. A projeção é somente leitura: não modifica metas de marcos futuros, requisitos, conclusões ou históricos. Metas já cadastradas continuam acessíveis em “Meta cadastrada no planejamento”, com suas ações de edição preservadas. Os quatro painéis continuam recolhidos por padrão.

A resolução de centésimos é limitada à representação segura de inteiros do JavaScript; valores extremos sem precisão segura não recebem uma meta automática. O navegador precisa oferecer suporte a BigInt (como os Chromium usados nos testes).

Novos testes: `tests/cp-auto-target.test.cjs` e `tests/cp-auto-target.browser.cjs`. Cobrem escala/migração, personalizações preservadas, classificação nas fronteiras, meta por faixa, atualizações de referência e critério, ausência de dados, recarga/backup e integração com a Home. Capturas: `cp-auto-target-desktop.png`, `cp-auto-target-tablet.png` e `cp-auto-target-mobile.png` na pasta de evidências abaixo.

## Validação e arquivos

### Painéis recolhíveis e seleção única

O seletor redundante “Personagem avaliado” foi removido. A análise acompanha a seleção do elenco. Meta pessoal, referência comunitária, gráfico de iLvl e gráfico de CP começam recolhidos; cada painel tem seu próprio botão Expandir/Ocultar, com `aria-expanded` e `aria-controls`. O estado de expansão é independente por personagem, mantido durante a sessão e reiniciado recolhido após recarregar. Expandir painéis não grava nem modifica dados de jogo.

Uma etapa antiga apenas com checklists não contém necessariamente uma meta numérica de CP. A mediana comunitária não deve preencher esse campo. A ausência agora é explicada, e “Definir meta pessoal” permite cadastrá-la na etapa ativa. Em etapas antigas, o valor fica em `personalCombatPowerTarget`, sem transformar checklists em requisitos automáticos ou converter o plano. Nos marcos novos, continua no requisito `combatPower`. As metas gravadas aparecem nos detalhes de planejamento da análise e nas respectivas etapas em Progressão. A Home usa a meta automática da faixa atual. Dados importados com essa meta inválida são rejeitados antes da restauração.

O teste `tests/cp-panels.browser.cjs` cobre os quatro painéis, teclado, seleção única, estados por personagem, meta legada, criação de requisito de CP em marco sem meta, persistência e backup. As suítes anteriores passaram a usar a seleção do elenco e abrir os painéis necessários. Capturas adicionais: `cp-panels-collapsed-desktop.png`, `cp-panels-collapsed-tablet.png` e `cp-panels-collapsed-mobile.png`.

Alterados: `index.html`, `js/cp/domain.js`, `js/cp/view.js`, os testes de avaliação e CP decimal e o índice da documentação. Novos: `js/cp/references.js`, `tests/cp-community.test.cjs`, `tests/cp-community.browser.cjs` e este documento.

23 arquivos de testes Node aprovados. O novo teste cobre os extremos de todas as oito faixas, inclusive 1599/1600, 2199/2200 e 2799/2800; fronteiras de 90% e 110% e valores imediatamente externos; CP ausente; referência inexistente; histórico vazio; amostras conhecidas/desconhecidas; prioridade manual; edição; migração idempotente; persistência e backup.

Oito suítes Chromium via `file://` aprovadas nesta atualização: meta automática, painéis recolhíveis, avaliação de CP, CP decimal, levantamento comunitário, dashboard, layout dos personagens e usabilidade. A nova suíte verifica os quatro personagens, edição, fonte pendente, recarga/backup e preservação das metas, ausência de erros de console e overflow. Capturas em 1440 × 1000, 820 × 1180 e 390 × 844; texto ampliado a 200% no celular.

Capturas locais: `cp-community-desktop.png`, `cp-community-tablet.png` e `cp-community-mobile.png`, em `C:/Users/Klayton/.codex/visualizations/2026/11/01/01a1965b-2141-77d3-82df-ac136d76ecf9`. Não são necessárias para executar o projeto.

Limitações: fonte primária ainda pendente, representatividade desconhecida, somente três faixas com amostra individual documentada e validação de navegador restrita ao Chromium. Nenhum commit foi criado.

[Voltar à documentação](README.md)
