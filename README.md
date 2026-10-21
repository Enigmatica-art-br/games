# Enigmática Games

Central oficial dos jogos da Enigmática, publicada em `games.enigmatica.art.br`.

**Por enquanto o catálogo está fora do ar:** como só existe um jogo, a raiz (`index.html`) redireciona direto para `noema/`. Para voltar com o catálogo, restaure o `index.html` do commit `1fe2d2d` (os arquivos `assets/games-*` continuam aqui).

## Jogos

- [Case 27: Noema](https://games.enigmatica.art.br/noema/)

## Idiomas

O site tem versões em inglês (padrão) e português (Brasil). Os jogos ficam em `assets/games-data.js` — para adicionar um jogo, copie um bloco lá; a página monta capa, contagem e filtros sozinha. Os textos da página ficam em `assets/games-i18n.js` (central) e `assets/noema-i18n.js` (Case 27: Noema); a troca é feita por `assets/i18n.js`, que lembra a escolha em todos os subdomínios de `enigmatica.art.br`.
