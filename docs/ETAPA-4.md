# Etapa 4 — CP, referências comunitárias e histórico

Relatório histórico · [Índice da documentação](README.md). A restrição a CP inteiro foi posteriormente substituída pelo [suporte a CP decimal](CP-DECIMAL.md).

## Estado inicial

Projeto C:/Users/Klayton/Documents/Repositorios/A2. `git status --short --branch` foi executado antes das edições: main acompanhando origin/main, com mudanças das Etapas 1–3 ainda não commitadas. Todas foram preservadas. A aplicação permanece HTML/CSS/JavaScript convencional, sem build, servidor, backend ou chamadas externas obrigatórias. A chave local, as rotas e o esquema principal 1.5.0 continuam existentes.

## Arquivos desta etapa

- index.html: carregamento dos dois scripts e da folha de estilo novos.
- js/cp-data.js: validação, armazenamento das referências/critérios/observações, seleção da referência, classificação e acesso ao histórico/meta.
- js/cp-assessment.js: área “CP e histórico” em Personagens, formulários, comparação, gráficos SVG e registros de desempenho.
- css/cp-assessment.css: layout, gráficos responsivos, formulários e detalhes recolhíveis.
- tests/cp-assessment.test.cjs: casos de domínio e compatibilidade.
- tests/cp-assessment.browser.cjs: fluxos reais file:// e capturas.
- ETAPA-4.md: este registro.

## Dados e compatibilidade

A extensão opcional cpAssessment, version 1, contém settings, references e performanceNotes. Quando ausente, a migração adiciona referências e observações vazias e os critérios internos padrão. A migração é idempotente e mantém propriedades desconhecidas e os dados anteriores. Não duplica personagens nem altera seus valores. Planos e progressHistory continuam sendo a fonte de metas e medições. O backup integral JSON inclui a extensão, mantendo o fluxo anterior de restauração com confirmação. Backups antigos continuam aceitos; importações inválidas são rejeitadas antes de substituir o estado.

Referências registram classe opcional, função opcional, intervalo inclusivo de iLvl, CP mediano declarado, tamanho da amostra, fonte, data da coleta, qualidade declarada, observações e datas de criação/atualização. Não há amostras fornecidas automaticamente nem cálculo de mediana sem dados individuais. Valores de referência usados nos testes são explicitamente sintéticos e não entram na aplicação.

Observações ficam vinculadas ao ID do personagem. São opcionais e mantidas no backup, inclusive se o personagem for posteriormente removido. Assassino/Feiticeiro sugerem formulário DPS; Templário, tanque; Clériga, cura. A função pode ser escolhida manualmente. DPS e contexto, sobrevivência, agressividade, cura e observações não alteram o CP ou sua classificação.

## Fórmulas e critérios

Comparação: R = CP atual / CP mediano declarado.

- R < limite inferior: Abaixo da referência.
- Limite inferior ≤ R ≤ limite superior: Na faixa da referência.
- R > limite superior: Acima da referência.

Padrões: 0,90 e 1,10. São razões internas em relação à mediana, não percentis ou requisitos oficiais. O usuário pode ajustar os limites e o alerta de amostra pequena. Por validação, limite inferior fica entre 0% e 100%; superior, entre 100% e 1000%; inferior deve ser menor que superior. O alerta de amostra pequena usa inicialmente N < 30, também um critério interno, sem alegação de significância ou representatividade estatística. Esse limiar pode ser alterado para qualquer inteiro seguro ≥ 2.

Para ser utilizável, a referência precisa de mediana inteira positiva, tamanho inteiro positivo, fonte preenchida, data válida e qualidade declarada diferente de “Dados insuficientes”. Zero/ausência na amostra ou outros campos incompletos deixam o registro disponível para edição, mas impedem a comparação. Mediana zero, negativa, fracionária ou acima do maior inteiro seguro é rejeitada. CP atual zero é válido e comparável; CP atual ausente não é convertido para zero.

Referências precisam abranger o iLvl atual. Quando a função é informada, ela deve corresponder à função inferida da classe do personagem. Prioridade de escolha: mesma classe; amostra da mesma função sem classe específica; outra classe/amostra geral. Dentro da prioridade: intervalo mais estreito, coleta mais recente, amostra maior e ID estável. O escopo escolhido, a fonte e a data ficam visíveis. Comparações entre classes ou sem classe específica são sinalizadas e provisórias. Amostra pequena ou qualidade “Limitada” também torna a classificação provisória. “Origem documentada” é uma declaração manual; a interface informa que a representatividade não foi verificada.

