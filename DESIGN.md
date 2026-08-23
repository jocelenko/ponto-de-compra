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

- **`.topo`**: barra fixa de 60px, translúcida com `backdrop-filter`. Contém navegação inline (some abaixo de 1040px), tema, seções e o botão de filtros com contador de filtros ativos.
- **`.drawer`**: gaveta de filtros à direita, recolhível, `transform: translateX(100%)` quando fechada. Largura `min(420px, 100%)`, então ocupa a tela inteira no celular. **Nunca virar coluna permanente.**
- **`.mega`**: megamenu dos critérios, ancorado abaixo da barra. Os critérios saíram do scroll
  porque precisam estar claros desde o início, e não depois de rolar meia página.
- **`.sheet`**: folha de seções que sobe de baixo no celular.
- **`.placa`**: o campeão dentro do herói, com o motivo em uma frase e os dois números explicados lado a lado.
- **`.cartao`**: item de resultado. Traz cifra, motivo, selos, ficha e as seis notas por critério.
- **`.crit`**: critério de pontuação com peso em percentual e slider.
- **`.ponte`**: resumo dos pesos no topo da gaveta de filtros, com barra empilhada e atalho para o
  megamenu. Existe porque **filtro e peso fazem coisas diferentes**: filtro tira candidatos, peso
  reordena. Juntar os dois no mesmo painel faria o usuário mexer num peso e estranhar que a contagem
  não mudou. A ponte resolve a descoberta sem apagar a distinção.
- **`.conta`**: extrato vertical do custo anual, com uma linha por componente, régua e total.
  Cada linha traz o quadradinho da cor que o componente tem no gráfico de composição, então
  extrato e gráfico se leem juntos. A soma sempre bate com o total exibido.
- **`.ajuda` e `#balao`**: ajuda contextual. Um balão único no `body`, posicionado por JS, porque como
  filho de cada número ele seria cortado pela tabela e pela matriz, que têm `overflow` próprio.
- **`.quadro`**: moldura de gráfico. **Todo gráfico é obrigado a ter `.tit` com a conclusão e `.sub` ensinando a ler.** Gráfico sem título que conclui é gráfico incompleto.

## Nomes de classe, regra durável

**Classe utilitária nunca pode ter o mesmo nome de um modificador de bloco.** Já quebrou duas vezes aqui:

1. `.conta` era o container da leitura em rolagem (`display:grid`, duas colunas). O extrato de custo
   nasceu com o mesmo nome e herdou o grid: linhas em duas colunas e sobrepostas.
2. `.est` dá sublinhado tracejado e `padding-bottom:1px` a número estimado. O bloco do herói nasceu
   como `<div class="val est">` e recebeu as duas regras: ganhou borda tracejada e teve o padding
   de 12px esmagado para 1px.

Nenhum dos dois gerou erro de sintaxe ou aviso de detector. O layout simplesmente saiu errado.

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
  observador deixa a página inteira invisível para sempre.
- Leitura em rolagem na seção da curva: gráfico fixo, texto avança em três etapas.
- Parallax só nas manchas do herói, e só nos primeiros 140% da viewport.
- Barra de progresso usa `transform: scaleX`, nunca `width`, que causa thrash de layout.
- `prefers-reduced-motion` desliga tudo e entrega o estado final.
