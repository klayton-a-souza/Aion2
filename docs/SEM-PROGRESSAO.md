# Interface sem Progressão

A seção foi retirada da navegação e o editor de planos não é montado. A Visão geral agora usa os atributos dos personagens e a meta automática de CP; não exibe objetivos, marcos ou ações de planejamento. Personagens mantém comparação comunitária, meta automática, gráficos, histórico e observações. O bloco de meta vinculada ao planejamento foi retirado.

Os serviços legados de planos e marcos permanecem para validar e restaurar dados e backups existentes. Nenhuma migração destrutiva foi aplicada. Links #progression na abertura levam a Personagens.

## Validação

- 23 arquivos de testes unitários e de integração aprovados.
- tests/without-progression.browser.cjs: navegação antiga, ausência do editor, acesso à análise pelo personagem correto, atividades compartilhadas, planos preservados após renderização e reload, teclado, texto em 200% e movimento reduzido.
- Playwright: Home, Personagens, Atividades e Eventos em 390×844, 820×1180 e 1440×1000, sem overflow horizontal ou erros de JavaScript.
- Capturas finais de Home e Personagens nas três larguras, inspecionadas em desktop e celular. A comparação inicial foi feita pelo código e pelos testes existentes; não houve captura visual anterior à mudança.

Execução do navegador utiliza PLAYWRIGHT_MODULE e PLAYWRIGHT_BROWSERS_PATH quando Playwright está disponível fora do projeto. A2_SCREENSHOT_DIR define a pasta opcional das capturas. Nenhuma dependência foi adicionada.
