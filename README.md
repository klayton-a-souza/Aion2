# AION 2 — V1

Aplicação pessoal para gerenciar personagens, progressão permanente e atividades diárias/semanais. Feita com HTML5, CSS3 e JavaScript convencional, sem instalação, compilação, servidor, backend ou dependências externas obrigatórias.

**Estado da entrega: V1 funcional com ressalvas, com Refinamentos 01, 02 e 03 implementados.** As oito suítes automatizadas passaram em ambiente simulado. A abertura real por `file://` e a validação visual/interativa estão pendentes: o navegador integrado do ambiente rejeita esse protocolo. Não houve declaração de compatibilidade real sem teste.

## Abrir a aplicação

1. Mantenha toda a pasta do projeto, incluindo `css`, `js` e `data`.
2. Abra `index.html` diretamente no Chrome ou Edge pelo Explorador de Arquivos.
3. Use a navegação para Visão geral, Personagens, Progressão e Atividades.

Chrome e Edge são os alvos recomendados para validação manual; não foram testados neste ambiente. A pasta também pode ser publicada em hospedagem estática, como GitHub Pages. Caminhos são relativos e scripts clássicos carregam dados locais sem `fetch()`.

## Personagens e dashboard

No dashboard, escolha **Ver personagens** ou abra **Personagens** no menu (`#characters`). A página exclusiva concentra **Novo personagem**, cards, edição e exclusão. Informe nome, classe e iLvl manual numérico não negativo; servidor e facção são opcionais. O primeiro cadastro é definido como principal quando não existe um. É possível trocar ou remover essa definição pelo formulário; só um personagem pode ser principal. A data de atualização do iLvl muda quando o valor muda.

A Visão Geral (`#home`) permite acompanhar e marcar objetivos e atividades do personagem selecionado. As outras páginas usam `#progression` e `#activities`; os hashes permitem acesso direto e histórico Voltar/Avançar. O esquema atual é 1.4.0.

Os cards de **L0rdFuria**, **Warri0rLord** e **LadyFuria** oferecem **Guia de evolução** em nova aba para Assassino, Templário e Clérigo, respectivamente. Configuração fixa em `data/character-guides.js`, associada ao nome exato sem diferenciar maiúsculas/minúsculas ou espaços nas extremidades. Outros personagens da mesma classe não recebem o guia; renomear para outro nome remove a associação. Nenhum personagem é criado ou modificado por essa configuração.

O seletor mostra nome, classe e iLvl reais. O personagem ativo da interface é independente do Principal: trocar a seleção não altera o cadastro. Seu ID é salvo em `preferences.activeCharacterId`; na ausência de seleção válida, utiliza Principal, primeiro cadastrado ou estado vazio. Excluir o selecionado aplica essa mesma regra.

O dashboard mostra o plano ativo individual, a primeira etapa/objetivo pendente na ordem definida e suas descrições existentes. Marcar/desmarcar recalcula o progresso e salva na mesma fonte usada em Progressão. Chegar a 100% apenas disponibiliza conclusão explícita com confirmação. As atividades diárias/semanais incluem o personagem e as compartilhadas da conta, uma vez cada, usando as mesmas conclusões, ciclos e resets de Atividades. Não há sincronização com o jogo.

## Progressão permanente

Os cards também oferecem **Perfil Shugo.gg** para L0rdFuria, LadyFuria e o alias explícito Warri0rLord/WarriorL0rd, configurados em `data/character-guides.js`. Ambos os nomes do Templário apontam ao perfil WarriorL0rd sem renomear registros. Se houver mais de um registro correspondente ao mesmo perfil, o botão é omitido para evitar ambiguidade. Links abrem nova aba; não há API ou sincronização. Cadastros reais do navegador e navegação externa não foram inspecionados neste ambiente.

Em **Progressão**, crie um planejamento como **Rascunho**, adicione etapas e objetivos e ordene com ↑/↓. Edite títulos/descrições, marque/desmarque objetivos e recolha etapas por seus cabeçalhos. Excluir etapas/objetivos exige confirmação. Cada objetivo tem o mesmo peso; percentuais são calculados, não armazenados. Etapas e planos vazios ficam em 0%.

**Ativar** exige confirmação e permite somente um plano ativo por personagem e um plano ativo de Conta, independentes entre si. Outros rascunhos podem ser preparados enquanto isso. **Concluir planejamento** só fica disponível quando existe ao menos um objetivo e todos estão concluídos; exige confirmação e registra encerramento. **Cancelar** preserva o progresso sem tratar o plano como concluído. Ambos vão para o histórico de consulta, com etapas/objetivos somente leitura.

