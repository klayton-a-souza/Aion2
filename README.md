# AION 2 — V1

Aplicação pessoal para gerenciar personagens, progressão permanente e atividades diárias/semanais. Feita com HTML5, CSS3 e JavaScript convencional, sem instalação, compilação, servidor, backend ou dependências externas obrigatórias.

**Estado da entrega: V1 funcional com ressalvas.** As quatro suítes automatizadas passaram. A abertura real por `file://` e a validação visual/interativa estão pendentes: o navegador integrado do ambiente rejeita esse protocolo. Consulte `VALIDACAO-V1.md` para o relatório e roteiro manual. Não houve declaração de compatibilidade real sem teste.

## Abrir a aplicação

1. Mantenha toda a pasta do projeto, incluindo `css`, `js` e `data`.
2. Abra `index.html` diretamente no Chrome ou Edge pelo Explorador de Arquivos.
3. Use a navegação para Visão geral, Personagens, Progressão e Atividades.

Chrome e Edge são os alvos recomendados para validação manual; não foram testados neste ambiente. A pasta também pode ser publicada em hospedagem estática, como GitHub Pages. Caminhos são relativos e scripts clássicos carregam dados locais sem `fetch()`.

## Personagens e dashboard

No dashboard, escolha **Novo personagem**. Informe nome, classe e iLvl manual numérico não negativo; servidor e facção são opcionais. O primeiro cadastro é definido como principal quando não existe um. É possível trocar ou remover essa definição pelo formulário; só um personagem pode ser principal. Cards oferecem edição e exclusão com confirmação. A data de atualização do iLvl muda quando o valor muda.

O dashboard calcula total, principal, iLvl e alternativos a partir do cadastro. Progresso dos planos e resumos diários/semanais usam o mesmo estado dos respectivos módulos. Não há sincronização com o jogo.

## Progressão permanente

Em **Progressão**, crie um planejamento como **Rascunho**, adicione etapas e objetivos e ordene com ↑/↓. Edite títulos/descrições, marque/desmarque objetivos e recolha etapas por seus cabeçalhos. Excluir etapas/objetivos exige confirmação. Cada objetivo tem o mesmo peso; percentuais são calculados, não armazenados. Etapas e planos vazios ficam em 0%.

**Ativar** exige confirmação e somente um plano pode estar ativo. Outros rascunhos podem ser preparados enquanto isso. **Concluir planejamento** só fica disponível quando existe ao menos um objetivo e todos estão concluídos; exige confirmação e registra encerramento. **Cancelar** preserva o progresso sem tratar o plano como concluído. Ambos vão para o histórico de consulta, com etapas/objetivos somente leitura.

Após encerrar, crie ou ative o próximo plano manualmente. O histórico permanece disponível. **Excluir plano** está disponível nos quatro estados, inclusive no histórico: a confirmação mostra o nome e avisa da remoção permanente de etapas e objetivos. Excluir, cancelar e concluir são operações diferentes. Excluir o ativo libera outro rascunho. O contador de números não retrocede; novos planos não reutilizam números excluídos. Exporte um backup antes se quiser uma cópia recuperável.

## Atividades diárias e semanais

Em **Atividades → Nova atividade**, informe nome, frequência e escopo; descrição e categoria são opcionais. Escopo **Conta** é compartilhado e contado uma vez. Escopo **Personagem** exige um cadastro existente. A exclusão de personagem preserva sua atividade, exibida com indicação de personagem excluído; você decide se deseja reatribuir ou excluir.

Marque/desmarque no ciclo vigente. Use Editar, Desativar/Reativar, ↑/↓ e Excluir. Inativas permanecem cadastradas, mas saem do cálculo de pendências. Trocar frequência, escopo ou personagem cria um novo contexto, sem transferir a conclusão antiga. Editar nome/descrição mantém a conclusão no mesmo contexto. Filtros por personagem incluem atividades compartilhadas de conta; também há filtros por estado e frequência.

### Ciclos e histórico

**Configurar ciclos** permite horário diário, dia/horário semanal e fuso IANA, como `America/Sao_Paulo`, `Asia/Seoul` ou `UTC`. O padrão técnico é meia-noite, segunda-feira, `America/Sao_Paulo`: **não é uma afirmação sobre resets oficiais do jogo**. Mudanças exigem confirmação por poderem alterar o ciclo vigente.

Os ciclos são calculados pelo fuso configurado na abertura, após alterações, a cada 30 segundos, ao retornar à aba e ao focar a janela. Não é preciso deixar o app aberto. Apenas ciclos registrados entram no histórico; dias de ausência não produzem conclusões ou períodos fictícios. O histórico guarda os textos e estados das atividades; editar ou excluir depois não altera ciclos encerrados. Se a configuração/relógio revisitar um ciclo registrado, ele é recuperado em vez de duplicado.

O histórico atual e os ciclos são independentes dos planos. Concluir/cancelar/excluir um plano não altera atividades; reset ou conclusão de atividade não altera objetivos de progressão.

## Catálogo Aion 2

Use **Adicionar atividades do catálogo** para consultar os **16 modelos (7 diários e 9 semanais)**. Selecione um ou vários, escolha escopo e personagem por modelo, defina se entram ativos/inativos e confirme o conjunto. Não há inclusão automática. Duplicatas de modelo + escopo + personagem são ignoradas, mesmo renomeadas ou inativas. Tarefas personalizadas não são substituídas.

O botão **Informações** apresenta descrição atual, nome em inglês, finalidade, acesso, recompensas/limites e orientações do modelo. A seção de recursos explica **Energia Odyle**, **Tentativas de Pesadelo** e **Chaves do Festival Shugo**, sem simulação de regeneração.