Diferença pessoal: CP desejado do marco − CP atual. Valores positivos indicam quanto falta, zero indica meta atingida e negativos são apresentados como valor acima da meta. O editor modifica apenas o objetivo combatPower do marco, preservando referências e IDs; mantém a regra anterior de não reduzir meta já atingida. CP desejado continua sendo uma meta interna provisória, sem relação automática com requisitos de Expedições, Transcendência ou raids.

## Histórico e gráficos

Gráficos SVG separados para iLvl e CP, baseados exclusivamente em changes.ilevel.to e changes.combatPower.to de progressHistory, na data/hora registrada. Não são adicionados pontos a partir do valor atual ou do campo “from”, nem medições nos dias sem alterações. Ausência de histórico exibe estado vazio. Uma única medição produz apenas um ponto. CP removido (null) interrompe o segmento; não vira CP zero. Atualizações salvas com valores iguais continuam sem criar eventos.

O eixo temporal usa as datas reais. A escala vertical ajusta-se ao mínimo/máximo registrado, apresentados em texto; não necessariamente começa em zero. Linhas apenas conectam medições conhecidas, sem estimar valores intermediários. Cada gráfico oferece lista textual dos valores para leitura alternativa. Atualizações recentes mostram até dez eventos; as listas dos gráficos e o backup mantêm o histórico completo. Observações de desempenho mostram até oito entradas recentes, com preservação integral no backup.

## Validação

- `node --test tests/*.test.cjs`: 17 testes/arquivos aprovados.
- `node tests/cp-assessment.browser.cjs`: aprovado em Chromium via file://; referência ausente, histórico vazio, valores inválidos/extremos, amostra pequena, classes diferentes, edição de meta sem alterar referência, critérios editáveis, formulários CP/iLvl, ausência de duplicação, lacunas nos gráficos, DPS/tanque/cura opcionais, download e importação reais por arquivo, reload, modal/Escape e foco após salvar referência.
- Regressões de navegador: dashboard-account.browser.cjs, character-progress.browser.cjs e milestones.browser.cjs aprovados.
- Desktop 1440×1000, tablet 820×1180 e mobile 390×844: gráficos dentro da largura disponível; sem scroll horizontal e sem pageerror/console.error. Texto ampliado a 200% também verificado.
- `git diff --check`: aprovado, apenas avisos de conversão LF/CRLF do Git no Windows.

Playwright foi reutilizado do ambiente existente, sem instalar dependências: PLAYWRIGHT_MODULE=C:/Users/Klayton/Documents/Repositorios/Aion2-Analyzer/node_modules/playwright. A2_EVIDENCE_DIR define o diretório das capturas.

Evidências em C:/Users/Klayton/.codex/visualizations/2026/11/01/01a1965b-2141-77d3-82df-ac136d76ecf9/: a2-cp-desktop.png, a2-cp-tablet.png, a2-cp-mobile.png, a2-cp-empty-desktop.png e a2-cp-empty-mobile.png. São capturas do painel com dados sintéticos de teste, identificados na própria interface. As capturas de estado vazio representam o início do fluxo; não são alegadas como screenshots anteriores à implementação da Etapa 4. Houve uma rodada de inspeção visual, sem necessidade de refinamento cosmético adicional.

A skill frontend-polish orientou a revisão responsiva, o uso de detalhes recolhíveis e a verificação de foco dos formulários. Não houve acesso ao armazenamento real do usuário.

## Limitações

Fontes, mediana, tamanho da amostra e confiabilidade são declarados manualmente. Não há verificação externa, controle automático de patch/servidor/recência, cálculo de intervalos de confiança, percentis, causalidade ou previsão de desempenho. A comparação por faixa de iLvl não corrige diferenças de equipamento, composição ou conteúdo. CP sozinho não resume desempenho. Observações de função são qualitativas/contextuais e não produzem nota. Nenhuma ferramenta externa, captura de pacotes, sniffer ou medidor foi integrada. Não foi feita auditoria com leitor de tela ou execução em Firefox/Safari. Nenhum calendário foi implementado.