Selecione o escopo e personagem ao criar; a criação pelo dashboard preenche o personagem ativo. Os filtros permitem personagem ativo, outro personagem, Conta ou Todos. **Vincular / reassociar** transfere explicitamente o vínculo, inclusive no histórico, preservando etapas, objetivos e datas; transferência de ativo é bloqueada se o destino já possui ativo. Personagens removidos mantêm seus planos identificados e disponíveis para reassociação. A numeração continua global.

Após encerrar, crie ou ative o próximo plano manualmente. O histórico permanece disponível. **Excluir plano** está disponível nos quatro estados, inclusive no histórico: a confirmação mostra o nome e avisa da remoção permanente de etapas e objetivos. Excluir, cancelar e concluir são operações diferentes. Excluir o ativo libera outro rascunho. O contador de números não retrocede; novos planos não reutilizam números excluídos. Exporte um backup antes se quiser uma cópia recuperável.

## Atividades diárias e semanais

Em **Atividades → Nova atividade**, informe nome, frequência e escopo; descrição e categoria são opcionais. Escopo **Conta** é compartilhado e contado uma vez. Escopo **Personagem** exige um cadastro existente. A exclusão de personagem preserva sua atividade, exibida com indicação de personagem excluído; você decide se deseja reatribuir ou excluir.

Marque/desmarque no ciclo vigente. Use Editar, Desativar/Reativar, ↑/↓ e Excluir. Inativas permanecem cadastradas, mas saem do cálculo de pendências. Trocar frequência, escopo ou personagem cria um novo contexto, sem transferir a conclusão antiga. Editar nome/descrição mantém a conclusão no mesmo contexto. Filtros por personagem incluem atividades compartilhadas de conta; também há filtros por estado e frequência.

### Ciclos e histórico

A consulta visual **Histórico dos Ciclos** foi removida da página de Atividades. Os registros armazenados continuam preservados e incluídos nos backups; o controle dos ciclos atuais e os resets não foram alterados.

**Configurar ciclos** permite horário diário, dia/horário semanal e fuso IANA, como `America/Sao_Paulo`, `Asia/Seoul` ou `UTC`. O padrão técnico é meia-noite, segunda-feira, `America/Sao_Paulo`: **não é uma afirmação sobre resets oficiais do jogo**. Mudanças exigem confirmação por poderem alterar o ciclo vigente.

Os ciclos são calculados pelo fuso configurado na abertura, após alterações, a cada 30 segundos, ao retornar à aba e ao focar a janela. Não é preciso deixar o app aberto. Apenas ciclos registrados entram no histórico; dias de ausência não produzem conclusões ou períodos fictícios. O histórico guarda os textos e estados das atividades; editar ou excluir depois não altera ciclos encerrados. Se a configuração/relógio revisitar um ciclo registrado, ele é recuperado em vez de duplicado.

O histórico atual e os ciclos são independentes dos planos. Concluir/cancelar/excluir um plano não altera atividades; reset ou conclusão de atividade não altera objetivos de progressão.

## Catálogo Aion 2

Use **Adicionar atividades do catálogo** para consultar os **16 modelos (7 diários e 9 semanais)**. Selecione um ou vários, escolha escopo e personagem por modelo, defina se entram ativos/inativos e confirme o conjunto. Não há inclusão automática. Duplicatas de modelo + escopo + personagem são ignoradas, mesmo renomeadas ou inativas. Tarefas personalizadas não são substituídas.

