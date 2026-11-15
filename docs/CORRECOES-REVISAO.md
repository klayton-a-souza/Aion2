# Correções da revisão de usabilidade

Aplicada a skill frontend-polish a partir das dez rodadas de diagnóstico de 15/11/2026. As alterações anteriores do checkout foram preservadas.

## Mudanças

- O cadastro sincroniza a seleção da ficha e da análise de CP.
- Analisar personagem na Home seleciona a pessoa correta, muda de rota e foca o título da análise. A navegação entre telas foca o título principal.
- A Home oferece um atalho no topo para atividades diárias. Abrir atividades revela o contêiner e a lista diária na mesma ação.
- Nova atividade, catálogo, filtro de estado e frequência ficam visíveis; configuração dos ciclos permanece recolhível.
- O resumo de CP começa aberto; os outros painéis continuam recolhidos. O usuário pode alternar cada painel.
- A ficha tem um atalho para a análise e o placeholder sem retrato é compacto no celular.
- O catálogo possui busca por nome/descrição, filtro de frequência, contador de selecionadas, estado vazio e aplicação de personagem às selecionadas individuais. Filtrar preserva seleções; Selecionar exibidas respeita os filtros; Limpar seleção limpa o conjunto.
- Os erros do cadastro identificam campos inválidos, associam a mensagem e focam o primeiro campo. Reabrir o formulário limpa os erros anteriores.
- As setas de ordenação têm área mínima de 44×44 px.
- Eventos com inscrição encerrada continuam na lista, mas deixam de ocupar o destaque quando há uma próxima entrada possível. Fontes longas do destaque ficam em detalhes.
- Notificações de sucesso anteriores ficam ocultas enquanto um modal está aberto; notificações de erro ficam no topo e não interceptam cliques. Isso evita cobrir as ações do catálogo.

## Evidências e validação

A revisão original está em auditoria-10 no diretório de visualizações da sessão. As capturas após as mudanças estão em correcoes-revisao, com Home, Personagens, Atividades e Eventos em 360×800, 820×1180 e 1440×1000; catálogo em 390×844. Foram inspecionados visualmente Home desktop, Personagens/Atividades mobile e catálogo mobile.

Duas rodadas de implementação/verificação: correções funcionais e de navegação; depois ajustes no atalho da Home, reabertura do formulário e notificações do modal. A terceira rodada não foi necessária.

- 23 arquivos *.test.cjs: aprovados.
- tests/usability-refinements.browser.cjs: aprovado. Cobre seleção da análise após cadastro, foco, validação, lista diária, filtros/seleção/lote/inclusão no catálogo, evento com inscrição encerrada e responsividade das quatro rotas com texto em 200%.
- tests/without-progression.browser.cjs: aprovado. Preservação dos planos antigos, navegação, atividades, reload e compatibilidade da interface sem Progressão.
- Nenhum erro de JavaScript nos fluxos verificados.

Execução com Playwright existente: definir PLAYWRIGHT_MODULE para o módulo instalado e PLAYWRIGHT_BROWSERS_PATH para os navegadores locais; A2_SCREENSHOT_DIR habilita as capturas. Não foram instaladas dependências.

Não houve auditoria com leitor de tela ou axe. A ampliação de 200% refere-se ao tamanho de fonte da raiz, não a todos os modos de zoom do navegador. As mudanças de eventos alteram o destaque da interface, sem modificar os horários cadastrados ou afirmar disponibilidade oficial do jogo.