Frequências são sugestões de acompanhamento. Recursos acumuláveis, eventos condicionados, limites semanais e ciclos próprios não são tratados como obrigações universais. Os lembretes usam os resets globais configurados na V1; presença e passe podem ter horários próprios no jogo. Limites numéricos são referências sujeitas a atualização, região e condições da conta; as chaves não recebem um valor fixo quando as referências divergem. Requisitos não confirmados estão identificados no catálogo.

Fontes opcionais: [Checklist DBAion2](https://dbaion2.ru/en/checklist/) e [Guia de atividades DBAion2](https://www.dbaion2.online/en/guides/ezhednevnye-i-ezhenedelnye-dela/). Tudo pode ser consultado offline na aplicação; os links não são necessários à execução.

## Armazenamento e backups

Todos os módulos usam `localStorage` na chave **`aion-2-personal-progress-v1`**. Alterações são salvas automaticamente; se houver erro, um aviso persistente informa que o estado está somente em memória. Dados válidos existentes são lidos mesmo quando a quota está cheia. Dados inválidos/incompatíveis bloqueiam gravação para preservar a origem, permitindo restaurar um backup válido.

**Exportar backup** gera JSON com identificação do projeto, esquema, personagens, planos, atividades, conclusões, histórico e configurações. **Importar backup** valida o arquivo inteiro e solicita confirmação antes de substituir. Falhas de validação ou escrita não substituem os dados atuais. Backups nunca são executados como código.

Para transferir para outro navegador/perfil: exporte, abra a aplicação no destino e importe o JSON. A restauração substitui os dados do destino; exporte-os antes se necessário. Na abertura após importar, o ciclo vigente é recalculado, e um período antigo pode ir para o histórico corretamente. Faça backups periódicos, especialmente antes de limpar dados do navegador, mover arquivos ou excluir planos.

### Limitações locais

O comportamento de `localStorage` em `file://` varia por navegador, perfil, privacidade e localização dos arquivos. Mover a pasta, trocar navegador, usar modo privado ou limpar armazenamento pode impedir recuperar a mesma origem. Sem armazenamento, continue em memória e exporte antes de fechar. Se uma importação não puder ser gravada apesar de o armazenamento ser legível, ela é rejeitada para preservar os dados atuais. Com armazenamento totalmente indisponível, restauração em memória é permitida e informada.

Use uma aba por vez: a última gravação de duas abas pode sobrescrever alterações da outra. Não há sincronização entre abas ou dispositivos. Não existe salvamento em servidor.

## Estrutura e manutenção

- `index.html`: entrada estática e sequência de scripts.
- `css/`: variáveis, base/layout/componentes e estilos dos módulos; `finalization.css` corrige contenção e foco.
- `data/defaults.js`: modelo inicial, esquema **1.3.0**.
- `data/activities-catalog.js`: 16 modelos e três recursos locais.
- `js/state.js`: estado, validação e migração.
- `js/storage.js`: leitura/gravação central e erros de persistência.
- `js/backup.js`: exportação, validação e restauração atômica.
- `js/app.js`: dashboard e personagens.
- `js/progression.js`: planos, etapas, objetivos e histórico.
- `js/cycles.js`: cálculo de períodos, snapshots e operações de atividades.
- `js/activities.js`: checklist, filtros, configurações e monitoramento dos ciclos.
- `js/catalog.js`: seleção, inclusão idempotente e explicações.
- `js/ui.js`: comportamento básico de teclado/foco nos modais.
- `assets/images/`: reservado para imagens locais.
- `tests/`: testes de lógica e integração com relógio/armazenamento/DOM simulados.
- `VALIDACAO-V1.md`: auditoria, evidências e roteiro manual.
- `REFINAMENTOS-V1.md`: oportunidades futuras, sem implementação iniciada.

O esquema 1.3.0 mantém `characters`, `plans`, `nextPlanNumber`, `activities`, `activityCycles`, `activityHistory`, `resetSettings` e `preferences`; `catalogId` é opcional. As coleções legadas vazias `activePlans`/`completedPlans` são preservadas. Esquemas 1.0.0, 1.1.0 e 1.2.0 conhecidos migram sem descartar personagens/planos. Coleções antigas não vazias de formato desconhecido são rejeitadas para conversão explícita. Campos opcionais ausentes recebem padrões seguros; tipos inválidos não são convertidos silenciosamente.

Mantenha scripts convencionais, ordem das dependências, caminhos relativos e persistência centralizada. Alterações futuras de esquema precisam de migração e testes com backups antigos. Não recrie registros a partir do catálogo na inicialização; corrigir explicações estáticas não deve apagar progresso. Escape textos/IDs antes de interpolar HTML; prefira `textContent` para mensagens.

## Validação

Executados e aprovados:

```text
node tests/progression.test.cjs
node tests/activities.test.cjs
node tests/catalog.test.cjs
node tests/integration.test.cjs
```

Node é apenas ferramenta de desenvolvimento, nunca requisito de execução. As suítes cobrem percentuais, integridade, migração, ciclos/fusos, catálogo, persistência simulada, restauração isolada, falhas de quota/importação e segurança de textos/IDs. Referências e sintaxe dos scripts foram verificadas.

Não executados neste ambiente: abertura real `file://`, inicialização completa no navegador, layout/fluxos reais desktop/mobile, foco com teclado/leitor de tela, seletor/download de JSON e fechamento/reabertura de Chrome/Edge. Siga `VALIDACAO-V1.md`. A V1 permanece **funcional com ressalvas**, não completamente validada. Refinamentos não foram iniciados automaticamente.
# Aion2
