# Design

<!-- impeccable:design-schema 1 -->

## Visual world

**Cânone big tech editorial.** Régua de qualidade escolhida pelo autor: Apple e Airbnb. Executado direto, sem ironia e sem gracinha autoral enfiada por dentro.

Isso é uma decisão registrada, não um padrão que caiu por omissão. Duas direções autorais foram construídas antes (dashboard escuro com acento teal, depois classificados de jornal com cartela de para-brisa) e ambas foram recusadas. O autor pediu explicitamente o caminho convencional, e convenção virou o compromisso.

Anti-referências, já testadas e descartadas neste projeto:

- Dashboard SaaS com rail fixo de filtros que rola de lado, tiles de KPI e grade de cards.
- Papel de jornal, serifa de notícia e escrita à mão.
- Menu lateral permanente. Comeu 30% da largura e não recolhia.

## Ground e paleta

Estratégia: **contido**. Neutros mais um azul de ação. O visitante veio entender, então cor não disputa com número.

Claro é o padrão. Escuro é quase preto de verdade, no registro Apple, e não cinza-azulado.

| Papel | Claro | Escuro |
|---|---|---|
| `--bg` fundo | `#FFFFFF` | `#000000` |
| `--bg-2` faixa alternada de seção | `#F5F5F7` | `#0E0E10` |
| `--card` superfície elevada | `#FFFFFF` | `#1D1D1F` |
| `--ink` | `#1D1D1F` | `#F5F5F7` |
| `--ink-2` | `#515154` | `#B4B4B8` |
| `--ink-3` | `#6E6E73` | `#8E8E93` |
| `--line` | `#D2D2D7` | `#3A3A3C` |
| `--acc` ação | `#0071E3` | `#2997FF` |
| `--acc-on` tinta sobre a ação | `#FFFFFF` | `#04121F` |
| `--good` / `--warn` / `--crit` | `#1E7B45` / `#9A6400` / `#B3261E` | `#3FBF6F` / `#E0A33A` / `#FF6B5E` |

Regras duráveis:

- **`--acc-on` existe porque branco sobre `#2997FF` reprova em contraste (3,02).** No escuro a tinta do botão primário é escura. Nunca voltar para branco fixo.
- Série de gráfico usa `--s1` a `--s6`, um conjunto já validado para daltonismo e contraste nas duas superfícies. Não trocar sem revalidar.
- A tinta dentro das células da matriz é **calculada pela luminância real do degrau**, nunca por limiar fixo de índice. Limiar fixo quebra quando a rampa inverte de direção entre os temas.
- **Pelo mesmo motivo, a barra de pesos não usa tinta fixa.** Era `color:#fff` cravado, que reprovava
  em contraste sobre teal, azul e roxo (3,71 a 3,84 no escuro). Agora passa por `inkPara()` e fica
  entre 4,97 e 5,13.
- Sem gradiente em texto. Ênfase vem de peso e tamanho.

## Tipografia

**Figtree** como família única, 300 a 900, com `tabular-nums` global. Uma família em escala ampla é a gramática da régua escolhida.

| Papel | Tamanho | Tracking |
|---|---|---|
| h1 | `clamp(38px, 7.4vw, 68px)` | `-.038em` |
| h2 de seção | `clamp(27px, 4.6vw, 40px)` | `-.034em` |
| Cifra grande | 32 a 52px, peso 800 | `-.04em` |
| Corpo | 17px | `-.011em` |

## Componentes

- **`.topo`**: barra fixa de 60px, translúcida com `backdrop-filter`. Contém navegação inline (some
  abaixo de 1040px), tema e o botão de filtros com contador.
- **`.secTira`**: tira de seções rolável na horizontal, só abaixo de 1040px, e só depois que o
  visitante passa do herói. Existe porque tirar o botão de seções deixou 13.000px de rolagem sem
  índice nenhum no celular. Aparecer só depois do herói é o que faz ela não custar altura na
  primeira tela, que é onde o jogo precisa do espaço. **Ela é um `<nav>` dentro de `.topo`, então
  precisa de `.topo nav.secTira` para vencer `.topo nav`**, senão o comportamento sai invertido:
  ligada no desktop e desligada no celular. Os botões de seções e de
  critérios saíram: o primeiro repetia o menu, o segundo virou o primeiro grupo da gaveta.
