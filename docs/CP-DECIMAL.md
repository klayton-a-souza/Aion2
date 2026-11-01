# Correção: Poder de Combate decimal

[Índice da documentação](README.md)

CP aceita números decimais não negativos, como 98,30. A restrição anterior a inteiros foi removida do cadastro, histórico, metas dos marcos e medianas comunitárias. Tamanho de amostra e contagens continuam inteiros.

Campos de CP usam entrada textual com teclado decimal, aceitando vírgula ou ponto decimal, sem separadores de milhar. 98,30 e 98.30 correspondem ao mesmo número 98.3 no JSON. Na apresentação, esse valor aparece como 98,30. Salvar as duas representações não cria alterações duplicadas no histórico.

Valores existentes permanecem na escala em que foram salvos: 98077 continua sendo 98077. Não houve divisão por mil ou outra conversão presumida de personagens, metas, referências ou histórico. As metas iniciais também permanecem editáveis; caso a unidade desejada seja diferente, ela precisa ser ajustada explicitamente. Backups antigos com inteiros e novos com decimais são aceitos sem mudança do esquema principal.

Validação exige número finito, não negativo, até Number.MAX_SAFE_INTEGER; mediana comunitária precisa ser positiva. Entradas inválidas, negativas ou infinitas são rejeitadas. A diferença para a meta evita ruído de representação binária, como 1,7000000000000028. A comparação com os limites da referência tolera apenas o erro numérico de ponto flutuante nas fronteiras inclusivas, sem alterar os critérios de 90% e 110%.

Arquivos: js/shared/cp-values.js (novo), index.html, js/characters/controller.js, js/characters/history.js, js/cp/domain.js, js/cp/view.js, js/progression/milestones.js e js/dashboard/account-dashboard.js. Testes anteriores que rejeitavam frações foram corrigidos; testes/cp-decimals.test.cjs e tests/cp-decimals.browser.cjs cobrem o novo contrato.

Verificação: entrada 98,30/98.30; edição sem duplicação; meta 101,25; mediana 100,05; dashboard, histórico e gráficos; recarga e backup via file://; apresentação móvel sem overflow. Dados reais do perfil do usuário não foram acessados. As menções históricas a CP inteiro nas entregas das Etapas 1/4 ficam substituídas por esta correção.
