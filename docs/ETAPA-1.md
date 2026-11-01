# A2 — Etapa 1

Relatório histórico · [Índice da documentação](README.md). A validação de CP inteiro foi posteriormente substituída pelo [suporte a CP decimal](CP-DECIMAL.md).

## Estado inicial

Git: branch main, acompanhando origin/main, sem arquivos modificados ou não rastreados antes da implementação. A verificação precisou ser executada fora do sandbox de Aion2-Analyzer para reconhecer a worktree A2.

Aplicação estática: index.html, css/, data/ e scripts globais em js/, sem build, backend ou dependências de rede para executar. Rotas por hash: home, characters, progression e activities. Planos com etapas/checklists, escopo conta/personagem, catálogo de atividades, ciclos diários/semanais, configuração de resets, seleção de personagem ativo e backup JSON já existiam.

Dados iniciais: schemaVersion 1.4.0; characters, plans, activePlans, completedPlans, activities, activityHistory, activityCycles, resetSettings, preferences e nextPlanNumber. Persistência na chave aion-2-personal-progress-v1. Cada personagem já possui id, name, className, ilevel, type (main/alt), server, faction e ilevelUpdatedAt. Defaults começam sem personagens; cadastros reais pertencem ao armazenamento do navegador e não foram acessados ou alterados.

## Evolução

Esquema 1.5.0, CP opcional (null = desconhecido; zero é válido), combatPowerUpdatedAt e progressHistory. type continua representando Main, sem isMain redundante. Migração reaproveita a validação anterior e preserva propriedades desconhecidas. Não inventa histórico retroativo nem CP baseado nos valores de referência. A edição mantém propriedades adicionais do personagem. Histórico registra somente mudanças efetivas, com from/to, recordedAt e source; salvar valores iguais, migrar e recarregar não acrescenta eventos.

O formulário recebe CP e a ficha mostra CP, data e histórico. A extensão usa scripts convencionais e mantém a chave de armazenamento. Backups antigos passam pela migração; backups novos incluem os campos. Importação mantém a semântica existente de restauração integral com confirmação: para preservar o estado atual, exporte-o antes de restaurar outro backup. Propriedades não relacionadas contidas no backup são preservadas; não há mesclagem automática entre dois backups.

Não foram implementados novos dashboard, marcos ou calendário. Os valores de referência dos quatro personagens não são inseridos nem sobrescrevem dados locais.

## Verificação

- `node --test tests/*.test.cjs`: 15 arquivos de testes aprovados. A expectativa de versão do teste de migração foi atualizada para 1.5.0; as verificações de preservação continuam ativas.
- `node tests/character-progress.browser.cjs`: aprovado com Chromium/Playwright via file://, em contexto isolado. Cadastro, edição, CP vazio/negativo/fracionário, Main único, histórico, recarga, ativo persistido, migração idempotente, propriedades extras, importação inválida atômica, restauração antiga/nova e download de backup.
- Playwright foi reutilizado de Aion2-Analyzer/node_modules/playwright, sem dependência adicionada à aplicação. Para repetir, informe esse caminho na variável PLAYWRIGHT_MODULE ou disponibilize playwright no ambiente de testes.
- Inspeção visual da captura do formulário em 1100 × 850: campo CP legível, sem cortes, com botões acessíveis.
- `git diff --check`: aprovado. Git apenas avisou sobre conversão LF/CRLF no Windows.

## Limites

Não foi realizada inspeção do localStorage do perfil real do usuário. O teste usa navegador isolado e personagens de teste. Campos CP ausentes permanecem desconhecidos. Importação restaura integralmente o arquivo selecionado, seguindo a confirmação já existente; não combina dados de sessões distintas. Não há mudanças no reset, rotas ou lógica dos planos. O histórico começa no cadastro ou na próxima alteração manual, sem reconstruir datas antigas.