- **`.drawer`**: gaveta de filtros à direita, recolhível, `transform: translateX(100%)` quando fechada. Largura `min(420px, 100%)`, então ocupa a tela inteira no celular. **Nunca virar coluna permanente.**
- **`.jogo`**: o herói pergunta **uma coisa por vez**. Rodagem, horizonte e teto de compra, com
  progresso visível, voltar e uma saída para quem não quer responder. Existe porque o visitante lia
  o carro do herói como "o melhor carro" em vez de "o melhor para este uso", e perguntar antes de
  responder põe a condição dentro da resposta.

  As três perguntas juntas já foram tentadas e reprovaram: cabiam na tela, mas eram três decisões
  de uma vez na primeira dobra. **Uma pergunta por vez é a regra**, e enquanto o jogo roda o
  resultado fica escondido, então existe exatamente uma coisa a fazer na tela.

  A quarta pergunta é a **prioridade**, e ela existe porque os pesos decidiam a resposta ficando
  invisíveis. O visitante escolhia rodagem, prazo e teto, e ainda assim recebia quase sempre o mesmo
  carro, porque o perfil de peso equilibrado é que estava no comando. Perfil escolhido aparece no
  resumo e na barra de pesos da gaveta, então nunca mais decide escondido.

  Regras que sustentam isso:
  - Cada opção traz uma legenda em língua de gente ("a média brasileira"), nunca só o número.
  - A quinta opção da pergunta de prioridade, "quero regular eu mesmo", **não é uma resposta, é a
    entrega dos controles**: ocupa a linha inteira, usa contorno tracejado para não competir com as
    quatro opções de verdade, e abre a gaveta direto nos seis pesos. Quem clica fica com o rótulo
    "Pesos personalizados" no resumo, nunca com o nome de um preset que ele não escolheu.
  - **Preset de peso tem que cumprir o rótulo.** "Gastar o mínimo" com custo em 58% e depois em 70%
    devolvia o mesmo vencedor de sempre, e entre 86% e 90% ele pulava de um elétrico chinês para um
    HB20 usado. Nessa faixa o número exato decidia a resposta, o que é arbitrário. O preset é custo
    em 100%, que é literalmente o que o rótulo promete e não depende de calibragem fina.
  - Opção só aparece marcada depois que o usuário escolheu. Marcar o padrão faz parecer respondido.
  - **Pular é obrigatório.** Sem saída a página vira pedágio. Quem pula recebe o selo "usando o
    perfil médio", porque o resumo não pode alegar escolha que não houve.
  - As opções e a dica cabem acima da dobra em 390x780 e em 375x667. Para isso o título encolhe enquanto
    o jogo roda: durante o jogo o assunto é a pergunta, não a manchete.
- **`.resumo`**: o que foi respondido, em chips clicáveis que voltam àquela pergunta. Aparece no
  lugar do jogo quando ele acaba, e é o que mantém as condições à vista junto do vencedor.
- **`.eSe`**: o contraste logo abaixo do campeão. Procura a virada de verdade varrendo perfis
  alternativos e mostra o primeiro que troca o vencedor, com um botão que aplica aquele perfil.
  **Não pode inventar a virada.** Com os pesos equilibrados o mesmo carro ganha em quase toda faixa
  de quilometragem, então se nenhum perfil trocar, o card diz isso, o que é informação e não enfeite.
- **`.placa`**: o campeão dentro do herói, com o motivo em uma frase e os dois números explicados lado a lado.
  A fita acima dele repete as condições respondidas, para que a resposta nunca apareça solta.
- **`.cartao`**: item de resultado. Traz cifra, motivo, selos, ficha e as seis notas por critério.
- **`.crit`**: critério de pontuação com peso em percentual e slider. Uma coluna sempre, porque
  agora mora numa gaveta de 420px.
- **`#grupoCriterios`**: os pesos como primeiro grupo da gaveta, com barra empilhada, legenda e os
  seis sliders. **Filtro e peso fazem coisas diferentes**: filtro tira candidatos, peso reordena.
  Estarem no mesmo painel exige que o texto de abertura diga isso, senão o usuário mexe num peso e
  estranha que a contagem não mudou. É o que o `.pesosNota` faz, e ele não é decoração.
- **`.conta`**: extrato vertical do custo anual, com uma linha por componente, régua e total.
  Cada linha traz o quadradinho da cor que o componente tem no gráfico de composição, então
  extrato e gráfico se leem juntos. A soma sempre bate com o total exibido.
- **`.ajuda` e `#balao`**: ajuda contextual. Um balão único no `body`, posicionado por JS, porque como
  filho de cada número ele seria cortado pela tabela e pela matriz, que têm `overflow` próprio.
- **`.quadro`**: moldura de gráfico. **Todo gráfico é obrigado a ter `.tit` com a conclusão e `.sub` ensinando a ler.** Gráfico sem título que conclui é gráfico incompleto.

## Fundação do documento, regra durável

