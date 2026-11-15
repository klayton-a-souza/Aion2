# Personalização de personagens

Em Personagens, use Novo personagem ou Editar e abra Imagem, links e ícone.

- Retrato: enviar PNG/JPG/WebP de até 8 MB, remover ou usar a imagem padrão. A prévia mostra o recorte central quadrado; a imagem é reduzida para 512×512 e salva com o personagem.
- Guia, Perfil e Kisk: informar links completos HTTP/HTTPS. Campos vazios ocultam os botões. Restaurar links padrão recupera as referências existentes para os personagens conhecidos. Depois de salvos, os links personalizados não dependem do nome do personagem.
- Ícone: automático pela classe, inicial do nome, um dos quatro símbolos locais ou imagem personalizada. Um ícone enviado é reduzido para 96×96; trocar a opção do seletor ou remover o ícone enviado volta ao símbolo escolhido.

Salvar aplica as mudanças. Cancelar/Escape descarta o rascunho. As imagens não são enviadas para um servidor: ficam nos dados locais e no backup JSON. O formulário aguarda o processamento de imagens antes de salvar. Os avisos de armazenamento existente continuam orientando a exportar backup se o navegador não conseguir persistir os dados.

Os campos opcionais são portraitData, guideUrl, profileUrl, kiskUrl, classIcon e classIconData. Dados antigos sem esses campos usam as referências existentes. Não foi necessária migração destrutiva ou alteração da versão do esquema. Restauração valida tipos, tamanho e formato das imagens, links e escolhas de ícone; URLs executáveis e SVG não são aceitos nesses campos.

## Validação

- 24 arquivos *.test.cjs aprovados, incluindo character-customization.test.cjs.
- character-customization.browser.cjs aprovado: imagem inválida, uploads, links, escolha de ícone, cancelamento sem mutação, persistência após reload, backup/restauração, URL inválida sem gravação e remoção das personalizações.
- usability-refinements.browser.cjs e without-progression.browser.cjs aprovados como regressão das alterações anteriores.
- Capturas em 360×800, 820×1180 e 1440×1000. Verificação de texto em 200%, sem overflow horizontal e sem erros de JavaScript nos fluxos exercitados.
- Evidências no diretório personalizacao da pasta de visualizações da sessão. Nenhuma dependência instalada e nenhum dado real alterado pelos testes, que utilizam contextos de navegador isolados.

Foi usada a skill frontend-polish em uma rodada de implementação e uma rodada curta de refinamento da prévia. A validação não inclui leitor de tela ou axe.

A seção de botões da ficha chama-se Links. Kisk tem campo próprio editável; sem personalização, usa o perfil Kisk conhecido ou a página inicial https://kisk.app/. Campo vazio oculta o botão.
