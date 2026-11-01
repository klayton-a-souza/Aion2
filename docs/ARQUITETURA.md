# Arquitetura modular do A2

O projeto usa módulos por funcionalidade, composição explícita e fluxo unidirecional nas operações da interface. Continua executando index.html via file://, com scripts clássicos, sem instalação, build ou servidor. CSS, assets, rotas e formato dos dados locais foram preservados.

## Organização

```text
js/
  bootstrap.js          composição e inicialização
  core/                 runtime, estado, armazenamento, backup e navegação
  shared/               foco/teclado e valores decimais de CP
  characters/           cadastro, ficha e histórico
  progression/          planos, contexto e marcos
  activities/           atividades, catálogo e cálculo de ciclos
  dashboard/            resumo da conta e contexto individual
  cp/                   domínio de CP e apresentação
  events/               agenda, referências comunitárias e apresentação
```

As regras de CP, agenda e ciclos ficam separadas de suas interfaces. Arquivos como progression/plans.js ainda agrupam serviços e renderizadores do editor existente; isso preserva suas relações enquanto o módulo oferece pontos explícitos para composição. Não é uma migração completa para Clean Architecture nem uma troca de framework.

## Composição e inicialização

core/runtime.js cria o namespace A2 e os registros de extensões e inicializadores. Os módulos declaram A2.extensions.register(feature, target, factory) e A2.lifecycle.register(feature, initializer). Não capturam e substituem as funções globais anteriores durante o carregamento.

bootstrap.js lista a ordem de composição e publica as interfaces A2.Characters, A2.Progression, A2.CP, A2.Events, A2.Activities e A2.Persistence. Ele é o único script que registra DOMContentLoaded. A composição monta os decorators com a implementação anterior recebida por parâmetro, e não por uma variável global Previous/Before compartilhada. A inicialização é idempotente: repetir start não registra novamente handlers ou temporizadores.

Os nomes globais existentes são uma camada de compatibilidade para handlers, testes e funções legadas. A2.Persistence e os demais namespaces fornecem interfaces de entrada para novas integrações. O estado AION_STATE e funções de suporte continuam disponíveis; não se alega isolamento completo de todos os símbolos globais nesta refatoração.

## Estado e persistência

As operações principais de cadastro, seleção de personagem, planos, CP, atividades e agenda usam A2.store.transact. O fluxo é:

```text
Ação → alteração do estado → validação → persistência → atualização da interface
```

Falha de validação restaura o snapshot anterior. Falha de escrita indicada por saveState mantém a alteração válida em memória e informa saved:false; as mensagens continuam orientando a exportar o backup. Falha de renderização não desfaz um estado já persistido. A2.store.snapshot retorna uma cópia para consulta.

Opções before/after mantêm a sincronização de ciclos de Atividades; a agenda fornece seu próprio renderizador, preservando a independência dos resets. Operações de restauração integral continuam em core/backup.js com sua validação anterior à substituição. Funções de domínio e compatibilidade podem ser chamadas sem persistir, como nos testes; os controllers coordenam a transação.

As migrações continuam encadeadas como extensões explícitas de prepareState. migrateState delega à composição atual, evitando aliases desatualizados. A chave local e o esquema 1.5.0 permanecem iguais; reorganizar JavaScript não converte CP nem recria eventos/personagens.

## Desenvolvimento

1. Coloque a regra na funcionalidade correspondente e mantenha cálculos independentes do DOM quando possível.
2. Use os controllers/transações para coordenar alterações e persistência.
3. Registre extensões e inicializadores; acrescente novos identificadores à ordem em bootstrap.js.
4. Carregue scripts por caminhos relativos no index.html, com runtime primeiro e bootstrap por último.
5. Não use import/export, fetch de arquivos locais ou dependências obrigatórias incompatíveis com file://.

## Verificação

node --test tests/*.test.cjs cobre o domínio e a integração. architecture.test.cjs acrescenta verificações de scripts locais, inicialização única, composição ordenada/idempotente, transações, rollback e falha de persistência. tests/helpers/runtime.cjs permite carregar módulos isolados nos testes sem disparar a inicialização visual.

Os fluxos Playwright existentes verificam cadastro, CP decimal, referências, dashboard, progressão, agenda offline, migração, backup, foco e responsividade. O executável Playwright continua sendo uma ferramenta externa de desenvolvimento, sem dependência adicionada à aplicação.

[Índice da documentação](README.md)