`build.py` emite `<!doctype html>`, `<html lang="pt-BR">`, `<head>` e `<body>`. Isso não é enfeite:
sem doctype o navegador roda em `BackCompat`, que muda o box model, e sem `lang` o leitor de tela lê
português com voz inglesa e o navegador não oferece tradução. A página passou meses assim porque
`part1.html` começava direto no `<meta charset>` e o navegador se recuperava em silêncio.

O `<head>` carrega `meta description`, Open Graph e Twitter card. O link circula por WhatsApp, e sem
isso ele chegava sem prévia, sem descrição e sem imagem.

## Teclado, regra durável

A gaveta fechada recebe `inert`. Escondê-la só com `transform` deixava **104 controles invisíveis no
caminho do Tab**, antes de qualquer conteúdo da página. Ao abrir, o foco vai para o botão de fechar e
não para o primeiro controle em ordem de DOM, que é o "Limpar" e é a ação mais destrutiva do painel.
Ao fechar, o foco volta para o botão que abriu.

Todo SVG criado por `svgFor` recebe `aria-label` montado a partir do `.tit` e do `.sub` do próprio
quadro. `role="img"` achata o gráfico num nó só, então sem nome eram cinco gráficos mudos.

## Nomes de classe, regra durável

**Classe utilitária nunca pode ter o mesmo nome de um modificador de bloco.** Já quebrou duas vezes aqui:

1. `.conta` era o container da leitura em rolagem (`display:grid`, duas colunas). O extrato de custo
   nasceu com o mesmo nome e herdou o grid: linhas em duas colunas e sobrepostas.
2. `.est` dá sublinhado tracejado e `padding-bottom:1px` a número estimado. O bloco do herói nasceu
   como `<div class="val est">` e recebeu as duas regras: ganhou borda tracejada e teve o padding
   de 12px esmagado para 1px.

3. `.nota` já era um bloco com fundo e 15px. O texto de abertura dos pesos nasceu com esse nome e
   virou uma caixa cinza no meio da gaveta.

Nenhum dos três gerou erro de sintaxe ou aviso de navegador. O layout simplesmente saiu errado.

`scripts/checar-css.py` roda no fim de todo `build.py` e acusa o par de classes no mesmo elemento
quando as duas têm definição global disputando propriedade de caixa. Ele **não** pega o caso de uma
classe só reusando um nome existente, então procurar o nome no CSS antes de criar continua sendo
obrigação de quem escreve.

Convenção adotada: **utilitária global tem nome curto e único** (`est`, `rev`, `vis`, `on`), e
**modificador de bloco usa palavra própria**, nunca uma dessas (`.val.calc`, e não `.val.est`).
Antes de criar uma classe, procure o nome no CSS inteiro.

## Proveniência, regra durável

Número medido na FIPE sai limpo. Número estimado por premissa recebe `.est`, que é sublinhado tracejado mais explicação no `title`. No herói os dois aparecem lado a lado com um parágrafo cada dizendo o que são, porque chave solta com dois números não se explica para quem lê pela primeira vez.

## Responsivo

Mobile-first, só `min-width`. Pontos de quebra: 520, 560, 700, 760, 820, 900, 980, 1000, 1040, 1200.

Verificado por harness de iframe (`mobile.html`), porque o painel de navegador do ambiente reporta viewport zero e não honra redimensionamento:

- **Zero rolagem horizontal de página em 360, 390 e 768.**
- Matriz vira lista por modelo abaixo de 700px, limitada a 10 modelos com botão para ver o resto.
- Tabela cai para 5 colunas e 20 linhas abaixo de 760px, com botão para ver o resto.
- Isso derrubou a altura da página no celular de 31.911px para 18.072px.
- Alvo de toque 44px em `pointer: coarse`.

## Movimento

- Risco sobre "preço da vitrine" traçado uma vez na entrada.
- `.rev` revela blocos na rolagem, com `IntersectionObserver` e `unobserve` depois de revelar.
  **Duas redes de segurança obrigatórias**: o que já está na viewport ao carregar é revelado na hora,
  sem depender do observador, e um `setTimeout` de 1,5 s revela o resto. Sem isso, uma falha do
  observador deixa a página inteira invisível para sempre. Pelo mesmo motivo, **todo o desenho
  dentro de `render()` fica em `try`**: um `id` que sumiu do markup derrubava o `render` antes do
  `revelar()`, e a página inteira ficava com `opacity: 0`. Aconteceu ao remover o megamenu.
- Leitura em rolagem na seção da curva: gráfico fixo, texto avança em três etapas.
- Parallax só nas manchas do herói, e só nos primeiros 140% da viewport.
- Barra de progresso usa `transform: scaleX`, nunca `width`, que causa thrash de layout.
- `prefers-reduced-motion` desliga tudo e entrega o estado final.