O botão **Informações** apresenta nome original e indicadores da frequência e escopo cadastrados, seguidos de **O que é?**, **O que preciso fazer?**, **Como acessar?** (quando específico), **Limites e disponibilidade**, **Dicas importantes** e fontes no final. Descrições iguais aparecem uma vez; textos personalizados diferentes são preservados em **Minha descrição**. Requisitos genéricos não confirmados ficam em observação discreta. Atividades manuais mostram apenas seus próprios dados. O catálogo reutiliza a mesma organização; não há alteração do esquema, checklists ou resets. A seção de recursos explica **Energia Odyle**, **Tentativas de Pesadelo** e **Chaves do Festival Shugo**, sem simulação de regeneração.

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
- `data/defaults.js`: modelo inicial, esquema **1.4.0**.
- `data/activities-catalog.js`: 16 modelos e três recursos locais.
- `data/character-guides.js`: três guias fixos associados a nomes de personagens.
- `js/state.js`: estado, validação e migração.
- `js/storage.js`: leitura/gravação central e erros de persistência.
- `js/backup.js`: exportação, validação e restauração atômica.
- `js/app.js`: dashboard e personagens.
- `js/progression.js`: planos, etapas, objetivos e histórico.
- `js/plan-context.js`: personagem ativo, filtros, vínculos e formulário de planos.
- `js/dashboard.js` e `css/dashboard.css`: painel contextual e checklists sincronizados.
- `js/cycles.js`: cálculo de períodos, snapshots e operações de atividades.
- `js/activities.js`: checklist, filtros, configurações e monitoramento dos ciclos.
- `js/catalog.js`: seleção, inclusão idempotente e explicações.
- `js/ui.js`: comportamento básico de teclado/foco nos modais.
- `js/navigation.js`: quatro seções e navegação por hash/histórico.
- `assets/images/`: reservado para imagens locais.
- `tests/`: testes de lógica e integração com relógio/armazenamento/DOM simulados.

O esquema 1.4.0 mantém as coleções existentes e a mesma chave de armazenamento. Acrescenta `preferences.activeCharacterId`, `plans[].scope`, `characterId`, `characterName` (identificação de vínculo removido) e `objectives[].details` (descrição opcional). Esquemas conhecidos de 1.0.0 a 1.3.0 migram sem recriar IDs/números ou descartar registros suportados. Planos antigos sem vínculo tornam-se Conta, nunca são atribuídos automaticamente ao Principal. Atividades, conclusões, ciclos e históricos 1.3.0 são preservados. Backups exportados incluem a seleção e todos os vínculos; importação antiga aplica a mesma migração. Coleções legadas de formato desconhecido são rejeitadas para conversão explícita.

Mantenha scripts convencionais, ordem das dependências, caminhos relativos e persistência centralizada. Alterações futuras de esquema precisam de migração e testes com backups antigos. Não recrie registros a partir do catálogo na inicialização; corrigir explicações estáticas não deve apagar progresso. Escape textos/IDs antes de interpolar HTML; prefira `textContent` para mensagens.

## Validação

Executados e aprovados:

```text
node tests/progression.test.cjs
node tests/activities.test.cjs
node tests/catalog.test.cjs
node tests/integration.test.cjs
node tests/characters-navigation.test.cjs
node tests/context-dashboard.test.cjs
node tests/sidebar.test.cjs
node tests/activity-information.test.cjs
```

Node é apenas ferramenta de desenvolvimento, nunca requisito de execução. As suítes cobrem percentuais, integridade, migração, ciclos/fusos, catálogo, persistência simulada, restauração isolada, falhas de quota/importação e segurança de textos/IDs. Referências e sintaxe dos scripts foram verificadas.

Não executados neste ambiente: abertura real `file://`, publicação/execução no GitHub Pages, inicialização completa no navegador, layout/fluxos reais desktop/mobile, foco com teclado/leitor de tela, seletor/download de JSON e fechamento/reabertura de Chrome/Edge. A V1 permanece **funcional com ressalvas**, não completamente validada. Nenhum outro refinamento foi iniciado.

Refinamento 01 solicitado e implementado: página de Personagens e três guias. Testes de navegação/estrutura/URLs e histórico simulados passaram, além das regressões de personagens, persistência e backups. Pendente manual: abrir `index.html#home`, navegar até Personagens, editar/cadastrar/excluir um personagem de teste, abrir cada guia, usar Voltar/Avançar, recarregar diretamente em `#characters` e conferir desktop/celular. A validação real de `file://` permanece pendente.
Refinamento 02: a suíte contextual cobre seleção persistida sem alterar Principal, ativos simultâneos por escopo, bloqueio de conflitos, transferência/vínculos removidos, checkboxes e próximo objetivo, conclusão explícita, compartilhamento de atividades, reset diário independente do semanal/plano e migração 1.3.0→1.4.0 com restauração de backup. As regressões existentes cobrem personagens/guias, catálogo, cancelamento/exclusão/históricos e persistência. Para validação manual, abra `index.html`, selecione personagens diferentes, crie/ative seus planos, marque/desmarque objetivos e atividades nas duas páginas, confira o próximo objetivo, exporte/restaure JSON e reabra o navegador. Use registros de teste e exporte os dados reais antes de testar exclusões.
