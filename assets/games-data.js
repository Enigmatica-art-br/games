/*
 * Catálogo de jogos da Enigmática.
 * Para adicionar um jogo, copie um bloco e preencha. A página se monta sozinha:
 * capa gerada, contagem, filtros (aparecem a partir de 4 jogos) e links.
 *
 *  id        identificador curto e único (também gera o desenho da capa)
 *  title     nome do jogo
 *  status    'released' | 'development' | 'announced'
 *  hue       tom da capa em graus (laranja ≈ 20–40)
 *  year      ano de lançamento ou previsto (opcional)
 *  genre     { pt, en }
 *  platforms lista de plataformas
 *  tagline   { pt, en } uma frase
 *  cover     imagem do jogo (1920×1080 de preferência). Sem capa, a página gera uma arte.
 *  coverAlt  { pt, en } descrição da imagem
 *  links     site (página do jogo), itch, steam (null = "em breve")
 */
window.GAMES = [
  {
    id: 'case-27-noema',
    title: 'Case 27: Noema',
    status: 'development',
    hue: 28,
    cover: 'assets/images/principal.jpg',
    coverAlt: {
      pt: 'Fortaleza de pedra cercada por floresta e caminhos.',
      en: 'A stone fortress surrounded by forest and paths.'
    },
    year: null,
    genre: { pt: 'Mistério e exploração', en: 'Mystery and exploration' },
    platforms: ['PC'],
    tagline: {
      pt: 'Uma ilha construída sobre segredos e uma linguagem que nunca explica as próprias regras.',
      en: 'An island built on secrets and a language that never explains its own rules.'
    },
    links: {
      site: 'noema/',
      itch: 'https://enigmatica-art.itch.io/noema',
      steam: null
    }
  }
];
